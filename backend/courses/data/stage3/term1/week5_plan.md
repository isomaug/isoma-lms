# Lesson 5: Sensors & Data Logging – The Micro:bit as a Scientist

**Duration:** 60 minutes (split across Week 5 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 1 · Week 5
**Age Range:** 8–10 years
**Hardware:** BBC Micro:bit v2 + USB cables + shared laptops
**Software:** Microsoft MakeCode (makecode.microbit.org)
**Bloom's:** L4 Analysing
**DDD Phase:** DELIVER – Learners collect, record, and analyse real sensor data from the Micro:bit temperature sensor
**Key ILO:** ILO 2.3 – Integrate Micro:bit sensor data collection with tabular recording and graphical representation, and write a 3-sentence analysis of trends observed.
**NCDC:** Uganda NCDC P3–P4 Curriculum: ICT Literacy Strand; Numeracy Strand: Patterns & Logic
**Cambridge:** Cambridge Primary Computing 0845 – Stage 3: Using sensors to collect data; Presenting and interpreting data; Understanding how computers process information

**Big Idea:** A sensor is a device that reads information from the real world. Scientists collect data, record it, and look for patterns. Today our Micro:bit becomes our science instrument.

**Source plan:** `Stage3_Week5_Microbit_LessonPlan.docx`

## Learning Objectives

- Connect the Micro:bit temperature sensor input in MakeCode and display a live reading on the LED matrix
- Programme the Micro:bit to display a temperature reading every 10 seconds using a 'forever' loop with a pause block
- Record 6 temperature readings over time in a correctly labelled data table (paper worksheet)
- Plot the 6 readings on a hand-drawn line graph with time on the x-axis and temperature on the y-axis, with a title and labelled axes
- Calculate the mean temperature from the 6 readings and identify the range
- Write a 5-sentence experiment report using the structure: Aim / Method / Results (with graph) / Conclusion

## Materials and Preparation

- 4 BBC Micro:bit v2 kits + USB cables
- 4 shared laptops with MakeCode open
- Data table worksheet (A4 per learner) – pre-drawn table: Time | Reading | Notes
- Line graph worksheet (A4 per learner) – pre-drawn axes, numbered 0–40°C on y-axis, 0–60s on x-axis
- Experiment report writing frame (A5 per learner): Aim / Method / Results / Conclusion
- Rulers and pencils for graph plotting
- Facilitator device + projected screen
- Vocabulary cards: 'sensor', 'data', 'mean', 'range', 'trend', 'hypothesis', 'variable'
- 'One Star, One Wish' feedback cards

## Cross-Curricular Links

**English:** Scientific report writing: learners write a short experiment report using the structured format: Aim (what we wanted to find out), Method (how we collected data), Results (the graph), Conclusion (what we found). Minimum 5 sentences. Sentence starters provided: 'Our aim was to… We collected data by… Our results showed that… We found that the temperature… This tells us that…'

**Maths:** Data handling: complete a 6-row data table (time vs. temperature). Plot readings on a line graph with correct scale, title, and labelled axes. Calculate mean = sum of readings ÷ 6. Identify the range = highest reading − lowest reading. Read data from the graph to answer 2 questions: 'At what time was the temperature highest?' and 'What was the difference between the first and last reading?'

## Lesson Structure

### HOOK – What Can Our Micro:bit Feel? (10 min)
1. Hold up the Micro:bit and ask: 'Can this device feel the temperature in this room right now?' Take 3 predictions. Then display the live temperature reading on the projected MakeCode simulator.
2. Ask: 'What is a sensor?' Let learners suggest. Guide to: a sensor is a hardware component that reads something from the physical world – light, temperature, movement, sound.
3. Introduce the lesson challenge: 'We are going to turn our Micro:bit into a temperature logger. We will collect 6 readings, draw a graph, and write a science report – just like real scientists.'
4. Vocabulary warm-up: hold up the 7 vocabulary cards one by one. Learners repeat each word and the facilitator gives a one-sentence definition. Ask: 'Which two words describe what we do with the data after collecting it?' (mean, range).
### DESIGN – Plan the Experiment (10 min)
5. Distribute data table worksheets. Pairs fill in the heading row together: Time (seconds) | Temperature (°C) | Notes. Facilitator checks all worksheets have correct column headings before moving on.
6. Pairs write a hypothesis (prediction) at the top of their worksheet: 'We think the temperature will be around ___ °C because ___.' Share two predictions with the class.
7. Facilitator models the MakeCode programme structure on screen: 'on start' → 'show number temperature (°C)'. 'forever' → 'show number temperature' + 'pause 10,000ms' + 'clear screen'. Learners identify each block and explain its role.
8. Pairs label their line graph worksheet before coding begins: write the graph title, x-axis label ('Time in seconds'), y-axis label ('Temperature in °C'). Check all graphs are labelled before distributing laptops.
### DELIVER – Code, Collect, and Graph (30 min)
9. Distribute Micro:bits and laptops. Assign Driver and Navigator roles.
10. Step 1 – Build the Programme (10 min): Driver codes the temperature display programme in MakeCode. Navigator follows block-by-block on the interface map. Facilitator circulates: 'Which block sets the repeat interval? What does the pause value mean in seconds?'
11. Step 2 – Download and Run (3 min): Download the programme to the Micro:bit. Confirm the temperature reading appears on the LED. Troubleshoot any issues (wrong board selected, USB not recognised).
12. Step 3 – Collect 6 Readings (10 min): Every time the Micro:bit displays a reading, the Navigator calls it out and the Driver records it in the data table. Record 6 readings at timed intervals. Both learners must record in their own worksheet.
13. Step 4 – Plot the Graph (7 min): Pairs unplug and use the data table to plot each reading as a point on the line graph. Connect points with a ruler. Check: does the line show a pattern? SWAP Driver and Navigator for this task.
### DISCOVER – Analyse and Report (8 min)
14. Pairs calculate the mean temperature: add all 6 readings and divide by 6. Record in the data table. Then calculate the range: highest minus lowest. Record both values.
15. Each learner completes the 5-sentence report on the writing frame. Facilitator prompts: 'What did the data SHOW? Was your hypothesis correct? What might have caused any changes?'
16. Two pairs share their line graphs and reports. Class gives feedback using the 'One Star, One Wish' cards. Facilitator asks: 'Did anyone see a TREND in their data? Did the temperature go up, down, or stay the same?'
17. Reflection: 'What is a sensor useful for in real life?' Learners give 2 examples (weather stations, thermometers in fridges, smoke alarms).
### WRAP-UP – Save and Collect (2 min)
18. Rename MakeCode project 'Week5_[Name]_Temp'. Disconnect Micro:bit and return to kit box.
19. Collect data tables, graphs, and report frames. Facilitator reviews for assessment record. Label with learner name and date.

## Assessment

- Formative (During)
- Observation: Does the Micro:bit display a live temperature reading? Is the pause block set correctly? (functionality check)
- Data table completed with 6 readings and correct column headings? (worksheet check)
- Line graph plotted with title, labelled x- and y-axes, and connected data points? (graph check)
- Mean and range calculated correctly? (maths check on worksheet)
- Exit Assessment
- Facilitator holds up a learner's graph and asks 3 questions:
- ① What was your mean temperature?
- ② What was your range?
- ③ Read the temperature at the 3rd reading from your graph. Learner answers from their own worksheet. 3 points per learner – recorded on assessment sheet.
- Differentiation
- Support: Pre-label the graph axes and provide a partially completed data table. Give a sentence-completion report frame with blanks for the learner to fill in key values. Extension: Take a second set of 6 readings in a different location (e.g. near a window vs. centre of room) and compare the two datasets on one graph using two different coloured lines. Write a comparative conclusion.

## Key Vocabulary

sensor · temperature · data · data table · line graph · mean · range · trend · hypothesis · conclusion · axis · interval Date Delivered: Signature:

## Safeguarding

Safeguarding Note: Ensure learners do not write personal identifying information on data tables or reports beyond their first name. All recorded data is classroom data only – not to be shared outside the session.

## Full source extract (complete)

```
ISOMA EDUTECH LIMITED
Micro:bit Lesson Plan
Stage 3 (P3 · Cambridge Stage 3/Year 3)
Lesson 5: Sensors & Data Logging – The Micro:bit as a Scientist
WEEK 5
Duration
60 minutes
Term / Week
Term 1 · Week 5
Age Range
8–10 years
Group Size
8 learners (pair programming, 4 pairs)
Hardware
BBC Micro:bit v2 + USB cables + shared laptops
Software
Microsoft MakeCode (makecode.microbit.org)
Bloom's
L4 Analysing
DDD Phase
DELIVER – Learners collect, record, and analyse real sensor data from the Micro:bit temperature sensor
NCDC Ref
Uganda NCDC P3–P4 Curriculum: ICT Literacy Strand; Numeracy Strand: Patterns & Logic
Cambridge Ref
Cambridge Primary Computing 0845 – Stage 3: Using sensors to collect data; Presenting and interpreting data; Understanding how computers process information
Big Idea
A sensor is a device that reads information from the real world. Scientists collect data, record it, and look for patterns. Today our Micro:bit becomes our science instrument.
Key ILO
ILO 2.3 – Integrate Micro:bit sensor data collection with tabular recording and graphical representation, and write a 3-sentence analysis of trends observed.
LEARNING OBJECTIVES
#
Objective
1
Connect the Micro:bit temperature sensor input in MakeCode and display a live reading on the LED matrix
2
Programme the Micro:bit to display a temperature reading every 10 seconds using a 'forever' loop with a pause block
3
Record 6 temperature readings over time in a correctly labelled data table (paper worksheet)
4
Plot the 6 readings on a hand-drawn line graph with time on the x-axis and temperature on the y-axis, with a title and labelled axes
5
Calculate the mean temperature from the 6 readings and identify the range
6
Write a 5-sentence experiment report using the structure: Aim / Method / Results (with graph) / Conclusion
Materials & Preparation
4 BBC Micro:bit v2 kits + USB cables
4 shared laptops with MakeCode open
Data table worksheet (A4 per learner) – pre-drawn table: Time | Reading | Notes
Line graph worksheet (A4 per learner) – pre-drawn axes, numbered 0–40°C on y-axis, 0–60s on x-axis
Experiment report writing frame (A5 per learner): Aim / Method / Results / Conclusion
Rulers and pencils for graph plotting
Facilitator device + projected screen
Vocabulary cards: 'sensor', 'data', 'mean', 'range', 'trend', 'hypothesis', 'variable'
'One Star, One Wish' feedback cards
Cross-Curricular Links
English Literacy
Scientific report writing: learners write a short experiment report using the structured format: Aim (what we wanted to find out), Method (how we collected data), Results (the graph), Conclusion (what we found). Minimum 5 sentences. Sentence starters provided: 'Our aim was to… We collected data by… Our results showed that… We found that the temperature… This tells us that…'
Mathematics
Data handling: complete a 6-row data table (time vs. temperature). Plot readings on a line graph with correct scale, title, and labelled axes. Calculate mean = sum of readings ÷ 6. Identify the range = highest reading − lowest reading. Read data from the graph to answer 2 questions: 'At what time was the temperature highest?' and 'What was the difference between the first and last reading?'
LESSON STRUCTURE
Step
Activity
HOOK – What Can Our Micro:bit Feel? (10 min)
1
Hold up the Micro:bit and ask: 'Can this device feel the temperature in this room right now?' Take 3 predictions. Then display the live temperature reading on the projected MakeCode simulator.
2
Ask: 'What is a sensor?' Let learners suggest. Guide to: a sensor is a hardware component that reads something from the physical world – light, temperature, movement, sound.
3
Introduce the lesson challenge: 'We are going to turn our Micro:bit into a temperature logger. We will collect 6 readings, draw a graph, and write a science report – just like real scientists.'
4
Vocabulary warm-up: hold up the 7 vocabulary cards one by one. Learners repeat each word and the facilitator gives a one-sentence definition. Ask: 'Which two words describe what we do with the data after collecting it?' (mean, range).
DESIGN – Plan the Experiment (10 min)
5
Distribute data table worksheets. Pairs fill in the heading row together: Time (seconds) | Temperature (°C) | Notes. Facilitator checks all worksheets have correct column headings before moving on.
6
Pairs write a hypothesis (prediction) at the top of their worksheet: 'We think the temperature will be around ___ °C because ___.' Share two predictions with the class.
7
Facilitator models the MakeCode programme structure on screen: 'on start' → 'show number temperature (°C)'. 'forever' → 'show number temperature' + 'pause 10,000ms' + 'clear screen'. Learners identify each block and explain its role.
8
Pairs label their line graph worksheet before coding begins: write the graph title, x-axis label ('Time in seconds'), y-axis label ('Temperature in °C'). Check all graphs are labelled before distributing laptops.
DELIVER – Code, Collect, and Graph (30 min)
9
Distribute Micro:bits and laptops. Assign Driver and Navigator roles.
10
Step 1 – Build the Programme (10 min): Driver codes the temperature display programme in MakeCode. Navigator follows block-by-block on the interface map. Facilitator circulates: 'Which block sets the repeat interval? What does the pause value mean in seconds?'
11
Step 2 – Download and Run (3 min): Download the programme to the Micro:bit. Confirm the temperature reading appears on the LED. Troubleshoot any issues (wrong board selected, USB not recognised).
12
Step 3 – Collect 6 Readings (10 min): Every time the Micro:bit displays a reading, the Navigator calls it out and the Driver records it in the data table. Record 6 readings at timed intervals. Both learners must record in their own worksheet.
13
Step 4 – Plot the Graph (7 min): Pairs unplug and use the data table to plot each reading as a point on the line graph. Connect points with a ruler. Check: does the line show a pattern? SWAP Driver and Navigator for this task.
DISCOVER – Analyse and Report (8 min)
14
Pairs calculate the mean temperature: add all 6 readings and divide by 6. Record in the data table. Then calculate the range: highest minus lowest. Record both values.
15
Each learner completes the 5-sentence report on the writing frame. Facilitator prompts: 'What did the data SHOW? Was your hypothesis correct? What might have caused any changes?'
16
Two pairs share their line graphs and reports. Class gives feedback using the 'One Star, One Wish' cards. Facilitator asks: 'Did anyone see a TREND in their data? Did the temperature go up, down, or stay the same?'
17
Reflection: 'What is a sensor useful for in real life?' Learners give 2 examples (weather stations, thermometers in fridges, smoke alarms).
WRAP-UP – Save and Collect (2 min)
18
Rename MakeCode project 'Week5_[Name]_Temp'. Disconnect Micro:bit and return to kit box.
19
Collect data tables, graphs, and report frames. Facilitator reviews for assessment record. Label with learner name and date.
Assessment
Formative (During)
Observation: Does the Micro:bit display a live temperature reading? Is the pause block set correctly? (functionality check)
Data table completed with 6 readings and correct column headings? (worksheet check)
Line graph plotted with title, labelled x- and y-axes, and connected data points? (graph check)
Mean and range calculated correctly? (maths check on worksheet)
Exit Assessment
Facilitator holds up a learner's graph and asks 3 questions:
① What was your mean temperature?
② What was your range?
③ Read the temperature at the 3rd reading from your graph. Learner answers from their own worksheet. 3 points per learner – recorded on assessment sheet.
Differentiation
Support: Pre-label the graph axes and provide a partially completed data table. Give a sentence-completion report frame with blanks for the learner to fill in key values. Extension: Take a second set of 6 readings in a different location (e.g. near a window vs. centre of room) and compare the two datasets on one graph using two different coloured lines. Write a comparative conclusion.
Key Vocabulary
sensor · temperature · data · data table · line graph · mean · range · trend · hypothesis · conclusion · axis · interval
Safeguarding Note: Ensure learners do not write personal identifying information on data tables or reports beyond their first name. All recorded data is classroom data only – not to be shared outside the session.
Facilitator Name:
________________________
Date Delivered:
________________________
Signature:
________________________
```
