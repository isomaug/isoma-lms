# Week 2 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Explain the difference between blocking (delay-based) and non-blocking (millis-based) timing in plain English, and give a real-world example of a system that would fail if it used blocking timing
- Write a millis()-based non-blocking blink sketch for a single LED that blinks independently while the main loop continues executing — verified by printing a running counter to Serial Monitor that does not pause during the blink
- Define and instantiate a struct in Arduino C++ to represent an LED with fields: int pin, bool isOn, unsigned long lastToggleTime, and long interval
- Write a sketch that creates an array of 3 LED structs — each with a different blink interval — and uses a single for loop and millis() to update all 3 LEDs simultaneously and independently
- Write a technical comparison document (minimum 120 words) contrasting delay()-based and millis()-based approaches across 4 criteria: responsiveness, code complexity, scalability, and suitability for real-world embedded systems
- Calculate: if LED 1 blinks every 200ms, LED 2 every 500ms, and LED 3 every 1000ms, at what elapsed time (in ms) do all three LEDs toggle simultaneously for the first time? Express as the LCM of the three intervals

## Big idea
delay() stops everything. millis() measures time while the programme keeps running. The difference between a frozen programme and a responsive system is the choice between these two approaches. Real embedded systems — medical monitors, vehicle control units, smart appliances — can never use delay().

## What you need
- 4 laptops with Arduino IDE 2.x
- 4 Arduino Uno boards + USB cables
- 3 LEDs (red, yellow, green) + 3 × 220Ω resistors, push button, breadboard, jumper wires for you
- Printed "Non-Blocking Timing Diagram" (A4 for you) — timeline showing delay() blocking vs millis() non-blocking side by side across a 3-second window for 2 simultaneous tasks
- Printed "Struct Design Worksheet" (A5 for you) — blank struct template and a 3-row table for instantiating 3 LED structs with pin, interval, and initial state values
- Printed "LCM Calculation Worksheet" (A5 for you) — step-by-step LCM working for three intervals with space for calculations
- Printed "Technical Comparison Document Template" (A5 for you) — 4 rows: Criterion | delay() | millis() | Real-world implication
- USB flash drives
- A computer screen to follow along

## Links to English and Maths
- **English:** Technical comparison document writing: the 120-word comparison across 4 criteria is structured technical prose — not a list. Each criterion must be addressed in a full paragraph that contrasts both approaches and states a real-world implication. "In terms of responsiveness, delay()-based timing freezes the entire programme for the duration of the delay. This means a programme cannot respond to any input — sensor, button, or Serial command — while a delay is running. A medical heart rate monitor that used delay() would miss a pulse if the delay interval exceeded the measurement window. millis()-based timing, by contrast, allows the main loop to run continuously…" This type of writing — comparative, criteria-based, with real-world application — is the foundation of technical reporting and evaluative essays at secondary level.
- **Maths:** Elapsed time as a continuous variable: millis() returns an unsigned long representing the number of milliseconds since the Arduino last reset. unsigned long elapsed = millis() - lastToggleTime; is a subtraction of two timestamps — the mathematical operation of finding the duration between two points on a continuous time axis. LCM calculation: if LED 1 blinks every 200ms, LED 2 every 500ms, LED 3 every 1000ms — when do all three first toggle simultaneously? LCM(200, 500, 1000): factor 200 = 2³ × 5²; factor 500 = 2² × 5³; factor 1000 = 2³ × 5³. LCM = 2³ × 5³ = 1000ms. You verify: does the Arduino output show all 3 LEDs toggling at exactly t=1000ms, t=2000ms, t=3000ms? Proportional reasoning: if LED 3's interval is doubled to 2000ms, the new LCM becomes LCM(200, 500, 2000) = 2000ms.

## Let's begin

### WARM-UP & REVIEW — Why delay() Is Dangerous  (20 min)
1. Demonstrate the problem (5 min): load a delay()-based sketch onto the Arduino: LED blinks with delay(2000). Connect a push button. Ask: "Press the button while the LED is in the delay phase." Nothing happens — the button press is ignored. "Why?" Because delay() pauses the entire programme — no inputs are read, no sensors polled, no Serial commands processed. "What kind of real device would be dangerous if it behaved this way?" (Brake system, smoke alarm, medical monitor.)
2. Get ready to use the Non-Blocking Timing Diagram. Walk through it: "The top timeline shows delay()-based: during the 2-second delay, the entire programme is frozen — no button, no sensor, no Serial. The bottom timeline shows millis()-based: the LED state is toggled at the right time, but the main loop keeps running continuously. At every point in the millis() timeline, inputs can be read."
3. Introduce millis() syntax on the board: unsigned long currentTime = millis(); unsigned long elapsed = currentTime - lastToggleTime; if(elapsed >= interval) { /* toggle LED */ lastToggleTime = currentTime; }. You copy with plain-English annotations for each line.
4. Introduce struct syntax: "A struct is a custom data type — it bundles related variables into one named unit. Instead of int led1Pin, bool led1IsOn, unsigned long led1LastTime — we write struct LED { int pin; bool isOn; unsigned long lastToggleTime; long interval; }; and create one variable LED myLed; that holds all four values together."
5. Single LED non-blocking sketch (15 min): you live-codes. Declare: const int ledPin = 9; bool ledState = false; unsigned long lastToggle = 0; long blinkInterval = 500; In loop(): unsigned long now = millis(); if(now - lastToggle >= blinkInterval) { lastToggle = now; ledState = !ledState; digitalWrite(ledPin, ledState); } Serial.println(millis()); Upload. Observe Serial Monitor: numbers increase continuously — the loop never pauses. Now press the push button: the programme responds instantly even during the LED blink cycle.

### GUIDED ACTIVITY — Non-Blocking Single LED, then Three Simultaneous LEDs  (60 min)
6. Verify non-blocking: "Count the Serial Monitor lines during one 500ms blink interval. How many times did the loop run?" (Hundreds of times.) "With delay(500), how many times would the loop run?" (Exactly once.) You record the answer on the struct worksheet.
7. Struct definition and instantiation (15 min): you adds the struct above setup(). struct LED { int pin; bool isOn; unsigned long lastToggleTime; long interval; }; Create 3 instances: LED leds[3]; In setup(), initialise each: leds[0] = {9, false, 0, 200}; leds[1] = {10, false, 0, 500}; leds[2] = {11, false, 0, 1000}; pinMode for each pin. Upload and confirm all 3 LEDs blink at your own rates.
8. Unified update loop (15 min): in loop(): unsigned long now = millis(); for(int i = 0; i < 3; i++) { if(now - leds[i].lastToggleTime >= leds[i].interval) { leds[i].lastToggleTime = now; leds[i].isOn = !leds[i].isOn; digitalWrite(leds[i].pin, leds[i].isOn); } } Serial.println(now); Upload. Observe: 3 independently blinking LEDs driven by a 3-line for loop. Ask: "What would change if we added a 4th LED? How many lines of code would that require?" (Only 1 more initialisation line — the for loop handles it automatically.)
9. Rotate your own pacing. New driver modifies leds[1].interval in Serial Monitor using the Serial.parseInt() skill from T3 Week 1 — type a new interval value and update leds[1].interval dynamically.
10. LCM calculation worksheet (10 min): you complete the LCM calculation for intervals 200ms, 500ms, 1000ms showing full prime factorisation working. Predict: at what millisecond timestamps will all 3 LEDs toggle simultaneously? Verify against the Arduino Serial Monitor output — does the programme confirm the predicted timestamps?

## Save your progress
Keep your sketch, notes, and worksheets ready for Lesson 2, where you will finish this week's activities and check your learning.

## All Lesson 1 steps (complete list)

1. Demonstrate the problem (5 min): load a delay()-based sketch onto the Arduino: LED blinks with delay(2000). Connect a push button. Ask: "Press the button while the LED is in the delay phase." Nothing happens — the button press is ignored. "Why?" Because delay() pauses the entire programme — no inputs are read, no sensors polled, no Serial commands processed. "What kind of real device would be dangerous if it behaved this way?" (Brake system, smoke alarm, medical monitor.)
2. Get ready to use the Non-Blocking Timing Diagram. Walk through it: "The top timeline shows delay()-based: during the 2-second delay, the entire programme is frozen — no button, no sensor, no Serial. The bottom timeline shows millis()-based: the LED state is toggled at the right time, but the main loop keeps running continuously. At every point in the millis() timeline, inputs can be read."
3. Introduce millis() syntax on the board: unsigned long currentTime = millis(); unsigned long elapsed = currentTime - lastToggleTime; if(elapsed >= interval) { /* toggle LED */ lastToggleTime = currentTime; }. You copy with plain-English annotations for each line.
4. Introduce struct syntax: "A struct is a custom data type — it bundles related variables into one named unit. Instead of int led1Pin, bool led1IsOn, unsigned long led1LastTime — we write struct LED { int pin; bool isOn; unsigned long lastToggleTime; long interval; }; and create one variable LED myLed; that holds all four values together."
5. Single LED non-blocking sketch (15 min): you live-codes. Declare: const int ledPin = 9; bool ledState = false; unsigned long lastToggle = 0; long blinkInterval = 500; In loop(): unsigned long now = millis(); if(now - lastToggle >= blinkInterval) { lastToggle = now; ledState = !ledState; digitalWrite(ledPin, ledState); } Serial.println(millis()); Upload. Observe Serial Monitor: numbers increase continuously — the loop never pauses. Now press the push button: the programme responds instantly even during the LED blink cycle.
6. Verify non-blocking: "Count the Serial Monitor lines during one 500ms blink interval. How many times did the loop run?" (Hundreds of times.) "With delay(500), how many times would the loop run?" (Exactly once.) You record the answer on the struct worksheet.
7. Struct definition and instantiation (15 min): you adds the struct above setup(). struct LED { int pin; bool isOn; unsigned long lastToggleTime; long interval; }; Create 3 instances: LED leds[3]; In setup(), initialise each: leds[0] = {9, false, 0, 200}; leds[1] = {10, false, 0, 500}; leds[2] = {11, false, 0, 1000}; pinMode for each pin. Upload and confirm all 3 LEDs blink at your own rates.
8. Unified update loop (15 min): in loop(): unsigned long now = millis(); for(int i = 0; i < 3; i++) { if(now - leds[i].lastToggleTime >= leds[i].interval) { leds[i].lastToggleTime = now; leds[i].isOn = !leds[i].isOn; digitalWrite(leds[i].pin, leds[i].isOn); } } Serial.println(now); Upload. Observe: 3 independently blinking LEDs driven by a 3-line for loop. Ask: "What would change if we added a 4th LED? How many lines of code would that require?" (Only 1 more initialisation line — the for loop handles it automatically.)
9. Rotate your own pacing. New driver modifies leds[1].interval in Serial Monitor using the Serial.parseInt() skill from T3 Week 1 — type a new interval value and update leds[1].interval dynamically.
10. LCM calculation worksheet (10 min): you complete the LCM calculation for intervals 200ms, 500ms, 1000ms showing full prime factorisation working. Predict: at what millisecond timestamps will all 3 LEDs toggle simultaneously? Verify against the Arduino Serial Monitor output — does the programme confirm the predicted timestamps?
