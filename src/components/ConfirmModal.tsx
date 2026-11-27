import React from 'react';
import { RotateCcw } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#1F2430]/40 backdrop-blur-[2px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-xl max-w-sm w-full p-6">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
          <RotateCcw className="w-6 h-6" />
        </div>
        <h2
          id="confirm-modal-title"
          className="font-display text-xl font-bold text-[#1F2430] mb-2"
        >
          {title}
        </h2>
        <p className="text-sm text-[#5C6475] leading-relaxed mb-6">{message}</p>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#1F2430] bg-[#F4F1EA] hover:bg-[#EAE5DB] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Keep Drawing
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#E03131] hover:bg-[#C92A2A] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
