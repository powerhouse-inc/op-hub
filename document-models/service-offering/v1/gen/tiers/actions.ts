import type { Action } from "document-model";
import type {
  AddTierInput,
  UpdateTierInput,
  UpdateTierPricingInput,
  DeleteTierInput,
  AddServiceLevelInput,
  UpdateServiceLevelInput,
  RemoveServiceLevelInput,
  AddUsageLimitInput,
  UpdateUsageLimitInput,
  RemoveUsageLimitInput,
  SetTierDefaultBillingCycleInput,
  SetTierBillingCycleDiscountsInput,
  SetTierPricingModeInput,
  ReorderTiersInput,
} from "../types.js";

export type AddTierAction = Action & { type: "ADD_TIER"; input: AddTierInput };
export type UpdateTierAction = Action & {
  type: "UPDATE_TIER";
  input: UpdateTierInput;
};
export type UpdateTierPricingAction = Action & {
  type: "UPDATE_TIER_PRICING";
  input: UpdateTierPricingInput;
};
export type DeleteTierAction = Action & {
  type: "DELETE_TIER";
  input: DeleteTierInput;
};
export type AddServiceLevelAction = Action & {
  type: "ADD_SERVICE_LEVEL";
  input: AddServiceLevelInput;
};
export type UpdateServiceLevelAction = Action & {
  type: "UPDATE_SERVICE_LEVEL";
  input: UpdateServiceLevelInput;
};
export type RemoveServiceLevelAction = Action & {
  type: "REMOVE_SERVICE_LEVEL";
  input: RemoveServiceLevelInput;
};
export type AddUsageLimitAction = Action & {
  type: "ADD_USAGE_LIMIT";
  input: AddUsageLimitInput;
};
export type UpdateUsageLimitAction = Action & {
  type: "UPDATE_USAGE_LIMIT";
  input: UpdateUsageLimitInput;
};
export type RemoveUsageLimitAction = Action & {
  type: "REMOVE_USAGE_LIMIT";
  input: RemoveUsageLimitInput;
};
export type SetTierDefaultBillingCycleAction = Action & {
  type: "SET_TIER_DEFAULT_BILLING_CYCLE";
  input: SetTierDefaultBillingCycleInput;
};
export type SetTierBillingCycleDiscountsAction = Action & {
  type: "SET_TIER_BILLING_CYCLE_DISCOUNTS";
  input: SetTierBillingCycleDiscountsInput;
};
export type SetTierPricingModeAction = Action & {
  type: "SET_TIER_PRICING_MODE";
  input: SetTierPricingModeInput;
};
export type ReorderTiersAction = Action & {
  type: "REORDER_TIERS";
  input: ReorderTiersInput;
};

export type ServiceOfferingTiersAction =
  | AddTierAction
  | UpdateTierAction
  | UpdateTierPricingAction
  | DeleteTierAction
  | AddServiceLevelAction
  | UpdateServiceLevelAction
  | RemoveServiceLevelAction
  | AddUsageLimitAction
  | UpdateUsageLimitAction
  | RemoveUsageLimitAction
  | SetTierDefaultBillingCycleAction
  | SetTierBillingCycleDiscountsAction
  | SetTierPricingModeAction
  | ReorderTiersAction;
