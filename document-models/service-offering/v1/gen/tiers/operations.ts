import { type SignalDispatch } from "document-model";
import type {
  AddTierAction,
  UpdateTierAction,
  UpdateTierPricingAction,
  DeleteTierAction,
  AddServiceLevelAction,
  UpdateServiceLevelAction,
  RemoveServiceLevelAction,
  AddUsageLimitAction,
  UpdateUsageLimitAction,
  RemoveUsageLimitAction,
  SetTierDefaultBillingCycleAction,
  SetTierBillingCycleDiscountsAction,
  SetTierPricingModeAction,
  ReorderTiersAction,
} from "./actions.js";
import type { ServiceOfferingState } from "../types.js";

export interface ServiceOfferingTiersOperations {
  addTierOperation: (
    state: ServiceOfferingState,
    action: AddTierAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateTierOperation: (
    state: ServiceOfferingState,
    action: UpdateTierAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateTierPricingOperation: (
    state: ServiceOfferingState,
    action: UpdateTierPricingAction,
    dispatch?: SignalDispatch,
  ) => void;
  deleteTierOperation: (
    state: ServiceOfferingState,
    action: DeleteTierAction,
    dispatch?: SignalDispatch,
  ) => void;
  addServiceLevelOperation: (
    state: ServiceOfferingState,
    action: AddServiceLevelAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateServiceLevelOperation: (
    state: ServiceOfferingState,
    action: UpdateServiceLevelAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeServiceLevelOperation: (
    state: ServiceOfferingState,
    action: RemoveServiceLevelAction,
    dispatch?: SignalDispatch,
  ) => void;
  addUsageLimitOperation: (
    state: ServiceOfferingState,
    action: AddUsageLimitAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateUsageLimitOperation: (
    state: ServiceOfferingState,
    action: UpdateUsageLimitAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeUsageLimitOperation: (
    state: ServiceOfferingState,
    action: RemoveUsageLimitAction,
    dispatch?: SignalDispatch,
  ) => void;
  setTierDefaultBillingCycleOperation: (
    state: ServiceOfferingState,
    action: SetTierDefaultBillingCycleAction,
    dispatch?: SignalDispatch,
  ) => void;
  setTierBillingCycleDiscountsOperation: (
    state: ServiceOfferingState,
    action: SetTierBillingCycleDiscountsAction,
    dispatch?: SignalDispatch,
  ) => void;
  setTierPricingModeOperation: (
    state: ServiceOfferingState,
    action: SetTierPricingModeAction,
    dispatch?: SignalDispatch,
  ) => void;
  reorderTiersOperation: (
    state: ServiceOfferingState,
    action: ReorderTiersAction,
    dispatch?: SignalDispatch,
  ) => void;
}
