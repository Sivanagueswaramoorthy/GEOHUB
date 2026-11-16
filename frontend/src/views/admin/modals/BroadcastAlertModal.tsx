import React, { useState } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { Chip } from '../ui/Chip';

export interface BroadcastAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: { title: string; message: string; urgency: 'normal' | 'urgent' }) => void;
}

export const BroadcastAlertModal: React.FC<BroadcastAlertModalProps> = ({
  isOpen,
  onClose,
  onSend,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSending(true);
    try {
      onSend({ title: title.trim(), message: message.trim(), urgency });
      setTitle('');
      setMessage('');
      setUrgency('normal');
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Dispatch Campus Broadcast">
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        <div>
          <label className="block text-xs font-semibold text-[#051F20] mb-1">
            Broadcast Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Campus Wi-Fi Scheduled Maintenance"
            className="w-full h-11 px-3.5 bg-[#F7FAF8] border border-[#E3EEE6] rounded-xl text-sm font-medium focus:outline-none focus:border-[#8EB69B]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#051F20] mb-1">
            Urgency Level
          </label>
          <div className="flex items-center gap-2">
            <Chip
              label="Normal Notice"
              selected={urgency === 'normal'}
              onClick={() => setUrgency('normal')}
            />
            <Chip
              label="Urgent Alert"
              selected={urgency === 'urgent'}
              onClick={() => setUrgency('urgent')}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#051F20] mb-1">
            Message Body
          </label>
          <textarea
            required
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write clear, concise announcement details for all active mobile devices..."
            className="w-full p-3 bg-[#F7FAF8] border border-[#E3EEE6] rounded-xl text-xs font-medium focus:outline-none focus:border-[#8EB69B]"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={sending || !title.trim() || !message.trim()}
            className="w-full min-h-[44px] h-11 rounded-xl bg-[#051F20] hover:bg-[#163832] disabled:opacity-50 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <span>📢</span>
            <span>{sending ? 'Dispatching Broadcast...' : 'Dispatch Alert to All Devices'}</span>
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};

export default BroadcastAlertModal;

