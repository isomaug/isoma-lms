# Term 2 · Lesson 3: Talk to the Machine - Serial Input, Interactive Programmes & User-Controlled Systems

**Duration:** 3 hours (Term-time Saturday) (split across Week 3 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 2 · Week 3
**Age Range:** 10–12 years
**Hardware:** Arduino Uno, USB cable, LED × 3 (red, yellow, green), 220Ω resistors × 3, buzzer, breadboard, jumper wires
**Software:** Arduino IDE 2.x - Serial Monitor (with input field enabled)
**Bloom's:** L4–L5 Analysing / Evaluating
**DDD Phase:** ANALYSE & EVALUATE - Learners add Serial input to their Arduino programmes, design an interactive menu system, write user instructions, and evaluate the usability of a partner's interface design
**NCDC:** Uganda NCDC Curriculum P5/P6 - Literacy Strand: Writing clear instructions for a user; evaluating clarity and usability of written communication. Numeracy Strand: Conditional logic with numeric ranges; mapping user input to output categories

**Big Idea:** ILO 3.1 (deepened) - Write interactive Arduino sketches using Serial.available() and Serial.parseInt(). ILO 3.4 (preview) - Consider user experience in system design, connecting technical decisions to English communication clarity.

**Source plan:** `Stage6_T2_Week3_Serial_Input_Interactive.docx`

## Learning Objectives

- Use Serial.available() and Serial.parseInt() to read an integer entered by the user in the Serial Monitor input field
- Design and code a text-based interactive menu: display options in Serial Monitor, read user selection, execute the corresponding function
- Write clear user-facing instructions (a "User Guide") for the interactive programme - minimum 5 numbered steps in plain English
- Use Serial input to control: (a) which LED lights (1=red, 2=yellow, 3=green), (b) whether the buzzer sounds, (c) how long the LED stays on (entered in seconds, converted to milliseconds)
- Evaluate a partner's User Guide using a 3-criterion rubric: clarity, completeness, and whether a person who had never seen the programme could follow it
- Refine the programme and User Guide based on peer evaluation feedback - document the change made

## Materials and Preparation

_See source._

## Cross-Curricular Links

## Lesson Structure

### 1. HOOK The Two-Way Conversation
1. Open the Serial Monitor on the projector. Type a message in the input field and press Enter. Ask: "What happened? Did the Arduino respond?" (No - it hasn't been programmed to listen yet.)
2. Ask: "Think of a machine you use every day that takes your input and responds. What makes it easy to use? What makes it confusing?" Collect 4–5 responses. Write: Clear prompt → User input → Expected response.
3. Introduce Serial.available() and Serial.parseInt() using the Reference Card. Facilitator types a simple example on projector: if(Serial.available()) { int choice = Serial.parseInt(); Serial.println(choice); }. Upload and demo - the Arduino echoes what you type.
4. Class discussion: "If you typed 'hello' instead of a number, what would parseInt() return?" (0 - because it cannot parse text as an integer.) "How could we handle that?" Preview of input validation.
5. Distribute User Guide Template. Learners read through the 5 sections - this is what they will be completing by the end of the session.
### 2. GUIDED ACTIVITY Building the Interactive Menu
6. Step 1 (10 min): Wire LEDs on pins 8, 9, 10 (red, yellow, green) and buzzer on pin 11. Confirm all components work with a quick test sketch. Learners do this independently - no facilitator wiring demo needed at this stage.
7. Step 2 (20 min): Facilitator live-codes the interactive menu structure: void displayMenu() prints options to Serial Monitor; loop() calls Serial.available() and reads the choice; a switch/case or if/else if chain routes to the appropriate function.
8. Step 3 (15 min): Add the duration input: after the user selects which LED to light, the programme asks: "How many seconds? Enter a number:" - reads a second integer, multiplies by 1000, uses as delay. Add input validation: if duration <= 0, print an error.
9. Step 4 (10 min): Add the buzzer as option 4. tone(11, 440, 500) plays an A4 note for 500ms. Test all 4 options.
10. Step 5 (5 min): Discuss as a class: "What would happen if the user typed 99? Is that handled? Should it be? How?"
### 3. INDEPENDENT / PAIR WORK Write, Evaluate & Refine
11. Task 1 (20 min): Complete the User Guide - all 5 sections. The Menu Options section must describe every valid input, what it does, and what the programme displays in response. Navigator writes the User Guide while Driver codes - roles must be followed.
12. Task 2 (15 min): Swap User Guides with an adjacent pair. Complete the Peer Evaluation Rubric: score Clarity (1–4), Completeness (1–4), Could a stranger follow it? Write 2 specific comments - one strength, one suggestion for improvement.
13. Task 3 (10 min): Based on peer feedback, make at least one documented improvement to either the programme or the User Guide. Write on the back of the User Guide: "Feedback received: [X]. Change made: [Y]. Reason: [Z]."
14. Task 4 (Extension, 5 min): Add a "history" feature - store the last 5 user choices in an array (connecting to Term 2 Week 2) and add menu option 5 that prints the history.
15. Rotate Driver/Navigator between Tasks 1 and 2.
### 4. SHOWCASE & DEBRIEF
16. 2 pairs demo their interactive programme. A third learner (not the pair) uses the programme following ONLY the User Guide - no verbal help from the pair. Does the guide work?
17. Debrief: "What was the hardest part to explain in the User Guide?" Collect 3 answers. Connect: "Technical writers face this every day - the person who built a system often finds it hardest to explain because they know too much."
18. Facilitator asks: "What is the difference between a programme that does something and a programme that a person can actually use?" Introduce: usability as an engineering value, not just an extra.
19. English close: "Your User Guide is a real technical document. If you submitted it to a software company with your programme, it would be evaluated exactly the way your peer evaluated it - for clarity, completeness, and whether a stranger can follow it."
20. Math close: Input validation on the board - write the condition: if (choice < 1 || choice > 4) - translate into plain English: "If the choice is less than 1 OR greater than 4, it is invalid." Connect: domain of a function in mathematics.
21. Collect User Guides (with peer feedback attached) as this week's artifact.

## Assessment

- Evidence Required
- Formative (During)
- Interactive menu programme compiles, all 4 options work correctly, duration input validated (rejects 0 and negatives), buzzer sounds on option 4.
- Facilitator observation log. Demo: third learner uses programme using only the User Guide - success/partial/fail recorded.
- Term 2 Week 3 Artifact
- Completed User Guide (all 5 sections, every menu option described) + Peer Evaluation Rubric received + documented improvement. Scored on 5-point rubric (DDD Part 8.3).
- User Guide + Peer Evaluation Rubric stapled together and collected.
- Differentiation
- Support: provide menu structure pre-coded - learners add the LED/buzzer functions and write the User Guide only. Extension: history array (last 5 choices) + option 5 to print history.
- Extension: history array populates correctly and option 5 prints all 5 previous choices.

## Key Vocabulary

Serial.available() · Serial.parseInt() · input · menu · interface · usability · switch/case · input validation · domain · range · tone() · buzzer · technical writing · peer evaluation ⚠  Safeguarding Note Buzzer note: buzzers produce loud, sudden sounds - warn learners before running the programme for the first time. Learners with sensory sensitivities should be seated further from the buzzer or given the option to use a lower frequency: tone(11, 220, 500). Peer evaluation feedback must be constructive - facilitator reviews all rubrics before they are exchanged to check for inappropriate comments. Date Delivered: Signature:

## Full source extract (complete)

```
Serial Input, User Interaction & Interface Design Thinking
TERM 1 PRIOR KNOWLEDGE - What Learners Bring
LEARNING OBJECTIVES
• Use Serial.available() and Serial.parseInt() to read an integer entered by the user in the Serial Monitor input field
• Design and code a text-based interactive menu: display options in Serial Monitor, read user selection, execute the corresponding function
• Write clear user-facing instructions (a "User Guide") for the interactive programme - minimum 5 numbered steps in plain English
• Use Serial input to control: (a) which LED lights (1=red, 2=yellow, 3=green), (b) whether the buzzer sounds, (c) how long the LED stays on (entered in seconds, converted to milliseconds)
• Evaluate a partner's User Guide using a 3-criterion rubric: clarity, completeness, and whether a person who had never seen the programme could follow it
• Refine the programme and User Guide based on peer evaluation feedback - document the change made
MATERIALS & PREPARATION
• 4 shared laptops with Arduino IDE 2.x
• Arduino Uno × 4, USB cables × 4, LED × 12 (red/yellow/green, 3 per pair), 220Ω resistors × 12, buzzer × 4, breadboards × 4, jumper wires
• Printed "User Guide Template" - 5 numbered sections: Programme Name, What It Does, How to Start, Menu Options (with space to write each), Troubleshooting (A4 per learner)
• Printed "Peer Evaluation Rubric" - 3 criteria: Clarity (1–4), Completeness (1–4), Could a stranger follow it? (Yes/Partially/No) + 2 written comments (A5 per learner)
• Printed "Serial Input Reference Card" - Serial.available(), Serial.parseInt(), Serial.readString() syntax with annotated examples (A5 per pair, laminated)
• Facilitator projected screen
CROSS-CURRICULAR LINKS
LESSON STRUCTURE  (3 hours · Term 2 · Saturday)
ASSESSMENT
FACILITATOR RECORD
ISOMA EDUTECH LIMITED  AI Engineers Programme · Stage 5–6 · Arduino · Term 2
Term 2 · Lesson 3: Talk to the Machine - Serial Input, Interactive Programmes & User-Controlled Systems
TERM 2 · STAGE 5–6 · AI ENGINEERS  |  Term 2 · Week 3
Bloom's: L4–L5 Analysing / Evaluating
Duration
3 hours (Term-time Saturday)
Term / Week
Term 2 · Week 3
Age Range
10–12 years
Group Size
8 learners (4 pairs - pair programming)
Hardware
Arduino Uno, USB cable, LED × 3 (red, yellow, green), 220Ω resistors × 3, buzzer, breadboard, jumper wires
Software / IDE
Arduino IDE 2.x - Serial Monitor (with input field enabled)
Bloom's Level
L4–L5 Analysing / Evaluating
DDD Phase
ANALYSE & EVALUATE - Learners add Serial input to their Arduino programmes, design an interactive menu system, write user instructions, and evaluate the usability of a partner's interface design
NCDC Ref
Uganda NCDC Curriculum P5/P6 - Literacy Strand: Writing clear instructions for a user; evaluating clarity and usability of written communication. Numeracy Strand: Conditional logic with numeric ranges; mapping user input to output categories
Cambridge Ref
Cambridge Primary Computing 0845 - Stage 6: Input and output; Designing user interfaces; Evaluating the effectiveness of a programme
🔁  TERM 1 PRIOR KNOWLEDGE - Learners are expected to arrive knowing:
• Serial.println() for output - Term 1 throughout
• If/else and if/else if chains - Term 1 Week 4
• Functions with parameters - Term 2 Week 1
• LED control on multiple pins - Term 2 Week 1 (traffic light)
• Buzzer: tone() function - introduced as extension in Term 1 Week 3
• Variables and data types - Term 1 Week 2
Intended Learning Outcome (ILO)
Big Idea
ILO 3.1 (deepened) - Write interactive Arduino sketches using Serial.available() and Serial.parseInt(). ILO 3.4 (preview) - Consider user experience in system design, connecting technical decisions to English communication clarity.
A programme that cannot receive input from a user is a one-way street. Real systems are two-way conversations. Today you make your Arduino listen - and you think carefully about how to make that conversation as clear as possible.
English Literacy Thread
Mathematics Thread
Writing user-facing instructions: the User Guide must be written for someone who has never seen the programme - this is a key technical writing skill. Learners must consider: what does the user need to know before they start? What does each menu option do? What if something goes wrong? Peer evaluation focuses on communication clarity - does the language work for the intended audience? This is an authentic evaluation task (Bloom's L5): not just describing the guide but judging its effectiveness against a standard.
Conditional logic with numeric ranges: if user enters 1 → red LED; if 2 → yellow; if 3 → green; if 4 → buzzer; if outside 1–4 → display error message. Duration input: user types a number in seconds - programme converts to milliseconds (×1000) before using in delay(). Challenge: if the user types 0 or a negative number, the programme should print an error and prompt again. This is input validation - a real engineering requirement. Connect: range checking in maths (is x ∈ {1, 2, 3, 4}?).
Phase
Time
Activities & Facilitator Actions
1. HOOK The Two-Way Conversation
20 min
• Open the Serial Monitor on the projector. Type a message in the input field and press Enter. Ask: "What happened? Did the Arduino respond?" (No - it hasn't been programmed to listen yet.)
• Ask: "Think of a machine you use every day that takes your input and responds. What makes it easy to use? What makes it confusing?" Collect 4–5 responses. Write: Clear prompt → User input → Expected response.
• Introduce Serial.available() and Serial.parseInt() using the Reference Card. Facilitator types a simple example on projector: if(Serial.available()) { int choice = Serial.parseInt(); Serial.println(choice); }. Upload and demo - the Arduino echoes what you type.
• Class discussion: "If you typed 'hello' instead of a number, what would parseInt() return?" (0 - because it cannot parse text as an integer.) "How could we handle that?" Preview of input validation.
• Distribute User Guide Template. Learners read through the 5 sections - this is what they will be completing by the end of the session.
2. GUIDED ACTIVITY Building the Interactive Menu
60 min
• Step 1 (10 min): Wire LEDs on pins 8, 9, 10 (red, yellow, green) and buzzer on pin 11. Confirm all components work with a quick test sketch. Learners do this independently - no facilitator wiring demo needed at this stage.
• Step 2 (20 min): Facilitator live-codes the interactive menu structure: void displayMenu() prints options to Serial Monitor; loop() calls Serial.available() and reads the choice; a switch/case or if/else if chain routes to the appropriate function.
• Step 3 (15 min): Add the duration input: after the user selects which LED to light, the programme asks: "How many seconds? Enter a number:" - reads a second integer, multiplies by 1000, uses as delay. Add input validation: if duration <= 0, print an error.
• Step 4 (10 min): Add the buzzer as option 4. tone(11, 440, 500) plays an A4 note for 500ms. Test all 4 options.
• Step 5 (5 min): Discuss as a class: "What would happen if the user typed 99? Is that handled? Should it be? How?"
3. INDEPENDENT / PAIR WORK Write, Evaluate & Refine
50 min
• Task 1 (20 min): Complete the User Guide - all 5 sections. The Menu Options section must describe every valid input, what it does, and what the programme displays in response. Navigator writes the User Guide while Driver codes - roles must be followed.
• Task 2 (15 min): Swap User Guides with an adjacent pair. Complete the Peer Evaluation Rubric: score Clarity (1–4), Completeness (1–4), Could a stranger follow it? Write 2 specific comments - one strength, one suggestion for improvement.
• Task 3 (10 min): Based on peer feedback, make at least one documented improvement to either the programme or the User Guide. Write on the back of the User Guide: "Feedback received: [X]. Change made: [Y]. Reason: [Z]."
• Task 4 (Extension, 5 min): Add a "history" feature - store the last 5 user choices in an array (connecting to Term 2 Week 2) and add menu option 5 that prints the history.
• Rotate Driver/Navigator between Tasks 1 and 2.
4. SHOWCASE & DEBRIEF
30 min
• 2 pairs demo their interactive programme. A third learner (not the pair) uses the programme following ONLY the User Guide - no verbal help from the pair. Does the guide work?
• Debrief: "What was the hardest part to explain in the User Guide?" Collect 3 answers. Connect: "Technical writers face this every day - the person who built a system often finds it hardest to explain because they know too much."
• Facilitator asks: "What is the difference between a programme that does something and a programme that a person can actually use?" Introduce: usability as an engineering value, not just an extra.
• English close: "Your User Guide is a real technical document. If you submitted it to a software company with your programme, it would be evaluated exactly the way your peer evaluated it - for clarity, completeness, and whether a stranger can follow it."
• Math close: Input validation on the board - write the condition: if (choice < 1 || choice > 4) - translate into plain English: "If the choice is less than 1 OR greater than 4, it is invalid." Connect: domain of a function in mathematics.
• Collect User Guides (with peer feedback attached) as this week's artifact.
Component
Description
Evidence Required
Formative (During)
Interactive menu programme compiles, all 4 options work correctly, duration input validated (rejects 0 and negatives), buzzer sounds on option 4.
Facilitator observation log. Demo: third learner uses programme using only the User Guide - success/partial/fail recorded.
Term 2 Week 3 Artifact
Completed User Guide (all 5 sections, every menu option described) + Peer Evaluation Rubric received + documented improvement. Scored on 5-point rubric (DDD Part 8.3).
User Guide + Peer Evaluation Rubric stapled together and collected.
Differentiation
Support: provide menu structure pre-coded - learners add the LED/buzzer functions and write the User Guide only. Extension: history array (last 5 choices) + option 5 to print history.
Extension: history array populates correctly and option 5 prints all 5 previous choices.
KEY VOCABULARY
Serial.available() · Serial.parseInt() · input · menu · interface · usability · switch/case · input validation · domain · range · tone() · buzzer · technical writing · peer evaluation
⚠  Safeguarding Note
Buzzer note: buzzers produce loud, sudden sounds - warn learners before running the programme for the first time. Learners with sensory sensitivities should be seated further from the buzzer or given the option to use a lower frequency: tone(11, 220, 500). Peer evaluation feedback must be constructive - facilitator reviews all rubrics before they are exchanged to check for inappropriate comments.
Facilitator Name:
_______________________
Date Delivered:
_______________________
Signature:
________________________
```
