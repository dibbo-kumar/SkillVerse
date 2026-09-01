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
        String descLower = issueDescription.toLowerCase().trim();
        double baseCost = 400.0;
        double partCost = 0.0;
        double urgencyMultiplier = 1.0;
        String diagnosticSummary = "Standard inspection & routine maintenance evaluation.";
        double confidence = 0.92;

        if (descLower.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("description", "General maintenance inspection");
            response.put("diagnosticSummary", "Routine home inspection and safety diagnostic check.");
            response.put("baseServiceCost", 350.0);
            response.put("estimatedSparePartsCost", 0.0);
            response.put("totalEstimatedCost", 350.0);
            response.put("confidenceScore", 0.85);
            return ResponseEntity.ok(response);
        }

        // Urgency / Emergency Detection
        if (descLower.contains("emergency") || descLower.contains("urgent") || descLower.contains("burst") || descLower.contains("fire") || descLower.contains("smoke") || descLower.contains("spark")) {
            urgencyMultiplier = 1.25;
        }

        // Category & Diagnostic Logic
        if (descLower.contains("ac") || descLower.contains("air condition") || descLower.contains("hvac") || descLower.contains("cooling") || descLower.contains("compressor")) {
            baseCost = 750.0;
            diagnosticSummary = "HVAC System Diagnostic: Inspection of indoor blower, condenser coils, and electrical capacitors.";
            
            if (descLower.contains("not cooling") || descLower.contains("warm air") || descLower.contains("gas leak") || descLower.contains("refrigerant")) {
                baseCost = 900.0;
                partCost = 1400.0; // Gas top-up / flare seal
                diagnosticSummary += " High probability of R410A/R22 refrigerant depletion or flare nut leak.";
                confidence = 0.96;
            } else if (descLower.contains("noise") || descLower.contains("vibration") || descLower.contains("fan")) {
                baseCost = 650.0;
                partCost = 450.0;
                diagnosticSummary += " Outdoor unit motor bearing or fan blade replacement likely required.";
            } else if (descLower.contains("water leak") || descLower.contains("dripping")) {
                baseCost = 600.0;
                partCost = 250.0;
                diagnosticSummary += " Drainage pipe blockage or condensate line deep jet cleaning needed.";
            }
        } else if (descLower.contains("pipe") || descLower.contains("plumb") || descLower.contains("water") || descLower.contains("leak") || descLower.contains("tap") || descLower.contains("sink") || descLower.contains("toilet") || descLower.contains("pump")) {
            baseCost = 450.0;
            diagnosticSummary = "Plumbing Diagnostic: Water line pressure testing & leak trace.";

            if (descLower.contains("burst") || descLower.contains("concealed") || descLower.contains("wall leak")) {
                baseCost = 850.0;
                partCost = 1200.0;
                diagnosticSummary += " Concealed pipe repair with pressure test verification.";
                confidence = 0.94;
            } else if (descLower.contains("pump") || descLower.contains("motor")) {
                baseCost = 800.0;
                partCost = 2500.0;
                diagnosticSummary += " Submersible / surface pump motor coil check & capacitor replacement.";
            } else if (descLower.contains("tap") || descLower.contains("faucet") || descLower.contains("flush")) {
                baseCost = 350.0;
                partCost = 300.0;
                diagnosticSummary += " Fixture washer replacement & sanitary valve fitting.";
            }
        } else if (descLower.contains("short circuit") || descLower.contains("electr") || descLower.contains("breaker") || descLower.contains("wire") || descLower.contains("switch") || descLower.contains("fan") || descLower.contains("light")) {
            baseCost = 500.0;
            diagnosticSummary = "Electrical System Diagnostic: Circuit load balance & safety insulation audit.";

            if (descLower.contains("short circuit") || descLower.contains("spark") || descLower.contains("tripping")) {
                baseCost = 700.0;
                partCost = 650.0;
                diagnosticSummary += " MCB main breaker replacement & neutral wire fault isolation.";
                confidence = 0.95;
            } else if (descLower.contains("generator") || descLower.contains("ips") || descLower.contains("inverter")) {
                baseCost = 950.0;
                partCost = 1800.0;
                diagnosticSummary += " Automatic transfer switch (ATS) relay tuning & battery diagnostic.";
            }
        } else if (descLower.contains("wash") || descLower.contains("fridge") || descLower.contains("refrigerator") || descLower.contains("microwave") || descLower.contains("oven") || descLower.contains("appliance")) {
            baseCost = 550.0;
            diagnosticSummary = "Home Appliance Diagnostic: Power board testing & heating/cooling loop check.";

            if (descLower.contains("fridge") || descLower.contains("refrigerator")) {
                baseCost = 700.0;
                partCost = 1600.0;
                diagnosticSummary += " Thermostat control relay or gas line recharging required.";
            } else if (descLower.contains("wash")) {
                baseCost = 600.0;
                partCost = 900.0;
                diagnosticSummary += " Drum belt tensioning or drain pump motor filter clearing.";
            }
        } else if (descLower.contains("paint") || descLower.contains("wall") || descLower.contains("dampness") || descLower.contains("wood") || descLower.contains("carpenter") || descLower.contains("furniture")) {
            baseCost = 600.0;
            partCost = 1000.0;
            diagnosticSummary = "Interior Finishing & Carpentry Diagnostic: Surface putty application, moisture treatment & hardware fittings.";
        }

        double totalBase = Math.round(baseCost * urgencyMultiplier);
        double totalCost = totalBase + partCost;

        Map<String, Object> response = new HashMap<>();
        response.put("description", issueDescription);
        response.put("diagnosticSummary", diagnosticSummary);
        response.put("baseServiceCost", totalBase);
        response.put("estimatedSparePartsCost", partCost);
        response.put("totalEstimatedCost", totalCost);
        response.put("confidenceScore", Math.min(0.98, confidence));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/chatbot")
    public ResponseEntity<?> chatbotResponse(@RequestBody Map<String, String> request) {
        String msg = request.getOrDefault("message", "").toLowerCase().trim();
        String responseText;

        if (msg.isEmpty()) {
            responseText = "Hello! I am SkillVerse AI Diagnostic Specialist 🤖. How can I assist you today? You can describe any household problem (e.g., 'AC is leaking water', 'Short circuit in DB box', 'Water pump not lifting water').";
        } else if (msg.contains("ac") || msg.contains("air condition") || msg.contains("hvac") || msg.contains("cool")) {
            responseText = "⚡ **HVAC AI Diagnostic**: For AC cooling issues or water leaks, typical base servicing starts at **BDT 750 - BDT 900**.\n\n" +
                    "🛠️ **Recommended Steps**:\n" +
                    "1. Turn off breaker if gas smell or burning odor is present.\n" +
                    "2. Chemical foam jet wash for condenser coils.\n" +
                    "3. Recommended Expert: **Tariqul Islam** or **Kamrul Islam** (4.9⭐ HVAC Specialists).\n\n" +
                    "Would you like to book an expert technician now?";
        } else if (msg.contains("plumb") || msg.contains("water") || msg.contains("pipe") || msg.contains("leak") || msg.contains("pump") || msg.contains("tap")) {
            responseText = "💧 **Plumbing AI Diagnostic**: Water leaks or pump failures require immediate isolation. Base rates range from **BDT 450 - BDT 850** depending on concealed wall work.\n\n" +
                    "🛠️ **Recommended Steps**:\n" +
                    "1. Close main overhead gate valve.\n" +
                    "2. Check pressure joint & motor capacitor.\n" +
                    "3. Recommended Expert: **Mohammad Rafiq** or **Mahfuzur Rahman** (4.9⭐ Master Plumbers).\n\n" +
                    "Shall I match you with a nearby plumber?";
        } else if (msg.contains("electr") || msg.contains("spark") || msg.contains("circuit") || msg.contains("breaker") || msg.contains("fan") || msg.contains("ips")) {
            responseText = "⚡ **Electrical Safety AI Diagnostic**: For tripping breakers or short circuits, electrical safety standard audit base rate is **BDT 500 - BDT 700**.\n\n" +
                    "⚠️ **Safety Notice**: Do not re-flip tripped main breakers continuously. Keep damp hands away from switchboards.\n\n" +
                    "Recommended Expert: **Tanvir Ahmed** or **Kamrul Islam** (Verified Smart Home & Electrical Engineers).";
        } else if (msg.contains("cost") || msg.contains("price") || msg.contains("rate") || msg.contains("charge") || msg.contains("fee")) {
            responseText = "💰 **SkillVerse AI Transparent Pricing**:\n" +
                    "• AC & HVAC Servicing: BDT 750 - 1,500\n" +
                    "• Plumbing & Pipe Repair: BDT 450 - 1,200\n" +
                    "• Electrical Troubleshooting: BDT 500 - 900\n" +
                    "• Painting & Carpentry: BDT 400 - 1,000/day\n\n" +
                    "You can also use our **Verdict Price** tool on top of this tab for instant AI calculation!";
        } else if (msg.contains("emergency") || msg.contains("urgent") || msg.contains("now") || msg.contains("fast")) {
            responseText = "🚨 **Emergency Protocol Active**: Instant matching available within 5km! Choose any worker marked with 🟢 **Online** in the grid below to get immediate dispatch.";
        } else {
            responseText = "🤖 **SkillVerse AI Assistant**: I analyzed your request ('" + request.getOrDefault("message", "") + "').\n\n" +
                    "Based on our database of verified Bangladeshi technicians, we can dispatch certified specialists for AC, Plumbing, Electrical, Home Appliances, Painting, or Carpentry.\n\n" +
                    "Try clicking **Verdict Price** above or select a technician from the grid below!";
        }

        Map<String, String> response = new HashMap<>();
        response.put("response", responseText);
        return ResponseEntity.ok(response);
    }
}

