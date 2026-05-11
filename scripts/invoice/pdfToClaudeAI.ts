import { generateId } from "document-model";
import { autoTagLineItems } from "./autoTagging.js";

/**
 * Attempts to repair truncated JSON by closing unclosed brackets and braces.
 * This handles cases where Claude's response gets cut off due to max_tokens.
 */
function repairTruncatedJson(jsonString: string): string {
  let repaired = jsonString.trim();

  // Find the last complete JSON element (object or value in array)
  // We need to truncate at the last complete element before adding closing brackets
  repaired = truncateToLastCompleteElement(repaired);

  // Count unclosed brackets and braces
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < repaired.length; i++) {
    const char = repaired[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === "\\") {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === "{") openBraces++;
      else if (char === "}") openBraces--;
      else if (char === "[") openBrackets++;
      else if (char === "]") openBrackets--;
    }
  }

  // Close any unclosed arrays and objects
  // Close arrays first (they're usually inside objects)
  while (openBrackets > 0) {
    repaired += "]";
    openBrackets--;
  }

  // Then close objects
  while (openBraces > 0) {
    repaired += "}";
    openBraces--;
  }

  return repaired;
}

/**
 * Truncates JSON string to the last complete element.
 * Handles cases where truncation occurs mid-string, mid-object, or mid-array.
 */
function truncateToLastCompleteElement(json: string): string {
  // Find the last closing brace or bracket that represents a complete element
  // We scan backwards to find the last complete object "}" or complete array element

  let depth = 0;
  let inString = false;
  let lastCompleteObjectEnd = -1;

  for (let i = 0; i < json.length; i++) {
    const char = json[i];
    const prevChar = i > 0 ? json[i - 1] : "";

    // Handle escape sequences
    if (char === '"' && prevChar !== "\\") {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === "{" || char === "[") {
      depth++;
    } else if (char === "}" || char === "]") {
      depth--;
      // Track the position after closing braces at depth 1 (inside the lineItems array)
      // or after any closing brace that's followed by a comma or end
      if (char === "}") {
        lastCompleteObjectEnd = i + 1;
      }
    }
  }

  // If we found a complete object, check if there's incomplete content after it
  if (lastCompleteObjectEnd > 0 && lastCompleteObjectEnd < json.length) {
    const remainder = json.substring(lastCompleteObjectEnd).trim();

    // If what's left starts with a comma and then has incomplete content,
    // we should truncate there
    if (remainder.startsWith(",")) {
      const afterComma = remainder.substring(1).trim();
      // Check if the content after the comma is incomplete (starts with { but doesn't close)
      if (afterComma.startsWith("{") || afterComma.startsWith('"')) {
        // Check if this new element is complete
        let testDepth = 0;
        let testInString = false;
        let isComplete = false;

        for (let i = 0; i < afterComma.length; i++) {
          const char = afterComma[i];
          const prevChar = i > 0 ? afterComma[i - 1] : "";

          if (char === '"' && prevChar !== "\\") {
            testInString = !testInString;
            continue;
          }

          if (testInString) continue;

          if (char === "{" || char === "[") testDepth++;
          else if (char === "}" || char === "]") {
            testDepth--;
            if (testDepth === 0 && char === "}") {
              isComplete = true;
              break;
            }
          }
        }

        // If the element after the comma is incomplete, truncate before the comma
        if (!isComplete) {
          return json.substring(0, lastCompleteObjectEnd);
        }
      }
    }
  }

  // Alternative approach: find the last complete line item by looking for the pattern
  // "},\n    {" and ensure the last one is complete
  const lineItemPattern = /\},\s*\{[^}]*$/;
  const match = json.match(lineItemPattern);

  if (match && match.index !== undefined) {
    // There's an incomplete line item at the end
    // Truncate just before the comma that starts the incomplete item
    const truncateAt = match.index + 1; // Keep the closing }
    return json.substring(0, truncateAt);
  }

  // Check if we're in the middle of a string value
  // Count quotes to see if we're inside a string
  let quoteCount = 0;
  for (let i = 0; i < json.length; i++) {
    if (json[i] === '"' && (i === 0 || json[i - 1] !== "\\")) {
      quoteCount++;
    }
  }

  // If odd number of quotes, we're inside a string - find and remove the incomplete part
  if (quoteCount % 2 === 1) {
    // Find the last property that started (look for last '": ' or '":')
    const lastPropStart = Math.max(
      json.lastIndexOf('": "'),
      json.lastIndexOf('":"'),
    );

    if (lastPropStart > 0) {
      // Find the comma or opening brace before this property
      let searchFrom = lastPropStart;

      while (
        searchFrom > 0 &&
        json[searchFrom] !== "," &&
        json[searchFrom] !== "{"
      ) {
        searchFrom--;
      }

      if (json[searchFrom] === ",") {
        // Remove the incomplete property by truncating at the comma
        return json.substring(0, searchFrom);
      }
    }
  }

  return json;
}

export async function uploadPdfAndGetJsonClaude(inputDoc: string) {
  try {
    console.log("Starting PDF upload and processing with Claude AI");

    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error("CLAUDE_API_KEY environment variable is not set");
    }

    console.log("Preparing Claude API request with PDF...");

    // Create the prompt for Claude to extract invoice data from PDF
    const prompt = `
Please analyze this PDF invoice document and extract the following information in JSON format:

{
  "status": "status of invoice (DRAFT, ISSUED, CANCELLED, ACCEPTED, REJECTED, PAYMENTSCHEDULED, PAYMENTSENT, PAYMENTISSUE, PAYMENTRECEIVED, PAYMENTCLOSED)",
  "invoiceNo": "invoice number",
  "dateIssued": "invoice date in YYYY-MM-DDTHH:mm:ss.sssZ format",
  "dateDue": "due date in YYYY-MM-DDTHH:mm:ss.sssZ format",
  "dateDelivered": "delivery date in YYYY-MM-DDTHH:mm:ss.sssZ format (if specified)",
  "currency": "currency code crypto or fiat (USD, EUR, DAI, USDC, USDT, etc.)",
  "notes": "any notes or additional information on the invoice",
  "payAfter": "earliest payment date in ISO format (if specified)",
  "invoiceTags": [
    {
      "dimension": "tag category (e.g. xero-expense-account, accounting-period)",
      "value": "tag value (e.g. 627, 2025/05)",
      "label": "human readable label (e.g. Marketing, May 2025)"
    }
  ],
  "issuer": {
    "name": "supplier/issuer company name",
    "address": {
      "streetAddress": "street address",
      "extendedAddress": "apartment/suite (if any)",
      "city": "city",
      "postalCode": "postal/zip code",
      "stateProvince": "state/province",
      "country": "country"
    },
    "contactInfo": {
      "email": "email address",
      "tel": "phone number"
    },
    "country": "issuer country",
    "id": {
      "taxId": "tax ID number"
    },
    "paymentRouting": {
      "bank": {
        "name": "bank name",
        "accountNum": "account number or IBAN",
        "ABA": "ABA routing number",
        "BIC": "BIC/SWIFT code",
        "SWIFT": "SWIFT code",
        "accountType": "CHECKING or SAVINGS",
        "beneficiary": "beneficiary name",
        "memo": "payment memo",
        "address": {
          "streetAddress": "bank street address",
          "city": "bank city",
          "stateProvince": "bank state/province",
          "postalCode": "bank postal code",
          "country": "bank country",
          "extendedAddress": "bank extended address"
        },
        "intermediaryBank": {
          "name": "intermediary bank name (if any)",
          "address": "intermediary bank address",
          "ABA": "intermediary ABA",
          "BIC": "intermediary BIC",
          "SWIFT": "intermediary SWIFT",
          "accountNum": "intermediary account",
          "accountType": "intermediary account type",
          "beneficiary": "intermediary beneficiary",
          "memo": "intermediary memo"
        }
      },
      "wallet": {
        "address": "crypto wallet address",
        "chainId": "blockchain chain ID",
        "chainName": "blockchain name (e.g., Base, Ethereum)",
        "rpc": "RPC endpoint"
      }
    }
  },
  "payer": {
    "name": "payer/receiver company name",
    "address": {
      "streetAddress": "payer street address",
      "extendedAddress": "payer apartment/suite",
      "city": "payer city",
      "postalCode": "payer postal code",
      "stateProvince": "payer state/province",
      "country": "payer country"
    },
    "contactInfo": {
      "email": "payer email",
      "tel": "payer phone"
    },
    "country": "payer country",
    "id": {
      "taxId": "payer tax ID"
    },
    "paymentRouting": {
      "bank": {
        "name": "payer bank name (if specified)",
        "accountNum": "payer account number",
        "ABA": "payer ABA",
        "BIC": "payer BIC",
        "SWIFT": "payer SWIFT",
        "accountType": "payer account type",
        "beneficiary": "payer beneficiary",
        "memo": "payer memo"
      },
      "wallet": {
        "address": "payer wallet address (if specified)",
        "chainId": "payer chain ID",
        "chainName": "payer chain name",
        "rpc": "payer RPC"
      }
    }
  },
  "lineItems": [
    {
      "description": "item description",
      "quantity": numeric_quantity,
      "unitPriceTaxExcl": numeric_unit_price,
      "unitPriceTaxIncl": numeric_unit_price_with_tax,
      "totalPriceTaxExcl": numeric_total_price,
      "totalPriceTaxIncl": numeric_total_price_with_tax,
      "taxPercent": numeric_tax_percentage,
      "currency": "currency_code",
      "lineItemTag": [
        {
          "dimension": "tag category (e.g. xero-expense-account)",
          "value": "tag value (e.g. 627)",
          "label": "human readable label (e.g. Marketing)"
        }
      ]
    }
  ],
  "totalPriceTaxExcl": numeric_total_amount,
  "totalPriceTaxIncl": numeric_total_amount_with_tax,
  "rejections": [
    {
      "reason": "rejection reason (if any)",
      "final": boolean_if_final_rejection
    }
  ],
  "payments": [
    {
      "processorRef": "payment processor reference",
      "paymentDate": "payment date in ISO format",
      "txnRef": "transaction reference",
      "confirmed": boolean_if_confirmed,
      "issue": "payment issue description",
      "amount": numeric_payment_amount
    }
  ],
  "exported": {
    "timestamp": "export timestamp in ISO format",
    "exportedLineItems": [["CSV formatted line items"]]
  },
  "closureReason": "UNDERPAID, OVERPAID, or CANCELLED (if applicable)"
}

Extract only the data that is clearly visible in the PDF. If a field is not present, use null. Be very careful with numbers - preserve the exact values without modification. For dates, convert to YYYY-MM-DD format. For currencies, use standard 3-letter codes (USD, EUR, GBP, etc.).

IMPORTANT: You MUST output valid, complete JSON. Do not truncate or abbreviate the output. Include all line items.
`;

    // Use Haiku for faster processing to avoid gateway timeouts
    // Haiku is significantly faster than Sonnet while still being capable for invoice extraction
    const requestBody = {
      model: "claude-haiku-4-5-20251001",
      max_tokens: 32000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: inputDoc,
              },
            },
          ],
        },
      ],
    };

    console.log("Sending request to Claude API...");
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("PDF processed successfully with Claude AI");

    // Check if the response was truncated due to max_tokens
    const stopReason = result.stop_reason;
    if (stopReason === "max_tokens") {
      console.warn(
        "Warning: Claude response was truncated due to max_tokens limit",
      );
    }

    // Extract JSON from Claude's response
    const responseText = result.content[0]?.text;
    if (!responseText) {
      throw new Error("No response text from Claude API");
    }

    // Try to extract JSON from the response
    let invoiceData;
    try {
      // Look for JSON block in the response
      const jsonMatch =
        responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
        responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        let jsonString = jsonMatch[1] || jsonMatch[0];

        // Attempt to repair truncated JSON if needed
        jsonString = repairTruncatedJson(jsonString);

        invoiceData = JSON.parse(jsonString);
      } else {
        // Fallback: try to parse the entire response as JSON
        invoiceData = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error("Failed to parse Claude response as JSON:", parseError);
      console.error("Response text:", responseText);

      // Try one more time with aggressive repair
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*/);
        if (jsonMatch) {
          const repairedJson = repairTruncatedJson(jsonMatch[0]);
          invoiceData = JSON.parse(repairedJson);
          console.log("Successfully repaired truncated JSON");
        } else {
          throw new Error("Failed to parse Claude response as valid JSON");
        }
      } catch {
        throw new Error("Failed to parse Claude response as valid JSON");
      }
    }

    // Process the invoice data to ensure it matches our expected format
    const processedInvoiceData = await processClaudeInvoiceData(invoiceData);

    return { invoiceData: processedInvoiceData };
  } catch (error) {
    console.error("Error in uploadPdfAndGetJsonClaude:", error);
    throw error;
  }
}

async function processClaudeInvoiceData(rawData: any) {
  const invoiceData: any = {
    lineItems: [],
    rejections: [],
    payments: [],
    invoiceTags: [],
  };

  // Basic invoice fields
  if (rawData.status) invoiceData.status = rawData.status;
  if (rawData.invoiceNo) invoiceData.invoiceNo = rawData.invoiceNo;
  if (rawData.dateIssued) invoiceData.dateIssued = rawData.dateIssued;
  if (rawData.dateDue) invoiceData.dateDue = rawData.dateDue;
  if (rawData.dateDelivered) invoiceData.dateDelivered = rawData.dateDelivered;
  if (rawData.currency) invoiceData.currency = rawData.currency;
  if (rawData.notes) invoiceData.notes = rawData.notes;
  if (rawData.payAfter) invoiceData.payAfter = rawData.payAfter;
  if (rawData.closureReason) invoiceData.closureReason = rawData.closureReason;
  if (rawData.totalPriceTaxExcl)
    invoiceData.totalPriceTaxExcl = parseFloat(rawData.totalPriceTaxExcl);
  if (rawData.totalPriceTaxIncl)
    invoiceData.totalPriceTaxIncl = parseFloat(rawData.totalPriceTaxIncl);

  // Tags
  if (rawData.invoiceTags && Array.isArray(rawData.invoiceTags)) {
    invoiceData.invoiceTags = rawData.invoiceTags;
  }

  // Exported data
  if (rawData.exported) {
    invoiceData.exported = rawData.exported;
  }

  // Process issuer data
  if (rawData.issuer) {
    invoiceData.issuer = {
      name: rawData.issuer.name || null,
      address: rawData.issuer.address || null,
      contactInfo: rawData.issuer.contactInfo || { email: null, tel: null },
      country: rawData.issuer.address?.country || null,
      id: rawData.issuer.id || null,
      paymentRouting: rawData.issuer.paymentRouting || null,
    };
  }

  // Process payer data
  if (rawData.payer) {
    invoiceData.payer = {
      name: rawData.payer.name || null,
      address: rawData.payer.address || null,
      contactInfo: rawData.payer.contactInfo || { email: null, tel: null },
      country: rawData.payer.address?.country || null,
      id: rawData.payer.id || null,
      paymentRouting: rawData.payer.paymentRouting || null,
    };
  }

  // Process rejections
  if (rawData.rejections && Array.isArray(rawData.rejections)) {
    invoiceData.rejections = rawData.rejections.map((rejection: any) => ({
      id: generateId(),
      reason: rejection.reason || "",
      final: Boolean(rejection.final),
    }));
  }

  // Process payments
  if (rawData.payments && Array.isArray(rawData.payments)) {
    invoiceData.payments = rawData.payments.map((payment: any) => ({
      id: generateId(),
      processorRef: payment.processorRef || null,
      paymentDate: payment.paymentDate || null,
      txnRef: payment.txnRef || null,
      confirmed: Boolean(payment.confirmed),
      issue: payment.issue || null,
      amount: payment.amount ? parseFloat(payment.amount) : null,
    }));
  }

  // Process line items with auto-tagging
  if (rawData.lineItems && Array.isArray(rawData.lineItems)) {
    const processedItems = rawData.lineItems.map((item: any) => ({
      lineItemTag:
        item.lineItemTag && Array.isArray(item.lineItemTag)
          ? item.lineItemTag
          : [],
      description: item.description || "",
      quantity: parseFloat(item.quantity) || 0,
      unitPriceTaxExcl: parseFloat(item.unitPriceTaxExcl) || 0,
      unitPriceTaxIncl:
        parseFloat(item.unitPriceTaxIncl) ||
        parseFloat(item.unitPriceTaxExcl) ||
        0,
      totalPriceTaxExcl: parseFloat(item.totalPriceTaxExcl) || 0,
      totalPriceTaxIncl:
        parseFloat(item.totalPriceTaxIncl) ||
        parseFloat(item.totalPriceTaxExcl) ||
        0,
      currency: item.currency || rawData.currency || "USD",
      id: generateId(),
      taxPercent: parseFloat(item.taxPercent) || 0,
    }));

    // Apply auto-tagging to processed items
    const taggedItems = await autoTagLineItems(processedItems);
    invoiceData.lineItems = taggedItems;
  }

  console.log(
    "Processed Claude invoice data:",
    JSON.stringify(invoiceData, null, 2),
  );
  return invoiceData;
}
