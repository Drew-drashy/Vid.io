import { Card } from "@/components/ui/card";

export default function VideoCard({ video, onSelect }) {
  return (
    <Card
      onClick={onSelect}
      className="
        p-3 cursor-pointer flex gap-3 
        bg-card/40 backdrop-blur-xl 
        hover:bg-card/60 transition-all
      "
    >
      <img 
        src={video.thumbnail.static}
        className="w-24 h-16 object-cover rounded-md"
      />

      <div className="flex flex-col">
        <p className="font-medium line-clamp-2">{video.title}</p>
        <p className="text-muted-foreground text-xs">{video.channel.name}</p>
      </div>
    </Card>
  );
}
