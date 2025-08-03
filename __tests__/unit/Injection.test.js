import { Injection } from '../../src/core/Injection.js';

describe('Injection', () => {
  describe('constructor', () => {
    it('should create an injection with valid parameters', () => {
      const injection = new Injection({
        name: 'test-injection',
        type: 'Role Play',
        description: 'A test injection',
        patterns: ['some-pattern'],
      });
      expect(injection.name).toBe('test-injection');
      expect(injection.type).toBe('Role Play');
      expect(injection.patterns).toHaveLength(1);
    });

    it('should throw an error if required parameters are missing', () => {
      expect(() => new Injection({ name: 'test-injection', type: 'Role Play' })).toThrow('Name, type, and description are required');
    });
  });

  describe('detect', () => {
    it('should detect a simple string pattern', () => {
      const injection = new Injection({
        name: 'test-injection',
        type: 'Role Play',
        description: 'A test injection',
        patterns: ['bad-word'],
      });
      const result = injection.detect('this prompt contains a bad-word');
      expect(result.detected).toBe(true);
      expect(result.detections[0].pattern).toBe('bad-word');
    });

    it('should detect a regex pattern', () => {
        const injection = new Injection({
          name: 'test-injection',
          type: 'Role Play',
          description: 'A test injection',
          patterns: [/b.d-w.rd/i],
        });
        const result = injection.detect('this prompt contains a BaD-WoRd');
        expect(result.detected).toBe(true);
        expect(result.detections[0].pattern).toBe('b.d-w.rd');
      });
  });

  describe('toJSON and fromJSON', () => {
    it('should correctly serialize and deserialize an injection', () => {
      const originalInjection = new Injection({
        name: 'test-injection',
        type: 'Role Play',
        description: 'A test injection',
        patterns: ['string-pattern', /regex-pattern/gi],
      });
      const json = originalInjection.toJSON();
      const newInjection = Injection.fromJSON(json);
      expect(newInjection.name).toBe(originalInjection.name);
      expect(newInjection.type).toBe(originalInjection.type);
      expect(newInjection.patterns[0]).toBe('string-pattern');
      expect(newInjection.patterns[1]).toBeInstanceOf(RegExp);
      expect(newInjection.patterns[1].source).toBe('regex-pattern');
    });
  });
});
