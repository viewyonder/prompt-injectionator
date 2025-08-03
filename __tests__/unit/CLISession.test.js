import { jest } from '@jest/globals';
import { CLISession } from '../../src/cli/CLISession.js';
import { Injectionator } from '../../src/core/Injectionator.js';

// Mock the Injectionator class
jest.mock('../../src/core/Injectionator.js');

describe('CLISession', () => {
  let session;
  let mockInjectionator;

  beforeEach(() => {
    session = new CLISession();
    mockInjectionator = new Injectionator();
    mockInjectionator.name = 'test-injectionator';
  });

  it('should set and get the active injectionator', () => {
    session.setActiveInjectionator(mockInjectionator);
    expect(session.getActiveInjectionator()).toBe(mockInjectionator);
    expect(session.hasActiveInjectionator()).toBe(true);
  });

  it('should log and retrieve execution history', () => {
    session.setActiveInjectionator(mockInjectionator);
    session.logExecution('test prompt', { success: true });
    session.logExecution('another prompt', { success: false });

    const history = session.getExecutionHistory();
    expect(history).toHaveLength(2);
    expect(history[0].prompt).toBe('another prompt');
    expect(history[1].result.success).toBe(true);
  });

  it('should respect the max history size', () => {
    session.updateSettings({ maxHistoryEntries: 2 });
    session.logExecution('p1', { success: true });
    session.logExecution('p2', { success: true });
    session.logExecution('p3', { success: true });

    const history = session.getExecutionHistory();
    expect(history).toHaveLength(2);
    expect(history[0].prompt).toBe('p3');
  });

  it('should search logs correctly', () => {
    session.log('info', 'This is a test message');
    session.log('error', 'Something went wrong');
    
    const results = session.searchLogs('went wrong');
    expect(results).toHaveLength(1);
    expect(results[0].level).toBe('error');
  });

  it('should get session stats', () => {
    session.setActiveInjectionator(mockInjectionator);
    session.logExecution('p1', { success: true });
    session.logExecution('p2', { success: false });
    
    const stats = session.getSessionStats();

    expect(stats.totalExecutions).toBe(2);
    expect(stats.successfulExecutions).toBe(1);
    expect(stats.blockedExecutions).toBe(1);
    expect(stats.successRate).toBe('50.0%');
  });
});
