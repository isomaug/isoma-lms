# Lesson 6

**Duration:** 60 minutes (split across Week 6 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 1 · Week 6
**Age Range:** 7–8 years
**Hardware:** Tablets with Stack KIDI App
**Bloom's:** L2 Understand · L3 Apply · L4 Analyse

**Big Idea:** In a programme with two characters, sometimes Character 2 should only START after Character 1 has FINISHED. Messages let characters communicate: "I'm done - your turn."

**Source plan:** `Stage2_Lesson6_Week6.docx`

## Learning Objectives

- Explain what a message is in Stack KIDI - a signal sent from one character to trigger another character's programme
- Set up a Send Message block at the end of Character 1's sequence and a matching Receive Message block at the start of Character 2's sequence
- Demonstrate that Character 2 does NOT start until Character 1 has sent the message
- Design a 2-character "call and response" interaction where the characters appear to have a conversation through movement

## Materials and Preparation

- 4 tablets with Stack KIDI - 2-character projects from Lesson 4
- Message system diagram (A3 poster): sender (envelope icon) → signal → receiver (ear/antenna icon) - displayed on wall

## Cross-Curricular Links

**English:** Communication analogy: writing a letter (send) vs receiving and reading a letter (receive). Learners write a 2-line "script" for their characters: "Character 1 says (through movement): ___. Character 2 replies (through movement): ___." Vocabulary: send, receive, message, signal, coordinate, synchronise, reply, trigger, depend.

**Maths:** Sequence with dependency: Character 2 starts at time T + duration of Character 1's sequence. If Character 1's sequence takes 4 seconds and Character 2 starts after: total story time = 4 + (Character 2 time). Learners estimate and then time their story with a stopwatch.

## Lesson Structure

### HOOK - The Relay Race (8 min)
1. Call-and-response design strips (A4 per pair): two columns - "Character 1 does ___ THEN sends message ___" and "Character 2 WAITS for message ___ THEN does ___"
2. Colour-coded message tokens: 4 colours (red, blue, yellow, green) - each pair picks one colour. This becomes "their" message colour in Stack KIDI
3. Comparison worksheet (A4 per pair): "Without message - both start at same time" vs "With message - Character 2 waits"
4. Facilitator sets up a simple 2-person relay: Learner A walks to a point, passes a token to Learner B, who then walks to the next point.
5. Ask: "Can Learner B START before Learner A passes the token?" No. "What is the token? It is a MESSAGE."
6. Show message system poster. "This is exactly what Send Message and Receive Message blocks do in Stack KIDI."
7. Compare: "Without a message - both characters start at the same time, like two people running from the same start line." "With a message - Character 2 WAITS for Character 1's signal."

### DESIGN - Call-and-Response Design Strips (10 min)
8. Distribute call-and-response design strips and colour tokens.
9. Each pair selects a message colour (their token). This colour connects their Send and Receive blocks.
10. Fill in Column 1: "Character 1 does [3 movement blocks] THEN sends [colour] message."
11. Fill in Column 2: "Character 2 WAITS for [colour] message THEN does [3 movement blocks]."
12. Pairs present design strips to the facilitator for approval. Check: the colour matches in both columns. Proceed to coding.
13. Open Stack KIDI - 2-character project from Lesson 4.
14. Step 1 - Without message (5 min): Press Green Flag.

### DELIVER - Build the Message System (28 min)
15. Both characters run simultaneously.
16. Observe: do they look coordinated? Complete the left side of the comparison worksheet.
17. Step 2 - Add Send Message to Character 1 (8 min): Select Character 1.
18. After the last movement block, add a SEND MESSAGE block.
19. Tap the colour inside - select the pair's chosen colour token colour.
20. The message is now queued at the end of Character 1's sequence.
21. Step 3 - Add Receive Message to Character 2 (8 min): Select Character 2.

### DISCOVER - Script the Conversation (10 min)
22. REMOVE the Green Flag trigger from Character 2's sequence.
23. Replace it with a RECEIVE MESSAGE trigger.
24. Set it to the same colour as the send block. Now Character 2 starts ONLY when the message arrives.
25. Step 4 - Run and compare (7 min): Press Green Flag.
26. Only Character 1 runs. Wait.
27. When Character 1 finishes and sends the message - Character 2 begins.
28. Fill in the right side of the comparison worksheet.

### WRAP-UP (4 min)
29. Each pair writes a 2-line "script" for what their characters are "saying" through their movements.
30. Share: each pair performs a live reading of their script while the programme runs in the background. Does the timing match?
31. Discussion: "Could you use messages to make a 3-character chain? Character 1 → message → Character 2 → message → Character 3?" One pair attempts a 3-step chain (facilitator assists).
32. Class reflection: "What is the most important word in messaging?" (Timing / Coordination - accept both.)
33. Save projects. Collect comparison worksheets for portfolios.
34. Each learner answers: "The difference between Green Flag start and Receive Message start is ___."
35. Preview: "Next lesson - we put everything together to build our Term 1 project - a full interactive story with all the skills we've learned."

## Assessment

- Formative (During)
- Call-and-response design strip completed (approved before coding)
- Comparison worksheet both sides completed (before and after message)
- Character 2 demonstrably waits for Character 1's message before starting (facilitator observation)
- "Script" written for 2-character conversation
- Exit / Summative
- "Why did we change Character 2's trigger from Green Flag to Receive Message?" Learner must mention: timing / dependency / Character 2 should only start after Character 1 finishes. Full answer = all three concepts; partial = one concept.
- Differentiation
- Support: Facilitator sets the Send Message colour on Character 1; learner only needs to set the matching Receive colour on Character 2. Extension: Build a 3-character chain reaction - Character 1 sends to Character 2, Character 2 sends to Character 3. Time the total story from start to Character 3 finishing.

## Key Vocabulary

_See source._

## Safeguarding

Safeguarding Note: "Messaging" in Stack KIDI is entirely local and internal - reassure learners that no messages leave the device and nothing is sent to the internet.

## Full source extract (complete)

### Detail body

```
Explain what a message is in Stack KIDI - a signal sent from one character to trigger another character's programme
Set up a Send Message block at the end of Character 1's sequence and a matching Receive Message block at the start of Character 2's sequence
Demonstrate that Character 2 does NOT start until Character 1 has sent the message
Design a 2-character "call and response" interaction where the characters appear to have a conversation through movement
4 tablets with Stack KIDI - 2-character projects from Lesson 4
Message system diagram (A3 poster): sender (envelope icon) → signal → receiver (ear/antenna icon) - displayed on wall
Call-and-response design strips (A4 per pair): two columns - "Character 1 does ___ THEN sends message ___" and "Character 2 WAITS for message ___ THEN does ___"
Colour-coded message tokens: 4 colours (red, blue, yellow, green) - each pair picks one colour. This becomes "their" message colour in Stack KIDI
Comparison worksheet (A4 per pair): "Without message - both start at same time" vs "With message - Character 2 waits"
Facilitator sets up a simple 2-person relay: Learner A walks to a point, passes a token to Learner B, who then walks to the next point.
Ask: "Can Learner B START before Learner A passes the token?" No. "What is the token? It is a MESSAGE."
Show message system poster. "This is exactly what Send Message and Receive Message blocks do in Stack KIDI."
Compare: "Without a message - both characters start at the same time, like two people running from the same start line." "With a message - Character 2 WAITS for Character 1's signal."
Distribute call-and-response design strips and colour tokens.
Each pair selects a message colour (their token). This colour connects their Send and Receive blocks.
Fill in Column 1: "Character 1 does [3 movement blocks] THEN sends [colour] message."
Fill in Column 2: "Character 2 WAITS for [colour] message THEN does [3 movement blocks]."
Pairs present design strips to the facilitator for approval. Check: the colour matches in both columns. Proceed to coding.
Open Stack KIDI - 2-character project from Lesson 4.
Step 1 - Without message (5 min): Press Green Flag.
Both characters run simultaneously.
Observe: do they look coordinated? Complete the left side of the comparison worksheet.
Step 2 - Add Send Message to Character 1 (8 min): Select Character 1.
After the last movement block, add a SEND MESSAGE block.
Tap the colour inside - select the pair's chosen colour token colour.
The message is now queued at the end of Character 1's sequence.
Step 3 - Add Receive Message to Character 2 (8 min): Select Character 2.
REMOVE the Green Flag trigger from Character 2's sequence.
Replace it with a RECEIVE MESSAGE trigger.
Set it to the same colour as the send block. Now Character 2 starts ONLY when the message arrives.
Step 4 - Run and compare (7 min): Press Green Flag.
Only Character 1 runs. Wait.
When Character 1 finishes and sends the message - Character 2 begins.
Fill in the right side of the comparison worksheet.
Each pair writes a 2-line "script" for what their characters are "saying" through their movements.
Share: each pair performs a live reading of their script while the programme runs in the background. Does the timing match?
Discussion: "Could you use messages to make a 3-character chain? Character 1 → message → Character 2 → message → Character 3?" One pair attempts a 3-step chain (facilitator assists).
Class reflection: "What is the most important word in messaging?" (Timing / Coordination - accept both.)
Save projects. Collect comparison worksheets for portfolios.
Each learner answers: "The difference between Green Flag start and Receive Message start is ___."
Preview: "Next lesson - we put everything together to build our Term 1 project - a full interactive story with all the skills we've learned."
```

### Plan header and sections

```
ISOMA EDUTECH LIMITED
Stack KIDI Lesson Plan  ·  DDD Framework
Stage 2  (P2 · Cambridge Stage 2 / Year 2)
Lesson 6
Send a Message - Characters That Communicate
Duration
60 minutes
Term / Week
Term 1 · Week 6
Age Range
7–8 years
Group Size
8 learners  (pair programming - 4 pairs)
Hardware
Tablets with Stack KIDI App
Bloom's
L2 Understand · L3 Apply · L4 Analyse
NCDC
Uganda NCDC Thematic Curriculum P2 - Literacy: Communication - how information is passed from one person (or object) to another; Numeracy: Cause-and-effect chains; logical sequences with dependencies
Cambridge
Cambridge Primary Computing 0845 - Stage 2: Events and messages - a character can send a message that triggers another character's programme; understanding coordination and synchronisation between independent sequences
DDD Phase
DELIVER - Learners implement Send Message and Receive Message blocks to coordinate two characters in a call-and-response interaction
Big Idea
In a programme with two characters, sometimes Character 2 should only START after Character 1 has FINISHED. Messages let characters communicate: "I'm done - your turn."
LEARNING OBJECTIVES
MATERIALS AND PREPARATION
CROSS-CURRICULAR LINKS
English
Communication analogy: writing a letter (send) vs receiving and reading a letter (receive). Learners write a 2-line "script" for their characters: "Character 1 says (through movement): ___. Character 2 replies (through movement): ___." Vocabulary: send, receive, message, signal, coordinate, synchronise, reply, trigger, depend.
Maths
Sequence with dependency: Character 2 starts at time T + duration of Character 1's sequence. If Character 1's sequence takes 4 seconds and Character 2 starts after: total story time = 4 + (Character 2 time). Learners estimate and then time their story with a stopwatch.
LESSON STRUCTURE
HOOK - The Relay Race (8 min)
DESIGN - Call-and-Response Design Strips (10 min)
DELIVER - Build the Message System (28 min)
DISCOVER - Script the Conversation (10 min)
WRAP-UP (4 min)
ASSESSMENT
Formative (During)
Call-and-response design strip completed (approved before coding)
Comparison worksheet both sides completed (before and after message)
Character 2 demonstrably waits for Character 1's message before starting (facilitator observation)
"Script" written for 2-character conversation
Exit / Summative
"Why did we change Character 2's trigger from Green Flag to Receive Message?" Learner must mention: timing / dependency / Character 2 should only start after Character 1 finishes. Full answer = all three concepts; partial = one concept.
Differentiation
Support: Facilitator sets the Send Message colour on Character 1; learner only needs to set the matching Receive colour on Character 2. Extension: Build a 3-character chain reaction - Character 1 sends to Character 2, Character 2 sends to Character 3. Time the total story from start to Character 3 finishing.
KEY VOCABULARY
message   ·   send   ·   receive   ·   coordinate   ·   synchronise   ·   trigger   ·   depend   ·   chain   ·   call-and-response   ·   timing
Safeguarding Note: "Messaging" in Stack KIDI is entirely local and internal - reassure learners that no messages leave the device and nothing is sent to the internet.
Facilitator Name:   _____________________
Date Delivered:   _____________________
Signature:   _____________________
```
