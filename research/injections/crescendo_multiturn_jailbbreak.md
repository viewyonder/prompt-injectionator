# The Crescendo Multi-Turn LLM Jailbreak Attack

Mark Russinovich1 and Ahmed Salem2 and Ronen Eldan3
1Microsoft Azure 2Microsoft 3Microsoft Research#

https://crescendo-the-multiturn-jailbreak.github.io/

One of the challenges of developing ethical LLMs is to define and enforce a clear boundary between acceptable and unacceptable topics of conversation. For example, an LLM might be trained to avoid engaging in discussions about violence, hate speech, or illegal activities. However, this does not mean that the LLM is incapable of generating such content, as it might have learned relevant words and phrases from its large-scale training data. Rather, the LLM is expected to refuse or deflect any attempts by the user to steer the conversation towards the prohibited topics. This creates a discrepancy between the LLM's potential and actual behavior, which can be exploited by malicious users who want to elicit unethical responses from the LLM through what are known as jailbreak attacks. These attacks aim to bypass the ethical boundaries set by these models. In other words, they aim to narrow the gap between what the model can do and what it is willing to do.

We introduce Crescendo, a novel jailbreak attack method. Unlike previous techniques, Crescendo is a multi-turn attack that starts with harmless dialogue and progressively steers the conversation toward the intended, prohibited objective. Crescendo exploits the LLM’s tendency to follow patterns and to focus on recent text, particularly text it has generated itself. The figure below presents a summary of an execution of Crescendo against two state-of-the-art models: ChatGPT (GPT-4) and Gemini Ultra