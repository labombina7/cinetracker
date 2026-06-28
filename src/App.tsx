
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import MediaDetail from "./pages/MediaDetail";
import TraktAuth from "./pages/TraktAuth";
import AuthCallback from "./pages/AuthCallback";
import Navbar from "./components/Navbar";
import SearchResults from "./pages/SearchResults";
import Settings from "./pages/Settings";
import Explore from "./pages/Explore";
import List from "./pages/List";
import { MediaFiltersProvider } from "./contexts/MediaFiltersContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";

const queryClient = new QueryClient();

const App = () => {
  console.log("App rendering, setting up routes");
  
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <TooltipProvider>
          <MediaFiltersProvider>
            <FavoritesProvider>
            <Toaster />
            <Sonner />
            <Navbar />
            <main className="min-h-[calc(100vh-64px)]">
              <Routes>
                <Route path="/" element={<Navigate to="/explore" replace />} />
                <Route path="/details/:type/:id" element={<MediaDetail />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/auth/trakt" element={<TraktAuth />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/list" element={<List />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            </FavoritesProvider>
          </MediaFiltersProvider>
        </TooltipProvider>
      </HashRouter>
    </QueryClientProvider>
  );
};

export default App;
