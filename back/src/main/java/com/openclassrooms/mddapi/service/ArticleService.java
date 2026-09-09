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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final TopicRepository topicRepository;
    private final ArticleMapper articleMapper;
    private final AuthenticatedUserProvider authenticatedUserProvider;

    public ArticleService(ArticleRepository articleRepository,
                          TopicRepository topicRepository,
                          ArticleMapper articleMapper,
                          AuthenticatedUserProvider authenticatedUserProvider) {
        this.articleRepository = articleRepository;
        this.topicRepository = topicRepository;
        this.articleMapper = articleMapper;
        this.authenticatedUserProvider = authenticatedUserProvider;
    }

    /**
     * Fil d'actualité de l'utilisateur connecté (articles des thèmes suivis).
     */
    @Transactional(readOnly = true)
    public Page<ArticleDto> getFeed(Pageable pageable) {
        Long userId = authenticatedUserProvider.currentUserId();
        return articleRepository.findFeedForUser(userId, pageable).map(articleMapper::toDto);
    }

    @Transactional(readOnly = true)
    public ArticleDto findById(Long id) {
        Article article = articleRepository.findWithDetailsById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Article", id));
        return articleMapper.toDto(article);
    }

    @Transactional
    public ArticleDto create(CreateArticleRequest request) {
        User author = authenticatedUserProvider.currentUser();
        Topic topic = topicRepository.findById(request.topicId())
                .orElseThrow(() -> ResourceNotFoundException.of("Thème", request.topicId()));

        Article article = Article.builder()
                .title(request.title())
                .content(request.content())
                .author(author)
                .topic(topic)
                .build();

        return articleMapper.toDto(articleRepository.save(article));
    }
}

