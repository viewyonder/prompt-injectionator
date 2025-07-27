# AI prompt injections hidden inside DNS records? ✨ 

Source: Alex Coustere
https://www.linkedin.com/posts/axelcoustere_ai-genai-llm-activity-7353657318883962880-iybD/

"Hackers are stashing malware in a place that’s largely out of the reach of most defenses - inside domain name system (DNS) records that map domain names to their corresponding numerical IP addresses.

The practice allows malicious scripts and early-stage malware to fetch binary files without having to download them from suspicious sites or attach them to emails, where they frequently get quarantined by antivirus software. [...]

The file was converted from binary format into hexadecimal, an encoding scheme that uses the digits 0 through 9 and the letters A through F to represent binary values in a compact combination of characters.

The hexadecimal representation was then broken up into hundreds of chunks. Each chunk was stashed inside the DNS record of a different subdomain of the domain whitetreecollective[.]com. Specifically, the chunks were placed inside the TXT record, a portion of a DNS record capable of storing any arbitrary text. [...]

Campbell said he recently found DNS records that contained text for use in hacking AI chatbots through an exploit technique known as prompt injections. Prompt injections work by embedding attacker-devised text into documents or files being analyzed by the chatbot. The attack works because large language models are often unable to distinguish commands from an authorized user and those embedded into untrusted content that the chatbot encounters."

hashtag#ai hashtag#genai hashtag#llm hashtag#dns hashtag#prompts

Source: Asher Falcon
Title: dnsimg - storing images in txt records
URL: https://asherfalcon.com/blog/posts/2

I was intrigued by the idea of storing images in DNS records, and I wanted to test out how effectively images could be stored in DNS records. I've always been interested in TXT records because they seem to be a useful way of storing arbitrary data, and in this blog post I'll discuss how I went from an idea to developing the project into almost a protocol sort of method for storing an image on a domain name.