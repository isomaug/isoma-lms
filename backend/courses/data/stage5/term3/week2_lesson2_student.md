# Week 2 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Explain the difference between blocking (delay-based) and non-blocking (millis-based) timing in plain English, and give a real-world example of a system that would fail if it used blocking timing
- Write a millis()-based non-blocking blink sketch for a single LED that blinks independently while the main loop continues executing — verified by printing a running counter to Serial Monitor that does not pause during the blink
- Define and instantiate a struct in Arduino C++ to represent an LED with fields: int pin, bool isOn, unsigned long lastToggleTime, and long interval
- Write a sketch that creates an array of 3 LED structs — each with a different blink interval — and uses a single for loop and millis() to update all 3 LEDs simultaneously and independently
- Write a technical comparison document (minimum 120 words) contrasting delay()-based and millis()-based approaches across 4 criteria: responsiveness, code complexity, scalability, and suitability for real-world embedded systems
- Calculate: if LED 1 blinks every 200ms, LED 2 every 500ms, and LED 3 every 1000ms, at what elapsed time (in ms) do all three LEDs toggle simultaneously for the first time? Express as the LCM of the three intervals

## Continue

### INDEPENDENT WORK — LCM Calculation, Documentation, and Extension  (50 min)
1. Technical comparison document (20 min): write the 120-word minimum comparison across 4 criteria on the template. Each criterion must be a complete prose paragraph — not bullet points. Criteria: (1) Responsiveness — what happens to button/sensor inputs during timing? (2) Code complexity — which approach requires more variables and logic? (3) Scalability — what happens when a 4th, 5th, or 10th LED is added? (4) Real-world suitability — name a real embedded system where each approach would or would not be appropriate.
2. Struct extension challenge: add a 4th field to the LED struct — int blinkCount — that tracks how many times each LED has toggled. In the update loop, increment blinkCount each time a toggle occurs. After 60 seconds (60000ms), print a report to Serial Monitor: "LED 0: ___ blinks. LED 1: ___ blinks. LED 2: ___ blinks." Before printing, calculate the expected count for each LED: LED 0 should have blinked 60000÷200 = 300 times. Verify the actual count matches. If it differs, explain why (elapsed time rounding, startup delay).
3. Check your work carefully, observes. Ask: "Could you use this struct approach to manage sensor readings instead of LEDs? What fields would a Sensor struct need?" Note participation.
4. 2–3 you demonstrate their 3-LED struct sketch. As the LEDs blink independently, the presenter explains: "LED at pin 9 blinks every 200ms — 5 times per second. LED at pin 10 blinks every 500ms — twice per second. LED at pin 11 blinks every 1000ms — once per second. All three are controlled by the same 3-line for loop. Adding a 4th LED requires one more initialisation line only."
5. One pair presents their LCM calculation and verification: "We predicted all three LEDs would toggle simultaneously at t=1000ms. The Serial Monitor confirms this — at approximately 1000, 2000, and 3000 milliseconds, all three LEDs change state at the same time."
6. One learner reads their technical comparison document aloud (just the Responsiveness and Scalability paragraphs). Class evaluates: "Is this a clear comparison? Does it name a real-world system? Is the writing specific enough?"

### SHOWCASE & DEBRIEF  (30 min)
7. Connect to professional engineering: "The millis()-based struct pattern you wrote today is used in production embedded systems including automotive controllers, medical devices, and industrial automation. The struct is a simplified version of an object — which is the core concept in the object-oriented programming you will study in Stage 6 and in secondary school computing."
8. Remember English link: "Your technical comparison document used the same structure as an evaluative essay: criteria, evidence for each position, and a real-world implication. That structure works for comparing any two approaches — not just delay() versus millis()."
9. Remember Math link: "LCM is a concept from number theory. Today you used it to predict the exact moment three independent timing cycles would synchronise — that is a real engineering application of LCM. The same mathematics is used to synchronise data packets in network protocols."
10. Exit question (written): "In one sentence for each: what is a struct? What is non-blocking timing? What is the LCM of 300ms and 500ms?" Collect.
11. Submit sketch, LCM worksheet, technical comparison document via USB flash drive.

## All Lesson 2 steps (complete list)

1. Technical comparison document (20 min): write the 120-word minimum comparison across 4 criteria on the template. Each criterion must be a complete prose paragraph — not bullet points. Criteria: (1) Responsiveness — what happens to button/sensor inputs during timing? (2) Code complexity — which approach requires more variables and logic? (3) Scalability — what happens when a 4th, 5th, or 10th LED is added? (4) Real-world suitability — name a real embedded system where each approach would or would not be appropriate.
2. Struct extension challenge: add a 4th field to the LED struct — int blinkCount — that tracks how many times each LED has toggled. In the update loop, increment blinkCount each time a toggle occurs. After 60 seconds (60000ms), print a report to Serial Monitor: "LED 0: ___ blinks. LED 1: ___ blinks. LED 2: ___ blinks." Before printing, calculate the expected count for each LED: LED 0 should have blinked 60000÷200 = 300 times. Verify the actual count matches. If it differs, explain why (elapsed time rounding, startup delay).
3. Check your work carefully, observes. Ask: "Could you use this struct approach to manage sensor readings instead of LEDs? What fields would a Sensor struct need?" Note participation.
4. 2–3 you demonstrate their 3-LED struct sketch. As the LEDs blink independently, the presenter explains: "LED at pin 9 blinks every 200ms — 5 times per second. LED at pin 10 blinks every 500ms — twice per second. LED at pin 11 blinks every 1000ms — once per second. All three are controlled by the same 3-line for loop. Adding a 4th LED requires one more initialisation line only."
5. One pair presents their LCM calculation and verification: "We predicted all three LEDs would toggle simultaneously at t=1000ms. The Serial Monitor confirms this — at approximately 1000, 2000, and 3000 milliseconds, all three LEDs change state at the same time."
6. One learner reads their technical comparison document aloud (just the Responsiveness and Scalability paragraphs). Class evaluates: "Is this a clear comparison? Does it name a real-world system? Is the writing specific enough?"
7. Connect to professional engineering: "The millis()-based struct pattern you wrote today is used in production embedded systems including automotive controllers, medical devices, and industrial automation. The struct is a simplified version of an object — which is the core concept in the object-oriented programming you will study in Stage 6 and in secondary school computing."
8. Remember English link: "Your technical comparison document used the same structure as an evaluative essay: criteria, evidence for each position, and a real-world implication. That structure works for comparing any two approaches — not just delay() versus millis()."
9. Remember Math link: "LCM is a concept from number theory. Today you used it to predict the exact moment three independent timing cycles would synchronise — that is a real engineering application of LCM. The same mathematics is used to synchronise data packets in network protocols."
10. Exit question (written): "In one sentence for each: what is a struct? What is non-blocking timing? What is the LCM of 300ms and 500ms?" Collect.
11. Submit sketch, LCM worksheet, technical comparison document via USB flash drive.

## Check your understanding
- Formative | (During) | Non-blocking single LED sketch confirmed: Serial Monitor shows continuous counting without pauses; button press responds during blink cycle (verified during guided phase) | Struct worksheet: 3 LED structs correctly instantiated with pin, isOn, lastToggleTime, and interval values (collected) | LCM calculation worksheet: prime factorisation working shown, predicted timestamp verified against Serial Monitor output (collected) | Exit question: struct, non-blocking timing, and LCM(300, 500) all answered correctly in one sentence each (collected)
- Exit Assessment | 3-LED struct sketch: all three LEDs blink simultaneously and independently at different intervals using a single for loop — compiles, uploads, and verified live (verified by you) | Dynamic interval update: Serial.parseInt() correctly modifies leds[1].interval at runtime without restarting (verified) | Technical comparison document: 120 words minimum, 4 criteria addressed in prose paragraphs, real-world system named for each (submitted, assessed on 5-point artifact rubric) | LCM calculation: prime factorisation shown with correct LCM and verified timestamps (submitted) | All materials submitted via USB flash drive
- Differentiation | Support: Provide the struct definition and 3-instance array pre-written. Learner writes only the for loop body — the millis() comparison and the digitalWrite call — with a template showing the variable names to use: if(now - leds[i]._____ >= leds[i]._____). For the comparison document, reduce to 2 criteria (responsiveness and scalability) and accept 70 words minimum. | Extension: Replace the LED struct array with a more general Task struct: struct Task { int pin; bool state; unsigned long lastRun; long interval; void (*action)(int, bool); }; — where action is a function pointer. This allows each task to call a different function. Write 3 different action functions (fast blink, slow pulse, SOS pattern) and assign each to one Task. This introduces function pointers — a concept from advanced C++ — at an accessible level. Calculate: if 10 tasks each run every 100ms, what is the minimum loop() execution speed needed to guarantee no task is missed?

## Key words to remember
millis() · non-blocking · blocking · struct · field · instance · elapsed time · unsigned long · interval · LCM (Lowest Common Multiple) · synchronise · embedded system · scalability · function pointer

## Stay safe
Safeguarding Note: Three simultaneous LEDs connected to the Arduino should use 220Ω resistors on each — verify before USB connection. Remind you that holding an LED in place while the circuit is live is safe; handling jumper wires while the board is powered should be avoided as accidental short circuits can reset the board. All Serial Monitor output during testing must contain only fictional or technical data — no personal information.

## Wrap-up
1. Save your sketch with a clear name for this week.
2. Submit or store your files as required for your course.
3. Unplug hardware and pack kits safely.
