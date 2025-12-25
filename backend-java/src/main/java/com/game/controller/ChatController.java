package com.game.controller;

import com.game.dto.ChatRequest;
import com.game.dto.ChatResponse;
import com.game.service.AIService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ChatController {

    private final AIService aiService;

    public ChatController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public ChatResponse chat(@RequestBody ChatRequest request) {
        String answer = aiService.getAnswer(request.message());
        return new ChatResponse(answer);
    }
}
