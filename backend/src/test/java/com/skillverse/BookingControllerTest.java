package com.skillverse;

import com.skillverse.model.User;
import com.skillverse.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testCreateBookingAndLifecycleUpdates() throws Exception {
        User customer = userRepository.findByEmail("anis@gmail.com").orElse(null);
        User worker = userRepository.findByEmail("kamrul@gmail.com").orElse(null);

        assertThat(customer).isNotNull();
        assertThat(worker).isNotNull();

        String bookingJson = String.format(
            "{\"customerId\":%d,\"workerId\":%d,\"serviceType\":\"HVAC & AC\",\"estimatedCost\":1800.0,\"description\":\"AC deep wash and gas charging.\"}",
            customer.getId(), worker.getId()
        );

        // 1. Create booking
        String responseContent = mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(bookingJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.estimatedCost").value(1800.0))
                .andExpect(jsonPath("$.startVerificationCode").exists())
                .andExpect(jsonPath("$.completionVerificationCode").exists())
                .andReturn().getResponse().getContentAsString();

        // Extract ID
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(responseContent);
        long bookingId = rootNode.get("id").asLong();

        // 2. Worker Counter Offer
        mockMvc.perform(put("/api/bookings/" + bookingId + "/counter-offer")
                .param("price", "2000.0")
                .param("status", "COUNTERED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COUNTERED"))
                .andExpect(jsonPath("$.estimatedCost").value(2000.0));

        // 3. Customer Accept
        mockMvc.perform(put("/api/bookings/" + bookingId + "/status")
                .param("status", "ACCEPTED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"));

        // 4. Worker In Progress
        mockMvc.perform(put("/api/bookings/" + bookingId + "/status")
                .param("status", "IN_PROGRESS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        // 5. Complete Booking
        mockMvc.perform(put("/api/bookings/" + bookingId + "/status")
                .param("status", "COMPLETED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    void testGetCustomerBookings() throws Exception {
        User customer = userRepository.findByEmail("anis@gmail.com").orElse(null);
        assertThat(customer).isNotNull();

        mockMvc.perform(get("/api/bookings/customer/" + customer.getId()))
                .andExpect(status().isOk());
    }
}
