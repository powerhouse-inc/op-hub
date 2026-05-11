import type { UpgradeManifest } from "document-model";
import { latestVersion, supportedVersions } from "./versions.js";

export const resourceInstanceUpgradeManifest: UpgradeManifest<
  typeof supportedVersions
> = {
  documentType: "powerhouse/resource-instance",
  latestVersion,
  supportedVersions,
  upgrades: {},
};
