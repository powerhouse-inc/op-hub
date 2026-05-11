import type { DocumentModelGlobalState } from "document-model";

export const documentModel: DocumentModelGlobalState = {
  id: "powerhouse/subscription-instance",
  name: "SubscriptionInstance",
  author: {
    name: "Powerhouse",
    website: "https://www.powerhouse.inc/",
  },
  extension: "",
  description:
    "Tracks an individual subscription instance for a service offering, including customer info, tier selection, billing, services, service groups, and usage metrics.",
  specifications: [
    {
      state: {
        local: {
          schema: "",
          examples: [],
          initialValue: "",
        },
        global: {
          schema:
            "type SubscriptionInstanceState {\n    customerId: PHID\n    customerName: String\n    customerEmail: EmailAddress\n    customerType: CustomerType\n    teamMemberCount: Int\n    operatorId: PHID\n    serviceOfferingId: PHID\n    tierName: String\n    tierPricingOptionId: OID\n    tierPrice: Amount_Money\n    tierCurrency: Currency\n    tierPricingMode: TierPricingMode\n    selectedBillingCycle: BillingCycle\n    globalCurrency: Currency\n    resource: ResourceDocument\n    status: SubscriptionStatus!\n    createdAt: DateTime\n    activatedSince: DateTime\n    pausedSince: DateTime\n    expiringSince: DateTime\n    cancelledSince: DateTime\n    cancellationReason: String\n    autoRenew: Boolean!\n    operatorNotes: String\n    nextBillingDate: DateTime\n    currentBillingCycleStart: DateTime\n    totalDebt: Amount_Money\n    totalCredit: Amount_Money\n    currentCycleOverage: Amount_Money\n    debtLineItems: [DebtLineItem!]!\n    services: [Service!]!\n    serviceGroups: [ServiceGroup!]!\n}\n\nenum TierPricingMode {\n    CALCULATED\n    MANUAL_OVERRIDE\n}\n\nenum CustomerType {\n    INDIVIDUAL\n    TEAM\n}\n\nenum GroupCostType {\n    RECURRING\n    SETUP\n}\n\nenum SubscriptionStatus {\n    PENDING\n    ACTIVE\n    PAUSED\n    EXPIRING\n    CANCELLED\n}\n\nenum DiscountType {\n    PERCENTAGE\n    FLAT_AMOUNT\n}\n\nenum DiscountSource {\n    TIER_INHERITED\n    GROUP_INDEPENDENT\n    BUNDLE\n}\n\nenum BillingCycle {\n    MONTHLY\n    QUARTERLY\n    SEMI_ANNUAL\n    ANNUAL\n    ONE_TIME\n}\n\nenum AccrualCycle {\n    HOURLY\n    DAILY\n    WEEKLY\n    MONTHLY\n    QUARTERLY\n    SEMI_ANNUAL\n    ANNUAL\n}\n\nenum MetricType {\n    CUMULATIVE\n    NON_CUMULATIVE\n}\n\nenum DebtOriginType {\n    SETUP\n    SUBSCRIPTION_FEE\n    DYNAMIC\n    ESTIMATED_USAGE\n    RECONCILIATION\n}\n\nenum DebtLineItemStatus {\n    CHARGED\n    INVOICED\n    PARTIALLY_PAID\n    FULLY_PAID\n}\n\ntype DebtLineItem {\n    id: OID!\n    origin: DebtOriginType!\n    status: DebtLineItemStatus!\n    invoiced: Boolean!\n    debitAmount: Amount_Money!\n    settledAmount: Amount_Money!\n    currency: Currency!\n    chargedAt: DateTime!\n    invoicedAt: DateTime\n    fullyPaidAt: DateTime\n    sourceServiceId: OID\n    sourceMetricId: OID\n    sourceGroupId: OID\n    frozen: Boolean!\n    accrualPeriodStart: DateTime\n    invoiceRef: PHID\n    lastPaymentRef: PHID\n    description: String\n}\n\ntype DiscountInfo {\n    originalAmount: Amount_Money!\n    discountType: DiscountType!\n    discountValue: Float!\n    source: DiscountSource!\n}\n\ntype SetupCost {\n    amount: Amount_Money!\n    currency: Currency!\n}\n\ntype RecurringCost {\n    amount: Amount_Money!\n    currency: Currency!\n    billingCycle: BillingCycle!\n    discount: DiscountInfo\n}\n\ntype ResourceDocument {\n    id: PHID!\n    label: String\n    thumbnailUrl: URL\n}\n\ntype ServiceFacetSelection {\n    id: OID!\n    facetName: String!\n    selectedOption: String!\n}\n\ntype ServiceMetric {\n    id: OID!\n    name: String!\n    unitName: String!\n    freeLimit: Int\n    paidLimit: Int\n    unitCost: RecurringCost\n    currentUsage: Int!\n    metricType: MetricType!\n    accrualCycle: AccrualCycle!\n    lastAccrualDate: DateTime\n}\n\ntype Service {\n    id: OID!\n    name: String\n    description: String\n    customValue: String\n    facetSelections: [ServiceFacetSelection!]!\n    setupCost: SetupCost\n    recurringCost: RecurringCost\n    metrics: [ServiceMetric!]!\n}\n\ntype ServiceGroup {\n    id: OID!\n    optional: Boolean!\n    name: String!\n    costType: GroupCostType\n    setupCost: SetupCost\n    recurringCost: RecurringCost\n    services: [Service!]!\n}",
          examples: [],
          initialValue:
            '{"customerId":null,"customerName":null,"customerEmail":null,"customerType":null,"teamMemberCount":null,"operatorId":null,"serviceOfferingId":null,"tierName":null,"tierPricingOptionId":null,"tierPrice":null,"tierCurrency":null,"tierPricingMode":null,"selectedBillingCycle":null,"globalCurrency":null,"resource":null,"status":"PENDING","createdAt":null,"activatedSince":null,"pausedSince":null,"expiringSince":null,"cancelledSince":null,"cancellationReason":null,"autoRenew":false,"operatorNotes":null,"nextBillingDate":null,"currentBillingCycleStart":null,"totalDebt":null,"totalCredit":null,"currentCycleOverage":null,"debtLineItems":[],"services":[],"serviceGroups":[]}',
        },
      },
      modules: [
        {
          id: "mod-subscription",
          name: "subscription",
          operations: [
            {
              id: "op-initialize-subscription",
              name: "INITIALIZE_SUBSCRIPTION",
              scope: "global",
              errors: [],
              schema:
                "input InitializeFacetSelectionInput {\n    id: OID!\n    facetName: String!\n    selectedOption: String!\n}\n\ninput DiscountInfoInitInput {\n    originalAmount: Amount_Money!\n    discountType: DiscountType!\n    discountValue: Float!\n    source: DiscountSource!\n}\n\ninput InitializeMetricInput {\n    id: OID!\n    name: String!\n    unitName: String!\n    freeLimit: Int\n    paidLimit: Int\n    currentUsage: Int!\n    metricType: MetricType!\n    accrualCycle: AccrualCycle!\n    unitCostAmount: Amount_Money\n    unitCostCurrency: Currency\n    unitCostBillingCycle: BillingCycle\n    lastAccrualDate: DateTime\n}\n\ninput InitializeServiceInput {\n    id: OID!\n    name: String\n    description: String\n    customValue: String\n    facetSelections: [InitializeFacetSelectionInput!]\n    setupAmount: Amount_Money\n    setupCurrency: Currency\n    recurringAmount: Amount_Money\n    recurringCurrency: Currency\n    recurringBillingCycle: BillingCycle\n    recurringDiscount: DiscountInfoInitInput\n    metrics: [InitializeMetricInput!]\n}\n\ninput InitializeServiceGroupInput {\n    id: OID!\n    name: String!\n    optional: Boolean!\n    costType: GroupCostType\n    setupAmount: Amount_Money\n    setupCurrency: Currency\n    recurringAmount: Amount_Money\n    recurringCurrency: Currency\n    recurringBillingCycle: BillingCycle\n    recurringDiscount: DiscountInfoInitInput\n    services: [InitializeServiceInput!]\n}\n\ninput InitializeSubscriptionInput {\n    customerId: PHID\n    customerName: String\n    customerEmail: EmailAddress\n    serviceOfferingId: PHID\n    tierName: String\n    tierPricingOptionId: OID\n    tierPrice: Amount_Money\n    tierCurrency: Currency\n    tierPricingMode: TierPricingMode\n    selectedBillingCycle: BillingCycle\n    globalCurrency: Currency\n    resourceId: PHID\n    resourceLabel: String\n    resourceThumbnailUrl: URL\n    autoRenew: Boolean\n    createdAt: DateTime!\n    services: [InitializeServiceInput!]\n    serviceGroups: [InitializeServiceGroupInput!]\n}",
              reducer:
                'state.customerId = action.input.customerId || null;\nstate.customerName = action.input.customerName || null;\nstate.customerEmail = action.input.customerEmail || null;\nstate.serviceOfferingId = action.input.serviceOfferingId || null;\nstate.tierName = action.input.tierName || null;\nstate.tierPricingOptionId = action.input.tierPricingOptionId || null;\nstate.tierPrice = action.input.tierPrice || null;\nstate.tierCurrency = action.input.tierCurrency || null;\nstate.tierPricingMode = action.input.tierPricingMode || null;\nstate.selectedBillingCycle = action.input.selectedBillingCycle || null;\nstate.globalCurrency = action.input.globalCurrency || null;\nif (action.input.resourceId) {\n  state.resource = {\n    id: action.input.resourceId,\n    label: action.input.resourceLabel || null,\n    thumbnailUrl: action.input.resourceThumbnailUrl || null,\n  };\n}\nstate.autoRenew = action.input.autoRenew || false;\nstate.createdAt = action.input.createdAt;\nstate.status = "PENDING";\nfunction mapMetric(m) {\n  return {\n    id: m.id,\n    name: m.name,\n    unitName: m.unitName,\n    freeLimit: m.freeLimit || null,\n    paidLimit: m.paidLimit || null,\n    unitCost: m.unitCostAmount && m.unitCostCurrency && m.unitCostBillingCycle ? {\n      amount: m.unitCostAmount,\n      currency: m.unitCostCurrency,\n      billingCycle: m.unitCostBillingCycle\n      discount: null,\n    } : null,\n    currentUsage: m.currentUsage,\n    metricType: m.metricType,\n    accrualCycle: m.accrualCycle,\n    lastAccrualDate: m.lastAccrualDate || null,\n  };\n}\nfunction mapService(s) {\n  return {\n    id: s.id,\n    name: s.name || null,\n    description: s.description || null,\n    customValue: s.customValue || null,\n    facetSelections: (s.facetSelections || []).map((fs) => ({\n      id: fs.id,\n      facetName: fs.facetName,\n      selectedOption: fs.selectedOption,\n    })),\n    setupCost: s.setupAmount && s.setupCurrency ? {\n      amount: s.setupAmount,\n      currency: s.setupCurrency\n    } : null,\n    recurringCost: s.recurringAmount && s.recurringCurrency && s.recurringBillingCycle ? {\n      amount: s.recurringAmount,\n      currency: s.recurringCurrency,\n      billingCycle: s.recurringBillingCycle\n      discount: s.recurringDiscount ? {\n        originalAmount: s.recurringDiscount.originalAmount,\n        discountType: s.recurringDiscount.discountType,\n        discountValue: s.recurringDiscount.discountValue,\n        source: s.recurringDiscount.source,\n      } : null,\n    } : null,\n    metrics: (s.metrics || []).map(mapMetric),\n  };\n}\nstate.services = (action.input.services || []).map(mapService);\nstate.serviceGroups = (action.input.serviceGroups || []).map((sg) => ({\n  id: sg.id,\n  name: sg.name,\n  optional: sg.optional,\n  costType: sg.costType || null,\n  setupCost: sg.setupAmount && sg.setupCurrency ? {\n    amount: sg.setupAmount,\n    currency: sg.setupCurrency\n  } : null,\n  recurringCost: sg.recurringAmount && sg.recurringCurrency && sg.recurringBillingCycle ? {\n    amount: sg.recurringAmount,\n    currency: sg.recurringCurrency,\n    billingCycle: sg.recurringBillingCycle\n    discount: sg.recurringDiscount ? {\n      originalAmount: sg.recurringDiscount.originalAmount,\n      discountType: sg.recurringDiscount.discountType,\n      discountValue: sg.recurringDiscount.discountValue,\n      source: sg.recurringDiscount.source,\n    } : null,\n  } : null,\n  services: (sg.services || []).map(mapService),\n}));',
              examples: [],
              template: "Initialize a subscription from a service offering",
              description: "Initialize a subscription from a service offering",
            },
            {
              id: "op-set-resource-document",
              name: "SET_RESOURCE_DOCUMENT",
              scope: "global",
              errors: [],
              schema:
                "input SetResourceDocumentInput {\n    resourceId: PHID!\n    resourceLabel: String\n    resourceThumbnailUrl: URL\n}",
              reducer:
                "state.resource = {\n  id: action.input.resourceId,\n  label: action.input.resourceLabel || null,\n  thumbnailUrl: action.input.resourceThumbnailUrl || null,\n};",
              examples: [],
              template: "Link a resource document to the subscription",
              description: "Link a resource document to the subscription",
            },
            {
              id: "op-activate-subscription",
              name: "ACTIVATE_SUBSCRIPTION",
              scope: "global",
              errors: [
                {
                  id: "err-activate-not-pending",
                  code: "ACTIVATE_NOT_PENDING",
                  name: "ActivateNotPendingError",
                  template: "",
                  description:
                    "Subscription must be in PENDING status to activate",
                },
                {
                  id: "err-activate-missing-slice-id",
                  name: "ActivateMissingSliceIdError",
                  code: "MISSING_SLICE_ID",
                  description:
                    "Activation could not find a pre-generated slice ID for a chargeable source",
                  template: "",
                },
              ],
              schema:
                "input ActivateSliceIdMappingInput {\n    sourceId: OID!\n    sliceId: OID!\n    sourceName: String\n}\n\ninput ActivateSubscriptionInput {\n    activatedSince: DateTime!\n    setupSliceIds: [ActivateSliceIdMappingInput!]!\n    recurringSliceIds: [ActivateSliceIdMappingInput!]!\n}",
              reducer:
                'if (state.status !== "PENDING") {\n  throw new ActivateNotPendingError(\n    `Cannot activate subscription with status ${state.status}`,\n  );\n}\nstate.status = "ACTIVE";\nstate.activatedSince = action.input.activatedSince;\n\n// Anchor every metric\'s accrual clock to the activation moment.\nfor (const svc of state.services) {\n  for (const metric of svc.metrics) {\n    if (!metric.lastAccrualDate) {\n      metric.lastAccrualDate = action.input.activatedSince;\n    }\n  }\n}\nfor (const group of state.serviceGroups) {\n  for (const svc of group.services) {\n    for (const metric of svc.metrics) {\n      if (!metric.lastAccrualDate) {\n        metric.lastAccrualDate = action.input.activatedSince;\n      }\n    }\n  }\n}\n\n// D-4, BA-5: Initialize billing state on activation\nstate.currentBillingCycleStart = action.input.activatedSince;\nif (state.selectedBillingCycle) {\n  state.nextBillingDate = calculateNextBillingDate(\n    action.input.activatedSince,\n    state.selectedBillingCycle,\n  );\n}\n\n// Aggregates start at zero; appendDebtSlice maintains them per slice.\nstate.totalDebt = 0;\nstate.totalCredit = 0;\nstate.currentCycleOverage = 0;\n\n// Pre-generated slice IDs are looked up by sourceId. The dispatcher is\n// expected to provide one ID per chargeable source; a missing entry is\n// a dispatcher bug and we fail loudly.\nconst setupIdMap = new Map();\nfor (const m of action.input.setupSliceIds) {\n  setupIdMap.set(m.sourceId, m.sliceId);\n}\nconst recurringIdMap = new Map();\nfor (const m of action.input.recurringSliceIds) {\n  recurringIdMap.set(m.sourceId, m.sliceId);\n}\n\nfunction takeSetupId(sourceId) {\n  const id = setupIdMap.get(sourceId);\n  if (!id) {\n    throw new ActivateMissingSliceIdError(\n      `No setup slice ID provided for source ${sourceId}`,\n    );\n  }\n  return id;\n}\nfunction takeRecurringId(sourceId) {\n  const id = recurringIdMap.get(sourceId);\n  if (!id) {\n    throw new ActivateMissingSliceIdError(\n      `No recurring slice ID provided for source ${sourceId}`,\n    );\n  }\n  return id;\n}\n\nconst chargedAt = action.input.activatedSince;\n\nfor (const group of state.serviceGroups) {\n  if (group.setupCost) {\n    appendDebtSlice(state, {\n      id: takeSetupId(group.id),\n      origin: "SETUP",\n      status: "CHARGED",\n      invoiced: false,\n      debitAmount: group.setupCost.amount,\n      settledAmount: 0,\n      currency: group.setupCost.currency,\n      chargedAt,\n      invoicedAt: null,\n      fullyPaidAt: null,\n      sourceServiceId: null,\n      sourceMetricId: null,\n      sourceGroupId: group.id,\n      frozen: true,\n      accrualPeriodStart: null,\n      invoiceRef: null,\n      lastPaymentRef: null,\n      description: `Setup fee \u2014 group ${group.name}`,\n    });\n  }\n  if (group.recurringCost) {\n    appendDebtSlice(state, {\n      id: takeRecurringId(group.id),\n      origin: "SUBSCRIPTION_FEE",\n      status: "CHARGED",\n      invoiced: false,\n      debitAmount: group.recurringCost.amount,\n      settledAmount: 0,\n      currency: group.recurringCost.currency,\n      chargedAt,\n      invoicedAt: null,\n      fullyPaidAt: null,\n      sourceServiceId: null,\n      sourceMetricId: null,\n      sourceGroupId: group.id,\n      frozen: true,\n      accrualPeriodStart: null,\n      invoiceRef: null,\n      lastPaymentRef: null,\n      description: `First-cycle recurring fee \u2014 group ${group.name}`,\n    });\n  }\n  for (const svc of group.services) {\n    if (svc.setupCost) {\n      appendDebtSlice(state, {\n        id: takeSetupId(svc.id),\n        origin: "SETUP",\n        status: "CHARGED",\n        invoiced: false,\n        debitAmount: svc.setupCost.amount,\n        settledAmount: 0,\n        currency: svc.setupCost.currency,\n        chargedAt,\n        invoicedAt: null,\n        fullyPaidAt: null,\n        sourceServiceId: svc.id,\n        sourceMetricId: null,\n        sourceGroupId: group.id,\n        frozen: true,\n        accrualPeriodStart: null,\n        invoiceRef: null,\n        lastPaymentRef: null,\n        description: `Setup fee \u2014 service ${svc.name ?? svc.id}`,\n      });\n    }\n    if (svc.recurringCost) {\n      appendDebtSlice(state, {\n        id: takeRecurringId(svc.id),\n        origin: "SUBSCRIPTION_FEE",\n        status: "CHARGED",\n        invoiced: false,\n        debitAmount: svc.recurringCost.amount,\n        settledAmount: 0,\n        currency: svc.recurringCost.currency,\n        chargedAt,\n        invoicedAt: null,\n        fullyPaidAt: null,\n        sourceServiceId: svc.id,\n        sourceMetricId: null,\n        sourceGroupId: group.id,\n        frozen: true,\n        accrualPeriodStart: null,\n        invoiceRef: null,\n        lastPaymentRef: null,\n        description: `First-cycle recurring fee \u2014 service ${svc.name ?? svc.id}`,\n      });\n    }\n  }\n}\nfor (const svc of state.services) {\n  if (svc.setupCost) {\n    appendDebtSlice(state, {\n      id: takeSetupId(svc.id),\n      origin: "SETUP",\n      status: "CHARGED",\n      invoiced: false,\n      debitAmount: svc.setupCost.amount,\n      settledAmount: 0,\n      currency: svc.setupCost.currency,\n      chargedAt,\n      invoicedAt: null,\n      fullyPaidAt: null,\n      sourceServiceId: svc.id,\n      sourceMetricId: null,\n      sourceGroupId: null,\n      frozen: true,\n      accrualPeriodStart: null,\n      invoiceRef: null,\n      lastPaymentRef: null,\n      description: `Setup fee \u2014 service ${svc.name ?? svc.id}`,\n    });\n  }\n  if (svc.recurringCost) {\n    appendDebtSlice(state, {\n      id: takeRecurringId(svc.id),\n      origin: "SUBSCRIPTION_FEE",\n      status: "CHARGED",\n      invoiced: false,\n      debitAmount: svc.recurringCost.amount,\n      settledAmount: 0,\n      currency: svc.recurringCost.currency,\n      chargedAt,\n      invoicedAt: null,\n      fullyPaidAt: null,\n      sourceServiceId: svc.id,\n      sourceMetricId: null,\n      sourceGroupId: null,\n      frozen: true,\n      accrualPeriodStart: null,\n      invoiceRef: null,\n      lastPaymentRef: null,\n      description: `First-cycle recurring fee \u2014 service ${svc.name ?? svc.id}`,\n    });\n  }\n}',
              examples: [],
              template: "Activate a pending subscription",
              description: "Activate a pending subscription",
            },
            {
              id: "op-pause-subscription",
              name: "PAUSE_SUBSCRIPTION",
              scope: "global",
              errors: [
                {
                  id: "err-pause-not-active",
                  code: "PAUSE_NOT_ACTIVE",
                  name: "PauseNotActiveError",
                  template: "",
                  description: "Subscription must be in ACTIVE status to pause",
                },
              ],
              schema:
                "input PauseSubscriptionInput {\n    pausedSince: DateTime!\n}",
              reducer:
                'if (state.status !== "ACTIVE") {\n  throw new PauseNotActiveError(`Cannot pause subscription with status ${state.status}`);\n}\nstate.status = "PAUSED";\nstate.pausedSince = action.input.pausedSince;',
              examples: [],
              template: "Pause an active subscription",
              description: "Pause an active subscription",
            },
            {
              id: "op-set-expiring",
              name: "SET_EXPIRING",
              scope: "global",
              errors: [
                {
                  id: "err-set-expiring-not-active",
                  code: "SET_EXPIRING_NOT_ACTIVE",
                  name: "SetExpiringNotActiveError",
                  template: "",
                  description: "",
                },
              ],
              schema:
                "input SetExpiringInput {\n    expiringSince: DateTime!\n}",
              reducer:
                'if (state.status !== "ACTIVE") {\n  throw new SetExpiringNotActiveError(`Cannot set expiring on subscription with status ${state.status}`);\n}\nstate.status = "EXPIRING";\nstate.expiringSince = action.input.expiringSince;',
              examples: [],
              template: "Mark subscription as expiring",
              description: "Mark subscription as expiring",
            },
            {
              id: "op-cancel-subscription",
              name: "CANCEL_SUBSCRIPTION",
              scope: "global",
              errors: [
                {
                  id: "err-cancel-already-cancelled",
                  code: "CANCEL_ALREADY_CANCELLED",
                  name: "CancelAlreadyCancelledError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-cancel-missing-slice-id",
                  code: "CANCEL_MISSING_SLICE_ID",
                  name: "CancelMissingSliceIdError",
                  template: "",
                  description:
                    "No refund slice ID provided for a chargeable source during cancellation",
                },
              ],
              schema:
                "input CancelSubscriptionInput {\n    cancelledSince: DateTime!\n    cancellationReason: String\n    refundSliceIds: [RenewSliceIdMappingInput!]!\n}",
              reducer:
                'if (state.status === "CANCELLED") {\n  throw new CancelAlreadyCancelledError("Subscription is already cancelled");\n}\nstate.status = "CANCELLED";\nstate.cancelledSince = action.input.cancelledSince;\nstate.cancellationReason = action.input.cancellationReason || null;',
              examples: [],
              template: "Cancel a subscription with optional reason",
              description: "Cancel a subscription with optional reason",
            },
            {
              id: "op-resume-subscription",
              name: "RESUME_SUBSCRIPTION",
              scope: "global",
              errors: [
                {
                  id: "err-resume-not-paused",
                  code: "RESUME_NOT_PAUSED",
                  name: "ResumeNotPausedError",
                  template: "",
                  description: "",
                },
              ],
              schema:
                "input ResumeSubscriptionInput {\n    timestamp: DateTime!\n}",
              reducer:
                'if (state.status !== "PAUSED") {\n  throw new ResumeNotPausedError(`Cannot resume subscription with status ${state.status}`);\n}\nconst pausedSince = state.pausedSince;\nconst resumeAt = action.input.timestamp;\nif (pausedSince && resumeAt > pausedSince) {\n  const pauseMs = new Date(resumeAt).getTime() - new Date(pausedSince).getTime();\n  function shiftMetrics(metrics) {\n    for (const metric of metrics) {\n      if (metric.lastAccrualDate) {\n        metric.lastAccrualDate = new Date(new Date(metric.lastAccrualDate).getTime() + pauseMs).toISOString();\n      }\n    }\n  }\n  for (const svc of state.services) {\n    shiftMetrics(svc.metrics);\n  }\n  for (const group of state.serviceGroups) {\n    for (const svc of group.services) {\n      shiftMetrics(svc.metrics);\n    }\n  }\n}\nstate.status = "ACTIVE";\nstate.pausedSince = null;',
              examples: [],
              template: "Resume a paused subscription",
              description: "Resume a paused subscription",
            },
            {
              id: "op-renew-expiring-subscription",
              name: "RENEW_EXPIRING_SUBSCRIPTION",
              scope: "global",
              errors: [
                {
                  id: "err-renew-not-expiring",
                  code: "RENEW_NOT_EXPIRING",
                  name: "RenewNotExpiringError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-renew-missing-slice-id",
                  name: "RenewMissingSliceIdError",
                  code: "RENEW_MISSING_SLICE_ID",
                  description:
                    "Renewal could not find a pre-generated slice ID for a chargeable source",
                  template: "",
                },
              ],
              schema:
                "input RenewSliceIdMappingInput {\n    sourceId: OID!\n    sliceId: OID!\n    sourceName: String\n}\n\ninput RenewExpiringSubscriptionInput {\n    timestamp: DateTime!\n    recurringSliceIds: [RenewSliceIdMappingInput!]!\n}",
              reducer:
                'if (state.status !== "EXPIRING") {\n  throw new RenewNotExpiringError(\n    `Cannot renew subscription with status ${state.status}`,\n  );\n}\nstate.status = "ACTIVE";\nstate.expiringSince = null;\n\n// D-9: Initialize billing state for new cycle.\nconst newCycleStart = state.nextBillingDate;\nstate.currentBillingCycleStart = state.nextBillingDate;\nif (state.nextBillingDate && state.selectedBillingCycle) {\n  state.nextBillingDate = calculateNextBillingDate(\n    state.nextBillingDate,\n    state.selectedBillingCycle,\n  );\n}\n\nconst recurringIdMap = new Map();\nfor (const m of action.input.recurringSliceIds) {\n  recurringIdMap.set(m.sourceId, m.sliceId);\n}\nfunction takeRecurringId(sourceId) {\n  const id = recurringIdMap.get(sourceId);\n  if (!id) {\n    throw new RenewMissingSliceIdError(\n      `No recurring slice ID provided for source ${sourceId}`,\n    );\n  }\n  return id;\n}\n\nconst chargedAt = newCycleStart ?? action.input.timestamp;\nfor (const group of state.serviceGroups) {\n  if (group.recurringCost) {\n    appendDebtSlice(state, {\n      id: takeRecurringId(group.id),\n      origin: "SUBSCRIPTION_FEE",\n      status: "CHARGED",\n      invoiced: false,\n      debitAmount: group.recurringCost.amount,\n      settledAmount: 0,\n      currency: group.recurringCost.currency,\n      chargedAt,\n      invoicedAt: null,\n      fullyPaidAt: null,\n      sourceServiceId: null,\n      sourceMetricId: null,\n      sourceGroupId: group.id,\n      frozen: true,\n      accrualPeriodStart: null,\n      invoiceRef: null,\n      lastPaymentRef: null,\n      description: `Recurring fee \u2014 group ${group.name} (manual renewal)`,\n    });\n  }\n}\nfor (const svc of state.services) {\n  if (svc.recurringCost) {\n    appendDebtSlice(state, {\n      id: takeRecurringId(svc.id),\n      origin: "SUBSCRIPTION_FEE",\n      status: "CHARGED",\n      invoiced: false,\n      debitAmount: svc.recurringCost.amount,\n      settledAmount: 0,\n      currency: svc.recurringCost.currency,\n      chargedAt,\n      invoicedAt: null,\n      fullyPaidAt: null,\n      sourceServiceId: svc.id,\n      sourceMetricId: null,\n      sourceGroupId: null,\n      frozen: true,\n      accrualPeriodStart: null,\n      invoiceRef: null,\n      lastPaymentRef: null,\n      description: `Recurring fee \u2014 service ${svc.name ?? svc.id} (manual renewal)`,\n    });\n  }\n}\n\nstate.currentCycleOverage = 0;',
              examples: [],
              template: "Renew an expiring subscription",
              description: "Renew an expiring subscription",
            },
            {
              id: "op-update-customer-info",
              name: "UPDATE_CUSTOMER_INFO",
              scope: "global",
              errors: [],
              schema:
                "input UpdateCustomerInfoInput {\n    customerId: PHID\n    customerName: String\n    customerEmail: EmailAddress\n}",
              reducer:
                "if (action.input.customerId !== undefined) state.customerId = action.input.customerId || null;\nif (action.input.customerName !== undefined) state.customerName = action.input.customerName || null;\nif (action.input.customerEmail !== undefined) state.customerEmail = action.input.customerEmail || null;",
              examples: [],
              template: "Update customer details",
              description: "Update customer details",
            },
            {
              id: "op-update-tier-info",
              name: "UPDATE_TIER_INFO",
              scope: "global",
              errors: [],
              schema:
                "input UpdateTierInfoInput {\n    tierName: String\n    tierPricingOptionId: OID\n    tierPrice: Amount_Money\n    tierCurrency: Currency\n    tierPricingMode: TierPricingMode\n}",
              reducer:
                "if (action.input.tierName !== undefined) state.tierName = action.input.tierName || null;\nif (action.input.tierPricingOptionId !== undefined) state.tierPricingOptionId = action.input.tierPricingOptionId || null;\nif (action.input.tierPrice !== undefined) state.tierPrice = action.input.tierPrice || null;\nif (action.input.tierCurrency !== undefined) state.tierCurrency = action.input.tierCurrency || null;\nif (action.input.tierPricingMode !== undefined) state.tierPricingMode = action.input.tierPricingMode || null;",
              examples: [],
              template: "Update tier selection and pricing",
              description: "Update tier selection and pricing",
            },
            {
              id: "op-set-operator-notes",
              name: "SET_OPERATOR_NOTES",
              scope: "global",
              errors: [],
              schema:
                "input SetOperatorNotesInput {\n    operatorNotes: String\n}",
              reducer:
                "state.operatorNotes = action.input.operatorNotes || null;",
              examples: [],
              template: "Set operator notes",
              description: "Set operator notes",
            },
            {
              id: "op-set-auto-renew",
              name: "SET_AUTO_RENEW",
              scope: "global",
              errors: [],
              schema: "input SetAutoRenewInput {\n    autoRenew: Boolean!\n}",
              reducer: "state.autoRenew = action.input.autoRenew;",
              examples: [],
              template: "Toggle auto-renewal",
              description: "Toggle auto-renewal",
            },
            {
              id: "op-generate-invoice",
              name: "GENERATE_INVOICE",
              description:
                "Operator-initiated invoice generation. Force-accrues every metric, sweeps every CHARGED slice to INVOICED stamping each with `invoiceRef`, and (when advanceCycleIfDue is true and currentTime >= nextBillingDate) advances the cycle. Replaces SETTLE_BILLING_CYCLE per 2026-05-07 stakeholder call.",
              schema:
                "input SettleSliceIdMappingInput {\n    sourceId: OID!\n    sliceId: OID!\n    sourceName: String\n}\n\ninput GenerateInvoiceInput {\n    invoiceId: PHID!\n    generatedAt: DateTime!\n    advanceCycleIfDue: Boolean\n    metricFreezeSliceIds: [SettleSliceIdMappingInput!]!\n    nextCycleRecurringSliceIds: [SettleSliceIdMappingInput!]!\n}",
              template: "Generate an invoice for the current cycle",
              reducer:
                'if (state.status !== "ACTIVE") {\n  throw new NoBillingCycleActiveError(\n    `Cannot settle billing cycle when status is ${state.status}`,\n  );\n}\nif (\n  state.currentBillingCycleStart &&\n  action.input.settlementDate < state.currentBillingCycleStart\n) {\n  throw new SettlementDateBeforeCycleStartError(\n    "Settlement date is before the current billing cycle start",\n  );\n}\n\nconst billingCycle = state.selectedBillingCycle || "MONTHLY";\nconst settlementDate = action.input.settlementDate;\nconst effectiveAccrualDate =\n  state.nextBillingDate && settlementDate > state.nextBillingDate\n    ? state.nextBillingDate\n    : settlementDate;\n\nconst metricFreezeIdMap = new Map();\nfor (const m of action.input.metricFreezeSliceIds) {\n  metricFreezeIdMap.set(m.sourceId, m.sliceId);\n}\nfunction takeMetricFreezeId(metricId) {\n  const id = metricFreezeIdMap.get(metricId);\n  if (!id) {\n    throw new SettleMissingSliceIdError(\n      `No metric-freeze slice ID provided for metric ${metricId}`,\n    );\n  }\n  return id;\n}\n\nfunction forceAccrue(metrics) {\n  for (const metric of metrics) {\n    const alreadyAccrued =\n      metric.lastAccrualDate != null &&\n      metric.lastAccrualDate >= effectiveAccrualDate;\n    if (!alreadyAccrued) {\n      const active = findActiveDynamicSlice(state, metric.id);\n      if (active) {\n        freezeDynamicSlice(state, active);\n      } else {\n        const cost = calculateOverageCost(metric);\n        if (cost > 0) {\n          appendDebtSlice(state, {\n            id: takeMetricFreezeId(metric.id),\n            origin: "DYNAMIC",\n            status: "CHARGED",\n            invoiced: false,\n            debitAmount: cost,\n            settledAmount: 0,\n            currency:\n              metric.unitCost?.currency ?? state.globalCurrency ?? "USD",\n            chargedAt: effectiveAccrualDate,\n            invoicedAt: null,\n            fullyPaidAt: null,\n            sourceServiceId: null,\n            sourceMetricId: metric.id,\n            sourceGroupId: null,\n            frozen: true,\n            accrualPeriodStart: metric.lastAccrualDate ?? null,\n            invoiceRef: null,\n            lastPaymentRef: null,\n            description: `Overage \u2014 metric ${metric.name} (settlement)`,\n          });\n        }\n      }\n      if (metric.metricType === "CUMULATIVE") {\n        metric.currentUsage = 0;\n      }\n    }\n    metric.lastAccrualDate = effectiveAccrualDate;\n  }\n}\n\nfor (const svc of state.services) {\n  forceAccrue(svc.metrics);\n}\nfor (const group of state.serviceGroups) {\n  for (const svc of group.services) {\n    forceAccrue(svc.metrics);\n  }\n}\n\nif (state.autoRenew) {\n  const recurringIdMap = new Map();\n  for (const m of action.input.nextCycleRecurringSliceIds) {\n    recurringIdMap.set(m.sourceId, m.sliceId);\n  }\n  function takeRecurringId(sourceId) {\n    const id = recurringIdMap.get(sourceId);\n    if (!id) {\n      throw new SettleMissingSliceIdError(\n        `No next-cycle recurring slice ID for source ${sourceId}`,\n      );\n    }\n    return id;\n  }\n\n  const newCycleStart = state.nextBillingDate ?? settlementDate;\n  for (const group of state.serviceGroups) {\n    if (group.recurringCost) {\n      appendDebtSlice(state, {\n        id: takeRecurringId(group.id),\n        origin: "SUBSCRIPTION_FEE",\n        status: "CHARGED",\n        invoiced: false,\n        debitAmount: group.recurringCost.amount,\n        settledAmount: 0,\n        currency: group.recurringCost.currency,\n        chargedAt: newCycleStart,\n        invoicedAt: null,\n        fullyPaidAt: null,\n        sourceServiceId: null,\n        sourceMetricId: null,\n        sourceGroupId: group.id,\n        frozen: true,\n        accrualPeriodStart: null,\n        invoiceRef: null,\n        lastPaymentRef: null,\n        description: `Recurring fee \u2014 group ${group.name} (cycle renewal)`,\n      });\n    }\n  }\n  for (const svc of state.services) {\n    if (svc.recurringCost) {\n      appendDebtSlice(state, {\n        id: takeRecurringId(svc.id),\n        origin: "SUBSCRIPTION_FEE",\n        status: "CHARGED",\n        invoiced: false,\n        debitAmount: svc.recurringCost.amount,\n        settledAmount: 0,\n        currency: svc.recurringCost.currency,\n        chargedAt: newCycleStart,\n        invoicedAt: null,\n        fullyPaidAt: null,\n        sourceServiceId: svc.id,\n        sourceMetricId: null,\n        sourceGroupId: null,\n        frozen: true,\n        accrualPeriodStart: null,\n        invoiceRef: null,\n        lastPaymentRef: null,\n        description: `Recurring fee \u2014 service ${svc.name ?? svc.id} (cycle renewal)`,\n      });\n    }\n  }\n  state.currentBillingCycleStart = state.nextBillingDate;\n  if (state.nextBillingDate) {\n    state.nextBillingDate = calculateNextBillingDate(\n      state.nextBillingDate,\n      billingCycle,\n    );\n  }\n  state.currentCycleOverage = 0;\n} else {\n  state.status = "EXPIRING";\n  state.expiringSince = action.input.settlementDate;\n}',
              errors: [
                {
                  id: "err-no-billing-cycle-active",
                  name: "NoBillingCycleActiveError",
                  code: "NO_BILLING_CYCLE_ACTIVE",
                  description: "Subscription status is not ACTIVE",
                  template: "",
                },
                {
                  id: "err-settlement-date-before-cycle-start",
                  name: "SettlementDateBeforeCycleStartError",
                  code: "SETTLEMENT_DATE_BEFORE_CYCLE_START",
                  description:
                    "Settlement date is before the current billing cycle start date",
                  template: "",
                },
                {
                  id: "err-settle-missing-slice-id",
                  name: "SettleMissingSliceIdError",
                  code: "SETTLE_MISSING_SLICE_ID",
                  description:
                    "Settlement could not find a pre-generated slice ID for a metric force-accrual or next-cycle recurring source",
                  template: "",
                },
                {
                  id: "err-no-invoiceable-line-items",
                  name: "NoInvoiceableLineItemsError",
                  code: "NO_INVOICEABLE_LINE_ITEMS",
                  description:
                    "No outstanding line items to invoice — every slice is either FULLY_PAID or already on a prior invoice",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-change-plan",
              name: "CHANGE_PLAN",
              description:
                "Operator-driven mid-cycle tier swap. Emits two SUBSCRIPTION_FEE slices: a credit slice (negative debitAmount) for the unused portion of the old tier, and a debit slice for the prorated new tier. Freezes any active DYNAMIC slices. Cycle anchors stay put per PC-04. Billing-cycle swap is deferred (Q6) \u2014 the input field is accepted for forward-compat but throws if used.",
              schema:
                "input ChangePlanInput {\n    newTierPricingOptionId: OID!\n    effectiveDate: DateTime!\n    newBillingCycle: BillingCycle\n    creditLineItemId: OID!\n    debitLineItemId: OID!\n    newTierName: String\n    newTierPrice: Amount_Money!\n    newTierCurrency: Currency!\n}",
              template: "Change subscription plan (tier swap)",
              reducer:
                'if (state.status !== "ACTIVE") {\n  throw new ChangePlanNotActiveError(\n    `Cannot change plan on subscription with status ${state.status}`,\n  );\n}\nif (\n  action.input.newBillingCycle &&\n  action.input.newBillingCycle !== state.selectedBillingCycle\n) {\n  throw new BillingCycleSwapNotYetSupportedError(\n    `Billing-cycle swap from ${state.selectedBillingCycle} to ${action.input.newBillingCycle} not supported in MVP`,\n  );\n}\nif (!state.currentBillingCycleStart || !state.nextBillingDate) {\n  throw new ChangePlanInvalidEffectiveDateError(\n    "Subscription has no current billing cycle window",\n  );\n}\nif (\n  action.input.effectiveDate < state.currentBillingCycleStart ||\n  action.input.effectiveDate > state.nextBillingDate\n) {\n  throw new ChangePlanInvalidEffectiveDateError(\n    `effectiveDate ${action.input.effectiveDate} must be within current cycle [${state.currentBillingCycleStart}, ${state.nextBillingDate}]`,\n  );\n}\nif (state.tierPrice == null || state.tierPrice <= 0) {\n  throw new ChangePlanMissingTierPricingError(\n    "Cannot compute proration: state.tierPrice is missing or zero",\n  );\n}\n\nconst totalDays =\n  (new Date(state.nextBillingDate).getTime() -\n    new Date(state.currentBillingCycleStart).getTime()) /\n  (1000 * 60 * 60 * 24);\nconst remainingDays =\n  (new Date(state.nextBillingDate).getTime() -\n    new Date(action.input.effectiveDate).getTime()) /\n  (1000 * 60 * 60 * 24);\nconst prorataFactor = totalDays > 0 ? remainingDays / totalDays : 0;\nconst oldTierAmount = state.tierPrice;\nconst newTierAmount = action.input.newTierPrice;\nconst creditAmount = -1 * prorataFactor * oldTierAmount;\nconst debitAmount = prorataFactor * newTierAmount;\nconst oldTierLabel = state.tierName || "previous tier";\nconst newTierLabel = action.input.newTierName || "new tier";\nconst defaultCurrency =\n  state.tierCurrency || state.globalCurrency || "USD";\n\n// Credit slice \u2014 born FULLY_PAID (no operator workflow on credits).\nstate.debtLineItems.push({\n  id: action.input.creditLineItemId,\n  origin: "SUBSCRIPTION_FEE",\n  status: "FULLY_PAID",\n  invoiced: true,\n  debitAmount: creditAmount,\n  settledAmount: 0,\n  currency: defaultCurrency,\n  chargedAt: action.input.effectiveDate,\n  invoicedAt: action.input.effectiveDate,\n  fullyPaidAt: action.input.effectiveDate,\n  sourceServiceId: null,\n  sourceMetricId: null,\n  sourceGroupId: null,\n  frozen: true,\n  accrualPeriodStart: null,\n  invoiceRef: null,\n  lastPaymentRef: null,\n  description: `Plan change credit \u2014 unused portion of ${oldTierLabel}`,\n});\nstate.totalDebt = (state.totalDebt ?? 0) + creditAmount;\n\n// Debit slice \u2014 normal CHARGED status, awaits operator action.\nstate.debtLineItems.push({\n  id: action.input.debitLineItemId,\n  origin: "SUBSCRIPTION_FEE",\n  status: "CHARGED",\n  invoiced: false,\n  debitAmount: debitAmount,\n  settledAmount: 0,\n  currency: action.input.newTierCurrency,\n  chargedAt: action.input.effectiveDate,\n  invoicedAt: null,\n  fullyPaidAt: null,\n  sourceServiceId: null,\n  sourceMetricId: null,\n  sourceGroupId: null,\n  frozen: true,\n  accrualPeriodStart: null,\n  invoiceRef: null,\n  lastPaymentRef: null,\n  description: `Plan change debit \u2014 prorated ${newTierLabel}`,\n});\nstate.totalDebt = state.totalDebt + debitAmount;\n\n// Freeze any active (unfrozen) DYNAMIC slices \u2014 PC-03.\nfor (const slice of state.debtLineItems) {\n  if (slice.origin === "DYNAMIC" && !slice.frozen) {\n    slice.frozen = true;\n    if (\n      state.currentBillingCycleStart &&\n      slice.chargedAt >= state.currentBillingCycleStart\n    ) {\n      state.currentCycleOverage =\n        (state.currentCycleOverage ?? 0) - slice.debitAmount;\n    }\n  }\n}\n\nstate.tierPricingOptionId = action.input.newTierPricingOptionId;\nstate.tierPrice = action.input.newTierPrice;\nstate.tierCurrency = action.input.newTierCurrency;\nif (action.input.newTierName) {\n  state.tierName = action.input.newTierName;\n}',
              errors: [
                {
                  id: "err-change-plan-not-active",
                  name: "ChangePlanNotActiveError",
                  code: "CHANGE_PLAN_NOT_ACTIVE",
                  description:
                    "Plan changes are only allowed on ACTIVE subscriptions.",
                  template: "",
                },
                {
                  id: "err-change-plan-invalid-effective-date",
                  name: "ChangePlanInvalidEffectiveDateError",
                  code: "CHANGE_PLAN_INVALID_EFFECTIVE_DATE",
                  description:
                    "effectiveDate must be within the current billing cycle.",
                  template: "",
                },
                {
                  id: "err-change-plan-billing-cycle-swap",
                  name: "BillingCycleSwapNotYetSupportedError",
                  code: "BILLING_CYCLE_SWAP_NOT_YET_SUPPORTED",
                  description:
                    "Billing-cycle swap is deferred per Q6 (2026-05-01).",
                  template: "",
                },
                {
                  id: "err-change-plan-missing-tier-pricing",
                  name: "ChangePlanMissingTierPricingError",
                  code: "CHANGE_PLAN_MISSING_TIER_PRICING",
                  description:
                    "Cannot compute proration because state.tierPrice is missing or zero.",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
          ],
          description:
            "Subscription lifecycle, customer info, tier, billing, and general management operations",
        },
        {
          id: "mod-service",
          name: "service",
          operations: [
            {
              id: "op-add-service",
              name: "ADD_SERVICE",
              scope: "global",
              errors: [
                {
                  id: "err-not-active-add-service",
                  name: "SubscriptionNotActiveAddServiceError",
                  code: "SUBSCRIPTION_NOT_ACTIVE_ADD_SERVICE",
                  description:
                    "Status must be PENDING or ACTIVE to add a service",
                  template: "",
                },
              ],
              schema:
                "input DiscountServiceInfoInput {\n    originalAmount: Amount_Money!\n    discountType: DiscountType!\n    discountValue: Float!\n    source: DiscountSource!\n}\n\ninput AddServiceInput {\n    serviceId: OID!\n    name: String\n    description: String\n    customValue: String\n    setupAmount: Amount_Money\n    setupCurrency: Currency\n    recurringAmount: Amount_Money\n    recurringCurrency: Currency\n    recurringBillingCycle: BillingCycle\n    recurringDiscount: DiscountServiceInfoInput\n}",
              reducer:
                'if (state.status !== "PENDING" && state.status !== "ACTIVE") {\n  throw new SubscriptionNotActiveAddServiceError(`Cannot add service when status is ${state.status}`);\n}\nconst service = {\n  id: action.input.serviceId,\n  name: action.input.name || null,\n  description: action.input.description || null,\n  customValue: action.input.customValue || null,\n  facetSelections: [],\n  setupCost: action.input.setupAmount && action.input.setupCurrency ? {\n    amount: action.input.setupAmount,\n    currency: action.input.setupCurrency,\n    billingDate: action.input.setupBillingDate || null\n  } : null,\n  recurringCost: action.input.recurringAmount && action.input.recurringCurrency && action.input.recurringBillingCycle ? {\n    amount: action.input.recurringAmount,\n    currency: action.input.recurringCurrency,\n    billingCycle: action.input.recurringBillingCycle,\n    nextBillingDate: action.input.recurringNextBillingDate || null\n    discount: action.input.recurringDiscount ? {\n      originalAmount: action.input.recurringDiscount.originalAmount,\n      discountType: action.input.recurringDiscount.discountType,\n      discountValue: action.input.recurringDiscount.discountValue,\n      source: action.input.recurringDiscount.source,\n    } : null,\n  } : null,\n  metrics: [],\n};\nstate.services.push(service);',
              examples: [],
              template: "Add a standalone service",
              description: "Add a standalone service",
            },
            {
              id: "op-remove-service",
              name: "REMOVE_SERVICE",
              scope: "global",
              errors: [
                {
                  id: "err-remove-service-not-found",
                  code: "REMOVE_SERVICE_NOT_FOUND",
                  name: "RemoveServiceNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-not-active-remove-service",
                  name: "SubscriptionNotActiveRemoveServiceError",
                  code: "SUBSCRIPTION_NOT_ACTIVE_REMOVE_SERVICE",
                  description:
                    "Status must be PENDING or ACTIVE to remove a service",
                  template: "",
                },
              ],
              schema: "input RemoveServiceInput {\n    serviceId: OID!\n}",
              reducer:
                'if (state.status !== "PENDING" && state.status !== "ACTIVE") {\n  throw new SubscriptionNotActiveRemoveServiceError(`Cannot remove service when status is ${state.status}`);\n}\nconst index = state.services.findIndex((s) => s.id === action.input.serviceId);\nif (index === -1) {\n  throw new RemoveServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nstate.services.splice(index, 1);',
              examples: [],
              template: "Remove a standalone service",
              description: "Remove a standalone service",
            },
            {
              id: "op-update-service-setup-cost",
              name: "UPDATE_SERVICE_SETUP_COST",
              scope: "global",
              errors: [
                {
                  id: "err-update-service-setup-cost-not-found",
                  code: "UPDATE_SERVICE_SETUP_COST_NOT_FOUND",
                  name: "UpdateServiceSetupCostNotFoundError",
                  template: "",
                  description: "",
                },
              ],
              schema:
                "input UpdateServiceSetupCostInput {\n    serviceId: OID!\n    amount: Amount_Money\n    currency: Currency\n}",
              reducer:
                "const svc = state.services.find((s) => s.id === action.input.serviceId);\nif (!svc) {\n  throw new UpdateServiceSetupCostNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nif (action.input.amount && action.input.currency) {\n  svc.setupCost = {\n    amount: action.input.amount,\n    currency: action.input.currency,\n    billingDate: action.input.billingDate || null\n  };\n} else if (svc.setupCost) {\n  if (action.input.amount) svc.setupCost.amount = action.input.amount;\n  if (action.input.currency) svc.setupCost.currency = action.input.currency;\n  if (action.input.billingDate !== undefined) svc.setupCost.billingDate = action.input.billingDate || null;\n}",
              examples: [],
              template: "Update setup cost for a service",
              description: "Update setup cost for a service",
            },
            {
              id: "op-update-service-recurring-cost",
              name: "UPDATE_SERVICE_RECURRING_COST",
              scope: "global",
              errors: [
                {
                  id: "err-update-service-recurring-cost-not-found",
                  code: "UPDATE_SERVICE_RECURRING_COST_NOT_FOUND",
                  name: "UpdateServiceRecurringCostNotFoundError",
                  template: "",
                  description: "",
                },
              ],
              schema:
                "input UpdateServiceRecurringCostInput {\n    serviceId: OID!\n    amount: Amount_Money\n    currency: Currency\n    billingCycle: BillingCycle\n    nextBillingDate: DateTime\n}",
              reducer:
                "const svc = state.services.find((s) => s.id === action.input.serviceId);\nif (!svc) {\n  throw new UpdateServiceRecurringCostNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nif (action.input.amount && action.input.currency && action.input.billingCycle) {\n  svc.recurringCost = {\n    amount: action.input.amount,\n    currency: action.input.currency,\n    billingCycle: action.input.billingCycle,\n    nextBillingDate: action.input.nextBillingDate || null\n    discount: svc.recurringCost?.discount || null,\n  };\n} else if (svc.recurringCost) {\n  if (action.input.amount) svc.recurringCost.amount = action.input.amount;\n  if (action.input.currency) svc.recurringCost.currency = action.input.currency;\n  if (action.input.billingCycle) svc.recurringCost.billingCycle = action.input.billingCycle;\n  if (action.input.nextBillingDate !== undefined) svc.recurringCost.nextBillingDate = action.input.nextBillingDate || null;\n}",
              examples: [],
              template: "Update recurring cost for a service",
              description: "Update recurring cost for a service",
            },
            {
              id: "op-update-service-info",
              name: "UPDATE_SERVICE_INFO",
              scope: "global",
              errors: [
                {
                  id: "err-update-service-info-not-found",
                  code: "UPDATE_SERVICE_INFO_NOT_FOUND",
                  name: "UpdateServiceInfoNotFoundError",
                  template: "",
                  description: "",
                },
              ],
              schema:
                "input UpdateServiceInfoInput {\n    serviceId: OID!\n    name: String\n    description: String\n    customValue: String\n}",
              reducer:
                "const svc = state.services.find((s) => s.id === action.input.serviceId);\nif (!svc) {\n  throw new UpdateServiceInfoNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nif (action.input.name !== undefined) svc.name = action.input.name || null;\nif (action.input.description !== undefined) svc.description = action.input.description || null;\nif (action.input.customValue !== undefined) svc.customValue = action.input.customValue || null;",
              examples: [],
              template: "Update service name, description, custom value",
              description: "Update service name, description, custom value",
            },
            {
              id: "op-add-service-facet-selection",
              name: "ADD_SERVICE_FACET_SELECTION",
              scope: "global",
              errors: [
                {
                  id: "err-add-facet-service-not-found",
                  code: "ADD_FACET_SERVICE_NOT_FOUND",
                  name: "AddServiceFacetSelectionServiceNotFoundError",
                  template: "",
                  description: "",
                },
              ],
              schema:
                "input AddServiceFacetSelectionInput {\n    serviceId: OID!\n    facetSelectionId: OID!\n    facetName: String!\n    selectedOption: String!\n}",
              reducer:
                "const svc = state.services.find((s) => s.id === action.input.serviceId);\nif (!svc) {\n  throw new AddServiceFacetSelectionServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nsvc.facetSelections.push({\n  id: action.input.facetSelectionId,\n  facetName: action.input.facetName,\n  selectedOption: action.input.selectedOption,\n});",
              examples: [],
              template: "Add facet selection to a service",
              description: "Add facet selection to a service",
            },
            {
              id: "op-remove-service-facet-selection",
              name: "REMOVE_SERVICE_FACET_SELECTION",
              scope: "global",
              errors: [
                {
                  id: "err-remove-facet-service-not-found",
                  code: "REMOVE_FACET_SERVICE_NOT_FOUND",
                  name: "RemoveServiceFacetSelectionServiceNotFoundError",
                  template: "",
                  description: "",
                },
              ],
              schema:
                "input RemoveServiceFacetSelectionInput {\n    serviceId: OID!\n    facetSelectionId: OID!\n}",
              reducer:
                "const svc = state.services.find((s) => s.id === action.input.serviceId);\nif (!svc) {\n  throw new RemoveServiceFacetSelectionServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nconst index = svc.facetSelections.findIndex((fs) => fs.id === action.input.facetSelectionId);\nif (index !== -1) {\n  svc.facetSelections.splice(index, 1);\n}",
              examples: [],
              template: "Remove facet selection from a service",
              description: "Remove facet selection from a service",
            },
          ],
          description:
            "Standalone service CRUD, cost management, facet selections, and payment tracking",
        },
        {
          id: "mod-service-group",
          name: "service-group",
          operations: [
            {
              id: "op-add-service-group",
              name: "ADD_SERVICE_GROUP",
              scope: "global",
              errors: [
                {
                  id: "err-structural-add-group",
                  name: "StructuralChangeNotAllowedAddGroupError",
                  code: "STRUCTURAL_CHANGE_NOT_ALLOWED_ADD_GROUP",
                  description:
                    "Status must be PENDING for structural changes \u2014 cannot add service groups to an active subscription",
                  template: "",
                },
              ],
              schema:
                "input AddServiceGroupInput {\n    groupId: OID!\n    name: String!\n    optional: Boolean!\n    costType: GroupCostType\n    setupAmount: Amount_Money\n    setupCurrency: Currency\n    recurringAmount: Amount_Money\n    recurringCurrency: Currency\n    recurringBillingCycle: BillingCycle\n    recurringDiscount: DiscountServiceInfoInput\n    effectiveDate: DateTime!\n    setupSliceId: OID!\n    recurringSliceId: OID!\n}",
              reducer:
                '// D-6 revised: PENDING or ACTIVE \u2014 groups carry pricing, proration applies\nif (state.status !== "PENDING" && state.status !== "ACTIVE") {\n  throw new StructuralChangeNotAllowedAddGroupError(\n    `Cannot add service group when status is ${state.status}`,\n  );\n}\nstate.serviceGroups.push({\n  id: action.input.groupId,\n  name: action.input.name,\n  optional: action.input.optional,\n  costType: action.input.costType || null,\n  setupCost:\n    action.input.setupAmount && action.input.setupCurrency\n      ? {\n          amount: action.input.setupAmount,\n          currency: action.input.setupCurrency\n        }\n      : null,\n  recurringCost:\n    action.input.recurringAmount &&\n    action.input.recurringCurrency &&\n    action.input.recurringBillingCycle\n      ? {\n          amount: action.input.recurringAmount,\n          currency: action.input.recurringCurrency,\n          billingCycle: action.input.recurringBillingCycle\n          discount: action.input.recurringDiscount\n            ? {\n                originalAmount: action.input.recurringDiscount.originalAmount,\n                discountType: action.input.recurringDiscount.discountType,\n                discountValue: action.input.recurringDiscount.discountValue,\n                source: action.input.recurringDiscount.source,\n              }\n            : null,\n        }\n      : null,\n  services: [],\n});\n\n// Slice emission only when ACTIVE \u2014 PENDING groups get their slices at\n// activation time. D-1: setup hits in full, recurring is prorated.\nif (state.status === "ACTIVE") {\n  const chargedAt = action.input.effectiveDate;\n  if (action.input.setupAmount && action.input.setupCurrency) {\n    appendDebtSlice(state, {\n      id: action.input.setupSliceId,\n      origin: "SETUP",\n      status: "CHARGED",\n      invoiced: false,\n      debitAmount: action.input.setupAmount,\n      settledAmount: 0,\n      currency: action.input.setupCurrency,\n      chargedAt,\n      invoicedAt: null,\n      fullyPaidAt: null,\n      sourceServiceId: null,\n      sourceMetricId: null,\n      sourceGroupId: action.input.groupId,\n      frozen: true,\n      accrualPeriodStart: null,\n      invoiceRef: null,\n      lastPaymentRef: null,\n      description: `Setup fee \u2014 group ${action.input.name} (mid-cycle add)`,\n    });\n  }\n  if (\n    action.input.recurringAmount &&\n    action.input.recurringCurrency &&\n    state.currentBillingCycleStart &&\n    state.nextBillingDate\n  ) {\n    const proratedCost = calculateProratedCost(\n      action.input.recurringAmount,\n      state.currentBillingCycleStart,\n      state.nextBillingDate,\n      action.input.effectiveDate,\n    );\n    if (proratedCost > 0) {\n      appendDebtSlice(state, {\n        id: action.input.recurringSliceId,\n        origin: "SUBSCRIPTION_FEE",\n        status: "CHARGED",\n        invoiced: false,\n        debitAmount: proratedCost,\n        settledAmount: 0,\n        currency: action.input.recurringCurrency,\n        chargedAt,\n        invoicedAt: null,\n        fullyPaidAt: null,\n        sourceServiceId: null,\n        sourceMetricId: null,\n        sourceGroupId: action.input.groupId,\n        frozen: true,\n        accrualPeriodStart: null,\n        invoiceRef: null,\n        lastPaymentRef: null,\n        description: `Prorated recurring fee \u2014 group ${action.input.name} (mid-cycle add)`,\n      });\n    }\n  }\n}',
              examples: [],
              template: "Add a service group",
              description: "Add a service group",
            },
            {
              id: "op-remove-service-group",
              name: "REMOVE_SERVICE_GROUP",
              scope: "global",
              errors: [
                {
                  id: "err-remove-group-not-found",
                  code: "REMOVE_GROUP_NOT_FOUND",
                  name: "RemoveServiceGroupNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-structural-remove-group",
                  name: "StructuralChangeNotAllowedRemoveGroupError",
                  code: "STRUCTURAL_CHANGE_NOT_ALLOWED_REMOVE_GROUP",
                  description:
                    "Status must be PENDING for structural changes \u2014 cannot remove service groups from an active subscription",
                  template: "",
                },
              ],
              schema:
                "input RemoveServiceGroupInput {\n    groupId: OID!\n    effectiveDate: DateTime!\n    creditSliceId: OID!\n}",
              reducer:
                'if (state.status !== "PENDING" && state.status !== "ACTIVE") {\n  throw new StructuralChangeNotAllowedRemoveGroupError(\n    `Cannot remove service group when status is ${state.status}`,\n  );\n}\nconst index = state.serviceGroups.findIndex(\n  (g) => g.id === action.input.groupId,\n);\nif (index === -1) {\n  throw new RemoveServiceGroupNotFoundError(\n    `Service group with ID ${action.input.groupId} not found`,\n  );\n}\nconst group = state.serviceGroups[index];\n\n// D-2: Mid-cycle prorated credit modeled as negative-debit slice.\n// Born FULLY_PAID (no operator workflow applies to credits).\nif (\n  state.status === "ACTIVE" &&\n  group.recurringCost &&\n  state.currentBillingCycleStart &&\n  state.nextBillingDate\n) {\n  const proratedCredit = calculateProratedCost(\n    group.recurringCost.amount,\n    state.currentBillingCycleStart,\n    state.nextBillingDate,\n    action.input.effectiveDate,\n  );\n  if (proratedCredit > 0) {\n    appendDebtSlice(state, {\n      id: action.input.creditSliceId,\n      origin: "SUBSCRIPTION_FEE",\n      status: "FULLY_PAID",\n      invoiced: true,\n      debitAmount: -proratedCredit,\n      settledAmount: 0,\n      currency: group.recurringCost.currency,\n      chargedAt: action.input.effectiveDate,\n      invoicedAt: action.input.effectiveDate,\n      fullyPaidAt: action.input.effectiveDate,\n      sourceServiceId: null,\n      sourceMetricId: null,\n      sourceGroupId: action.input.groupId,\n      frozen: true,\n      accrualPeriodStart: null,\n      invoiceRef: null,\n      lastPaymentRef: null,\n      description: `Prorated credit \u2014 group ${group.name} removed mid-cycle`,\n    });\n  }\n}\n\nstate.serviceGroups.splice(index, 1);',
              examples: [],
              template: "Remove a service group",
              description: "Remove a service group",
            },
            {
              id: "op-add-service-to-group",
              name: "ADD_SERVICE_TO_GROUP",
              scope: "global",
              errors: [
                {
                  id: "err-add-to-group-not-found",
                  code: "ADD_TO_GROUP_NOT_FOUND",
                  name: "AddServiceToGroupGroupNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-not-active-add-to-group",
                  name: "SubscriptionNotActiveAddToGroupError",
                  code: "SUBSCRIPTION_NOT_ACTIVE_ADD_TO_GROUP",
                  description:
                    "Status must be PENDING or ACTIVE to add a service to a group",
                  template: "",
                },
              ],
              schema:
                "input AddServiceToGroupInput {\n    groupId: OID!\n    serviceId: OID!\n    name: String\n    description: String\n    customValue: String\n    setupAmount: Amount_Money\n    setupCurrency: Currency\n    recurringAmount: Amount_Money\n    recurringCurrency: Currency\n    recurringBillingCycle: BillingCycle\n}",
              reducer:
                'if (state.status !== "PENDING" && state.status !== "ACTIVE") {\n  throw new SubscriptionNotActiveAddToGroupError(`Cannot add service to group when status is ${state.status}`);\n}\nconst group = state.serviceGroups.find((g) => g.id === action.input.groupId);\nif (!group) {\n  throw new AddServiceToGroupGroupNotFoundError(`Service group with ID ${action.input.groupId} not found`);\n}\ngroup.services.push({\n  id: action.input.serviceId,\n  name: action.input.name || null,\n  description: action.input.description || null,\n  customValue: action.input.customValue || null,\n  facetSelections: [],\n  setupCost: action.input.setupAmount && action.input.setupCurrency ? {\n    amount: action.input.setupAmount,\n    currency: action.input.setupCurrency,\n    billingDate: action.input.setupBillingDate || null\n  } : null,\n  recurringCost: action.input.recurringAmount && action.input.recurringCurrency && action.input.recurringBillingCycle ? {\n    amount: action.input.recurringAmount,\n    currency: action.input.recurringCurrency,\n    billingCycle: action.input.recurringBillingCycle,\n    nextBillingDate: action.input.recurringNextBillingDate || null\n    discount: null,\n  } : null,\n  metrics: [],\n});',
              examples: [],
              template: "Add a service to a group",
              description: "Add a service to a group",
            },
            {
              id: "op-remove-service-from-group",
              name: "REMOVE_SERVICE_FROM_GROUP",
              scope: "global",
              errors: [
                {
                  id: "err-remove-from-group-not-found",
                  code: "REMOVE_FROM_GROUP_NOT_FOUND",
                  name: "RemoveServiceFromGroupGroupNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-remove-from-group-service-not-found",
                  code: "REMOVE_FROM_GROUP_SERVICE_NOT_FOUND",
                  name: "RemoveServiceFromGroupServiceNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-not-active-remove-from-group",
                  name: "SubscriptionNotActiveRemoveFromGroupError",
                  code: "SUBSCRIPTION_NOT_ACTIVE_REMOVE_FROM_GROUP",
                  description:
                    "Status must be PENDING or ACTIVE to remove a service from a group",
                  template: "",
                },
              ],
              schema:
                "input RemoveServiceFromGroupInput {\n    groupId: OID!\n    serviceId: OID!\n}",
              reducer:
                'if (state.status !== "PENDING" && state.status !== "ACTIVE") {\n  throw new SubscriptionNotActiveRemoveFromGroupError(`Cannot remove service from group when status is ${state.status}`);\n}\nconst group = state.serviceGroups.find((g) => g.id === action.input.groupId);\nif (!group) {\n  throw new RemoveServiceFromGroupGroupNotFoundError(`Service group with ID ${action.input.groupId} not found`);\n}\nconst index = group.services.findIndex((s) => s.id === action.input.serviceId);\nif (index === -1) {\n  throw new RemoveServiceFromGroupServiceNotFoundError(`Service with ID ${action.input.serviceId} not found in group ${action.input.groupId}`);\n}\ngroup.services.splice(index, 1);',
              examples: [],
              template: "Remove a service from a group",
              description: "Remove a service from a group",
            },
            {
              id: "op-update-service-group-cost",
              name: "UPDATE_SERVICE_GROUP_COST",
              scope: "global",
              errors: [
                {
                  id: "err-update-group-cost-not-found",
                  code: "UPDATE_GROUP_COST_NOT_FOUND",
                  name: "UpdateServiceGroupCostNotFoundError",
                  template: "",
                  description: "",
                },
              ],
              schema:
                "input UpdateServiceGroupCostInput {\n    groupId: OID!\n    setupAmount: Amount_Money\n    setupCurrency: Currency\n    recurringAmount: Amount_Money\n    recurringCurrency: Currency\n    recurringBillingCycle: BillingCycle\n}",
              reducer:
                "const group = state.serviceGroups.find((g) => g.id === action.input.groupId);\nif (!group) {\n  throw new UpdateServiceGroupCostNotFoundError(`Service group with ID ${action.input.groupId} not found`);\n}\nif (action.input.setupAmount && action.input.setupCurrency) {\n  group.setupCost = {\n    amount: action.input.setupAmount,\n    currency: action.input.setupCurrency,\n    billingDate: action.input.setupBillingDate || null\n  };\n} else if (group.setupCost) {\n  if (action.input.setupAmount) group.setupCost.amount = action.input.setupAmount;\n  if (action.input.setupCurrency) group.setupCost.currency = action.input.setupCurrency;\n  if (action.input.setupBillingDate !== undefined) group.setupCost.billingDate = action.input.setupBillingDate || null;\n}\nif (action.input.recurringAmount && action.input.recurringCurrency && action.input.recurringBillingCycle) {\n  group.recurringCost = {\n    amount: action.input.recurringAmount,\n    currency: action.input.recurringCurrency,\n    billingCycle: action.input.recurringBillingCycle,\n    nextBillingDate: group.recurringCost?.nextBillingDate || null\n    discount: group.recurringCost?.discount || null,\n  };\n} else if (group.recurringCost) {\n  if (action.input.recurringAmount) group.recurringCost.amount = action.input.recurringAmount;\n  if (action.input.recurringCurrency) group.recurringCost.currency = action.input.recurringCurrency;\n  if (action.input.recurringBillingCycle) group.recurringCost.billingCycle = action.input.recurringBillingCycle;\n}",
              examples: [],
              template: "Update group setup and recurring costs",
              description: "Update group setup and recurring costs",
            },
          ],
          description:
            "Service group management and grouped service operations",
        },
        {
          id: "mod-metrics",
          name: "metrics",
          operations: [
            {
              id: "op-add-service-metric",
              name: "ADD_SERVICE_METRIC",
              scope: "global",
              errors: [
                {
                  id: "err-add-metric-service-not-found",
                  code: "ADD_METRIC_SERVICE_NOT_FOUND",
                  name: "AddServiceMetricServiceNotFoundError",
                  template: "",
                  description: "",
                },
              ],
              schema:
                "input AddServiceMetricInput {\n    serviceId: OID!\n    metricId: OID!\n    name: String!\n    unitName: String!\n    freeLimit: Int\n    paidLimit: Int\n    currentUsage: Int!\n    metricType: MetricType!\n    accrualCycle: AccrualCycle!\n    unitCostAmount: Amount_Money\n    unitCostCurrency: Currency\n    unitCostBillingCycle: BillingCycle\n    lastAccrualDate: DateTime\n}",
              reducer:
                "function findSvc(serviceId) {\n  const flat = state.services.find((s) => s.id === serviceId);\n  if (flat) return flat;\n  for (const group of state.serviceGroups) {\n    const grouped = group.services.find((s) => s.id === serviceId);\n    if (grouped) return grouped;\n  }\n  return undefined;\n}\nconst svc = findSvc(action.input.serviceId);\nif (!svc) {\n  throw new AddServiceMetricServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nsvc.metrics.push({\n  id: action.input.metricId,\n  name: action.input.name,\n  unitName: action.input.unitName,\n  freeLimit: action.input.freeLimit || null,\n  paidLimit: action.input.paidLimit || null,\n  unitCost: action.input.unitCostAmount && action.input.unitCostCurrency && action.input.unitCostBillingCycle ? {\n    amount: action.input.unitCostAmount,\n    currency: action.input.unitCostCurrency,\n    billingCycle: action.input.unitCostBillingCycle\n    discount: null,\n  } : null,\n  currentUsage: action.input.currentUsage,\n  metricType: action.input.metricType,\n  accrualCycle: action.input.accrualCycle,\n  lastAccrualDate: action.input.lastAccrualDate || null,\n});",
              examples: [],
              template: "Add a metric to a service",
              description: "Add a metric to a service",
            },
            {
              id: "op-update-metric",
              name: "UPDATE_METRIC",
              scope: "global",
              errors: [
                {
                  id: "err-update-metric-service-not-found",
                  code: "UPDATE_METRIC_SERVICE_NOT_FOUND",
                  name: "UpdateMetricServiceNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-update-metric-not-found",
                  code: "UPDATE_METRIC_NOT_FOUND",
                  name: "UpdateMetricNotFoundError",
                  template: "",
                  description: "",
                },
              ],
              schema:
                "input UpdateMetricInput {\n    serviceId: OID!\n    metricId: OID!\n    name: String\n    unitName: String\n    freeLimit: Int\n    paidLimit: Int\n    metricType: MetricType\n    accrualCycle: AccrualCycle\n    lastAccrualDate: DateTime\n}",
              reducer:
                "function findSvc(serviceId) {\n  const flat = state.services.find((s) => s.id === serviceId);\n  if (flat) return flat;\n  for (const group of state.serviceGroups) {\n    const grouped = group.services.find((s) => s.id === serviceId);\n    if (grouped) return grouped;\n  }\n  return undefined;\n}\nconst svc = findSvc(action.input.serviceId);\nif (!svc) {\n  throw new UpdateMetricServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nconst metric = svc.metrics.find((m) => m.id === action.input.metricId);\nif (!metric) {\n  throw new UpdateMetricNotFoundError(`Metric with ID ${action.input.metricId} not found`);\n}\nif (action.input.name) metric.name = action.input.name;\nif (action.input.unitName) metric.unitName = action.input.unitName;\nif (action.input.freeLimit !== undefined) metric.freeLimit = action.input.freeLimit || null;\nif (action.input.paidLimit !== undefined) metric.paidLimit = action.input.paidLimit || null;\nif (action.input.metricType) metric.metricType = action.input.metricType;\nif (action.input.accrualCycle) metric.accrualCycle = action.input.accrualCycle;\nif (action.input.lastAccrualDate) metric.lastAccrualDate = action.input.lastAccrualDate;",
              examples: [],
              template: "Update metric configuration",
              description: "Update metric configuration",
            },
            {
              id: "op-update-metric-usage",
              name: "UPDATE_METRIC_USAGE",
              scope: "global",
              errors: [
                {
                  id: "err-update-usage-service-not-found",
                  code: "UPDATE_USAGE_SERVICE_NOT_FOUND",
                  name: "UpdateMetricUsageServiceNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-update-usage-metric-not-found",
                  code: "UPDATE_USAGE_METRIC_NOT_FOUND",
                  name: "UpdateMetricUsageNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-not-active-update-usage",
                  name: "SubscriptionNotActiveUpdateUsageError",
                  code: "SUBSCRIPTION_NOT_ACTIVE_UPDATE_USAGE",
                  description: "Status must be ACTIVE to update metric usage",
                  template: "",
                },
              ],
              schema:
                "input UpdateMetricUsageInput {\n    serviceId: OID!\n    metricId: OID!\n    currentTime: DateTime!\n    currentUsage: Int!\n    isAdjustment: Boolean\n    newSliceId: OID!\n}",
              reducer:
                'if (state.status !== "ACTIVE") {\n  throw new SubscriptionNotActiveUpdateUsageError(\n    `Cannot update metric usage when status is ${state.status}`,\n  );\n}\nconst svc = findServiceById(\n  action.input.serviceId,\n  state.services,\n  state.serviceGroups,\n);\nif (!svc) {\n  throw new UpdateMetricUsageServiceNotFoundError(\n    `Service with ID ${action.input.serviceId} not found`,\n  );\n}\nconst metric = svc.metrics.find((m) => m.id === action.input.metricId);\nif (!metric) {\n  throw new UpdateMetricUsageNotFoundError(\n    `Metric with ID ${action.input.metricId} not found`,\n  );\n}\nif (action.input.isAdjustment === true) {\n  metric.currentUsage = action.input.currentUsage;\n} else {\n  metric.currentUsage =\n    metric.paidLimit != null\n      ? Math.min(action.input.currentUsage, metric.paidLimit)\n      : action.input.currentUsage;\n}\n// Live-update DYNAMIC slice for this metric.\nconst newCost = calculateOverageCost(metric);\nconst active = findActiveDynamicSlice(state, metric.id);\nif (active) {\n  updateDynamicSliceAmount(state, active, newCost);\n} else if (newCost > 0) {\n  appendDebtSlice(state, {\n    id: action.input.newSliceId,\n    origin: "DYNAMIC",\n    status: "CHARGED",\n    invoiced: false,\n    debitAmount: newCost,\n    settledAmount: 0,\n    currency: metric.unitCost?.currency ?? state.globalCurrency ?? "USD",\n    chargedAt: action.input.currentTime,\n    invoicedAt: null,\n    fullyPaidAt: null,\n    sourceServiceId: null,\n    sourceMetricId: metric.id,\n    sourceGroupId: null,\n    frozen: false,\n    accrualPeriodStart: currentAccrualPeriodStart(metric, action.input.currentTime),\n    invoiceRef: null,\n    lastPaymentRef: null,\n    description: `Overage \u2014 metric ${metric.name}`,\n  });\n}',
              examples: [],
              template: "Set metric usage directly",
              description: "Set metric usage directly",
            },
            {
              id: "op-remove-service-metric",
              name: "REMOVE_SERVICE_METRIC",
              scope: "global",
              errors: [
                {
                  id: "err-remove-metric-service-not-found",
                  code: "REMOVE_METRIC_SERVICE_NOT_FOUND",
                  name: "RemoveServiceMetricServiceNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-remove-metric-not-found",
                  code: "REMOVE_METRIC_NOT_FOUND",
                  name: "RemoveServiceMetricNotFoundError",
                  template: "",
                  description: "",
                },
              ],
              schema:
                "input RemoveServiceMetricInput {\n    serviceId: OID!\n    metricId: OID!\n}",
              reducer:
                "function findSvc(serviceId) {\n  const flat = state.services.find((s) => s.id === serviceId);\n  if (flat) return flat;\n  for (const group of state.serviceGroups) {\n    const grouped = group.services.find((s) => s.id === serviceId);\n    if (grouped) return grouped;\n  }\n  return undefined;\n}\nconst svc = findSvc(action.input.serviceId);\nif (!svc) {\n  throw new RemoveServiceMetricServiceNotFoundError(`Service with ID ${action.input.serviceId} not found`);\n}\nconst index = svc.metrics.findIndex((m) => m.id === action.input.metricId);\nif (index === -1) {\n  throw new RemoveServiceMetricNotFoundError(`Metric with ID ${action.input.metricId} not found`);\n}\nsvc.metrics.splice(index, 1);",
              examples: [],
              template: "Remove a metric from a service",
              description: "Remove a metric from a service",
            },
            {
              id: "op-increment-metric-usage",
              name: "INCREMENT_METRIC_USAGE",
              scope: "global",
              errors: [
                {
                  id: "err-increment-service-not-found",
                  code: "INCREMENT_SERVICE_NOT_FOUND",
                  name: "IncrementMetricUsageServiceNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-increment-metric-not-found",
                  code: "INCREMENT_METRIC_NOT_FOUND",
                  name: "IncrementMetricUsageNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-not-active-increment-usage",
                  name: "SubscriptionNotActiveIncrementUsageError",
                  code: "SUBSCRIPTION_NOT_ACTIVE_INCREMENT_USAGE",
                  description:
                    "Status must be ACTIVE to increment metric usage",
                  template: "",
                },
              ],
              schema:
                "input IncrementMetricUsageInput {\n    serviceId: OID!\n    metricId: OID!\n    currentTime: DateTime!\n    incrementBy: Int!\n    newSliceId: OID!\n}",
              reducer:
                'if (state.status !== "ACTIVE") {\n  throw new SubscriptionNotActiveIncrementUsageError(\n    `Cannot increment metric usage when status is ${state.status}`,\n  );\n}\nconst svc = findServiceById(\n  action.input.serviceId,\n  state.services,\n  state.serviceGroups,\n);\nif (!svc) {\n  throw new IncrementMetricUsageServiceNotFoundError(\n    `Service with ID ${action.input.serviceId} not found`,\n  );\n}\nconst metric = svc.metrics.find((m) => m.id === action.input.metricId);\nif (!metric) {\n  throw new IncrementMetricUsageNotFoundError(\n    `Metric with ID ${action.input.metricId} not found`,\n  );\n}\nconst newUsage = metric.currentUsage + action.input.incrementBy;\nmetric.currentUsage =\n  metric.paidLimit != null\n    ? Math.min(newUsage, metric.paidLimit)\n    : newUsage;\nconst newCost = calculateOverageCost(metric);\nconst active = findActiveDynamicSlice(state, metric.id);\nif (active) {\n  updateDynamicSliceAmount(state, active, newCost);\n} else if (newCost > 0) {\n  appendDebtSlice(state, {\n    id: action.input.newSliceId,\n    origin: "DYNAMIC",\n    status: "CHARGED",\n    invoiced: false,\n    debitAmount: newCost,\n    settledAmount: 0,\n    currency: metric.unitCost?.currency ?? state.globalCurrency ?? "USD",\n    chargedAt: action.input.currentTime,\n    invoicedAt: null,\n    fullyPaidAt: null,\n    sourceServiceId: null,\n    sourceMetricId: metric.id,\n    sourceGroupId: null,\n    frozen: false,\n    accrualPeriodStart: currentAccrualPeriodStart(metric, action.input.currentTime),\n    invoiceRef: null,\n    lastPaymentRef: null,\n    description: `Overage \u2014 metric ${metric.name}`,\n  });\n}',
              examples: [],
              template: "Increment usage counter",
              description: "Increment usage counter",
            },
            {
              id: "op-decrement-metric-usage",
              name: "DECREMENT_METRIC_USAGE",
              scope: "global",
              errors: [
                {
                  id: "err-decrement-service-not-found",
                  code: "DECREMENT_SERVICE_NOT_FOUND",
                  name: "DecrementMetricUsageServiceNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-decrement-metric-not-found",
                  code: "DECREMENT_METRIC_NOT_FOUND",
                  name: "DecrementMetricUsageNotFoundError",
                  template: "",
                  description: "",
                },
                {
                  id: "err-not-active-decrement-usage",
                  name: "SubscriptionNotActiveDecrementUsageError",
                  code: "SUBSCRIPTION_NOT_ACTIVE_DECREMENT_USAGE",
                  description:
                    "Status must be ACTIVE to decrement metric usage",
                  template: "",
                },
              ],
              schema:
                "input DecrementMetricUsageInput {\n    serviceId: OID!\n    metricId: OID!\n    currentTime: DateTime!\n    decrementBy: Int!\n    newSliceId: OID!\n}",
              reducer:
                'if (state.status !== "ACTIVE") {\n  throw new SubscriptionNotActiveDecrementUsageError(\n    `Cannot decrement metric usage when status is ${state.status}`,\n  );\n}\nconst svc = findServiceById(\n  action.input.serviceId,\n  state.services,\n  state.serviceGroups,\n);\nif (!svc) {\n  throw new DecrementMetricUsageServiceNotFoundError(\n    `Service with ID ${action.input.serviceId} not found`,\n  );\n}\nconst metric = svc.metrics.find((m) => m.id === action.input.metricId);\nif (!metric) {\n  throw new DecrementMetricUsageNotFoundError(\n    `Metric with ID ${action.input.metricId} not found`,\n  );\n}\nmetric.currentUsage -= action.input.decrementBy;\nconst newCost = calculateOverageCost(metric);\nconst active = findActiveDynamicSlice(state, metric.id);\nif (active) {\n  updateDynamicSliceAmount(state, active, newCost);\n} else if (newCost > 0) {\n  appendDebtSlice(state, {\n    id: action.input.newSliceId,\n    origin: "DYNAMIC",\n    status: "CHARGED",\n    invoiced: false,\n    debitAmount: newCost,\n    settledAmount: 0,\n    currency: metric.unitCost?.currency ?? state.globalCurrency ?? "USD",\n    chargedAt: action.input.currentTime,\n    invoicedAt: null,\n    fullyPaidAt: null,\n    sourceServiceId: null,\n    sourceMetricId: metric.id,\n    sourceGroupId: null,\n    frozen: false,\n    accrualPeriodStart: currentAccrualPeriodStart(metric, action.input.currentTime),\n    invoiceRef: null,\n    lastPaymentRef: null,\n    description: `Overage \u2014 metric ${metric.name}`,\n  });\n}',
              examples: [],
              template: "Decrement usage counter",
              description: "Decrement usage counter",
            },
            {
              id: "op-reset-metric-cycle",
              name: "ACCRUE_METRIC_USAGE",
              description:
                "End an accrual cycle for one metric: crystallize currentUsage into debt, reset if CUMULATIVE.",
              schema:
                "input AccrueMetricUsageInput {\n    serviceId: OID!\n    metricId: OID!\n    accrualDate: DateTime!\n    newSliceIds: [OID!]!\n}",
              template: "Accrue metric usage and reset based on metricType",
              reducer:
                'if (state.status !== "ACTIVE") {\n  throw new SubscriptionNotActiveAccrueMetricUsageError(\n    `Cannot accrue metric usage when status is ${state.status}`,\n  );\n}\nconst svc = findServiceById(\n  action.input.serviceId,\n  state.services,\n  state.serviceGroups,\n);\nif (!svc) {\n  throw new AccrueMetricUsageServiceNotFoundError(\n    `Service with ID ${action.input.serviceId} not found`,\n  );\n}\nconst metric = svc.metrics.find((m) => m.id === action.input.metricId);\nif (!metric) {\n  throw new AccrueMetricUsageMetricNotFoundError(\n    `Metric with ID ${action.input.metricId} not found`,\n  );\n}\n\n// First-ever accrual on a metric without a `lastAccrualDate`: anchor it\n// to `accrualDate` and skip the charge.\nif (!metric.lastAccrualDate) {\n  metric.lastAccrualDate = action.input.accrualDate;\n  return;\n}\n\nlet nextBoundary = addAccrualPeriod(\n  metric.lastAccrualDate,\n  metric.accrualCycle,\n);\nconst sliceIdQueue = [...action.input.newSliceIds];\nfunction takeSliceId() {\n  const id = sliceIdQueue.shift();\n  if (!id) {\n    throw new AccrueMissingSliceIdError(\n      "Accrual loop exhausted pre-generated slice IDs",\n    );\n  }\n  return id;\n}\n\nlet iterations = 0;\nwhile (action.input.accrualDate >= nextBoundary && iterations < 10000) {\n  const periodStart = metric.lastAccrualDate;\n  const active = findActiveDynamicSlice(state, metric.id);\n  if (active) {\n    freezeDynamicSlice(state, active);\n  } else {\n    const cost = calculateOverageCost(metric);\n    if (cost > 0) {\n      appendDebtSlice(state, {\n        id: takeSliceId(),\n        origin: "DYNAMIC",\n        status: "CHARGED",\n        invoiced: false,\n        debitAmount: cost,\n        settledAmount: 0,\n        currency: metric.unitCost?.currency ?? state.globalCurrency ?? "USD",\n        chargedAt: nextBoundary,\n        invoicedAt: null,\n        fullyPaidAt: null,\n        sourceServiceId: null,\n        sourceMetricId: metric.id,\n        sourceGroupId: null,\n        frozen: true,\n        accrualPeriodStart: periodStart,\n        invoiceRef: null,\n        lastPaymentRef: null,\n        description: `Overage \u2014 metric ${metric.name} (period close)`,\n      });\n    }\n  }\n  if (metric.metricType === "CUMULATIVE") {\n    metric.currentUsage = 0;\n  }\n  metric.lastAccrualDate = nextBoundary;\n  nextBoundary = addAccrualPeriod(nextBoundary, metric.accrualCycle);\n  iterations += 1;\n}',
              errors: [
                {
                  id: "err-not-active-reset-metric-cycle",
                  name: "SubscriptionNotActiveAccrueMetricUsageError",
                  code: "SUBSCRIPTION_NOT_ACTIVE_ACCRUE_METRIC_USAGE",
                  description:
                    "Subscription must be ACTIVE to accrue metric usage",
                  template: "",
                },
                {
                  id: "err-reset-metric-service-not-found",
                  name: "AccrueMetricUsageServiceNotFoundError",
                  code: "ACCRUE_METRIC_USAGE_SERVICE_NOT_FOUND",
                  description:
                    "Service referenced by the accrual operation was not found",
                  template: "",
                },
                {
                  id: "err-reset-metric-not-found",
                  name: "AccrueMetricUsageMetricNotFoundError",
                  code: "ACCRUE_METRIC_USAGE_METRIC_NOT_FOUND",
                  description:
                    "Metric referenced by the accrual operation was not found",
                  template: "",
                },
                {
                  id: "err-accrue-missing-slice-id",
                  name: "AccrueMissingSliceIdError",
                  code: "ACCRUE_MISSING_SLICE_ID",
                  description:
                    "Accrual loop ran out of pre-generated slice IDs for period boundaries that closed with overage but no active slice",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
          ],
          description: "Service metric tracking and usage management",
        },
        {
          id: "mod-customer",
          name: "customer",
          operations: [
            {
              id: "op-set-customer-type",
              name: "SET_CUSTOMER_TYPE",
              scope: "global",
              errors: [],
              schema:
                "input SetCustomerTypeInput {\n    customerType: CustomerType!\n    teamMemberCount: Int\n}",
              reducer:
                "state.customerType = action.input.customerType;\nstate.teamMemberCount = action.input.teamMemberCount || null;",
              examples: [],
              template: "Set customer type (individual/team)",
              description: "Set customer type (individual/team)",
            },
            {
              id: "op-update-team-member-count",
              name: "UPDATE_TEAM_MEMBER_COUNT",
              scope: "global",
              errors: [],
              schema:
                "input UpdateTeamMemberCountInput {\n    teamMemberCount: Int!\n}",
              reducer: "state.teamMemberCount = action.input.teamMemberCount;",
              examples: [],
              template: "Update team member count",
              description: "Update team member count",
            },
          ],
          description: "Customer type and team member management",
        },
        {
          id: "mod-debt-line-items",
          name: "debt-line-items",
          description:
            "Operator-driven lifecycle ops for individual debt slices: status flips (CHARGED \u2192 INVOICED) and payment confirmation (\u2192 PARTIALLY_PAID / FULLY_PAID). Engine never auto-flips status \u2014 these are explicit operator actions per Q3 (2026-05-01).",
          operations: [
            {
              id: "op-mark-line-item-invoiced",
              name: "MARK_LINE_ITEM_INVOICED",
              description:
                "Operator-driven flip of a debt line item from CHARGED to INVOICED. Dispatched when an external invoice document is generated. The optional invoiceRef PHID points to that future invoice doc.",
              schema:
                "input MarkLineItemInvoicedInput {\n    lineItemId: OID!\n    invoicedAt: DateTime!\n    invoiceRef: PHID\n}",
              template: "Mark a debt line item as invoiced",
              reducer:
                "const slice = state.debtLineItems.find(s => s.id === action.input.lineItemId);\nif (!slice) {\n  throw new MarkLineItemNotFoundError(`No debt line item with id ${action.input.lineItemId}`);\n}\nif (slice.status !== 'CHARGED') {\n  throw new MarkLineItemInvalidStatusTransitionError(`Cannot invoice slice in status ${slice.status}; expected CHARGED`);\n}\nslice.status = 'INVOICED';\nslice.invoiced = true;\nslice.invoicedAt = action.input.invoicedAt;\nif (action.input.invoiceRef) {\n  slice.invoiceRef = action.input.invoiceRef;\n}\n// No aggregate change \u2014 debitAmount/settledAmount unchanged.",
              errors: [
                {
                  id: "err-mark-line-item-not-found",
                  name: "MarkLineItemNotFoundError",
                  code: "LINE_ITEM_NOT_FOUND_MARK_INVOICED",
                  description:
                    "No debt line item with the given lineItemId exists on this subscription.",
                  template: "",
                },
                {
                  id: "err-mark-line-item-invalid-status",
                  name: "MarkLineItemInvalidStatusTransitionError",
                  code: "INVALID_STATUS_TRANSITION_MARK_INVOICED",
                  description:
                    "Slice must be in CHARGED status to be marked INVOICED. Already-invoiced or paid slices cannot be re-flipped.",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-confirm-line-item-payment",
              name: "CONFIRM_LINE_ITEM_PAYMENT",
              description:
                "Operator-driven payment confirmation against a specific debt line item. Increments settledAmount and advances status (INVOICED \u2192 PARTIALLY_PAID \u2192 FULLY_PAID). Pre-MVP requirement: slice must be INVOICED first (no payment-before-invoice in MVP per Q3).",
              schema:
                "input ConfirmLineItemPaymentInput {\n    lineItemId: OID!\n    amount: Amount_Money!\n    paymentDate: DateTime!\n    paymentRef: PHID\n}",
              template: "Confirm a payment against a debt line item",
              reducer:
                'const slice = state.debtLineItems.find(\n  (s) => s.id === action.input.lineItemId,\n);\nif (!slice) {\n  throw new ConfirmLineItemNotFoundError(\n    `No debt line item with id ${action.input.lineItemId}`,\n  );\n}\nif (action.input.amount <= 0) {\n  throw new InvalidPaymentAmountError(\n    "Payment amount must be greater than zero",\n  );\n}\nif (slice.status === "CHARGED") {\n  throw new ConfirmLineItemInvalidStatusTransitionError(\n    "Slice must be INVOICED before payment can be confirmed",\n  );\n}\nif (slice.status === "FULLY_PAID") {\n  throw new ConfirmLineItemInvalidStatusTransitionError(\n    "Slice is already fully paid",\n  );\n}\nif (slice.settledAmount + action.input.amount > slice.debitAmount + 0.005) {\n  throw new OverPaymentError(\n    `Payment of ${action.input.amount} would exceed remaining ${slice.debitAmount - slice.settledAmount}`,\n  );\n}\nslice.settledAmount = slice.settledAmount + action.input.amount;\nstate.totalCredit = (state.totalCredit ?? 0) + action.input.amount;\nconst EPS = 0.005;\nif (slice.settledAmount >= slice.debitAmount - EPS) {\n  slice.settledAmount = slice.debitAmount;\n  slice.status = "FULLY_PAID";\n  slice.fullyPaidAt = action.input.paymentDate;\n} else {\n  slice.status = "PARTIALLY_PAID";\n}\nif (action.input.paymentRef) {\n  slice.lastPaymentRef = action.input.paymentRef;\n}',
              errors: [
                {
                  id: "err-confirm-line-item-not-found",
                  name: "ConfirmLineItemNotFoundError",
                  code: "LINE_ITEM_NOT_FOUND_CONFIRM_PAYMENT",
                  description:
                    "No debt line item with the given lineItemId exists on this subscription.",
                  template: "",
                },
                {
                  id: "err-confirm-line-item-invalid-status",
                  name: "ConfirmLineItemInvalidStatusTransitionError",
                  code: "INVALID_STATUS_TRANSITION_CONFIRM_PAYMENT",
                  description:
                    "Slice must be at least INVOICED before payment can be confirmed (and not already FULLY_PAID). Pre-MVP: payment-before-invoice not supported.",
                  template: "",
                },
                {
                  id: "err-confirm-line-item-overpayment",
                  name: "OverPaymentError",
                  code: "OVERPAYMENT",
                  description:
                    "Payment amount would push settledAmount above debitAmount. Use a smaller amount, or a credit adjustment for explicit overpayment.",
                  template: "",
                },
                {
                  id: "err-confirm-line-item-invalid-amount",
                  name: "InvalidPaymentAmountError",
                  code: "INVALID_PAYMENT_AMOUNT",
                  description: "Payment amount must be greater than zero.",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-report-payment",
              name: "REPORT_PAYMENT",
              description:
                "Bulk payment that allocates across outstanding debt slices via FIFO-within-priority (Setup \u2192 Subscription \u2192 Dynamic, oldest first).",
              schema:
                "input ReportPaymentInput {\n    amount: Amount_Money!\n    paymentDate: DateTime!\n    paymentRef: PHID\n}",
              template:
                "Bulk payment that allocates across outstanding debt slices via FIFO-within-priority (Setup \u2192 Subscription \u2192 Dynamic, oldest first).",
              reducer:
                'if (action.input.amount <= 0) {\n  throw new ReportPaymentInvalidAmountError(\n    "Payment amount must be greater than zero",\n  );\n}\nconst outstanding = state.debtLineItems.reduce((sum, s) => {\n  if (s.status === "FULLY_PAID") return sum;\n  return sum + Math.max(0, s.debitAmount - s.settledAmount);\n}, 0);\nif (outstanding <= 0) {\n  throw new ReportPaymentNoDebtError(\n    "No outstanding debt to allocate payment against",\n  );\n}\n\nconst ORIGIN_PRIORITY = {\n  SETUP: 0,\n  SUBSCRIPTION_FEE: 1,\n  DYNAMIC: 2,\n  ESTIMATED_USAGE: 3,\n  RECONCILIATION: 4,\n};\nconst queue = state.debtLineItems\n  .filter((s) => s.status !== "FULLY_PAID" && s.debitAmount - s.settledAmount > 0)\n  .slice()\n  .sort((a, b) => {\n    const ap = ORIGIN_PRIORITY[a.origin] ?? 99;\n    const bp = ORIGIN_PRIORITY[b.origin] ?? 99;\n    if (ap !== bp) return ap - bp;\n    return a.chargedAt < b.chargedAt ? -1 : 1;\n  });\n\nconst EPS = 0.005;\nlet remaining = action.input.amount;\nfor (const ref of queue) {\n  if (remaining <= 0) break;\n  const slice = state.debtLineItems.find((s) => s.id === ref.id);\n  if (!slice) continue;\n  const owed = slice.debitAmount - slice.settledAmount;\n  if (owed <= 0) continue;\n  const apply = Math.min(remaining, owed);\n  slice.settledAmount += apply;\n  remaining -= apply;\n  if (slice.status === "CHARGED") {\n    slice.status = "INVOICED";\n    slice.invoiced = true;\n    slice.invoicedAt = action.input.paymentDate;\n  }\n  if (slice.settledAmount >= slice.debitAmount - EPS) {\n    slice.settledAmount = slice.debitAmount;\n    slice.status = "FULLY_PAID";\n    slice.fullyPaidAt = action.input.paymentDate;\n  } else {\n    slice.status = "PARTIALLY_PAID";\n  }\n  if (action.input.paymentRef) {\n    slice.lastPaymentRef = action.input.paymentRef;\n  }\n}\nstate.totalCredit = (state.totalCredit ?? 0) + action.input.amount;',
              errors: [
                {
                  id: "err-report-payment-invalid-amount",
                  name: "ReportPaymentInvalidAmountError",
                  code: "REPORT_PAYMENT_INVALID_AMOUNT",
                  description: "Payment amount must be greater than zero",
                  template: "",
                },
                {
                  id: "err-report-payment-no-debt",
                  name: "ReportPaymentNoDebtError",
                  code: "REPORT_PAYMENT_NO_DEBT",
                  description:
                    "No outstanding debt to allocate payment against",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
            {
              id: "op-apply-credit",
              name: "APPLY_CREDIT",
              description:
                "Virtual payment that erases outstanding debt via the same FIFO-within-priority allocator. Used for refunds, goodwill credits, or operator adjustments.",
              schema:
                "input ApplyCreditInput {\n    amount: Amount_Money!\n    creditDate: DateTime!\n    reason: String!\n}",
              template:
                "Virtual payment that erases outstanding debt via the same FIFO-within-priority allocator. Used for refunds, goodwill credits, or operator adjustments.",
              reducer:
                'if (action.input.amount <= 0) {\n  throw new ApplyCreditInvalidAmountError(\n    "Credit amount must be greater than zero",\n  );\n}\nconst outstanding = state.debtLineItems.reduce((sum, s) => {\n  if (s.status === "FULLY_PAID") return sum;\n  return sum + Math.max(0, s.debitAmount - s.settledAmount);\n}, 0);\nif (outstanding <= 0) {\n  throw new ApplyCreditNoDebtError(\n    "No outstanding debt to allocate credit against",\n  );\n}\n\nconst ORIGIN_PRIORITY = {\n  SETUP: 0,\n  SUBSCRIPTION_FEE: 1,\n  DYNAMIC: 2,\n  ESTIMATED_USAGE: 3,\n  RECONCILIATION: 4,\n};\nconst queue = state.debtLineItems\n  .filter((s) => s.status !== "FULLY_PAID" && s.debitAmount - s.settledAmount > 0)\n  .slice()\n  .sort((a, b) => {\n    const ap = ORIGIN_PRIORITY[a.origin] ?? 99;\n    const bp = ORIGIN_PRIORITY[b.origin] ?? 99;\n    if (ap !== bp) return ap - bp;\n    return a.chargedAt < b.chargedAt ? -1 : 1;\n  });\n\nconst EPS = 0.005;\nlet remaining = action.input.amount;\nfor (const ref of queue) {\n  if (remaining <= 0) break;\n  const slice = state.debtLineItems.find((s) => s.id === ref.id);\n  if (!slice) continue;\n  const owed = slice.debitAmount - slice.settledAmount;\n  if (owed <= 0) continue;\n  const apply = Math.min(remaining, owed);\n  slice.settledAmount += apply;\n  remaining -= apply;\n  if (slice.status === "CHARGED") {\n    slice.status = "INVOICED";\n    slice.invoiced = true;\n    slice.invoicedAt = action.input.creditDate;\n  }\n  if (slice.settledAmount >= slice.debitAmount - EPS) {\n    slice.settledAmount = slice.debitAmount;\n    slice.status = "FULLY_PAID";\n    slice.fullyPaidAt = action.input.creditDate;\n  } else {\n    slice.status = "PARTIALLY_PAID";\n  }\n}\nstate.totalCredit = (state.totalCredit ?? 0) + action.input.amount;',
              errors: [
                {
                  id: "err-apply-credit-invalid-amount",
                  name: "ApplyCreditInvalidAmountError",
                  code: "APPLY_CREDIT_INVALID_AMOUNT",
                  description: "Credit amount must be greater than zero",
                  template: "",
                },
                {
                  id: "err-apply-credit-no-debt",
                  name: "ApplyCreditNoDebtError",
                  code: "APPLY_CREDIT_NO_DEBT",
                  description: "No outstanding debt to allocate credit against",
                  template: "",
                },
              ],
              examples: [],
              scope: "global",
            },
          ],
        },
      ],
      version: 1,
      changeLog: [],
    },
  ],
};
