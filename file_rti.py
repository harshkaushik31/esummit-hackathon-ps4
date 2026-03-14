from pathlib import Path
from datetime import date
from typing import TypedDict
import os

try:
    from typing import NotRequired
except ImportError:
    from typing_extensions import NotRequired

from dotenv import load_dotenv
from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
from langgraph.graph import StateGraph, START, END


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
    total_complaints: int          # total complaints filed by the user
    unsolved_complaints: int       # count of complaints still pending/unresolved
    unsolved_complaint_dates: list[str]  # filing dates of each unresolved complaint (ISO format)
    report: NotRequired[str]


def build_fallback_rti(state: RTIState) -> str:
    filed_dates = "\n".join(
        f"{i + 1}. {d}" for i, d in enumerate(state["unsolved_complaint_dates"])
    )

    return f"""To,
The Public Information Officer,
Municipal Corporation / Public Works Department (Road Authority),
{state["area"]}

Subject: Application under Section 6(1) of the Right to Information Act, 2005 regarding unresolved road complaints

Respected Sir/Madam,

I, {state["applicant_name"]}, am a resident of {state["area"]}. I have filed multiple road-related complaints in my area. Out of {state["total_complaints"]} total complaints filed by me, {state["unsolved_complaints"]} complaints are still unresolved.

The unresolved complaints were filed on the following dates:
{filed_dates}

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


def generate_rti(state: RTIState) -> RTIState:
    dates_block = "\n".join(
        f"  {i + 1}. Filed on: {d}"
        for i, d in enumerate(state["unsolved_complaint_dates"])
    )

    prompt = f"""You are an expert in Indian legal documentation. Draft a formal RTI (Right to Information) application under the Right to Information Act, 2005 on behalf of a citizen.

Applicant: {state["applicant_name"]}
Area of complaints: {state["area"]}

Complaint summary:
- Total complaints filed: {state["total_complaints"]}
- Unresolved / pending complaints: {state["unsolved_complaints"]}
- Dates on which unresolved complaints were filed:
{dates_block}

Write the complete RTI application letter addressed to the Public Information Officer of the concerned Municipal Corporation / Public Works Department (Road Authority). The letter must:
1. Follow the standard Indian RTI application format (To, Subject, Under RTI Act 2005, Information Sought, Declaration, Signature).
2. Be written strictly from the applicant's first-person perspective.
3. Reference Section 6(1) of the Right to Information Act, 2005.
4. Specifically request: current status of each unresolved complaint, actions taken by the department, names and designations of responsible officers, and expected resolution timeline.
5. Invoke the statutory 30-day response obligation under Section 7(1) of the Act.
6. Be formal, polite, and precise.
7. End with a proper signature block (Name, Address placeholder, Date, Contact placeholder).

Output ONLY the RTI letter. Do not include any explanation, preamble, or meta-commentary."""

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

# Example: 12 total complaints filed, 9 still unresolved
initial_state: RTIState = {
    "applicant_name": "Rahul Sharma",
    "area": "Koramangala, Bengaluru, Karnataka",
    "total_complaints": 12,
    "unsolved_complaints": 9,
    "unsolved_complaint_dates": [
        "2025-09-10",
        "2025-10-02",
        "2025-10-18",
        "2025-11-05",
        "2025-11-22",
        "2025-12-14",
        "2026-01-07",
        "2026-01-30",
        "2026-02-21",
    ],
}

final_state = workflow.invoke(initial_state)

print("Generated RTI Application (Right to Information Act, 2005):")
print(final_state["report"])

