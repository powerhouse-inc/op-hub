import {
  useDocumentOfType,
  useSelectedDocumentId,
} from "@powerhousedao/reactor-browser";
import type {
  SnapshotReportAction,
  SnapshotReportDocument,
} from "../../document-models/snapshot-report/index.js";

export function useSnapshotReportDocument(
  documentId: string | null | undefined,
) {
  return useDocumentOfType<SnapshotReportDocument, SnapshotReportAction>(
    documentId,
    "powerhouse/snapshot-report",
  );
}

export function useSelectedSnapshotReportDocument() {
  const selectedDocumentId = useSelectedDocumentId();
  return useSnapshotReportDocument(selectedDocumentId);
}
