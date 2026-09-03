'use client';

import React, { useState } from 'react';
import { Check, DollarSign } from 'lucide-react';
import { SuggestedSettlement } from '../../types';
import { expenseService } from '../../services/expenseService';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface SettlePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  settlement: SuggestedSettlement;
  onSettlementRecorded: () => void;
}

export const SettlePaymentModal: React.FC<SettlePaymentModalProps> = ({
  isOpen,
  onClose,
  tripId,
  settlement,
  onSettlementRecorded,
}) => {
  const [amount, setAmount] = useState(settlement.amount.toString());
  const [notes, setNotes] = useState(`Settlement transfer from ${settlement.payer_name} to ${settlement.receiver_name}`);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await expenseService.recordSettlement({
        trip_id: tripId,
        receiver_id: settlement.receiver_id,
        amount: parseFloat(amount) || settlement.amount,
        currency: settlement.currency,
        notes,
      });

      onSettlementRecorded();
    } catch (err: any) {
      alert(err.message || 'Failed to record settlement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Debt Settlement"
      subtitle={`Settle balance with ${settlement.receiver_name}`}
      maxWidth="md"
    >
      <form onSubmit={handleConfirm} className="space-y-4">
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold">Transfer</span>
            <h4 className="text-sm font-bold text-white mt-0.5">
              {settlement.payer_name} → {settlement.receiver_name}
            </h4>
          </div>
          <span className="text-lg font-extrabold text-emerald-400">
            {settlement.currency} {Number(settlement.amount).toFixed(2)}
          </span>
        </div>

        <Input
          label={`Settlement Amount (${settlement.currency})`}
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <Input
          label="Notes / Payment Method"
          placeholder="e.g. Venmo / Cash / Bank Transfer"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading} className="gap-1.5 bg-emerald-600 hover:bg-emerald-500">
            <Check className="w-3.5 h-3.5" />
            Confirm Settlement
          </Button>
        </div>
      </form>
    </Modal>
  );
};
