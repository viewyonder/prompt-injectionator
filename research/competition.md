# Competition / Alternatives

This is a list of alternatives/competition. Bearing in mind this project is a learning exercise and not a "real" product. But there are lessons learned from others plus we could recommend others if someone asks.

In terms of learning, the purpose of this project is to learn what prompt injection is (by doing it) as well has how to mitigate the risks, and then apply that to the/your real world.

* **NVIDIA NeMo Guardrails** OSS Programmable rules (in a language called Colang) for input, output, and dialogue flow.
* **Rebuff.ai**	OSS	Multi-layered detection using heuristics, canary tokens, and a vector DB of past attacks.
* **Lakera Guard**	COTS	API-based firewall that inspects prompts and responses in real-time for a wide range of threats.
* **Oligo / Protect AI**	COTS	Enterprise security platform for the entire AI lifecycle, including runtime protection.
* **OpenAI Function Calling**	Platform-Native	Constrains the model to a predefined list of tools/actions (your Actions Hook).
* **OpenAI Moderation API**	Platform-Native	A separate endpoint to classify text for harmful content (your Filter Hook).
* **Vertex AI Safety Filters**	Platform-Native	Configurable filters to automatically block harmful prompts and responses.

## 1. OSS / NVIDIA NeMo Guardrails

An open-source toolkit for adding programmable "guardrails" to LLM applications. It's highly comprehensive.

How it maps to hooks:

* **Filter/Actions Hook** You can define "topical rails" to prevent the bot from discussing unwanted subjects and "dialogue rails" to force conversations down a specific path, which is a powerful form of your Actions hook.

* **Mask Hook** It has "output rails" to check and reformat the LLM's response before it goes to the user. It can also detect and prevent hallucinations (fact-checking).

## 2. OSS / Rebuff.ai:

A self-hardening prompt injection detection library. It's specifically focused on detecting prompt injection attacks and gets smarter over time.

How it maps to hooks:

* **Filter Hook** It uses heuristics and even a dedicated LLM to analyze and score incoming prompts for malicious intent.

* **Match Hook** A core feature is a vector database that stores embeddings of past attacks, allowing it to recognize and block similar future attacks.

* **Mask Hook**ß It uses "canary tokens" (hidden markers) in prompts to see if the LLM response leaks them, which is a clever way to implement your Mask hook concept.

## 3. COTS / Lakera Guard

A popular developer-first AI security platform that acts as a real-time firewall for your LLM. It can be integrated with a few lines of code.

It provides a suite of detectors that cover prompt injection, PII (Personally Identifiable Information) detection and redaction (your Mask Hook), content moderation (Filter Hook), and detection of hallucinations and harmful content.

## 4. COTS / Oligo Security & Protect AI

These are broader, enterprise-focused AI security platforms. They go beyond just prompt security to cover the entire AI development lifecycle, including scanning models for vulnerabilities and securing the AI supply chain.

They offer runtime protection that functions like an advanced version of your hooks, inspecting both prompts (Filter/Actions) and responses (Mask) for a wide range of threats, including data leakage and malicious code generation.

## 5. LLM / OpenAI's Moderation API & Function Calling:

Moderation API: This is a direct implementation of your Filter Hook. It's a separate, free endpoint you can call to classify a prompt or response against categories like hate, self-harm, and sexual content.

Function Calling/Tool Use: This is the most robust way to implement your Actions Hook. You define a strict list of functions (tools) the model can use. Instead of generating free-form text, the model's output is a structured JSON object indicating which function to call and with what parameters. This dramatically reduces the risk of arbitrary instruction execution.

## 6. LLM / Google's Vertex AI Safety Filters:

WWhen using Google's Gemini models via Vertex AI, you can configure safety filters that automatically block prompts and/or responses that contain harmful content (e.g., hate speech, harassment, dangerous content). This serves as a built-in Filter Hook and Mask Hook.

## 7. LLM / Anthropic's Constitutional AI:

Anthropic's models (like Claude) are trained with a "constitution" – a set of principles that guide its responses to be helpful and harmless. This is a more integrated safety approach, acting as a powerful, always-on version of your Mask Hook to ensure responses align with safety principles