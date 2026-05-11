import { RelationalDbProcessor } from "@powerhousedao/shared/processors";
import type { ProcessorFilter } from "@powerhousedao/shared/processors";
import type { OperationWithContext } from "@powerhousedao/shared/document-model";
import type {
  EditInitialProposalInput,
  EditClientInfoInput,
  EditWorkstreamInput,
  EditAlternativeProposalInput,
  Proposal,
  WorkstreamState,
} from "document-models/workstream";
import { up } from "./migrations.js";
import type { DB } from "./schema.js";

export class WorkstreamsProcessor extends RelationalDbProcessor<DB> {
  static override getNamespace(driveId: string): string {
    return super.getNamespace(driveId);
  }

  workstreams: string[] = [];

  override async initAndUpgrade(): Promise<void> {
    await up(this.relationalDb);
  }

  override async onOperations(
    operations: OperationWithContext[],
  ): Promise<void> {
    if (operations.length === 0) {
      return;
    }

    for (const { operation, context } of operations) {
      const actionType = operation.action.type;
      const actionInput = operation.action.input as Record<string, unknown>;
      const docId = context.documentId;

      let state: WorkstreamState | null = null;
      if (context.resultingState) {
        const parsed = JSON.parse(context.resultingState);
        // resultingState may be wrapped in { global: ... } or be the global state directly
        state = (parsed.global ?? parsed) as WorkstreamState;
        if (actionType === "EDIT_INITIAL_PROPOSAL") {
          console.log(
            "[WorkstreamsProcessor] Parsed state sow:",
            state.sow,
            "initialProposal?.sow:",
            state.initialProposal?.sow,
          );
        }
      }

      if (context.documentType === "powerhouse/workstream" && state) {
        await this.setWorkstream(docId, state);

        if (actionType === "EDIT_WORKSTREAM") {
          await this.updateWorkstream(docId, actionInput);
        }
        if (actionType === "EDIT_CLIENT_INFO") {
          await this.updateNetworkInWorkstream(
            docId,
            actionInput as unknown as EditClientInfoInput,
          );
        }
        if (actionType === "EDIT_INITIAL_PROPOSAL") {
          await this.updateInitialProposalInWorkstream(
            docId,
            actionInput as unknown as EditInitialProposalInput,
            state,
          );
        }
        if (actionType === "EDIT_ALTERNATIVE_PROPOSAL") {
          await this.updateSowFromAlternativeProposal(
            docId,
            actionInput as unknown as EditAlternativeProposalInput,
            state,
          );
        }
      }

      if (context.documentType === "powerhouse/document-drive") {
        if (actionType === "DELETE_NODE") {
          const deleteInput = actionInput as { id: string };
          console.log("deleting workstream node", deleteInput.id);
          const foundWorkstream = this.workstreams.find(
            (ws) => ws === deleteInput.id,
          );
          if (foundWorkstream) {
            await this.relationalDb
              .deleteFrom("workstreams")
              .where("workstream_phid", "=", foundWorkstream)
              .execute();
          }
        }
      }
    }
  }

  async onDisconnect() {
    try {
      await this.relationalDb.deleteFrom("workstreams").execute();
      console.log(`Cleaned up workstreams for namespace: ${this.namespace}`);
    } catch (error) {
      console.error(
        `Error cleaning up workstreams for namespace ${this.namespace}:`,
        error,
      );
    }
  }

  setWorkstream = async (docId: string, state: WorkstreamState) => {
    if (!this.workstreams.includes(docId)) {
      this.workstreams.push(docId);
    }

    const values = {
      network_phid: state.client?.id ? state.client.id : null,
      network_slug: state.client?.name
        ? state.client.name.toLowerCase().split(" ").join("-")
        : null,
      workstream_phid: docId,
      workstream_slug: state.title
        ? state.title.toLowerCase().split(" ").join("-")
        : "",
      workstream_title: state.title,
      workstream_status: state.status,
      sow_phid:
        state.sow ||
        (state.initialProposal?.status === "ACCEPTED"
          ? state.initialProposal.sow
          : null) ||
        null,
      initial_proposal_status: state.initialProposal
        ? state.initialProposal.status
        : null,
      initial_proposal_author: state.initialProposal
        ? state.initialProposal.author.name
        : null,
    };

    await this.relationalDb
      .insertInto("workstreams")
      .values(values)
      .onConflict((oc) =>
        oc.column("workstream_phid").doUpdateSet({
          network_phid: values.network_phid,
          network_slug: values.network_slug,
          workstream_slug: values.workstream_slug,
          workstream_title: values.workstream_title,
          workstream_status: values.workstream_status,
          sow_phid: values.sow_phid,
          initial_proposal_status: values.initial_proposal_status,
          initial_proposal_author: values.initial_proposal_author,
        }),
      )
      .execute();
  };

  updateInitialProposalInWorkstream = async (
    docId: string,
    input: EditInitialProposalInput,
    state: WorkstreamState,
  ) => {
    const existingWorkstreamPhids = await this.relationalDb
      .selectFrom("workstreams")
      .select("workstream_phid")
      .where("workstream_phid", "=", docId)
      .execute();

    const [foundWorkstreamId] = existingWorkstreamPhids;

    if (foundWorkstreamId) {
      console.log("updating initial proposal in workstream", input);

      const updateData: Record<string, string | null> = {};
      if (input.sowId !== undefined) {
        if (state.initialProposal?.status === "ACCEPTED") {
          updateData.sow_phid = state.initialProposal?.sow || null;
        }
      }
      if (input.proposalAuthor) {
        updateData.initial_proposal_author = input.proposalAuthor.name || null;
      }
      if (input.status) {
        updateData.initial_proposal_status = input.status;
        if (input.status === "ACCEPTED") {
          updateData.sow_phid = state.initialProposal?.sow || null;
        }
      }
      if (Object.keys(updateData).length > 0) {
        await this.relationalDb
          .updateTable("workstreams")
          .set(updateData)
          .where("workstream_phid", "=", docId)
          .execute();
      }
    }
  };

  updateSowFromAlternativeProposal = async (
    docId: string,
    input: EditAlternativeProposalInput,
    state: WorkstreamState,
  ) => {
    const existingWorkstreamPhids = await this.relationalDb
      .selectFrom("workstreams")
      .select("workstream_phid")
      .where("workstream_phid", "=", docId)
      .execute();

    const [foundWorkstreamId] = existingWorkstreamPhids;

    if (foundWorkstreamId) {
      console.log(
        "updating sow from alternative proposal in workstream",
        input,
      );

      const updateData: Record<string, string | null> = {};

      const selectedAlternativeProposal = state.alternativeProposals.find(
        (proposal: Proposal) => proposal.id === input.id,
      );

      if (selectedAlternativeProposal) {
        if (input.sowId !== undefined) {
          if (selectedAlternativeProposal.status === "ACCEPTED") {
            updateData.sow_phid = selectedAlternativeProposal.sow || null;
          }
        }

        if (input.status) {
          if (input.status === "ACCEPTED") {
            updateData.sow_phid = selectedAlternativeProposal.sow || null;
          }
        }
      }
      if (Object.keys(updateData).length > 0) {
        await this.relationalDb
          .updateTable("workstreams")
          .set(updateData)
          .where("workstream_phid", "=", docId)
          .execute();
      }
    }
  };

  updateNetworkInWorkstream = async (
    docId: string,
    input: EditClientInfoInput,
  ) => {
    const existingWorkstreamPhids = await this.relationalDb
      .selectFrom("workstreams")
      .select("workstream_phid")
      .where("workstream_phid", "=", docId)
      .execute();

    const [foundWorkstreamId] = existingWorkstreamPhids;

    if (foundWorkstreamId) {
      console.log("updating client in workstream", input);

      const updateData: Record<string, string | null> = {};
      if (input.clientId) {
        updateData.network_phid = input.clientId;
      }
      if (input.name) {
        updateData.network_slug = input.name.toLowerCase().split(" ").join("-");
      }

      if (Object.keys(updateData).length > 0) {
        await this.relationalDb
          .updateTable("workstreams")
          .set(updateData)
          .where("workstream_phid", "=", docId)
          .execute();
      }
    }
  };

  updateWorkstream = async (docId: string, input: EditWorkstreamInput) => {
    const existingWorkstreamPhids = await this.relationalDb
      .selectFrom("workstreams")
      .select("workstream_phid")
      .where("workstream_phid", "=", docId)
      .execute();

    const [foundWorkstreamId] = existingWorkstreamPhids;

    if (foundWorkstreamId) {
      console.log("updating workstream", input);

      const updateData: Record<string, string | null> = {};
      if (input.title) {
        updateData.workstream_title = input.title;
        updateData.workstream_slug = input.title
          .toLowerCase()
          .split(" ")
          .join("-");
      }
      if (input.status) {
        updateData.workstream_status = input.status;
      }

      if (Object.keys(updateData).length > 0) {
        await this.relationalDb
          .updateTable("workstreams")
          .set(updateData)
          .where("workstream_phid", "=", docId)
          .execute();
      }
    }
  };
}
