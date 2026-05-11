import type { DocumentModelGlobalState } from "document-model";

export const documentModel: DocumentModelGlobalState = {
  id: "powerhouse/accounts",
  name: "Accounts",
  author: {
    name: "Powerhouse",
    website: "https://powerhouse.inc",
  },
  extension: "",
  description:
    "Document model for managing accounts with KYC/AML status tracking",
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
            "type AccountsState {\n   accounts: [AccountEntry!]!\n}\n\ntype AccountEntry {\n    id: OID!\n    account: String!\n    name: String!\n    budgetPath: String\n    accountTransactionsId: PHID\n    chain: [String!]\n    type: AccountType!\n    owners: [String!]\n    KycAmlStatus: KycAmlStatusType\n}\n\nenum AccountType {\n    Source\n    Internal\n    Destination\n    External\n}\n\nenum KycAmlStatusType {\n    PASSED\n    PENDING\n    FAILED\n}\n\nenum AccountTypeInput {\n  Source\n  Internal\n  Destination\n  External\n}\n\nenum KycAmlStatusTypeInput {\n  PASSED\n  PENDING\n  FAILED\n}",
          examples: [],
          initialValue: '{"accounts": []}',
        },
      },
      modules: [
        {
          id: "accounts",
          name: "accounts",
          operations: [
            {
              id: "add-account",
              name: "addAccount",
              scope: "global",
              errors: [],
              schema:
                "input AddAccountInput {\n  id: OID!\n  account: String!\n  name: String!\n  budgetPath: String\n  accountTransactionsId: PHID\n  chain: [String!]\n  type: AccountTypeInput!\n  owners: [String!]\n  KycAmlStatus: KycAmlStatusTypeInput\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
            {
              id: "update-account",
              name: "updateAccount",
              scope: "global",
              errors: [],
              schema:
                "input UpdateAccountInput {\n    id: OID!\n    account: String\n    name: String\n    budgetPath: String\n    accountTransactionsId: PHID\n    chain: [String!]\n    type: AccountTypeInput\n    owners: [String!]\n    KycAmlStatus: KycAmlStatusTypeInput\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
            {
              id: "delete-account",
              name: "deleteAccount",
              scope: "global",
              errors: [],
              schema: "input DeleteAccountInput {\n    id: OID!\n}",
              reducer: "",
              examples: [],
              template: "",
              description: "",
            },
            {
              id: "update-kyc-status",
              name: "updateKycStatus",
              scope: "global",
              errors: [],
              schema:
                "input UpdateKycStatusInput {\n    id: OID!\n    KycAmlStatus: KycAmlStatusTypeInput!\n}",
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
