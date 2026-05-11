import type { EditorModule } from "document-model";
import { lazy } from "react";

/** Document editor module for the "powerhouse/rfp" document type */
export const RfpEditor: EditorModule = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["powerhouse/rfp"],
  config: {
    id: "rfp-editor",
    name: "Request For Proposals",
  },
};
