import type { BaseSubgraph } from "@powerhousedao/reactor-api";
import type { PHDocument } from "document-model";
import type { IReactorClient } from "@powerhousedao/reactor";
import type {
  ResourceTemplateDocument,
  TemplateStatus,
} from "document-models/resource-template";
import type {
  ServiceOfferingDocument,
  ServiceStatus,
  BillingCycle,
} from "document-models/service-offering";
import {
  getUserSelectionPriceBreakdown,
  type UserSelection,
  type PriceBreakdown,
} from "document-models/service-offering";
import { generateId } from "document-model/core";
import {
  addFile,
  addFolder,
  driveCreateDocument,
} from "@powerhousedao/shared/document-drive";
import type {
  DocumentDriveDocument,
  FileNode,
  Node,
} from "@powerhousedao/shared/document-drive";
import {
  actions as builderProfileActions,
  type BuilderProfileDocument,
  type SetWalletAddressAction,
  type UpdateProfileAction,
} from "document-models/builder-profile";
import { ResourceInstance } from "document-models/resource-instance";
import { SubscriptionInstance } from "document-models/subscription-instance";
import { mapOfferingToSubscription } from "../../editors/subscription-instance-editor/components/mapOfferingToSubscription.js";

// Filter types
interface ResourceTemplatesFilter {
  id?: string;
  status?: TemplateStatus[];
  operatorId?: string;
}

interface ServiceOfferingsFilter {
  id?: string;
  status?: ServiceStatus[];
  operatorId?: string;
  resourceTemplateId?: string;
}

interface BillingCycleOverrideInput {
  groupId: string;
  billingCycle: string;
}

interface UserSelectionInput {
  tierId: string;
  billingCycle: string;
  optionGroupIds: string[];
  groupBillingCycleOverrides?: BillingCycleOverrideInput[];
  addonBillingCycleOverrides?: BillingCycleOverrideInput[];
}

interface CreateProductInstancesInput {
  serviceOfferingId: string;
  name: string;
  teamName: string;
  ethereumAddress: string;
  customerEmail?: string;
  userSelection: UserSelectionInput;
}

interface GetBuilderDrivesFilter {
  ethereumAddress: string;
}

type UserRole = "BUILDER" | "OPERATOR";

interface CreateUserDriveInput {
  role: UserRole;
  user: string;
  name?: string | null;
  teamName?: string | null;
}

export const getResolvers = (
  subgraph: BaseSubgraph,
): Record<string, unknown> => {
  const reactorClient = subgraph.reactorClient;

  return {
    Query: {
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
              if (
                status &&
                status.length > 0 &&
                !status.includes(state.status)
              ) {
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
        const { id, status, operatorId, resourceTemplateId } =
          args.filter || {};
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
              if (
                status &&
                status.length > 0 &&
                !status.includes(state.status)
              ) {
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

        const serviceOfferings: ReturnType<typeof mapServiceOfferingState>[] =
          [];

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
    },
    Mutation: {
      createProductInstances: async (
        _: unknown,
        args: { input: CreateProductInstancesInput },
      ) => {
        const { input } = args;
        const {
          serviceOfferingId,
          name,
          teamName,
          ethereumAddress,
          customerEmail,
        } = input;

        if (!ethereumAddress) {
          return {
            success: false,
            data: null,
            errors: ["Ethereum address is required"],
          };
        }

        // Validate input
        if (!serviceOfferingId) {
          return {
            success: false,
            data: null,
            errors: ["Service offering ID is required"],
          };
        }

        if (!name) {
          return { success: false, data: null, errors: ["Name is required"] };
        }

        if (!teamName) {
          return {
            success: false,
            data: null,
            errors: ["Team name is required"],
          };
        }

        // Validate name lengths
        if (name.length > 64) {
          return {
            success: false,
            data: null,
            errors: ["Name must be 64 characters or less"],
          };
        }

        if (teamName.length > 64) {
          return {
            success: false,
            data: null,
            errors: ["Team name must be 64 characters or less"],
          };
        }

        // Validate names contain only allowed characters (letters, numbers, spaces, hyphens, underscores)
        const validNamePattern = /^[a-zA-Z0-9 _-]+$/;

        if (!validNamePattern.test(name)) {
          return {
            success: false,
            data: null,
            errors: [
              "Name can only contain letters, numbers, spaces, hyphens, and underscores",
            ],
          };
        }

        if (!validNamePattern.test(teamName)) {
          return {
            success: false,
            data: null,
            errors: [
              "Team name can only contain letters, numbers, spaces, hyphens, and underscores",
            ],
          };
        }

        const { userSelection } = input;

        if (!userSelection.tierId) {
          return {
            success: false,
            data: null,
            errors: ["Tier ID is required in user selection"],
          };
        }

        if (!userSelection.billingCycle) {
          return {
            success: false,
            data: null,
            errors: ["Billing cycle is required in user selection"],
          };
        }

        // Fetch the service offering
        const deletedDriveDocIds = await getDeletedDriveDocIds(reactorClient);
        const serviceOfferingDoc =
          await reactorClient.get<ServiceOfferingDocument>(serviceOfferingId);
        if (
          (serviceOfferingDoc as PHDocument).state.document.isDeleted ||
          deletedDriveDocIds.has(serviceOfferingDoc.header.id)
        ) {
          return {
            success: false,
            data: null,
            errors: ["Service offering not found"],
          };
        }

        const serviceOfferingState = serviceOfferingDoc.state.global;
        const resourceTemplateId = serviceOfferingState.resourceTemplateId;
        if (!resourceTemplateId) {
          return {
            success: false,
            data: null,
            errors: ["Service offering has no associated resource template"],
          };
        }

        // Convert GraphQL overrides to Record<string, BillingCycle>
        const groupBillingCycleOverrides: Record<string, BillingCycle> = {};
        for (const o of userSelection.groupBillingCycleOverrides ?? []) {
          groupBillingCycleOverrides[o.groupId] =
            o.billingCycle as BillingCycle;
        }
        const addonBillingCycleOverrides: Record<string, BillingCycle> = {};
        for (const o of userSelection.addonBillingCycleOverrides ?? []) {
          addonBillingCycleOverrides[o.groupId] =
            o.billingCycle as BillingCycle;
        }

        // Compute price breakdown from user selection
        const selection: UserSelection = {
          tierId: userSelection.tierId,
          billingCycle: userSelection.billingCycle as BillingCycle,
          optionGroupIds: userSelection.optionGroupIds,
          groupBillingCycleOverrides,
          addonBillingCycleOverrides,
        };

        let priceBreakdown: PriceBreakdown;
        try {
          priceBreakdown = getUserSelectionPriceBreakdown(
            serviceOfferingDoc.state,
            selection,
          );
        } catch (error) {
          return {
            success: false,
            data: null,
            errors: [
              error instanceof Error
                ? error.message
                : "Failed to compute price breakdown from user selection",
            ],
          };
        }

        // Sanitize names for use as drive id/slug: lowercase, trim, collapse whitespace, replace spaces with hyphens
        const parsedTeamName = teamName
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/_/g, "-");

        // Reuse path: if this wallet already owns a builder-team-admin drive,
        // skip drive + profile creation and place the new instance docs into
        // that existing workspace. The slug-conflict check below only applies
        // when we're creating a new drive.
        const existingWorkspace = await findUserBuilderTeamAdminDrive(
          reactorClient,
          ethereumAddress,
        );

        if (!existingWorkspace) {
          // Pre-flight: bail out if a drive with this slug already exists.
          // Without this the reactor would happily create a second drive with
          // the same slug (the underlying ID is unique, the slug is not) and
          // we'd silently produce a duplicate team workspace.
          const existing = await findDriveBySlug(reactorClient, parsedTeamName);
          if (existing) {
            return {
              success: false,
              data: null,
              errors: [
                `A team workspace with slug "${parsedTeamName}" already exists. Pick a different team name.`,
              ],
            };
          }
        }

        // Track resources created during this mutation so we can roll them
        // back if a later step fails. Only the brand-new-drive path populates
        // this; the reuse path doesn't create a drive.
        let createdDriveId: string | undefined;

        try {
          let driveId: string;
          let builderProfileId: string;

          if (existingWorkspace) {
            driveId = existingWorkspace.driveId;
            builderProfileId = existingWorkspace.builderProfileId;
          } else {
            // create team-builder-admin drive
            const driveDoc = driveCreateDocument();
            driveDoc.header.name = teamName;
            driveDoc.state.global.name = teamName;
            driveDoc.state.global.icon =
              "https://cdn-icons-png.flaticon.com/512/6020/6020347.png";
            driveDoc.header.slug = parsedTeamName;
            if (!driveDoc.header.meta) driveDoc.header.meta = {};
            driveDoc.header.meta.preferredEditor = "builder-team-admin";
            const teamBuilderAdminDrive =
              await reactorClient.create<DocumentDriveDocument>(driveDoc);
            driveId = teamBuilderAdminDrive.header.id;
            createdDriveId = driveId;

            // create builder profile as a child of the new drive
            const builderProfileDoc = await reactorClient.createEmpty(
              "powerhouse/builder-profile",
              { parentIdentifier: driveId },
            );
            builderProfileId = builderProfileDoc.header.id;
            await reactorClient.addRelationship(
              driveId,
              builderProfileId,
              "child",
            );
          }

          // Common: create the two instance docs as children of the
          // (existing or just-created) team drive.
          const resourceInstanceDoc = await reactorClient.createEmpty(
            "powerhouse/resource-instance",
            { parentIdentifier: driveId },
          );
          const subscriptionInstanceDoc = await reactorClient.createEmpty(
            "powerhouse/subscription-instance",
            { parentIdentifier: driveId },
          );

          // Wire the relationship index so Connect's drive-sync pulls the
          // new documents into the drive's view. ADD_FILE alone updates the
          // drive's nodes array but without the explicit parent→child
          // relationship the docs render as orphans and never appear in the
          // drive UI.
          await Promise.all([
            reactorClient.addRelationship(
              driveId,
              resourceInstanceDoc.header.id,
              "child",
            ),
            reactorClient.addRelationship(
              driveId,
              subscriptionInstanceDoc.header.id,
              "child",
            ),
          ]);

          // Find or create the "Service Subscriptions" folder in the team
          // drive. New-drive path always creates it; reuse path checks
          // whether one already exists in the existing drive's nodes.
          let teamServiceSubsFolderId: string | undefined;
          if (existingWorkspace) {
            const existingDriveDoc =
              await reactorClient.get<DocumentDriveDocument>(driveId);
            teamServiceSubsFolderId = existingDriveDoc.state.global.nodes.find(
              (node: Node) =>
                node.kind === "folder" && node.name === "Service Subscriptions",
            )?.id;
          }

          const teamDriveActions: Array<
            ReturnType<typeof addFolder | typeof addFile>
          > = [];
          if (!teamServiceSubsFolderId) {
            teamServiceSubsFolderId = generateId();
            teamDriveActions.push(
              addFolder({
                id: teamServiceSubsFolderId,
                name: "Service Subscriptions",
              }),
            );
          }
          if (!existingWorkspace) {
            // Only the new-drive path adds the builder profile to the file
            // tree — the reuse path's profile is already there.
            teamDriveActions.push(
              addFile({
                documentType: "powerhouse/builder-profile",
                id: builderProfileId,
                name: `${parsedTeamName} Builder Profile`,
              }),
            );
          }
          teamDriveActions.push(
            addFile({
              documentType: "powerhouse/resource-instance",
              id: resourceInstanceDoc.header.id,
              name: `${parsedTeamName} Resource Instance`,
              parentFolder: teamServiceSubsFolderId,
            }),
            addFile({
              documentType: "powerhouse/subscription-instance",
              id: subscriptionInstanceDoc.header.id,
              name: `${parsedTeamName} Subscription Instance`,
              parentFolder: teamServiceSubsFolderId,
            }),
          );
          await reactorClient.execute(driveId, "main", teamDriveActions);

          if (!existingWorkspace) {
            // Only the new-drive path updates the builder profile. In the
            // reuse path the profile already has the correct wallet (we
            // matched on it) and we don't want to clobber its display name.
            const updateAction: UpdateProfileAction =
              builderProfileActions.updateProfile({ name: parsedTeamName });
            const walletAction: SetWalletAddressAction =
              builderProfileActions.setWalletAddress({
                walletAddress: ethereumAddress,
              });
            await reactorClient.execute(builderProfileId, "main", [
              updateAction,
              walletAction,
            ]);
          }

          // find operator drive and add references there too
          const operatorDrive = await getOperatorDrive(
            reactorClient,
            resourceTemplateId,
          );
          if (!operatorDrive) {
            throw new Error(
              `Operator drive not found for resource template ${resourceTemplateId}`,
            );
          }

          // get operator profile id from operator drive
          const operatorProfileId = operatorDrive.state.global.nodes
            .filter((node: Node): node is FileNode => node.kind === "file")
            .find(
              (node: FileNode) =>
                node.documentType === "powerhouse/builder-profile",
            )?.id;

          if (!operatorProfileId) {
            throw new Error(
              `Operator profile not found for drive ${operatorDrive.header.id}`,
            );
          }

          // find or create "Service Subscriptions" folder in the operator drive
          let serviceSubscriptionsFolderId =
            operatorDrive.state.global.nodes.find(
              (node: Node) =>
                node.kind === "folder" && node.name === "Service Subscriptions",
            )?.id;

          if (!serviceSubscriptionsFolderId) {
            serviceSubscriptionsFolderId = generateId();
            await reactorClient.execute(operatorDrive.header.id, "main", [
              addFolder({
                id: serviceSubscriptionsFolderId,
                name: "Service Subscriptions",
              }),
            ]);
          }

          // create a team folder inside "Service Subscriptions" for this team's docs
          const teamFolderId = generateId();

          // Add reactor-level relationships so Connect syncs the child
          // documents (createEmpty guarantees CREATE_DOCUMENT is persisted
          // before this runs). Run both in parallel — they target different
          // child IDs and don't depend on each other.
          await Promise.all([
            reactorClient.addRelationship(
              operatorDrive.header.id,
              resourceInstanceDoc.header.id,
              "child",
            ),
            reactorClient.addRelationship(
              operatorDrive.header.id,
              subscriptionInstanceDoc.header.id,
              "child",
            ),
          ]);

          // add team folder and file references to operator drive
          await reactorClient.execute(operatorDrive.header.id, "main", [
            addFolder({
              id: teamFolderId,
              name: teamName,
              parentFolder: serviceSubscriptionsFolderId,
            }),
            addFile({
              documentType: "powerhouse/resource-instance",
              id: resourceInstanceDoc.header.id,
              name: `${parsedTeamName} Resource Instance`,
              parentFolder: teamFolderId,
            }),
            addFile({
              documentType: "powerhouse/subscription-instance",
              id: subscriptionInstanceDoc.header.id,
              name: `${parsedTeamName} Subscription Instance`,
              parentFolder: teamFolderId,
            }),
          ]);

          // populate documents after all files are added to both drives
          await populateResourceInstance(
            reactorClient,
            resourceInstanceDoc.header.id,
            resourceTemplateId,
            operatorProfileId, // operator profile id
            builderProfileId, // customer id
            parsedTeamName, // customer name from builder profile
          );

          const now = new Date().toISOString();

          const subscriptionInput = mapOfferingToSubscription({
            offering: serviceOfferingState,
            tierId: selection.tierId,
            selectedBillingCycle: selection.billingCycle,
            customerId: builderProfileId,
            customerName: name,
            customerEmail,
            createdAt: now,
            priceBreakdown,
          });

          await reactorClient.execute(
            subscriptionInstanceDoc.header.id,
            "main",
            [
              SubscriptionInstance.actions.initializeSubscription({
                ...subscriptionInput,
                resourceId: resourceInstanceDoc.header.id,
                resourceLabel: parsedTeamName,
                resourceThumbnailUrl: serviceOfferingState.thumbnailUrl,
              }),
            ],
          );

          // Billing projection removed (D-3): totalDebt/totalCredit are now
          // initialized by the activateSubscription reducer, not by a separate
          // billing projection operation. The projection is a derived value
          // via calculateUnsettledBill().

          return {
            success: true,
            data: {
              linkToDrive: getDriveLink(parsedTeamName),
            },
            errors: [],
          };
        } catch (error) {
          console.error("Failed to create product instances:", error);

          // Best-effort rollback: drop the team drive we created so we
          // don't leave a half-wired workspace behind. The 3 child docs
          // were created via `createEmpty(..., { parentIdentifier: driveId })`
          // and are cleaned up by the drive deletion's cascade. Any
          // references already added to the operator drive will dangle
          // and need manual cleanup — that's a narrow edge case (failure
          // strictly between operator-drive writes and the final
          // initializeSubscription).
          if (createdDriveId) {
            try {
              await reactorClient.deleteDocument(createdDriveId);
            } catch (cleanupError) {
              console.error(
                `Rollback failed: could not delete team drive ${createdDriveId}`,
                cleanupError,
              );
            }
          }

          return {
            success: false,
            data: null,
            errors: [
              error instanceof Error
                ? error.message
                : "An unexpected error occurred",
            ],
          };
        }
      },

      createUserDrive: async (
        _: unknown,
        args: { input: CreateUserDriveInput },
      ) => {
        const { role, user, name, teamName } = args.input;

        if (!user) {
          return {
            success: false,
            data: null,
            errors: ["Ethereum address is required"],
          };
        }
        // role is constrained to the UserRole enum by GraphQL — no runtime
        // check needed.

        // Slug + display-name derivation. teamName wins, then name, then a
        // stable address-derived fallback so we never produce an empty slug.
        const addrSuffix = user.replace(/^0x/i, "").slice(0, 8).toLowerCase();
        const slugify = (value: string) =>
          value
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/_/g, "-")
            .replace(/[^a-z0-9-]/g, "");

        const trimmedTeamName = teamName?.trim() || "";
        const trimmedName = name?.trim() || "";
        const baseDisplayName =
          trimmedTeamName || trimmedName || `User ${addrSuffix}`;
        const baseSlug =
          slugify(trimmedTeamName) ||
          slugify(trimmedName) ||
          `user-${addrSuffix}`;
        const profileDisplayName =
          trimmedName || trimmedTeamName || `User ${addrSuffix}`;

        const isOperator = role === "OPERATOR";

        // Idempotency: refuse if any non-deleted builder profile already
        // points at this wallet address. Same matching logic as
        // getBuilderDrives so the two views agree on "user has a drive".
        const target = user.toLowerCase();
        const deletedDriveDocIds = await getDeletedDriveDocIds(reactorClient);
        const { results: profileDocs } = await reactorClient.find({
          type: "powerhouse/builder-profile",
        });
        for (const doc of profileDocs) {
          if (doc.state.document.isDeleted) continue;
          if (deletedDriveDocIds.has(doc.header.id)) continue;
          const profile = doc as BuilderProfileDocument;
          const addr = profile.state.global.walletAddress;
          if (typeof addr === "string" && addr.toLowerCase() === target) {
            return {
              success: false,
              data: null,
              errors: [
                `A drive for wallet ${user} already exists. Use the existing workspace.`,
              ],
            };
          }
        }

        // Pre-flight slug conflict checks. The reactor will accept a duplicate
        // slug (id is unique, slug is not) so we have to guard explicitly.
        const primaryExisting = await findDriveBySlug(reactorClient, baseSlug);
        if (primaryExisting) {
          return {
            success: false,
            data: null,
            errors: [
              `A drive with slug "${baseSlug}" already exists. Pick a different team or display name.`,
            ],
          };
        }
        const offeringSlug = `${baseSlug}-services`;
        if (isOperator) {
          const offeringExisting = await findDriveBySlug(
            reactorClient,
            offeringSlug,
          );
          if (offeringExisting) {
            return {
              success: false,
              data: null,
              errors: [
                `A drive with slug "${offeringSlug}" already exists. Pick a different team or display name.`,
              ],
            };
          }
        }

        const createdDriveIds: string[] = [];
        const drives: {
          driveId: string;
          driveSlug: string;
          driveName: string;
          driveLink: string;
        }[] = [];

        try {
          // ── Primary drive: builder-team-admin ──────────────────────────
          const primaryDriveDoc = driveCreateDocument();
          primaryDriveDoc.header.name = baseDisplayName;
          primaryDriveDoc.state.global.name = baseDisplayName;
          primaryDriveDoc.header.slug = baseSlug;
          if (!primaryDriveDoc.header.meta) primaryDriveDoc.header.meta = {};
          primaryDriveDoc.header.meta.preferredEditor = "builder-team-admin";
          const primaryDrive =
            await reactorClient.create<DocumentDriveDocument>(primaryDriveDoc);
          createdDriveIds.push(primaryDrive.header.id);

          // Builder profile inside the primary drive
          const builderProfileDoc = await reactorClient.createEmpty(
            "powerhouse/builder-profile",
            { parentIdentifier: primaryDrive.header.id },
          );
          await reactorClient.addRelationship(
            primaryDrive.header.id,
            builderProfileDoc.header.id,
            "child",
          );
          await reactorClient.execute(primaryDrive.header.id, "main", [
            addFile({
              documentType: "powerhouse/builder-profile",
              id: builderProfileDoc.header.id,
              name: `${baseSlug} Builder Profile`,
            }),
          ]);

          // Dispatch profile actions: name/slug → wallet. isOperator stays
          // false on the profile for both roles — OPERATOR is distinguished
          // only by getting the extra service-offering-app drive below.
          const profileActions: Array<
            UpdateProfileAction | SetWalletAddressAction
          > = [
            builderProfileActions.updateProfile({
              name: profileDisplayName,
              slug: baseSlug,
            }),
            builderProfileActions.setWalletAddress({ walletAddress: user }),
          ];
          await reactorClient.execute(
            builderProfileDoc.header.id,
            "main",
            profileActions,
          );

          drives.push({
            driveId: primaryDrive.header.id,
            driveSlug: baseSlug,
            driveName: baseDisplayName,
            driveLink: getDriveLink(baseSlug),
          });

          // ── Operator-only second drive: service-offering-app ───────────
          if (isOperator) {
            const offeringDisplayName = `${baseDisplayName} Services`;
            const offeringDriveDoc = driveCreateDocument();
            offeringDriveDoc.header.name = offeringDisplayName;
            offeringDriveDoc.state.global.name = offeringDisplayName;
            offeringDriveDoc.header.slug = offeringSlug;
            if (!offeringDriveDoc.header.meta)
              offeringDriveDoc.header.meta = {};
            offeringDriveDoc.header.meta.preferredEditor =
              "service-offering-app";
            const offeringDrive =
              await reactorClient.create<DocumentDriveDocument>(
                offeringDriveDoc,
              );
            createdDriveIds.push(offeringDrive.header.id);

            drives.push({
              driveId: offeringDrive.header.id,
              driveSlug: offeringSlug,
              driveName: offeringDisplayName,
              driveLink: getDriveLink(offeringSlug),
            });
          }

          return { success: true, data: { drives }, errors: [] };
        } catch (error) {
          console.error("createUserDrive failed:", error);
          // Roll back any drives we created so we don't leave a half-wired
          // workspace behind.
          for (const id of createdDriveIds) {
            try {
              await reactorClient.deleteDocument(id);
            } catch (cleanupError) {
              console.error(
                `Rollback failed: could not delete drive ${id}`,
                cleanupError,
              );
            }
          }
          return {
            success: false,
            data: null,
            errors: [
              error instanceof Error
                ? error.message
                : "An unexpected error occurred",
            ],
          };
        }
      },
    },
  };
};

// Stable sort to mirror TheMatrix editor view:
//   1. Group services by `optionGroupId` (ungrouped services last).
//   2. Within each group, sort by `displayOrder` ascending; nulls sink to the
//      bottom of the group.
//   3. Ties fall back to the original array index so the result is deterministic.
//
// The matrix uses `displayOrder` as a *within-group* sort key, so the same
// numeric value can appear in multiple groups. A global `displayOrder`-only
// sort interleaves groups, which is what the user reported.
function byOptionGroupAndDisplayOrder<
  T extends {
    displayOrder?: number | null;
    optionGroupId?: string | null;
  },
>(items: readonly T[], optionGroups: readonly { id: string }[] = []): T[] {
  const groupRank = new Map<string, number>();
  optionGroups.forEach((g, i) => groupRank.set(g.id, i));
  const ungroupedRank = optionGroups.length;
  const rankOf = (gid: string | null | undefined) =>
    gid && groupRank.has(gid) ? groupRank.get(gid)! : ungroupedRank;

  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const ga = rankOf(a.item.optionGroupId);
      const gb = rankOf(b.item.optionGroupId);
      if (ga !== gb) return ga - gb;
      const ao = a.item.displayOrder;
      const bo = b.item.displayOrder;
      if (ao == null && bo == null) return a.index - b.index;
      if (ao == null) return 1;
      if (bo == null) return -1;
      if (ao !== bo) return ao - bo;
      return a.index - b.index;
    })
    .map(({ item }) => item);
}

// Drive link base URLs. Read from env so the deployment tells the process
// where it lives (containers can't introspect their public hostname). Local
// dev leaves them unset and gets localhost.
const DEFAULT_CONNECT_URL = "http://localhost:3001";
const DEFAULT_SWITCHBOARD_URL = "http://localhost:4001";

function getDriveLink(driveSlug: string): string {
  const connect = (process.env.PH_CONNECT_URL ?? DEFAULT_CONNECT_URL).replace(
    /\/$/,
    "",
  );
  const switchboard = (
    process.env.PH_SWITCHBOARD_URL ?? DEFAULT_SWITCHBOARD_URL
  ).replace(/\/$/, "");
  return `${connect}/?driveUrl=${switchboard}/d/${driveSlug}`;
}

/**
 * Map ResourceTemplateState from document model to GraphQL response
 */
function mapResourceTemplateState(
  state: ResourceTemplateDocument["state"]["global"],
  doc: PHDocument,
) {
  return {
    id: doc.header.id,
    operatorId: state.operatorId,
    title: state.title,
    summary: state.summary,
    description: state.description || null,
    thumbnailUrl: state.thumbnailUrl || null,
    infoLink: state.infoLink || null,
    status: state.status,
    lastModified: state.lastModified,
    targetAudiences: (state.targetAudiences || []).map((audience) => ({
      id: audience.id,
      label: audience.label,
      color: audience.color || null,
    })),
    setupServices: state.setupServices || [],
    recurringServices: state.recurringServices || [],
    facetTargets: (state.facetTargets || []).map((facet) => ({
      id: facet.id,
      categoryKey: facet.categoryKey,
      categoryLabel: facet.categoryLabel,
      selectedOptions: facet.selectedOptions || [],
    })),
    services: byOptionGroupAndDisplayOrder(
      state.services || [],
      state.optionGroups || [],
    ).map((service) => ({
      id: service.id,
      title: service.title,
      description: service.description || null,
      displayOrder: service.displayOrder ?? null,
      parentServiceId: service.parentServiceId || null,
      isSetupFormation: service.isSetupFormation,
      optionGroupId: service.optionGroupId || null,
      facetBindings: (service.facetBindings || []).map((binding) => ({
        id: binding.id,
        facetName: binding.facetName,
        facetType: binding.facetType,
        supportedOptions: binding.supportedOptions || [],
      })),
    })),
    optionGroups: (state.optionGroups || []).map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description || null,
      isAddOn: group.isAddOn,
      defaultSelected: group.defaultSelected,
    })),
    faqFields: (state.faqFields || []).map((faq) => ({
      id: faq.id,
      question: faq.question || null,
      answer: faq.answer || null,
      displayOrder: faq.displayOrder,
    })),
    contentSections: (state.contentSections || []).map((section) => ({
      id: section.id,
      title: section.title,
      content: section.content,
      displayOrder: section.displayOrder,
    })),
    weight: state.weight ?? null,
    subtitle: state.subtitle || null,
  };
}

/**
 * Populate a resource-instance document with data from a resource-template.
 * Initializes basic info and sets facet configuration from template facetTargets.
 */
async function populateResourceInstance(
  reactorClient: IReactorClient,
  resourceInstanceDocId: string,
  resourceTemplateId: string,
  operatorId: string,
  customerId: string,
  customerName: string,
) {
  const resourceTemplateDoc =
    await reactorClient.get<ResourceTemplateDocument>(resourceTemplateId);
  if (!resourceTemplateDoc) return;

  const templateState = resourceTemplateDoc.state.global;

  // Initialize instance with basic info from template
  await reactorClient.execute(resourceInstanceDocId, "main", [
    ResourceInstance.actions.initializeInstance({
      operatorId,
      operatorDocumentType: "powerhouse/builder-profile",
      resourceTemplateId,
      customerId,
      customerName,
      templateName: templateState.title,
      thumbnailUrl: templateState.thumbnailUrl,
      infoLink: templateState.infoLink,
      description: templateState.description,
    }),
  ]);

  // Populate facet configuration from template's facetTargets
  for (const facetTarget of templateState.facetTargets) {
    if (facetTarget.selectedOptions.length > 0) {
      await reactorClient.execute(resourceInstanceDocId, "main", [
        ResourceInstance.actions.setInstanceFacet({
          id: facetTarget.id,
          categoryKey: facetTarget.categoryKey,
          categoryLabel: facetTarget.categoryLabel,
          selectedOption: facetTarget.selectedOptions[0],
        }),
      ]);
    }
  }
}

/**
 * Map a DiscountRule to the GraphQL shape, or null
 */
function mapDiscountRule(
  rule: { discountType: string; discountValue: number } | null | undefined,
) {
  if (!rule) return null;
  return {
    discountType: rule.discountType,
    discountValue: rule.discountValue,
  };
}

/**
 * Map ServiceOfferingState from document model to GraphQL response
 */
function mapServiceOfferingState(
  state: ServiceOfferingDocument["state"]["global"],
  doc: PHDocument,
  templateState?: ResourceTemplateDocument["state"]["global"] | null,
) {
  return {
    id: doc.header.id,
    operatorId: state.operatorId,
    resourceTemplateId: state.resourceTemplateId || null,
    title: templateState?.title || state.title,
    summary: templateState?.summary || state.summary,
    description: templateState?.description || state.description || null,
    thumbnailUrl: templateState?.thumbnailUrl || state.thumbnailUrl || null,
    infoLink: templateState?.infoLink || state.infoLink || null,
    status: state.status,
    lastModified: state.lastModified,
    availableBillingCycles: state.availableBillingCycles || [],
    facetTargets: (state.facetTargets || []).map((facet) => ({
      id: facet.id,
      categoryKey: facet.categoryKey,
      categoryLabel: facet.categoryLabel,
      selectedOptions: facet.selectedOptions || [],
    })),
    services: byOptionGroupAndDisplayOrder(
      state.services || [],
      state.optionGroups || [],
    ).map((service) => ({
      id: service.id,
      title: service.title,
      description: service.description || null,
      displayOrder: service.displayOrder ?? null,
      isSetupFormation: service.isSetupFormation,
      optionGroupId: service.optionGroupId || null,
    })),
    tiers: (state.tiers || []).map((tier) => ({
      id: tier.id,
      name: tier.name,
      description: tier.description || null,
      isCustomPricing: tier.isCustomPricing,
      mostPopular: tier.mostPopular,
      excludeFromSetupFee: tier.excludeFromSetupFee ?? false,
      pricingMode: tier.pricingMode || null,
      pricing: {
        amount: tier.pricing?.amount ?? null,
        currency: tier.pricing?.currency ?? "USD",
      },
      defaultBillingCycle: tier.defaultBillingCycle || null,
      billingCycleDiscounts: (tier.billingCycleDiscounts || []).map((d) => ({
        billingCycle: d.billingCycle,
        discountRule: {
          discountType: d.discountRule?.discountType,
          discountValue: d.discountRule?.discountValue,
        },
      })),
      serviceLevels: (tier.serviceLevels || []).map((level) => ({
        id: level.id,
        serviceId: level.serviceId,
        level: level.level,
        customValue: level.customValue || null,
        optionGroupId: level.optionGroupId || null,
      })),
      usageLimits: (tier.usageLimits || []).map((limit) => {
        const legacyReset = (limit as { resetCycle?: string | null })
          .resetCycle;
        const accrualCycle =
          limit.accrualCycle ||
          (legacyReset && legacyReset !== "NONE" ? legacyReset : "MONTHLY");
        return {
          id: limit.id,
          serviceId: limit.serviceId,
          metric: limit.metric,
          unitName: limit.unitName || null,
          freeLimit: limit.freeLimit ?? null,
          paidLimit: limit.paidLimit ?? null,
          metricType: limit.metricType || "NON_CUMULATIVE",
          accrualCycle,
          notes: limit.notes || null,
          unitPrice: limit.unitPrice ?? null,
          unitPriceCurrency: limit.unitPriceCurrency || null,
        };
      }),
    })),
    optionGroups: (state.optionGroups || []).map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description || null,
      isAddOn: group.isAddOn,
      defaultSelected: group.defaultSelected,
      pricingMode: group.pricingMode || null,
      standalonePricing: group.standalonePricing
        ? {
            setupCost: group.standalonePricing.setupCost
              ? {
                  amount: group.standalonePricing.setupCost.amount,
                  currency: group.standalonePricing.setupCost.currency,
                  discount: mapDiscountRule(
                    group.standalonePricing.setupCost.discount,
                  ),
                }
              : null,
            recurringPricing: (
              group.standalonePricing.recurringPricing || []
            ).map((rp) => ({
              id: rp.id,
              billingCycle: rp.billingCycle,
              amount: rp.amount,
              currency: rp.currency,
              discount: mapDiscountRule(rp.discount),
            })),
          }
        : null,
      tierDependentPricing: (group.tierDependentPricing || []).map((tp) => ({
        id: tp.id,
        tierId: tp.tierId,
        setupCost: tp.setupCost
          ? {
              amount: tp.setupCost.amount,
              currency: tp.setupCost.currency,
              discount: mapDiscountRule(tp.setupCost.discount),
            }
          : null,
        setupCostDiscounts: (tp.setupCostDiscounts || []).map((d) => ({
          billingCycle: d.billingCycle,
          discountRule: {
            discountType: d.discountRule?.discountType,
            discountValue: d.discountRule?.discountValue,
          },
        })),
        recurringPricing: (tp.recurringPricing || []).map((rp) => ({
          id: rp.id,
          billingCycle: rp.billingCycle,
          amount: rp.amount,
          currency: rp.currency,
          discount: mapDiscountRule(rp.discount),
        })),
      })),
      costType: group.costType || null,
      availableBillingCycles: group.availableBillingCycles || [],
      billingCycleDiscounts: (group.billingCycleDiscounts || []).map((d) => ({
        billingCycle: d.billingCycle,
        discountRule: {
          discountType: d.discountRule?.discountType,
          discountValue: d.discountRule?.discountValue,
        },
      })),
      discountMode: group.discountMode || null,
      price: group.price ?? null,
      currency: group.currency || null,
    })),
  };
}

/**
 * Returns a Set of document IDs that belong to soft-deleted drives.
 * Documents inside a deleted drive should not be returned by queries.
 */
async function getDeletedDriveDocIds(
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

/** Same inclusion rules as `resourceTemplates` query (drive deleted, doc deleted, operatorId). */
function resourceTemplatePassesQueryFilters(
  doc: ResourceTemplateDocument,
  deletedDriveDocIds: Set<string>,
): boolean {
  if (deletedDriveDocIds.has(doc.header.id)) return false;
  if (doc.state.document.isDeleted) return false;
  if (!doc.state.global.operatorId) return false;
  return true;
}

async function getVisibleResourceTemplateIdSet(
  reactorClient: IReactorClient,
  deletedDriveDocIds: Set<string>,
): Promise<Set<string>> {
  const { results: docs } = await reactorClient.find({
    type: "powerhouse/resource-template",
  });
  const ids = new Set<string>();
  for (const doc of docs) {
    const rt = doc as ResourceTemplateDocument;
    if (resourceTemplatePassesQueryFilters(rt, deletedDriveDocIds)) {
      ids.add(doc.header.id);
    }
  }
  return ids;
}

async function isResourceTemplateVisibleForQuery(
  reactorClient: IReactorClient,
  resourceTemplateId: string,
  deletedDriveDocIds: Set<string>,
): Promise<boolean> {
  try {
    const doc =
      await reactorClient.get<ResourceTemplateDocument>(resourceTemplateId);
    if (doc.header.documentType !== "powerhouse/resource-template") {
      return false;
    }
    return resourceTemplatePassesQueryFilters(doc, deletedDriveDocIds);
  } catch {
    return false;
  }
}

/**
 * Fetch a single resource template's global state by ID.
 * Returns null if the document cannot be found.
 */
async function getResourceTemplateState(
  reactorClient: IReactorClient,
  resourceTemplateId: string | null | undefined,
): Promise<ResourceTemplateDocument["state"]["global"] | null> {
  if (!resourceTemplateId) return null;
  try {
    const doc =
      await reactorClient.get<ResourceTemplateDocument>(resourceTemplateId);
    if (doc.header.documentType !== "powerhouse/resource-template") return null;
    return doc.state.global;
  } catch {
    return null;
  }
}

/**
 * Build a map of all resource template IDs to their global state.
 * Used to enrich service offering responses with live template data.
 */
async function getResourceTemplateStateMap(
  reactorClient: IReactorClient,
): Promise<Map<string, ResourceTemplateDocument["state"]["global"]>> {
  const { results: docs } = await reactorClient.find({
    type: "powerhouse/resource-template",
  });
  const map = new Map<string, ResourceTemplateDocument["state"]["global"]>();
  for (const doc of docs) {
    const rt = doc as ResourceTemplateDocument;
    map.set(doc.header.id, rt.state.global);
  }
  return map;
}

/**
 * Look up a drive by its slug. Used by createProductInstances as a pre-flight
 * idempotency guard before creating a new team workspace.
 */
async function findDriveBySlug(
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
async function findUserBuilderTeamAdminDrive(
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

async function getOperatorDrive(
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
