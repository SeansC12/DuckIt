"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/database.types";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function TopicItem({ topic }: { topic: Tables<"topics"> }) {
  const supabase = createClient();
  const pathname = usePathname();
  const urlTopicId = pathname?.split("/t/")[1]?.split("/")[0];
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [changedTopicTitle, setChangedTopicTitle] = useState(topic.topic_title);

  const handleDeleteTopic = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (urlTopicId === topic.id) {
      router.push('/');
    }
    await supabase.from("topics").delete().eq('id', topic.id);
    router.refresh();
    console.log(`${topic.topic_title} deleted`);
  }

  const saveTopicTitle = async () => {
    const { error } = await supabase.from("topics").update({ topic_title: changedTopicTitle }).eq('id', topic.id);
    if (error) {
      console.log("Error changing topic title to", changedTopicTitle);
    }
  }

  return (
    <div className={`w-full flex justify-between items-center text-left py-2 px-3 rounded-lg ${urlTopicId === topic.id ? "bg-neutral-700" : ""} hover:bg-neutral-700 transition-colors truncate`}
      role="button"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => router.push(`/t/${topic.id}`)}
      onDoubleClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <input
          className="w-full h-full border-0 ring-0 outline-none focus:border-0 focus:outline-none focus:ring-0 focus:shadow-none appearance-none bg-transparent"
          value={changedTopicTitle}
          onChange={(e) => setChangedTopicTitle(e.target.value)}
          onBlur={() => {
            setIsEditing(false);
            saveTopicTitle();
          }}
        >
        </input>
      ) : (
        changedTopicTitle
      )
      }
      {isHovering && (
        <button className="aspect-square h-full rounded-lg hover:outline hover:outline-2 hover:outline-yellow-600"
          onClick={handleDeleteTopic}
        >
          <X />
        </button>
      )}
    </div>
  );
}
