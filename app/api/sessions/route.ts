import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { generateCritique } from "@/service/critique"


interface SessionRequestBody {
  topicId: string,
  rawTranscript: string;
  aiProcessedTranscript: string;
}


export async function POST(
  request: NextRequest,
) {
  try {
    const data: SessionRequestBody = await request.json();

    if (!data.rawTranscript || !data.aiProcessedTranscript) {
      return NextResponse.json(
        { error: "Validation error on request body." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const critique = await generateCritique(data.rawTranscript, data.aiProcessedTranscript);

    // Create the session in the database
    const { data: session, error } = await supabase
      .from("sessions")
      .insert({
        topic_id: data.topicId,
        raw_transcript: data.rawTranscript,
        ai_processed_transcript: data.aiProcessedTranscript,
        annotated_transcript: critique.annotatedTranscript,
        summary: critique.summary,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
