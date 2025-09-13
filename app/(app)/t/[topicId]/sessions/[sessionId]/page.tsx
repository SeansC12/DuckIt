import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, FileText, MessageSquare } from "lucide-react";
import MarkdownRenderer from "@/components/transcript/markdown-renderer";
import { ScoreDashboard } from "@/components/sessions/score-dashboard";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ topicId: string; sessionId: string }>;
}) {
  const { topicId, sessionId } = await params;

  const supabase = await createClient();

  // Fetch the session data
  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("topic_id", topicId)
    .single();

  if (error || !session) {
    notFound();
  }

  // Fetch the topic data for context
  const { data: topic } = await supabase
    .from("topics")
    .select("topic_title")
    .eq("id", topicId)
    .single();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (createdAt: string, updatedAt: string) => {
    const start = new Date(createdAt);
    const end = new Date(updatedAt);
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8">
      <h1>DuckIt Score</h1>
      <ScoreDashboard
        donutScore={80}
        accuracyScore={76}
        familiarityScore={88}
      />
      <div className="grid grid-cols-[60%_40%] gap-2">
        <div className="w-full rounded-lg border p-6 space-y-4">
          <h1>Annotated Transcript</h1>
          <MarkdownRenderer markdownText={session.annotated_transcript || ""} />
        </div>
        <div className="w-full rounded-lg border p-6 space-y-4">
          <h1>Summary</h1>
          <MarkdownRenderer markdownText={session.summary || ""} />
        </div>
      </div>
    </div>
  );
}
