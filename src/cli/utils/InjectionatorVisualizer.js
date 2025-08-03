import chalk from 'chalk';

/**
 * InjectionatorVisualizer renders a visual ASCII representation
 * of an Injectionator configuration.
 */
export class InjectionatorVisualizer {
    static renderDiagram(injectionator) {
        const diagram = [];
        diagram.push(this.renderUserPrompt(injectionator.name));
        diagram.push(this.renderSendChain(injectionator.sendChain));
        diagram.push(this.renderBackendConfig(injectionator.llmBackend));
        diagram.push(this.renderReceiveChain(injectionator.receiveChain));

        console.log(diagram.join('\n'));
    }

    static renderUserPrompt(prompt) {
        return chalk.bold("
┌─────────────────────────────────────────────────────────────┐
│                    📝 USER PROMPT                           │") +
`\n│  "${prompt}"  │\n` +
 chalk.bold('└─────────────────────────────────────────────────────────────┘');
    }

    static renderSendChain(sendChain) {
        const lines = [];
        lines.push(chalk.bold("┌─────────────────────────────────────────────────────────────┐"));
        lines.push(chalk.bold("│                 📤 SEND CHAIN MITIGATIONS                   │"));

        if (sendChain && sendChain.mitigations.length > 0) {
            sendChain.mitigations.forEach((mitigation, index) => {
                const status = mitigation.state === 'On' ? chalk.green('ON') : chalk.gray('OFF');
                const mode = mitigation.mode === 'Active' ? chalk.red('[Active]') : chalk.yellow('[Passive]');
                lines.push(`│  ${index + 1}. ${mitigation.name} ${status} ${mode}               │`);
            });
        } else {
            lines.push(chalk.gray('│  No mitigations attached                                  │'));
        }

        lines.push(chalk.bold("└─────────────────────────────────────────────────────────────┘"));
        return lines.join('\n');
    }

    static renderBackendConfig(backend) {
        const type = chalk.cyan(backend.constructor.name);
        const endpoint = chalk.magenta(backend.config.endpoint || 'Not Configured');
        return chalk.bold("
┌─────────────────────────────────────────────────────────────┐") +
`\n│                    🔗 BACKEND CONFIG                        │\n` +
`│  Type: ${type} | Endpoint: ${endpoint}          │\n` +
 chalk.bold('└─────────────────────────────────────────────────────────────┘');
    }

    static renderReceiveChain(receiveChain) {
        const lines = [];
        lines.push(chalk.bold("┌─────────────────────────────────────────────────────────────┐"));
        lines.push(chalk.bold("│                📥 RECEIVE CHAIN MITIGATIONS                 │"));

        if (receiveChain && receiveChain.mitigations.length > 0) {
            receiveChain.mitigations.forEach((mitigation, index) => {
                const status = mitigation.state === 'On' ? chalk.green('ON') : chalk.gray('OFF');
                const mode = mitigation.mode === 'Active' ? chalk.red('[Active]') : chalk.yellow('[Passive]');
                lines.push(`│  ${index + 1}. ${mitigation.name} ${status} ${mode}               │`);
            });
        } else {
            lines.push(chalk.gray('│  No mitigations attached                                  │'));
        }

        lines.push(chalk.bold("└─────────────────────────────────────────────────────────────┘"));
        return lines.join('\n');
    }
}

