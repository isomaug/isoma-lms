# Week 6 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Use the MakeCode JavaScript toggle (the '{} JavaScript' button) to switch between block view and text view of an existing programme
- Read the JavaScript of their T2 Week 5 Integration Sprint project line by line and annotate each function and variable with a plain-English comment
- Identify and explain 5 JavaScript keywords or structures: 'basic.onStart', 'input.onButtonPressed', 'let', 'if/else', and 'basic.showNumber'
- Answer 5 written JavaScript comprehension questions about a provided code snippet (what does this line do? what is the input? what changes if this number is altered?)
- Make one specific text-level modification — change a value, a string, or a threshold number directly in JavaScript view — and verify it changes the programme's output
- Explain in one sentence why reading the text view of code is a useful skill, even for block-based programmers

## Big idea
Every block in MakeCode is secretly a line of text code. The blocks are training wheels — they help you think clearly. But under every block is real JavaScript. Today we peek behind the blocks and read the language that professional developers use.

## What you need
- 4 BBC Micro:bit v2 kits + USB cables
- 4 shared laptops with MakeCode open — T2 Week 5 projects pre-loaded
- JavaScript annotation worksheet (A4 for you) – printed JavaScript code snippet (10–12 lines) with blank comment lines beside each line
- JavaScript comprehension questions sheet (A4 for you) – 5 questions about the code snippet
- JavaScript keyword reference card (A5 for you): 5 keywords with block equivalent shown beside each one
- Highlighter pens (2 colours: one for keywords, one for values/numbers)
- A computer or screen to follow along
- Vocabulary cards: 'JavaScript', 'syntax', 'function', 'keyword', 'comment', 'string', 'let', 'const', 'annotation', 'toggle'

## Links to English and Maths
- **English:** Reading comprehension of code as text — the DDD's explicit English literacy thread for Stage 3–4 (Part 3.2: 'Reading comprehension of code as text'). You annotate every line of the JavaScript snippet with a plain-English comment explaining what that line does. Annotation sentence frame: '// This line ___.' Answer 5 structured comprehension questions in full sentences. Evaluative sentence: 'Reading the JavaScript view helps me understand my programme better because ___.' This connects directly to the DDD's cross-curricular framework (Part 2.4): 'Reading comprehension of code.'
- **Maths:** Values as numbers in code: you identify all numeric literals in the JavaScript snippet (delays, thresholds, counts). For each number, they write: what it represents in the programme and what would happen if it doubled. Unit conversion revisited: if a 'basic.pause(2000)' is changed to 'basic.pause(500)', how many times faster does the programme run? (4×). If a variable starts at 0 and the code says 'count += 3' inside a loop that runs 6 times, what is the final value of count? (18). These questions appear on the comprehension questions sheet.

## Let's begin

### HOOK – Behind the Blocks (10 min)
1. Show a simple 3-block programme on the projected screen: 'on button A pressed -> show number 7 -> pause 1000ms'. Ask: 'You all know what this does. But what does MakeCode actually say to the computer to make this happen?'
2. Click the '{} JavaScript' toggle live on screen. The blocks disappear — show the equivalent JavaScript. Read line by line slowly: 'input.onButtonPressed(Button.A, function() { basic.showNumber(7); basic.pause(1000); });'. Ask: 'Which part is the button event? Which part is the number 7? Where is the pause?'
3. Introduce the key analogy: 'Blocks are like Lego instructions with pictures. JavaScript is the same instruction written as words. Both mean the same thing — but professionals write and read the words. Today you start learning to read the words.'
4. Get ready to use the JavaScript keyword reference card. You highlight the 5 keywords with Colour 1 highlighter. You confirms all cards are marked before moving on.
### DESIGN – Annotate Before You Touch (12 min)
5. Get ready to use the JavaScript annotation worksheet (printed code snippet, 10–12 lines). Silent reading: 3 minutes. You read the code without writing anything first.
6. You annotate each line together: one learner says the annotation aloud, the other writes it on the worksheet. Every line must have a comment. You prompt: 'What does THIS line tell the computer to do? Say it in your own words.'
7. Highlight all numeric values in the code with Colour 2 highlighter. You complete the 5 comprehension questions on the question sheet. Check your work carefully: 'Which line contains the condition? What is the threshold value? What happens if you change it to 30?'
8. Each pair checks their annotations against another pair's. Discuss any differences — did two you annotate the same line differently? Which annotation is more accurate?
### DELIVER – Toggle, Annotate, and Modify (28 min)
9. Get ready to use Micro:bits and open T2 Week 5 Integration Sprint project (pre-loaded). Assign Driver and Navigator.

## Save your progress
Keep your MakeCode project and worksheets ready for Lesson 2, where you will finish this week's activities and check your learning.

## All Lesson 1 steps (complete list)

1. Show a simple 3-block programme on the projected screen: 'on button A pressed -> show number 7 -> pause 1000ms'. Ask: 'You all know what this does. But what does MakeCode actually say to the computer to make this happen?'
2. Click the '{} JavaScript' toggle live on screen. The blocks disappear — show the equivalent JavaScript. Read line by line slowly: 'input.onButtonPressed(Button.A, function() { basic.showNumber(7); basic.pause(1000); });'. Ask: 'Which part is the button event? Which part is the number 7? Where is the pause?'
3. Introduce the key analogy: 'Blocks are like Lego instructions with pictures. JavaScript is the same instruction written as words. Both mean the same thing — but professionals write and read the words. Today you start learning to read the words.'
4. Get ready to use the JavaScript keyword reference card. You highlight the 5 keywords with Colour 1 highlighter. You confirms all cards are marked before moving on.
5. Get ready to use the JavaScript annotation worksheet (printed code snippet, 10–12 lines). Silent reading: 3 minutes. You read the code without writing anything first.
6. You annotate each line together: one learner says the annotation aloud, the other writes it on the worksheet. Every line must have a comment. You prompt: 'What does THIS line tell the computer to do? Say it in your own words.'
7. Highlight all numeric values in the code with Colour 2 highlighter. You complete the 5 comprehension questions on the question sheet. Check your work carefully: 'Which line contains the condition? What is the threshold value? What happens if you change it to 30?'
8. Each pair checks their annotations against another pair's. Discuss any differences — did two you annotate the same line differently? Which annotation is more accurate?
9. Get ready to use Micro:bits and open T2 Week 5 Integration Sprint project (pre-loaded). Assign Driver and Navigator.
