# Week 4 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Write and revise a 5-scene story plan on paper with a clear narrative arc: Introduction, Rising Action, Climax, Falling Action, Resolution
- Create a 5-column storyboard: Scene | LED Animation Plan | Sound | Button Trigger | Duration (seconds); calculate total story duration
- Use a 'scene' variable (starting at 0) in MakeCode that increments by 1 each time Button A is pressed, controlling which scene plays via a chain of if/else conditions
- Add Micro:bit v2 sound to at least 2 scenes using the 'play tone' or 'play melody' block
- Run and test the full 5-scene story, confirming all scenes transition correctly in sequence from scene 0 to scene 4
- Complete a self-assessment rubric (4 criteria, 1–4 scale) and make at least one specific improvement to the code or story based on self-assessment findings

## Big idea
A variable can track WHERE you are in a programme — like a bookmark in a book. Combining LED animations, sound, and a counter variable lets the Micro:bit tell a longer, richer story. Evaluating your own work honestly and improving it is what engineers and writers both do.

## What you need
- 4 BBC Micro:bit v2 kits + USB cables (v2 required for built-in speaker)
- 4 shared laptops with MakeCode open
- 5-scene story plan worksheet (A4 for you) – 5 labelled boxes: Introduction / Rising Action / Climax / Falling Action / Resolution
- 5-column storyboard grid (A4 for you): Scene | LED Plan | Sound | Button Trigger | Duration
- Self-assessment rubric (A5 for you) – 4 criteria, 1–4 scale: Story coherence / All 5 scenes coded / Sound used in 2+ scenes / Story improves on Term One version
- Coloured pens for storyboard drawing
- Vocabulary cards: 'scene counter', 'state', 'narrative arc', 'climax', 'resolution', 'evaluate', 'self-assess', 'melody', 'tone', 'increment'
- A computer or screen to follow along

## Links to English and Maths
- **English:** Narrative arc writing: you plan a 5-part story using the full narrative arc (Introduction, Rising Action, Climax, Falling Action, Resolution) — a more sophisticated structure than the 3-part story from Term One. Each scene section must have 2–3 sentences. The story plan is revised at least once based on self-assessment. Oral presentation: learner reads their story aloud during the gallery share, one sentence per scene, while the Micro:bit plays the animation. Evaluative vocabulary: 'I improved ___ because ___. If I had more time, I would ___.'
- **Maths:** Timing and fractions: you assign a duration (in seconds) to each of the 5 scenes and calculate the total story time. What fraction of the total duration is the Climax scene? If the Climax lasts 6 seconds and the total is 24 seconds, what fraction is that? Simplify the fraction. If the Introduction is twice as long as the Resolution, and the Resolution is 3 seconds, how long is the Introduction? Scene counter variable: trace the value of 'scene' from 0 to 4 by drawing a number line and marking each button press. If Button A is pressed 7 times, what scene would be playing? (Answer: scene 2, since 7 mod 5 = 2 — optional challenge).

## Let's begin

### HOOK – What Makes a Longer Story Better? (8 min)
1. Show the Term One 3-scene story structure on the board: Beginning / Middle / End. Then show the 5-part narrative arc: Introduction / Rising Action / Climax / Falling Action / Resolution. Ask: 'What does CLIMAX mean? Why might a story be more exciting with 5 parts than 3?'
2. Play a pre-made 5-scene Micro:bit animation (you demo) on the projected screen. After each scene press, ask: 'What part of the story do you think this is?' You call out the arc stage.
3. Introduce the new technical features: 'This term we add TWO new things — a SCENE COUNTER variable that tracks where we are in the story, and SOUND to make each scene more dramatic.' Show the 'play tone' block briefly on screen.
4. Bridge: 'Your Term One story had 3 scenes. Today you will write 5. You will also EVALUATE your own work and improve at least one thing. That is what professional developers do every single day.'
### DESIGN – Story Plan & Storyboard (15 min)
5. You write their 5-scene story plan independently: 2–3 sentences per scene, one scene per box. Labelled: Introduction (scene 0), Rising Action (scene 1), Climax (scene 2), Falling Action (scene 3), Resolution (scene 4). You checks: is there a clear problem and solution? Is the climax the most dramatic moment?
6. You complete the 5-column storyboard grid together: Scene | LED animation | Sound (tone/melody/none) | Button trigger (all = Button A for scene counter) | Duration (seconds). Calculate total story time at the bottom. Ask yourself: 'What fraction of your story is the Climax scene?'
7. You explains the scene counter variable: 'We create a variable called SCENE. It starts at 0. Every time Button A is pressed, it goes up by 1. We use if/else to check the value — if scene = 0, show Scene 0; if scene = 1, show Scene 1; and so on.' Show the structure on screen. You annotate the pattern on their storyboard.
8. All you must have a completed storyboard BEFORE laptops are distributed. You signs off each storyboard.
### DELIVER – Code the 5-Scene Story (27 min)
9. Get ready to use Micro:bits and laptops. Assign Driver and Navigator. Navigator holds the storyboard — no ad-libbing from the plan.

## Save your progress
Keep your MakeCode project and worksheets ready for Lesson 2, where you will finish this week's activities and check your learning.

## All Lesson 1 steps (complete list)

1. Show the Term One 3-scene story structure on the board: Beginning / Middle / End. Then show the 5-part narrative arc: Introduction / Rising Action / Climax / Falling Action / Resolution. Ask: 'What does CLIMAX mean? Why might a story be more exciting with 5 parts than 3?'
2. Play a pre-made 5-scene Micro:bit animation (you demo) on the projected screen. After each scene press, ask: 'What part of the story do you think this is?' You call out the arc stage.
3. Introduce the new technical features: 'This term we add TWO new things — a SCENE COUNTER variable that tracks where we are in the story, and SOUND to make each scene more dramatic.' Show the 'play tone' block briefly on screen.
4. Bridge: 'Your Term One story had 3 scenes. Today you will write 5. You will also EVALUATE your own work and improve at least one thing. That is what professional developers do every single day.'
5. You write their 5-scene story plan independently: 2–3 sentences per scene, one scene per box. Labelled: Introduction (scene 0), Rising Action (scene 1), Climax (scene 2), Falling Action (scene 3), Resolution (scene 4). You checks: is there a clear problem and solution? Is the climax the most dramatic moment?
6. You complete the 5-column storyboard grid together: Scene | LED animation | Sound (tone/melody/none) | Button trigger (all = Button A for scene counter) | Duration (seconds). Calculate total story time at the bottom. Ask yourself: 'What fraction of your story is the Climax scene?'
7. You explains the scene counter variable: 'We create a variable called SCENE. It starts at 0. Every time Button A is pressed, it goes up by 1. We use if/else to check the value — if scene = 0, show Scene 0; if scene = 1, show Scene 1; and so on.' Show the structure on screen. You annotate the pattern on their storyboard.
8. All you must have a completed storyboard BEFORE laptops are distributed. You signs off each storyboard.
9. Get ready to use Micro:bits and laptops. Assign Driver and Navigator. Navigator holds the storyboard — no ad-libbing from the plan.
