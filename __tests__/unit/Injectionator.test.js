import { jest } from '@jest/globals';
import { Injectionator } from '../../src/core/Injectionator.js';
import { SendChain, ReceiveChain } from '../../src/core/Chain.js';
import { LLMBackend } from '../../src/backends/LLMBackend.js';

// Mock the dependencies
jest.mock('../../src/core/Chain.js');
jest.mock('../../src/backends/LLMBackend.js');

describe('Injectionator', () => {
  let sendChainMock, receiveChainMock, llmBackendMock, injectionator;

  beforeEach(() => {
    // Create mock instances for each dependency
    sendChainMock = new SendChain();
    receiveChainMock = new ReceiveChain();
    llmBackendMock = new LLMBackend();

    // Mock the process methods to control their behavior in tests
    sendChainMock.process = jest.fn().mockResolvedValue({ passed: true });
    receiveChainMock.process = jest.fn().mockResolvedValue({ passed: true });
    llmBackendMock.process = jest.fn().mockResolvedValue({ success: true, response: 'LLM response' });

    // Create a new Injectionator instance before each test
    injectionator = new Injectionator(
      'Test Injector',
      'A test injectionator',
      null,
      sendChainMock,
      receiveChainMock,
      llmBackendMock
    );
  });

  it('should execute the full flow successfully', async () => {
    const prompt = 'test prompt';
    const result = await injectionator.execute(prompt);

    // Verify that each step in the process was called
    expect(sendChainMock.process).toHaveBeenCalledWith(prompt);
    expect(llmBackendMock.process).toHaveBeenCalledWith(prompt);
    expect(receiveChainMock.process).toHaveBeenCalledWith('LLM response');
    
    // Check the final result
    expect(result.success).toBe(true);
    expect(result.finalResponse).toBe('LLM response');
  });

  it('should stop execution if the send chain blocks the prompt', async () => {
    // Arrange: Configure the send chain to block the request
    sendChainMock.process.mockResolvedValue({ passed: false, blockedBy: 'Malicious prompt filter' });

    const prompt = 'malicious prompt';
    const result = await injectionator.execute(prompt);

    // Assert that the flow was stopped after the send chain
    expect(sendChainMock.process).toHaveBeenCalledWith(prompt);
    expect(llmBackendMock.process).not.toHaveBeenCalled();
    expect(receiveChainMock.process).not.toHaveBeenCalled();

    // Check the result
    expect(result.success).toBe(false);
    expect(result.blockedAt).toBe('send_chain');
    expect(result.finalResponse).toContain('Request blocked by Malicious prompt filter');
  });

  it('should stop execution if the LLM backend fails', async () => {
    // Arrange: Configure the backend to return an error
    llmBackendMock.process.mockResolvedValue({ success: false, error: 'Backend capacity error' });

    const prompt = 'any prompt';
    const result = await injectionator.execute(prompt);

    // Assert that the flow stopped after the backend call
    expect(sendChainMock.process).toHaveBeenCalledWith(prompt);
    expect(llmBackendMock.process).toHaveBeenCalledWith(prompt);
    expect(receiveChainMock.process).not.toHaveBeenCalled();
    
    // Check the result
    expect(result.success).toBe(false);
    expect(result.blockedAt).toBe('llm_backend');
    expect(result.error).toBe('Backend capacity error');
    expect(result.finalResponse).toContain('Sorry, there was an error processing your request: Backend capacity error');
  });

  it('should stop execution if the receive chain blocks the response', async () => {
    // Arrange: Configure the receive chain to block the response
    receiveChainMock.process.mockResolvedValue({ passed: false, blockedBy: 'PII filter' });

    const prompt = 'a valid prompt';
    const result = await injectionator.execute(prompt);

    // Assert that the flow stopped after the receive chain
    expect(sendChainMock.process).toHaveBeenCalledWith(prompt);
    expect(llmBackendMock.process).toHaveBeenCalledWith(prompt);
    expect(receiveChainMock.process).toHaveBeenCalledWith('LLM response');

    // Check the result
    expect(result.success).toBe(false);
    expect(result.blockedAt).toBe('receive_chain');
    expect(result.finalResponse).toContain('Request blocked by PII filter');
  });
});
