package com.game.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.http.MediaType;
import java.util.List;
import java.util.Map;

@Service
public class AIService {

    @Value("${openai.api.key:}")
    private String apiKey;

    @Value("${openai.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    private final RestClient restClient = RestClient.create();

    public String getAnswer(String question) {
        if (apiKey == null || apiKey.isEmpty()) {
            return "Reference Code 883: To enable real AI responses, please set 'openai.api.key' in application.properties. For free AI, try using Groq!";
        }

        try {
            // Determine model based on URL (Groq uses different models, but we can default or make it configurable)
            String model = baseUrl.contains("groq") ? "llama-3.3-70b-versatile" : "gpt-4o";

            var requestBody = Map.of(
                "model", model,
                "messages", List.of(
                    Map.of("role", "system", "content", "You are an expert on the card game Monopoly Deal. Answer short, concise questions about the rules."),
                    Map.of("role", "user", "content", question)
                )
            );

            var response = restClient.post()
                .uri(baseUrl + "/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(Map.class);

            if (response != null && response.containsKey("choices")) {
                List<?> choices = (List<?>) response.get("choices");
                if (!choices.isEmpty()) {
                     Map<?, ?> firstChoice = (Map<?, ?>) choices.get(0);
                     Map<?, ?> message = (Map<?, ?>) firstChoice.get("message");
                     return (String) message.get("content");
                }
            }
            return "I couldn't get a clear answer from the rules database.";
        } catch (Exception e) {
            e.printStackTrace();
            return "Network Error: Unable to reach the AI rule server. Please try again later. (" + e.getMessage() + ")";
        }
    }
}
