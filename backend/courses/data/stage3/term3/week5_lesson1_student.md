# Week 5 - Lesson 1

## Session length
**About half of this week's plan** (you will finish in Lesson 2)

## Today you will learn
- Enable the MakeCode Bluetooth extension and explain why enabling Bluetooth disables the radio module (they share the same antenna hardware on the Micro:bit v2)
- Use the Bluetooth extension to display the Micro:bit's name and UUID on the LED matrix so a paired device can identify it
- Programme the Micro:bit to broadcast a live temperature reading over Bluetooth using the 'bluetooth temperature service' block
- Pair a phone or tablet with the Micro:bit using the official Micro:bit app (iOS/Android) and confirm the temperature reading appears on the paired device screen
- Create a comparison table: Radio vs. Bluetooth — 4 rows comparing range, number of connected devices, setup complexity, and real-world use case
- Write a 4-sentence technical explanation: what Bluetooth is, how it differs from radio, what the Micro:bit uses it for, and one real-world application where Bluetooth would be preferred over radio

## Big idea
Radio and Bluetooth are both wireless — they both send data through the air without cables. But they work differently and are useful in different situations. Understanding the difference between communication technologies is part of being a computational thinker, not just a coder.

## What you need
- 4 BBC Micro:bit v2 kits + USB cables
- 4 shared laptops with MakeCode open
- 2–4 you smartphones or tablets with the official Micro:bit app installed (iOS/Android) — tested before the session
- Bluetooth vs. Radio comparison table worksheet (A4 for you) — 4-row table with columns: Feature | Radio | Bluetooth
- Technical explanation writing frame (A5 for you) — 4 sentence starters
- Vocabulary cards: 'Bluetooth', 'radio', 'wireless', 'paired device', 'UUID', 'antenna', 'range', 'service', 'broadcast', 'protocol'
- A computer or screen to follow along
- Sticky notes for quick radio vs. Bluetooth pre-assessment

## Links to English and Maths
- **English:** Technical comparative writing — you complete the 4-row comparison table and then write the 4-sentence technical explanation. This is the DDD's Stage 3–4 English strand applied to a new technology context: reading comprehension of a technical concept, followed by written explanation in the learner's own words. Sentence frame: ① 'Bluetooth is a type of wireless communication that…' ② 'Unlike radio, Bluetooth…' ③ 'The Micro:bit uses Bluetooth to…' ④ 'One real-world situation where Bluetooth is better than radio is… because…'. Vocabulary in use: you must use the words 'paired', 'wireless', 'range', and 'protocol' in their 4 sentences.
- **Maths:** Comparison and measurement: the Bluetooth vs. Radio comparison table includes range as one of the 4 rows. Bluetooth typical range: 10–30 metres. Micro:bit radio typical range: up to 70 metres outdoors (configurable). Calculate: how many times further can radio communicate than Bluetooth? (70 ÷ 10 = 7×, at minimum.) If a classroom is 12 metres long, is Bluetooth sufficient for classroom communication? (Yes.) What is the maximum number of Micro:bits that can be in the same radio group? (Unlimited, but discussed as practical group sizes.) Bluetooth supports 1-to-1 pairing in MakeCode — what does this mean for a class of 8? (4 you of devices at most.) Connects to DDD Part 2.4 mathematics: 'Number patterns; sorting and comparison operators.'

## Let's begin

### HOOK – Two Ways to Go Wireless (10 min)
1. Hold up the Micro:bit and ask: 'We already know one way this device sends data without wires — what is it?' (Radio.) 'Today we learn the second way. Who has heard of Bluetooth?' Take 3 responses. Ask: 'What devices in your home use Bluetooth?' (Headphones, phone, speakers.)
2. Introduce the technical hook: 'On the Micro:bit v2, Bluetooth and radio share the SAME antenna. You cannot use both at the same time. When you enable Bluetooth, the radio turns off. Why do you think the engineers designed it that way?' Take 2 speculative answers — acknowledge all as reasonable engineering hypotheses.
3. Get ready to use the Bluetooth vs. Radio comparison worksheet. You fill in what they ALREADY KNOW for the radio column — from T2 Week 1. This pre-fills their prior knowledge before the new content begins.
4. Bridge: 'By the end of today, you will fill in the Bluetooth column too — and write a technical explanation comparing both. Then you will pair this device with a phone and read a temperature reading on the phone screen. Let's go.'
### DESIGN – Enable Bluetooth and Plan the Programme (10 min)
5. Follow the demonstration steps on the projected screen: in MakeCode, go to Extensions -> search 'Bluetooth' -> add the extension. Show the warning: 'Adding Bluetooth will disable the radio blocks.' Ask: 'Why do you think this warning appears? What does this tell us about the hardware?' Guide to: shared antenna.
6. Show the Bluetooth extension block categories: Bluetooth -> 'on bluetooth connected' event, 'on bluetooth disconnected' event, 'bluetooth temperature service'. You open MakeCode on laptops and add the extension themselves. Navigator verifies the Bluetooth category now appears.
7. You plan the programme on a sticky note before coding: on start -> show Micro:bit name (so the phone can identify it) -> bluetooth temperature service start. On bluetooth connected -> show icon tick. On bluetooth disconnected -> show icon cross. You checks: does every pair's plan include the connection event handlers?
### DELIVER – Code, Pair, and Broadcast (30 min)
8. Get ready to use Micro:bits and laptops. Assign Driver and Navigator.
9. Step 1 – Build the programme (10 min): Driver codes from the sticky-note plan. on start -> show string (Micro:bit name) -> bluetooth temperature service start. on bluetooth connected -> show icon tick -> clear screen. on bluetooth disconnected -> show icon cross -> clear screen. Download to Micro:bit.

## Save your progress
Keep your MakeCode project and worksheets ready for Lesson 2, where you will finish this week's activities and check your learning.

## All Lesson 1 steps (complete list)

1. Hold up the Micro:bit and ask: 'We already know one way this device sends data without wires — what is it?' (Radio.) 'Today we learn the second way. Who has heard of Bluetooth?' Take 3 responses. Ask: 'What devices in your home use Bluetooth?' (Headphones, phone, speakers.)
2. Introduce the technical hook: 'On the Micro:bit v2, Bluetooth and radio share the SAME antenna. You cannot use both at the same time. When you enable Bluetooth, the radio turns off. Why do you think the engineers designed it that way?' Take 2 speculative answers — acknowledge all as reasonable engineering hypotheses.
3. Get ready to use the Bluetooth vs. Radio comparison worksheet. You fill in what they ALREADY KNOW for the radio column — from T2 Week 1. This pre-fills their prior knowledge before the new content begins.
4. Bridge: 'By the end of today, you will fill in the Bluetooth column too — and write a technical explanation comparing both. Then you will pair this device with a phone and read a temperature reading on the phone screen. Let's go.'
5. Follow the demonstration steps on the projected screen: in MakeCode, go to Extensions -> search 'Bluetooth' -> add the extension. Show the warning: 'Adding Bluetooth will disable the radio blocks.' Ask: 'Why do you think this warning appears? What does this tell us about the hardware?' Guide to: shared antenna.
6. Show the Bluetooth extension block categories: Bluetooth -> 'on bluetooth connected' event, 'on bluetooth disconnected' event, 'bluetooth temperature service'. You open MakeCode on laptops and add the extension themselves. Navigator verifies the Bluetooth category now appears.
7. You plan the programme on a sticky note before coding: on start -> show Micro:bit name (so the phone can identify it) -> bluetooth temperature service start. On bluetooth connected -> show icon tick. On bluetooth disconnected -> show icon cross. You checks: does every pair's plan include the connection event handlers?
8. Get ready to use Micro:bits and laptops. Assign Driver and Navigator.
9. Step 1 – Build the programme (10 min): Driver codes from the sticky-note plan. on start -> show string (Micro:bit name) -> bluetooth temperature service start. on bluetooth connected -> show icon tick -> clear screen. on bluetooth disconnected -> show icon cross -> clear screen. Download to Micro:bit.
