package com.skillverse.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {

    @GetMapping("/estimate-cost")
    public ResponseEntity<?> estimateCost(@RequestParam String issueDescription) {
        String descLower = issueDescription.toLowerCase();
        double baseCost = 350.0;
        double partCost = 0.0;
        String diagnosticSummary = "General inspection and maintenance.";

        if (descLower.contains("ac") || descLower.contains("air condition")) {
            baseCost = 800.0;
            diagnosticSummary = "AC unit service: cooling gas diagnostics & filter cleaning.";
            if (descLower.contains("not cooling") || descLower.contains("leak")) {
                partCost = 1500.0;
                diagnosticSummary += " Potential refrigerant recharging and capacitor check required.";
            }
        } else if (descLower.contains("pipe") || descLower.contains("water") || descLower.contains("leak")) {
            baseCost = 450.0;
            diagnosticSummary = "Plumbing service: pipeline inspection and joint sealing.";
            if (descLower.contains("burst") || descLower.contains("pump")) {
                partCost = 3000.0;
                diagnosticSummary += " High-pressure pipe replacement or motor servicing required.";
            }
        } else if (descLower.contains("short circuit") || descLower.contains("wire") || descLower.contains("electricity")) {
            baseCost = 600.0;
            diagnosticSummary = "Electrical safety audit and circuit breaker troubleshooting.";
            partCost = 500.0;
        }

        double total = baseCost + partCost;

        Map<String, Object> response = new HashMap<>();
        response.put("description", issueDescription);
        response.put("diagnosticSummary", diagnosticSummary);
        response.put("baseServiceCost", baseCost);
        response.put("estimatedSparePartsCost", partCost);
        response.put("totalEstimatedCost", total);
        response.put("confidenceScore", 0.94);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/chatbot")
    public ResponseEntity<?> chatbotResponse(@RequestBody Map<String, String> request) {
        String msg = request.getOrDefault("message", "").toLowerCase();
        String responseText = "Welcome to SkillVerse AI Assistant. I can help estimate service costs, match verified workers, or troubleshoot home repairs. Try asking: 'Estimate cost for AC not cooling' or 'I need an emergency plumber'.";

        if (msg.contains("ac") || msg.contains("air")) {
            responseText = "For AC problems, it looks like you need an HVAC certified technician. Common servicing starts from BDT 800. Would you like me to recommend a top-rated technician?";
        } else if (msg.contains("plumb") || msg.contains("pipe") || msg.contains("water")) {
            responseText = "If you have a water leak or pump failure, I can dispatch an emergency plumber. Typical plumbing repair base rate is BDT 450. Shall I look for workers near you?";
        } else if (msg.contains("emergency") || msg.contains("urgent")) {
            responseText = "🚨 Emergency Dispatch Active! Please select 'Emergency Booking' from the home screen to match the closest active technician within 5km instantly.";
        }

        Map<String, String> response = new HashMap<>();
        response.put("response", responseText);
        return ResponseEntity.ok(response);
    }
}
