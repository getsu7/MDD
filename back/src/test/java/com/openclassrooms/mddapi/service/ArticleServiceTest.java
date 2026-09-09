package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.ArticleDto;
import com.openclassrooms.mddapi.dto.CreateArticleRequest;
import com.openclassrooms.mddapi.exception.ResourceNotFoundException;
import com.openclassrooms.mddapi.mapper.ArticleMapper;
import com.openclassrooms.mddapi.model.Article;
import com.openclassrooms.mddapi.model.Topic;
import com.openclassrooms.mddapi.model.User;
import com.openclassrooms.mddapi.repository.ArticleRepository;
import com.openclassrooms.mddapi.repository.TopicRepository;
import com.openclassrooms.mddapi.security.AuthenticatedUserProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ArticleServiceTest {

    @Mock
    private ArticleRepository articleRepository;
    @Mock
    private TopicRepository topicRepository;
    @Mock
    private ArticleMapper articleMapper;
    @Mock
    private AuthenticatedUserProvider authenticatedUserProvider;

    @InjectMocks
    private ArticleService articleService;

    private ArticleDto sampleDto() {
        return new ArticleDto(1L, "Titre", "Contenu", 1L, "john", 5L, "Java",
                LocalDateTime.now(), LocalDateTime.now());
    }

    @Test
    void getFeed_shouldReturnMappedPageForCurrentUser() {
        Pageable pageable = PageRequest.of(0, 10);
        Article article = Article.builder().id(1L).title("Titre").build();
        Page<Article> page = new PageImpl<>(List.of(article), pageable, 1);
        when(authenticatedUserProvider.currentUserId()).thenReturn(1L);
        when(articleRepository.findFeedForUser(1L, pageable)).thenReturn(page);
        when(articleMapper.toDto(article)).thenReturn(sampleDto());

        Page<ArticleDto> result = articleService.getFeed(pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).title()).isEqualTo("Titre");
    }

    @Test
    void findById_shouldReturnMappedArticle() {
        Article article = Article.builder().id(1L).title("Titre").build();
        when(articleRepository.findWithDetailsById(1L)).thenReturn(Optional.of(article));
        when(articleMapper.toDto(article)).thenReturn(sampleDto());

        ArticleDto result = articleService.findById(1L);

        assertThat(result.id()).isEqualTo(1L);
    }

    @Test
    void findById_shouldThrowWhenArticleNotFound() {
        when(articleRepository.findWithDetailsById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> articleService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_shouldPersistArticleWithAuthorAndTopic() {
        CreateArticleRequest request = new CreateArticleRequest("Titre", "Contenu", 5L);
        User author = User.builder().id(1L).username("john").build();
        Topic topic = Topic.builder().id(5L).title("Java").build();
        when(authenticatedUserProvider.currentUser()).thenReturn(author);
        when(topicRepository.findById(5L)).thenReturn(Optional.of(topic));
        when(articleRepository.save(any(Article.class))).thenAnswer(invocation -> {
            Article a = invocation.getArgument(0);
            a.setId(1L);
            return a;
        });
        when(articleMapper.toDto(any(Article.class))).thenReturn(sampleDto());

        ArticleDto result = articleService.create(request);

        assertThat(result).isNotNull();
        ArgumentCaptor<Article> captor = ArgumentCaptor.forClass(Article.class);
        verify(articleRepository).save(captor.capture());
        assertThat(captor.getValue().getTitle()).isEqualTo("Titre");
        assertThat(captor.getValue().getContent()).isEqualTo("Contenu");
        assertThat(captor.getValue().getAuthor()).isEqualTo(author);
        assertThat(captor.getValue().getTopic()).isEqualTo(topic);
    }

    @Test
    void create_shouldThrowWhenTopicNotFound() {
        CreateArticleRequest request = new CreateArticleRequest("Titre", "Contenu", 5L);
        User author = User.builder().id(1L).username("john").build();
        when(authenticatedUserProvider.currentUser()).thenReturn(author);
        when(topicRepository.findById(5L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> articleService.create(request))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(articleRepository, never()).save(any());
    }
}

