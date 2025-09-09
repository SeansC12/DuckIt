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
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";

import FileItem from "@/components/file-item";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Import icons
import {
  AlertCircle,
  CheckCircle,
  Import,
  Loader2Icon,
  MonitorSmartphone,
  Trash2,
  XIcon,
} from "lucide-react";
import { FaGoogleDrive, FaStop, FaPlay } from "react-icons/fa";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Howl } from "howler";
import { AnimationTypes, ANIMATION_FRAMES } from "@/lib/Animation";
import TranscriptDisplay from "@/components/transcript";

import { TextFile } from "@/lib/TextFile";

const ANIMATION_SPEED = 100;
const TALKING_TIMEOUT = 1000;

interface RecordingState {
  isRecording: boolean;
  time: number;
  isTalking: boolean;
  frame: number;
}

enum ImportOption {
  Device,
  GoogleDrive,
  Closed,
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
  const [files, setFiles] = useState<TextFile[]>([]);
  const URL_PLACEHOLDER = "https://drive.google.com/file/d/...";
  // "https://drive.google.com/file/d/1jnvYxbkM9ALR-DZPD_5cvVhJHwqQ1xpu/view?usp=share_link";
  const [url, setUrl] = useState(URL_PLACEHOLDER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("Untitled.txt");
  const [AiProcessedTranscript, setAiProcessedTranscript] = useState("");
  // for the aler that pops up upon successful file upload
  const [successAlert, setSuccessAlert] = useState(false);

  // for the dialog
  // for which import option dialog is opened when "import" is clicked
  const [importOption, setImportOption] = useState<ImportOption>(
    ImportOption.Closed,
  );

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

  const stopRecording = useCallback(async () => {
    console.log("Stopping recording...");

    SpeechRecognition.stopListening();
    setRecordingState((prev) => ({ ...prev, isRecording: false, time: 0, isTalking: false, frame: 3 }));

    if (talkingTimeoutRef.current) {
      clearTimeout(talkingTimeoutRef.current);
    }

    const finalTranscript = AiProcessedTranscript || transcript.trim();
    let sessionId;
    
    if (finalTranscript.length > 0) {
      try {
        const response = await fetch("/api/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topicId: topicId,
            rawTranscript: transcript,
            aiProcessedTranscript: AiProcessedTranscript,
          }),
        });

        const data = await response.json();
        sessionId = data.sessionId;
      } catch (error) {
        console.error("Error creating session:", error);
      }
    }

    if (sessionId) {
      router.push(`/t/${topicId}/sessions/${sessionId}`);
    } else {
      router.push(`/t/${topicId}/sessions`);
    }

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
      setError("File name cannot be empty.");
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
        setFileName("Untitled.txt");

        // close the dialog box
        setImportOption(ImportOption.Closed);
        setSuccessAlert(true);
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

  // remove files
  const removeFile = (file: TextFile) => {
    setFiles(files.filter((f) => f != file));
  };

  // handle drop files
  const handleDrop = async (acceptedFiles: File[]) => {
    // since only 1 file is allowed
    setError("");
    const file = acceptedFiles[0];

    const text = await file.text();
    const newFile: TextFile = {
      name: file.name,
      content: text,
      id: crypto.randomUUID(),
    };
    // Store the processed text files in state
    setFiles((prev) => [...prev, newFile]);
    // close the dialog
    setImportOption(ImportOption.Closed);
    // show success alert
    setSuccessAlert(true);
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
      {successAlert && (
        <Alert
          variant="default"
          className="w-full max-w-md fixed top-5 right-5 z-[100] flex justify-between items-center"
        >
          <div className="flex gap-4 items-center text-green-600">
            <CheckCircle size={20} color="#16a34a" />
            <AlertTitle>File Uploaded Successfully!</AlertTitle>
          </div>
          <Button
            className="hover:bg-transparent"
            onClick={() => setSuccessAlert(false)}
            variant={"ghost"}
          >
            <XIcon />
          </Button>
        </Alert>
      )}

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
          <TranscriptDisplay transcript={transcript} setAiProcessedTranscript={setAiProcessedTranscript} />
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
                <Dialog
                  open={
                    importOption == ImportOption.GoogleDrive ||
                    importOption == ImportOption.Device
                  }
                  onOpenChange={(isOpen) =>
                    setImportOption(isOpen ? importOption : ImportOption.Closed)
                  }
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button>
                        <Import className="w-4 h-4 mr-2" />
                        Import
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() =>
                          setImportOption(ImportOption.GoogleDrive)
                        }
                      >
                        <FaGoogleDrive className="w-4 h-4 mr-2" />
                        Google Drive
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => setImportOption(ImportOption.Device)}
                      >
                        <MonitorSmartphone className="w-4 h-4 mr-2" />
                        My Device
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {importOption == ImportOption.GoogleDrive ? (
                    <DialogContent className="sm:max-w-[425px] bg-input">
                      <DialogHeader>
                        <DialogTitle>Add Google Drive File</DialogTitle>
                        <DialogDescription>
                          {`Make sure that your file's view permissions are set to
                        "anyone with the link". Only .txt files are allowed for
                        the time being.`}
                        </DialogDescription>
                        {error != "" && (
                          <Alert
                            variant="destructive"
                            className="w-full max-w-md"
                          >
                            <AlertCircle />
                            <AlertTitle className="inline">{error}</AlertTitle>
                          </Alert>
                        )}
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
                        {loading ? (
                          <Button size="sm" disabled>
                            <Loader2Icon className="animate-spin" />
                            Adding
                          </Button>
                        ) : (
                          <Button onClick={handleSubmit}>Add</Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  ) : (
                    <DialogContent className="sm:max-w-[425px] bg-input">
                      <DialogHeader>
                        <DialogTitle>Import from device</DialogTitle>
                      </DialogHeader>
                      <div>
                        {error != "" && (
                          <Alert
                            variant="destructive"
                            className="w-full max-w-md"
                          >
                            <AlertCircle />
                            <AlertTitle className="inline">{error}</AlertTitle>
                          </Alert>
                        )}
                        <Dropzone
                          accept={{ "text/plain": [".txt"] }}
                          maxFiles={1}
                          multiple={false}
                          onDrop={handleDrop}
                          onError={(error) => setError(error.message)}
                        >
                          <DropzoneEmptyState />
                          <DropzoneContent />
                        </Dropzone>
                      </div>
                      <DialogFooter></DialogFooter>
                    </DialogContent>
                  )}
                </Dialog>
              </div>
              <div className="mt-2 space-y-3">
                {files.length == 0 ? (
                  <p>No files added yet. Import files to provide context.</p>
                ) : (
                  files.map((file, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center hover:bg-neutral-800"
                    >
                      <FileItem
                        fileName={file.name}
                        fileContent={file.content}
                      />
                      <Button
                        variant="ghost"
                        className=""
                        onClick={() => removeFile(file)}
                      >
                        <Trash2 color="#FF383C" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
