import Navbar from "@/components/navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Sidebar, { type VideoResult } from "@/components/sidebar";
import { useToast } from "@/components/toast-provider";
import { Card } from "@/components/ui/card";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export default function InterfacePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<VideoResult | null>(null);
  const [isAttaching, setIsAttaching] = useState(false);
  const { toast } = useToast();

  const handleAttachVideo = async (video: VideoResult) => {
    setSelectedVideo(video);

    if (!video.url) {
      toast({
        title: "Invalid YouTube link",
        description: "Could not find a valid URL for this video.",
        status: "error",
      });
      return;
    }

    setIsAttaching(true);
    toast({
      title: "Sending video to backend…",
      status: "loading",
      duration: 1200,
    });

    try {
      const res = await fetch(`${API_BASE}/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: video.url }),
      });

      if (!res.ok) {
        throw new Error(`Backend responded with ${res.status}`);
      }

      const data = await res.json();

      setSelectedVideo((prev) =>
        prev
          ? { ...prev, id: data.videoId ?? prev.id }
          : { ...video, id: data.videoId ?? video.id }
      );

      toast({
        title: "Video ready",
        description: "Transcript ingested and embeddings prepared.",
        status: "success",
      });
    } catch (error) {
      toast({
        title: "Failed to attach video",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
      });
    } finally {
      setIsAttaching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">

        {/* LEFT SIDEBAR */}
        <Sidebar
          onSelectVideo={handleAttachVideo}
          isAttaching={isAttaching}
        />

        {/* RIGHT CHAT AREA */}
        <ChatArea 
          messages={messages}
          input={input}
          setInput={setInput}
          setMessages={setMessages}
          selectedVideo={selectedVideo}
          onAttachVideo={handleAttachVideo}
          isAttaching={isAttaching}
          onClearVideo={() => setSelectedVideo(null)}
        />
      </div>
    </div>
  );
}


type Message = { role: "user" | "assistant"; text: string };

function ChatArea({
  messages,
  input,
  setInput,
  setMessages,
  selectedVideo,
  onAttachVideo,
  isAttaching,
  onClearVideo,
}: {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  selectedVideo: VideoResult | null;
  onAttachVideo: (video: VideoResult) => Promise<void> | void;
  isAttaching: boolean;
  onClearVideo: () => void;
}) {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [linkInput, setLinkInput] = useState("");

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const payload =
      e.dataTransfer.getData("text/uri-list") ||
      e.dataTransfer.getData("text/plain") ||
      e.dataTransfer.getData("text/html");

    const url = extractYouTubeUrl(payload?.trim() ?? "");

    if (!url) {
      toast({
        title: "Only YouTube links supported",
        description: "Drop a valid YouTube video URL to attach it.",
        status: "error",
      });
      return;
    }

    const videoId = extractYouTubeId(url);
    const video: VideoResult = {
      id: videoId ?? url,
      title: "Dropped YouTube Link",
      url,
      channel: "Unknown channel",
      publishedAt: "",
      thumbnail: videoId
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : "https://i.ytimg.com/vi_webp/default.jpg",
    };

    onAttachVideo(video);
  };

  const attachLinkManually = () => {
    const url = linkInput.trim();
    if (!url) return;

    const youTubeUrl = extractYouTubeUrl(url);
    const videoId = youTubeUrl ? extractYouTubeId(youTubeUrl) : null;

    if (!youTubeUrl || !videoId) {
      toast({
        title: "Invalid YouTube link",
        description: "Paste a valid YouTube video URL.",
        status: "error",
      });
      return;
    }

    const video: VideoResult = {
      id: videoId,
      title: "Linked YouTube Video",
      url: youTubeUrl,
      channel: "YouTube",
      publishedAt: "",
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };

    onAttachVideo(video);
    setLinkInput("");
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!selectedVideo) {
      toast({
        title: "Attach a video first",
        description: "Select, paste, or drop a YouTube video to ask questions.",
        status: "error",
      });
      return;
    }

    setIsSending(true);

    setMessages((prev) => [...prev, { role: "user", text: input }]);
    toast({
      title: "Message sent",
      description: "Waiting for AI response…",
      status: "info",
      duration: 2000,
    });
    setInput("");

    try {
      const res = await fetch(`${API_BASE}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input,
          videoId: selectedVideo.id,
        }),
      });

      if (!res.ok) {
        throw new Error(`Backend responded with ${res.status}`);
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.answer || "No answer returned." },
      ]);
      toast({
        title: "Assistant responded",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Failed to get answer",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className={`flex flex-col flex-1 bg-background/50 backdrop-blur-lg ${
        isDragOver ? "border-2 border-dashed border-primary" : ""
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="mx-4 mt-4 flex flex-col gap-2 rounded-lg border border-border/60 p-3">
        <p className="text-sm font-semibold">Attach a YouTube link</p>
        <div className="flex gap-2">
          <Input
            placeholder="https://www.youtube.com/watch?v=..."
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && attachLinkManually()}
          />
          <Button onClick={attachLinkManually} disabled={isAttaching}>
            {isAttaching ? "Attaching..." : "Attach"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          You can also drag & drop a link into this panel or select from search.
        </p>
      </div>

      {selectedVideo ? (
        <Card className="m-4 flex items-center gap-4 bg-card/60 p-4">
          <div className="h-16 w-28 overflow-hidden rounded-md bg-secondary">
            <img
              src={selectedVideo.thumbnail}
              alt={selectedVideo.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold leading-tight line-clamp-2">
              {selectedVideo.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedVideo.channel || "YouTube"}
            </p>
            <a
              href={selectedVideo.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Open on YouTube
            </a>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearVideo}
          >
            Remove
          </Button>
        </Card>
      ) : (
        <div className="mx-4 mt-4 rounded-lg border border-dashed border-border/60 p-3 text-center text-sm text-muted-foreground">
          Drag a YouTube link anywhere in this panel to attach it to the chat.
        </div>
      )}

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <ChatBubble key={i} role={msg.role} text={msg.text} />
        ))}
      </div>

      {/* INPUT BAR */}
      <div className="border-t border-border p-4 flex gap-3">
        <Input
          placeholder="Ask anything about the video..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button onClick={sendMessage} disabled={isSending}>
          {isSending ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
function ChatBubble({ role, text }: { role: Message["role"]; text: string }) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-xl p-3 rounded-lg 
          ${isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-secondary text-secondary-foreground"
          }
          shadow-md
        `}
      >
        {text}
      </div>
    </div>
  );
}

function extractYouTubeUrl(input: string) {
  if (!input) return null;
  const match = input.match(
    /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/[^\s]+/i
  );
  return match ? match[0] : null;
}

function extractYouTubeId(url: string) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? match[1] : null;
}
