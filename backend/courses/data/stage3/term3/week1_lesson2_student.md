# Week 1 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Explain in one sentence what a function is and give one real-life analogy (a recipe, a set of instructions saved with a name)
- Identify repeated code blocks in an existing programme and explain why repetition is a problem (harder to fix, longer to read)
- Use MakeCode's 'Make a Function' feature to create a named function called 'showAlert' that displays a flashing LED pattern and a scrolling message
- Call the 'showAlert' function from at least three different event blocks (on start, on button A pressed, on shake) and confirm the same behaviour occurs each time
- Create a second function - 'resetDisplay' - that clears the screen and pauses 500ms; call it after each alert
- Refactor an existing multi-scene programme from Term Two by replacing repeated LED animation blocks with a function call, reducing total block count by at least 30%

## Continue

### DELIVER – Build, Call, and Refactor (30 min)
1. Task 1 – Create showAlert (10 min): Driver creates the 'showAlert' function in MakeCode. Inside: show LED pattern (heart or exclamation) -> pause 500ms -> clear screen -> show string 'ALERT!' -> pause 500ms. Test the function by calling it from on start. Download and confirm it works.
2. Task 2 – Call from 3 events (8 min): drag 'call showAlert' into on button A pressed, on button B pressed, and on shake. Download and test each trigger. Navigator checks against the planning sheet: 'Does each trigger produce the same animation?' If not - only the function definition needs fixing.
3. Task 3 – Create resetDisplay (6 min): Continue with the next steps yourself. New Driver creates 'resetDisplay': clear screen -> pause 500ms. Calls it at the end of each event block after showAlert. Download and confirm the display clears cleanly after every alert.
4. Task 4 – Refactor (6 min): open T2 Week 5 Integration Sprint project. Identify one group of repeated blocks. Replace them with a new function. Count blocks again - record on a second sticky note labelled 'AFTER'. Calculate the saving.
### DISCOVER – Evaluate the Refactor (8 min)
5. You write the 3-sentence refactoring explanation on their function planning sheet: what changed, why, and what effect it had. Check your work carefully: 'Is your explanation specific? Does it mention the function name and the block count?'
6. You share sticky notes: BEFORE count vs. AFTER count. Calculate percentage reduction together. Who saved the most? 'Our programme went from ___ blocks to ___ blocks - a reduction of ___%. This is called refactoring.'
7. Two you share their refactored project on screen. Class identifies: 'Where is the function defined? Where is it called? What would happen if we changed one thing inside the function?'
8. Maths close: You poses: 'If a programme has 3 functions of 6 blocks each, called 5 times each in total, how many total block executions happen?' (3 × 6 × 5 = 90.) 'How many unique blocks define all that behaviour?' (18.) You calculate on function planning sheet.
### WRAP-UP – Save and Collect (2 min)
9. Rename showAlert project 'T3W1_[Name]_Functions'. Rename refactored project 'T3W1_[Name]_Refactor'. Disconnect Micro:bit.
10. Collect function planning sheets (both sides completed), repetition worksheets, and both sticky notes (BEFORE/AFTER). These are the week's formally assessed artifact. You checks: planning sheet complete, 3-sentence explanation written, block-count calculation recorded.

## All Lesson 2 steps (complete list)

1. Task 1 – Create showAlert (10 min): Driver creates the 'showAlert' function in MakeCode. Inside: show LED pattern (heart or exclamation) -> pause 500ms -> clear screen -> show string 'ALERT!' -> pause 500ms. Test the function by calling it from on start. Download and confirm it works.
2. Task 2 – Call from 3 events (8 min): drag 'call showAlert' into on button A pressed, on button B pressed, and on shake. Download and test each trigger. Navigator checks against the planning sheet: 'Does each trigger produce the same animation?' If not - only the function definition needs fixing.
3. Task 3 – Create resetDisplay (6 min): Continue with the next steps yourself. New Driver creates 'resetDisplay': clear screen -> pause 500ms. Calls it at the end of each event block after showAlert. Download and confirm the display clears cleanly after every alert.
4. Task 4 – Refactor (6 min): open T2 Week 5 Integration Sprint project. Identify one group of repeated blocks. Replace them with a new function. Count blocks again - record on a second sticky note labelled 'AFTER'. Calculate the saving.
5. You write the 3-sentence refactoring explanation on their function planning sheet: what changed, why, and what effect it had. Check your work carefully: 'Is your explanation specific? Does it mention the function name and the block count?'
6. You share sticky notes: BEFORE count vs. AFTER count. Calculate percentage reduction together. Who saved the most? 'Our programme went from ___ blocks to ___ blocks - a reduction of ___%. This is called refactoring.'
7. Two you share their refactored project on screen. Class identifies: 'Where is the function defined? Where is it called? What would happen if we changed one thing inside the function?'
8. Maths close: You poses: 'If a programme has 3 functions of 6 blocks each, called 5 times each in total, how many total block executions happen?' (3 × 6 × 5 = 90.) 'How many unique blocks define all that behaviour?' (18.) You calculate on function planning sheet.
9. Rename showAlert project 'T3W1_[Name]_Functions'. Rename refactored project 'T3W1_[Name]_Refactor'. Disconnect Micro:bit.
10. Collect function planning sheets (both sides completed), repetition worksheets, and both sticky notes (BEFORE/AFTER). These are the week's formally assessed artifact. You checks: planning sheet complete, 3-sentence explanation written, block-count calculation recorded.

## Check your understanding
- Formative (During)
- Observation: Does showAlert function display correctly when called from all 3 different event blocks? (consistency check - same function, multiple call points)
- Does resetDisplay clear the screen correctly after each alert? (second function functionality check)
- Was at least one repeated section in the T2 Week 5 project replaced with a function call? (refactoring check)
- Block-count recorded before and after refactoring? Percentage reduction calculated? (maths check on sticky notes)
- Exit Assessment
- Ask yourself you:
- ① 'Point to the function definition in your code - what is inside it?'
- ② 'How many places call this function?'
- ③ 'What was your block-count reduction percentage?' 3 points for you - recorded on assessment log. This week counts as a formally weighted artifact per DDD Part 8.2 (Weekly Evidence Artifacts).
- Differentiation
- Support: Provide a half-built MakeCode project with the function structure already created and named; learner only adds blocks inside the function and adds call blocks to 2 events (reduced from 3). Skip the refactoring task - focus on building and calling the two new functions correctly. Extension: Add a parameter to the showAlert function - a number that controls how many times the LED flashes before clearing. Call the function with different parameter values from different events and observe the difference. Write a sentence explaining what a parameter is.

## Key words to remember
function · define · call · reuse · refactor · decomposition · repetition · DRY · parameter · block count · efficiency · architecture Date Delivered: Signature:

## Stay safe
Safeguarding Note: Function names and any strings displayed via showAlert must be neutral and inclusive. You reviews all function content during the DELIVER phase - redirect any function that displays offensive, exclusionary, or personally identifying text. Remind you that anything displayed on the Micro:bit LED during a class session is visible to all and must be appropriate for a shared learning environment.

## Wrap-up
1. Rename and save your MakeCode project for this week.
2. Disconnect the Micro:bit carefully and return it to the kit.
3. Close the laptop and pack up safely.
