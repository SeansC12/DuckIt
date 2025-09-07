"use client";

import { use, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function TopicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ topicId: string }>;
}) {
  const [topicTitle, setTopicTitle] = useState("Loading...");
  const { topicId } = use(params);
  const pathname = usePathname();

  useEffect(() => {
    const fetchTopicTitle = async () => {
      const supabase = createClient();
      const { data: topicName } = await supabase
        .from("topics")
        .select("topic_title")
        .eq("id", topicId)
        .single();
      setTopicTitle(topicName?.topic_title || "Error retrieving topic.");
    };

    fetchTopicTitle();
  }, [topicId]);

  const isSessionsPage = pathname?.includes("/sessions");
  const defaultTab = isSessionsPage ? "summary" : "session";

  return (
    <div className="px-20 py-10 space-y-8">
      <h1>{topicTitle}</h1>
      <Tabs value={defaultTab}>
        <TabsList>
          <Link href={`/t/${topicId}`}>
            <TabsTrigger
              value="session"
              className="dark:data-[state=active]:text-white"
            >
              New Session
            </TabsTrigger>
          </Link>
          <Link href={`/t/${topicId}/sessions`}>
            <TabsTrigger
              value="summary"
              className="dark:data-[state=active]:text-white"
            >
              Past Sessions
            </TabsTrigger>
          </Link>
        </TabsList>
        <TabsContent
          className="flex justify-center items-center"
          value={defaultTab}
        >
          {children}
        </TabsContent>
      </Tabs>
    </div>
  );
}
