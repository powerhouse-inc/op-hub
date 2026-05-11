import { generateMock } from "document-model";
import { describe, expect, it } from "vitest";
import {
  reducer,
  utils,
  isSubscriptionInstanceDocument,
  addService,
  removeService,
  updateServiceSetupCost,
  updateServiceRecurringCost,
  updateServiceInfo,
  addServiceFacetSelection,
  removeServiceFacetSelection,
  AddServiceInputSchema,
  RemoveServiceInputSchema,
  UpdateServiceSetupCostInputSchema,
  UpdateServiceRecurringCostInputSchema,
  UpdateServiceInfoInputSchema,
  AddServiceFacetSelectionInputSchema,
  RemoveServiceFacetSelectionInputSchema,
} from "document-models/subscription-instance/v1";

describe("ServiceOperations", () => {
  it("should handle addService operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddServiceInputSchema());

    const updatedDocument = reducer(document, addService(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_SERVICE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeService operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveServiceInputSchema());

    const updatedDocument = reducer(document, removeService(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_SERVICE",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateServiceSetupCost operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateServiceSetupCostInputSchema());

    const updatedDocument = reducer(document, updateServiceSetupCost(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_SERVICE_SETUP_COST",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateServiceRecurringCost operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateServiceRecurringCostInputSchema());

    const updatedDocument = reducer(
      document,
      updateServiceRecurringCost(input),
    );

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_SERVICE_RECURRING_COST",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle updateServiceInfo operation", () => {
    const document = utils.createDocument();
    const input = generateMock(UpdateServiceInfoInputSchema());

    const updatedDocument = reducer(document, updateServiceInfo(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "UPDATE_SERVICE_INFO",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle addServiceFacetSelection operation", () => {
    const document = utils.createDocument();
    const input = generateMock(AddServiceFacetSelectionInputSchema());

    const updatedDocument = reducer(document, addServiceFacetSelection(input));

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "ADD_SERVICE_FACET_SELECTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });

  it("should handle removeServiceFacetSelection operation", () => {
    const document = utils.createDocument();
    const input = generateMock(RemoveServiceFacetSelectionInputSchema());

    const updatedDocument = reducer(
      document,
      removeServiceFacetSelection(input),
    );

    expect(isSubscriptionInstanceDocument(updatedDocument)).toBe(true);
    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].action.type).toBe(
      "REMOVE_SERVICE_FACET_SELECTION",
    );
    expect(updatedDocument.operations.global[0].action.input).toStrictEqual(
      input,
    );
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
