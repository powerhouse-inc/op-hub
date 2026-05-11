import { createAction } from "document-model";
import {
  AddTierInputSchema,
  UpdateTierInputSchema,
  UpdateTierPricingInputSchema,
  DeleteTierInputSchema,
  AddServiceLevelInputSchema,
  UpdateServiceLevelInputSchema,
  RemoveServiceLevelInputSchema,
  AddUsageLimitInputSchema,
  UpdateUsageLimitInputSchema,
  RemoveUsageLimitInputSchema,
  SetTierDefaultBillingCycleInputSchema,
  SetTierBillingCycleDiscountsInputSchema,
  SetTierPricingModeInputSchema,
  ReorderTiersInputSchema,
} from "../schema/zod.js";
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

export const addTier = (input: AddTierInput) =>
  createAction<AddTierAction>(
    "ADD_TIER",
    { ...input },
    undefined,
    AddTierInputSchema,
    "global",
  );

export const updateTier = (input: UpdateTierInput) =>
  createAction<UpdateTierAction>(
    "UPDATE_TIER",
    { ...input },
    undefined,
    UpdateTierInputSchema,
    "global",
  );

export const updateTierPricing = (input: UpdateTierPricingInput) =>
  createAction<UpdateTierPricingAction>(
    "UPDATE_TIER_PRICING",
    { ...input },
    undefined,
    UpdateTierPricingInputSchema,
    "global",
  );

export const deleteTier = (input: DeleteTierInput) =>
  createAction<DeleteTierAction>(
    "DELETE_TIER",
    { ...input },
    undefined,
    DeleteTierInputSchema,
    "global",
  );

export const addServiceLevel = (input: AddServiceLevelInput) =>
  createAction<AddServiceLevelAction>(
    "ADD_SERVICE_LEVEL",
    { ...input },
    undefined,
    AddServiceLevelInputSchema,
    "global",
  );

export const updateServiceLevel = (input: UpdateServiceLevelInput) =>
  createAction<UpdateServiceLevelAction>(
    "UPDATE_SERVICE_LEVEL",
    { ...input },
    undefined,
    UpdateServiceLevelInputSchema,
    "global",
  );

export const removeServiceLevel = (input: RemoveServiceLevelInput) =>
  createAction<RemoveServiceLevelAction>(
    "REMOVE_SERVICE_LEVEL",
    { ...input },
    undefined,
    RemoveServiceLevelInputSchema,
    "global",
  );

export const addUsageLimit = (input: AddUsageLimitInput) =>
  createAction<AddUsageLimitAction>(
    "ADD_USAGE_LIMIT",
    { ...input },
    undefined,
    AddUsageLimitInputSchema,
    "global",
  );

export const updateUsageLimit = (input: UpdateUsageLimitInput) =>
  createAction<UpdateUsageLimitAction>(
    "UPDATE_USAGE_LIMIT",
    { ...input },
    undefined,
    UpdateUsageLimitInputSchema,
    "global",
  );

export const removeUsageLimit = (input: RemoveUsageLimitInput) =>
  createAction<RemoveUsageLimitAction>(
    "REMOVE_USAGE_LIMIT",
    { ...input },
    undefined,
    RemoveUsageLimitInputSchema,
    "global",
  );

export const setTierDefaultBillingCycle = (
  input: SetTierDefaultBillingCycleInput,
) =>
  createAction<SetTierDefaultBillingCycleAction>(
    "SET_TIER_DEFAULT_BILLING_CYCLE",
    { ...input },
    undefined,
    SetTierDefaultBillingCycleInputSchema,
    "global",
  );

export const setTierBillingCycleDiscounts = (
  input: SetTierBillingCycleDiscountsInput,
) =>
  createAction<SetTierBillingCycleDiscountsAction>(
    "SET_TIER_BILLING_CYCLE_DISCOUNTS",
    { ...input },
    undefined,
    SetTierBillingCycleDiscountsInputSchema,
    "global",
  );

export const setTierPricingMode = (input: SetTierPricingModeInput) =>
  createAction<SetTierPricingModeAction>(
    "SET_TIER_PRICING_MODE",
    { ...input },
    undefined,
    SetTierPricingModeInputSchema,
    "global",
  );

export const reorderTiers = (input: ReorderTiersInput) =>
  createAction<ReorderTiersAction>(
    "REORDER_TIERS",
    { ...input },
    undefined,
    ReorderTiersInputSchema,
    "global",
  );
