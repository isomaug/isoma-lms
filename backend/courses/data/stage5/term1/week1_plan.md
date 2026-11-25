# Lesson 1: Hello Arduino – Setting Up the IDE & Reading Code

**Duration:** 3 hours (Saturday) / 90 min × 2 days (Holiday) (split across Week 1 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 1 · Week 1
**Age Range:** 10–12 years
**Group Size:** 8 learners (pair programming, 4 pairs)
**Hardware:** Arduino Uno, USB cable, laptop with Arduino IDE 2.x, LED on pin 13
**Bloom's:** L3 Applying
**DDD ILO:** ILO 3.1 – Interpret and write Arduino sketches in Python that correctly use setup(), loop(), variables, digital/analogue I/O, and Serial.println() to control hardware
**NCDC:** Uganda NCDC P5–P6 – ICT Strand: Introduction to programming; English Strand: Reading structured text; Mathematics Strand: Number operations and units
**Cambridge:** Cambridge Primary Computing 0845 – Stage 5: Programming; understanding code structure; debugging

**Big Idea:** Code is structured text with a purpose. Every line you can read, you can also write.

## Learning Objectives

- Install Arduino IDE 2.x, select the correct board (Uno) and COM port, and upload the example Blink sketch successfully
- Identify and explain the purpose of setup(), loop(), pinMode(), digitalWrite(), and delay() in a provided sketch
- Add a plain-English comment to every line of the Blink sketch using the // syntax
- Modify the delay() values and predict, then observe, how the LED behaviour changes
- Convert millisecond values to seconds and explain the relationship aloud to a partner

## Materials and Preparation

- 4 laptops with Arduino IDE 2.x pre-installed (or installation package ready)
- 4 Arduino Uno boards + USB cables
- LEDs already wired on pin 13 (or built-in LED used)
- Printed "Blink Code Reading Sheet" (A4 per pair) – Blink code with blank comment column
- Milliseconds-to-seconds conversion worksheet (A5 per learner)
- USB flash drives for sketch submission
- Facilitator device + projected screen or large TV
- "One Star, One Wish" feedback cards (pre-printed)

## Cross-Curricular Links

**English:** Reading code as structured text: facilitator explicitly models how to read each line aloud as a sentence. Learners write plain-English comments (full sentences) for every line. "// This line makes the LED turn on for 1 second." Code annotation is treated as technical writing.

**Maths:** Unit conversion: delay(1000) = 1 second; delay(500) = 0.5 seconds. Learners complete a conversion worksheet: 2500ms = ? seconds; 750ms = ? seconds. Learners plot the LED ON/OFF state over a 5-second timeline on a number line.

## Lesson Structure

### HOOK – What Does Code Look Like? (20 min)
1. Display the Blink sketch on the projected screen with no explanation. Ask: "What do you notice? What do you think this does? Have you seen text like this before?"
2. Learners discuss in pairs for 2 minutes. Take 3 responses. Write key words (setup, loop, delay) on the board.
3. Facilitator reads the code aloud line-by-line using a full English sentence for each line. "This line tells the Arduino to set pin 13 as an output." Learners follow on their printed reading sheet.
4. Bridge: "Today you will upload this code, read every line, and add your own explanation to it. You are going to be code translators."
5. Introduce the DDD Big Idea: "Code is structured text. Every line you can read, you can also write."
6. Distribute laptops and Arduino kits. Pairs connect Arduino via USB. Facilitator demonstrates: Open Arduino IDE → Tools → Board → Arduino Uno → Tools → Port → select correct COM port.

### GUIDED ACTIVITY – IDE Setup and First Upload (60 min)
7. Learners follow step-by-step. Facilitator circulates. Common issue checkpoint: "Can you see your Arduino board name in the bottom bar?"
8. Open File → Examples → 01.Basics → Blink. Facilitator projects and points out: setup() block, loop() block, each function call.
9. Upload the sketch (→ arrow button). Observe: LED blinks on pin 13. Pairs confirm: "My LED is blinking." If not, debug together: check port, check board.
10. Annotation task: Using the printed reading sheet, learners write a plain-English comment for each of the 10 lines of the Blink sketch. Must be full sentences. Facilitator checks 2 pairs during this time.
11. Challenge – Modify and Predict: Change delay(1000) to delay(200). Before uploading, each learner writes their prediction on the sheet: "I think the LED will ___." Upload. Was the prediction correct?
12. Change delay(1000) to delay(3000). Repeat predict-then-test cycle. Learners write: "When I increased the delay, ___."

### INDEPENDENT WORK – Annotate and Customise (50 min)
13. Pairs complete the milliseconds-to-seconds conversion worksheet. Swap and peer-mark.
14. Rotate Driver/Navigator roles. New driver takes control of the keyboard.
15. Task: Each pair creates their own version of Blink with a custom blink pattern (e.g., 3 fast blinks, pause, 2 slow blinks). Every line must have a // comment.
16. Pair challenge: Write a new sketch from scratch (not copy-paste) using only: pinMode(), digitalWrite(HIGH), digitalWrite(LOW), delay(). Facilitator prompts with questions only – no direct answers.
17. LED timeline: on squared paper, learners draw a 10-second timeline showing when their LED is ON and OFF based on their delay values. Label each segment with the ms value.
18. Facilitator circulates, takes participation notes, provides verbal formative feedback. Ask: "What does this line do? Why did you choose that delay value?"

### SHOWCASE & DEBRIEF (30 min)
19. 2–3 pairs demonstrate their custom blink pattern to the class. As their LED blinks, they read aloud their code comments line by line.
20. Class observes: "Can you see the connection between the delay numbers and how fast it blinks?"
21. Facilitator restates the English link: "Today you wrote technical comments – that is a real writing skill used by professional software engineers."
22. Facilitator restates the Math link: "You converted milliseconds to seconds – that is unit conversion you already know from science and maths."
23. Exit question: "Name one function you used today and explain in one sentence what it does." Learners respond orally to their partner.
24. Save and submit sketches to facilitator via USB flash drive.

## Assessment

- Formative (During) | Observation checklist: Board selected + COM port correct? (Yes / Partially / Not yet) | LED blinking after upload? (Yes / No – supported) | Comments written in full sentences? (Facilitator spot-checks 2 pairs during guided phase) | Conversion worksheet completed? (Collected at end of session)
- Exit Assessment | Modified Blink sketch with correct delay changes compiles and runs on the Arduino (checked by facilitator) | Every line of the Blink sketch has a learner-written // comment in plain English (assessed on submission) | Submitted to facilitator via USB flash drive (required for artifact record)
- Differentiation | Support: Pre-load Arduino IDE with Blink already open. Provide a sentence starter sheet for comments: "This line tells the Arduino to…" Use the built-in LED so no wiring is needed. | Extension: Write a function void fastBlink() that blinks 5 times quickly and call it from loop(). Add Serial.begin(9600) and Serial.println("Blinking now!") to the serial monitor.

## Key Vocabulary

sketch · setup() · loop() · pinMode() · digitalWrite() · delay() · compile · upload · comment · milliseconds · syntax

## Safeguarding

Safeguarding Note: Ensure learners do not type personal information (full names, phone numbers, school names) into code comments or Serial.println() strings. Use only first names or fictional labels. Supervise USB flash drive use – no personal files should be shared.

## Full source extract (complete)

### Detail body

```
Install Arduino IDE 2.x, select the correct board (Uno) and COM port, and upload the example Blink sketch successfully
Identify and explain the purpose of setup(), loop(), pinMode(), digitalWrite(), and delay() in a provided sketch
Add a plain-English comment to every line of the Blink sketch using the // syntax
Modify the delay() values and predict, then observe, how the LED behaviour changes
Convert millisecond values to seconds and explain the relationship aloud to a partner
4 laptops with Arduino IDE 2.x pre-installed (or installation package ready)
4 Arduino Uno boards + USB cables
LEDs already wired on pin 13 (or built-in LED used)
Printed "Blink Code Reading Sheet" (A4 per pair) – Blink code with blank comment column
Milliseconds-to-seconds conversion worksheet (A5 per learner)
USB flash drives for sketch submission
Facilitator device + projected screen or large TV
"One Star, One Wish" feedback cards (pre-printed)
Display the Blink sketch on the projected screen with no explanation. Ask: "What do you notice? What do you think this does? Have you seen text like this before?"
Learners discuss in pairs for 2 minutes. Take 3 responses. Write key words (setup, loop, delay) on the board.
Facilitator reads the code aloud line-by-line using a full English sentence for each line. "This line tells the Arduino to set pin 13 as an output." Learners follow on their printed reading sheet.
Bridge: "Today you will upload this code, read every line, and add your own explanation to it. You are going to be code translators."
Introduce the DDD Big Idea: "Code is structured text. Every line you can read, you can also write."
Distribute laptops and Arduino kits. Pairs connect Arduino via USB. Facilitator demonstrates: Open Arduino IDE → Tools → Board → Arduino Uno → Tools → Port → select correct COM port.
Learners follow step-by-step. Facilitator circulates. Common issue checkpoint: "Can you see your Arduino board name in the bottom bar?"
Open File → Examples → 01.Basics → Blink. Facilitator projects and points out: setup() block, loop() block, each function call.
Upload the sketch (→ arrow button). Observe: LED blinks on pin 13. Pairs confirm: "My LED is blinking." If not, debug together: check port, check board.
Annotation task: Using the printed reading sheet, learners write a plain-English comment for each of the 10 lines of the Blink sketch. Must be full sentences. Facilitator checks 2 pairs during this time.
Challenge – Modify and Predict: Change delay(1000) to delay(200). Before uploading, each learner writes their prediction on the sheet: "I think the LED will ___." Upload. Was the prediction correct?
Change delay(1000) to delay(3000). Repeat predict-then-test cycle. Learners write: "When I increased the delay, ___."
Pairs complete the milliseconds-to-seconds conversion worksheet. Swap and peer-mark.
Rotate Driver/Navigator roles. New driver takes control of the keyboard.
Task: Each pair creates their own version of Blink with a custom blink pattern (e.g., 3 fast blinks, pause, 2 slow blinks). Every line must have a // comment.
Pair challenge: Write a new sketch from scratch (not copy-paste) using only: pinMode(), digitalWrite(HIGH), digitalWrite(LOW), delay(). Facilitator prompts with questions only – no direct answers.
LED timeline: on squared paper, learners draw a 10-second timeline showing when their LED is ON and OFF based on their delay values. Label each segment with the ms value.
Facilitator circulates, takes participation notes, provides verbal formative feedback. Ask: "What does this line do? Why did you choose that delay value?"
2–3 pairs demonstrate their custom blink pattern to the class. As their LED blinks, they read aloud their code comments line by line.
Class observes: "Can you see the connection between the delay numbers and how fast it blinks?"
Facilitator restates the English link: "Today you wrote technical comments – that is a real writing skill used by professional software engineers."
Facilitator restates the Math link: "You converted milliseconds to seconds – that is unit conversion you already know from science and maths."
Exit question: "Name one function you used today and explain in one sentence what it does." Learners respond orally to their partner.
Save and submit sketches to facilitator via USB flash drive.
sketch · setup() · loop() · pinMode() · digitalWrite() · delay() · compile · upload · comment · milliseconds · syntax
```

### Plan header and sections

```
ISOMA EDUTECH LIMITED | Arduino · Python Lesson Plan | Stage 5 (Ages 10–12 · AI Engineers) | Lesson 1: Hello Arduino – Setting Up the IDE & Reading Code
Duration | 3 hours (Saturday) / 90 min × 2 days (Holiday) | Term / Week | Term 1 · Week 1
Age Range | 10–12 years | Group Size | 8 learners (pair programming, 4 pairs)
Hardware | Arduino Uno, USB cable, laptop with Arduino IDE 2.x, LED on pin 13 | Bloom's Level | L3 Applying
NCDC Ref | Uganda NCDC P5–P6 – ICT Strand: Introduction to programming; English Strand: Reading structured text; Mathematics Strand: Number operations and units | Cambridge | Cambridge Primary Computing 0845 – Stage 5: Programming; understanding code structure; debugging
DDD ILO | ILO 3.1 – Interpret and write Arduino sketches in Python that correctly use setup(), loop(), variables, digital/analogue I/O, and Serial.println() to control hardware | Big Idea | Code is structured text with a purpose. Every line you can read, you can also write.
LEARNING OBJECTIVES
MATERIALS AND PREPARATION
CROSS-CURRICULAR LINKS
English | Reading code as structured text: facilitator explicitly models how to read each line aloud as a sentence. Learners write plain-English comments (full sentences) for every line. "// This line makes the LED turn on for 1 second." Code annotation is treated as technical writing.
Maths | Unit conversion: delay(1000) = 1 second; delay(500) = 0.5 seconds. Learners complete a conversion worksheet: 2500ms = ? seconds; 750ms = ? seconds. Learners plot the LED ON/OFF state over a 5-second timeline on a number line.
LESSON STRUCTURE
HOOK – What Does Code Look Like? (20 min)
GUIDED ACTIVITY – IDE Setup and First Upload (60 min)
INDEPENDENT WORK – Annotate and Customise (50 min)
SHOWCASE & DEBRIEF (30 min)
ASSESSMENT
Formative (During) | Observation checklist: Board selected + COM port correct? (Yes / Partially / Not yet) | LED blinking after upload? (Yes / No – supported) | Comments written in full sentences? (Facilitator spot-checks 2 pairs during guided phase) | Conversion worksheet completed? (Collected at end of session)
Exit Assessment | Modified Blink sketch with correct delay changes compiles and runs on the Arduino (checked by facilitator) | Every line of the Blink sketch has a learner-written // comment in plain English (assessed on submission) | Submitted to facilitator via USB flash drive (required for artifact record)
Differentiation | Support: Pre-load Arduino IDE with Blink already open. Provide a sentence starter sheet for comments: "This line tells the Arduino to…" Use the built-in LED so no wiring is needed. | Extension: Write a function void fastBlink() that blinks 5 times quickly and call it from loop(). Add Serial.begin(9600) and Serial.println("Blinking now!") to the serial monitor.
KEY VOCABULARY
Safeguarding Note: Ensure learners do not type personal information (full names, phone numbers, school names) into code comments or Serial.println() strings. Use only first names or fictional labels. Supervise USB flash drive use – no personal files should be shared.
Facilitator Name: | ____________________ | Date Delivered: | _____________________ | Signature: | _____________________
```
