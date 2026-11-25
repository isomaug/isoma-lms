# Week 1 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Explain in one sentence what a function is and give one real-life analogy (a recipe, a set of instructions saved with a name)
- Identify repeated code blocks in an existing programme and explain why repetition is a problem (harder to fix, longer to read)
- Use MakeCode's 'Make a Function' feature to create a named function called 'showAlert' that displays a flashing LED pattern and a scrolling message
- Call the 'showAlert' function from at least three different event blocks (on start, on button A pressed, on shake) and confirm the same behaviour occurs each time
- Create a second function - 'resetDisplay' - that clears the screen and pauses 500ms; call it after each alert
- Refactor an existing multi-scene programme from Term Two by replacing repeated LED animation blocks with a function call, reducing total block count by at least 30%

## Big idea
A function is a named recipe. Instead of writing the same instructions every time you need them, you write them once, give them a name, and call that name whenever you need them. Functions make programmes shorter, cleaner, and easier to fix.

## What you need
- 4 BBC Micro:bit v2 kits + USB cables
- 4 shared laptops with MakeCode open - T2 Week 5 Integration Sprint projects pre-loaded
- Function concept card (A5 for you): labelled diagram - Function Name / Instructions inside / Call point
- Repetition identification worksheet (A4 for you): printed screenshot of a programme with 3 repeated code sections; you circle and label each repetition
- Function planning sheet (A4 for you): 2 rows - Function Name | What it does | Where it is called
- Vocabulary cards: 'function', 'call', 'define', 'reuse', 'refactor', 'decomposition', 'repetition', 'parameter'
- Sticky notes for block-count tracking (before refactor vs. after refactor)
- A computer or screen to follow along

## Links to English and Maths
- **English:** Vocabulary and analogy writing: you write a 2-sentence definition of 'function' using their own words and a real-life analogy of their choosing. Example: 'A function is like a saved recipe. Instead of writing all the steps every time I cook, I just say: make the recipe.' Structured explanation: after refactoring, you writes 3 sentences explaining what they changed, why, and what effect it had. Sentence frame: 'Before refactoring, my programme had ___ repeated blocks. I created a function called ___ to replace them. Now my programme is easier to ___ because ___.'
- **Maths:** Efficiency and ratio: before refactoring, you count and record the total number of blocks in the programme (write on a sticky note). After refactoring, count again. Calculate: how many blocks were saved? What is the reduction as a percentage? (Blocks saved ÷ Original total × 100.) If a programme has 24 blocks and refactoring reduces it to 16, the reduction is 8 ÷ 24 × 100 = 33.3%. Decomposition as division: if a programme has 3 functions each containing 5 blocks, how many unique blocks define all the programme's behaviour? (15.) If the same programme called each function 4 times, how many total block executions would that be? (60.)

## Let's begin

### HOOK – The Repetition Problem (10 min)
1. Get ready to use the repetition identification worksheet face-down. Set a 90-second silent reading timer, then flip. You identify all 3 repeated sections and circle them in pen. Ask: 'How many times does this same group of blocks appear?' (Answer varies - 3 times minimum.) 'If you needed to change the delay in this group, how many places would you have to change it?'
2. Introduce the problem: 'Repetition in code is dangerous. If you change something, you have to change it everywhere. If you miss one, you have a bug. Professional programmers have a rule: Don't Repeat Yourself - DRY. Today we learn the tool that solves this problem: functions.'
3. Show the function concept card. Read aloud: name, instructions inside, call point. Give the real-life analogy: 'I teach my younger sibling how to make a sandwich ONCE. I write it down with the title: Make Sandwich. Now whenever I say Make Sandwich, they know exactly what to do - I don't have to explain every step again.'
4. Ask: 'What would you call a function that makes the Micro:bit flash a warning?' Take 3 creative answers. Bridge: 'Let's build it.'
### DESIGN – Plan Two Functions (10 min)
5. Get ready to use function planning sheets. You complete both rows INDEPENDENTLY before touching MakeCode: Row 1 - name 'showAlert', describe what it does, list the 3 events that will call it. Row 2 - name 'resetDisplay', describe what it does, list when it will be called.
6. You share plans. Partner checks: 'Does the function name describe what it does? Is showAlert called from at least 3 different events?' Refine if needed.
7. You models 'Make a Function' in MakeCode on the projected screen: Advanced -> Functions -> Make a Function -> type name -> add blocks inside. Show how the function block appears in the workspace and how to drag a 'call' block to use it. You observe - laptops closed during the demo.
8. Block-count pre-task: you opens T2 Week 5 project and counts the total blocks. Record on a sticky note labelled 'BEFORE'. Place on the corner of the desk.
### DELIVER – Build, Call, and Refactor (30 min)
9. Get ready to use Micro:bits and laptops. Assign Driver and Navigator.

## Save your progress
Keep your MakeCode project and worksheets ready for Lesson 2, where you will finish this week's activities and check your learning.

## All Lesson 1 steps (complete list)

1. Get ready to use the repetition identification worksheet face-down. Set a 90-second silent reading timer, then flip. You identify all 3 repeated sections and circle them in pen. Ask: 'How many times does this same group of blocks appear?' (Answer varies - 3 times minimum.) 'If you needed to change the delay in this group, how many places would you have to change it?'
2. Introduce the problem: 'Repetition in code is dangerous. If you change something, you have to change it everywhere. If you miss one, you have a bug. Professional programmers have a rule: Don't Repeat Yourself - DRY. Today we learn the tool that solves this problem: functions.'
3. Show the function concept card. Read aloud: name, instructions inside, call point. Give the real-life analogy: 'I teach my younger sibling how to make a sandwich ONCE. I write it down with the title: Make Sandwich. Now whenever I say Make Sandwich, they know exactly what to do - I don't have to explain every step again.'
4. Ask: 'What would you call a function that makes the Micro:bit flash a warning?' Take 3 creative answers. Bridge: 'Let's build it.'
5. Get ready to use function planning sheets. You complete both rows INDEPENDENTLY before touching MakeCode: Row 1 - name 'showAlert', describe what it does, list the 3 events that will call it. Row 2 - name 'resetDisplay', describe what it does, list when it will be called.
6. You share plans. Partner checks: 'Does the function name describe what it does? Is showAlert called from at least 3 different events?' Refine if needed.
7. You models 'Make a Function' in MakeCode on the projected screen: Advanced -> Functions -> Make a Function -> type name -> add blocks inside. Show how the function block appears in the workspace and how to drag a 'call' block to use it. You observe - laptops closed during the demo.
8. Block-count pre-task: you opens T2 Week 5 project and counts the total blocks. Record on a sticky note labelled 'BEFORE'. Place on the corner of the desk.
9. Get ready to use Micro:bits and laptops. Assign Driver and Navigator.
