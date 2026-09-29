import React, { useState } from 'react';
import { Eye, EyeOff, Check, X, Shield, AlertTriangle } from 'lucide-react';
import { evaluatePasswordStrength, PasswordStrengthResult } from '../utils/passwordStrength';

interface PasswordInputWithStrengthProps {
  password: string;
  confirmPassword?: string;
  username?: string;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange?: (confirmPassword: string) => void;
  showConfirmPassword?: boolean;
  onValidityChange?: (isValid: boolean, result: PasswordStrengthResult) => void;
  disabled?: boolean;
}

export const PasswordInputWithStrength: React.FC<PasswordInputWithStrengthProps> = ({
  password,
  confirmPassword = '',
  username = '',
  onPasswordChange,
  onConfirmPasswordChange,
  showConfirmPassword = true,
  onValidityChange,
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = evaluatePasswordStrength(password, username);
  const isConfirmMatching = password.length > 0 && confirmPassword === password;
  const isConfirmInvalid = confirmPassword.length > 0 && confirmPassword !== password;

  const isFormValid =
    strength.isMinLength &&
    strength.isNotCommon &&
    strength.hasSufficientStrength &&
    (!showConfirmPassword || isConfirmMatching);

  // Notify parent on changes
  React.useEffect(() => {
    if (onValidityChange) {
      onValidityChange(isFormValid, strength);
    }
  }, [isFormValid, strength.score, strength.isMinLength, strength.isNotCommon]);

  return (
    <div className="space-y-4">
      {/* Password Field */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-orange-500" />
            Password
          </label>
          {password.length > 0 && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${strength.color}15`,
                color: strength.color,
                border: `1px solid ${strength.color}40`,
              }}
            >
              {strength.label}
            </span>
          )}
        </div>

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            disabled={disabled}
            maxLength={128}
            placeholder="At least 12 characters (e.g. passphrase or mix)"
            className="w-full px-3.5 py-2.5 pr-11 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-sm disabled:bg-gray-100"
            autoComplete="new-password"
            aria-label="Password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
            tabIndex={0}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 focus:text-gray-800 rounded-md transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Real-Time Password Strength Meter Bar */}
        {password.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden flex gap-1">
              {[1, 2, 3, 4].map((step) => {
                const isActive = strength.score >= step;
                return (
                  <div
                    key={step}
                    className="h-full flex-1 transition-all duration-300 rounded-full"
                    style={{
                      backgroundColor: isActive ? strength.progressBarColor : '#e5e7eb',
                    }}
                  />
                );
              })}
            </div>
            <p className="text-xs text-gray-500 pt-0.5">{strength.feedback}</p>
          </div>
        )}

        {/* Live Password Requirements Checklist */}
        <div className="mt-2.5 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-xs space-y-1.5">
          <div
            className={`flex items-center gap-2 transition-colors ${
              strength.isMinLength ? 'text-emerald-700 font-medium' : 'text-gray-500'
            }`}
          >
            {strength.isMinLength ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-gray-400 flex-shrink-0" />
            )}
            <span>
              At least 12 characters ({password.length}/12)
            </span>
          </div>

          <div
            className={`flex items-center gap-2 transition-colors ${
              strength.isNotCommon && password.length > 0
                ? 'text-emerald-700 font-medium'
                : !strength.isNotCommon
                ? 'text-red-600 font-medium'
                : 'text-gray-500'
            }`}
          >
            {strength.isNotCommon && password.length > 0 ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            ) : !strength.isNotCommon ? (
              <X className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-gray-400 flex-shrink-0" />
            )}
            <span>
              Not a commonly used, predictable, or repeated password
            </span>
          </div>

          <div
            className={`flex items-center gap-2 transition-colors ${
              strength.hasSufficientStrength
                ? 'text-emerald-700 font-medium'
                : 'text-gray-500'
            }`}
          >
            {strength.hasSufficientStrength ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-gray-400 flex-shrink-0" />
            )}
            <span>
              Sufficient strength (Fair, Strong, or Very Strong)
            </span>
          </div>
        </div>
      </div>

      {/* Confirm Password Field */}
      {showConfirmPassword && onConfirmPasswordChange && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
            {confirmPassword.length > 0 && (
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isConfirmMatching
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {isConfirmMatching ? (
                  <>
                    <Check className="w-3 h-3" /> Passwords match
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3" /> Passwords do not match
                  </>
                )}
              </span>
            )}
          </div>

          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              disabled={disabled}
              maxLength={128}
              placeholder="Re-enter your password to confirm"
              className={`w-full px-3.5 py-2.5 pr-11 border rounded-lg text-sm focus:ring-2 outline-none transition-all shadow-sm disabled:bg-gray-100 ${
                isConfirmInvalid
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
                  : isConfirmMatching
                  ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-200'
                  : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'
              }`}
              autoComplete="new-password"
              aria-label="Confirm Password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              disabled={disabled}
              tabIndex={0}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 focus:text-gray-800 rounded-md transition-colors"
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {isConfirmInvalid && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              The confirmation password does not match the password entered above.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
