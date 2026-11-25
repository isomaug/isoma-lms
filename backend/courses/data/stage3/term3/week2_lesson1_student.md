# Week 2 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- State and explain the 5-step debugging protocol: Read -> Predict -> Run -> Compare -> Fix — one sentence per step
- Apply the protocol to Bug Set A: a provided programme with 2 logic errors — locate and fix both without running the code first (trace debugging)
- Apply the protocol to Bug Set B: a provided programme with 2 syntax/structural errors — locate and fix both by reading the code and running it once to confirm
- Apply the protocol to Bug Set C: a complex programme with 3 errors spanning ILO 2.1 (wrong event block) and ILO 2.2 (inverted condition) — locate and fix all 3
- Document every bug found across all three bug sets in a structured debugging log: Bug number / Location / Type / What it caused / Fix applied
- Write a 3-sentence reflection: what strategy helped most, what was hardest to find, and one rule they will follow in their own coding to prevent that type of bug

## Big idea
Bugs are not mistakes — they are information. Every bug tells you something about your programme that you did not understand yet. Professional engineers do not guess their way through bugs. They follow a protocol: Read -> Predict -> Run -> Compare -> Fix. Today that protocol becomes yours.

## What you need
- 4 BBC Micro:bit v2 kits + USB cables
- 4 shared laptops with MakeCode open
- Bug Set A worksheet (A4 for you) — printed MakeCode screenshot, 2 logic errors marked with ? symbols
- Bug Set B worksheet (A4 for you) — printed MakeCode screenshot, 2 structural/event errors marked with ? symbols
- Bug Set C worksheet (A4 for you) — printed MakeCode screenshot, 3 errors across ILO 2.1 and 2.2, no markers — you must find them independently
- Debugging Log template (A4 for you) — 7 rows: Bug # / Location / Error Type / Effect / Fix / Verified (Y/N) / Prevention Rule
- Debugging protocol reference card (A5 for you): Read -> Predict -> Run -> Compare -> Fix with one-sentence description of each step
- Vocabulary cards: 'bug', 'logic error', 'syntax error', 'trace', 'predict', 'verify', 'protocol', 'debugging log', 'root cause'
- Red and green pens — red to mark bugs on worksheets, green to mark fixes

## Links to English and Maths
- **English:** Technical reading and analytical writing: you read each bug set programme as a text — the DDD's Stage 3–4 English thread (Part 3.2: 'Reading comprehension of code as text'). For each bug, they write in the debugging log using precise technical language: not 'it was wrong' but 'the condition checked temperature > 20 instead of temperature < 20, causing the programme to display the incorrect icon when the temperature was below the threshold.' Reflection writing: the 3-sentence reflection must use evaluative language — 'The most effective strategy was… The hardest error to find was… because… The prevention rule I will follow is…' — directly applying the DDD's evaluative writing strand.
- **Maths:** Logic and truth tables applied to debugging: for each logic error in Bug Sets A and C, you write the incorrect condition and the correct condition as a Boolean statement. Example: incorrect — if temp > 20 (true when temp is 25°C -> bug causes wrong icon); correct — if temp < 20 (true when temp is 15°C -> correct behaviour). You complete a 2-column truth table for the incorrect vs. correct condition, showing which inputs reveal the bug and which do not. This connects to the DDD Part 2.4 mathematics thread: 'Boolean logic.' You calculate: if a programme runs 10 times and fails 3 times due to the bug, what is the error rate as a percentage? (30%.)

## Let's begin

### HOOK – What Is a Bug, Really? (8 min)
1. Get ready to use the debugging protocol reference card. You read it silently for 60 seconds. Ask yourself: 'What is the difference between PREDICTING what code will do and RUNNING it to see?' Take 2 answers. Guide to: predicting requires you to understand the code — running just shows you the result. Understanding is what fixes bugs.
2. Show a real example on screen: a programme where the condition is inverted (shows 'cold' when temperature is high and 'hot' when it is low). Ask: 'Is this a logic error or a syntax error? How do you know?' Guide to: logic error — the programme runs without crashing but produces the wrong result.
3. Introduce error types: Syntax error = the code is broken (like a spelling mistake in English — the sentence makes no grammatical sense). Logic error = the code runs but the logic is wrong (like a sentence that is grammatically correct but means the opposite of what you intended). Ask you to give one example of each from daily life.
4. Frame the session: 'Today you will find and fix 7 bugs across 3 bug sets. For every bug, you will follow the protocol and write it in your debugging log. This is exactly what software engineers do.'
### DESIGN – Set Up the Debugging Log (5 min)
5. Get ready to use debugging logs. You write your name, date, and the session focus ('Systematic Debugging') at the top. Number the Bug rows 1–7. You explains: 'Every time you find a bug — any bug, in any of the three sets — you fill in one row. Do not leave rows blank. If you find more than 7, use the back.'
6. You agree on roles: one learner is primary reader of the code (Navigator role), the other is primary writer of the log (Driver role). They will swap after Bug Set B.

## Save your progress
Keep your MakeCode project and worksheets ready for Lesson 2, where you will finish this week's activities and check your learning.

## All Lesson 1 steps (complete list)

1. Get ready to use the debugging protocol reference card. You read it silently for 60 seconds. Ask yourself: 'What is the difference between PREDICTING what code will do and RUNNING it to see?' Take 2 answers. Guide to: predicting requires you to understand the code — running just shows you the result. Understanding is what fixes bugs.
2. Show a real example on screen: a programme where the condition is inverted (shows 'cold' when temperature is high and 'hot' when it is low). Ask: 'Is this a logic error or a syntax error? How do you know?' Guide to: logic error — the programme runs without crashing but produces the wrong result.
3. Introduce error types: Syntax error = the code is broken (like a spelling mistake in English — the sentence makes no grammatical sense). Logic error = the code runs but the logic is wrong (like a sentence that is grammatically correct but means the opposite of what you intended). Ask you to give one example of each from daily life.
4. Frame the session: 'Today you will find and fix 7 bugs across 3 bug sets. For every bug, you will follow the protocol and write it in your debugging log. This is exactly what software engineers do.'
5. Get ready to use debugging logs. You write your name, date, and the session focus ('Systematic Debugging') at the top. Number the Bug rows 1–7. You explains: 'Every time you find a bug — any bug, in any of the three sets — you fill in one row. Do not leave rows blank. If you find more than 7, use the back.'
6. You agree on roles: one learner is primary reader of the code (Navigator role), the other is primary writer of the log (Driver role). They will swap after Bug Set B.
