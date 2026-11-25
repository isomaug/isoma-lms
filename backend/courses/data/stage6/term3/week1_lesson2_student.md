# Week 1 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Draw a State Transition Diagram on paper for a 3-state servo system: CLOSED (0°), OPEN (90°), LOCKED (180°) - showing all states, transition conditions, and output actions
- Declare a state variable using an Arduino enum and implement the state machine as a switch/case structure with one case per state
- Write three modular state functions - void stateClosed(), void stateOpen(), void stateLocked() - each controlling the servo position and LED indicators for that state
- Wire and control a servo motor using the Servo.h library: attach() to a PWM pin, write() to set position in degrees
- Evaluate the implemented system against the hand-drawn State Transition Diagram: does every transition trigger at the correct condition? Document any discrepancy between specification and implementation
- Explain in writing (minimum 80 words) why a state machine architecture produces more reliable behaviour than a single nested if/else chain for systems with more than 3 states

## Continue

### 3. INDEPENDENT / PAIR WORK Evaluate, Document & Extend
1. Task 1 (20 min): Complete the Evaluation Discrepancy Log - test all 3 states and all 6 possible transitions. For each: record expected behaviour (from the diagram), actual behaviour (from running the system), and explain any discrepancy. If no discrepancy exists, write: "Behaviour matches specification exactly. Evidence: [observed output]."
2. Task 2 (20 min): Write the Architecture Evaluation paragraph - minimum 80 words. Must: (a) state how many of 6 transitions matched the specification exactly, (b) identify the hardest transition to implement and why, (c) explain why a state machine is more reliable than a nested if/else for this system, (d) propose one additional state that would make the gate system more realistic (e.g. EMERGENCY_STOP).
3. Task 3 (Math, 5 min): Calculate - if the servo takes 150ms to move from 0° to 60°, how long does it take to move from CLOSED (0°) to LOCKED (180°)? Show the calculation. Write the answer on the State Specification Table.
4. Task 4 (Extension, 5 min): Add a 4th state EMERGENCY_STOP: entered when both buttons are pressed simultaneously; servo moves to 45°; both LEDs flash at 500ms. Add it to the diagram, the table, and the code.
5. Rotate Driver/Navigator between Tasks 1 and 2.
### 4. SHOWCASE & DEBRIEF
6. 2 you demonstrate their gate system. You calls out a transition: "Trigger the CLOSED -> OPEN transition." Does the servo move immediately? Do the LEDs change? Is the Serial Monitor output correct?
7. Evaluation paragraph: one learner reads aloud. Class evaluates: does it state a specific number of matched transitions? Does it name the hardest transition and give a reason? Is the proposed new state concrete and testable?
8. You draws a 4-state machine on the board using the proposed states from across yourself. Ask: "How many transitions does a 4-state machine have if every state can reach every other state?" Answer: 4 × 3 = 12 directed transitions.
9. English close: "A State Specification Table is a contract between the designer and the programmer. In a team, two different people might write one state each - they need the table to agree on what each state means before a single line of code is written."
10. Math close: angle mapping on the board - map(reading, 0, 1023, 0, 180). "What angle does a reading of 512 produce?" Answer: 90°. "Reading of 256?" Answer: 45°.
11. Collect State Transition Diagram, State Specification Table, Discrepancy Log, and Architecture Evaluation paragraph as this week's artifact.

## All Lesson 2 steps (complete list)

1. Task 1 (20 min): Complete the Evaluation Discrepancy Log - test all 3 states and all 6 possible transitions. For each: record expected behaviour (from the diagram), actual behaviour (from running the system), and explain any discrepancy. If no discrepancy exists, write: "Behaviour matches specification exactly. Evidence: [observed output]."
2. Task 2 (20 min): Write the Architecture Evaluation paragraph - minimum 80 words. Must: (a) state how many of 6 transitions matched the specification exactly, (b) identify the hardest transition to implement and why, (c) explain why a state machine is more reliable than a nested if/else for this system, (d) propose one additional state that would make the gate system more realistic (e.g. EMERGENCY_STOP).
3. Task 3 (Math, 5 min): Calculate - if the servo takes 150ms to move from 0° to 60°, how long does it take to move from CLOSED (0°) to LOCKED (180°)? Show the calculation. Write the answer on the State Specification Table.
4. Task 4 (Extension, 5 min): Add a 4th state EMERGENCY_STOP: entered when both buttons are pressed simultaneously; servo moves to 45°; both LEDs flash at 500ms. Add it to the diagram, the table, and the code.
5. Rotate Driver/Navigator between Tasks 1 and 2.
6. 2 you demonstrate their gate system. You calls out a transition: "Trigger the CLOSED -> OPEN transition." Does the servo move immediately? Do the LEDs change? Is the Serial Monitor output correct?
7. Evaluation paragraph: one learner reads aloud. Class evaluates: does it state a specific number of matched transitions? Does it name the hardest transition and give a reason? Is the proposed new state concrete and testable?
8. You draws a 4-state machine on the board using the proposed states from across yourself. Ask: "How many transitions does a 4-state machine have if every state can reach every other state?" Answer: 4 × 3 = 12 directed transitions.
9. English close: "A State Specification Table is a contract between the designer and the programmer. In a team, two different people might write one state each - they need the table to agree on what each state means before a single line of code is written."
10. Math close: angle mapping on the board - map(reading, 0, 1023, 0, 180). "What angle does a reading of 512 produce?" Answer: 90°. "Reading of 256?" Answer: 45°.
11. Collect State Transition Diagram, State Specification Table, Discrepancy Log, and Architecture Evaluation paragraph as this week's artifact.

## Check your understanding
- Evidence Required
- Formative (During)
- Servo moves to the correct angle for each state. All 3 states function and all 6 transitions trigger correctly. Switch/case structure is modular - one function per state.
- Your own check log. Live demonstration of all 3 states and correct transitions before evaluation phase begins.
- Term 3 Week 1 Artifact
- State Transition Diagram (all states, all transitions, conditions labelled) + State Specification Table (all 3 states fully specified) + Evaluation Discrepancy Log (all 6 transitions tested, discrepancies explained) + Architecture Evaluation paragraph (min. 80 words, 4 required elements). Scored on 5-point DDD rubric (Part 8.3).
- All four physical documents collected and stapled together.
- Differentiation
- Support: provide a pre-completed State Specification Table - you implement the code from the given spec only. Extension: 4th state EMERGENCY_STOP added to diagram, table, and code; transition timing calculation completed.
- Extension: 4th state functions correctly and timing calculation is shown on the State Specification Table.

## Key words to remember
state machine · finite state machine · state · transition · condition · enum · switch/case · servo · PWM · attach() · write() · angle · modular arithmetic · map() · State Specification Table · State Transition Diagram · discrepancy log ⚠  Safeguarding Note Servo motors can produce unexpected rapid movement when code is first uploaded - warn you to keep fingers clear of the servo arm during the first upload. If a servo motor vibrates and does not settle, the signal wire connection should be checked - do not hold the arm in place manually as this can damage the gear train. Evaluation Discrepancy Log: framing discrepancies as engineering data (not personal failure) is important - you models this language explicitly: "A discrepancy tells us something useful about the system. It is information, not a mistake." Date Delivered: Signature:

## Wrap-up
1. Save your sketch with a clear week name.
2. Disconnect hardware carefully and pack the kit.
3. Submit files as required for your course.
