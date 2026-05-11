import { createAction } from "document-model";
import {
  InitializeSubscriptionInputSchema,
  SetResourceDocumentInputSchema,
  ActivateSubscriptionInputSchema,
  PauseSubscriptionInputSchema,
  SetExpiringInputSchema,
  CancelSubscriptionInputSchema,
  ResumeSubscriptionInputSchema,
  RenewExpiringSubscriptionInputSchema,
  UpdateCustomerInfoInputSchema,
  UpdateTierInfoInputSchema,
  SetOperatorNotesInputSchema,
  SetAutoRenewInputSchema,
  GenerateInvoiceInputSchema,
  ChangePlanInputSchema,
} from "../schema/zod.js";
import type {
  InitializeSubscriptionInput,
  SetResourceDocumentInput,
  ActivateSubscriptionInput,
  PauseSubscriptionInput,
  SetExpiringInput,
  CancelSubscriptionInput,
  ResumeSubscriptionInput,
  RenewExpiringSubscriptionInput,
  UpdateCustomerInfoInput,
  UpdateTierInfoInput,
  SetOperatorNotesInput,
  SetAutoRenewInput,
  GenerateInvoiceInput,
  ChangePlanInput,
} from "../types.js";
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

export const initializeSubscription = (input: InitializeSubscriptionInput) =>
  createAction<InitializeSubscriptionAction>(
    "INITIALIZE_SUBSCRIPTION",
    { ...input },
    undefined,
    InitializeSubscriptionInputSchema,
    "global",
  );

export const setResourceDocument = (input: SetResourceDocumentInput) =>
  createAction<SetResourceDocumentAction>(
    "SET_RESOURCE_DOCUMENT",
    { ...input },
    undefined,
    SetResourceDocumentInputSchema,
    "global",
  );

export const activateSubscription = (input: ActivateSubscriptionInput) =>
  createAction<ActivateSubscriptionAction>(
    "ACTIVATE_SUBSCRIPTION",
    { ...input },
    undefined,
    ActivateSubscriptionInputSchema,
    "global",
  );

export const pauseSubscription = (input: PauseSubscriptionInput) =>
  createAction<PauseSubscriptionAction>(
    "PAUSE_SUBSCRIPTION",
    { ...input },
    undefined,
    PauseSubscriptionInputSchema,
    "global",
  );

export const setExpiring = (input: SetExpiringInput) =>
  createAction<SetExpiringAction>(
    "SET_EXPIRING",
    { ...input },
    undefined,
    SetExpiringInputSchema,
    "global",
  );

export const cancelSubscription = (input: CancelSubscriptionInput) =>
  createAction<CancelSubscriptionAction>(
    "CANCEL_SUBSCRIPTION",
    { ...input },
    undefined,
    CancelSubscriptionInputSchema,
    "global",
  );

export const resumeSubscription = (input: ResumeSubscriptionInput) =>
  createAction<ResumeSubscriptionAction>(
    "RESUME_SUBSCRIPTION",
    { ...input },
    undefined,
    ResumeSubscriptionInputSchema,
    "global",
  );

export const renewExpiringSubscription = (
  input: RenewExpiringSubscriptionInput,
) =>
  createAction<RenewExpiringSubscriptionAction>(
    "RENEW_EXPIRING_SUBSCRIPTION",
    { ...input },
    undefined,
    RenewExpiringSubscriptionInputSchema,
    "global",
  );

export const updateCustomerInfo = (input: UpdateCustomerInfoInput) =>
  createAction<UpdateCustomerInfoAction>(
    "UPDATE_CUSTOMER_INFO",
    { ...input },
    undefined,
    UpdateCustomerInfoInputSchema,
    "global",
  );

export const updateTierInfo = (input: UpdateTierInfoInput) =>
  createAction<UpdateTierInfoAction>(
    "UPDATE_TIER_INFO",
    { ...input },
    undefined,
    UpdateTierInfoInputSchema,
    "global",
  );

export const setOperatorNotes = (input: SetOperatorNotesInput) =>
  createAction<SetOperatorNotesAction>(
    "SET_OPERATOR_NOTES",
    { ...input },
    undefined,
    SetOperatorNotesInputSchema,
    "global",
  );

export const setAutoRenew = (input: SetAutoRenewInput) =>
  createAction<SetAutoRenewAction>(
    "SET_AUTO_RENEW",
    { ...input },
    undefined,
    SetAutoRenewInputSchema,
    "global",
  );

export const generateInvoice = (input: GenerateInvoiceInput) =>
  createAction<GenerateInvoiceAction>(
    "GENERATE_INVOICE",
    { ...input },
    undefined,
    GenerateInvoiceInputSchema,
    "global",
  );

export const changePlan = (input: ChangePlanInput) =>
  createAction<ChangePlanAction>(
    "CHANGE_PLAN",
    { ...input },
    undefined,
    ChangePlanInputSchema,
    "global",
  );
