package com.stage.auth.authbackend.service.educator;

import com.stage.auth.authbackend.dto.educator.CreateOrUpdateReflexSettingsRequest;
import com.stage.auth.authbackend.dto.educator.ReflexSettingsDTO;
import com.stage.auth.authbackend.entity.Jeu;
import com.stage.auth.authbackend.entity.ParametresReflexe;
import com.stage.auth.authbackend.entity.TypeJeu;
import com.stage.auth.authbackend.exception.ApiException;
import com.stage.auth.authbackend.repository.game.JeuRepository;
import com.stage.auth.authbackend.repository.game.ParametresReflexeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EducatorReflexService {

    private final ParametresReflexeRepository parametresReflexeRepository;
    private final JeuRepository jeuRepository;

    public ReflexSettingsDTO getByGame(Long jeuId) {
        Jeu jeu = validateJeuType(jeuId, TypeJeu.REFLEXE);
        return parametresReflexeRepository.findByJeuId(jeuId)
                .map(p -> toDTO(p, jeu))
                .orElse(null);
    }

    @Transactional
    public ReflexSettingsDTO createOrUpdate(CreateOrUpdateReflexSettingsRequest request) {
        if (request == null || request.getJeuId() == null) {
            throw ApiException.badRequest("jeuId est requis");
        }
        if (request.getNombreRounds() == null) {
            throw ApiException.badRequest("nombreRounds est requis");
        }
        Jeu jeu = validateJeuType(request.getJeuId(), TypeJeu.REFLEXE);
        ParametresReflexe params = parametresReflexeRepository.findByJeuId(jeu.getId()).orElse(null);
        if (params == null) {
            params = ParametresReflexe.builder()
                    .jeu(jeu)
                    .nombreRounds(request.getNombreRounds())
                    .tempsReactionMaxMs(request.getTempsReactionMaxMs())
                    .typeStimuli(request.getTypeStimuli())
                    .difficulte(request.getDifficulte())
                    .build();
        } else {
            params.setNombreRounds(request.getNombreRounds());
            if (request.getTempsReactionMaxMs() != null) params.setTempsReactionMaxMs(request.getTempsReactionMaxMs());
            if (request.getTypeStimuli() != null) params.setTypeStimuli(request.getTypeStimuli());
            if (request.getDifficulte() != null) params.setDifficulte(request.getDifficulte());
        }
        params = parametresReflexeRepository.save(params);
        return toDTO(params, jeu);
    }

    private Jeu validateJeuType(Long jeuId, TypeJeu expected) {
        Jeu jeu = jeuRepository.findById(jeuId)
                .orElseThrow(() -> ApiException.notFound("Jeu introuvable"));
        if (jeu.getTypeJeu() != expected) {
            throw ApiException.badRequest("Le jeu n'est pas de type " + expected.name());
        }
        return jeu;
    }

    private static ReflexSettingsDTO toDTO(ParametresReflexe p, Jeu jeu) {
        return ReflexSettingsDTO.builder()
                .id(p.getId())
                .jeuId(jeu.getId())
                .jeuTitre(jeu.getTitre())
                .nombreRounds(p.getNombreRounds())
                .tempsReactionMaxMs(p.getTempsReactionMaxMs())
                .typeStimuli(p.getTypeStimuli())
                .difficulte(p.getDifficulte())
                .build();
    }
}
