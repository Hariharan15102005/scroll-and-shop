import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { socialAccountsApi } from '../services/api';
import { SocialProviderConfig, ConnectedSocialAccount } from '../types';
import { X, Sparkles, Check, ArrowRight, ShieldCheck, Video, AlertCircle } from 'lucide-react';

export const SocialOnboardingModal: React.FC = () => {
  const { isSocialOnboardingOpen, closeSocialOnboarding, user } = useAuth();
  const [providers, setProviders] = useState<SocialProviderConfig[]>([]);
  const [myAccounts, setMyAccounts] = useState<ConnectedSocialAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [customHandle, setCustomHandle] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isSocialOnboardingOpen) {
      loadData();
    }
  }, [isSocialOnboardingOpen]);

  const loadData = async () => {
    try {
      const [provs, accs] = await Promise.all([
        socialAccountsApi.getProviders(),
        socialAccountsApi.getMyAccounts(),
      ]);
      setProviders(provs);
      setMyAccounts(accs);
    } catch (e) {
      console.warn('Could not load social providers', e);
    }
  };

  if (!isSocialOnboardingOpen) return null;

  const isConnected = (pName: string) => myAccounts.some((a) => a.provider === pName && a.status === 'CONNECTED');

  const handleConnect = async (provider: string) => {
    setLoading(true);
    setSuccessMessage(null);
    try {
      const handle = customHandle.trim() || `@${user?.username || 'user'}`;
      await socialAccountsApi.connectAccount({
        provider,
        providerUsername: handle,
        providerDisplayName: user?.fullName || user?.username,
      });
      setSuccessMessage(`Successfully connected ${provider} account! Welcome cashback reward is being processed.`);
      setConnectingProvider(null);
      setCustomHandle('');
      await loadData();
    } catch (err) {
      console.error('Failed to connect social account', err);
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (prov: string) => {
    switch (prov) {
      case 'INSTAGRAM':
        return <span className="font-black text-xs text-pink-600 px-1 py-0.5 rounded bg-pink-50 border border-pink-200">IG</span>;
      case 'TIKTOK':
        return <span className="font-black text-xs text-black px-1 py-0.5 rounded bg-gray-100 border border-gray-300">TT</span>;
      case 'YOUTUBE':
        return <span className="font-black text-xs text-red-600 px-1 py-0.5 rounded bg-red-50 border border-red-200">YT</span>;
      case 'TWITTER':
        return <span className="font-black text-xs text-sky-600 px-1 py-0.5 rounded bg-sky-50 border border-sky-200">𝕏</span>;
      default:
        return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 p-6 text-white relative">
          <button
            onClick={closeSocialOnboarding}
            className="absolute top-4 right-4 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="text-xs uppercase tracking-wider font-semibold text-yellow-200">
              Optional Onboarding
            </span>
          </div>
          <h2 className="text-xl font-bold">Connect Social Account & Discover Cashback</h2>
          <p className="text-xs text-purple-100 mt-1">
            Link your creator or social profiles to unlock exclusive creator cashback rewards, tag shoppable items, and share with your audience.
          </p>
        </div>

        {/* Notice: 100% Optional */}
        <div className="bg-purple-50 px-6 py-2.5 border-b border-purple-100 flex items-center gap-2 text-xs text-purple-900">
          <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0" />
          <span>
            <strong>100% Optional:</strong> You can skip this step at any time and still browse, shop, and checkout normally.
          </span>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {providers.map((p) => {
              const connected = isConnected(p.provider);
              const isSelected = connectingProvider === p.provider;

              return (
                <div
                  key={p.provider}
                  className={`p-4 rounded-xl border transition-all ${
                    connected
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : isSelected
                      ? 'border-indigo-400 bg-indigo-50/30 ring-2 ring-indigo-200'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                        {getProviderIcon(p.provider)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900">{p.displayName}</h4>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            p.status === 'LIVE'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {p.status === 'LIVE' ? 'Official API Live' : 'Sandbox Mode'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">{p.description}</p>

                  {p.cashbackRewardNote && (
                    <div className="mt-2 text-[11px] font-medium text-purple-700 bg-purple-50/80 px-2 py-1 rounded">
                      🎁 {p.cashbackRewardNote}
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                    {connected ? (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Connected
                      </span>
                    ) : isSelected ? (
                      <div className="w-full space-y-2 mt-1">
                        <input
                          type="text"
                          value={customHandle}
                          onChange={(e) => setCustomHandle(e.target.value)}
                          placeholder={`Your @${p.provider.toLowerCase()}_handle`}
                          className="w-full px-2.5 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleConnect(p.provider)}
                            className="flex-1 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium"
                          >
                            {loading ? 'Connecting...' : 'Authorize & Connect'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConnectingProvider(null)}
                            className="px-2 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setConnectingProvider(p.provider);
                          setCustomHandle(`@${user?.username || ''}`);
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        Connect <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-700">🔒 Official API & Privacy Protection:</p>
            <p>
              Scroll & Shop only accesses approved public profile handles and tagged media. We never request your password, and we never access private messages or private posts.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={closeSocialOnboarding}
            className="text-xs font-semibold text-gray-600 hover:text-gray-900"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={closeSocialOnboarding}
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm"
          >
            Done & Start Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
