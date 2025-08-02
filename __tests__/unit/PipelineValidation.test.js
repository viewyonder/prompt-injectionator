import { Injection } from '../../src/core/Injection.js';
import { Mitigation } from '../../src/core/Mitigation.js';
import { SendChain, ReceiveChain } from '../../src/core/Chain.js';

// Mock crypto.randomUUID for ES modules
global.crypto = {
    randomUUID: () => 'pipeline-test-uuid-' + Date.now()
};

describe('Pipeline Validation Tests', () => {
    let injection;

    beforeEach(() => {
        injection = new Injection(
            'test-injection',
            'malicious',
            'Test injection pattern',
            ['test pattern']
        );
    });

    describe('Mitigation Pipeline Configuration', () => {
        test('should create mitigation with default send pipeline', () => {
            const mitigation = new Mitigation(
                'Test Mitigation',
                'Test description',
                null,
                [injection]
            );

            expect(mitigation.pipeline).toBe('send');
        });

        test('should create mitigation with send pipeline', () => {
            const mitigation = new Mitigation(
                'Send Mitigation',
                'Test description',
                null,
                [injection],
                'On',
                'Active',
                'abort',
                'send'
            );

            expect(mitigation.pipeline).toBe('send');
        });

        test('should create mitigation with receive pipeline', () => {
            const mitigation = new Mitigation(
                'Receive Mitigation',
                'Test description',
                null,
                [injection],
                'On',
                'Active',
                'abort',
                'receive'
            );

            expect(mitigation.pipeline).toBe('receive');
        });

        test('should throw error for invalid pipeline', () => {
            expect(() => {
                new Mitigation(
                    'Invalid Mitigation',
                    'Test description',
                    null,
                    [injection],
                    'On',
                    'Active',
                    'abort',
                    'invalid'
                );
            }).toThrow('Invalid pipeline: invalid. Must be one of: send, receive');
        });

        test('should include pipeline in getDetails()', () => {
            const mitigation = new Mitigation(
                'Test Mitigation',
                'Test description',
                null,
                [injection],
                'On',
                'Active',
                'abort',
                'receive'
            );

            const details = mitigation.getDetails();
            expect(details.pipeline).toBe('receive');
        });
    });

    describe('SendChain Pipeline Validation', () => {
        test('should create SendChain with send mitigations', () => {
            const sendMitigation = new Mitigation(
                'Send Mitigation',
                'Test description',
                null,
                [injection],
                'On',
                'Active',
                'abort',
                'send'
            );

            const sendChain = new SendChain(
                'Test Send Chain',
                'Test description',
                null,
                null,
                [sendMitigation]
            );

            expect(sendChain.mitigations).toHaveLength(1);
            expect(sendChain.mitigations[0].pipeline).toBe('send');
        });

        test('should throw error when creating SendChain with receive mitigation', () => {
            const receiveMitigation = new Mitigation(
                'Receive Mitigation',
                'Test description',
                null,
                [injection],
                'On',
                'Active',
                'abort',
                'receive'
            );

            expect(() => {
                new SendChain(
                    'Test Send Chain',
                    'Test description',
                    null,
                    null,
                    [receiveMitigation]
                );
            }).toThrow("Cannot create SendChain with mitigation 'Receive Mitigation' that has pipeline 'receive'. Expected 'send'.");
        });

        test('should add send mitigation to SendChain', () => {
            const sendChain = new SendChain('Test Send Chain');
            const sendMitigation = new Mitigation(
                'Send Mitigation',
                'Test description',
                null,
                [injection],
                'On',
                'Active',
                'abort',
                'send'
            );

            sendChain.addMitigation(sendMitigation);
            expect(sendChain.mitigations).toHaveLength(1);
            expect(sendChain.mitigations[0].pipeline).toBe('send');
        });

        test('should throw error when adding receive mitigation to SendChain', () => {
            const sendChain = new SendChain('Test Send Chain');
            const receiveMitigation = new Mitigation(
                'Receive Mitigation',
                'Test description',
                null,
                [injection],
                'On',
                'Active',
                'abort',
                'receive'
            );

            expect(() => {
                sendChain.addMitigation(receiveMitigation);
            }).toThrow("Cannot add mitigation with pipeline 'receive' to send chain. Expected 'send'.");
        });
    });

    describe('ReceiveChain Pipeline Validation', () => {
        test('should create ReceiveChain with receive mitigations', () => {
            const receiveMitigation = new Mitigation(
                'Receive Mitigation',
                'Test description',
                null,
                [injection],
                'On',
                'Active',
                'abort',
                'receive'
            );

            const receiveChain = new ReceiveChain(
                'Test Receive Chain',
                'Test description',
                null,
                null,
                [receiveMitigation]
            );

            expect(receiveChain.mitigations).toHaveLength(1);
            expect(receiveChain.mitigations[0].pipeline).toBe('receive');
        });

        test('should throw error when creating ReceiveChain with send mitigation', () => {
            const sendMitigation = new Mitigation(
                'Send Mitigation',
                'Test description',
                null,
                [injection],
                'On',
                'Active',
                'abort',
                'send'
            );

            expect(() => {
                new ReceiveChain(
                    'Test Receive Chain',
                    'Test description',
                    null,
                    null,
                    [sendMitigation]
                );
            }).toThrow("Cannot create ReceiveChain with mitigation 'Send Mitigation' that has pipeline 'send'. Expected 'receive'.");
        });

        test('should add receive mitigation to ReceiveChain', () => {
            const receiveChain = new ReceiveChain('Test Receive Chain');
            const receiveMitigation = new Mitigation(
                'Receive Mitigation',
                'Test description',
                null,
                [injection],
                'On',
                'Active',
                'abort',
                'receive'
            );

            receiveChain.addMitigation(receiveMitigation);
            expect(receiveChain.mitigations).toHaveLength(1);
            expect(receiveChain.mitigations[0].pipeline).toBe('receive');
        });

        test('should throw error when adding send mitigation to ReceiveChain', () => {
            const receiveChain = new ReceiveChain('Test Receive Chain');
            const sendMitigation = new Mitigation(
                'Send Mitigation',
                'Test description',
                null,
                [injection],
                'On',
                'Active',
                'abort',
                'send'
            );

            expect(() => {
                receiveChain.addMitigation(sendMitigation);
            }).toThrow("Cannot add mitigation with pipeline 'send' to receive chain. Expected 'receive'.");
        });
    });

    describe('Functional Pipeline Tests', () => {
        test('should process send chain with send mitigations correctly', async () => {
            const sendMitigation = new Mitigation(
                'Send Mitigation',
                'Test description',
                null,
                [injection],
                'On',
                'Passive',
                'abort',
                'send'
            );

            const sendChain = new SendChain(
                'Test Send Chain',
                'Test description',
                null,
                null,
                [sendMitigation]
            );

            const result = await sendChain.process('test pattern detected');
            expect(result.passed).toBe(true); // Passive mode allows
            expect(result.results).toHaveLength(1);
            expect(result.results[0].action).toBe('reported');
        });

        test('should process receive chain with receive mitigations correctly', async () => {
            const receiveMitigation = new Mitigation(
                'Receive Mitigation',
                'Test description',
                null,
                [injection],
                'On',
                'Active',
                'abort',
                'receive'
            );

            const receiveChain = new ReceiveChain(
                'Test Receive Chain',
                'Test description',
                null,
                null,
                [receiveMitigation]
            );

            const result = await receiveChain.process('test pattern detected');
            expect(result.passed).toBe(false); // Active mode blocks
            expect(result.results).toHaveLength(1);
            expect(result.results[0].action).toBe('blocked');
        });
    });
});
