
import { 
  BarChart, 
  Users, 
  Ticket, 
  Settings, 
  Home,
  PieChart,
  Store,
  Tag,
  Bell,
  Search
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    id: "dashboard",
    badge: null,
  },
  {
    title: "User Management",
    icon: Users,
    id: "users",
    badge: "3",
  },
  {
    title: "Offers & Coupons",
    icon: Ticket,
    id: "offers",
    badge: null,
  },
  {
    title: "Analytics",
    icon: BarChart,
    id: "analytics",
    badge: null,
  },
  {
    title: "Platform Settings",
    icon: Settings,
    id: "settings",
    badge: null,
  },
];

export function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Ticket className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">StudentX</h2>
            <p className="text-sm text-gray-500">Admin Portal</p>
          </div>
        </div>
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search..." 
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    {item.badge && (
                      <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Quick Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  <Bell className="w-4 h-4" />
                  <span className="font-medium">Notifications</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs ml-auto">
                    12
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
