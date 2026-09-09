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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private TopicRepository topicRepository;
    @Mock
    private UserMapper userMapper;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticatedUserProvider authenticatedUserProvider;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("john@doe.com")
                .username("john")
                .password("hashed")
                .subscribedTopics(new HashSet<>())
                .build();
    }

    private UserDto sampleDto() {
        return new UserDto(1L, "john@doe.com", "john", List.of(), null, null);
    }

    @Test
    void getCurrentProfile_shouldReturnMappedDto() {
        when(authenticatedUserProvider.currentUserId()).thenReturn(1L);
        when(userRepository.findByIdWithSubscriptions(1L)).thenReturn(Optional.of(user));
        when(userMapper.toDto(user)).thenReturn(sampleDto());

        UserDto result = userService.getCurrentProfile();

        assertThat(result.username()).isEqualTo("john");
    }

    @Test
    void getCurrentProfile_shouldThrowWhenUserNotFound() {
        when(authenticatedUserProvider.currentUserId()).thenReturn(99L);
        when(userRepository.findByIdWithSubscriptions(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getCurrentProfile())
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateCurrentProfile_shouldUpdateEmailUsernameAndPassword() {
        UpdateProfileRequest request = new UpdateProfileRequest("new@doe.com", "newname", "NewPass1!");
        when(authenticatedUserProvider.currentUserId()).thenReturn(1L);
        when(userRepository.findByIdWithSubscriptions(1L)).thenReturn(Optional.of(user));
        when(userRepository.existsByEmail("new@doe.com")).thenReturn(false);
        when(userRepository.existsByUsername("newname")).thenReturn(false);
        when(passwordEncoder.encode("NewPass1!")).thenReturn("new-hashed");
        when(userRepository.save(user)).thenReturn(user);
        when(userMapper.toDto(user)).thenReturn(sampleDto());

        userService.updateCurrentProfile(request);

        assertThat(user.getEmail()).isEqualTo("new@doe.com");
        assertThat(user.getUsername()).isEqualTo("newname");
        assertThat(user.getPassword()).isEqualTo("new-hashed");
        verify(userRepository).save(user);
    }

    @Test
    void updateCurrentProfile_shouldIgnoreBlankOrUnchangedValues() {
        UpdateProfileRequest request = new UpdateProfileRequest("john@doe.com", "  ", null);
        when(authenticatedUserProvider.currentUserId()).thenReturn(1L);
        when(userRepository.findByIdWithSubscriptions(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);
        when(userMapper.toDto(user)).thenReturn(sampleDto());

        userService.updateCurrentProfile(request);

        assertThat(user.getEmail()).isEqualTo("john@doe.com");
        assertThat(user.getUsername()).isEqualTo("john");
        assertThat(user.getPassword()).isEqualTo("hashed");
        verify(userRepository, never()).existsByEmail(any());
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    void updateCurrentProfile_shouldThrowWhenEmailAlreadyUsed() {
        UpdateProfileRequest request = new UpdateProfileRequest("taken@doe.com", null, null);
        when(authenticatedUserProvider.currentUserId()).thenReturn(1L);
        when(userRepository.findByIdWithSubscriptions(1L)).thenReturn(Optional.of(user));
        when(userRepository.existsByEmail("taken@doe.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.updateCurrentProfile(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("email");

        verify(userRepository, never()).save(any());
    }

    @Test
    void updateCurrentProfile_shouldThrowWhenUsernameAlreadyUsed() {
        UpdateProfileRequest request = new UpdateProfileRequest(null, "taken", null);
        when(authenticatedUserProvider.currentUserId()).thenReturn(1L);
        when(userRepository.findByIdWithSubscriptions(1L)).thenReturn(Optional.of(user));
        when(userRepository.existsByUsername("taken")).thenReturn(true);

        assertThatThrownBy(() -> userService.updateCurrentProfile(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("utilisateur");

        verify(userRepository, never()).save(any());
    }

    @Test
    void subscribe_shouldAddTopicToUser() {
        Topic topic = Topic.builder().id(5L).title("Java").build();
        when(authenticatedUserProvider.currentUserId()).thenReturn(1L);
        when(userRepository.findByIdWithSubscriptions(1L)).thenReturn(Optional.of(user));
        when(topicRepository.findById(5L)).thenReturn(Optional.of(topic));

        userService.subscribe(5L);

        assertThat(user.getSubscribedTopics()).contains(topic);
        verify(userRepository).save(user);
    }

    @Test
    void subscribe_shouldThrowWhenTopicNotFound() {
        when(authenticatedUserProvider.currentUserId()).thenReturn(1L);
        when(userRepository.findByIdWithSubscriptions(1L)).thenReturn(Optional.of(user));
        when(topicRepository.findById(5L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.subscribe(5L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void subscribe_shouldThrowWhenAlreadySubscribed() {
        Topic topic = Topic.builder().id(5L).title("Java").build();
        user.getSubscribedTopics().add(topic);
        when(authenticatedUserProvider.currentUserId()).thenReturn(1L);
        when(userRepository.findByIdWithSubscriptions(1L)).thenReturn(Optional.of(user));
        when(topicRepository.findById(5L)).thenReturn(Optional.of(topic));

        assertThatThrownBy(() -> userService.subscribe(5L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("déjà abonné");

        verify(userRepository, never()).save(any());
    }

    @Test
    void unsubscribe_shouldRemoveTopicFromUser() {
        Topic topic = Topic.builder().id(5L).title("Java").build();
        user.getSubscribedTopics().add(topic);
        when(authenticatedUserProvider.currentUserId()).thenReturn(1L);
        when(userRepository.findByIdWithSubscriptions(1L)).thenReturn(Optional.of(user));
        when(topicRepository.findById(5L)).thenReturn(Optional.of(topic));

        userService.unsubscribe(5L);

        assertThat(user.getSubscribedTopics()).doesNotContain(topic);
        verify(userRepository).save(user);
    }

    @Test
    void unsubscribe_shouldThrowWhenTopicNotFound() {
        when(authenticatedUserProvider.currentUserId()).thenReturn(1L);
        when(userRepository.findByIdWithSubscriptions(1L)).thenReturn(Optional.of(user));
        when(topicRepository.findById(5L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.unsubscribe(5L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void unsubscribe_shouldThrowWhenNotSubscribed() {
        Topic topic = Topic.builder().id(5L).title("Java").build();
        when(authenticatedUserProvider.currentUserId()).thenReturn(1L);
        when(userRepository.findByIdWithSubscriptions(1L)).thenReturn(Optional.of(user));
        when(topicRepository.findById(5L)).thenReturn(Optional.of(topic));

        assertThatThrownBy(() -> userService.unsubscribe(5L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("pas abonné");

        verify(userRepository, never()).save(any());
    }
}

