package com.scrollshop.service;

import com.scrollshop.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PasswordValidationServiceTest {

    private PasswordValidationService passwordValidationService;

    @BeforeEach
    void setUp() {
        passwordValidationService = new PasswordValidationService();
    }

    @Test
    void validatePassword_ValidStrongPassword_Passes() {
        assertDoesNotThrow(() -> 
            passwordValidationService.validatePassword("P@ssw0rdSecure#2026", "john_doe")
        );
    }

    @Test
    void validatePassword_LongPassphraseWithSpaces_Passes() {
        assertDoesNotThrow(() -> 
            passwordValidationService.validatePassword("correct horse battery staple 99", "alex_tech")
        );
    }

    @Test
    void validatePassword_EmptyPassword_ThrowsBadRequestException() {
        BadRequestException ex = assertThrows(BadRequestException.class, () -> 
            passwordValidationService.validatePassword("", "user1")
        );
        assertTrue(ex.getMessage().contains("cannot be empty"));
    }

    @Test
    void validatePassword_ShortPassword_ThrowsBadRequestException() {
        BadRequestException ex = assertThrows(BadRequestException.class, () -> 
            passwordValidationService.validatePassword("Short123!", "user1")
        );
        assertTrue(ex.getMessage().contains("at least 12 characters"));
    }

    @Test
    void validatePassword_CommonPredictablePassword_ThrowsBadRequestException() {
        BadRequestException ex = assertThrows(BadRequestException.class, () -> 
            passwordValidationService.validatePassword("password123456", "user1")
        );
        assertTrue(ex.getMessage().contains("too common"));
    }

    @Test
    void validatePassword_RepeatingCharacters_ThrowsBadRequestException() {
        BadRequestException ex = assertThrows(BadRequestException.class, () -> 
            passwordValidationService.validatePassword("aaaaaaaaaaaa", "user1")
        );
        assertTrue(ex.getMessage().contains("single repeated character"));
    }

    @Test
    void validatePassword_ContainsUsername_ThrowsBadRequestException() {
        BadRequestException ex = assertThrows(BadRequestException.class, () -> 
            passwordValidationService.validatePassword("MySuperSecretAlexTech2026!", "alextech")
        );
        assertTrue(ex.getMessage().contains("cannot contain your username"));
    }

    @Test
    void evaluateStrength_CalculatesAccurateLevels() {
        assertEquals(PasswordValidationService.StrengthLevel.VERY_WEAK, passwordValidationService.evaluateStrength("short").getLevel());
        assertEquals(PasswordValidationService.StrengthLevel.VERY_WEAK, passwordValidationService.evaluateStrength("password123456").getLevel());
        
        // Fair / Strong
        assertTrue(passwordValidationService.evaluateStrength("FairP@ssword1").getScore() >= 2);
        assertEquals(PasswordValidationService.StrengthLevel.VERY_STRONG, passwordValidationService.evaluateStrength("super!Secure#Passphrase999!!").getLevel());
        assertEquals(PasswordValidationService.StrengthLevel.VERY_STRONG, passwordValidationService.evaluateStrength("blue sky ocean mountain breeze 44").getLevel());
    }
}
