import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Sidebar from "@/components/sidebar";

export default function InterfacePage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
   const [selectedVideo, setSelectedVideo] = useState(null);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">

        {/* LEFT SIDEBAR */}
       <Sidebar onSelectVideo={(video) => setSelectedVideo(video)} />

        {/* RIGHT CHAT AREA */}
        <ChatArea 
          messages={messages}
          input={input}
          setInput={setInput}
          setMessages={setMessages}
        />
      </div>
    </div>
  );
}


function ChatArea({ messages, input, setInput, setMessages }) {
  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setInput("");

    // Add AI bubble placeholder
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "AI response coming soon..." },
      ]);
    }, 500);
  };

  return (
    <div className="flex flex-col flex-1 bg-background/50 backdrop-blur-lg">

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
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
}
function ChatBubble({ role, text }) {
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
