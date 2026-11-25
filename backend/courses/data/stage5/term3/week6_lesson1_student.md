# Week 6 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Identify and explain three AI ethics frameworks: Fairness (equal treatment across groups), Accountability (human oversight of algorithmic decisions), and Transparency (explainability of how decisions are made) — using examples drawn from the learner's own classifier built in T3 Week 4
- Analyse two provided real-world AI case studies set in an African/Ugandan context and evaluate each against the three ethics frameworks, identifying which principles are upheld and which are violated
- Write a formal position paper of minimum 250 words arguing for a specific AI governance recommendation addressed to a named Ugandan decision-maker (e.g. the Uganda Communications Commission, a hospital director, a school head teacher)
- Structure the position paper in a 6-part academic format: (1) Executive Summary (2–3 sentences), (2) Background and Context, (3) Analysis of the Problem using at least one ethics framework, (4) Evidence (citing both the provided case studies and the learner's own T3 W4 classifier experience), (5) Recommendation (specific, actionable, addressed to the named decision-maker), (6) Conclusion

## Big idea
Being able to build an AI system is powerful. Being able to decide whether it should be built — and how it should be constrained — is wisdom. The most important engineering skill is knowing when to say no, and being able to explain why.

## Links to English and Maths
- **English:** The formal position paper is the most demanding writing task in the programme — it requires command of a 6-part academic structure, evidence from two external sources and one first-hand experience, application of a conceptual framework (the three AI ethics principles), and a specific actionable recommendation. The Executive Summary section — 2–3 sentences that capture the entire argument — is one of the hardest writing tasks at any level: it requires complete conceptual clarity and maximum precision. The Recommendation section must be specific: not "AI should be used carefully" but "The Uganda Communications Commission should require that any AI system used in public service delivery must publish a quarterly accuracy report showing precision and recall broken down by gender, location, and income group." This standard of writing — policy recommendation language — appears in government submissions, NGO reports, and academic policy papers. The peer review rubric requires written comments on every criterion — not scores alone.
- **Maths:** Quantitative connection in position papers — a requirement, not optional: every position paper must cite at least one specific number from the learner's own programme work. The T3 W4 classifier evaluation produced accuracy, precision, and recall figures. You calculate the real-world implication of their accuracy figure: if accuracy = 70% and the system makes 100 decisions per day, 30 decisions per day are wrong. Over one year: 30 × 365 = 10,950 incorrect automated decisions. At this scale, even a "good" classifier causes significant harm if the decisions are consequential. Fairness metric: if yourselfifier correctly classifies 80% of COMFORTABLE readings but only 50% of DIM readings, the recall gap = 80% − 50% = 30 percentage points. A 30-point recall gap between classes is prima facie evidence of unfairness — directly calculable from the confusion matrix built in T3 W4.

## Let's begin

### WARM-UP & REVIEW — From Builder to Critic  (20 min)
1. Connect the position paper argument explicitly to a quantitative finding from the learner's own programme work: e.g. "Our classifier from T3 Week 4 achieved 70% accuracy — meaning 30% of environmental classifications were wrong. If an AI system with this accuracy were used to automatically control hospital ventilation, 3 in every 10 automated decisions would be incorrect."
2. Peer-review a partner's position paper using a 5-criterion academic rubric: Argument clarity, Evidence quality, Ethics framework application, Quantitative connection, Recommendation specificity
3. 4 laptops (for research if internet available; if not, all materials are printed)
4. Printed "AI Ethics Framework Card" (A5 for you) — Fairness, Accountability, Transparency defined with 2 examples each; space for learner to add your own example from their T3 W4 classifier
5. Printed "Case Study Cards" (A4 for you) — 2 Uganda/Africa-context AI case studies: (1) An AI used to predict loan default risk for smallholder farmers in Uganda, trained on urban financial data; (2) An AI used to screen job applications for a Kampala technology company, trained on CVs from applicants who attended international schools only
6. Printed "Position Paper Template" (A4, 2 pages for you) — 6 labelled sections with minimum sentence counts and guiding questions for each section
7. Printed "Academic Peer Review Rubric" (A4 for you) — 5 criteria, 4-point scale, space for specific written comments and a final overall recommendation
8. Printed "Decision-Maker Reference List" (A5 for you) — 8 named decision-makers with their role and jurisdiction: Uganda Communications Commission, Ministry of Health Uganda, Kampala Capital City Authority, National Curriculum Development Centre, etc.

### GUIDED ACTIVITY — Case Study Analysis and Position Paper Planning  (60 min)
9. USB flash drives
10. A computer screen to follow along
11. You opens with a direct statement: "You have now built three AI classifiers across this programme. You have measured their accuracy. You know their limitations. Today you stop being the engineer and become the ethicist. The question is not 'can this system work?' — you already know it can. The question is 'should it be used, and under what conditions?'"
12. Introduce the three ethics frameworks on the board: FAIRNESS — does the system treat all groups equally? (Connect to the DIM class recall gap from T3 W4.) ACCOUNTABILITY — can a human override or audit the system's decisions? (Connect to the STOP command in the T3 W5 data logger.) TRANSPARENCY — can the system explain why it made each decision? (Connect to the nested if/else classifier — it can explain every decision because every rule is explicit.)
13. Get ready to use the ethics framework card. You read the definitions and examples (3 min), then independently write your own example from their T3 W4 classifier in the blank space at the bottom of the card. "Name one specific violation of the Fairness principle in your T3 W4 classifier, using your confusion matrix data as evidence."
14. Get ready to use the case study cards. You read both case studies silently (4 min). Ask: "Which ethics principle is most clearly violated in Case Study 1? Which in Case Study 2? Are they the same principle or different ones?" Take responses from 3 you. Do not resolve — frame as preparation for the analytical argument to follow.
15. Case study structured analysis (20 min): you analyse both case studies in writing using the ethics frameworks. For each case study: (1) Name the AI system and its purpose. (2) Identify the training data source and its limitation. (3) Apply each of the 3 ethics frameworks — state specifically which principle is upheld and which is violated, with evidence from the case study text. (4) Calculate one quantitative implication: if the loan-default AI is 65% accurate and 1,000 farmers apply per year, how many creditworthy farmers are incorrectly denied a loan? (350.) Write the calculation.

## Save your progress
Keep your sketch, notes, and worksheets ready for Lesson 2, where you will finish this week's activities and check your learning.

## All Lesson 1 steps (complete list)

1. Connect the position paper argument explicitly to a quantitative finding from the learner's own programme work: e.g. "Our classifier from T3 Week 4 achieved 70% accuracy — meaning 30% of environmental classifications were wrong. If an AI system with this accuracy were used to automatically control hospital ventilation, 3 in every 10 automated decisions would be incorrect."
2. Peer-review a partner's position paper using a 5-criterion academic rubric: Argument clarity, Evidence quality, Ethics framework application, Quantitative connection, Recommendation specificity
3. 4 laptops (for research if internet available; if not, all materials are printed)
4. Printed "AI Ethics Framework Card" (A5 for you) — Fairness, Accountability, Transparency defined with 2 examples each; space for learner to add your own example from their T3 W4 classifier
5. Printed "Case Study Cards" (A4 for you) — 2 Uganda/Africa-context AI case studies: (1) An AI used to predict loan default risk for smallholder farmers in Uganda, trained on urban financial data; (2) An AI used to screen job applications for a Kampala technology company, trained on CVs from applicants who attended international schools only
6. Printed "Position Paper Template" (A4, 2 pages for you) — 6 labelled sections with minimum sentence counts and guiding questions for each section
7. Printed "Academic Peer Review Rubric" (A4 for you) — 5 criteria, 4-point scale, space for specific written comments and a final overall recommendation
8. Printed "Decision-Maker Reference List" (A5 for you) — 8 named decision-makers with their role and jurisdiction: Uganda Communications Commission, Ministry of Health Uganda, Kampala Capital City Authority, National Curriculum Development Centre, etc.
9. USB flash drives
10. A computer screen to follow along
11. You opens with a direct statement: "You have now built three AI classifiers across this programme. You have measured their accuracy. You know their limitations. Today you stop being the engineer and become the ethicist. The question is not 'can this system work?' — you already know it can. The question is 'should it be used, and under what conditions?'"
12. Introduce the three ethics frameworks on the board: FAIRNESS — does the system treat all groups equally? (Connect to the DIM class recall gap from T3 W4.) ACCOUNTABILITY — can a human override or audit the system's decisions? (Connect to the STOP command in the T3 W5 data logger.) TRANSPARENCY — can the system explain why it made each decision? (Connect to the nested if/else classifier — it can explain every decision because every rule is explicit.)
13. Get ready to use the ethics framework card. You read the definitions and examples (3 min), then independently write your own example from their T3 W4 classifier in the blank space at the bottom of the card. "Name one specific violation of the Fairness principle in your T3 W4 classifier, using your confusion matrix data as evidence."
14. Get ready to use the case study cards. You read both case studies silently (4 min). Ask: "Which ethics principle is most clearly violated in Case Study 1? Which in Case Study 2? Are they the same principle or different ones?" Take responses from 3 you. Do not resolve — frame as preparation for the analytical argument to follow.
15. Case study structured analysis (20 min): you analyse both case studies in writing using the ethics frameworks. For each case study: (1) Name the AI system and its purpose. (2) Identify the training data source and its limitation. (3) Apply each of the 3 ethics frameworks — state specifically which principle is upheld and which is violated, with evidence from the case study text. (4) Calculate one quantitative implication: if the loan-default AI is 65% accurate and 1,000 farmers apply per year, how many creditworthy farmers are incorrectly denied a loan? (350.) Write the calculation.
