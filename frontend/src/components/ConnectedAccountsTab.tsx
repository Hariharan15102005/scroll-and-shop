import React, { useState, useEffect } from 'react';
import { socialAccountsApi } from '../services/api';
import { ConnectedSocialAccount, SocialProviderConfig } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Video,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Unlink,
  ExternalLink,
  Plus,
  Globe,
  Share2,
} from 'lucide-react';

export const ConnectedAccountsTab: React.FC = () => {
  const { user } = useAuth();
  const [providers, setProviders] = useState<SocialProviderConfig[]>([]);
  const [myAccounts, setMyAccounts] = useState<ConnectedSocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectModalProvider, setConnectModalProvider] = useState<SocialProviderConfig | null>(null);
  const [handleInput, setHandleInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [provs, accs] = await Promise.all([
        socialAccountsApi.getProviders(),
        socialAccountsApi.getMyAccounts(),
      ]);
      setProviders(provs);
      setMyAccounts(accs);
    } catch (e) {
      console.warn('Could not load connected accounts data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: string) => {
    setActionLoading(true);
    setMessage(null);
    try {
      const handle = handleInput.trim() || `@${user?.username || 'creator'}`;
      await socialAccountsApi.connectAccount({
        provider,
        providerUsername: handle,
        providerDisplayName: user?.fullName || user?.username,
      });
      setMessage({
        type: 'success',
        text: `Successfully linked ${provider} account (${handle})! Cashback rewards have been applied if eligible.`,
      });
      setConnectModalProvider(null);
      setHandleInput('');
      await loadData();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to connect social account.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = async (provider: string) => {
    if (!confirm(`Are you sure you want to disconnect your ${provider} account?`)) return;
    setActionLoading(true);
    setMessage(null);
    try {
      await socialAccountsApi.disconnectAccount(provider);
      setMessage({
        type: 'success',
        text: `Disconnected ${provider} account and revoked platform permissions.`,
      });
      await loadData();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: 'Failed to disconnect account.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getProviderIcon = (prov: string) => {
    switch (prov) {
      case 'INSTAGRAM':
        return (
          <span className="font-extrabold text-xs text-pink-600 px-1 py-0.5 rounded bg-pink-50 border border-pink-200">
            IG
          </span>
        );
      case 'TIKTOK':
        return (
          <span className="font-extrabold text-xs text-black px-1 py-0.5 rounded bg-gray-100 border border-gray-300">
            TT
          </span>
        );
      case 'YOUTUBE':
        return (
          <span className="font-extrabold text-xs text-red-600 px-1 py-0.5 rounded bg-red-50 border border-red-200">
            YT
          </span>
        );
      case 'TWITTER':
        return (
          <span className="font-extrabold text-xs text-sky-600 px-1 py-0.5 rounded bg-sky-50 border border-sky-200">
            𝕏
          </span>
        );
      default:
        return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-5 space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-purple-700" />
          <h3 className="font-bold text-sm text-purple-950">
            Connected Accounts & Official Creator Integrations
          </h3>
        </div>
        <p className="text-xs text-purple-900 leading-relaxed">
          Link your official social accounts to showcase creator posts, tag shoppable products in your feed, and qualify for promotional cashback bonuses. Social account connection is completely optional.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Connected Accounts List */}
      <div className="space-y-3">
        <h4 className="font-bold text-sm text-gray-900">Your Connected Accounts</h4>
        {myAccounts.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center text-xs text-gray-400">
            You have no connected social accounts yet. Select a provider below to link your account.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myAccounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-white rounded-2xl p-4 border border-emerald-200 bg-emerald-50/20 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
                    {getProviderIcon(acc.provider)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-gray-900">{acc.providerUsername}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-[11px] text-gray-500">
                      Connected {new Date(acc.connectedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  disabled={actionLoading}
                  onClick={() => handleDisconnect(acc.provider)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Disconnect account"
                >
                  <Unlink className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Supported Providers */}
      <div className="space-y-3 pt-2">
        <h4 className="font-bold text-sm text-gray-900">Available Social Providers</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map((p) => {
            const isConnected = myAccounts.some((a) => a.provider === p.provider && a.status === 'CONNECTED');
            return (
              <div
                key={p.provider}
                className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
                        {getProviderIcon(p.provider)}
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-gray-900">{p.displayName}</h5>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            p.status === 'LIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.status === 'LIVE' ? 'Official API Live' : 'Sandbox Developer Mode'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">{p.description}</p>

                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[11px] text-gray-500 space-y-1">
                    <p className="font-semibold text-gray-700">Permissions Requested:</p>
                    <p>{p.permissionsExplanation}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  {p.cashbackRewardNote && (
                    <span className="text-[11px] font-semibold text-purple-700">
                      🎁 {p.cashbackRewardNote}
                    </span>
                  )}

                  {isConnected ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 ml-auto">
                      <CheckCircle2 className="w-4 h-4" /> Connected
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setConnectModalProvider(p);
                        setHandleInput(`@${user?.username || ''}`);
                      }}
                      className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm ml-auto flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Connect
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connect Modal */}
      {connectModalProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                {getProviderIcon(connectModalProvider.provider)}
                <h3 className="font-bold text-base text-gray-900">
                  Connect {connectModalProvider.displayName}
                </h3>
              </div>
              <button
                onClick={() => setConnectModalProvider(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Enter your public handle to initiate the official API connection flow. You will be redirected to verify your public creator handle.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Public Handle / Channel
              </label>
              <input
                type="text"
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                placeholder={`@${user?.username || 'handle'}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="p-3 bg-purple-50 text-purple-900 rounded-xl text-xs space-y-1">
              <p className="font-semibold">Privacy Commitment:</p>
              <p>We only read public posts tagged #ScrollAndShop. We never ask for your password or read private messages.</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConnectModalProvider(null)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleConnect(connectModalProvider.provider)}
                className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow-md disabled:opacity-50"
              >
                {actionLoading ? 'Connecting...' : 'Authorize & Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
