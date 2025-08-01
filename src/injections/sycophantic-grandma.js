import { Injection } from '../core/Injection.js';

/**
 * Sycophantic Grandma injection using emotional manipulation to extract information.
 * Based on research by Axel Coustere showing how LLMs respond sycophantically to emotional appeals.
 */
export class SycophanticalGrandmaInjection extends Injection {
    constructor() {
        super(
            'sycophantic-grandma',
            'Sycophantic Grandma',
            'Uses emotional manipulation via fictional grandmother scenario to extract sensitive information',
            [
                'my grandmother used to',
                'in memory of my grandmother',
                'bedtime story about',
                'grandmother would tell me',
                'like my grandmother used to',
                /grandmother.*bedtime/gi,
                /memory.*grandmother/gi,
                /grandma.*lullaby/gi,
                /deceased.*grandmother/gi
            ]
        );
    }
}

export default SycophanticalGrandmaInjection;
