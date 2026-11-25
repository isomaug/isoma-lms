# Week 5 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Wire an LDR sensor to Arduino analogue pin A0 using a breadboard and 10kΩ resistor voltage divider circuit
- Write an Arduino sketch that reads and prints the LDR analogue value every 2 seconds using Serial.println()
- Record 10 sensor readings in a data table under varying light conditions (covered / normal / bright)
- Plot all 10 readings as a correctly labelled line graph on squared paper (x-axis: reading number; y-axis: sensor value)
- Calculate the mean and range of the 10 readings and identify the trend (increasing, decreasing, or no trend)
- Write a full scientific report with all 7 required sections: Title, Aim, Hypothesis, Equipment, Method, Results (data table + graph), Conclusion (minimum 100 words)

## Big idea
Sensors are the eyes and ears of a computer. Data becomes meaningful only when we record, graph, and interpret it.

## What you need
- 4 laptops with Arduino IDE 2.x
- 4 Arduino Uno boards + USB cables
- 4 LDR sensors (one for you)
- 4 × 10kΩ resistors
- 4 breadboards + jumper wire sets
- Squared paper (A4, 2 sheets for you)
- Printed data table worksheet (A5 for you) – 10-row table: Reading # | Light condition | Sensor value
- Printed scientific report template (A4 for you) – 7 labelled sections with line-count guidance
- Rulers, pencils
- USB flash drives
- A computer screen to follow along

## Links to English and Maths
- **English:** Scientific report writing with structured format: Title, Aim, Hypothesis, Equipment, Method (numbered steps), Results (data table + graph), Conclusion. Minimum 100 words in the Conclusion section. The Conclusion must follow the sentence structure: "Our experiment showed that… This supports/does not support our hypothesis because… If we repeated this experiment, we would… This data could be used in a real device to…" This mirrors formal science writing taught in P5–P6.
- **Maths:** Data handling: calculate mean = sum of all readings ÷ 10; range = maximum value − minimum value. Line graph construction: correct scale on y-axis, labelled axes, plotted points connected by a line. Trend identification: increasing (more light = higher value), decreasing, or no clear trend. Link to P5 maths: reading and interpreting line graphs; calculating averages from a data set.

## Let's begin

### HOOK – What Can a Computer Feel?  (20 min)
1. Hold an LDR up to yourself. Ask: "What is this? What do you think it does?" Think of your own answer first. Reveal: "This component changes its electrical resistance depending on how much light hits it. Cover it – resistance increases. Uncover it – resistance drops."
2. Demonstration: you connect LDR to Arduino, opens Serial Monitor. You watch the value change as the you cover and uncovers the LDR with a hand. Ask: "What pattern do you see? What is the computer doing with this information?"
3. Bridge to AI: "This is exactly how a phone's screen brightness adjusts automatically. The phone uses a light sensor – like this one – and a rule: 'if light level is low, increase brightness.' Today you build the data collection half of that system."
4. Introduce the scientific report template. Read each section aloud. You write their Hypothesis now, before any data is collected: "I think that when more light hits the LDR, the sensor value will ___ because ___."
5. Circuit building (15 min): you project the wiring diagram. Step-by-step: LDR one leg to 5V, other leg to A0 AND to one end of 10kΩ resistor. Other end of resistor to GND. You build the circuit on breadboard. Check each circuit before powering on.
6. Sketch: open Arduino IDE. Write the sketch: in setup(), Serial.begin(9600). In loop(), int lightValue = analogRead(A0); Serial.println(lightValue); delay(2000);. Upload and open Serial Monitor.

### GUIDED ACTIVITY – Wire the Circuit and Collect Data  (60 min)
7. Verify: values appearing every 2 seconds. Ask: "What value appears when you cover the LDR with your hand? What value when you hold it near the window?"
8. Data collection (20 min): you record 10 readings in their data table worksheet. Vary the light condition for each reading: cover the LDR with a book, hold it near a lamp, use normal room light, use a torch from a phone. Record the condition and the sensor value.
9. Calculation (10 min): calculate mean (sum all 10 values ÷ 10) and range (highest − lowest) by hand. Write these on the data table. Identify the trend.
10. Rotate your own pacing. Continue with the graph plotting phase.
11. Line graph: on squared paper, draw x-axis (Reading Number, 1–10) and y-axis (Sensor Value, scale chosen to fit all readings). Plot all 10 points. Connect with a ruled line. Add a title and label both axes.

## Save your progress
Keep your sketch, notes, and worksheets ready for Lesson 2, where you will finish this week's activities and check your learning.

## All Lesson 1 steps (complete list)

1. Hold an LDR up to yourself. Ask: "What is this? What do you think it does?" Think of your own answer first. Reveal: "This component changes its electrical resistance depending on how much light hits it. Cover it – resistance increases. Uncover it – resistance drops."
2. Demonstration: you connect LDR to Arduino, opens Serial Monitor. You watch the value change as the you cover and uncovers the LDR with a hand. Ask: "What pattern do you see? What is the computer doing with this information?"
3. Bridge to AI: "This is exactly how a phone's screen brightness adjusts automatically. The phone uses a light sensor – like this one – and a rule: 'if light level is low, increase brightness.' Today you build the data collection half of that system."
4. Introduce the scientific report template. Read each section aloud. You write their Hypothesis now, before any data is collected: "I think that when more light hits the LDR, the sensor value will ___ because ___."
5. Circuit building (15 min): you project the wiring diagram. Step-by-step: LDR one leg to 5V, other leg to A0 AND to one end of 10kΩ resistor. Other end of resistor to GND. You build the circuit on breadboard. Check each circuit before powering on.
6. Sketch: open Arduino IDE. Write the sketch: in setup(), Serial.begin(9600). In loop(), int lightValue = analogRead(A0); Serial.println(lightValue); delay(2000);. Upload and open Serial Monitor.
7. Verify: values appearing every 2 seconds. Ask: "What value appears when you cover the LDR with your hand? What value when you hold it near the window?"
8. Data collection (20 min): you record 10 readings in their data table worksheet. Vary the light condition for each reading: cover the LDR with a book, hold it near a lamp, use normal room light, use a torch from a phone. Record the condition and the sensor value.
9. Calculation (10 min): calculate mean (sum all 10 values ÷ 10) and range (highest − lowest) by hand. Write these on the data table. Identify the trend.
10. Rotate your own pacing. Continue with the graph plotting phase.
11. Line graph: on squared paper, draw x-axis (Reading Number, 1–10) and y-axis (Sensor Value, scale chosen to fit all readings). Plot all 10 points. Connect with a ruled line. Add a title and label both axes.
