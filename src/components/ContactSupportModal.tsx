import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle, AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthService from '../services/authService';

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  issueDescription: string;
}

interface CaseResponse {
  success: boolean;
  caseNumber?: string;
  error?: string;
  message?: string;
}

const ContactSupportModal: React.FC<ContactSupportModalProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    issueDescription: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [caseNumber, setCaseNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pre-populate form data for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      // Extract first and last name from full name
      const nameParts = user.name ? user.name.split(' ') : [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData(prev => ({
        ...prev,
        firstName,
        lastName,
        email: user.email || ''
      }));
    } else {
      // Reset form for non-authenticated users
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        issueDescription: ''
      });
    }
  }, [isAuthenticated, user]);

  // Reset modal state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setCaseNumber(null);
      setError(null);
      setFormData(prev => ({
        ...prev,
        issueDescription: '' // Always reset issue description
      }));
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.issueDescription.trim()) {
      setError('Issue description is required');
      return false;
    }
    if (formData.issueDescription.trim().length < 10) {
      setError('Please provide a more detailed description (at least 10 characters)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🎫 Creating support case...');
      
      // Prepare case data
      const caseData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        subject: `VoltRide Support Request from ${formData.firstName} ${formData.lastName}`,
        description: formData.issueDescription.trim(),
        priority: 'Medium',
        origin: 'Web',
        type: 'Support Request',
        product: 'VoltRide',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        userId: user?.id || null
      };

      // Submit to Salesforce API
      const authService = AuthService.getInstance();
      const response = await authService.makeAuthenticatedRequest('/services/apexrest/voltride/createcase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(caseData),
      });

      const result: CaseResponse = await response.json();
      
      if (response.ok && result.success && result.caseNumber) {
        console.log('✅ Support case created successfully:', result.caseNumber);
        setCaseNumber(result.caseNumber);
        setSubmitted(true);
      } else {
        throw new Error(result.error || result.message || 'Failed to create support case');
      }
    } catch (err) {
      console.error('❌ Error creating support case:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unable to submit support request. Please try again later.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleNewRequest = () => {
    setSubmitted(false);
    setCaseNumber(null);
    setError(null);
    setFormData(prev => ({
      ...prev,
      issueDescription: ''
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Contact Support</h3>
              <p className="text-sm text-gray-600">We're here to help you</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted && caseNumber ? (
            /* Success State */
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Request Submitted Successfully!</h4>
              <p className="text-gray-600 mb-4">
                Your support request has been created and our team will get back to you soon.
              </p>
              
              {/* Case Number Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="text-sm text-blue-600 font-medium">Case Number</div>
                <div className="text-xl font-bold text-blue-800">{caseNumber}</div>
                <div className="text-xs text-blue-600 mt-1">
                  Please save this number for your records
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleNewRequest}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Another Request
                </button>
                <button
                  onClick={handleClose}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* Form State */
            <>
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 font-medium">Error</p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your first name"
                    disabled={loading}
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your last name"
                    disabled={loading}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                    disabled={loading}
                    required
                  />
                </div>

                {/* Issue Description */}
                <div>
                  <label htmlFor="issueDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Description *
                  </label>
                  <textarea
                    id="issueDescription"
                    value={formData.issueDescription}
                    onChange={(e) => handleInputChange('issueDescription', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Please describe your issue in detail..."
                    disabled={loading}
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Minimum 10 characters ({formData.issueDescription.length}/10)
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.firstName || !formData.lastName || !formData.email || !formData.issueDescription}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Submit Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Help Text */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h5 className="text-sm font-medium text-gray-900 mb-2">What happens next?</h5>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• You'll receive a case number for tracking</li>
                  <li>• Our support team will review your request</li>
                  <li>• We'll respond within 24 hours</li>
                  <li>• Updates will be sent to your email</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactSupportModal;