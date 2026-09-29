import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Shield, Users, Heart, Save, CheckCircle2, Lock, Share2, Sparkles, ArrowRight, MapPin, Store, Phone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ConnectedAccountsTab } from '../components/ConnectedAccountsTab';
import { AddressManagementTab } from '../components/AddressManagementTab';

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'PROFILE' | 'ADDRESSES' | 'CONNECTED_ACCOUNTS'>('PROFILE');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPersonalizationEnabled, setIsPersonalizationEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      sessionStorage.setItem('auth_redirect', '/profile');
      navigate('/login', {
        state: {
          returnUrl: '/profile',
          actionDescription: 'manage your profile, settings, and addresses',
        },
      });
      return;
    }
    setFullName(user.fullName || '');
    setBio(user.bio || '');
    setAvatarUrl(user.avatarUrl || '');
    setEmail(user.email || '');
    setPhoneNumber(user.phoneNumber || '');
    setIsPersonalizationEnabled(user.isPersonalizationEnabled ?? true);
  }, [isAuthenticated, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await updateProfile({
        fullName,
        bio,
        avatarUrl,
        email,
        phoneNumber,
        isPersonalizationEnabled,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="main-content" style={{ maxWidth: '850px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <img
            src={avatarUrl || user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
            alt={user.username}
            className="w-20 h-20 rounded-full object-cover border-2 border-orange-400 shadow-sm"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.fullName || user.username}</h2>
            <div className="text-xs text-orange-600 font-semibold mb-1">@{user.username}</div>
            <div className="flex items-center gap-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                {user.role} ACCOUNT
              </span>
              {user.role === 'CREATOR' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
                  <Store size={12} /> VERIFIED SELLER
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('ADDRESSES')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all"
          >
            <MapPin size={14} /> Saved Addresses
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 ${
            activeTab === 'PROFILE'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Profile &amp; Privacy
        </button>
        <button
          onClick={() => setActiveTab('ADDRESSES')}
          className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'ADDRESSES'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Delivery Addresses
        </button>
        <button
          onClick={() => setActiveTab('CONNECTED_ACCOUNTS')}
          className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'CONNECTED_ACCOUNTS'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Share2 className="w-4 h-4" />
          Connected Accounts
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold mb-6 flex items-center gap-2">
          <CheckCircle2 size={16} /> Profile changes saved successfully!
        </div>
      )}

      {activeTab === 'CONNECTED_ACCOUNTS' ? (
        <ConnectedAccountsTab />
      ) : activeTab === 'ADDRESSES' ? (
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
          <AddressManagementTab />
        </div>
      ) : (
        /* Edit Profile Form */
        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-2">Account Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Contact Phone Number</label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 9876543210"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Avatar Image URL</label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Bio / Creator Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {/* Privacy & Transparency Controls */}
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Shield size={16} className="text-orange-500" /> Privacy &amp; Personalization Controls
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Scroll &amp; Shop uses a transparent, rule-based algorithm that weights product views, likes, and purchases.
              We <strong>never</strong> analyze your private chat messages or external accounts for ad targeting.
            </p>

            <label className="flex items-start gap-3 cursor-pointer bg-gray-50 p-4 rounded-xl border border-gray-200">
              <input
                type="checkbox"
                checked={isPersonalizationEnabled}
                onChange={(e) => setIsPersonalizationEnabled(e.target.checked)}
                className="mt-1 rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
              />
              <div>
                <div className="font-bold text-xs text-gray-900">Enable Smart Product Personalization</div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  When enabled, your feed and gift suggestions are tuned to your browsing categories.
                </div>
              </div>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? 'Saving Changes...' : <><Save size={14} /> Save Profile Settings</>}
          </button>
        </form>
      )}
    </div>
  );
};
