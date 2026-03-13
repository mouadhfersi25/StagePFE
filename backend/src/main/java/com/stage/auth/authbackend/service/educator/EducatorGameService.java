package com.stage.auth.authbackend.service.educator;

import com.stage.auth.authbackend.dto.game.GameDTO;
import com.stage.auth.authbackend.entity.Jeu;
import com.stage.auth.authbackend.exception.ApiException;
import com.stage.auth.authbackend.repository.game.JeuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service éducateur : lecture seule des jeux (liste + détail).
 * L'admin crée les jeux ; l'éducateur gère le contenu par type.
 */
@Service
@RequiredArgsConstructor
public class EducatorGameService {

    private final JeuRepository jeuRepository;

    public List<GameDTO> findAllGames() {
        return jeuRepository.findAll().stream()
                .map(EducatorGameService::toDTO)
                .collect(Collectors.toList());
    }

    public GameDTO findGameById(Long id) {
        Jeu jeu = jeuRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Jeu introuvable"));
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
