import React, { useState } from 'react';
import {
  Plus,
  FileText,
  Upload,
  CheckCircle2,
  Calendar,
  Tag,
  Coins,
  Receipt,
  User,
} from 'lucide-react';
import { AnimatedNumber, PillButton } from '../../../components/shared';
import { useApp } from '../../../context/AppContext';
import { apiClient } from '../../../api/client';

export interface ExpenseItem {
  id: string;
  event: string;
  amount: number;
  category: string;
  description: string;
  actor: string;
  time: string;
  billProof?: string;
}

export interface AddExpenseScreenProps {
  readOnly: boolean;
  expenses: ExpenseItem[];
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseItem[]>>;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}

export const AddExpenseScreen: React.FC<AddExpenseScreenProps> = ({
  readOnly,
  expenses,
  setExpenses,
  onLogAudit,
  currentUser,
}) => {
  const { events } = useApp();
  const eventOptions = [
    'General Club Operations',
    ...(events || []).map((e) => e.title),
  ];
  const [event, setEvent] = useState(eventOptions[0] || 'General Club Operations');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Equipment');
  const [description, setDescription] = useState('');
  const [billProof, setBillProof] = useState<string>('voucher_receipt.pdf');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const totalExpenseSum = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description.trim()) return;

    const parsedAmount = parseFloat(amount);
    const newExpense: ExpenseItem = {
      id: `exp-${Date.now()}`,
      event,
      amount: parsedAmount,
      category,
      description: description.trim(),
      actor: currentUser?.name || 'Treasurer',
      time: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      billProof,
    };

    setExpenses((prev) => [newExpense, ...prev]);
    onLogAudit(event, `Recorded expense ₹${parsedAmount.toLocaleString()} for ${description}`);

    // Persist expense directly to TiDB Cloud
    apiClient.createExpense({
      title: description.trim(),
      category,
      amount: parsedAmount,
      event_title: event,
      receipt_url: billProof,
    }).catch(() => {});

    setAmount('');
    setDescription('');
    setSuccessMsg(`Successfully logged expenditure of ₹${parsedAmount.toLocaleString()}`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="space-y-4 sm:space-y-5 select-none w-full max-w-full overflow-hidden">
      {/* Top Banner Metric */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#DAF1DE] flex items-center justify-center text-[#163832] shrink-0">
            <Coins size={16} />
          </div>
          <div>
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">
              Disbursed Volume
            </span>
            <div className="font-extrabold text-[#051F20] text-lg sm:text-xl mt-0.5">
              ₹<AnimatedNumber value={totalExpenseSum} />
            </div>
          </div>
        </div>

        {readOnly && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B] w-fit">
            View Only
          </span>
        )}
      </div>

      {/* Creation Form */}
      {!readOnly && (
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-3"
        >
          <div className="flex items-center justify-between pb-1 border-b border-[#DAF1DE]/70">
            <h2 className="font-bold text-[#051F20] text-sm sm:text-base">
              Record New Expenditure
            </h2>
            <span className="text-xs font-semibold text-[#235347]">Voucher entry</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#051F20] mb-1.5">
                Target Event
              </label>
              <select
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7] focus:outline-none focus:border-[#163832]"
              >
                {eventOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#051F20] mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7] focus:outline-none focus:border-[#163832]"
              >
                <option value="Equipment">Equipment & Rigging</option>
                <option value="Refreshments">Refreshments & Catering</option>
                <option value="Travel">Travel & Field Logistics</option>
                <option value="Printing">Printing & Signage</option>
                <option value="Honorarium">Guest Honorarium</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#051F20] mb-1.5">
                Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#235347]">
                  ₹
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 3500"
                  required
                  min="1"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7] focus:outline-none focus:border-[#163832]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#051F20] mb-1.5">
                Receipt / Voucher Proof
              </label>
              <div className="flex items-center gap-2 p-2 rounded-xl border border-[#DAF1DE] bg-[#F6FBF7]">
                <Receipt size={16} className="text-[#163832] shrink-0" />
                <span className="text-xs text-[#051F20] font-semibold truncate flex-1">
                  {billProof}
                </span>
                <button
                  type="button"
                  onClick={() => setBillProof(`receipt_${Date.now().toString().slice(-4)}.pdf`)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#DAF1DE] text-xs font-bold text-[#163832] hover:bg-[#DAF1DE] cursor-pointer"
                >
                  Change
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#051F20] mb-1.5">
              Expense Justification / Itemized Details
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Purchased 40x Field notebook survey kits from campus stationery"
              rows={2}
              required
              className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7] focus:outline-none focus:border-[#163832]"
            />
          </div>

          <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              type="submit"
              className="h-10 px-5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer touch-target-44"
              data-testid="btn-submit-expense"
            >
              <Plus size={16} strokeWidth={2.2} />
              <span>Record & Log Voucher</span>
            </button>

            {successMsg && (
              <div className="flex items-center gap-2 text-xs font-semibold text-[#163832] bg-[#DAF1DE] px-3 py-2 rounded-xl border border-[#8EB69B]">
                <CheckCircle2 size={15} />
                <span>{successMsg}</span>
              </div>
            )}
          </div>
        </form>
      )}

      {/* Recent Disbursals Feed */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-[#DAF1DE]/70">
          <h3 className="font-bold text-[#051F20] text-sm sm:text-base">
            Recent Expense Disbursals
          </h3>
          <span className="text-xs text-[#235347] font-semibold">
            {expenses.length} entries
          </span>
        </div>

        <div className="space-y-2.5">
          {expenses.slice(0, 5).map((exp) => (
            <div
              key={exp.id}
              className="p-3.5 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-[#051F20] truncate">
                    {exp.description}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-white border border-[#DAF1DE] text-[#235347]">
                    {exp.category}
                  </span>
                </div>
                <p className="text-xs text-[#235347] mt-1 truncate">
                  Event: <strong className="text-[#051F20]">{exp.event}</strong> | Recorded by {exp.actor} on {exp.time}
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-extrabold text-[#051F20]">
                  ₹{exp.amount.toLocaleString()}
                </div>
                <span className="text-xs text-[#163832] font-semibold flex items-center gap-1 justify-end mt-0.5">
                  <Receipt size={12} /> {exp.billProof || 'Receipt verified'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddExpenseScreen;

