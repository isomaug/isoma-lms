# Lesson 4: Logic & Conditions – Making Decisions

**Duration:** 60 minutes (split across Week 4 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 1 · Week 4
**Age Range:** 8–10 years
**Hardware:** BBC Micro:bit v2, USB cable, shared laptops
**Bloom's:** L3–L4 Applying / Analysing
**DDD Phase:** DELIVER – Translate real-world decision scenarios into if/else logic, then build a temperature-based decision system

**Big Idea:** Computers make decisions using logic. An if/else condition tells the computer: IF something is true, do this action; OTHERWISE, do a different action. Logic lets computers respond to the real world.

## Learning Objectives

- Sort 10 number cards by a rule and translate that rule into an if/else statement in plain English
- Code a programme that shows a tick on the LED if the temperature is above 25°C, and a cross if not
- Code a nested condition: if temp > 30 → show sun; else if temp > 20 → show tick; else → show sad face
- Programme a 2-question true/false quiz on the Micro:bit using button inputs
- Identify and fix 2 bugs in a provided piece of code
- Explain each condition in your programme in plain English

## Materials and Preparation

- 4 BBC Micro:bit v2 kits with USB cables (temperature sensor built-in)
- Number card sets (10 cards: 4, 17, 8, 31, 26, 12, 5, 29, 20, 3)
- Scenario text cards (3 scenarios), for example: 'If a student scores above 50, they pass. Otherwise, they repeat.'
- Debug challenge sheet – MakeCode programme with 2 deliberate errors
- Plain English if/else template sheet: 'If [condition], then [action], otherwise [action].'
- A screen or device to show MakeCode

## Cross-Curricular Links

**English:** Reading comprehension: read a scenario card and write the if/else logic in plain English before coding. Use: 'If [condition], then [action], otherwise [action].' Write 3 if/else statements from 3 scenario cards.

**Maths:** Comparison operators: < > = ≠. Boolean values: true/false. Sort number cards ascending. Find numbers that satisfy two conditions (for example greater than 10 AND less than 25).

## Lesson Structure

### HOOK – Card Sorting Decision Game
1. Sort 10 number cards from smallest to largest. How did you decide? That is comparison logic.
2. Use a rule: any card larger than 15 goes left; smaller or equal goes right.
3. Reframe: IF number > 15, put LEFT. ELSE put RIGHT. Code works the same way.
4. Read 3 scenario cards and write if/else logic on your template sheet.

### DESIGN – Write Logic Before Coding
5. Write 3 if/else statements for today's temperature programme. Example: If temperature > 25°C, show a tick. Otherwise, show a cross.
6. Review operators: greater than 25 is `> 25`. Less than or equal to 20 is `≤ 20`.
7. Boolean idea: when the condition is true, one thing happens; when false, another happens.

### DELIVER – Build decisions (start)
8. **Step 1:** In MakeCode Logic, build `if temperature > 25 → tick; else → cross` on button A pressed. Download and test with room temperature.
9. **Step 2:** Nested condition: if temp > 30 → sun; else if temp > 20 → tick; else → sad face. Download and test.

### DELIVER – Quiz and debug (finish)
1. **Step 3:** Build a true/false quiz: show a question (for example `5 > 3?`). Button A = True (tick), Button B = False (cross). Add a second question.
2. **Step 4:** Use the debug challenge sheet. Find and fix the 2 bugs, then build the corrected version in MakeCode.

### DISCOVER
3. Demonstrate your temperature programme. Explain every condition: If [condition], then [action], otherwise [action].
4. Answer: What does Boolean mean? What are the two Boolean values? What symbol means greater than?
5. Maths: from the number cards, find all numbers greater than 10 AND less than 25.

### Coming next week
Next week you will connect the temperature sensor to a data table and line graph, and find the **mean** from 6 readings.

### WRAP-UP
6. Save as `Week4_Logic_[YourInitials]`.
7. Tick: simple if/else / nested condition / quiz / bugs fixed.
8. Keep debug and plain-English sheets for your portfolio.

## Assessment

- Plain English if/else sheets show correct condition structure
- Temperature programme shows tick/cross from the sensor reading
- Debug challenge: both errors identified and corrected
- Exit: coded quiz with at least 2 if/else conditions runs; you explain each condition in plain English

## Key Vocabulary

if/else · condition · Boolean · true · false · comparison · greater than · less than · nested · debug

**Safeguarding Note:** Quiz questions should be factual and neutral (maths/science facts). Avoid personal, religious, or excluding topics.
