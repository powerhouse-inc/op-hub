import type { TemplateStatus } from "document-models/resource-template";
import type { ServiceStatus } from "document-models/service-offering";

// Filter types
export interface ResourceTemplatesFilter {
  id?: string;
  status?: TemplateStatus[];
  operatorId?: string;
}

export interface ServiceOfferingsFilter {
  id?: string;
  status?: ServiceStatus[];
  operatorId?: string;
  resourceTemplateId?: string;
}

export interface BillingCycleOverrideInput {
  groupId: string;
  billingCycle: string;
}

export interface UserSelectionInput {
  tierId: string;
  billingCycle: string;
  optionGroupIds: string[];
  groupBillingCycleOverrides?: BillingCycleOverrideInput[];
  addonBillingCycleOverrides?: BillingCycleOverrideInput[];
}

export interface CreateProductInstancesInput {
  serviceOfferingId: string;
  name: string;
  teamName: string;
  ethereumAddress: string;
  customerEmail?: string;
  userSelection: UserSelectionInput;
}

export interface GetBuilderDrivesFilter {
  ethereumAddress: string;
}

export type UserRole = "BUILDER" | "OPERATOR";

export interface CreateUserDriveInput {
  role: UserRole;
  user: string;
  name?: string | null;
  teamName?: string | null;
}
