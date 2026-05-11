import { baseActions } from "document-model";
import {
  resourceInstanceInstanceManagementActions,
  resourceInstanceConfigurationManagementActions,
} from "./gen/creators.js";

/** Actions for the ResourceInstance document model */

export const actions = {
  ...baseActions,
  ...resourceInstanceInstanceManagementActions,
  ...resourceInstanceConfigurationManagementActions,
};
