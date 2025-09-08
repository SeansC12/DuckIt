"use client";

import { useState, useEffect, useRef } from "react";
import MarkdownRenderer from "@/components/transcript/markdown-renderer";

interface TranscriptProcessorProps {
  transcript: string;
  className?: string;
}

interface ProcessingState {
  aiGeneratedContent: string;
  unprocessed: string;
  isProcessing: boolean;
  lastProcessedLength: number;
  lastUpdateTime: number;
}

export default function TranscriptDisplay({ 
  transcript, 
  className = "" 
}: TranscriptProcessorProps) {
  const [state, setState] = useState<ProcessingState>({
    aiGeneratedContent: "",
    unprocessed: "",
    isProcessing: false,
    lastProcessedLength: 0,
    lastUpdateTime: 0,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastGenerationRef = useRef<string>("");
  const isProcessingRef = useRef<boolean>(false);

  const updateAiGeneration = async (currentTranscript: string) => {
    if (isProcessingRef.current || !currentTranscript.trim()) {
      return;
    }

    isProcessingRef.current = true;
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const response = await fetch("/api/fix-transcription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rawTranscription: currentTranscript,
          previousGeneration: lastGenerationRef.current,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process transcription");
      }

      const data = await response.json();
      const fixedText = data.fixedText;

      lastGenerationRef.current = fixedText;

      setState(prev => ({
        ...prev,
        aiGeneratedContent: fixedText,
        unprocessed: "",
        lastProcessedLength: currentTranscript.length,
        lastUpdateTime: Date.now(),
        isProcessing: false,
      }));
    } catch (error) {
      console.error("Error updating AI generation:", error);
      setState(prev => ({ ...prev, isProcessing: false }));
    } finally {
      isProcessingRef.current = false;
    }
  };

  const scheduleUpdate = (transcript: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isProcessingRef.current || transcript.length <= state.lastProcessedLength) {
      return;
    }

    const newContentLength = transcript.length - state.lastProcessedLength;
    const baseDelay = 1000;
    const maxDelay = 3000;
    
    const delay = Math.min(maxDelay, baseDelay + (50 - newContentLength) * 20);
    
    timeoutRef.current = setTimeout(() => {
      updateAiGeneration(transcript);
    }, Math.max(500, delay));
  };

  useEffect(() => {
    if (!transcript.trim()) {
      setState({
        aiGeneratedContent: "",
        unprocessed: "",
        isProcessing: false,
        lastProcessedLength: 0,
        lastUpdateTime: 0,
      });
      lastGenerationRef.current = "";
      return;
    }

    // Update unprocessed text immediately for responsive UI
    const newContent = transcript.slice(state.lastProcessedLength);
    if (newContent) {
      setState(prev => ({
        ...prev,
        unprocessed: newContent,
      }));
    }

    // Schedule AI update
    scheduleUpdate(transcript);
  }, [transcript]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const hasContent = state.aiGeneratedContent || state.unprocessed;
  const displayContent = state.aiGeneratedContent + state.unprocessed;

  return (
    <div className={`bg-neutral-900 rounded-lg shadow-sm border ${className}`}>
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">AI Processed Transcript</h2>
            <p className="text-sm">
              Automatically formatted and corrected for your convenience.
            </p>
          </div>
          {state.isProcessing && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Processing...</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6">
        {hasContent ? (
          <div className="prose prose-lg max-w-none">
            <MarkdownRenderer markdownText={displayContent} />
          </div>
        ) : (
          <div className="text-neutral-300 italic">
            Processed transcript will appear here as content is added...
          </div>
        )}
      </div>

      {/* Debug info in development */}
      {process.env.NODE_ENV === "development" && transcript && (
        <div className="border-t bg-gray-50 p-3">
          <div className="text-xs space-y-1 text-gray-600">
            <div>Transcript length: {transcript.length} chars</div>
            <div>Last processed: {state.lastProcessedLength} chars</div>
            <div>Unprocessed: {state.unprocessed.length} chars</div>
            <div>Is processing: {state.isProcessing.toString()}</div>
            {state.lastUpdateTime > 0 && (
              <div>
                Last update: {new Date(state.lastUpdateTime).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
