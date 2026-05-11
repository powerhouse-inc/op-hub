import { generateMock } from "document-model";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isResourceInstanceDocument,
  setInstanceFacet,
  removeInstanceFacet,
  updateInstanceFacet,
  applyConfigurationChanges,
  SetInstanceFacetInputSchema,
  RemoveInstanceFacetInputSchema,
  UpdateInstanceFacetInputSchema,
  ApplyConfigurationChangesInputSchema,
} from "document-models/resource-instance/v1";

describe("ConfigurationManagementOperations", () => {
  it("should handle setInstanceFacet operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetInstanceFacetInputSchema());

    const updatedDocument = reducer(document, setInstanceFacet(input));

    expect(isResourceInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_INSTANCE_FACET",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeInstanceFacet operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveInstanceFacetInputSchema());

    const updatedDocument = reducer(document, removeInstanceFacet(input));

    expect(isResourceInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_INSTANCE_FACET",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateInstanceFacet operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateInstanceFacetInputSchema());

    const updatedDocument = reducer(document, updateInstanceFacet(input));

    expect(isResourceInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_INSTANCE_FACET",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle applyConfigurationChanges operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ApplyConfigurationChangesInputSchema());

    const updatedDocument = reducer(document, applyConfigurationChanges(input));

    expect(isResourceInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "APPLY_CONFIGURATION_CHANGES",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
