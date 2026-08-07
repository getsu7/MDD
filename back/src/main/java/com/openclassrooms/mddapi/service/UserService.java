package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.UpdateProfileRequest;
import com.openclassrooms.mddapi.dto.UserDto;
import com.openclassrooms.mddapi.exception.BadRequestException;
import com.openclassrooms.mddapi.exception.ResourceNotFoundException;
import com.openclassrooms.mddapi.mapper.UserMapper;
import com.openclassrooms.mddapi.model.Topic;
import com.openclassrooms.mddapi.model.User;
import com.openclassrooms.mddapi.repository.TopicRepository;
import com.openclassrooms.mddapi.repository.UserRepository;
import com.openclassrooms.mddapi.security.AuthenticatedUserProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * Profil utilisateur et gestion des abonnements aux thèmes.
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final TopicRepository topicRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticatedUserProvider authenticatedUserProvider;

    public UserService(UserRepository userRepository,
                       TopicRepository topicRepository,
                       UserMapper userMapper,
                       PasswordEncoder passwordEncoder,
                       AuthenticatedUserProvider authenticatedUserProvider) {
        this.userRepository = userRepository;
        this.topicRepository = topicRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.authenticatedUserProvider = authenticatedUserProvider;
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentProfile() {
        return userMapper.toDto(loadCurrentUserWithSubscriptions());
    }

    @Transactional
    public UserDto updateCurrentProfile(UpdateProfileRequest request) {
        User user = loadCurrentUserWithSubscriptions();

        if (StringUtils.hasText(request.email()) && !request.email().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.email())) {
                throw new BadRequestException("Cet email est déjà utilisé");
            }
            user.setEmail(request.email());
        }

        if (StringUtils.hasText(request.username()) && !request.username().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.username())) {
                throw new BadRequestException("Ce nom d'utilisateur est déjà utilisé");
            }
            user.setUsername(request.username());
        }

        if (StringUtils.hasText(request.password())) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }

        return userMapper.toDto(userRepository.save(user));
    }

    @Transactional
    public void subscribe(Long topicId) {
        User user = loadCurrentUserWithSubscriptions();
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> ResourceNotFoundException.of("Thème", topicId));

        if (!user.getSubscribedTopics().add(topic)) {
            throw new BadRequestException("Vous êtes déjà abonné à ce thème");
        }
        userRepository.save(user);
    }

    @Transactional
    public void unsubscribe(Long topicId) {
        User user = loadCurrentUserWithSubscriptions();
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> ResourceNotFoundException.of("Thème", topicId));

        if (!user.getSubscribedTopics().remove(topic)) {
            throw new BadRequestException("Vous n'êtes pas abonné à ce thème");
        }
        userRepository.save(user);
    }

    private User loadCurrentUserWithSubscriptions() {
        Long id = authenticatedUserProvider.currentUserId();
        return userRepository.findByIdWithSubscriptions(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Utilisateur", id));
    }
}

