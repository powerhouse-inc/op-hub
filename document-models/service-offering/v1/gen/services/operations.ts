import { type SignalDispatch } from "document-model";
import type {
  AddServiceAction,
  UpdateServiceAction,
  DeleteServiceAction,
} from "./actions.js";
import type { ServiceOfferingState } from "../types.js";

export interface ServiceOfferingServicesOperations {
  addServiceOperation: (
    state: ServiceOfferingState,
    action: AddServiceAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateServiceOperation: (
    state: ServiceOfferingState,
    action: UpdateServiceAction,
    dispatch?: SignalDispatch,
  ) => void;
  deleteServiceOperation: (
    state: ServiceOfferingState,
    action: DeleteServiceAction,
    dispatch?: SignalDispatch,
  ) => void;
}
