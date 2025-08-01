import { Injection } from '../core/Injection.js';

/**
 * Context switching injection that frames malicious requests within safe-looking contexts.
 */
export class ContextSwitchInjection extends Injection {
    constructor() {
        super(
            'context-switch',
            'Context Switch',
            'Frames malicious requests within hypothetical scenarios, stories, or plays',
            [
                'write a scene for a play',
                'hypothetically speaking',
                'in a fictional scenario',
                'for educational purposes',
                'for a story I\'m writing',
                'in this hypothetical',
                /hypothetical.*scenario/gi,
                /fictional.*story/gi,
                /educational.*purposes/gi,
                /academic.*research/gi,
                /creative.*writing/gi,
                /roleplay.*scenario/gi
            ]
        );
    }
}

export default ContextSwitchInjection;
