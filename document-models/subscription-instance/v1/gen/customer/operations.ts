import { type SignalDispatch } from "document-model";
import type {
  SetCustomerTypeAction,
  UpdateTeamMemberCountAction,
} from "./actions.js";
import type { SubscriptionInstanceState } from "../types.js";

export interface SubscriptionInstanceCustomerOperations {
  setCustomerTypeOperation: (
    state: SubscriptionInstanceState,
    action: SetCustomerTypeAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateTeamMemberCountOperation: (
    state: SubscriptionInstanceState,
    action: UpdateTeamMemberCountAction,
    dispatch?: SignalDispatch,
  ) => void;
}
