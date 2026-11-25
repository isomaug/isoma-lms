# Lesson 12: Extended Story Animation – Multi-Scene Narrative with Variables & Sound

**Duration:** 60 minutes (split across Week 4 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 2 · Week 4
**Age Range:** 8–10 years
**Hardware:** BBC Micro:bit v2 + USB cables + shared laptops
**Software:** Microsoft MakeCode (makecode.microbit.org)
**Bloom's:** L5–L6 Evaluating / Creating
**DDD Phase:** DELIVER → DISCOVER – Learners deepen ILO 2.4 by extending the Term One LED story animation to 5 scenes, adding a variable to track story progress, and incorporating sound events
**NCDC:** Uganda NCDC P3–P4: ICT Literacy Strand; Numeracy Strand – Patterns, Logic & Data
**Cambridge:** Cambridge Primary Computing 0845 – Stage 3: Designing and coding complex creative programmes; Using variables to manage programme state; Integrating multiple output types (LED, sound); Evaluating and refining creative work

**Big Idea:** A variable can track WHERE you are in a programme — like a bookmark in a book. Combining LED animations, sound, and a counter variable lets the Micro:bit tell a longer, richer story. Evaluating your own work honestly and improving it is what engineers and writers both do.

**Source plan:** `Stage3_Term2_Week4_Microbit_LessonPlan.docx`

## Learning Objectives

- Write and revise a 5-scene story plan on paper with a clear narrative arc: Introduction, Rising Action, Climax, Falling Action, Resolution
- Create a 5-column storyboard: Scene | LED Animation Plan | Sound | Button Trigger | Duration (seconds); calculate total story duration
- Use a 'scene' variable (starting at 0) in MakeCode that increments by 1 each time Button A is pressed, controlling which scene plays via a chain of if/else conditions
- Add Micro:bit v2 sound to at least 2 scenes using the 'play tone' or 'play melody' block
- Run and test the full 5-scene story, confirming all scenes transition correctly in sequence from scene 0 to scene 4
- Complete a self-assessment rubric (4 criteria, 1–4 scale) and make at least one specific improvement to the code or story based on self-assessment findings

## Materials and Preparation

- 4 BBC Micro:bit v2 kits + USB cables (v2 required for built-in speaker)
- 4 shared laptops with MakeCode open
- 5-scene story plan worksheet (A4 per learner) – 5 labelled boxes: Introduction / Rising Action / Climax / Falling Action / Resolution
- 5-column storyboard grid (A4 per learner): Scene | LED Plan | Sound | Button Trigger | Duration
- Self-assessment rubric (A5 per learner) – 4 criteria, 1–4 scale: Story coherence / All 5 scenes coded / Sound used in 2+ scenes / Story improves on Term One version
- Coloured pens for storyboard drawing
- Vocabulary cards: 'scene counter', 'state', 'narrative arc', 'climax', 'resolution', 'evaluate', 'self-assess', 'melody', 'tone', 'increment'
- Facilitator device + projected screen

## Cross-Curricular Links

**English:** Narrative arc writing: learners plan a 5-part story using the full narrative arc (Introduction, Rising Action, Climax, Falling Action, Resolution) — a more sophisticated structure than the 3-part story from Term One. Each scene section must have 2–3 sentences. The story plan is revised at least once based on self-assessment. Oral presentation: learner reads their story aloud during the gallery share, one sentence per scene, while the Micro:bit plays the animation. Evaluative vocabulary: 'I improved ___ because ___. If I had more time, I would ___.'

**Maths:** Timing and fractions: learners assign a duration (in seconds) to each of the 5 scenes and calculate the total story time. What fraction of the total duration is the Climax scene? If the Climax lasts 6 seconds and the total is 24 seconds, what fraction is that? Simplify the fraction. If the Introduction is twice as long as the Resolution, and the Resolution is 3 seconds, how long is the Introduction? Scene counter variable: trace the value of 'scene' from 0 to 4 by drawing a number line and marking each button press. If Button A is pressed 7 times, what scene would be playing? (Answer: scene 2, since 7 mod 5 = 2 — optional challenge).

## Lesson Structure

### HOOK – What Makes a Longer Story Better? (8 min)
1. Show the Term One 3-scene story structure on the board: Beginning / Middle / End. Then show the 5-part narrative arc: Introduction / Rising Action / Climax / Falling Action / Resolution. Ask: 'What does CLIMAX mean? Why might a story be more exciting with 5 parts than 3?'
2. Play a pre-made 5-scene Micro:bit animation (facilitator demo) on the projected screen. After each scene press, ask: 'What part of the story do you think this is?' Learners call out the arc stage.
3. Introduce the new technical features: 'This term we add TWO new things — a SCENE COUNTER variable that tracks where we are in the story, and SOUND to make each scene more dramatic.' Show the 'play tone' block briefly on screen.
4. Bridge: 'Your Term One story had 3 scenes. Today you will write 5. You will also EVALUATE your own work and improve at least one thing. That is what professional developers do every single day.'
### DESIGN – Story Plan & Storyboard (15 min)
5. Each learner writes their 5-scene story plan independently: 2–3 sentences per scene, one scene per box. Labelled: Introduction (scene 0), Rising Action (scene 1), Climax (scene 2), Falling Action (scene 3), Resolution (scene 4). Facilitator checks: is there a clear problem and solution? Is the climax the most dramatic moment?
6. Pairs complete the 5-column storyboard grid together: Scene | LED animation | Sound (tone/melody/none) | Button trigger (all = Button A for scene counter) | Duration (seconds). Calculate total story time at the bottom. Facilitator asks: 'What fraction of your story is the Climax scene?'
7. Facilitator explains the scene counter variable: 'We create a variable called SCENE. It starts at 0. Every time Button A is pressed, it goes up by 1. We use if/else to check the value — if scene = 0, show Scene 0; if scene = 1, show Scene 1; and so on.' Show the structure on screen. Learners annotate the pattern on their storyboard.
8. All pairs must have a completed storyboard BEFORE laptops are distributed. Facilitator signs off each storyboard.
### DELIVER – Code the 5-Scene Story (27 min)
9. Distribute Micro:bits and laptops. Assign Driver and Navigator. Navigator holds the storyboard — no ad-libbing from the plan.
10. Step 1 – Scene counter setup (5 min): on start → set scene to 0 → show number scene. On button A pressed → change scene by 1 → if scene > 4 → set scene to 0 (loop back to start). Download and test: does the counter increment from 0 to 4 and reset?
11. Step 2 – Code Scenes 0–2 (10 min): inside 'forever': if scene = 0 → LED animation + pause; if scene = 1 → LED animation + pause; if scene = 2 → LED animation + 'play tone Middle C for 1 beat'. Download and test Scenes 0–2.
12. Step 3 – Code Scenes 3–4 + add sound (8 min): add else-if blocks for scene = 3 and scene = 4. Add a 'play melody' block in scene 4 (Resolution). SWAP Driver and Navigator. New Driver tests full 5-scene run by pressing Button A 5 times.
13. Step 4 – Self-assessment (4 min): each learner independently completes the self-assessment rubric. Identifies the lowest-scoring criterion and makes ONE improvement to the code or story before saving.
### DISCOVER – Gallery Share and Evaluate (8 min)
14. Gallery performance: each pair demonstrates their 5-scene story. Presenter reads one sentence per scene from the story plan while pressing Button A to advance the animation. Class listens for: is the narrative arc clear? Is there a clear climax?
15. After each presentation, one classmate shares one evaluative comment: 'I noticed that ___ was effective because ___. One thing that could be improved is ___.'
16. Reflection: Facilitator asks each learner: 'What did you score yourself lowest on in the self-assessment? What improvement did you make? Did it help?' Learners respond in one sentence each.
17. Maths close: 'If your total story time is 20 seconds and your Climax is 6 seconds, what fraction is the Climax? Can you simplify that fraction?' Pairs calculate and share.
### WRAP-UP – Save and Collect (2 min)
18. Rename project 'T2W4_[Name]_Story5'. Disconnect Micro:bit v2 carefully (built-in speaker — do not yank cable).
19. Collect 5-scene story plan, storyboard grid, and self-assessment rubric. All three are formally assessed artifacts. Facilitator records self-assessment scores alongside the observed functionality score on the assessment sheet.

## Assessment

- Formative (During)
- Observation: Does the scene counter variable increment correctly from 0 to 4 and reset to 0 after scene 4? (functionality check)
- Do all 5 scenes display the correct LED animation when triggered? (full run-through check)
- Is sound used in at least 2 scenes? (sound functionality check)
- Self-assessment rubric completed with scores and one specific improvement actioned? (self-assessment artifact check)
- Exit Assessment
- Facilitator asks each learner: ① 'What does the scene variable equal when the Climax scene plays?' (Answer: 2) ② 'What was your lowest self-assessment score and what did you improve?' ③ 'What fraction of your story time is the Climax scene?' Learner answers from their storyboard. 3 points per learner — recorded alongside artifact grade.
- Differentiation
- Support: Reduce to 4 scenes (remove Falling Action). Pre-build the scene counter structure (on start + on button A pressed blocks) so learner only adds the LED content inside each if/else branch. Remove the sound requirement — allow focus on getting all scenes to display. Extension: Add a 'score' variable that tracks how many times Button A has been pressed and display the final count after scene 4. Programme Button B to restart the story from scene 0 at any point. Add a second melody that plays only during the Resolution if scene has been reached in fewer than 8 button presses (efficiency challenge).

## Key Vocabulary

scene counter · variable · state · narrative arc · introduction · rising action · climax · falling action · resolution · evaluate · self-assess · melody · tone · increment · mod Date Delivered: Signature:

## Safeguarding

Safeguarding Note: Story content must remain age-appropriate and inclusive — facilitator reviews all 5-scene story plans during the DESIGN phase and redirects any content involving violence, distressing themes, or personal references to other learners. Self-assessment rubrics are private between learner and facilitator — scores are never shared with the group without learner consent.

## Full source extract (complete)

```
ISOMA EDUTECH LIMITED
Micro:bit Lesson Plan
Stage 3 (P3 · Cambridge Stage 3/Year 3)  |  Term Two
Lesson 12: Extended Story Animation – Multi-Scene Narrative with Variables & Sound
T2 · W4
(Week 12)
Duration
60 minutes
Term / Week
Term 2 · Week 4
Age Range
8–10 years
Group Size
8 learners (pair programming, 4 pairs)
Hardware
BBC Micro:bit v2 + USB cables + shared laptops
Software
Microsoft MakeCode (makecode.microbit.org)
Bloom's
L5–L6 Evaluating / Creating
DDD Phase
DELIVER → DISCOVER – Learners deepen ILO 2.4 by extending the Term One LED story animation to 5 scenes, adding a variable to track story progress, and incorporating sound events
NCDC Ref
Uganda NCDC P3–P4: ICT Literacy Strand; Numeracy Strand – Patterns, Logic & Data
Cambridge Ref
Cambridge Primary Computing 0845 – Stage 3: Designing and coding complex creative programmes; Using variables to manage programme state; Integrating multiple output types (LED, sound); Evaluating and refining creative work
Term Two Focus
Term Two deepens ILO 2.4 (coded narrative) by extending from 3 scenes to 5, introducing a 'scene counter' variable to track story position, adding Micro:bit v2 sound output, and requiring learners to evaluate and revise their own work against a self-assessment rubric.
Key ILO(s)
ILO 2.4 (deepened) – Compose, code, and evaluate a 5-scene LED + sound narrative on the Micro:bit, using a scene counter variable and button events, supported by a revised and improved written story plan and a self-assessment rubric.
Big Idea
A variable can track WHERE you are in a programme — like a bookmark in a book. Combining LED animations, sound, and a counter variable lets the Micro:bit tell a longer, richer story. Evaluating your own work honestly and improving it is what engineers and writers both do.
Term One Link
Term One Week 6 produced a 3-scene LED story using button-triggered if/else blocks. This lesson extends to 5 scenes, adds a scene counter variable (deepening ILO 2.1 + 2.4 integration), adds sound, and introduces self-evaluation — a Bloom's L5 skill new to this term.
LEARNING OBJECTIVES
#
Objective
1
Write and revise a 5-scene story plan on paper with a clear narrative arc: Introduction, Rising Action, Climax, Falling Action, Resolution
2
Create a 5-column storyboard: Scene | LED Animation Plan | Sound | Button Trigger | Duration (seconds); calculate total story duration
3
Use a 'scene' variable (starting at 0) in MakeCode that increments by 1 each time Button A is pressed, controlling which scene plays via a chain of if/else conditions
4
Add Micro:bit v2 sound to at least 2 scenes using the 'play tone' or 'play melody' block
5
Run and test the full 5-scene story, confirming all scenes transition correctly in sequence from scene 0 to scene 4
6
Complete a self-assessment rubric (4 criteria, 1–4 scale) and make at least one specific improvement to the code or story based on self-assessment findings
Materials & Preparation
4 BBC Micro:bit v2 kits + USB cables (v2 required for built-in speaker)
4 shared laptops with MakeCode open
5-scene story plan worksheet (A4 per learner) – 5 labelled boxes: Introduction / Rising Action / Climax / Falling Action / Resolution
5-column storyboard grid (A4 per learner): Scene | LED Plan | Sound | Button Trigger | Duration
Self-assessment rubric (A5 per learner) – 4 criteria, 1–4 scale: Story coherence / All 5 scenes coded / Sound used in 2+ scenes / Story improves on Term One version
Coloured pens for storyboard drawing
Vocabulary cards: 'scene counter', 'state', 'narrative arc', 'climax', 'resolution', 'evaluate', 'self-assess', 'melody', 'tone', 'increment'
Facilitator device + projected screen
Cross-Curricular Links
English Literacy
Narrative arc writing: learners plan a 5-part story using the full narrative arc (Introduction, Rising Action, Climax, Falling Action, Resolution) — a more sophisticated structure than the 3-part story from Term One. Each scene section must have 2–3 sentences. The story plan is revised at least once based on self-assessment. Oral presentation: learner reads their story aloud during the gallery share, one sentence per scene, while the Micro:bit plays the animation. Evaluative vocabulary: 'I improved ___ because ___. If I had more time, I would ___.'
Mathematics
Timing and fractions: learners assign a duration (in seconds) to each of the 5 scenes and calculate the total story time. What fraction of the total duration is the Climax scene? If the Climax lasts 6 seconds and the total is 24 seconds, what fraction is that? Simplify the fraction. If the Introduction is twice as long as the Resolution, and the Resolution is 3 seconds, how long is the Introduction? Scene counter variable: trace the value of 'scene' from 0 to 4 by drawing a number line and marking each button press. If Button A is pressed 7 times, what scene would be playing? (Answer: scene 2, since 7 mod 5 = 2 — optional challenge).
LESSON STRUCTURE
Step
Activity
HOOK – What Makes a Longer Story Better? (8 min)
1
Show the Term One 3-scene story structure on the board: Beginning / Middle / End. Then show the 5-part narrative arc: Introduction / Rising Action / Climax / Falling Action / Resolution. Ask: 'What does CLIMAX mean? Why might a story be more exciting with 5 parts than 3?'
2
Play a pre-made 5-scene Micro:bit animation (facilitator demo) on the projected screen. After each scene press, ask: 'What part of the story do you think this is?' Learners call out the arc stage.
3
Introduce the new technical features: 'This term we add TWO new things — a SCENE COUNTER variable that tracks where we are in the story, and SOUND to make each scene more dramatic.' Show the 'play tone' block briefly on screen.
4
Bridge: 'Your Term One story had 3 scenes. Today you will write 5. You will also EVALUATE your own work and improve at least one thing. That is what professional developers do every single day.'
DESIGN – Story Plan & Storyboard (15 min)
5
Each learner writes their 5-scene story plan independently: 2–3 sentences per scene, one scene per box. Labelled: Introduction (scene 0), Rising Action (scene 1), Climax (scene 2), Falling Action (scene 3), Resolution (scene 4). Facilitator checks: is there a clear problem and solution? Is the climax the most dramatic moment?
6
Pairs complete the 5-column storyboard grid together: Scene | LED animation | Sound (tone/melody/none) | Button trigger (all = Button A for scene counter) | Duration (seconds). Calculate total story time at the bottom. Facilitator asks: 'What fraction of your story is the Climax scene?'
7
Facilitator explains the scene counter variable: 'We create a variable called SCENE. It starts at 0. Every time Button A is pressed, it goes up by 1. We use if/else to check the value — if scene = 0, show Scene 0; if scene = 1, show Scene 1; and so on.' Show the structure on screen. Learners annotate the pattern on their storyboard.
8
All pairs must have a completed storyboard BEFORE laptops are distributed. Facilitator signs off each storyboard.
DELIVER – Code the 5-Scene Story (27 min)
9
Distribute Micro:bits and laptops. Assign Driver and Navigator. Navigator holds the storyboard — no ad-libbing from the plan.
10
Step 1 – Scene counter setup (5 min): on start → set scene to 0 → show number scene. On button A pressed → change scene by 1 → if scene > 4 → set scene to 0 (loop back to start). Download and test: does the counter increment from 0 to 4 and reset?
11
Step 2 – Code Scenes 0–2 (10 min): inside 'forever': if scene = 0 → LED animation + pause; if scene = 1 → LED animation + pause; if scene = 2 → LED animation + 'play tone Middle C for 1 beat'. Download and test Scenes 0–2.
12
Step 3 – Code Scenes 3–4 + add sound (8 min): add else-if blocks for scene = 3 and scene = 4. Add a 'play melody' block in scene 4 (Resolution). SWAP Driver and Navigator. New Driver tests full 5-scene run by pressing Button A 5 times.
13
Step 4 – Self-assessment (4 min): each learner independently completes the self-assessment rubric. Identifies the lowest-scoring criterion and makes ONE improvement to the code or story before saving.
DISCOVER – Gallery Share and Evaluate (8 min)
14
Gallery performance: each pair demonstrates their 5-scene story. Presenter reads one sentence per scene from the story plan while pressing Button A to advance the animation. Class listens for: is the narrative arc clear? Is there a clear climax?
15
After each presentation, one classmate shares one evaluative comment: 'I noticed that ___ was effective because ___. One thing that could be improved is ___.'
16
Reflection: Facilitator asks each learner: 'What did you score yourself lowest on in the self-assessment? What improvement did you make? Did it help?' Learners respond in one sentence each.
17
Maths close: 'If your total story time is 20 seconds and your Climax is 6 seconds, what fraction is the Climax? Can you simplify that fraction?' Pairs calculate and share.
WRAP-UP – Save and Collect (2 min)
18
Rename project 'T2W4_[Name]_Story5'. Disconnect Micro:bit v2 carefully (built-in speaker — do not yank cable).
19
Collect 5-scene story plan, storyboard grid, and self-assessment rubric. All three are formally assessed artifacts. Facilitator records self-assessment scores alongside the observed functionality score on the assessment sheet.
Assessment
Formative (During)
Observation: Does the scene counter variable increment correctly from 0 to 4 and reset to 0 after scene 4? (functionality check)
Do all 5 scenes display the correct LED animation when triggered? (full run-through check)
Is sound used in at least 2 scenes? (sound functionality check)
Self-assessment rubric completed with scores and one specific improvement actioned? (self-assessment artifact check)
Exit Assessment
Facilitator asks each learner: ① 'What does the scene variable equal when the Climax scene plays?' (Answer: 2) ② 'What was your lowest self-assessment score and what did you improve?' ③ 'What fraction of your story time is the Climax scene?' Learner answers from their storyboard. 3 points per learner — recorded alongside artifact grade.
Differentiation
Support: Reduce to 4 scenes (remove Falling Action). Pre-build the scene counter structure (on start + on button A pressed blocks) so learner only adds the LED content inside each if/else branch. Remove the sound requirement — allow focus on getting all scenes to display. Extension: Add a 'score' variable that tracks how many times Button A has been pressed and display the final count after scene 4. Programme Button B to restart the story from scene 0 at any point. Add a second melody that plays only during the Resolution if scene has been reached in fewer than 8 button presses (efficiency challenge).
Key Vocabulary
scene counter · variable · state · narrative arc · introduction · rising action · climax · falling action · resolution · evaluate · self-assess · melody · tone · increment · mod
Safeguarding Note: Story content must remain age-appropriate and inclusive — facilitator reviews all 5-scene story plans during the DESIGN phase and redirects any content involving violence, distressing themes, or personal references to other learners. Self-assessment rubrics are private between learner and facilitator — scores are never shared with the group without learner consent.
Facilitator Name:
_________________________________
Date Delivered:
_________________________________
Signature:
_________________________________
```
