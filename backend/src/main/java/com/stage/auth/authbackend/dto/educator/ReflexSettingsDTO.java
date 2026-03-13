package com.stage.auth.authbackend.dto.educator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReflexSettingsDTO {

    private Long id;
    private Long jeuId;
    private String jeuTitre;

    private Integer nombreRounds;
    private Integer tempsReactionMaxMs;
    private String typeStimuli;
    private Integer difficulte;
}
