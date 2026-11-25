# Week 1 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Define and call a user-defined void function with at least one parameter that controls LED behaviour
- Write a function with a return value (int or float) and use the returned value in a calculation printed to the Serial Monitor
- Decompose a 3-LED traffic light sequence into three separate named functions: redLight(), amberLight(), greenLight()
- Read a 20-line modular sketch and produce an annotated diagram showing: function names, parameters, return types, and call order
- Evaluate two versions of the same programme (monolithic vs modular) and write a paragraph explaining which is preferable and why
- Identify and fix a function that has a logic error caused by an incorrect return value

## Let's begin

### 1. HOOK
1. The Paragraph Parallel
2. Write on the board: a 6-line paragraph of text (well-structured) alongside a 6-line void setup() function (well-structured). Ask: "What do these have in common?"
3. Draw out: both have a clear purpose; both have a beginning and end; both can be reused (a paragraph can be quoted; a function can be called). Connect: "A function is a paragraph of code."
4. Get ready to use the Function Anatomy Card. Read through each part together: return type, name, parameter list, body, return statement.
5. Live demo on projector: write int square(int n) { return n * n; } — call it with square(5) and print result to Serial Monitor. You predict the output BEFORE running.
6. Ask: "What would square(10) give? square(0)?" You calculate mentally then verify. Connect: "You just evaluated a function — exactly like f(x) in maths."
### 2. GUIDED ACTIVITY
7. Traffic Light Decomposition
8. Step 1 (10 min): Wire 3 LEDs — red on pin 8, yellow on pin 9, green on pin 10. Confirm they all light up using a simple test sketch. You demonstrates wiring on projector.
9. Step 2 (10 min): Get ready to use Monolithic vs Modular sheet. Read both versions together. Ask: "If the red light timing changed, how many lines would you edit in the monolithic version? In the modular version?" Collect answers.
10. Step 3 (20 min): You live-codes the modular traffic light: void redLight(int duration), void amberLight(int duration), void greenLight(int duration) — each function controls one LED for a given duration. You type simultaneously.
11. Step 4 (10 min): Upload and test. Traffic light cycles correctly? Adjust duration parameters live: redLight(3000) — "what does 3000 mean? Convert to seconds."
12. Step 5 (10 min): Add a function with return value: int totalCycleTime(int r, int a, int g) { return r + a + g; } — print the total cycle time in seconds to Serial Monitor.

## Save your progress
Keep your Arduino sketch and worksheets ready for Lesson 2.

## All Lesson 1 steps (complete list)

1. The Paragraph Parallel
2. Write on the board: a 6-line paragraph of text (well-structured) alongside a 6-line void setup() function (well-structured). Ask: "What do these have in common?"
3. Draw out: both have a clear purpose; both have a beginning and end; both can be reused (a paragraph can be quoted; a function can be called). Connect: "A function is a paragraph of code."
4. Get ready to use the Function Anatomy Card. Read through each part together: return type, name, parameter list, body, return statement.
5. Live demo on projector: write int square(int n) { return n * n; } — call it with square(5) and print result to Serial Monitor. You predict the output BEFORE running.
6. Ask: "What would square(10) give? square(0)?" You calculate mentally then verify. Connect: "You just evaluated a function — exactly like f(x) in maths."
7. Traffic Light Decomposition
8. Step 1 (10 min): Wire 3 LEDs — red on pin 8, yellow on pin 9, green on pin 10. Confirm they all light up using a simple test sketch. You demonstrates wiring on projector.
9. Step 2 (10 min): Get ready to use Monolithic vs Modular sheet. Read both versions together. Ask: "If the red light timing changed, how many lines would you edit in the monolithic version? In the modular version?" Collect answers.
10. Step 3 (20 min): You live-codes the modular traffic light: void redLight(int duration), void amberLight(int duration), void greenLight(int duration) — each function controls one LED for a given duration. You type simultaneously.
11. Step 4 (10 min): Upload and test. Traffic light cycles correctly? Adjust duration parameters live: redLight(3000) — "what does 3000 mean? Convert to seconds."
12. Step 5 (10 min): Add a function with return value: int totalCycleTime(int r, int a, int g) { return r + a + g; } — print the total cycle time in seconds to Serial Monitor.
