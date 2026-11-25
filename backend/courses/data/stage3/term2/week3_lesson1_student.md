# Week 3 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Programme the Micro:bit to display the live light level reading (0–255) on the LED matrix using the 'light level' sensor block in MakeCode
- Collect Dataset A: 6 light level readings with the Micro:bit in normal room light, recorded in a labelled data table
- Collect Dataset B: 6 light level readings with the Micro:bit LED covered (low light simulation), recorded in a second labelled data table
- Plot both datasets on ONE line graph using two different colours, with a labelled title, axes, and a key/legend identifying each line
- Calculate the mean for each dataset and identify the range for each dataset
- Write a 5-sentence comparative analysis: what did each dataset show, how do they differ, and what might explain the difference

## Big idea
One dataset tells a story. Two datasets on the same graph tell a comparison. Scientists compare results from different conditions to understand WHAT changes and WHY it changes — and then they explain their evidence in writing.

## What you need
- 4 BBC Micro:bit v2 kits + USB cables
- 4 shared laptops with MakeCode open
- Dual data table worksheet (A4 for you) – two 6-row tables side by side: Dataset A (Normal Light) | Dataset B (Covered)
- Dual line graph worksheet (A4 for you) – pre-drawn axes, y-axis 0–255 (light level), x-axis 1–6 (reading number), space for key/legend
- Two coloured pencils for you (different colours for each dataset line)
- Rulers for graph plotting
- Comparative analysis writing frame (A5 for you): 5 sentence starters provided
- Vocabulary cards: 'light sensor', 'light level', 'dataset', 'comparison', 'trend', 'mean', 'range', 'legend', 'axis', 'comparative'
- A computer or screen to follow along

## Links to English and Maths
- **English:** Scientific comparative writing: you write a 5-sentence comparative analysis paragraph using the structured frame. Sentence starters: ① 'Dataset A showed that…' ② 'Dataset B showed that…' ③ 'The main difference between the two datasets was…' ④ 'This suggests that…' ⑤ 'If we repeated the experiment, we could improve it by…'. Vocabulary: you use comparative adjectives and connectives (higher, lower, whereas, however, in contrast, both, similarly). The analysis paragraph is a formally assessed artifact.
- **Maths:** Dual data analysis: calculate mean = sum ÷ 6 for each dataset. Calculate range = max − min for each dataset. Compare: which dataset had the higher mean? Which had the greater range? By how much? Plot two lines on one graph — discuss why each point is plotted at a different height for the same reading number. Read the graph to answer: 'At which reading number was the difference between the two datasets greatest?' Introduction to the concept of a 'control condition' vs. an 'experimental condition'.

## Let's begin

### HOOK – One Graph, Two Stories (10 min)
1. Show a pre-made dual line graph on the projected screen (temperature inside vs. outside over one week — with two clearly distinct lines). Ask: 'What do you notice? Which line is higher? What is the story this graph is telling?' Take 3 answers.
2. Ask: 'Why would a scientist want to show TWO datasets on the SAME graph instead of two separate graphs?' Guide to: it makes comparison easier — you can see the difference at a glance.
3. Introduce today's experiment: 'We will measure light level — how bright the Micro:bit thinks the room is. First in normal light. Then we will cover the LEDs with our hand and measure again. Two conditions. One graph. Then we compare and write about it.'
4. Get ready to use vocabulary cards. You match: 'dataset' -> 'a set of readings from one condition'. 'Legend/key' -> 'the label that tells you which line is which'. 'Comparative' -> 'describing differences between two things'.
### DESIGN – Prepare for Data Collection (10 min)
5. Get ready to use dual data table worksheets. You label both tables before coding: Dataset A heading: 'Normal Room Light'. Dataset B heading: 'Covered Light (Hand Over LEDs)'. Label columns: Reading No. | Light Level (0–255) | Notes.
6. You write a hypothesis for EACH dataset: 'We predict Dataset A will have readings around ___ because ___. We predict Dataset B will have readings around ___ because ___.'
7. You models the MakeCode light sensor programme on screen: 'forever' -> 'show number light level' + 'pause 3000ms'. You identify which block reads the light level. Ask: 'What is the range of values the light sensor can return?' (0 = dark, 255 = very bright).
8. You choose their two pencil colours and label the legend box on the graph worksheet before laptops are distributed.
### DELIVER – Code, Collect, and Plot (30 min)
9. Get ready to use Micro:bits and laptops. Assign Driver and Navigator.

## Save your progress
Keep your MakeCode project and worksheets ready for Lesson 2, where you will finish this week's activities and check your learning.

## All Lesson 1 steps (complete list)

1. Show a pre-made dual line graph on the projected screen (temperature inside vs. outside over one week — with two clearly distinct lines). Ask: 'What do you notice? Which line is higher? What is the story this graph is telling?' Take 3 answers.
2. Ask: 'Why would a scientist want to show TWO datasets on the SAME graph instead of two separate graphs?' Guide to: it makes comparison easier — you can see the difference at a glance.
3. Introduce today's experiment: 'We will measure light level — how bright the Micro:bit thinks the room is. First in normal light. Then we will cover the LEDs with our hand and measure again. Two conditions. One graph. Then we compare and write about it.'
4. Get ready to use vocabulary cards. You match: 'dataset' -> 'a set of readings from one condition'. 'Legend/key' -> 'the label that tells you which line is which'. 'Comparative' -> 'describing differences between two things'.
5. Get ready to use dual data table worksheets. You label both tables before coding: Dataset A heading: 'Normal Room Light'. Dataset B heading: 'Covered Light (Hand Over LEDs)'. Label columns: Reading No. | Light Level (0–255) | Notes.
6. You write a hypothesis for EACH dataset: 'We predict Dataset A will have readings around ___ because ___. We predict Dataset B will have readings around ___ because ___.'
7. You models the MakeCode light sensor programme on screen: 'forever' -> 'show number light level' + 'pause 3000ms'. You identify which block reads the light level. Ask: 'What is the range of values the light sensor can return?' (0 = dark, 255 = very bright).
8. You choose their two pencil colours and label the legend box on the graph worksheet before laptops are distributed.
9. Get ready to use Micro:bits and laptops. Assign Driver and Navigator.
