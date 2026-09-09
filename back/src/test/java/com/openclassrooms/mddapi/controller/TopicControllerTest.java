package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.model.Topic;
import com.openclassrooms.mddapi.repository.TopicRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TopicControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private TopicRepository topicRepository;

    @Test
    void findAll_shouldReturn401WithoutJwt() throws Exception {
        mockMvc.perform(get("/api/topics"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void findAll_shouldReturnTopicsSortedByTitle() throws Exception {
        topicRepository.save(Topic.builder().title("Java").description("desc").build());
        topicRepository.save(Topic.builder().title("Angular").description("desc").build());

        mockMvc.perform(get("/api/topics")
                        .with(jwt().jwt(builder -> builder.subject("1"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].title").value("Angular"))
                .andExpect(jsonPath("$[1].title").value("Java"));
    }
}

