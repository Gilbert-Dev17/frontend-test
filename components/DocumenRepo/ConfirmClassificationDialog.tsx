"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadedFile, ClassificationResult, CaseClassificationTypes } from "@/lib/storage/case-view/ai/constant";

type ConfirmClassificationDialogProps = {
  open: boolean;
  file: UploadedFile;
  classification: ClassificationResult;
  caseType: "civil" | "criminal";
  isMismatch?: boolean;
  onConfirm: (finalTag: string) => void;
  onCancel: () => void;
};

export const ConfirmClassificationDialog = ({
  open,
  file,
  classification,
  isMismatch,
  caseType,
  onConfirm,
  onCancel,
}: ConfirmClassificationDialogProps) => {
  const [selectedTag, setSelectedTag] = useState(classification.predictedTag);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(selectedTag);
    } catch (error) {
      console.error("Failed to confirm classification:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    setIsCanceling(true);
    try {
      await onCancel()
    } catch (error) {
      console.error("Failed to confirm classification:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel();
      }}
    >
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Document Classification</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* File Info */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">File</Label>
            <p className="text-sm font-medium">{file.fileName}</p>
          </div>

          {/* AI Result */}
          <div className="rounded-md border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                LegalBERT Suggestion
              </span>
              <Badge variant="secondary">
                <span title={(classification.confidence * 100).toString() + "%"}>
                  {new Intl.NumberFormat('en-US', {
                    style: 'percent',
                    maximumFractionDigits: 2,
                  }).format(classification.confidence)} confidence
                </span>
              </Badge>
            </div>

            <p className="text-sm">{classification.predictedTag}</p>
          </div>

          {isMismatch && (
            <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
              ⚠ This case is marked as <strong>{caseType}</strong>, but
              LegalBERT classified this document as{" "}
              <strong>{classification.predictedTag}</strong>.
              Please review before confirming.
            </div>
          )}


          {/* Override */}
          <div className="space-y-1.5">
            <Label>Confirm or change classification</Label>
            <Select
              value={selectedTag}
              onValueChange={setSelectedTag}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select classification" />
              </SelectTrigger>
                <SelectContent>
                  {CaseClassificationTypes.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
            </Select>
          </div>
        </div>

        <AlertDialogFooter>
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={isSubmitting || isCanceling }
          >
            {isCanceling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isCanceling ? "Canceling..." : "Cancel"}
          </Button>
          <Button
            variant={isMismatch ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isSubmitting || isCanceling}
          >
            {isSubmitting ? "Saving..." : "Confirm & Save"}
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
