import React from "react";
import { BsPersonX } from "react-icons/bs";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center z-50">
      <div className="bg-[rgba(255,255,255)] rounded-lg p-6 shadow-lg max-w-sm w-full">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 bg-[rgba(254,242,242)] rounded-full p-4">
            <BsPersonX size={25} className="text-[rgba(220,38,38)]" />
          </div>
          <h3 className="text-xl font-semibold text-[#111827] mb-2">
            ¿Quieres eliminar este agente?
          </h3>
          <p className="text-sm text-[#6B7280] mb-6">
            Esta acción no se puede deshacer. ¿Estás segura de que
            deseas eliminarlo?
          </p>
          <div className="flex justify-center space-x-4 w-full">
            <button
              onClick={onClose}
              className="cursor-pointer flex-1 basis-[120px] px-4 py-2 text-sm font-medium text-[rgba(68,63,63)] hover:text-[#111827] border border-[rgba(199,195,193)] rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="cursor-pointer flex-1 basis-[120px] px-4 py-2 text-sm font-medium bg-[rgba(220,38,38)] hover:bg-red-600 text-[rgba(255,255,255)] border border-[rgba(199,195,193)] rounded-lg transition-colors"
            >
              Eliminar agente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
