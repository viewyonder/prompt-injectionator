import chalk from 'chalk';

/**
 * StatusFormatter provides consistent formatting utilities for CLI output
 */
export class StatusFormatter {
    
    // Color constants
    static colors = {
        success: chalk.green,
        error: chalk.red,
        warning: chalk.yellow,
        info: chalk.blue,
        muted: chalk.gray,
        highlight: chalk.cyan,
        active: chalk.green,
        inactive: chalk.gray,
        activeMode: chalk.red,
        passiveMode: chalk.yellow
    };
    
    // Icon constants
    static icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        active: '✓',
        inactive: '✘',
        prompt: '📝',
        sendChain: '📤',
        receiveChain: '📥',
        backend: '🔗',
        log: '📋',
        time: '⏱️',
        blocked: '🛑',
        processing: '⚙️'
    };
    
    /**
     * Format mitigation status with consistent colors and icons
     * @param {object} mitigation - Mitigation object
     * @returns {string} Formatted status string
     */
    static formatMitigationStatus(mitigation) {
        const statusIcon = mitigation.state === 'On' ? this.icons.active : this.icons.inactive;
        const statusColor = mitigation.state === 'On' ? this.colors.active : this.colors.inactive;
        const statusText = statusColor(mitigation.state === 'On' ? 'ON' : 'OFF');
        
        const modeColor = mitigation.mode === 'Active' ? this.colors.activeMode : this.colors.passiveMode;
        const modeText = modeColor(`[${mitigation.mode}]`);
        
        return `${statusIcon} ${mitigation.name} ${statusText} ${modeText}`;
    }
    
    /**
     * Format backend information without exposing sensitive data
     * @param {object} backend - Backend object
     * @returns {string} Formatted backend info
     */
    static formatBackendInfo(backend) {
        if (!backend) {
            return this.colors.muted('Not configured');
        }
        
        const type = this.colors.info(backend.constructor.name || 'Unknown');
        
        // Safely get endpoint without exposing full URL
        let endpoint = 'Not configured';
        if (backend.config && backend.config.endpoint) {
            // Extract domain from URL for display
            try {
                const url = new URL(backend.config.endpoint);
                endpoint = this.colors.highlight(url.hostname);
            } catch {
                endpoint = this.colors.highlight('Custom endpoint');
            }
        }
        
        return `Type: ${type} | Endpoint: ${endpoint}`;
    }
    
    /**
     * Format execution result status
     * @param {object} executionResult - Execution result object
     * @returns {string} Formatted status
     */
    static formatExecutionStatus(executionResult) {
        if (executionResult.success) {
            return this.colors.success(`${this.icons.success} SUCCESS`);
        } else {
            const blockedAt = executionResult.blockedAt ? 
                ` (blocked at ${executionResult.blockedAt.replace('_', ' ')})` : '';
            return this.colors.error(`${this.icons.error} BLOCKED${blockedAt}`);
        }
    }
    
    /**
     * Format duration in human-readable format
     * @param {number} milliseconds - Duration in milliseconds
     * @returns {string} Formatted duration
     */
    static formatDuration(milliseconds) {
        if (milliseconds < 1000) {
            return `${milliseconds}ms`;
        } else if (milliseconds < 60000) {
            return `${(milliseconds / 1000).toFixed(1)}s`;
        } else {
            const minutes = Math.floor(milliseconds / 60000);
            const seconds = Math.floor((milliseconds % 60000) / 1000);
            return `${minutes}m ${seconds}s`;
        }
    }
    
    /**
     * Truncate text with ellipsis if too long
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length before truncation
     * @returns {string} Truncated text
     */
    static truncateText(text, maxLength = 50) {
        if (!text || text.length <= maxLength) {
            return text || '';
        }
        return text.substring(0, maxLength - 3) + '...';
    }
    
    /**
     * Create a separator line
     * @param {number} length - Line length
     * @param {string} char - Character to use
     * @returns {string} Separator line
     */
    static separator(length = 60, char = '─') {
        return char.repeat(length);
    }
    
    /**
     * Create a box border for ASCII diagrams
     * @param {string} position - 'top', 'bottom', 'middle'
     * @param {number} width - Box width
     * @returns {string} Border line
     */
    static boxBorder(position, width = 61) {
        const chars = {
            top: { left: '┌', right: '┐', middle: '─' },
            bottom: { left: '└', right: '┘', middle: '─' },
            middle: { left: '│', right: '│', middle: ' ' }
        };
        
        const { left, right, middle } = chars[position] || chars.middle;
        return left + middle.repeat(width - 2) + right;
    }
    
    /**
     * Center text within a given width
     * @param {string} text - Text to center
     * @param {number} width - Total width
     * @returns {string} Centered text with padding
     */
    static centerText(text, width) {
        const padding = Math.max(0, width - text.length);
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;
        return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
    }
    
    /**
     * Format a chain title with icon
     * @param {string} chainType - 'send' or 'receive'
     * @returns {string} Formatted chain title
     */
    static formatChainTitle(chainType) {
        const icon = chainType === 'send' ? this.icons.sendChain : this.icons.receiveChain;
        const name = chainType === 'send' ? 'SEND CHAIN MITIGATIONS' : 'RECEIVE CHAIN MITIGATIONS';
        return `${icon} ${name}`;
    }
}
