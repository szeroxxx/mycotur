import React from 'react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" stroke="#EF4444" strokeWidth="4"/>
              <path d="M24 20V28" stroke="#EF4444" strokeWidth="4" strokeLinecap="round"/>
              <path d="M24 34H24.02" stroke="#EF4444" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[#111827] mb-2">Remove Event?</h3>
          <p className="text-sm text-[#6B7280] mb-6">
            Are you sure you want to remove this event? This action cannot be undone.
          </p>
          <div className="flex justify-center space-x-4 w-full">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#111827]"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Yes, Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};