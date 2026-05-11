import { createAction } from "document-model";
import {
  AddServiceInputSchema,
  RemoveServiceInputSchema,
  UpdateServiceSetupCostInputSchema,
  UpdateServiceRecurringCostInputSchema,
  UpdateServiceInfoInputSchema,
  AddServiceFacetSelectionInputSchema,
  RemoveServiceFacetSelectionInputSchema,
} from "../schema/zod.js";
import type {
  AddServiceInput,
  RemoveServiceInput,
  UpdateServiceSetupCostInput,
  UpdateServiceRecurringCostInput,
  UpdateServiceInfoInput,
  AddServiceFacetSelectionInput,
  RemoveServiceFacetSelectionInput,
} from "../types.js";
import type {
  AddServiceAction,
  RemoveServiceAction,
  UpdateServiceSetupCostAction,
  UpdateServiceRecurringCostAction,
  UpdateServiceInfoAction,
  AddServiceFacetSelectionAction,
  RemoveServiceFacetSelectionAction,
} from "./actions.js";

export const addService = (input: AddServiceInput) =>
  createAction<AddServiceAction>(
    "ADD_SERVICE",
    { ...input },
    undefined,
    AddServiceInputSchema,
    "global",
  );

export const removeService = (input: RemoveServiceInput) =>
  createAction<RemoveServiceAction>(
    "REMOVE_SERVICE",
    { ...input },
    undefined,
    RemoveServiceInputSchema,
    "global",
  );

export const updateServiceSetupCost = (input: UpdateServiceSetupCostInput) =>
  createAction<UpdateServiceSetupCostAction>(
    "UPDATE_SERVICE_SETUP_COST",
    { ...input },
    undefined,
    UpdateServiceSetupCostInputSchema,
    "global",
  );

export const updateServiceRecurringCost = (
  input: UpdateServiceRecurringCostInput,
) =>
  createAction<UpdateServiceRecurringCostAction>(
    "UPDATE_SERVICE_RECURRING_COST",
    { ...input },
    undefined,
    UpdateServiceRecurringCostInputSchema,
    "global",
  );

export const updateServiceInfo = (input: UpdateServiceInfoInput) =>
  createAction<UpdateServiceInfoAction>(
    "UPDATE_SERVICE_INFO",
    { ...input },
    undefined,
    UpdateServiceInfoInputSchema,
    "global",
  );

export const addServiceFacetSelection = (
  input: AddServiceFacetSelectionInput,
) =>
  createAction<AddServiceFacetSelectionAction>(
    "ADD_SERVICE_FACET_SELECTION",
    { ...input },
    undefined,
    AddServiceFacetSelectionInputSchema,
    "global",
  );

export const removeServiceFacetSelection = (
  input: RemoveServiceFacetSelectionInput,
) =>
  createAction<RemoveServiceFacetSelectionAction>(
    "REMOVE_SERVICE_FACET_SELECTION",
    { ...input },
    undefined,
    RemoveServiceFacetSelectionInputSchema,
    "global",
  );
