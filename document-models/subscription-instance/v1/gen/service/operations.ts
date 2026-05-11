import { type SignalDispatch } from "document-model";
import type {
  AddServiceAction,
  RemoveServiceAction,
  UpdateServiceSetupCostAction,
  UpdateServiceRecurringCostAction,
  UpdateServiceInfoAction,
  AddServiceFacetSelectionAction,
  RemoveServiceFacetSelectionAction,
} from "./actions.js";
import type { SubscriptionInstanceState } from "../types.js";

export interface SubscriptionInstanceServiceOperations {
  addServiceOperation: (
    state: SubscriptionInstanceState,
    action: AddServiceAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeServiceOperation: (
    state: SubscriptionInstanceState,
    action: RemoveServiceAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateServiceSetupCostOperation: (
    state: SubscriptionInstanceState,
    action: UpdateServiceSetupCostAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateServiceRecurringCostOperation: (
    state: SubscriptionInstanceState,
    action: UpdateServiceRecurringCostAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateServiceInfoOperation: (
    state: SubscriptionInstanceState,
    action: UpdateServiceInfoAction,
    dispatch?: SignalDispatch,
  ) => void;
  addServiceFacetSelectionOperation: (
    state: SubscriptionInstanceState,
    action: AddServiceFacetSelectionAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeServiceFacetSelectionOperation: (
    state: SubscriptionInstanceState,
    action: RemoveServiceFacetSelectionAction,
    dispatch?: SignalDispatch,
  ) => void;
}
