import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Store,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  AlertTriangle,
  Download,
  TrendingUp,
  Award,
  DollarSign,
  Target,
  GraduationCap,
  Building2,
  ExternalLink,
  Bell,
  BellRing,
  Plus
} from "lucide-react";
import axiosInstance from "@/api/axios";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { ConfirmModal } from "./confirmModal";
import StudentReviewModal from "./users/StudentReviewModal";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  logo?: string;
  verificationStatus: 'completed' | 'in_progress' | 'requested' | 'failed' | 'rejected' | 'pending';
  verificationReminderSent?: boolean;
  verificationReminderSentOn?: string;
  type: 'student' | 'merchant';
  joinDate: string;
  verified?: boolean;
  approved?: boolean;
  emailVerified?: boolean;
  profileComplete?: number;
  couponsUsed?: number;
  totalSavings?: number;
  school?: string;
  major?: string;
  year?: string;
  category?: string;
  phone?: string;
  address?: string;
  activeOffers?: number;
  totalRevenue?: number;
}

interface UserManagementData {
  stats: {
    totalStudents: number;
    verifiedStudents: number;
    activeMerchants: number;
    pendingMerchants: number;
    studentGrowth?: number;
  };
  users: User[];
}

export function UserManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"students" | "merchants">("students");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, openModal, closeModal, modalProps } = useConfirmModal();
  const [userData, setUserData] = useState<UserManagementData>({
    stats: {
      totalStudents: 0,
      verifiedStudents: 0,
      activeMerchants: 0,
      pendingMerchants: 0,
      studentGrowth: 0
    },
    users: []
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isRegisterMerchantOpen, setIsRegisterMerchantOpen] = useState(false);
  const [merchantEmail, setMerchantEmail] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegisterMerchant = async () => {
    if (!merchantEmail) {
      toast({
        title: "Email Required",
        description: "Please enter a valid email address for the merchant.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsRegistering(true);
      await axiosInstance.post('/admin/merchants/register', {
        email: merchantEmail
      });

      toast({
        title: "Merchant Invitation Sent!",
        description: `An email with login credentials has been sent to ${merchantEmail}.`,
      });

      // Refresh merchants list
      const response = await axiosInstance.get('/admin/users', {
        params: { type: 'merchants' }
      });
      setUserData(response.data);

      // Reset form
      setMerchantEmail("");
      setIsRegisterMerchantOpen(false);
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || "Could not register merchant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-gray-200';
      case 'in_progress':
        return 'bg-yellow-200';
      case 'rejected':
        return 'bg-red-500 text-white';
      case 'failed':
        return 'bg-red-400';
      case 'requested':
        return 'bg-blue-200';
      default:
        return 'bg-gray-500';
    }
  };

  const countDownInDaysHoursMins = (dateString: string) => {
    const targetDate = new Date(dateString); // Ensure UTC parsing
    const oneWeekFromTarget = new Date(targetDate.getTime() + 7 * 24 * 60 * 60 * 1000); // One week from target
    const diff = oneWeekFromTarget.getTime() - Date.now();

    if (diff < 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
  const [isStudentReviewModalOpen, setIsStudentReviewModalOpen] = useState(false);

  // CountdownTimer component for displaying time left until reminder expires
  function CountdownTimer({ targetDate }: { targetDate?: string }) {
    const [timeLeft, setTimeLeft] = useState<string>("");

    useEffect(() => {
      if (!targetDate) {
        setTimeLeft("");
        return;
      }
      const update = () => {
        const target = new Date(targetDate);
        const oneWeekFromTarget = new Date(target.getTime() + 7 * 24 * 60 * 60 * 1000);
        const diff = oneWeekFromTarget.getTime() - Date.now();

        if (diff < 0) {
          setTimeLeft("0s");
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setTimeLeft(`${days}d`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h`);
        } else {
          setTimeLeft(`${minutes}m`);
        }
      };

      update();
      const interval = setInterval(update, 60000); // update every minute

      return () => clearInterval(interval);
    }, [targetDate]);

    return <span>{timeLeft}</span>;
  }

  const openStudentReviewModal = (student: User) => {
    setSelectedUser(student);
    setIsStudentReviewModalOpen(true);
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get('/admin/users', {
          params: {
            type: activeTab,
            search: searchTerm
          }
        });
        setUserData(response.data);
      } catch (error) {
        toast({
          title: "Error Loading Data",
          description: "Could not fetch user data. Please try again.",
          variant: "destructive",
        });
        console.error("User data fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchUserData();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [activeTab, searchTerm, toast]);

  const filteredUsers = userData.users.filter(user =>
    activeTab === 'students' ? user.type === 'student' : user.type === 'merchant'
  );

  const handleApprove = async (merchantId: string) => {
    try {
      await axiosInstance.post(`/admin/merchants/${merchantId}/approve`);
      // Refresh data
      const response = await axiosInstance.get('/admin/users', {
        params: { type: 'merchants' }
      });
      setUserData(response.data);

      const merchant = userData.users.find(u => u.id === merchantId && u.type === 'merchant');
      toast({
        title: "Merchant Approved!",
        description: `${merchant?.name} can now start creating offers and engaging with students.`,
      });
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: "Could not approve merchant. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (merchantId: string) => {
    try {
      await axiosInstance.post(`/admin/merchants/${merchantId}/reject`);
      // Refresh data
      const response = await axiosInstance.get('/admin/users', {
        params: { type: 'merchants' }
      });
      setUserData(response.data);

      const merchant = userData.users.find(u => u.id === merchantId && u.type === 'merchant');
      toast({
        title: "❌ Application Rejected",
        description: `${merchant?.name} application has been declined.`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: "Could not reject merchant. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRequestStudentVerification = async (studentId: string) => {

    try {
      await axiosInstance.post(`/admin/users/${studentId}/request-verification`);
      // Refresh data
      const response = await axiosInstance.get('/admin/users', {
        params: { type: 'students' }
      });
      setUserData(response.data);

      const student = userData.users.find(u => u.id === studentId && u.type === 'student');
      toast({
        title: "🎓 Student Verification Requested!",
        description: `${student?.name} will be notified once their verification is complete.`,
      });
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Could not verify student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleExportData = () => {
    toast({
      title: "📊 Export In Progress",
      description: "Your data export is being prepared. You'll receive an email notification when it's ready to download.",
    });
  };

  // if (isLoading) {
  //   return (
  //     <div className="p-6 flex items-center justify-center h-screen">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6 p-2">
      {/* Enhanced Header */}
      <ConfirmModal
        isOpen={isOpen}
        onClose={closeModal}
        {...modalProps}
      />
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600 text-lg">Manage your community of students and merchant partners</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {userData.stats.totalStudents} Students
              </span>
              <span className="flex items-center gap-1">
                <Store className="w-4 h-4" />
                {userData.stats.activeMerchants} Merchants
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {userData.stats.pendingMerchants} Pending Approvals
              </span>
            </div>
          </div>
          {/* <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2 shadow-sm">
              <Filter className="w-4 h-4" />
              Advanced Filters
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2 shadow-lg"
              onClick={handleExportData}
            >
              <Download className="w-4 h-4" />
              Export Data
            </Button>
          </div> */}
          <Dialog open={isRegisterMerchantOpen} onOpenChange={setIsRegisterMerchantOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gray-700 hover:bg-gray-800 flex items-center gap-2 shadow-lg">
                <Plus className="w-4 h-4" />
                Register Merchant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Register New Merchant</DialogTitle>
                <DialogDescription>
                  Enter the merchant's email address. They will receive an email with auto-generated credentials.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="email" className="text-right">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="merchant@example.com"
                    className="col-span-3"
                    value={merchantEmail}
                    onChange={(e) => setMerchantEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleRegisterMerchant}
                  disabled={isRegistering}
                >
                  {isRegistering ? "Sending..." : "Send Invitation"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>



      {isStudentReviewModalOpen && (
        <Dialog open={isStudentReviewModalOpen} onOpenChange={setIsStudentReviewModalOpen}>
          <StudentReviewModal isOpen={isStudentReviewModalOpen} onClose={() => setIsStudentReviewModalOpen(false)} studentId={selectedUser.id} />
        </Dialog>
      )}

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{userData.stats.totalStudents}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +{userData.stats.studentGrowth || 12}% this month
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Verified Students</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{userData.stats.verifiedStudents}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round((userData.stats.verifiedStudents / userData.stats.totalStudents) * 100)}% verified
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active Merchants</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{userData.stats.activeMerchants}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Quality partners
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Store className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pending Reviews</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{userData.stats.pendingMerchants}</p>
                <p className="text-xs text-gray-500 mt-1">Needs attention</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Search Bar */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name, email, school, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 text-base h-12 border-gray-300 focus:border-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "students" | "merchants")} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="students" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <GraduationCap className="w-4 h-4" />
            Students ({filteredUsers.filter(u => u.type === 'student').length})
          </TabsTrigger>
          <TabsTrigger value="merchants" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Building2 className="w-4 h-4" />
            Merchants ({filteredUsers.filter(u => u.type === 'merchant').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-6">
          <Card className="shadow-sm">
            <CardHeader className="bg-gray-100 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <GraduationCap className="w-6 h-6 text-blue-600" />
                Students
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {isLoading ? (
                  <div className="p-6 flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  filteredUsers
                    .filter(user => user.type === 'student')
                    .map((student, index) => (
                      <div onClick={() => handleViewUser(student)} key={student.id} className={`flex items-center justify-between p-6 cursor-pointer border-b border-gray-100 hover:bg-blue-50/50 transition-colors ${index === filteredUsers.length - 1 ? 'border-b-0' : ''}`}>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="w-14 h-14 border-2 border-white shadow-md">
                              <AvatarImage src={student.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            {student.verified && (
                              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                                <CheckCircle className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-gray-900 text-lg">{student.name}</h3>
                              <Badge
                                variant={student.verified ? "default" : "secondary"}
                                className={`${getBadgeColor(student.verificationStatus)} font-medium`}
                              >
                                {student.verified && student.verificationStatus === 'completed'
                                  ? "Verified"
                                  : student.verificationStatus === 'in_progress' ? "Pending"
                                    : student.verificationStatus === 'failed' ? "Failed"
                                      : student.verificationStatus === 'rejected' ? "Rejected"
                                        : student.verificationStatus === 'requested' ? "Requested"
                                          : "Not Verified"
                                }
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {student.email}
                              </span>
                              {student.school && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {student.school}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                              {student.major && student.year && (
                                <span className="flex items-center gap-1 text-gray-700">
                                  <GraduationCap className="w-3 h-3" />
                                  {student.major} • Class of {student.year}
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-blue-600">
                                <Target className="w-3 h-3" />
                                {student.couponsUsed || 0} coupons used
                              </span>
                              <span className="flex items-center gap-1 text-green-600">
                                <DollarSign className="w-3 h-3" />
                                ${student.totalSavings || 0} saved
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-2">
                            {!student.verified && ['in_progress', 'failed', 'rejected'].includes(student.verificationStatus) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openStudentReviewModal(student)
                                }}
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                Review
                              </Button>
                            )}
                            {student.verificationStatus === 'pending' && (
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                                disabled={!!student.verificationReminderSent}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModal({
                                    title: "Send Reminder Email Notification",
                                    message: `Are you sure you want to send a verification reminder to ${student.name}? This will notify them to complete their student verification.`,
                                    confirmText: "Send Reminder",
                                    cancelText: "Cancel",
                                    variant: "success",
                                    onConfirm: () => handleRequestStudentVerification(student.id),
                                    onClose: closeModal
                                  })
                                }}
                              >
                                <BellRing className="w-4 h-4" />
                                {student.verificationReminderSent ? (
                                  <>
                                    Request in
                                    <CountdownTimer targetDate={student.verificationReminderSentOn} />
                                  </>
                                ) : "Request"}
                              </Button>
                            )}
                          </div>
                          {/* <Button variant="ghost" size="sm" onClick={() => handleViewUser(student)} className="hover:bg-blue-100">
                            <Eye className="w-4 h-4" />
                          </Button> */}
                          {/* <Button variant="ghost" size="sm" className="hover:bg-blue-100">
                            <Edit className="w-4 h-4" />
                          </Button> */}
                          {/* <Button variant="ghost" size="sm" className="hover:bg-blue-100">
                            <MoreVertical className="w-4 h-4" />
                          </Button> */}
                        </div>
                      </div>
                    )))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="merchants" className="mt-6">
          <Card className="shadow-sm">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Building2 className="w-6 h-6 text-purple-600" />
                Merchants
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {isLoading ? (
                  <div className="p-6 flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  filteredUsers
                    .filter(user => user.type === 'merchant')
                    .map((merchant, index) => (
                      <div key={merchant.id} onClick={() => handleViewUser(merchant)} className={`flex cursor-pointer items-center justify-between p-6 border-b border-gray-100 hover:bg-purple-50/50 transition-colors ${index === filteredUsers.length - 1 ? 'border-b-0' : ''}`}>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="w-14 h-14 border-2 border-white shadow-md">
                              <AvatarImage src={merchant.logo} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                {merchant.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            {merchant.emailVerified && (
                              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                                <CheckCircle className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-gray-900 text-lg">{merchant.name}</h3>
                              <Badge
                                variant={merchant.approved ? "default" : "secondary"}
                                className={`${merchant.approved ? "bg-green-100 text-green-700 border-green-200" : "bg-orange-100 text-orange-600 border-orange-200"} font-medium`}
                              >
                                {merchant.approved ? "Approved" : "Pending"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {merchant.email}
                              </span>
                              {merchant.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {merchant.phone}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                              <span className="flex items-center gap-1 text-gray-700">
                                <Store className="w-3 h-3" />
                                {merchant.category || 'Other'}
                              </span>
                              <span className="flex items-center gap-1 text-purple-600">
                                <Target className="w-3 h-3" />
                                {merchant.activeOffers || 0} active offers
                              </span>
                              <span className="flex items-center gap-1 text-green-600">
                                <DollarSign className="w-3 h-3" />
                                ${merchant.totalRevenue || 0} revenue
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!merchant.approved && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModal({
                                    title: "Reject Merchant",
                                    message: `Are you sure you want to reject ${merchant.name}? This will revoke their access to the merchant portal.`,
                                    confirmText: "Reject",
                                    cancelText: "Cancel",
                                    variant: "destructive",
                                    onConfirm: () => handleReject(merchant.id),
                                    onClose: closeModal
                                  });
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 shadow-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModal({
                                    title: "Approve Merchant",
                                    message: "Are you sure you want to approve this merchant? This gives exclusive access to the merchants' portal.",
                                    confirmText: "Approve",
                                    cancelText: "Cancel",
                                    variant: "success",
                                    onConfirm: () => handleApprove(merchant.id),
                                    onClose: closeModal
                                  });
                                }}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                            </div>
                          )}
                          {/* <Button variant="ghost" size="sm" onClick={() => handleViewUser(merchant)} className="hover:bg-purple-100">
                            <Eye className="w-4 h-4" />
                          </Button> */}
                          {/* <Button variant="ghost" size="sm" className="hover:bg-purple-100">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="hover:bg-purple-100">
                            <MoreVertical className="w-4 h-4" />
                          </Button> */}
                        </div>
                      </div>
                    )))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced User Details Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="text-center pb-4">
            <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              {selectedUser?.type === 'student' ? (
                <>
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                  Student Profile
                </>
              ) : (
                <>
                  <Building2 className="w-6 h-6 text-purple-600" />
                  Merchant Profile
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Detailed information and activity overview
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback className={`text-xl font-bold text-white ${selectedUser.type === 'student' ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-purple-500 to-pink-600'}`}>
                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h3>
                  <p className="text-gray-600 text-lg">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {selectedUser.type === 'student' ? (
                      <Badge className={selectedUser.verified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                        {selectedUser.verified ? "Verified Student" : "Pending Verification"}
                      </Badge>
                    ) : (
                      <Badge className={selectedUser.approved ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-600"}>
                        {selectedUser.approved ? "Approved Partner" : "Pending Approval"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {selectedUser.type === 'student' ? (
                  <>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <label className="block text-sm font-semibold text-blue-900 mb-1">Academic Information</label>
                        <div className="space-y-2 text-sm">
                          {selectedUser.school && <p><span className="font-medium">School:</span> {selectedUser.school}</p>}
                          {selectedUser.major && <p><span className="font-medium">Major:</span> {selectedUser.major}</p>}
                          {selectedUser.year && <p><span className="font-medium">Graduation:</span> Class of {selectedUser.year}</p>}
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <label className="block text-sm font-semibold text-green-900 mb-1">Savings & Activity</label>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Coupons Used:</span> {selectedUser.couponsUsed || 0}</p>
                          <p><span className="font-medium">Total Savings:</span> ${selectedUser.totalSavings || 0}</p>
                          <p><span className="font-medium">Profile Complete:</span> {(selectedUser.profileComplete / 10) * 100 || 0}%</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <label className="block text-sm font-semibold text-purple-900 mb-1">Business Information</label>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Category:</span> {selectedUser.category || 'Other'}</p>
                          {selectedUser.phone && <p><span className="font-medium">Phone:</span> {selectedUser.phone}</p>}
                          {selectedUser.address && <p><span className="font-medium">Address:</span> {selectedUser.address}</p>}
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <label className="block text-sm font-semibold text-green-900 mb-1">Performance</label>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Active Offers:</span> {selectedUser.activeOffers || 0}</p>
                          <p><span className="font-medium">Total Revenue:</span> ${selectedUser.totalRevenue || 0}</p>
                          <p><span className="font-medium">Status:</span> {selectedUser.approved ? 'Active Partner' : 'Under Review'}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Account Details</label>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Member Since:</span> {new Date(selectedUser.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p><span className="font-medium">Account Type:</span> {selectedUser.type === 'student' ? 'Student' : 'Merchant Partner'}</p>
                    <p><span className="font-medium">Status:</span> {selectedUser.type === 'student' ? (selectedUser.verified ? 'Active' : 'Pending Verification') : (selectedUser.approved ? 'Approved' : 'Under Review')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
