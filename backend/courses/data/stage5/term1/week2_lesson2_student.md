# Week 2 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Declare and initialise variables of three data types: int, float, and String in an Arduino sketch
- Print each variable to the Serial Monitor using Serial.println()
- Explain in plain English what each data type is best used for, with a real-world example
- Write a "personal data card" sketch that prints learner details (first name, age, a made-up temperature) to the Serial Monitor
- Identify and fix all 4 intentional errors in a provided "debug challenge" sketch
- Write pseudocode in plain English before coding a sketch, with each pseudocode line mapping to one line of code

## Continue

### INDEPENDENT WORK – Debug Challenge (50 min)
1. Rotate your own pacing. New driver types the debug challenge solution.
2. Get ready to use the printed "Debug Challenge" sketch. You must find and fix all 4 intentional errors without uploading first. Errors include: wrong data type (float used for a name), missing semicolon, misspelled Serial.println, variable used before declaration.
3. After finding all 4 errors on paper, you type the corrected version and upload to confirm it compiles and runs correctly.
4. Pair discussion: "Why does the Arduino IDE show an error message when there is a bug? How is that like a teacher marking your work?"
5. Extension – if finished early: write a sketch that declares a bool variable called isLEDOn and changes its value between true and false in loop(), printing each state to the Serial Monitor. Link the bool to digitalWrite() to actually control the LED.
6. Check your work carefully, checks participation, and provides verbal feedback. Ask: "Why did you choose int for that value and not float?"

### SHOWCASE & DEBRIEF (30 min)
7. 2–3 you demonstrate their personal data card sketch: Serial Monitor must show their name, age, and temperature. Class verifies the output.
8. One pair presents their debug challenge solution: "We found error 1 here because… Error 2 was here because…"
9. Remember the English link: "Choosing a good variable name is exactly like choosing a precise word when you write. Both make communication clearer."
10. Remember the Math link: "We chose float for temperature because temperature can have a decimal part. We chose int for age because you cannot be 12.7 years old."
11. Exit question (written on sticky note): "Name one data type and write one real-world example of something that variable would store." Collect sticky notes as formative evidence.
12. Submit sketch via USB flash drive.

## All Lesson 2 steps (complete list)

1. Rotate your own pacing. New driver types the debug challenge solution.
2. Get ready to use the printed "Debug Challenge" sketch. You must find and fix all 4 intentional errors without uploading first. Errors include: wrong data type (float used for a name), missing semicolon, misspelled Serial.println, variable used before declaration.
3. After finding all 4 errors on paper, you type the corrected version and upload to confirm it compiles and runs correctly.
4. Pair discussion: "Why does the Arduino IDE show an error message when there is a bug? How is that like a teacher marking your work?"
5. Extension – if finished early: write a sketch that declares a bool variable called isLEDOn and changes its value between true and false in loop(), printing each state to the Serial Monitor. Link the bool to digitalWrite() to actually control the LED.
6. Check your work carefully, checks participation, and provides verbal feedback. Ask: "Why did you choose int for that value and not float?"
7. 2–3 you demonstrate their personal data card sketch: Serial Monitor must show their name, age, and temperature. Class verifies the output.
8. One pair presents their debug challenge solution: "We found error 1 here because… Error 2 was here because…"
9. Remember the English link: "Choosing a good variable name is exactly like choosing a precise word when you write. Both make communication clearer."
10. Remember the Math link: "We chose float for temperature because temperature can have a decimal part. We chose int for age because you cannot be 12.7 years old."
11. Exit question (written on sticky note): "Name one data type and write one real-world example of something that variable would store." Collect sticky notes as formative evidence.
12. Submit sketch via USB flash drive.

## Check your understanding
- Formative (During) | Pseudocode worksheet: does each English sentence map to one code line? (Check during guided phase) | Serial Monitor output shows correct values for all 3 data types (observed during guided phase) | Debug challenge: all 4 errors identified on paper before upload (collected) | Sticky note exit question: correct data type named with a valid real-world example (collected)
- Exit Assessment | Sketch correctly declares and prints 3 different data types (int, float, String) to Serial Monitor | All 4 bugs in the debug challenge identified and fixed – corrected sketch compiles and runs | Both assessments submitted to you via USB flash drive
- Differentiation | Support: Provide a partially completed personal data card sketch with blanks to fill in. Pre-fix 2 of the 4 debug errors and ask you to find only the remaining 2. | Extension: Introduce the bool data type and link it to an LED: if isLEDOn is true, digitalWrite(13, HIGH); else digitalWrite(13, LOW). Add arithmetic: int doubleAge = age * 2; and print the result.

## Key words to remember
variable · data type · int · float · String · bool · declare · initialise · Serial Monitor · pseudocode · debug · compile error

## Stay safe
Safeguarding Note: You use only their first name in the personal data card sketch. Do not allow full names, home addresses, phone numbers, or school names in any code. Remind you: anything typed in a sketch can be seen by anyone who opens that file.

## Wrap-up
1. Save your sketch with a clear name for this week.
2. Submit or store your files as required for your course.
3. Unplug hardware and pack kits safely.
