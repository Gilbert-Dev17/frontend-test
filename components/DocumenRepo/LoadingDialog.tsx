import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogMedia,
} from "@/components/ui/alert-dialog";
import { Loader2Icon } from "lucide-react";

type LoadingDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
};

export function LoadingDialog({
  open,
  title = "Processing document...",
  description = "LegalBERT is analyzing your document. Please wait.",
}: LoadingDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-sm p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <AlertDialogHeader className="flex flex-row items-center gap-4">
          <AlertDialogMedia>
            <Loader2Icon className="animate-spin w-12 h-12 text-primary-600 dark:text-primary-400" />
          </AlertDialogMedia>
          <div className="flex flex-col gap-1">
            <AlertDialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600 dark:text-gray-300">
              {description}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}
