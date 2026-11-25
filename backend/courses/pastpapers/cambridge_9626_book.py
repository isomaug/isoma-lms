"""Cambridge AS Level IT (9626) teaching notes for past-paper text solutions.

Content is written to mirror the official Cambridge International AS & A Level
Information Technology syllabus topics and the teaching emphasis found in
Cambridge-endorsed coursebooks. It is original explanatory wording for
instruction, not a verbatim extract from any publisher textbook.
"""

from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass(frozen=True)
class BookTopic:
    code: str
    title: str
    keywords: tuple[str, ...]
    explanation: str
    exam_tips: tuple[str, ...] = ()


# Ordered roughly by syllabus topic number so earlier topics win ties.
BOOK_TOPICS: tuple[BookTopic, ...] = (
    BookTopic(
        code="1.2",
        title="Quality of information",
        keywords=(
            "quality of information",
            "accuracy",
            "relevance",
            "completeness",
            "level of detail",
            "age",
            "recycle",
            "gathered",
            "factor",
        ),
        explanation=(
            "Cambridge AS Level IT treats **quality of information** as how useful "
            "data becomes once it is organised for a purpose. Five standard factors "
            "are taught in endorsed coursebooks:\n\n"
            "- **Accuracy** - figures and facts must be correct for the intended use.\n"
            "- **Relevance** - information must relate to the decision or task.\n"
            "- **Age** - outdated information may no longer describe the situation.\n"
            "- **Level of detail** - too little detail hides meaning; too much detail "
            "creates noise.\n"
            "- **Completeness** - missing parts of the picture make decisions weak.\n\n"
            "When a scenario mentions collecting survey answers from people, always "
            "link each factor back to that scenario rather than writing a generic list."
        ),
        exam_tips=(
            "Name the factor, then apply it to the scenario in the same sentence.",
            "Do not invent factors outside the syllabus set unless the mark scheme allows them.",
        ),
    ),
    BookTopic(
        code="8.1 / 10.1",
        title="Spreadsheets versus databases",
        keywords=(
            "spreadsheet",
            "database",
            "records",
            "members",
            "gymnasium",
            "worksheets",
            "tables",
            "benefits",
            "drawbacks",
        ),
        explanation=(
            "Cambridge practical and theory teaching contrasts **spreadsheets** and "
            "**databases** for storing structured records.\n\n"
            "Spreadsheets are strong for calculations, charts, quick modelling and "
            "simple lists. They become weak when many related tables, multi-user "
            "integrity, or complex queries are required.\n\n"
            "Databases (especially relational databases) are stronger for linked "
            "entities, validation through data types/keys, controlled updates and "
            "powerful queries. For a gym membership-and-performance system, a "
            "discussion answer must compare both sides and stay tied to the scenario."
        ),
        exam_tips=(
            "Discuss means benefits and drawbacks, not a one-sided list.",
            "Use comparison language: easier/harder, suitable/unsuitable for this task.",
        ),
    ),
    BookTopic(
        code="5.1",
        title="eSecurity and firewalls",
        keywords=(
            "firewall",
            "personal data",
            "security",
            "malware",
            "packet",
            "filter",
            "proxy",
        ),
        explanation=(
            "Under **eSecurity**, a firewall sits between a trusted network and an "
            "untrusted network (usually the internet). Cambridge materials emphasise "
            "that a firewall inspects traffic and applies rules so only authorised "
            "communication is allowed.\n\n"
            "Typical taught mechanisms include packet filtering, stateful inspection, "
            "blocking unauthorised ports/protocols, logging suspicious traffic, and "
            "acting as a barrier against some malware or unauthorised remote access. "
            "Answers should explain *how* each mechanism protects personal data, not "
            "only name the device."
        ),
        exam_tips=(
            "One clear security action per mark point.",
            "Avoid vague phrases such as 'makes data safer' without a mechanism.",
        ),
    ),
    BookTopic(
        code="3.2",
        title="Microprocessor control in smart homes",
        keywords=(
            "microprocessor",
            "smart home",
            "control devices",
            "appliances",
            "actuator",
            "drawback",
        ),
        explanation=(
            "Cambridge monitoring and control teaching covers **microprocessor-controlled "
            "systems** in homes and industry. Sensors collect data, the microprocessor "
            "compares values with set points, and actuators switch devices.\n\n"
            "Endorsed explanations also stress drawbacks: cost of installation, "
            "dependency on electricity/network, risk of malfunction or incorrect "
            "programming, privacy concerns from constant monitoring, and reduced "
            "manual control when systems fail. Drawback questions need specific "
            "negative consequences, not a repeat of benefits."
        ),
        exam_tips=(
            "Each drawback should say what goes wrong and why it matters to the householder.",
        ),
    ),
    BookTopic(
        code="2.4",
        title="Custom-written versus off-the-shelf software",
        keywords=(
            "off-the-shelf",
            "off the shelf",
            "custom-written",
            "custom written",
            "bespoke",
            "manager",
            "choose",
        ),
        explanation=(
            "Cambridge software topic teaching contrasts **off-the-shelf** (ready-made) "
            "software with **custom-written** software.\n\n"
            "Off-the-shelf software is usually cheaper, available immediately, already "
            "tested by many users, supported with documentation/updates, and often "
            "compatible with common file formats. Custom software fits unique processes "
            "better but costs more and takes longer.\n\n"
            "Explain answers should give reasons *why* a manager would choose "
            "off-the-shelf for the company, using syllabus vocabulary."
        ),
        exam_tips=(
            "Link each reason to a business benefit (cost, time, reliability, support).",
        ),
    ),
    BookTopic(
        code="3.1",
        title="Sensors for monitoring and measurement",
        keywords=(
            "sensor",
            "sensors",
            "weather",
            "moisture",
            "humidity",
            "anemometer",
            "temperature",
            "light sensor",
            "pressure",
            "physical variables",
        ),
        explanation=(
            "Topic **Monitoring and measurement** teaches that sensors convert a "
            "physical variable into a form a computer system can use. Cambridge "
            "examples commonly include temperature, light, pressure, humidity/"
            "moisture, and wind sensors.\n\n"
            "A strong describe answer names the sensor, states the variable it "
            "measures, and briefly links it to the weather-data purpose. Do not stop "
            "at the sensor name alone."
        ),
        exam_tips=(
            "Pair each sensor with the quantity it measures.",
            "Use syllabus sensor names where the mark scheme lists them.",
        ),
    ),
    BookTopic(
        code="3.1 / 1.5",
        title="Processing sensor data",
        keywords=(
            "analogue",
            "digital",
            "adc",
            "convert",
            "processed",
            "graphs",
            "charts",
            "averages",
            "predictions",
            "warnings",
        ),
        explanation=(
            "Cambridge control systems teaching explains the path from sensor reading "
            "to usable information: many sensors produce **analogue** signals that an "
            "**ADC** converts to **digital** values a computer can store and process.\n\n"
            "Once digital, the computer can chart trends, calculate averages/max/min, "
            "produce reports, make simple predictions from historical data, and trigger "
            "warnings. Describe answers should follow that process chain rather than "
            "jumping straight to a final chart."
        ),
        exam_tips=(
            "Mention ADC when analogue sensors feed a digital computer.",
            "Give concrete processing outputs (graph, average, warning).",
        ),
    ),
    BookTopic(
        code="12 / payments",
        title="Electronic funds transfer",
        keywords=(
            "debit card",
            "electronic transfer",
            "funds",
            "checkout",
            "bank",
            "authorised",
            "transaction",
        ),
        explanation=(
            "Cambridge IT applications teaching covers **electronic funds transfer** "
            "at point of sale. The card is read, the retailer system contacts the "
            "customer's bank/card scheme, available funds or credit are checked, the "
            "transaction is authorised or declined, then money is debited from the "
            "customer and credited to the retailer and the transaction is closed.\n\n"
            "Process answers should stay in chronological order and use banking/"
            "authorisation vocabulary from the syllabus materials."
        ),
        exam_tips=(
            "Keep the sequence: read card → contact bank → check funds → authorise/reject → update accounts.",
        ),
    ),
    BookTopic(
        code="4.2",
        title="Algorithms and flowcharts",
        keywords=(
            "flowchart",
            "algorithm",
            "count",
            "sum",
            "loop",
            "initialis",
            "output",
            "correction",
            "error",
        ),
        explanation=(
            "Cambridge algorithm teaching expects learners to read flowchart symbols, "
            "trace variable changes, and spot logic errors. Common syllabus faults "
            "include wrong loop conditions, missing initialisation, missing output, "
            "and incorrect flow lines.\n\n"
            "Correction answers must identify what is wrong **and** state the change "
            "that fixes the logic. Naming the error alone rarely earns full marks."
        ),
        exam_tips=(
            "State the fault, then give the corrected condition or missing step.",
            "Trace a few iterations mentally before writing.",
        ),
    ),
    BookTopic(
        code="10.4",
        title="Database queries",
        keywords=(
            "summary",
            "complex",
            "nested",
            "query",
            "queries",
            "parameter",
            "aggregate",
            "subquery",
        ),
        explanation=(
            "Cambridge database teaching distinguishes query types used in relational "
            "systems:\n\n"
            "- **Summary (aggregate) queries** calculate totals, averages, counts or "
            "other summarised field values across groups of records.\n"
            "- **Complex queries** combine more than one criterion or search across "
            "more than one field/parameter.\n"
            "- **Nested queries** place one query inside another (a subquery) so the "
            "outer query uses the inner result.\n\n"
            "Describe answers should define the query type and say what it is used for."
        ),
        exam_tips=(
            "Use the exact query-type name from the question.",
            "One definition + one use usually covers a two-mark describe item.",
        ),
    ),
    BookTopic(
        code="6.1",
        title="The digital divide",
        keywords=(
            "digital divide",
            "affected groups",
            "rural",
            "socioeconomic",
            "ict skills",
        ),
        explanation=(
            "The **digital divide** is the gap between individuals, communities or "
            "nations that have ready access to ICT and those that do not. Cambridge "
            "materials discuss causes such as infrastructure, income, education, age, "
            "location and skills, and effects on opportunity, services and participation.\n\n"
            "When asked about affected groups, name the groups and explain the access "
            "or skills gap for each."
        ),
        exam_tips=(
            "Name two groups and explain the gap for each group.",
        ),
    ),
    BookTopic(
        code="7.1",
        title="Expert systems",
        keywords=(
            "expert system",
            "knowledge base",
            "inference",
            "rules",
            "chaining",
        ),
        explanation=(
            "An **expert system** stores specialist knowledge and uses an inference "
            "engine to suggest solutions. Cambridge teaching covers the knowledge base, "
            "rule base, inference engine, and explanation/user interface components, "
            "plus forward and backward chaining."
        ),
    ),
)


def _normalize(text: str) -> str:
    text = text.lower()
    text = text.replace("ﬁ", "fi").replace("ﬂ", "fl")
    text = re.sub(r"[^a-z0-9\s/+-]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def match_book_topics(question_text: str, mark_scheme_text: str = "", *, limit: int = 2) -> list[BookTopic]:
    """Rank syllabus/book topics against question and mark-scheme wording."""
    blob = _normalize(f"{question_text}\n{mark_scheme_text}")
    scored: list[tuple[int, BookTopic]] = []
    for topic in BOOK_TOPICS:
        score = 0
        for keyword in topic.keywords:
            key = _normalize(keyword)
            if key and key in blob:
                # Multi-word keywords are stronger signals.
                score += 3 if " " in key else 1
        if score:
            scored.append((score, topic))
    scored.sort(key=lambda item: (-item[0], item[1].code))
    return [topic for _, topic in scored[:limit]]


def format_book_section(topics: list[BookTopic]) -> str:
    if not topics:
        return (
            "Use the Cambridge AS & A Level Information Technology (9626) syllabus "
            "definitions for this topic. Keep terminology consistent with the "
            "endorsed coursebook explanations for Paper 1 Theory."
        )
    blocks = []
    for topic in topics:
        tips = ""
        if topic.exam_tips:
            tips = "\n\n**Exam technique from Cambridge-style teaching:**\n" + "\n".join(
                f"- {tip}" for tip in topic.exam_tips
            )
        blocks.append(
            f"**Syllabus {topic.code} - {topic.title}**\n\n{topic.explanation}{tips}"
        )
    return "\n\n".join(blocks)
