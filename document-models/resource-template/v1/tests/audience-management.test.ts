import { generateMock } from "document-model";
import {
  addTargetAudience,
  AddTargetAudienceInputSchema,
  isResourceTemplateDocument,
  reducer,
  removeTargetAudience,
  RemoveTargetAudienceInputSchema,
  utils,
} from "document-models/resource-template/v1";
import { describe, expect, it } from "vitest";

describe("AudienceManagementOperations", () => {
  it("should handle addTargetAudience operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddTargetAudienceInputSchema(), {
      lastModified: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, addTargetAudience(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_TARGET_AUDIENCE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeTargetAudience operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveTargetAudienceInputSchema(), {
      lastModified: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, removeTargetAudience(input));

    expect(isResourceTemplateDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_TARGET_AUDIENCE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
