import { PHDocumentController } from "document-model";
import { ServiceOffering } from "../module.js";
import type { ServiceOfferingAction, ServiceOfferingPHState } from "./types.js";

export const ServiceOfferingController = PHDocumentController.forDocumentModel<
  ServiceOfferingPHState,
  ServiceOfferingAction
>(ServiceOffering);
