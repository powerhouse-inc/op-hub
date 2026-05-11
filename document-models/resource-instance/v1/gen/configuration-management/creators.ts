import { createAction } from "document-model";
import {
  SetInstanceFacetInputSchema,
  RemoveInstanceFacetInputSchema,
  UpdateInstanceFacetInputSchema,
  ApplyConfigurationChangesInputSchema,
} from "../schema/zod.js";
import type {
  SetInstanceFacetInput,
  RemoveInstanceFacetInput,
  UpdateInstanceFacetInput,
  ApplyConfigurationChangesInput,
} from "../types.js";
import type {
  SetInstanceFacetAction,
  RemoveInstanceFacetAction,
  UpdateInstanceFacetAction,
  ApplyConfigurationChangesAction,
} from "./actions.js";

export const setInstanceFacet = (input: SetInstanceFacetInput) =>
  createAction<SetInstanceFacetAction>(
    "SET_INSTANCE_FACET",
    { ...input },
    undefined,
    SetInstanceFacetInputSchema,
    "global",
  );

export const removeInstanceFacet = (input: RemoveInstanceFacetInput) =>
  createAction<RemoveInstanceFacetAction>(
    "REMOVE_INSTANCE_FACET",
    { ...input },
    undefined,
    RemoveInstanceFacetInputSchema,
    "global",
  );

export const updateInstanceFacet = (input: UpdateInstanceFacetInput) =>
  createAction<UpdateInstanceFacetAction>(
    "UPDATE_INSTANCE_FACET",
    { ...input },
    undefined,
    UpdateInstanceFacetInputSchema,
    "global",
  );

export const applyConfigurationChanges = (
  input: ApplyConfigurationChangesInput,
) =>
  createAction<ApplyConfigurationChangesAction>(
    "APPLY_CONFIGURATION_CHANGES",
    { ...input },
    undefined,
    ApplyConfigurationChangesInputSchema,
    "global",
  );
