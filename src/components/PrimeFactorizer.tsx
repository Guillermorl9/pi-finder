
"use client";

import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getPrimeFactorizationTip, type PrimeFactorizationTipInput } from '@/ai/flows/prime-factorization-tip-flow';
import { Loader2 } from 'lucide-react';

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
  
  const [aiTip, setAiTip] = useState<string>('');
  const [isFetchingAiTip, setIsFetchingAiTip] = useState<boolean>(false);

  const isPrime = (num: number): boolean => {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i = i + 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
  };

  const fetchNewAiTip = async (numberToFactorize?: number) => {
    setIsFetchingAiTip(true);
    setAiTip('');
    try {
      const tipInput: PrimeFactorizationTipInput = { numberToFactorize };
      const result = await getPrimeFactorizationTip(tipInput);
      setAiTip(result.tip);
    } catch (error) {
      console.error("Error fetching AI tip:", error);
      setAiTip("Tip: Always double-check if your factors are truly prime!");
    } finally {
      setIsFetchingAiTip(false);
    }
  };

  const generateChallenge = (): Challenge => {
    let p1: number, p2: number;
    let numberToFactorize: number;

    do {
      const p1Index = Math.floor(Math.random() * (SMALL_PRIMES.length / 2)); 
      const p2Index = Math.floor(Math.random() * SMALL_PRIMES.length);
      p1 = SMALL_PRIMES[p1Index];
      p2 = SMALL_PRIMES[p2Index];
      numberToFactorize = p1 * p2;
    } while (p1 === p2 || numberToFactorize < 100 || numberToFactorize > 1000); 

    const solutionFactors = [p1, p2].sort((a, b) => a - b);
    fetchNewAiTip(numberToFactorize); 
    return { numberToFactorize, solutionFactors };
  };

  useEffect(() => {
    setChallenge(generateChallenge());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
    if (feedback && !isGameOver) setFeedback(null); 
  };

  const startNewChallenge = () => {
    setChallenge(generateChallenge());
    setUserInput('');
    setFeedback(null);
    setIsGameOver(false);
    setIsChecking(false);
    // fetchNewAiTip is called inside generateChallenge
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
      setFeedback({ type: 'error', message: "Those are prime factors and their product is correct, but not the unique set we were looking for. Try again or check your factors." });
    }

    setIsChecking(false);
  };

  const handleRevealSolution = () => {
    if (!challenge) return;
    setFeedback({ 
      type: 'info', 
      message: `The prime factors of ${challenge.numberToFactorize} are ${challenge.solutionFactors.join(' and ')}.` 
    });
    setIsGameOver(true);
    setUserInput(''); 
    setAiTip(''); // Hide tip when solution is revealed
  };

  if (!challenge) {
    return (
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">Prime Factorizer</CardTitle>
          <CardDescription className="text-center font-mono pt-1">Loading challenge...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
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

        {!isGameOver && isFetchingAiTip && (
          <div className="flex items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Fetching AI tip...</span>
          </div>
        )}

        {!isGameOver && !isFetchingAiTip && aiTip && (
          <Alert variant="default" className="w-full text-left border-accent/30">
            <AlertTitle className="text-accent">AI Generated Tip</AlertTitle>
            <AlertDescription className="font-mono text-sm">
              {aiTip}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="factorsInput" className="block text-sm font-medium text-foreground mb-1">
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
          <div className="flex space-x-2">
            <Button
              type="submit"
              className="flex-1 text-lg h-12"
              disabled={isGameOver || isChecking || !userInput.trim()}
            >
              {isChecking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isChecking ? 'Checking...' : 'Check Factors'}
            </Button>
            {!isGameOver && (
              <Button
                type="button"
                variant="outline"
                className="text-sm h-12 px-3"
                onClick={handleRevealSolution}
                disabled={isChecking}
              >
                Reveal Solution
              </Button>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center pt-4 space-y-3">
        {feedback && (
          <Alert variant={feedback.type === 'destructive' ? 'destructive' : (feedback.type === 'success' ? 'default' : 'default')} className="w-full text-center">
             {feedback.type === 'success' && <AlertTitle>Congratulations!</AlertTitle>}
             {feedback.type === 'error' && <AlertTitle>Oops!</AlertTitle>}
             {feedback.type === 'info' && <AlertTitle>Solution</AlertTitle>}
            <AlertDescription className={`font-mono text-base ${feedback.type === 'success' ? 'text-primary' : (feedback.type === 'info' ? 'text-accent' : '')}`}>
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

