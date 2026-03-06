package com.stage.auth.authbackend.dto.game;

import com.stage.auth.authbackend.entity.ModeJeu;
import com.stage.auth.authbackend.entity.TypeJeu;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO pour l'API Manage Games.
 * Aligné sur l'entité Jeu (table jeux).
 * Utilisé en réponse : GET /api/admin/games, GET /api/admin/games/{id}.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GameDTO {

    private Long id;

    private String titre;
    private String description;

    private Integer difficulte;
    private Integer ageMin;
    private Integer ageMax;

    private TypeJeu typeJeu;
    private ModeJeu modeJeu;

    private boolean actif;

    private Integer dureeMinutes;

    private String icone;

    private LocalDateTime dateCreation;
}
