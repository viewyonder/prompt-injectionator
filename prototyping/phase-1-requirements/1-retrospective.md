# 1. Retrospective

What worked well?

 List successful features/approaches
 Identify user feedback highlights
 Document technical wins


What didn't work?

 Pain points in implementation
 Performance bottlenecks
 Usability issues
 Security gaps


Key learnings from Prototype 1:

 Technical insights
 User behavior patterns
 Threat model evolution
 Integration challenges

1. Introduction
•  Brief overview of the prototype.
•  Objectives and goals.

Prototype 1 began as an experiment to create an "engine" or "system" that could take user prompts that contain prompt injections, detect those injections, and choose whether to "pass" or "fail" the user prompt. It would then pass this prompt to a backend API (Gemini LLM) and handle the response and pass that back to the user. Basic logging (using a static singleton logger instance) for observability.

I quickly discovered that there is a need for more than one input type:

- 1. CLI - both as a command line executable and as a terminal UI menu driven option.
- 2. Web UI - a simple visual web page that users can interact with.
- 3. Webhook - a callable API that can receive prompts and respond with pass / fail / and detailed responses.

I got a basic CLI version working.

I then used a strategy / chain-of-responsibility pattern for the "mitigations". A mitigation is a wrapper for an "injection":

- The "injection" is the code to detect specific types of injection using specific methods, such as regex for "Ignore all previous instructions".
- The "mitigation" wraps around the injection and decides how to handle it - passive or active? pass or fail? etc.

I got the backend working with Gemini API.

A key discovery is the modelling of an 'Injectionator'. This is the live configuration of the four major components and can be persisted in an injectionator.json file:

Injectionator Part 1 - User Input (CLI, Web, Hook).
Injectionator Part 2 - Mitigations (how to handle injections in send/receive chains).
Injectionator Part 3 - Backends (Mock backend, Gemini/LLM api, future chatbot, webhooks etc.)
Injectionator Part 4 - Observability (started with logging to STDOUT/STDERR, but in future add more including notifications to other systems)

2. Achievements (What Went Well)
•  List successful aspects.
•  Highlight key accomplishments.

3. Challenges Faced (What Didn't Go Well)
•  Describe obstacles encountered.
•  Areas that did not meet expectations.

4. Lessons Learned
•  Key takeaways and insights.
•  Any unexpected findings.
5. Areas for Improvement
•  Suggestions for future projects.
•  Adjustments to processes or methodologies.
6. Future Steps
•  Next steps or plans based on the retrospective findings.
