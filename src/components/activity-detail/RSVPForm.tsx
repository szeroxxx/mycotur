import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RSVPFormData {
  firstName: string;
  phoneNumber: string;
  email: string;
  numberOfPeople: string;
  message: string;
}

interface RSVPFormProps {
  onSubmit?: (data: RSVPFormData) => Promise<void>;
  onGetContactInfo?: () => void;
  error?: string | null;
}

const RSVPForm: React.FC<RSVPFormProps> = ({
  onSubmit,
  onGetContactInfo,
  error = null,
}) => {
  const [formData, setFormData] = useState<RSVPFormData>({
    firstName: "",
    phoneNumber: "",
    email: "",
    numberOfPeople: "1",
    message: "",
  });

  const [submitError, setSubmitError] = useState<string | null>(error);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string | null}>({});

  // Validation functions
  const validateFirstName = (name: string): string | null => {
    if (!name.trim()) {
      return "First name is required";
    }
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      return "First name should only contain letters and spaces";
    }
    if (name.trim().length < 2) {
      return "First name should be at least 2 characters long";
    }
    if (name.trim().length > 50) {
      return "First name should not exceed 50 characters";
    }
    return null;
  };

  const validatePhoneNumber = (phone: string): string | null => {
    if (!phone.trim()) {
      return "Phone number is required";
    }
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return "Phone number should be at least 10 digits";
    }
    if (cleanPhone.length > 15) {
      return "Phone number should not exceed 15 digits";
    }
    // Allow common phone number formats
    if (!/^[\d\s\-\(\)\+]+$/.test(phone)) {
      return "Phone number contains invalid characters";
    }
    return null;
  };

  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    if (email.length > 254) {
      return "Email address is too long";
    }
    return null;
  };

  const validateNumberOfPeople = (num: string): string | null => {
    if (!num.trim()) {
      return "Number of people is required";
    }
    const number = parseInt(num);
    if (isNaN(number)) {
      return "Please enter a valid number";
    }
    if (number < 1) {
      return "Number of people must be at least 1";
    }
    if (number > 100) {
      return "Number of people cannot exceed 100";
    }
    return null;
  };

  const validateMessage = (message: string): string | null => {
    if (message.length > 500) {
      return "Message should not exceed 500 characters";
    }
    return null;
  };

  const validateField = (name: string, value: string) => {
    let error: string | null = null;
    
    switch (name) {
      case 'firstName':
        error = validateFirstName(value);
        break;
      case 'phoneNumber':
        error = validatePhoneNumber(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'numberOfPeople':
        error = validateNumberOfPeople(value);
        break;
      case 'message':
        error = validateMessage(value);
        break;
    }

    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));

    return error === null;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Special handling for different field types
    let processedValue = value;
    
    if (name === 'firstName') {
      // Only allow letters and spaces, remove other characters
      processedValue = value.replace(/[^a-zA-Z\s]/g, '');
    } else if (name === 'phoneNumber') {
      // Allow digits, spaces, hyphens, parentheses, and plus sign
      processedValue = value.replace(/[^\d\s\-\(\)\+]/g, '');
    } else if (name === 'numberOfPeople') {
      // Only allow digits
      processedValue = value.replace(/[^\d]/g, '');
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Validate field on change
    validateField(name, processedValue);
    
    // Clear any previous submit error when user starts typing
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string | null} = {};
    let isValid = true;

    // Validate all fields
    const firstNameError = validateFirstName(formData.firstName);
    if (firstNameError) {
      errors.firstName = firstNameError;
      isValid = false;
    }

    const phoneError = validatePhoneNumber(formData.phoneNumber);
    if (phoneError) {
      errors.phoneNumber = phoneError;
      isValid = false;
    }

    const emailError = validateEmail(formData.email);
    if (emailError) {
      errors.email = emailError;
      isValid = false;
    }

    const peopleError = validateNumberOfPeople(formData.numberOfPeople);
    if (peopleError) {
      errors.numberOfPeople = peopleError;
      isValid = false;
    }

    const messageError = validateMessage(formData.message);
    if (messageError) {
      errors.message = messageError;
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (onSubmit) {
        await onSubmit(formData);
        setSubmitSuccess(true);
        // Reset form after successful submission
        setFormData({
          firstName: "",
          phoneNumber: "",
          email: "",
          numberOfPeople: "1",
          message: "",
        });
        setFieldErrors({});
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit RSVP"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetContactInfo = () => {
    console.log("Get contact info clicked");
    if (onGetContactInfo) {
      onGetContactInfo();
    }
  };

  return (
    <div className="max-w-sm mx-auto overflow-hidden">
      {/* Main Form Section */}
      <div className="p-6 space-y-4 bg-white rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-700 text-center mb-6">
          RSVP Now
        </h2>

        <div className="space-y-4">
          <div>
            <Label
              htmlFor="firstName"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              First Name *
            </Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="John"
              className={`text-gray-600 w-full h-11 px-3 border rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                fieldErrors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
            {fieldErrors.firstName && (
              <div className="text-red-500 text-xs mt-1">{fieldErrors.firstName}</div>
            )}
          </div>

          <div>
            <Label
              htmlFor="phoneNumber"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Phone Number *
            </Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              placeholder="enter your primary phone number"
              className={`text-gray-600 w-full h-11 px-3 border rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                fieldErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
            />
            {fieldErrors.phoneNumber && (
              <div className="text-red-500 text-xs mt-1">{fieldErrors.phoneNumber}</div>
            )}
          </div>

          <div>
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Email *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              className={`text-gray-600 w-full h-11 px-3 border rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                fieldErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            {fieldErrors.email && (
              <div className="text-red-500 text-xs mt-1">{fieldErrors.email}</div>
            )}
          </div>

          <div>
            <Label
              htmlFor="numberOfPeople"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              How many People *
            </Label>
            <Input
              id="numberOfPeople"
              name="numberOfPeople"
              placeholder="1"
              className={`text-gray-600 w-full h-11 px-3 border rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-center ${
                fieldErrors.numberOfPeople ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.numberOfPeople}
              onChange={handleInputChange}
              required
            />
            {fieldErrors.numberOfPeople && (
              <div className="text-red-500 text-xs mt-1">{fieldErrors.numberOfPeople}</div>
            )}
          </div>

          <div>
            <Label
              htmlFor="message"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Tell us more
              <span className="text-xs text-gray-500 ml-2">
                ({formData.message.length}/500)
              </span>
            </Label>
            <textarea
              id="message"
              name="message"
              placeholder="this message will directly shows to organiser"
              rows={3}
              className={`text-gray-600 w-full px-3 py-3 border rounded-md text-sm placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                fieldErrors.message ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.message}
              onChange={handleInputChange}
            />
            {fieldErrors.message && (
              <div className="text-red-500 text-xs mt-1">{fieldErrors.message}</div>
            )}
          </div>

          {submitError && (
            <div className="text-red-500 text-sm mt-2">{submitError}</div>
          )}

          {submitSuccess && (
            <div className="text-green-500 text-sm mt-2">
              RSVP submitted successfully!
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit RSVP"}
          </Button>
        </div>
      </div>

      <div className="mt-2 px-6 py-6 bg-white rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 leading-tight">
          View organiser details and contact them for more information
        </h3>
        <Button
          variant="outline"
          className="w-full bg-gray-700 text-white hover:bg-gray-900 border-gray-800 py-3 font-medium rounded-md transition-colors"
          onClick={handleGetContactInfo}
        >
          Get Contact Information
        </Button>
      </div>
    </div>
  );
};

export default RSVPForm;