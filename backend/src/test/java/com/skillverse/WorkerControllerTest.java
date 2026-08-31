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
        assertThat(worker).isNotNull();

        mockMvc.perform(post("/api/workers/" + worker.getId() + "/verify")
                .param("nid", "19952618954712399"))
                .andExpect(status().isOk());
    }
}
