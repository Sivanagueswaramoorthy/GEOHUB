import React from 'react';
import { Megaphone, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  broadcastTitle: string;
  setBroadcastTitle: (val: string) => void;
  broadcastMessage: string;
  setBroadcastMessage: (val: string) => void;
  broadcastPriority: string;
  setBroadcastPriority: (val: string) => void;
  broadcastSubmitting: boolean;
  onSend: (e: React.FormEvent) => Promise<void>;
}

export const BroadcastAlertModal: React.FC<Props> = ({
  isOpen,
  onClose,
  broadcastTitle,
  setBroadcastTitle,
  broadcastMessage,
  setBroadcastMessage,
  broadcastPriority,
  setBroadcastPriority,
  broadcastSubmitting,
  onSend,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border border-[#DAF1DE] shadow-2xl w-full max-w-md p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#DAF1DE] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Megaphone size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#051F20]">Campus Push Broadcast</h3>
              <p className="text-xs text-[#235347]">Send real-time alert to all student and faculty devices</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSend} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-[#163832] mb-1">Alert Title</label>
            <input
              type="text"
              required
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              placeholder="e.g. Weather Advisory or Hackathon Commenced"
              className="w-full px-3.5 py-2 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#163832] mb-1">Alert Message</label>
            <textarea
              required
              rows={3}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Provide clear, concise alert details..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#8EB69B] bg-white text-xs text-[#051F20] font-medium focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#163832] mb-1">Priority Level</label>
            <div className="flex gap-2">
              {['urgent', 'normal'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setBroadcastPriority(p)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold uppercase transition capitalize cursor-pointer border ${
                    broadcastPriority === p
                      ? 'bg-[#163832] text-white border-[#163832]'
                      : 'bg-[#F6FBF7] text-[#235347] border-[#DAF1DE]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#DAF1DE]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={broadcastSubmitting}
              className="px-5 py-2 rounded-xl bg-[#163832] hover:bg-[#235347] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Megaphone size={14} />
              <span>{broadcastSubmitting ? 'Broadcasting...' : 'Dispatch Alert'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
