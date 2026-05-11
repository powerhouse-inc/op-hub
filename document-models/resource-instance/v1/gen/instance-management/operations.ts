import { type SignalDispatch } from "document-model";
import type {
  InitializeInstanceAction,
  UpdateInstanceInfoAction,
  SetOperatorProfileAction,
  UpdateInstanceStatusAction,
  ConfirmInstanceAction,
  ReportProvisioningStartedAction,
  ReportProvisioningCompletedAction,
  ReportProvisioningFailedAction,
  ActivateInstanceAction,
  SuspendForNonPaymentAction,
  SuspendForMaintenanceAction,
  ResumeAfterPaymentAction,
  ResumeAfterMaintenanceAction,
  SuspendInstanceAction,
  TerminateInstanceAction,
} from "./actions.js";
import type { ResourceInstanceState } from "../types.js";

export interface ResourceInstanceInstanceManagementOperations {
  initializeInstanceOperation: (
    state: ResourceInstanceState,
    action: InitializeInstanceAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateInstanceInfoOperation: (
    state: ResourceInstanceState,
    action: UpdateInstanceInfoAction,
    dispatch?: SignalDispatch,
  ) => void;
  setOperatorProfileOperation: (
    state: ResourceInstanceState,
    action: SetOperatorProfileAction,
    dispatch?: SignalDispatch,
  ) => void;
  updateInstanceStatusOperation: (
    state: ResourceInstanceState,
    action: UpdateInstanceStatusAction,
    dispatch?: SignalDispatch,
  ) => void;
  confirmInstanceOperation: (
    state: ResourceInstanceState,
    action: ConfirmInstanceAction,
    dispatch?: SignalDispatch,
  ) => void;
  reportProvisioningStartedOperation: (
    state: ResourceInstanceState,
    action: ReportProvisioningStartedAction,
    dispatch?: SignalDispatch,
  ) => void;
  reportProvisioningCompletedOperation: (
    state: ResourceInstanceState,
    action: ReportProvisioningCompletedAction,
    dispatch?: SignalDispatch,
  ) => void;
  reportProvisioningFailedOperation: (
    state: ResourceInstanceState,
    action: ReportProvisioningFailedAction,
    dispatch?: SignalDispatch,
  ) => void;
  activateInstanceOperation: (
    state: ResourceInstanceState,
    action: ActivateInstanceAction,
    dispatch?: SignalDispatch,
  ) => void;
  suspendForNonPaymentOperation: (
    state: ResourceInstanceState,
    action: SuspendForNonPaymentAction,
    dispatch?: SignalDispatch,
  ) => void;
  suspendForMaintenanceOperation: (
    state: ResourceInstanceState,
    action: SuspendForMaintenanceAction,
    dispatch?: SignalDispatch,
  ) => void;
  resumeAfterPaymentOperation: (
    state: ResourceInstanceState,
    action: ResumeAfterPaymentAction,
    dispatch?: SignalDispatch,
  ) => void;
  resumeAfterMaintenanceOperation: (
    state: ResourceInstanceState,
    action: ResumeAfterMaintenanceAction,
    dispatch?: SignalDispatch,
  ) => void;
  suspendInstanceOperation: (
    state: ResourceInstanceState,
    action: SuspendInstanceAction,
    dispatch?: SignalDispatch,
  ) => void;
  terminateInstanceOperation: (
    state: ResourceInstanceState,
    action: TerminateInstanceAction,
    dispatch?: SignalDispatch,
  ) => void;
}
