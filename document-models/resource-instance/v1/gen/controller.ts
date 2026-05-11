import { PHDocumentController } from "document-model";
import { ResourceInstance } from "../module.js";
import type {
  ResourceInstanceAction,
  ResourceInstancePHState,
} from "./types.js";

export const ResourceInstanceController = PHDocumentController.forDocumentModel<
  ResourceInstancePHState,
  ResourceInstanceAction
>(ResourceInstance);
