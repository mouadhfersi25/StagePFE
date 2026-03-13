package com.stage.auth.authbackend.controller.educator;

import com.stage.auth.authbackend.dto.educator.CreateQuizQuestionRequest;
import com.stage.auth.authbackend.dto.educator.QuizQuestionDTO;
import com.stage.auth.authbackend.dto.educator.UpdateQuizQuestionRequest;
import com.stage.auth.authbackend.service.educator.EducatorQuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API éducateur : questions quiz. Synchronisé frontend educatorApi (getQuestions, getQuestionById, createQuestion, updateQuestion, deleteQuestion).
 * GET /api/educator/questions?gameId= -> QuizQuestionDTO[]
 * GET /api/educator/questions/{id} -> QuizQuestionDTO
 * POST /api/educator/questions -> 201 QuizQuestionDTO
 * PUT /api/educator/questions/{id} -> QuizQuestionDTO
 * DELETE /api/educator/questions/{id} -> 204
 */
@RestController
@RequestMapping("/api/educator/questions")
@RequiredArgsConstructor
public class EducatorQuestionController {

    private final EducatorQuestionService educatorQuestionService;

    @GetMapping
    public ResponseEntity<List<QuizQuestionDTO>> listByGame(@RequestParam Long gameId) {
        return ResponseEntity.ok(educatorQuestionService.listByGame(gameId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizQuestionDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(educatorQuestionService.findById(id));
    }

    @PostMapping
    public ResponseEntity<QuizQuestionDTO> create(@Valid @RequestBody CreateQuizQuestionRequest request) {
        QuizQuestionDTO dto = educatorQuestionService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuizQuestionDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateQuizQuestionRequest request
    ) {
        return ResponseEntity.ok(educatorQuestionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        educatorQuestionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
