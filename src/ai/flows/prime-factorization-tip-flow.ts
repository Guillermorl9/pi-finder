
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
The user is currently trying to factorize the number {{numberToFactorize}}.
Tailor your general strategy tip by considering the properties of this number (like its size, or if it's even or odd, or if it ends in 0 or 5), but remember, your tip must remain a general strategy and MUST NOT reveal any specific factors of {{numberToFactorize}} or any obvious divisibility that would make the current challenge too easy.
For example, if the number is even, you could remind them about dividing by 2. If it ends in 5, you could mention dividing by 5. If it's a large number, you might remind them about the square root trick.
{{/if}}
Make the tip different each time you are asked. Focus on general strategies.
General examples you could talk about if no specific property is obvious or if you want to provide a more general tip:
- Divisibility rules for other numbers (like 3, if the sum of digits is divisible by 3).
- The concept that one prime factor will always be less than or equal to the square root of the number.
- The importance of trying small prime numbers first.
- How to recognize if a number itself is prime after checking initial factors.
Keep the tip concise and actionable.
Example general tip: "Remember to check for divisibility by small primes like 2, 3, and 5 first!"
Another example general tip: "If a number isn't divisible by any primes up to its square root, it's prime itself!"
Example adapted tip for an even number: "Since the number is even, you know one of its prime factors right away! What is it?"
Example adapted tip for a number ending in 5: "A number ending in 5 has an obvious prime factor. See if you can spot it!"
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

