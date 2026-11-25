# Week 4 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Write if/else and if/else if/else chains in Arduino Python that make at least 3 distinct decisions based on a variable value
- Explain a 10-line conditional code block in plain English prose, describing all possible outcomes
- Perform the bubble sort algorithm on 8 number cards manually, counting the number of comparison steps
- Translate the bubble sort logic into pseudocode, then into an Arduino sketch that sorts a hardcoded array of 5 integers
- Print the sorted array to the Serial Monitor and verify the result
- Identify and fix logic errors (not syntax errors) in a provided buggy sorting sketch

## Continue

### INDEPENDENT WORK – Bubble Sort in Code (50 min)
1. Verify: does the Serial Monitor show 3, 7, 19, 31, 42? Compare with the manually sorted result from the card activity.
2. Debug challenge: you provides a sketch with 2 logic errors (comparison operators reversed, loop bound off by one). You trace through line by line to find both errors without running the code first.
3. After finding errors on paper, type corrections and upload to confirm the fix.
4. Extension: modify the sort to descending order (largest first). How many lines of code change? Print both the unsorted and sorted arrays with labels.
5. Check your work carefully, checks that all 3 if/else decisions work correctly, asks: "How many comparisons did your bubble sort make? Is that the worst case or best case for 5 numbers?"
6. 2–3 you present their bubble sort result: show the Serial Monitor output (unsorted then sorted). Explain: "Our array started as [42, 7, 31, 3, 19]. After bubble sort it became [3, 7, 19, 31, 42]. We made ___ comparisons in total."

### SHOWCASE & DEBRIEF (30 min)
7. One pair presents their Code Comprehension paragraph: read their plain English explanation of the if/else code block aloud. Class gives 1 Star + 1 Wish feedback.
8. Draw the connection to AI: "This lesson is the foundation of how AI makes decisions. An AI that says 'this email is spam' is doing a very long if/else chain trained on data. Today you built a rule-based decision system."
9. Remember English link: "You read code like a text and wrote a comprehension paragraph about it. That is exactly what we do with any complex document – understand it, then explain it."
10. Remember Math link: "Bubble sort uses comparison operators and counts steps. For 5 numbers, worst case is 10 comparisons. This is linked to the formula n(n–1)/2 – maths you will meet in secondary school."
11. Exit question (written): "In your own words, what is a sorting algorithm? Write two sentences." Collect as exit evidence.
12. Submit sketch via USB flash drive.

## All Lesson 2 steps (complete list)

1. Verify: does the Serial Monitor show 3, 7, 19, 31, 42? Compare with the manually sorted result from the card activity.
2. Debug challenge: you provides a sketch with 2 logic errors (comparison operators reversed, loop bound off by one). You trace through line by line to find both errors without running the code first.
3. After finding errors on paper, type corrections and upload to confirm the fix.
4. Extension: modify the sort to descending order (largest first). How many lines of code change? Print both the unsorted and sorted arrays with labels.
5. Check your work carefully, checks that all 3 if/else decisions work correctly, asks: "How many comparisons did your bubble sort make? Is that the worst case or best case for 5 numbers?"
6. 2–3 you present their bubble sort result: show the Serial Monitor output (unsorted then sorted). Explain: "Our array started as [42, 7, 31, 3, 19]. After bubble sort it became [3, 7, 19, 31, 42]. We made ___ comparisons in total."
7. One pair presents their Code Comprehension paragraph: read their plain English explanation of the if/else code block aloud. Class gives 1 Star + 1 Wish feedback.
8. Draw the connection to AI: "This lesson is the foundation of how AI makes decisions. An AI that says 'this email is spam' is doing a very long if/else chain trained on data. Today you built a rule-based decision system."
9. Remember English link: "You read code like a text and wrote a comprehension paragraph about it. That is exactly what we do with any complex document – understand it, then explain it."
10. Remember Math link: "Bubble sort uses comparison operators and counts steps. For 5 numbers, worst case is 10 comparisons. This is linked to the formula n(n–1)/2 – maths you will meet in secondary school."
11. Exit question (written): "In your own words, what is a sorting algorithm? Write two sentences." Collect as exit evidence.
12. Submit sketch via USB flash drive.

## Check your understanding
- Formative | (During) | Code Comprehension Exercise: 5 questions answered correctly (collected at end of guided phase) | Bubble sort trace table: correct array state after each pass (collected) | Pseudocode-to-code worksheet: each pseudocode line maps to a code line (checked by you) | Exit written response: sorting algorithm explained in two clear sentences (collected)
- Exit Assessment | Arduino programme makes 3 distinct if/else decisions correctly based on variable input (verified by you) | Bubble sort sketch outputs correctly sorted array to Serial Monitor (verified by you) | Code comprehension paragraph explains all code paths in clear English prose (assessed on submission) | All materials submitted via USB flash drive
- Differentiation | Support: Provide the bubble sort outer loop and inner loop shell with blanks: for(int i=0; i<___; i++) { for(int j=0; j<___; j++) { if(numbers[j] > numbers[j+1]) { /* swap here */ } } }. For conditionals, provide the if/else structure with blanks for the condition only. | Extension: Write a function void bubbleSort(int arr[], int size) that sorts any integer array passed to it. Call it on two different arrays. Calculate and print the exact number of comparisons made using a counter variable. Compare to the worst-case formula n(n–1)/2.

## Key words to remember
if · else if · else · condition · comparison operator · Boolean · array · index · bubble sort · algorithm · swap · ascending · descending · logic error · trace

## Stay safe
Safeguarding Note: Number cards and array values must be fictional numbers only. Do not use ages, phone numbers, or personal data as values in the sorting array. Ensure you understand that sharing code files containing personal information (even in comments) can expose private data.

## Wrap-up
1. Save your sketch with a clear name for this week.
2. Submit or store your files as required for your course.
3. Unplug hardware and pack kits safely.
