import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Discover from "./pages/Discover";
import CreatorProfile from "./pages/CreatorProfile";

import CreatorDashboard from "./pages/CreatorDashboard";
import SponsorDashboard from "./pages/SponsorDashboard";
import BookingDetail from "./pages/BookingDetail";

import CreatorOnboarding from "./pages/CreatorOnboarding";
import SponsorOnboarding from "./pages/SponsorOnboarding";
import AuthCallback from './pages/AuthCallback';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/c/:slug" element={<CreatorProfile />} />

          <Route path="/creator/onboarding" element={<CreatorOnboarding />} />
          <Route path="/sponsor/onboarding" element={<SponsorOnboarding />} />

          <Route path="/creator/dashboard" element={<CreatorDashboard />} />
          <Route path="/sponsor/dashboard" element={<SponsorDashboard />} />
          <Route path="/bookings/:id" element={<BookingDetail />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
