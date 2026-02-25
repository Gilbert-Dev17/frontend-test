'use client'

import { DeleteCaseFile } from "@/lib/storage/case-view/deleteCaseFile";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export const DeleteCaseFileDialog = ({ caseId, fileName, fileId}: { caseId: string; fileName: string; fileId: string }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await DeleteCaseFile(caseId, fileName, fileId);

      toast.success(`"${fileName}" deleted successfully`);
      if (process.env.NODE_ENV === 'development')
        {console.log(`Deleted file: ${fileName} from case: ${caseId}`);
      }

      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete file");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="text-red-600"
        >
          <Trash2Icon size={16} />
          Delete File
        </DropdownMenuItem>
      </AlertDialogTrigger>

      <AlertDialogContent size='sm'>
        <AlertDialogHeader className='flex flex-col items-center gap-4'>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <div className='flex flex-col items-center text-center gap-2'>
            <AlertDialogTitle>
              Delete this file?
            </AlertDialogTitle>

            <AlertDialogDescription>
              You are about to permanently delete:
              <span className="block mt-2 font-medium text-foreground">
                {fileName}
              </span>
              This action cannot be undone.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            variant="destructive"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
