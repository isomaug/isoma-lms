# Week 1 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Write a multi-function Arduino sketch that decomposes a problem into at least 3 named void functions, each called from loop()
- Write a function that accepts a parameter (e.g. void blinkTimes(int n)) and a function that returns a value (e.g. int readButton())
- Read a 25-line provided sketch and produce a written architecture map: list every function, its purpose, its inputs, and its outputs
- Annotate the entire provided sketch with plain-English // comments at every function declaration and every significant line
- Debug a provided sketch that has 3 architectural errors (functions called before declaration, wrong return type, missing parameter) and fix all 3
- Explain the concept of decomposition in plain English and connect it to how an essay is divided into paragraphs

## Continue

### INDEPENDENT WORK — Debug and Compose  (50 min)
1. Debug challenge: distribute the printed debug sketch. You identify all 3 architectural errors on paper first (without uploading). Errors include: function called before it is declared, function declared with wrong return type (void instead of int), function call missing a required parameter. Write the fix for each error in the margin.
2. After finding all 3 on paper, type the corrected version in Arduino IDE and upload to confirm it compiles and runs. If any error remains, trace line by line.
3. Composition challenge: write a new sketch from scratch with at least 3 named functions addressing a real scenario. Suggested scenarios (pair chooses one): a door alarm (button pressed = blink + delay pattern); a Morse code sender (blink short and long); a traffic light sequence (3 LEDs or 3 delays representing red/yellow/green). Each function must have a clear, single job. No function should be longer than 10 lines.
4. Check your work carefully. Prompt: "Can you explain what each function does in one sentence? If not, it might be doing too many things." Observe participation and note on participation log.
5. Extension: write a function int countButtonPresses(int seconds) that counts how many times the button is pressed within a given number of seconds and returns that count. Print the result to Serial Monitor.
6. 2–3 you demonstrate their composition challenge sketch. As the LED demonstrates the behaviour, the learner reads aloud the function names: "First the setup() runs. Then loop() calls trafficRed() for 5 seconds, then trafficYellow() for 2 seconds, then trafficGreen() for 5 seconds."

### SHOWCASE & DEBRIEF  (30 min)
7. Ask yourself each presenting pair: "If I asked you to change the duration of the red light only, which exact line would you change? How long would it take you to find it?" Demonstrate that well-structured code answers this question instantly.
8. Connect decomposition to English: "A well-organised essay and a well-organised programme follow the same rule: one idea or one job per section. Your introduction does not contain your conclusion. Your blinkTimes() function does not read the button."
9. Connect to mathematics: "We defined int doubleValue(int x) { return x * 2; }. In mathematics, that is written f(x) = 2x. The equals sign and the return statement are the same idea expressed in two different languages."
10. Exit question (written on architecture map reverse): "Describe decomposition in two sentences using an everyday example that is NOT a computer programme." Collect as formative evidence.
11. Submit annotated sketch, architecture map, and debug challenge via USB flash drive.

## All Lesson 2 steps (complete list)

1. Debug challenge: distribute the printed debug sketch. You identify all 3 architectural errors on paper first (without uploading). Errors include: function called before it is declared, function declared with wrong return type (void instead of int), function call missing a required parameter. Write the fix for each error in the margin.
2. After finding all 3 on paper, type the corrected version in Arduino IDE and upload to confirm it compiles and runs. If any error remains, trace line by line.
3. Composition challenge: write a new sketch from scratch with at least 3 named functions addressing a real scenario. Suggested scenarios (pair chooses one): a door alarm (button pressed = blink + delay pattern); a Morse code sender (blink short and long); a traffic light sequence (3 LEDs or 3 delays representing red/yellow/green). Each function must have a clear, single job. No function should be longer than 10 lines.
4. Check your work carefully. Prompt: "Can you explain what each function does in one sentence? If not, it might be doing too many things." Observe participation and note on participation log.
5. Extension: write a function int countButtonPresses(int seconds) that counts how many times the button is pressed within a given number of seconds and returns that count. Print the result to Serial Monitor.
6. 2–3 you demonstrate their composition challenge sketch. As the LED demonstrates the behaviour, the learner reads aloud the function names: "First the setup() runs. Then loop() calls trafficRed() for 5 seconds, then trafficYellow() for 2 seconds, then trafficGreen() for 5 seconds."
7. Ask yourself each presenting pair: "If I asked you to change the duration of the red light only, which exact line would you change? How long would it take you to find it?" Demonstrate that well-structured code answers this question instantly.
8. Connect decomposition to English: "A well-organised essay and a well-organised programme follow the same rule: one idea or one job per section. Your introduction does not contain your conclusion. Your blinkTimes() function does not read the button."
9. Connect to mathematics: "We defined int doubleValue(int x) { return x * 2; }. In mathematics, that is written f(x) = 2x. The equals sign and the return statement are the same idea expressed in two different languages."
10. Exit question (written on architecture map reverse): "Describe decomposition in two sentences using an everyday example that is NOT a computer programme." Collect as formative evidence.
11. Submit annotated sketch, architecture map, and debug challenge via USB flash drive.

## Check your understanding
- Formative (During) | Term Two Entry Review quiz: self-checked, results noted by you as baseline for Term Two (collected) | Architecture map: all functions named with correct plain-English purpose statements (checked during guided phase) | Debug challenge: all 3 architectural errors identified on paper before upload (collected) | Exit written response: decomposition explained using a non-computing analogy (collected)
- Exit Assessment | Multi-function sketch: at least 3 named functions, one with a parameter, one with a return value — compiles and runs (verified by you) | Architecture map fully completed for the provided 25-line sketch (assessed on submission) | Debug challenge: all 3 errors corrected, sketch compiles without errors (verified) | All materials submitted via USB flash drive
- Differentiation | Support: Provide a function template with blanks: void blinkTimes(int ___) { for(int i=0; i < ___; i++) { ___ } }. For the architecture map, pre-fill the function names and ask you to write the purpose only. Pre-fix 1 of the 3 debug errors. | Extension: Write a generic void runSequence(int pins[], int durations[], int length) function that accepts an array of pin numbers and an array of durations and runs them in order. Call it with two different sequences. Calculate: if the total sequence takes T seconds, how many full sequences run in 1 hour?

## Key words to remember
decomposition · function · parameter · return value · architecture · void · call · declare · modular

## Stay safe
Safeguarding Note: You should not include personal information in function names, variable names, or Serial.println() strings. Remind you that code files shared via USB may be seen by others. Any real-world scenario chosen for the composition challenge (e.g. a door alarm) must be framed as a general engineering concept, not as a surveillance or monitoring tool.

## Wrap-up
1. Save your sketch with a clear name for this week.
2. Submit or store your files as required for your course.
3. Unplug hardware and pack kits safely.
