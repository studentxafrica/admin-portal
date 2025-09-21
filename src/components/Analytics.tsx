
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Ticket,
  Eye,
  Download,
  Calendar,
  Target,
  Percent,
  Clock
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart
} from 'recharts';
import axiosInstance from "@/api/axios";
import { useQuery } from "@tanstack/react-query";

// const revenueData = [
//   { month: 'Jan', revenue: 12000, coupons: 450, merchants: 25, students: 1200 },
//   { month: 'Feb', revenue: 15000, coupons: 520, merchants: 28, students: 1350 },
//   { month: 'Mar', revenue: 18000, coupons: 680, merchants: 32, students: 1500 },
//   { month: 'Apr', revenue: 22000, coupons: 750, merchants: 35, students: 1680 },
//   { month: 'May', revenue: 25000, coupons: 820, merchants: 38, students: 1850 },
//   { month: 'Jun', revenue: 28000, coupons: 950, merchants: 42, students: 2100 },
// ];

// const categoryPerformance = [
//   { name: 'Food & Dining', coupons: 2500, revenue: 15000, redemptionRate: 78 },
//   { name: 'Fashion', coupons: 1800, revenue: 22000, redemptionRate: 65 },
//   { name: 'Electronics', coupons: 1200, revenue: 35000, redemptionRate: 82 },
//   { name: 'Books', coupons: 950, revenue: 8500, redemptionRate: 90 },
//   { name: 'Health & Beauty', coupons: 750, revenue: 12000, redemptionRate: 72 },
// ];

// const redemptionTrends = [
//   { day: 'Mon', redemptions: 120, claims: 180 },
//   { day: 'Tue', redemptions: 135, claims: 195 },
//   { day: 'Wed', redemptions: 158, claims: 220 },
//   { day: 'Thu', redemptions: 142, claims: 210 },
//   { day: 'Fri', redemptions: 175, claims: 245 },
//   { day: 'Sat', redemptions: 195, claims: 280 },
//   { day: 'Sun', redemptions: 110, claims: 155 },
// ];

// const topMerchants = [
//   { name: 'BookStore Plus', revenue: 45000, coupons: 1250, redemptionRate: 89 },
//   { name: 'Campus Cafe', revenue: 32000, coupons: 980, redemptionRate: 75 },
//   { name: 'TechZone Electronics', revenue: 28000, coupons: 650, redemptionRate: 85 },
//   { name: 'Fashion Forward', revenue: 22000, coupons: 840, redemptionRate: 68 },
//   { name: 'Coffee Corner', revenue: 18000, coupons: 720, redemptionRate: 72 },
// ];

// const conversionFunnel = [
//   { stage: 'Platform Visits', count: 25000, percentage: 100 },
//   { stage: 'Offer Views', count: 18500, percentage: 74 },
//   { stage: 'Coupons Claimed', count: 8500, percentage: 34 },
//   { stage: 'Coupons Redeemed', count: 6200, percentage: 25 },
// ];

export function Analytics() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await axiosInstance.get('/admin/analytics');
      return response.data;
    },
    refetchOnWindowFocus: false,
  });

  // Extract data from API response
  const metrics: {
    totalRevenue: number;
    avgRedemptionRate: number;
    avgCouponValue: number;
    avgTimeToRedeem: number | null;
  } = data?.metrics || {
    totalRevenue: 0,
    avgRedemptionRate: 0,
    avgCouponValue: 0,
    avgTimeToRedeem: null
  };

  const revenueData = data?.revenueData || [];
  const redemptionData = data?.redemptionData || [];
  const categoryData = data?.categoryData || [];
  const merchantData = data?.merchantData || [];
  const conversionData = data?.conversionData || [];

  // Format total revenue for display
  const formattedTotalRevenue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(metrics.totalRevenue / 100); // Convert cents to dollars

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500">Error loading analytics data</p>
          <p className="text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-600 mt-1">Comprehensive platform performance and user behavior analytics</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date Range
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{metrics.totalRevenue}</div>
            {/* <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              
            </p> */}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg. Redemption Rate</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{metrics.avgRedemptionRate}%</div>
            <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +5.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg. Coupon Value</CardTitle>
            <Percent className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{metrics.avgCouponValue}</div>
            <p className="text-xs text-purple-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +2.8% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg. Time to Redeem</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{metrics.avgTimeToRedeem || '-'}</div>
            <p className="text-gray-400">days</p>
            <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              -0.5 days from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="merchants">Merchants</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Revenue and Growth Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Revenue Growth</CardTitle>
                <p className="text-sm text-gray-600">Monthly revenue and coupon redemption trends</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Area yAxisId="left" type="monotone" dataKey="revenue" fill="#10B981" fillOpacity={0.6} stroke="#10B981" />
                    <Bar yAxisId="right" dataKey="coupons" fill="#3B82F6" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Weekly Redemption Pattern</CardTitle>
                <p className="text-sm text-gray-600">Claims vs redemptions by day of week</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={redemptionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    {/* tooltip without shading on hover */}
                    <Tooltip
                      contentStyle={{ backgroundColor: 'white', border: 'none' }}
                      itemStyle={{ color: '#333' }}
                      cursor={{ fill: '#3B82F6', fillOpacity: 0.1 }}
                      wrapperStyle={{ borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
                      
                    />
                    <Area yAxisId="left" type="monotone" dataKey="revenue" fill="#10B981" fillOpacity={0.6} stroke="#10B981" />
                    <Bar dataKey="claims" fill="#3B82F6" stroke="#3B82F6" fillOpacity={0.6} name="Claims" />
                    <Bar dataKey="redemptions" fill="#10B981" stroke="#10B981" name="Redemptions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* User Growth */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Platform Growth</CardTitle>
              <p className="text-sm text-gray-600">Students and merchants joining over time</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="students" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="merchants" stackId="2" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Category Performance</CardTitle>
              <p className="text-sm text-gray-600">Revenue and redemption rates by category</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      <div className="flex items-center gap-6 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Ticket className="w-3 h-3" />
                          {category.coupons} coupons
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ${category.revenue.toLocaleString()} revenue
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {category.redemptionRate}% redemption rate
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge 
                        className={`${
                          category.redemptionRate >= 80 ? 'bg-green-100 text-green-800' :
                          category.redemptionRate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {category.redemptionRate >= 80 ? 'Excellent' :
                         category.redemptionRate >= 70 ? 'Good' : 'Needs Attention'}
                      </Badge>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${category.redemptionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="merchants" className="space-y-6">
          {/* Top Performing Merchants */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Top Performing Merchants</CardTitle>
              <p className="text-sm text-gray-600">Ranked by revenue and engagement</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {merchantData.map((merchant, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-green-700">#{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{merchant.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${merchant.revenue.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Ticket className="w-3 h-3" />
                            {merchant.coupons} coupons
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {merchant.redemptionRate}% redemption
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800">
                        Top Performer
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Conversion Funnel</CardTitle>
              <p className="text-sm text-gray-600">User journey from visit to redemption</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionData.map((stage, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-gray-700">
                      {stage.stage}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">{stage.count.toLocaleString()} users</span>
                        <span className="text-sm font-medium text-gray-900">{stage.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-600 h-3 rounded-full transition-all duration-300" 
                          style={{ width: `${stage.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Conversion Insights</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 74% of visitors view at least one offer</li>
                  <li>• 34% of offer viewers claim a coupon</li>
                  <li>• 73% of claimed coupons get redeemed</li>
                  <li>• Overall conversion rate: 25% (above industry average)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
