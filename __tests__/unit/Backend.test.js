import { Backend } from '../../src/backends/Backend.js';

describe('Backend', () => {
  it('should throw an error if the process method is not implemented', async () => {
    class TestBackend extends Backend {}
    const backend = new TestBackend();
    await expect(backend.process('test')).rejects.toThrow('Backend.process() must be implemented by subclass');
  });
});
