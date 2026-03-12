
import { useEffect, useState } from "react";
import { AdminSidebar } from "../components/Sidebar";
import { DashboardOverview } from "../components/DashboardOverview";
import { UserManagement } from "../components/UserManagement";
import { OfferManagement } from "../components/OfferManagement";
import { Analytics } from "../components/Analytics";
import { PlatformSettings } from "../components/PlatformSettings";
import { StudentBusinessApplications } from "../components/StudentBusinessApplications";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useSelector } from "react-redux";
import { RootState } from "@/state";
import { Route, Routes, useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/LoginForm";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(tab);
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/offers" element={<OfferManagement />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/applications" element={<StudentBusinessApplications />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<PlatformSettings />} />
            <Route path="*" element={<DashboardOverview />} />

          </Routes>
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  );
};

export default Index;
