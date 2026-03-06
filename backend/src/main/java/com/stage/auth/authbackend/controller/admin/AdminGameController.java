package com.stage.auth.authbackend.controller.admin;

import com.stage.auth.authbackend.dto.game.CreateGameRequest;
import com.stage.auth.authbackend.dto.game.GameDTO;
import com.stage.auth.authbackend.dto.game.UpdateGameRequest;
import com.stage.auth.authbackend.service.admin.AdminGameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API admin pour la gestion des jeux (Manage Games).
 * Toutes les routes nécessitent le rôle ADMIN.
 */
@RestController
@RequestMapping("/api/admin/games")
@RequiredArgsConstructor
public class AdminGameController {

    private final AdminGameService adminGameService;

    /**
     * GET /api/admin/games
     * Liste tous les jeux.
     */
    @GetMapping
    public ResponseEntity<List<GameDTO>> getAllGames() {
        return ResponseEntity.ok(adminGameService.findAllGames());
    }

    /**
     * GET /api/admin/games/{id}
     * Détail d'un jeu.
     */
    @GetMapping("/{id}")
    public ResponseEntity<GameDTO> getGameById(@PathVariable Long id) {
        return ResponseEntity.ok(adminGameService.findGameById(id));
    }

    /**
     * POST /api/admin/games
     * Crée un nouveau jeu.
     */
    @PostMapping
    public ResponseEntity<GameDTO> createGame(@Valid @RequestBody CreateGameRequest request) {
        GameDTO game = adminGameService.createGame(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(game);
    }

    /**
     * PUT /api/admin/games/{id}
     * Met à jour un jeu.
     */
    @PutMapping("/{id}")
    public ResponseEntity<GameDTO> updateGame(@PathVariable Long id, @Valid @RequestBody UpdateGameRequest request) {
        return ResponseEntity.ok(adminGameService.updateGame(id, request));
    }

    /**
     * DELETE /api/admin/games/{id}
     * Supprime un jeu.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGame(@PathVariable Long id) {
        adminGameService.deleteGame(id);
        return ResponseEntity.noContent().build();
    }
}
