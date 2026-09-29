package com.scrollshop.service;

import com.scrollshop.exception.BadRequestException;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

@Service
public class PasswordValidationService {

    public static final int MIN_LENGTH = 12;
    public static final int MAX_LENGTH = 128;

    // Comprehensive blocklist of common, predictable or compromised passwords / roots
    private static final Set<String> COMMON_PASSWORDS = new HashSet<>(Arrays.asList(
            "password123456", "password12345", "password1234", "password123",
            "123456789012", "1234567890123", "12345678901234", "123456789012345",
            "qwertyuiop12", "qwertyuiopas", "asdfghjkl123", "zxcvbnm12345",
            "adminadmin123", "administrator1", "welcome123456", "letmein123456",
            "changeme123456", "iloveyou123456", "football12345", "monkey1234567",
            "dragon1234567", "master1234567", "supersecret12", "scrollshop123",
            "scrollandshop1"
    ));

    public enum StrengthLevel {
        VERY_WEAK,
        WEAK,
        FAIR,
        STRONG,
        VERY_STRONG
    }

    public static class PasswordEvaluation {
        private final StrengthLevel level;
        private final int score; // 0 to 4
        private final boolean valid;
        private final String message;

        public PasswordEvaluation(StrengthLevel level, int score, boolean valid, String message) {
            this.level = level;
            this.score = score;
            this.valid = valid;
            this.message = message;
        }

        public StrengthLevel getLevel() {
            return level;
        }

        public int getScore() {
            return score;
        }

        public boolean isValid() {
            return valid;
        }

        public String getMessage() {
            return message;
        }
    }

    /**
     * Validates password against modern security policies and throws BadRequestException if invalid.
     */
    public void validatePassword(String password, String username) {
        if (password == null || password.isEmpty()) {
            throw new BadRequestException("Password cannot be empty.");
        }

        if (password.length() < MIN_LENGTH) {
            throw new BadRequestException("Password must be at least " + MIN_LENGTH + " characters long.");
        }

        if (password.length() > MAX_LENGTH) {
            throw new BadRequestException("Password must not exceed " + MAX_LENGTH + " characters.");
        }

        String lower = password.toLowerCase(Locale.ROOT);

        // Check if password matches or contains username
        if (username != null && !username.trim().isEmpty()) {
            String lowerUsername = username.trim().toLowerCase(Locale.ROOT);
            if (lowerUsername.length() >= 3 && lower.contains(lowerUsername)) {
                throw new BadRequestException("Password cannot contain your username.");
            }
        }

        // Check common password blocklist
        if (COMMON_PASSWORDS.contains(lower)) {
            throw new BadRequestException("This password is too common and easily guessed. Please choose a stronger password.");
        }

        // Check if entire password is one repeating character (e.g. "aaaaaaaaaaaa")
        if (isAllSameChar(password)) {
            throw new BadRequestException("Password cannot consist of a single repeated character.");
        }

        // Evaluate overall strength
        PasswordEvaluation evaluation = evaluateStrength(password);
        if (evaluation.getScore() < 2) {
            throw new BadRequestException(evaluation.getMessage() != null ? evaluation.getMessage() : "Password is too weak. Try using a longer passphrase or adding numbers and symbols.");
        }
    }

    /**
     * Evaluates password strength returning a score from 0 (Very Weak) to 4 (Very Strong).
     */
    public PasswordEvaluation evaluateStrength(String password) {
        if (password == null || password.isEmpty()) {
            return new PasswordEvaluation(StrengthLevel.VERY_WEAK, 0, false, "Password cannot be empty.");
        }

        int length = password.length();
        if (length < MIN_LENGTH) {
            return new PasswordEvaluation(StrengthLevel.VERY_WEAK, 0, false, "Password must be at least " + MIN_LENGTH + " characters long.");
        }

        String lower = password.toLowerCase(Locale.ROOT);
        if (COMMON_PASSWORDS.contains(lower) || isAllSameChar(password)) {
            return new PasswordEvaluation(StrengthLevel.VERY_WEAK, 0, false, "This password is too predictable.");
        }

        boolean hasLower = password.matches(".*[a-z].*");
        boolean hasUpper = password.matches(".*[A-Z].*");
        boolean hasDigit = password.matches(".*[0-9].*");
        boolean hasSpecial = password.matches(".*[^a-zA-Z0-9].*");
        boolean hasSpaces = password.contains(" ");

        int varietyCount = (hasLower ? 1 : 0) + (hasUpper ? 1 : 0) + (hasDigit ? 1 : 0) + (hasSpecial ? 1 : 0);

        // Long multi-word passphrases (e.g., "correct horse battery staple") are very strong
        String[] words = password.trim().split("\\s+");
        boolean isMultiWordPassphrase = words.length >= 3 && length >= 16;

        int score = 1; // Base score for >= 12 chars

        if (isMultiWordPassphrase) {
            score = (length >= 22) ? 4 : 3;
        } else {
            if (length >= 14) score++;
            if (length >= 18) score++;
            if (varietyCount >= 3) score++;
            if (varietyCount >= 4 && (length >= 14 || hasSpaces)) score++;
        }

        // Cap score at 4
        score = Math.min(4, Math.max(1, score));

        // Downrate if purely digits or purely letters with no diversity for short lengths
        if (varietyCount <= 1 && length < 16 && !isMultiWordPassphrase) {
            score = Math.min(score, 1);
        }

        StrengthLevel level;
        switch (score) {
            case 4:
                level = StrengthLevel.VERY_STRONG;
                break;
            case 3:
                level = StrengthLevel.STRONG;
                break;
            case 2:
                level = StrengthLevel.FAIR;
                break;
            case 1:
                level = StrengthLevel.WEAK;
                break;
            default:
                level = StrengthLevel.VERY_WEAK;
        }

        boolean isValid = score >= 2;
        return new PasswordEvaluation(level, score, isValid, isValid ? "Strong password." : "Consider adding numbers, symbols, or using a multi-word passphrase.");
    }

    private boolean isAllSameChar(String s) {
        if (s == null || s.isEmpty()) return false;
        char first = s.charAt(0);
        for (int i = 1; i < s.length(); i++) {
            if (s.charAt(i) != first) return false;
        }
        return true;
    }
}
