import type { EditorModule } from "document-model";
import { lazy } from "react";

/** Document editor module for the "powerhouse/workstream" document type */
export const WorkstreamEditor: EditorModule = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["powerhouse/workstream"],
  config: {
    id: "workstream-editor",
    name: "Workstream",
  },
};
