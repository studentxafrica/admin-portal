import React from 'react';
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Gift,
  Users,
  TrendingUp,
  MessageSquare,
  Star,
  DollarSign,
  Settings,
  HelpCircle,
  Ticket,
  Tag,
  LayoutDashboard,
  Store,
  Bell,
  Search
} from 'lucide-react';
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
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { setLogout } from '@/state/auth';
import { useDispatch } from 'react-redux';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AdminSidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const dispatch = useDispatch();
  const menuItems = [
    { id: '', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'offers', label: 'Offers & Coupons', icon: Gift },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderNavItem = (item: any, isActive: boolean) => (
    <Button
      key={item.id}
      variant={isActive ? "default" : "ghost"}
      className={`w-full justify-start h-10 px-3 ${isActive
        ? 'bg-green-500 hover:bg-green-600 text-white'
        : 'text-gray-700 hover:bg-gray-100'
        }`}
      onClick={() => onTabChange(item.id)}
    >
      <item.icon className="h-4 w-4 mr-3" />
      <span className="text-sm">{item.label}</span>
      {item.badge && (
        <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {item.badge}
        </span>
      )}
    </Button>
  );

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
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${activeTab === item.id
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                    </div>

                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <Star className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Need Help?</h3>
            <p className="text-xs text-gray-500">Contact support or visit our help center</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="mt-4 w-full justify-center"
          onClick={() => window.open('mailto:support@studentx.co.ke')}
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Get Support
        </Button>
        {/* Logout */}
        <Button
          variant="destructive"
          className="mt-2 w-full justify-center"
          onClick={() => {
            dispatch(setLogout());
          }}
        >
          <Settings className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};