/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { UpgradeManifest } from "document-model";
import { builderProfileUpgradeManifest } from "document-models/builder-profile/upgrades";
import { facetUpgradeManifest } from "document-models/facet/upgrades";
import { resourceInstanceUpgradeManifest } from "document-models/resource-instance/upgrades";
import { resourceTemplateUpgradeManifest } from "document-models/resource-template/upgrades";
import { serviceOfferingUpgradeManifest } from "document-models/service-offering/upgrades";
import { subscriptionInstanceUpgradeManifest } from "document-models/subscription-instance/upgrades";
import { subscriptionInvoiceUpgradeManifest } from "document-models/subscription-invoice/upgrades";

export const upgradeManifests: UpgradeManifest<readonly number[]>[] = [
  builderProfileUpgradeManifest,
  facetUpgradeManifest,
  resourceInstanceUpgradeManifest,
  resourceTemplateUpgradeManifest,
  serviceOfferingUpgradeManifest,
  subscriptionInstanceUpgradeManifest,
  subscriptionInvoiceUpgradeManifest,
];
