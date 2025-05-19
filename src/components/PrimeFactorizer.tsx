
"use client";

import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SMALL_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]; // Primes up to 37

interface Challenge {
  numberToFactorize: number;
  solutionFactors: number[];
}

export default function PrimeFactorizer() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const isPrime = (num: number): boolean => {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i = i + 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
  };

  const generateChallenge = (): Challenge => {
    let p1: number, p2: number;
    let numberToFactorize: number;

    // Ensure two distinct primes are chosen and their product is within a reasonable range
    do {
      const p1Index = Math.floor(Math.random() * (SMALL_PRIMES.length / 2)); // Bias towards smaller primes for p1
      const p2Index = Math.floor(Math.random() * SMALL_PRIMES.length);
      p1 = SMALL_PRIMES[p1Index];
      p2 = SMALL_PRIMES[p2Index];
      numberToFactorize = p1 * p2;
    } while (p1 === p2 || numberToFactorize < 100 || numberToFactorize > 1000); // Avoid trivial or overly large numbers

    const solutionFactors = [p1, p2].sort((a, b) => a - b);
    return { numberToFactorize, solutionFactors };
  };

  useEffect(() => {
    setChallenge(generateChallenge());
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
    if (feedback) setFeedback(null); // Clear feedback on new input
  };

  const startNewChallenge = () => {
    setChallenge(generateChallenge());
    setUserInput('');
    setFeedback(null);
    setIsGameOver(false);
    setIsChecking(false);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!challenge || isGameOver) return;

    setIsChecking(true);
    setFeedback(null);

    const enteredFactorsStr = userInput.split(/[, ]+/).filter(s => s.trim() !== '');
    const enteredFactorsNum = enteredFactorsStr.map(s => parseInt(s, 10));

    if (enteredFactorsNum.some(isNaN)) {
      setFeedback({ type: 'error', message: "Invalid input. Please enter numbers separated by commas or spaces." });
      setIsChecking(false);
      return;
    }

    if (enteredFactorsNum.length === 0) {
      setFeedback({ type: 'error', message: "Please enter at least one factor." });
      setIsChecking(false);
      return;
    }
    
    const productOfEnteredFactors = enteredFactorsNum.reduce((acc, val) => acc * val, 1);

    if (productOfEnteredFactors !== challenge.numberToFactorize) {
      setFeedback({ type: 'error', message: `The product of your factors (${productOfEnteredFactors}) does not equal ${challenge.numberToFactorize}.` });
      setIsChecking(false);
      return;
    }

    const allEnteredArePrime = enteredFactorsNum.every(isPrime);
    if (!allEnteredArePrime) {
      const nonPrime = enteredFactorsNum.find(n => !isPrime(n));
      setFeedback({ type: 'error', message: `At least one of your factors (${nonPrime}) is not a prime number.` });
      setIsChecking(false);
      return;
    }
    
    const sortedEnteredFactors = [...enteredFactorsNum].sort((a, b) => a - b);
    const sortedSolutionFactors = [...challenge.solutionFactors].sort((a, b) => a - b);

    if (JSON.stringify(sortedEnteredFactors) === JSON.stringify(sortedSolutionFactors)) {
      setFeedback({ type: 'success', message: `Correct! The prime factors of ${challenge.numberToFactorize} are ${challenge.solutionFactors.join(' and ')}.` });
      setIsGameOver(true);
    } else {
      // This case should be rare if product matches and all are prime, but covers other discrepancies
      setFeedback({ type: 'error', message: "Those are prime factors and their product is correct, but not the unique set we were looking for. Try again or check your factors." });
    }

    setIsChecking(false);
  };

  if (!challenge) {
    return (
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">Prime Factorizer</CardTitle>
          <CardDescription className="text-center font-mono pt-1">Loading challenge...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center text-primary">Prime Factorizer</CardTitle>
        <CardDescription className="text-center font-mono pt-1">
          Find the prime factors of the number below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground font-mono">Factorize this number:</p>
          <p className="text-5xl font-bold text-accent tracking-wider my-2">{challenge.numberToFactorize}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="factorsInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Enter prime factors (comma or space separated)
            </Label>
            <Input
              id="factorsInput"
              type="text"
              value={userInput}
              onChange={handleInputChange}
              placeholder="e.g., 2, 3, 5"
              className="text-center text-lg font-mono h-12"
              disabled={isGameOver || isChecking}
              aria-label="Prime factors input"
            />
             <p className="text-xs text-muted-foreground text-center font-mono pt-2">
              Example: For 15, enter "3, 5" or "5 3".
            </p>
          </div>
          <Button
            type="submit"
            className="w-full text-lg h-12"
            disabled={isGameOver || isChecking || !userInput.trim()}
          >
            {isChecking ? 'Checking...' : 'Check Factors'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center pt-4 space-y-3">
        {feedback && (
          <Alert variant={feedback.type === 'success' ? 'default' : 'destructive'} className="w-full text-center">
             {feedback.type === 'success' && <AlertTitle>Congratulations!</AlertTitle>}
             {feedback.type === 'error' && <AlertTitle>Oops!</AlertTitle>}
            <AlertDescription className={`font-mono text-base ${feedback.type === 'success' ? 'text-primary' : ''}`}>
              {feedback.message}
            </AlertDescription>
          </Alert>
        )}
        {isGameOver && (
          <Button onClick={startNewChallenge} variant="outline" className="text-lg h-12 mt-4">
            New Challenge
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
