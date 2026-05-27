import type { IReactorClient } from "@powerhousedao/reactor";
import type { PHDocument } from "document-model";
import type {
  DocumentDriveDocument,
  FileNode,
  Node,
} from "@powerhousedao/shared/document-drive";
import type { BuilderProfileDocument } from "document-models/builder-profile/v1";

/**
 * Returns a Set of document IDs that belong to soft-deleted drives.
 * Documents inside a deleted drive should not be returned by queries.
 */
export async function getDeletedDriveDocIds(
  reactorClient: IReactorClient,
): Promise<Set<string>> {
  const { results: drives } = await reactorClient.find({
    type: "powerhouse/document-drive",
  });

  const ids = new Set<string>();
  for (const drive of drives) {
    if (!drive.state.document.isDeleted) continue;
    const driveDoc = drive as DocumentDriveDocument;
    for (const node of driveDoc.state.global.nodes) {
      if (node.kind === "file") {
        ids.add(node.id);
      }
    }
  }
  return ids;
}

/**
 * Look up a drive by its slug. Used by createProductInstances as a pre-flight
 * idempotency guard before creating a new team workspace.
 */
export async function findDriveBySlug(
  reactorClient: IReactorClient,
  slug: string,
): Promise<DocumentDriveDocument | undefined> {
  const { results: drives } = await reactorClient.find({
    type: "powerhouse/document-drive",
  });
  for (const drive of drives) {
    if (drive.state.document.isDeleted) continue;
    if (drive.header.slug === slug) return drive as DocumentDriveDocument;
  }
  return undefined;
}

/**
 * Locate an existing builder-team-admin drive owned by `walletAddress`.
 *
 * Returns `{ driveId, builderProfileId }` for the first non-deleted drive
 * whose `preferredEditor` is `builder-team-admin` AND that contains a
 * non-deleted builder-profile document whose `walletAddress` matches
 * (case-insensitive). Used by `createProductInstances` to upsert into an
 * existing workspace instead of creating a duplicate one.
 */
export async function findUserBuilderTeamAdminDrive(
  reactorClient: IReactorClient,
  walletAddress: string,
): Promise<{ driveId: string; builderProfileId: string } | undefined> {
  const target = walletAddress.toLowerCase();
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
  if (matchingProfileIds.size === 0) return undefined;

  const { results: drives } = await reactorClient.find({
    type: "powerhouse/document-drive",
  });
  for (const drive of drives) {
    if (drive.state.document.isDeleted) continue;
    const driveDoc = drive as DocumentDriveDocument;
    if (driveDoc.header.meta?.preferredEditor !== "builder-team-admin") {
      continue;
    }
    const profileNode = driveDoc.state.global.nodes
      .filter((node: Node): node is FileNode => node.kind === "file")
      .find(
        (node) =>
          node.documentType === "powerhouse/builder-profile" &&
          matchingProfileIds.has(node.id),
      );
    if (profileNode) {
      return {
        driveId: driveDoc.header.id,
        builderProfileId: profileNode.id,
      };
    }
  }
  return undefined;
}

// Process-scoped cache: resourceTemplateId → operator drive id. Avoids
// re-scanning every drive on each createProductInstances call. Invalidated
// transparently when the cached drive no longer exists or no longer has
// the template as a child.
const operatorDriveCache = new Map<string, string>();

export async function getOperatorDrive(
  reactorClient: IReactorClient,
  resourceTemplateId: string,
): Promise<DocumentDriveDocument | undefined> {
  // Fast path: try the cached drive id first and validate it still owns
  // the template. If validation fails, drop the cache entry and scan.
  const cachedId = operatorDriveCache.get(resourceTemplateId);
  if (cachedId) {
    try {
      const cached = await reactorClient.get<DocumentDriveDocument>(cachedId);
      if (!cached.state.document.isDeleted) {
        const { results: children } =
          await reactorClient.getOutgoingRelationships(cachedId, "child");
        if (
          children.some(
            (child: PHDocument) => child.header.id === resourceTemplateId,
          )
        ) {
          return cached;
        }
      }
    } catch {
      // Fall through to scan; cached drive may have been deleted.
    }
    operatorDriveCache.delete(resourceTemplateId);
  }

  // Slow path: scan every drive looking for one that has the template.
  const { results: drives } = await reactorClient.find({
    type: "powerhouse/document-drive",
  });
  for (const drive of drives) {
    if (drive.state.document.isDeleted) continue;
    const driveDoc = drive as DocumentDriveDocument;
    const { results: children } = await reactorClient.getOutgoingRelationships(
      driveDoc.header.id,
      "child",
    );
    if (
      children.some(
        (child: PHDocument) => child.header.id === resourceTemplateId,
      )
    ) {
      operatorDriveCache.set(resourceTemplateId, driveDoc.header.id);
      return driveDoc;
    }
  }
  return undefined;
}
