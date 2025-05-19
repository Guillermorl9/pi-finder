
'use server';
/**
 * @fileOverview A Genkit flow to generate unique prime factorization tips.
 *
 * - getPrimeFactorizationTip - A function that generates a tip.
 * - PrimeFactorizationTipInput - The input type for the tip generation.
 * - PrimeFactorizationTipOutput - The return type for the tip generation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrimeFactorizationTipInputSchema = z.object({
  numberToFactorize: z.number().optional().describe('The number the user is trying to factorize. The tip should be general and not reveal factors of this specific number.'),
});
export type PrimeFactorizationTipInput = z.infer<typeof PrimeFactorizationTipInputSchema>;

const PrimeFactorizationTipOutputSchema = z.object({
  tip: z.string().describe('A unique and helpful strategy tip for finding prime factors.'),
});
export type PrimeFactorizationTipOutput = z.infer<typeof PrimeFactorizationTipOutputSchema>;

export async function getPrimeFactorizationTip(input: PrimeFactorizationTipInput): Promise<PrimeFactorizationTipOutput> {
  return primeFactorizationTipFlow(input);
}

const prompt = ai.definePrompt({
  name: 'primeFactorizationTipPrompt',
  input: {schema: PrimeFactorizationTipInputSchema},
  output: {schema: PrimeFactorizationTipOutputSchema},
  prompt: `You are a friendly and encouraging math tutor. The user is playing a prime factorization game.
Provide a short, unique, and helpful strategy tip for finding the prime factors of a number.
{{#if numberToFactorize}}
The user is currently trying to factorize the number {{numberToFactorize}}. Your tip should be a general strategy and NOT reveal specific factors for this number.
{{/if}}
Make the tip different each time you are asked. Focus on general strategies.
For example, you could talk about:
- Divisibility rules (for 2, 3, 5, etc.).
- The concept that one prime factor will always be less than or equal to the square root of the number.
- The importance of trying small prime numbers first.
- How to recognize if a number itself is prime.
Keep the tip concise and actionable.
Example tip: "Remember to check for divisibility by small primes like 2, 3, and 5 first!"
Another example: "If a number isn't divisible by any primes up to its square root, it's prime itself!"
`,
});

const primeFactorizationTipFlow = ai.defineFlow(
  {
    name: 'primeFactorizationTipFlow',
    inputSchema: PrimeFactorizationTipInputSchema,
    outputSchema: PrimeFactorizationTipOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        return { tip: "Sorry, I couldn't think of a tip right now. Try checking for small prime factors first!" };
    }
    return output;
  }
);
