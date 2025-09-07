"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CreateTopicButton() {

  const supabase = createClient();
  const router = useRouter();

  const createNewTopic = async () => {

    const { data: topics, error: selectError } = await supabase.from("topics").select();

    if (selectError) {
      return <div>Error loading topics</div>;
    }

    const topicCount = topics.length;
    const topicTitle = `Topic ${topicCount + 1}`;

    const { error: insertError } = await supabase.from("topics").insert({ topic_title: topicTitle });
    if (insertError) {
      return (
        <span>Failed to insert to database</span>
      );
    }
    router.refresh();

  }

  return (
    <button className="w-full py-2 px-3 hover:bg-neutral-900 border-[1px] border-yellow-600 rounded-lg transition-colors text-left"
      onClick={createNewTopic}
    >
      New Topic
    </button>
  );
}
