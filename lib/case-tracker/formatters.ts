/**
 * Format case type codes to display-friendly strings
 * @param caseType - The case type code (e.g., 'civil', 'criminal', 'family')
 * @returns Formatted case type string (e.g., 'Civil Case', 'Criminal Case')
 */
export function formatCaseType(caseType: string | null | undefined): string {
  if (!caseType) return "Pending Classification";

  const caseTypeMap: Record<string, string> = {
    civil: "Civil Case",
    criminal: "Criminal Case",
    legal_fees: "Legal Fees",

    // family: "Family Case",
    // corporate: "Corporate Case",
    // intellectual: "Intellectual Property Case",
    // employment: "Employment Case",
    // real_estate: "Real Estate Case",
    // tax: "Tax Case",
    // bankruptcy: "Bankruptcy Case",
    // immigration: "Immigration Case",
  };

  return caseTypeMap[caseType.toLowerCase()] || caseType;
}
