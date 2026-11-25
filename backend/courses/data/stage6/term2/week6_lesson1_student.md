# Week 6 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Collect 20 simultaneous readings from TMP36 (temperature) and LDR (light) over a 5-minute period, recorded in a structured dual-column data table
- Plot both datasets as separate annotated line graphs on the same sheet — same x-axis (reading number 1–20), separate y-axes scaled appropriately, both labelled with title, units, and gridlines
- Calculate for both datasets: mean, range, and percentage change from reading 1 to reading 20
- Identify and annotate on each graph: the peak value, the trough value, and any visible trend segment (rising, falling, stable)
- Write a Technical Analysis Report of minimum 200 words, structured in three sections: (1) Data Summary (what was collected and how), (2) Comparative Analysis (differences and similarities between the two datasets with numerical evidence), (3) Interpretation and AI Connection (what the data suggests about the environment, and how this data could serve as training input for a machine learning model)
- Evaluate own report against the DDD Part 8.3 Stage 5–6 5-point rubric and self-assign a score with a written justification

## Let's begin

### 1. HOOK
1. Two Sensors, One Story
2. Open Serial Plotter on projector with both sensors running. Cover/uncover LDR while warming TMP36 simultaneously. Ask: "Do the two lines move together? Or independently?" Observe and discuss.
3. Introduce today's goal: "You will collect 20 readings from both sensors simultaneously, plot them, analyse them, and write a report that argues what the data means."
4. Show the Report Template. Read through the three sections together. Emphasise Section 3: "An AI connection is not optional — it is a mandatory part of this report."
5. Get ready to use Self-Assessment Rubric Card. You read it together. Ask: "What does a '5 — Excellent' report look like? What is the difference between a 3 and a 4?" Discuss. You set a target score for themselves before writing.
6. Quick statistics recap: one learner explains mean to yourself; another explains range; a third explains percentage change. You corrects any misconceptions before data collection begins.
### 2. GUIDED ACTIVITY
7. Collect, Table & Plot
8. Step 1 (10 min): Wire circuit — TMP36 on A0, LDR on A1 (with 10kΩ pull-down). You wire independently. You checks all connections before upload.
9. Step 2 (10 min): Open existing dual-sensor sketch from Term 2 Week 2 (or re-code from memory — good formative check). Modify: collect exactly 20 readings at 15-second intervals. Print both sensor values on each line: Serial.print(tempC); Serial.print(","); Serial.println(ldrValue);
10. Step 3 (20 min): Data collection — you run the sketch for 5 minutes. During collection, deliberately vary light conditions at readings 8, 12, and 17 (cover/uncover LDR) to create an interesting dataset with visible trend changes. Record all 20 readings in the Dual Data Table.
11. Step 4 (20 min): Plot both datasets in two colours on the Graph Sheet. Label every axis: title, units, scale. Annotate: mark the peak value, trough value, and one trend segment on each graph. Draw the midpoint line for each dataset's range.

## Save your progress
Keep your Arduino sketch and worksheets ready for Lesson 2.

## All Lesson 1 steps (complete list)

1. Two Sensors, One Story
2. Open Serial Plotter on projector with both sensors running. Cover/uncover LDR while warming TMP36 simultaneously. Ask: "Do the two lines move together? Or independently?" Observe and discuss.
3. Introduce today's goal: "You will collect 20 readings from both sensors simultaneously, plot them, analyse them, and write a report that argues what the data means."
4. Show the Report Template. Read through the three sections together. Emphasise Section 3: "An AI connection is not optional — it is a mandatory part of this report."
5. Get ready to use Self-Assessment Rubric Card. You read it together. Ask: "What does a '5 — Excellent' report look like? What is the difference between a 3 and a 4?" Discuss. You set a target score for themselves before writing.
6. Quick statistics recap: one learner explains mean to yourself; another explains range; a third explains percentage change. You corrects any misconceptions before data collection begins.
7. Collect, Table & Plot
8. Step 1 (10 min): Wire circuit — TMP36 on A0, LDR on A1 (with 10kΩ pull-down). You wire independently. You checks all connections before upload.
9. Step 2 (10 min): Open existing dual-sensor sketch from Term 2 Week 2 (or re-code from memory — good formative check). Modify: collect exactly 20 readings at 15-second intervals. Print both sensor values on each line: Serial.print(tempC); Serial.print(","); Serial.println(ldrValue);
10. Step 3 (20 min): Data collection — you run the sketch for 5 minutes. During collection, deliberately vary light conditions at readings 8, 12, and 17 (cover/uncover LDR) to create an interesting dataset with visible trend changes. Record all 20 readings in the Dual Data Table.
11. Step 4 (20 min): Plot both datasets in two colours on the Graph Sheet. Label every axis: title, units, scale. Annotate: mark the peak value, trough value, and one trend segment on each graph. Draw the midpoint line for each dataset's range.
