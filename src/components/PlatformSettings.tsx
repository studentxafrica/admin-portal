import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Tag,
  Plus,
  Edit,
  Trash2,
  Save,
  Bell,
  Mail,
  Shield,
  Database,
  Globe,
  Palette,
  MoreVertical
} from "lucide-react";
import axiosInstance from "@/api/axios";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { ConfirmModal } from "./confirmModal";

const initialCategoriesData = [
  { id: 1, name: "Food & Dining", slug: "food-dining", merchantCount: 45, offerCount: 156, active: true },
  { id: 2, name: "Fashion & Apparel", slug: "fashion", merchantCount: 32, offerCount: 89, active: true },
  { id: 3, name: "Electronics", slug: "electronics", merchantCount: 28, offerCount: 67, active: true },
  { id: 4, name: "Books & Supplies", slug: "books", merchantCount: 22, offerCount: 78, active: true },
  { id: 5, name: "Health & Beauty", slug: "health-beauty", merchantCount: 18, offerCount: 45, active: true },
  { id: 6, name: "Entertainment", slug: "entertainment", merchantCount: 15, offerCount: 23, active: false },
];

const initialTagsData = [
  { id: 1, name: "student-discount", useCount: 234 },
  { id: 2, name: "back-to-school", useCount: 189 },
  { id: 3, name: "textbooks", useCount: 156 },
  { id: 4, name: "coffee", useCount: 134 },
  { id: 5, name: "laptops", useCount: 98 },
  { id: 6, name: "clothing", useCount: 87 },
  { id: 7, name: "pizza", useCount: 76 },
  { id: 8, name: "electronics", useCount: 65 },
];

export function PlatformSettings() {
  const { toast } = useToast();
  const [platformName, setPlatformName] = useState("");
  const [platformDescription, setPlatformDescription] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState({
    categories: false,
    tags: false,
    settings: false
  });
  const { isOpen, openModal, closeModal, modalProps } = useConfirmModal();

  // Fetch initial data
  useEffect(() => {
    fetchSettings();
    fetchCategories();
    fetchTags();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(prev => ({ ...prev, settings: true }));
      const response = await axiosInstance.get('/admin/general');
      const data = response.data;
      setPlatformName(data.platformName);
      setPlatformDescription(data.platformDescription);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch platform settings",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, settings: false }));
    }
  };

  const fetchCategories = async () => {
    setLoading(prev => ({ ...prev, categories: true }));
    try {
      const response = await axiosInstance.get('/admin/categories');
      const data = response.data;
      setCategories(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const fetchTags = async () => {
    setLoading(prev => ({ ...prev, tags: true }));
    try {
      const response = await axiosInstance.get('/admin/tags');
      const data = response.data;
      setTags(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tags",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, tags: false }));
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Invalid Category",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axiosInstance.post('/admin/categories',
        {
          name: newCategoryName
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        });

      if (response.status !== 201) {
        throw new Error('Failed to add category');
      }

      const newCategory = response.data;
      setCategories(prev => [...prev, newCategory]);
      setNewCategoryName("");

      toast({
        title: "Category Added",
        description: `"${newCategoryName}" has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await axiosInstance.delete(`/admin/categories/${categoryId}`);

      if (response.status !== 200) {
        throw new Error('Failed to delete category');
      }

      const category = categories.find(c => c.id === categoryId);
      setCategories(prev => prev.filter(c => c.id !== categoryId));

      toast({
        title: "Category Deleted",
        description: `"${category?.name}" has been deleted.`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) {
      toast({
        title: "Invalid Tag",
        description: "Please enter a tag name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axiosInstance.post('/admin/tags',
        {
          name: newTagName
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        });

      if (response.status !== 201) {
        throw new Error('Failed to add tag');
      }

      const newTag = response.data;
      setTags(prev => [...prev, newTag]);
      setNewTagName("");

      toast({
        title: "Tag Added",
        description: `"${newTagName}" has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      const response = await axiosInstance.delete(`/admin/tags/${tagId}`);

      if (response.status !== 200) {
        throw new Error('Failed to delete tag');
      }

      const tag = tags.find(t => t.id === tagId);
      setTags(prev => prev.filter(t => t.id !== tagId));

      toast({
        title: "Tag Deleted",
        description: `"${tag?.name}" has been deleted.`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveSettings = async () => {
    try {
      const response = await axiosInstance.put('/admin/general',
        {
          platform_name: platformName,
          platform_description: platformDescription,
          // Include other settings here
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        });

      if (response.status !== 200) {
        throw new Error('Failed to save settings');
      }

      toast({
        title: "Settings Saved",
        description: "All platform settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleCategory = async (categoryId: string) => {
    try {
      const response = await axiosInstance.put(`/admin/categories/${categoryId}/toggle`);

      if (response.status !== 200) {
        throw new Error('Failed to toggle category');
      }

      const result = response.data;
      setCategories(prev => prev.map(c =>
        c.id === categoryId ? { ...c, active: result.active } : c
      ));

      const category = categories.find(c => c.id === categoryId);
      toast({
        title: `Category ${category?.active ? 'Deactivated' : 'Activated'}`,
        description: `"${category?.name}" has been ${category?.active ? 'deactivated' : 'activated'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600 mt-1">Configure platform settings, categories, and system preferences</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2" onClick={handleSaveSettings}>
          <Save className="w-4 h-4" />
          Save All Changes
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* Platform Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Platform Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
                  <Input
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    placeholder="Enter platform name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platform URL</label>
                  <Input
                    value={window.location.origin}
                    placeholder="Enter platform URL"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platform Description</label>
                <Textarea
                  value={platformDescription}
                  onChange={(e) => setPlatformDescription(e.target.value)}
                  placeholder="Describe your platform"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Feature Toggles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Feature Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Auto-approve verified merchants", description: "Automatically approve merchants with verified business credentials", enabled: false },
                { label: "Email verification required", description: "Require email verification for all new user accounts", enabled: true },
                { label: "Student ID verification", description: "Require student ID verification for account access", enabled: true },
                { label: "Merchant approval notifications", description: "Send notifications when merchants require approval", enabled: true },
                { label: "Featured offers", description: "Allow merchants to feature their offers for increased visibility", enabled: true },
                { label: "Social sharing", description: "Enable social media sharing for offers and coupons", enabled: true },
              ].map((setting, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{setting.label}</h3>
                    <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                  </div>
                  <Switch defaultChecked={setting.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Limits and Thresholds */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Platform Limits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Offers per Merchant</label>
                  <Input type="number" defaultValue="25" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Coupon Limit per Offer</label>
                  <Input type="number" defaultValue="1000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Expiry (Days)</label>
                  <Input type="number" defaultValue="30" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          {/* Add New Category */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Category name (e.g., Food & Dining)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <Button
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    openModal({
                      title: "Add Category",
                      message: "Are you sure you want to add this category?",
                      confirmText: "Add",
                      cancelText: "Cancel",
                      variant: "success",
                      onConfirm: () => {
                        handleAddCategory();
                        closeModal();
                      },
                      onClose: closeModal,
                    })


                  }}>
                  <Plus className="w-4 h-4" />
                  Add Category
                </Button>
              </div>
            </CardContent>
          </Card>
          <ConfirmModal
            isOpen={isOpen}
            onClose={closeModal}
            {...modalProps}
          />
          {/* Categories List */}
          <Card>
            <CardHeader>
              <CardTitle>Manage Categories ({categories.length})</CardTitle>
              <p className="text-sm text-gray-600">Organize offers by category to help students find relevant deals</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-600">Slug: {category.slug}</p>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>{category.merchantCount} merchants</span>
                        <span>{category.offerCount} offers</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* <Badge className={category.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                        {category.active ? "Active" : "Inactive"}
                      </Badge> */}
                      {/* <Switch
                        checked={category.active}
                        onCheckedChange={() => handleToggleCategory(category.id)}
                      /> */}
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        openModal({
                          title: "Delete Category",
                          message: `Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`,
                          confirmText: "Delete",
                          cancelText: "Cancel",
                          variant: "destructive",
                          onConfirm: () => {
                            handleDeleteCategory(category.id);
                            closeModal();
                          },
                          onClose: closeModal,
                        });
                        }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="space-y-6">
          {/* Add New Tag */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Tag</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Tag name (e.g., student-discount)"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2" onClick={handleAddTag}>
                  <Plus className="w-4 h-4" />
                  Add Tag
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tags Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Manage Tags ({tags.length})</CardTitle>
              <p className="text-sm text-gray-600">Tags help categorize and search offers more effectively</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">{tag.name}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Used {tag.useCount} times</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteTag(tag.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "New merchant registrations", description: "Notify when new merchants register", enabled: true },
                { label: "Merchant approval requests", description: "Notify when merchants need approval", enabled: true },
                { label: "High redemption offers", description: "Notify about high-performing offers", enabled: true },
                { label: "Low redemption alerts", description: "Notify about underperforming offers", enabled: false },
                { label: "Daily analytics summary", description: "Daily platform performance summary", enabled: true },
                { label: "Weekly reports", description: "Comprehensive weekly performance reports", enabled: true },
              ].map((setting, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{setting.label}</h3>
                    <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                  </div>
                  <Switch defaultChecked={setting.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Push Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Real-time alerts", description: "Immediate notifications for critical events", enabled: true },
                { label: "Approval notifications", description: "Notify when approval actions are needed", enabled: true },
                { label: "Performance milestones", description: "Notify when platform reaches key milestones", enabled: true },
                { label: "System maintenance", description: "Notify about scheduled maintenance", enabled: true },
              ].map((setting, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{setting.label}</h3>
                    <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                  </div>
                  <Switch defaultChecked={setting.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Two-factor authentication", description: "Require 2FA for admin accounts", enabled: true },
                { label: "Session timeout", description: "Auto-logout after 30 minutes of inactivity", enabled: true },
                { label: "IP whitelisting", description: "Restrict admin access to specific IP addresses", enabled: false },
                { label: "Audit logging", description: "Log all admin actions for security review", enabled: true },
                { label: "Failed login alerts", description: "Alert on multiple failed login attempts", enabled: true },
              ].map((setting, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{setting.label}</h3>
                    <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                  </div>
                  <Switch defaultChecked={setting.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Password Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Password Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Length</label>
                  <Input type="number" defaultValue="8" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (Days)</label>
                  <Input type="number" defaultValue="90" />
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Require uppercase letters", enabled: true },
                  { label: "Require lowercase letters", enabled: true },
                  { label: "Require numbers", enabled: true },
                  { label: "Require special characters", enabled: true },
                ].map((requirement, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{requirement.label}</span>
                    <Switch defaultChecked={requirement.enabled} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
