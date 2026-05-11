import type { UpgradeManifest } from "document-model";
import { latestVersion, supportedVersions } from "./versions.js";

export const serviceOfferingUpgradeManifest: UpgradeManifest<
  typeof supportedVersions
> = {
  documentType: "powerhouse/service-offering",
  latestVersion,
  supportedVersions,
  upgrades: {},
};
