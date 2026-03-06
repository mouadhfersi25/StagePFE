package com.stage.auth.authbackend.service.admin;

import com.stage.auth.authbackend.dto.game.CreateGameRequest;
import com.stage.auth.authbackend.dto.game.GameDTO;
import com.stage.auth.authbackend.dto.game.UpdateGameRequest;
import com.stage.auth.authbackend.entity.Jeu;
import com.stage.auth.authbackend.exception.ApiException;
import com.stage.auth.authbackend.repository.JeuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminGameService {

    private final JeuRepository jeuRepository;

    /**
     * Liste tous les jeux (réservé à l'admin).
     */
    public List<GameDTO> findAllGames() {
        return jeuRepository.findAll().stream()
                .map(AdminGameService::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère un jeu par id (réservé à l'admin).
     */
    public GameDTO findGameById(Long id) {
        Jeu jeu = jeuRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Jeu introuvable"));
        return toDTO(jeu);
    }

    /**
     * Met à jour un jeu (réservé à l'admin). Seuls les champs non null du request sont appliqués.
     */
    public GameDTO updateGame(Long id, UpdateGameRequest request) {
        Jeu jeu = jeuRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Jeu introuvable"));
        if (request.getTitre() != null) jeu.setTitre(request.getTitre().trim());
        if (request.getDescription() != null) jeu.setDescription(request.getDescription().trim());
        if (request.getDifficulte() != null) jeu.setDifficulte(request.getDifficulte());
        if (request.getAgeMin() != null) jeu.setAgeMin(request.getAgeMin());
        if (request.getAgeMax() != null) jeu.setAgeMax(request.getAgeMax());
        if (request.getTypeJeu() != null) jeu.setTypeJeu(request.getTypeJeu());
        if (request.getModeJeu() != null) jeu.setModeJeu(request.getModeJeu());
        if (request.getDureeMinutes() != null) jeu.setDureeMinutes(request.getDureeMinutes());
        if (request.getIcone() != null) jeu.setIcone(request.getIcone().trim().isEmpty() ? null : request.getIcone().trim());
        if (request.getActif() != null) jeu.setActif(request.getActif());
        jeu = jeuRepository.save(jeu);
        return toDTO(jeu);
    }

    /**
     * Supprime un jeu (réservé à l'admin).
     */
    public void deleteGame(Long id) {
        Jeu jeu = jeuRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Jeu introuvable"));
        jeuRepository.delete(jeu);
    }

    /**
     * Crée un nouveau jeu (réservé à l'admin).
     */
    public GameDTO createGame(CreateGameRequest request) {
        Jeu jeu = Jeu.builder()
                .titre(request.getTitre().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .difficulte(request.getDifficulte())
                .ageMin(request.getAgeMin())
                .ageMax(request.getAgeMax())
                .typeJeu(request.getTypeJeu())
                .modeJeu(request.getModeJeu())
                .dureeMinutes(request.getDureeMinutes())
                .icone(request.getIcone() != null && !request.getIcone().trim().isEmpty() ? request.getIcone().trim() : null)
                .actif(request.getActif() != null ? request.getActif() : true)
                .dateCreation(LocalDateTime.now())
                .build();
        jeu = jeuRepository.save(jeu);
        return toDTO(jeu);
    }

    private static GameDTO toDTO(Jeu jeu) {
        return GameDTO.builder()
                .id(jeu.getId())
                .titre(jeu.getTitre())
                .description(jeu.getDescription())
                .difficulte(jeu.getDifficulte())
                .ageMin(jeu.getAgeMin())
                .ageMax(jeu.getAgeMax())
                .typeJeu(jeu.getTypeJeu())
                .modeJeu(jeu.getModeJeu())
                .actif(jeu.isActif())
                .dureeMinutes(jeu.getDureeMinutes())
                .icone(jeu.getIcone())
                .dateCreation(jeu.getDateCreation())
                .build();
    }
}
