package com.scrollshop.service;

import com.scrollshop.dto.AddressDtos.*;
import com.scrollshop.entity.Address;
import com.scrollshop.entity.User;
import com.scrollshop.exception.BadRequestException;
import com.scrollshop.exception.ResourceNotFoundException;
import com.scrollshop.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;

    public List<AddressDto> getUserAddresses(User user) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressDto addAddress(User user, AddressRequest request) {
        validateAddressRequest(request);

        boolean isFirst = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId()).isEmpty();
        boolean shouldBeDefault = Boolean.TRUE.equals(request.getIsDefault()) || isFirst;

        if (shouldBeDefault) {
            addressRepository.clearDefaultAddressesForUser(user.getId());
        }

        Address address = Address.builder()
                .user(user)
                .recipientName(request.getRecipientName().trim())
                .phone(request.getPhone().trim())
                .addressType(request.getAddressType() != null ? request.getAddressType() : "HOME")
                .houseNumber(request.getHouseNumber().trim())
                .buildingName(request.getBuildingName() != null ? request.getBuildingName().trim() : null)
                .street(request.getStreet().trim())
                .area(request.getArea().trim())
                .landmark(request.getLandmark() != null ? request.getLandmark().trim() : null)
                .city(request.getCity().trim())
                .district(request.getDistrict() != null ? request.getDistrict().trim() : null)
                .state(request.getState().trim())
                .postalCode(request.getPostalCode().trim())
                .country(request.getCountry() != null && !request.getCountry().trim().isEmpty() ? request.getCountry().trim() : "India")
                .isDefault(shouldBeDefault)
                .build();

        Address saved = addressRepository.save(address);
        return toDto(saved);
    }

    @Transactional
    public AddressDto updateAddress(User user, Long addressId, AddressRequest request) {
        Address address = addressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        validateAddressRequest(request);

        if (Boolean.TRUE.equals(request.getIsDefault()) && !Boolean.TRUE.equals(address.getIsDefault())) {
            addressRepository.clearDefaultAddressesForUser(user.getId());
            address.setIsDefault(true);
        }

        address.setRecipientName(request.getRecipientName().trim());
        address.setPhone(request.getPhone().trim());
        if (request.getAddressType() != null) address.setAddressType(request.getAddressType());
        address.setHouseNumber(request.getHouseNumber().trim());
        address.setBuildingName(request.getBuildingName() != null ? request.getBuildingName().trim() : null);
        address.setStreet(request.getStreet().trim());
        address.setArea(request.getArea().trim());
        address.setLandmark(request.getLandmark() != null ? request.getLandmark().trim() : null);
        address.setCity(request.getCity().trim());
        address.setDistrict(request.getDistrict() != null ? request.getDistrict().trim() : null);
        address.setState(request.getState().trim());
        address.setPostalCode(request.getPostalCode().trim());
        if (request.getCountry() != null && !request.getCountry().trim().isEmpty()) {
            address.setCountry(request.getCountry().trim());
        }

        Address saved = addressRepository.save(address);
        return toDto(saved);
    }

    @Transactional
    public void deleteAddress(User user, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        boolean wasDefault = Boolean.TRUE.equals(address.getIsDefault());
        addressRepository.delete(address);

        if (wasDefault) {
            List<Address> remaining = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId());
            if (!remaining.isEmpty()) {
                Address newDefault = remaining.get(0);
                newDefault.setIsDefault(true);
                addressRepository.save(newDefault);
            }
        }
    }

    @Transactional
    public AddressDto setDefaultAddress(User user, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        addressRepository.clearDefaultAddressesForUser(user.getId());
        address.setIsDefault(true);
        Address saved = addressRepository.save(address);
        return toDto(saved);
    }

    private void validateAddressRequest(AddressRequest request) {
        if (request.getRecipientName() == null || request.getRecipientName().trim().isEmpty()) {
            throw new BadRequestException("Recipient full name is required");
        }
        if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            throw new BadRequestException("Contact phone number is required");
        }
        if (request.getHouseNumber() == null || request.getHouseNumber().trim().isEmpty()) {
            throw new BadRequestException("House / Flat / Door number is required");
        }
        if (request.getStreet() == null || request.getStreet().trim().isEmpty()) {
            throw new BadRequestException("Street / Road is required");
        }
        if (request.getArea() == null || request.getArea().trim().isEmpty()) {
            throw new BadRequestException("Area / Locality is required");
        }
        if (request.getCity() == null || request.getCity().trim().isEmpty()) {
            throw new BadRequestException("City is required");
        }
        if (request.getState() == null || request.getState().trim().isEmpty()) {
            throw new BadRequestException("State is required");
        }
        if (request.getPostalCode() == null || request.getPostalCode().trim().isEmpty()) {
            throw new BadRequestException("PIN / Postal code is required");
        }
    }

    public AddressDto toDto(Address a) {
        return AddressDto.builder()
                .id(a.getId())
                .recipientName(a.getRecipientName())
                .phone(a.getPhone())
                .addressType(a.getAddressType())
                .houseNumber(a.getHouseNumber())
                .buildingName(a.getBuildingName())
                .street(a.getStreet())
                .area(a.getArea())
                .landmark(a.getLandmark())
                .city(a.getCity())
                .district(a.getDistrict())
                .state(a.getState())
                .postalCode(a.getPostalCode())
                .country(a.getCountry())
                .isDefault(a.getIsDefault())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
