package com.stage.auth.authbackend.controller.educator;

import com.stage.auth.authbackend.dto.game.CreateGameRequest;
import com.stage.auth.authbackend.dto.game.GameDTO;
import com.stage.auth.authbackend.dto.game.UpdateGameRequest;
import com.stage.auth.authbackend.service.educator.EducatorGameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API éducateur : gestion des jeux.
 * GET /api/educator/games -> GameDTO[]
 * GET /api/educator/games/{id} -> GameDTO
 * POST /api/educator/games -> GameDTO
 * PUT /api/educator/games/{id} -> GameDTO
 * DELETE /api/educator/games/{id} -> Void
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

    @PostMapping
    public ResponseEntity<GameDTO> createGame(@Valid @RequestBody CreateGameRequest request) {
        GameDTO game = educatorGameService.createGame(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(game);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GameDTO> updateGame(@PathVariable Long id, @Valid @RequestBody UpdateGameRequest request) {
        return ResponseEntity.ok(educatorGameService.updateGame(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGame(@PathVariable Long id) {
        educatorGameService.deleteGame(id);
        return ResponseEntity.noContent().build();
    }
}
