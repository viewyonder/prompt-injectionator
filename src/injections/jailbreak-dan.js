import { Injection } from '../core/Injection.js';

/**
 * DAN (Do Anything Now) jailbreak injection that attempts to bypass safety guidelines.
 */
export class JailbreakDanInjection extends Injection {
    constructor() {
        super({
            name: 'jailbreak-dan',
            type: 'Jailbreak (DAN)',
            description: 'Do Anything Now - attempts to bypass AI safety guidelines',
            patterns: [
                'do anything now',
                'pretend to be DAN',
                'bypass safety guidelines',
                'ignore previous instructions',
                /DAN.*mode/gi,
                /do.*anything.*now/gi,
                /ignore.*previous.*instructions/gi,
                /bypass.*restrictions/gi
            ]
        });
    }
}

export default JailbreakDanInjection;
