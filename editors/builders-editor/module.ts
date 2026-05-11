import type { EditorModule } from "document-model";
import { lazy } from "react";

export const BuildersEditor: EditorModule = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["powerhouse/builders"],
  config: {
    id: "builders-editor",
    name: "builders",
  },
};
