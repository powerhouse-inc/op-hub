import type {
  ProcessorRecord,
  IProcessorHostModule,
  ProcessorFilter,
} from "@powerhousedao/shared/processors";
import type { PHDocumentHeader } from "document-model";
import { WorkstreamsProcessor } from "./index.js";

export const workstreamsProcessorFactory =
  (module: IProcessorHostModule) =>
  async (driveHeader: PHDocumentHeader): Promise<ProcessorRecord[]> => {
    const namespace = WorkstreamsProcessor.getNamespace(driveHeader.id);
    console.log(
      `[WorkstreamsProcessor] Factory called for drive: ${driveHeader.id}, namespace: ${namespace}`,
    );

    const store =
      await module.relationalDb.createNamespace<WorkstreamsProcessor>(
        namespace,
      );

    const filter: ProcessorFilter = {
      branch: ["main"],
      documentId: ["*"],
      documentType: ["powerhouse/workstream", "powerhouse/document-drive"],
      scope: ["global"],
    };

    const processor = new WorkstreamsProcessor(namespace, filter, store);

    await processor.initAndUpgrade();

    console.log(
      `[WorkstreamsProcessor] Processor created for drive: ${driveHeader.id}`,
    );

    return [
      {
        processor,
        filter,
        startFrom: "beginning" as const,
      },
    ];
  };
