package com.openclassrooms.mddapi.repository;

import com.openclassrooms.mddapi.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    /**
     * Recherche par email OU username (le login accepte les deux).
     */
    @Query("select u from User u where u.email = :identifier or u.username = :identifier")
    Optional<User> findByEmailOrUsername(@Param("identifier") String identifier);

    /**
     * Charge un utilisateur avec ses abonnements (évite le LazyInitializationException).
     */
    @Query("select u from User u left join fetch u.subscribedTopics where u.id = :id")
    Optional<User> findByIdWithSubscriptions(@Param("id") Long id);
}

