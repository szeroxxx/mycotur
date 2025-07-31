import React from "react";
import { GoMail } from "react-icons/go";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { SlSocialYoutube } from "react-icons/sl";

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
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[rgb(68,63,63)]">
            Datos de contacto del organizador
          </h2>
        </div>

        <div className="space-y-4 overflow-hidden"
>
          {contactInfo.email && (
            <div>
              <label className="block text-sm font-medium text-[rgb(68,63,63)]">
                Correo electrónico
              </label>
              <div className="flex items-start w-full p-1 text-[rgb(68,63,63)]">
                <GoMail className="mr-1 h-5 w-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm break-all leading-5">{contactInfo.email}</span>
              </div>
            </div>
          )}
          {contactInfo.facebook && (
            <div>
              <label className="block text-sm font-medium text-[rgb(68,63,63)]">
                Facebook
              </label>
              <div className="flex items-start w-full p-1 text-[rgb(68,63,63)]">
                <FaFacebookF className="mr-1 h-5 w-5 text-[#D45B20] flex-shrink-0 mt-0.5" />
                <a
                  href={contactInfo.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D45B20] hover:underline break-all text-sm leading-5"
                >
                  {contactInfo.facebook}
                </a>
              </div>
            </div>
          )}
          {contactInfo.instagram && (
            <div>
              <label className="block text-sm font-medium text-[rgb(68,63,63)] mb-1">
                Instagram
              </label>
              <div className="flex items-start w-full p-1 text-[rgb(68,63,63)]">
                <FaInstagram className="mr-1 h-5 w-5 text-[#D45B20] flex-shrink-0 mt-0.5" />
                <a
                  href={contactInfo.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D45B20] hover:underline break-all text-sm leading-5"
                >
                  {contactInfo.instagram}
                </a>
              </div>
            </div>
          )}
          {contactInfo.youtube && (
            <div>
              <label className="block text-sm font-medium text-[rgb(68,63,63)] mb-1">
                YouTube
              </label>
              <div className="flex items-start w-full p-1 text-[rgb(68,63,63)]">
                <SlSocialYoutube className="mr-1 h-5 w-5 text-[#D45B20] flex-shrink-0 mt-0.5" />
                <a
                  href={contactInfo.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D45B20] hover:underline break-all text-sm leading-5"
                >
                  {contactInfo.youtube}
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3">
          <button
            onClick={onClose}
            className="cursor-pointer w-full px-4 py-2 text-[rgba(68,63,63)] rounded-lg text-sm border border-[rgba(199,195,193)] font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
