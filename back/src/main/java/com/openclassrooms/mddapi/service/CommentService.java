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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final ArticleRepository articleRepository;
    private final CommentMapper commentMapper;
    private final AuthenticatedUserProvider authenticatedUserProvider;

    public CommentService(CommentRepository commentRepository,
                          ArticleRepository articleRepository,
                          CommentMapper commentMapper,
                          AuthenticatedUserProvider authenticatedUserProvider) {
        this.commentRepository = commentRepository;
        this.articleRepository = articleRepository;
        this.commentMapper = commentMapper;
        this.authenticatedUserProvider = authenticatedUserProvider;
    }

    @Transactional(readOnly = true)
    public List<CommentDto> findByArticle(Long articleId) {
        if (!articleRepository.existsById(articleId)) {
            throw ResourceNotFoundException.of("Article", articleId);
        }
        return commentMapper.toDtoList(commentRepository.findByArticleIdOrderByCreatedAtAsc(articleId));
    }

    @Transactional
    public CommentDto create(Long articleId, CreateCommentRequest request) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> ResourceNotFoundException.of("Article", articleId));
        User author = authenticatedUserProvider.currentUser();

        Comment comment = Comment.builder()
                .content(request.content())
                .article(article)
                .author(author)
                .build();

        return commentMapper.toDto(commentRepository.save(comment));
    }
}

