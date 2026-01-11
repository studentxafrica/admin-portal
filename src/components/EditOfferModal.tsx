
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Store, Tag, Percent, DollarSign, Users, Clock, Gift, Edit } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface EditOfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer: any;
  onOfferUpdated: (offer: any) => void;
}

export function EditOfferModal({ open, onOpenChange, offer, onOfferUpdated }: EditOfferModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    merchant: "",
    category: "",
    discountType: "",
    discountValue: "",
    couponLimit: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });

  // Reset form when offer changes
  useEffect(() => {
    if (offer) {
      setFormData({
        title: offer.title || "",
        description: offer.description || "",
        merchant: offer.merchant || "",
        category: offer.category || "",
        discountType: offer.discountType || "",
        discountValue: offer.discountValue?.toString() || "",
        couponLimit: offer.couponLimit?.toString() || "",
        startDate: offer.startDate ? new Date(offer.startDate) : undefined,
        endDate: offer.endDate ? new Date(offer.endDate) : undefined,
      });
    }
  }, [offer]);

  const categories = [
    { value: "Food & Dining", icon: "🍽️" },
    { value: "Fashion & Apparel", icon: "👗" },
    { value: "Electronics", icon: "📱" },
    { value: "Books & Supplies", icon: "📚" },
    { value: "Health & Beauty", icon: "💄" },
    { value: "Entertainment", icon: "🎬" }
  ];

  const merchants = [
    { value: "BookStore Plus", category: "Books & Supplies" },
    { value: "Campus Cafe", category: "Food & Dining" },
    { value: "TechZone Electronics", category: "Electronics" },
    { value: "Fashion Forward", category: "Fashion & Apparel" },
    { value: "Coffee Corner", category: "Food & Dining" }
  ];

  const discountTypes = [
    { value: "percentage", label: "Percentage Off", icon: Percent, description: "e.g., 20% off" },
    { value: "fixed_amount", label: "Fixed Amount Off", icon: DollarSign, description: "e.g., $10 off" },
    { value: "buy_one_get_one", label: "Buy One Get One", icon: Gift, description: "BOGO offer" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.merchant || !formData.category || !formData.discountType) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields marked with *",
        variant: "destructive",
      });
      return;
    }

    const updatedOffer = {
      ...offer,
      title: formData.title,
      description: formData.description,
      merchant: formData.merchant,
      category: formData.category,
      discountType: formData.discountType,
      discountValue: parseInt(formData.discountValue) || offer.discountValue,
      couponLimit: parseInt(formData.couponLimit) || offer.couponLimit,
      startDate: formData.startDate?.toISOString().split('T')[0] || offer.startDate,
      endDate: formData.endDate?.toISOString().split('T')[0] || offer.endDate,
    };

    onOfferUpdated(updatedOffer);
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset form to original values
    if (offer) {
      setFormData({
        title: offer.title || "",
        description: offer.description || "",
        merchant: offer.merchant || "",
        category: offer.category || "",
        discountType: offer.discountType || "",
        discountValue: offer.discountValue?.toString() || "",
        couponLimit: offer.couponLimit?.toString() || "",
        startDate: offer.startDate ? new Date(offer.startDate) : undefined,
        endDate: offer.endDate ? new Date(offer.endDate) : undefined,
      });
    }
    onOpenChange(false);
  };

  if (!offer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-6">
          <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Edit className="w-6 h-6 text-blue-600" />
            Edit Offer
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Update the offer details to better serve your students and merchant partners.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-600" />
              Basic Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Offer Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., 20% Off All Textbooks - Limited Time!"
                  className="mt-1 text-base"
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what makes this offer special and any terms that apply..."
                  rows={3}
                  className="mt-1 text-base"
                />
              </div>
            </div>
          </div>

          {/* Merchant & Category Section */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-blue-600" />
              Merchant & Category
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="merchant" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Merchant <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.merchant} onValueChange={(value) => setFormData(prev => ({ ...prev, merchant: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a merchant" />
                  </SelectTrigger>
                  <SelectContent>
                    {merchants.map((merchant) => (
                      <SelectItem key={merchant.value} value={merchant.value} className="py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{merchant.value}</span>
                          <span className="text-sm text-gray-500">{merchant.category}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value} className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-medium">{category.value}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Discount Configuration Section */}
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Percent className="w-5 h-5 text-green-600" />
              Discount Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="discountType" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Discount Type <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.discountType} onValueChange={(value) => setFormData(prev => ({ ...prev, discountType: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    {discountTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="py-4">
                        <div className="flex items-center gap-3">
                          <type.icon className="w-5 h-5 text-green-600" />
                          <div className="flex flex-col">
                            <span className="font-medium">{type.label}</span>
                            <span className="text-sm text-gray-500">{type.description}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discountValue" className="text-sm font-medium text-gray-700">
                    Discount Value {formData.discountType === "percentage" ? "(%)" : formData.discountType === "fixed_amount" ? "($)" : ""}
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                    placeholder={formData.discountType === "buy_one_get_one" ? "N/A for BOGO" : formData.discountType === "percentage" ? "20" : "10"}
                    disabled={formData.discountType === "buy_one_get_one"}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="couponLimit" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Coupon Limit
                  </Label>
                  <Input
                    id="couponLimit"
                    type="number"
                    value={formData.couponLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, couponLimit: e.target.value }))}
                    placeholder="100"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !formData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, "PPP") : "Pick start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !formData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, "PPP") : "Pick end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={handleCancel} className="px-6">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 shadow-lg">
              <Edit className="w-4 h-4 mr-2" />
              Update Offer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
