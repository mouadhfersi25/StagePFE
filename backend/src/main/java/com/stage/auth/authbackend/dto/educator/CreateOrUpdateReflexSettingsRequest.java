package com.stage.auth.authbackend.dto.educator;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrUpdateReflexSettingsRequest {

    @NotNull
    private Long jeuId;

    @NotNull
    private Integer nombreRounds;

    private Integer tempsReactionMaxMs;
    private String typeStimuli;
    private Integer difficulte;
}
