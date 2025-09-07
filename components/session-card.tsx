import { Dispatch, SetStateAction } from "react";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Session } from "@/lib/Session";

export default function SessionCard({
  session,
  setIsDetail,
}: {
  session: Session;
  setIsDetail: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Card className="h-full w-full grid grid-rows-[auto_1fr] bg-transparent border-4">
      <CardHeader>
        <CardTitle>{session.name}</CardTitle>
        <CardDescription>Date: {session.date.toDateString()}</CardDescription>
      </CardHeader>
      <CardFooter className="">
        <Button
          variant={"secondary"}
          className="underline font-bold text-sm"
          onClick={() => setIsDetail(true)}
        >
          View Summary
        </Button>
      </CardFooter>
    </Card>
  );
}
