import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      
      <Navbar />

      {/* HERO */}
      <section className="relative flex flex-col items-center text-center pt-32 pb-40 px-4">

        {/* GLOW BEHIND */}
        <div className="absolute inset-0 flex justify-center">
          <div className="
            h-72 w-72 
            bg-primary/20 blur-3xl 
            rounded-full 
            animate-pulse
          "></div>
        </div>

        {/* HERO CONTENT */}
        <h1 className="
          text-5xl md:text-6xl font-bold 
          bg-gradient-to-b from-primary to-primary-foreground
          text-transparent bg-clip-text
          drop-shadow-xl
        ">
          Understand Any Video Instantly
        </h1>

        <p className="
          max-w-2xl mt-6 text-lg md:text-xl 
          text-muted-foreground
        ">
          AI-powered insights from YouTube videos.  
          Just paste, drag, or search — your assistant does the rest.
        </p>

        {/* CTA BUTTON */}
        <div className="mt-10">
          <Link to="/app">
            <Button 
              size="lg"
              className="
                bg-primary text-primary-foreground
                rounded-xl px-8 py-6 text-lg
                shadow-lg hover:shadow-xl
                transition-all duration-300
              "
            >
              Launch App 🚀
            </Button>
          </Link>
        </div>

        {/* GLASS CARD */}
        <div className="
          mt-20
          max-w-3xl mx-auto
          rounded-2xl
          border border-border/40
          bg-background/40 backdrop-blur-xl
          p-8 shadow-lg
        ">
          <h2 className="text-2xl font-semibold">How It Works</h2>

          <ul className="mt-4 space-y-3 text-muted-foreground">
            <li>🔍 Search YouTube videos</li>
            <li>📥 Drag + drop into the chat</li>
            <li>🤖 Ask anything based on the video</li>
            <li>⚡ Get fast, accurate answers</li>
          </ul>
        </div>

      </section>
    </div>
 
  );
}
