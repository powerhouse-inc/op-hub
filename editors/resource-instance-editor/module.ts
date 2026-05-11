import type { EditorModule } from "document-model";
import { lazy } from "react";

/** Document editor module for the "["powerhouse/resource-instance"]" document type */
export const ResourceInstanceEditor: EditorModule = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["powerhouse/resource-instance"],
  config: {
    id: "resource-instance-editor",
    name: "Resource Instance Editor",
  },
};
