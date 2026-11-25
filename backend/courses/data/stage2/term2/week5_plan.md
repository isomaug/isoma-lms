# Lesson 13  ·  Term 2 · Week 5

**Duration:** 60 minutes (split across Week 5 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 2 · Week 5
**Age Range:** 7–8 years
**Hardware:** Tablets with Stack KIDI App
**Bloom's:** L4 Analyse · L5 Evaluate · L6 Create

**Big Idea:** Every game has STATES: a state is the current condition of the game — Playing, Won, Lost, or Paused. When the player does something or a condition is reached, the game TRANSITIONS from one state to another. Designing the states first makes building the game far easier.

**Source plan:** `Stage2_Lesson13_Term2_Week5.docx`

## Learning Objectives

- Define a game "state" and identify at least 3 states in a given example game (Start, Playing, Won)
- Draw a state transition diagram showing all states and the triggers that move the game between them
- Write a complete game specification document including: title, character(s), 3 states, 3 transitions, success criteria (4 items), and a decomposition of 4 sub-problems
- Peer-review a partner pair's specification for completeness and testability

## Materials and Preparation

- 4 tablets with Stack KIDI — available but NOT used today (pure design session)

## Cross-Curricular Links

**English:** Game specification as technical writing: formal, precise, written for an audience who will BUILD the game (not just play it). Learners must write in complete sentences in the specification document. Peer review tests whether the writing is clear enough to follow independently. Vocabulary: specification, state, transition, trigger, condition, criteria, testable, complete, precise.

**Maths:** State transition diagrams as directed graphs: count the number of states (nodes) and transitions (arrows). Is there a path from every state to every other state? Introduce graph theory concept informally: "A game that can be won but never replayed has a missing transition." Learners check: "Can the player get back to PLAYING from WIN SCREEN?"

## Lesson Structure

### HOOK — The Traffic Light Game (8 min)
1. State Transition Diagram template (A4 per pair): 5 oval shapes (states) with directional arrows between them; each arrow has a label box for the trigger
2. Game Specification Document (A3 per pair, folded into A4): 6 sections — Title + Concept / Characters (max 2) / States (3) / Transitions (3) / Success Criteria (4) / Decomposition (4 sub-problems)
3. Example game state diagram (A3 poster, displayed): a simple "catch the star" game showing: TITLE SCREEN → [tap to start] → PLAYING → [score reaches 5] → WIN SCREEN → [tap to replay] → PLAYING
4. Specification peer-review card (A5): 5 checkboxes — ☐ 3 states clearly named ☐ 3 transitions with triggers ☐ 4 testable success criteria ☐ 4 decomposed sub-problems ☐ Could I build this without asking questions?
5. Game concept inspiration cards (8 cards): brief game ideas to spark creativity — learners may use or ignore these
6. Describe the states of a traffic light: RED (cars stopped), AMBER (prepare), GREEN (cars move), AMBER again (prepare to stop). "These are four states. The trigger that moves between them is TIME."

### DESIGN — State Transition Diagram (12 min)
7. Show the example game state diagram poster. Walk through each state and transition aloud.
8. Class identifies: "What is the WIN state in a football match? What triggers the transition to WIN? What happens if no goal is scored — is there a DRAW state? What triggers DRAW?"
9. Bridge: "Today we design a game with at least 3 states. No coding today — pure thinking and planning. The best games are designed carefully before a single block is added."
10. Distribute State Transition Diagram templates. Inspiration cards available but optional.
11. Step 1 (3 min): Name the game and choose up to 2 characters.
12. Step 2 (5 min): Draw 3 states in the ovals: TITLE SCREEN, PLAYING, and WIN (minimum). Optional extras: LOSE, LEVEL 2, PAUSED.

### DELIVER — Game Specification Document (28 min)
13. Step 3 (4 min): Add directional arrows. For each arrow, write the trigger in the label box: "tap to start", "score reaches 5", "timer runs out", "tap to replay".
14. Facilitator reviews all diagrams: "Is there a clear path from TITLE SCREEN to WIN? Can the player replay? Is every transition triggered by something specific?"
15. Open Game Specification Documents. Transfer the state diagram into Section 3 (States) and Section 4 (Transitions).
16. Section 1 — Title and Concept (4 min): Write the game title and a 2-sentence concept description: "In this game, the player ___. The goal is to ___."
17. Section 2 — Characters (3 min): Name and describe both characters (if applicable). Write one sentence about each character's role in the game.

### DISCOVER — Specification Peer Review (8 min)
18. Section 5 — Success Criteria (8 min): Write 4 testable success criteria. Each must be specific enough to verify by running the game: e.g. "Tapping the hero character 5 times triggers the WIN state" — not "the game is fun." Facilitator checks each criterion: "How would I test this?"
19. Section 6 — Decomposition (10 min): Break the full game into 4 sub-problems. For each: name it, list the blocks needed, write the test condition. Base this on experience from Lesson 11.
20. Facilitator approves completed specification: "Could another programmer build this game from your document without asking you any questions?" Sign off with initials and date.
21. Pairs swap specification documents with the adjacent pair. Complete the peer-review card (5 checkboxes).
22. Return documents. Read the peer review. Address any unticked box: rewrite that section to make it clearer.

### WRAP-UP (4 min)
23. Class: one pair presents their state diagram (not the full spec) to the class in 60 seconds. Class checks: "Can I follow the game flow from this diagram?"
24. Reflection: "Why is designing completely before coding better than just starting to build?" Pairs write one reason each.
25. File specification documents safely — they will be used as the BUILD brief next lesson.
26. Preview: "Next lesson — we start coding. The specification document is your blueprint. Every sub-problem will be built and tested before the next one begins."
27. Collect peer-review cards. Facilitator reviews all specifications overnight — flag any that need a simplification before next lesson.

## Assessment

- Formative (During)
- State transition diagram: 3+ states, 3+ transitions with named triggers
- Game specification: all 6 sections completed (facilitator sign-off)
- 4 success criteria testable by running the programme (facilitator checks each)
- Peer review: 5/5 checkboxes ticked by peer, or revisions made to reach 5/5
- Exit / Summative
- Facilitator holds up one success criterion from each pair's document. "How would I test this? What would I see when I run the game?" Learner must describe a concrete observable outcome. Vague criteria are revised on the spot.
- Differentiation
- Support: Reduce to 2 states and 2 transitions; facilitator assists with decomposition section. Extension: Add a LOSE state with a time-limit trigger. Design the transition back to PLAYING from LOSE (retry mechanic). Write a 2-sentence explanation of why the LOSE state makes the game more challenging.

## Key Vocabulary

_See source._

## Full source extract (complete)

### Detail body

```
Define a game "state" and identify at least 3 states in a given example game (Start, Playing, Won)
Draw a state transition diagram showing all states and the triggers that move the game between them
Write a complete game specification document including: title, character(s), 3 states, 3 transitions, success criteria (4 items), and a decomposition of 4 sub-problems
Peer-review a partner pair's specification for completeness and testability
4 tablets with Stack KIDI — available but NOT used today (pure design session)
State Transition Diagram template (A4 per pair): 5 oval shapes (states) with directional arrows between them; each arrow has a label box for the trigger
Game Specification Document (A3 per pair, folded into A4): 6 sections — Title + Concept / Characters (max 2) / States (3) / Transitions (3) / Success Criteria (4) / Decomposition (4 sub-problems)
Example game state diagram (A3 poster, displayed): a simple "catch the star" game showing: TITLE SCREEN → [tap to start] → PLAYING → [score reaches 5] → WIN SCREEN → [tap to replay] → PLAYING
Specification peer-review card (A5): 5 checkboxes — ☐ 3 states clearly named ☐ 3 transitions with triggers ☐ 4 testable success criteria ☐ 4 decomposed sub-problems ☐ Could I build this without asking questions?
Game concept inspiration cards (8 cards): brief game ideas to spark creativity — learners may use or ignore these
Describe the states of a traffic light: RED (cars stopped), AMBER (prepare), GREEN (cars move), AMBER again (prepare to stop). "These are four states. The trigger that moves between them is TIME."
Show the example game state diagram poster. Walk through each state and transition aloud.
Class identifies: "What is the WIN state in a football match? What triggers the transition to WIN? What happens if no goal is scored — is there a DRAW state? What triggers DRAW?"
Bridge: "Today we design a game with at least 3 states. No coding today — pure thinking and planning. The best games are designed carefully before a single block is added."
Distribute State Transition Diagram templates. Inspiration cards available but optional.
Step 1 (3 min): Name the game and choose up to 2 characters.
Step 2 (5 min): Draw 3 states in the ovals: TITLE SCREEN, PLAYING, and WIN (minimum). Optional extras: LOSE, LEVEL 2, PAUSED.
Step 3 (4 min): Add directional arrows. For each arrow, write the trigger in the label box: "tap to start", "score reaches 5", "timer runs out", "tap to replay".
Facilitator reviews all diagrams: "Is there a clear path from TITLE SCREEN to WIN? Can the player replay? Is every transition triggered by something specific?"
Open Game Specification Documents. Transfer the state diagram into Section 3 (States) and Section 4 (Transitions).
Section 1 — Title and Concept (4 min): Write the game title and a 2-sentence concept description: "In this game, the player ___. The goal is to ___."
Section 2 — Characters (3 min): Name and describe both characters (if applicable). Write one sentence about each character's role in the game.
Section 5 — Success Criteria (8 min): Write 4 testable success criteria. Each must be specific enough to verify by running the game: e.g. "Tapping the hero character 5 times triggers the WIN state" — not "the game is fun." Facilitator checks each criterion: "How would I test this?"
Section 6 — Decomposition (10 min): Break the full game into 4 sub-problems. For each: name it, list the blocks needed, write the test condition. Base this on experience from Lesson 11.
Facilitator approves completed specification: "Could another programmer build this game from your document without asking you any questions?" Sign off with initials and date.
Pairs swap specification documents with the adjacent pair. Complete the peer-review card (5 checkboxes).
Return documents. Read the peer review. Address any unticked box: rewrite that section to make it clearer.
Class: one pair presents their state diagram (not the full spec) to the class in 60 seconds. Class checks: "Can I follow the game flow from this diagram?"
Reflection: "Why is designing completely before coding better than just starting to build?" Pairs write one reason each.
File specification documents safely — they will be used as the BUILD brief next lesson.
Preview: "Next lesson — we start coding. The specification document is your blueprint. Every sub-problem will be built and tested before the next one begins."
Collect peer-review cards. Facilitator reviews all specifications overnight — flag any that need a simplification before next lesson.
```

### Plan header and sections

```
ISOMA EDUTECH LIMITED
Stack KIDI Lesson Plan  ·  DDD Framework
Stage 2  (P2 · Cambridge Stage 2 / Year 2)
Lesson 13  ·  Term 2 · Week 5
Interactive Game Design — Rules, States, and Winning Conditions
Duration
60 minutes
Term / Week
Term 2 · Week 5
Age Range
7–8 years
Group Size
8 learners  (pair programming — 4 pairs)
Hardware
Tablets with Stack KIDI App
Bloom's
L4 Analyse · L5 Evaluate · L6 Create
NCDC
Uganda NCDC Thematic Curriculum P2 — Numeracy: Logic and state-based reasoning; tracking changing values across multiple conditions; Literacy: Writing precise game rules that another person can follow without clarification
Cambridge
Cambridge Primary Computing 0845 — Stage 2: Designing and implementing a programme with multiple defined states (playing, winning, losing); using page transitions as state changes; combining variables, messages, wait blocks, and triggers in an integrated interactive system
DDD Phase
DESIGN — Learners apply the full design thinking process to a complete game design, producing a game specification document with states, transitions, and success criteria before any coding begins
Big Idea
Every game has STATES: a state is the current condition of the game — Playing, Won, Lost, or Paused. When the player does something or a condition is reached, the game TRANSITIONS from one state to another. Designing the states first makes building the game far easier.
LEARNING OBJECTIVES
MATERIALS AND PREPARATION
⚠  Facilitator Preparation Note:
OVERNIGHT REVIEW: After this session, read all specification documents. Any pair whose specification is too complex to complete in 3 sessions should have a simplified version ready (prepared by the facilitator) to offer as an alternative start point next lesson. A game with 2 clear states and 4 working sub-problems is better than an incomplete 5-state game.
CROSS-CURRICULAR LINKS
English
Game specification as technical writing: formal, precise, written for an audience who will BUILD the game (not just play it). Learners must write in complete sentences in the specification document. Peer review tests whether the writing is clear enough to follow independently. Vocabulary: specification, state, transition, trigger, condition, criteria, testable, complete, precise.
Maths
State transition diagrams as directed graphs: count the number of states (nodes) and transitions (arrows). Is there a path from every state to every other state? Introduce graph theory concept informally: "A game that can be won but never replayed has a missing transition." Learners check: "Can the player get back to PLAYING from WIN SCREEN?"
LESSON STRUCTURE
HOOK — The Traffic Light Game (8 min)
DESIGN — State Transition Diagram (12 min)
DELIVER — Game Specification Document (28 min)
DISCOVER — Specification Peer Review (8 min)
WRAP-UP (4 min)
ASSESSMENT
Formative (During)
State transition diagram: 3+ states, 3+ transitions with named triggers
Game specification: all 6 sections completed (facilitator sign-off)
4 success criteria testable by running the programme (facilitator checks each)
Peer review: 5/5 checkboxes ticked by peer, or revisions made to reach 5/5
Exit / Summative
Facilitator holds up one success criterion from each pair's document. "How would I test this? What would I see when I run the game?" Learner must describe a concrete observable outcome. Vague criteria are revised on the spot.
Differentiation
Support: Reduce to 2 states and 2 transitions; facilitator assists with decomposition section. Extension: Add a LOSE state with a time-limit trigger. Design the transition back to PLAYING from LOSE (retry mechanic). Write a 2-sentence explanation of why the LOSE state makes the game more challenging.
KEY VOCABULARY
state   ·   transition   ·   trigger   ·   specification   ·   diagram   ·   criteria   ·   testable   ·   decompose   ·   complete   ·   blueprint
⚠  Safeguarding Note: Game states must not involve characters in harmful or distressing situations. LOSE states should be friendly (e.g. "try again" rather than "game over forever"). Design should be inclusive.
Facilitator Name:   _____________________
Date Delivered:   _____________________
Signature:   _____________________
```
