package com.openclassrooms.mddapi.repository;

import com.openclassrooms.mddapi.model.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ArticleRepository extends JpaRepository<Article, Long> {

    /**
     * Fil d'actualité : articles des thèmes auxquels l'utilisateur est abonné.
     */
    @EntityGraph(attributePaths = {"author", "topic"})
    @Query("""
            select a from Article a
            where a.topic.id in (
                select t.id from User u join u.subscribedTopics t where u.id = :userId
            )
            """)
    Page<Article> findFeedForUser(@Param("userId") Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"author", "topic"})
    Optional<Article> findWithDetailsById(Long id);
}

