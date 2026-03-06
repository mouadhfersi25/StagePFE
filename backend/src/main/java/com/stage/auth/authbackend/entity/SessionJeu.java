package com.stage.auth.authbackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sessions_jeu")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionJeu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_debut")
    private LocalDateTime dateDebut;

    @Column(name = "date_fin")
    private LocalDateTime dateFin;

    @Column(name = "score_global")
    private Integer scoreGlobal;

    @Column(name = "niveau_atteint")
    private Integer niveauAtteint;

    @Enumerated(EnumType.STRING)
    @Column(name = "etat_session", nullable = false)
    private EtatSession etatSession;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private User utilisateur;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_jeu", nullable = false)
    private Jeu jeu;
}

