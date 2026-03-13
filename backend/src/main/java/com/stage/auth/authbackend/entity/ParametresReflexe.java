package com.stage.auth.authbackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "parametres_reflexe")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParametresReflexe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Jeu de type REFLEXE auquel ces paramètres appartiennent.
     */
    @OneToOne(optional = false)
    @JoinColumn(name = "id_jeu", nullable = false, unique = true)
    private Jeu jeu;

    /**
     * Nombre de rounds / essais dans la partie.
     */
    @Column(name = "nombre_rounds", nullable = false)
    private Integer nombreRounds;

    /**
     * Temps de réaction maximum en millisecondes (optionnel).
     */
    @Column(name = "temps_reaction_max_ms")
    private Integer tempsReactionMaxMs;

    /**
     * Type de stimuli utilisés : COULEURS, FORMES, SONS, etc.
     */
    @Column(name = "type_stimuli", length = 50)
    private String typeStimuli;

    /**
     * Niveau de difficulté spécifique (optionnel).
     */
    private Integer difficulte;
}

