# Week 1 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Draw a State Transition Diagram on paper for a 3-state servo system: CLOSED (0°), OPEN (90°), LOCKED (180°) - showing all states, transition conditions, and output actions
- Declare a state variable using an Arduino enum and implement the state machine as a switch/case structure with one case per state
- Write three modular state functions - void stateClosed(), void stateOpen(), void stateLocked() - each controlling the servo position and LED indicators for that state
- Wire and control a servo motor using the Servo.h library: attach() to a PWM pin, write() to set position in degrees
- Evaluate the implemented system against the hand-drawn State Transition Diagram: does every transition trigger at the correct condition? Document any discrepancy between specification and implementation
- Explain in writing (minimum 80 words) why a state machine architecture produces more reliable behaviour than a single nested if/else chain for systems with more than 3 states

## Big idea
ILO 3.1 (mastery level) - Write Arduino sketches using the Servo library, modular state machine functions, and enum-based state variables. ILO 3.2 (deepened) - Apply modular arithmetic and angle mapping to a mathematical problem solved computationally in hardware.

## Let's begin

### 1. HOOK The Vending Machine
1. Ask: "Think of a vending machine. What are all the states it can be in?" Collect answers: IDLE, SELECTING, DISPENSING, OUT_OF_STOCK, COLLECTING_MONEY. Draw each as a circle on the board.
2. Ask: "What causes the machine to move from IDLE to SELECTING?" (A button is pressed.) Draw the arrow. Label it. "What causes SELECTING to go to DISPENSING?" (Money inserted + item selected.) Continue until the diagram is complete.
3. Introduce: "This is a state machine - a finite set of states, with defined transitions between them. It is the most important design pattern in embedded systems."
4. Get ready to use the Architecture Comparison sheet. You read both versions - nested if/else vs switch/case. Ask: "Which one would be easier to add a 4th state to? Why? Which one is easier to test one state at a time? Why?"
5. Get ready to use State Transition Diagram Template and State Specification Table. You design their 3-state gate system: CLOSED -> OPEN -> LOCKED -> CLOSED. Complete both documents before any hardware is touched.
6. You reviews each pair's State Specification Table: "Is every entry condition specific and testable? If the entry condition is 'button pressed', which button? Under what circumstances?" Return for revision if vague.
### 2. GUIDED ACTIVITY Servo, Enum & Switch/Case
7. Step 1 (10 min): Wire the servo motor. Servo signal wire -> pin 9 (PWM). Red -> 5V. Brown/Black -> GND. Wire Button A to pin 2, Button B to pin 4, red LED to pin 7, green LED to pin 8. You checks all wiring before upload.
8. Step 2 (10 min): Include the Servo library and test: #include <Servo.h> Servo gate; gate.attach(9); gate.write(90); - upload and observe the servo move to 90°. Introduce the concept of a PWM pin.
9. Step 3 (20 min): You live-codes the state machine skeleton: enum GateState { CLOSED, OPEN, LOCKED }; GateState currentState = CLOSED; - then the switch/case structure in loop(). Each case calls a state function. You type simultaneously.
10. Step 4 (20 min): You implement their three state functions independently based on their own State Specification Table. You circulates using only Socratic questions: "What does your table say the servo position should be in this state? Is that what your code does?"
11. Upload and run. Test each transition manually. Does the servo move to the correct angle? Do the LEDs match the specification?

## Save your progress
Keep your Arduino sketch and worksheets ready for Lesson 2.

## All Lesson 1 steps (complete list)

1. Ask: "Think of a vending machine. What are all the states it can be in?" Collect answers: IDLE, SELECTING, DISPENSING, OUT_OF_STOCK, COLLECTING_MONEY. Draw each as a circle on the board.
2. Ask: "What causes the machine to move from IDLE to SELECTING?" (A button is pressed.) Draw the arrow. Label it. "What causes SELECTING to go to DISPENSING?" (Money inserted + item selected.) Continue until the diagram is complete.
3. Introduce: "This is a state machine - a finite set of states, with defined transitions between them. It is the most important design pattern in embedded systems."
4. Get ready to use the Architecture Comparison sheet. You read both versions - nested if/else vs switch/case. Ask: "Which one would be easier to add a 4th state to? Why? Which one is easier to test one state at a time? Why?"
5. Get ready to use State Transition Diagram Template and State Specification Table. You design their 3-state gate system: CLOSED -> OPEN -> LOCKED -> CLOSED. Complete both documents before any hardware is touched.
6. You reviews each pair's State Specification Table: "Is every entry condition specific and testable? If the entry condition is 'button pressed', which button? Under what circumstances?" Return for revision if vague.
7. Step 1 (10 min): Wire the servo motor. Servo signal wire -> pin 9 (PWM). Red -> 5V. Brown/Black -> GND. Wire Button A to pin 2, Button B to pin 4, red LED to pin 7, green LED to pin 8. You checks all wiring before upload.
8. Step 2 (10 min): Include the Servo library and test: #include <Servo.h> Servo gate; gate.attach(9); gate.write(90); - upload and observe the servo move to 90°. Introduce the concept of a PWM pin.
9. Step 3 (20 min): You live-codes the state machine skeleton: enum GateState { CLOSED, OPEN, LOCKED }; GateState currentState = CLOSED; - then the switch/case structure in loop(). Each case calls a state function. You type simultaneously.
10. Step 4 (20 min): You implement their three state functions independently based on their own State Specification Table. You circulates using only Socratic questions: "What does your table say the servo position should be in this state? Is that what your code does?"
11. Upload and run. Test each transition manually. Does the servo move to the correct angle? Do the LEDs match the specification?
