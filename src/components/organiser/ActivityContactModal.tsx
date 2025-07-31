import React from "react";
import { GoMail } from "react-icons/go";
import { LuExternalLink } from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
interface ActivityContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactInfo: {
    email: string;
    phone?: string;
    link?: string;
  };
  title: string;
}

const ActivityContactModal: React.FC<ActivityContactModalProps> = ({
  isOpen,
  onClose,
  contactInfo,
  title,
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
                    `Hola, he visto vuestra actividad en Ávila Mycotour y me interesa realizar "${title}". ¿Podrías darme más información? Gracias!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D45B20] hover:underline break-all text-sm"
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
              <div className="flex items-start w-full p-1 text-[rgb(68,63,63)]">
                <LuExternalLink className="mr-1 text-[#D45B20] h-5 w-5 flex-shrink-0 mt-0.5" />{" "}
                <a
                  href={contactInfo.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D45B20] hover:underline leading-5 break-all text-sm"
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

export default ActivityContactModal;
