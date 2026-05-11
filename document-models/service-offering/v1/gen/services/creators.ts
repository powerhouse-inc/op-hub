import { createAction } from "document-model";
import {
  AddServiceInputSchema,
  UpdateServiceInputSchema,
  DeleteServiceInputSchema,
} from "../schema/zod.js";
import type {
  AddServiceInput,
  UpdateServiceInput,
  DeleteServiceInput,
} from "../types.js";
import type {
  AddServiceAction,
  UpdateServiceAction,
  DeleteServiceAction,
} from "./actions.js";

export const addService = (input: AddServiceInput) =>
  createAction<AddServiceAction>(
    "ADD_SERVICE",
    { ...input },
    undefined,
    AddServiceInputSchema,
    "global",
  );

export const updateService = (input: UpdateServiceInput) =>
  createAction<UpdateServiceAction>(
    "UPDATE_SERVICE",
    { ...input },
    undefined,
    UpdateServiceInputSchema,
    "global",
  );

export const deleteService = (input: DeleteServiceInput) =>
  createAction<DeleteServiceAction>(
    "DELETE_SERVICE",
    { ...input },
    undefined,
    DeleteServiceInputSchema,
    "global",
  );
