# Week 2 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Build a complete sub-system from the Lesson 17 Sub-system Design Strip, achieving all 2 sub-system-specific success criteria
- Test the sub-system in isolation before attempting integration
- Integrate Sub-system A and Sub-system B onto a single tablet, connecting them via the defined interface
- Identify and document any integration error (an error that only appears when both parts are combined) and apply the debugging process to fix it

## Big idea
In professional software development, each team builds its part without waiting for the others - because the interface was defined first. When both parts are done, they are combined. If the interface was specified correctly, the integration is smooth. If not, integration reveals the mistakes.

## What you need
- 4 tablets - 2 used per group of 4 (Pair A builds on Tablet 1, Pair B builds on Tablet 2)
- Collaborative Project Briefs from Lesson 17 (you returns)

## Links to English and Maths
- **English:** Technical communication: after building, each pair must explain their sub-system to the other pair in exactly 90 seconds before integration begins. "Our sub-system does ___. It starts when ___. It ends by sending ___. The test condition is ___." This is the verbal equivalent of a technical handover document. Vocabulary: integration, regression, handover, protocol, export, component, standalone, combined.
- **Maths:** Block count tracking: each pair counts the total blocks in their sub-system. After integration, count the total blocks in the combined programme. Combined total should approximately equal Sub-system A blocks + Sub-system B blocks. If fewer blocks than expected - something was lost during integration. This is the integration test.

## Let's begin

### HOOK - The Bridge Analogy (6 min)
1. Sub-system Test Checklist (A5 for you): 2 rows for sub-system-specific criteria + 1 row for "Can this be integrated? Does it END at the correct trigger point?"
2. Integration Log (A5 per group): records each step of the integration process and any integration-specific bugs found
3. Integration protocol card (A5 per group): step-by-step instructions - ① Pair A exports or copies their project to the integration tablet ② Pair B adds their component ③ Run the interface connection ④ Test the full integrated programme
4. Regression test card (A5): "Does Sub-system A still work after integration? YES / NO - if NO, regression bug found."
5. "Two engineering teams build a bridge - one from each side of the river. They use the same specification for the centre joint. When the two halves meet, do they fit?" Show an image of a bridge under construction.
6. "If the specification was exact - perfect fit. If one team measured slightly differently - the bridge does not connect."
7. "Your interface specification from last lesson is the centre joint measurement. Today we find out if it was exact enough."

### DELIVER - Independent Sub-System Build (28 min)
8. Groups review their Collaborative Project Briefs. Re-read the Interface Design Card. Each pair confirms: "Do we understand exactly what our sub-system must send or receive?"
9. You separate to your own tablets. BOTH you build simultaneously - this is the parallel work phase.
10. Each pair follows their Sub-system Design Strip from Lesson 17. Build task by task. Test each task before proceeding (green flag check as in Lesson 14).
11. CRITICAL: at the END of Sub-system A, the final block must be the SEND MESSAGE block (or page-change trigger) that was defined in the Interface Design Card.
12. CRITICAL: at the START of Sub-system B, the first trigger must be the RECEIVE MESSAGE (or page trigger) that was defined in the Interface Design Card.
13. You checkpoint at 14 minutes: each pair reports progress. Both you must have at least their core mechanic working before integration begins.

## Save your progress
Keep your Stack KIDI project, story map, and notes ready for Lesson 2, where you will finish this week's activities and check your learning.

## All Lesson 1 steps (complete list)

1. Sub-system Test Checklist (A5 for you): 2 rows for sub-system-specific criteria + 1 row for "Can this be integrated? Does it END at the correct trigger point?"
2. Integration Log (A5 per group): records each step of the integration process and any integration-specific bugs found
3. Integration protocol card (A5 per group): step-by-step instructions - ① Pair A exports or copies their project to the integration tablet ② Pair B adds their component ③ Run the interface connection ④ Test the full integrated programme
4. Regression test card (A5): "Does Sub-system A still work after integration? YES / NO - if NO, regression bug found."
5. "Two engineering teams build a bridge - one from each side of the river. They use the same specification for the centre joint. When the two halves meet, do they fit?" Show an image of a bridge under construction.
6. "If the specification was exact - perfect fit. If one team measured slightly differently - the bridge does not connect."
7. "Your interface specification from last lesson is the centre joint measurement. Today we find out if it was exact enough."
8. Groups review their Collaborative Project Briefs. Re-read the Interface Design Card. Each pair confirms: "Do we understand exactly what our sub-system must send or receive?"
9. You separate to your own tablets. BOTH you build simultaneously - this is the parallel work phase.
10. Each pair follows their Sub-system Design Strip from Lesson 17. Build task by task. Test each task before proceeding (green flag check as in Lesson 14).
11. CRITICAL: at the END of Sub-system A, the final block must be the SEND MESSAGE block (or page-change trigger) that was defined in the Interface Design Card.
12. CRITICAL: at the START of Sub-system B, the first trigger must be the RECEIVE MESSAGE (or page trigger) that was defined in the Interface Design Card.
13. You checkpoint at 14 minutes: each pair reports progress. Both you must have at least their core mechanic working before integration begins.
