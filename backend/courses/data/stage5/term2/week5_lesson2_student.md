# Week 5 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Wire both an LDR (pin A0) and a TMP36 temperature sensor (pin A1) to the Arduino breadboard simultaneously and confirm both readings appear in Serial Monitor
- Write an Arduino sketch that reads both sensors every 3 seconds, converts the TMP36 raw value to Celsius using the formula: float tempC = (rawValue * 5.0 / 1024.0 - 0.5) * 100.0, and prints both values with labels
- Store 10 readings from each sensor in separate integer/float arrays and print all stored values in a formatted two-column table via Serial Monitor
- Calculate mean, range, and mode (most frequent value) for each sensor dataset by hand on the worksheet, then verify with code
- Plot two separate line graphs on squared paper (one per sensor), using the same x-axis scale (reading number 1–10) to enable direct visual comparison
- Write a full extended scientific report with 8 sections: Title, Aim, Hypothesis, Equipment, Method, Results (two graphs + two data tables), Comparative Analysis (minimum 120 words comparing trends across both sensors), Conclusion (minimum 80 words linking findings to a real-world application)

## Continue

### INDEPENDENT WORK — Statistics, Graphs, and Report Writing  (50 min)
1. Graph plotting (15 min): draw two separate line graphs on squared paper using two different coloured pens. Graph 1: LDR values (y-axis 0–1023, or scale to fit data) vs Reading Number (x-axis 1–10). Graph 2: Temperature in °C (y-axis scaled to data range) vs Reading Number (x-axis 1–10). Each graph must have: a title, labelled axes with units, a scale marked, all 10 points plotted, points connected with a ruled line.
2. Report writing (20 min): write the 8-section extended scientific report. Sections 1–5 (Title, Aim, Hypothesis, Equipment, Method) should take 10 minutes. Section 6 (Results): paste or draw the two data tables and reference the two graphs. Section 7 (Comparative Analysis, minimum 120 words): compare the two datasets directly — which sensor showed greater variation? Did any readings change in the same direction at the same time? What does that suggest about the environment? Section 8 (Conclusion, minimum 80 words): link findings to a real-world application.
3. Peer-review swap: swap reports with the partner pair. Check: are both graphs present? Is the Comparative Analysis section clearly comparing (not just describing) the two datasets? Is the temperature formula explained in the Method?
4. Check your work carefully. Ask: "Which sensor showed greater range? What does a larger range tell you about that sensor's environment?" Note participation.
5. 2–3 you share their two graphs side by side (hold up to yourself or project via document camera). Explain: "Our LDR mean was ___. Our temperature mean was ___°C. The LDR showed a range of ___, which was [larger/smaller] than the temperature range of ___. We observed that when we covered the LDR, the temperature [did / did not] change — this tells us the two sensors respond to different environmental variables independently."
6. Connect to AI: "Phones that adjust screen brightness use light sensors. Air conditioning systems use temperature sensors. A smart classroom that automatically adjusts both lighting and ventilation uses BOTH sensors together — exactly the data combination you collected today. The AI behind that system was trained on dual-sensor data like yours."

### SHOWCASE & DEBRIEF  (30 min)
7. Formula discussion: "We used a formula to convert a raw number into a meaningful temperature. In AI and data science, this is called feature engineering — transforming raw data into something the model can interpret. You just engineered a feature."
8. Remember English link: "The Comparative Analysis section required you to write about two things at the same time — comparing, contrasting, and drawing conclusions. That is the highest level of analytical writing at primary school. It is also what scientists publish in research journals."
9. Remember Math link: "Three statistical measures — mean, range, mode — applied to two datasets gives you six numbers that summarise 20 readings. Statistics is the tool that turns raw data into knowledge."
10. Exit question (written): "In one sentence each: what did the LDR measure, what did the TMP36 measure, and what would a third sensor measure if you were building a complete room monitoring system?" Collect.
11. Submit sketch and full report via USB flash drive.

## All Lesson 2 steps (complete list)

1. Graph plotting (15 min): draw two separate line graphs on squared paper using two different coloured pens. Graph 1: LDR values (y-axis 0–1023, or scale to fit data) vs Reading Number (x-axis 1–10). Graph 2: Temperature in °C (y-axis scaled to data range) vs Reading Number (x-axis 1–10). Each graph must have: a title, labelled axes with units, a scale marked, all 10 points plotted, points connected with a ruled line.
2. Report writing (20 min): write the 8-section extended scientific report. Sections 1–5 (Title, Aim, Hypothesis, Equipment, Method) should take 10 minutes. Section 6 (Results): paste or draw the two data tables and reference the two graphs. Section 7 (Comparative Analysis, minimum 120 words): compare the two datasets directly — which sensor showed greater variation? Did any readings change in the same direction at the same time? What does that suggest about the environment? Section 8 (Conclusion, minimum 80 words): link findings to a real-world application.
3. Peer-review swap: swap reports with the partner pair. Check: are both graphs present? Is the Comparative Analysis section clearly comparing (not just describing) the two datasets? Is the temperature formula explained in the Method?
4. Check your work carefully. Ask: "Which sensor showed greater range? What does a larger range tell you about that sensor's environment?" Note participation.
5. 2–3 you share their two graphs side by side (hold up to yourself or project via document camera). Explain: "Our LDR mean was ___. Our temperature mean was ___°C. The LDR showed a range of ___, which was [larger/smaller] than the temperature range of ___. We observed that when we covered the LDR, the temperature [did / did not] change — this tells us the two sensors respond to different environmental variables independently."
6. Connect to AI: "Phones that adjust screen brightness use light sensors. Air conditioning systems use temperature sensors. A smart classroom that automatically adjusts both lighting and ventilation uses BOTH sensors together — exactly the data combination you collected today. The AI behind that system was trained on dual-sensor data like yours."
7. Formula discussion: "We used a formula to convert a raw number into a meaningful temperature. In AI and data science, this is called feature engineering — transforming raw data into something the model can interpret. You just engineered a feature."
8. Remember English link: "The Comparative Analysis section required you to write about two things at the same time — comparing, contrasting, and drawing conclusions. That is the highest level of analytical writing at primary school. It is also what scientists publish in research journals."
9. Remember Math link: "Three statistical measures — mean, range, mode — applied to two datasets gives you six numbers that summarise 20 readings. Statistics is the tool that turns raw data into knowledge."
10. Exit question (written): "In one sentence each: what did the LDR measure, what did the TMP36 measure, and what would a third sensor measure if you were building a complete room monitoring system?" Collect.
11. Submit sketch and full report via USB flash drive.

## Check your understanding
- Formative (During) | Dual sensor circuit: both sensors wired correctly and confirmed by you before powering on (physical check) | Serial Monitor: both LDR and temperature values printing correctly every 3 seconds (observed during guided phase) | Statistics worksheet: mean, range, and mode calculated by hand for both datasets before coding (collected) | Peer-review check of partner report: comparative analysis confirmed as comparing (not just describing) both datasets (noted by you)
- Exit Assessment | Dual sensor sketch: reads both sensors, converts temperature using the formula, stores in arrays, prints formatted two-column table — compiles and runs (verified by you) | Two correctly plotted and labelled line graphs on squared paper (submitted) | Full 8-section extended scientific report: Comparative Analysis ≥120 words, Conclusion ≥80 words (submitted, assessed on 5-point artifact rubric) | Statistics worksheet with correct mean, range, and mode for both datasets (submitted) | All materials submitted via USB flash drive
- Differentiation | Support: Pre-build the LDR circuit (covered in Term One) and provide the TMP36 wiring as a guided step-by-step. Provide the conversion formula pre-written in the sketch template and ask you to annotate it rather than derive it. Reduce the Comparative Analysis to 60 words and provide sentence starters: "Both sensors showed…", "Unlike the LDR, the temperature sensor…", "This suggests that…" | Extension: Add a third calculated variable — a comfort index — defined as: int comfortIndex = (tempC < 27 && ldrValue > 400) ? 1 : 0; — prints 1 if the room is comfortably lit and cool, 0 otherwise. Store the comfort index for all 10 readings in a third array and calculate what percentage of readings showed a comfortable environment. Write a 50-word paragraph explaining what this index means and how it could be used in a smart building system.

## Key words to remember
analogRead() · TMP36 · voltage · formula · feature engineering · Comparative Analysis · mean · range · mode · dual-sensor · raw value · conversion · trend

## Stay safe
Safeguarding Note: TMP36 sensors must be inserted with correct orientation — reversed connection causes the sensor to heat rapidly and can cause burns. You must verify orientation for all you before USB connection. Do not allow you to hold the TMP36 between fingers to raise the temperature — use a warm hand held near (not touching) the sensor. All data collected is environmental data only; no personal biometric data is recorded.

## Wrap-up
1. Save your sketch with a clear name for this week.
2. Submit or store your files as required for your course.
3. Unplug hardware and pack kits safely.
