import type { DocumentModelGlobalState } from "document-model";

export const documentModel: DocumentModelGlobalState = {
  id: "powerhouse/resource-template",
  name: "ResourceTemplate",
  author: {
    name: "Powerhouse",
    website: "https://www.powerhouse.inc/",
  },
  extension: "",
  description:
    "Document model for defining resource templates - the product-level configuration for service offerings. Contains core product information, target audiences, facet configurations, and service definitions that can be commercialized via Service Offerings",
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
            "type ResourceTemplateState {\n    id: PHID\n    operatorId: PHID\n    title: String!\n    summary: String!\n    description: String\n    thumbnailUrl: URL\n    infoLink: URL\n    status: TemplateStatus!\n    lastModified: DateTime\n    targetAudiences: [TargetAudience!]!\n    setupServices: [String!]!\n    recurringServices: [String!]!\n    facetTargets: [FacetTarget!]!\n    services: [Service!]!\n    optionGroups: [OptionGroup!]!\n    faqFields: [FaqField!]\n    contentSections: [ContentSection!]!\n    weight: Int\n    subtitle: String\n}\n\nenum TemplateStatus {\n    DRAFT\n    COMING_SOON\n    ACTIVE\n    DEPRECATED\n}\n\ntype TargetAudience {\n    id: OID!\n    label: String!\n    color: String\n}\n\ntype FacetTarget {\n    id: OID!\n    categoryKey: String!\n    categoryLabel: String!\n    selectedOptions: [String!]!\n}\n\ntype Service {\n    id: OID!\n    title: String!\n    description: String\n    displayOrder: Int\n    parentServiceId: OID\n    isSetupFormation: Boolean!\n    optionGroupId: OID\n    facetBindings: [ResourceFacetBinding!]!\n}\n\ntype ResourceFacetBinding {\n    id: OID!\n    facetName: String!\n    facetType: PHID!\n    supportedOptions: [OID!]!\n}\n\ntype OptionGroup {\n    id: OID!\n    name: String!\n    description: String\n    isAddOn: Boolean!\n    defaultSelected: Boolean!\n}\n\ntype FaqField {\n    id: OID!\n    question: String\n    answer: String\n    displayOrder: Int!\n}\n\ntype ContentSection {\n    id: OID!\n    title: String!\n    content: String!\n    displayOrder: Int!\n}",
          examples: [],
          initialValue:
            '{\n  "id": null,\n  "operatorId": null,\n  "title": "",\n  "summary": "",\n  "description": null,\n  "thumbnailUrl": null,\n  "infoLink": null,\n  "status": "DRAFT",\n  "lastModified": null,\n  "targetAudiences": [],\n  "setupServices": [],\n  "recurringServices": [],\n  "facetTargets": [],\n  "services": [],\n  "optionGroups": [],\n  "faqFields": [],\n  "contentSections": [],\n  "weight": null,\n  "subtitle": null\n}',
        },
      },
      modules: [
        {
          id: "template-management",
          name: "Template Management",
          operations: [
            {
              id: "update-template-info",
              name: "UPDATE_TEMPLATE_INFO",
              scope: "global",
              errors: [],
              schema:
                "input UpdateTemplateInfoInput {\n    title: String\n    summary: String\n    description: String\n    thumbnailUrl: URL\n    infoLink: URL\n    subtitle: String\n    lastModified: DateTime!\n}",
              reducer:
                "if (action.input.title) {\n    state.title = action.input.title;\n}\nif (action.input.summary) {\n    state.summary = action.input.summary;\n}\nif (action.input.description !== undefined) {\n    state.description = action.input.description || null;\n}\nif (action.input.thumbnailUrl !== undefined) {\n    state.thumbnailUrl = action.input.thumbnailUrl || null;\n}\nif (action.input.infoLink !== undefined) {\n    state.infoLink = action.input.infoLink || null;\n}\nif (action.input.subtitle !== undefined) {\n    state.subtitle = action.input.subtitle || null;\n}\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Updates template info",
              description:
                "Updates template title, summary, description and links",
            },
            {
              id: "update-template-status",
              name: "UPDATE_TEMPLATE_STATUS",
              scope: "global",
              errors: [],
              schema:
                "input UpdateTemplateStatusInput {\n    status: TemplateStatus!\n    lastModified: DateTime!\n}",
              reducer:
                "state.status = action.input.status;\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Updates the template status",
              description: "Updates the template status",
            },
            {
              id: "set-operator",
              name: "SET_OPERATOR",
              scope: "global",
              errors: [],
              schema:
                "input SetOperatorInput {\n    operatorId: PHID!\n    lastModified: DateTime!\n}",
              reducer:
                "state.operatorId = action.input.operatorId;\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Sets the operator for this template",
              description: "Sets the operator for this template",
            },
            {
              id: "set-template-id",
              name: "SET_TEMPLATE_ID",
              scope: "global",
              errors: [],
              schema:
                "input SetTemplateIdInput {\n    id: PHID!\n    lastModified: DateTime!\n}",
              reducer:
                "state.id = action.input.id;\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Sets the template ID",
              description: "Sets the template identifier",
            },
            {
              id: "set-weight",
              name: "SET_WEIGHT",
              scope: "global",
              errors: [],
              schema:
                "input SetWeightInput {\n    weight: Int\n    lastModified: DateTime!\n}",
              reducer:
                "state.weight = action.input.weight || null;\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Set the weight for catalog sorting",
              description: "Sets the catalog sorting weight for this template",
            },
          ],
          description: "Operations for managing resource template metadata",
        },
        {
          id: "audience-management",
          name: "Audience Management",
          operations: [
            {
              id: "add-target-audience",
              name: "ADD_TARGET_AUDIENCE",
              scope: "global",
              errors: [
                {
                  id: "duplicate-audience-id",
                  code: "DUPLICATE_AUDIENCE_ID",
                  name: "DuplicateAudienceIdError",
                  template: "",
                  description: "An audience with this ID already exists",
                },
              ],
              schema:
                "input AddTargetAudienceInput {\n    id: OID!\n    label: String!\n    color: String\n    lastModified: DateTime!\n}",
              reducer:
                "state.targetAudiences.push({\n    id: action.input.id,\n    label: action.input.label,\n    color: action.input.color || null\n});\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Adds a target audience",
              description: "Adds a target audience",
            },
            {
              id: "remove-target-audience",
              name: "REMOVE_TARGET_AUDIENCE",
              scope: "global",
              errors: [
                {
                  id: "audience-not-found",
                  code: "AUDIENCE_NOT_FOUND",
                  name: "AudienceNotFoundError",
                  template: "",
                  description: "Audience with the specified ID does not exist",
                },
              ],
              schema:
                "input RemoveTargetAudienceInput {\n    id: OID!\n    lastModified: DateTime!\n}",
              reducer:
                "const audienceIndex = state.targetAudiences.findIndex(a => a.id === action.input.id);\nif (audienceIndex !== -1) {\n    state.targetAudiences.splice(audienceIndex, 1);\n}\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Removes a target audience",
              description: "Removes a target audience",
            },
          ],
          description: "Operations for managing target audiences",
        },
        {
          id: "facet-targeting",
          name: "Facet Targeting",
          operations: [
            {
              id: "set-facet-target",
              name: "SET_FACET_TARGET",
              scope: "global",
              errors: [],
              schema:
                "input SetFacetTargetInput {\n    id: OID!\n    categoryKey: String!\n    categoryLabel: String!\n    selectedOptions: [String!]!\n    lastModified: DateTime!\n}",
              reducer:
                "const existingIndex = state.facetTargets.findIndex(ft => ft.categoryKey === action.input.categoryKey);\nif (existingIndex !== -1) {\n    state.facetTargets[existingIndex] = {\n        id: action.input.id,\n        categoryKey: action.input.categoryKey,\n        categoryLabel: action.input.categoryLabel,\n        selectedOptions: action.input.selectedOptions\n    };\n} else {\n    state.facetTargets.push({\n        id: action.input.id,\n        categoryKey: action.input.categoryKey,\n        categoryLabel: action.input.categoryLabel,\n        selectedOptions: action.input.selectedOptions\n    });\n}\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Sets a facet target",
              description: "Sets or updates a facet target configuration",
            },
            {
              id: "remove-facet-target",
              name: "REMOVE_FACET_TARGET",
              scope: "global",
              errors: [
                {
                  id: "facet-target-not-found",
                  code: "FACET_TARGET_NOT_FOUND",
                  name: "FacetTargetNotFoundError",
                  template: "",
                  description:
                    "Facet target with the specified category key does not exist",
                },
              ],
              schema:
                "input RemoveFacetTargetInput {\n    categoryKey: String!\n    lastModified: DateTime!\n}",
              reducer:
                "const facetIndex = state.facetTargets.findIndex(ft => ft.categoryKey === action.input.categoryKey);\nif (facetIndex !== -1) {\n    state.facetTargets.splice(facetIndex, 1);\n}\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Removes a facet target",
              description: "Removes a facet target configuration",
            },
            {
              id: "add-facet-option",
              name: "ADD_FACET_OPTION",
              scope: "global",
              errors: [
                {
                  id: "facet-target-not-found-add",
                  code: "ADD_FACET_OPTION_TARGET_NOT_FOUND",
                  name: "AddFacetOptionTargetNotFoundError",
                  template: "",
                  description:
                    "Facet target with the specified category key does not exist",
                },
              ],
              schema:
                "input AddFacetOptionInput {\n    categoryKey: String!\n    optionId: String!\n    lastModified: DateTime!\n}",
              reducer:
                "const facetTarget = state.facetTargets.find(ft => ft.categoryKey === action.input.categoryKey);\nif (facetTarget && !facetTarget.selectedOptions.includes(action.input.optionId)) {\n    facetTarget.selectedOptions.push(action.input.optionId);\n}\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Adds an option to a facet target",
              description: "Adds an option to a facet target",
            },
            {
              id: "remove-facet-option",
              name: "REMOVE_FACET_OPTION",
              scope: "global",
              errors: [
                {
                  id: "facet-target-not-found-remove",
                  code: "REMOVE_FACET_OPTION_TARGET_NOT_FOUND",
                  name: "RemoveFacetOptionTargetNotFoundError",
                  template: "",
                  description:
                    "Facet target with the specified category key does not exist",
                },
              ],
              schema:
                "input RemoveFacetOptionInput {\n    categoryKey: String!\n    optionId: String!\n    lastModified: DateTime!\n}",
              reducer:
                "const facetTarget = state.facetTargets.find(ft => ft.categoryKey === action.input.categoryKey);\nif (facetTarget) {\n    const optionIndex = facetTarget.selectedOptions.indexOf(action.input.optionId);\n    if (optionIndex !== -1) {\n        facetTarget.selectedOptions.splice(optionIndex, 1);\n    }\n}\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Removes an option from a facet target",
              description: "Removes an option from a facet target",
            },
          ],
          description: "Operations for managing facet targeting",
        },
        {
          id: "service-category-management",
          name: "Service Category Management",
          operations: [
            {
              id: "set-setup-services",
              name: "SET_SETUP_SERVICES",
              scope: "global",
              errors: [],
              schema:
                "input SetSetupServicesInput {\n    services: [String!]!\n    lastModified: DateTime!\n}",
              reducer:
                "state.setupServices = action.input.services;\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Sets the setup services",
              description: "Sets the setup service category labels",
            },
            {
              id: "set-recurring-services",
              name: "SET_RECURRING_SERVICES",
              scope: "global",
              errors: [],
              schema:
                "input SetRecurringServicesInput {\n    services: [String!]!\n    lastModified: DateTime!\n}",
              reducer:
                "state.recurringServices = action.input.services;\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Sets the recurring services",
              description: "Sets the recurring service category labels",
            },
          ],
          description: "Operations for managing service categories",
        },
        {
          id: "service-management",
          name: "Service Management",
          operations: [
            {
              id: "add-service",
              name: "ADD_SERVICE",
              scope: "global",
              errors: [
                {
                  id: "duplicate-service-id",
                  code: "DUPLICATE_SERVICE_ID",
                  name: "DuplicateServiceIdError",
                  template: "",
                  description: "A service with this ID already exists",
                },
              ],
              schema:
                "input AddServiceInput {\n    id: OID!\n    title: String!\n    description: String\n    parentServiceId: OID\n    displayOrder: Int\n    isSetupFormation: Boolean\n    optionGroupId: OID\n    lastModified: DateTime!\n}",
              reducer:
                "state.services.push({\n    id: action.input.id,\n    title: action.input.title,\n    description: action.input.description || null,\n    parentServiceId: action.input.parentServiceId || null,\n    displayOrder: action.input.displayOrder || null,\n    isSetupFormation: action.input.isSetupFormation || false,\n    optionGroupId: action.input.optionGroupId || null,\n    facetBindings: []\n});\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Adds a new service to the template",
              description: "Adds a new service to the template",
            },
            {
              id: "update-service",
              name: "UPDATE_SERVICE",
              scope: "global",
              errors: [
                {
                  id: "service-not-found",
                  code: "UPDATE_SERVICE_NOT_FOUND",
                  name: "UpdateServiceNotFoundError",
                  template: "",
                  description: "Service with the specified ID does not exist",
                },
              ],
              schema:
                "input UpdateServiceInput {\n    id: OID!\n    title: String\n    description: String\n    parentServiceId: OID\n    displayOrder: Int\n    isSetupFormation: Boolean\n    optionGroupId: OID\n    lastModified: DateTime!\n}",
              reducer:
                "const service = state.services.find(s => s.id === action.input.id);\nif (service) {\n    if (action.input.title) {\n        service.title = action.input.title;\n    }\n    if (action.input.description !== undefined && action.input.description !== null) {\n        service.description = action.input.description;\n    }\n    if (action.input.parentServiceId !== undefined) {\n        service.parentServiceId = action.input.parentServiceId || null;\n    }\n    if (action.input.displayOrder !== undefined && action.input.displayOrder !== null) {\n        service.displayOrder = action.input.displayOrder;\n    }\n    if (action.input.isSetupFormation !== undefined && action.input.isSetupFormation !== null) {\n        service.isSetupFormation = action.input.isSetupFormation;\n    }\n    if (action.input.optionGroupId !== undefined) {\n        service.optionGroupId = action.input.optionGroupId || null;\n    }\n}\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Updates an existing service",
              description: "Updates an existing service",
            },
            {
              id: "delete-service",
              name: "DELETE_SERVICE",
              scope: "global",
              errors: [
                {
                  id: "service-not-found-delete",
                  code: "DELETE_SERVICE_NOT_FOUND",
                  name: "DeleteServiceNotFoundError",
                  template: "",
                  description: "Service with the specified ID does not exist",
                },
              ],
              schema:
                "input DeleteServiceInput {\n    id: OID!\n    lastModified: DateTime!\n}",
              reducer:
                "const serviceIndex = state.services.findIndex(s => s.id === action.input.id);\nif (serviceIndex !== -1) {\n    state.services.splice(serviceIndex, 1);\n}\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Removes a service from the template",
              description: "Removes a service from the template",
            },
            {
              id: "add-facet-binding",
              name: "ADD_FACET_BINDING",
              scope: "global",
              errors: [
                {
                  id: "service-not-found-facet",
                  code: "ADD_FACET_SERVICE_NOT_FOUND",
                  name: "AddFacetServiceNotFoundError",
                  template: "",
                  description: "Service with the specified ID does not exist",
                },
                {
                  id: "duplicate-binding-id",
                  code: "DUPLICATE_BINDING_ID",
                  name: "DuplicateBindingIdError",
                  template: "",
                  description: "A facet binding with this ID already exists",
                },
              ],
              schema:
                "input AddFacetBindingInput {\n    serviceId: OID!\n    bindingId: OID!\n    facetName: String!\n    facetType: PHID!\n    supportedOptions: [OID!]!\n    lastModified: DateTime!\n}",
              reducer:
                "const service = state.services.find(s => s.id === action.input.serviceId);\nif (service) {\n    service.facetBindings.push({\n        id: action.input.bindingId,\n        facetName: action.input.facetName,\n        facetType: action.input.facetType,\n        supportedOptions: action.input.supportedOptions\n    });\n}\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Adds a facet binding to a service",
              description: "Adds a facet binding to a service",
            },
            {
              id: "remove-facet-binding",
              name: "REMOVE_FACET_BINDING",
              scope: "global",
              errors: [
                {
                  id: "service-not-found-remove-binding",
                  code: "REMOVE_FACET_SERVICE_NOT_FOUND",
                  name: "RemoveFacetServiceNotFoundError",
                  template: "",
                  description: "Service with the specified ID does not exist",
                },
                {
                  id: "binding-not-found",
                  code: "BINDING_NOT_FOUND",
                  name: "BindingNotFoundError",
                  template: "",
                  description:
                    "Facet binding with the specified ID does not exist",
                },
              ],
              schema:
                "input RemoveFacetBindingInput {\n    serviceId: OID!\n    bindingId: OID!\n    lastModified: DateTime!\n}",
              reducer:
                "const service = state.services.find(s => s.id === action.input.serviceId);\nif (service) {\n    const bindingIndex = service.facetBindings.findIndex(fb => fb.id === action.input.bindingId);\n    if (bindingIndex !== -1) {\n        service.facetBindings.splice(bindingIndex, 1);\n    }\n}\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Removes a facet binding from a service",
              description: "Removes a facet binding from a service",
            },
          ],
          description: "Operations for managing services in the template",
        },
        {
          id: "option-group-management",
          name: "Option Group Management",
          operations: [
            {
              id: "add-option-group",
              name: "ADD_OPTION_GROUP",
              scope: "global",
              errors: [
                {
                  id: "duplicate-option-group-id",
                  code: "DUPLICATE_OPTION_GROUP_ID",
                  name: "DuplicateOptionGroupIdError",
                  template: "",
                  description: "An option group with this ID already exists",
                },
              ],
              schema:
                "input AddOptionGroupInput {\n    id: OID!\n    name: String!\n    description: String\n    isAddOn: Boolean!\n    defaultSelected: Boolean!\n    lastModified: DateTime!\n}",
              reducer:
                "state.optionGroups.push({\n    id: action.input.id,\n    name: action.input.name,\n    description: action.input.description || null,\n    isAddOn: action.input.isAddOn,\n    defaultSelected: action.input.defaultSelected\n});\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Adds a new option group",
              description: "Adds a new option group",
            },
            {
              id: "update-option-group",
              name: "UPDATE_OPTION_GROUP",
              scope: "global",
              errors: [
                {
                  id: "option-group-not-found",
                  code: "UPDATE_OPTION_GROUP_NOT_FOUND",
                  name: "UpdateOptionGroupNotFoundError",
                  template: "",
                  description:
                    "Option group with the specified ID does not exist",
                },
              ],
              schema:
                "input UpdateOptionGroupInput {\n    id: OID!\n    name: String\n    description: String\n    isAddOn: Boolean\n    defaultSelected: Boolean\n    lastModified: DateTime!\n}",
              reducer:
                "const optionGroup = state.optionGroups.find(og => og.id === action.input.id);\nif (optionGroup) {\n    if (action.input.name) {\n        optionGroup.name = action.input.name;\n    }\n    if (action.input.description !== undefined) {\n        optionGroup.description = action.input.description || null;\n    }\n    if (action.input.isAddOn !== undefined && action.input.isAddOn !== null) {\n        optionGroup.isAddOn = action.input.isAddOn;\n    }\n    if (action.input.defaultSelected !== undefined && action.input.defaultSelected !== null) {\n        optionGroup.defaultSelected = action.input.defaultSelected;\n    }\n}\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Updates an existing option group",
              description: "Updates an existing option group",
            },
            {
              id: "delete-option-group",
              name: "DELETE_OPTION_GROUP",
              scope: "global",
              errors: [
                {
                  id: "option-group-not-found-delete",
                  code: "DELETE_OPTION_GROUP_NOT_FOUND",
                  name: "DeleteOptionGroupNotFoundError",
                  template: "",
                  description:
                    "Option group with the specified ID does not exist",
                },
              ],
              schema:
                "input DeleteOptionGroupInput {\n    id: OID!\n    lastModified: DateTime!\n}",
              reducer:
                "const optionGroupIndex = state.optionGroups.findIndex(og => og.id === action.input.id);\nif (optionGroupIndex !== -1) {\n    state.services.forEach(service => {\n        if (service.optionGroupId === action.input.id) {\n            service.optionGroupId = null;\n        }\n    });\n    state.optionGroups.splice(optionGroupIndex, 1);\n}\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Removes an option group from the template",
              description: "Removes an option group from the template",
            },
            {
              id: "5383b824-c864-4062-a90e-f892d292a658",
              name: "ADD_FAQ",
              scope: "global",
              errors: [],
              schema:
                "input AddFaqInput {\n    id: OID!\n    question: String\n    answer: String\n    displayOrder: Int!\n}",
              reducer:
                "if (!state.faqFields) {\n    state.faqFields = [];\n}\nstate.faqFields.push({\n    id: action.input.id,\n    question: action.input.question || null,\n    answer: action.input.answer || null,\n    displayOrder: action.input.displayOrder\n});",
              examples: [],
              template: "",
              description: "",
            },
            {
              id: "67866c99-6f74-49fa-a1df-0edcf6671baf",
              name: "UPDATE_FAQ",
              scope: "global",
              errors: [],
              schema:
                "input UpdateFaqInput {\n  id: OID!\n  question: String\n  answer: String\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
            {
              id: "aa7b2729-22b8-41f7-bc45-3825c1857668",
              name: "DELETE_FAQ",
              scope: "global",
              errors: [],
              schema: "input DeleteFaqInput {\n  id:OID!\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
            {
              id: "reorder-faqs",
              name: "REORDER_FAQS",
              scope: "global",
              errors: [],
              schema:
                "input ReorderFaqsInput {\n    faqIds: [OID!]!\n    lastModified: DateTime!\n}",
              reducer:
                "action.input.faqIds.forEach((id, index) => {\n    const faq = state.faqFields?.find(f => f.id === id);\n    if (faq) {\n        faq.displayOrder = index;\n    }\n});\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Reorders FAQ items by updating their display order",
              description: "Reorders FAQ items by updating their display order",
            },
          ],
          description: "Operations for managing option groups",
        },
        {
          id: "content-section-management",
          name: "Content Section Management",
          operations: [
            {
              id: "add-content-section",
              name: "ADD_CONTENT_SECTION",
              scope: "global",
              errors: [],
              schema:
                "input AddContentSectionInput {\n    id: OID!\n    title: String!\n    content: String!\n    displayOrder: Int!\n    lastModified: DateTime!\n}",
              reducer:
                "state.contentSections.push({\n    id: action.input.id,\n    title: action.input.title,\n    content: action.input.content,\n    displayOrder: action.input.displayOrder\n});\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Adds a new expandable content section",
              description: "Adds a new expandable content section",
            },
            {
              id: "update-content-section",
              name: "UPDATE_CONTENT_SECTION",
              scope: "global",
              errors: [],
              schema:
                "input UpdateContentSectionInput {\n    id: OID!\n    title: String\n    content: String\n    displayOrder: Int\n    lastModified: DateTime!\n}",
              reducer:
                "const section = state.contentSections.find(s => s.id === action.input.id);\nif (section) {\n    if (action.input.title) {\n        section.title = action.input.title;\n    }\n    if (action.input.content !== undefined && action.input.content !== null) {\n        section.content = action.input.content;\n    }\n    if (action.input.displayOrder !== undefined && action.input.displayOrder !== null) {\n        section.displayOrder = action.input.displayOrder;\n    }\n}\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Updates an existing content section",
              description: "Updates an existing content section",
            },
            {
              id: "delete-content-section",
              name: "DELETE_CONTENT_SECTION",
              scope: "global",
              errors: [],
              schema:
                "input DeleteContentSectionInput {\n    id: OID!\n    lastModified: DateTime!\n}",
              reducer:
                "const sectionIndex = state.contentSections.findIndex(s => s.id === action.input.id);\nif (sectionIndex !== -1) {\n    state.contentSections.splice(sectionIndex, 1);\n}\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Removes a content section",
              description: "Removes a content section",
            },
            {
              id: "reorder-content-sections",
              name: "REORDER_CONTENT_SECTIONS",
              scope: "global",
              errors: [],
              schema:
                "input ReorderContentSectionsInput {\n    sectionIds: [OID!]!\n    lastModified: DateTime!\n}",
              reducer:
                "action.input.sectionIds.forEach((id, index) => {\n    const section = state.contentSections.find(s => s.id === id);\n    if (section) {\n        section.displayOrder = index;\n    }\n});\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template:
                "Reorders content sections by updating their display order",
              description:
                "Reorders content sections by updating their display order",
            },
          ],
          description:
            "Operations for managing expandable content sections for long-form article content",
        },
      ],
      version: 1,
      changeLog: [],
    },
  ],
};
