import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  CalendarIcon, Store, Tag, Percent, DollarSign, Users, Clock, Gift,
  Video, Link2, Loader2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import axiosInstance from "@/api/axios";
import { OfferKind, MerchantOption } from "@/types/offer";

interface CreateOfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOfferCreated: () => void;
}

const CURRENCIES = ["KES", "USD", "EUR", "GBP", "ZAR", "NGN", "UGX", "TZS"];

const isEventLink = (url: string) => /^https?:\/\/\S+\.\S+/.test((url || "").trim());

const emptyForm = {
  offerKind: OfferKind.DISCOUNT,
  title: "",
  description: "",
  merchantId: "",
  categoryId: "",
  eventUrl: "",
  discountType: "percentage",
  discountValue: "",
  currency: "KES",
  redemptionType: "both",
  couponLimit: "",
  coverImage: "",
  termsAndConditions: "",
  startDate: undefined as Date | undefined,
  endDate: undefined as Date | undefined,
};

export function CreateOfferModal({ open, onOpenChange, onOfferCreated }: CreateOfferModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState(emptyForm);
  const [merchants, setMerchants] = useState<MerchantOption[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const isEvent = formData.offerKind === OfferKind.EVENT;
  const selectedMerchant = merchants.find(m => m.id === formData.merchantId);

  useEffect(() => {
    if (!open) return;

    const loadOptions = async () => {
      try {
        const [merchantRes, categoryRes] = await Promise.allSettled([
          axiosInstance.get("/admin/users", { params: { type: "merchants" } }),
          axiosInstance.get("/offer/categories"),
        ]);

        if (merchantRes.status === "fulfilled") {
          const all: MerchantOption[] = merchantRes.value.data?.users || [];
          // Only approved merchants can have offers published for them
          setMerchants(all.filter(m => m.approved));
        }
        if (categoryRes.status === "fulfilled") {
          setCategories(categoryRes.value.data?.data || []);
        }
      } catch {
        toast({
          title: "Could not load merchants",
          description: "Please close and reopen the dialog to try again.",
          variant: "destructive",
        });
      }
    };

    loadOptions();
  }, [open, toast]);

  const discountTypes = [
    { value: "percentage", label: "Percentage Off", icon: Percent, description: "e.g., 20% off" },
    { value: "fixed_amount", label: "Fixed Amount Off", icon: DollarSign, description: "e.g., 10 off" },
    { value: "buy_one_get_one", label: "Buy One Get One", icon: Gift, description: "BOGO offer" },
    { value: "free_item", label: "Free Item", icon: Gift, description: "Something on the house" },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, coverImage: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.merchantId || !formData.description) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields marked with *",
        variant: "destructive",
      });
      return;
    }

    if (isEvent && !isEventLink(formData.eventUrl)) {
      toast({
        title: "Event link required",
        description: "Add the link students will use to join, starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast({
        title: "Schedule required",
        description: "Pick when the offer opens and closes.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await axiosInstance.post("/admin/offers", {
        merchant_id: formData.merchantId,
        category_id: formData.categoryId || undefined,
        offer_kind: formData.offerKind,
        title: formData.title,
        description: formData.description,
        slug: formData.title.toLowerCase().replace(/\s+/g, "-").slice(0, 64),
        cover_image: formData.coverImage || "https://via.placeholder.com/300",
        event_url: isEvent ? formData.eventUrl.trim() : undefined,
        discount_type: isEvent ? undefined : formData.discountType,
        discount_value: isEvent ? undefined : Number(formData.discountValue) || 0,
        currency: formData.currency,
        redemption_type: isEvent ? undefined : formData.redemptionType,
        coupon_limit: Number(formData.couponLimit) || 100,
        start_date: formData.startDate.toISOString(),
        end_date: formData.endDate.toISOString(),
        terms_and_conditions: formData.termsAndConditions,
      });

      toast({
        title: isEvent ? "Event published" : "Offer created",
        description: response.data?.message
          || `"${formData.title}" is now live for ${selectedMerchant?.name}.`,
      });

      setFormData(emptyForm);
      onOfferCreated();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: error.response?.data?.message || "Could not create offer",
        description: error.response?.data?.description || "Please check the details and try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-6">
          <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Store className="w-6 h-6 text-green-600" />
            Create Offer on Behalf of a Merchant
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            The offer is published under the merchant you choose, exactly as if they had created it themselves.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Offer Kind */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-600" />
              What is this offer?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, offerKind: OfferKind.DISCOUNT }))}
                className={cn(
                  "text-left border rounded-lg p-3 transition-colors",
                  !isEvent ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <Percent className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Discount</p>
                    <p className="text-sm text-gray-600">Students claim a coupon code to save money</p>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, offerKind: OfferKind.EVENT }))}
                className={cn(
                  "text-left border rounded-lg p-3 transition-colors",
                  isEvent ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="font-medium">Event registration</p>
                    <p className="text-sm text-gray-600">Students register and get the event link</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-600" />
              Basic Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  {isEvent ? "Event Title" : "Offer Title"} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={isEvent ? "e.g., Careers in Tech Webinar" : "e.g., 20% Off All Textbooks"}
                  className="mt-1 text-base"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={isEvent
                    ? "What the event covers, when it starts, who should join..."
                    : "Describe what makes this offer special and any terms that apply..."}
                  rows={3}
                  className="mt-1 text-base"
                />
              </div>

              <div>
                <Label htmlFor="coverImage" className="text-sm font-medium text-gray-700">Cover Image</Label>
                <div className="mt-1 flex items-center gap-4">
                  {formData.coverImage ? (
                    <img src={formData.coverImage} alt="Preview" className="w-24 h-24 rounded-lg object-cover border" />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-gray-100 border flex items-center justify-center text-xs text-gray-500">
                      No image
                    </div>
                  )}
                  <Input id="coverImage" type="file" accept="image/*" onChange={handleImageUpload} />
                </div>
              </div>
            </div>
          </div>

          {/* Merchant & Category */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-blue-600" />
              Merchant &amp; Category
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="merchant" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Merchant <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.merchantId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, merchantId: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={merchants.length ? "Choose a merchant" : "Loading merchants..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {merchants.map((merchant) => (
                      <SelectItem key={merchant.id} value={merchant.id} className="py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{merchant.name}</span>
                          <span className="text-sm text-gray-500">{merchant.category}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600 mt-1">Only approved merchants are listed.</p>
              </div>

              <div>
                <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Defaults to the merchant's category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="py-3">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Event details or Discount configuration */}
          {isEvent ? (
            <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-600" />
                Event Details
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="eventUrl" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Event Link <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-gray-400" />
                    <Input
                      id="eventUrl"
                      type="url"
                      value={formData.eventUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, eventUrl: e.target.value }))}
                      placeholder="https://meet.google.com/abc-defg-hij"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Everyone who registers sees this same link and QR code, so there are no codes to generate.
                  </p>
                  {formData.eventUrl && !isEventLink(formData.eventUrl) && (
                    <p className="text-xs text-red-600 mt-1">Enter a full link starting with http:// or https://</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="registrationLimit" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Registration Limit
                  </Label>
                  <Input
                    id="registrationLimit"
                    type="number"
                    min="1"
                    value={formData.couponLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, couponLimit: e.target.value }))}
                    placeholder="100"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-600 mt-1">How many students can register before the event is full.</p>
                </div>
              </div>
            </div>
          ) : (
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
                  <Select
                    value={formData.discountType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, discountType: value }))}
                  >
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="discountValue" className="text-sm font-medium text-gray-700">
                      Discount Value {formData.discountType === "percentage" ? "(%)" : ""}
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                      placeholder={formData.discountType === "percentage" ? "20" : "10"}
                      disabled={["buy_one_get_one", "free_item"].includes(formData.discountType)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="currency" className="text-sm font-medium text-gray-700">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map(code => (
                          <SelectItem key={code} value={code}>{code}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

                <div>
                  <Label htmlFor="redemptionType" className="text-sm font-medium text-gray-700">Redemption Type</Label>
                  <Select
                    value={formData.redemptionType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, redemptionType: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-store">In-Store Only</SelectItem>
                      <SelectItem value="online">Online Only</SelectItem>
                      <SelectItem value="both">Both In-Store and Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Schedule */}
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              {isEvent ? "Registration Window" : "Schedule"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  {isEvent ? "Opens" : "Start Date"} <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
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
                <Label className="text-sm font-medium text-gray-700">
                  {isEvent ? "Closes" : "End Date"} <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
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
            {isEvent && (
              <p className="text-xs text-gray-600 mt-2">
                Students keep access to the event link until registration closes.
              </p>
            )}
          </div>

          {/* Terms */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <Label htmlFor="terms" className="text-sm font-medium text-gray-700">Terms and Conditions</Label>
            <Textarea
              id="terms"
              value={formData.termsAndConditions}
              onChange={(e) => setFormData(prev => ({ ...prev, termsAndConditions: e.target.value }))}
              placeholder={isEvent
                ? "Attendance rules, what to bring, cancellation policy..."
                : "Any restrictions students should know about..."}
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="px-6">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700 px-6 shadow-lg">
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Store className="w-4 h-4 mr-2" />
              )}
              {isEvent ? "Publish Event" : "Create Offer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
