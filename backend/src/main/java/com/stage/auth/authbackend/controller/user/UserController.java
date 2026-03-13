package com.stage.auth.authbackend.controller.user;

import com.stage.auth.authbackend.dto.user.ChangePasswordRequest;
import com.stage.auth.authbackend.dto.user.PlayerOnboardingRequest;
import com.stage.auth.authbackend.dto.user.UpdateProfileRequest;
import com.stage.auth.authbackend.dto.user.UserDTO;
import com.stage.auth.authbackend.entity.User;
import com.stage.auth.authbackend.exception.ApiException;
import com.stage.auth.authbackend.repository.user.UserRepository;
import com.stage.auth.authbackend.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService; // <-- MISSING FIELD (now added)

    @GetMapping("/me")
    public UserDTO getMe(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("Utilisateur introuvable"));

        return UserDTO.builder()
                .id(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .password(null)
                .telephone(user.getTelephone())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().name())
                .etatCompte(user.getEtatCompte())
                .enabled(user.isEnabled())
                .dateDeNaissance(user.getDateDeNaissance())
                .niveau(user.getNiveau())
                .scoreTotal(user.getScoreTotal())
                .pointsExperience(user.getPointsExperience())
                .idRegion(user.getRegion() != null ? user.getRegion().getId() : null)
                .idPays(user.getRegion() != null && user.getRegion().getPays() != null ? user.getRegion().getPays().getId() : null)
                .onboardingCompleted(user.isOnboardingCompleted())
                .idGenre(user.getGenre() != null ? user.getGenre().getId() : null)
                .resetToken(user.getResetToken())
                .resetTokenExpiry(user.getResetTokenExpiry())
                .tokenVerification(user.getTokenVerification())
                .dateExpirationToken(user.getDateExpirationToken())
                .dateDerniereConnexion(user.getDateDerniereConnexion())
                .dateCreation(user.getDateCreation())
                .build();
    }

    @PutMapping("/update-profile")
    public UserDTO updateProfile(Authentication authentication,
                                 @RequestBody UpdateProfileRequest request) {
        return userService.updateProfile(authentication, request);
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            Authentication authentication,
            @RequestBody ChangePasswordRequest request
    ) {
        userService.changePassword(authentication, request);
        return ResponseEntity.ok(Map.of("message", "Mot de passe changé"));
    }

    @PatchMapping("/me/onboarding")
    public UserDTO completeOnboarding(Authentication authentication,
                                      @RequestBody(required = true) PlayerOnboardingRequest request) {
        return userService.completeOnboarding(authentication, request);
    }
}
