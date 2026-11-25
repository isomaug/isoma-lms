# Week 1 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Write a multi-function Arduino sketch that decomposes a problem into at least 3 named void functions, each called from loop()
- Write a function that accepts a parameter (e.g. void blinkTimes(int n)) and a function that returns a value (e.g. int readButton())
- Read a 25-line provided sketch and produce a written architecture map: list every function, its purpose, its inputs, and its outputs
- Annotate the entire provided sketch with plain-English // comments at every function declaration and every significant line
- Debug a provided sketch that has 3 architectural errors (functions called before declaration, wrong return type, missing parameter) and fix all 3
- Explain the concept of decomposition in plain English and connect it to how an essay is divided into paragraphs

## Big idea
Good code is not just code that works — it is code that can be read, understood, and changed by someone else. Architecture is the difference between a programme and a solution.

## What you need
- 4 laptops with Arduino IDE 2.x
- 4 Arduino Uno boards + USB cables, LEDs, push buttons, 220Ω resistors, breadboard, jumper wires
- Printed "Architecture Map Worksheet" (A4 for you) — three-column table: Function Name | Purpose | Inputs -> Outputs
- Printed "25-Line Sketch for Annotation" (A4 for you) — a multi-function sketch with wide right margin for comments
- Printed "Debug Challenge" (A4 for you) — 20-line sketch with 3 intentional architectural errors marked with □
- Printed "Term Two Entry Review" quiz (A5 for you) — 5 quick questions recapping Term One key concepts
- USB flash drives
- A computer screen to follow along

## Links to English and Maths
- **English:** Decomposition as essay structure: you explicitly draws the parallel between organising a programme into functions and organising an essay into paragraphs. Each function has a single job — like each paragraph has a single main idea. The architecture map requires you to write a purpose statement for each function in plain English (a full sentence). The annotation task is treated as a technical writing exercise: comments must be complete sentences in the correct tense ("This function makes the LED blink n times.").
- **Maths:** Functions as mathematical input-output machines: blinkTimes(int n) is a function f(n) — given n, produce a result. Return values make this explicit: int doubleValue(int x) { return x * 2; } is f(x) = 2x written in code. Modular arithmetic connection: if a loop runs inside a function every 500ms, how many times does it run in 1 minute? (60000ms ÷ 500ms = 120 iterations.) Link to P6 mathematics: expressing a relationship between two quantities.

## Let's begin

### WARM-UP & REVIEW — Term One Recap  (20 min)
1. Get ready to use the Term Two Entry Review quiz. You complete individually in silence (5 min). Questions recap: (1) Name 3 Arduino data types. (2) Write the syntax for a for loop from 1 to 10. (3) What does Serial.println() do? (4) Name one comparison operator. (5) What is an if/else condition used for? You swap and self-check (you read answers aloud).
2. Quick-fire class recap: you points to a Term One concept on the board and asks a learner to explain it in one sentence. Rotate through 6 concepts: variable, loop, condition, function, sensor, array.
3. Introduce Term Two framing: "Everything you learned in Term One was a single tool. This term, we combine those tools to build bigger things. Today we learn how to organise those tools properly — that is called code architecture."
4. Show two versions of the same programme on the projected screen: Version A — all code in loop(), no functions, 40 lines. Version B — same behaviour, decomposed into 4 functions, each 5–8 lines. Ask: "Which is easier to read? Which would be easier to fix if something broke? Which is the better code?"
5. Type along as you build on the projected screen — pause at each new concept. Start with a review function: void blinkOnce() { digitalWrite(13, HIGH); delay(500); digitalWrite(13, LOW); delay(500); }. Call it from loop(). You follow on your own sketches.

### GUIDED ACTIVITY — Functions with Parameters and Return Values  (60 min)
6. Add a parameter: modify to void blinkTimes(int n) { for(int i = 0; i < n; i++) { blinkOnce(); } }. Call with blinkTimes(3) and blinkTimes(7). Ask: "What changes when we change the number? What stays the same?" Link to mathematics: "n is the input, the LED behaviour is the output. This is a function in the mathematical sense."
7. Return values: write int readButton() { return digitalRead(2); }. Use in loop(): if(readButton() == HIGH) { blinkTimes(5); }. Explain: "This function goes out, gets a value, and brings it back. Like a messenger — it does one job and returns with the answer."
8. Architecture map task: distribute the printed 25-line sketch. You read the entire sketch and fill in the architecture map worksheet: every function listed, its purpose in one plain-English sentence, its inputs (parameters), and its outputs (return value or side effect).
9. Annotation task: using the wide right margin of the printed sketch, annotate every function declaration and every significant line with a plain-English comment. Must be complete sentences.
10. Rotate your own pacing. Continue with the debug challenge.

## Save your progress
Keep your sketch, notes, and worksheets ready for Lesson 2, where you will finish this week's activities and check your learning.

## All Lesson 1 steps (complete list)

1. Get ready to use the Term Two Entry Review quiz. You complete individually in silence (5 min). Questions recap: (1) Name 3 Arduino data types. (2) Write the syntax for a for loop from 1 to 10. (3) What does Serial.println() do? (4) Name one comparison operator. (5) What is an if/else condition used for? You swap and self-check (you read answers aloud).
2. Quick-fire class recap: you points to a Term One concept on the board and asks a learner to explain it in one sentence. Rotate through 6 concepts: variable, loop, condition, function, sensor, array.
3. Introduce Term Two framing: "Everything you learned in Term One was a single tool. This term, we combine those tools to build bigger things. Today we learn how to organise those tools properly — that is called code architecture."
4. Show two versions of the same programme on the projected screen: Version A — all code in loop(), no functions, 40 lines. Version B — same behaviour, decomposed into 4 functions, each 5–8 lines. Ask: "Which is easier to read? Which would be easier to fix if something broke? Which is the better code?"
5. Type along as you build on the projected screen — pause at each new concept. Start with a review function: void blinkOnce() { digitalWrite(13, HIGH); delay(500); digitalWrite(13, LOW); delay(500); }. Call it from loop(). You follow on your own sketches.
6. Add a parameter: modify to void blinkTimes(int n) { for(int i = 0; i < n; i++) { blinkOnce(); } }. Call with blinkTimes(3) and blinkTimes(7). Ask: "What changes when we change the number? What stays the same?" Link to mathematics: "n is the input, the LED behaviour is the output. This is a function in the mathematical sense."
7. Return values: write int readButton() { return digitalRead(2); }. Use in loop(): if(readButton() == HIGH) { blinkTimes(5); }. Explain: "This function goes out, gets a value, and brings it back. Like a messenger — it does one job and returns with the answer."
8. Architecture map task: distribute the printed 25-line sketch. You read the entire sketch and fill in the architecture map worksheet: every function listed, its purpose in one plain-English sentence, its inputs (parameters), and its outputs (return value or side effect).
9. Annotation task: using the wide right margin of the printed sketch, annotate every function declaration and every significant line with a plain-English comment. Must be complete sentences.
10. Rotate your own pacing. Continue with the debug challenge.
