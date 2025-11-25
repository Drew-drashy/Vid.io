import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";

export default function Navbar() {
    
  return (
    <header className="
      w-full 
      sticky top-0 z-50
      border-b border-border/40
      bg-background/60 
      backdrop-blur-xl 
      supports-[backdrop-filter]:bg-background/40
    ">
      <div className=" mx-auto h-16 px-4 flex items-center justify-between">

        {/* LOGO */}
        <Link 
          to="/" 
          className="text-xl font-semibold tracking-tight hover:opacity-80 transition-opacity"
        >
          vidIO
        </Link>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
            <ModeToggle/>
          <Link to="/app">
            <Button 
              className="
                rounded-lg
                bg-primary 
                text-primary-foreground 
                hover:bg-primary/80
              ">
              Launch App
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
