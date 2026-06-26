import { generateMock } from "document-model";
import {
  isFacetDocument,
  reducer,
  setFacetDescription,
  SetFacetDescriptionInputSchema,
  setFacetName,
  SetFacetNameInputSchema,
  utils,
} from "document-models/facet/v1";
import { describe, expect, it } from "vitest";

describe("FacetManagementOperations", () => {
  it("should handle setFacetName operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetFacetNameInputSchema(), {
      lastModified: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, setFacetName(input));

    expect(isFacetDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_FACET_NAME",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setFacetDescription operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetFacetDescriptionInputSchema(), {
      lastModified: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, setFacetDescription(input));

    expect(isFacetDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_FACET_DESCRIPTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
