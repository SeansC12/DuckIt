import { createClient } from "@/lib/supabase/server";
import React from "react";
import TopicItem from "./topic-item";
import CreateTopicButton from "./createTopicButton";
import favicon from "@/public/favicon.png";
import { Search } from "lucide-react";
import Image from "next/image";

export default async function Sidebar() {
  const supabase = await createClient();
  const { data: topics, error } = await supabase
    .from("topics")
    .select()
    .order("created_at", { ascending: false });

  if (error) {
    return <div>Error loading topics</div>;
  }

  return (
    <nav className="hidden md:flex md:flex-col w-80 text-white h-screen p-4">
      <div className="my-8 flex flex-col items-center justify-center gap-2">
        <Image src={favicon} alt="DuckIt Logo" width={50} height={50} />
        <h1 className="text-2xl font-bold text-center">DuckIt</h1>
      </div>

      <div className="space-y-3 mb-8">
        <CreateTopicButton />
        <button className="w-full py-2 px-3 hover:bg-neutral-900 rounded-lg transition-colors text-left">
          <Search className="h-4 w-4 inline mr-2" />
          Search Topics
        </button>
      </div>

      <div className="flex-1">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4 pl-2">
          Topics
        </h2>
        <div className="space-y-2">
          {topics?.map((topic) => (
            <TopicItem key={topic.id} topic={topic} />
          ))}
        </div>
      </div>
    </nav>
  );
}
