package com.stage.auth.authbackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "puzzles_logiques")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PuzzleLogique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Jeu de type LOGIQUE auquel ce puzzle appartient.
     */
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_jeu", nullable = false)
    private Jeu jeu;

    /**
     * Énoncé textuel du puzzle.
     */
    @Column(name = "enonce", columnDefinition = "TEXT", nullable = false)
    private String enonce;

    /**
     * Données ou séquence du puzzle (JSON ou description simple).
     */
    @Column(name = "donnees", columnDefinition = "TEXT")
    private String donnees;

    /**
     * Bonne réponse attendue (texte).
     */
    @Column(name = "bonne_reponse", columnDefinition = "TEXT", nullable = false)
    private String bonneReponse;

    /**
     * Indice optionnel affichable aux élèves.
     */
    @Column(name = "indice", columnDefinition = "TEXT")
    private String indice;

    /**
     * Difficulté spécifique au puzzle (optionnelle).
     */
    private Integer difficulte;
}

