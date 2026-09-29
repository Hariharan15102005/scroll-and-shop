package com.scrollshop.service;

import com.scrollshop.dto.AddressDtos.AddressDto;
import com.scrollshop.dto.AddressDtos.AddressRequest;
import com.scrollshop.entity.Address;
import com.scrollshop.entity.Role;
import com.scrollshop.entity.User;
import com.scrollshop.exception.BadRequestException;
import com.scrollshop.repository.AddressRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AddressServiceTest {

    @Mock
    private AddressRepository addressRepository;

    @InjectMocks
    private AddressService addressService;

    private User user;
    private Address address;
    private AddressRequest addressRequest;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username("john_doe")
                .role(Role.USER)
                .build();

        address = Address.builder()
                .id(100L)
                .user(user)
                .recipientName("John Doe")
                .phone("+91 9876543210")
                .addressType("HOME")
                .houseNumber("42A")
                .street("MG Road")
                .area("Koramangala")
                .city("Bengaluru")
                .state("Karnataka")
                .postalCode("560034")
                .country("India")
                .isDefault(true)
                .build();

        addressRequest = AddressRequest.builder()
                .recipientName("John Doe")
                .phone("+91 9876543210")
                .addressType("HOME")
                .houseNumber("42A")
                .street("MG Road")
                .area("Koramangala")
                .city("Bengaluru")
                .state("Karnataka")
                .postalCode("560034")
                .country("India")
                .isDefault(true)
                .build();
    }

    @Test
    void getUserAddresses_ReturnsList() {
        when(addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(1L)).thenReturn(List.of(address));

        List<AddressDto> result = addressService.getUserAddresses(user);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("John Doe", result.get(0).getRecipientName());
        assertEquals("560034", result.get(0).getPostalCode());
    }

    @Test
    void addAddress_ValidRequest_SavesAndReturnsDto() {
        when(addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(1L)).thenReturn(List.of());
        when(addressRepository.save(any(Address.class))).thenReturn(address);

        AddressDto result = addressService.addAddress(user, addressRequest);

        assertNotNull(result);
        assertEquals("John Doe", result.getRecipientName());
        assertTrue(result.getIsDefault());
        verify(addressRepository, times(1)).save(any(Address.class));
    }

    @Test
    void addAddress_MissingRecipient_ThrowsBadRequestException() {
        addressRequest.setRecipientName("");

        assertThrows(BadRequestException.class, () -> addressService.addAddress(user, addressRequest));
        verify(addressRepository, never()).save(any(Address.class));
    }

    @Test
    void deleteAddress_Success() {
        when(addressRepository.findByIdAndUserId(100L, 1L)).thenReturn(Optional.of(address));

        assertDoesNotThrow(() -> addressService.deleteAddress(user, 100L));
        verify(addressRepository, times(1)).delete(address);
    }
}
