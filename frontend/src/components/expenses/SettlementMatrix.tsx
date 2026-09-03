'use client';

import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { SuggestedSettlement, MemberBalance } from '../../types';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { SettlePaymentModal } from './SettlePaymentModal';

interface SettlementMatrixProps {
  tripId: string;
  currency: string;
  memberBalances: MemberBalance[];
  suggestedSettlements: SuggestedSettlement[];
  canEdit: boolean;
  onSettlementCompleted: () => void;
}

export const SettlementMatrix: React.FC<SettlementMatrixProps> = ({
  tripId,
  currency,
  memberBalances,
  suggestedSettlements,
  canEdit,
  onSettlementCompleted,
}) => {
  const [selectedSettlement, setSelectedSettlement] = useState<SuggestedSettlement | null>(null);

  return (
    <div className="space-y-6">
      {/* Balances Ledger Strip */}
      <Card className="p-5 bg-slate-900 border-slate-800">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
          Individual Net Balances
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {memberBalances.map((mb) => {
            const isOwed = mb.net_balance > 0.01;
            const owes = mb.net_balance < -0.01;

            return (
              <div
                key={mb.user_id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Avatar src={mb.avatar_url} name={mb.user_name} size="sm" />
                  <div>
                    <span className="text-xs font-bold text-slate-200">{mb.user_name}</span>
                    <p className="text-[10px] text-slate-400">
                      Paid: {currency} {Number(mb.total_paid).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-bold ${
                      isOwed
                        ? 'text-emerald-400'
                        : owes
                        ? 'text-red-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {isOwed
                      ? `+${currency} ${Number(mb.net_balance).toFixed(2)}`
                      : owes
                      ? `-${currency} ${Math.abs(Number(mb.net_balance)).toFixed(2)}`
                      : 'Settled'}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {isOwed ? 'Receivable' : owes ? 'Owes group' : 'All square'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Optimized Debt Reduction Settlement Plan */}
      <Card className="p-5 bg-slate-900 border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-950 border border-blue-600/30 text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                Optimized Settlement Transactions
              </h3>
              <p className="text-[11px] text-slate-400">
                Greedy minimum cash flow algorithm eliminates circular debt between members.
              </p>
            </div>
          </div>
        </div>

        {suggestedSettlements.length === 0 ? (
          <div className="py-8 text-center text-xs text-emerald-400 font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            All trip expenses are currently completely balanced & settled!
          </div>
        ) : (
          <div className="space-y-3">
            {suggestedSettlements.map((s, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Avatar src={s.payer_avatar} name={s.payer_name} size="sm" />
                    <span className="text-xs font-bold text-slate-200">{s.payer_name}</span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                    <span className="hidden sm:inline">pays</span>
                    <ArrowRight className="w-4 h-4 text-blue-400" />
                  </div>

                  <div className="flex items-center gap-2">
                    <Avatar src={s.receiver_avatar} name={s.receiver_name} size="sm" />
                    <span className="text-xs font-bold text-slate-200">{s.receiver_name}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span className="text-sm font-extrabold text-white">
                    {s.currency} {Number(s.amount).toFixed(2)}
                  </span>

                  {canEdit && (
                    <Button
                      size="sm"
                      variant="teal"
                      onClick={() => setSelectedSettlement(s)}
                      className="text-xs font-bold"
                    >
                      Record Settlement
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Settle Modal */}
      {selectedSettlement && (
        <SettlePaymentModal
          isOpen={!!selectedSettlement}
          onClose={() => setSelectedSettlement(null)}
          tripId={tripId}
          settlement={selectedSettlement}
          onSettlementRecorded={() => {
            setSelectedSettlement(null);
            onSettlementCompleted();
          }}
        />
      )}
    </div>
  );
};
