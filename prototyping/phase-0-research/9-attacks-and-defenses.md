# 9. Attacks and Defenses

## State of the Art Attacks

Go beyond basic direct injection. Document examples of:

- Indirect Injection: Attacks hidden in retrieved documents or web pages.

- Jailbreaking & Role-Playing: "Act as a..." or DAN ("Do Anything Now") style prompts.

- Obfuscation: Using Base64, character substitution, or other languages to hide malicious instructions.

- Multi-modal Injection: Hiding prompts in images or audio.

## State of the Art Defenses

Analyze what others are doing.

- Pre-processing: Input sanitization, checking for known malicious patterns.

- In-processing: Using instruction-tuned models as "guardrails" or LLM-based firewalls.

- Post-processing: Checking the LLM's output for markers of a successful injection (e.g., "Sure, here is...") before sending it to the user or another tool.

## Look at existing tools 

What can you learn from projects like Rebuff.ai, Lakera, or NVIDIA NeMo Guardrails? What are their strengths and weaknesses?