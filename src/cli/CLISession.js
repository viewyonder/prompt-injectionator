/**
 * CLISession - Manages CLI state and session data
 * 
 * Handles:
 * - Active injectionator tracking
 * - Execution history
 * - Session logs
 * - State persistence
 */

export class CLISession {
    constructor() {
        this.id = crypto.randomUUID();
        this.startTime = new Date();
        this.activeInjectionator = null;
        this.executionHistory = [];
        this.sessionLogs = [];
        this.settings = {
            logLevel: 'info',
            maxHistoryEntries: 100,
            maxLogEntries: 500
        };
    }

    /**
     * Set the active injectionator for this session
     * @param {Injectionator} injectionator - The injectionator to set as active
     */
    setActiveInjectionator(injectionator) {
        this.activeInjectionator = injectionator;
        this.log('info', `Set active injectionator: ${injectionator.name}`);
    }

    /**
     * Get the currently active injectionator
     * @returns {Injectionator|null} The active injectionator or null if none
     */
    getActiveInjectionator() {
        return this.activeInjectionator;
    }

    /**
     * Check if there's an active injectionator
     * @returns {boolean} True if there's an active injectionator
     */
    hasActiveInjectionator() {
        return this.activeInjectionator !== null;
    }

    /**
     * Log an execution result
     * @param {string} prompt - The executed prompt
     * @param {object} result - The execution result
     */
    logExecution(prompt, result) {
        const execution = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            prompt: prompt,
            result: result,
            injectionatorName: this.activeInjectionator?.name || 'Unknown',
            injectionatorId: this.activeInjectionator?.id || null
        };

        this.executionHistory.unshift(execution);
        
        // Limit history size
        if (this.executionHistory.length > this.settings.maxHistoryEntries) {
            this.executionHistory = this.executionHistory.slice(0, this.settings.maxHistoryEntries);
        }

        this.log('info', `Executed prompt: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''} - ${result.success ? 'SUCCESS' : 'BLOCKED'}`);
    }

    /**
     * Get execution history
     * @param {number} limit - Maximum number of entries to return
     * @returns {Array} Array of execution history entries
     */
    getExecutionHistory(limit = null) {
        if (limit) {
            return this.executionHistory.slice(0, limit);
        }
        return [...this.executionHistory];
    }

    /**
     * Log a message to the session
     * @param {string} level - Log level (error, warn, info, debug)
     * @param {string} message - Log message
     * @param {object} metadata - Additional metadata
     */
    log(level, message, metadata = {}) {
        const logEntry = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            level: level,
            message: message,
            metadata: metadata,
            sessionId: this.id
        };

        this.sessionLogs.unshift(logEntry);
        
        // Limit log size
        if (this.sessionLogs.length > this.settings.maxLogEntries) {
            this.sessionLogs = this.sessionLogs.slice(0, this.settings.maxLogEntries);
        }
    }

    /**
     * Get recent logs
     * @param {number} limit - Maximum number of log entries to return
     * @returns {Array} Array of log entries
     */
    getRecentLogs(limit = 20) {
        return this.sessionLogs.slice(0, limit);
    }

    /**
     * Search logs for a specific term
     * @param {string} searchTerm - Term to search for
     * @returns {Array} Array of matching log entries
     */
    searchLogs(searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return this.sessionLogs.filter(log => 
            log.message.toLowerCase().includes(searchLower) ||
            log.level.toLowerCase().includes(searchLower) ||
            JSON.stringify(log.metadata).toLowerCase().includes(searchLower)
        );
    }

    /**
     * Get session statistics
     * @returns {object} Session statistics
     */
    getSessionStats() {
        const successfulExecutions = this.executionHistory.filter(ex => ex.result.success).length;
        const blockedExecutions = this.executionHistory.filter(ex => !ex.result.success).length;
        
        return {
            sessionId: this.id,
            startTime: this.startTime,
            duration: Date.now() - this.startTime.getTime(),
            activeInjectionator: this.activeInjectionator?.name || 'None',
            totalExecutions: this.executionHistory.length,
            successfulExecutions: successfulExecutions,
            blockedExecutions: blockedExecutions,
            successRate: this.executionHistory.length > 0 ? 
                (successfulExecutions / this.executionHistory.length * 100).toFixed(1) + '%' : '0%',
            totalLogs: this.sessionLogs.length,
            logsByLevel: this.getLogsByLevel()
        };
    }

    /**
     * Get logs grouped by level
     * @returns {object} Logs grouped by level
     */
    getLogsByLevel() {
        const logsByLevel = { error: 0, warn: 0, info: 0, debug: 0 };
        this.sessionLogs.forEach(log => {
            if (logsByLevel.hasOwnProperty(log.level)) {
                logsByLevel[log.level]++;
            }
        });
        return logsByLevel;
    }

    /**
     * Update session settings
     * @param {object} newSettings - New settings to apply
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.log('info', 'Session settings updated', newSettings);
    }

    /**
     * Export session data for backup or analysis
     * @returns {object} Complete session data
     */
    exportSession() {
        return {
            id: this.id,
            startTime: this.startTime,
            activeInjectionator: this.activeInjectionator ? {
                id: this.activeInjectionator.id,
                name: this.activeInjectionator.name,
                description: this.activeInjectionator.description
            } : null,
            executionHistory: this.executionHistory,
            sessionLogs: this.sessionLogs,
            settings: this.settings,
            stats: this.getSessionStats()
        };
    }

    /**
     * Clear execution history
     */
    clearHistory() {
        this.executionHistory = [];
        this.log('info', 'Execution history cleared');
    }

    /**
     * Clear session logs
     */
    clearLogs() {
        this.sessionLogs = [];
        // Re-add the clear log entry
        this.log('info', 'Session logs cleared');
    }

    /**
     * Reset the entire session
     */
    reset() {
        this.activeInjectionator = null;
        this.executionHistory = [];
        this.sessionLogs = [];
        this.log('info', 'Session reset');
    }

    /**
     * Cleanup resources before session ends
     */
    cleanup() {
        const stats = this.getSessionStats();
        this.log('info', 'Session ending', stats);
        
        // Could save session data to file here if needed
        // this.saveSessionToFile();
    }

    /**
     * Get a summary of the current session for display
     * @returns {object} Session summary
     */
    getSummary() {
        const stats = this.getSessionStats();
        return {
            sessionId: this.id.substring(0, 8) + '...',
            duration: this.formatDuration(stats.duration),
            activeInjectionator: stats.activeInjectionator,
            executions: stats.totalExecutions,
            successRate: stats.successRate
        };
    }

    /**
     * Format duration in human-readable format
     * @param {number} milliseconds - Duration in milliseconds
     * @returns {string} Formatted duration
     */
    formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
}
