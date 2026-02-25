"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { uploadCaseFile } from "@/lib/storage/case-view/UploadCaseFile";

import { z } from "zod";
// for the file upload validation
export const uploadCaseFileSchema = z.object({
  file: z
    .instanceof(File, { message: "File is required" })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "File must be under 10MB",
    })
    .refine(
      (file) =>
        [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/png",
        ].includes(file.type),
      {
        message: "Only PDF, PNG and DOCX files are allowed",
      }
    ),
});

export type UploadCaseFileValues = z.infer<typeof uploadCaseFileSchema>;


export type UploadedFile = {
  docId: string;
  fileId: string;
  filePath: string;
  fileName: string;
};

type UploadFilesDialogProps = {
  caseId: string;
  onUploaded: (file: UploadedFile) => void;
  isClassifying?: boolean;
};

export function UploadFilesDialog({
  caseId,
  onUploaded,
  isClassifying = false,
}: UploadFilesDialogProps) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<UploadCaseFileValues>({
    resolver: zodResolver(uploadCaseFileSchema),
    defaultValues: { file: undefined },
  });

  async function onSubmit(values: UploadCaseFileValues) {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", values.file!);
      formData.append("caseId", caseId);

      const uploadedFile: UploadedFile = await uploadCaseFile(formData);

      // toast.success("File uploaded successfully!");
      setOpen(false);
      form.reset();
      onUploaded(uploadedFile);
    } catch (error: any) {
      let message = "Upload failed.";

      switch (error?.message) {
        case "FILE_ALREADY_EXISTS":
          message = "A file with this name already exists in this case.";
          break;
        case "STORAGE_UPLOAD_FAILED":
          message = "Could not upload the file. Try again.";
          break;
        default:
          message = error?.message || "Unexpected error occurred.";
      }

      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  }

  const disabled = isUploading || isClassifying;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="h-9 px-4 gap-2 shadow-sm" disabled={disabled}>
          <Upload size={14} /> Upload Files
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select File</FormLabel>
                  <Input
                    type="file"
                    accept=".pdf,.png"
                    className="border rounded px-2 py-1"
                    disabled={disabled}
                    onChange={(e) =>
                      field.onChange(e.target.files?.[0])
                    }
                  />
                  <FormMessage />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Accepted formats: PDF, PNG and DOCX (Max 10MB)
                  </p>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={disabled}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={disabled || !form.watch("file")}
              >
                {isUploading ? "Uploading..." : "Confirm Upload"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
