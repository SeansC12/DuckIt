import { Dispatch, SetStateAction } from "react";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Tables } from "@/database.types";

export default function SessionCard({
  session,
}: {
  session: Tables<"sessions">;
}) {
  return (
    <Card className="h-full w-full grid grid-rows-[auto_1fr] bg-transparent border-4">
      <CardHeader>
        <CardTitle>{session.annotated_transcript?.slice(0, 25)}</CardTitle>
        <CardDescription>Date: {session.created_at ? new Date(session.created_at).toLocaleDateString() : 'No date available'}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Link
          href={`/t/${session.topic_id}/sessions/${session.id}`}
          className="underline font-bold text-sm"
        >
          View Summary
        </Link>
      </CardFooter>
    </Card>
  );
}
