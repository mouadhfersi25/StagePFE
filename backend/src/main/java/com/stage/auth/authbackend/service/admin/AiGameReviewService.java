package com.stage.auth.authbackend.service.admin;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stage.auth.authbackend.dto.game.GameAiReviewDTO;
import com.stage.auth.authbackend.entity.CarteMemoire;
import com.stage.auth.authbackend.entity.EtatJeu;
import com.stage.auth.authbackend.entity.Jeu;
import com.stage.auth.authbackend.entity.Question;
import com.stage.auth.authbackend.entity.TypeJeu;
import com.stage.auth.authbackend.exception.ApiException;
import com.stage.auth.authbackend.repository.game.CarteMemoireRepository;
import com.stage.auth.authbackend.repository.game.JeuRepository;
import com.stage.auth.authbackend.repository.game.QuestionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiGameReviewService {

    private static final String GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

    private final ObjectMapper objectMapper;
    private final JeuRepository jeuRepository;
    private final QuestionRepository questionRepository;
    private final CarteMemoireRepository carteMemoireRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ai.gemini.api-key:}")
    private String apiKey;

    @Value("${ai.gemini.model:gemini-2.5-flash}")
    private String model;

    @Value("${ai.gemini.enabled:false}")
    private boolean enabled;

    public GameAiReviewDTO reviewGame(Long gameId) {
        if (!enabled) throw ApiException.badRequest("Le module IA Gemini est désactivé");
        if (apiKey == null || apiKey.isBlank()) throw ApiException.badRequest("Clé API Gemini absente");
        if (gameId == null) throw ApiException.badRequest("gameId est requis");

        Jeu jeu = jeuRepository.findById(gameId).orElseThrow(() -> ApiException.notFound("Jeu introuvable"));
        if (jeu.getEtat() != EtatJeu.EN_ATTENTE) {
            throw ApiException.badRequest("L'analyse IA est autorisée uniquement pour les jeux finalisés en attente de validation admin.");
        }
        String prompt = buildReviewPrompt(jeu);
        String rawText = callGemini(prompt);

        try {
            JsonNode root = objectMapper.readTree(extractJson(rawText));
            int score = clamp(root.path("score").asInt(50), 0, 100);
            String riskLevel = normalizeRisk(root.path("riskLevel").asText("MEDIUM"));
            String suggestedAction = normalizeAction(root.path("suggestedAction").asText("REVIEW_REQUIRED"));
            String summary = clean(root.path("summary").asText("Analyse IA disponible."));
            List<String> strengths = jsonArrayToList(root.path("strengths"));
            List<String> issues = jsonArrayToList(root.path("issues"));
            List<String> recommendations = jsonArrayToList(root.path("recommendations"));

            return GameAiReviewDTO.builder()
                    .gameId(jeu.getId())
                    .gameTitle(jeu.getTitre())
                    .model(model)
                    .score(score)
                    .riskLevel(riskLevel)
                    .suggestedAction(suggestedAction)
                    .summary(summary)
                    .strengths(strengths)
                    .issues(issues)
                    .recommendations(recommendations)
                    .build();
        } catch (Exception e) {
            log.warn("AI game review parse failed for game {}: {}", gameId, e.getMessage());
            throw ApiException.internalServerError("Réponse IA invalide pour l'analyse du jeu");
        }
    }

    private String buildReviewPrompt(Jeu jeu) {
        String meta = """
                Métadonnées jeu:
                - Titre: %s
                - Description: %s
                - Type: %s
                - Mode: %s
                - Difficulté: %s
                - Age min/max: %s / %s
                - Durée (minutes): %s
                - Etat actuel: %s
                """.formatted(
                safe(jeu.getTitre()),
                safe(jeu.getDescription()),
                safe(jeu.getTypeJeu() != null ? jeu.getTypeJeu().name() : null),
                safe(jeu.getModeJeu() != null ? jeu.getModeJeu().name() : null),
                safe(jeu.getDifficulte() != null ? String.valueOf(jeu.getDifficulte()) : null),
                safe(jeu.getAgeMin() != null ? String.valueOf(jeu.getAgeMin()) : null),
                safe(jeu.getAgeMax() != null ? String.valueOf(jeu.getAgeMax()) : null),
                safe(jeu.getDureeMinutes() != null ? String.valueOf(jeu.getDureeMinutes()) : null),
                safe(jeu.getEtat() != null ? jeu.getEtat().name() : null)
        );

        String content;
        if (jeu.getTypeJeu() == TypeJeu.QUIZ) {
            List<Question> questions = questionRepository.findByJeuId(jeu.getId());
            StringBuilder sb = new StringBuilder("Contenu QUIZ:\n");
            if (questions.isEmpty()) {
                sb.append("- Aucune question ajoutée\n");
            } else {
                int i = 1;
                for (Question q : questions) {
                    sb.append("- Q").append(i++).append(": ").append(safe(q.getContenu()))
                            .append(" | bonneReponse=").append(safe(q.getBonneReponse()))
                            .append(" | difficulte=").append(safe(q.getDifficulte() != null ? q.getDifficulte().toString() : null))
                            .append("\n");
                }
            }
            content = sb.toString();
        } else if (jeu.getTypeJeu() == TypeJeu.MEMOIRE) {
            List<CarteMemoire> cards = carteMemoireRepository.findByJeuId(jeu.getId());
            StringBuilder sb = new StringBuilder("Contenu MEMOIRE:\n");
            if (cards.isEmpty()) {
                sb.append("- Aucune carte ajoutée\n");
            } else {
                int i = 1;
                for (CarteMemoire c : cards) {
                    sb.append("- C").append(i++).append(": symbole=").append(safe(c.getSymbole()))
                            .append(" | pairKey=").append(safe(c.getPairKey()))
                            .append(" | categorie=").append(safe(c.getCategorie()))
                            .append("\n");
                }
            }
            content = sb.toString();
        } else {
            content = "Contenu détaillé non extrait pour ce type de jeu. Évaluer selon les métadonnées disponibles.";
        }

        return """
                Tu es un assistant de modération pédagogique. Analyse ce jeu éducatif et retourne UNIQUEMENT un JSON valide.
                Objectif: aider l'admin à décider si le jeu peut être accepté ou nécessite des corrections.

                Critères à évaluer:
                1) Cohérence métadonnées <-> contenu
                2) Adéquation difficulté / tranche d'âge / durée
                3) Qualité pédagogique (clarté, absence d'ambiguïté)
                4) Sécurité / contenu inadapté
                5) Complétude du contenu

                %s

                %s

                FORMAT JSON OBLIGATOIRE:
                {
                  "score": 0,
                  "riskLevel": "LOW|MEDIUM|HIGH",
                  "suggestedAction": "REVIEW_OK|REVIEW_REQUIRED|HIGH_RISK",
                  "summary": "Résumé clair pour admin",
                  "strengths": ["point fort 1", "point fort 2"],
                  "issues": ["problème 1", "problème 2"],
                  "recommendations": ["action 1", "action 2"]
                }
                """.formatted(meta, content);
    }

    private String callGemini(String prompt) {
        try {
            String url = GEMINI_BASE_URL + "/" + model + ":generateContent?key=" + apiKey;
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, Object> body = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))
            );
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);
            String raw = response.getBody();
            if (raw == null || raw.isBlank()) throw ApiException.internalServerError("Réponse vide Gemini");

            JsonNode root = objectMapper.readTree(raw);
            String text = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText("");
            if (text.isBlank()) throw ApiException.internalServerError("Réponse Gemini non lisible");
            return text;
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Gemini review call failed: {}", e.getMessage());
            throw ApiException.internalServerError("Échec appel Gemini: " + e.getMessage());
        }
    }

    private List<String> jsonArrayToList(JsonNode node) {
        List<String> out = new ArrayList<>();
        if (node != null && node.isArray()) {
            for (JsonNode item : node) {
                String value = clean(item.asText(""));
                if (value != null && !value.isBlank()) out.add(value);
            }
        }
        return out;
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    private String normalizeRisk(String risk) {
        String r = safe(risk).toUpperCase();
        if (!r.equals("LOW") && !r.equals("MEDIUM") && !r.equals("HIGH")) return "MEDIUM";
        return r;
    }

    private String normalizeAction(String action) {
        String a = safe(action).toUpperCase();
        if (!a.equals("REVIEW_OK") && !a.equals("REVIEW_REQUIRED") && !a.equals("HIGH_RISK")) return "REVIEW_REQUIRED";
        return a;
    }

    private String extractJson(String rawText) {
        String text = rawText == null ? "" : rawText.trim();
        if (text.startsWith("```")) {
            int firstNewline = text.indexOf('\n');
            int lastFence = text.lastIndexOf("```");
            if (firstNewline > 0 && lastFence > firstNewline) {
                text = text.substring(firstNewline + 1, lastFence).trim();
            }
        }
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start >= 0 && end > start) return text.substring(start, end + 1);
        return text;
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "non renseigné" : value.trim();
    }

    private String clean(String value) {
        if (value == null) return null;
        String v = value.trim();
        return v.isBlank() ? null : v;
    }
}
