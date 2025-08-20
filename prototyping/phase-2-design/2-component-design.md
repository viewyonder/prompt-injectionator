# 2. Component Design

Detail modules, e.g., "Generator uses templates for attacks like DAN (Do Anything Now)."

Detail the Core Engine. This is the secret sauce. It is a pipeline:

Example Pipeline: 

> Input -> Heuristic Filter (regex for 'ignore previous instructions') 
-> Vector Similarity Check (compare against known attacks) 
-> LLM Guardrail (ask a separate LLM 'Is this prompt malicious?') 
-> Final Score Calculation.

For each major component:

 Purpose and responsibilities
 Interfaces and contracts
 Internal architecture
 Dependencies
 Configuration options