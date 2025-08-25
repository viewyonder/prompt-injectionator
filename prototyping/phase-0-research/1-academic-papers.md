# 1. Academic Papers

### Foundational Papers (2023-2025)

**Core Research:**

[![USENIX Security '24 - Formalizing and Benchmarking Prompt Injection Attacks and Defenses](https://img.youtube.com/vi/ymVcsf2s_OY/0.jpg)](https://www.youtube.com/watch?v=ymVcsf2s_OY)

* **[Design Patterns for Securing LLM Agents against Prompt Injections](https://arxiv.org/abs/2506.08837)** 

> As AI agents powered by Large Language Models (LLMs) become increasingly versatile and capable of addressing a broad spectrum of tasks, ensuring their security has become a critical challenge. Among the most pressing threats are prompt injection attacks, which exploit the agent's resilience on natural language inputs -- an especially dangerous threat when agents are granted tool access or handle sensitive information. In this work, we propose a set of principled design patterns for building AI agents with provable resistance to prompt injection. We systematically analyze these patterns, discuss their trade-offs in terms of utility and security, and illustrate their real-world applicability through a series of case studies.  

- The scope of the problem
- The Action-Selector Pattern
- The Plan-Then-Execute Pattern
- The LLM Map-Reduce Pattern
- The Dual LLM Pattern
- The Code-Then-Execute Pattern
- The Context-Minimization pattern
- The case studies
- Closing thoughts

* **[Prompt Injection attack against LLM-integrated Applications](https://arxiv.org/abs/2306.05499)** (Liu et al., 2023)
  * Seminal work defining prompt injection taxonomy
  * Covers both direct and indirect injection attacks
  * Provides formal threat model framework
* **[Formalizing and Benchmarking Prompt Injection Attacks and Defenses](https://www.usenix.org/conference/usenixsecurity24/presentation/liu-yupei)** (USENIX Security 2024)
  * Comprehensive benchmark framework
  * Formal definitions and evaluation metrics
  * Open-source evaluation tools
* **[AgentDojo: A Dynamic Environment to Evaluate Prompt Injection Attacks and Defenses for LLM Agents](https://arxiv.org/abs/2406.13352)** (NeurIPS 2024)
  * Dynamic testing environment for LLM agents
  * Focus on tool-using agents and indirect attacks
  * Extensible framework for new attack/defense research

**Specialized Attack Vectors:**

* **DataSentinel: A Game-Theoretic Detection of Prompt Injection Attacks** (Liu et al., 2025)
  * Game theory approach to detection
  * Advanced mathematical modeling
  * Available in Open-Prompt-Injection repository
* **Poisoned RAG** (2024)
  * RAG-specific injection techniques
  * Demonstrates effectiveness with minimal poisoned data
  * Critical for document-based applications

### Research Gaps to Investigate:

* Multi-modal injection attacks (image, audio, video)
* Chain-of-thought manipulation
* Few-shot learning exploitation
* Cross-language injection techniques
