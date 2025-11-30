import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import VideoCard from "./videocard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast-provider";

export type VideoResult = {
  id: string;
  title: string;
  url: string;
  channel: string;
  publishedAt: string;
  thumbnail: string;
};

export default function Sidebar({
  onSelectVideo,
  isAttaching = false,
}: {
  onSelectVideo: (video: VideoResult) => void;
  isAttaching?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const rapidKey = import.meta.env.VITE_RAPIDAPI_KEY;

  const mappedMockVideos = useMemo(
    () =>
      mockYoutubeData.video_results.map((v) => ({
        id: v.link,
        title: v.title,
        url: v.link,
        channel: v.channel.name,
        publishedAt: v.published_date,
        thumbnail: v.thumbnail.static,
      })),
    []
  );

  const searchYouTube = useCallback(async (term: string) => {
    if (!term.trim()) {
      setVideos([]);
      return;
    }

    if (!rapidKey) {
      toast({
        title: "Missing API key",
        description: "Set VITE_RAPIDAPI_KEY to search live; falling back to mock data.",
        status: "error",
      });
      setVideos(mappedMockVideos);
      return;
    }

    setIsSearching(true);
    toast({
      title: "Searching YouTube…",
      status: "loading",
      duration: 1200,
    });

    try {
      const res = await fetch(
        `https://youtube138.p.rapidapi.com/search/?q=${encodeURIComponent(term)}&hl=en&gl=US`,
        {
          headers: {
            "x-rapidapi-host": "youtube138.p.rapidapi.com",
            "x-rapidapi-key": rapidKey,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`YouTube responded with ${res.status}`);
      }

      const data = await res.json();
      type RapidVideo = {
        type?: string;
        video?: {
          videoId: string;
          title: string;
          author?: { title?: string };
          publishedTimeText?: string;
          thumbnails?: { url?: string }[];
          movingThumbnails?: { url?: string }[];
        };
      };

      const contents: RapidVideo[] = Array.isArray(data.contents) ? data.contents : [];
      const results: VideoResult[] = contents
        .filter((item): item is RapidVideo & { type: string; video: NonNullable<RapidVideo["video"]> } => item.type === "video" && !!item.video)
        .map((item) => {
          const video = item.video;
          const thumb =
            video.thumbnails?.[1]?.url ||
            video.thumbnails?.[0]?.url ||
            video.movingThumbnails?.[0]?.url ||
            "";
          return {
            id: video.videoId,
            title: video.title,
            url: `https://www.youtube.com/watch?v=${video.videoId}`,
            channel: video.author?.title ?? "YouTube",
            publishedAt: video.publishedTimeText ?? "",
            thumbnail: thumb,
          };
        });

      setVideos(results);
      toast({
        title: results.length ? "Found videos" : "No results",
        description: results.length
          ? `Showing ${results.length} results for "${term}".`
          : "Try another search.",
        status: results.length ? "success" : "info",
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Unable to reach YouTube.",
        status: "error",
      });
    } finally {
      setIsSearching(false);
    }
  }, [mappedMockVideos, rapidKey, toast]);

  // Debounced search on typing
  useEffect(() => {
    const handle = setTimeout(() => {
      searchYouTube(query);
    }, 500);

    return () => clearTimeout(handle);
  }, [query, searchYouTube]);

  return (
    <div className="
      hidden md:flex flex-col w-72 
      border-r border-border 
      bg-background/60 backdrop-blur-xl 
      p-4 overflow-y-auto
    ">
      <h2 className="text-lg font-semibold">YouTube Search</h2>

      {/* Search Bar */}
      <div className="mt-3">
        <Input
          placeholder="Search YouTube…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchYouTube(query)}
        />
        <Button
          className="mt-3 w-full"
          onClick={() => searchYouTube(query)}
          disabled={isSearching}
        >
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* Results */}
      <div className="mt-6 space-y-3">
        {videos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No results yet. Try searching for a video or drag a link into the chat.
          </p>
        ) : (
          videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onSelect={() => {
                if (isAttaching) return;
                onSelectVideo(video);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
export const mockYoutubeData = {
  video_results: [
    {
      position_on_page: 1,
      title: "Lil Baby - Heyy (Official Video)",
      link: "https://www.youtube.com/watch?v=F-7rQBY8uIQ",
      channel: {
        name: "Lil Baby Official",
        verified: true,
      },
      thumbnail: {
        static:
          "https://i.ytimg.com/vi/F-7rQBY8uIQ/hq720.jpg?sqp=-oaymwEcCOgCEMoBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBXQfJo7sGcg_ZKE7bptvjGqeUqDQ",
      },
      published_date: "3 years ago",
      views: 29701058,
      length: "3:13",
    },

    // You can add more mock items later
  ],
};
