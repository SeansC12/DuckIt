"use client";

import { useState, useEffect, useRef } from "react";
import MarkdownRenderer from "@/components/transcript/markdown-renderer";

interface TranscriptionState {
  currentTranscript: string; // The current full transcript from the API
  aiGeneratedContent: string; // The AI's current fixed version
  unprocessed: string; // The portion of the transcript that hasn't been processed yet, appended to the end of the fixed markdown
  isProcessing: boolean;
  wordsProcessedCount: number; // How many words we've processed so far
  lastAiUpdateWordCount: number; // Word count when AI last updated
}

export default function TranscriptFixer() {
  const [input, setInput] = useState("");
  const [state, setState] = useState<TranscriptionState>({
    currentTranscript: "",
    aiGeneratedContent: "",
    unprocessed: "",
    isProcessing: false,
    wordsProcessedCount: 0,
    lastAiUpdateWordCount: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastGenerationRef = useRef<string>("");

  const startProcessing = async () => {
    const words = input
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    setState((prev) => ({
      ...prev,
      currentTranscript: "",
      aiGeneratedContent: "",
      isProcessing: true,
      wordsProcessedCount: 0,
      lastAiUpdateWordCount: 0,
    }));

    lastGenerationRef.current = "";

    // Simulate transcript API: feed words at 3 words per second
    let currentWordIndex = 0;

    intervalRef.current = setInterval(async () => {
      if (currentWordIndex >= words.length) {
        // Process final transcript if there are remaining words since last AI update
        setState((prev) => {
          const finalWordCount = words.length;
          const finalTranscript = words.join(" ");

          if (finalWordCount > prev.lastAiUpdateWordCount) {
            updateAiGeneration(finalTranscript, finalWordCount);
          }

          return { ...prev, isProcessing: false };
        });

        clearInterval(intervalRef.current!);
        return;
      }

      // get the next word, append it to unprocessed
      const nextWord = words[currentWordIndex];
      setState((prev) => ({
        ...prev,
        unprocessed: prev.unprocessed + " " + nextWord,
      }));

      // then slice the new full transcript, including that next word
      currentWordIndex++;
      const newTranscript = words.slice(0, currentWordIndex).join(" ");

      setState((prev) => ({
        ...prev,
        currentTranscript: newTranscript,
        wordsProcessedCount: currentWordIndex,
      }));

      // Update AI generation every 5 words
      if (currentWordIndex % 5 === 0 || currentWordIndex === words.length) {
        await updateAiGeneration(newTranscript, currentWordIndex);
      }
    }, 333); // 3 words per second
  };

  const updateAiGeneration = async (
    fullTranscript: string,
    wordCount: number,
  ) => {
    try {
      const response = await fetch("/api/fix-transcription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rawTranscription: fullTranscript,
          previousGeneration: lastGenerationRef.current,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process transcription");
      }

      const data = await response.json();
      const fixedText = data.fixedText;

      lastGenerationRef.current = fixedText;

      setState((prev) => ({
        ...prev,
        aiGeneratedContent: fixedText,
        unprocessed: "",
        lastAiUpdateWordCount: wordCount,
      }));
    } catch (error) {
      console.error("Error updating AI generation:", error);
    }
  };

  const stopProcessing = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState((prev) => ({ ...prev, isProcessing: false }));
  };

  const resetAll = () => {
    stopProcessing();
    setInput("");
    setState({
      currentTranscript: "",
      aiGeneratedContent: "",
      unprocessed: "",
      isProcessing: false,
      wordsProcessedCount: 0,
      lastAiUpdateWordCount: 0,
    });
    lastGenerationRef.current = "";
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Live Transcription Fixer
        </h1>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Raw Transcription Input
          </h2>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter the raw transcription text here..."
            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={state.isProcessing}
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={startProcessing}
              disabled={!input.trim() || state.isProcessing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              {state.isProcessing ? "Processing..." : "Start Processing"}
            </button>
            <button
              onClick={stopProcessing}
              disabled={!state.isProcessing}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Stop
            </button>
            <button
              onClick={resetAll}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Status Section */}
        {state.isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-blue-700 font-medium">
                Processing: {state.wordsProcessedCount} words received
              </span>
            </div>
            <div className="text-sm text-blue-600 mt-1">
              Last AI update: {state.lastAiUpdateWordCount} words
            </div>
          </div>
        )}

        {/* Output Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Raw Transcript */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="border-b p-4">
              <h2 className="text-xl font-semibold">Current Transcript</h2>
              <p className="text-sm text-gray-600">
                Raw transcription from API
              </p>
            </div>
            <div className="p-6">
              {state.currentTranscript ? (
                <div className="text-gray-800 whitespace-pre-wrap font-mono">
                  {state.currentTranscript}
                </div>
              ) : (
                <div className="text-gray-500 italic">
                  Transcript will appear here as it is received...
                </div>
              )}
            </div>
          </div>

          {/* AI Fixed Output */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="border-b p-4">
              <h2 className="text-xl font-semibold">AI Fixed Output</h2>
              <p className="text-sm text-gray-600">
                Processed & formatted version
              </p>
            </div>
            <div className="p-6">
              {state.aiGeneratedContent || state.unprocessed ? (
                <div className="prose prose-lg max-w-none">
                  <MarkdownRenderer
                    markdownText={state.aiGeneratedContent + state.unprocessed}
                  />
                </div>
              ) : (
                <div className="text-gray-500 italic">
                  AI-processed transcription will appear here...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Debug Info - Mock Simulation Only */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-yellow-800">
              Debug Info (Mock Simulation)
            </h3>
            <div className="text-sm space-y-1 text-yellow-700">
              <div>⚠️ This debug info is only available in mock mode</div>
              <div>Words processed: {state.wordsProcessedCount}</div>
              <div>Last AI update at: {state.lastAiUpdateWordCount} words</div>
              <div>Is processing: {state.isProcessing.toString()}</div>
              <div>
                Current transcript length: {state.currentTranscript.length}{" "}
                chars
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
