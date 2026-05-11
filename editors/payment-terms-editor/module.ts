import type { EditorModule } from "document-model";
import { lazy } from "react";

export const PaymentTermsEditor: EditorModule = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["payment-terms"],
  config: {
    id: "payment-terms-editor",
    name: "Payment Terms",
  },
};
