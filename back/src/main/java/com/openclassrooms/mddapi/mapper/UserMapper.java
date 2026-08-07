package com.openclassrooms.mddapi.mapper;

import com.openclassrooms.mddapi.dto.TopicDto;
import com.openclassrooms.mddapi.dto.UserDto;
import com.openclassrooms.mddapi.model.Topic;
import com.openclassrooms.mddapi.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.Comparator;
import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    @Mapping(target = "subscribedTopics", source = "subscribedTopics")
    UserDto toDto(User user);

    /**
     * Les abonnements sont exposés triés par titre pour un affichage stable.
     */
    default List<TopicDto> mapSubscribedTopics(Set<Topic> topics) {
        if (topics == null) {
            return List.of();
        }
        return topics.stream()
                .sorted(Comparator.comparing(Topic::getTitle))
                .map(topic -> new TopicDto(topic.getId(), topic.getTitle(), topic.getDescription()))
                .toList();
    }
}
