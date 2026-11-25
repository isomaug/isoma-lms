# Week 3 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Use Serial.available() and Serial.parseInt() to read an integer entered by the user in the Serial Monitor input field
- Design and code a text-based interactive menu: display options in Serial Monitor, read user selection, execute the corresponding function
- Write clear user-facing instructions (a "User Guide") for the interactive programme - minimum 5 numbered steps in plain English
- Use Serial input to control: (a) which LED lights (1=red, 2=yellow, 3=green), (b) whether the buzzer sounds, (c) how long the LED stays on (entered in seconds, converted to milliseconds)
- Evaluate a partner's User Guide using a 3-criterion rubric: clarity, completeness, and whether a person who had never seen the programme could follow it
- Refine the programme and User Guide based on peer evaluation feedback - document the change made

## Continue

### 3. INDEPENDENT / PAIR WORK Write, Evaluate & Refine
1. Task 1 (20 min): Complete the User Guide - all 5 sections. The Menu Options section must describe every valid input, what it does, and what the programme displays in response. Navigator writes the User Guide while Driver codes - roles must be followed.
2. Task 2 (15 min): Swap User Guides with an adjacent pair. Complete the Peer Evaluation Rubric: score Clarity (1–4), Completeness (1–4), Could a stranger follow it? Write 2 specific comments - one strength, one suggestion for improvement.
3. Task 3 (10 min): Based on peer feedback, make at least one documented improvement to either the programme or the User Guide. Write on the back of the User Guide: "Feedback received: [X]. Change made: [Y]. Reason: [Z]."
4. Task 4 (Extension, 5 min): Add a "history" feature - store the last 5 user choices in an array (connecting to Term 2 Week 2) and add menu option 5 that prints the history.
5. Rotate Driver/Navigator between Tasks 1 and 2.
### 4. SHOWCASE & DEBRIEF
6. 2 you demo their interactive programme. A third learner (not the pair) uses the programme following ONLY the User Guide - no verbal help from the pair. Does the guide work?
7. Debrief: "What was the hardest part to explain in the User Guide?" Collect 3 answers. Connect: "Technical writers face this every day - the person who built a system often finds it hardest to explain because they know too much."
8. Ask yourself: "What is the difference between a programme that does something and a programme that a person can actually use?" Introduce: usability as an engineering value, not just an extra.
9. English close: "Your User Guide is a real technical document. If you submitted it to a software company with your programme, it would be evaluated exactly the way your peer evaluated it - for clarity, completeness, and whether a stranger can follow it."
10. Math close: Input validation on the board - write the condition: if (choice < 1 || choice > 4) - translate into plain English: "If the choice is less than 1 OR greater than 4, it is invalid." Connect: domain of a function in mathematics.
11. Collect User Guides (with peer feedback attached) as this week's artifact.

## All Lesson 2 steps (complete list)

1. Task 1 (20 min): Complete the User Guide - all 5 sections. The Menu Options section must describe every valid input, what it does, and what the programme displays in response. Navigator writes the User Guide while Driver codes - roles must be followed.
2. Task 2 (15 min): Swap User Guides with an adjacent pair. Complete the Peer Evaluation Rubric: score Clarity (1–4), Completeness (1–4), Could a stranger follow it? Write 2 specific comments - one strength, one suggestion for improvement.
3. Task 3 (10 min): Based on peer feedback, make at least one documented improvement to either the programme or the User Guide. Write on the back of the User Guide: "Feedback received: [X]. Change made: [Y]. Reason: [Z]."
4. Task 4 (Extension, 5 min): Add a "history" feature - store the last 5 user choices in an array (connecting to Term 2 Week 2) and add menu option 5 that prints the history.
5. Rotate Driver/Navigator between Tasks 1 and 2.
6. 2 you demo their interactive programme. A third learner (not the pair) uses the programme following ONLY the User Guide - no verbal help from the pair. Does the guide work?
7. Debrief: "What was the hardest part to explain in the User Guide?" Collect 3 answers. Connect: "Technical writers face this every day - the person who built a system often finds it hardest to explain because they know too much."
8. Ask yourself: "What is the difference between a programme that does something and a programme that a person can actually use?" Introduce: usability as an engineering value, not just an extra.
9. English close: "Your User Guide is a real technical document. If you submitted it to a software company with your programme, it would be evaluated exactly the way your peer evaluated it - for clarity, completeness, and whether a stranger can follow it."
10. Math close: Input validation on the board - write the condition: if (choice < 1 || choice > 4) - translate into plain English: "If the choice is less than 1 OR greater than 4, it is invalid." Connect: domain of a function in mathematics.
11. Collect User Guides (with peer feedback attached) as this week's artifact.

## Check your understanding
- Evidence Required
- Formative (During)
- Interactive menu programme compiles, all 4 options work correctly, duration input validated (rejects 0 and negatives), buzzer sounds on option 4.
- Your own check log. Demo: third learner uses programme using only the User Guide - success/partial/fail recorded.
- Term 2 Week 3 Artifact
- Completed User Guide (all 5 sections, every menu option described) + Peer Evaluation Rubric received + documented improvement. Scored on 5-point rubric (DDD Part 8.3).
- User Guide + Peer Evaluation Rubric stapled together and collected.
- Differentiation
- Support: provide menu structure pre-coded - you add the LED/buzzer functions and write the User Guide only. Extension: history array (last 5 choices) + option 5 to print history.
- Extension: history array populates correctly and option 5 prints all 5 previous choices.

## Key words to remember
Serial.available() · Serial.parseInt() · input · menu · interface · usability · switch/case · input validation · domain · range · tone() · buzzer · technical writing · peer evaluation ⚠  Safeguarding Note Buzzer note: buzzers produce loud, sudden sounds - warn you before running the programme for the first time. You with sensory sensitivities should be seated further from the buzzer or given the option to use a lower frequency: tone(11, 220, 500). Peer evaluation feedback must be constructive - you reviews all rubrics before they are exchanged to check for inappropriate comments. Date Delivered: Signature:

## Wrap-up
1. Save your sketch with a clear week name.
2. Disconnect hardware carefully and pack the kit.
3. Submit files as required for your course.
