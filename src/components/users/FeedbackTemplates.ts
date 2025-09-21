export interface FeedbackTemplate {
	id: string;
	name: string;
	category: 'approve' | 'reject' | 'request';
	subject: string;
	template: string;
	variables?: string[];
}

export const feedbackTemplates: FeedbackTemplate[] = [
	// Approval Templates
	{
		id: 'approve_standard',
		name: 'Standard Approval',
		category: 'approve',
		subject: 'Student Verification Approved',
		template: `Hi {{studentName}},

Congratulations! Your student verification has been successfully approved.

Your student account is now verified and you have access to all student benefits and discounts. Your verification will remain active until your expected graduation date.

If you have any questions, please don't hesitate to contact our support team.

Best regards,
Student Verification Team`
	},
	{
		id: 'approve_expedited',
		name: 'Expedited Approval',
		category: 'approve',
		subject: 'Student Verification Approved - Expedited Processing',
		template: `Hi {{studentName}},

Your student verification has been approved through our expedited review process.

All documents were clear and met our verification standards. Your account is now active with full student privileges.

Thank you for providing complete documentation.

Best regards,
Student Verification Team`
	},

	// Request More Info Templates
	{
		id: 'request_document_quality',
		name: 'Document Quality Issues',
		category: 'request',
		subject: 'Additional Documentation Required - Student Verification',
		template: `Hi {{studentName}},

Thank you for submitting your student verification request. We need some additional information to complete your verification:

DOCUMENT QUALITY ISSUES:
• Some uploaded documents are unclear or difficult to read
• Please ensure all documents are high-resolution and clearly visible
• Text and photos should be sharp and legible

NEXT STEPS:
Please re-upload the following documents with improved quality:
• Student ID card (front and back, if applicable)
• Official enrollment verification letter

You can submit updated documents through your account dashboard. Processing typically takes 2-3 business days after receiving clear documentation.

If you need assistance with document submission, please contact our support team.

Best regards,
Student Verification Team`
	},
	{
		id: 'request_missing_docs',
		name: 'Missing Required Documents',
		category: 'request',
		subject: 'Missing Documents - Student Verification',
		template: `Hi {{studentName}},

We have received your student verification request, but some required documents are missing:

REQUIRED DOCUMENTS NEEDED:
• Official enrollment verification letter (must be current semester)
• Valid student ID card showing current academic year
• Official transcript (unofficial transcripts are acceptable)

DOCUMENT REQUIREMENTS:
• All documents must be current and from your registered institution
• Documents should clearly show your name, student ID, and enrollment status
• File formats accepted: PDF, JPG, PNG (max 5MB per file)

Please upload the missing documents through your account dashboard. Once received, we'll process your verification within 2-3 business days.

Contact support if you need help obtaining any required documents.

Best regards,
Student Verification Team`
	},
	{
		id: 'request_information_mismatch',
		name: 'Information Verification',
		category: 'request',
		subject: 'Information Verification Required',
		template: `Hi {{studentName}},

We're reviewing your student verification and need to clarify some information:

INFORMATION TO VERIFY:
• Student ID number on documents doesn't match your profile
• Program/major information appears different between documents
• Enrollment dates need confirmation

NEXT STEPS:
Please provide:
1. Confirmation of your correct student ID number
2. Updated enrollment verification showing current program
3. Contact information for your registrar's office for verification

This additional step helps us ensure accurate verification and protects against fraudulent applications.

Please respond within 5 business days to avoid processing delays.

Best regards,
Student Verification Team`
	},

	// Rejection Templates
	{
		id: 'reject_invalid_docs',
		name: 'Invalid Documentation',
		category: 'reject',
		subject: 'Student Verification Declined - Invalid Documentation',
		template: `Hi {{studentName}},

After careful review, we are unable to approve your student verification request.

REASON FOR DECLINE:
• Submitted documents do not meet our verification standards
• Documents appear to be altered, expired, or from unaccredited institutions
• Unable to verify authenticity through official channels

WHAT THIS MEANS:
• Your account will remain unverified
• You will not have access to student discounts or benefits
• You may reapply after addressing the documentation issues

REAPPLICATION PROCESS:
If you believe this decision was made in error or if you can provide valid documentation, you may submit a new verification request after 30 days with:
• Official, unaltered documents from an accredited institution
• Current enrollment verification
• Valid student identification

For questions about this decision, please contact our verification appeals team.

Best regards,
Student Verification Team`
	},
	{
		id: 'reject_expired_enrollment',
		name: 'Expired Enrollment',
		category: 'reject',
		subject: 'Student Verification Declined - Enrollment Status',
		template: `Hi {{studentName}},

We are unable to approve your student verification request at this time.

REASON FOR DECLINE:
• Your enrollment status appears to be expired or inactive
• Documents provided show enrollment from a previous semester
• Unable to confirm current active student status

NEXT STEPS:
If you are currently enrolled:
• Obtain current enrollment verification from your registrar
• Ensure all documents reflect your current academic status
• Submit a new verification request with updated documentation

If you are no longer enrolled:
• Student verification is only available for currently enrolled students
• You may reapply when you resume your studies

For assistance with enrollment verification, contact your institution's registrar office.

Best regards,
Student Verification Team`
	},
	{
		id: 'reject_fraudulent',
		name: 'Fraudulent Application',
		category: 'reject',
		subject: 'Student Verification Declined - Policy Violation',
		template: `Hi {{studentName}},

Your student verification request has been declined due to policy violations.

REASON FOR DECLINE:
• Submitted documentation appears fraudulent or altered
• Information provided does not match institutional records
• This decision is final and cannot be appealed

ACCOUNT STATUS:
• Your account has been flagged for fraudulent verification attempt
• Future verification requests from this account will be automatically declined
• This action may affect your ability to use our platform

If you believe this decision was made in error, you must contact our legal compliance team with official documentation from your institution's registrar office.

Best regards,
Student Verification Team`
	}
];