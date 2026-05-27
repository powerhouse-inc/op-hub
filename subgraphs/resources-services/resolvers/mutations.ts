import type { PHDocument } from "document-model";
import { generateId } from "document-model/core";
import type { IReactorClient } from "@powerhousedao/reactor";
import {
  addFile,
  addFolder,
  driveCreateDocument,
} from "@powerhousedao/shared/document-drive";
import type {
  DocumentDriveDocument,
  Node,
} from "@powerhousedao/shared/document-drive";
import type { ResourceTemplateDocument } from "document-models/resource-template";
import type {
  ServiceOfferingDocument,
  BillingCycle,
} from "document-models/service-offering";
import {
  getUserSelectionPriceBreakdown,
  type UserSelection,
  type PriceBreakdown,
} from "document-models/service-offering";
import { actions as builderProfileActions } from "document-models/builder-profile";
import type {
  BuilderProfileAction,
  UpdateProfileAction,
} from "document-models/builder-profile";
import { SubscriptionInstance } from "document-models/subscription-instance";
import { mapOfferingToSubscription } from "../../../editors/subscription-instance-editor/components/mapOfferingToSubscription.js";
import type {
  CreateProductInstancesInput,
  CreateUserDriveInput,
} from "./types.js";
import { populateResourceInstance } from "./resource-instance.js";
import {
  getDeletedDriveDocIds,
  findDriveBySlug,
  findUserBuilderTeamAdminDrive,
  getOperatorDrive,
} from "./drive-utils.js";
import { getDriveLink } from "./drive-links.js";

export function createMutationResolvers(reactorClient: IReactorClient) {
  return {
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
        groupBillingCycleOverrides[o.groupId] = o.billingCycle as BillingCycle;
      }
      const addonBillingCycleOverrides: Record<string, BillingCycle> = {};
      for (const o of userSelection.addonBillingCycleOverrides ?? []) {
        addonBillingCycleOverrides[o.groupId] = o.billingCycle as BillingCycle;
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
            "https://www.pngall.com/wp-content/uploads/12/Engineer-Helmet-Equipment-PNG-Image-HD.png";
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
            builderProfileActions.updateProfile({
              name: parsedTeamName,
            });
          await reactorClient.execute(builderProfileId, "main", [
            updateAction,
            builderProfileActions.setWalletAddress({
              walletAddress: ethereumAddress,
            }),
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
        // The operatorProfileId should be fetched from the serviceOfferingId document's state (field: operatorId)
        const serviceOfferingDoc =
          await reactorClient.get<ServiceOfferingDocument>(serviceOfferingId);
        const operatorProfileId = serviceOfferingDoc.state.global.operatorId;

        if (!operatorProfileId) {
          throw new Error(
            `Operator profile not found in serviceOffering document ${serviceOfferingId}`,
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

        const resourceTemplateDoc =
          await reactorClient.get<ResourceTemplateDocument>(resourceTemplateId);
        if (!resourceTemplateDoc) return;

        await reactorClient.execute(subscriptionInstanceDoc.header.id, "main", [
          SubscriptionInstance.actions.initializeSubscription({
            ...subscriptionInput,
            resourceId: resourceInstanceDoc.header.id,
            resourceLabel: resourceTemplateDoc.state.global.title,
            resourceThumbnailUrl: serviceOfferingState.thumbnailUrl,
          }),
        ]);

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

      // If the wallet already owns a builder-team-admin drive, don't fail
      // outright. For BUILDER there's nothing more to create. For OPERATOR
      // we top up the workspace: keep the existing builder drive and add the
      // paired operator (service-offering-app) drive if it's missing.
      const existingWorkspace = await findUserBuilderTeamAdminDrive(
        reactorClient,
        user,
      );
      if (existingWorkspace) {
        const existingDrive = await reactorClient.get<DocumentDriveDocument>(
          existingWorkspace.driveId,
        );
        const existingSlug =
          existingDrive.header.slug || existingWorkspace.driveId;
        const existingName = existingDrive.state.global.name || existingSlug;

        if (!isOperator) {
          return {
            success: false,
            data: null,
            errors: [
              `A builder drive for wallet ${user} already exists. Use the existing workspace.`,
            ],
          };
        }

        // The operator drive is paired to the existing builder drive's slug
        // so it's stable regardless of the name/teamName passed this call.
        const pairedOfferingSlug = `${existingSlug}-operator`;
        const pairedOfferingExisting = await findDriveBySlug(
          reactorClient,
          pairedOfferingSlug,
        );
        if (pairedOfferingExisting) {
          return {
            success: false,
            data: null,
            errors: [
              `An operator workspace for wallet ${user} already exists.`,
            ],
          };
        }

        const createdForExisting: string[] = [];
        try {
          const offeringDisplayName = `${existingName} Operator`;
          const offeringDriveDoc = driveCreateDocument();
          offeringDriveDoc.header.name = offeringDisplayName;
          offeringDriveDoc.state.global.name = offeringDisplayName;
          offeringDriveDoc.header.slug = pairedOfferingSlug;
          offeringDriveDoc.state.global.icon =
            "https://cdn-icons-png.magnific.com/256/17754/17754439.png";
          if (!offeringDriveDoc.header.meta) offeringDriveDoc.header.meta = {};
          offeringDriveDoc.header.meta.preferredEditor = "service-offering-app";
          const offeringDrive =
            await reactorClient.create<DocumentDriveDocument>(offeringDriveDoc);
          createdForExisting.push(offeringDrive.header.id);

          return {
            success: true,
            data: {
              drives: [
                {
                  driveId: existingWorkspace.driveId,
                  driveSlug: existingSlug,
                  driveName: existingName,
                  driveLink: getDriveLink(existingSlug),
                },
                {
                  driveId: offeringDrive.header.id,
                  driveSlug: pairedOfferingSlug,
                  driveName: offeringDisplayName,
                  driveLink: getDriveLink(pairedOfferingSlug),
                },
              ],
            },
            errors: [],
          };
        } catch (error) {
          console.error("createUserDrive (operator top-up) failed:", error);
          for (const id of createdForExisting) {
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
      const offeringSlug = `${baseSlug}-operator`;
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
        primaryDriveDoc.state.global.icon =
          "https://www.pngall.com/wp-content/uploads/12/Engineer-Helmet-Equipment-PNG-Image-HD.png";
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
        const profileActions: BuilderProfileAction[] = [];
        profileActions.push(
          builderProfileActions.updateProfile({
            name: profileDisplayName,
            slug: baseSlug,
          }),
        );
        profileActions.push(
          builderProfileActions.setWalletAddress({ walletAddress: user }),
        );
        if (isOperator) {
          profileActions.push(
            builderProfileActions.setOperator({ isOperator: true }),
          );
        }
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
          const offeringDisplayName = `${baseDisplayName} Operator`;
          const offeringDriveDoc = driveCreateDocument();
          offeringDriveDoc.header.name = offeringDisplayName;
          offeringDriveDoc.state.global.name = offeringDisplayName;
          offeringDriveDoc.header.slug = offeringSlug;
          offeringDriveDoc.state.global.icon =
            "https://cdn-icons-png.magnific.com/256/17754/17754439.png";
          if (!offeringDriveDoc.header.meta) offeringDriveDoc.header.meta = {};
          offeringDriveDoc.header.meta.preferredEditor = "service-offering-app";
          const offeringDrive =
            await reactorClient.create<DocumentDriveDocument>(offeringDriveDoc);
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
  };
}
