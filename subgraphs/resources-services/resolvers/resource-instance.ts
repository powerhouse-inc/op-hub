import type { IReactorClient } from "@powerhousedao/reactor";
import type { ResourceTemplateDocument } from "document-models/resource-template";
import { ResourceInstance } from "document-models/resource-instance";

/**
 * Populate a resource-instance document with data from a resource-template.
 * Initializes basic info and sets facet configuration from template facetTargets.
 */
export async function populateResourceInstance(
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
