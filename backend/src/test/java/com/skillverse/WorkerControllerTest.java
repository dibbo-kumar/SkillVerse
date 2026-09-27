package com.skillverse;

import com.skillverse.model.User;
import com.skillverse.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class WorkerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testGetAllWorkers() throws Exception {
        mockMvc.perform(get("/api/workers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void testGetWorkerProfile() throws Exception {
        User worker = userRepository.findByEmail("kamrul@gmail.com").orElse(null);
        assertThat(worker).isNotNull();

        mockMvc.perform(get("/api/workers/" + worker.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.skills").exists())
                .andExpect(jsonPath("$.hourlyRate").exists());
    }

    @Test
    void testVerifyWorker() throws Exception {
        User worker = userRepository.findByEmail("sajid@gmail.com").orElse(null);
        if (worker == null) {
            worker = userRepository.findByEmail("kamrul@gmail.com").orElse(null);
        }
        assertThat(worker).isNotNull();

        mockMvc.perform(post("/api/workers/" + worker.getId() + "/verify")
                .param("nid", "19952618954712399"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetNearbyWorkersWithCoordinates() throws Exception {
        // Customer in Uttara (23.8759, 90.3795) with 5km radius
        mockMvc.perform(get("/api/workers/nearby")
                .param("lat", "23.8759")
                .param("lon", "90.3795")
                .param("radius", "5.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].distanceKm").exists())
                .andExpect(jsonPath("$[0].distanceString").exists())
                .andExpect(jsonPath("$[0].serviceArea").exists());
    }

    @Test
    void testGetNearbyWorkersRadiusFilter() throws Exception {
        // Customer in Uttara with 0.5km (500m) radius
        mockMvc.perform(get("/api/workers/nearby")
                .param("lat", "23.8759")
                .param("lon", "90.3795")
                .param("radius", "0.5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
