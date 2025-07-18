# NVIDIA NeMo Guardrails

## Resources
* [Documentation](https://docs.nvidia.com/nemo/guardrails/latest/index.html)
ß
## Colang
Colang is a specialized modeling language developed by NVIDIA for its NeMo Guardrails toolkit, designed to create programmable guardrails for large language model (LLM)-based conversational systems. It enables developers to define and control the behavior of conversational AI, ensuring safer, more reliable, and contextually appropriate interactions. Colang is event-driven and combines natural language with a Python-like syntax, making it accessible for those familiar with Python while being intuitive for designing flexible dialogue flows.

## Key Features of Colang:
Colang allows developers to define "rails" (guardrails) to control LLM behavior, such as preventing discussions on specific topics (e.g., politics), enforcing a particular language style, following predefined dialogue paths, or extracting structured data.

It uses a "pythonic" syntax with two-space indentation (unlike Python's four spaces) and includes core elements like blocks, statements, expressions, keywords, and variables. The main block types are:

* User message blocks: Define user intents or utterances (e.g., define user express greeting "hello" "hi" "what's up?").
* Bot message blocks: Specify bot responses (e.g., define bot express greeting "Hi there!").
Flow blocks: Outline conversation flows (e.g., define flow greeting user express greeting bot express greeting).
* Event-Driven: Colang models interactions as a series of events (e.g., user input, bot response, or triggered actions), allowing precise control over conversational dynamics.
* Flexibility: It supports complex tasks like calling Python scripts, integrating with external tools (e.g., LangChain), and handling multiple parallel dialogue flows (especially in Colang 2.0).


## Versions: There are two versions:

Colang 1.0: The default in earlier NeMo Guardrails releases (0.1 to 0.7), focused on text-based interactions with simpler constructs.

Colang 2.0: Introduced in version 0.8 (beta in 0.9, expected to replace 1.0 as default in 0.12), it offers a more powerful flows engine, support for parallel flows, asynchronous actions, and a smaller set of core abstractions. It also includes a migration tool to convert from Colang 1.0 or 2.0-alpha to 2.0.
Example of Colang Syntax:
colang

```
define user express greeting
  "hello"
  "hi"
  "what's up?"

define bot express greeting
  "Hi there!"

define bot ask how are you
  "How are you doing?"

define flow greeting
  user express greeting
  bot express greeting
  bot ask how are you
```


## Why Colang?
Traditional dialogue management techniques (e.g., flow charts, state machines) are not well-suited for the flexible, dynamic conversations enabled by LLMs like ChatGPT. Colang addresses this by:

* Providing a readable, natural language-based interface for defining guardrails.
* Supporting complex interaction patterns, including retrieval-augmented generation (RAG) and custom actions.
* Ensuring safety and security by allowing developers to filter inputs/outputs, detect sensitive data, or prevent harmful responses.

## Limitations and Considerations:

* Security: Colang can execute Python scripts or make multiple LLM calls, so avoid loading Colang files from untrusted sources without inspection.
* Learning Curve: While designed to be intuitive, developers unfamiliar with Python may need to review examples to grasp its syntax.
* Colang 2.0 Limitations: As of the latest updates, Colang 2.0 (beta) does not yet fully support the NeMo Guardrails standard library or certain generation options, though these are expected to be resolved in future releases (e.g., NeMo Guardrails 0.10).

## Practical Use:
Colang is used to create guardrails for various purposes, such as:

Topical Guardrails: Keeping conversations on-topic (e.g., avoiding political discussions).
Safety Guardrails: Preventing toxic or inappropriate responses.
Security Guardrails: Blocking malicious code execution or unsafe external calls.
Custom Actions: Integrating with external services or performing complex logic via Python functions.

![NeMo Guardrails](/images/RAG-aditi-llm-nemo-guardrails-diagram-devzone-1920x1089.jpg)

## Topical guardrails
Topical guardrails are designed to ensure that conversations stay focused on a particular topic and prevent them from veering off into undesired areas.

They serve as a mechanism to detect when a person or a bot engages in conversations that fall outside of the topical range. These topical guardrails can handle the situation and steer the conversations back to the intended topics. For example, if a customer service bot is intended to answer questions about products, it should recognize that a question is outside of the scope and answer accordingly.

## Safety guardrails
Safety guardrails ensure that interactions with an LLM do not result in misinformation, toxic responses, or inappropriate content. LLMs are known to make up plausible-sounding answers. Safety guardrails can help detect and enforce policies to deliver appropriate responses.

Other important aspects of safety guardrails are ensuring that the model’s responses are factual and supported by credible sources, preventing humans from hacking the AI systems to provide inappropriate answers, and mitigating biases.

## Security guardrails
Security guardrails prevent an LLM from executing malicious code or calls to an external application in a way that poses security risks.

LLM applications are an attractive attack surface when they are allowed to access external systems, and they pose significant cybersecurity risks. Security guardrails help provide a robust security model and mitigate against LLM-based attacks as they are discovered.

## Guardrails workflow
NeMo Guardrails is fully programmable. Applying a guardrail and the set of actions that the guardrail triggers is easy to customize and improve over time.  For critical cases, a new rule can be added with just a few lines of code. 

This approach is highly complementary to techniques such as reinforcement learning from human feedback (RLHF), where the model is aligned to human intentions through a model-training process.  NeMo Guardrails can help developers harden their AI applications, making them more deterministic and reliable.

Here’s the workflow of a guardrail flow:

![NeMo Guardrails Workflow](/images/Figure-1-Process-flow-of-a-user-interaction-with-NeMo-Guardrails.png)

Convert user input to a canonical form.
Match or generate a guardrail based on the canonical form, using Colang.
Plan and dictate the next step for the bot to execute actions.
Generate the final output from the canonical form or generated context.
