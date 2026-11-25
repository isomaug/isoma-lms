# Lesson 6: LED Story Animation – Code a 3-Scene Story

**Duration:** 60 minutes (split across Week 6 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 1 · Week 6
**Age Range:** 8–10 years
**Hardware:** BBC Micro:bit v2 + USB cables + shared laptops
**Software:** Microsoft MakeCode (makecode.microbit.org)
**Bloom's:** L5–L6 Evaluating / Creating
**DDD Phase:** DELIVER – Learners write, code, test, and revise a 3-scene LED animation storytelling project
**Key ILO:** ILO 2.4 – Compose and execute a coded creative narrative on the Micro:bit LED display that tells a 3-scene story, with a written story plan used as the algorithm before coding.
**NCDC:** Uganda NCDC P3–P4 Curriculum: ICT Literacy Strand; Numeracy Strand: Patterns & Logic
**Cambridge:** Cambridge Primary Computing 0845 – Stage 3: Creating programmes to achieve specific goals; Designing and testing sequences; Using creative approaches to problem solving

**Big Idea:** Every story has a beginning, a middle, and an end. A programme can tell a story too – each scene is a block of code triggered by a button press. Writing the story on paper FIRST is the algorithm.

**Source plan:** `Stage3_Week6_Microbit_LessonPlan.docx`

## Learning Objectives

- Write a 3-scene story plan on paper using the narrative structure: Setting (Scene 1), Conflict/Problem (Scene 2), Resolution (Scene 3)
- Translate each scene into a specific LED animation sequence (icons, numbers, scrolling text) planned on a storyboard worksheet
- Code each scene as a button-triggered block in MakeCode: Button A → Scene 1, Button B → Scene 2, Button A+B → Scene 3
- Download, run, and test the full animation, checking all 3 scenes display correctly in sequence
- Revise the code or story plan based on peer feedback (1 Star, 1 Wish format)
- Present the animated story to the group using the written plan as a script

## Materials and Preparation

- 4 BBC Micro:bit v2 kits + USB cables
- 4 shared laptops with MakeCode open
- Story plan worksheet (A4 per learner) – 3 boxes labelled Scene 1: Setting / Scene 2: Conflict / Scene 3: Resolution
- Storyboard/scene planning grid (A4 per learner) – 3 columns: Scene | LED Animation Plan | Button Trigger | Duration (seconds)
- Pencils and coloured pens for storyboard drawing
- 'One Star, One Wish' peer review cards (2 per learner)
- Facilitator device + projected screen
- Vocabulary cards: 'narrative', 'setting', 'conflict', 'resolution', 'algorithm', 'storyboard', 'scene', 'iterate'

## Cross-Curricular Links

**English:** Narrative structure: write a complete 3-scene story plan with setting (Scene 1), conflict or problem (Scene 2), and resolution (Scene 3). Write and revise using partner feedback. The written plan is formally assessed, not just the code. Learners must use at least 3 descriptive adjectives in their plan. Sentence frame for presenting: 'My story is called ___. In Scene 1, ___. In Scene 2, ___. In Scene 3, ___.'

**Maths:** Timing and sequences: plan the duration of each scene in seconds. If Scene 1 lasts 4 seconds and Scene 2 lasts 6 seconds, what is the total animation time for Scenes 1 and 2? If the whole story is 15 seconds and Scene 3 takes the remaining time, how long is Scene 3? Calculate what fraction of the total story duration is Scene 1. Sequence scene numbers in order and verify the total.

## Lesson Structure

### HOOK – Stories on a Tiny Screen (10 min)
1. Facilitator tells a very short oral story (3 sentences – one for each scene): 'There was a cat who was lost. A storm arrived and the cat hid under a tree. Then the sun came out and the cat found its way home.' Ask: 'What happened in the BEGINNING? MIDDLE? END?'
2. Show a pre-made 3-scene LED animation running on the projected Micro:bit simulator. Ask: 'What is this story? What does each icon or symbol mean?' Learners interpret the animation.
3. Introduce the lesson challenge: 'You will write YOUR OWN story, draw it as a storyboard, and then PROGRAMME it onto the Micro:bit. The paper plan must come BEFORE the code.'
4. Vocabulary warm-up: hold up narrative structure cards. Learners match: 'setting' → Scene 1, 'conflict' → Scene 2, 'resolution' → Scene 3. Ask: 'Why do we say the written plan is the ALGORITHM?'
### DESIGN – Write the Story & Storyboard (15 min)
5. Distribute story plan worksheets.
6. Each learner writes their own story independently (not as a pair yet):
7. 2–3 sentences per scene.
8. Scene 1: Where does the story happen? Who is the character?
9. Scene 2: What goes wrong? Scene
10. 3: How is it resolved?
11. Pairs share story plans.
12. Partner gives 1 Star (what they liked) and 1 Wish (what could be clearer or more interesting).
13. Learners revise their plan based on feedback.
14. Pairs complete the storyboard grid together:
15. for each scene, decide what will appear on the LED (icon / number / scrolling text) and which button triggers it.
16. Fill in: Scene | LED Plan | Button | Duration (seconds).
17. Calculate total story duration.
18. Facilitator checks: every pair must have a complete storyboard BEFORE opening MakeCode.
19. Ask: 'What is your Button A+B trigger?
20. Have you planned all 3 scenes?'
### DELIVER – Code, Test, and Revise (25 min)
21. Distribute Micro:bits and laptops.
22. Assign Driver and Navigator.
23. Navigator holds the storyboard – Driver codes from the storyboard exactly.
24. No improvising.
25. Scene 1 (7 min): Code 'on button A pressed' → LED animation for Scene 1 (icons + scrolling text + pause). Download and test. Does it match the storyboard?
26. Scene 2 (7 min): Code 'on button B pressed' → LED animation for Scene 2. Download and test. Navigator checks against storyboard timing.
27. Scene 3 (7 min): Code 'on button A+B pressed' → LED animation for Scene 3. Download and test the FULL story: press A, then B, then A+B. Does the complete 3-scene story run correctly?
28. Revise (4 min): SWAP Driver and Navigator. New Driver fixes any bugs or improves one scene based on the storyboard notes. Re-download and run.
### DISCOVER – Present and Peer Review (8 min)
29. Gallery performance: each pair presents their animated story to the class. Presenter uses the written story plan as a script, reading one sentence per scene while the Micro:bit plays the animation.
30. Audience members complete a 'One Star, One Wish' card for each presentation. Facilitator collects and gives to the presenting pair.
31. Reflection: 'Why did we write the story on paper FIRST?' Learners respond. Guide to: the paper plan is the algorithm – you cannot code something you have not planned.
32. Maths check: Facilitator asks 2 pairs: 'What fraction of your total story time is Scene 1?' Learners calculate and answer.
### WRAP-UP – Save and Collect (2 min)
33. Rename MakeCode project 'Week6_[Name]_Story'. Disconnect Micro:bit carefully.
34. Collect story plan worksheets and storyboard grids. Both are formally assessed this week. Facilitator notes: written plan + revised plan + peer review card submitted.

## Assessment

- Formative (During)
- Observation: Does the 3-scene animation run through all scenes in the correct order? (functionality check)
- Is the written story plan complete with setting, conflict, and resolution? (worksheet check)
- Is the storyboard grid completed with LED plan, button trigger, and duration for each scene? (storyboard check)
- Did learner use partner feedback to revise their story plan? (peer review card check)
- Exit Assessment
- Facilitator asks each presenter:
- ① 'What is the CONFLICT in your story?'
- ② 'Which button triggers Scene 3?'
- ③ 'What is the total duration of your animation?' Learner answers from their storyboard.
- 3 points per learner – recorded on assessment sheet.
- Differentiation
- Support: Provide a pre-written story plan with blanks to fill in. Pre-build the button trigger blocks in MakeCode so learner only adds the LED animation content inside each block. Extension: Add a fourth scene triggered by the shake event. Add a scrolling title screen before Scene 1. Record the total timing, calculate what percentage of the story is each scene, and present the percentages as a pie chart sketch.

## Key Vocabulary

narrative · setting · conflict · resolution · algorithm · storyboard · scene · button trigger · animation · revise · iterate · duration Date Delivered: Signature:

## Safeguarding

Safeguarding Note: Story content must be age-appropriate and inclusive. Facilitator previews all story plans during the DESIGN phase and redirects any content involving violence, exclusion, or distressing themes to a neutral alternative.

## Full source extract (complete)

```
ISOMA EDUTECH LIMITED
Micro:bit Lesson Plan
Stage 3 (P3 · Cambridge Stage 3/Year 3)
Lesson 6: LED Story Animation – Code a 3-Scene Story
WEEK 6
Duration
60 minutes
Term / Week
Term 1 · Week 6
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
DELIVER – Learners write, code, test, and revise a 3-scene LED animation storytelling project
NCDC Ref
Uganda NCDC P3–P4 Curriculum: ICT Literacy Strand; Numeracy Strand: Patterns & Logic
Cambridge Ref
Cambridge Primary Computing 0845 – Stage 3: Creating programmes to achieve specific goals; Designing and testing sequences; Using creative approaches to problem solving
Big Idea
Every story has a beginning, a middle, and an end. A programme can tell a story too – each scene is a block of code triggered by a button press. Writing the story on paper FIRST is the algorithm.
Key ILO
ILO 2.4 – Compose and execute a coded creative narrative on the Micro:bit LED display that tells a 3-scene story, with a written story plan used as the algorithm before coding.
LEARNING OBJECTIVES
#
Objective
1
Write a 3-scene story plan on paper using the narrative structure: Setting (Scene 1), Conflict/Problem (Scene 2), Resolution (Scene 3)
2
Translate each scene into a specific LED animation sequence (icons, numbers, scrolling text) planned on a storyboard worksheet
3
Code each scene as a button-triggered block in MakeCode: Button A → Scene 1, Button B → Scene 2, Button A+B → Scene 3
4
Download, run, and test the full animation, checking all 3 scenes display correctly in sequence
5
Revise the code or story plan based on peer feedback (1 Star, 1 Wish format)
6
Present the animated story to the group using the written plan as a script
Materials & Preparation
4 BBC Micro:bit v2 kits + USB cables
4 shared laptops with MakeCode open
Story plan worksheet (A4 per learner) – 3 boxes labelled Scene 1: Setting / Scene 2: Conflict / Scene 3: Resolution
Storyboard/scene planning grid (A4 per learner) – 3 columns: Scene | LED Animation Plan | Button Trigger | Duration (seconds)
Pencils and coloured pens for storyboard drawing
'One Star, One Wish' peer review cards (2 per learner)
Facilitator device + projected screen
Vocabulary cards: 'narrative', 'setting', 'conflict', 'resolution', 'algorithm', 'storyboard', 'scene', 'iterate'
Cross-Curricular Links
English Literacy
Narrative structure: write a complete 3-scene story plan with setting (Scene 1), conflict or problem (Scene 2), and resolution (Scene 3). Write and revise using partner feedback. The written plan is formally assessed, not just the code. Learners must use at least 3 descriptive adjectives in their plan. Sentence frame for presenting: 'My story is called ___. In Scene 1, ___. In Scene 2, ___. In Scene 3, ___.'
Mathematics
Timing and sequences: plan the duration of each scene in seconds. If Scene 1 lasts 4 seconds and Scene 2 lasts 6 seconds, what is the total animation time for Scenes 1 and 2? If the whole story is 15 seconds and Scene 3 takes the remaining time, how long is Scene 3? Calculate what fraction of the total story duration is Scene 1. Sequence scene numbers in order and verify the total.
LESSON STRUCTURE
Step
Activity
HOOK – Stories on a Tiny Screen (10 min)
1
Facilitator tells a very short oral story (3 sentences – one for each scene): 'There was a cat who was lost. A storm arrived and the cat hid under a tree. Then the sun came out and the cat found its way home.' Ask: 'What happened in the BEGINNING? MIDDLE? END?'
2
Show a pre-made 3-scene LED animation running on the projected Micro:bit simulator. Ask: 'What is this story? What does each icon or symbol mean?' Learners interpret the animation.
3
Introduce the lesson challenge: 'You will write YOUR OWN story, draw it as a storyboard, and then PROGRAMME it onto the Micro:bit. The paper plan must come BEFORE the code.'
4
Vocabulary warm-up: hold up narrative structure cards. Learners match: 'setting' → Scene 1, 'conflict' → Scene 2, 'resolution' → Scene 3. Ask: 'Why do we say the written plan is the ALGORITHM?'
DESIGN – Write the Story & Storyboard (15 min)
5
Distribute story plan worksheets.
Each learner writes their own story independently (not as a pair yet):
2–3 sentences per scene.
Scene 1: Where does the story happen? Who is the character?
Scene 2: What goes wrong? Scene
3: How is it resolved?
6
Pairs share story plans.
Partner gives 1 Star (what they liked) and 1 Wish (what could be clearer or more interesting).
Learners revise their plan based on feedback.
7
Pairs complete the storyboard grid together:
for each scene, decide what will appear on the LED (icon / number / scrolling text) and which button triggers it.
Fill in: Scene | LED Plan | Button | Duration (seconds).
Calculate total story duration.
8
Facilitator checks: every pair must have a complete storyboard BEFORE opening MakeCode.
Ask: 'What is your Button A+B trigger?
Have you planned all 3 scenes?'
DELIVER – Code, Test, and Revise (25 min)
9
Distribute Micro:bits and laptops.
Assign Driver and Navigator.
Navigator holds the storyboard – Driver codes from the storyboard exactly.
No improvising.
10
Scene 1 (7 min): Code 'on button A pressed' → LED animation for Scene 1 (icons + scrolling text + pause). Download and test. Does it match the storyboard?
11
Scene 2 (7 min): Code 'on button B pressed' → LED animation for Scene 2. Download and test. Navigator checks against storyboard timing.
12
Scene 3 (7 min): Code 'on button A+B pressed' → LED animation for Scene 3. Download and test the FULL story: press A, then B, then A+B. Does the complete 3-scene story run correctly?
13
Revise (4 min): SWAP Driver and Navigator. New Driver fixes any bugs or improves one scene based on the storyboard notes. Re-download and run.
DISCOVER – Present and Peer Review (8 min)
14
Gallery performance: each pair presents their animated story to the class. Presenter uses the written story plan as a script, reading one sentence per scene while the Micro:bit plays the animation.
15
Audience members complete a 'One Star, One Wish' card for each presentation. Facilitator collects and gives to the presenting pair.
16
Reflection: 'Why did we write the story on paper FIRST?' Learners respond. Guide to: the paper plan is the algorithm – you cannot code something you have not planned.
17
Maths check: Facilitator asks 2 pairs: 'What fraction of your total story time is Scene 1?' Learners calculate and answer.
WRAP-UP – Save and Collect (2 min)
18
Rename MakeCode project 'Week6_[Name]_Story'. Disconnect Micro:bit carefully.
19
Collect story plan worksheets and storyboard grids. Both are formally assessed this week. Facilitator notes: written plan + revised plan + peer review card submitted.
Assessment
Formative (During)
Observation: Does the 3-scene animation run through all scenes in the correct order? (functionality check)
Is the written story plan complete with setting, conflict, and resolution? (worksheet check)
Is the storyboard grid completed with LED plan, button trigger, and duration for each scene? (storyboard check)
Did learner use partner feedback to revise their story plan? (peer review card check)
Exit Assessment
Facilitator asks each presenter:
① 'What is the CONFLICT in your story?'
② 'Which button triggers Scene 3?'
③ 'What is the total duration of your animation?' Learner answers from their storyboard.
3 points per learner – recorded on assessment sheet.
Differentiation
Support: Provide a pre-written story plan with blanks to fill in. Pre-build the button trigger blocks in MakeCode so learner only adds the LED animation content inside each block. Extension: Add a fourth scene triggered by the shake event. Add a scrolling title screen before Scene 1. Record the total timing, calculate what percentage of the story is each scene, and present the percentages as a pie chart sketch.
Key Vocabulary
narrative · setting · conflict · resolution · algorithm · storyboard · scene · button trigger · animation · revise · iterate · duration
Safeguarding Note: Story content must be age-appropriate and inclusive. Facilitator previews all story plans during the DESIGN phase and redirects any content involving violence, exclusion, or distressing themes to a neutral alternative.
Facilitator Name:
_____________________
Date Delivered:
________________________
Signature:
________________________
```
