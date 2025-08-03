import { jest } from '@jest/globals';
import { Mitigation } from '../../src/core/Mitigation.js';
import { Injection } from '../../src/core/Injection.js';

jest.mock('../../src/core/Injection.js');

describe('Mitigation', () => {
  let mitigation;
  let injection1, injection2;

  beforeEach(() => {
    // Create mock injections with a default config
    injection1 = new Injection({ name: 'injection-one', type: 'string', description: 'Test'});
    injection2 = new Injection({ name: 'injection-two', type: 'string', description: 'Test'});
    injection1.detect = jest.fn().mockReturnValue({ detected: false });
    injection2.detect = jest.fn().mockReturnValue({ detected: false });

    mitigation = new Mitigation({
      name: 'test-mitigation',
      injections: [injection1, injection2]
    });
  });

  it('should process a prompt and not detect any injections', () => {
    const prompt = 'innocent prompt';
    const result = mitigation.process(prompt);
    expect(injection1.detect).toHaveBeenCalledWith(prompt);
    expect(injection2.detect).toHaveBeenCalledWith(prompt);
    expect(result.passed).toBe(true);
    expect(result.detections).toHaveLength(0);
  });

  it('should detect an injection and block in active mode', () => {
    injection1.detect.mockReturnValue({ detected: true, pattern: 'bad-word' });
    mitigation.setMode('Active');

    const prompt = 'prompt with a bad-word';
    const result = mitigation.process(prompt);

    expect(result.passed).toBe(false);
    expect(result.detections).toHaveLength(1);
    expect(result.detections[0].pattern).toBe('bad-word');
  });

  it('should detect an injection but pass in passive mode', () => {
    injection1.detect.mockReturnValue({ detected: true, pattern: 'bad-word' });
    mitigation.setMode('Passive');

    const prompt = 'prompt with a bad-word';
    const result = mitigation.process(prompt);

    expect(result.passed).toBe(true);
    expect(result.detections).toHaveLength(1);
  });

  it('should skip processing when in skip mode', () => {
    mitigation.setMode('Skip');
    const prompt = 'any prompt';
    const result = mitigation.process(prompt);

    expect(injection1.detect).not.toHaveBeenCalled();
    expect(injection2.detect).not.toHaveBeenCalled();
    expect(result.action).toBe('skipped');
  });
});
