# Lesson 2: What's in a Name? - Variables & Data Types

**Duration:** 3 hours (Term-time Saturday) (split across Week 2 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 1 · Week 2
**Age Range:** 10–12 years
**Hardware:** Arduino Uno, USB cable, LED, breadboard, jumper wires
**Software:** Arduino IDE 2.x - Serial Monitor
**Bloom's:** L3 Applying
**DDD Phase:** APPLY - Learners declare variables, use Serial Monitor output, and debug provided faulty sketches
**NCDC:** Uganda NCDC Curriculum P5/P6 - Literacy Strand: Using precise nouns and descriptive language; Numeracy Strand: Whole numbers vs decimals, units of measurement

**Big Idea:** ILO 3.1 & 3.2 - Write Arduino sketches using variables, data types, and Serial.println(); apply pseudocode in plain English before coding.

**Source plan:** `Stage6_Week2_LessonPlan.docx`

## Learning Objectives

- Declare and use variables of type int, float, String, and bool in an Arduino sketch
- Write pseudocode in plain English before coding it, with each pseudocode line becoming one line of code
- Print variable values to the Serial Monitor using Serial.println()
- Distinguish whole numbers (int) from decimals (float) and select the appropriate data type
- Identify and fix 4 intentional errors in a provided debug-challenge sketch

## Materials and Preparation

_See source._

## Cross-Curricular Links

**Maths:** Pseudocode task: write the programme in plain English before coding it. Each line of pseudocode becomes one line of code. Variable names must be descriptive nouns - "temperature" not "t", "studentAge" not "x". Class discussion: why does a clear name matter? Link to writing clear sentences. Distinguish whole numbers (int) from decimals (float). Practical: temperature in °C is a float (36.7°C), age in years is an int (11). Round 36.7°C to the nearest whole number. What data type is a school grade out of 100?

## Lesson Structure

### 1. HOOK The Name Game
1. Write on board: x = 36.7. Ask: "What does x mean? Is it helpful?" Change to: temperature = 36.7. "Better? Why?"
2. Class discussion: variable names as descriptive nouns. Connect to English: "Would you write a story where the character is called 'x'?"
3. Introduce the 4 data types with real-world examples: int (age=11), float (temperature=36.7), String (name="Amara"), bool (isRaining=true).
4. Distribute Data Type Decision Cards. Pairs quickly sort 10 scenarios into the 4 data types. 5 minutes. Share answers - class discusses disagreements.
### 2. GUIDED ACTIVITY Pseudocode → Code
5. Step 1 (15 min): Distribute "Pseudocode First" worksheet. Facilitator models: write 3 pseudocode lines on board, then translate to Arduino code side by side.
6. "Create a variable to store my age. Set it to 12." → int myAge = 12;
7. "Create a variable to store the temperature. Set it to 36.7." → float temperature = 36.7;
8. Step 2 (20 min): Pairs complete the pseudocode worksheet independently - 5 pseudocode lines each, then translate to code. Facilitator checks pseudocode BEFORE learners type.
9. Step 3 (15 min): Open Arduino IDE. Type the "personal data card" sketch: declare int, float, String, bool variables and print each to Serial Monitor using Serial.println().
10. Step 4 (10 min): Open Serial Monitor (115200 baud). Observe output. Does each variable print correctly? Adjust if needed.
### 3. INDEPENDENT / PAIR WORK Debug & Extend
11. Task 1 (25 min): Debug Challenge - distribute the sketch with 4 intentional errors. Pairs read through line by line. For each error found: write on worksheet what the error is and how they fixed it.
12. Common error types included: wrong data type (float used where int needed), missing semicolon, wrong variable name (typo), wrong Serial.begin() baud rate.
13. Task 2 (15 min): Write a new sketch that declares 5 variables describing someone in their class (without using their real name for privacy). Print a "profile card" to Serial Monitor.
14. Task 3 (Extension, 10 min): Add a bool variable isPresent. Print "Present" if true, "Absent" if false. (Hint: use if/else - preview of Week 4.)
15. Rotate Driver/Navigator halfway through Task 2.
### 4. SHOWCASE & DEBRIEF
16. 2 pairs show their Serial Monitor output. Class identifies: What data type is each variable? Are the names descriptive?
17. Facilitator asks: "Why do variable names matter?" Connect back to English - clear naming = clear communication.
18. Quick quiz: facilitator reads a scenario, learners hold up fingers: 1=int, 2=float, 3=String, 4=bool. E.g.: "The number of goals scored." (int=1)
19. Debug debrief: which error was hardest to find? Why? Link to reading carefully - debugging = comprehension.
20. Collect Pseudocode First worksheets as this week's artifact.

## Assessment

- Formative (During)
- Pseudocode worksheet: is each line a plain English sentence? Are variable names descriptive nouns? Sketch compiles and runs.
- Pseudocode First worksheet collected (Week 2 artifact).
- Exit Assessment
- Serial Monitor output shows 3 different data types printed correctly. Facilitator checks screens before learners close IDE.
- Facilitator observation log. Screenshot or file saved to USB.
- Differentiation
- Support: provide a pre-written variable declaration block - learners fill in values only. Extension: use bool + if/else for conditional Serial Monitor output.
- Debug Challenge worksheet submitted - 4 errors identified with explanations.

## Key Vocabulary

variable · data type · int · float · String · bool · declare · Serial Monitor · pseudocode · descriptive noun · baud rate Date Delivered: Signature:

## Safeguarding

Learners must not use their full names, phone numbers, or home addresses as variable values. Use fictional values only.

## Full source extract (complete)

```
Variables & Data Types in Python/Arduino
LEARNING OBJECTIVES
• Declare and use variables of type int, float, String, and bool in an Arduino sketch
• Write pseudocode in plain English before coding it, with each pseudocode line becoming one line of code
• Print variable values to the Serial Monitor using Serial.println()
• Distinguish whole numbers (int) from decimals (float) and select the appropriate data type
• Identify and fix 4 intentional errors in a provided debug-challenge sketch
MATERIALS & PREPARATION
• 4 shared laptops with Arduino IDE 2.x
• Arduino Uno × 4, USB cables × 4
• Printed "Pseudocode First" worksheet - two-column: plain English | code equivalent (A4 per pair)
• Printed "Debug Challenge" sketch with 4 intentional errors marked with line numbers only (A4 per pair)
• Printed "Data Type Decision Cards" - 10 scenarios, learners choose int/float/String/bool (A5 per pair)
• Facilitator projected screen
CROSS-CURRICULAR LINKS
LESSON STRUCTURE  (3 hours · Term-time Saturday)
ASSESSMENT
FACILITATOR RECORD
ISOMA EDUTECH LIMITED
AI Engineers Programme · Stage 5–6 · Arduino
Lesson 2: What's in a Name? - Variables & Data Types
Duration
3 hours (Term-time Saturday)
Term / Week
Term 1 · Week 2
Age Range
10–12 years
Group Size
8 learners (4 pairs)
Hardware
Arduino Uno, USB cable, LED, breadboard, jumper wires
Software / IDE
Arduino IDE 2.x - Serial Monitor
Bloom's Level
L3 Applying
DDD Phase
APPLY - Learners declare variables, use Serial Monitor output, and debug provided faulty sketches
NCDC Ref
Uganda NCDC Curriculum P5/P6 - Literacy Strand: Using precise nouns and descriptive language; Numeracy Strand: Whole numbers vs decimals, units of measurement
Cambridge
Cambridge Primary Computing 0845 - Stage 6: Data types and variables; Writing and debugging programmes
Intended Learning Outcome (ILO)
Big Idea
• ILO 3.1 & 3.2 - Write Arduino sketches using variables, data types, and Serial.println(); apply pseudocode in plain English before coding.
• Variables are named containers that hold information. The name matters - a good variable name is a clear noun that tells you exactly what is inside.
English Literacy Thread
Mathematics Thread
• Pseudocode task: write the programme in plain English before coding it. Each line of pseudocode becomes one line of code. Variable names must be descriptive nouns - "temperature" not "t", "studentAge" not "x". Class discussion: why does a clear name matter? Link to writing clear sentences.
• Distinguish whole numbers (int) from decimals (float). Practical: temperature in °C is a float (36.7°C), age in years is an int (11). Round 36.7°C to the nearest whole number. What data type is a school grade out of 100?
Phase
Time
Activities & Facilitator Actions
1. HOOK The Name Game
20 min
• Write on board: x = 36.7. Ask: "What does x mean? Is it helpful?" Change to: temperature = 36.7. "Better? Why?"
• Class discussion: variable names as descriptive nouns. Connect to English: "Would you write a story where the character is called 'x'?"
• Introduce the 4 data types with real-world examples: int (age=11), float (temperature=36.7), String (name="Amara"), bool (isRaining=true).
• Distribute Data Type Decision Cards. Pairs quickly sort 10 scenarios into the 4 data types. 5 minutes. Share answers - class discusses disagreements.
2. GUIDED ACTIVITY Pseudocode → Code
60 min
• Step 1 (15 min): Distribute "Pseudocode First" worksheet. Facilitator models: write 3 pseudocode lines on board, then translate to Arduino code side by side.
• "Create a variable to store my age. Set it to 12." → int myAge = 12;
• "Create a variable to store the temperature. Set it to 36.7." → float temperature = 36.7;
• Step 2 (20 min): Pairs complete the pseudocode worksheet independently - 5 pseudocode lines each, then translate to code. Facilitator checks pseudocode BEFORE learners type.
• Step 3 (15 min): Open Arduino IDE. Type the "personal data card" sketch: declare int, float, String, bool variables and print each to Serial Monitor using Serial.println().
• Step 4 (10 min): Open Serial Monitor (115200 baud). Observe output. Does each variable print correctly? Adjust if needed.
3. INDEPENDENT / PAIR WORK Debug & Extend
50 min
• Task 1 (25 min): Debug Challenge - distribute the sketch with 4 intentional errors. Pairs read through line by line. For each error found: write on worksheet what the error is and how they fixed it.
• Common error types included: wrong data type (float used where int needed), missing semicolon, wrong variable name (typo), wrong Serial.begin() baud rate.
• Task 2 (15 min): Write a new sketch that declares 5 variables describing someone in their class (without using their real name for privacy). Print a "profile card" to Serial Monitor.
• Task 3 (Extension, 10 min): Add a bool variable isPresent. Print "Present" if true, "Absent" if false. (Hint: use if/else - preview of Week 4.)
• Rotate Driver/Navigator halfway through Task 2.
4. SHOWCASE & DEBRIEF
30 min
• 2 pairs show their Serial Monitor output. Class identifies: What data type is each variable? Are the names descriptive?
• Facilitator asks: "Why do variable names matter?" Connect back to English - clear naming = clear communication.
• Quick quiz: facilitator reads a scenario, learners hold up fingers: 1=int, 2=float, 3=String, 4=bool. E.g.: "The number of goals scored." (int=1)
• Debug debrief: which error was hardest to find? Why? Link to reading carefully - debugging = comprehension.
• Collect Pseudocode First worksheets as this week's artifact.
Component
Description
Evidence
Formative (During)
Pseudocode worksheet: is each line a plain English sentence? Are variable names descriptive nouns? Sketch compiles and runs.
Pseudocode First worksheet collected (Week 2 artifact).
Exit Assessment
Serial Monitor output shows 3 different data types printed correctly. Facilitator checks screens before learners close IDE.
Facilitator observation log. Screenshot or file saved to USB.
Differentiation
Support: provide a pre-written variable declaration block - learners fill in values only. Extension: use bool + if/else for conditional Serial Monitor output.
Debug Challenge worksheet submitted - 4 errors identified with explanations.
KEY VOCABULARY
variable · data type · int · float · String · bool · declare · Serial Monitor · pseudocode · descriptive noun · baud rate
Safeguarding Note
Learners must not use their full names, phone numbers, or home addresses as variable values. Use fictional values only.
Facilitator Name:
________________________
Date Delivered:
________________________
Signature:
________________________
```
