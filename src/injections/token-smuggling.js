import { Injection } from '../core/Injection.js';

/**
 * Token smuggling injection that uses encoding to hide malicious content.
 */
export class TokenSmugglingInjection extends Injection {
    constructor() {
        super(
            'token-smuggling',
            'Token Smuggling',
            'Uses encoding techniques like Base64 to hide malicious instructions',
            [
                'decode the following',
                'base64 decode',
                'decode this string',
                'execute the instructions within',
                'decode and follow',
                /base64.*decode/gi,
                /decode.*base64/gi,
                /hex.*decode/gi,
                /decode.*hex/gi,
                /rot13.*decode/gi,
                /decode.*rot13/gi
            ]
        );
    }
}

export default TokenSmugglingInjection;
