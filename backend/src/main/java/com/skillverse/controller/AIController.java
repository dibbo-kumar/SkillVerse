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
        String rawMsg = request.getOrDefault("message", "").trim();
        String msg = rawMsg.toLowerCase();
        String responseText;

        if (msg.isEmpty()) {
            responseText = "Hello! I am your **SkillVerse Smart Diagnostic Assistant** 🤖.\n\n" +
                    "Tell me what household issue or question you have (e.g., *'AC is blowing warm air'*, *'Bathroom pipe leak'*, *'Circuit breaker trips'*), and I will provide an instant diagnostic analysis, safety recommendations, and estimated costs.";
        }
        // Greetings
        else if (msg.matches("^(hi|hello|hey|salam|assalamu alaikum|good morning|good afternoon|good evening|ola|hlw).*") || msg.equals("hi") || msg.equals("hello") || msg.equals("salam")) {
            responseText = "👋 **Salam & Welcome to SkillVerse Diagnostic Center!**\n\n" +
                    "How can I assist you with your home services today? You can ask me about:\n\n" +
                    "• ❄️ **HVAC & AC** (gas leaks, warm air, coil wash, cooling issues)\n" +
                    "• ⚡ **Electrical** (tripped breakers, wiring short circuits, IPS, fans)\n" +
                    "• 💧 **Plumbing** (pipe bursts, low pressure, water motor pumps, concealed leaks)\n" +
                    "• 🔥 **Gas & Geyser** (stove burners, gas geyser ignition, element scale)\n" +
                    "• 🧊 **Appliances** (refrigerators, washing machines, microwave ovens)\n" +
                    "• 💳 **Escrow Security & 30-Day Guarantee** policies\n\n" +
                    "Feel free to describe what's happening!";
        }
        // AC & HVAC
        else if (msg.contains("ac") || msg.contains("air condition") || msg.contains("cool") || msg.contains("compressor") || msg.contains("hvac") || msg.contains("filter")) {
            responseText = "❄️ **Smart HVAC & AC Diagnostic**:\n\n" +
                    "• **Probable Cause**: Dirty outdoor condenser coil, depleted R410A/R32 refrigerant gas, clogged drainage line, or weak capacitor.\n" +
                    "• **Actionable Safety Protocol**:\n" +
                    "  1. If you detect ice on copper lines or burning odors, turn off the AC breaker immediately.\n" +
                    "  2. Remove and wash the indoor nylon dust mesh filter under tap water.\n" +
                    "• **Estimated Repair Cost**: BDT 600 - 1,200 (includes chemical jet wash, pressure test, or gas top-up).\n" +
                    "• **Recommended Expert**: Tariqul Islam (4.9⭐) or Kamrul Islam (4.8⭐).\n\n" +
                    "👉 You can book an HVAC specialist directly from the technician list below or post a problem with photos!";
        }
        // Plumbing & Water Lines
        else if (msg.contains("plumb") || msg.contains("water") || msg.contains("pipe") || msg.contains("leak") || msg.contains("pump") || msg.contains("tap") || msg.contains("drain") || msg.contains("sewer") || msg.contains("sink") || msg.contains("toilet") || msg.contains("commode") || msg.contains("faucet")) {
            responseText = "💧 **Smart Plumbing & Leakage Diagnostic**:\n\n" +
                    "• **Probable Cause**: High water line pressure rupture, failed CPVC solvent weld, worn Teflon/rubber washer, or motor airlock.\n" +
                    "• **Actionable Safety Protocol**:\n" +
                    "  1. Turn off your main overhead/submersible water gate valve immediately to prevent floor water damage.\n" +
                    "  2. Avoid pouring harsh corrosive acids into concealed PVC drain lines.\n" +
                    "• **Estimated Repair Cost**: BDT 350 - 900 (concealed leak acoustic trace, PPR pipe fusion, or tap fitting replacement).\n" +
                    "• **Recommended Expert**: Mohammad Rafiq (4.9⭐ Master Plumber).\n\n" +
                    "👉 Select a verified plumber below to dispatch live to your location!";
        }
        // Electrical & Wiring
        else if (msg.contains("electr") || msg.contains("spark") || msg.contains("circuit") || msg.contains("breaker") || msg.contains("short") || msg.contains("switch") || msg.contains("fan") || msg.contains("ips") || msg.contains("wiring") || msg.contains("power") || msg.contains("voltage") || msg.contains("light")) {
            responseText = "⚡ **Electrical Circuit & Safety Diagnostic**:\n\n" +
                    "• **Probable Cause**: Overloaded single-phase line, loose neutral terminal in the DB box, grounded wiring insulation fault, or failing MCB.\n" +
                    "• **⚠️ Critical Safety Notice**:\n" +
                    "  1. **Do not** repeatedly force-reset a tripped MCB breaker if it immediately clicks off.\n" +
                    "  2. Keep hands completely dry and unplug high-wattage appliances (iron, microwave, water geyser).\n" +
                    "• **Estimated Repair Cost**: BDT 400 - 850 (Megger line insulation test, MCB breaker replacement, or switchboard re-routing).\n" +
                    "• **Recommended Expert**: Tanvir Ahmed (4.95⭐ Industrial & Residential Electrician).\n\n" +
                    "👉 Tap any verified electrician below for immediate doorstep inspection!";
        }
        // Gas, Stove, Geyser
        else if (msg.contains("gas") || msg.contains("geyser") || msg.contains("stove") || msg.contains("burner") || msg.contains("heater") || msg.contains("cylinder")) {
            responseText = "🔥 **Gas Appliance & Geyser Diagnostic**:\n\n" +
                    "• **Probable Cause**: Carbon-clogged brass burner orifice, failing thermocouple valve, dead auto-ignition battery, or scale-encrusted water heating element.\n" +
                    "• **⚠️ Safety Alert**: If you smell gas odor, immediately shut off the cylinder regulator/main gas line, open all windows, and **do NOT** flip any electric switches.\n" +
                    "• **Estimated Repair Cost**: BDT 350 - 750 (jet nozzle clearing, auto-spark repair, or heating element replacement).\n" +
                    "• **Recommended Expert**: Zubaer Rahman (4.82⭐ Certified Gas & Geyser Specialist).";
        }
        // Refrigerator & Freezer
        else if (msg.contains("fridge") || msg.contains("refrigerator") || msg.contains("freezer") || msg.contains("deep fridge")) {
            responseText = "🧊 **Refrigerator & Deep Freezer Diagnostic**:\n\n" +
                    "• **Probable Cause**: Faulty defrost thermostat sensor, relay failure on inverter PCB, clogged capillary tube, or low R600a eco-gas.\n" +
                    "• **Recommended Check**: Verify if the compressor vibrates/hums every 10-15 minutes and ensure at least 4 inches wall clearance.\n" +
                    "• **Estimated Repair Cost**: BDT 700 - 1,600 (gas charging, relay replacement, or defrost sensor renewal).\n" +
                    "• **Recommended Expert**: Tariqul Islam & Kamrul Islam.";
        }
        // Washing Machine & Microwave
        else if (msg.contains("wash") || msg.contains("microwave") || msg.contains("oven") || msg.contains("appliance") || msg.contains("dryer")) {
            responseText = "🧺 **Home Appliance Diagnostic**:\n\n" +
                    "• **Probable Cause**: Worn washing machine drive belt, drain pump lint blockage, broken door interlock switch, or magnetron failure.\n" +
                    "• **Estimated Repair Cost**: BDT 500 - 1,200.\n" +
                    "• **Recommended Expert**: Kamrul Islam (4.8⭐ Home Appliance Technician).";
        }
        // Deep Cleaning & Jet Wash
        else if (msg.contains("clean") || msg.contains("tank") || msg.contains("sofa") || msg.contains("deep clean") || msg.contains("carpet") || msg.contains("jet wash")) {
            responseText = "🧹 **Deep Cleaning & Tank Jet Wash Services**:\n\n" +
                    "• **Available Services**: Overhead & Underground Water Tank High-Pressure Jet Wash, Fabric Sofa Extraction Shampooing, and Kitchen Degreasing.\n" +
                    "• **Equipment**: Commercial 150-bar jet washers and anti-bacterial eco detergents.\n" +
                    "• **Estimated Rate**: BDT 400 - 1,500 based on capacity and volume.\n" +
                    "• **Recommended Expert**: Ariful Islam (4.9⭐ Cleaning Specialist).";
        }
        // Escrow, Payment & Financial Security
        else if (msg.contains("escrow") || msg.contains("payment") || msg.contains("pay") || msg.contains("bkash") || msg.contains("nagad") || msg.contains("money") || msg.contains("cost") || msg.contains("advance") || msg.contains("refund")) {
            responseText = "💳 **How SkillVerse Secure Escrow Works**:\n\n" +
                    "1. **Direct Negotiation**: You agree on fair service terms with the technician.\n" +
                    "2. **Advance Escrow Protection**: Initial base advance is locked securely in SkillVerse Escrow.\n" +
                    "3. **Dual OTP Handshake**: Give the Start OTP upon worker arrival; share the Completion OTP only after you inspect and approve the finished job.\n" +
                    "4. **Multiple Payment Options**: Settle seamlessly using bKash, Nagad, Rocket, or Bank Transfer.";
        }
        // 30-Day Guarantee & Warranty
        else if (msg.contains("guarantee") || msg.contains("warranty") || msg.contains("trust") || msg.contains("safe") || msg.contains("insurance")) {
            responseText = "🛡️ **SkillVerse 30-Day Service Guarantee**:\n\n" +
                    "• Every completed and verified job on SkillVerse includes a **30-Day Free Rework Guarantee**.\n" +
                    "• If the same issue reoccurs within 30 days, we send a senior technician for a free re-inspection and correction.\n" +
                    "• All technicians undergo verified NID background screening.";
        }
        // Tool Store & Spare Parts
        else if (msg.contains("tool") || msg.contains("store") || msg.contains("buy") || msg.contains("part") || msg.contains("capacitor") || msg.contains("wire") || msg.contains("pipe") || msg.contains("shop")) {
            responseText = "🛒 **SkillVerse Certified Tool Store**:\n\n" +
                    "• You can browse and purchase genuine OEM capacitors, circuit breakers, copper fittings, and diagnostic multimeters in the **Tool Store** tab.\n" +
                    "• Enjoy fast delivery across Bangladesh with cash on delivery, bKash, or worker wallet balance options!";
        }
        // Academy & Training
        else if (msg.contains("course") || msg.contains("learn") || msg.contains("academy") || msg.contains("certificate") || msg.contains("video") || msg.contains("training")) {
            responseText = "🎓 **SkillVerse Academy & Certification**:\n\n" +
                    "• Upgrade your skills with hands-on video courses covering HVAC Servicing, Advanced Inverter Diagnostics, and Safe Electrical Wiring.\n" +
                    "• Complete lessons and earn verified technician badges to boost customer trust!";
        }
        // Emergency Assistance
        else if (msg.contains("emergency") || msg.contains("urgent") || msg.contains("fast") || msg.contains("now") || msg.contains("danger")) {
            responseText = "🚨 **Emergency Fast-Track Response**:\n\n" +
                    "• Nearby verified technicians within 500m - 3km are on standby for urgent calls.\n" +
                    "• Check the technician cards below, select an available pro in your area, and click **Book Service** for fast doorstep arrival!";
        }
        // Explicit Fallback for Unrecognized / Vague / Gibberish Input
        else {
            responseText = "🤖 **I couldn't quite understand your request.**\n\n" +
                    "Could you please describe the specific appliance, issue, or question in more detail?\n\n" +
                    "**Examples of what you can ask me**:\n" +
                    "• *\"My AC is blowing warm air and leaking water\"*\n" +
                    "• *\"Main circuit breaker trips when geyser is switched on\"*\n" +
                    "• *\"Bathroom concealed pipe leak and damp wall\"*\n" +
                    "• *\"How does the escrow payment and 30-day guarantee work?\"*\n" +
                    "• *\"Gas stove burner flame is very low\"*\n\n" +
                    "Or select any verified technician directly from the list below!";
        }

        Map<String, String> response = new HashMap<>();
        response.put("response", responseText);
        return ResponseEntity.ok(response);
    }
}

