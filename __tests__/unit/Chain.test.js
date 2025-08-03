import { jest } from '@jest/globals';
import { Chain, SendChain, ReceiveChain } from '../../src/core/Chain.js';
import { Mitigation } from '../../src/core/Mitigation.js';

jest.mock('../../src/core/Mitigation.js');

describe('Chain', () => {
  it('should process all mitigations in the chain', async () => {
    const mitigation1 = new Mitigation({ name: 'Mitigation 1' });
    const mitigation2 = new Mitigation({ name: 'Mitigation 2' });
    mitigation1.process = jest.fn().mockReturnValue({ passed: true });
    mitigation2.process = jest.fn().mockReturnValue({ passed: true });
    const chain = new Chain('Test Chain', [mitigation1, mitigation2]);
    const prompt = 'test prompt';
    await chain.process(prompt);
    expect(mitigation1.process).toHaveBeenCalledWith(prompt);
    expect(mitigation2.process).toHaveBeenCalledWith(prompt);
  });

  it('should stop processing if a mitigation fails in active mode', async () => {
    const mitigation1 = new Mitigation({ name: 'Mitigation 1', mode: 'Active' });
    mitigation1.process = jest.fn().mockReturnValue({ passed: false });
    const mitigation2 = new Mitigation({ name: 'Mitigation 2' });
    const chain = new Chain('Test Chain', [mitigation1, mitigation2]);
    const prompt = 'test prompt';
    const result = await chain.process(prompt);
    expect(mitigation1.process).toHaveBeenCalledWith(prompt);
    expect(mitigation2.process).not.toHaveBeenCalled();
    expect(result.passed).toBe(false);
    expect(result.blockedBy).toBe('Mitigation 1');
  });
});

describe('SendChain', () => {
  it('should validate that all mitigations have the `send` pipeline type', () => {
    const validMitigation = new Mitigation({ pipeline: 'send' });
    const invalidMitigation = new Mitigation({ pipeline: 'receive' });

    new SendChain('Valid Send Chain', '', null, null, [validMitigation]);

    expect(() => {
      new SendChain('Invalid Send Chain', '', null, null, [invalidMitigation]);
    }).toThrow('Cannot create SendChain with mitigation');
  });
});

describe('ReceiveChain', () => {
  it('should validate that all mitigations have the `receive` pipeline type', () => {
    const validMitigation = new Mitigation({ pipeline: 'receive' });
    const invalidMitigation = new Mitigation({ pipeline: 'send' });

    new ReceiveChain('Valid Receive Chain', '', null, null, [validMitigation]);

    expect(() => {
      new ReceiveChain('Invalid Receive Chain', '', null, null, [invalidMitigation]);
    }).toThrow('Cannot create ReceiveChain with mitigation');
  });
});
