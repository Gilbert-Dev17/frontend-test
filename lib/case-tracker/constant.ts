// * app/dashboard/search
export const SEARCH_CASE_TABS = [
    { label: "All Results", value: "all" },
    { label: "Criminal Cases", value: "criminal" },
    { label: "Civil Cases", value: "civil" },
];

// * components/case-tracker
export const CASETRACKER_TABS = [
    { label: "All Results", value: "all" },
    { label: "Criminal Cases", value: "criminal" },
    { label: "Civil Cases", value: "civil" },
    { label: "Archived", value: "archived" },
] as const;

export type CaseType =
  (typeof CASETRACKER_TABS)[number]["value"];

// * components/case-tracker
// * app/dashboard/search
export const CASE_STATUS_FILTERS = [
    { label: "All" , value: "all"},
    { label: "Active" , value: "active"},
    { label: "Discovery" , value: "discovery"},
    { label: "Settlement" , value: "settlement"},
    { label: "Urgent" , value:"urgent"},
    { label: "Closed" , value: "closed"},
] as const;

export type CaseStatus =
  (typeof CASE_STATUS_FILTERS)[number]["value"];

// * components/admin
export const ADMIN_ROLE_FILTERS = [
   "All Roles",
   "Attorney",
   "Partner",
   "Secretary",
   "Paralegal"
] as const;

// * components/case-tracker/.../CaseSchedulerDialog
export const MEETING_TYPE = [
  { label: "Hearing" , value: "hearing"},
  { label: "Meeting" , value: "meeting"},
]

// * components/case-tracker/CreateCaseDialog
export const CASE_TYPE = [
  { label: "Civil Case" , value: "civil"},
  { label: "Criminal Case" , value: "criminal"},
]

export const CASE_STATUS = [
    { label: "Active" , value: "active"},
    { label: "Discovery" , value: "discovery"},
    { label: "Settlement" , value: "settlement"},
    { label: "Urgent" , value:"urgent"},
    { label: "Closed" , value: "closed"},
] as const;