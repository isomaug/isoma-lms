# Week 3 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Identify the accelerometer as a sensor that measures the strength and direction of movement, and locate it on the Micro:bit v2 hardware diagram
- Programme the Micro:bit to display a live accelerometer strength reading ('acceleration strength' block in MakeCode) every 3 seconds using a forever loop with a pause
- Collect Dataset A: 6 accelerometer strength readings while holding the Micro:bit completely still on a flat surface
- Collect Dataset B: 6 accelerometer strength readings while slowly tilting the Micro:bit to 45 degrees and back
- Collect Dataset C: 6 accelerometer strength readings while gently shaking the Micro:bit up and down
- Plot all three datasets on one comparative line graph using three different colours; label axes, title, and legend correctly
- Calculate mean and range for each dataset; write a 7-sentence comparative analysis addressing: what each dataset showed, key differences between datasets, what the data means physically, and one limitation of the experiment

## Big idea
The accelerometer measures how strongly the Micro:bit is moving — in any direction. Holding it still gives one reading. Tilting it gives another. Shaking it gives a third. Three conditions. Three datasets. One graph. Then we compare — and we write about what the data tells us.

## What you need
- 4 BBC Micro:bit v2 kits + USB cables
- 4 shared laptops with MakeCode open
- Triple data table worksheet (A4 for you) — three 6-row tables: Dataset A (Still) | Dataset B (Tilting) | Dataset C (Shaking)
- Triple line graph worksheet (A4 for you) — pre-drawn axes: y-axis 0–2000 (acceleration strength in mg), x-axis 1–6 (reading number); space for legend with 3 colour entries
- Three coloured pencils for you (3 different colours)
- Rulers for graph plotting
- Comparative analysis writing frame (A5 for you) — 7 sentence starters (2 per dataset + 1 comparison + 1 limitation)
- Vocabulary cards: 'accelerometer', 'acceleration', 'strength', 'mg (milli-g)', 'condition', 'dataset', 'comparative', 'mean', 'range', 'trend', 'limitation'
- A computer or screen to follow along

## Links to English and Maths
- **English:** Scientific comparative analysis — 7 sentences using the structured writing frame. Starters: ① 'Dataset A (still) showed…' ② 'The readings in Dataset A were ___ because…' ③ 'Dataset B (tilting) showed…' ④ 'Dataset C (shaking) showed values that were ___ compared to Datasets A and B because…' ⑤ 'The main difference between all three datasets was…' ⑥ 'This suggests that the accelerometer measures…' ⑦ 'One limitation of this experiment is… which means the results might…'. Vocabulary in use: you must include the words 'accelerometer', 'condition', 'trend', and 'limitation' in their analysis, demonstrating active vocabulary acquisition from the DDD's English literacy thread.
- **Maths:** Three-dataset comparative statistics: calculate mean = sum ÷ 6 and range = max − min for each of the three datasets. Complete a summary statistics table: Dataset | Mean | Range | Highest reading | Lowest reading. Compare: which dataset has the highest mean? By how much does it exceed the lowest mean? (Subtraction.) What fraction of Dataset C's mean is Dataset A's mean? (Division.) Which dataset has the greatest range? What does a large range tell us about the consistency of that condition? Graph reading: after plotting, use the graph to answer 3 questions: 'At which reading number was the gap between Dataset A and Dataset C greatest? At which reading number were Datasets B and C closest? What is the difference between the mean of Dataset C and the mean of Dataset A?' Connects directly to DDD Part 2.4 mathematics: 'Data handling, line graphs, calculating mean.'

## Let's begin

### HOOK – Can a Computer Feel Movement? (10 min)
1. Hold up the Micro:bit and ask: 'This device has a sensor that can feel HOW MUCH it is moving. If I hold it still — what do you think the reading is? If I shake it hard — what do you predict?' Collect 3 predictions. Write them on the board.
2. Show the live accelerometer reading on the projected Micro:bit simulator: hold the mouse over the accelerometer input and move it. Ask: 'What happens to the number when movement increases?' Guide to: the number gets larger.
3. Introduce the unit: 'The accelerometer reads in mg — milli-g. One g is the force of gravity pulling you to the ground. When the Micro:bit is completely still, the accelerometer reads approximately 1000 mg — that is gravity. When you shake it, you add extra force on top of gravity.'
4. Connect to real life: 'Where do you see accelerometers used in real life?' (Phones that rotate the screen, step counters, earthquake sensors, car airbags.) 'Today we become scientists — we collect data under three conditions and compare what the accelerometer tells us.'
### DESIGN – Prepare for the Investigation (10 min)
5. Get ready to use triple data table worksheets. You label all three tables before coding: Dataset A heading: 'Still (flat surface)'. Dataset B heading: 'Tilting (45° and back)'. Dataset C heading: 'Shaking (up and down)'. Label columns: Reading No. | Strength (mg) | Notes.
6. Write a hypothesis for each dataset on the table. You prompt: 'Which dataset do you predict will have the highest mean? The greatest range? Why?' You discuss and write predictions.
7. You models the MakeCode accelerometer programme: forever -> show number acceleration strength -> pause 3000ms -> clear screen. You identify: 'Which block reads the accelerometer? What does strength mean here?' Confirm: strength = the total force including all directions combined.
8. You label the legend on their graph worksheet using their three chosen pencil colours before laptops are distributed. Check: every graph has a title, axis labels, and a 3-colour legend.
### DELIVER – Code, Collect Three Datasets, and Plot (30 min)
9. Get ready to use Micro:bits and laptops. Assign Driver and Navigator.

## Save your progress
Keep your MakeCode project and worksheets ready for Lesson 2, where you will finish this week's activities and check your learning.

## All Lesson 1 steps (complete list)

1. Hold up the Micro:bit and ask: 'This device has a sensor that can feel HOW MUCH it is moving. If I hold it still — what do you think the reading is? If I shake it hard — what do you predict?' Collect 3 predictions. Write them on the board.
2. Show the live accelerometer reading on the projected Micro:bit simulator: hold the mouse over the accelerometer input and move it. Ask: 'What happens to the number when movement increases?' Guide to: the number gets larger.
3. Introduce the unit: 'The accelerometer reads in mg — milli-g. One g is the force of gravity pulling you to the ground. When the Micro:bit is completely still, the accelerometer reads approximately 1000 mg — that is gravity. When you shake it, you add extra force on top of gravity.'
4. Connect to real life: 'Where do you see accelerometers used in real life?' (Phones that rotate the screen, step counters, earthquake sensors, car airbags.) 'Today we become scientists — we collect data under three conditions and compare what the accelerometer tells us.'
5. Get ready to use triple data table worksheets. You label all three tables before coding: Dataset A heading: 'Still (flat surface)'. Dataset B heading: 'Tilting (45° and back)'. Dataset C heading: 'Shaking (up and down)'. Label columns: Reading No. | Strength (mg) | Notes.
6. Write a hypothesis for each dataset on the table. You prompt: 'Which dataset do you predict will have the highest mean? The greatest range? Why?' You discuss and write predictions.
7. You models the MakeCode accelerometer programme: forever -> show number acceleration strength -> pause 3000ms -> clear screen. You identify: 'Which block reads the accelerometer? What does strength mean here?' Confirm: strength = the total force including all directions combined.
8. You label the legend on their graph worksheet using their three chosen pencil colours before laptops are distributed. Check: every graph has a title, axis labels, and a 3-colour legend.
9. Get ready to use Micro:bits and laptops. Assign Driver and Navigator.
