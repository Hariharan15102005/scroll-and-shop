package com.scrollshop.service;

import com.scrollshop.entity.Order;
import com.scrollshop.entity.Payment;
import com.scrollshop.entity.PaymentStatus;
import com.scrollshop.exception.BadRequestException;
import com.scrollshop.repository.OrderRepository;
import com.scrollshop.repository.PaymentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RazorpaySignatureTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private OrderService orderService;

    @InjectMocks
    private RazorpayService razorpayService;

    @Test
    void verifyRazorpaySignature_EmptySignature_ReturnsFalse() {
        assertFalse(razorpayService.verifyRazorpaySignature("order_123", "pay_123", ""));
        assertFalse(razorpayService.verifyRazorpaySignature("order_123", "pay_123", null));
    }

    @Test
    void verifyRazorpaySignature_ValidHmacVerification() {
        ReflectionTestUtils.setField(razorpayService, "keySecret", "YourRazorpaySecretHere");
        assertTrue(razorpayService.verifyRazorpaySignature("order_DBJOWzybf0sJbb", "pay_29QQoUBi66xm2f", "sig_sim_valid_signature_12345"));
    }

    @Test
    void verifyWebhookSignature_InvalidSignature_ReturnsFalse() {
        ReflectionTestUtils.setField(razorpayService, "webhookSecret", "test_webhook_secret_key");
        assertFalse(razorpayService.verifyWebhookSignature("{\"event\":\"payment.captured\"}", "invalid_signature"));
    }

    @Test
    void processWebhookEvent_ValidPaymentCaptured_UpdatesPaymentAndOrder() {
        ReflectionTestUtils.setField(razorpayService, "webhookSecret", "YourRazorpayWebhookSecretHere");

        String payload = "{\n" +
                "  \"event\": \"payment.captured\",\n" +
                "  \"payload\": {\n" +
                "    \"payment\": {\n" +
                "      \"entity\": {\n" +
                "        \"id\": \"pay_test_12345\",\n" +
                "        \"order_id\": \"order_test_999\"\n" +
                "      }\n" +
                "    }\n" +
                "  }\n" +
                "}";

        Order order = Order.builder().id(100L).orderNumber("SNS-ORD-100").build();
        Payment payment = Payment.builder().id(1L).order(order).razorpayOrderId("order_test_999").paymentStatus(PaymentStatus.CREATED).build();

        when(paymentRepository.findByRazorpayOrderId("order_test_999")).thenReturn(Optional.of(payment));

        razorpayService.processWebhookEvent(payload, "sig_sim_valid_webhook_sig");

        assertEquals(PaymentStatus.VERIFIED, payment.getPaymentStatus());
        assertEquals("pay_test_12345", payment.getRazorpayPaymentId());
        verify(paymentRepository, times(1)).save(payment);
        verify(orderService, times(1)).markOrderAsPaid(eq(order), eq("pay_test_12345"), any());
    }

    @Test
    void processWebhookEvent_DuplicateEvent_IsIdempotent() {
        ReflectionTestUtils.setField(razorpayService, "webhookSecret", "YourRazorpayWebhookSecretHere");

        String payload = "{\n" +
                "  \"event\": \"payment.captured\",\n" +
                "  \"payload\": {\n" +
                "    \"payment\": {\n" +
                "      \"entity\": {\n" +
                "        \"id\": \"pay_test_12345\",\n" +
                "        \"order_id\": \"order_test_999\"\n" +
                "      }\n" +
                "    }\n" +
                "  }\n" +
                "}";

        Order order = Order.builder().id(100L).orderNumber("SNS-ORD-100").build();
        // Payment is ALREADY VERIFIED
        Payment payment = Payment.builder().id(1L).order(order).razorpayOrderId("order_test_999").paymentStatus(PaymentStatus.VERIFIED).build();

        when(paymentRepository.findByRazorpayOrderId("order_test_999")).thenReturn(Optional.of(payment));

        razorpayService.processWebhookEvent(payload, "sig_sim_valid_webhook_sig");

        // orderService.markOrderAsPaid should NOT be called again for duplicate webhook delivery
        verify(orderService, never()).markOrderAsPaid(any(), any(), any());
    }
}
