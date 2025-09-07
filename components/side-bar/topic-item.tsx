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

  const [isHovering, setIsHovering] = useState(false);

  const handleClick = () => {
    router.push(`/t/${topic.id}`);
  }

  const handleDeleteTopic = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (urlTopicId === topic.id) {
      router.push('/');
    }
    await supabase.from("topics").delete().eq('id', topic.id);
    router.refresh();
    console.log(`${topic.topic_title} deleted`);
  }

  return (
    <div className={`w-full flex justify-between text-left py-2 px-3 rounded-lg ${urlTopicId === topic.id ? "bg-neutral-700" : ""} hover:bg-neutral-700 transition-colors truncate`}
      role="button"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleClick}
    >
    {topic.topic_title}
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
