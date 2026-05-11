import type { PHDocument, PHBaseState } from "document-model";
import type { SubscriptionInstanceAction } from "./actions.js";
import type { SubscriptionInstanceState as SubscriptionInstanceGlobalState } from "./schema/types.js";

type SubscriptionInstanceLocalState = Record<PropertyKey, never>;

type SubscriptionInstancePHState = PHBaseState & {
  global: SubscriptionInstanceGlobalState;
  local: SubscriptionInstanceLocalState;
};
type SubscriptionInstanceDocument = PHDocument<SubscriptionInstancePHState>;

export * from "./schema/types.js";

export type {
  SubscriptionInstanceGlobalState,
  SubscriptionInstanceLocalState,
  SubscriptionInstancePHState,
  SubscriptionInstanceAction,
  SubscriptionInstanceDocument,
};
