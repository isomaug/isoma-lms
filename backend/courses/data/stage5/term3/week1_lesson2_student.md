# Week 1 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Write an Arduino sketch that receives a command word via Serial Monitor (e.g. "ON", "OFF", "BLINK") and responds by controlling hardware accordingly using Serial.readString() and String comparison
- Write an Arduino sketch that receives an integer via Serial Monitor using Serial.parseInt() and uses it as a variable (e.g. number of blinks, delay value, LED brightness)
- Calculate baud rate as a data transmission rate: at 9600 baud, how many bits are transmitted per second? How many characters per second (assuming 8 bits per character)? How long does it take to transmit a 50-character String?
- Apply a 6-criterion code review rubric to evaluate a provided 30-line sketch written by a fictional peer, scoring each criterion on a 4-point scale and writing a specific justification for every score
- Rewrite one section of the reviewed sketch to improve it — documenting the specific engineering standard violated and the exact change made
- Write a 100-word code review report summarising the quality of the reviewed sketch: what it does well, what violates engineering standards, and what the highest-priority improvement is

## Continue

### INDEPENDENT WORK — Code Review  (50 min)
1. Pair discussion: compare scores with partner. Where do scores differ, discuss: "I gave Criterion 2 a 2 because lines 8, 14, and 22 have no comments. You gave it a 3 — why?" Agree on a final score for each criterion and record on one shared rubric.
2. Rewrite task: choose the criterion with the LOWEST score. Rewrite only the lines that violate that criterion. Document: "Original line 14: int x = analogRead(A0); — violates variable naming standard. Rewritten: int lightSensorValue = analogRead(A0); — descriptive name makes purpose clear without reading context." Type the rewritten version in Arduino IDE and confirm it compiles.
3. Write the 100-word code review report on the template: 3 sections — Strengths (what the sketch does well, minimum 2 specific points), Violations Found (every violation found across all 6 criteria, with line references), Highest-Priority Improvement (the single most important change, with full justification).
4. Check your work carefully. Ask: "If this sketch were your project submitted for Demo Day, which rubric criterion would cost you the most marks? How would you fix it?"
5. 2–3 you demonstrate their command-driven sketches: type a command or integer live in the Serial Monitor while yourself watches the LED response. Ask: "What happens if you type the command in lowercase? Why does the comparison fail?"
6. One pair presents their code review report. They read aloud the Violations Found section and show the original line alongside their rewritten version on the projected screen. Class discusses: "Do you agree this is a violation? Is the rewrite an improvement? Is there a better solution?"

### SHOWCASE & DEBRIEF  (30 min)
7. Connect code review to the DDD assessment rubric: "Criterion 2 in the DDD Demo Day rubric is Code Quality: correct variables, loops, functions, and comments. When the panel assesses your project in Week 8, they are applying a code review to your sketch in real time. Today you practised from the reviewer's chair — that knowledge makes you a better author."
8. Remember English link: "A code review report is a piece of technical writing with a specific professional structure. The same skills — identify, quote, evaluate, recommend — appear in literary criticism, scientific peer review, legal opinion, and journalism. You are practising a transferable analytical writing form."
9. Remember Math link: "The baud rate calculation is a rates problem. Speed × time = data. At 9600 baud, a 12-character String takes exactly 10 milliseconds. If your loop delay is shorter than your transmission time, data will be lost. Engineering requires this kind of calculation to prevent real system failures."
10. Exit question (written): "Name one criterion from the code review rubric and write the rule it represents in one complete sentence — as if you were writing a coding standard for a professional team." Collect.
11. Submit command-driven sketch, completed rubric, rewrite documentation, and code review report via USB flash drive.

## All Lesson 2 steps (complete list)

1. Pair discussion: compare scores with partner. Where do scores differ, discuss: "I gave Criterion 2 a 2 because lines 8, 14, and 22 have no comments. You gave it a 3 — why?" Agree on a final score for each criterion and record on one shared rubric.
2. Rewrite task: choose the criterion with the LOWEST score. Rewrite only the lines that violate that criterion. Document: "Original line 14: int x = analogRead(A0); — violates variable naming standard. Rewritten: int lightSensorValue = analogRead(A0); — descriptive name makes purpose clear without reading context." Type the rewritten version in Arduino IDE and confirm it compiles.
3. Write the 100-word code review report on the template: 3 sections — Strengths (what the sketch does well, minimum 2 specific points), Violations Found (every violation found across all 6 criteria, with line references), Highest-Priority Improvement (the single most important change, with full justification).
4. Check your work carefully. Ask: "If this sketch were your project submitted for Demo Day, which rubric criterion would cost you the most marks? How would you fix it?"
5. 2–3 you demonstrate their command-driven sketches: type a command or integer live in the Serial Monitor while yourself watches the LED response. Ask: "What happens if you type the command in lowercase? Why does the comparison fail?"
6. One pair presents their code review report. They read aloud the Violations Found section and show the original line alongside their rewritten version on the projected screen. Class discusses: "Do you agree this is a violation? Is the rewrite an improvement? Is there a better solution?"
7. Connect code review to the DDD assessment rubric: "Criterion 2 in the DDD Demo Day rubric is Code Quality: correct variables, loops, functions, and comments. When the panel assesses your project in Week 8, they are applying a code review to your sketch in real time. Today you practised from the reviewer's chair — that knowledge makes you a better author."
8. Remember English link: "A code review report is a piece of technical writing with a specific professional structure. The same skills — identify, quote, evaluate, recommend — appear in literary criticism, scientific peer review, legal opinion, and journalism. You are practising a transferable analytical writing form."
9. Remember Math link: "The baud rate calculation is a rates problem. Speed × time = data. At 9600 baud, a 12-character String takes exactly 10 milliseconds. If your loop delay is shorter than your transmission time, data will be lost. Engineering requires this kind of calculation to prevent real system failures."
10. Exit question (written): "Name one criterion from the code review rubric and write the rule it represents in one complete sentence — as if you were writing a coding standard for a professional team." Collect.
11. Submit command-driven sketch, completed rubric, rewrite documentation, and code review report via USB flash drive.

## Check your understanding
- Formative | (During) | Baud rate calculation worksheet: all three calculations completed with working shown (collected) | Code review rubric: all 6 criteria scored with specific justifications including line references for every sub-4 score (collected) | Rewrite documentation: original line quoted, standard violated named, rewritten version shown (collected) | Exit question: a code review standard written as a professional rule in a complete sentence (collected)
- Exit Assessment | String command sketch: responds correctly to at least 3 distinct commands including an unknown-command handler — compiles and runs (verified by you) | parseInt() sketch: reads an integer from Serial Monitor and executes the correct number of blinks — verified with inputs 3, 7, and 0 (verified by you) | Code review rubric: 6 criteria scored with justifications; rewrite of lowest-scoring criterion compiles (submitted) | Code review report: 100 words minimum, 3 sections present, violations cited with line references (submitted, assessed on 5-point artifact rubric) | All materials submitted via USB flash drive
- Differentiation | Support: Provide the Serial.readString() if/else skeleton pre-written with blanks for the command Strings and LED pin actions. For the code review, reduce to 3 criteria (decomposition, comments, variable naming) and pre-identify the lines containing violations — learner scores and writes the justification only. Reduce the report to 60 words. | Extension: Add a Serial "help" command that prints a menu of all available commands to the Serial Monitor, with a description of each. Write a function void printHelp() that is called when the input is "HELP". Then write a function String sanitiseInput(String raw) that calls trim() and toUpperCase() on any received String before comparison — making the command system case-insensitive. Calculate: how many distinct String commands can this sketch handle before the if/else chain becomes inefficient? Propose a data structure (array of command Strings) that would scale better.

## Key words to remember
Serial.available() · Serial.readString() · Serial.parseInt() · trim() · baud rate · buffer · bidirectional · command-driven · code review · engineering standard · variable naming · decomposition · readability

## Stay safe
Safeguarding Note: You must not type personal information (names, phone numbers, addresses, school details) into the Serial Monitor during command testing — Serial input is logged by the Arduino IDE and may be visible to others. Remind you that the "Peer Sketch for Review" is a fictional example — no real peer's work is being evaluated. Code review feedback must remain professional and specific to the code, never personal. The code review report should be written as if addressed to a professional colleague, not a classmate.

## Wrap-up
1. Save your sketch with a clear name for this week.
2. Submit or store your files as required for your course.
3. Unplug hardware and pack kits safely.
