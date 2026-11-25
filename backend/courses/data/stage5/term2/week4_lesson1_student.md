# Week 4 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Write compound conditions using && (AND), || (OR), and ! (NOT) operators in Arduino Python and explain each in plain English
- Build a truth table on paper for a 2-variable compound condition and verify it against the code's output
- Design and implement a 3-state finite state machine (FSM) using a state variable and if/else if/else chain — demonstrated as a 3-LED traffic light controlled by a button
- Draw a state transition diagram on paper before coding: circles represent states, arrows represent transitions, labels on arrows represent the trigger condition
- Write a plain-English explanation of every transition in the FSM: "When the system is in State A and button 1 is pressed, it moves to State B."
- Evaluate the advantage of a state variable over hard-coded sequential delays for controlling time-dependent behaviour

## Big idea
Real systems do not have two states — on and off. They have many states. A traffic light has three. A lift has many more. Today you learn to programme systems that remember where they are and decide where to go next.

## What you need
- 4 laptops with Arduino IDE 2.x
- 4 Arduino Uno boards + USB cables
- 3 LEDs for you (red, yellow, green) + 3 × 220Ω resistors, breadboard, jumper wires
- 2 push buttons for you (pins 2 and 3)
- Printed "Truth Table Worksheet" (A4 for you) — 2-variable AND/OR/NOT truth tables with blank outcome columns
- Printed "State Transition Diagram Template" (A4 for you) — 3 blank circles connected by arrows with label spaces
- Printed "FSM Code Scaffold" (A4 for you) — skeleton sketch with state variable declared and 3 empty if/else branches
- USB flash drives
- A computer screen to follow along

## Links to English and Maths
- **English:** Writing multi-branch logic as structured prose: before coding the FSM, every learner writes the transition rules in full English sentences on the back of the state diagram. "When the system is in the RED state and button 1 is pressed once, it transitions to the GREEN state." "When the system is in the GREEN state and 5 seconds have elapsed, it transitions to the YELLOW state." This is the same skill as writing conditional rules in a formal policy document or a set of instructions for a referee. The plain-English transition table is assessed as a written artifact. Logical operators in language: AND = both conditions must be true; OR = at least one must be true; NOT = the opposite must be true. You find examples of all three in everyday English: "You may enter if you have a ticket AND your name is on the list." "School is closed if it is a public holiday OR there is flooding." "Do not proceed if the road is NOT clear."
- **Maths:** Boolean algebra and truth tables: A AND B is true only when both A and B are true (1×1=1). A OR B is true when at least one is true (1+0=1 in Boolean logic). NOT A flips the value (NOT 1 = 0). You complete a 4-row truth table for (A AND B), (A OR B), (NOT A), and (A AND NOT B) before writing code. Truth tables are a P6 mathematics topic in the logic strand. State counting: a system with 3 states and 2 transition conditions has at most 3×2=6 possible transitions. You map all possible transitions and identify which ones are implemented and which are not.

## Let's begin

### WARM-UP & REVIEW — When One Condition Is Not Enough  (20 min)
1. Real-world scenario (5 min): "To cross the road at a traffic light in Kampala, two conditions must be true: the pedestrian light must be green AND there must be no car coming. One condition alone is not enough. This is AND logic." Ask: "Can you think of a situation that uses OR logic? NOT logic?"
2. Get ready to use the truth table worksheet. You explains each operator with one row completed. You hand-fill all 4 rows for each operator: A AND B, A OR B, NOT A, A AND NOT B. Work independently first (3 min), then compare with partner.
3. Arduino syntax: && for AND, || for OR, ! for NOT. Write on board: if(buttonA == HIGH && buttonB == HIGH) — "Both buttons must be pressed." if(temp > 30 || temp < 5) — "Temperature is extreme if above 30 OR below 5." if(!isRunning) — "Do this only if it is NOT running." You copy with your own plain-English translation below each line.
4. State machine introduction (5 min): "Every traffic light at every junction in Kampala is a finite state machine. It is always in one state — RED, YELLOW, or GREEN. A timer or a sensor tells it when to move to the next state. Today you build one." Get ready to use the state transition diagram template.
5. Circuit build (15 min): you project the wiring diagram. Three LEDs: red on pin 9, yellow on pin 10, green on pin 11. Button 1 on pin 2 (manual advance), Button 2 on pin 3 (emergency stop, returns to RED). All three LED cathodes to GND via 220Ω resistors. You build following the diagram. Check all circuits before power on.

### GUIDED ACTIVITY — Circuit Build and State Machine Design  (60 min)
6. State diagram design on paper (10 min): before any code is written, you complete the state transition diagram on paper. Three states: RED (state 0), GREEN (state 1), YELLOW (state 2). Transitions: RED -> GREEN when button 1 pressed; GREEN -> YELLOW after 5 seconds; YELLOW -> RED after 2 seconds; any state -> RED when button 2 pressed. Label every arrow with its trigger condition.
7. Write the transition rules in plain English on the diagram reverse (5 min): 4 rules, each in a complete sentence. "When the system is in State 0 (RED) and button 1 is pressed, it transitions to State 1 (GREEN)."
8. Code the FSM (20 min): distribute the FSM code scaffold. Key variables: int state = 0; unsigned long stateStartTime = 0; . In loop(): read both buttons; check elapsed time using millis() - stateStartTime. If/else chain: if(state == 0) — turn on red LED, all others off; check button 1; if pressed, state = 1, stateStartTime = millis(). If(state == 1) — green LED on; after 5000ms, state = 2, stateStartTime = millis(). If(state == 2) — yellow LED; after 2000ms, state = 0, stateStartTime = millis(). Button 2 interrupt: anywhere in loop, if button 2 pressed, state = 0.
9. Upload and test (10 min): does the traffic light follow the state diagram? Test button 1 (manual advance). Test button 2 (emergency return to RED). Rotate your own pacing.
10. Compound condition challenges: write 3 separate if statements using &&, ||, and ! operators linked to the LED circuit. Example: if(state == 1 && millis() - stateStartTime > 3000) — "Turn the green LED bright only if it has been green for more than 3 seconds." if(state == 0 || state == 2) — "Blink the red LED if the system is in RED or YELLOW state." if(!digitalRead(2)) — "If button 1 is NOT pressed, keep the current state."

## Save your progress
Keep your sketch, notes, and worksheets ready for Lesson 2, where you will finish this week's activities and check your learning.

## All Lesson 1 steps (complete list)

1. Real-world scenario (5 min): "To cross the road at a traffic light in Kampala, two conditions must be true: the pedestrian light must be green AND there must be no car coming. One condition alone is not enough. This is AND logic." Ask: "Can you think of a situation that uses OR logic? NOT logic?"
2. Get ready to use the truth table worksheet. You explains each operator with one row completed. You hand-fill all 4 rows for each operator: A AND B, A OR B, NOT A, A AND NOT B. Work independently first (3 min), then compare with partner.
3. Arduino syntax: && for AND, || for OR, ! for NOT. Write on board: if(buttonA == HIGH && buttonB == HIGH) — "Both buttons must be pressed." if(temp > 30 || temp < 5) — "Temperature is extreme if above 30 OR below 5." if(!isRunning) — "Do this only if it is NOT running." You copy with your own plain-English translation below each line.
4. State machine introduction (5 min): "Every traffic light at every junction in Kampala is a finite state machine. It is always in one state — RED, YELLOW, or GREEN. A timer or a sensor tells it when to move to the next state. Today you build one." Get ready to use the state transition diagram template.
5. Circuit build (15 min): you project the wiring diagram. Three LEDs: red on pin 9, yellow on pin 10, green on pin 11. Button 1 on pin 2 (manual advance), Button 2 on pin 3 (emergency stop, returns to RED). All three LED cathodes to GND via 220Ω resistors. You build following the diagram. Check all circuits before power on.
6. State diagram design on paper (10 min): before any code is written, you complete the state transition diagram on paper. Three states: RED (state 0), GREEN (state 1), YELLOW (state 2). Transitions: RED -> GREEN when button 1 pressed; GREEN -> YELLOW after 5 seconds; YELLOW -> RED after 2 seconds; any state -> RED when button 2 pressed. Label every arrow with its trigger condition.
7. Write the transition rules in plain English on the diagram reverse (5 min): 4 rules, each in a complete sentence. "When the system is in State 0 (RED) and button 1 is pressed, it transitions to State 1 (GREEN)."
8. Code the FSM (20 min): distribute the FSM code scaffold. Key variables: int state = 0; unsigned long stateStartTime = 0; . In loop(): read both buttons; check elapsed time using millis() - stateStartTime. If/else chain: if(state == 0) — turn on red LED, all others off; check button 1; if pressed, state = 1, stateStartTime = millis(). If(state == 1) — green LED on; after 5000ms, state = 2, stateStartTime = millis(). If(state == 2) — yellow LED; after 2000ms, state = 0, stateStartTime = millis(). Button 2 interrupt: anywhere in loop, if button 2 pressed, state = 0.
9. Upload and test (10 min): does the traffic light follow the state diagram? Test button 1 (manual advance). Test button 2 (emergency return to RED). Rotate your own pacing.
10. Compound condition challenges: write 3 separate if statements using &&, ||, and ! operators linked to the LED circuit. Example: if(state == 1 && millis() - stateStartTime > 3000) — "Turn the green LED bright only if it has been green for more than 3 seconds." if(state == 0 || state == 2) — "Blink the red LED if the system is in RED or YELLOW state." if(!digitalRead(2)) — "If button 1 is NOT pressed, keep the current state."
