# Week 4 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Write compound conditions using && (AND), || (OR), and ! (NOT) operators in Arduino Python and explain each in plain English
- Build a truth table on paper for a 2-variable compound condition and verify it against the code's output
- Design and implement a 3-state finite state machine (FSM) using a state variable and if/else if/else chain — demonstrated as a 3-LED traffic light controlled by a button
- Draw a state transition diagram on paper before coding: circles represent states, arrows represent transitions, labels on arrows represent the trigger condition
- Write a plain-English explanation of every transition in the FSM: "When the system is in State A and button 1 is pressed, it moves to State B."
- Evaluate the advantage of a state variable over hard-coded sequential delays for controlling time-dependent behaviour

## Continue

### INDEPENDENT WORK — Compound Conditions and Extended FSM  (50 min)
1. Truth table verification: for each compound condition written, complete one row of a truth table on the worksheet. Does the code output match the truth table prediction?
2. Extend the FSM: add a 4th state — FAULT (state 3) — triggered when both buttons are pressed simultaneously (button1 == HIGH && button2 == HIGH). In FAULT state, all three LEDs blink alternately. Transition out of FAULT only by pressing button 2 alone. Update the state diagram on paper to include state 3 and its transitions.
3. Evaluation task: write 3 sentences on the architecture map reverse explaining why using a state variable is better than writing 3 separate delay() sequences. "If I used delay(5000) for green, delay(2000) for yellow, delay(3000) for red, the programme would freeze during each delay and could not respond to button presses. The state variable approach uses millis() so the programme is always checking inputs."
4. Check your work carefully. Ask: "Can you show me in your state diagram where the FAULT state is? What triggers the transition into it? What triggers the transition out?" Note participation.
5. 2–3 you demonstrate their traffic light FSM. As the states transition, the presenter narrates: "The system is now in State 0 — RED. I press button 1. It transitions to State 1 — GREEN. After 5 seconds, it will automatically move to State 2 — YELLOW. After 2 seconds, it returns to State 0."
6. One pair demonstrates the FAULT state: "When both buttons are pressed simultaneously, all three LEDs blink. This represents the fault condition. To return to normal, I press button 2 alone."

### SHOWCASE & DEBRIEF  (30 min)
7. Connect to AI: "A finite state machine is one of the oldest forms of artificial intelligence. Self-driving vehicles use extended versions of exactly what you built today — states represent driving modes, sensors trigger transitions. Your traffic light is a tiny autonomous decision-making system."
8. Remember English link: "You wrote 4 transition rules in plain English before writing a single line of code. That is called a requirements specification — it is the document that every professional software team writes before they begin development."
9. Remember Math link: "Truth tables are formal mathematics. AND, OR, and NOT are operations in Boolean algebra — a branch of mathematics invented in the 1850s by George Boole and now the foundation of every computer ever built."
10. Exit question: "Draw a state transition diagram for a lift that serves 3 floors. What are the states? What triggers each transition?" Collect as formative evidence. (No single correct answer — assessing reasoning quality.)
11. Submit all sketches, truth tables, and state diagrams via USB flash drive.

## All Lesson 2 steps (complete list)

1. Truth table verification: for each compound condition written, complete one row of a truth table on the worksheet. Does the code output match the truth table prediction?
2. Extend the FSM: add a 4th state — FAULT (state 3) — triggered when both buttons are pressed simultaneously (button1 == HIGH && button2 == HIGH). In FAULT state, all three LEDs blink alternately. Transition out of FAULT only by pressing button 2 alone. Update the state diagram on paper to include state 3 and its transitions.
3. Evaluation task: write 3 sentences on the architecture map reverse explaining why using a state variable is better than writing 3 separate delay() sequences. "If I used delay(5000) for green, delay(2000) for yellow, delay(3000) for red, the programme would freeze during each delay and could not respond to button presses. The state variable approach uses millis() so the programme is always checking inputs."
4. Check your work carefully. Ask: "Can you show me in your state diagram where the FAULT state is? What triggers the transition into it? What triggers the transition out?" Note participation.
5. 2–3 you demonstrate their traffic light FSM. As the states transition, the presenter narrates: "The system is now in State 0 — RED. I press button 1. It transitions to State 1 — GREEN. After 5 seconds, it will automatically move to State 2 — YELLOW. After 2 seconds, it returns to State 0."
6. One pair demonstrates the FAULT state: "When both buttons are pressed simultaneously, all three LEDs blink. This represents the fault condition. To return to normal, I press button 2 alone."
7. Connect to AI: "A finite state machine is one of the oldest forms of artificial intelligence. Self-driving vehicles use extended versions of exactly what you built today — states represent driving modes, sensors trigger transitions. Your traffic light is a tiny autonomous decision-making system."
8. Remember English link: "You wrote 4 transition rules in plain English before writing a single line of code. That is called a requirements specification — it is the document that every professional software team writes before they begin development."
9. Remember Math link: "Truth tables are formal mathematics. AND, OR, and NOT are operations in Boolean algebra — a branch of mathematics invented in the 1850s by George Boole and now the foundation of every computer ever built."
10. Exit question: "Draw a state transition diagram for a lift that serves 3 floors. What are the states? What triggers each transition?" Collect as formative evidence. (No single correct answer — assessing reasoning quality.)
11. Submit all sketches, truth tables, and state diagrams via USB flash drive.

## Check your understanding
- Formative | (During) | Truth table worksheet: all 4 operators completed correctly by hand before coding (collected) | State transition diagram on paper: 3 states, all transitions correctly labelled with trigger conditions (collected) | Plain-English transition rules: 4 complete sentences, one per transition (checked during guided phase) | Exit state diagram: lift FSM drawn with reasoning evident — assessing quality of systems thinking (collected)
- Exit Assessment | Traffic light FSM: all 3 states transition correctly, button 1 advances state, button 2 returns to RED (verified by you) | FAULT state implemented: both-button trigger activates alternating blink, single button 2 exits (verified) | Compound conditions: at least 3 if statements using &&, ||, ! correctly implemented and commented (verified) | Evaluation paragraph: 3 sentences correctly explaining millis() advantage over delay() (assessed on submission) | All materials submitted via USB flash drive
- Differentiation | Support: Use only 2 states (RED and GREEN) and 1 button before adding the third state. Provide the state variable declaration and the millis() comparison pre-written — learner fills in only the LED pin assignments and the transition trigger. For truth tables, reduce to AND and OR only. | Extension: Add a pedestrian crossing mode as a 5th state: pressing button 1 while in RED activates a pedestrian countdown (blink the green LED 5 times representing 5 seconds), then return to RED. Write the pseudocode for this state as a formal requirements document with numbered rules before coding. Calculate: how many total state transitions are now possible in the extended 5-state system?

## Key words to remember
finite state machine · state · transition · trigger · && (AND) · || (OR) · ! (NOT) · Boolean algebra · truth table · millis() · compound condition · state variable · requirements specification

## Stay safe
Safeguarding Note: The traffic light scenario is a real-world safety system. Frame it clearly as an educational model — it does not replicate a real road traffic control system and must not be described as doing so. Circuit wiring must be checked by the you before USB connection. Three LEDs connected simultaneously to the Arduino must use the correct resistor values (220Ω) to prevent component damage.

## Wrap-up
1. Save your sketch with a clear name for this week.
2. Submit or store your files as required for your course.
3. Unplug hardware and pack kits safely.
