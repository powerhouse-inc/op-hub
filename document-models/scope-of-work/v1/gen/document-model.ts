import type { DocumentModelGlobalState } from "document-model";

export const documentModel: DocumentModelGlobalState = {
  id: "powerhouse/scopeofwork",
  name: "ScopeOfWork",
  author: {
    name: "Powerhouse",
    website: "https://powerhouse.inc",
  },
  extension: "",
  description:
    "The Scope of Work model defines a structured plan for executing contributor work; on top of deliverables and roadmaps with milestones it now also includes projects as budget anchors for project based budgeting",
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
            "type ScopeOfWorkState {\n  title: String!\n  description: String!\n  status: ScopeOfWorkStatus!\n  deliverables: [Deliverable!]!\n  projects: [Project!]!\n  roadmaps: [Roadmap!]!\n  contributors: [Agent!]!\n}\n\nenum ScopeOfWorkStatus {\n  DRAFT\n  SUBMITTED\n  IN_PROGRESS\n  REJECTED\n  APPROVED\n  DELIVERED\n  CANCELED\n}\n\ntype Agent {\n  id: PHID!\n  name: String!\n  icon: URL\n  description: String\n}\n\ntype Deliverable {\n  id: OID!\n  owner: ID\n  icon: String\n  title: String!\n  code: String!\n  description: String!\n  status: DeliverableStatus!\n  workProgress: Progress\n  keyResults: [KeyResult!]!\n  budgetAnchor: BudgetAnchorProject\n}\n\ntype BudgetAnchorProject {\n  project: OID\n  unit: Unit\n  unitCost: Float!\n  quantity: Float!\n  margin: Float!\n}\n\nenum Unit {\n  StoryPoints\n  Hours\n}\n\nenum DeliverableStatus {\n  WONT_DO\n  DRAFT\n  TODO\n  BLOCKED\n  IN_PROGRESS\n  DELIVERED\n  CANCELED\n}\n\ntype Progress {\n  value: Float\n  done: Boolean\n  total: Int\n  completed: Int\n}\n\ntype KeyResult {\n  id: OID!\n  title: String!\n  link: String!\n}\n\ntype Project {\n  id: OID!\n  slug: String!\n  code: String!\n  title: String!\n  projectOwner: ID\n  abstract: String\n  imageUrl: URL\n  scope: DeliverablesSet\n  budgetType: BudgetType\n  currency: PMCurrency\n  budget: Float\n  expenditure: BudgetExpenditure\n}\n\nenum PMCurrency {\n  DAI\n  USDS\n  EUR\n  USD\n}\n\nenum BudgetType {\n  CONTINGENCY\n  OPEX\n  CAPEX\n  OVERHEAD\n}\n\ntype BudgetExpenditure {\n  percentage: Float!\n  actuals: Float!\n  cap: Float!\n}\n\ntype Roadmap {\n  id: OID!\n  slug: String!\n  title: String!\n  description: String!\n  milestones: [Milestone!]!\n}\n\ntype Milestone {\n  id: OID!\n  sequenceCode: String!\n  title: String!\n  description: String!\n  deliveryTarget: String!\n  scope: DeliverablesSet\n  coordinators: [ID!]!\n  budget: Float\n}\n\ntype DeliverablesSet {\n  deliverables: [OID!]!\n  status: DeliverableSetStatus!\n  progress: Progress!\n  deliverablesCompleted: DeliverablesCompleted!\n}\n\ntype DeliverablesCompleted {\n  total: Int!\n  completed: Int!\n}\n\nenum DeliverableSetStatus {\n  DRAFT\n  TODO\n  IN_PROGRESS\n  FINISHED\n  CANCELED\n}",
          examples: [],
          initialValue:
            '{\n  "title": "Scope of Work",\n  "description": "The Scope of Work model defines a structured plan for executing contributor work; on top of deliverables and roadmaps with milestones it now also includes projects as budget anchors for project based budgeting.",\n  "status": "DRAFT",\n  "deliverables": [],\n  "projects": [],\n  "roadmaps": [],\n  "contributors": []\n}',
        },
      },
      modules: [
        {
          id: "mod-scope-of-work",
          name: "scope_of_work",
          operations: [
            {
              id: "op-edit-scope-of-work",
              name: "EDIT_SCOPE_OF_WORK",
              scope: "global",
              errors: [],
              schema:
                "input EditScopeOfWorkInput {\n    title: String\n    description: String\n\tstatus: ScopeOfWorkStatusInput\n}\n\nenum ScopeOfWorkStatusInput {\n  DRAFT\n  SUBMITTED\n  IN_PROGRESS\n  REJECTED\n  APPROVED\n  DELIVERED\n  CANCELED\n}",
              reducer: "",
              examples: [],
              template:
                "This operation allows a user to edit the basic details of a Scope of Work (SoW) document.",
              description:
                "This operation allows a user to edit the basic details of a Scope of Work (SoW) document.",
            },
          ],
          description: "",
        },
        {
          id: "mod-deliverables",
          name: "deliverables",
          operations: [
            {
              id: "op-add-deliverable",
              name: "ADD_DELIVERABLE",
              scope: "global",
              errors: [],
              schema:
                "input AddDeliverableInput {\n  id: OID!\n  owner: ID\n  title: String\n  code: String\n  description: String\n  status: PMDeliverableStatusInput\n}\n\nenum PMDeliverableStatusInput {\n  WONT_DO\n  DRAFT\n  TODO\n  BLOCKED\n  IN_PROGRESS\n  DELIVERED\n  CANCELED\n}",
              reducer: "",
              examples: [],
              template: "This operation is used to create a new deliverable.",
              description:
                "This operation is used to create a new deliverable.",
            },
            {
              id: "op-remove-deliverable",
              name: "REMOVE_DELIVERABLE",
              scope: "global",
              errors: [],
              schema: "input RemoveDeliverableInput {\n  id: OID!\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
            {
              id: "op-edit-deliverable",
              name: "EDIT_DELIVERABLE",
              scope: "global",
              errors: [],
              schema:
                "input EditDeliverableInput {\n  id: OID!\n  owner: ID\n  icon: String\n  title: String\n  code: String\n  description: String\n  status: PMDeliverableStatusInput\n}",
              reducer: "",
              examples: [],
              template:
                "This operation allows a user to edit the core attributes of a deliverable, a concrete piece of work within a project or a milestone. Deliverables are the building blocks of execution, typically assigned to contributors or teams.",
              description:
                "This operation allows a user to edit the core attributes of a deliverable, a concrete piece of work within a project or a milestone. Deliverables are the building blocks of execution, typically assigned to contributors or teams.",
            },
            {
              id: "op-set-deliverable-progress",
              name: "SET_DELIVERABLE_PROGRESS",
              scope: "global",
              errors: [],
              schema:
                "input SetDeliverableProgressInput {\n  id: OID!\n  workProgress: ProgressInput\n}\n\ninput ProgressInput {\n  percentage: Float\n  storyPoints: StoryPointInput\n  done: Boolean\n}\n\ninput StoryPointInput {\n  total: Int!\n  completed: Int!\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
            {
              id: "op-add-key-result",
              name: "ADD_KEY_RESULT",
              scope: "global",
              errors: [],
              schema:
                "input AddKeyResultInput {\n  id: OID!\n  deliverableId: OID!\n  title: String!\n  link: String\n}",
              reducer: "",
              examples: [],
              template:
                "This operation allows a user to add a key result to a specific deliverable. Key results are measurable outcomes or indicators that help track progress on a deliverable.",
              description:
                "This operation allows a user to add a key result to a specific deliverable. Key results are measurable outcomes or indicators that help track progress on a deliverable.",
            },
            {
              id: "op-remove-key-result",
              name: "REMOVE_KEY_RESULT",
              scope: "global",
              errors: [],
              schema:
                "input RemoveKeyResultInput {\n  id: OID!\n  deliverableId: OID!\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
            {
              id: "op-edit-key-result",
              name: "EDIT_KEY_RESULT",
              scope: "global",
              errors: [],
              schema:
                "input EditKeyResultInput {\n  id: OID!\n  deliverableId: OID!\n  title: String\n  link: URL\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
            {
              id: "op-set-deliverable-budget-anchor",
              name: "SET_DELIVERABLE_BUDGET_ANCHOR_PROJECT",
              scope: "global",
              errors: [],
              schema:
                "input SetDeliverableBudgetAnchorProjectInput {\n  deliverableId: ID!\n  project: OID\n  unit: Unit\n  unitCost: Float\n  quantity: Float\n  margin: Float\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
          ],
          description: "",
        },
        {
          id: "mod-roadmaps",
          name: "roadmaps",
          operations: [
            {
              id: "op-add-roadmap",
              name: "ADD_ROADMAP",
              scope: "global",
              errors: [],
              schema:
                "input AddRoadmapInput {\n  id: OID!\n  title: String!\n  slug: String\n  description: String\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
            {
              id: "op-remove-roadmap",
              name: "REMOVE_ROADMAP",
              scope: "global",
              errors: [],
              schema: "input RemoveRoadmapInput {\n  id: OID!\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
            {
              id: "op-edit-roadmap",
              name: "EDIT_ROADMAP",
              scope: "global",
              errors: [],
              schema:
                "input EditRoadmapInput {\n  id: OID!\n  title: String\n  slug: String\n  description: String\n}",
              reducer: "",
              examples: [],
              template:
                "This operation allows a user to edit the details of a roadmap document, which outlines the structure",
              description:
                "This operation allows a user to edit the details of a roadmap document, which outlines the structure",
            },
          ],
          description: "",
        },
        {
          id: "mod-milestones",
          name: "milestones",
          operations: [
            {
              id: "op-add-milestone",
              name: "ADD_MILESTONE",
              scope: "global",
              errors: [],
              schema:
                "input AddMilestoneInput {\n  id: OID!\n  roadmapId: OID!\n  sequenceCode: String\n  title: String\n  description: String\n  deliveryTarget: String\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
            {
              id: "op-remove-milestone",
              name: "REMOVE_MILESTONE",
              scope: "global",
              errors: [],
              schema:
                "input RemoveMilestoneInput {\n  id: OID!\n  roadmapId: OID!\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
            {
              id: "op-edit-milestone",
              name: "EDIT_MILESTONE",
              scope: "global",
              errors: [],
              schema:
                "input EditMilestoneInput {\n  id: OID!\n  roadmapId: OID!\n  sequenceCode: String\n  title: String\n  description: String\n  deliveryTarget: String\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
            {
              id: "op-add-coordinator",
              name: "ADD_COORDINATOR",
              scope: "global",
              errors: [],
              schema:
                "input AddCoordinatorInput {\n  id: ID!\n  milestoneId: OID!\n}",
              reducer: "",
              examples: [],
              template:
                "This operation allows a user to assign a contributor as a coordinator for a specific milestone. Coordinators are the people responsible for ensuring the milestone gets delivered; they're often leads, facilitators, or project managers.",
              description:
                "This operation allows a user to assign a contributor as a coordinator for a specific milestone. Coordinators are the people responsible for ensuring the milestone gets delivered; they're often leads, facilitators, or project managers.",
            },
            {
              id: "op-remove-coordinator",
              name: "REMOVE_COORDINATOR",
              scope: "global",
              errors: [],
              schema:
                "input RemoveCoordinatorInput {\n  id: ID!\n  milestoneId: OID!\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
            {
              id: "op-add-milestone-deliverable",
              name: "ADD_MILESTONE_DELIVERABLE",
              scope: "global",
              errors: [],
              schema:
                "input AddMilestoneDeliverableInput {\n  milestoneId: OID!\n  deliverableId: OID!\n  title: String!\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
            {
              id: "op-remove-milestone-deliverable",
              name: "REMOVE_MILESTONE_DELIVERABLE",
              scope: "global",
              errors: [],
              schema:
                "input RemoveMilestoneDeliverableInput {\n  milestoneId: OID!\n  deliverableId: OID!\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
          ],
          description: "",
        },
        {
          id: "mod-deliverables-set",
          name: "deliverables_set",
          operations: [
            {
              id: "op-edit-deliverables-set",
              name: "EDIT_DELIVERABLES_SET",
              scope: "global",
              errors: [],
              schema:
                "input EditDeliverablesSetInput {\n  milestoneId: ID\n  projectId: ID\n  status: DeliverableSetStatusInput\n  deliverablesCompleted: DeliverablesCompletedInput\n}\n\nenum DeliverableSetStatusInput {\n  DRAFT\n  TODO\n  IN_PROGRESS\n  FINISHED\n  CANCELED\n}\n\ninput DeliverablesCompletedInput {\n  total: Int!\n  completed: Int!\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
            {
              id: "op-add-deliverable-in-set",
              name: "ADD_DELIVERABLE_IN_SET",
              scope: "global",
              errors: [],
              schema:
                "input AddDeliverableInSetInput {\n  milestoneId: ID\n  projectId: ID\n  deliverableId: OID!\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
            {
              id: "op-remove-deliverable-in-set",
              name: "REMOVE_DELIVERABLE_IN_SET",
              scope: "global",
              errors: [],
              schema:
                "input RemoveDeliverableInSetInput {\n  milestoneId: ID\n  projectId: ID\n  deliverableId: OID!\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
          ],
          description: "",
        },
        {
          id: "mod-contributors",
          name: "contributors",
          operations: [
            {
              id: "op-add-agent",
              name: "ADD_AGENT",
              scope: "global",
              errors: [
                {
                  id: "err-agent-duplicate-id",
                  code: "AGENT_DUPLICATE_ID",
                  name: "AgentDuplicateIdError",
                  template: "",
                  description: "An agent with the specified ID already exists",
                },
              ],
              schema:
                "input AddAgentInput {\n  id: PHID!\n  name: String!\n  icon: URL\n  description: String\n}",
              reducer:
                "// Check if agent with same ID already exists\nconst existingAgent = state.contributors.find(agent => agent.id === action.input.id);\nif (existingAgent) {\n  throw new AgentDuplicateIdError(`Agent with ID ${action.input.id} already exists`);\n}\n\n// Create new agent with correct structure matching GraphQL schema\nconst agent = {\n  id: action.input.id,\n  name: action.input.name,\n  icon: action.input.icon || null,\n  description: action.input.description || null,\n};\n\nstate.contributors.push(agent);",
              examples: [],
              template: "",
              description: "",
            },
            {
              id: "op-remove-agent",
              name: "REMOVE_AGENT",
              scope: "global",
              errors: [
                {
                  id: "err-agent-not-found-remove",
                  code: "AGENT_NOT_FOUND",
                  name: "AgentNotFoundError",
                  template: "Agent with ID ${id} not found",
                  description: "The specified agent was not found",
                },
              ],
              schema: "input RemoveAgentInput {\n  id: PHID!\n}",
              reducer:
                "// Find agent by ID\nconst agentIndex = state.contributors.findIndex(agent => agent.id === action.input.id);\nif (agentIndex === -1) {\n  throw new AgentNotFoundError(`Agent with ID ${action.input.id} not found`);\n}\n\n// Remove agent from contributors array\nstate.contributors.splice(agentIndex, 1);",
              examples: [],
              template: "",
              description: "",
            },
            {
              id: "op-edit-agent",
              name: "EDIT_AGENT",
              scope: "global",
              errors: [
                {
                  id: "err-agent-not-found-edit",
                  code: "AGENT_NOT_FOUND",
                  name: "AgentNotFoundError",
                  template: "Agent with ID ${id} not found",
                  description: "The specified agent was not found",
                },
              ],
              schema:
                "input EditAgentInput {\n  id: PHID!\n  name: String\n  icon: URL\n  description: String\n}",
              reducer:
                "// Find agent by ID\nconst agentIndex = state.contributors.findIndex(agent => agent.id === action.input.id);\nif (agentIndex === -1) {\n  throw new AgentNotFoundError(`Agent with ID ${action.input.id} not found`);\n}\n\n// Update agent with provided fields, preserving existing values for optional fields\nconst existingAgent = state.contributors[agentIndex];\nconst updatedAgent = {\n  ...existingAgent,\n  name: action.input.name !== undefined ? action.input.name : existingAgent.name,\n  icon: action.input.icon !== undefined ? action.input.icon : existingAgent.icon,\n  description: action.input.description !== undefined ? action.input.description : existingAgent.description,\n};\n\nstate.contributors[agentIndex] = updatedAgent;",
              examples: [],
              template: "",
              description: "",
            },
          ],
          description: "",
        },
        {
          id: "mod-projects",
          name: "projects",
          operations: [
            {
              id: "op-add-project",
              name: "ADD_PROJECT",
              scope: "global",
              errors: [],
              schema:
                "input AddProjectInput {\n  id: OID!\n  code: String!\n  title: String!\n  slug: String\n  projectOwner: ID\n  abstract: String\n  imageUrl: URL\n  budgetType: PMBudgetTypeInput\n  currency: PMCurrencyInput\n  budget: Float\n}\n\nenum PMBudgetTypeInput {\n  CONTINGENCY\n  OPEX\n  CAPEX\n  OVERHEAD\n}\n\nenum PMCurrencyInput {\n  DAI\n  USDS\n  EUR\n  USD\n}",
              reducer: "",
              examples: [],
              template:
                "Creates a new project in a DRAFT status, initializing its core fields. The status of the new project defaults to DRAFT. The Deliverables list (scope) is initialized as empty.",
              description:
                "Creates a new project in a DRAFT status, initializing its core fields. The status of the new project defaults to DRAFT. The Deliverables list (scope) is initialized as empty.",
            },
            {
              id: "op-update-project",
              name: "UPDATE_PROJECT",
              scope: "global",
              errors: [],
              schema:
                "input UpdateProjectInput {\n  id: OID!\n  code: String\n  slug: String\n  title: String\n  abstract: String\n  imageUrl: URL\n  budgetType: PMBudgetTypeInput\n  currency: PMCurrencyInput\n  budget: Float\n}",
              reducer: "",
              examples: [],
              template:
                "Updates general, non-status-related fields of an existing project. This operation is for minor content adjustments. Project must exist; only allowed if the project status is DRAFT or REJECTED. For projects in other statuses, specific operations for status transitions or scope management should be used.\n\nIf code is updated, it must remain unique.",
              description:
                "Updates general, non-status-related fields of an existing project. This operation is for minor content adjustments. Project must exist; only allowed if the project status is DRAFT or REJECTED. For projects in other statuses, specific operations for status transitions or scope management should be used.\n\nIf code is updated, it must remain unique.",
            },
            {
              id: "op-update-project-owner",
              name: "UPDATE_PROJECT_OWNER",
              scope: "global",
              errors: [],
              schema:
                "input UpdateProjectOwnerInput {\n  id: OID!\n  projectOwner: ID!\n}",
              reducer: "",
              examples: [],
              template:
                "Changes the primary owner of a project. This is a specific update due to its potential impact on permissions and responsibilities. Project must exist. The projectOwner must correspond to a valid existing Agent.",
              description:
                "Changes the primary owner of a project. This is a specific update due to its potential impact on permissions and responsibilities.",
            },
            {
              id: "op-remove-project",
              name: "REMOVE_PROJECT",
              scope: "global",
              errors: [],
              schema: "input RemoveProjectInput {\n  projectId: ID!\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
            {
              id: "op-set-project-margin",
              name: "SET_PROJECT_MARGIN",
              scope: "global",
              errors: [],
              schema:
                "input SetProjectMarginInput {\n  projectId: OID!\n  margin: Float!\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
            {
              id: "op-set-project-total-budget",
              name: "SET_PROJECT_TOTAL_BUDGET",
              scope: "global",
              errors: [],
              schema:
                "input SetProjectTotalBudgetInput {\n  projectId: OID!\n  totalBudget: Float!\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
            {
              id: "op-add-project-deliverable",
              name: "ADD_PROJECT_DELIVERABLE",
              scope: "global",
              errors: [],
              schema:
                "input AddProjectDeliverableInput {\n  projectId: OID!\n  deliverableId: ID!\n  title: String!\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
            {
              id: "op-remove-project-deliverable",
              name: "REMOVE_PROJECT_DELIVERABLE",
              scope: "global",
              errors: [],
              schema:
                "input RemoveProjectDeliverableInput {\n  projectId: OID!\n  deliverableId: OID!\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
          ],
          description: "",
        },
      ],
      version: 1,
      changeLog: [],
    },
  ],
};
