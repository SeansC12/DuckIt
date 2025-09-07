"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Import components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import FileItem from "@/components/file-item";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Import icons
import { Import, MonitorSmartphone, Trash2 } from "lucide-react";
import { FaGoogleDrive, FaStop, FaPlay } from "react-icons/fa";

// Speech Recognition
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

// Audio
import { Howl } from "howler";

// Animation
import { AnimationTypes, ANIMATION_FRAMES } from "@/lib/Animation";

import { TextFile } from "@/lib/TextFile";
import { Input } from "@/components/ui/input";

const TEST_FILES: TextFile[] = [
  {
    name: "math.txt",
    content: ` Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
    Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
    Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
    Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
    Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
    Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
`,
    id: "0",
  },
  {
    name: "more math.txt",
    content: "live laugh love math",
    id: "1",
  },
];

const ANIMATION_SPEED = 100;
const TALKING_TIMEOUT = 1000;

interface RecordingState {
  isRecording: boolean;
  time: number;
  isTalking: boolean;
  frame: number;
}

export default function TopicDetailedPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = use(params);
  const router = useRouter();

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    time: 0,
    isTalking: false,
    frame: 3,
  });

  const soundRef = useRef<Howl | null>(null);
  const talkingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // google drive integration
  const [files, setFiles] = useState(TEST_FILES);
  const URL_PLACEHOLDER = "https://drive.google.com/file/d/...";
  // "https://drive.google.com/file/d/1jnvYxbkM9ALR-DZPD_5cvVhJHwqQ1xpu/view?usp=share_link";
  const [url, setUrl] = useState(URL_PLACEHOLDER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fileName, setFileName] = useState("Untitled.txt");

  // Initialise audio
  useEffect(() => {
    soundRef.current = new Howl({
      src: ["/sound/quack.mp3"],
      preload: true,
    });

    return () => {
      soundRef.current?.unload();
    };
  }, []);

  // Handle talking detection
  useEffect(() => {
    if (!recordingState.isRecording) return;

    if (transcript && transcript.trim().length > 0) {
      setRecordingState((prev) => ({ ...prev, isTalking: true }));

      if (talkingTimeoutRef.current) {
        clearTimeout(talkingTimeoutRef.current);
      }

      talkingTimeoutRef.current = setTimeout(() => {
        setRecordingState((prev) => ({ ...prev, isTalking: false }));
        // soundRef.current?.play();
      }, TALKING_TIMEOUT);
    }

    return () => {
      if (talkingTimeoutRef.current) {
        clearTimeout(talkingTimeoutRef.current);
      }
    };
  }, [transcript, recordingState.isRecording]);

  // Handle animation
  useEffect(() => {
    if (!recordingState.isRecording) return;

    animationIntervalRef.current = setInterval(() => {
      setRecordingState((prev) => ({
        ...prev,
        frame: prev.isTalking
          ? (prev.frame + 1) %
            ANIMATION_FRAMES[AnimationTypes.WalkNormal].length
          : 3,
      }));
    }, ANIMATION_SPEED);

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, [recordingState.isRecording, recordingState.isTalking]);

  // Handle timer
  useEffect(() => {
    if (!recordingState.isRecording) return;

    timerIntervalRef.current = setInterval(() => {
      setRecordingState((prev) => ({ ...prev, time: prev.time + 1 }));
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [recordingState.isRecording]);

  // Start recording - simplified approach
  const startRecording = useCallback(() => {
    console.log("Starting recording...");

    if (!browserSupportsSpeechRecognition) {
      alert("Browser doesn't support speech recognition.");
      return;
    }

    resetTranscript();

    setRecordingState((prev) => ({
      ...prev,
      isRecording: true,
      time: 0,
      frame: 3,
      isTalking: false,
    }));

    SpeechRecognition.startListening({
      continuous: true,
    });

    console.log("Speech recognition started");
  }, [browserSupportsSpeechRecognition, resetTranscript]);

  const stopRecording = useCallback(() => {
    console.log("Stopping recording...");

    SpeechRecognition.stopListening();
    setRecordingState((prev) => ({
      ...prev,
      isRecording: false,
      time: 0,
      isTalking: false,
      frame: 3,
    }));

    if (talkingTimeoutRef.current) {
      clearTimeout(talkingTimeoutRef.current);
    }

    console.log("Final transcript:", transcript);

    // router.push(`/t/${topicId}/sessions`);
  }, [router, topicId, transcript]);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  }, []);

  // add the file
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // if fileName is empty
    if (fileName == "") {
      alert("File name cannot be empty");
      return;
    }

    try {
      const response = await fetch("/api/upload-from-drive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ googleDriveUrl: url }),
      });

      const result = await response.json();

      if (result.success) {
        // console.log(result.file);
        const file: TextFile = {
          name: fileName,
          content: result.fileContent,
          id: result.fileId,
        };
        setFiles([...files, file]);
        setUrl(URL_PLACEHOLDER);

        // close the dialog box
        setDialogOpen(false);

        alert("File uploaded successfully!");
      } else {
        setError(result.error || "Upload failed");
      }
    } catch (err) {
      setError("Network error occurred");
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Show error if browser doesn't support speech recognition
  // if (!browserSupportsSpeechRecognition) {
  //   return (
  //     <div className="text-center text-red-600">
  //       <h2>Browser Not Supported</h2>
  //       <p>
  //         Browser doesn&apos;t support speech recognition. Please use Chrome,
  //         Edge, or Safari.
  //       </p>
  //     </div>
  //   );
  // }

  return (
    <div className="flex space-y-8 items-center flex-col w-full max-w-[1600px]">
      <div
        className={`w-70 h-70 rounded-full bg-background border-4 transition-colors duration-200 ${
          recordingState.isTalking
            ? "border-green-600"
            : listening
              ? "border-yellow-600"
              : "border-red-500"
        }`}
      >
        <Image
          src={
            ANIMATION_FRAMES[AnimationTypes.WalkNormal][recordingState.frame]
          }
          width={240}
          height={240}
          className="w-60 h-60 [image-rendering:pixelated]"
          alt="Duck Animation"
          priority
        />
      </div>

      <p className="text-4xl font-bold mb-4">
        {formatTime(recordingState.time)}
      </p>

      <Button
        className="bg-[#ffc300] hover:bg-[#e6b800] w-64 h-16 text-lg rounded-2xl !transition-all"
        onClick={recordingState.isRecording ? stopRecording : startRecording}
      >
        {recordingState.isRecording ? (
          <FaStop fill="#000" className="!size-14" size={30} />
        ) : (
          <FaPlay fill="#000" className="!size-14" size={30} />
        )}
        {recordingState.isRecording ? "End session" : "Start a new session"}
      </Button>

      <hr className="w-full border-t-[0.5px] border-border my-8" />

      <div className="w-full max-w-[1600px]">
        {recordingState.isRecording ? (
          <div className="bg-neutral-900 p-6 rounded-lg min-h-[120px] transition-all transition-discrete">
            <h3 className="font-medium mb-2">Formatted Transcript</h3>
            <p className="italic">
              {transcript || "Start speaking to see your transcript here..."}
            </p>
          </div>
        ) : (
          // Default View
          <div className="w-full grid grid-cols-2 gap-12 transition-all transition-discrete">
            <div className="grid w-full gap-3 h-max">
              <Label className="text-xl" htmlFor="prompt">
                Your prompt
              </Label>
              <Textarea
                className="!text-2xl mt-2"
                placeholder="Type your content or special instructions here."
                id="prompt"
              />
            </div>
            {/* Files Section */}
            <div>
              <div className="flex justify-between">
                <h2 className="text-xl font-semibold mb-4">Files</h2>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button>
                        <Import className="w-4 h-4 mr-2" />
                        Import
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DialogTrigger asChild>
                        <DropdownMenuItem
                          onClick={() => console.log("clicked")}
                        >
                          <FaGoogleDrive className="w-4 h-4 mr-2" />
                          Google Drive
                        </DropdownMenuItem>
                      </DialogTrigger>

                      <DropdownMenuItem>
                        <MonitorSmartphone className="w-4 h-4 mr-2" />
                        My Device
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DialogContent className="sm:max-w-[425px] bg-input">
                    <DialogHeader>
                      <DialogTitle>Add Google Drive File</DialogTitle>
                      <DialogDescription>
                        Make sure that your file's view permissions are set to
                        "anyone with the link". Only .txt files are allowed for
                        the time being.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 mb-3">
                      <div>
                        <Label>File Name</Label>
                        <Input
                          value={fileName}
                          onChange={(e) => setFileName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>URL</Label>
                        <Input
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button onClick={handleSubmit}>Add</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="mt-2 space-y-3">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <FileItem fileName={file.name} fileContent={file.content} />
                    <Button variant="secondary" size="sm">
                      <Trash2 className="w-4 h-4" color="#FF383C" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
