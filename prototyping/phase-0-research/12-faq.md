# Prompt Injectionator - Frequently Asked Questions

## General Questions

### What is Prompt Injectionator?
Prompt Injectionator is a comprehensive security platform designed to protect LLM-powered applications from prompt injection attacks. It combines education, testing, detection, and mitigation capabilities in a single integrated solution.

### What are prompt injection attacks?
Prompt injection attacks are a class of security vulnerabilities where malicious input manipulates an AI system to ignore its safety instructions, leak sensitive information, or perform unintended actions. Unlike traditional attacks, these exploit how language models process natural language instructions.

### Why can't traditional security tools handle these attacks?
Traditional security tools like WAFs and pattern-matching systems were designed for structured data and known attack patterns. Prompt injections use natural language and can be highly contextual, making them nearly impossible to detect with conventional methods.

### Who created Prompt Injectionator?
Prompt Injectionator was founded by Steve Chambers, a security professional with expertise in both traditional cybersecurity and emerging AI threats. The project draws from extensive research in the AI security community.

## Technical Questions

### How does the detection engine work?
Our detection engine uses a multi-stage pipeline combining heuristic filtering, vector similarity analysis, and LLM-based guardrails. This approach provides both speed (sub-500ms response times) and accuracy across diverse attack vectors.

### What types of attacks does it detect?
Prompt Injectionator covers a comprehensive range of attacks including:
- Direct injection ("ignore previous instructions")
- Indirect injection via retrieved documents
- Jailbreaking and role-playing attacks ("Act as DAN")
- Obfuscated attacks (Base64, character substitution, foreign languages)
- Multi-modal injection (attacks hidden in images or audio)

### Can it integrate with my existing security stack?
Yes. Our pluggable architecture supports integration with existing SIEM systems, security orchestration platforms, and CI/CD pipelines through RESTful APIs and webhooks.

### What's the performance impact on my applications?
The real-time detection API is designed for production use with response times under 500ms. For applications requiring even lower latency, we offer asynchronous analysis modes.

### Do you support on-premises deployment?
Yes. Prompt Injectionator is available as SaaS, on-premises installation, and hybrid deployments to meet various security and compliance requirements.

## Business Questions

### What's included in the different pricing tiers?
We offer flexible pricing based on API calls, features, and support levels:
- **Developer**: Free tier for testing and small projects
- **Professional**: Full feature access for growing teams
- **Enterprise**: Advanced features, on-premises options, and dedicated support

### How do you ensure data privacy?
We take data privacy seriously. Customer prompts are processed but not stored by default. For on-premises deployments, all data remains within your infrastructure. We're SOC 2 Type II compliant and working toward additional certifications.

### What kind of support do you provide?
Support varies by tier:
- Community support for free users
- Business hours support for Professional customers
- 24/7 support and dedicated customer success for Enterprise customers
- Custom training and implementation services available

### How quickly can we get started?
You can start testing immediately with our free API tier. Most organizations are running proof-of-concept implementations within a week, with production deployments typically taking 2-4 weeks.

## Use Case Questions

### How does this fit into our DevSecOps pipeline?
Prompt Injectionator integrates seamlessly into CI/CD workflows through APIs and CLI tools. You can automatically test prompts during development, gate deployments based on security scores, and monitor production applications.

### Can security teams without AI expertise use this?
Absolutely. The platform includes comprehensive educational materials and guided workflows designed to bring traditional security professionals up to speed on AI-specific threats and defenses.

### How does this help with compliance and governance?
The platform provides detailed audit logs, risk scoring, and reporting capabilities to demonstrate security controls to auditors and regulators. This is particularly valuable as AI governance regulations continue to evolve.

### What about false positives?
Our multi-stage detection approach is designed to minimize false positives while maintaining high detection rates. The system also includes feedback mechanisms to continuously improve accuracy for your specific use cases.

## Product Roadmap Questions

### What features are coming next?
Our roadmap includes:
- Enhanced multi-modal attack detection
- Advanced behavioral analysis
- Integration with popular LLM frameworks
- Expanded educational content and certification programs
- Additional deployment options

### Do you plan to support other types of AI attacks?
While our current focus is on prompt injection attacks, we're actively researching other AI security threats including data poisoning, model extraction, and adversarial examples.

### How do you stay current with new attack techniques?
We actively monitor AI security research, maintain relationships with the security research community, and continuously update our attack signature database. Our modular architecture allows rapid deployment of new detection methods.

## Getting Started

### Can I try it for free?
Yes! We offer a free tier that includes basic detection capabilities and educational resources. You can sign up at proto.promptinjectionator.com and start testing immediately.

### What do I need to integrate Prompt Injectionator?
Integration is straightforward - you'll need:
- API access to your LLM applications
- Ability to add an HTTP call to our detection API
- Basic understanding of your application's prompt structure

### Do you offer professional services?
Yes. We provide implementation consulting, custom training programs, and ongoing security assessments to help organizations maximize their investment in AI security.

### How do I contact support?
- Technical questions: [technical support email]
- Business inquiries: [sales email]
- General questions: [general contact email]
- Community support: [community forum/Discord link]

### Where can I learn more?
- Documentation: [docs link]
- Community: [community forum]
- Blog: [blog link]
- Security research: [research publications]

---

*Don't see your question answered here? Contact us at [contact email] and we'll be happy to help.*