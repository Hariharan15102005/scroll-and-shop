import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { cashbackApi } from '../services/api';
import { CashbackOverview, CashbackCampaign, CashbackTransaction } from '../types';
import {
  Coins,
  Clock,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Gift,
  ArrowUpRight,
  Filter,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CashbackPage: React.FC = () => {
  const { user, isAuthenticated, requireAuth } = useAuth();
  const [overview, setOverview] = useState<CashbackOverview | null>(null);
  const [campaigns, setCampaigns] = useState<CashbackCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REVERSED'>('ALL');
  const [claimLoading, setClaimLoading] = useState<number | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        const data = await cashbackApi.getOverview();
        setOverview(data);
        setCampaigns(data.activeCampaigns);
      } else {
        const camps = await cashbackApi.getCampaigns();
        setCampaigns(camps);
      }
    } catch (e) {
      console.warn('Could not load cashback data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = (camp: CashbackCampaign) => {
    requireAuth(
      async () => {
        setClaimLoading(camp.id);
        setClaimSuccess(null);
        setClaimError(null);
        try {
          const res = await cashbackApi.claimReward(camp.id, `Claimed via web dashboard`);
          setClaimSuccess(res.message);
          await loadData();
        } catch (err: any) {
          setClaimError(err?.response?.data?.message || 'Unable to claim campaign reward.');
        } finally {
          setClaimLoading(null);
        }
      },
      `claim the "${camp.title}" cashback reward`,
      {
        actionType: 'CLAIM_CASHBACK',
        payload: { campaignId: camp.id },
      }
    );
  };

  const filteredTransactions = overview?.recentTransactions.filter((tx) => {
    if (statusFilter === 'ALL') return true;
    return tx.status === statusFilter;
  }) || [];

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-8 text-white shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-yellow-100 mb-4">
            <Coins className="w-4 h-4" />
            <span>Scroll & Shop Cashback Rewards</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Earn Verified Cashback on Every Order & Social Post
          </h1>
          <p className="text-sm sm:text-base text-orange-100 mt-3 leading-relaxed">
            Get 5% automatic cashback on storewide purchases, claim creator bounties, and earn bonus rewards when you share your favorite items.
          </p>
        </div>
      </div>

      {/* Guest Callout Banner if not authenticated */}
      {!isAuthenticated && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl text-amber-800">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-amber-950 text-sm">Browsing Cashback as a Guest</h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Sign in to view your real-time wallet balance, claim active campaign rewards, and track pending earnings.
              </p>
            </div>
          </div>
          <button
            onClick={() => requireAuth(() => {}, 'access your cashback wallet')}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl text-xs shadow hover:shadow-md transition-all whitespace-nowrap"
          >
            Sign In / Sign Up
          </button>
        </div>
      )}

      {/* Wallet Balance Cards (Authenticated) */}
      {isAuthenticated && overview && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Available */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Available Balance</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Coins className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">
              ${overview.availableBalance.toFixed(2)}
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready to redeem on your next checkout
            </p>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Pending Cashback</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-amber-600">
              ${overview.pendingBalance.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-2">
              Approved 7 days after order delivery
            </p>
          </div>

          {/* Lifetime Earned */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Lifetime Earned</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-purple-700">
              ${overview.lifetimeEarned.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-2">
              Total cashback rewarded to date
            </p>
          </div>
        </div>
      )}

      {/* Claim Success / Error Messages */}
      {claimSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{claimSuccess}</span>
        </div>
      )}
      {claimError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{claimError}</span>
        </div>
      )}

      {/* Active Cashback Campaigns */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Gift className="w-5 h-5 text-orange-500" />
              Active Cashback Campaigns
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Participate in verified promotional activities to boost your cashback wallet.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-100 text-orange-700">
                    {camp.badgeText || `${camp.rewardValue}% BACK`}
                  </span>
                  <span className="text-[11px] text-gray-400 uppercase font-semibold">
                    {camp.activityType}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-sm">{camp.title}</h3>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{camp.description}</p>
                {camp.terms && (
                  <p className="text-[11px] text-gray-400 mt-2 italic bg-gray-50 p-2 rounded-lg">
                    Terms: {camp.terms}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100">
                {camp.hasClaimed ? (
                  <div className="w-full py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Reward Claimed
                  </div>
                ) : (
                  <button
                    disabled={claimLoading === camp.id}
                    onClick={() => handleClaimReward(camp)}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {claimLoading === camp.id ? 'Claiming...' : 'Claim Reward'}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transparent Rules & Eligibility Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
          <Info className="w-5 h-5 text-indigo-600" />
          How the Scroll & Shop Cashback Program Works
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600 leading-relaxed">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5">
            <span className="font-bold text-gray-900 block text-sm">1. 5% Purchase Rewards</span>
            <p>
              Calculated automatically on eligible storewide product orders. Credited as <strong>PENDING</strong> immediately after verified checkout.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5">
            <span className="font-bold text-gray-900 block text-sm">2. 7-Day Return Window</span>
            <p>
              Rewards transition to <strong>APPROVED</strong> after the 7-day return policy passes. If an order is refunded or cancelled, the pending reward is reversed.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5">
            <span className="font-bold text-gray-900 block text-sm">3. Verified Social Rewards</span>
            <p>
              Earn welcome bonuses and unboxing bounties when you link approved creator accounts or submit verified product reviews.
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Ledger (Authenticated) */}
      {isAuthenticated && overview && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Cashback Transaction Ledger</h3>
              <p className="text-xs text-gray-500 mt-0.5">Immutable audit record of all earned and pending cashback.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
              {(['ALL', 'APPROVED', 'PENDING', 'REVERSED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    statusFilter === st
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              No cashback transactions found under the {statusFilter.toLowerCase()} filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50/70 text-gray-700 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Date</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right rounded-r-lg">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{tx.description}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-[11px]">{tx.referenceId || '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-bold whitespace-nowrap ${
                          tx.status === 'REVERSED'
                            ? 'text-gray-400 line-through'
                            : 'text-emerald-600'
                        }`}
                      >
                        +${tx.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
