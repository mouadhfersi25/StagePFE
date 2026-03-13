package com.stage.auth.authbackend.service.educator;

import com.stage.auth.authbackend.dto.educator.CreateMemoryCardRequest;
import com.stage.auth.authbackend.dto.educator.MemoryCardDTO;
import com.stage.auth.authbackend.dto.educator.UpdateMemoryCardRequest;
import com.stage.auth.authbackend.entity.CarteMemoire;
import com.stage.auth.authbackend.entity.Jeu;
import com.stage.auth.authbackend.entity.TypeJeu;
import com.stage.auth.authbackend.exception.ApiException;
import com.stage.auth.authbackend.repository.game.CarteMemoireRepository;
import com.stage.auth.authbackend.repository.game.JeuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EducatorMemoryService {

    private final CarteMemoireRepository carteMemoireRepository;
    private final JeuRepository jeuRepository;

    public List<MemoryCardDTO> listByGame(Long jeuId) {
        Jeu jeu = validateJeuType(jeuId, TypeJeu.MEMOIRE);
        return carteMemoireRepository.findByJeuId(jeuId).stream()
                .map(c -> toDTO(c, jeu))
                .collect(Collectors.toList());
    }

    @Transactional
    public MemoryCardDTO create(CreateMemoryCardRequest request) {
        if (request == null || request.getJeuId() == null) {
            throw ApiException.badRequest("jeuId est requis");
        }
        Jeu jeu = validateJeuType(request.getJeuId(), TypeJeu.MEMOIRE);
        CarteMemoire carte = CarteMemoire.builder()
                .jeu(jeu)
                .symbole(request.getSymbole())
                .pairKey(request.getPairKey())
                .categorie(request.getCategorie())
                .build();
        carte = carteMemoireRepository.save(carte);
        return toDTO(carte, jeu);
    }

    @Transactional
    public MemoryCardDTO update(Long id, UpdateMemoryCardRequest request) {
        CarteMemoire carte = carteMemoireRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Carte introuvable"));
        if (carte.getJeu() == null || carte.getJeu().getTypeJeu() != TypeJeu.MEMOIRE) {
            throw ApiException.badRequest("Cette carte n'est pas liée à un jeu de type MEMOIRE");
        }
        if (request.getSymbole() != null) carte.setSymbole(request.getSymbole());
        if (request.getPairKey() != null) carte.setPairKey(request.getPairKey());
        if (request.getCategorie() != null) carte.setCategorie(request.getCategorie());
        carte = carteMemoireRepository.save(carte);
        return toDTO(carte, carte.getJeu());
    }

    @Transactional
    public void delete(Long id) {
        CarteMemoire carte = carteMemoireRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Carte introuvable"));
        if (carte.getJeu() == null || carte.getJeu().getTypeJeu() != TypeJeu.MEMOIRE) {
            throw ApiException.badRequest("Cette carte n'est pas liée à un jeu de type MEMOIRE");
        }
        carteMemoireRepository.delete(carte);
    }

    private Jeu validateJeuType(Long jeuId, TypeJeu expected) {
        Jeu jeu = jeuRepository.findById(jeuId)
                .orElseThrow(() -> ApiException.notFound("Jeu introuvable"));
        if (jeu.getTypeJeu() != expected) {
            throw ApiException.badRequest("Le jeu n'est pas de type " + expected.name());
        }
        return jeu;
    }

    private static MemoryCardDTO toDTO(CarteMemoire c, Jeu jeu) {
        return MemoryCardDTO.builder()
                .id(c.getId())
                .jeuId(jeu.getId())
                .jeuTitre(jeu.getTitre())
                .symbole(c.getSymbole())
                .pairKey(c.getPairKey())
                .categorie(c.getCategorie())
                .build();
    }
}
