import { Injection } from '../core/Injection.js';

/**
 * Role-play injection attempts to simulate an expert scenario where the AI acts in a certain role.
 */
export class RolePlayInjection extends Injection {
    constructor() {
        super(
            'role-play',
            'Role Play',
            'Simulates an expert role or persona',
            ['simulate an expert', 'act as an expert', /expert.*mode/gi]
        );
    }
}

