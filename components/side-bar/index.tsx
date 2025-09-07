import { createClient } from "@/lib/supabase/server";
import React from "react";
import TopicItem from "./topic-item";

export default async function Sidebar() {
  const supabase = await createClient();
  const { data: topics, error } = await supabase.from("topics").select();

  if (error) {
    return <div>Error loading topics</div>;
  }

  return (
    <nav className="hidden md:flex md:flex-col w-80 bg-neutral-900 text-white h-screen p-4 border-r-2 border-r-secondary">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-center">DuckIt</h1>
      </div>

      <div className="space-y-3 mb-8">
        <button className="w-full py-2 px-3 hover:bg-neutral-900 border-[1px] border-yellow-600 rounded-lg transition-colors text-left">
          New Topic
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
