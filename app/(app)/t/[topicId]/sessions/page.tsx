import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Clock } from "lucide-react";

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-10">
      {sessions && sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Clock className="w-4 h-4" />
                    {session.created_at && formatDate(session.created_at)}
                  </div>

                  {session.transcript && (
                    <p className="text-gray-700 mb-3 line-clamp-3">
                      {session.transcript.slice(0, 200)}...
                    </p>
                  )}

                  {session.final_feedback && (
                    <div className="bg-blue-50 p-3 rounded-md">
                      <h4 className="font-medium text-blue-900 mb-1">
                        Feedback
                      </h4>
                      <p className="text-blue-800 text-sm">
                        {session.final_feedback.slice(0, 150)}...
                      </p>
                    </div>
                  )}
                </div>

                <Button variant="outline" asChild>
                  <Link href={`/t/${topicId}/session/${session.id}`}>
                    View Details
                  </Link>
                </Button>
              </div>
            </div>
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
