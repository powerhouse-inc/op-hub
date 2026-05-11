import type { ResourceInstanceInstanceManagementAction } from "./instance-management/actions.js";
import type { ResourceInstanceConfigurationManagementAction } from "./configuration-management/actions.js";

export * from "./instance-management/actions.js";
export * from "./configuration-management/actions.js";

export type ResourceInstanceAction =
  | ResourceInstanceInstanceManagementAction
  | ResourceInstanceConfigurationManagementAction;
