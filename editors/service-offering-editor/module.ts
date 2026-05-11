import type { EditorModule } from "document-model";
import { lazy } from "react";

/** Document editor module for the "["powerhouse/service-offering"]" document type */
export const ServiceOfferingEditor: EditorModule = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["powerhouse/service-offering"],
  config: {
    id: "service-offering-editor",
    name: "Service Offering Editor",
  },
};
