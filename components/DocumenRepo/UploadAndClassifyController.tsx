"use client";

import { useState } from "react";
import { UploadFilesDialog } from "./UploadFilesDialog";
import { ConfirmClassificationDialog } from "./ConfirmClassificationDialog";
import { classifyCaseFile } from "@/lib/storage/case-view/ai/classifyCaseFile";
import { toast } from "sonner";
import { UploadedFile, ClassificationResult } from "@/lib/storage/case-view/ai/constant";
import { finalizeCaseFile } from "@/lib/storage/case-view/verifyCaseFile";
import { LoadingDialog } from "./LoadingDialog";

export const UploadAndClassifyController = ({
  caseId,
  caseType,
}: {
  caseId: string;
  caseType: "civil" | "criminal";
}) => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isLoadingDialogOpen, setIsLoadingDialogOpen] = useState(false);

  const isCivilCriminalMismatch =
    classification &&
    (
      (caseType === "civil" && classification.predictedTag === "criminal") ||
      (caseType === "criminal" && classification.predictedTag === "civil")
    );

  async function handleFileUploaded(file: UploadedFile) {
    setUploadedFile(file);
    setIsClassifying(true);
    setIsLoadingDialogOpen(true);

    const toastId = toast.success("File uploaded successfully!");

    try {
      const result = await classifyCaseFile({
        doc_id: file.docId,
        caseId,
        filePath: file.filePath,
      });

      setClassification(result);
      setShowConfirmDialog(true);
      toast.success("Classification complete!", { id: toastId });

    } catch (error: any) {
      console.error("Classification error:", error);

      if (uploadedFile?.docId) {
        try {
        //   await cancelClassification(uploadedFile.docId);
          console.info("Rolled back uploaded file due to classification failure");
        } catch (cleanupErr) {
          console.error("Rollback failed:", cleanupErr);
        }
      }

      let message = "Something went wrong.";

      switch (error?.message) {
        case "FILE_ALREADY_EXISTS":
          message = "A file with this name already exists in this case.";
          break;

        case "CLASSIFICATION_FAILED":
          message = "The document could not be classified. \n The upload has been rolled back.";
          break;

        case "SERVER_NOT_UP":
          message = "The server is currently unavailable.\n Please try again later.";
          break;

        default:
          message = "Unexpected error occurred. The upload has been rolled back.";
      }

      toast.error(message, { id: toastId });

      setUploadedFile(null);
      setClassification(null);
    } finally {
      setIsClassifying(false);
      setIsLoadingDialogOpen(false);
    }
  }

  async function handleCancelConfirmation() {
    if (uploadedFile) {
      const toastId = toast.loading("Cleaning up uploaded file...");

      try {
        // await cancelClassification(uploadedFile.docId);
        toast.success("Uploaded file deleted", { id: toastId });
      } catch (error: any) {
        console.error("Failed to delete uploaded file:", error);
        toast.error(
          error?.message || "Failed to delete uploaded file",
          { id: toastId }
        );
      }
    }

    setShowConfirmDialog(false);
    setUploadedFile(null);
    setClassification(null);
  }

  async function handleConfirmClassification(finalTag: string) {
    if (!uploadedFile || !classification) return;

    const toastId = toast.loading("Finalizing document entry...");

    try {
      await finalizeCaseFile(uploadedFile.docId, finalTag, caseId);
      toast.success("Document added to case", { id: toastId });

      setShowConfirmDialog(false);
      setUploadedFile(null);
      setClassification(null);
    } catch (error) {
      console.error("Finalize error:", error);
      toast.error("Failed to save final classification", { id: toastId });
    }
  }

  return (
    <>
      <UploadFilesDialog
        caseId={caseId}
        onUploaded={handleFileUploaded}
        isClassifying={isClassifying}
      />

      {uploadedFile && classification && (
        <ConfirmClassificationDialog
          open={showConfirmDialog}
          file={uploadedFile}
          classification={classification}
          isMismatch={isCivilCriminalMismatch || false}
          caseType={caseType}
          onConfirm={handleConfirmClassification}
          onCancel={handleCancelConfirmation}
        />
      )}

      <LoadingDialog open={isLoadingDialogOpen} />
    </>
  );
};