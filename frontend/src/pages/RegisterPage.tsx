import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PasswordInputWithStrength } from '../components/PasswordInputWithStrength';
import {
  User,
  Store,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Check,
  Info,
} from 'lucide-react';

const InstagramIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

type AccountType = 'CUSTOMER' | 'SELLER';
type Step = 1 | 2 | 3 | 4 | 5 | 6;

const INTEREST_OPTIONS = [
  'Electronics & Gadgets',
  'Fashion & Apparel',
  'Home & Living',
  'Gaming',
  'Fitness & Sports',
  'Beauty & Skincare',
  'Food & Lifestyle',
  'Books & Education',
  'Travel',
  'Other',
];

const FEED_OPTIONS = [
  { id: 'BALANCED', label: 'A balanced mix of shopping & social' },
  { id: 'VIDEOS', label: 'Shopping videos and creator demos' },
  { id: 'FRIENDS', label: 'Friends’ shopping activity and wishlists' },
  { id: 'REVIEWS', label: 'In-depth product reviews & ratings' },
  { id: 'DEALS', label: 'Daily deals, discounts & flash sales' },
];

const COUNTRY_CODES = [
  { code: '+91', label: '+91 (India)' },
  { code: '+1', label: '+1 (US/Canada)' },
  { code: '+44', label: '+44 (UK)' },
  { code: '+61', label: '+61 (Australia)' },
  { code: '+971', label: '+971 (UAE)' },
  { code: '+65', label: '+65 (Singapore)' },
  { code: '+49', label: '+49 (Germany)' },
];

export const RegisterPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [accountType, setAccountType] = useState<AccountType>('CUSTOMER');

  // Step 2: Account Details
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreeGuidelines, setAgreeGuidelines] = useState(true);
  const [agreePrivacy, setAgreePrivacy] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  // Step 3 (Customer): Delivery Address
  const [hasAddress, setHasAddress] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [addressPhone, setAddressPhone] = useState('');
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
  const [isDefaultAddress, setIsDefaultAddress] = useState(true);

  // Step 3 (Seller): Business Details
  const [storeName, setStoreName] = useState('');
  const [storeHandle, setStoreHandle] = useState('');
  const [businessType, setBusinessType] = useState('Individual / Sole Proprietor');
  const [businessCategory, setBusinessCategory] = useState('Electronics & Gadgets');
  const [storeDescription, setStoreDescription] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [operatingRegion, setOperatingRegion] = useState('National');
  const [shippingPreference, setShippingPreference] = useState('Standard / Scroll Logistics');
  const [returnPolicy, setReturnPolicy] = useState('7-Day Easy Returns & Replacements');

  // Step 4: Personalization
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Electronics & Gadgets', 'Home & Living']);
  const [feedPreference, setFeedPreference] = useState('A balanced mix of shopping & social');
  const [preferredBrands, setPreferredBrands] = useState('');
  const [preferredPriceRange, setPreferredPriceRange] = useState('$$ (Mid-Range & Best Value)');

  // Step 5: Social Connection
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [instagramHandle, setInstagramHandle] = useState('');
  const [isConnectingInstagram, setIsConnectingInstagram] = useState(false);

  // Status & loading
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSimulateInstagramConnect = () => {
    setIsConnectingInstagram(true);
    setTimeout(() => {
      setInstagramConnected(true);
      setInstagramHandle(`@${username || 'shopper'}_official`);
      setIsConnectingInstagram(false);
    }, 800);
  };

  const validateStep2 = () => {
    if (!fullName.trim()) return 'Full Name is required.';
    if (!username.trim() || username.length < 3) return 'Username must be at least 3 characters.';
    if (!phoneNumber.trim()) return 'Mobile number is required.';
    if (!isPasswordValid) return 'Please provide a strong password meeting all criteria.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    if (!agreeTerms || !agreeGuidelines || !agreePrivacy)
      return 'Please accept the Terms of Use, Community Guidelines, and Privacy Policy.';
    return null;
  };

  const validateStep3 = () => {
    if (accountType === 'CUSTOMER') {
      if (hasAddress) {
        if (!houseNumber.trim() || !street.trim() || !area.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
          return 'Please complete all required address fields or uncheck saving address for now.';
        }
      }
      return null;
    } else {
      if (!storeName.trim()) return 'Store Name is required.';
      if (!storeHandle.trim()) return 'Unique store handle is required.';
      if (!businessAddress.trim()) return 'Business address is required.';
      return null;
    }
  };

  const handleNextStep = () => {
    setError(null);
    if (currentStep === 2) {
      const err = validateStep2();
      if (err) {
        setError(err);
        return;
      }
      if (!recipientName) setRecipientName(fullName);
      if (!addressPhone) setAddressPhone(`${countryCode} ${phoneNumber}`);
      if (!businessEmail) setBusinessEmail(email);
      if (!businessPhone) setBusinessPhone(`${countryCode} ${phoneNumber}`);
      if (!storeName) setStoreName(`${fullName}'s Store`);
      if (!storeHandle) setStoreHandle(username.toLowerCase().replace(/[^a-z0-9_-]/g, '') + '-store');
    } else if (currentStep === 3) {
      const err = validateStep3();
      if (err) {
        setError(err);
        return;
      }
    }
    setCurrentStep((prev) => Math.min(6, (prev + 1) as Step) as Step);
  };

  const handlePrevStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(1, (prev - 1) as Step) as Step);
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setError(null);

    const fullPhoneNumber = `${countryCode} ${phoneNumber.trim()}`;

    const addressPayload =
      accountType === 'CUSTOMER' && hasAddress && street.trim()
        ? {
            recipientName: recipientName.trim() || fullName.trim(),
            phone: addressPhone.trim() || fullPhoneNumber,
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
            country: country || 'India',
            isDefault: isDefaultAddress,
          }
        : undefined;

    const sellerPayload =
      accountType === 'SELLER'
        ? {
            storeName: storeName.trim(),
            storeHandle: storeHandle.trim().toLowerCase(),
            businessType,
            businessCategory,
            storeDescription: storeDescription.trim() || undefined,
            businessEmail: businessEmail.trim() || email || undefined,
            businessPhone: businessPhone.trim() || fullPhoneNumber,
            businessAddress: businessAddress.trim(),
            pickupAddress: pickupAddress.trim() || businessAddress.trim(),
            operatingRegion,
            shippingPreference,
            returnPolicy,
          }
        : undefined;

    try {
      await register({
        username: username.trim(),
        email: email.trim() || undefined,
        fullName: fullName.trim(),
        password,
        confirmPassword,
        agreeTerms: true,
        bio: bio.trim() || (accountType === 'SELLER' ? `Official store of ${storeName}` : undefined),
        phoneNumber: fullPhoneNumber,
        accountType,
        address: addressPayload,
        sellerDetails: sellerPayload,
        interests: selectedInterests,
        feedPreference,
        preferredBrands: preferredBrands.trim() || undefined,
        preferredPriceRange,
        connectedInstagramHandle: instagramConnected ? instagramHandle : undefined,
      });

      setRegistrationSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Please review your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishAndExplore = () => {
    const redirectPath = sessionStorage.getItem('auth_redirect') || '/';
    sessionStorage.removeItem('auth_redirect');
    navigate(redirectPath);
  };

  const stepsHeader = [
    { num: 1, label: 'Account Type' },
    { num: 2, label: 'Account Details' },
    { num: 3, label: accountType === 'CUSTOMER' ? 'Delivery Address' : 'Store Setup' },
    { num: 4, label: 'Personalization' },
    { num: 5, label: 'Social' },
    { num: 6, label: 'Review' },
  ];

  return (
    <div style={{ maxWidth: '680px', margin: '32px auto', padding: '0 20px', fontFamily: 'inherit' }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#111' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                background: '#ff9900',
                color: 'white',
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '22px',
                boxShadow: '0 2px 6px rgba(255,153,0,0.3)',
              }}
            >
              S
            </div>
            <span style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>Scroll &amp; Shop</span>
          </div>
        </Link>
      </div>

      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Progress Bar & Steps Indicator */}
        {!registrationSuccess && (
          <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '16px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
              {stepsHeader.map((s) => {
                const isPassed = currentStep > s.num;
                const isCurrent = currentStep === s.num;
                return (
                  <div
                    key={s.num}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      zIndex: 2,
                      cursor: isPassed ? 'pointer' : 'default',
                    }}
                    onClick={() => isPassed && setCurrentStep(s.num as Step)}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor: isPassed ? '#10b981' : isCurrent ? '#ff9900' : '#e2e8f0',
                        color: isPassed || isCurrent ? 'white' : '#64748b',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {isPassed ? <Check size={14} /> : s.num}
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: isCurrent ? 700 : 500,
                        color: isCurrent ? '#ea580c' : isPassed ? '#10b981' : '#94a3b8',
                        marginTop: '4px',
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Progress line */}
            <div
              style={{
                height: '4px',
                backgroundColor: '#e2e8f0',
                borderRadius: '2px',
                marginTop: '12px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${((currentStep - 1) / 5) * 100}%`,
                  backgroundColor: '#ff9900',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Content Body */}
        <div style={{ padding: '32px 28px' }}>
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Info size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ================= STEP 1: ACCOUNT TYPE ================= */}
          {currentStep === 1 && !registrationSuccess && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  How will you use Scroll &amp; Shop?
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b' }}>
                  Choose the account type that best matches your shopping and community goals.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                {/* Customer Card */}
                <div
                  onClick={() => setAccountType('CUSTOMER')}
                  style={{
                    padding: '24px 20px',
                    borderRadius: '12px',
                    border: accountType === 'CUSTOMER' ? '2px solid #ff9900' : '1px solid #e2e8f0',
                    background: accountType === 'CUSTOMER' ? '#fffaf0' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: accountType === 'CUSTOMER' ? '0 4px 14px rgba(255,153,0,0.15)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      backgroundColor: accountType === 'CUSTOMER' ? '#ffedd5' : '#f1f5f9',
                      color: accountType === 'CUSTOMER' ? '#ea580c' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '14px',
                    }}
                  >
                    <User size={26} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                    Customer / Shopper
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                    Browse trending feeds, save wishlists, share finds with friends, and enjoy secure checkout.
                  </p>
                </div>

                {/* Seller Card */}
                <div
                  onClick={() => setAccountType('SELLER')}
                  style={{
                    padding: '24px 20px',
                    borderRadius: '12px',
                    border: accountType === 'SELLER' ? '2px solid #ff9900' : '1px solid #e2e8f0',
                    background: accountType === 'SELLER' ? '#fffaf0' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: accountType === 'SELLER' ? '0 4px 14px rgba(255,153,0,0.15)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      backgroundColor: accountType === 'SELLER' ? '#ffedd5' : '#f1f5f9',
                      color: accountType === 'SELLER' ? '#ea580c' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '14px',
                    }}
                  >
                    <Store size={26} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                    Seller / Creator
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                    Launch your storefront, showcase shoppable video demos, reach engaged shoppers, and track sales.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#ff9900',
                  color: '#111',
                  fontWeight: 700,
                  fontSize: '14px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(255,153,0,0.25)',
                }}
              >
                Continue as {accountType === 'CUSTOMER' ? 'Customer' : 'Seller'}
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* ================= STEP 2: ACCOUNT DETAILS ================= */}
          {currentStep === 2 && !registrationSuccess && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  {accountType === 'CUSTOMER' ? 'Customer Account Details' : 'Seller Account Credentials'}
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b' }}>
                  Set up your personal identity, contact numbers, and strong password.
                </p>
              </div>

              <div className="space-y-4">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. sarah_shopper"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    />
                  </div>
                </div>

                {/* Phone & Country Code */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Mobile Phone Number *
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      style={{
                        padding: '9px 10px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        backgroundColor: '#f8fafc',
                        cursor: 'pointer',
                      }}
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      required
                      placeholder="98765 43210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Email Address (Optional for Customer, Recommended for Order Updates)
                  </label>
                  <input
                    type="email"
                    placeholder="sarah@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                {/* Real-Time Password Strength Component */}
                <PasswordInputWithStrength
                  password={password}
                  confirmPassword={confirmPassword}
                  username={username}
                  onPasswordChange={setPassword}
                  onConfirmPasswordChange={setConfirmPassword}
                  showConfirmPassword={true}
                  onValidityChange={(valid) => setIsPasswordValid(valid)}
                />

                {/* Bio */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Bio (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Tell the community what you like to shop for..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                {/* Agreements */}
                <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }} className="space-y-2">
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      style={{ marginTop: '2px' }}
                    />
                    <span>I accept Scroll &amp; Shop's Conditions of Use &amp; Terms of Service.</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={agreeGuidelines}
                      onChange={(e) => setAgreeGuidelines(e.target.checked)}
                      style={{ marginTop: '2px' }}
                    />
                    <span>I agree to follow the Community Guidelines for social interactions and reviews.</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={agreePrivacy}
                      onChange={(e) => setAgreePrivacy(e.target.checked)}
                      style={{ marginTop: '2px' }}
                    />
                    <span>I understand and agree to the Privacy Policy (addresses are private and never exposed).</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={handlePrevStep}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#ff9900',
                    color: '#111',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: DELIVERY ADDRESS (CUSTOMER) OR BUSINESS DETAILS (SELLER) ================= */}
          {currentStep === 3 && !registrationSuccess && (
            <div>
              {accountType === 'CUSTOMER' ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                        Delivery Address
                      </h2>
                      <p style={{ fontSize: '13px', color: '#64748b' }}>
                        Save a default shipping address now for instant 1-click checkout, or skip for later.
                      </p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={hasAddress}
                        onChange={(e) => setHasAddress(e.target.checked)}
                      />
                      <span>I want to save my delivery address right now</span>
                    </label>
                  </div>

                  {hasAddress ? (
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                            Recipient Full Name *
                          </label>
                          <input
                            type="text"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            placeholder="Full name for delivery parcel"
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                            Contact Phone *
                          </label>
                          <input
                            type="text"
                            value={addressPhone}
                            onChange={(e) => setAddressPhone(e.target.value)}
                            placeholder="Phone for delivery updates"
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          />
                        </div>
                      </div>

                      {/* Address Type Selector */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                          Address Type
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {(['HOME', 'WORK', 'OTHER'] as const).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setAddressType(t)}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                border: addressType === t ? '2px solid #ff9900' : '1px solid #cbd5e1',
                                background: addressType === t ? '#fffaf0' : 'white',
                                color: addressType === t ? '#ea580c' : '#475569',
                                cursor: 'pointer',
                              }}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                            House / Flat / Door No. *
                          </label>
                          <input
                            type="text"
                            value={houseNumber}
                            onChange={(e) => setHouseNumber(e.target.value)}
                            placeholder="e.g. 42B / Apartment 301"
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                            Building / Apartment Name (Optional)
                          </label>
                          <input
                            type="text"
                            value={buildingName}
                            onChange={(e) => setBuildingName(e.target.value)}
                            placeholder="e.g. Green Heights"
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                            Street / Road *
                          </label>
                          <input
                            type="text"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            placeholder="e.g. 100 Feet Ring Road"
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                            Area / Locality *
                          </label>
                          <input
                            type="text"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            placeholder="e.g. Indiranagar"
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                            City / Town *
                          </label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="e.g. Bengaluru"
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                            State / UT *
                          </label>
                          <input
                            type="text"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            placeholder="e.g. Karnataka"
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                            PIN / Postal Code *
                          </label>
                          <input
                            type="text"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            placeholder="e.g. 560038"
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', cursor: 'pointer', marginTop: '4px' }}>
                          <input
                            type="checkbox"
                            checked={isDefaultAddress}
                            onChange={(e) => setIsDefaultAddress(e.target.checked)}
                          />
                          <span>Save this as my default delivery address</span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                      <MapPin size={32} style={{ margin: '0 auto 8px', color: '#94a3b8' }} />
                      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                        No delivery address entered yet. You can freely browse and add delivery addresses anytime from your profile or during checkout.
                      </p>
                      <button
                        type="button"
                        onClick={() => setHasAddress(true)}
                        style={{
                          padding: '8px 16px',
                          background: '#ffeed9',
                          color: '#ea580c',
                          border: '1px solid #fed7aa',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        + Add Delivery Address Now
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Seller Store & Business Details */
                <div>
                  <div style={{ marginBottom: '18px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                      Store &amp; Business Profile
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748b' }}>
                      Configure your storefront identity, business classification, and shipping policies.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                          Store Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={storeName}
                          onChange={(e) => {
                            setStoreName(e.target.value);
                            if (!storeHandle) {
                              setStoreHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''));
                            }
                          }}
                          placeholder="e.g. Urban Tech Hub"
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                          Store URL Slug *
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                          <span style={{ fontSize: '11px', color: '#64748b', padding: '0 8px' }}>/store/</span>
                          <input
                            type="text"
                            required
                            value={storeHandle}
                            onChange={(e) => setStoreHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                            placeholder="urban-tech"
                            style={{ flex: 1, padding: '8px 6px', border: 'none', background: 'transparent', fontSize: '13px', outline: 'none' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                          Business Type
                        </label>
                        <select
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                        >
                          <option value="Individual / Sole Proprietor">Individual / Sole Proprietor</option>
                          <option value="Partnership / LLP">Partnership / LLP</option>
                          <option value="Private Limited Company">Private Limited Company</option>
                          <option value="Independent Creator / Artisan">Independent Creator / Artisan</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                          Primary Product Category
                        </label>
                        <select
                          value={businessCategory}
                          onChange={(e) => setBusinessCategory(e.target.value)}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                        >
                          <option value="Electronics & Gadgets">Electronics &amp; Gadgets</option>
                          <option value="Fashion & Apparel">Fashion &amp; Apparel</option>
                          <option value="Home & Kitchen">Home &amp; Kitchen</option>
                          <option value="Beauty & Personal Care">Beauty &amp; Personal Care</option>
                          <option value="Handmade & Crafts">Handmade &amp; Crafts</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                        Store Description
                      </label>
                      <textarea
                        rows={2}
                        value={storeDescription}
                        onChange={(e) => setStoreDescription(e.target.value)}
                        placeholder="Describe your brand, quality assurances, and product lines..."
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '3px' }}>
                        Registered Business &amp; Warehouse Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        placeholder="Street, City, State, PIN Code"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={handlePrevStep}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#ff9900',
                    color: '#111',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 4: PERSONALIZATION & PREFERENCES ================= */}
          {currentStep === 4 && !registrationSuccess && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Content Preferences &amp; Recommendations
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b' }}>
                  Select your favourite categories and feed style so we can tailor product discovery to your taste.
                </p>
              </div>

              {/* Multi-select Interest chips */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  Select Your Shopping Interests
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {INTEREST_OPTIONS.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 600,
                          border: isSelected ? '1.5px solid #ff9900' : '1px solid #cbd5e1',
                          background: isSelected ? '#fffaf0' : 'white',
                          color: isSelected ? '#ea580c' : '#475569',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isSelected && <Check size={14} />}
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feed style options */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  What do you want to see on your homepage feed?
                </label>
                <div className="space-y-2">
                  {FEED_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: feedPreference === opt.label ? '1.5px solid #ff9900' : '1px solid #e2e8f0',
                        background: feedPreference === opt.label ? '#fffaf0' : 'white',
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: '#334155',
                      }}
                    >
                      <input
                        type="radio"
                        name="feedOption"
                        checked={feedPreference === opt.label}
                        onChange={() => setFeedPreference(opt.label)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Optional Brands & Price Range */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Preferred Brands (Optional)
                  </label>
                  <input
                    type="text"
                    value={preferredBrands}
                    onChange={(e) => setPreferredBrands(e.target.value)}
                    placeholder="e.g. Sony, Apple, Nike"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Price Range Preference
                  </label>
                  <select
                    value={preferredPriceRange}
                    onChange={(e) => setPreferredPriceRange(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="$ (Budget & Value Deals)">$ (Budget &amp; Value Deals)</option>
                    <option value="$$ (Mid-Range & Best Value)">$$ (Mid-Range &amp; Best Value)</option>
                    <option value="$$$ (Premium & Flagship)">$$$ (Premium &amp; Flagship)</option>
                    <option value="$$$$ (Luxury & Designer)">$$$$ (Luxury &amp; Designer)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={handlePrevStep}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#ff9900',
                    color: '#111',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 5: OPTIONAL SOCIAL CONNECTION ================= */}
          {currentStep === 5 && !registrationSuccess && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    boxShadow: '0 4px 12px rgba(220,39,67,0.3)',
                  }}
                >
                  <InstagramIcon size={24} />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Connect Instagram (Optional)
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '420px', margin: '0 auto' }}>
                  Link your Instagram profile to find friends who shop, sync eligible public posts, or show verified creator status.
                </p>
              </div>

              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '20px',
                }}
              >
                {instagramConnected ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: '#ecfdf5',
                          color: '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                          Instagram Connected
                        </div>
                        <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                          {instagramHandle} (Verified)
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInstagramConnected(false)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: 'white',
                        color: '#64748b',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px', lineHeight: 1.4 }}>
                      Scroll &amp; Shop uses official Meta APIs and never asks for your Instagram password. You can connect now or skip and connect anytime in Settings.
                    </p>
                    <button
                      type="button"
                      disabled={isConnectingInstagram}
                      onClick={handleSimulateInstagramConnect}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '13px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 8px rgba(220,39,67,0.25)',
                      }}
                    >
                      <InstagramIcon size={16} />
                      {isConnectingInstagram ? 'Authorizing with Meta...' : 'Connect Instagram Account'}
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={handlePrevStep}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#ff9900',
                    color: '#111',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  {instagramConnected ? 'Continue' : 'Skip & Review'} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 6: REVIEW BEFORE ACCOUNT CREATION ================= */}
          {currentStep === 6 && !registrationSuccess && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Review &amp; Create Account
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b' }}>
                  Please confirm your registration details below before creating your account.
                </p>
              </div>

              <div className="space-y-4">
                {/* Account Type Banner */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: '#fffaf0',
                    border: '1px solid #fed7aa',
                    borderRadius: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {accountType === 'CUSTOMER' ? (
                      <User className="w-5 h-5 text-amber-600" />
                    ) : (
                      <Store className="w-5 h-5 text-amber-600" />
                    )}
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#9a3412' }}>
                        {accountType === 'CUSTOMER' ? 'Customer / Shopper Account' : 'Seller / Creator Account'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#c2410c' }}>
                        Role: {accountType === 'CUSTOMER' ? 'Standard Customer' : 'Verified Merchant / Creator'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    style={{ fontSize: '12px', color: '#ea580c', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Change
                  </button>
                </div>

                {/* Account Details Card */}
                <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>Personal &amp; Contact Details</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      style={{ fontSize: '11px', color: '#007185', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <div><strong>Full Name:</strong> {fullName}</div>
                    <div><strong>Username:</strong> @{username}</div>
                    <div><strong>Phone:</strong> {countryCode} {phoneNumber}</div>
                    <div><strong>Email:</strong> {email || 'Not provided'}</div>
                    <div><strong>Password:</strong> •••••••••••• (Protected)</div>
                  </div>
                </div>

                {/* Address or Seller Details Card */}
                {accountType === 'CUSTOMER' ? (
                  <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>Delivery Address</span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        style={{ fontSize: '11px', color: '#007185', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                    </div>
                    {hasAddress && street ? (
                      <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                        <div><strong>Recipient:</strong> {recipientName || fullName} ({addressPhone || `${countryCode} ${phoneNumber}`})</div>
                        <div><strong>Address:</strong> {houseNumber}, {buildingName ? `${buildingName}, ` : ''}{street}, {area}, {city}, {state} - {postalCode}, {country}</div>
                        <div style={{ color: '#059669', fontWeight: 600, marginTop: '2px' }}>Default shipping address enabled</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                        Address skipped. You can add delivery addresses anytime during shopping.
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>Store &amp; Business Profile</span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        style={{ fontSize: '11px', color: '#007185', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <div><strong>Store Name:</strong> {storeName}</div>
                      <div><strong>Handle:</strong> /store/{storeHandle}</div>
                      <div><strong>Business Type:</strong> {businessType}</div>
                      <div><strong>Category:</strong> {businessCategory}</div>
                      <div style={{ gridColumn: 'span 2' }}><strong>Business Address:</strong> {businessAddress}</div>
                    </div>
                  </div>
                )}

                {/* Personalization & Social Card */}
                <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>Preferences &amp; Social</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      style={{ fontSize: '11px', color: '#007185', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    <div><strong>Interests:</strong> {selectedInterests.join(', ') || 'General Discovery'}</div>
                    <div style={{ marginTop: '2px' }}><strong>Feed Style:</strong> {feedPreference}</div>
                    <div style={{ marginTop: '2px' }}>
                      <strong>Instagram:</strong>{' '}
                      {instagramConnected ? (
                        <span style={{ color: '#059669', fontWeight: 600 }}>Connected ({instagramHandle})</span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Not connected</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isLoading}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#ff9900',
                    color: '#111',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(255,153,0,0.3)',
                  }}
                >
                  {isLoading ? 'Creating Your Account...' : (
                    <>
                      Create {accountType === 'SELLER' ? 'Seller' : 'Customer'} Account
                      <CheckCircle2 size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ================= SUCCESS CELEBRATION CARD ================= */}
          {registrationSuccess && (
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 4px 14px rgba(5,150,105,0.2)',
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Welcome to Scroll &amp; Shop, {fullName}!
              </h2>

              <p style={{ fontSize: '14px', color: '#475569', maxWidth: '460px', margin: '0 auto 24px', lineHeight: 1.5 }}>
                Your {accountType === 'SELLER' ? 'Seller & Store' : 'Customer'} account (<strong>@{username}</strong>) has been successfully created with high-security password encryption.
              </p>

              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px',
                  textAlign: 'left',
                  marginBottom: '24px',
                  fontSize: '13px',
                }}
                className="space-y-2"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 600 }}>
                  <Check size={16} /> Authenticated session activated
                </div>
                {hasAddress && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 600 }}>
                    <Check size={16} /> Default shipping address configured
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 600 }}>
                  <Check size={16} /> Feed personalized with {selectedInterests.length} interest categories
                </div>
                {accountType === 'SELLER' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 600 }}>
                    <Check size={16} /> Store URL: scrollshop.com/store/{storeHandle}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleFinishAndExplore}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#ff9900',
                  color: '#111',
                  fontWeight: 700,
                  fontSize: '15px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(255,153,0,0.3)',
                }}
              >
                Start Exploring Scroll &amp; Shop
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {!registrationSuccess && (
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#007185', fontWeight: 600 }}>
            Sign in &rarr;
          </Link>
        </div>
      )}
    </div>
  );
};
