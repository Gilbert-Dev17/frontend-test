import { getCaseFile } from "@/lib/case-tracker/getCaseFile";
import { notFound } from "next/navigation";
import { viewCaseFiles } from "@/lib/case-tracker/viewCaseFile";
import DocumentRepository from "@/components/DocumenRepo/DocumentRepository"

type CaseDetailsPageProps = {
  params: {
    caseId: string;
  };
};

export default async function CaseDetailsPage({
  params,
}: CaseDetailsPageProps) {

  const { caseId } = await params;
  let caseFile;

  const documents = await viewCaseFiles(caseId)

  try {
    caseFile = await getCaseFile(caseId);

    if (!caseFile) {
      notFound();
    }
  } catch (error) {
    notFound();
  }

  return (
    <div className="min-h-screen p-8 font-sans">

      <DocumentRepository documents={documents} caseId={caseId} caseFile={caseFile.case_type} />
    </div>
  );
}
