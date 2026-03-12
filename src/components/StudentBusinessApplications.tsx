import { useEffect, useState } from "react";
import axiosInstance from "@/api/axios";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BriefcaseBusiness, Search, Eye } from "lucide-react";

type ApplicationStatus = "pending" | "requested" | "approved" | "rejected";

interface StudentInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  school?: string;
  major?: string;
  isVerified?: boolean;
}

interface ApplicationDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt?: string;
}

interface StudentBusinessApplication {
  id: string;
  status: ApplicationStatus;
  businessName: string;
  businessType: string;
  businessDescription: string;
  businessEmail?: string;
  businessPhone?: string;
  website?: string;
  registrationNumber?: string;
  additionalNotes?: string;
  reviewFeedback?: string;
  submittedAt?: string;
  reviewedAt?: string;
  student: StudentInfo;
  documents: ApplicationDocument[];
}

interface ApplicationStats {
  total: number;
  pending: number;
  requested: number;
  approved: number;
  rejected: number;
}

const statusClassMap: Record<ApplicationStatus, string> = {
  pending: "bg-amber-100 text-amber-900",
  requested: "bg-blue-100 text-blue-900",
  approved: "bg-green-100 text-green-900",
  rejected: "bg-red-100 text-red-900",
};

export const StudentBusinessApplications = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [applications, setApplications] = useState<StudentBusinessApplication[]>([]);
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    pending: 0,
    requested: 0,
    approved: 0,
    rejected: 0,
  });
  const [selectedApplication, setSelectedApplication] = useState<StudentBusinessApplication | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/admin/student-business-applications", {
        params: { status, search },
      });
      setApplications(response.data?.data || []);
      setStats(response.data?.stats || stats);
    } catch (error: any) {
      toast({
        title: "Failed to load applications",
        description: error.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchApplications();
    }, 250);
    return () => clearTimeout(timeout);
  }, [status, search]);

  const handleOpenReview = async (applicationId: string) => {
    try {
      const response = await axiosInstance.get(`/admin/student-business-applications/${applicationId}`);
      setSelectedApplication(response.data?.data || null);
      setFeedback(response.data?.data?.reviewFeedback || "");
      setIsReviewOpen(true);
    } catch (error: any) {
      toast({
        title: "Could not load application",
        description: error.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const submitReview = async (action: "approve" | "reject" | "request") => {
    if (!selectedApplication) {
      return;
    }
    try {
      setReviewing(true);
      await axiosInstance.post(
        `/admin/student-business-applications/${selectedApplication.id}/review`,
        { action, feedback }
      );
      toast({
        title: "Review submitted",
        description: `Application has been ${action === "request" ? "sent back for more info" : `${action}d`}.`,
      });
      setIsReviewOpen(false);
      setSelectedApplication(null);
      setFeedback("");
      await fetchApplications();
    } catch (error: any) {
      toast({
        title: "Review failed",
        description: error.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="space-y-6 p-2">
      <Card className="border border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BriefcaseBusiness className="w-5 h-5 text-blue-600" />
            Student Business Applications
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          <div>Total: <strong>{stats.total}</strong></div>
          <div>Pending: <strong>{stats.pending}</strong></div>
          <div>Requested: <strong>{stats.requested}</strong></div>
          <div>Approved: <strong>{stats.approved}</strong></div>
          <div>Rejected: <strong>{stats.rejected}</strong></div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student or business name"
              className="pl-9"
            />
          </div>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="requested">Requested</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {loading ? (
              <div className="p-6 text-center text-sm text-gray-500">Loading applications...</div>
            ) : applications.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">No applications found.</div>
            ) : (
              applications.map((application) => (
                <div key={application.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="font-semibold">{application.businessName}</div>
                    <div className="text-sm text-gray-600">
                      {application.student.firstName} {application.student.lastName} • {application.student.email}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Submitted: {application.submittedAt ? new Date(application.submittedAt).toLocaleString() : "N/A"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${statusClassMap[application.status]} border-0`}>
                      {application.status}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => handleOpenReview(application.id)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Business Application</DialogTitle>
            <DialogDescription>
              Approve, reject, or request more information from the student.
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4">
              <div>
                <p className="font-semibold">{selectedApplication.businessName}</p>
                <p className="text-sm text-gray-600">{selectedApplication.businessType}</p>
                <p className="text-sm text-gray-700 mt-2">{selectedApplication.businessDescription}</p>
              </div>

              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Student:</strong> {selectedApplication.student.firstName} {selectedApplication.student.lastName}</p>
                <p><strong>Email:</strong> {selectedApplication.student.email}</p>
                <p><strong>Business Email:</strong> {selectedApplication.businessEmail || "N/A"}</p>
                <p><strong>Business Phone:</strong> {selectedApplication.businessPhone || "N/A"}</p>
                <p><strong>Website:</strong> {selectedApplication.website || "N/A"}</p>
              </div>

              <div>
                <p className="font-medium text-sm mb-2">Ownership Documents</p>
                <div className="space-y-2">
                  {selectedApplication.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-sm text-blue-600 hover:underline"
                    >
                      {doc.name} ({doc.type})
                    </a>
                  ))}
                </div>
              </div>

              <Textarea
                placeholder="Add reviewer feedback (required for reject/request-info)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsReviewOpen(false)}>Cancel</Button>
            <Button
              variant="outline"
              className="border-blue-300 text-blue-700"
              disabled={reviewing}
              onClick={() => submitReview("request")}
            >
              Request Info
            </Button>
            <Button
              variant="outline"
              className="border-red-300 text-red-700"
              disabled={reviewing}
              onClick={() => submitReview("reject")}
            >
              Reject
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              disabled={reviewing}
              onClick={() => submitReview("approve")}
            >
              Approve & Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentBusinessApplications;
