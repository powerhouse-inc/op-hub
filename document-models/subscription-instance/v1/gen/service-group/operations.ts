import { type SignalDispatch } from "document-model";
import type {
  AddServiceGroupAction,
  RemoveServiceGroupAction,
  AddServiceToGroupAction,
  RemoveServiceFromGroupAction,
  UpdateServiceGroupCostAction,
} from "./actions.js";
import type { SubscriptionInstanceState } from "../types.js";

export interface SubscriptionInstanceServiceGroupOperations {
  addServiceGroupOperation: (
    state: SubscriptionInstanceState,
    action: AddServiceGroupAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeServiceGroupOperation: (
    state: SubscriptionInstanceState,
    action: RemoveServiceGroupAction,
    dispatch?: SignalDispatch,
  ) => void;
  addServiceToGroupOperation: (
    state: SubscriptionInstanceState,
    action: AddServiceToGroupAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeServiceFromGroupOperation: (
    state: SubscriptionInstanceState,
    action: RemoveServiceFromGroupAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateServiceGroupCostOperation: (
    state: SubscriptionInstanceState,
    action: UpdateServiceGroupCostAction,
    dispatch?: SignalDispatch,
  ) => void;
}
