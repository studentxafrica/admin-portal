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
import {
  CalendarIcon, Store, Tag, Percent, DollarSign, Users, Clock, Gift,
  Edit, Video, Link2, Loader2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import axiosInstance from "@/api/axios";
import { OfferKind } from "@/types/offer";

interface EditOfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer: any;
  onOfferUpdated: () => void;
}

const CURRENCIES = ["KES", "USD", "EUR", "GBP", "ZAR", "NGN", "UGX", "TZS"];

const isEventLink = (url: string) => /^https?:\/\/\S+\.\S+/.test((url || "").trim());

export function EditOfferModal({ open, onOpenChange, offer, onOfferUpdated }: EditOfferModalProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventUrl: "",
    discountType: "",
    discountValue: "",
    currency: "KES",
    couponLimit: "",
    status: "active",
    termsAndConditions: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });

  const isEvent = offer?.offerKind === OfferKind.EVENT;

  // Reset form when offer changes
  useEffect(() => {
    if (offer) {
      setFormData({
        title: offer.title || "",
        description: offer.description || "",
        eventUrl: offer.eventUrl || "",
        discountType: offer.discountType || "",
        discountValue: offer.discountValue?.toString() || "",
        currency: offer.currency || "KES",
        couponLimit: offer.couponLimit?.toString() || "",
        status: offer.status || "active",
        termsAndConditions: offer.termsAndConditions || "",
        startDate: offer.startDate ? new Date(offer.startDate) : undefined,
        endDate: offer.endDate ? new Date(offer.endDate) : undefined,
      });
    }
  }, [offer]);

  const discountTypes = [
    { value: "percentage", label: "Percentage Off", icon: Percent, description: "e.g., 20% off" },
    { value: "fixed_amount", label: "Fixed Amount Off", icon: DollarSign, description: "e.g., 10 off" },
    { value: "buy_one_get_one", label: "Buy One Get One", icon: Gift, description: "BOGO offer" },
    { value: "free_item", label: "Free Item", icon: Gift, description: "Something on the house" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast({
        title: "Missing Required Fields",
        description: "An offer needs a title.",
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

    try {
      setSubmitting(true);
      const response = await axiosInstance.put(`/admin/offers/${offer.id}`, {
        title: formData.title,
        description: formData.description,
        event_url: isEvent ? formData.eventUrl.trim() : undefined,
        discount_type: isEvent ? undefined : formData.discountType,
        discount_value: isEvent ? undefined : Number(formData.discountValue) || 0,
        currency: formData.currency,
        coupon_limit: Number(formData.couponLimit) || undefined,
        status: formData.status,
        terms_and_conditions: formData.termsAndConditions,
        start_date: formData.startDate?.toISOString(),
        end_date: formData.endDate?.toISOString(),
      });

      toast({
        title: isEvent ? "Event Updated" : "Offer Updated",
        description: response.data?.message || `"${formData.title}" has been updated.`,
      });

      onOfferUpdated();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: error.response?.data?.message || "Could not update offer",
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
            <Edit className="w-6 h-6 text-blue-600" />
            {isEvent ? "Edit Event" : "Edit Offer"}
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            {isEvent
              ? `Editing on behalf of ${offer?.merchant?.name || "the merchant"}. A new link replaces the old one for students who already registered.`
              : `Editing on behalf of ${offer?.merchant?.name || "the merchant"}.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-600" />
              Basic Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  {isEvent ? "Event Title" : "Offer Title"} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 text-base"
                />
              </div>

              <div>
                <Label htmlFor="edit-description" className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="mt-1 text-base"
                />
              </div>

              <div>
                <Label htmlFor="edit-status" className="text-sm font-medium text-gray-700">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
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
                  <Label htmlFor="edit-eventUrl" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Event Link <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-gray-400" />
                    <Input
                      id="edit-eventUrl"
                      type="url"
                      value={formData.eventUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, eventUrl: e.target.value }))}
                      placeholder="https://meet.google.com/abc-defg-hij"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Changing this updates the link and QR code for every student who already registered.
                  </p>
                  {formData.eventUrl && !isEventLink(formData.eventUrl) && (
                    <p className="text-xs text-red-600 mt-1">Enter a full link starting with http:// or https://</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="edit-registrationLimit" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Registration Limit
                  </Label>
                  <Input
                    id="edit-registrationLimit"
                    type="number"
                    min="1"
                    value={formData.couponLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, couponLimit: e.target.value }))}
                    className="mt-1"
                  />
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
                  <Label htmlFor="edit-discountType" className="text-sm font-medium text-gray-700">Discount Type</Label>
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
                    <Label htmlFor="edit-discountValue" className="text-sm font-medium text-gray-700">
                      Discount Value {formData.discountType === "percentage" ? "(%)" : ""}
                    </Label>
                    <Input
                      id="edit-discountValue"
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                      disabled={["buy_one_get_one", "free_item"].includes(formData.discountType)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-currency" className="text-sm font-medium text-gray-700">Currency</Label>
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
                    <Label htmlFor="edit-couponLimit" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Coupon Limit
                    </Label>
                    <Input
                      id="edit-couponLimit"
                      type="number"
                      value={formData.couponLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, couponLimit: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
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
                <Label className="text-sm font-medium text-gray-700">{isEvent ? "Opens" : "Start Date"}</Label>
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
                <Label className="text-sm font-medium text-gray-700">{isEvent ? "Closes" : "End Date"}</Label>
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
          </div>

          {/* Terms */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <Label htmlFor="edit-terms" className="text-sm font-medium text-gray-700">Terms and Conditions</Label>
            <Textarea
              id="edit-terms"
              value={formData.termsAndConditions}
              onChange={(e) => setFormData(prev => ({ ...prev, termsAndConditions: e.target.value }))}
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="px-6">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 px-6 shadow-lg">
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Edit className="w-4 h-4 mr-2" />
              )}
              {isEvent ? "Update Event" : "Update Offer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
