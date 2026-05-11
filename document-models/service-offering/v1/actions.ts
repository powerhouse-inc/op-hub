import { baseActions } from "document-model";
import {
  serviceOfferingOfferingActions,
  serviceOfferingServicesActions,
  serviceOfferingTiersActions,
  serviceOfferingOptionGroupsActions,
} from "./gen/creators.js";

/** Actions for the ServiceOffering document model */

export const actions = {
  ...baseActions,
  ...serviceOfferingOfferingActions,
  ...serviceOfferingServicesActions,
  ...serviceOfferingTiersActions,
  ...serviceOfferingOptionGroupsActions,
};
