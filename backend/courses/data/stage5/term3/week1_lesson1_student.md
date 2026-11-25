# Week 1 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Write an Arduino sketch that receives a command word via Serial Monitor (e.g. "ON", "OFF", "BLINK") and responds by controlling hardware accordingly using Serial.readString() and String comparison
- Write an Arduino sketch that receives an integer via Serial Monitor using Serial.parseInt() and uses it as a variable (e.g. number of blinks, delay value, LED brightness)
- Calculate baud rate as a data transmission rate: at 9600 baud, how many bits are transmitted per second? How many characters per second (assuming 8 bits per character)? How long does it take to transmit a 50-character String?
- Apply a 6-criterion code review rubric to evaluate a provided 30-line sketch written by a fictional peer, scoring each criterion on a 4-point scale and writing a specific justification for every score
- Rewrite one section of the reviewed sketch to improve it — documenting the specific engineering standard violated and the exact change made
- Write a 100-word code review report summarising the quality of the reviewed sketch: what it does well, what violates engineering standards, and what the highest-priority improvement is

## Big idea
Every professional engineer reviews other people's code before it is used. Code review is not criticism — it is the engineering standard that keeps systems safe, readable, and improvable. Today you become both author and reviewer.

## What you need
- 4 laptops with Arduino IDE 2.x
- 4 Arduino Uno boards + USB cables, LEDs, push buttons, 220Ω resistors, breadboards, jumper wires
- Printed "Code Review Rubric" (A4 for you) — 6 criteria: (1) Decomposition — functions used? (2) Comments — every function and significant line annotated? (3) Variable naming — descriptive names? (4) Data types — correct type for each value? (5) Efficiency — no redundant code? (6) Readability — consistent indentation and spacing?
- Printed "Peer Sketch for Review" (A4 for you) — a 30-line Arduino sketch written at a plausible learner level, with 4 deliberate violations of the 6 code review criteria embedded (poor variable names, missing comments, redundant code blocks, inconsistent indentation)
- Printed "Baud Rate Calculation Worksheet" (A5 for you) — stepped calculations for bits/second, characters/second, and transmission time
- Printed "Code Review Report Template" (A5 for you) — 3-section structure: Strengths | Violations Found | Highest-Priority Improvement
- USB flash drives
- A computer screen to follow along

## Links to English and Maths
- **English:** Code review as critical reading: reading code written by someone else is an act of reading comprehension. The reviewer must understand what the author intended, identify where the writing deviates from the standard, and communicate that finding clearly and constructively. The code review report is a piece of evaluative writing — it must name the specific violation, quote the offending line, and justify the recommended change. This mirrors the skill of annotating a peer essay: "In line 14, the variable is named 'x' — this violates the descriptive naming standard because a reader cannot determine what value it holds without reading 6 more lines of context." The 100-word report must use formal, evidence-based language — not "the code is messy" but "three functions lack comments, making it impossible to understand their purpose without tracing the execution manually."
- **Maths:** Baud rate as a rate-of-change problem: 9600 baud = 9600 bits per second. At 8 bits per character (standard ASCII), the character transmission rate = 9600 ÷ 8 = 1200 characters per second. Time to transmit a 50-character String = 50 ÷ 1200 = 0.042 seconds = 42 milliseconds. Why does this matter? A delay(10) in loop() runs every 10ms — faster than the Serial buffer can clear a long String. You calculate: at what String length does transmission time exceed 10ms? (10ms × 1200 char/s = 12 characters.) Strings longer than 12 characters should use delay(50) or longer to avoid buffer overflow. This connects rate, time, and data — a P6-level proportional reasoning problem in a real engineering context.

## Let's begin

### WARM-UP & REVIEW — Two-Way Communication  (20 min)
1. Term Two recap: "In Terms One and Two, the Arduino talked TO you — it printed values to the Serial Monitor. Today it also listens to you. You can type a command and the Arduino will respond." Demonstrate live: you has a pre-loaded sketch. Types "ON" into the Serial Monitor — LED turns on. Types "OFF" — LED turns off. Types "BLINK" — LED blinks 5 times. Ask: "How do you think this works? What does the Arduino need to be able to do?"
2. Introduce the new functions: Serial.available() — returns the number of characters waiting in the input buffer. Serial.readString() — reads all available characters as a String. Serial.parseInt() — reads the next integer from the buffer. Write syntax on the board. You copy with a plain-English annotation for each.
3. Baud rate introduction (5 min): distribute the calculation worksheet. "Baud rate is a transmission speed — how fast data travels between the Arduino and the computer. 9600 baud means 9600 bits per second. Let's calculate what that means in practice." Walk through the first calculation together. You complete the remaining rows independently.
4. Bridge to code review: "This term, you are senior AI Engineers. Senior engineers do not just write code — they review each other's code before it ships. Today you learn how to do that professionally, using the same criteria the DDD uses to assess YOUR code on Demo Day."
5. Serial.readString() command sketch (20 min): you live-codes. In setup(): Serial.begin(9600). In loop(): if(Serial.available() > 0) { String command = Serial.readString(); command.trim(); if(command == "ON") { digitalWrite(13, HIGH); Serial.println("LED is ON"); } else if(command == "OFF") { digitalWrite(13, LOW); Serial.println("LED is OFF"); } else if(command == "BLINK") { for(int i=0; i<5; i++) { digitalWrite(13, HIGH); delay(200); digitalWrite(13, LOW); delay(200); } Serial.println("Blinked 5 times"); } else { Serial.println("Unknown command"); } } You follow on your own sketches. Upload. Test all 4 commands including an unknown one.

### GUIDED ACTIVITY — Serial Input and Command-Driven Programmes  (60 min)
6. Note command.trim() — explain: "When you press Enter in the Serial Monitor, a newline character \n is added. trim() removes leading and trailing whitespace including newline characters. Without trim(), the comparison command == "ON" would fail because the String received is actually "ON\n"." You test: what happens if they remove trim()? Does "ON" still match?
7. Serial.parseInt() sketch (20 min): new sketch. In loop(): if(Serial.available() > 0) { int blinkCount = Serial.parseInt(); Serial.print("Blinking "); Serial.print(blinkCount); Serial.println(" times"); for(int i=0; i<blinkCount; i++) { digitalWrite(13, HIGH); delay(300); digitalWrite(13, LOW); delay(300); } } Upload. Type 3 -> LED blinks 3 times. Type 7 -> blinks 7 times. Type 0 -> no blinks. Type -1 -> what happens? You investigate and document.
8. Rotate your own pacing. Combine both: write a sketch that accepts either a String command ("FAST", "SLOW", "STOP") OR an integer (number of blinks). Use Serial.peek() to decide which parser to call: if the first character is a digit, call parseInt(); otherwise call readString().
9. Get ready to use the printed "Peer Sketch for Review." You read the full 30-line sketch silently and individually for 3 minutes before discussing. "Before you write anything on the rubric, understand what the sketch is trying to do. What is its purpose? What hardware does it control?"
10. Apply the code review rubric independently: you scores all 6 criteria on your own rubric sheet first (before discussing with their pair partner). For every score below 4, they must write a specific justification: quote the line number, name the standard violated, and state what the correct version should look like.

## Save your progress
Keep your sketch, notes, and worksheets ready for Lesson 2, where you will finish this week's activities and check your learning.

## All Lesson 1 steps (complete list)

1. Term Two recap: "In Terms One and Two, the Arduino talked TO you — it printed values to the Serial Monitor. Today it also listens to you. You can type a command and the Arduino will respond." Demonstrate live: you has a pre-loaded sketch. Types "ON" into the Serial Monitor — LED turns on. Types "OFF" — LED turns off. Types "BLINK" — LED blinks 5 times. Ask: "How do you think this works? What does the Arduino need to be able to do?"
2. Introduce the new functions: Serial.available() — returns the number of characters waiting in the input buffer. Serial.readString() — reads all available characters as a String. Serial.parseInt() — reads the next integer from the buffer. Write syntax on the board. You copy with a plain-English annotation for each.
3. Baud rate introduction (5 min): distribute the calculation worksheet. "Baud rate is a transmission speed — how fast data travels between the Arduino and the computer. 9600 baud means 9600 bits per second. Let's calculate what that means in practice." Walk through the first calculation together. You complete the remaining rows independently.
4. Bridge to code review: "This term, you are senior AI Engineers. Senior engineers do not just write code — they review each other's code before it ships. Today you learn how to do that professionally, using the same criteria the DDD uses to assess YOUR code on Demo Day."
5. Serial.readString() command sketch (20 min): you live-codes. In setup(): Serial.begin(9600). In loop(): if(Serial.available() > 0) { String command = Serial.readString(); command.trim(); if(command == "ON") { digitalWrite(13, HIGH); Serial.println("LED is ON"); } else if(command == "OFF") { digitalWrite(13, LOW); Serial.println("LED is OFF"); } else if(command == "BLINK") { for(int i=0; i<5; i++) { digitalWrite(13, HIGH); delay(200); digitalWrite(13, LOW); delay(200); } Serial.println("Blinked 5 times"); } else { Serial.println("Unknown command"); } } You follow on your own sketches. Upload. Test all 4 commands including an unknown one.
6. Note command.trim() — explain: "When you press Enter in the Serial Monitor, a newline character \n is added. trim() removes leading and trailing whitespace including newline characters. Without trim(), the comparison command == "ON" would fail because the String received is actually "ON\n"." You test: what happens if they remove trim()? Does "ON" still match?
7. Serial.parseInt() sketch (20 min): new sketch. In loop(): if(Serial.available() > 0) { int blinkCount = Serial.parseInt(); Serial.print("Blinking "); Serial.print(blinkCount); Serial.println(" times"); for(int i=0; i<blinkCount; i++) { digitalWrite(13, HIGH); delay(300); digitalWrite(13, LOW); delay(300); } } Upload. Type 3 -> LED blinks 3 times. Type 7 -> blinks 7 times. Type 0 -> no blinks. Type -1 -> what happens? You investigate and document.
8. Rotate your own pacing. Combine both: write a sketch that accepts either a String command ("FAST", "SLOW", "STOP") OR an integer (number of blinks). Use Serial.peek() to decide which parser to call: if the first character is a digit, call parseInt(); otherwise call readString().
9. Get ready to use the printed "Peer Sketch for Review." You read the full 30-line sketch silently and individually for 3 minutes before discussing. "Before you write anything on the rubric, understand what the sketch is trying to do. What is its purpose? What hardware does it control?"
10. Apply the code review rubric independently: you scores all 6 criteria on your own rubric sheet first (before discussing with their pair partner). For every score below 4, they must write a specific justification: quote the line number, name the standard violated, and state what the correct version should look like.
