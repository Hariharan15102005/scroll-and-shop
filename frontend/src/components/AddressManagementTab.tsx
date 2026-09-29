import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit2, Check, ShieldCheck, Home, Briefcase, Tag } from 'lucide-react';
import { addressApi } from '../services/api';
import { Address, AddressRequest } from '../types';

export const AddressManagementTab: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);

  // Form State
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressType, setAddressType] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');
  const [houseNumber, setHouseNumber] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const list = await addressApi.getAddresses();
      setAddresses(list);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddModal = () => {
    setEditingAddressId(null);
    setRecipientName('');
    setPhone('');
    setAddressType('HOME');
    setHouseNumber('');
    setBuildingName('');
    setStreet('');
    setArea('');
    setLandmark('');
    setCity('');
    setDistrict('');
    setState('');
    setPostalCode('');
    setCountry('India');
    setIsDefault(addresses.length === 0);
    setError(null);
    setShowAddModal(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddressId(addr.id);
    setRecipientName(addr.recipientName);
    setPhone(addr.phone);
    setAddressType(addr.addressType || 'HOME');
    setHouseNumber(addr.houseNumber);
    setBuildingName(addr.buildingName || '');
    setStreet(addr.street);
    setArea(addr.area);
    setLandmark(addr.landmark || '');
    setCity(addr.city);
    setDistrict(addr.district || '');
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setCountry(addr.country || 'India');
    setIsDefault(addr.isDefault);
    setError(null);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !phone.trim() || !houseNumber.trim() || !street.trim() || !area.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      setError('Please fill in all required address fields.');
      return;
    }

    const payload: AddressRequest = {
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      addressType,
      houseNumber: houseNumber.trim(),
      buildingName: buildingName.trim() || undefined,
      street: street.trim(),
      area: area.trim(),
      landmark: landmark.trim() || undefined,
      city: city.trim(),
      district: district.trim() || undefined,
      state: state.trim(),
      postalCode: postalCode.trim(),
      country,
      isDefault,
    };

    try {
      setIsSaving(true);
      setError(null);
      if (editingAddressId) {
        await addressApi.updateAddress(editingAddressId, payload);
      } else {
        await addressApi.addAddress(payload);
      }
      setShowAddModal(false);
      await fetchAddresses();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save address.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this saved delivery address?')) {
      await addressApi.deleteAddress(id);
      await fetchAddresses();
    }
  };

  const handleSetDefault = async (id: number) => {
    await addressApi.setDefaultAddress(id);
    await fetchAddresses();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
        <div>
          <h3 className="font-bold text-sm text-gray-900">Your Saved Delivery Addresses</h3>
          <p className="text-xs text-gray-500">Manage your shipping locations for fast, 1-click checkout.</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-1.5"
        >
          <Plus size={15} /> Add New Address
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-xs text-gray-400">Loading saved addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-gray-600">No saved addresses found</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Add an address now so you can breeze through checkout.</p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-3 px-4 py-1.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg text-xs font-bold hover:bg-orange-100 transition-colors"
          >
            + Add First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-4 rounded-2xl border transition-all ${
                addr.isDefault
                  ? 'border-orange-300 bg-amber-50/40 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700">
                  {addr.addressType === 'HOME' ? <Home size={10} /> : addr.addressType === 'WORK' ? <Briefcase size={10} /> : <Tag size={10} />}
                  {addr.addressType}
                </span>
                {addr.isDefault && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Check size={10} /> Default Address
                  </span>
                )}
              </div>

              <div className="font-bold text-sm text-gray-900">{addr.recipientName}</div>
              <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                {addr.houseNumber}, {addr.buildingName ? `${addr.buildingName}, ` : ''}{addr.street}, {addr.area}
                {addr.landmark ? `, Near ${addr.landmark}` : ''}, {addr.city}, {addr.state} - {addr.postalCode}, {addr.country}
              </div>
              <div className="text-xs text-gray-500 mt-1 font-medium">Phone: {addr.phone}</div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-xs">
                <div>
                  {!addr.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-orange-600 hover:text-orange-700 font-semibold"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openEditModal(addr)}
                    className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(addr.id)}
                    className="text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-gray-900 mb-1">
              {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">Complete recipient and location details for seamless delivery.</p>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-medium mb-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Address Type</label>
                <div className="flex gap-2">
                  {(['HOME', 'WORK', 'OTHER'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAddressType(t)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold border ${
                        addressType === t
                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">House / Flat No. *</label>
                  <input
                    type="text"
                    required
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    placeholder="e.g. 42B"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Building Name (Optional)</label>
                  <input
                    type="text"
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
                    placeholder="e.g. Palm Residency"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Street / Road *</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. 12th Main Road"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Area / Locality *</label>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Indiranagar"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Karnataka"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="560038"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                />
                <span>Set as default delivery address</span>
              </label>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-xs font-bold shadow hover:shadow-md transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
