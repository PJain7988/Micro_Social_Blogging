import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { useToast } from '../ui/Toast';
import { ShieldAlert } from 'lucide-react';

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, postId }) => {
  const [reason, setReason] = useState('Spam or Scam');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const categories = [
    'Spam or Scam',
    'Hate Speech & Harassment',
    'Misinformation or False News',
    'Explicit or Sensitive Content',
    'Impersonation or Copyright Infringement',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.reportPost(postId, reason, note);
      showToast('Thank you for reporting. Our moderation team has been notified.', 'success');
      onClose();
    } catch {
      showToast('Failed to submit report. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report Post">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-2 text-danger bg-red-50 p-3 rounded-xl border border-red-200">
          <ShieldAlert size={20} className="shrink-0" />
          <p className="text-xs font-medium">
            Help us maintain a safe community. Reports are reviewed by human moderators and our AI safety system.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-mute uppercase tracking-wide">
            Select Violation Category
          </label>
          <div className="space-y-1.5">
            {categories.map((cat) => (
              <label
                key={cat}
                className="flex items-center space-x-3 p-2.5 rounded-lg border border-line hover:bg-paper cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="reportReason"
                  checked={reason === cat}
                  onChange={() => setReason(cat)}
                  className="text-accent focus:ring-accent"
                />
                <span className="text-sm font-medium text-ink">{cat}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-mute uppercase tracking-wide">
            Additional Details (Optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Provide context to help moderators understand the issue..."
            rows={3}
            className="w-full rounded-lg border border-line bg-surface p-2.5 text-sm text-ink placeholder-mute focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-2 border-t border-line">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" isLoading={isSubmitting}>
            Submit Report
          </Button>
        </div>
      </form>
    </Modal>
  );
};
