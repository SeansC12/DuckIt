import { FileText, FileTextIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { Button } from "./ui/button";
import { Label } from "@/components/ui/label";

export default function FileItem({
  fileName,
  fileContent,
}: {
  fileName: string;
  fileContent: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex gap-2 cursor-pointer">
          <FileText />
          {fileName}
        </div>
      </DialogTrigger>
      <DialogContent className="h-[80%] rounded bg-input p-14 space-y-5 flex flex-col [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-3">
              <FileTextIcon size={25} />
              {fileName}
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="!overflow-y-scroll flex-1 whitespace-pre-line no-scrollbar">
          <Label className="leading-loose">{fileContent}</Label>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" className="font-bold">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
