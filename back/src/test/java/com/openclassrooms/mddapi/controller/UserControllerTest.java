package com.openclassrooms.mddapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.mddapi.dto.UpdateProfileRequest;
import com.openclassrooms.mddapi.model.Topic;
import com.openclassrooms.mddapi.model.User;
import com.openclassrooms.mddapi.repository.TopicRepository;
import com.openclassrooms.mddapi.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TopicRepository topicRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private User persistUser() {
        return userRepository.save(User.builder()
                .email("john@doe.com")
                .username("john")
                .password(passwordEncoder.encode("Password1!"))
                .build());
    }

    private Topic persistTopic() {
        return topicRepository.save(Topic.builder().title("Java").description("Langage Java").build());
    }

    @Test
    void me_shouldReturn401WithoutJwt() throws Exception {
        mockMvc.perform(get("/api/user/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void me_shouldReturnProfileWithValidJwt() throws Exception {
        User user = persistUser();

        mockMvc.perform(get("/api/user/me")
                        .with(jwt().jwt(builder -> builder.subject(user.getId().toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("john@doe.com"))
                .andExpect(jsonPath("$.username").value("john"))
                .andExpect(jsonPath("$.subscribedTopics").isArray());
    }

    @Test
    void updateMe_shouldUpdateProfile() throws Exception {
        User user = persistUser();
        UpdateProfileRequest request = new UpdateProfileRequest("updated@doe.com", "updated", null);

        mockMvc.perform(put("/api/user/me")
                        .with(jwt().jwt(builder -> builder.subject(user.getId().toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("updated@doe.com"))
                .andExpect(jsonPath("$.username").value("updated"));
    }

    @Test
    void updateMe_shouldReturn400WhenPayloadInvalid() throws Exception {
        User user = persistUser();
        UpdateProfileRequest request = new UpdateProfileRequest("not-an-email", null, null);

        mockMvc.perform(put("/api/user/me")
                        .with(jwt().jwt(builder -> builder.subject(user.getId().toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateMe_shouldReturn401WithoutJwt() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest("updated@doe.com", "updated", null);

        mockMvc.perform(put("/api/user/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void subscribe_shouldReturn204AndThenUnsubscribe() throws Exception {
        User user = persistUser();
        Topic topic = persistTopic();

        mockMvc.perform(post("/api/user/subscriptions/" + topic.getId())
                        .with(jwt().jwt(builder -> builder.subject(user.getId().toString()))))
                .andExpect(status().isNoContent());

        mockMvc.perform(delete("/api/user/subscriptions/" + topic.getId())
                        .with(jwt().jwt(builder -> builder.subject(user.getId().toString()))))
                .andExpect(status().isNoContent());
    }

    @Test
    void subscribe_shouldReturn404WhenTopicNotFound() throws Exception {
        User user = persistUser();

        mockMvc.perform(post("/api/user/subscriptions/9999")
                        .with(jwt().jwt(builder -> builder.subject(user.getId().toString()))))
                .andExpect(status().isNotFound());
    }

    @Test
    void subscribe_shouldReturn401WithoutJwt() throws Exception {
        mockMvc.perform(post("/api/user/subscriptions/1"))
                .andExpect(status().isUnauthorized());
    }
}

