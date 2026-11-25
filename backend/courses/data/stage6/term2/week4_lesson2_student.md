# Week 4 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Wire a dual-sensor system: TMP36 on A0 and LDR on A1, both read simultaneously in the loop() function
- Write a function float readTemperature() that returns a float and a function int readLight() that returns an int — called from loop()
- Implement compound threshold logic: if temperature > 30°C AND light < 400 -> trigger red alert (red LED + buzzer); if temperature > 30°C OR light < 400 -> amber warning (green LED flashes); else -> all clear (green LED steady)
- Store the last 5 temperature readings in a rolling array and compute a rolling mean — trigger the alert only if the rolling mean exceeds the threshold (to filter noise)
- Write a Technical Design Log: for each design decision made (threshold value, alert type, rolling mean window size), write: Decision, Reason, Alternative Considered, Why Alternative Was Rejected
- Evaluate the system against 4 defined requirements and write a paragraph for each: does it meet the requirement? If not, what would you change?

## Continue

### 2. GUIDED ACTIVITY
1. Step 5 (5 min): Run for 2 minutes. Cover/uncover the LDR and warm the TMP36 with a finger. Observe all three states.
### 3. INDEPENDENT / PAIR WORK
2. Rolling Mean, Evaluate & Document
3. Task 1 (20 min): Implement the rolling mean. Declare float tempHistory[5] = {0,0,0,0,0}; — each loop, shift all values one position (tempHistory[0]=tempHistory[1] etc.), store the new reading at tempHistory[4], compute rollingMean. Modify the alert logic to use rollingMean instead of the raw reading.
4. Task 2 (10 min): Complete the Technical Design Log — all 8 rows. Every design decision from the build must be logged: threshold values (2 decisions), alert type choice, rolling mean window size, LED colours chosen, Serial output format, buzzer frequency, which condition triggers which state.
5. Task 3 (15 min): System Requirements evaluation — test each of the 4 requirements deliberately. Record test result (pass/partial/fail) in the Design Log. Write an evaluation paragraph for each requirement using the writing frame.
6. Task 4 (Extension, 5 min): Calculate the alert threshold as the rolling mean + half the rolling range of the last 5 readings. This makes the threshold adaptive — it adjusts based on recent history. Log this as a design decision: why is an adaptive threshold better than a fixed one?
7. Rotate Driver/Navigator between Tasks 1 and 2.
### 4. SHOWCASE & DEBRIEF
8. Each pair tests their system against all 4 System Requirements in front of yourself. You runs a timer: alert must trigger within 3 seconds of threshold breach. Class records pass/fail for each pair.
9. Design Log share: one pair reads their most interesting design decision aloud — the choice they debated most. Class evaluates: was the reasoning strong? Was the alternative fairly considered?
10. Evaluation paragraph: one pair reads their paragraph for Requirement 3 (continuous run). Class checks: does it measure against the standard? Does it give evidence? Does it suggest an improvement?
11. AI connection: "A rolling mean is used in AI signal processing to smooth sensor data before feeding it to a model. The system you built today uses the same principle that noise-filtering AI uses in smartphones, medical devices, and self-driving cars."
12. Remember with the programme arc: "In Term 1 you learned to make an LED blink. In Term 2 Week 4, you built an automated dual-sensor monitoring system with modular functions, rolling statistical analysis, compound logic, and written design documentation. That is real engineering."
13. Collect Technical Design Logs and Evaluation paragraphs as this week's artifact. This artifact is also a key component of the pre-assessment evidence portfolio building toward Term 2 Demo Day (Week 8).

## All Lesson 2 steps (complete list)

1. Step 5 (5 min): Run for 2 minutes. Cover/uncover the LDR and warm the TMP36 with a finger. Observe all three states.
2. Rolling Mean, Evaluate & Document
3. Task 1 (20 min): Implement the rolling mean. Declare float tempHistory[5] = {0,0,0,0,0}; — each loop, shift all values one position (tempHistory[0]=tempHistory[1] etc.), store the new reading at tempHistory[4], compute rollingMean. Modify the alert logic to use rollingMean instead of the raw reading.
4. Task 2 (10 min): Complete the Technical Design Log — all 8 rows. Every design decision from the build must be logged: threshold values (2 decisions), alert type choice, rolling mean window size, LED colours chosen, Serial output format, buzzer frequency, which condition triggers which state.
5. Task 3 (15 min): System Requirements evaluation — test each of the 4 requirements deliberately. Record test result (pass/partial/fail) in the Design Log. Write an evaluation paragraph for each requirement using the writing frame.
6. Task 4 (Extension, 5 min): Calculate the alert threshold as the rolling mean + half the rolling range of the last 5 readings. This makes the threshold adaptive — it adjusts based on recent history. Log this as a design decision: why is an adaptive threshold better than a fixed one?
7. Rotate Driver/Navigator between Tasks 1 and 2.
8. Each pair tests their system against all 4 System Requirements in front of yourself. You runs a timer: alert must trigger within 3 seconds of threshold breach. Class records pass/fail for each pair.
9. Design Log share: one pair reads their most interesting design decision aloud — the choice they debated most. Class evaluates: was the reasoning strong? Was the alternative fairly considered?
10. Evaluation paragraph: one pair reads their paragraph for Requirement 3 (continuous run). Class checks: does it measure against the standard? Does it give evidence? Does it suggest an improvement?
11. AI connection: "A rolling mean is used in AI signal processing to smooth sensor data before feeding it to a model. The system you built today uses the same principle that noise-filtering AI uses in smartphones, medical devices, and self-driving cars."
12. Remember with the programme arc: "In Term 1 you learned to make an LED blink. In Term 2 Week 4, you built an automated dual-sensor monitoring system with modular functions, rolling statistical analysis, compound logic, and written design documentation. That is real engineering."
13. Collect Technical Design Logs and Evaluation paragraphs as this week's artifact. This artifact is also a key component of the pre-assessment evidence portfolio building toward Term 2 Demo Day (Week 8).

## Check your understanding
- Evidence Required
- Formative
- (During)
- All 3 system states (ALERT, WARNING, ALL CLEAR) trigger correctly. Rolling mean computed and used in threshold logic. Serial Monitor output is labelled and human-readable. System runs continuously for 5 minutes without crashing.
- Your own check log. Live system requirements test in front of class — pass/fail recorded per requirement for you.
- Term 2 Week 4
- Artifact
- Technical Design Log (all 8 rows complete, every row has all 4 columns filled) + Evaluation paragraphs for all 4 System Requirements (minimum 4 sentences each, evidence-based, improvement identified). Scored on 5-point rubric (DDD Part 8.3).
- Physical documents collected. Design Log and Evaluation paragraphs stapled together.
- Differentiation
- Support: provide the rolling mean code pre-written — you implement the alert logic and write the Design Log only. Extension: adaptive threshold (rolling mean + half rolling range) with a logged design justification.
- Extension: adaptive threshold compiles, triggers correctly in live test, and is documented in Design Log.

## Key words to remember
threshold · compound condition · AND · OR · rolling mean · rolling array · #define · constant · all clear · warning · alert · adaptive threshold · modular · signal noise · system requirements · evaluation · design decision ⚠  Safeguarding Note Dual-sensor circuit has more wiring than previous lessons — you checks ALL connections before upload, paying particular attention to TMP36 polarity and LDR pull-down resistor. Buzzer alert will sound loudly during testing — pre-warn you and neighbours. Never attempt to increase buzzer volume by raising voltage above 5V. Design Log: you' written design decisions should not reference other you by name in any comparative way. Date Delivered: Signature:

## Wrap-up
1. Save your sketch with a clear week name.
2. Disconnect hardware carefully and pack the kit.
3. Submit files as required for your course.
