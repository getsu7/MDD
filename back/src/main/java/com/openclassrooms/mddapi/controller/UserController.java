package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.dto.UpdateProfileRequest;
import com.openclassrooms.mddapi.dto.UserDto;
import com.openclassrooms.mddapi.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@Tag(name = "Utilisateur", description = "Profil et abonnements")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @Operation(summary = "Récupérer le profil de l'utilisateur connecté")
    public ResponseEntity<UserDto> me() {
        return ResponseEntity.ok(userService.getCurrentProfile());
    }

    @PutMapping("/me")
    @Operation(summary = "Mettre à jour le profil de l'utilisateur connecté")
    public ResponseEntity<UserDto> updateMe(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateCurrentProfile(request));
    }

    @PostMapping("/subscriptions/{topicId}")
    @Operation(summary = "S'abonner à un thème")
    public ResponseEntity<Void> subscribe(@PathVariable Long topicId) {
        userService.subscribe(topicId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/subscriptions/{topicId}")
    @Operation(summary = "Se désabonner d'un thème")
    public ResponseEntity<Void> unsubscribe(@PathVariable Long topicId) {
        userService.unsubscribe(topicId);
        return ResponseEntity.noContent().build();
    }
}

