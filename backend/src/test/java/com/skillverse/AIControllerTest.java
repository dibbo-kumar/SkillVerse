package com.skillverse;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AIControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testEstimateCostForAC() throws Exception {
        mockMvc.perform(get("/api/ai/estimate-cost")
                .param("issueDescription", "AC unit is not cooling properly and making noise"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.baseServiceCost").value(800.0))
                .andExpect(jsonPath("$.estimatedSparePartsCost").value(1500.0))
                .andExpect(jsonPath("$.totalEstimatedCost").value(2300.0))
                .andExpect(jsonPath("$.confidenceScore").value(0.94));
    }

    @Test
    void testEstimateCostForPlumbing() throws Exception {
        mockMvc.perform(get("/api/ai/estimate-cost")
                .param("issueDescription", "Water pipe leak in kitchen"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.baseServiceCost").value(450.0))
                .andExpect(jsonPath("$.estimatedSparePartsCost").value(0.0))
                .andExpect(jsonPath("$.totalEstimatedCost").value(450.0));
    }

    @Test
    void testChatbotResponse() throws Exception {
        String requestJson = "{\"message\":\"Can you help with my AC problem?\"}";
        mockMvc.perform(post("/api/ai/chatbot")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.response").exists());
    }
}
