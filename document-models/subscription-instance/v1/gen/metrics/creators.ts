import { createAction } from "document-model";
import {
  AddServiceMetricInputSchema,
  UpdateMetricInputSchema,
  UpdateMetricUsageInputSchema,
  RemoveServiceMetricInputSchema,
  IncrementMetricUsageInputSchema,
  DecrementMetricUsageInputSchema,
  AccrueMetricUsageInputSchema,
} from "../schema/zod.js";
import type {
  AddServiceMetricInput,
  UpdateMetricInput,
  UpdateMetricUsageInput,
  RemoveServiceMetricInput,
  IncrementMetricUsageInput,
  DecrementMetricUsageInput,
  AccrueMetricUsageInput,
} from "../types.js";
import type {
  AddServiceMetricAction,
  UpdateMetricAction,
  UpdateMetricUsageAction,
  RemoveServiceMetricAction,
  IncrementMetricUsageAction,
  DecrementMetricUsageAction,
  AccrueMetricUsageAction,
} from "./actions.js";

export const addServiceMetric = (input: AddServiceMetricInput) =>
  createAction<AddServiceMetricAction>(
    "ADD_SERVICE_METRIC",
    { ...input },
    undefined,
    AddServiceMetricInputSchema,
    "global",
  );

export const updateMetric = (input: UpdateMetricInput) =>
  createAction<UpdateMetricAction>(
    "UPDATE_METRIC",
    { ...input },
    undefined,
    UpdateMetricInputSchema,
    "global",
  );

export const updateMetricUsage = (input: UpdateMetricUsageInput) =>
  createAction<UpdateMetricUsageAction>(
    "UPDATE_METRIC_USAGE",
    { ...input },
    undefined,
    UpdateMetricUsageInputSchema,
    "global",
  );

export const removeServiceMetric = (input: RemoveServiceMetricInput) =>
  createAction<RemoveServiceMetricAction>(
    "REMOVE_SERVICE_METRIC",
    { ...input },
    undefined,
    RemoveServiceMetricInputSchema,
    "global",
  );

export const incrementMetricUsage = (input: IncrementMetricUsageInput) =>
  createAction<IncrementMetricUsageAction>(
    "INCREMENT_METRIC_USAGE",
    { ...input },
    undefined,
    IncrementMetricUsageInputSchema,
    "global",
  );

export const decrementMetricUsage = (input: DecrementMetricUsageInput) =>
  createAction<DecrementMetricUsageAction>(
    "DECREMENT_METRIC_USAGE",
    { ...input },
    undefined,
    DecrementMetricUsageInputSchema,
    "global",
  );

export const accrueMetricUsage = (input: AccrueMetricUsageInput) =>
  createAction<AccrueMetricUsageAction>(
    "ACCRUE_METRIC_USAGE",
    { ...input },
    undefined,
    AccrueMetricUsageInputSchema,
    "global",
  );
