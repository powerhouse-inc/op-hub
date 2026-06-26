import { generateMock } from "document-model";
import {
  addFacetOption,
  AddFacetOptionInputSchema,
  changeResourceTemplate,
  ChangeResourceTemplateInputSchema,
  isServiceOfferingDocument,
  reducer,
  removeFacetOption,
  RemoveFacetOptionInputSchema,
  removeFacetTarget,
  RemoveFacetTargetInputSchema,
  selectResourceTemplate,
  SelectResourceTemplateInputSchema,
  setAvailableBillingCycles,
  SetAvailableBillingCyclesInputSchema,
  setFacetTarget,
  SetFacetTargetInputSchema,
  setOfferingId,
  SetOfferingIdInputSchema,
  setOperator,
  SetOperatorInputSchema,
  updateOfferingInfo,
  UpdateOfferingInfoInputSchema,
  updateOfferingStatus,
  UpdateOfferingStatusInputSchema,
  utils,
} from "document-models/service-offering/v1";
import { describe, expect, it } from "vitest";

describe("OfferingOperations", () => {
  it("should handle updateOfferingInfo operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateOfferingInfoInputSchema(), {
      lastModified: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, updateOfferingInfo(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_OFFERING_INFO",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateOfferingStatus operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateOfferingStatusInputSchema(), {
      lastModified: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, updateOfferingStatus(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_OFFERING_STATUS",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setOperator operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetOperatorInputSchema(), {
      lastModified: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, setOperator(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_OPERATOR",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setOfferingId operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetOfferingIdInputSchema(), {
      lastModified: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, setOfferingId(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_OFFERING_ID",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setFacetTarget operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetFacetTargetInputSchema(), {
      lastModified: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, setFacetTarget(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_FACET_TARGET",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeFacetTarget operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveFacetTargetInputSchema(), {
      lastModified: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, removeFacetTarget(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_FACET_TARGET",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addFacetOption operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddFacetOptionInputSchema(), {
      lastModified: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, addFacetOption(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_FACET_OPTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeFacetOption operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveFacetOptionInputSchema(), {
      lastModified: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, removeFacetOption(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_FACET_OPTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle selectResourceTemplate operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SelectResourceTemplateInputSchema(), {
      lastModified: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, selectResourceTemplate(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SELECT_RESOURCE_TEMPLATE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle changeResourceTemplate operation", () => {
    const document = utils.createDocument();
    const input = generateMock(ChangeResourceTemplateInputSchema(), {
      lastModified: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, changeResourceTemplate(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "CHANGE_RESOURCE_TEMPLATE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle setAvailableBillingCycles operation", () => {
    const document = utils.createDocument();
    const input = generateMock(SetAvailableBillingCyclesInputSchema(), {
      lastModified: "2024-01-01T00:00:00.000Z",
    });

    const updatedDocument = reducer(document, setAvailableBillingCycles(input));

    expect(isServiceOfferingDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "SET_AVAILABLE_BILLING_CYCLES",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
