package com.stage.auth.authbackend.controller.educator;

import com.stage.auth.authbackend.dto.game.GameDTO;
import com.stage.auth.authbackend.service.educator.EducatorGameService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API éducateur : jeux (lecture seule). Synchronisé frontend educatorApi.getGames(), getGameById(id).
 * GET /api/educator/games -> GameDTO[]
 * GET /api/educator/games/{id} -> GameDTO
 */
@RestController
@RequestMapping("/api/educator/games")
@RequiredArgsConstructor
public class EducatorGameController {

    private final EducatorGameService educatorGameService;

    @GetMapping
    public ResponseEntity<List<GameDTO>> listGames() {
        return ResponseEntity.ok(educatorGameService.findAllGames());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GameDTO> getGameById(@PathVariable Long id) {
        return ResponseEntity.ok(educatorGameService.findGameById(id));
    }
}
