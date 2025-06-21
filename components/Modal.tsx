
import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  primaryAction?: () => void;
  primaryActionText?: string;
  secondaryAction?: () => void;
  secondaryActionText?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  primaryAction,
  primaryActionText = "Confirm",
  secondaryAction,
  secondaryActionText = "Cancel"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-sky-400">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X size={24} />
          </button>
        </div>
        <div className="text-slate-300 mb-6">
          {children}
        </div>
        <div className="flex justify-end space-x-3">
          {secondaryAction && (
            <button
              onClick={secondaryAction}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
            >
              {secondaryActionText}
            </button>
          )}
          {primaryAction && (
             <button
                onClick={primaryAction}
                className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-md transition-colors"
            >
                {primaryActionText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
