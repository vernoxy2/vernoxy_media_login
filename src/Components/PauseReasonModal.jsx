import React, { useState } from 'react';
import { X } from 'lucide-react';

const PauseReasonModal = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const predefinedReasons = [
    'Break',
    'Meeting',
    'Urgent Task',
    'Technical Issue',
    'Waiting for Client Response',
    'Other'
  ];

  const handleConfirm = () => {
    const finalReason = reason === 'Other' ? customReason : reason;
    if (!finalReason.trim()) {
      alert('Please provide a reason for pausing');
      return;
    }
    onConfirm(finalReason);
    setReason('');
    setCustomReason('');
  };

  const handleClose = () => {
    setReason('');
    setCustomReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Pause Timer</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Please select a reason for pausing the timer:
          </p>

          {/* Predefined Reasons */}
          <div className="space-y-2">
            {predefinedReasons.map((r) => (
              <label
                key={r}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">{r}</span>
              </label>
            ))}
          </div>

          {/* Custom Reason Input */}
          {reason === 'Other' && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Reason
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter your reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows="3"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason || (reason === 'Other' && !customReason.trim())}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Pause
          </button>
        </div>
      </div>
    </div>
  );
};

export default PauseReasonModal;