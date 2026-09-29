package com.scrollshop.controller;

import com.scrollshop.dto.AddressDtos.*;
import com.scrollshop.entity.User;
import com.scrollshop.service.AddressService;
import com.scrollshop.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<AddressDto>> getAddresses() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(addressService.getUserAddresses(currentUser));
    }

    @PostMapping
    public ResponseEntity<AddressDto> addAddress(@Valid @RequestBody AddressRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(addressService.addAddress(currentUser, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressDto> updateAddress(@PathVariable Long id, @Valid @RequestBody AddressRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(addressService.updateAddress(currentUser, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<java.util.Map<String, String>> deleteAddress(@PathVariable Long id) {
        User currentUser = authService.getCurrentUser();
        addressService.deleteAddress(currentUser, id);
        return ResponseEntity.ok(java.util.Map.of("message", "Address deleted successfully"));
    }

    @PutMapping("/{id}/default")
    public ResponseEntity<AddressDto> setDefaultAddress(@PathVariable Long id) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(addressService.setDefaultAddress(currentUser, id));
    }
}
