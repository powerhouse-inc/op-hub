import { type SignalDispatch } from "document-model";
import type {
  InitializeSubscriptionAction,
  SetResourceDocumentAction,
  ActivateSubscriptionAction,
  PauseSubscriptionAction,
  SetExpiringAction,
  CancelSubscriptionAction,
  ResumeSubscriptionAction,
  RenewExpiringSubscriptionAction,
  UpdateCustomerInfoAction,
  UpdateTierInfoAction,
  SetOperatorNotesAction,
  SetAutoRenewAction,
  GenerateInvoiceAction,
  ChangePlanAction,
} from "./actions.js";
import type { SubscriptionInstanceState } from "../types.js";

export interface SubscriptionInstanceSubscriptionOperations {
  initializeSubscriptionOperation: (
    state: SubscriptionInstanceState,
    action: InitializeSubscriptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  setResourceDocumentOperation: (
    state: SubscriptionInstanceState,
    action: SetResourceDocumentAction,
    dispatch?: SignalDispatch,
  ) => void;
  activateSubscriptionOperation: (
    state: SubscriptionInstanceState,
    action: ActivateSubscriptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  pauseSubscriptionOperation: (
    state: SubscriptionInstanceState,
    action: PauseSubscriptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  setExpiringOperation: (
    state: SubscriptionInstanceState,
    action: SetExpiringAction,
    dispatch?: SignalDispatch,
  ) => void;
  cancelSubscriptionOperation: (
    state: SubscriptionInstanceState,
    action: CancelSubscriptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  resumeSubscriptionOperation: (
    state: SubscriptionInstanceState,
    action: ResumeSubscriptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  renewExpiringSubscriptionOperation: (
    state: SubscriptionInstanceState,
    action: RenewExpiringSubscriptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateCustomerInfoOperation: (
    state: SubscriptionInstanceState,
    action: UpdateCustomerInfoAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateTierInfoOperation: (
    state: SubscriptionInstanceState,
    action: UpdateTierInfoAction,
    dispatch?: SignalDispatch,
  ) => void;
  setOperatorNotesOperation: (
    state: SubscriptionInstanceState,
    action: SetOperatorNotesAction,
    dispatch?: SignalDispatch,
  ) => void;
  setAutoRenewOperation: (
    state: SubscriptionInstanceState,
    action: SetAutoRenewAction,
    dispatch?: SignalDispatch,
  ) => void;
  generateInvoiceOperation: (
    state: SubscriptionInstanceState,
    action: GenerateInvoiceAction,
    dispatch?: SignalDispatch,
  ) => void;
  changePlanOperation: (
    state: SubscriptionInstanceState,
    action: ChangePlanAction,
    dispatch?: SignalDispatch,
  ) => void;
}
