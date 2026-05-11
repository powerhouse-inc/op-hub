import { createAction } from "document-model";
import {
  MarkLineItemInvoicedInputSchema,
  ConfirmLineItemPaymentInputSchema,
  ReportPaymentInputSchema,
  ApplyCreditInputSchema,
} from "../schema/zod.js";
import type {
  MarkLineItemInvoicedInput,
  ConfirmLineItemPaymentInput,
  ReportPaymentInput,
  ApplyCreditInput,
} from "../types.js";
import type {
  MarkLineItemInvoicedAction,
  ConfirmLineItemPaymentAction,
  ReportPaymentAction,
  ApplyCreditAction,
} from "./actions.js";

export const markLineItemInvoiced = (input: MarkLineItemInvoicedInput) =>
  createAction<MarkLineItemInvoicedAction>(
    "MARK_LINE_ITEM_INVOICED",
    { ...input },
    undefined,
    MarkLineItemInvoicedInputSchema,
    "global",
  );

export const confirmLineItemPayment = (input: ConfirmLineItemPaymentInput) =>
  createAction<ConfirmLineItemPaymentAction>(
    "CONFIRM_LINE_ITEM_PAYMENT",
    { ...input },
    undefined,
    ConfirmLineItemPaymentInputSchema,
    "global",
  );

export const reportPayment = (input: ReportPaymentInput) =>
  createAction<ReportPaymentAction>(
    "REPORT_PAYMENT",
    { ...input },
    undefined,
    ReportPaymentInputSchema,
    "global",
  );

export const applyCredit = (input: ApplyCreditInput) =>
  createAction<ApplyCreditAction>(
    "APPLY_CREDIT",
    { ...input },
    undefined,
    ApplyCreditInputSchema,
    "global",
  );
