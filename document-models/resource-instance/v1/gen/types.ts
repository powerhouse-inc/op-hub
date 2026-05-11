import type { PHDocument, PHBaseState } from "document-model";
import type { ResourceInstanceAction } from "./actions.js";
import type { ResourceInstanceState as ResourceInstanceGlobalState } from "./schema/types.js";

type ResourceInstanceLocalState = Record<PropertyKey, never>;

type ResourceInstancePHState = PHBaseState & {
  global: ResourceInstanceGlobalState;
  local: ResourceInstanceLocalState;
};
type ResourceInstanceDocument = PHDocument<ResourceInstancePHState>;

export * from "./schema/types.js";

export type {
  ResourceInstanceGlobalState,
  ResourceInstanceLocalState,
  ResourceInstancePHState,
  ResourceInstanceAction,
  ResourceInstanceDocument,
};
