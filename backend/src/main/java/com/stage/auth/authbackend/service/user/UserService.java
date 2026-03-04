package com.stage.auth.authbackend.service.user;

import com.stage.auth.authbackend.dto.user.ChangePasswordRequest;
import com.stage.auth.authbackend.dto.user.UpdateProfileRequest;
import com.stage.auth.authbackend.dto.user.UserDTO;
import com.stage.auth.authbackend.entity.User;
import com.stage.auth.authbackend.exception.ApiException;
import com.stage.auth.authbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserDTO updateProfile(Authentication authentication, UpdateProfileRequest request) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("Utilisateur introuvable"));

        // Mise à jour des champs modifiables
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setTelephone(request.getTelephone());
        user.setAvatarUrl(request.getAvatarUrl());

        userRepository.save(user);

        return UserDTO.builder()
                .id(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .telephone(user.getTelephone())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().name())
                .etatCompte(user.getEtatCompte())
                .enabled(user.isEnabled())
                .dateDeNaissance(user.getDateDeNaissance())
                .niveau(user.getNiveau())
                .scoreTotal(user.getScoreTotal())
                .pointsExperience(user.getPointsExperience())
                .dateCreation(user.getDateCreation())
                .dateDerniereConnexion(user.getDateDerniereConnexion())
                .build();
    }
    @Transactional
    public void changePassword(Authentication authentication, ChangePasswordRequest request) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("Utilisateur introuvable"));

        // Vérifier mot de passe actuel
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw ApiException.badRequest("Mot de passe actuel incorrect");
        }

        // Vérifier que le nouveau mot de passe est différent
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw ApiException.badRequest("Le nouveau mot de passe doit être différent de l'ancien");
        }

        // Encoder nouveau mot de passe
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        userRepository.save(user);
    }


}
