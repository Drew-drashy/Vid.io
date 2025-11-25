import { useState } from "react";
import { Input } from "@/components/ui/input";
import VideoCard from "./videocard";

export default function Sidebar({ onSelectVideo }) {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState([]);

  const searchYouTube = async () => {
    if (!query.trim()) return;

    // const url = `https://serpapi.com/search?engine=youtube&search_query=${encodeURIComponent(
    //   query
    // )}&api_key=${import.meta.env.VITE_SERPAPI_KEY}`;

    // const res = await fetch(url);
    // const data = await res.json();
    const data = mockYoutubeData;
    // console.log(data, "DATa")
    setVideos(data|| []);
    console.log(videos)
  };

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
          onKeyDown={(e) => e.key === "Enter" && searchYouTube()}
        />
      </div>

      {/* Results */}
      <div className="mt-6 space-y-3">
        {mockYoutubeData.video_results.map((v) => (
          <VideoCard key={v.link} video={v} onSelect={() => onSelectVideo(v)} />
        ))}
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

