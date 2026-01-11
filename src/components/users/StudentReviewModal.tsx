import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader, DialogFooter } from "../ui/dialog";
import { CheckCircle, XCircle, AlertCircle, Eye, Download, Calendar, Mail, User, GraduationCap, Clock, FileText, Plus, Minus, Pencil } from "lucide-react";
import { FeedbackTemplate, feedbackTemplates } from "./FeedbackTemplates";
import axiosInstance from "@/api/axios";
import { set } from "date-fns";
import ServerError from "../errors/ServerError";
import { request } from "http";
import { Button } from "../ui/button";

interface VerificationData {
	id: string;
	student: StudentData;
	submissionDate: string;
	previousRequests?: number;
	documents: Array<{
		id: string;
		name: string;
		type: string;
		url: string;
		uploadDate: string | null;
		verified: boolean | null;
		size: number;
	}>;
	notes?: Array<{
		comment: string;
		reviewer: {
			name: string;
		};
		createdAt: string;
	}>;
}

interface StudentData {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	studentId: string;
	program: string;
	year: string;
	institution: string;
	submissionDate: string;
	phoneNumber?: string;
	dateOfBirth?: string;
	verificationStatus: 'completed' | 'in_progress' | 'failed' | 'rejected' | 'not_verified';
	expectedGraduation?: string;
}

const StudentReviewModal: React.FC<{
	isOpen: boolean;
	onClose: () => void;
	studentId: string;
	onApprove?: (feedback: string) => void;
	onReject?: (reason: string) => void;
	onRequestInfo?: (message: string) => void;
}> = ({
	isOpen,
	onClose,
	studentId,
	onApprove,
	onReject,
	onRequestInfo
}) => {
		const [feedback, setFeedback] = useState("");
		const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
		const [actionType, setActionType] = useState<'approve' | 'reject' | 'request' | null>(null);
		const [isProcessing, setIsProcessing] = useState(false);
		const [selectedTemplate, setSelectedTemplate] = useState<string>("");
		const [newReviewNote, setNewReviewNote] = useState("");
		const [addingNote, setAddingNote] = useState(false);
		const [loading, setLoading] = useState(true);
		const [error, setError] = useState<{
			message: string;
			details?: string;
		} | null>(null);

		const fetchStudentData = async (id: string): Promise<StudentData | null> => {
			try {
				setLoading(true);
				setError(null);
				const response = await axiosInstance.get(`/user/verification/student/${id}`);
				if (response.status === 200) {
					setVerificationData(response.data.data);
				}
			} catch (error) {
				console.error("Error fetching student data:", error);
				setError({
					message: error.response?.data?.message || "Failed to load student data",
					details: error.response?.data?.description || error?.message || "An unexpected error occurred"
				});
			} finally {
				setLoading(false);
			}
			return null;
		};

		useEffect(() => {
			fetchStudentData(studentId);
		}, [studentId]);

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
				default:
					return 'bg-gray-500';
			}
		};

		const getTemplatesByCategory = (category: 'approve' | 'reject' | 'request') => {
			return feedbackTemplates.filter(template => template.category === category);
		};

		const applyTemplate = (template: FeedbackTemplate) => {
			let processedTemplate = template.template;

			// Replace variables with actual student data
			processedTemplate = processedTemplate.replace(/\{\{studentName\}\}/g, verificationData.student.firstName);
			processedTemplate = processedTemplate.replace(/\{\{studentEmail\}\}/g, verificationData.student.email);
			processedTemplate = processedTemplate.replace(/\{\{studentId\}\}/g, verificationData.student.studentId);
			processedTemplate = processedTemplate.replace(/\{\{program\}\}/g, verificationData.student.program);
			processedTemplate = processedTemplate.replace(/\{\{institution\}\}/g, verificationData.student.institution);

			setFeedback(processedTemplate);
			setSelectedTemplate(template.id);
		};

		const getDocumentIcon = (type: string) => {
			switch (type) {
				case 'id_card': return <User className="w-4 h-4" />;
				case 'enrollment_proof': return <FileText className="w-4 h-4" />;
				case 'transcript': return <GraduationCap className="w-4 h-4" />;
				default: return <FileText className="w-4 h-4" />;
			}
		};

		const getStatusColor = (verified: boolean | null) => {
			if (verified === true) return "text-green-600";
			if (verified === false) return "text-red-600";
			return "text-yellow-600";
		};

		const getStatusIcon = (verified: boolean | null) => {
			if (verified === true) return <CheckCircle className="w-4 h-4 text-green-600" />;
			if (verified === false) return <XCircle className="w-4 h-4 text-red-600" />;
			return <Clock className="w-4 h-4 text-yellow-600" />;
		};

		const formatDate = (dateString: string) => {
			return new Date(dateString).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		};

		const handleAction = async (action: 'approve' | 'reject' | 'request') => {
			if (!feedback.trim() && action !== 'approve') {
				alert('Please provide feedback or reason for this action.');
				return;
			}

			try {
				setIsProcessing(true);
				const payload = {
					requestId: verificationData?.id,
					studentId: verificationData.student.id,
					action,
					feedback: feedback,
					templateId: selectedTemplate || null,
					reviewNote: newReviewNote
				};
				const response = await axiosInstance.post('/user/verification/student/action', payload);
				if (response.status === 200) {
					if (action === 'approve' && onApprove) {
						onApprove(feedback.trim());
					} else if (action === 'reject' && onReject) {
						onReject(feedback.trim());
					} else if (action === 'request' && onRequestInfo) {
						onRequestInfo(feedback.trim());
					}
					onClose();
				}
				setFeedback("");
				setSelectedTemplate("");
				setActionType(null);
				setVerificationData(null);
				await fetchStudentData(verificationData.student.id); // Refresh data after action
			} catch (error) {
				console.error("Error processing action:", error);
				setError({
					message: error.response?.data?.message || "Failed to process the action",
					details: error.response?.data?.description || error.message || "An unexpected error occurred"
				});
				return;

			} finally {
				setIsProcessing(false);
			}

		};

		if (!isOpen) return null;

		return (
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
					<DialogHeader className="p-6 pb-4 border-b">
						<div className="flex items-center justify-between">
							<div>
								<DialogTitle className="text-xl font-semibold">Student Verification Review</DialogTitle>
								<DialogDescription className="mt-1">
									Review student details and documents before making a verification decision
								</DialogDescription>
							</div>
							{verificationData?.submissionDate && (
								<div className="flex items-center gap-2 text-sm text-gray-500">
									<Calendar className="w-4 h-4" />
									Submitted {formatDate(verificationData?.submissionDate)}
								</div>
							)}
						</div>
					</DialogHeader>
					{loading ? (
						<div className="p-6 flex items-center justify-center min-h-[70vh]">
							<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
						</div>
					) : error ? (
						<div className="p-6 flex flex-col items-center justify-center space-y-4 min-h-[70vh]">
							<ServerError title={error.message} description={error.details} retrying={loading} onRetry={() => fetchStudentData(studentId)} />
						</div>
					) : (
						<div>
							<div className="p-6 space-y-6">
								{/* Status Overview */}
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<AlertCircle className="w-5 h-5 text-blue-600" />
											<span className="font-medium text-blue-900">Verification Request #{verificationData.student?.id}</span>
										</div>
										<div className="flex items-center gap-4 text-sm">
											<span className={`${getBadgeColor(verificationData?.student?.verificationStatus)} px-2 py-1 rounded-full`}>
												{verificationData?.student?.verificationStatus === 'completed' ? 'Completed' :
													verificationData?.student?.verificationStatus === 'in_progress' ? 'Awaiting Review' :
														verificationData?.student?.verificationStatus === 'failed' ? 'Failed' :
															verificationData?.student?.verificationStatus === 'rejected' ? 'Rejected' :
																'Not Verified'}
											</span>
											{verificationData?.previousRequests > 0 && (
												<span className="text-gray-600">
													{verificationData?.previousRequests || 0} previous request(s)
												</span>
											)}
										</div>
									</div>
								</div>

								{/* Student Information Grid */}
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
									{/* Personal Information */}
									<div className="space-y-4">
										<h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
										<div className="space-y-3">
											<div className="flex items-center gap-2">
												<div className="w-24 text-sm font-medium text-gray-600">Name:</div>
												<div className="font-medium">{verificationData.student?.firstName} {verificationData.student?.lastName}</div>
											</div>
											<div className="flex items-center gap-2">
												<Mail className="w-4 h-4 text-gray-400" />
												<div className="w-20 text-sm font-medium text-gray-600">Email:</div>
												<div className="text-blue-600">{verificationData.student?.email}</div>
											</div>
											{verificationData.student?.phoneNumber && (
												<div className="flex items-center gap-2">
													<div className="w-24 text-sm font-medium text-gray-600">Phone:</div>
													<div>{verificationData.student?.phoneNumber}</div>
												</div>
											)}
											{verificationData.student?.dateOfBirth && (
												<div className="flex items-center gap-2">
													<div className="w-24 text-sm font-medium text-gray-600">DOB:</div>
													<div>{new Date(verificationData.student?.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
												</div>
											)}
										</div>
									</div>

									{/* Academic Information */}
									<div className="space-y-4">
										<h3 className="text-lg font-semibold border-b pb-2">Academic Information</h3>
										<div className="space-y-3">
											<div className="flex items-center gap-2">
												<GraduationCap className="w-4 h-4 text-gray-400" />
												<div className="w-20 text-sm font-medium text-gray-600">Program:</div>
												<div className="font-medium">{verificationData.student?.program}</div>
											</div>
											<div className="flex items-center gap-2">
												<div className="w-24 text-sm font-medium text-gray-600">Student ID:</div>
												<div className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">{verificationData.student?.studentId}</div>
											</div>
											<div className="flex items-center gap-2">
												<div className="w-24 text-sm font-medium text-gray-600">Year:</div>
												<div>{verificationData.student?.year === '1'
													? 'First Year' : verificationData.student?.year === '2'
														? 'Second Year' : verificationData.student?.year === '3'
															? 'Third Year' : verificationData.student?.year === '4'
																? 'Fourth Year' : verificationData.student?.year === 'graduate'
																	? 'Graduate' : 'N/A'}</div>
											</div>
											<div className="flex items-center gap-2">
												<div className="w-24 text-sm font-medium text-gray-600">Institution:</div>
												<div className="font-medium">{verificationData.student?.institution}</div>
											</div>

											{verificationData.student?.expectedGraduation && (
												<div className="flex items-center gap-2">
													<div className="w-24 text-sm font-medium text-gray-600">Graduation:</div>
													<div>{verificationData.student?.expectedGraduation}</div>
												</div>
											)}
										</div>
									</div>
								</div>

								{/* Documents Section */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold border-b pb-2">Verification Documents</h3>
									<div className="grid gap-4">
										{verificationData?.documents.map((doc) => (
											<div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-3">
														{getDocumentIcon(doc.type)}
														<div>
															<div className="font-medium">{doc.name}</div>
															<div className="text-sm text-gray-500">
																Uploaded {formatDate(doc.uploadDate)} • {
																	doc.size > 1024 * 1024 ? (doc.size / (1024 * 1024)).toFixed(2) + 'MB' :
																		doc.size > 1024 ? (doc.size / 1024).toFixed(2) + 'KB' :
																			doc.size + ' bytes'
																}
															</div>
														</div>
													</div>
													<div className="flex items-center gap-3">
														{/* <div className="flex items-center gap-1">
															{getStatusIcon(doc.verified)}
															<span className={`text-sm font-medium ${getStatusColor(doc.verified)}`}>
																{doc.verified === true ? 'Verified' : doc.verified === false ? 'Rejected' : 'Pending'}
															</span>
														</div> */}
														<div className="flex gap-2">
															<button
																className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
																onClick={() => window.open(doc.url, '_blank')}
															>
																<Eye className="w-4 h-4" />
																View
															</button>
															<a href={`${doc.url}`} download>
																<button
																	className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"

																>
																	<Download className="w-4 h-4" />
																	Download
																</button>
															</a>
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Previous Notes */}
								{verificationData?.notes && (
									<div className="space-y-2">
										<h4 className="font-medium text-gray-700">Previous Notes</h4>
										<div className="bg-gray-50 border rounded-lg p-3 text-sm">
											{verificationData?.notes.length === 0 && (
												<div className="text-gray-500 italic">No previous notes available.</div>
											)}
											{verificationData?.notes.map((note, index) => (
												<div key={index} className="border-b py-2">
													<div className="font-medium">{note.comment}</div>
													<div className="text-gray-400 text-xs">{new Date(note.createdAt).toLocaleDateString()} &middot; {note.reviewer.name}</div>
												</div>
											))}
											{!addingNote && <div>{newReviewNote}</div>}
											<div>

												{addingNote && (
													<div className="flex items-center gap-2">
														<textarea
															value={newReviewNote}
															onChange={(e) => setNewReviewNote(e.target.value)}
															className="flex-1 border border-gray-300 rounded-lg p-2"
															placeholder="Add your note here..."
														/>
													</div>
												)}
												<div className="flex items-center gap-3">
													{addingNote ? (
														<>
															<Button
																onClick={() => setAddingNote(false)}
																className="mt-2 text-sm bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-1"
															>
																<Plus className="w-4 h-4 inline" />
																Save
															</Button>
															<Button
																onClick={() => setAddingNote(false)}
																className="mt-2 text-sm bg-red-50 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg px-4 py-2 flex items-center gap-1"
															>
																<Minus className="w-4 h-4 inline" />
																Cancel
															</Button>
														</>
													) : (
														<Button
															onClick={() => setAddingNote(true)}
															className="mt-2 text-sm bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-1"
														>
															{newReviewNote ? <Pencil className="w-4 h-4 inline" /> : <Plus className="w-4 h-4 inline" />}

															{newReviewNote ? "Edit Note" : "Add Note"}
														</Button>
													)}
												</div>
											</div>
										</div>
									</div>
								)}

								{/* Feedback Templates & Custom Message Section */}
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<label className="block font-medium text-gray-700">
											Administrative Notes & Feedback
										</label>
										<div className="flex gap-2">
											<button
												onClick={() => setFeedback("")}
												className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
											>
												Clear
											</button>
										</div>
									</div>

									{/* Template Selection */}
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
										<div>
											<h4 className="font-medium text-green-700 mb-2 flex items-center gap-1">
												<CheckCircle className="w-4 h-4" />
												Approval Templates
											</h4>
											<div className="space-y-1">
												{getTemplatesByCategory('approve').map((template) => (
													<button
														key={template.id}
														onClick={() => applyTemplate(template)}
														className={`w-full text-left text-sm px-3 py-2 rounded transition-colors ${selectedTemplate === template.id
															? 'bg-green-100 text-green-800 font-medium'
															: 'text-green-700 hover:bg-green-100'
															}`}
													>
														{template.name}
													</button>
												))}
											</div>
										</div>

										<div>
											<h4 className="font-medium text-yellow-700 mb-2 flex items-center gap-1">
												<AlertCircle className="w-4 h-4" />
												Request Info Templates
											</h4>
											<div className="space-y-1">
												{getTemplatesByCategory('request').map((template) => (
													<button
														key={template.id}
														onClick={() => applyTemplate(template)}
														className={`w-full text-left text-sm px-3 py-2 rounded transition-colors ${selectedTemplate === template.id
															? 'bg-yellow-100 text-yellow-800 font-medium'
															: 'text-yellow-700 hover:bg-yellow-100'
															}`}
													>
														{template.name}
													</button>
												))}
											</div>
										</div>

										<div>
											<h4 className="font-medium text-red-700 mb-2 flex items-center gap-1">
												<XCircle className="w-4 h-4" />
												Rejection Templates
											</h4>
											<div className="space-y-1">
												{getTemplatesByCategory('reject').map((template) => (
													<button
														key={template.id}
														onClick={() => applyTemplate(template)}
														className={`w-full text-left text-sm px-3 py-2 rounded transition-colors ${selectedTemplate === template.id
															? 'bg-red-100 text-red-800 font-medium'
															: 'text-red-700 hover:bg-red-100'
															}`}
													>
														{template.name}
													</button>
												))}
											</div>
										</div>
									</div>

									{/* Custom Feedback Textarea */}
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium text-gray-600">
												Email Message Preview
											</span>
											{selectedTemplate && (
												<span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
													Template: {feedbackTemplates.find(t => t.id === selectedTemplate)?.name}
												</span>
											)}
										</div>
										<textarea
											id="feedback"
											value={feedback}
											onChange={(e) => {
												setFeedback(e.target.value);
												setSelectedTemplate(""); // Clear template selection when manually editing
											}}
											className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono"
											rows={12}
											placeholder="Select a template above or write a custom message. This will be sent as an email to the student."
										/>
										<div className="text-xs text-gray-500 flex items-center justify-between">
											<span>This message will be sent to {verificationData?.student?.email}</span>
											<span>{feedback.length} characters</span>
										</div>
									</div>

									{/* Email Subject Preview */}
									{selectedTemplate && (
										<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
											<div className="text-sm">
												<span className="font-medium text-blue-900">Email Subject: </span>
												<span className="text-blue-800">
													{feedbackTemplates.find(t => t.id === selectedTemplate)?.subject}
												</span>
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Actions */}
							<DialogFooter className="p-6 pt-4 border-t bg-gray-50 flex flex-col sm:flex-row gap-3">
								<div className="flex-1 flex flex-col sm:flex-row gap-3">
									<button
										onClick={() => handleAction('approve')}
										disabled={isProcessing || !!!feedbackTemplates.find(t => t.id === selectedTemplate && t.category === 'approve') || !feedback.trim()}
										className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
									>
										<CheckCircle className="w-4 h-4" />
										{isProcessing ? 'Processing...' : 'Approve Verification'}
									</button>
									<button
										onClick={() => handleAction('request')}
										disabled={isProcessing || !!!feedbackTemplates.find(t => t.id === selectedTemplate && t.category === 'request') || !feedback.trim()}
										className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
									>
										<AlertCircle className="w-4 h-4" />
										Request More Info
									</button>
									<button
										onClick={() => handleAction('reject')}
										disabled={isProcessing || !!!feedbackTemplates.find(t => t.id === selectedTemplate && t.category === 'reject') || !feedback.trim()}
										className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
									>
										<XCircle className="w-4 h-4" />
										Reject Application
									</button>
								</div>
								<button
									onClick={onClose}
									disabled={isProcessing}
									className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
								>
									Cancel
								</button>
							</DialogFooter>
						</div>
					)}
				</DialogContent>
			</Dialog>
		);
	};

export default StudentReviewModal;