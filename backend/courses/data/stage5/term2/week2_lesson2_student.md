# Week 2 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Declare and initialise an integer array of at least 5 elements and access each element by index using a for loop
- Write a sketch that finds the maximum, minimum, mean, and range of values stored in an array and prints each result to Serial Monitor
- Declare and manipulate String variables using at least three String methods: length(), toUpperCase(), and indexOf()
- Write a sketch that accepts a String, checks its length, splits it at a specific character, and prints both halves
- Explain array indexing using a real-world analogy (e.g. a row of market stalls numbered from 0) and write the analogy on the architecture map
- Identify and fix 3 array-related errors in a provided debug sketch: off-by-one index, wrong array size declaration, accessing index out of bounds

## Continue

### INDEPENDENT WORK — Debug and Compose  (50 min)
1. Debug challenge: distribute the printed debug sketch. You identify all 3 array errors on paper. Errors: (1) int data[5] = {1, 2, 3, 4, 5, 6}; — array size declared as 5 but 6 values given. (2) for(int i = 0; i <= 5; i++) — off-by-one, accesses index 5 in a 5-element array. (3) Serial.println(data[5]); — index out of bounds. Fix each error on paper first, then in Arduino IDE. Upload and verify.
2. Composition challenge: write a sketch that stores the names of 4 Ugandan cities in a String array: String cities[4] = {"Kampala", "Entebbe", "Jinja", "Gulu"};. Loop through the array and print each city with its character count and whether it contains the letter "a". Use length() and indexOf().
3. Mathematics integration: extend the temperature array sketch. Calculate the mean as a float (sum ÷ 10, using float result). If any reading is above 30°C, print "High temperature detected at index [i]". This adds an if/else condition inside the loop — connecting Week 4 Term One logic to today's array work.
4. Check your work carefully. Ask: "Why does your for loop stop at i < 5 and not i <= 5? What would happen at i = 5?" Check that all you can explain zero-based indexing.
5. Extension: write a function int findMax(int arr[], int size) that returns the maximum value in any integer array passed to it. Call it with two different arrays and print both results. Calculate by hand: is the function's answer correct?
6. 2–3 you share their city array output on the projected Serial Monitor. Class verifies: are the city names correct? Are the character counts correct? Does indexOf("a") return the right index for each city?

### SHOWCASE & DEBRIEF  (30 min)
7. One pair presents the debug challenge: "Error 1 was here — the array size said 5 but there were 6 values. Error 2 was here — the loop went one step too far. Error 3 was here — index 5 does not exist in a 5-element array." Class confirms.
8. Remember English link: "indexOf() is the search function of language. You use it when you look for a word in a paragraph. length() is the word count tool. toUpperCase() is the style rule. Today you made a computer apply three English language operations."
9. Remember Math link: "Mean, range, maximum, minimum — you calculated all four by hand first, then let the code verify. That is how professional data analysts work: estimate first, compute second, compare both."
10. Exit question: "Write down what happens when your programme tries to access scores[5] in an array declared as int scores[5]. Why is this a problem?" Collect as formative evidence.
11. Submit all sketches and worksheets via USB flash drive.

## All Lesson 2 steps (complete list)

1. Debug challenge: distribute the printed debug sketch. You identify all 3 array errors on paper. Errors: (1) int data[5] = {1, 2, 3, 4, 5, 6}; — array size declared as 5 but 6 values given. (2) for(int i = 0; i <= 5; i++) — off-by-one, accesses index 5 in a 5-element array. (3) Serial.println(data[5]); — index out of bounds. Fix each error on paper first, then in Arduino IDE. Upload and verify.
2. Composition challenge: write a sketch that stores the names of 4 Ugandan cities in a String array: String cities[4] = {"Kampala", "Entebbe", "Jinja", "Gulu"};. Loop through the array and print each city with its character count and whether it contains the letter "a". Use length() and indexOf().
3. Mathematics integration: extend the temperature array sketch. Calculate the mean as a float (sum ÷ 10, using float result). If any reading is above 30°C, print "High temperature detected at index [i]". This adds an if/else condition inside the loop — connecting Week 4 Term One logic to today's array work.
4. Check your work carefully. Ask: "Why does your for loop stop at i < 5 and not i <= 5? What would happen at i = 5?" Check that all you can explain zero-based indexing.
5. Extension: write a function int findMax(int arr[], int size) that returns the maximum value in any integer array passed to it. Call it with two different arrays and print both results. Calculate by hand: is the function's answer correct?
6. 2–3 you share their city array output on the projected Serial Monitor. Class verifies: are the city names correct? Are the character counts correct? Does indexOf("a") return the right index for each city?
7. One pair presents the debug challenge: "Error 1 was here — the array size said 5 but there were 6 values. Error 2 was here — the loop went one step too far. Error 3 was here — index 5 does not exist in a 5-element array." Class confirms.
8. Remember English link: "indexOf() is the search function of language. You use it when you look for a word in a paragraph. length() is the word count tool. toUpperCase() is the style rule. Today you made a computer apply three English language operations."
9. Remember Math link: "Mean, range, maximum, minimum — you calculated all four by hand first, then let the code verify. That is how professional data analysts work: estimate first, compute second, compare both."
10. Exit question: "Write down what happens when your programme tries to access scores[5] in an array declared as int scores[5]. Why is this a problem?" Collect as formative evidence.
11. Submit all sketches and worksheets via USB flash drive.

## Check your understanding
- Formative | (During) | Array Indexing Visual: completed with correct values mapped to stall positions (checked during warm-up) | Array Operations Worksheet: hand-calculated max, min, mean, range before coding (collected) | Debug challenge: all 3 errors identified on paper before upload (collected) | Exit written response: out-of-bounds access explained correctly (collected)
- Exit Assessment | Array traversal sketch: correctly prints all 5 elements via for loop and Serial Monitor (verified by you) | Statistics sketch: max, min, mean, and range all printed correctly and match hand calculations (verified) | String sketch: at least 4 String methods used correctly on a meaningful String variable (verified) | Debug challenge: all 3 errors fixed, sketch compiles (verified) | All materials submitted via USB flash drive
- Differentiation | Support: Provide a pre-declared array and a loop shell: for(int i = 0; i < ___; i++) { Serial.println(scores[___]); }. For statistics, give the sum pre-calculated and ask you to complete only the division. For the city array, reduce to 2 cities. | Extension: Write a void sortAscending(int arr[], int size) function that sorts the scores array in ascending order using bubble sort (from Term One Week 4) and prints the sorted array. Then write void printStats(int arr[], int size) that calls findMax(), findMin(), and calculates mean — all in one function call from loop().

## Key words to remember
array · index · element · zero-based indexing · traversal · String · length() · toUpperCase() · indexOf() · substring() · out-of-bounds · off-by-one error

## Stay safe
Safeguarding Note: The city array and any String data used in sketches must contain only fictional or publicly known place names — no personal addresses, phone numbers, or school names. Remind you: strings printed to the Serial Monitor can be seen by anyone who opens the application on that laptop.

## Wrap-up
1. Save your sketch with a clear name for this week.
2. Submit or store your files as required for your course.
3. Unplug hardware and pack kits safely.
