import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "./ui/shadcn-io/spinner";

export function SessionGenerationLoadingDialog({ open }: { open: boolean }) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-3">
            <Spinner variant="circle-filled" />
            Processing your study session...
          </AlertDialogTitle>
          <AlertDialogDescription>
            We are currently crunching the data and preparing your results. This
            will take a few moments.
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}
