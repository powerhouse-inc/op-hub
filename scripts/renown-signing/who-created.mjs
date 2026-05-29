/**
 * who-created.mjs — reverse-lookup the creator/signers of a drive (or any doc).
 *
 * Reads the document's operations from switchboard and reports:
 *   - the creator's did:key   (app.key on CREATE_DOCUMENT — from the header sig)
 *   - the signing wallet(s)   (context.signer.user.address on the operations)
 *
 * Usage (from project root):
 *   TOKEN=$(switchboard auth token | tail -1) \
 *   node scripts/renown-signing/who-created.mjs <driveId>
 */
const ENDPOINT = process.env.ENDPOINT || "http://localhost:4001/graphql";
const TOKEN = process.env.TOKEN || "";
const docId = process.argv[2];
if (!docId) {
  console.error("usage: node who-created.mjs <documentId>");
  process.exit(1);
}

async function gql(query, variables) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(TOKEN ? { authorization: `Bearer ${TOKEN}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

const data = await gql(
  `query($filter: OperationsFilterInput!){
     documentOperations(filter:$filter){
       items { index action { type context { signer {
         user { address chainId networkId } app { name key } signatures
       } } } }
     }
   }`,
  { filter: { documentId: docId } },
);

const ops = data.documentOperations.items;
const wallets = new Set();
let creatorKey = null;

for (const op of ops) {
  const s = op.action?.context?.signer;
  if (!s) continue;
  if (op.action.type === "CREATE_DOCUMENT" && s.app?.key) creatorKey = s.app.key;
  if (s.user?.address) {
    wallets.add(
      `did:pkh:${s.user.networkId}:${s.user.chainId}:${s.user.address}`,
    );
  }
}

console.log("Document:", docId);
console.log("Operations:", ops.length);
console.log("Creator app key (CREATE_DOCUMENT):", creatorKey ?? "(unsigned)");
console.log(
  "Signing wallet identities:",
  wallets.size ? [...wallets].join(", ") : "(none)",
);
