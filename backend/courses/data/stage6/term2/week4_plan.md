# Term 2 · Lesson 4: Smart Systems — Temperature, Thresholds & Automated Response

**Duration:** 3 hours (Term-time Saturday) (split across Week 4 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 2 · Week 4
**Age Range:** 10–12 years
**Hardware:** Arduino Uno, USB cable, TMP36 temperature sensor, LDR, buzzer, LED × 2 (red and green), 220Ω resistors × 2, 10kΩ resistor, breadboard, jumper wires
**Software:** Arduino IDE 2.x — Serial Monitor
**Bloom's:** L5 Evaluating → L6 Creating
**DDD Phase:** EVALUATE & CREATE — Learners design and build an automated dual-sensor alert system, document every design decision in a technical log, evaluate the system against a defined set of requirements, and refine based on their own evaluation
**NCDC:** Uganda NCDC Curriculum P5/P6 — Literacy Strand: Design documentation — writing a technical design brief for an integrated system; evaluating design decisions in writing. Numeracy Strand: Threshold values; inequality conditions; compound conditions (AND/OR); statistical thresholds (mean ± range)

**Source plan:** `Stage6_T2_Week4_Smart_Sensor_Systems.docx`

## Learning Objectives

- Wire a dual-sensor system: TMP36 on A0 and LDR on A1, both read simultaneously in the loop() function
- Write a function float readTemperature() that returns a float and a function int readLight() that returns an int — called from loop()
- Implement compound threshold logic: if temperature > 30°C AND light < 400 → trigger red alert (red LED + buzzer); if temperature > 30°C OR light < 400 → amber warning (green LED flashes); else → all clear (green LED steady)
- Store the last 5 temperature readings in a rolling array and compute a rolling mean — trigger the alert only if the rolling mean exceeds the threshold (to filter noise)
- Write a Technical Design Log: for each design decision made (threshold value, alert type, rolling mean window size), write: Decision, Reason, Alternative Considered, Why Alternative Was Rejected
- Evaluate the system against 4 defined requirements and write a paragraph for each: does it meet the requirement? If not, what would you change?

## Materials and Preparation

_See source._

## Cross-Curricular Links

## Lesson Structure

### 1. HOOK
1. The Hospital Monitor
2. Show a photo of a hospital patient monitor (heart rate, blood pressure, temperature displayed). Ask: "What does this machine do? When does it beep? Why does it NOT beep all the time?"
3. Key insight: thresholds. The machine compares each reading to a defined safe range. If the reading crosses a threshold, it alerts. It does not alert for every reading — only boundary crossings.
4. Introduce today's challenge on projector: "You will build an environment monitor that watches temperature AND light. It has three states: ALL CLEAR, WARNING, and ALERT. Your job is to define the thresholds and build the logic."
5. Distribute System Requirements Card. Read all 4 requirements together. Ask: "Which requirement will be hardest to meet? Why?" Accept 3 responses.
6. Distribute Technical Design Log Template. Read through the columns. Explain: "Before you build anything, you will log your first 3 design decisions — starting with: what temperature threshold will trigger an alert, and why?"
7. Pairs discuss and write their first log entry: threshold decision, reason, alternative considered, why rejected. Share with class — discuss differences.
### 2. GUIDED ACTIVITY
8. Dual-Sensor System Build
9. Step 1 (15 min): Wire the complete circuit. TMP36 on A0, LDR on A1 (with 10kΩ pull-down), red LED on pin 8, green LED on pin 9, buzzer on pin 10. Facilitator checks all wiring before any upload.
10. Step 2 (15 min): Facilitator live-codes the two sensor functions: float readTemperature() and int readLight() — both modular, both with return values. Learners type along. Verify both functions by printing to Serial Monitor.
11. Step 3 (15 min): Code the three-state alert logic: if(temp > threshold && light < lightThreshold) → red alert; else if(temp > threshold || light < lightThreshold) → green flash; else → green steady. Define threshold constants at the top of the sketch using #define.
12. Step 4 (10 min): Add Serial Monitor output — labelled readings every 2 seconds: Temperature: 28.5 C | Light: 512 | State: ALL CLEAR. This satisfies System Requirement 4.
13. Step 5 (5 min): Run for 2 minutes. Cover/uncover the LDR and warm the TMP36 with a finger. Observe all three states.
### 3. INDEPENDENT / PAIR WORK
14. Rolling Mean, Evaluate & Document
15. Task 1 (20 min): Implement the rolling mean. Declare float tempHistory[5] = {0,0,0,0,0}; — each loop, shift all values one position (tempHistory[0]=tempHistory[1] etc.), store the new reading at tempHistory[4], compute rollingMean. Modify the alert logic to use rollingMean instead of the raw reading.
16. Task 2 (10 min): Complete the Technical Design Log — all 8 rows. Every design decision from the build must be logged: threshold values (2 decisions), alert type choice, rolling mean window size, LED colours chosen, Serial output format, buzzer frequency, which condition triggers which state.
17. Task 3 (15 min): System Requirements evaluation — test each of the 4 requirements deliberately. Record test result (pass/partial/fail) in the Design Log. Write an evaluation paragraph for each requirement using the writing frame.
18. Task 4 (Extension, 5 min): Calculate the alert threshold as the rolling mean + half the rolling range of the last 5 readings. This makes the threshold adaptive — it adjusts based on recent history. Log this as a design decision: why is an adaptive threshold better than a fixed one?
19. Rotate Driver/Navigator between Tasks 1 and 2.
### 4. SHOWCASE & DEBRIEF
20. Each pair tests their system against all 4 System Requirements in front of the class. Facilitator runs a timer: alert must trigger within 3 seconds of threshold breach. Class records pass/fail for each pair.
21. Design Log share: one pair reads their most interesting design decision aloud — the choice they debated most. Class evaluates: was the reasoning strong? Was the alternative fairly considered?
22. Evaluation paragraph: one pair reads their paragraph for Requirement 3 (continuous run). Class checks: does it measure against the standard? Does it give evidence? Does it suggest an improvement?
23. AI connection: "A rolling mean is used in AI signal processing to smooth sensor data before feeding it to a model. The system you built today uses the same principle that noise-filtering AI uses in smartphones, medical devices, and self-driving cars."
24. Facilitator closes with the programme arc: "In Term 1 you learned to make an LED blink. In Term 2 Week 4, you built an automated dual-sensor monitoring system with modular functions, rolling statistical analysis, compound logic, and written design documentation. That is real engineering."
25. Collect Technical Design Logs and Evaluation paragraphs as this week's artifact. This artifact is also a key component of the pre-assessment evidence portfolio building toward Term 2 Demo Day (Week 8).

## Assessment

- Evidence Required
- Formative
- (During)
- All 3 system states (ALERT, WARNING, ALL CLEAR) trigger correctly. Rolling mean computed and used in threshold logic. Serial Monitor output is labelled and human-readable. System runs continuously for 5 minutes without crashing.
- Facilitator observation log. Live system requirements test in front of class — pass/fail recorded per requirement per pair.
- Term 2 Week 4
- Artifact
- Technical Design Log (all 8 rows complete, every row has all 4 columns filled) + Evaluation paragraphs for all 4 System Requirements (minimum 4 sentences each, evidence-based, improvement identified). Scored on 5-point rubric (DDD Part 8.3).
- Physical documents collected. Design Log and Evaluation paragraphs stapled together.
- Differentiation
- Support: provide the rolling mean code pre-written — learners implement the alert logic and write the Design Log only. Extension: adaptive threshold (rolling mean + half rolling range) with a logged design justification.
- Extension: adaptive threshold compiles, triggers correctly in live test, and is documented in Design Log.

## Key Vocabulary

threshold · compound condition · AND · OR · rolling mean · rolling array · #define · constant · all clear · warning · alert · adaptive threshold · modular · signal noise · system requirements · evaluation · design decision ⚠  Safeguarding Note Dual-sensor circuit has more wiring than previous lessons — facilitator checks ALL connections before upload, paying particular attention to TMP36 polarity and LDR pull-down resistor. Buzzer alert will sound loudly during testing — pre-warn learners and neighbours. Never attempt to increase buzzer volume by raising voltage above 5V. Design Log: learners' written design decisions should not reference other learners by name in any comparative way. Date Delivered: Signature:

## Full source extract (complete)

```
Integrated Sensor System: Temperature Thresholds, Automated Alerts & Design Documentation
TERM 1 PRIOR KNOWLEDGE — What Learners Bring
LEARNING OBJECTIVES
• Wire a dual-sensor system: TMP36 on A0 and LDR on A1, both read simultaneously in the loop() function
• Write a function float readTemperature() that returns a float and a function int readLight() that returns an int — called from loop()
• Implement compound threshold logic: if temperature > 30°C AND light < 400 → trigger red alert (red LED + buzzer); if temperature > 30°C OR light < 400 → amber warning (green LED flashes); else → all clear (green LED steady)
• Store the last 5 temperature readings in a rolling array and compute a rolling mean — trigger the alert only if the rolling mean exceeds the threshold (to filter noise)
• Write a Technical Design Log: for each design decision made (threshold value, alert type, rolling mean window size), write: Decision, Reason, Alternative Considered, Why Alternative Was Rejected
• Evaluate the system against 4 defined requirements and write a paragraph for each: does it meet the requirement? If not, what would you change?
MATERIALS & PREPARATION
• 4 shared laptops with Arduino IDE 2.x
• Arduino Uno × 4, USB cables × 4, TMP36 × 4, LDR × 4, buzzer × 4, LED × 8 (red and green, 2 per pair), 220Ω resistors × 8, 10kΩ resistors × 4, breadboards × 4, jumper wires
• Printed "Technical Design Log Template" — table: Decision | Reason | Alternative | Why Rejected. 8 rows (one per key design decision) (A4 per learner)
• Printed "System Requirements Card" — 4 measurable requirements: (1) Alert triggers within 3 seconds of threshold breach. (2) All-clear state is clearly distinguishable from alert state. (3) System runs continuously without crashing for 5 minutes. (4) Serial Monitor output is labelled and human-readable. (A5 per pair)
• Printed "Evaluation Writing Frame" — one paragraph frame per requirement: "Requirement [X] states that… Testing showed that… This requirement was/was not met because… If I were to improve this, I would…" (A4 per learner)
• Facilitator projected screen
CROSS-CURRICULAR LINKS
LESSON STRUCTURE  (3 hours · Term 2 · Saturday)
ASSESSMENT
FACILITATOR RECORD
ISOMA EDUTECH LIMITED  AI Engineers Programme · Stage 5–6 · Arduino · Term 2
Term 2 · Lesson 4: Smart Systems — Temperature, Thresholds & Automated Response
🌿  TERM 2 · STAGE 5–6 · AI ENGINEERS  |  Term 2 · Week 4
Bloom's: L5 Evaluating → L6 Creating
Duration
3 hours (Term-time Saturday)
Term / Week
Term 2 · Week 4
Age Range
10–12 years
Group Size
8 learners (4 pairs — pair programming)
Hardware
Arduino Uno, USB cable, TMP36 temperature sensor, LDR, buzzer, LED × 2 (red and green), 220Ω resistors × 2, 10kΩ resistor, breadboard, jumper wires
Software / IDE
Arduino IDE 2.x — Serial Monitor
Bloom's Level
L5 Evaluating → L6 Creating
DDD Phase
EVALUATE & CREATE — Learners design and build an automated dual-sensor alert system, document every design decision in a technical log, evaluate the system against a defined set of requirements, and refine based on their own evaluation
NCDC Ref
Uganda NCDC Curriculum P5/P6 — Literacy Strand: Design documentation — writing a technical design brief for an integrated system; evaluating design decisions in writing. Numeracy Strand: Threshold values; inequality conditions; compound conditions (AND/OR); statistical thresholds (mean ± range)
Cambridge Ref
Cambridge Primary Computing 0845 — Stage 6: Designing integrated systems; Evaluating and improving programmes; Connecting computing to real-world problems
🔁  TERM 1 PRIOR KNOWLEDGE — Learners are expected to arrive knowing:
• TMP36 temperature sensor wiring and conversion formula — Term 2 Week 2
• LDR sensor wiring and analogRead() — Term 1 Week 5 and Term 2 Week 2
• Arrays and for-loop iteration — Term 2 Week 2
• Functions with return values — Term 2 Week 1
• Serial input with Serial.parseInt() — Term 2 Week 3
• Buzzer output with tone() — Term 2 Week 3
• If/else and compound conditions (AND/OR) — Term 1 Week 4
• Modular code structure — Term 2 Week 1
🎯  Intended Learning Outcome (ILO)
💡  Big Idea
ILO 3.2 (deepened) — Apply compound conditions and threshold logic to a real engineering problem. ILO 3.4 (deepened) — Design and build an integrated multi-sensor system with documented design decisions and a written evaluation of system performance.
A smart system does not just collect data — it acts on it. When the temperature rises above a threshold, a hospital monitor beeps. When light falls below a threshold, a street lamp turns on. Today you build a system that thinks and responds — automatically.
📖  English Literacy Thread
🔢  Mathematics Thread
Technical Design Log: each row requires a structured justification — not just what was decided, but why, and what the alternative was. This is the same reasoning structure as a formal argument in English: claim → evidence → counter-argument → rebuttal. Evaluation paragraphs: for each system requirement, learners write a full evaluative paragraph using the writing frame. This is Bloom's Level 5 in English — evaluating against a defined standard. Explicit instruction: evaluation is not opinion ("I think it's good") — it is measured against evidence ("Requirement 1 states the alert must trigger within 3 seconds. In testing, the alert triggered after 1.8 seconds, so this requirement was met.").
Threshold values as inequalities: temperature > 30.0 (strictly greater than). Compound conditions: (temp > 30.0) && (light < 400) — both must be true (AND); (temp > 30.0) || (light < 400) — either must be true (OR). Rolling mean: store last 5 readings in an array, sum them, divide by 5 — this smooths out noise. Mathematical concept: a rolling mean reduces the effect of outliers — connect to the idea of a "fair" average in statistics. Alert threshold based on mean ± 1 standard deviation (simplified: mean + half the range) — introduce as extension.
Phase
Time
Activities & Facilitator Actions
1. HOOK
The Hospital Monitor
20 min
• Show a photo of a hospital patient monitor (heart rate, blood pressure, temperature displayed). Ask: "What does this machine do? When does it beep? Why does it NOT beep all the time?"
• Key insight: thresholds. The machine compares each reading to a defined safe range. If the reading crosses a threshold, it alerts. It does not alert for every reading — only boundary crossings.
• Introduce today's challenge on projector: "You will build an environment monitor that watches temperature AND light. It has three states: ALL CLEAR, WARNING, and ALERT. Your job is to define the thresholds and build the logic."
• Distribute System Requirements Card. Read all 4 requirements together. Ask: "Which requirement will be hardest to meet? Why?" Accept 3 responses.
• Distribute Technical Design Log Template. Read through the columns. Explain: "Before you build anything, you will log your first 3 design decisions — starting with: what temperature threshold will trigger an alert, and why?"
• Pairs discuss and write their first log entry: threshold decision, reason, alternative considered, why rejected. Share with class — discuss differences.
2. GUIDED ACTIVITY
Dual-Sensor System Build
60 min
• Step 1 (15 min): Wire the complete circuit. TMP36 on A0, LDR on A1 (with 10kΩ pull-down), red LED on pin 8, green LED on pin 9, buzzer on pin 10. Facilitator checks all wiring before any upload.
• Step 2 (15 min): Facilitator live-codes the two sensor functions: float readTemperature() and int readLight() — both modular, both with return values. Learners type along. Verify both functions by printing to Serial Monitor.
• Step 3 (15 min): Code the three-state alert logic: if(temp > threshold && light < lightThreshold) → red alert; else if(temp > threshold || light < lightThreshold) → green flash; else → green steady. Define threshold constants at the top of the sketch using #define.
• Step 4 (10 min): Add Serial Monitor output — labelled readings every 2 seconds: Temperature: 28.5 C | Light: 512 | State: ALL CLEAR. This satisfies System Requirement 4.
• Step 5 (5 min): Run for 2 minutes. Cover/uncover the LDR and warm the TMP36 with a finger. Observe all three states.
3. INDEPENDENT / PAIR WORK
Rolling Mean, Evaluate & Document
50 min
• Task 1 (20 min): Implement the rolling mean. Declare float tempHistory[5] = {0,0,0,0,0}; — each loop, shift all values one position (tempHistory[0]=tempHistory[1] etc.), store the new reading at tempHistory[4], compute rollingMean. Modify the alert logic to use rollingMean instead of the raw reading.
• Task 2 (10 min): Complete the Technical Design Log — all 8 rows. Every design decision from the build must be logged: threshold values (2 decisions), alert type choice, rolling mean window size, LED colours chosen, Serial output format, buzzer frequency, which condition triggers which state.
• Task 3 (15 min): System Requirements evaluation — test each of the 4 requirements deliberately. Record test result (pass/partial/fail) in the Design Log. Write an evaluation paragraph for each requirement using the writing frame.
• Task 4 (Extension, 5 min): Calculate the alert threshold as the rolling mean + half the rolling range of the last 5 readings. This makes the threshold adaptive — it adjusts based on recent history. Log this as a design decision: why is an adaptive threshold better than a fixed one?
• Rotate Driver/Navigator between Tasks 1 and 2.
4. SHOWCASE & DEBRIEF
30 min
• Each pair tests their system against all 4 System Requirements in front of the class. Facilitator runs a timer: alert must trigger within 3 seconds of threshold breach. Class records pass/fail for each pair.
• Design Log share: one pair reads their most interesting design decision aloud — the choice they debated most. Class evaluates: was the reasoning strong? Was the alternative fairly considered?
• Evaluation paragraph: one pair reads their paragraph for Requirement 3 (continuous run). Class checks: does it measure against the standard? Does it give evidence? Does it suggest an improvement?
• AI connection: "A rolling mean is used in AI signal processing to smooth sensor data before feeding it to a model. The system you built today uses the same principle that noise-filtering AI uses in smartphones, medical devices, and self-driving cars."
• Facilitator closes with the programme arc: "In Term 1 you learned to make an LED blink. In Term 2 Week 4, you built an automated dual-sensor monitoring system with modular functions, rolling statistical analysis, compound logic, and written design documentation. That is real engineering."
• Collect Technical Design Logs and Evaluation paragraphs as this week's artifact. This artifact is also a key component of the pre-assessment evidence portfolio building toward Term 2 Demo Day (Week 8).
Component
Description
Evidence Required
Formative
(During)
All 3 system states (ALERT, WARNING, ALL CLEAR) trigger correctly. Rolling mean computed and used in threshold logic. Serial Monitor output is labelled and human-readable. System runs continuously for 5 minutes without crashing.
Facilitator observation log. Live system requirements test in front of class — pass/fail recorded per requirement per pair.
Term 2 Week 4
Artifact
Technical Design Log (all 8 rows complete, every row has all 4 columns filled) + Evaluation paragraphs for all 4 System Requirements (minimum 4 sentences each, evidence-based, improvement identified). Scored on 5-point rubric (DDD Part 8.3).
Physical documents collected. Design Log and Evaluation paragraphs stapled together.
Differentiation
Support: provide the rolling mean code pre-written — learners implement the alert logic and write the Design Log only. Extension: adaptive threshold (rolling mean + half rolling range) with a logged design justification.
Extension: adaptive threshold compiles, triggers correctly in live test, and is documented in Design Log.
KEY VOCABULARY
threshold · compound condition · AND · OR · rolling mean · rolling array · #define · constant · all clear · warning · alert · adaptive threshold · modular · signal noise · system requirements · evaluation · design decision
⚠  Safeguarding Note
Dual-sensor circuit has more wiring than previous lessons — facilitator checks ALL connections before upload, paying particular attention to TMP36 polarity and LDR pull-down resistor. Buzzer alert will sound loudly during testing — pre-warn learners and neighbours. Never attempt to increase buzzer volume by raising voltage above 5V. Design Log: learners' written design decisions should not reference other learners by name in any comparative way.
Facilitator Name:
____________________________
Date Delivered:
____________________________
Signature:
____________________________
```
