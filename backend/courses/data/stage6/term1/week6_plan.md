# Lesson 6: Thinking Machines — Introduction to AI & Pattern Recognition

**Duration:** 3 hours (Term-time Saturday) (split across Week 6 Lesson 1 start + Lesson 2 finish)
**Term / Week:** Term 1 · Week 6
**Age Range:** 10–12 years
**Hardware:** Arduino Uno, USB cable (optional — for extension activity)
**Software:** Arduino IDE 2.x (optional extension). No hardware required for core session.
**Bloom's:** L4 Analysing
**DDD Phase:** ANALYSE — Learners explore AI concepts through discussion, an unplugged card-sorting activity, a reading comprehension task, and a structured written summary
**NCDC:** Uganda NCDC Curriculum P5/P6 — Literacy Strand: Reading comprehension, summarising key ideas in own words (min. 100 words); Numeracy Strand: Classification, probability, fractions and percentages

**Big Idea:** ILO 3.3 — Analyse foundational AI concepts including pattern recognition, data classification, and rule-based decision-making, connecting these to examples in their own coded projects.

**Source plan:** `Stage6_Week6_Introduction_to_AI.docx`

## Learning Objectives

- Define the terms: artificial intelligence, machine learning, training data, pattern recognition, classification, prediction
- Sort 20 picture cards into categories using a self-chosen rule, explaining the rule in plain English — mirroring how a classification AI works
- Read a provided article about a real-world AI application and write a summary of minimum 150 words in own words
- Identify one benefit and one concern about the AI application described in the article
- Connect at least one AI concept (pattern recognition, classification, or rule-based decision) to a coding project from Weeks 1–5
- Calculate the probability that a randomly chosen card belongs to a given category, expressed as a fraction and percentage

## Materials and Preparation

_See source._

## Cross-Curricular Links

## Lesson Structure

### 1. HOOK You Are the AI
1. Scatter 20 picture cards face-up on the table. Ask: "Sort these into groups. You have 2 minutes. Do not discuss — just sort."
2. After sorting: "Now explain your rule to your partner." Observe: different pairs use different rules. This is the key insight.
3. Ask: "If I gave you 1,000 more cards, could you sort them using your rule?" Yes — that is exactly what an AI classifier does.
4. Introduce key vocabulary: pattern recognition, training data, classification, prediction. Write on board with one-line plain English definitions.
5. Real-world examples: "When your phone unlocks with your face — which of these concepts does that use?" Discuss. "When Spotify suggests a song — which concept?" Discuss.
6. Distribute AI Concept Connection Card. Learners write one connection to their own coding work from the last 5 weeks. Share with partner.
### 2. GUIDED ACTIVITY Read, Discuss & Classify
7. Step 1 (15 min): Distribute the AI Article. Learners read independently — silently, no discussion. Facilitator circulates and ensures all learners have read fully.
8. Step 2 (10 min): Class discussion — facilitator asks: "What does this AI do? How does it know what to do? Who trained it? Who benefits? Who might be harmed?"
9. Step 3 (5 min): Probability activity — count the cards in each category from the sorting task. Calculate probability as a fraction and percentage for 2 categories. Record on mini whiteboard.
10. Step 4 (20 min): Begin Summary Writing Frame. Learners write the first 3 sections independently: What the AI does, How it was trained, One benefit. Minimum 2 full sentences per section.
11. Step 5 (10 min): Pair share — swap frames with partner. Partner reads and gives one piece of feedback: "I think you should add more detail about…"
### 3. INDEPENDENT / PAIR WORK Write, Connect & Debate
12. Task 1 (25 min): Complete the Summary Writing Frame — all 5 sections. Minimum total 150 words. Facilitator circulates: check that learners are not copying from the article. Prompt: "Say it in your own words."
13. Task 2 (15 min): Complete the AI Concept Connection Card. Three prompts: (1) Which AI concept connects to your Week 5 LDR sensor work? (e.g. the sensor collecting training data) (2) Which connects to Week 4 sorting algorithm? (e.g. classification) (3) If you were going to train an AI to do one thing in Uganda, what would it be and why?
14. Task 3 — Class Debate (10 min): Facilitator poses question: "Should AI be allowed to make decisions about people's lives?" Learners choose a side and give one reason. Facilitator records contributions on the board — this forms the participation log entry.
15. Extension: Write a simple rule-based AI in Arduino pseudocode — 5 if/else rules that classify a sensor reading as one of 3 categories. No coding needed — pseudocode only.
### 4. SHOWCASE & DEBRIEF
16. 2 learners read their "What the AI does" paragraph aloud. Class checks: Is it in their own words? Does it explain clearly?
17. Probability check: one pair shares their fraction and percentage. Class verifies calculation.
18. Facilitator asks: "What is the difference between a computer following an if/else rule and an AI learning from data?" Allow 3 responses — this is a key analytical question from ILO 3.3.
19. AI Connection review: facilitator reads out 2 AI Concept Connection Card answers. Discuss: "Is that a fair connection? Why?"
20. English close: "The best summaries showed the writer understood the article — they explained it differently from the original. Copying is not understanding."
21. Collect Summary Writing Frames and AI Concept Connection Cards as this week's artifact (the written summary).

## Assessment

- Evidence Required
- Formative (During)
- Class discussion: facilitator logs meaningful contributions from each learner during the AI discussion and debate. AI Concept Connection Card completed with specific, reasoned connections.
- Facilitator participation log (3-point scale: 1=passive, 2=contributed, 3=led discussion).
- Week 6 Artifact
- Completed Summary Writing Frame: all 5 sections, minimum 150 words total, all in learner's own words. No direct copying from article. Benefit and concern both identified with explanation.
- Written document collected. Scored against 5-point artifact rubric (DDD Part 8.3).
- Differentiation
- Support: reduce summary to 100 words; provide sentence starters for each section. Extension: rule-based AI pseudocode with 5 classification rules. Debate: structured argument with evidence.
- Extension pseudocode submitted. Participation log entry for debate contribution.

## Key Vocabulary

artificial intelligence · machine learning · training data · pattern recognition · classification · prediction · algorithm · bias · probability · fraction · percentage · rule-based · dataset Date Delivered: Signature:

## Safeguarding

AI discussion must remain respectful and age-appropriate. If learners raise facial recognition or surveillance examples, acknowledge them thoughtfully. Do not use real names of classmates in classification examples. This lesson connects to digital citizenship — frame AI as a tool made by people, with human responsibilities.

## Full source extract (complete)

```
Artificial Intelligence, Pattern Recognition & Classification
LEARNING OBJECTIVES
• Define the terms: artificial intelligence, machine learning, training data, pattern recognition, classification, prediction
• Sort 20 picture cards into categories using a self-chosen rule, explaining the rule in plain English — mirroring how a classification AI works
• Read a provided article about a real-world AI application and write a summary of minimum 150 words in own words
• Identify one benefit and one concern about the AI application described in the article
• Connect at least one AI concept (pattern recognition, classification, or rule-based decision) to a coding project from Weeks 1–5
• Calculate the probability that a randomly chosen card belongs to a given category, expressed as a fraction and percentage
MATERIALS & PREPARATION
• Printed AI Picture Cards × 4 sets — 20 cards per set showing: animals, vehicles, food, tools, natural objects (A6 size, laminated)
• Printed "AI Article" × 8 copies — a 300–400 word article about an AI application relevant to East Africa (e.g. AI in crop disease detection, medical diagnosis, or traffic management)
• Printed "Summary Writing Frame" — structured template with: What the AI does, How it was trained, One benefit, One concern, My opinion (A4 per learner)
• Printed "AI Concept Connection Card" — half-page card with 3 prompts connecting AI to prior coding work (A5 per learner)
• Mini whiteboards or paper for probability calculations
• Facilitator projected screen — display sorting activity and discussion prompts
CROSS-CURRICULAR LINKS
LESSON STRUCTURE  (3 hours · Term-time Saturday)
ASSESSMENT
FACILITATOR RECORD
ISOMA EDUTECH LIMITED  AI Engineers Programme · Stage 5–6 · Arduino
Lesson 6: Thinking Machines — Introduction to AI & Pattern Recognition
Duration
3 hours (Term-time Saturday)
Term / Week
Term 1 · Week 6
Age Range
10–12 years
Group Size
8 learners (4 pairs — pair programming)
Hardware
Arduino Uno, USB cable (optional — for extension activity)
Software / IDE
Arduino IDE 2.x (optional extension). No hardware required for core session.
Bloom's Level
L4 Analysing
DDD Phase
ANALYSE — Learners explore AI concepts through discussion, an unplugged card-sorting activity, a reading comprehension task, and a structured written summary
NCDC Ref
Uganda NCDC Curriculum P5/P6 — Literacy Strand: Reading comprehension, summarising key ideas in own words (min. 100 words); Numeracy Strand: Classification, probability, fractions and percentages
Cambridge Ref
Cambridge Primary Computing 0845 — Stage 6: Introduction to AI concepts; Data classification; Computing and society
Intended Learning Outcome (ILO)
Big Idea
ILO 3.3 — Analyse foundational AI concepts including pattern recognition, data classification, and rule-based decision-making, connecting these to examples in their own coded projects.
Artificial Intelligence is not magic — it is pattern recognition at scale. A machine learns by looking at thousands of examples and finding rules. That is exactly what you do when you sort data.
English Literacy Thread
Mathematics Thread
Reading comprehension of a real AI article: learners read independently, then write a summary of minimum 150 words in their own words — no copying from the article. The Summary Writing Frame structures the response: What the AI does (paragraph 1), How it was trained (paragraph 2), One benefit (paragraph 3), One concern (paragraph 4), Personal opinion with justification (paragraph 5). Explicit instruction: summarising means rewriting the key ideas in your own sentence structures — paraphrasing, not copying. Critical literacy: "Can AI make mistakes? Why? What happens when it gets it wrong?"
Classification activity: sort 20 cards by 3 simultaneous rules (e.g. living AND small AND found in Uganda). Count how many cards belong to each category. Probability: if 6 of the 20 cards belong to Category A, the probability of randomly choosing one = 6/20 = 3/10 = 30%. Calculate for 2 further categories. Discuss: what does a higher probability mean for an AI classifier — more confident? Is that always correct?
Phase
Time
Activities & Facilitator Actions
1. HOOK You Are the AI
20 min
• Scatter 20 picture cards face-up on the table. Ask: "Sort these into groups. You have 2 minutes. Do not discuss — just sort."
• After sorting: "Now explain your rule to your partner." Observe: different pairs use different rules. This is the key insight.
• Ask: "If I gave you 1,000 more cards, could you sort them using your rule?" Yes — that is exactly what an AI classifier does.
• Introduce key vocabulary: pattern recognition, training data, classification, prediction. Write on board with one-line plain English definitions.
• Real-world examples: "When your phone unlocks with your face — which of these concepts does that use?" Discuss. "When Spotify suggests a song — which concept?" Discuss.
• Distribute AI Concept Connection Card. Learners write one connection to their own coding work from the last 5 weeks. Share with partner.
2. GUIDED ACTIVITY Read, Discuss & Classify
60 min
• Step 1 (15 min): Distribute the AI Article. Learners read independently — silently, no discussion. Facilitator circulates and ensures all learners have read fully.
• Step 2 (10 min): Class discussion — facilitator asks: "What does this AI do? How does it know what to do? Who trained it? Who benefits? Who might be harmed?"
• Step 3 (5 min): Probability activity — count the cards in each category from the sorting task. Calculate probability as a fraction and percentage for 2 categories. Record on mini whiteboard.
• Step 4 (20 min): Begin Summary Writing Frame. Learners write the first 3 sections independently: What the AI does, How it was trained, One benefit. Minimum 2 full sentences per section.
• Step 5 (10 min): Pair share — swap frames with partner. Partner reads and gives one piece of feedback: "I think you should add more detail about…"
3. INDEPENDENT / PAIR WORK Write, Connect & Debate
50 min
• Task 1 (25 min): Complete the Summary Writing Frame — all 5 sections. Minimum total 150 words. Facilitator circulates: check that learners are not copying from the article. Prompt: "Say it in your own words."
• Task 2 (15 min): Complete the AI Concept Connection Card. Three prompts: (1) Which AI concept connects to your Week 5 LDR sensor work? (e.g. the sensor collecting training data) (2) Which connects to Week 4 sorting algorithm? (e.g. classification) (3) If you were going to train an AI to do one thing in Uganda, what would it be and why?
• Task 3 — Class Debate (10 min): Facilitator poses question: "Should AI be allowed to make decisions about people's lives?" Learners choose a side and give one reason. Facilitator records contributions on the board — this forms the participation log entry.
• Extension: Write a simple rule-based AI in Arduino pseudocode — 5 if/else rules that classify a sensor reading as one of 3 categories. No coding needed — pseudocode only.
4. SHOWCASE & DEBRIEF
30 min
• 2 learners read their "What the AI does" paragraph aloud. Class checks: Is it in their own words? Does it explain clearly?
• Probability check: one pair shares their fraction and percentage. Class verifies calculation.
• Facilitator asks: "What is the difference between a computer following an if/else rule and an AI learning from data?" Allow 3 responses — this is a key analytical question from ILO 3.3.
• AI Connection review: facilitator reads out 2 AI Concept Connection Card answers. Discuss: "Is that a fair connection? Why?"
• English close: "The best summaries showed the writer understood the article — they explained it differently from the original. Copying is not understanding."
• Collect Summary Writing Frames and AI Concept Connection Cards as this week's artifact (the written summary).
Component
Description
Evidence Required
Formative (During)
Class discussion: facilitator logs meaningful contributions from each learner during the AI discussion and debate. AI Concept Connection Card completed with specific, reasoned connections.
Facilitator participation log (3-point scale: 1=passive, 2=contributed, 3=led discussion).
Week 6 Artifact
Completed Summary Writing Frame: all 5 sections, minimum 150 words total, all in learner's own words. No direct copying from article. Benefit and concern both identified with explanation.
Written document collected. Scored against 5-point artifact rubric (DDD Part 8.3).
Differentiation
Support: reduce summary to 100 words; provide sentence starters for each section. Extension: rule-based AI pseudocode with 5 classification rules. Debate: structured argument with evidence.
Extension pseudocode submitted. Participation log entry for debate contribution.
KEY VOCABULARY
artificial intelligence · machine learning · training data · pattern recognition · classification · prediction · algorithm · bias · probability · fraction · percentage · rule-based · dataset
Safeguarding Note
AI discussion must remain respectful and age-appropriate. If learners raise facial recognition or surveillance examples, acknowledge them thoughtfully. Do not use real names of classmates in classification examples. This lesson connects to digital citizenship — frame AI as a tool made by people, with human responsibilities.
Facilitator Name:
____________________________
Date Delivered:
____________________________
Signature:
____________________________
```
