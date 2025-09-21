
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Ticket,
  Store,
  TrendingUp,
  Eye,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  MoreVertical,
  UserCheck,
  ShoppingBag,
  Utensils,
  Shirt,
  Smartphone,
  BookOpen,
  Sparkles,
  Gamepad2,
  X,
  Check,
  BadgeAlert,
  ExternalLink
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/api/axios";

// const revenueData = [
//   { month: 'Jan', revenue: 12000, coupons: 450 },
//   { month: 'Feb', revenue: 15000, coupons: 520 },
//   { month: 'Mar', revenue: 18000, coupons: 680 },
//   { month: 'Apr', revenue: 22000, coupons: 750 },
//   { month: 'May', revenue: 25000, coupons: 820 },
//   { month: 'Jun', revenue: 28000, coupons: 950 },
// ];

// const categoryData = [
//   { name: 'Food & Dining', value: 35, color: '#10B981', icon: Utensils },
//   { name: 'Fashion', value: 25, color: '#3B82F6', icon: Shirt },
//   { name: 'Electronics', value: 20, color: '#8B5CF6', icon: Smartphone },
//   { name: 'Books', value: 12, color: '#F59E0B', icon: BookOpen },
//   { name: 'Other', value: 8, color: '#EF4444', icon: ShoppingBag },
// ];

interface PendingMerchant {
  id: number;
  name: string;
  submitted: string;
  category: string;
  email?: string;
  documents?: string[];
}

export function DashboardOverview() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalStudents: 0,
      activeMerchants: 0,
      couponsRedeemed: 0,
      totalRevenue: 0
    },
    revenueData: [],
    categoryData: [],
    pendingMerchants: [],
    recentActivity: []
  });


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get('/admin/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        toast({
          title: "Error Loading Dashboard",
          description: "Could not fetch dashboard data. Please try again.",
          variant: "destructive",
        });
        console.error("Dashboard fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleApprove = async (merchantId: number, merchantName: string) => {
    try {
      await axiosInstance.post(`/admin/merchants/${merchantId}/approve`);
      setDashboardData(prev => ({
        ...prev,
        pendingMerchants: prev.pendingMerchants.filter(m => m.id !== merchantId),
        stats: {
          ...prev.stats,
          activeMerchants: prev.stats.activeMerchants + 1
        }
      }));

      toast({
        title: "Merchant Approved",
        description: `${merchantName} has been approved and can now create offers. Welcome email sent.`,
      });
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: `Could not approve ${merchantName}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleReject = async (merchantId: number, merchantName: string) => {
    try {
      await axiosInstance.post(`/admin/merchants/${merchantId}/reject`);
      setDashboardData(prev => ({
        ...prev,
        pendingMerchants: prev.pendingMerchants.filter(m => m.id !== merchantId)
      }));

      toast({
        title: "Merchant Rejected",
        description: `${merchantName} application has been rejected. Notification email sent.`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: `Could not reject ${merchantName}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const categoryIcons = {
    'Food & Dining': Utensils,
    'Fashion': Shirt,
    'Electronics': Smartphone,
    'Books': BookOpen,
    'Other': ShoppingBag
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }


  const handleViewPlatform = () => {
    window.open('https://student-portal.example.com', '_blank');
    toast({
      title: "Platform Opened",
      description: "Student platform opened in new tab for review.",
    });
  };

  const handleGenerateReport = () => {
    const reportData = {
      totalStudents: dashboardData.stats.totalStudents,
      activeMerchants: dashboardData.stats.activeMerchants,
      revenue: dashboardData.stats.totalRevenue,
      couponsRedeemed: dashboardData.stats.couponsRedeemed,
      growthRate: 12.5,
      generatedAt: new Date().toISOString()
    };

    console.log('Generated Report:', reportData);

    toast({
      title: "Report Generated Successfully",
      description: `Platform analytics report generated with ${dashboardData.stats.totalStudents} students and $${dashboardData.stats.totalRevenue.toLocaleString()} revenue. Check your email.`,
    });
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-2">Welcome back! Here's what's happening on your platform.</p>
        </div>
        {/* <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2" onClick={handleViewPlatform}>
            <Eye className="w-4 h-4" />
            View Platform
          </Button>
          <Button className="flex items-center gap-2" onClick={handleGenerateReport}>
            <TrendingUp className="w-4 h-4" />
            Generate Report
          </Button>
        </div> */}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <TrendingUp className="w-3 h-3" />
              +12%
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalStudents?.toLocaleString()}</div>
          <p className="text-sm text-gray-600">Total Students</p>
        </div>

        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-blue-600 text-sm font-medium">
              <TrendingUp className="w-3 h-3" />
              +8%
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{dashboardData?.stats?.activeMerchants.toLocaleString() || '-'}</div>
          <p className="text-sm text-gray-600">Active Merchants</p>
        </div>

        <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500 rounded-lg">
              <Ticket className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-purple-600 text-sm font-medium">
              <TrendingUp className="w-3 h-3" />
              +24%
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{dashboardData.stats.couponsRedeemed?.toLocaleString()}</div>
          <p className="text-sm text-gray-600">Coupons Redeemed</p>
        </div>

        <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-yellow-600 text-sm font-medium">
              <TrendingUp className="w-3 h-3" />
              +18%
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">${dashboardData.stats.totalRevenue?.toLocaleString()}</div>
          <p className="text-sm text-gray-600">Total Revenue</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Revenue & Coupon Trends
            </CardTitle>
            <p className="text-sm text-muted-foreground">Monthly performance overview</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dashboardData.revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="coupons" stackId="2" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              Popular Categories
            </CardTitle>
            <p className="text-sm text-muted-foreground">Coupon distribution by category</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.categoryData.map((category, index) => {
                const IconComponent = categoryIcons[category.name] || ShoppingBag;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${category.color}20` }}>
                        <IconComponent className="w-4 h-4" style={{ color: category.color }} />
                      </div>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${category.value}%`,
                            backgroundColor: category.color
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600">{category.value}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity and Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {Object.entries(dashboardData.recentActivity).map(([ip, activities]) => {
              // const IconComponent = activity.icon;
              return (
                <div key={ip} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border">
                  {/* <div className={`p-2 rounded-lg ${activity.status === 'success' ? 'bg-green-100' :
                    activity.status >=400 ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                    <BadgeAlert className={`w-4 h-4 ${activity.status >=200 ? 'text-green-600' :
                      activity.status === 'warning' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                  </div> */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{ip}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {activities?.length.toLocaleString()} activities in the last 24 hours
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${activities.length <= 200 ? 'bg-green-100 text-green-700' :
                      activities.length <= 400 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}
                  >
                    {activities.length >= 200 ? 'High Activity' :
                      activities.length >= 400 ? 'Moderate Activity' : 'Low Activity'}
                  </Badge>
                  {/* Actions */}
                  {activities.length >= 200 &&
                    <div className="flex items-center gap-2">
                      <Button variant="destructive" size="sm" className="text-white border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-700">
                        <ExternalLink className="w-3 h-3" />
                        Review
                      </Button>
                    </div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-foreground">Pending Approvals</h2>
            <Badge variant="destructive" className="text-xs">
              {dashboardData.pendingMerchants?.length}
            </Badge>
          </div>

          {dashboardData.pendingMerchants?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.pendingMerchants.map((merchant) => (
                <div key={merchant.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Store className="w-4 h-4 text-gray-600" />
                        <h3 className="font-medium text-gray-900">{merchant.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{merchant.category}</p>
                      <p className="text-xs text-gray-500 mt-1">Submitted {merchant.submitted}</p>
                      {merchant.email && (
                        <p className="text-xs text-gray-500">{merchant.email}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleReject(merchant.id, merchant.name)}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(merchant.id, merchant.name)}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium text-gray-900">All caught up!</p>
              <p className="text-sm text-gray-600 mt-1">No pending merchant approvals.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
