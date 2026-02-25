import { getAttorneys } from "@/lib/case-tracker/getAttorney"
import { getAllCases } from "@/lib/case-tracker/getCases"
import CaseTracker from "@/components/Client/CaseTracker";

export default async function ActiveCasesPage() {
  const [attorneys, cases] = await Promise.all([
    getAttorneys(),
    getAllCases(),
  ]);


  if (process.env.NODE_ENV === 'development'){
    console.log("cases:", cases);
    console.log("attorneys", attorneys)
  }

  return (
    <div>
      <CaseTracker attorneys={attorneys} cases={cases}  />
    </div>
  )
}
