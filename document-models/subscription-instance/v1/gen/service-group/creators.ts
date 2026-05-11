import { createAction } from "document-model";
import {
  AddServiceGroupInputSchema,
  RemoveServiceGroupInputSchema,
  AddServiceToGroupInputSchema,
  RemoveServiceFromGroupInputSchema,
  UpdateServiceGroupCostInputSchema,
} from "../schema/zod.js";
import type {
  AddServiceGroupInput,
  RemoveServiceGroupInput,
  AddServiceToGroupInput,
  RemoveServiceFromGroupInput,
  UpdateServiceGroupCostInput,
} from "../types.js";
import type {
  AddServiceGroupAction,
  RemoveServiceGroupAction,
  AddServiceToGroupAction,
  RemoveServiceFromGroupAction,
  UpdateServiceGroupCostAction,
} from "./actions.js";

export const addServiceGroup = (input: AddServiceGroupInput) =>
  createAction<AddServiceGroupAction>(
    "ADD_SERVICE_GROUP",
    { ...input },
    undefined,
    AddServiceGroupInputSchema,
    "global",
  );

export const removeServiceGroup = (input: RemoveServiceGroupInput) =>
  createAction<RemoveServiceGroupAction>(
    "REMOVE_SERVICE_GROUP",
    { ...input },
    undefined,
    RemoveServiceGroupInputSchema,
    "global",
  );

export const addServiceToGroup = (input: AddServiceToGroupInput) =>
  createAction<AddServiceToGroupAction>(
    "ADD_SERVICE_TO_GROUP",
    { ...input },
    undefined,
    AddServiceToGroupInputSchema,
    "global",
  );

export const removeServiceFromGroup = (input: RemoveServiceFromGroupInput) =>
  createAction<RemoveServiceFromGroupAction>(
    "REMOVE_SERVICE_FROM_GROUP",
    { ...input },
    undefined,
    RemoveServiceFromGroupInputSchema,
    "global",
  );

export const updateServiceGroupCost = (input: UpdateServiceGroupCostInput) =>
  createAction<UpdateServiceGroupCostAction>(
    "UPDATE_SERVICE_GROUP_COST",
    { ...input },
    undefined,
    UpdateServiceGroupCostInputSchema,
    "global",
  );
