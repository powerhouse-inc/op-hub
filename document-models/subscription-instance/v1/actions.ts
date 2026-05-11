import { baseActions } from "document-model";
import {
  subscriptionInstanceSubscriptionActions,
  subscriptionInstanceServiceActions,
  subscriptionInstanceServiceGroupActions,
  subscriptionInstanceMetricsActions,
  subscriptionInstanceCustomerActions,
  subscriptionInstanceDebtLineItemsActions,
} from "./gen/creators.js";

/** Actions for the SubscriptionInstance document model */

export const actions = {
  ...baseActions,
  ...subscriptionInstanceSubscriptionActions,
  ...subscriptionInstanceServiceActions,
  ...subscriptionInstanceServiceGroupActions,
  ...subscriptionInstanceMetricsActions,
  ...subscriptionInstanceCustomerActions,
  ...subscriptionInstanceDebtLineItemsActions,
};
