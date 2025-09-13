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
    <Link
      className="group"
      href={`/t/${session.topic_id}/sessions/${session.id}`}
    >
      <Card className="w-full min-w-96 max-w-lg">
        <CardHeader>
          <CardTitle className="group-hover:underline">
            {session.annotated_transcript?.slice(0, 5)}
          </CardTitle>
          <CardDescription>
            {session.annotated_transcript?.slice(0, 200)}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          Created at{" "}
          {session.created_at
            ? new Date(session.created_at).toLocaleDateString()
            : "No date available"}
        </CardFooter>
      </Card>
    </Link>
  );
}
