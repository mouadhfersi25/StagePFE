package com.stage.auth.authbackend.service.educator;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stage.auth.authbackend.dto.educator.CreateQuizQuestionRequest;
import com.stage.auth.authbackend.dto.educator.QuizQuestionDTO;
import com.stage.auth.authbackend.dto.educator.UpdateQuizQuestionRequest;
import com.stage.auth.authbackend.entity.Jeu;
import com.stage.auth.authbackend.entity.Question;
import com.stage.auth.authbackend.entity.TypeJeu;
import com.stage.auth.authbackend.exception.ApiException;
import com.stage.auth.authbackend.repository.game.JeuRepository;
import com.stage.auth.authbackend.repository.game.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EducatorQuestionService {

    private final QuestionRepository questionRepository;
    private final JeuRepository jeuRepository;
    private final ObjectMapper objectMapper;

    public List<QuizQuestionDTO> listByGame(Long jeuId) {
        if (jeuId == null) {
            throw ApiException.badRequest("jeuId est requis");
        }
        Jeu jeu = jeuRepository.findById(jeuId)
                .orElseThrow(() -> ApiException.notFound("Jeu introuvable"));
        if (jeu.getTypeJeu() != TypeJeu.QUIZ) {
            throw ApiException.badRequest("Les questions ne sont disponibles que pour les jeux de type QUIZ");
        }
        return questionRepository.findByJeuId(jeuId).stream()
                .map(q -> toDTO(q, jeu))
                .collect(Collectors.toList());
    }

    public QuizQuestionDTO findById(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Question introuvable"));
        if (question.getJeu() == null || question.getJeu().getTypeJeu() != TypeJeu.QUIZ) {
            throw ApiException.badRequest("Cette question n'est pas liée à un jeu de type QUIZ");
        }
        return toDTO(question, question.getJeu());
    }

    @Transactional
    public QuizQuestionDTO create(CreateQuizQuestionRequest request) {
        if (request == null || request.getJeuId() == null) {
            throw ApiException.badRequest("jeuId est requis");
        }
        Jeu jeu = jeuRepository.findById(request.getJeuId())
                .orElseThrow(() -> ApiException.notFound("Jeu introuvable"));
        if (jeu.getTypeJeu() != TypeJeu.QUIZ) {
            throw ApiException.badRequest("Impossible d'ajouter une question sur un jeu qui n'est pas de type QUIZ");
        }
        Question question = Question.builder()
                .jeu(jeu)
                .contenu(request.getContenu())
                .bonneReponse(request.getBonneReponse())
                .options(optionsToJson(request.getOptions()))
                .explication(request.getExplication())
                .difficulte(request.getDifficulte())
                .build();
        question = questionRepository.save(question);
        return toDTO(question, jeu);
    }

    @Transactional
    public QuizQuestionDTO update(Long id, UpdateQuizQuestionRequest request) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Question introuvable"));
        if (question.getJeu() == null || question.getJeu().getTypeJeu() != TypeJeu.QUIZ) {
            throw ApiException.badRequest("Cette question n'est pas liée à un jeu de type QUIZ");
        }
        if (request.getContenu() != null) {
            question.setContenu(request.getContenu());
        }
        if (request.getBonneReponse() != null) {
            question.setBonneReponse(request.getBonneReponse());
        }
        if (request.getExplication() != null) {
            question.setExplication(request.getExplication());
        }
        if (request.getDifficulte() != null) {
            question.setDifficulte(request.getDifficulte());
        }
        if (request.getOptions() != null) {
            question.setOptions(optionsToJson(request.getOptions()));
        }
        question = questionRepository.save(question);
        return toDTO(question, question.getJeu());
    }

    @Transactional
    public void delete(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Question introuvable"));
        if (question.getJeu() == null || question.getJeu().getTypeJeu() != TypeJeu.QUIZ) {
            throw ApiException.badRequest("Cette question n'est pas liée à un jeu de type QUIZ");
        }
        questionRepository.delete(question);
    }

    private QuizQuestionDTO toDTO(Question question, Jeu jeu) {
        return QuizQuestionDTO.builder()
                .id(question.getId())
                .jeuId(jeu.getId())
                .jeuTitre(jeu.getTitre())
                .contenu(question.getContenu())
                .bonneReponse(question.getBonneReponse())
                .options(jsonToOptions(question.getOptions()))
                .explication(question.getExplication())
                .difficulte(question.getDifficulte())
                .build();
    }

    private String optionsToJson(List<String> options) {
        if (options == null || options.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(options);
        } catch (Exception e) {
            throw ApiException.badRequest("Options invalides");
        }
    }

    private List<String> jsonToOptions(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}

