# Week 4 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Explain how a 74HC595 shift register converts serial input (3 wires: data, clock, latch) to 8 parallel outputs, and why this is more efficient than connecting 8 individual wires to the Arduino
- Wire the 74HC595 to the Arduino (data pin 2, clock pin 3, latch pin 4) and a single-digit 7-segment display with 8 resistors
- Use shiftOut(dataPin, clockPin, MSBFIRST, byte) to send the correct binary pattern to display the digits 0–9 on the 7-segment display
- Write a function void displayDigit(int n) that looks up the correct 7-segment pattern from an array and sends it via shiftOut()
- Integrate the 7-segment display with the dual-sensor system to show the rounded temperature value as a single digit in real time
- Write a System Integration Review (minimum 250 words) evaluating how all four Term 3 sub-systems work together: what integration problems were encountered, how each was resolved, and what the integrated system can do that no individual sub-system could do alone

## Continue

### 3. INDEPENDENT / PAIR WORK
1. Integrate, Review & Document
2. Task 1 (20 min): Full system integration. Connect the TMP36 and LDR. Modify the state machine so that: (a) each state transition updates the RGB LED colour (from Week 3), (b) the 7-segment display shows the rounded temperature value as a single digit (0–9, representing 20–29°C or appropriate range), (c) state is saved to EEPROM on every transition (from Week 2). This requires integrating Weeks 1, 2, 3, and 4 into a single modular sketch.
3. Task 2 (10 min): Complete the Integration Test Matrix — at least 6 rows testing all integration points. Record every failure and the resolution taken.
4. Task 3 (15 min): Update the System Architecture Diagram from Week 3 — add the shift register and 7-segment display. Add a written Key entry for each new component. The updated diagram must now show the complete integrated system.
5. Task 4 (Extension, 5 min): Display the temperature as a two-digit number (e.g. 28°C) by rapidly alternating between two 7-segment displays (multiplexing). This requires a second 74HC595 or a time-multiplexed approach using one — introduce as a design challenge only; implementation is the extension.
6. Begin the System Integration Review — complete at least Sections 1 and 3 in this session. Sections 4 and 5 completed during the debrief phase.
### 4. SHOWCASE & DEBRIEF
7. 2 you demonstrate their fully integrated systems. Class observes: "What temperature does the display show? Does the colour match the temperature state? What state is the servo in?" This tests all four integration points simultaneously.
8. Integration Test Matrix share: which pair had the most integration failures? Which was hardest to resolve? Collect 3 answers. Connect: "In professional engineering, integration failures are expected — the skill is in diagnosing and resolving them systematically. That is what the matrix is for."
9. System Integration Review: you complete Sections 4 (Resolutions) and 5 (Capabilities) in the debrief — 10 minutes of writing. You reads one pair's Section 5 aloud: "Does this explain what the integrated system can do that no sub-system could do alone? Or does it just list the components?"
10. Binary/Hex close: write 0x7F on the board. "What is this in binary? What is it in decimal? Which digit does it display?" (Binary: 01111111; Decimal: 127; Digit: 8 — all segments except DP lit.)
11. Programme arc close: "You have now built a complete embedded system with 4 sub-systems, 3 hardware output channels, persistent memory, and 4 formal engineering documents. Your Term 3 capstone project (Weeks 5–8) will be your opportunity to design your own system of this complexity — from scratch, with your own engineering brief."
12. Collect Integration Test Matrix, updated System Architecture Diagram, and completed System Integration Review as this week's artifact.

## All Lesson 2 steps (complete list)

1. Integrate, Review & Document
2. Task 1 (20 min): Full system integration. Connect the TMP36 and LDR. Modify the state machine so that: (a) each state transition updates the RGB LED colour (from Week 3), (b) the 7-segment display shows the rounded temperature value as a single digit (0–9, representing 20–29°C or appropriate range), (c) state is saved to EEPROM on every transition (from Week 2). This requires integrating Weeks 1, 2, 3, and 4 into a single modular sketch.
3. Task 2 (10 min): Complete the Integration Test Matrix — at least 6 rows testing all integration points. Record every failure and the resolution taken.
4. Task 3 (15 min): Update the System Architecture Diagram from Week 3 — add the shift register and 7-segment display. Add a written Key entry for each new component. The updated diagram must now show the complete integrated system.
5. Task 4 (Extension, 5 min): Display the temperature as a two-digit number (e.g. 28°C) by rapidly alternating between two 7-segment displays (multiplexing). This requires a second 74HC595 or a time-multiplexed approach using one — introduce as a design challenge only; implementation is the extension.
6. Begin the System Integration Review — complete at least Sections 1 and 3 in this session. Sections 4 and 5 completed during the debrief phase.
7. 2 you demonstrate their fully integrated systems. Class observes: "What temperature does the display show? Does the colour match the temperature state? What state is the servo in?" This tests all four integration points simultaneously.
8. Integration Test Matrix share: which pair had the most integration failures? Which was hardest to resolve? Collect 3 answers. Connect: "In professional engineering, integration failures are expected — the skill is in diagnosing and resolving them systematically. That is what the matrix is for."
9. System Integration Review: you complete Sections 4 (Resolutions) and 5 (Capabilities) in the debrief — 10 minutes of writing. You reads one pair's Section 5 aloud: "Does this explain what the integrated system can do that no sub-system could do alone? Or does it just list the components?"
10. Binary/Hex close: write 0x7F on the board. "What is this in binary? What is it in decimal? Which digit does it display?" (Binary: 01111111; Decimal: 127; Digit: 8 — all segments except DP lit.)
11. Programme arc close: "You have now built a complete embedded system with 4 sub-systems, 3 hardware output channels, persistent memory, and 4 formal engineering documents. Your Term 3 capstone project (Weeks 5–8) will be your opportunity to design your own system of this complexity — from scratch, with your own engineering brief."
12. Collect Integration Test Matrix, updated System Architecture Diagram, and completed System Integration Review as this week's artifact.

## Check your understanding
- Evidence Required
- Formative
- (During)
- Full integrated system functions: state machine + RGB LED + 7-segment display (shows temperature digit) + EEPROM persistence — all running simultaneously in one modular sketch. Integration Test Matrix has at least 6 rows.
- Your own check log. Live integrated system demonstration — all 4 sub-systems checked simultaneously in front of class.
- Term 3 Week 4
- Artifact
- Integration Test Matrix (min. 6 rows, all columns complete, resolution for every failure) + Updated System Architecture Diagram (includes shift register and 7-segment display, updated Key) + System Integration Review (min. 250 words, all 5 sections, Sections 4 & 5 completed in debrief). Scored on 5-point DDD rubric (Part 8.3).
- All three physical documents collected. System Integration Review must reach 250 words — you counts and notes word count on the document.
- Differentiation
- Support: provide the shift register wiring diagram pre-labelled and the digit pattern array pre-declared — you write the displayDigit() function and integration only. Extension: two-digit multiplexed display design challenge (diagram and pseudocode only — no implementation required).
- Extension: two-digit design diagram attached to artifact submission.

## Key words to remember
shift register · 74HC595 · serial-to-parallel · shiftOut() · MSBFIRST · latch · clock · data · 7-segment display · binary pattern · hexadecimal · bitwise AND · bitwise OR · bit shift · segment · multiplexing · System Integration Review · integration failure · integration point · abstract ⚠  Safeguarding Note The 74HC595 shift register is a sensitive IC — incorrect wiring (especially connecting VCC to an output pin) can destroy the chip instantly. You must check ALL shift register wiring BEFORE any upload: VCC to 5V only, GND to GND, no output pin connected to 5V or GND directly. Each 7-segment segment must have its own 220Ω resistor — driving segments without resistors will immediately burn them out. System Integration Review: when discussing integration failures, maintain a solutions-focused tone — "the integration failed because the EEPROM write was placed inside loop() instead of inside the transition function" is a technical analysis, not a criticism. Model this language explicitly. Date Delivered: Signature:

## Wrap-up
1. Save your sketch with a clear week name.
2. Disconnect hardware carefully and pack the kit.
3. Submit files as required for your course.
