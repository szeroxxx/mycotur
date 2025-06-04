import React from "react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactInfo: {
    email: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
}

const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  contactInfo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[rgb(68,63,63)]">
            Contact Information
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(68,63,63)]">
              Email
            </label>
            <div className="w-full p-1 text-[rgb(68,63,63)]">
              {contactInfo.email || "Not provided"}
            </div>
          </div>{" "}
          <div>
            <label className="block text-sm font-medium text-[rgb(68,63,63)]">
              Facebook
            </label>
            <div className="w-full p-1 text-[rgb(68,63,63)] ">
              {contactInfo.facebook ? (
                <a
                  href={contactInfo.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D45B20] hover:underline"
                >
                  {contactInfo.facebook}
                </a>
              ) : (
                "Not provided"
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[rgb(68,63,63)] mb-1">
              Instagram
            </label>
            <div className="w-full p-1 text-[rgb(68,63,63)]">
              {contactInfo.instagram ? (
                <a
                  href={contactInfo.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D45B20] hover:underline"
                >
                  {contactInfo.instagram}
                </a>
              ) : (
                "Not provided"
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[rgb(68,63,63)] mb-1">
              YouTube
            </label>
            <div className="w-full p-1 text-[rgb(68,63,63)]">
              {contactInfo.youtube ? (
                <a
                  href={contactInfo.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D45B20] hover:underline"
                >
                  {contactInfo.youtube}
                </a>
              ) : (
                "Not provided"
              )}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <button
            onClick={onClose}
            className="cursor-pointer w-full px-4 py-2 text-[rgba(68,63,63)] rounded-lg text-sm border border-[rgba(199,195,193)] font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
