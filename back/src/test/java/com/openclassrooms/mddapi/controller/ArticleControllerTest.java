package com.openclassrooms.mddapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.mddapi.dto.CreateArticleRequest;
import com.openclassrooms.mddapi.model.Article;
import com.openclassrooms.mddapi.model.Topic;
import com.openclassrooms.mddapi.model.User;
import com.openclassrooms.mddapi.repository.ArticleRepository;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ArticleControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TopicRepository topicRepository;
    @Autowired
    private ArticleRepository articleRepository;
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
        return topicRepository.save(Topic.builder().title("Java").description("desc").build());
    }

    private Article persistArticle(User author, Topic topic) {
        return articleRepository.save(Article.builder()
                .title("Mon article")
                .content("Contenu de l'article")
                .author(author)
                .topic(topic)
                .build());
    }

    @Test
    void feed_shouldReturn401WithoutJwt() throws Exception {
        mockMvc.perform(get("/api/articles"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void feed_shouldReturnArticlesOfSubscribedTopics() throws Exception {
        User user = persistUser();
        Topic topic = persistTopic();
        user.getSubscribedTopics().add(topic);
        userRepository.save(user);
        persistArticle(user, topic);

        mockMvc.perform(get("/api/articles")
                        .with(jwt().jwt(builder -> builder.subject(user.getId().toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].title").value("Mon article"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void findById_shouldReturnArticleDetail() throws Exception {
        User user = persistUser();
        Topic topic = persistTopic();
        Article article = persistArticle(user, topic);

        mockMvc.perform(get("/api/articles/" + article.getId())
                        .with(jwt().jwt(builder -> builder.subject(user.getId().toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Mon article"))
                .andExpect(jsonPath("$.authorUsername").value("john"))
                .andExpect(jsonPath("$.topicTitle").value("Java"));
    }

    @Test
    void findById_shouldReturn404WhenArticleNotFound() throws Exception {
        User user = persistUser();

        mockMvc.perform(get("/api/articles/9999")
                        .with(jwt().jwt(builder -> builder.subject(user.getId().toString()))))
                .andExpect(status().isNotFound());
    }

    @Test
    void create_shouldReturn201AndPersistArticle() throws Exception {
        User user = persistUser();
        Topic topic = persistTopic();
        CreateArticleRequest request = new CreateArticleRequest("Nouveau", "Contenu", topic.getId());

        mockMvc.perform(post("/api/articles")
                        .with(jwt().jwt(builder -> builder.subject(user.getId().toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Nouveau"))
                .andExpect(jsonPath("$.authorUsername").value("john"));
    }

    @Test
    void create_shouldReturn400WhenPayloadInvalid() throws Exception {
        User user = persistUser();
        CreateArticleRequest request = new CreateArticleRequest("", "", null);

        mockMvc.perform(post("/api/articles")
                        .with(jwt().jwt(builder -> builder.subject(user.getId().toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_shouldReturn404WhenTopicNotFound() throws Exception {
        User user = persistUser();
        CreateArticleRequest request = new CreateArticleRequest("Nouveau", "Contenu", 9999L);

        mockMvc.perform(post("/api/articles")
                        .with(jwt().jwt(builder -> builder.subject(user.getId().toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void create_shouldReturn401WithoutJwt() throws Exception {
        CreateArticleRequest request = new CreateArticleRequest("Nouveau", "Contenu", 1L);

        mockMvc.perform(post("/api/articles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}

