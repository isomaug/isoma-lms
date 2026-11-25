# Week 4 - Lesson 2

## Session length
**About half of this week's plan** (finish what you started in Lesson 1)

## Finish the week
- Write and revise a 5-scene story plan on paper with a clear narrative arc: Introduction, Rising Action, Climax, Falling Action, Resolution
- Create a 5-column storyboard: Scene | LED Animation Plan | Sound | Button Trigger | Duration (seconds); calculate total story duration
- Use a 'scene' variable (starting at 0) in MakeCode that increments by 1 each time Button A is pressed, controlling which scene plays via a chain of if/else conditions
- Add Micro:bit v2 sound to at least 2 scenes using the 'play tone' or 'play melody' block
- Run and test the full 5-scene story, confirming all scenes transition correctly in sequence from scene 0 to scene 4
- Complete a self-assessment rubric (4 criteria, 1–4 scale) and make at least one specific improvement to the code or story based on self-assessment findings

## Continue

### DELIVER – Code the 5-Scene Story (27 min)
1. Step 1 – Scene counter setup (5 min): on start -> set scene to 0 -> show number scene. On button A pressed -> change scene by 1 -> if scene > 4 -> set scene to 0 (loop back to start). Download and test: does the counter increment from 0 to 4 and reset?
2. Step 2 – Code Scenes 0–2 (10 min): inside 'forever': if scene = 0 -> LED animation + pause; if scene = 1 -> LED animation + pause; if scene = 2 -> LED animation + 'play tone Middle C for 1 beat'. Download and test Scenes 0–2.
3. Step 3 – Code Scenes 3–4 + add sound (8 min): add else-if blocks for scene = 3 and scene = 4. Add a 'play melody' block in scene 4 (Resolution). Continue with the next steps yourself. New Driver tests full 5-scene run by pressing Button A 5 times.
4. Step 4 – Self-assessment (4 min): you independently completes the self-assessment rubric. Identifies the lowest-scoring criterion and makes ONE improvement to the code or story before saving.
### DISCOVER – Gallery Share and Evaluate (8 min)
5. Gallery performance: each pair demonstrates their 5-scene story. Presenter reads one sentence per scene from the story plan while pressing Button A to advance the animation. Class listens for: is the narrative arc clear? Is there a clear climax?
6. After each presentation, one classmate shares one evaluative comment: 'I noticed that ___ was effective because ___. One thing that could be improved is ___.'
7. Reflection: Ask yourself you: 'What did you score yourself lowest on in the self-assessment? What improvement did you make? Did it help?' You respond in one sentence each.
8. Maths close: 'If your total story time is 20 seconds and your Climax is 6 seconds, what fraction is the Climax? Can you simplify that fraction?' You calculate and share.
### WRAP-UP – Save and Collect (2 min)
9. Rename project 'T2W4_[Name]_Story5'. Disconnect Micro:bit v2 carefully (built-in speaker — do not yank cable).
10. Collect 5-scene story plan, storyboard grid, and self-assessment rubric. All three are formally assessed artifacts. You records self-assessment scores alongside the observed functionality score on the assessment sheet.

## All Lesson 2 steps (complete list)

1. Step 1 – Scene counter setup (5 min): on start -> set scene to 0 -> show number scene. On button A pressed -> change scene by 1 -> if scene > 4 -> set scene to 0 (loop back to start). Download and test: does the counter increment from 0 to 4 and reset?
2. Step 2 – Code Scenes 0–2 (10 min): inside 'forever': if scene = 0 -> LED animation + pause; if scene = 1 -> LED animation + pause; if scene = 2 -> LED animation + 'play tone Middle C for 1 beat'. Download and test Scenes 0–2.
3. Step 3 – Code Scenes 3–4 + add sound (8 min): add else-if blocks for scene = 3 and scene = 4. Add a 'play melody' block in scene 4 (Resolution). Continue with the next steps yourself. New Driver tests full 5-scene run by pressing Button A 5 times.
4. Step 4 – Self-assessment (4 min): you independently completes the self-assessment rubric. Identifies the lowest-scoring criterion and makes ONE improvement to the code or story before saving.
5. Gallery performance: each pair demonstrates their 5-scene story. Presenter reads one sentence per scene from the story plan while pressing Button A to advance the animation. Class listens for: is the narrative arc clear? Is there a clear climax?
6. After each presentation, one classmate shares one evaluative comment: 'I noticed that ___ was effective because ___. One thing that could be improved is ___.'
7. Reflection: Ask yourself you: 'What did you score yourself lowest on in the self-assessment? What improvement did you make? Did it help?' You respond in one sentence each.
8. Maths close: 'If your total story time is 20 seconds and your Climax is 6 seconds, what fraction is the Climax? Can you simplify that fraction?' You calculate and share.
9. Rename project 'T2W4_[Name]_Story5'. Disconnect Micro:bit v2 carefully (built-in speaker — do not yank cable).
10. Collect 5-scene story plan, storyboard grid, and self-assessment rubric. All three are formally assessed artifacts. You records self-assessment scores alongside the observed functionality score on the assessment sheet.

## Check your understanding
- Formative (During)
- Observation: Does the scene counter variable increment correctly from 0 to 4 and reset to 0 after scene 4? (functionality check)
- Do all 5 scenes display the correct LED animation when triggered? (full run-through check)
- Is sound used in at least 2 scenes? (sound functionality check)
- Self-assessment rubric completed with scores and one specific improvement actioned? (self-assessment artifact check)
- Exit Assessment
- Ask yourself you: ① 'What does the scene variable equal when the Climax scene plays?' (Answer: 2) ② 'What was your lowest self-assessment score and what did you improve?' ③ 'What fraction of your story time is the Climax scene?' Learner answers from their storyboard. 3 points for you — recorded alongside artifact grade.
- Differentiation
- Support: Reduce to 4 scenes (remove Falling Action). Pre-build the scene counter structure (on start + on button A pressed blocks) so learner only adds the LED content inside each if/else branch. Remove the sound requirement — allow focus on getting all scenes to display. Extension: Add a 'score' variable that tracks how many times Button A has been pressed and display the final count after scene 4. Programme Button B to restart the story from scene 0 at any point. Add a second melody that plays only during the Resolution if scene has been reached in fewer than 8 button presses (efficiency challenge).

## Key words to remember
scene counter · variable · state · narrative arc · introduction · rising action · climax · falling action · resolution · evaluate · self-assess · melody · tone · increment · mod Date Delivered: Signature:

## Stay safe
Safeguarding Note: Story content must remain age-appropriate and inclusive — you reviews all 5-scene story plans during the DESIGN phase and redirects any content involving violence, distressing themes, or personal references to other you. Self-assessment rubrics are private between learner and you — scores are never shared with the group without learner consent.

## Wrap-up
1. Rename and save your MakeCode project for this week.
2. Disconnect the Micro:bit carefully and return it to the kit.
3. Close the laptop and pack up safely.
