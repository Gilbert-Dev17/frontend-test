export type UploadedFile = {
  docId: string;
  fileId: string;
  filePath: string;
  fileName: string;
};

export type ClassificationResult = {
    documentId: string;
    predictedTag: string;
    confidence: number;
};

export type ClassifyCaseFileInput = {
    doc_id: string;
    caseId: string;
    filePath: string;
};

export const CaseClassificationTypes = [
  { label: "Civil Case" , value: "civil"},
  { label: "Criminal Case" , value: "criminal"},
  {label: "Legal Fees", value: "legal_fees"},
];