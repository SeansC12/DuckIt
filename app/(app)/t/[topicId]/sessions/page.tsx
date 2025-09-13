import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import SessionCard from "@/components/session-card";

export default async function SessionsPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;

  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .eq("topic_id", topicId)
    .order("created_at", { ascending: false });

  return (
    <div className="w-full">
      {sessions && sessions.length > 0 ? (
        <div className="w-full flex gap-6 justify-start flex-wrap">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <h3 className="text-xl font-semibold text-primary mb-2">
            No sessions yet
          </h3>
          <p className="text-primary mb-6">
            Start your first practice session for this topic
          </p>
          <Button asChild>
            <Link href={`/t/${topicId}/`}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Session
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
