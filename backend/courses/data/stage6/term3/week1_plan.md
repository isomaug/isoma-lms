# Term 3 · Lesson 1: Predictable Machines - State Machines & Servo Motor Control

**Duration:** 3 hours (Term-time Saturday) (split across Week 1 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 3 · Week 1
**Age Range:** 10–12 years
**Hardware:** Arduino Uno, USB cable, servo motor (SG90 or equivalent), push button × 2, LED × 2 (red and green), 220Ω resistors × 2, breadboard, jumper wires
**Software:** Arduino IDE 2.x - Servo.h library, Serial Monitor
**Bloom's:** L5 Evaluating
**DDD Phase:** EVALUATE - Learners design a finite state machine on paper (state transition diagram), implement it in modular Arduino code using a servo motor and buttons, evaluate whether the system's behaviour exactly matches the specification, and document any discrepancies
**NCDC:** Uganda NCDC Curriculum P5/P6 - Literacy Strand: Technical specification writing - defining states, transitions, and conditions in plain English before coding. Numeracy Strand: Angles (0°–180°) for servo position; modular arithmetic for state cycling; mapping input ranges to output ranges

**Big Idea:** ILO 3.1 (mastery level) - Write Arduino sketches using the Servo library, modular state machine functions, and enum-based state variables. ILO 3.2 (deepened) - Apply modular arithmetic and angle mapping to a mathematical problem solved computationally in hardware.

**Source plan:** `Stage6_T3_Week1_State_Machines_Servo.docx`

## Learning Objectives

- Draw a State Transition Diagram on paper for a 3-state servo system: CLOSED (0°), OPEN (90°), LOCKED (180°) - showing all states, transition conditions, and output actions
- Declare a state variable using an Arduino enum and implement the state machine as a switch/case structure with one case per state
- Write three modular state functions - void stateClosed(), void stateOpen(), void stateLocked() - each controlling the servo position and LED indicators for that state
- Wire and control a servo motor using the Servo.h library: attach() to a PWM pin, write() to set position in degrees
- Evaluate the implemented system against the hand-drawn State Transition Diagram: does every transition trigger at the correct condition? Document any discrepancy between specification and implementation
- Explain in writing (minimum 80 words) why a state machine architecture produces more reliable behaviour than a single nested if/else chain for systems with more than 3 states

## Materials and Preparation

_See source._

## Cross-Curricular Links

## Lesson Structure

### 1. HOOK The Vending Machine
1. Ask: "Think of a vending machine. What are all the states it can be in?" Collect answers: IDLE, SELECTING, DISPENSING, OUT_OF_STOCK, COLLECTING_MONEY. Draw each as a circle on the board.
2. Ask: "What causes the machine to move from IDLE to SELECTING?" (A button is pressed.) Draw the arrow. Label it. "What causes SELECTING to go to DISPENSING?" (Money inserted + item selected.) Continue until the diagram is complete.
3. Introduce: "This is a state machine - a finite set of states, with defined transitions between them. It is the most important design pattern in embedded systems."
4. Distribute the Architecture Comparison sheet. Pairs read both versions - nested if/else vs switch/case. Ask: "Which one would be easier to add a 4th state to? Why? Which one is easier to test one state at a time? Why?"
5. Distribute State Transition Diagram Template and State Specification Table. Pairs design their 3-state gate system: CLOSED → OPEN → LOCKED → CLOSED. Complete both documents before any hardware is touched.
6. Facilitator reviews each pair's State Specification Table: "Is every entry condition specific and testable? If the entry condition is 'button pressed', which button? Under what circumstances?" Return for revision if vague.
### 2. GUIDED ACTIVITY Servo, Enum & Switch/Case
7. Step 1 (10 min): Wire the servo motor. Servo signal wire → pin 9 (PWM). Red → 5V. Brown/Black → GND. Wire Button A to pin 2, Button B to pin 4, red LED to pin 7, green LED to pin 8. Facilitator checks all wiring before upload.
8. Step 2 (10 min): Include the Servo library and test: #include <Servo.h> Servo gate; gate.attach(9); gate.write(90); - upload and observe the servo move to 90°. Introduce the concept of a PWM pin.
9. Step 3 (20 min): Facilitator live-codes the state machine skeleton: enum GateState { CLOSED, OPEN, LOCKED }; GateState currentState = CLOSED; - then the switch/case structure in loop(). Each case calls a state function. Learners type simultaneously.
10. Step 4 (20 min): Learners implement their three state functions independently based on their own State Specification Table. Facilitator circulates using only Socratic questions: "What does your table say the servo position should be in this state? Is that what your code does?"
11. Upload and run. Test each transition manually. Does the servo move to the correct angle? Do the LEDs match the specification?
### 3. INDEPENDENT / PAIR WORK Evaluate, Document & Extend
12. Task 1 (20 min): Complete the Evaluation Discrepancy Log - test all 3 states and all 6 possible transitions. For each: record expected behaviour (from the diagram), actual behaviour (from running the system), and explain any discrepancy. If no discrepancy exists, write: "Behaviour matches specification exactly. Evidence: [observed output]."
13. Task 2 (20 min): Write the Architecture Evaluation paragraph - minimum 80 words. Must: (a) state how many of 6 transitions matched the specification exactly, (b) identify the hardest transition to implement and why, (c) explain why a state machine is more reliable than a nested if/else for this system, (d) propose one additional state that would make the gate system more realistic (e.g. EMERGENCY_STOP).
14. Task 3 (Math, 5 min): Calculate - if the servo takes 150ms to move from 0° to 60°, how long does it take to move from CLOSED (0°) to LOCKED (180°)? Show the calculation. Write the answer on the State Specification Table.
15. Task 4 (Extension, 5 min): Add a 4th state EMERGENCY_STOP: entered when both buttons are pressed simultaneously; servo moves to 45°; both LEDs flash at 500ms. Add it to the diagram, the table, and the code.
16. Rotate Driver/Navigator between Tasks 1 and 2.
### 4. SHOWCASE & DEBRIEF
17. 2 pairs demonstrate their gate system. Facilitator calls out a transition: "Trigger the CLOSED → OPEN transition." Does the servo move immediately? Do the LEDs change? Is the Serial Monitor output correct?
18. Evaluation paragraph: one learner reads aloud. Class evaluates: does it state a specific number of matched transitions? Does it name the hardest transition and give a reason? Is the proposed new state concrete and testable?
19. Facilitator draws a 4-state machine on the board using the proposed states from across the class. Ask: "How many transitions does a 4-state machine have if every state can reach every other state?" Answer: 4 × 3 = 12 directed transitions.
20. English close: "A State Specification Table is a contract between the designer and the programmer. In a team, two different people might write one state each - they need the table to agree on what each state means before a single line of code is written."
21. Math close: angle mapping on the board - map(reading, 0, 1023, 0, 180). "What angle does a reading of 512 produce?" Answer: 90°. "Reading of 256?" Answer: 45°.
22. Collect State Transition Diagram, State Specification Table, Discrepancy Log, and Architecture Evaluation paragraph as this week's artifact.

## Assessment

- Evidence Required
- Formative (During)
- Servo moves to the correct angle for each state. All 3 states function and all 6 transitions trigger correctly. Switch/case structure is modular - one function per state.
- Facilitator observation log. Live demonstration of all 3 states and correct transitions before evaluation phase begins.
- Term 3 Week 1 Artifact
- State Transition Diagram (all states, all transitions, conditions labelled) + State Specification Table (all 3 states fully specified) + Evaluation Discrepancy Log (all 6 transitions tested, discrepancies explained) + Architecture Evaluation paragraph (min. 80 words, 4 required elements). Scored on 5-point DDD rubric (Part 8.3).
- All four physical documents collected and stapled together.
- Differentiation
- Support: provide a pre-completed State Specification Table - learners implement the code from the given spec only. Extension: 4th state EMERGENCY_STOP added to diagram, table, and code; transition timing calculation completed.
- Extension: 4th state functions correctly and timing calculation is shown on the State Specification Table.

## Key Vocabulary

state machine · finite state machine · state · transition · condition · enum · switch/case · servo · PWM · attach() · write() · angle · modular arithmetic · map() · State Specification Table · State Transition Diagram · discrepancy log ⚠  Safeguarding Note Servo motors can produce unexpected rapid movement when code is first uploaded - warn learners to keep fingers clear of the servo arm during the first upload. If a servo motor vibrates and does not settle, the signal wire connection should be checked - do not hold the arm in place manually as this can damage the gear train. Evaluation Discrepancy Log: framing discrepancies as engineering data (not personal failure) is important - facilitator models this language explicitly: "A discrepancy tells us something useful about the system. It is information, not a mistake." Date Delivered: Signature:

## Full source extract (complete)

```
Finite State Machines, State Transition Diagrams & Servo Control
TERM 3 SYSTEMS ENGINEERING CONTEXT
TERMS 1 & 2 PRIOR KNOWLEDGE - What Learners Bring
LEARNING OBJECTIVES
• Draw a State Transition Diagram on paper for a 3-state servo system: CLOSED (0°), OPEN (90°), LOCKED (180°) - showing all states, transition conditions, and output actions
• Declare a state variable using an Arduino enum and implement the state machine as a switch/case structure with one case per state
• Write three modular state functions - void stateClosed(), void stateOpen(), void stateLocked() - each controlling the servo position and LED indicators for that state
• Wire and control a servo motor using the Servo.h library: attach() to a PWM pin, write() to set position in degrees
• Evaluate the implemented system against the hand-drawn State Transition Diagram: does every transition trigger at the correct condition? Document any discrepancy between specification and implementation
• Explain in writing (minimum 80 words) why a state machine architecture produces more reliable behaviour than a single nested if/else chain for systems with more than 3 states
MATERIALS & PREPARATION
• 4 shared laptops with Arduino IDE 2.x and Servo.h library available
• Arduino Uno × 4, USB cables × 4, SG90 servo motors × 4, push buttons × 8 (2 per pair), LED × 8 (red and green, 2 per pair), 220Ω resistors × 8, breadboards × 4, jumper wires
• Printed "State Transition Diagram Template" - blank circles for states, arrows for transitions, boxes for output actions (A4 landscape per pair)
• Printed "State Specification Table" - one row per state: State Name, Entry Condition, Exit Condition, Servo Position (°), LED Colour, Serial Output (A4 per pair)
• Printed "Evaluation Discrepancy Log" - 3-column table: Expected Behaviour (from diagram), Actual Behaviour (from testing), Explanation of Discrepancy (A4 per learner)
• Printed "State Machine Architecture Comparison" - same 3-state problem written two ways: nested if/else vs switch/case state machine (A4 per pair, for analysis in Phase 1)
• Facilitator projected screen
CROSS-CURRICULAR LINKS
LESSON STRUCTURE  (3 hours · Term 3 · Saturday)
ASSESSMENT
FACILITATOR RECORD
ISOMA EDUTECH LIMITED  AI Engineers Programme · Stage 5–6 · Arduino · Term 3
Term 3 · Lesson 1: Predictable Machines - State Machines & Servo Motor Control
TERM 3 · STAGE 5–6 · AI ENGINEERS  |  Term 3 · Week 1
Bloom's: L5 Evaluating
Duration
3 hours (Term-time Saturday)
Term / Week
Term 3 · Week 1
Age Range
10–12 years
Group Size
8 learners (4 pairs - pair programming)
Hardware
Arduino Uno, USB cable, servo motor (SG90 or equivalent), push button × 2, LED × 2 (red and green), 220Ω resistors × 2, breadboard, jumper wires
Software / IDE
Arduino IDE 2.x - Servo.h library, Serial Monitor
Bloom's Level
L5 Evaluating
DDD Phase
EVALUATE - Learners design a finite state machine on paper (state transition diagram), implement it in modular Arduino code using a servo motor and buttons, evaluate whether the system's behaviour exactly matches the specification, and document any discrepancies
NCDC Ref
Uganda NCDC Curriculum P5/P6 - Literacy Strand: Technical specification writing - defining states, transitions, and conditions in plain English before coding. Numeracy Strand: Angles (0°–180°) for servo position; modular arithmetic for state cycling; mapping input ranges to output ranges
Cambridge Ref
Cambridge Primary Computing 0845 - Stage 6: Finite state machines; Modelling system behaviour; Designing predictable interactive systems
Term 3 Systems Engineering Context - What Changes This Term
Terms 1 & 2 built component skills: variables, loops, functions, sensors, arrays, Serial I/O, classification logic. Each week focused on one new concept applied to a single Arduino sketch.
Term 3 focuses on SYSTEMS: how multiple components, concepts, and behaviours work together as a designed whole. Every project this term must include a System Architecture Diagram - a drawing that shows how all parts connect before any code is written.
Week 1 introduces the state machine - the core organising principle of reliable embedded systems. Every Term 3 project is required to be built on a state machine architecture. This is the foundation for Weeks 2, 3, 4, and the capstone in Weeks 5–8.
New hardware enters the curriculum: servo motor (Week 1), EEPROM persistent memory (Week 2), RGB LED (Week 3), shift register and 7-segment display (Week 4). These are professional-grade components used in commercial products.
New documentation standard: every Term 3 session produces a State Transition Diagram, a System Architecture Diagram, or a formal Engineering Change Log - not just a data table or a paragraph. These are the documents engineers submit when they work in teams.
TERMS 1 & 2 PRIOR KNOWLEDGE - What Learners Bring to This Session:
• Modular functions with return values - Term 2 Week 1
• Compound threshold conditions and rolling mean - Term 2 Week 4
• Rule-based classification with if/else chains - Term 2 Week 5 and Term 1 Week 4
• Interactive Serial menu with Serial.parseInt() - Term 2 Week 3
• Arrays and for-loop iteration - Term 2 Week 2
• 7-section Design Brief writing - Term 2 Week 7
• DDD assessment rubric criteria - Term 2 Week 7 and Demo Day
Intended Learning Outcome (ILO)
Big Idea
ILO 3.1 (mastery level) - Write Arduino sketches using the Servo library, modular state machine functions, and enum-based state variables. ILO 3.2 (deepened) - Apply modular arithmetic and angle mapping to a mathematical problem solved computationally in hardware.
Every reliable machine - a traffic light, a washing machine, a vending machine - runs on a state machine. Instead of one tangled block of if/else code, a state machine gives each situation its own named state, its own rules, and its own clear exit conditions. Systems built this way are predictable, testable, and easy to fix.
English Literacy Thread
Mathematics Thread
Technical specification writing: the State Specification Table requires learners to define each state in plain English BEFORE coding - "OPEN state: the gate is fully raised to 90°. The system enters OPEN when Button A is pressed from the CLOSED state. It exits OPEN when Button B is pressed or 10 seconds elapse." This is formal technical writing using precise condition language (when, if, until, unless). The Evaluation paragraph compares specification to implementation - a critical engineering communication skill: "The system behaved as specified in 2 of 3 states. In the LOCKED state, the servo moved to 178° rather than 180° because…"
Servo position in degrees: 0° = fully closed, 90° = halfway, 180° = fully open. Mapping: if sensor reads 0–1023, map to 0°–180° using the Arduino map() function - this is a linear function: angle = (reading / 1023) × 180. Modular arithmetic for state cycling: if currentState is the last state (index 2) and the button is pressed, nextState = (currentState + 1) % 3 = 0. Counting states: a 3-state machine has 3! = 6 possible transition orderings - which ones does the specification allow? This is a combinatorics preview.
Phase
Time
Activities & Facilitator Actions
1. HOOK The Vending Machine
20 min
• Ask: "Think of a vending machine. What are all the states it can be in?" Collect answers: IDLE, SELECTING, DISPENSING, OUT_OF_STOCK, COLLECTING_MONEY. Draw each as a circle on the board.
• Ask: "What causes the machine to move from IDLE to SELECTING?" (A button is pressed.) Draw the arrow. Label it. "What causes SELECTING to go to DISPENSING?" (Money inserted + item selected.) Continue until the diagram is complete.
• Introduce: "This is a state machine - a finite set of states, with defined transitions between them. It is the most important design pattern in embedded systems."
• Distribute the Architecture Comparison sheet. Pairs read both versions - nested if/else vs switch/case. Ask: "Which one would be easier to add a 4th state to? Why? Which one is easier to test one state at a time? Why?"
• Distribute State Transition Diagram Template and State Specification Table. Pairs design their 3-state gate system: CLOSED → OPEN → LOCKED → CLOSED. Complete both documents before any hardware is touched.
• Facilitator reviews each pair's State Specification Table: "Is every entry condition specific and testable? If the entry condition is 'button pressed', which button? Under what circumstances?" Return for revision if vague.
2. GUIDED ACTIVITY Servo, Enum & Switch/Case
60 min
• Step 1 (10 min): Wire the servo motor. Servo signal wire → pin 9 (PWM). Red → 5V. Brown/Black → GND. Wire Button A to pin 2, Button B to pin 4, red LED to pin 7, green LED to pin 8. Facilitator checks all wiring before upload.
• Step 2 (10 min): Include the Servo library and test: #include <Servo.h> Servo gate; gate.attach(9); gate.write(90); - upload and observe the servo move to 90°. Introduce the concept of a PWM pin.
• Step 3 (20 min): Facilitator live-codes the state machine skeleton: enum GateState { CLOSED, OPEN, LOCKED }; GateState currentState = CLOSED; - then the switch/case structure in loop(). Each case calls a state function. Learners type simultaneously.
• Step 4 (20 min): Learners implement their three state functions independently based on their own State Specification Table. Facilitator circulates using only Socratic questions: "What does your table say the servo position should be in this state? Is that what your code does?"
• Upload and run. Test each transition manually. Does the servo move to the correct angle? Do the LEDs match the specification?
3. INDEPENDENT / PAIR WORK Evaluate, Document & Extend
50 min
• Task 1 (20 min): Complete the Evaluation Discrepancy Log - test all 3 states and all 6 possible transitions. For each: record expected behaviour (from the diagram), actual behaviour (from running the system), and explain any discrepancy. If no discrepancy exists, write: "Behaviour matches specification exactly. Evidence: [observed output]."
• Task 2 (20 min): Write the Architecture Evaluation paragraph - minimum 80 words. Must: (a) state how many of 6 transitions matched the specification exactly, (b) identify the hardest transition to implement and why, (c) explain why a state machine is more reliable than a nested if/else for this system, (d) propose one additional state that would make the gate system more realistic (e.g. EMERGENCY_STOP).
• Task 3 (Math, 5 min): Calculate - if the servo takes 150ms to move from 0° to 60°, how long does it take to move from CLOSED (0°) to LOCKED (180°)? Show the calculation. Write the answer on the State Specification Table.
• Task 4 (Extension, 5 min): Add a 4th state EMERGENCY_STOP: entered when both buttons are pressed simultaneously; servo moves to 45°; both LEDs flash at 500ms. Add it to the diagram, the table, and the code.
• Rotate Driver/Navigator between Tasks 1 and 2.
4. SHOWCASE & DEBRIEF
30 min
• 2 pairs demonstrate their gate system. Facilitator calls out a transition: "Trigger the CLOSED → OPEN transition." Does the servo move immediately? Do the LEDs change? Is the Serial Monitor output correct?
• Evaluation paragraph: one learner reads aloud. Class evaluates: does it state a specific number of matched transitions? Does it name the hardest transition and give a reason? Is the proposed new state concrete and testable?
• Facilitator draws a 4-state machine on the board using the proposed states from across the class. Ask: "How many transitions does a 4-state machine have if every state can reach every other state?" Answer: 4 × 3 = 12 directed transitions.
• English close: "A State Specification Table is a contract between the designer and the programmer. In a team, two different people might write one state each - they need the table to agree on what each state means before a single line of code is written."
• Math close: angle mapping on the board - map(reading, 0, 1023, 0, 180). "What angle does a reading of 512 produce?" Answer: 90°. "Reading of 256?" Answer: 45°.
• Collect State Transition Diagram, State Specification Table, Discrepancy Log, and Architecture Evaluation paragraph as this week's artifact.
Component
Description
Evidence Required
Formative (During)
Servo moves to the correct angle for each state. All 3 states function and all 6 transitions trigger correctly. Switch/case structure is modular - one function per state.
Facilitator observation log. Live demonstration of all 3 states and correct transitions before evaluation phase begins.
Term 3 Week 1 Artifact
State Transition Diagram (all states, all transitions, conditions labelled) + State Specification Table (all 3 states fully specified) + Evaluation Discrepancy Log (all 6 transitions tested, discrepancies explained) + Architecture Evaluation paragraph (min. 80 words, 4 required elements). Scored on 5-point DDD rubric (Part 8.3).
All four physical documents collected and stapled together.
Differentiation
Support: provide a pre-completed State Specification Table - learners implement the code from the given spec only. Extension: 4th state EMERGENCY_STOP added to diagram, table, and code; transition timing calculation completed.
Extension: 4th state functions correctly and timing calculation is shown on the State Specification Table.
KEY VOCABULARY
state machine · finite state machine · state · transition · condition · enum · switch/case · servo · PWM · attach() · write() · angle · modular arithmetic · map() · State Specification Table · State Transition Diagram · discrepancy log
⚠  Safeguarding Note
Servo motors can produce unexpected rapid movement when code is first uploaded - warn learners to keep fingers clear of the servo arm during the first upload. If a servo motor vibrates and does not settle, the signal wire connection should be checked - do not hold the arm in place manually as this can damage the gear train. Evaluation Discrepancy Log: framing discrepancies as engineering data (not personal failure) is important - facilitator models this language explicitly: "A discrepancy tells us something useful about the system. It is information, not a mistake."
Facilitator Name:
____________________________
Date Delivered:
____________________________
Signature:
____________________________
```
