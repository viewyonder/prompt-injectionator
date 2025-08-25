# 1. Testing

Cover unit/integration (e.g., mock LLMs), end-to-end (e.g., full injection cycle).

Create an Evaluation Dataset: Build a CSV or JSON file with hundreds of prompts. Include a mix of safe prompts, simple injections, and complex, obfuscated attacks. Label each one as safe or malicious.

Benchmark: Run this dataset against your P1 engine and your P2 engine. This will give you concrete proof of improvement.

Tools: Use Jest

- Unit testing approach
- Integration testing plan
- Security testing methodology
- Performance testing plan
- User acceptance criteria