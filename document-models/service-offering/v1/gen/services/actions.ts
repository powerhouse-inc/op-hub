import type { Action } from "document-model";
import type {
  AddServiceInput,
  UpdateServiceInput,
  DeleteServiceInput,
} from "../types.js";

export type AddServiceAction = Action & {
  type: "ADD_SERVICE";
  input: AddServiceInput;
};
export type UpdateServiceAction = Action & {
  type: "UPDATE_SERVICE";
  input: UpdateServiceInput;
};
export type DeleteServiceAction = Action & {
  type: "DELETE_SERVICE";
  input: DeleteServiceInput;
};

export type ServiceOfferingServicesAction =
  | AddServiceAction
  | UpdateServiceAction
  | DeleteServiceAction;
