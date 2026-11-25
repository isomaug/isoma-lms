# Lesson 14  ·  Term 2 · Week 6

**Duration:** 60 minutes (split across Week 6 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 2 · Week 6
**Age Range:** 7–8 years
**Hardware:** Tablets with Stack KIDI App
**Bloom's:** L4 Analyse · L5 Evaluate · L6 Create

**Big Idea:** The specification document is the architect's blueprint. The programmer's job is to build exactly what is on the blueprint — no more, no less. A programme that matches its specification is a success, even if it is simple.

**Source plan:** `Stage2_Lesson14_Term2_Week6.docx`

## Learning Objectives

- Use the Lesson 13 specification document as a build guide, implementing each sub-problem in order
- Test each sub-problem against its test condition before connecting it to the next
- Implement at least one page transition as a state change (e.g. PLAYING → WIN SCREEN)
- Document any deviation from the specification during the build and justify each change made

## Materials and Preparation

- 4 tablets with Stack KIDI — clean new projects
- Game Specification Documents from Lesson 13 (facilitator returns these)
- Sub-problem test checklist from Lesson 11 (reuse format, or new A5 sheet)

## Cross-Curricular Links

**English:** Following instructions precisely vs. adapting them: "A builder follows plans exactly — unless something is impossible, in which case they change the plan and document it." Learners must write in the Deviation Log if they change anything from the specification. Vocabulary: implement, specification, deviate, justify, document, adapt, evidence, precision.

**Maths:** Progress tracking: at the 20-minute checkpoint, pairs count: sub-problems complete / in progress / not started. Calculate completion percentage: (complete ÷ 4) × 100 = ___%. At end of session: same calculation. Compare start and end percentages. Calculate rate of progress: "We completed ___ sub-problems in 40 minutes, so each sub-problem took approximately ___ minutes on average."

## Lesson Structure

### HOOK — The Blueprint Check (7 min)
1. Deviation log (A5 per pair): 3 rows — Sub-problem changed / Reason for change / How the specification was updated. This teaches that specifications evolve — good engineers document changes.
2. Checkpoint flag cards (A6, 4 per pair): green flag card held up when a sub-problem passes its test condition — facilitator can see progress from anywhere in the room
3. Block speed reference (A5): common Stack KIDI blocks listed with their typical use in a game context — useful reference during a focused build sprint
4. Facilitator hands back Lesson 13 specification documents. Pairs re-read their own specification silently for 2 minutes.
5. "Does this spec still make sense to you? Is anything unclear now that you are about to build it?" Pairs flag any confusion.
6. For any flagged issue: facilitator helps clarify or simplify the problematic section (maximum 3 minutes per pair).

### DELIVER — Build Sprint (44 min)
7. Distribute checkpoint flag cards. Explain: "When your sub-problem passes its test condition — hold up a green flag. I will come and confirm before you proceed to the next."
8. BUILD BEGINS. Pairs open Stack KIDI. New project. Build strictly in sub-problem order from the specification.
9. SUB-PROBLEM 1 (10 min): Typically — set up the TITLE SCREEN page: background, character, "tap to start" trigger that navigates to Page 2 (PLAYING state). When complete and tested: hold up green flag.
10. SUB-PROBLEM 2 (10 min): Typically — build the PLAYING state: the core game mechanic (tap trigger, score variable, character feedback loop). When complete and tested: hold up green flag.
11. CHECKPOINT at 20 minutes: Facilitator records each pair's progress (green flags received). Any pair with 0 flags — receives a targeted 3-minute support session.
12. SUB-PROBLEM 3 (10 min): Typically — build the WIN SCREEN state: a page triggered when the score variable reaches the win condition. A celebration sequence on the WIN page. "Tap to replay" returns to PLAYING.

### DISCOVER — Specification vs Reality (5 min)
13. SUB-PROBLEM 4 (8 min): Typically — polish the connections: ensure Wait blocks are correctly timed, sounds match each state, backgrounds are visually different per state.
14. Any deviation from specification: record in the Deviation Log before continuing.
15. Final full-game test (6 min): play from Title Screen through to WIN SCREEN and back to PLAYING. Confirm the complete state loop works.
16. Pairs compare their finished game to the specification: "Which 4 success criteria are met? Any not yet met?"
17. Read the Deviation Log: "Was every change justified? Does the final game still match the intended concept?"

### WRAP-UP (4 min)
18. Brief class discussion: "Did anyone build exactly what they specified — zero deviations? Did anyone make 3 or more changes? Which approach produced a better game?"
19. Save game as "GAME BUILD — [Pair Names]."
20. Count green flags received during the session: ___/4.
21. Calculate progress percentage. Record on sub-problem test checklist.
22. Preview: "Next lesson — we bring in real players to playtest the game, collect feedback, and make final improvements before Demo Day."

## Assessment

- Formative (During)
- Green flags received: target 4/4 for full credit; 3/4 = satisfactory; below 3 = requires Term 3 follow-up
- Checkpoint at 20 min: at least 2 sub-problems tested (facilitator recorded)
- Deviation Log completed for any change from specification
- Full game loop functional: Title → Playing → Win → Replay (facilitator final test)
- Exit / Summative
- Facilitator runs each game and confirms: ① Title Screen loads ② Core mechanic works ③ Win condition triggers the WIN state ④ Replay works. Score 4/4 = Demo Day ready; 3/4 = one fix needed; below 3 = additional support time before Demo Day.
- Differentiation
- Support: Reduce to 2 sub-problems (Playing state only — no Title Screen or WIN state). This still produces a functional game. Extension: Add a LOSE state — programme a 30-second timer using a chain of Wait blocks; if the timer expires before the win condition is reached, a LOSE page transitions in. Implement and test the full 4-state loop.

## Key Vocabulary

_See source._

## Full source extract (complete)

### Detail body

```
Use the Lesson 13 specification document as a build guide, implementing each sub-problem in order
Test each sub-problem against its test condition before connecting it to the next
Implement at least one page transition as a state change (e.g. PLAYING → WIN SCREEN)
Document any deviation from the specification during the build and justify each change made
4 tablets with Stack KIDI — clean new projects
Game Specification Documents from Lesson 13 (facilitator returns these)
Sub-problem test checklist from Lesson 11 (reuse format, or new A5 sheet)
Deviation log (A5 per pair): 3 rows — Sub-problem changed / Reason for change / How the specification was updated. This teaches that specifications evolve — good engineers document changes.
Checkpoint flag cards (A6, 4 per pair): green flag card held up when a sub-problem passes its test condition — facilitator can see progress from anywhere in the room
Block speed reference (A5): common Stack KIDI blocks listed with their typical use in a game context — useful reference during a focused build sprint
Facilitator hands back Lesson 13 specification documents. Pairs re-read their own specification silently for 2 minutes.
"Does this spec still make sense to you? Is anything unclear now that you are about to build it?" Pairs flag any confusion.
For any flagged issue: facilitator helps clarify or simplify the problematic section (maximum 3 minutes per pair).
Distribute checkpoint flag cards. Explain: "When your sub-problem passes its test condition — hold up a green flag. I will come and confirm before you proceed to the next."
BUILD BEGINS. Pairs open Stack KIDI. New project. Build strictly in sub-problem order from the specification.
SUB-PROBLEM 1 (10 min): Typically — set up the TITLE SCREEN page: background, character, "tap to start" trigger that navigates to Page 2 (PLAYING state). When complete and tested: hold up green flag.
SUB-PROBLEM 2 (10 min): Typically — build the PLAYING state: the core game mechanic (tap trigger, score variable, character feedback loop). When complete and tested: hold up green flag.
CHECKPOINT at 20 minutes: Facilitator records each pair's progress (green flags received). Any pair with 0 flags — receives a targeted 3-minute support session.
SUB-PROBLEM 3 (10 min): Typically — build the WIN SCREEN state: a page triggered when the score variable reaches the win condition. A celebration sequence on the WIN page. "Tap to replay" returns to PLAYING.
SUB-PROBLEM 4 (8 min): Typically — polish the connections: ensure Wait blocks are correctly timed, sounds match each state, backgrounds are visually different per state.
Any deviation from specification: record in the Deviation Log before continuing.
Final full-game test (6 min): play from Title Screen through to WIN SCREEN and back to PLAYING. Confirm the complete state loop works.
Pairs compare their finished game to the specification: "Which 4 success criteria are met? Any not yet met?"
Read the Deviation Log: "Was every change justified? Does the final game still match the intended concept?"
Brief class discussion: "Did anyone build exactly what they specified — zero deviations? Did anyone make 3 or more changes? Which approach produced a better game?"
Save game as "GAME BUILD — [Pair Names]."
Count green flags received during the session: ___/4.
Calculate progress percentage. Record on sub-problem test checklist.
Preview: "Next lesson — we bring in real players to playtest the game, collect feedback, and make final improvements before Demo Day."
```

### Plan header and sections

```
ISOMA EDUTECH LIMITED
Stack KIDI Lesson Plan  ·  DDD Framework
Stage 2  (P2 · Cambridge Stage 2 / Year 2)
Lesson 14  ·  Term 2 · Week 6
Build the Game — Sub-Problem by Sub-Problem
Duration
60 minutes
Term / Week
Term 2 · Week 6
Age Range
7–8 years
Group Size
8 learners  (pair programming — 4 pairs)
Hardware
Tablets with Stack KIDI App
Bloom's
L4 Analyse · L5 Evaluate · L6 Create
NCDC
Uganda NCDC Thematic Curriculum P2 — Numeracy: Multi-step problem solving; systematic building and testing; Literacy: Following a complex written specification to produce a functional output — the same skill as following a technical manual
Cambridge
Cambridge Primary Computing 0845 — Stage 2: Implementing a complete programme from a specification; using decomposition to manage complexity; applying systematic testing at each stage; combining all taught concepts — variables, messages, wait blocks, loops, triggers, and page transitions — in a single coherent game
DDD Phase
DELIVER — Learners implement their game specification document from Lesson 13, building sub-problem by sub-problem with checkpoint testing at each stage
Big Idea
The specification document is the architect's blueprint. The programmer's job is to build exactly what is on the blueprint — no more, no less. A programme that matches its specification is a success, even if it is simple.
LEARNING OBJECTIVES
MATERIALS AND PREPARATION
⚠  Facilitator Preparation Note:
CHECKPOINT MANAGEMENT: The green flag card system requires active monitoring. Circulate every 5 minutes. Any pair that has been stuck on the same sub-problem for more than 10 minutes needs intervention. Common blockers at this stage: ① Page transitions not firing (check the trigger block is at END of the sequence) ② Score variable not resetting (check Reset programme runs before game starts) ③ WIN state trigger not matching score variable (check the condition value matches the game's win condition number).
CROSS-CURRICULAR LINKS
English
Following instructions precisely vs. adapting them: "A builder follows plans exactly — unless something is impossible, in which case they change the plan and document it." Learners must write in the Deviation Log if they change anything from the specification. Vocabulary: implement, specification, deviate, justify, document, adapt, evidence, precision.
Maths
Progress tracking: at the 20-minute checkpoint, pairs count: sub-problems complete / in progress / not started. Calculate completion percentage: (complete ÷ 4) × 100 = ___%. At end of session: same calculation. Compare start and end percentages. Calculate rate of progress: "We completed ___ sub-problems in 40 minutes, so each sub-problem took approximately ___ minutes on average."
LESSON STRUCTURE
HOOK — The Blueprint Check (7 min)
DELIVER — Build Sprint (44 min)
DISCOVER — Specification vs Reality (5 min)
WRAP-UP (4 min)
ASSESSMENT
Formative (During)
Green flags received: target 4/4 for full credit; 3/4 = satisfactory; below 3 = requires Term 3 follow-up
Checkpoint at 20 min: at least 2 sub-problems tested (facilitator recorded)
Deviation Log completed for any change from specification
Full game loop functional: Title → Playing → Win → Replay (facilitator final test)
Exit / Summative
Facilitator runs each game and confirms: ① Title Screen loads ② Core mechanic works ③ Win condition triggers the WIN state ④ Replay works. Score 4/4 = Demo Day ready; 3/4 = one fix needed; below 3 = additional support time before Demo Day.
Differentiation
Support: Reduce to 2 sub-problems (Playing state only — no Title Screen or WIN state). This still produces a functional game. Extension: Add a LOSE state — programme a 30-second timer using a chain of Wait blocks; if the timer expires before the win condition is reached, a LOSE page transitions in. Implement and test the full 4-state loop.
KEY VOCABULARY
implement   ·   specification   ·   sub-problem   ·   state   ·   transition   ·   deviate   ·   checkpoint   ·   justify   ·   test condition   ·   loop
⚠  Safeguarding Note: During extended build sprints, monitor for signs of frustration. Remind learners: "A partially working game is not a failure — it is a work in progress. Every professional programmer has an unfinished build at some point."
Facilitator Name:
________________________
Date Delivered:
________________________
Signature:
________________________
```
