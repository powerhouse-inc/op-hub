import {
  RemoveServiceNotFoundError,
  UpdateServiceSetupCostNotFoundError,
  UpdateServiceRecurringCostNotFoundError,
  UpdateServiceInfoNotFoundError,
  AddServiceFacetSelectionServiceNotFoundError,
  RemoveServiceFacetSelectionServiceNotFoundError,
  SubscriptionNotActiveAddServiceError,
  SubscriptionNotActiveRemoveServiceError,
} from "../../gen/service/error.js";
import type { SubscriptionInstanceServiceOperations } from "document-models/subscription-instance/v1";

export const subscriptionInstanceServiceOperations: SubscriptionInstanceServiceOperations =
  {
    addServiceOperation(state, action) {
      // D-6: Status guard — PENDING or ACTIVE only
      if (state.status !== "PENDING" && state.status !== "ACTIVE") {
        throw new SubscriptionNotActiveAddServiceError(
          `Cannot add service when status is ${state.status}`,
        );
      }
      const service = {
        id: action.input.serviceId,
        name: action.input.name || null,
        description: action.input.description || null,
        customValue: action.input.customValue || null,
        facetSelections: [],
        setupCost:
          action.input.setupAmount && action.input.setupCurrency
            ? {
                amount: action.input.setupAmount,
                currency: action.input.setupCurrency,
              }
            : null,
        recurringCost:
          action.input.recurringAmount &&
          action.input.recurringCurrency &&
          action.input.recurringBillingCycle
            ? {
                amount: action.input.recurringAmount,
                currency: action.input.recurringCurrency,
                billingCycle: action.input.recurringBillingCycle,
                discount: action.input.recurringDiscount
                  ? {
                      originalAmount:
                        action.input.recurringDiscount.originalAmount,
                      discountType: action.input.recurringDiscount.discountType,
                      discountValue:
                        action.input.recurringDiscount.discountValue,
                      source: action.input.recurringDiscount.source,
                    }
                  : null,
              }
            : null,
        metrics: [],
      };
      state.services.push(service);
      // No proration — standalone services don't carry pricing at this level.
      // Proration applies at the service GROUP level (D-1 revised).
    },
    removeServiceOperation(state, action) {
      // D-6: Status guard — PENDING or ACTIVE only
      if (state.status !== "PENDING" && state.status !== "ACTIVE") {
        throw new SubscriptionNotActiveRemoveServiceError(
          `Cannot remove service when status is ${state.status}`,
        );
      }
      const index = state.services.findIndex(
        (s) => s.id === action.input.serviceId,
      );
      if (index === -1) {
        throw new RemoveServiceNotFoundError(
          `Service with ID ${action.input.serviceId} not found`,
        );
      }
      // No proration — standalone services don't carry pricing.
      // Proration applies at the service GROUP level (D-2 revised).
      state.services.splice(index, 1);
    },
    updateServiceSetupCostOperation(state, action) {
      // D-6: Cost updates only in PENDING (setup phase)
      if (state.status !== "PENDING") return;
      const svc = state.services.find((s) => s.id === action.input.serviceId);
      if (!svc) {
        throw new UpdateServiceSetupCostNotFoundError(
          `Service with ID ${action.input.serviceId} not found`,
        );
      }
      if (action.input.amount && action.input.currency) {
        svc.setupCost = {
          amount: action.input.amount,
          currency: action.input.currency,
        };
      } else if (svc.setupCost) {
        if (action.input.amount) svc.setupCost.amount = action.input.amount;
        if (action.input.currency)
          svc.setupCost.currency = action.input.currency;
      }
    },
    updateServiceRecurringCostOperation(state, action) {
      // D-6: Cost updates only in PENDING (setup phase)
      if (state.status !== "PENDING") return;
      const svc = state.services.find((s) => s.id === action.input.serviceId);
      if (!svc) {
        throw new UpdateServiceRecurringCostNotFoundError(
          `Service with ID ${action.input.serviceId} not found`,
        );
      }
      if (
        action.input.amount &&
        action.input.currency &&
        action.input.billingCycle
      ) {
        svc.recurringCost = {
          amount: action.input.amount,
          currency: action.input.currency,
          billingCycle: action.input.billingCycle,
          discount: svc.recurringCost?.discount || null,
        };
      } else if (svc.recurringCost) {
        if (action.input.amount) svc.recurringCost.amount = action.input.amount;
        if (action.input.currency)
          svc.recurringCost.currency = action.input.currency;
        if (action.input.billingCycle)
          svc.recurringCost.billingCycle = action.input.billingCycle;
      }
    },
    updateServiceInfoOperation(state, action) {
      const svc = state.services.find((s) => s.id === action.input.serviceId);
      if (!svc) {
        throw new UpdateServiceInfoNotFoundError(
          `Service with ID ${action.input.serviceId} not found`,
        );
      }
      if (action.input.name !== undefined) svc.name = action.input.name || null;
      if (action.input.description !== undefined)
        svc.description = action.input.description || null;
      if (action.input.customValue !== undefined)
        svc.customValue = action.input.customValue || null;
    },
    addServiceFacetSelectionOperation(state, action) {
      const svc = state.services.find((s) => s.id === action.input.serviceId);
      if (!svc) {
        throw new AddServiceFacetSelectionServiceNotFoundError(
          `Service with ID ${action.input.serviceId} not found`,
        );
      }
      svc.facetSelections.push({
        id: action.input.facetSelectionId,
        facetName: action.input.facetName,
        selectedOption: action.input.selectedOption,
      });
    },
    removeServiceFacetSelectionOperation(state, action) {
      const svc = state.services.find((s) => s.id === action.input.serviceId);
      if (!svc) {
        throw new RemoveServiceFacetSelectionServiceNotFoundError(
          `Service with ID ${action.input.serviceId} not found`,
        );
      }
      const index = svc.facetSelections.findIndex(
        (fs) => fs.id === action.input.facetSelectionId,
      );
      if (index !== -1) {
        svc.facetSelections.splice(index, 1);
      }
    },
  };
