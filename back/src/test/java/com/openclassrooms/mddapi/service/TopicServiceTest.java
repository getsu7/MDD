package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.TopicDto;
import com.openclassrooms.mddapi.mapper.TopicMapper;
import com.openclassrooms.mddapi.model.Topic;
import com.openclassrooms.mddapi.repository.TopicRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TopicServiceTest {

    @Mock
    private TopicRepository topicRepository;
    @Mock
    private TopicMapper topicMapper;

    @InjectMocks
    private TopicService topicService;

    @Test
    void findAll_shouldReturnMappedTopicsSortedByRepository() {
        List<Topic> topics = List.of(
                Topic.builder().id(1L).title("Angular").build(),
                Topic.builder().id(2L).title("Java").build());
        List<TopicDto> dtos = List.of(
                new TopicDto(1L, "Angular", "desc"),
                new TopicDto(2L, "Java", "desc"));
        when(topicRepository.findAllByOrderByTitleAsc()).thenReturn(topics);
        when(topicMapper.toDtoList(topics)).thenReturn(dtos);

        List<TopicDto> result = topicService.findAll();

        assertThat(result).hasSize(2);
        assertThat(result).extracting(TopicDto::title).containsExactly("Angular", "Java");
    }

    @Test
    void findAll_shouldReturnEmptyListWhenNoTopic() {
        when(topicRepository.findAllByOrderByTitleAsc()).thenReturn(List.of());
        when(topicMapper.toDtoList(List.of())).thenReturn(List.of());

        assertThat(topicService.findAll()).isEmpty();
    }
}

