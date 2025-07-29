# Prompt Injectionator Architecture
Grok helped me organize and think this through. Might be a bit shit ;-p

## Overview

The Prompt Injectionator is an application designed to process user prompts, test them for potential prompt injections, send safe prompts to a Large Language Model (LLM), validate the LLM responses, and return results to the user. If a prompt or response is deemed unsafe (e.g., due to detected injections), the pipeline can abort, flag, or rate the response based on a confidence score. 

This document outlines the requirements, evaluates architectural alternatives, and details the final decisions, incorporating updates to make Mitigation a wrapper class that uses Injection.detect and manages a Confidence score for the round trip.

## Requirements

The app must:

- Accept User Input: Capture user prompts with associated metadata (e.g., timestamp, user ID).
Handle Prompt Injections: Support testing prompts with malicious or test injections (simulating "red team" or bad actor scenarios).
- Apply Mitigations: Run prompts through a series of mitigation checks before sending to the LLM (Send pipeline) and validate LLM responses (Receive pipeline).
- Detect Injections: Identify known injection patterns (e.g., "ignore previous instructions") in the Send pipeline and unexpected outputs (e.g., database tables instead of poems) in the Receive pipeline.
- Flexible Handling: Allow mitigations to abort the pipeline, flag the prompt/response, or rate it based on a confidence score.
- Track Confidence: Maintain a Confidence score for the entire round trip (prompt → LLM → response) to quantify safety.
- Support Testing: Enable systematic testing of injections to evaluate mitigation effectiveness.
Be Modular and Extensible: Allow easy addition of new mitigations and injection types.

## Alternatives Considered

Two architectural approaches were evaluated for handling prompts and injections:

### Option 1: Raw User Prompt + "Apply Injection" -> Injection Object

Description: The raw user prompt is combined with an injection to create an Injection object, which encapsulates both the prompt and injected content.

#### Pros:

- Clear separation of clean prompts and injected prompts.
- Encapsulates injection metadata (e.g., type, payload) for logging and analysis.
- Ideal for systematic testing of specific injection scenarios.

#### Cons:

- Adds complexity by requiring explicit injection application logic.
- Assumes injections are known and applied, which may not reflect real-world untrusted prompts.
- Duplicates logic for handling clean vs. injected prompts.

Use Case: Best for a testing-focused system where controlled injection scenarios are needed.

### Option 2: Raw User Prompt Kept Separate from "Prompt Injection"

Description: Treats the raw user prompt as the primary entity, with injections handled as separate test cases or detected within the prompt. No dedicated Injection object for processing; instead, mitigations analyze prompts directly.

#### Pros:

- Simpler pipeline treating all prompts uniformly (clean or injected).
- Aligns with real-world scenarios where prompts are untrusted and may contain unknown injections.
- Reduces complexity by avoiding separate logic for clean and injected prompts.

#### Cons:

- Less structured for testing specific injections without a dedicated testing module.
- May lose metadata about injections unless explicitly tracked by mitigations.

Use Case: Ideal for production systems processing untrusted user input.

### Final Decisions

Based on the requirements and evaluation, the architecture adopts Option 2 with modifications to support testing, an Injection class with apply and detect methods, and a Mitigation wrapper approach with a Confidence score. Key decisions:

## Prompt Representation:

Use a Prompt object to encapsulate user input and metadata (e.g., text, timestamp, user_id, session_id, status, metadata).

This provides a single entity for tracking the prompt’s lifecycle through the pipeline.

## Injection Handling:

Implement an Injection class for red team testing and detection, with two methods:

- apply(prompt: Prompt) -> Prompt: Adds the injection payload to a Prompt, returning a new Prompt with the injected content.
- detect(text: str) -> tuple[bool, Optional[dict]]: Analyzes a text (prompt or LLM response) for the specific injection type, returning a pass/fail result and optional metadata (e.g., reason for detection).

The Injection class is used for testing (via apply) and detection (via detect) in both pipelines.

## Mitigation Pipelines:

Split mitigations into Send (pre-LLM) and Receive (post-LLM) pipelines.

Mitigation as Wrapper: Each Mitigation class wraps one or more Injection objects, calling their detect methods and deciding how to handle results (e.g., abort, flag, rate). Mitigation classes can also perform non-injection-specific checks (e.g., format validation).

Handling Options: Mitigations return an Action (e.g., ABORT, FLAG, PROCEED) and a Confidence delta based on detection results.

Send Pipeline: Checks for injection patterns (via Injection.detect) and other issues (e.g., prompt length).

Receive Pipeline: Checks for injected behavior (via Injection.detect) and validates output (e.g., format, sensitive data).

## Confidence Score:

Track a Confidence score (0.0 to 1.0) for the entire round trip, stored in the PromptProcessor or a RoundTrip object.

Each Mitigation contributes to the score based on Injection.detect results or other checks (e.g., subtracting 0.2 for a detected injection).

Use the score to decide final actions (e.g., abort if Confidence < 0.5, flag if 0.5 ≤ Confidence < 0.8).

## Pipeline Workflow:

- Input: Accept a Prompt object.
- Send Pipeline: Run prompt through Mitigation wrappers, which call Injection.detect and other checks. Each mitigation returns an Action and Confidence delta. Abort if any mitigation specifies ABORT or if Confidence falls below a threshold.
- LLM Processing: Send safe prompts to the LLM (e.g., via xAI’s Grok 3 API, see https://x.ai/api).
- Receive Pipeline: Run LLM response through Mitigation wrappers, updating Confidence and deciding actions.
- Output: Return the response with flags/ratings or an error if the pipeline aborts.

## Testing Support:

Implement an InjectionTester module that uses Injection.apply to generate test prompts with specific attacks.

Run test prompts through the pipeline, logging Confidence scores, flags, and actions to evaluate mitigation effectiveness.

Support reporting (e.g., detection rate, false positives).

## Extensibility:

Design Injection and Mitigation classes as pluggable to allow new types via configuration or subclasses.

Maintain a mapping of injection types to mitigations to ensure coverage.

Support external services (e.g., NLP APIs) for advanced detection.

## Error Handling:

Observability is key. Users should be able to "step through" an Injectionor "run" like a code step through. 

Use a PromptInjectionError class for aborts, including metadata (e.g., detected injection type, reason).

Log all processing steps, including Confidence scores and flags, for debugging and analysis.

## Example Pseudo-Code

Below is a high-level implementation outline to illustrate the updated architecture:

```javascript
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional, List, Tuple
import re

# Enum for pipeline stage
class PipelineStage(Enum):
    SEND = "send"
    RECEIVE = "receive"

# Enum for mitigation actions
class Action(Enum):
    ABORT = "abort"
    FLAG = "flag"
    PROCEED = "proceed"

# Prompt object
@dataclass
class Prompt:
    text: str
    timestamp: datetime
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    status: str = "pending"
    metadata: dict = None

# Injection class for red team attacks and detection
class Injection:
    def __init__(self, injection_type: str, payload: str):
        self.injection_type = injection_type
        self.payload = payload

    def apply(self, prompt: Prompt) -> Prompt:
        injected_text = f"{prompt.text} {self.payload}"
        return Prompt(
            text=injected_text,
            timestamp=prompt.timestamp,
            user_id=prompt.user_id,
            session_id=prompt.session_id,
            metadata={"injection_type": self.injection_type}
        )

    def detect(self, text: str) -> tuple[bool, Optional[dict]]:
        if re.search(re.escape(self.payload), text, re.IGNORECASE):
            return False, {"reason": f"Detected {self.injection_type}: {self.payload}"}
        return True, None

# Example specific injection
class JailbreakInjection(Injection):
    def __init__(self):
        super().__init__(injection_type="jailbreak", payload="ignore previous instructions")

    def detect(self, text: str) -> tuple[bool, Optional[dict]]:
        patterns = [r"ignore\s+previous\s+instructions", r"bypass\s+system"]
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return False, {"reason": f"Detected {self.injection_type}: {pattern}"}
        return True, None

# Mitigation wrapper class
class Mitigation:
    def __init__(self, stage: PipelineStage, injections: List[Injection] = None):
        self.stage = stage
        self.injections = injections or []

    def check(self, text: str, confidence: float) -> Tuple[Action, float, Optional[dict]]:
        metadata = {}
        for injection in self.injections:
            passed, inj_metadata = injection.detect(text)
            if not passed:
                # Example: Flag for jailbreak, reduce confidence
                confidence -= 0.2
                metadata.update(inj_metadata)
                metadata["flag"] = f"Suspected {injection.injection_type}"
                return Action.FLAG, confidence, metadata
        return Action.PROCEED, confidence, None

# Example non-injection-specific mitigation
class FormatMitigation(Mitigation):
    def __init__(self, expected_format: str):
        super().__init__(stage=PipelineStage.RECEIVE)
        self.expected_format = expected_format

    def check(self, text: str, confidence: float) -> Tuple[Action, float, Optional[dict]]:
        is_expected = some_format_classifier(text) == self.expected_format
        if not is_expected:
            confidence -= 0.3
            return Action.ABORT, confidence, {"reason": f"Expected {self.expected_format}, got different format"}
        return Action.PROCEED, confidence, None

# Pipeline manager
class PromptProcessor:
    def __init__(self, mitigations: List[Mitigation], llm, confidence_threshold: float = 0.5):
        self.mitigations = mitigations
        self.llm = llm
        self.confidence_threshold = confidence_threshold

    def process(self, prompt: Prompt) -> Tuple[str, float, List[str]]:
        confidence = 1.0
        flags = []

        # Send pipeline
        for mitigation in [m for m in self.mitigations if m.stage == PipelineStage.SEND]:
            action, confidence, metadata = mitigation.check(prompt.text, confidence)
            if metadata and "flag" in metadata:
                flags.append(metadata["flag"])
            if action == Action.ABORT or confidence < self.confidence_threshold:
                prompt.status = "failed"
                raise PromptInjectionError(f"Send mitigation failed: {metadata.get('reason', 'Low confidence')}", metadata)

        # LLM processing
        response = self.llm.generate(prompt.text)

        # Receive pipeline
        for mitigation in [m for m in self.mitigations if m.stage == PipelineStage.RECEIVE]:
            action, confidence, metadata = mitigation.check(response, confidence)
            if metadata and "flag" in metadata:
                flags.append(metadata["flag"])
            if action == Action.ABORT or confidence < self.confidence_threshold:
                prompt.status = "failed"
                raise PromptInjectionError(f"Receive mitigation failed: {metadata.get('reason', 'Low confidence')}", metadata)

        prompt.status = "passed"
        return response, confidence, flags

# Error class
class PromptInjectionError(Exception):
    def __init__(self, message: str, metadata: Optional[dict] = None):
        self.message = message
        self.metadata = metadata
        super().__init__(self.message)

# Testing module
class InjectionTester:
    def __init__(self, processor: PromptProcessor):
        self.processor = processor

    def test_injection(self, base_prompt: Prompt, injection: Injection) -> dict:
        injected_prompt = injection.apply(base_prompt)
        try:
            response, confidence, flags = self.processor.process(injected_prompt)
            return {"status": "passed", "response": response, "confidence": confidence, "flags": flags}
        except PromptInjectionError as e:
            return {"status": "failed", "error": e.message, "metadata": e.metadata}
```

## Next Steps

1. Implement Injection Types: Develop Injection subclasses (e.g., JailbreakInjection, DataExfiltrationInjection) with specific apply and detect logic.
2. Define Handling Rules: Configure Mitigation classes with rules for Action (abort, flag, proceed) and Confidence deltas (e.g., via a config file).
3. Calibrate Confidence: Test the Confidence score against known injections to tune weights and thresholds.
4. Integrate LLM: Use an LLM API (e.g., xAI’s Grok 3 API, see https://x.ai/api).
5. Add Logging and Reporting: Log Confidence scores, flags, and actions for debugging and generate reports for test results.
6. Optimize Performance: Prioritize lightweight Injection.detect methods and cache results for common cases.

This updated architecture leverages Mitigation as a wrapper class that uses Injection.detect and manages a Confidence score, providing flexible handling and rich output for the Prompt Injectionator.