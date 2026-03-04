package com.stage.auth.authbackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private LocalDate dateDeNaissance;

    @Builder.Default
    @Column(nullable = false)
    private boolean enabled = false;

    // Gamification (uniquement JOUEUR) => champs nullable
    private Integer niveau;
    private Integer scoreTotal;
    private Integer pointsExperience;

    @Column(columnDefinition = "TEXT")
    private String avatarUrl;
    private String telephone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EtatCompte etatCompte = EtatCompte.ACTIF;

    private String resetToken;
    private LocalDateTime resetTokenExpiry;

    private String tokenVerification;
    private LocalDateTime dateExpirationToken;

    private LocalDateTime dateDerniereConnexion;

    @Column(updatable = false)
    private LocalDateTime dateCreation;

    @PrePersist
    protected void onCreate() {
        this.dateCreation = LocalDateTime.now();
        if (this.etatCompte == null) this.etatCompte = EtatCompte.ACTIF;

        // init gamification selon rôle
        if (this.role == Role.JOUEUR) {
            if (this.niveau == null) this.niveau = 1;
            if (this.scoreTotal == null) this.scoreTotal = 0;
            if (this.pointsExperience == null) this.pointsExperience = 0;
        } else {
            this.niveau = null;
            this.scoreTotal = null;
            this.pointsExperience = null;
        }
    }
}
