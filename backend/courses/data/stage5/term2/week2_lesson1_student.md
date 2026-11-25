# Week 2 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Declare and initialise an integer array of at least 5 elements and access each element by index using a for loop
- Write a sketch that finds the maximum, minimum, mean, and range of values stored in an array and prints each result to Serial Monitor
- Declare and manipulate String variables using at least three String methods: length(), toUpperCase(), and indexOf()
- Write a sketch that accepts a String, checks its length, splits it at a specific character, and prints both halves
- Explain array indexing using a real-world analogy (e.g. a row of market stalls numbered from 0) and write the analogy on the architecture map
- Identify and fix 3 array-related errors in a provided debug sketch: off-by-one index, wrong array size declaration, accessing index out of bounds

## Big idea
A single variable holds one piece of information. An array holds a collection. The difference between a word and a sentence is the same as the difference between a variable and an array.

## What you need
- 4 laptops with Arduino IDE 2.x
- 4 Arduino Uno boards + USB cables (Serial Monitor primary output device this session)
- Printed "Array Indexing Visual" (A4 for you) — diagram of 6 labelled market stalls numbered [0] to [5] with blank spaces for values
- Printed "Array Operations Worksheet" (A5 for you) — calculations for max, min, mean, range on a given dataset to verify Serial Monitor output
- Printed "String Methods Reference Card" (A5 for you) — table of 6 String methods with syntax and example
- Printed "Debug Challenge" (A4 for you) — 18-line array sketch with 3 marked errors
- USB flash drives
- A computer screen to follow along

## Links to English and Maths
- **English:** String manipulation as language processing: every String method connects to an English concept. length() = word count. toUpperCase() = capitalisation rules. indexOf() = finding a word within a sentence. substring() = extracting a phrase. The parallel is made explicit: "When you proofread an essay, you scan for specific words, check their position, and count their frequency. String methods let code do the same thing." The analogy task requires a formal written sentence in the architecture map.
- **Maths:** Array operations as descriptive statistics: given int scores[5] = {72, 88, 45, 91, 63}; — you calculate maximum (91), minimum (45), mean ((72+88+45+91+63)÷5 = 71.8), and range (91−45 = 46) by hand on the worksheet before writing code to verify. Array indexing starts at 0: this is a formal mathematical convention. Off-by-one errors (accessing index 5 in a 5-element array) are a direct consequence of misunderstanding zero-based indexing — a P6-level number line concept applied to computing.

## Let's begin

### WARM-UP & REVIEW — From Variables to Collections  (20 min)
1. Recap (5 min): you write on the board — int age = 12; — and asks: "What if I need to store the ages of all 8 you in this class? How many variable declarations would I need?" You respond: 8. "Is there a better way?" Introduce the word array.
2. Market stall analogy (10 min): distribute the Array Indexing Visual. "Imagine a row of market stalls in Nakasero market. Each stall has a number starting from 0. You can go directly to stall [3] without opening stalls [0], [1], or [2]." You fill in values in the stall diagram as the you dictates: [0]=72, [1]=88, [2]=45, [3]=91, [4]=63. Ask: "What is at stall [2]? What stall holds 91?"
3. Show the array declaration on the board: int scores[5] = {72, 88, 45, 91, 63}; — map each number to a stall. You copy and label with the stall diagram on the reverse of the worksheet.
4. Bridge: "A String is also a collection — a collection of characters. String name = "Amara"; — A is at index 0, m is at index 1, a is at index 2, r is at index 3, a is at index 4. Every String is secretly an array of characters."
5. Array traversal: you live-codes. Declare int scores[5] = {72, 88, 45, 91, 63}; in setup(). Write a for loop that prints each element: for(int i = 0; i < 5; i++) { Serial.println(scores[i]); }. Upload. Observe output. Ask: "What index does the last element have? What happens if I write scores[5]?"

### GUIDED ACTIVITY — Array Traversal and String Methods  (60 min)
6. Array statistics challenge (pair task): you hand-calculate max, min, mean, and range on the worksheet first (5 min). Then write code to compute and print each result using the array. Must use the loop to find max and min — not hardcode the values. Upload and verify output matches hand calculation.
7. Expand to a 10-element array: int temps[10] = {28, 31, 29, 33, 27, 30, 32, 28, 29, 31}; — representing 10 temperature readings. Calculate and print mean and range. Ask: "Does this look familiar?" (Link to Week 5 Term One sensor data exercise.)
8. String methods (you demonstrates): String city = "Kampala"; — Serial.println(city.length()); -> 7. Serial.println(city.toUpperCase()); -> KAMPALA. Serial.println(city.indexOf("a")); -> 1 (first occurrence). Serial.println(city.substring(0, 4)); -> Kamp.
9. Rotate your own pacing. You write your own String sketch: store their project name from Term One as a String, use all 4 methods above, and print each result with a label.
10. Discussion: "What English skills did you just apply in code? Finding the index of a letter is like finding the page number of a word in an index. Length() is word count. toUpperCase() is the capitalise function in Microsoft Word."

## Save your progress
Keep your sketch, notes, and worksheets ready for Lesson 2, where you will finish this week's activities and check your learning.

## All Lesson 1 steps (complete list)

1. Recap (5 min): you write on the board — int age = 12; — and asks: "What if I need to store the ages of all 8 you in this class? How many variable declarations would I need?" You respond: 8. "Is there a better way?" Introduce the word array.
2. Market stall analogy (10 min): distribute the Array Indexing Visual. "Imagine a row of market stalls in Nakasero market. Each stall has a number starting from 0. You can go directly to stall [3] without opening stalls [0], [1], or [2]." You fill in values in the stall diagram as the you dictates: [0]=72, [1]=88, [2]=45, [3]=91, [4]=63. Ask: "What is at stall [2]? What stall holds 91?"
3. Show the array declaration on the board: int scores[5] = {72, 88, 45, 91, 63}; — map each number to a stall. You copy and label with the stall diagram on the reverse of the worksheet.
4. Bridge: "A String is also a collection — a collection of characters. String name = "Amara"; — A is at index 0, m is at index 1, a is at index 2, r is at index 3, a is at index 4. Every String is secretly an array of characters."
5. Array traversal: you live-codes. Declare int scores[5] = {72, 88, 45, 91, 63}; in setup(). Write a for loop that prints each element: for(int i = 0; i < 5; i++) { Serial.println(scores[i]); }. Upload. Observe output. Ask: "What index does the last element have? What happens if I write scores[5]?"
6. Array statistics challenge (pair task): you hand-calculate max, min, mean, and range on the worksheet first (5 min). Then write code to compute and print each result using the array. Must use the loop to find max and min — not hardcode the values. Upload and verify output matches hand calculation.
7. Expand to a 10-element array: int temps[10] = {28, 31, 29, 33, 27, 30, 32, 28, 29, 31}; — representing 10 temperature readings. Calculate and print mean and range. Ask: "Does this look familiar?" (Link to Week 5 Term One sensor data exercise.)
8. String methods (you demonstrates): String city = "Kampala"; — Serial.println(city.length()); -> 7. Serial.println(city.toUpperCase()); -> KAMPALA. Serial.println(city.indexOf("a")); -> 1 (first occurrence). Serial.println(city.substring(0, 4)); -> Kamp.
9. Rotate your own pacing. You write your own String sketch: store their project name from Term One as a String, use all 4 methods above, and print each result with a label.
10. Discussion: "What English skills did you just apply in code? Finding the index of a letter is like finding the page number of a word in an index. Length() is word count. toUpperCase() is the capitalise function in Microsoft Word."
