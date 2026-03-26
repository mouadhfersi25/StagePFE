package com.stage.auth.authbackend.service.educator;

import com.stage.auth.authbackend.dto.game.GameDTO;
import com.stage.auth.authbackend.dto.game.CreateGameRequest;
import com.stage.auth.authbackend.dto.game.UpdateGameRequest;
import com.stage.auth.authbackend.entity.Jeu;
import com.stage.auth.authbackend.exception.ApiException;
import com.stage.auth.authbackend.repository.game.JeuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
     * Service éducateur : gestion complète des jeux.
 * L'admin crée les jeux ; l'éducateur gère le contenu par type.
 */
@Service
@RequiredArgsConstructor
public class EducatorGameService {

    private final JeuRepository jeuRepository;
    private final jakarta.persistence.EntityManager entityManager;

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
        
        // Reset state to pending so admin can validate the changes
        jeu.setEtat(com.stage.auth.authbackend.entity.EtatJeu.EN_ATTENTE);
        
        jeu = jeuRepository.save(jeu);
        return toDTO(jeu);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteGame(Long id) {
        Jeu jeu = jeuRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Jeu introuvable"));

        // Hibernate refuse la suppression d'un jeu lié car les relations ne sont pas en CascadeType.REMOVE ou Bidirectionnel complet.
        // On supprime proprement toutes les dépendances via EntityManager natif (plus léger et sécurisé pour un Hard Delete)

        // 1. Dépendances de SessionJeu (Niveau 2)
        entityManager.createQuery("DELETE FROM StatistiquesPerformance s WHERE s.sessionJeu.id IN (SELECT sj.id FROM SessionJeu sj WHERE sj.jeu.id = :id)")
                .setParameter("id", id).executeUpdate();
        entityManager.createQuery("DELETE FROM InteractionJeu i WHERE i.sessionJeu.id IN (SELECT sj.id FROM SessionJeu sj WHERE sj.jeu.id = :id)")
                .setParameter("id", id).executeUpdate();

        // 2. Dépendances directes de Jeu (Niveau 1)
        entityManager.createQuery("DELETE FROM SessionJeu sj WHERE sj.jeu.id = :id")
                .setParameter("id", id).executeUpdate();
        entityManager.createQuery("DELETE FROM EvenementReflexe e WHERE e.jeu.id = :id")
                .setParameter("id", id).executeUpdate();
        entityManager.createQuery("DELETE FROM ParametresReflexe p WHERE p.jeu.id = :id")
                .setParameter("id", id).executeUpdate();
        entityManager.createQuery("DELETE FROM PuzzleLogique p WHERE p.jeu.id = :id")
                .setParameter("id", id).executeUpdate();
        entityManager.createQuery("DELETE FROM CarteMemoire c WHERE c.jeu.id = :id")
                .setParameter("id", id).executeUpdate();
        entityManager.createQuery("DELETE FROM Question q WHERE q.jeu.id = :id")
                .setParameter("id", id).executeUpdate();
        entityManager.createQuery("DELETE FROM Tournoi t WHERE t.jeu.id = :id")
                .setParameter("id", id).executeUpdate();

        // 3. Suppression du jeu lui-même
        jeuRepository.delete(jeu);
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
                .etat(jeu.getEtat())
                .dateCreation(jeu.getDateCreation())
                .build();
    }
}
