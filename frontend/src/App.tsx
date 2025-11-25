import { ThemeProvider } from "@/components/theme-provider";
import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import InterfacePage from "./pages/InterfacePage";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<InterfacePage />} />
      </Routes>

    </ThemeProvider>
  );
}
