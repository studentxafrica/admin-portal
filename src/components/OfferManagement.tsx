
import { act, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CreateOfferModal } from "./CreateOfferModal";
import { EditOfferModal } from "./EditOfferModal";
import {
  Ticket,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  MapPin,
  Percent,
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Pause
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { ConfirmModal } from "./confirmModal";

const initialOffersData = [
  {
    id: 1,
    title: "20% Off All Textbooks",
    merchant: "BookStore Plus",
    category: "Books & Supplies",
    discountType: "percentage",
    discountValue: 20,
    couponLimit: 100,
    claimed: 67,
    redeemed: 45,
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    status: "active",
    revenue: 2450,
    views: 1250,
    coverImage: "/placeholder.svg",
    description: "Save big on all textbooks for the upcoming semester"
  },
  {
    id: 2,
    title: "$5 Off Pizza Orders Over $20",
    merchant: "Campus Cafe",
    category: "Food & Dining",
    discountType: "fixed_amount",
    discountValue: 5,
    couponLimit: 50,
    claimed: 28,
    redeemed: 22,
    startDate: "2024-06-05",
    endDate: "2024-06-30",
    status: "expired",
    revenue: 110,
    views: 890,
    coverImage: "/placeholder.svg",
    description: "Delicious pizza deals for students"
  },
  {
    id: 3,
    title: "Buy One Get One Free Coffee",
    merchant: "Coffee Corner",
    category: "Food & Dining",
    discountType: "buy_one_get_one",
    discountValue: 0,
    couponLimit: 200,
    claimed: 134,
    redeemed: 89,
    startDate: "2024-06-10",
    endDate: "2024-07-15",
    status: "active",
    revenue: 445,
    views: 2100,
    coverImage: "/placeholder.svg",
    description: "Perfect for studying sessions with friends"
  },
];

const initialCouponsData = [
  {
    id: 1,
    code: "BOOK20-A1B2",
    offer: "20% Off All Textbooks",
    offerId: 1,
    student: "Sarah Johnson",
    studentEmail: "sarah.j@university.edu",
    status: "redeemed",
    claimedDate: "2024-06-15",
    redeemedDate: "2024-06-16",
    expiryDate: "2024-08-31",
    amountSaved: 15.60,
    store: "BookStore Plus - Main Branch"
  },
  {
    id: 2,
    code: "PIZZA5-C3D4",
    offer: "$5 Off Pizza Orders Over $20",
    offerId: 2,
    student: "Michael Chen",
    studentEmail: "m.chen@university.edu",
    status: "active",
    claimedDate: "2024-06-18",
    redeemedDate: null,
    expiryDate: "2024-06-30",
    amountSaved: 0,
    store: null
  },
  {
    id: 3,
    code: "COFFEE-E5F6",
    offer: "Buy One Get One Free Coffee",
    offerId: 3,
    student: "Emma Rodriguez",
    studentEmail: "emma.r@university.edu",
    status: "expired",
    claimedDate: "2024-06-05",
    redeemedDate: null,
    expiryDate: "2024-06-20",
    amountSaved: 0,
    store: null
  },
];

export function OfferManagement() {
  const [offers, setOffers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const { isOpen, openModal, closeModal, modalProps } = useConfirmModal();
  const [activatingOffer, setActivatingOffer] = useState(false);
  const [deactivatingOffer, setDeactivatingOffer] = useState(false);
  const [deletingOffer, setDeletingOffer] = useState(false);
  const [expiringCoupon, setExpiringCoupon] = useState(false);

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("offers");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);

  const sym = (currency, locale) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency })
      .formatToParts(1)
      .find(x => x.type === "currency")
      .value;

  // Fetch data using React Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['offers', activeTab, searchTerm, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        tab: activeTab
      });
      const response = await axiosInstance.get(`/admin/offers?${params.toString()}`);
      return response.data;
    }
  });

  // Handle API errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  // Extract data based on active tab
  const offersData = activeTab === "offers" ? data?.data || [] : [];
  const couponsData = activeTab === "coupons" ? data?.data || [] : [];
  const stats = data?.stats || {
    totalOffers: 0,
    activeOffers: 0,
    totalCouponsGenerated: 0,
    avgRedemptionRate: 0
  };

  // ... keep all the existing handler functions ...

  // Modify the stats cards to use the API data
  const totalOffers = stats.totalOffers;
  const activeOffers = stats.activeOffers;
  const totalCouponsGenerated = stats.totalCouponsGenerated;
  const avgRedemptionRate = stats.avgRedemptionRate;

  // Loading state
  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center h-64">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
  //     </div>
  //   );
  // }


  const filteredOffers = offersData.filter(offer => {
    const matchesSearch = offer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.merchant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = activeTab === "offers" && (statusFilter === "all" || offer.status === statusFilter);
    return matchesSearch && matchesStatus;
  });

  const filteredCoupons = couponsData.filter(coupon =>
    (coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.offer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.student.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (activeTab === "coupons" && (statusFilter === "all" || coupon.status === statusFilter))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "expired": return "bg-red-100 text-red-800";
      case "inactive": return "bg-gray-100 text-gray-600";
      case "redeemed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  // const handleCreateOffer = (newOffer: any) => {
  //   setOffers(prev => [newOffer, ...prev]);
  // };

  const handleEditOffer = (updatedOffer: any) => {
    setOffers(prev => prev.map(offer =>
      offer.id === updatedOffer.id ? updatedOffer : offer
    ));
    toast({
      title: "Offer Updated",
      description: `"${updatedOffer.title}" has been successfully updated.`,
    });
  };

  const handleViewOffer = (offer: any) => {
    setSelectedOffer(offer);
    setShowOfferModal(true);
  };

  const handleOpenEditModal = (offer: any) => {
    setSelectedOffer(offer);
    setShowEditModal(true);
  };

  const handleActivateOffer = async (offerId: number) => {
    try {
      setActivatingOffer(true);
      await axiosInstance.post(`/admin/offers/${offerId}/activate`);
      toast({
        title: "Offer Activated",
        description: "Offer is now active and visible to students.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error activating offer",
        description: error.response?.data?.message || error.message,
        variant: "destructive"
      });
    } finally {
      setActivatingOffer(false);
    }
  };

  const handleDeactivateOffer = async (offerId: number) => {
    try {
      setDeactivatingOffer(true);
      await axiosInstance.post(`/admin/offers/${offerId}/deactivate`);
      toast({
        title: "Offer Deactivated",
        description: "Offer has been deactivated.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error deactivating offer",
        description: error.response?.data?.message || error.message,
        variant: "destructive"
      });
    } finally {
      setDeactivatingOffer(false);
    }
  };

  const handleDeleteOffer = async (offerId: number) => {
    try {
      setDeletingOffer(true);
      await axiosInstance.delete(`/admin/offers/${offerId}`);
      toast({
        title: "Offer Deleted",
        description: "Offer and all related coupons have been deleted.",
        variant: "destructive",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error deleting offer",
        description: error.response?.data?.message || error.message,
        variant: "destructive"
      });
    } finally {
      setDeletingOffer(false);
    }
  };

  const handleExpireCoupon = async (couponId: number) => {
    try {
      setExpiringCoupon(true);
      await axiosInstance.post(`/admin/coupons/${couponId}/expire`);
      toast({
        title: "Coupon Expired",
        description: "Coupon has been manually expired.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error expiring coupon",
        description: error.response?.data?.message || error.message,
        variant: "destructive"
      });
    } finally {
      setExpiringCoupon(false);
    }
  };

  const handleResendCoupon = (couponId: number) => {
    const coupon = coupons.find(c => c.id === couponId);
    toast({
      title: "Coupon Resent",
      description: `Coupon ${coupon?.code} has been resent to ${coupon?.studentEmail}.`,
    });
  };

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={isOpen}
        onClose={closeModal}
        {...modalProps}
      />
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Offers & Coupons</h1>
          <p className="text-gray-600 mt-1">Manage all offers and track coupon redemptions</p>
        </div>
        {/* <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Advanced Filters
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4" />
            Create Offer
          </Button>
        </div> */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Offers</p>
                <p className="text-2xl font-bold text-gray-900">{totalOffers?.toLocaleString() || '-'}</p>
              </div>
              <Ticket className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Offers</p>
                <p className="text-2xl font-bold text-green-600">{activeOffers?.toLocaleString() || '-'}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Coupons Claimed</p>
                <p className="text-2xl font-bold text-purple-600">{totalCouponsGenerated?.toLocaleString() || '-'}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Redemption Rate</p>
                <p className="text-2xl font-bold text-orange-600">{avgRedemptionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search offers, merchants, or students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {activeTab === "offers" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Offers</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="inactive">Inactive</option>
              </select>
            )}
            {activeTab === "coupons" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Coupons</option>
                <option value="active">Active</option>
                <option value="redeemed">Redeemed</option>
                <option value="expired">Expired</option>
              </select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="offers" className="flex items-center gap-2">
            <Ticket className="w-4 h-4" />
            Offers ({filteredOffers.length})
          </TabsTrigger>
          <TabsTrigger value="coupons" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Coupons ({filteredCoupons.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="offers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Offers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                  </div>
                ) : filteredOffers.length === 0 ? (
                  <div className="text-center text-gray-500">
                    No offers found matching your criteria.
                  </div>
                ) : (
                  filteredOffers.map((offer) => (
                    <div key={offer.id} onClick={() => handleViewOffer(offer)} className="flex cursor-pointer items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <img
                        src={offer.coverImage}
                        alt={offer.title}
                        className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{offer.title}</h3>
                            <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                              <span>{offer.merchant.name}</span>
                              {offer.category?.name && (
                                <>
                                  <span>•</span>
                                  <span>{offer.category?.name}</span>
                                </>
                              )}
                            </p>
                          </div>
                          <Badge className={getStatusColor(offer.status)}>
                            {offer.status}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-6 mt-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            {offer.discountType === "percentage" ? `${offer.discountValue}% off` :
                              offer.discountType === "fixed_amount" ? (
                                <>
                                  {sym(`${offer?.currency || 'USD'}`, window.navigator.language || 'en-US')} {offer.discountValue}
                                </>
                              ) : offer.discountType === "buy_one_get_one" ? (
                                "BOGO"
                              ) : offer.discountType === "free_item" ? (
                                "Free"
                              ) : null}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {offer.claimed}/{offer.couponLimit} claimed
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {Math.round(Number(offer.redeemed / offer.claimed) * 100)}% redeemed
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {offer.views || 0} views
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${offer.revenue} revenue
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Ends {new Date(offer.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* <Button variant="ghost" size="sm" onClick={() => handleViewOffer(offer)}>
                          <Eye className="w-4 h-4" />
                        </Button> */}
                        {/* <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(offer)
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button> */}
                        {offer.status === 'active' ? (
                          <Button
                            disabled={deactivatingOffer}
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal({
                                title: "Pause Offer",
                                message: `Are you sure you want to pause the offer "${offer.title}"?`,
                                confirmText: "Pause",
                                cancelText: "Cancel",
                                variant: "destructive",
                                onConfirm: () => handleDeactivateOffer(offer.id),
                                onClose: closeModal
                              })
                            }}
                            title="Deactivate offer"
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        ) : offer.status === 'inactive' ? (
                          <Button
                            disabled={activatingOffer}
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal({
                                title: "Activate Offer",
                                message: `Are you sure you want to activate the offer "${offer.title}"?`,
                                confirmText: "Activate",
                                cancelText: "Cancel",
                                variant: "default",
                                onConfirm: () => handleActivateOffer(offer.id),
                                onClose: closeModal
                              })
                            }}
                            title="Activate offer"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        ) : null}
                        <Button
                          disabled={deletingOffer}
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal({
                              title: "Delete Offer",
                              message: `Are you sure you want to delete the offer "${offer.title}"? This will also delete all related coupons.`,
                              confirmText: "Delete",
                              cancelText: "Cancel",
                              variant: "destructive",
                              onConfirm: () => handleDeleteOffer(offer.id),
                              onClose: closeModal
                            });
                          }}
                          title="Delete offer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coupons" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Individual Coupons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                  </div>
                ) : filteredCoupons.length == 0 ? (
                  <div className="text-center text-gray-500">
                    No coupons found matching your criteria.
                  </div>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <div key={coupon.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                            {coupon.code}
                          </code>
                          <Badge className={getStatusColor(coupon.status)}>
                            {coupon.status}
                          </Badge>
                        </div>

                        <h3 className="font-medium text-gray-900 mt-2">{coupon.offer}</h3>

                        <div className="flex items-center gap-6 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {coupon.student}
                          </span>
                          <span className="text-xs text-gray-500">{coupon.studentEmail}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Claimed {new Date(coupon.claimedDate).toLocaleDateString()}
                          </span>
                          {coupon.redeemedDate && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Redeemed {new Date(coupon.redeemedDate).toLocaleDateString()}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expires {new Date(coupon.expiryDate).toLocaleDateString()}
                          </span>
                          {coupon.amountSaved > 0 && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ${coupon.amountSaved} saved
                            </span>
                          )}
                          {coupon.store && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {coupon.store}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResendCoupon(coupon.id)}
                          title="Resend coupon email"
                        >
                          📧
                        </Button> */}
                        {coupon.status === 'active' && (
                          <Button
                            disabled={expiringCoupon}
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal({
                                title: "Expire Coupon",
                                message: `Are you sure you want to mark coupon "${coupon.code}" as expired?`,
                                confirmText: "Expire",
                                cancelText: "Cancel",
                                variant: "destructive",
                                onConfirm: () => handleExpireCoupon(coupon.id),
                                onClose: closeModal
                              });
                            }}
                            title="Expire coupon"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {/* <Button variant="ghost" size="sm">
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

      {/* Create Offer Modal */}
      {/* <CreateOfferModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onOfferCreated={handleCreateOffer}
      /> */}

      {/* Edit Offer Modal */}
      <EditOfferModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        offer={selectedOffer}
        onOfferUpdated={handleEditOffer}
      />

      {/* Offer Details Modal */}
      <Dialog open={showOfferModal} onOpenChange={setShowOfferModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Offer Details</DialogTitle>
          </DialogHeader>
          {selectedOffer && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedOffer.coverImage}
                  alt={selectedOffer.title}
                  className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                />
                <div>
                  <h3 className="text-xl font-semibold">{selectedOffer.title}</h3>
                  <p className="text-gray-600">{selectedOffer.merchant?.name} • {selectedOffer.category?.name || 'Unknown'}</p>
                  <Badge className={getStatusColor(selectedOffer.status)}>
                    {selectedOffer.status}
                  </Badge>
                </div>
              </div>

              {selectedOffer.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-gray-900">{selectedOffer.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Discount</label>
                  <p className="mt-1">
                    {selectedOffer.discountType === "percentage" ? `${selectedOffer.discountValue}% off` :
                      selectedOffer.discountType === "fixed_amount" ? `$${selectedOffer.discountValue} off` :
                        "Buy One Get One Free"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Coupon Limit</label>
                  <p className="mt-1">{selectedOffer.couponLimit}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Claimed</label>
                  <p className="mt-1">{selectedOffer.claimed}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Redeemed</label>
                  <p className="mt-1">{selectedOffer.redeemed}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <p className="mt-1">{new Date(selectedOffer.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <p className="mt-1">{new Date(selectedOffer.endDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Views</label>
                  <p className="mt-1">{selectedOffer.views}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Revenue</label>
                  <p className="mt-1">${selectedOffer.revenue}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                {/* <Button
                  variant="outline"
                  onClick={() => handleOpenEditModal(selectedOffer)}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Offer
                </Button> */}
                {selectedOffer.status === 'active' ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowOfferModal(false);
                      openModal({
                        title: "Deactivate Offer",
                        message: `Are you sure you want to deactivate the offer "${selectedOffer.title}"?`,
                        confirmText: "Deactivate",
                        cancelText: "Cancel",
                        variant: "destructive",
                        onConfirm: () => handleDeactivateOffer(selectedOffer.id),
                        onClose: closeModal
                      });
                    }}
                    className="flex items-center gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    Deactivate
                  </Button>
                ) : selectedOffer.status === 'inactive' ? (
                  <Button
                    onClick={() => {
                      setShowOfferModal(false);
                      openModal({
                        title: "Activate Offer",
                        message: `Are you sure you want to activate the offer "${selectedOffer.title}"?`,
                        confirmText: "Activate",
                        cancelText: "Cancel",
                        variant: "default",
                        onConfirm: () => handleActivateOffer(selectedOffer.id),
                        onClose: closeModal
                      });
                    }}
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Activate
                  </Button>
                ) : null}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
