import type { EditorModule } from "document-model";
import { lazy } from "react";

/** Document editor module for the "["powerhouse/subscription-instance"]" document type */
export const SubscriptionInstanceEditor: EditorModule = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["powerhouse/subscription-instance"],
  config: {
    id: "subscription-instance-editor",
    name: "Subscription Instance Editor",
  },
};
