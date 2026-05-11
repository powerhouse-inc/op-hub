import { type SignalDispatch } from "document-model";
import type {
  MarkLineItemInvoicedAction,
  ConfirmLineItemPaymentAction,
  ReportPaymentAction,
  ApplyCreditAction,
} from "./actions.js";
import type { SubscriptionInstanceState } from "../types.js";

export interface SubscriptionInstanceDebtLineItemsOperations {
  markLineItemInvoicedOperation: (
    state: SubscriptionInstanceState,
    action: MarkLineItemInvoicedAction,
    dispatch?: SignalDispatch,
  ) => void;
  confirmLineItemPaymentOperation: (
    state: SubscriptionInstanceState,
    action: ConfirmLineItemPaymentAction,
    dispatch?: SignalDispatch,
  ) => void;
  reportPaymentOperation: (
    state: SubscriptionInstanceState,
    action: ReportPaymentAction,
    dispatch?: SignalDispatch,
  ) => void;
  applyCreditOperation: (
    state: SubscriptionInstanceState,
    action: ApplyCreditAction,
    dispatch?: SignalDispatch,
  ) => void;
}
