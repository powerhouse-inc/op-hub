import type { EditorModule } from "document-model";
import { lazy } from "react";

export const NetworkProfileEditor: EditorModule = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["powerhouse/network-profile"],
  config: {
    id: "network-profile-editor",
    name: "Network Profile",
  },
};
