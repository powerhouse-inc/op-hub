import type { IReactorClient } from "@powerhousedao/reactor";
import type { DocumentDriveDocument } from "@powerhousedao/shared/document-drive";

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
 * Returns the wallet address of the drive owner (first signed operation), or null.
 */
export async function getDriveOwner(
  reactorClient: IReactorClient,
  driveId: string,
): Promise<string | null> {
  try {
    const { results: ops } = await reactorClient.getOperations(driveId);
    const firstSigned = ops
      .map((op) => ({
        index: op.index,
        address: (
          op as unknown as {
            action?: { context?: { signer?: { user?: { address?: string } } } };
          }
        ).action?.context?.signer?.user?.address,
      }))
      // CREATE_DOCUMENT / UPGRADE_DOCUMENT carry an EMPTY-STRING `user.address`
      // (only the session did:key), not an absent one — so guard on length, not
      // just `typeof === "string"`, or the genesis op wins and owner is "".
      .filter(
        (o): o is { index: number; address: string } =>
          typeof o.address === "string" && o.address.length > 0,
      )
      .sort((a, b) => a.index - b.index)[0];
    return firstSigned?.address.toLowerCase() ?? null;
  } catch {
    return null;
  }
}
