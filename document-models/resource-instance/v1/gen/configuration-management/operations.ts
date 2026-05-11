import { type SignalDispatch } from "document-model";
import type {
  SetInstanceFacetAction,
  RemoveInstanceFacetAction,
  UpdateInstanceFacetAction,
  ApplyConfigurationChangesAction,
} from "./actions.js";
import type { ResourceInstanceState } from "../types.js";

export interface ResourceInstanceConfigurationManagementOperations {
  setInstanceFacetOperation: (
    state: ResourceInstanceState,
    action: SetInstanceFacetAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeInstanceFacetOperation: (
    state: ResourceInstanceState,
    action: RemoveInstanceFacetAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateInstanceFacetOperation: (
    state: ResourceInstanceState,
    action: UpdateInstanceFacetAction,
    dispatch?: SignalDispatch,
  ) => void;
  applyConfigurationChangesOperation: (
    state: ResourceInstanceState,
    action: ApplyConfigurationChangesAction,
    dispatch?: SignalDispatch,
  ) => void;
}
