# Week 2 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Declare and initialise variables of three data types: int, float, and String in an Arduino sketch
- Print each variable to the Serial Monitor using Serial.println()
- Explain in plain English what each data type is best used for, with a real-world example
- Write a "personal data card" sketch that prints learner details (first name, age, a made-up temperature) to the Serial Monitor
- Identify and fix all 4 intentional errors in a provided "debug challenge" sketch
- Write pseudocode in plain English before coding a sketch, with each pseudocode line mapping to one line of code

## Big idea
A variable is a named box that stores information. Choosing the right name – and the right type – is the first step in writing clear code.

## What you need
- 4 laptops with Arduino IDE 2.x open from last session
- 4 Arduino Uno boards + USB cables
- Printed "Debug Challenge" sketch (A4 for you) – sketch with 4 intentional type and syntax errors marked with blank boxes
- Pseudocode worksheet (A5 for you) – two-column: "Plain English" | "Arduino Code"
- Data type reference card (A5 for you) – int, float, String, bool with examples
- USB flash drives for sketch submission
- A computer screen to follow along

## Links to English and Maths
- **English:** Pseudocode as plain English: you write the programme description in plain English sentences before they write a single line of code. Each English sentence becomes one line of code. Variable names as descriptive nouns: "temperature" not "t", "studentAge" not "x". Link to clear writing – a well-named variable is like a well-chosen word in a sentence.
- **Maths:** Number types: int for whole numbers (age, count), float for decimals (temperature in °C). Rounding: 36.7°C rounded to nearest whole number = 37. Unit labelling: temperature in °C is a float; age in years is an int. Discussion: what data type is best for a school grade out of 100?

## Let's begin

### HOOK – What Is in the Box? (20 min)
1. Place 3 physical boxes (or labelled envelopes) on the table. Labels: "Age", "Temperature", "Name". Ask: "What kind of information is in each box? Could the same type of box hold all three?"
2. Discussion: "In everyday life, different types of information need different containers. Code is the same." Introduce the word variable.
3. Show the data type reference card. Read each type aloud. Ask you to give an example for each: "Give me something in real life that would be stored as a float." (Fuel price, body temperature.)
4. Bridge: "Today we will create our own named boxes in code and fill them with real information about ourselves."
5. Remind you: your session – rotate your own pacing every major task. Introduce the pseudocode worksheet.
6. Type along as you build on the projected screen: declare int age = 12; float temperature = 36.5; String name = "Amara"; – pausing after each line to explain.

### GUIDED ACTIVITY – Declare, Assign, Print (60 min)
7. You follow on your own sketches. Add Serial.begin(9600) in setup(). Add Serial.println(age); Serial.println(temperature); Serial.println(name); in loop().
8. Upload and open Serial Monitor (Tools -> Serial Monitor, baud 9600). Observe output. Ask: "What happens if we change the value of age? Do we need to re-upload?"
9. Pseudocode task (before the personal data card): you fills in the pseudocode worksheet. Left column: "Store my name as text", "Store my age as a whole number", "Store a room temperature as a decimal". Right column: left blank for now.
10. Personal data card challenge: you translate their pseudocode into a full Arduino sketch. Must include: String (first name only), int (age), float (a made-up temperature). Print each with a label: Serial.println("My name is: "); Serial.println(name);
11. You swap pseudocode worksheets and check: does each English sentence map to exactly one line of code?

## Save your progress
Keep your sketch, notes, and worksheets ready for Lesson 2, where you will finish this week's activities and check your learning.

## All Lesson 1 steps (complete list)

1. Place 3 physical boxes (or labelled envelopes) on the table. Labels: "Age", "Temperature", "Name". Ask: "What kind of information is in each box? Could the same type of box hold all three?"
2. Discussion: "In everyday life, different types of information need different containers. Code is the same." Introduce the word variable.
3. Show the data type reference card. Read each type aloud. Ask you to give an example for each: "Give me something in real life that would be stored as a float." (Fuel price, body temperature.)
4. Bridge: "Today we will create our own named boxes in code and fill them with real information about ourselves."
5. Remind you: your session – rotate your own pacing every major task. Introduce the pseudocode worksheet.
6. Type along as you build on the projected screen: declare int age = 12; float temperature = 36.5; String name = "Amara"; – pausing after each line to explain.
7. You follow on your own sketches. Add Serial.begin(9600) in setup(). Add Serial.println(age); Serial.println(temperature); Serial.println(name); in loop().
8. Upload and open Serial Monitor (Tools -> Serial Monitor, baud 9600). Observe output. Ask: "What happens if we change the value of age? Do we need to re-upload?"
9. Pseudocode task (before the personal data card): you fills in the pseudocode worksheet. Left column: "Store my name as text", "Store my age as a whole number", "Store a room temperature as a decimal". Right column: left blank for now.
10. Personal data card challenge: you translate their pseudocode into a full Arduino sketch. Must include: String (first name only), int (age), float (a made-up temperature). Print each with a label: Serial.println("My name is: "); Serial.println(name);
11. You swap pseudocode worksheets and check: does each English sentence map to exactly one line of code?
