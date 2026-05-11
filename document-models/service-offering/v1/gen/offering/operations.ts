import { type SignalDispatch } from "document-model";
import type {
  UpdateOfferingInfoAction,
  UpdateOfferingStatusAction,
  SetOperatorAction,
  SetOfferingIdAction,
  SetFacetTargetAction,
  RemoveFacetTargetAction,
  AddFacetOptionAction,
  RemoveFacetOptionAction,
  SelectResourceTemplateAction,
  ChangeResourceTemplateAction,
  SetAvailableBillingCyclesAction,
} from "./actions.js";
import type { ServiceOfferingState } from "../types.js";

export interface ServiceOfferingOfferingOperations {
  updateOfferingInfoOperation: (
    state: ServiceOfferingState,
    action: UpdateOfferingInfoAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateOfferingStatusOperation: (
    state: ServiceOfferingState,
    action: UpdateOfferingStatusAction,
    dispatch?: SignalDispatch,
  ) => void;
  setOperatorOperation: (
    state: ServiceOfferingState,
    action: SetOperatorAction,
    dispatch?: SignalDispatch,
  ) => void;
  setOfferingIdOperation: (
    state: ServiceOfferingState,
    action: SetOfferingIdAction,
    dispatch?: SignalDispatch,
  ) => void;
  setFacetTargetOperation: (
    state: ServiceOfferingState,
    action: SetFacetTargetAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeFacetTargetOperation: (
    state: ServiceOfferingState,
    action: RemoveFacetTargetAction,
    dispatch?: SignalDispatch,
  ) => void;
  addFacetOptionOperation: (
    state: ServiceOfferingState,
    action: AddFacetOptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  removeFacetOptionOperation: (
    state: ServiceOfferingState,
    action: RemoveFacetOptionAction,
    dispatch?: SignalDispatch,
  ) => void;
  selectResourceTemplateOperation: (
    state: ServiceOfferingState,
    action: SelectResourceTemplateAction,
    dispatch?: SignalDispatch,
  ) => void;
  changeResourceTemplateOperation: (
    state: ServiceOfferingState,
    action: ChangeResourceTemplateAction,
    dispatch?: SignalDispatch,
  ) => void;
  setAvailableBillingCyclesOperation: (
    state: ServiceOfferingState,
    action: SetAvailableBillingCyclesAction,
    dispatch?: SignalDispatch,
  ) => void;
}
