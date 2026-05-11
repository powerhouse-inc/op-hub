import type { UpgradeManifest } from "document-model";
import { latestVersion, supportedVersions } from "./versions.js";

export const subscriptionInstanceUpgradeManifest: UpgradeManifest<
  typeof supportedVersions
> = {
  documentType: "powerhouse/subscription-instance",
  latestVersion,
  supportedVersions,
  upgrades: {},
};
