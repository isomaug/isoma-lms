# Lesson T2–4: Advanced Logic, Multi-Condition Systems & Finite State Machines

**Duration:** 3 hours (Saturday) / 90 min × 2 days (Holiday) (split across Week 4 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 2 · Week 4
**Age Range:** 10–12 years
**Group Size:** 8 learners (pair programming, 4 pairs)
**Hardware:** Arduino Uno, USB cable, laptop with Arduino IDE 2.x, 2 push buttons (pins 2 and 3), 3 LEDs (red pin 9, yellow pin 10, green pin 11), 220Ω resistors × 3, breadboard, jumper wires
**Bloom's:** L4 Analysing → L5 Evaluating
**DDD ILO:** ILO 3.2 – Apply variables, functions, and conditions to solve mathematical and logical problems computationally; extend to multi-condition logic using AND/OR/NOT operators and state-based programme design
**NCDC:** Uganda NCDC P5–P6 – ICT Strand: Complex conditional logic, state machines, system design; Mathematics Strand: Boolean algebra, logical operators AND/OR/NOT, truth tables; English Strand: Reading and writing multi-branch logic as structured prose
**Cambridge:** Cambridge Primary Computing 0845 – Stage 5: Complex selection; logical operators; system modelling; finite state machines (introductory)

**Big Idea:** Real systems do not have two states — on and off. They have many states. A traffic light has three. A lift has many more. Today you learn to programme systems that remember where they are and decide where to go next.

**Context:** Term Two Context: Term One Week 4 covered if/else chains and bubble sort. Term Two Week 4 advances this significantly: &&, ||, and ! operators allow compound conditions; a state variable allows the programme to remember its current mode; and the finite state machine concept — central to robotics, game design, and AI — is introduced at a level appropriate for Stage 5. Learners who grasp this concept have the foundation to understand how self-driving vehicles and automated systems make decisions.

## Learning Objectives

- Write compound conditions using && (AND), || (OR), and ! (NOT) operators in Arduino Python and explain each in plain English
- Build a truth table on paper for a 2-variable compound condition and verify it against the code's output
- Design and implement a 3-state finite state machine (FSM) using a state variable and if/else if/else chain — demonstrated as a 3-LED traffic light controlled by a button
- Draw a state transition diagram on paper before coding: circles represent states, arrows represent transitions, labels on arrows represent the trigger condition
- Write a plain-English explanation of every transition in the FSM: "When the system is in State A and button 1 is pressed, it moves to State B."
- Evaluate the advantage of a state variable over hard-coded sequential delays for controlling time-dependent behaviour

## Materials and Preparation

- 4 laptops with Arduino IDE 2.x
- 4 Arduino Uno boards + USB cables
- 3 LEDs per pair (red, yellow, green) + 3 × 220Ω resistors, breadboard, jumper wires
- 2 push buttons per pair (pins 2 and 3)
- Printed "Truth Table Worksheet" (A4 per pair) — 2-variable AND/OR/NOT truth tables with blank outcome columns
- Printed "State Transition Diagram Template" (A4 per pair) — 3 blank circles connected by arrows with label spaces
- Printed "FSM Code Scaffold" (A4 per pair) — skeleton sketch with state variable declared and 3 empty if/else branches
- USB flash drives
- Facilitator device + projected screen

## Cross-Curricular Links

**English:** Writing multi-branch logic as structured prose: before coding the FSM, every learner writes the transition rules in full English sentences on the back of the state diagram. "When the system is in the RED state and button 1 is pressed once, it transitions to the GREEN state." "When the system is in the GREEN state and 5 seconds have elapsed, it transitions to the YELLOW state." This is the same skill as writing conditional rules in a formal policy document or a set of instructions for a referee. The plain-English transition table is assessed as a written artifact. Logical operators in language: AND = both conditions must be true; OR = at least one must be true; NOT = the opposite must be true. Learners find examples of all three in everyday English: "You may enter if you have a ticket AND your name is on the list." "School is closed if it is a public holiday OR there is flooding." "Do not proceed if the road is NOT clear."

**Maths:** Boolean algebra and truth tables: A AND B is true only when both A and B are true (1×1=1). A OR B is true when at least one is true (1+0=1 in Boolean logic). NOT A flips the value (NOT 1 = 0). Learners complete a 4-row truth table for (A AND B), (A OR B), (NOT A), and (A AND NOT B) before writing code. Truth tables are a P6 mathematics topic in the logic strand. State counting: a system with 3 states and 2 transition conditions has at most 3×2=6 possible transitions. Learners map all possible transitions and identify which ones are implemented and which are not.

## Lesson Structure

### WARM-UP & REVIEW — When One Condition Is Not Enough  (20 min)
1. Real-world scenario (5 min): "To cross the road at a traffic light in Kampala, two conditions must be true: the pedestrian light must be green AND there must be no car coming. One condition alone is not enough. This is AND logic." Ask: "Can you think of a situation that uses OR logic? NOT logic?"
2. Distribute the truth table worksheet. Facilitator explains each operator with one row completed. Learners hand-fill all 4 rows for each operator: A AND B, A OR B, NOT A, A AND NOT B. Work independently first (3 min), then compare with partner.
3. Arduino syntax: && for AND, || for OR, ! for NOT. Write on board: if(buttonA == HIGH && buttonB == HIGH) — "Both buttons must be pressed." if(temp > 30 || temp < 5) — "Temperature is extreme if above 30 OR below 5." if(!isRunning) — "Do this only if it is NOT running." Learners copy with their own plain-English translation below each line.
4. State machine introduction (5 min): "Every traffic light at every junction in Kampala is a finite state machine. It is always in one state — RED, YELLOW, or GREEN. A timer or a sensor tells it when to move to the next state. Today you build one." Distribute the state transition diagram template.
5. Circuit build (15 min): facilitator projects the wiring diagram. Three LEDs: red on pin 9, yellow on pin 10, green on pin 11. Button 1 on pin 2 (manual advance), Button 2 on pin 3 (emergency stop, returns to RED). All three LED cathodes to GND via 220Ω resistors. Pairs build following the diagram. Facilitator checks all circuits before power on.
6. State diagram design on paper (10 min): before any code is written, pairs complete the state transition diagram on paper. Three states: RED (state 0), GREEN (state 1), YELLOW (state 2). Transitions: RED → GREEN when button 1 pressed; GREEN → YELLOW after 5 seconds; YELLOW → RED after 2 seconds; any state → RED when button 2 pressed. Label every arrow with its trigger condition.

### GUIDED ACTIVITY — Circuit Build and State Machine Design  (60 min)
7. Write the transition rules in plain English on the diagram reverse (5 min): 4 rules, each in a complete sentence. "When the system is in State 0 (RED) and button 1 is pressed, it transitions to State 1 (GREEN)."
8. Code the FSM (20 min): distribute the FSM code scaffold. Key variables: int state = 0; unsigned long stateStartTime = 0; . In loop(): read both buttons; check elapsed time using millis() - stateStartTime. If/else chain: if(state == 0) — turn on red LED, all others off; check button 1; if pressed, state = 1, stateStartTime = millis(). If(state == 1) — green LED on; after 5000ms, state = 2, stateStartTime = millis(). If(state == 2) — yellow LED; after 2000ms, state = 0, stateStartTime = millis(). Button 2 interrupt: anywhere in loop, if button 2 pressed, state = 0.
9. Upload and test (10 min): does the traffic light follow the state diagram? Test button 1 (manual advance). Test button 2 (emergency return to RED). Rotate Driver/Navigator.
10. Compound condition challenges: write 3 separate if statements using &&, ||, and ! operators linked to the LED circuit. Example: if(state == 1 && millis() - stateStartTime > 3000) — "Turn the green LED bright only if it has been green for more than 3 seconds." if(state == 0 || state == 2) — "Blink the red LED if the system is in RED or YELLOW state." if(!digitalRead(2)) — "If button 1 is NOT pressed, keep the current state."
11. Truth table verification: for each compound condition written, complete one row of a truth table on the worksheet. Does the code output match the truth table prediction?

### INDEPENDENT WORK — Compound Conditions and Extended FSM  (50 min)
12. Extend the FSM: add a 4th state — FAULT (state 3) — triggered when both buttons are pressed simultaneously (button1 == HIGH && button2 == HIGH). In FAULT state, all three LEDs blink alternately. Transition out of FAULT only by pressing button 2 alone. Update the state diagram on paper to include state 3 and its transitions.
13. Evaluation task: write 3 sentences on the architecture map reverse explaining why using a state variable is better than writing 3 separate delay() sequences. "If I used delay(5000) for green, delay(2000) for yellow, delay(3000) for red, the programme would freeze during each delay and could not respond to button presses. The state variable approach uses millis() so the programme is always checking inputs."
14. Facilitator circulates. Ask: "Can you show me in your state diagram where the FAULT state is? What triggers the transition into it? What triggers the transition out?" Note participation.
15. 2–3 pairs demonstrate their traffic light FSM. As the states transition, the presenter narrates: "The system is now in State 0 — RED. I press button 1. It transitions to State 1 — GREEN. After 5 seconds, it will automatically move to State 2 — YELLOW. After 2 seconds, it returns to State 0."
16. One pair demonstrates the FAULT state: "When both buttons are pressed simultaneously, all three LEDs blink. This represents the fault condition. To return to normal, I press button 2 alone."

### SHOWCASE & DEBRIEF  (30 min)
17. Facilitator connects to AI: "A finite state machine is one of the oldest forms of artificial intelligence. Self-driving vehicles use extended versions of exactly what you built today — states represent driving modes, sensors trigger transitions. Your traffic light is a tiny autonomous decision-making system."
18. Facilitator restates English link: "You wrote 4 transition rules in plain English before writing a single line of code. That is called a requirements specification — it is the document that every professional software team writes before they begin development."
19. Facilitator restates Math link: "Truth tables are formal mathematics. AND, OR, and NOT are operations in Boolean algebra — a branch of mathematics invented in the 1850s by George Boole and now the foundation of every computer ever built."
20. Exit question: "Draw a state transition diagram for a lift that serves 3 floors. What are the states? What triggers each transition?" Collect as formative evidence. (No single correct answer — assessing reasoning quality.)
21. Submit all sketches, truth tables, and state diagrams via USB flash drive.

## Assessment

- Formative | (During) | Truth table worksheet: all 4 operators completed correctly by hand before coding (collected) | State transition diagram on paper: 3 states, all transitions correctly labelled with trigger conditions (collected) | Plain-English transition rules: 4 complete sentences, one per transition (checked during guided phase) | Exit state diagram: lift FSM drawn with reasoning evident — assessing quality of systems thinking (collected)
- Exit Assessment | Traffic light FSM: all 3 states transition correctly, button 1 advances state, button 2 returns to RED (verified by facilitator) | FAULT state implemented: both-button trigger activates alternating blink, single button 2 exits (verified) | Compound conditions: at least 3 if statements using &&, ||, ! correctly implemented and commented (verified) | Evaluation paragraph: 3 sentences correctly explaining millis() advantage over delay() (assessed on submission) | All materials submitted via USB flash drive
- Differentiation | Support: Use only 2 states (RED and GREEN) and 1 button before adding the third state. Provide the state variable declaration and the millis() comparison pre-written — learner fills in only the LED pin assignments and the transition trigger. For truth tables, reduce to AND and OR only. | Extension: Add a pedestrian crossing mode as a 5th state: pressing button 1 while in RED activates a pedestrian countdown (blink the green LED 5 times representing 5 seconds), then return to RED. Write the pseudocode for this state as a formal requirements document with numbered rules before coding. Calculate: how many total state transitions are now possible in the extended 5-state system?

## Key Vocabulary

finite state machine · state · transition · trigger · && (AND) · || (OR) · ! (NOT) · Boolean algebra · truth table · millis() · compound condition · state variable · requirements specification

## Safeguarding

Safeguarding Note: The traffic light scenario is a real-world safety system. Frame it clearly as an educational model — it does not replicate a real road traffic control system and must not be described as doing so. Circuit wiring must be checked by the facilitator before USB connection. Three LEDs connected simultaneously to the Arduino must use the correct resistor values (220Ω) to prevent component damage.

## Full source extract (complete)

### Detail body

```
Write compound conditions using && (AND), || (OR), and ! (NOT) operators in Arduino Python and explain each in plain English
Build a truth table on paper for a 2-variable compound condition and verify it against the code's output
Design and implement a 3-state finite state machine (FSM) using a state variable and if/else if/else chain — demonstrated as a 3-LED traffic light controlled by a button
Draw a state transition diagram on paper before coding: circles represent states, arrows represent transitions, labels on arrows represent the trigger condition
Write a plain-English explanation of every transition in the FSM: "When the system is in State A and button 1 is pressed, it moves to State B."
Evaluate the advantage of a state variable over hard-coded sequential delays for controlling time-dependent behaviour
4 laptops with Arduino IDE 2.x
4 Arduino Uno boards + USB cables
3 LEDs per pair (red, yellow, green) + 3 × 220Ω resistors, breadboard, jumper wires
2 push buttons per pair (pins 2 and 3)
Printed "Truth Table Worksheet" (A4 per pair) — 2-variable AND/OR/NOT truth tables with blank outcome columns
Printed "State Transition Diagram Template" (A4 per pair) — 3 blank circles connected by arrows with label spaces
Printed "FSM Code Scaffold" (A4 per pair) — skeleton sketch with state variable declared and 3 empty if/else branches
USB flash drives
Facilitator device + projected screen
Real-world scenario (5 min): "To cross the road at a traffic light in Kampala, two conditions must be true: the pedestrian light must be green AND there must be no car coming. One condition alone is not enough. This is AND logic." Ask: "Can you think of a situation that uses OR logic? NOT logic?"
Distribute the truth table worksheet. Facilitator explains each operator with one row completed. Learners hand-fill all 4 rows for each operator: A AND B, A OR B, NOT A, A AND NOT B. Work independently first (3 min), then compare with partner.
Arduino syntax: && for AND, || for OR, ! for NOT. Write on board: if(buttonA == HIGH && buttonB == HIGH) — "Both buttons must be pressed." if(temp > 30 || temp < 5) — "Temperature is extreme if above 30 OR below 5." if(!isRunning) — "Do this only if it is NOT running." Learners copy with their own plain-English translation below each line.
State machine introduction (5 min): "Every traffic light at every junction in Kampala is a finite state machine. It is always in one state — RED, YELLOW, or GREEN. A timer or a sensor tells it when to move to the next state. Today you build one." Distribute the state transition diagram template.
Circuit build (15 min): facilitator projects the wiring diagram. Three LEDs: red on pin 9, yellow on pin 10, green on pin 11. Button 1 on pin 2 (manual advance), Button 2 on pin 3 (emergency stop, returns to RED). All three LED cathodes to GND via 220Ω resistors. Pairs build following the diagram. Facilitator checks all circuits before power on.
State diagram design on paper (10 min): before any code is written, pairs complete the state transition diagram on paper. Three states: RED (state 0), GREEN (state 1), YELLOW (state 2). Transitions: RED → GREEN when button 1 pressed; GREEN → YELLOW after 5 seconds; YELLOW → RED after 2 seconds; any state → RED when button 2 pressed. Label every arrow with its trigger condition.
Write the transition rules in plain English on the diagram reverse (5 min): 4 rules, each in a complete sentence. "When the system is in State 0 (RED) and button 1 is pressed, it transitions to State 1 (GREEN)."
Code the FSM (20 min): distribute the FSM code scaffold. Key variables: int state = 0; unsigned long stateStartTime = 0; . In loop(): read both buttons; check elapsed time using millis() - stateStartTime. If/else chain: if(state == 0) — turn on red LED, all others off; check button 1; if pressed, state = 1, stateStartTime = millis(). If(state == 1) — green LED on; after 5000ms, state = 2, stateStartTime = millis(). If(state == 2) — yellow LED; after 2000ms, state = 0, stateStartTime = millis(). Button 2 interrupt: anywhere in loop, if button 2 pressed, state = 0.
Upload and test (10 min): does the traffic light follow the state diagram? Test button 1 (manual advance). Test button 2 (emergency return to RED). Rotate Driver/Navigator.
Compound condition challenges: write 3 separate if statements using &&, ||, and ! operators linked to the LED circuit. Example: if(state == 1 && millis() - stateStartTime > 3000) — "Turn the green LED bright only if it has been green for more than 3 seconds." if(state == 0 || state == 2) — "Blink the red LED if the system is in RED or YELLOW state." if(!digitalRead(2)) — "If button 1 is NOT pressed, keep the current state."
Truth table verification: for each compound condition written, complete one row of a truth table on the worksheet. Does the code output match the truth table prediction?
Extend the FSM: add a 4th state — FAULT (state 3) — triggered when both buttons are pressed simultaneously (button1 == HIGH && button2 == HIGH). In FAULT state, all three LEDs blink alternately. Transition out of FAULT only by pressing button 2 alone. Update the state diagram on paper to include state 3 and its transitions.
Evaluation task: write 3 sentences on the architecture map reverse explaining why using a state variable is better than writing 3 separate delay() sequences. "If I used delay(5000) for green, delay(2000) for yellow, delay(3000) for red, the programme would freeze during each delay and could not respond to button presses. The state variable approach uses millis() so the programme is always checking inputs."
Facilitator circulates. Ask: "Can you show me in your state diagram where the FAULT state is? What triggers the transition into it? What triggers the transition out?" Note participation.
2–3 pairs demonstrate their traffic light FSM. As the states transition, the presenter narrates: "The system is now in State 0 — RED. I press button 1. It transitions to State 1 — GREEN. After 5 seconds, it will automatically move to State 2 — YELLOW. After 2 seconds, it returns to State 0."
One pair demonstrates the FAULT state: "When both buttons are pressed simultaneously, all three LEDs blink. This represents the fault condition. To return to normal, I press button 2 alone."
Facilitator connects to AI: "A finite state machine is one of the oldest forms of artificial intelligence. Self-driving vehicles use extended versions of exactly what you built today — states represent driving modes, sensors trigger transitions. Your traffic light is a tiny autonomous decision-making system."
Facilitator restates English link: "You wrote 4 transition rules in plain English before writing a single line of code. That is called a requirements specification — it is the document that every professional software team writes before they begin development."
Facilitator restates Math link: "Truth tables are formal mathematics. AND, OR, and NOT are operations in Boolean algebra — a branch of mathematics invented in the 1850s by George Boole and now the foundation of every computer ever built."
Exit question: "Draw a state transition diagram for a lift that serves 3 floors. What are the states? What triggers each transition?" Collect as formative evidence. (No single correct answer — assessing reasoning quality.)
Submit all sketches, truth tables, and state diagrams via USB flash drive.
finite state machine · state · transition · trigger · && (AND) · || (OR) · ! (NOT) · Boolean algebra · truth table · millis() · compound condition · state variable · requirements specification
```

### Plan header and sections

```
ISOMA EDUTECH LIMITED | Arduino · Python Lesson Plan | Stage 5  (Ages 10–12 · AI Engineers) | Lesson T2–4: Advanced Logic, Multi-Condition Systems & Finite State Machines
Duration | 3 hours (Saturday) / 90 min × 2 days (Holiday) | Term / Week | Term 2 · Week 4
Age Range | 10–12 years | Group Size | 8 learners (pair programming, 4 pairs)
Hardware | Arduino Uno, USB cable, laptop with Arduino IDE 2.x, 2 push buttons (pins 2 and 3), 3 LEDs (red pin 9, yellow pin 10, green pin 11), 220Ω resistors × 3, breadboard, jumper wires | Bloom's Level | L4 Analysing → L5 Evaluating
NCDC Ref | Uganda NCDC P5–P6 – ICT Strand: Complex conditional logic, state machines, system design; Mathematics Strand: Boolean algebra, logical operators AND/OR/NOT, truth tables; English Strand: Reading and writing multi-branch logic as structured prose | Cambridge | Cambridge Primary Computing 0845 – Stage 5: Complex selection; logical operators; system modelling; finite state machines (introductory)
DDD ILO | ILO 3.2 – Apply variables, functions, and conditions to solve mathematical and logical problems computationally; extend to multi-condition logic using AND/OR/NOT operators and state-based programme design | Big Idea | Real systems do not have two states — on and off. They have many states. A traffic light has three. A lift has many more. Today you learn to programme systems that remember where they are and decide where to go next.
Term Two Context: Term One Week 4 covered if/else chains and bubble sort. Term Two Week 4 advances this significantly: &&, ||, and ! operators allow compound conditions; a state variable allows the programme to remember its current mode; and the finite state machine concept — central to robotics, game design, and AI — is introduced at a level appropriate for Stage 5. Learners who grasp this concept have the foundation to understand how self-driving vehicles and automated systems make decisions.
LEARNING OBJECTIVES
MATERIALS AND PREPARATION
CROSS-CURRICULAR LINKS
English | Writing multi-branch logic as structured prose: before coding the FSM, every learner writes the transition rules in full English sentences on the back of the state diagram. "When the system is in the RED state and button 1 is pressed once, it transitions to the GREEN state." "When the system is in the GREEN state and 5 seconds have elapsed, it transitions to the YELLOW state." This is the same skill as writing conditional rules in a formal policy document or a set of instructions for a referee. The plain-English transition table is assessed as a written artifact. Logical operators in language: AND = both conditions must be true; OR = at least one must be true; NOT = the opposite must be true. Learners find examples of all three in everyday English: "You may enter if you have a ticket AND your name is on the list." "School is closed if it is a public holiday OR there is flooding." "Do not proceed if the road is NOT clear."
Maths | Boolean algebra and truth tables: A AND B is true only when both A and B are true (1×1=1). A OR B is true when at least one is true (1+0=1 in Boolean logic). NOT A flips the value (NOT 1 = 0). Learners complete a 4-row truth table for (A AND B), (A OR B), (NOT A), and (A AND NOT B) before writing code. Truth tables are a P6 mathematics topic in the logic strand. State counting: a system with 3 states and 2 transition conditions has at most 3×2=6 possible transitions. Learners map all possible transitions and identify which ones are implemented and which are not.
LESSON STRUCTURE
WARM-UP & REVIEW — When One Condition Is Not Enough  (20 min)
GUIDED ACTIVITY — Circuit Build and State Machine Design  (60 min)
INDEPENDENT WORK — Compound Conditions and Extended FSM  (50 min)
SHOWCASE & DEBRIEF  (30 min)
ASSESSMENT
Formative | (During) | Truth table worksheet: all 4 operators completed correctly by hand before coding (collected) | State transition diagram on paper: 3 states, all transitions correctly labelled with trigger conditions (collected) | Plain-English transition rules: 4 complete sentences, one per transition (checked during guided phase) | Exit state diagram: lift FSM drawn with reasoning evident — assessing quality of systems thinking (collected)
Exit Assessment | Traffic light FSM: all 3 states transition correctly, button 1 advances state, button 2 returns to RED (verified by facilitator) | FAULT state implemented: both-button trigger activates alternating blink, single button 2 exits (verified) | Compound conditions: at least 3 if statements using &&, ||, ! correctly implemented and commented (verified) | Evaluation paragraph: 3 sentences correctly explaining millis() advantage over delay() (assessed on submission) | All materials submitted via USB flash drive
Differentiation | Support: Use only 2 states (RED and GREEN) and 1 button before adding the third state. Provide the state variable declaration and the millis() comparison pre-written — learner fills in only the LED pin assignments and the transition trigger. For truth tables, reduce to AND and OR only. | Extension: Add a pedestrian crossing mode as a 5th state: pressing button 1 while in RED activates a pedestrian countdown (blink the green LED 5 times representing 5 seconds), then return to RED. Write the pseudocode for this state as a formal requirements document with numbered rules before coding. Calculate: how many total state transitions are now possible in the extended 5-state system?
KEY VOCABULARY
Safeguarding Note: The traffic light scenario is a real-world safety system. Frame it clearly as an educational model — it does not replicate a real road traffic control system and must not be described as doing so. Circuit wiring must be checked by the facilitator before USB connection. Three LEDs connected simultaneously to the Arduino must use the correct resistor values (220Ω) to prevent component damage.
Facilitator Name: | _______________________ | Date Delivered: | _______________________ | Signature: | _______________________
```
