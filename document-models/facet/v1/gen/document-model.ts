import type { DocumentModelGlobalState } from "document-model";

export const documentModel: DocumentModelGlobalState = {
  id: "powerhouse/facet",
  name: "Facet",
  author: {
    name: "Powerhouse",
    website: "https://www.powerhouse.inc/",
  },
  extension: "",
  description:
    "Document model for defining categorical options (facets) used to customize service offerings. Examples include SNO Function, Legal Entity Type, Team configurations, and Anonymity settings",
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
            "type FacetState {\n    id: PHID\n    name: String!\n    description: String\n    lastModified: DateTime\n    options: [FacetOption!]!\n}\n\ntype FacetOption {\n    id: OID!\n    label: String!\n    description: String\n    displayOrder: Int\n    isDefault: Boolean!\n}",
          examples: [],
          initialValue:
            '{\n    "id": null,\n    "name": "",\n    "description": null,\n    "lastModified": null,\n    "options": []\n}',
        },
      },
      modules: [
        {
          id: "facet-management",
          name: "Facet Management",
          operations: [
            {
              id: "set-facet-name",
              name: "SET_FACET_NAME",
              scope: "global",
              errors: [],
              schema:
                "input SetFacetNameInput {\n    name: String!\n    lastModified: DateTime!\n}",
              reducer:
                "state.name = action.input.name;\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Sets the facet name",
              description: "Sets the facet name",
            },
            {
              id: "set-facet-description",
              name: "SET_FACET_DESCRIPTION",
              scope: "global",
              errors: [],
              schema:
                "input SetFacetDescriptionInput {\n    description: String\n    lastModified: DateTime!\n}",
              reducer:
                "state.description = action.input.description || null;\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Sets the facet description",
              description: "Sets the facet description",
            },
          ],
          description: "Operations for managing facet metadata",
        },
        {
          id: "option-management",
          name: "Option Management",
          operations: [
            {
              id: "add-option",
              name: "ADD_OPTION",
              scope: "global",
              errors: [
                {
                  id: "duplicate-option-id",
                  code: "DUPLICATE_OPTION_ID",
                  name: "DuplicateOptionIdError",
                  template: "",
                  description: "An option with this ID already exists",
                },
              ],
              schema:
                "input AddOptionInput {\n    id: OID!\n    label: String!\n    description: String\n    displayOrder: Int\n    isDefault: Boolean\n    lastModified: DateTime!\n}",
              reducer:
                "state.options.push({\n    id: action.input.id,\n    label: action.input.label,\n    description: action.input.description || null,\n    displayOrder: action.input.displayOrder || null,\n    isDefault: action.input.isDefault || false\n});\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Adds a new option to the facet",
              description: "Adds a new option to the facet",
            },
            {
              id: "update-option",
              name: "UPDATE_OPTION",
              scope: "global",
              errors: [
                {
                  id: "option-not-found",
                  code: "OPTION_NOT_FOUND",
                  name: "OptionNotFoundError",
                  template: "",
                  description: "Option with the specified ID does not exist",
                },
              ],
              schema:
                "input UpdateOptionInput {\n    id: OID!\n    label: String\n    description: String\n    displayOrder: Int\n    isDefault: Boolean\n    lastModified: DateTime!\n}",
              reducer:
                "const option = state.options.find(o => o.id === action.input.id);\nif (option) {\n    if (action.input.label) {\n        option.label = action.input.label;\n    }\n    if (action.input.description !== undefined) {\n        option.description = action.input.description || null;\n    }\n    if (action.input.displayOrder !== undefined && action.input.displayOrder !== null) {\n        option.displayOrder = action.input.displayOrder;\n    }\n    if (action.input.isDefault !== undefined && action.input.isDefault !== null) {\n        option.isDefault = action.input.isDefault;\n    }\n}\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Updates an existing option",
              description: "Updates an existing option",
            },
            {
              id: "remove-option",
              name: "REMOVE_OPTION",
              scope: "global",
              errors: [
                {
                  id: "remove-option-not-found",
                  code: "REMOVE_OPTION_NOT_FOUND",
                  name: "RemoveOptionNotFoundError",
                  template: "",
                  description: "Option with the specified ID does not exist",
                },
              ],
              schema:
                "input RemoveOptionInput {\n    id: OID!\n    lastModified: DateTime!\n}",
              reducer:
                "const optionIndex = state.options.findIndex(o => o.id === action.input.id);\nif (optionIndex !== -1) {\n    state.options.splice(optionIndex, 1);\n}\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Removes an option from the facet",
              description: "Removes an option from the facet",
            },
            {
              id: "reorder-options",
              name: "REORDER_OPTIONS",
              scope: "global",
              errors: [],
              schema:
                "input ReorderOptionsInput {\n    optionIds: [OID!]!\n    lastModified: DateTime!\n}",
              reducer:
                "const orderedOptions: typeof state.options = [];\naction.input.optionIds.forEach((id, index) => {\n    const option = state.options.find(o => o.id === id);\n    if (option) {\n        option.displayOrder = index;\n        orderedOptions.push(option);\n    }\n});\nstate.options.forEach(option => {\n    if (!action.input.optionIds.includes(option.id)) {\n        orderedOptions.push(option);\n    }\n});\nstate.options = orderedOptions;\nstate.lastModified = action.input.lastModified;",
              examples: [],
              template: "Reorders options in the facet",
              description: "Reorders options in the facet",
            },
          ],
          description: "Operations for managing facet options",
        },
      ],
      version: 1,
      changeLog: [],
    },
  ],
};
