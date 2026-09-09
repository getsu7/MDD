package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.CommentDto;
import com.openclassrooms.mddapi.dto.CreateCommentRequest;
import com.openclassrooms.mddapi.exception.ResourceNotFoundException;
import com.openclassrooms.mddapi.mapper.CommentMapper;
import com.openclassrooms.mddapi.model.Article;
import com.openclassrooms.mddapi.model.Comment;
import com.openclassrooms.mddapi.model.User;
import com.openclassrooms.mddapi.repository.ArticleRepository;
import com.openclassrooms.mddapi.repository.CommentRepository;
import com.openclassrooms.mddapi.security.AuthenticatedUserProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;
    @Mock
    private ArticleRepository articleRepository;
    @Mock
    private CommentMapper commentMapper;
    @Mock
    private AuthenticatedUserProvider authenticatedUserProvider;

    @InjectMocks
    private CommentService commentService;

    private CommentDto sampleDto() {
        return new CommentDto(1L, "Super article", 1L, "john", 10L, LocalDateTime.now());
    }

    @Test
    void findByArticle_shouldReturnMappedComments() {
        Comment comment = Comment.builder().id(1L).content("Super article").build();
        when(articleRepository.existsById(10L)).thenReturn(true);
        when(commentRepository.findByArticleIdOrderByCreatedAtAsc(10L)).thenReturn(List.of(comment));
        when(commentMapper.toDtoList(List.of(comment))).thenReturn(List.of(sampleDto()));

        List<CommentDto> result = commentService.findByArticle(10L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).content()).isEqualTo("Super article");
    }

    @Test
    void findByArticle_shouldThrowWhenArticleNotFound() {
        when(articleRepository.existsById(10L)).thenReturn(false);

        assertThatThrownBy(() -> commentService.findByArticle(10L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(commentRepository, never()).findByArticleIdOrderByCreatedAtAsc(any());
    }

    @Test
    void create_shouldPersistCommentWithAuthorAndArticle() {
        CreateCommentRequest request = new CreateCommentRequest("Super article");
        Article article = Article.builder().id(10L).title("Titre").build();
        User author = User.builder().id(1L).username("john").build();
        when(articleRepository.findById(10L)).thenReturn(Optional.of(article));
        when(authenticatedUserProvider.currentUser()).thenReturn(author);
        when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> {
            Comment c = invocation.getArgument(0);
            c.setId(1L);
            return c;
        });
        when(commentMapper.toDto(any(Comment.class))).thenReturn(sampleDto());

        CommentDto result = commentService.create(10L, request);

        assertThat(result).isNotNull();
        ArgumentCaptor<Comment> captor = ArgumentCaptor.forClass(Comment.class);
        verify(commentRepository).save(captor.capture());
        assertThat(captor.getValue().getContent()).isEqualTo("Super article");
        assertThat(captor.getValue().getArticle()).isEqualTo(article);
        assertThat(captor.getValue().getAuthor()).isEqualTo(author);
    }

    @Test
    void create_shouldThrowWhenArticleNotFound() {
        CreateCommentRequest request = new CreateCommentRequest("Super article");
        when(articleRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commentService.create(10L, request))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(commentRepository, never()).save(any());
    }
}

