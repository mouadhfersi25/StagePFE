package com.stage.auth.authbackend.dto.user;

import com.stage.auth.authbackend.entity.EtatCompte;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDTO {

    private Long id;

    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String avatarUrl;

    private String role;

    private EtatCompte etatCompte;

    private boolean enabled;

    private LocalDate dateDeNaissance;

    private Integer niveau;
    private Integer scoreTotal;
    private Integer pointsExperience;

    private LocalDateTime dateCreation;
    private LocalDateTime dateDerniereConnexion;
}
