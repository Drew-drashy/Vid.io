import { Card } from "@/components/ui/card";
import { type VideoResult } from "./sidebar";

export default function VideoCard({ video, onSelect }: { video: VideoResult; onSelect: () => void }) {
  return (
    <Card
      onClick={onSelect}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "copy";
        e.dataTransfer.setData("text/uri-list", video.url);
        e.dataTransfer.setData("text/plain", video.url);
      }}
      className="
        p-3 cursor-pointer flex gap-3 
        bg-card/40 backdrop-blur-xl 
        hover:bg-card/60 transition-all
      "
    >
      <img 
        src={video.thumbnail}
        className="w-24 h-16 object-cover rounded-md"
        alt={video.title}
      />

      <div className="flex flex-col">
        <p className="font-medium line-clamp-2">{video.title}</p>
        <p className="text-muted-foreground text-xs">{video.channel}</p>
      </div>
    </Card>
  );
}
