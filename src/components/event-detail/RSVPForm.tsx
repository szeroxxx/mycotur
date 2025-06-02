import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface RSVPFormData {
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
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const validateForm = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstName.trim()) {
      setSubmitError("Please enter your first name");
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      setSubmitError("Please enter a valid email address");
      return false;
    }

    return true;
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
        setFormData({
          firstName: "",
          phoneNumber: "",
          email: "",
          numberOfPeople: "1",
          message: "",
        });
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
    <div className="max-w-sm mx-auto  overflow-hidden">
      <div className="p-6 space-y-4 bg-[rgba(255,255,255)] rounded-xl shadow-lg border border-[rgba(244,242,242)]">
        <h2 className="text-xl font-semibold text-[rgba(68,63,63)] text-center mb-6">
          RSVP Now
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label
              htmlFor="firstName"
              className="text-sm font-medium text-[rgba(68,63,63)] mb-2 block"
            >
              First Name *
            </Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="John"
              className="text-[rgba(142,133,129)] w-full h-11 px-3 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgba(229,114,0)] focus:border-[rgba(229,114,0)]"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label
              htmlFor="phoneNumber"
              className="text-sm font-medium text-[rgba(68,63,63)] mb-2 block"
            >
              Phone Number *
            </Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              placeholder="enter your primary phone number"
              className="text-[rgba(142,133,129)] w-full h-11 px-3 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgba(229,114,0)] focus:border-[rgba(229,114,0)]"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label
              htmlFor="email"
              className="text-sm font-medium text-[rgba(68,63,63)] mb-2 block"
            >
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              className="text-[rgba(142,133,129)] w-full h-11 px-3 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgba(229,114,0)] focus:border-[rgba(229,114,0)]"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label
              htmlFor="numberOfPeople"
              className="text-sm font-medium text-[rgba(68,63,63)] mb-2 block"
            >
              How many People
            </Label>
            <Input
              id="numberOfPeople"
              name="numberOfPeople"
              type="number"
              min="1"
              placeholder="1"
              className="text-[rgba(142,133,129)] w-full h-11 px-3 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgba(229,114,0)] focus:border-[rgba(229,114,0)] text-center"
              value={formData.numberOfPeople}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label
              htmlFor="message"
              className="text-sm font-medium text-[rgba(68,63,63)] mb-2 block"
            >
              Tell us more
            </Label>
            <textarea
              id="message"
              name="message"
              placeholder="this message will directly shows to organiser"
              rows={3}
              className="text-[rgba(142,133,129)] w-full px-3 py-3 border border-gray-300 rounded-md text-sm placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[rgba(229,114,0)] focus:border-[rgba(229,114,0)]"
              value={formData.message}
              onChange={handleInputChange}
            />
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
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[rgba(229,114,0)] hover:bg-[#fdc48b] text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
          >
            {isSubmitting ? "Submitting..." : "Submit RSVP"}
          </Button>
        </form>
      </div>

      <div className="mt-2 px-6 py-6 bg-[rgba(255,255,255)] rounded-xl shadow-lg border border-[rgba(244,242,242)]">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 leading-tight">
          View organiser details and contact them for more information
        </h3>
        <Button
          variant="outline"
          className="w-full bg-[rgba(68,63,63)] text-[rgba(255,255,255)] hover:bg-gray-900 border-gray-800 py-3 font-medium rounded-md transition-colors"
          onClick={handleGetContactInfo}
        >
          Get Contact Information
        </Button>
      </div>
    </div>
  );
};

export default RSVPForm;
