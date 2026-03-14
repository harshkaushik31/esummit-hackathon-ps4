from datetime import date
from pathlib import Path
import os
import re
from typing import TypedDict

try:
    from typing import NotRequired
except ImportError:
    from typing_extensions import NotRequired

from dotenv import load_dotenv
from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
from langgraph.graph import END, START, StateGraph


load_dotenv(dotenv_path=Path(__file__).with_name(".env"), override=True)
hf_token = os.getenv("HUGGING_FACE_TOKEN") or os.getenv("HUGGINGFACEHUB_API_TOKEN")
chat_llm: ChatHuggingFace | None = None

if hf_token:
    llm = HuggingFaceEndpoint(
        repo_id="Qwen/Qwen2.5-72B-Instruct",
        task="text-generation",
        max_new_tokens=2048,
        huggingfacehub_api_token=hf_token,
    )
    chat_llm = ChatHuggingFace(llm=llm)


class RTIState(TypedDict):
    applicant_name: str
    area: str
    total_complaints: int
    unsolved_complaints: int
    unsolved_complaint_dates: list[str]
    report: NotRequired[str]


TOTAL_COMPLAINT_PATTERNS = [
    r"(?:total\s+complaints?|complaints?\s+(?:registered|filed)|registered\s+complaints?)\D{0,20}(\d+)",
    r"(\d+)\s*(?:total\s+)?complaints?\s*(?:registered|filed)?",
]

PENDING_COMPLAINT_PATTERNS = [
    r"(?:pending|unsolved|unresolved)\s+complaints?\D{0,20}(\d+)",
    r"(\d+)\s*(?:pending|unsolved|unresolved)\s+complaints?",
]

DATE_PATTERNS = [
    r"\b\d{4}-\d{2}-\d{2}\b",
    r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b",
    r"\b\d{1,2}\s+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|"
    r"jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{4}\b",
    r"\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|"
    r"aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2},?\s+\d{4}\b",
]

FIELD_LABELS = [
    "applicant name",
    "name",
    "applicant",
    "area",
    "location",
    "locality",
    "city",
    "total complaints",
    "complaints registered",
    "registered complaints",
    "pending complaints",
    "unsolved complaints",
    "unresolved complaints",
    "total",
    "pending",
    "unsolved",
    "unresolved",
]


def _extract_count(text: str, patterns: list[str]) -> int | None:
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            return int(match.group(1))
    return None


def _extract_labeled_value(text: str, labels: list[str]) -> str | None:
    next_key_pattern = "|".join(re.escape(label) for label in FIELD_LABELS)

    for label in labels:
        match = re.search(
            rf"\b{re.escape(label)}\b\s*[:=-]\s*(.+?)"
            rf"(?=(?:\s*,\s*(?:{next_key_pattern})\b\s*[:=-])"
            rf"|(?:\s*[\n\r]+\s*(?:{next_key_pattern})\b\s*[:=-])|$)",
            text,
            flags=re.IGNORECASE,
        )
        if match:
            value = match.group(1).strip().strip(",")
            if value:
                return value
    return None


def extract_dates_from_text(text: str) -> list[str]:
    matches: list[tuple[int, str]] = []
    for pattern in DATE_PATTERNS:
        for match in re.finditer(pattern, text, flags=re.IGNORECASE):
            matches.append((match.start(), match.group(0).strip()))

    seen: set[str] = set()
    ordered_dates: list[str] = []
    for _, date_value in sorted(matches, key=lambda item: item[0]):
        key = date_value.lower()
        if key not in seen:
            seen.add(key)
            ordered_dates.append(date_value)

    return ordered_dates


def parse_rti_state_from_user_data(user_data: str) -> RTIState:
    raw = user_data.strip()
    if not raw:
        raise ValueError("user_data cannot be empty.")

    total_complaints = _extract_count(raw, TOTAL_COMPLAINT_PATTERNS)
    pending_complaints = _extract_count(raw, PENDING_COMPLAINT_PATTERNS)

    if total_complaints is None or pending_complaints is None:
        raise ValueError(
            "Could not parse complaint counts. Include both total and pending counts, "
            "for example: 'total complaints: 12, pending complaints: 5'."
        )

    if pending_complaints > total_complaints:
        raise ValueError("pending complaints cannot be greater than total complaints.")

    dates = extract_dates_from_text(raw)
    if pending_complaints > 0 and len(dates) > pending_complaints:
        dates = dates[:pending_complaints]

    applicant_name = _extract_labeled_value(
        raw,
        ["applicant name", "name", "applicant"],
    ) or "Citizen Applicant"
    area = _extract_labeled_value(raw, ["area", "location", "locality", "city"]) or "Concerned Area"

    return RTIState(
        applicant_name=applicant_name,
        area=area,
        total_complaints=total_complaints,
        unsolved_complaints=pending_complaints,
        unsolved_complaint_dates=dates,
    )


def build_fallback_rti(state: RTIState) -> str:
    dates_section = ""
    if state["unsolved_complaint_dates"]:
        filed_dates = "\n".join(
            f"{i + 1}. {d}" for i, d in enumerate(state["unsolved_complaint_dates"])
        )
        dates_section = (
            "\nThe unresolved complaints were filed on the following dates:\n"
            f"{filed_dates}\n"
        )

    return f"""To,
The Public Information Officer,
Municipal Corporation / Public Works Department (Road Authority),
{state["area"]}

Subject: Application under Section 6(1) of the Right to Information Act, 2005 regarding unresolved road complaints

Respected Sir/Madam,

I, {state["applicant_name"]}, am a resident of {state["area"]}. I have filed multiple road-related complaints in my area. Out of {state["total_complaints"]} total complaints filed by me, {state["unsolved_complaints"]} complaints are still unresolved.{dates_section}
Under Section 6(1) of the Right to Information Act, 2005, I request the following information:
1. Current status of each unresolved complaint mentioned above.
2. Action taken report for each complaint, including inspection and repair actions.
3. Name, designation, and office of the officer responsible for disposal of each complaint.
4. Reasons for non-resolution till date.
5. Expected timeline/date for resolution of each pending complaint.

As per Section 7(1) of the RTI Act, kindly provide the information within 30 days of receipt of this application.

I declare that I am an Indian citizen and the requested information pertains to public authority records.

Yours faithfully,

Signature: ____________________
Name: {state["applicant_name"]}
Address: ____________________
Contact: ____________________
Date: {date.today().isoformat()}
Place: {state["area"]}
"""


def _build_prompt(state: RTIState) -> str:
    dates_context = ""
    if state["unsolved_complaint_dates"]:
        dates_block = "\n".join(
            f"  {i + 1}. Filed on: {d}"
            for i, d in enumerate(state["unsolved_complaint_dates"])
        )
        dates_context = (
            "- Dates on which unresolved complaints were filed:\n"
            f"{dates_block}\n"
        )

    return f"""You are an expert in Indian legal documentation. Draft a formal RTI (Right to Information) application under the Right to Information Act, 2005 on behalf of a citizen.

Applicant: {state["applicant_name"]}
Area of complaints: {state["area"]}

Complaint summary:
- Total complaints filed: {state["total_complaints"]}
- Unresolved / pending complaints: {state["unsolved_complaints"]}
{dates_context}
Write the complete RTI application letter addressed to the Public Information Officer of the concerned Municipal Corporation / Public Works Department (Road Authority). The letter must:
- Follow standard Indian RTI application format (To, Subject, Under RTI Act 2005, Information Sought, Declaration, Signature).
- Be written strictly from the applicant's first-person perspective.
- Reference Section 6(1) of the Right to Information Act, 2005.
- Specifically request current status of each unresolved complaint, actions taken, names/designations of responsible officers, and expected resolution timeline.
- Invoke the statutory 30-day response obligation under Section 7(1) of the Act.
- Be formal, polite, and precise.
- If dates are provided, include only those dates. If dates are not provided, do not mention or invent complaint filing dates.
- End with a proper signature block (Name, Address placeholder, Date, Contact placeholder).

Output ONLY the RTI letter. Do not include any explanation or meta-commentary."""


def generate_rti(state: RTIState) -> RTIState:
    prompt = _build_prompt(state)

    if chat_llm is None:
        state["report"] = build_fallback_rti(state)
        return state

    try:
        response = chat_llm.invoke(prompt)
        state["report"] = response.content
    except Exception:
        # Keep script runnable even if network/model call fails.
        state["report"] = build_fallback_rti(state)

    return state


graph = StateGraph(RTIState)
graph.add_node("generate_rti", generate_rti)
graph.add_edge(START, "generate_rti")
graph.add_edge("generate_rti", END)
workflow = graph.compile()


def generate_rti_from_user_data(user_data: str) -> RTIState:
    state = parse_rti_state_from_user_data(user_data)
    return workflow.invoke(state)


if __name__ == "__main__":
    sample_user_data = (
        "Name: Rahul Sharma\n"
        "Area: Koramangala, Bengaluru\n"
        "Total complaints registered: 12\n"
        "Pending complaints: 9\n"
        "Filed on: 2025-09-10, 2025-10-02, 2025-10-18"
    )
    final_state = generate_rti_from_user_data(sample_user_data)

    print("Generated RTI Application (Right to Information Act, 2005):")
    print(final_state["report"])

