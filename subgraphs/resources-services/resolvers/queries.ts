import type { IReactorClient } from "@powerhousedao/reactor";
import type { ResourceTemplateDocument } from "document-models/resource-template";
import type { ServiceOfferingDocument } from "document-models/service-offering";
import type {
  DocumentDriveDocument,
  Node,
} from "@powerhousedao/shared/document-drive";
import type { BuilderProfileDocument } from "document-models/builder-profile/v1";
import type {
  ResourceTemplatesFilter,
  ServiceOfferingsFilter,
  GetBuilderDrivesFilter,
} from "./types.js";
import {
  mapResourceTemplateState,
  mapServiceOfferingState,
} from "./mappers.js";
import { getDeletedDriveDocIds } from "./drive-utils.js";
import {
  getVisibleResourceTemplateIdSet,
  isResourceTemplateVisibleForQuery,
  getResourceTemplateState,
  getResourceTemplateStateMap,
} from "./resource-template-utils.js";
import { getDriveLink } from "./drive-links.js";

export function createQueryResolvers(reactorClient: IReactorClient) {
  return {
    resourceTemplates: async (
      _: unknown,
      args: { filter?: ResourceTemplatesFilter },
    ) => {
      const { id, status, operatorId } = args.filter || {};
      const deletedDriveDocIds = await getDeletedDriveDocIds(reactorClient);

      // If filtering by specific id, try to fetch directly
      if (id) {
        try {
          const doc = await reactorClient.get<ResourceTemplateDocument>(id);
          if (
            doc &&
            doc.header.documentType === "powerhouse/resource-template" &&
            !doc.state.document.isDeleted &&
            !deletedDriveDocIds.has(doc.header.id)
          ) {
            const state = doc.state.global;
            if (status && status.length > 0 && !status.includes(state.status)) {
              return [];
            }
            if (operatorId && state.operatorId !== operatorId) {
              return [];
            }
            return [mapResourceTemplateState(state, doc)];
          }
        } catch {
          // Document not found
        }
        return [];
      }

      // Find all resource template documents
      const { results: docs } = await reactorClient.find({
        type: "powerhouse/resource-template",
      });

      const resourceTemplates: ReturnType<typeof mapResourceTemplateState>[] =
        [];

      for (const doc of docs) {
        // Skip docs from soft-deleted drives or soft-deleted documents
        if (deletedDriveDocIds.has(doc.header.id)) continue;
        if (doc.state.document.isDeleted) continue;

        const resourceDoc = doc as ResourceTemplateDocument;
        const state = resourceDoc.state.global;

        // Skip documents missing required fields
        if (!state.operatorId) continue;

        // Apply status filter if provided
        if (status && status.length > 0 && !status.includes(state.status)) {
          continue;
        }

        // Apply operatorId filter if provided
        if (operatorId && state.operatorId !== operatorId) {
          continue;
        }

        resourceTemplates.push(mapResourceTemplateState(state, doc));
      }

      return resourceTemplates;
    },

    serviceOfferings: async (
      _: unknown,
      args: { filter?: ServiceOfferingsFilter },
    ) => {
      const { id, status, operatorId, resourceTemplateId } = args.filter || {};
      const deletedDriveDocIds = await getDeletedDriveDocIds(reactorClient);

      // If filtering by specific id, try to fetch directly
      if (id) {
        try {
          const doc = await reactorClient.get<ServiceOfferingDocument>(id);
          if (
            doc &&
            doc.header.documentType === "powerhouse/service-offering" &&
            !doc.state.document.isDeleted &&
            !deletedDriveDocIds.has(doc.header.id)
          ) {
            const state = doc.state.global;
            if (state.resourceTemplateId) {
              const templateOk = await isResourceTemplateVisibleForQuery(
                reactorClient,
                state.resourceTemplateId,
                deletedDriveDocIds,
              );
              if (!templateOk) {
                return [];
              }
            }
            if (status && status.length > 0 && !status.includes(state.status)) {
              return [];
            }
            if (operatorId && state.operatorId !== operatorId) {
              return [];
            }
            if (
              resourceTemplateId &&
              state.resourceTemplateId !== resourceTemplateId
            ) {
              return [];
            }
            const tplState = await getResourceTemplateState(
              reactorClient,
              state.resourceTemplateId,
            );
            return [mapServiceOfferingState(state, doc, tplState)];
          }
        } catch {
          // Document not found
        }
        return [];
      }

      const visibleTemplateIds = await getVisibleResourceTemplateIdSet(
        reactorClient,
        deletedDriveDocIds,
      );

      // Pre-fetch all resource template states for merging
      const templateStateCache =
        await getResourceTemplateStateMap(reactorClient);

      // Find all service offering documents
      const { results: docs } = await reactorClient.find({
        type: "powerhouse/service-offering",
      });

      const serviceOfferings: ReturnType<typeof mapServiceOfferingState>[] = [];

      for (const doc of docs) {
        // Skip docs from soft-deleted drives or soft-deleted documents
        if (deletedDriveDocIds.has(doc.header.id)) continue;
        if (doc.state.document.isDeleted) continue;

        const offeringDoc = doc as ServiceOfferingDocument;
        const state = offeringDoc.state.global;

        // Skip documents missing required fields
        if (!state.operatorId) continue;

        // Match resourceTemplates: only surface offerings whose template is queryable
        if (
          state.resourceTemplateId &&
          !visibleTemplateIds.has(state.resourceTemplateId)
        ) {
          continue;
        }

        // Apply status filter if provided
        if (status && status.length > 0 && !status.includes(state.status)) {
          continue;
        }

        // Apply operatorId filter if provided
        if (operatorId && state.operatorId !== operatorId) {
          continue;
        }

        // Apply resourceTemplateId filter if provided
        if (
          resourceTemplateId &&
          state.resourceTemplateId !== resourceTemplateId
        ) {
          continue;
        }

        const tplState = state.resourceTemplateId
          ? (templateStateCache.get(state.resourceTemplateId) ?? null)
          : null;
        serviceOfferings.push(mapServiceOfferingState(state, doc, tplState));
      }

      return serviceOfferings;
    },

    getBuilderDrives: async (
      _: unknown,
      args: { filter: GetBuilderDrivesFilter },
    ) => {
      const ethereumAddress = args.filter.ethereumAddress;
      if (!ethereumAddress) return [];
      const target = ethereumAddress.toLowerCase();

      const deletedDriveDocIds = await getDeletedDriveDocIds(reactorClient);

      const { results: profileDocs } = await reactorClient.find({
        type: "powerhouse/builder-profile",
      });

      const matchingProfileIds = new Set<string>();
      for (const doc of profileDocs) {
        if (doc.state.document.isDeleted) continue;
        if (deletedDriveDocIds.has(doc.header.id)) continue;
        const profile = doc as BuilderProfileDocument;
        const addr = profile.state.global.walletAddress;
        if (typeof addr === "string" && addr.toLowerCase() === target) {
          matchingProfileIds.add(doc.header.id);
        }
      }

      if (matchingProfileIds.size === 0) return [];

      const { results: drives } = await reactorClient.find({
        type: "powerhouse/document-drive",
      });

      const out: {
        driveId: string;
        driveSlug: string;
        driveName: string;
        driveLink: string;
      }[] = [];

      for (const drive of drives) {
        if (drive.state.document.isDeleted) continue;
        const driveDoc = drive as DocumentDriveDocument;
        const hasMatch = driveDoc.state.global.nodes.some(
          (node: Node) =>
            node.kind === "file" && matchingProfileIds.has(node.id),
        );
        if (!hasMatch) continue;

        const slug = driveDoc.header.slug || driveDoc.header.id;
        out.push({
          driveId: driveDoc.header.id,
          driveSlug: slug,
          driveName: driveDoc.state.global.name || slug,
          driveLink: getDriveLink(slug),
        });
      }

      return out;
    },
  };
}
