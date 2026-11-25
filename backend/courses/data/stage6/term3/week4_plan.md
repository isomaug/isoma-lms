# Term 3 · Lesson 4: More Output, Less Wiring — Shift Registers, 7-Segment Displays & System Integration

**Duration:** 3 hours (Term-time Saturday) (split across Week 4 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 3 · Week 4
**Age Range:** 10–12 years
**Hardware:** Arduino Uno, USB cable, 74HC595 shift register × 1, 7-segment display (common cathode, single digit) × 1, 220Ω resistors × 8, breadboard, jumper wires, TMP36 (from prior weeks), LDR (from prior weeks), 10kΩ resistor
**Software:** Arduino IDE 2.x — shiftOut() function, Serial Monitor
**Bloom's:** L6 Creating
**DDD Phase:** CREATE — Learners wire a 74HC595 shift register, use shiftOut() to drive a 7-segment display showing live sensor data digits, integrate this with the state machine and RGB LED from Weeks 1–3, and produce a System Integration Review documenting how all four weeks of Term 3 components work together as one coherent system
**NCDC:** Uganda NCDC Curriculum P5/P6 — Literacy Strand: System Integration Review — a formal written document that evaluates how well all components of a multi-week system work together, identifying integration failures and proposing solutions. Numeracy Strand: Bitwise operations (AND, OR, shift left/right); 7-segment display encoding as binary patterns; hexadecimal notation (preview)

**Source plan:** `Stage6_T3_Week4_Shift_Register_Integration.docx`

## Learning Objectives

- Explain how a 74HC595 shift register converts serial input (3 wires: data, clock, latch) to 8 parallel outputs, and why this is more efficient than connecting 8 individual wires to the Arduino
- Wire the 74HC595 to the Arduino (data pin 2, clock pin 3, latch pin 4) and a single-digit 7-segment display with 8 resistors
- Use shiftOut(dataPin, clockPin, MSBFIRST, byte) to send the correct binary pattern to display the digits 0–9 on the 7-segment display
- Write a function void displayDigit(int n) that looks up the correct 7-segment pattern from an array and sends it via shiftOut()
- Integrate the 7-segment display with the dual-sensor system to show the rounded temperature value as a single digit in real time
- Write a System Integration Review (minimum 250 words) evaluating how all four Term 3 sub-systems work together: what integration problems were encountered, how each was resolved, and what the integrated system can do that no individual sub-system could do alone

## Materials and Preparation

_See source._

## Cross-Curricular Links

## Lesson Structure

### 1. HOOK
1. The Wiring Problem
2. Ask: "A 7-segment display has 7 segments plus a decimal point = 8 connections. If we wired each directly to the Arduino, how many pins would we use?" (8.) "We have a servo on pin 9, RGB on pins 9/10/11, buttons on pins 2/4, sensors on A0/A1. Do we have 8 spare digital pins?" (No — the Arduino Uno has 14 digital pins, several already used.)
3. Introduce the shift register: "What if you could control 8 outputs using only 3 wires?" Show the 74HC595 chip. "This IC receives data serially — bit by bit — and outputs it in parallel — all 8 at once."
4. Serial-to-parallel analogy: "Imagine sending a letter one character at a time through a single pipe. At the other end, all characters appear simultaneously. That is what the shift register does with bits."
5. Distribute the 7-Segment Pattern Table. Ask: "What binary pattern lights up the digit 3?" Pairs decode from the table. "What is that in decimal?" Calculate: 01001111 = 79.
6. Distribute the Integration Test Matrix. Explain: this is today's primary engineering document — it will track every integration attempt, expected result, and actual result. Pairs write their first row: "7-segment display + Arduino via shift register. Expected: digit 0 displayed. Actual: [to be completed]."
### 2. GUIDED ACTIVITY
7. Wire the Shift Register & Display
8. Step 1 (15 min): Wire the 74HC595. Use the Wiring Reference card. Key connections: pin 14 (SER) → Arduino pin 2; pin 11 (SRCLK) → Arduino pin 3; pin 12 (RCLK) → Arduino pin 4; pin 16 (VCC) → 5V; pin 8 (GND) → GND; pins 1–7, 15 (QA–QH) → 7-segment segments A–G, DP via 220Ω resistors. Facilitator checks ALL wiring before upload.
9. Step 2 (15 min): Write the shiftOut test: const int DATA=2, CLK=3, LATCH=4; — then: digitalWrite(LATCH, LOW); shiftOut(DATA, CLK, MSBFIRST, 0b00111111); digitalWrite(LATCH, HIGH); — this should display "0". Upload. Observe.
10. Step 3 (15 min): Declare the digit pattern array: byte digits[10] = {0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F}; — introduce hexadecimal as a shorthand for binary. Write the displayDigit(int n) function.
11. Step 4 (15 min): Loop through all digits 0–9 with a 1-second delay. Display counts 0 → 9 → 0 → … Add Serial Monitor output alongside: "Displaying: 4. Binary: 01100110."
### 3. INDEPENDENT / PAIR WORK
12. Integrate, Review & Document
13. Task 1 (20 min): Full system integration. Connect the TMP36 and LDR. Modify the state machine so that: (a) each state transition updates the RGB LED colour (from Week 3), (b) the 7-segment display shows the rounded temperature value as a single digit (0–9, representing 20–29°C or appropriate range), (c) state is saved to EEPROM on every transition (from Week 2). This requires integrating Weeks 1, 2, 3, and 4 into a single modular sketch.
14. Task 2 (10 min): Complete the Integration Test Matrix — at least 6 rows testing all integration points. Record every failure and the resolution taken.
15. Task 3 (15 min): Update the System Architecture Diagram from Week 3 — add the shift register and 7-segment display. Add a written Key entry for each new component. The updated diagram must now show the complete integrated system.
16. Task 4 (Extension, 5 min): Display the temperature as a two-digit number (e.g. 28°C) by rapidly alternating between two 7-segment displays (multiplexing). This requires a second 74HC595 or a time-multiplexed approach using one — introduce as a design challenge only; implementation is the extension.
17. Begin the System Integration Review — complete at least Sections 1 and 3 in this session. Sections 4 and 5 completed during the debrief phase.
### 4. SHOWCASE & DEBRIEF
18. 2 pairs demonstrate their fully integrated systems. Class observes: "What temperature does the display show? Does the colour match the temperature state? What state is the servo in?" This tests all four integration points simultaneously.
19. Integration Test Matrix share: which pair had the most integration failures? Which was hardest to resolve? Collect 3 answers. Connect: "In professional engineering, integration failures are expected — the skill is in diagnosing and resolving them systematically. That is what the matrix is for."
20. System Integration Review: pairs complete Sections 4 (Resolutions) and 5 (Capabilities) in the debrief — 10 minutes of writing. Facilitator reads one pair's Section 5 aloud: "Does this explain what the integrated system can do that no sub-system could do alone? Or does it just list the components?"
21. Binary/Hex close: write 0x7F on the board. "What is this in binary? What is it in decimal? Which digit does it display?" (Binary: 01111111; Decimal: 127; Digit: 8 — all segments except DP lit.)
22. Programme arc close: "You have now built a complete embedded system with 4 sub-systems, 3 hardware output channels, persistent memory, and 4 formal engineering documents. Your Term 3 capstone project (Weeks 5–8) will be your opportunity to design your own system of this complexity — from scratch, with your own engineering brief."
23. Collect Integration Test Matrix, updated System Architecture Diagram, and completed System Integration Review as this week's artifact.

## Assessment

- Evidence Required
- Formative
- (During)
- Full integrated system functions: state machine + RGB LED + 7-segment display (shows temperature digit) + EEPROM persistence — all running simultaneously in one modular sketch. Integration Test Matrix has at least 6 rows.
- Facilitator observation log. Live integrated system demonstration — all 4 sub-systems checked simultaneously in front of class.
- Term 3 Week 4
- Artifact
- Integration Test Matrix (min. 6 rows, all columns complete, resolution for every failure) + Updated System Architecture Diagram (includes shift register and 7-segment display, updated Key) + System Integration Review (min. 250 words, all 5 sections, Sections 4 & 5 completed in debrief). Scored on 5-point DDD rubric (Part 8.3).
- All three physical documents collected. System Integration Review must reach 250 words — facilitator counts and notes word count on the document.
- Differentiation
- Support: provide the shift register wiring diagram pre-labelled and the digit pattern array pre-declared — learners write the displayDigit() function and integration only. Extension: two-digit multiplexed display design challenge (diagram and pseudocode only — no implementation required).
- Extension: two-digit design diagram attached to artifact submission.

## Key Vocabulary

shift register · 74HC595 · serial-to-parallel · shiftOut() · MSBFIRST · latch · clock · data · 7-segment display · binary pattern · hexadecimal · bitwise AND · bitwise OR · bit shift · segment · multiplexing · System Integration Review · integration failure · integration point · abstract ⚠  Safeguarding Note The 74HC595 shift register is a sensitive IC — incorrect wiring (especially connecting VCC to an output pin) can destroy the chip instantly. Facilitator must check ALL shift register wiring BEFORE any upload: VCC to 5V only, GND to GND, no output pin connected to 5V or GND directly. Each 7-segment segment must have its own 220Ω resistor — driving segments without resistors will immediately burn them out. System Integration Review: when discussing integration failures, maintain a solutions-focused tone — "the integration failed because the EEPROM write was placed inside loop() instead of inside the transition function" is a technical analysis, not a criticism. Model this language explicitly. Date Delivered: Signature:

## Full source extract (complete)

```
Shift Registers (74HC595), 7-Segment Display Control & System Integration Review
TERM 3 SYSTEMS ENGINEERING CONTEXT
TERMS 1 & 2 PRIOR KNOWLEDGE — What Learners Bring
LEARNING OBJECTIVES
• Explain how a 74HC595 shift register converts serial input (3 wires: data, clock, latch) to 8 parallel outputs, and why this is more efficient than connecting 8 individual wires to the Arduino
• Wire the 74HC595 to the Arduino (data pin 2, clock pin 3, latch pin 4) and a single-digit 7-segment display with 8 resistors
• Use shiftOut(dataPin, clockPin, MSBFIRST, byte) to send the correct binary pattern to display the digits 0–9 on the 7-segment display
• Write a function void displayDigit(int n) that looks up the correct 7-segment pattern from an array and sends it via shiftOut()
• Integrate the 7-segment display with the dual-sensor system to show the rounded temperature value as a single digit in real time
• Write a System Integration Review (minimum 250 words) evaluating how all four Term 3 sub-systems work together: what integration problems were encountered, how each was resolved, and what the integrated system can do that no individual sub-system could do alone
MATERIALS & PREPARATION
• 4 shared laptops with Arduino IDE 2.x
• Arduino Uno × 4, USB cables × 4, 74HC595 shift register × 4, single-digit 7-segment display (common cathode) × 4, 220Ω resistors × 32 (8 per pair), TMP36 × 4, LDR × 4, 10kΩ resistors × 4, breadboards × 4, jumper wires
• Printed "74HC595 Wiring Reference" — pinout diagram with Arduino connections labelled: SER (data, pin 2), SRCLK (clock, pin 3), RCLK (latch, pin 4), VCC (5V), GND (A5 per pair, laminated)
• Printed "7-Segment Pattern Table" — digits 0–9 with corresponding 8-bit binary patterns and decimal values (A5 per pair, laminated)
• Printed "System Integration Review Template" — structured 5-section document: System Overview, Sub-Systems Integrated, Integration Challenges, Resolutions, Capabilities of the Integrated System (min. 250 words total) (A4 per learner)
• Printed "Integration Test Matrix" — table: Sub-System A, Sub-System B, Integration Point, Expected Behaviour, Actual Behaviour, Resolution (A4 per learner)
• Coloured pens for the System Architecture Diagram update (learners add the 7-segment display and shift register to last week's diagram)
• Facilitator projected screen
CROSS-CURRICULAR LINKS
LESSON STRUCTURE  (3 hours · Term 3 · Saturday)
ASSESSMENT
FACILITATOR RECORD
ISOMA EDUTECH LIMITED  AI Engineers Programme · Stage 5–6 · Arduino · Term 3
Term 3 · Lesson 4: More Output, Less Wiring — Shift Registers, 7-Segment Displays & System Integration
🔷  TERM 3 · STAGE 5–6 · AI ENGINEERS  |  Term 3 · Week 4
Bloom's: L6 Creating
Duration
3 hours (Term-time Saturday)
Term / Week
Term 3 · Week 4
Age Range
10–12 years
Group Size
8 learners (4 pairs — pair programming)
Hardware
Arduino Uno, USB cable, 74HC595 shift register × 1, 7-segment display (common cathode, single digit) × 1, 220Ω resistors × 8, breadboard, jumper wires, TMP36 (from prior weeks), LDR (from prior weeks), 10kΩ resistor
Software / IDE
Arduino IDE 2.x — shiftOut() function, Serial Monitor
Bloom's Level
L6 Creating
DDD Phase
CREATE — Learners wire a 74HC595 shift register, use shiftOut() to drive a 7-segment display showing live sensor data digits, integrate this with the state machine and RGB LED from Weeks 1–3, and produce a System Integration Review documenting how all four weeks of Term 3 components work together as one coherent system
NCDC Ref
Uganda NCDC Curriculum P5/P6 — Literacy Strand: System Integration Review — a formal written document that evaluates how well all components of a multi-week system work together, identifying integration failures and proposing solutions. Numeracy Strand: Bitwise operations (AND, OR, shift left/right); 7-segment display encoding as binary patterns; hexadecimal notation (preview)
Cambridge Ref
Cambridge Primary Computing 0845 — Stage 6: Hardware interfacing; Serial-to-parallel data conversion; Binary encoding of display data; Evaluating and integrating complex systems
🔌  Week 4 Systems Context — Integration Week: All Components Together
Week 4 is Integration Week. Learners have now built three separate sub-systems across Term 3: (1) a state machine with servo and buttons (Week 1); (2) EEPROM persistence with Engineering Change Log (Week 2); (3) RGB LED colour output driven by dual sensors (Week 3). This week adds a fourth sub-system — a 7-segment display via shift register — and the primary task is to integrate all four into one coherent, documented system.
The shift register (74HC595) is an 8-bit serial-to-parallel converter. Arduino sends data in series (bit by bit through one wire) and the chip outputs it in parallel (all 8 outputs simultaneously). This is the same principle used in all digital display systems — from calculators to scoreboards to industrial control panels.
The System Integration Review is introduced as the final new document type this term. It is the most demanding writing task in Term 3: a structured evaluation of how the whole system works, where it fails at the integration points, what was changed to fix each failure, and what the system can now do that no individual sub-system could do alone.
After this week, learners have built a complete multi-component embedded system with: sensor inputs, state machine logic, persistent memory, dual output channels (colour + numeric display), and full documentation (State Transition Diagram, System Architecture Diagram, Engineering Change Log, System Integration Review). This is the portfolio they take into the Term 3 capstone project (Weeks 5–8).
🔷  TERMS 1 & 2 PRIOR KNOWLEDGE — What Learners Bring to This Session:
• State machine with enum, switch/case, servo — Term 3 Week 1
• EEPROM persistence and Engineering Change Log — Term 3 Week 2
• RGB LED with PWM, colour mixing, System Architecture Diagram — Term 3 Week 3
• Binary number system and byte representation — Term 3 Week 2
• shiftOut() function concept — introduced here for the first time (new this session)
• Dual-sensor reading functions — Term 2 Weeks 2 & 4
• Modular function architecture — Term 2 Week 1, applied throughout
🎯  Intended Learning Outcome (ILO)
💡  Big Idea
ILO 3.1 (mastery: full system integration) — Write an Arduino sketch that integrates a 74HC595 shift register, 7-segment display, RGB LED, state machine, EEPROM, and dual sensors into a single modular programme. ILO 3.4 (summative preparation) — Produce a System Integration Review evaluating the integration of all Term 3 sub-systems, identifying failure points and documenting resolutions.
When a system has only 6 output channels (digital pins), adding a 7-segment display would use all of them. A shift register solves this: you send 8 bits of data through 3 wires, and the chip converts them into 8 parallel outputs. This is how real electronics scales — not by adding more wires, but by using smarter protocols.
📖  English Literacy Thread
🔢  Mathematics Thread
System Integration Review: the most demanding piece of writing in Term 3. Five sections, each with a distinct purpose and register. Section 1 (System Overview) is a technical abstract — 2–3 sentences that describe the whole system concisely enough that an engineer who had never seen it could understand its purpose and components. Section 3 (Integration Challenges) is a problem-solution narrative — each challenge described with its cause, its effect on the system, and the solution applied. Section 5 (Capabilities) is an evaluative synthesis — explaining what the integrated system can do that its individual sub-systems could not, using specific evidence. This mirrors the structure of a professional engineering report: overview → components → problems → solutions → conclusions.
Bitwise operations: the 7-segment display is controlled by 8 bits. To display "0", all segments except G are ON: binary 00111111 = decimal 63. To display "1", only B and C are ON: binary 00000110 = decimal 6. Learners decode the pattern: "Which bits are 1 in 01101101? That is segments A, C, D, F, G — which digit does that display?" (Answer: 5.) Hexadecimal: 0x3F = 00111111 = 63 in decimal — introduce hex notation as a shorthand for binary. Bitwise AND: checking if a specific bit is set — (pattern & 0x01) — is the LSB 1? This connects to the binary worksheet from Week 2.
Phase
Time
Activities & Facilitator Actions
1. HOOK
The Wiring Problem
20 min
• Ask: "A 7-segment display has 7 segments plus a decimal point = 8 connections. If we wired each directly to the Arduino, how many pins would we use?" (8.) "We have a servo on pin 9, RGB on pins 9/10/11, buttons on pins 2/4, sensors on A0/A1. Do we have 8 spare digital pins?" (No — the Arduino Uno has 14 digital pins, several already used.)
• Introduce the shift register: "What if you could control 8 outputs using only 3 wires?" Show the 74HC595 chip. "This IC receives data serially — bit by bit — and outputs it in parallel — all 8 at once."
• Serial-to-parallel analogy: "Imagine sending a letter one character at a time through a single pipe. At the other end, all characters appear simultaneously. That is what the shift register does with bits."
• Distribute the 7-Segment Pattern Table. Ask: "What binary pattern lights up the digit 3?" Pairs decode from the table. "What is that in decimal?" Calculate: 01001111 = 79.
• Distribute the Integration Test Matrix. Explain: this is today's primary engineering document — it will track every integration attempt, expected result, and actual result. Pairs write their first row: "7-segment display + Arduino via shift register. Expected: digit 0 displayed. Actual: [to be completed]."
2. GUIDED ACTIVITY
Wire the Shift Register & Display
60 min
• Step 1 (15 min): Wire the 74HC595. Use the Wiring Reference card. Key connections: pin 14 (SER) → Arduino pin 2; pin 11 (SRCLK) → Arduino pin 3; pin 12 (RCLK) → Arduino pin 4; pin 16 (VCC) → 5V; pin 8 (GND) → GND; pins 1–7, 15 (QA–QH) → 7-segment segments A–G, DP via 220Ω resistors. Facilitator checks ALL wiring before upload.
• Step 2 (15 min): Write the shiftOut test: const int DATA=2, CLK=3, LATCH=4; — then: digitalWrite(LATCH, LOW); shiftOut(DATA, CLK, MSBFIRST, 0b00111111); digitalWrite(LATCH, HIGH); — this should display "0". Upload. Observe.
• Step 3 (15 min): Declare the digit pattern array: byte digits[10] = {0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F}; — introduce hexadecimal as a shorthand for binary. Write the displayDigit(int n) function.
• Step 4 (15 min): Loop through all digits 0–9 with a 1-second delay. Display counts 0 → 9 → 0 → … Add Serial Monitor output alongside: "Displaying: 4. Binary: 01100110."
3. INDEPENDENT / PAIR WORK
Integrate, Review & Document
50 min
• Task 1 (20 min): Full system integration. Connect the TMP36 and LDR. Modify the state machine so that: (a) each state transition updates the RGB LED colour (from Week 3), (b) the 7-segment display shows the rounded temperature value as a single digit (0–9, representing 20–29°C or appropriate range), (c) state is saved to EEPROM on every transition (from Week 2). This requires integrating Weeks 1, 2, 3, and 4 into a single modular sketch.
• Task 2 (10 min): Complete the Integration Test Matrix — at least 6 rows testing all integration points. Record every failure and the resolution taken.
• Task 3 (15 min): Update the System Architecture Diagram from Week 3 — add the shift register and 7-segment display. Add a written Key entry for each new component. The updated diagram must now show the complete integrated system.
• Task 4 (Extension, 5 min): Display the temperature as a two-digit number (e.g. 28°C) by rapidly alternating between two 7-segment displays (multiplexing). This requires a second 74HC595 or a time-multiplexed approach using one — introduce as a design challenge only; implementation is the extension.
• Begin the System Integration Review — complete at least Sections 1 and 3 in this session. Sections 4 and 5 completed during the debrief phase.
4. SHOWCASE & DEBRIEF
30 min
• 2 pairs demonstrate their fully integrated systems. Class observes: "What temperature does the display show? Does the colour match the temperature state? What state is the servo in?" This tests all four integration points simultaneously.
• Integration Test Matrix share: which pair had the most integration failures? Which was hardest to resolve? Collect 3 answers. Connect: "In professional engineering, integration failures are expected — the skill is in diagnosing and resolving them systematically. That is what the matrix is for."
• System Integration Review: pairs complete Sections 4 (Resolutions) and 5 (Capabilities) in the debrief — 10 minutes of writing. Facilitator reads one pair's Section 5 aloud: "Does this explain what the integrated system can do that no sub-system could do alone? Or does it just list the components?"
• Binary/Hex close: write 0x7F on the board. "What is this in binary? What is it in decimal? Which digit does it display?" (Binary: 01111111; Decimal: 127; Digit: 8 — all segments except DP lit.)
• Programme arc close: "You have now built a complete embedded system with 4 sub-systems, 3 hardware output channels, persistent memory, and 4 formal engineering documents. Your Term 3 capstone project (Weeks 5–8) will be your opportunity to design your own system of this complexity — from scratch, with your own engineering brief."
• Collect Integration Test Matrix, updated System Architecture Diagram, and completed System Integration Review as this week's artifact.
Component
Description
Evidence Required
Formative
(During)
Full integrated system functions: state machine + RGB LED + 7-segment display (shows temperature digit) + EEPROM persistence — all running simultaneously in one modular sketch. Integration Test Matrix has at least 6 rows.
Facilitator observation log. Live integrated system demonstration — all 4 sub-systems checked simultaneously in front of class.
Term 3 Week 4
Artifact
Integration Test Matrix (min. 6 rows, all columns complete, resolution for every failure) + Updated System Architecture Diagram (includes shift register and 7-segment display, updated Key) + System Integration Review (min. 250 words, all 5 sections, Sections 4 & 5 completed in debrief). Scored on 5-point DDD rubric (Part 8.3).
All three physical documents collected. System Integration Review must reach 250 words — facilitator counts and notes word count on the document.
Differentiation
Support: provide the shift register wiring diagram pre-labelled and the digit pattern array pre-declared — learners write the displayDigit() function and integration only. Extension: two-digit multiplexed display design challenge (diagram and pseudocode only — no implementation required).
Extension: two-digit design diagram attached to artifact submission.
KEY VOCABULARY
shift register · 74HC595 · serial-to-parallel · shiftOut() · MSBFIRST · latch · clock · data · 7-segment display · binary pattern · hexadecimal · bitwise AND · bitwise OR · bit shift · segment · multiplexing · System Integration Review · integration failure · integration point · abstract
⚠  Safeguarding Note
The 74HC595 shift register is a sensitive IC — incorrect wiring (especially connecting VCC to an output pin) can destroy the chip instantly. Facilitator must check ALL shift register wiring BEFORE any upload: VCC to 5V only, GND to GND, no output pin connected to 5V or GND directly. Each 7-segment segment must have its own 220Ω resistor — driving segments without resistors will immediately burn them out. System Integration Review: when discussing integration failures, maintain a solutions-focused tone — "the integration failed because the EEPROM write was placed inside loop() instead of inside the transition function" is a technical analysis, not a criticism. Model this language explicitly.
Facilitator Name:
____________________________
Date Delivered:
____________________________
Signature:
____________________________
```
