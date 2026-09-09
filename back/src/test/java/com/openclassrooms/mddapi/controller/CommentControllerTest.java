package com.openclassrooms.mddapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.mddapi.dto.CreateCommentRequest;
import com.openclassrooms.mddapi.model.Article;
import com.openclassrooms.mddapi.model.Comment;
import com.openclassrooms.mddapi.model.Topic;
import com.openclassrooms.mddapi.model.User;
import com.openclassrooms.mddapi.repository.ArticleRepository;
import com.openclassrooms.mddapi.repository.CommentRepository;
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
class CommentControllerTest {

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
    private CommentRepository commentRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private User persistUser() {
        return userRepository.save(User.builder()
                .email("john@doe.com")
                .username("john")
                .password(passwordEncoder.encode("Password1!"))
                .build());
    }

    private Article persistArticle(User author) {
        Topic topic = topicRepository.save(Topic.builder().title("Java").description("desc").build());
        return articleRepository.save(Article.builder()
                .title("Mon article")
                .content("Contenu")
                .author(author)
                .topic(topic)
                .build());
    }

    @Test
    void findByArticle_shouldReturn401WithoutJwt() throws Exception {
        mockMvc.perform(get("/api/articles/1/comments"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void findByArticle_shouldReturnComments() throws Exception {
        User user = persistUser();
        Article article = persistArticle(user);
        commentRepository.save(Comment.builder()
                .content("Super article")
                .article(article)
                .author(user)
                .build());

        mockMvc.perform(get("/api/articles/" + article.getId() + "/comments")
                        .with(jwt().jwt(builder -> builder.subject(user.getId().toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].content").value("Super article"))
                .andExpect(jsonPath("$[0].authorUsername").value("john"));
    }

    @Test
    void findByArticle_shouldReturn404WhenArticleNotFound() throws Exception {
        User user = persistUser();

        mockMvc.perform(get("/api/articles/9999/comments")
                        .with(jwt().jwt(builder -> builder.subject(user.getId().toString()))))
                .andExpect(status().isNotFound());
    }

    @Test
    void create_shouldReturn201AndPersistComment() throws Exception {
        User user = persistUser();
        Article article = persistArticle(user);
        CreateCommentRequest request = new CreateCommentRequest("Mon commentaire");

        mockMvc.perform(post("/api/articles/" + article.getId() + "/comments")
                        .with(jwt().jwt(builder -> builder.subject(user.getId().toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.content").value("Mon commentaire"))
                .andExpect(jsonPath("$.authorUsername").value("john"))
                .andExpect(jsonPath("$.articleId").value(article.getId()));
    }

    @Test
    void create_shouldReturn400WhenContentBlank() throws Exception {
        User user = persistUser();
        Article article = persistArticle(user);
        CreateCommentRequest request = new CreateCommentRequest("   ");

        mockMvc.perform(post("/api/articles/" + article.getId() + "/comments")
                        .with(jwt().jwt(builder -> builder.subject(user.getId().toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_shouldReturn404WhenArticleNotFound() throws Exception {
        User user = persistUser();
        CreateCommentRequest request = new CreateCommentRequest("Mon commentaire");

        mockMvc.perform(post("/api/articles/9999/comments")
                        .with(jwt().jwt(builder -> builder.subject(user.getId().toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void create_shouldReturn401WithoutJwt() throws Exception {
        CreateCommentRequest request = new CreateCommentRequest("Mon commentaire");

        mockMvc.perform(post("/api/articles/1/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}

