import { type SignalDispatch } from "document-model";
import type {
  AddOptionGroupAction,
  UpdateOptionGroupAction,
  DeleteOptionGroupAction,
  SetOptionGroupStandalonePricingAction,
  AddOptionGroupTierPricingAction,
  UpdateOptionGroupTierPricingAction,
  RemoveOptionGroupTierPricingAction,
  SetOptionGroupDiscountModeAction,
} from "./actions.js";
import type { ServiceOfferingState } from "../types.js";

export interface ServiceOfferingOptionGroupsOperations {
  addOptionGroupOperation: (
    state: ServiceOfferingState,
    action: AddOptionGroupAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateOptionGroupOperation: (
    state: ServiceOfferingState,
    action: UpdateOptionGroupAction,
    dispatch?: SignalDispatch,
  ) => void;
  deleteOptionGroupOperation: (
    state: ServiceOfferingState,
    action: DeleteOptionGroupAction,
    dispatch?: SignalDispatch,
  ) => void;
  setOptionGroupStandalonePricingOperation: (
    state: ServiceOfferingState,
    action: SetOptionGroupStandalonePricingAction,
    dispatch?: SignalDispatch,
  ) => void;
  addOptionGroupTierPricingOperation: (
    state: ServiceOfferingState,
    action: AddOptionGroupTierPricingAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateOptionGroupTierPricingOperation: (
    state: ServiceOfferingState,
    action: UpdateOptionGroupTierPricingAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeOptionGroupTierPricingOperation: (
    state: ServiceOfferingState,
    action: RemoveOptionGroupTierPricingAction,
    dispatch?: SignalDispatch,
  ) => void;
  setOptionGroupDiscountModeOperation: (
    state: ServiceOfferingState,
    action: SetOptionGroupDiscountModeAction,
    dispatch?: SignalDispatch,
  ) => void;
}
