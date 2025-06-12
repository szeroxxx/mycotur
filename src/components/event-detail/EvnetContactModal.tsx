import React from "react";
import { GoMail } from "react-icons/go";
import { FaWhatsapp } from "react-icons/fa";
import { LuExternalLink } from "react-icons/lu";

interface EventsContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactInfo: {
    email: string;
    phone?: string;
    link?: string;
  };
  title: string;
}

const EventsContactModal: React.FC<EventsContactModalProps> = ({
  isOpen,
  onClose,
  contactInfo,
  title,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[rgb(68,63,63)]">
            Datos de contacto del organizador
          </h2>
        </div>

        <div className="space-y-4">
          {contactInfo.email && (
            <div>
              <label className="block text-sm font-medium text-[rgb(68,63,63)]">
                Correo electrónico
              </label>
              <div className="flex items-center w-full p-1 text-[rgb(68,63,63)]">
                <GoMail className="mr-1 h-5 w-5 " />
                {contactInfo.email}
              </div>
            </div>
          )}
          {contactInfo.phone && (
            <div>
              <label className="block text-sm font-medium text-[rgb(68,63,63)]">
                Número de teléfono
              </label>
              <div className="flex items-center w-full p-1 text-[rgb(68,63,63)]">
                <FaWhatsapp className="mr-1 h-5 w-5 text-[#D45B20]" />
                <a
                  href={`https://wa.me/${contactInfo.phone.replace(
                    /\s+/g,
                    ""
                  )}?text=${encodeURIComponent(
                    `Hola, estoy interesado en la actividad "${title}". ¿Podrías darme más información?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D45B20] hover:underline"
                >
                  {contactInfo.phone}
                </a>
              </div>
            </div>
          )}
          {contactInfo.link && (
            <div>
              <label className="block text-sm font-medium text-[rgb(68,63,63)] mb-1">
                Página web o redes sociales
              </label>
              <div className="flex items-center w-full p-1 text-[rgb(68,63,63)]">
                <LuExternalLink className="mr-1 h-5 w-5 text-[#D45B20]" />
                <a
                  href={contactInfo.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D45B20] hover:underline"
                >
                  {contactInfo.link}
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-[rgba(68,63,63)] rounded-lg text-sm border border-[rgba(199,195,193)] font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventsContactModal;
