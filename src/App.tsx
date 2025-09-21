import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useSelector } from "react-redux";
import { RootState } from "./state";
import { LoginForm } from "./components/LoginForm";

const queryClient = new QueryClient();

const App = () => {
  const isAuthenticated = useSelector((state: RootState) => !!state.auth.user);
  if (!isAuthenticated && window.location.pathname !== "/login") {
    window.location.href = "/login";
    return null; // Prevent rendering the rest of the app
  }
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/*" element={<Index />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/404" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
};

export default App;
