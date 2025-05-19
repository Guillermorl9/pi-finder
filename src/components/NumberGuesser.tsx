
"use client";

import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from "@/components/ui/alert";

const MIN_NUMBER = 1;
const MAX_NUMBER = 100;
const MAX_ATTEMPTS = 10;
const HINT_AFTER_ATTEMPTS = 4; // Hint becomes available after 4 failed attempts

export default function NumberGuesser() {
  const [secretNumber, setSecretNumber] = useState<number | null>(null);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [attemptsLeft, setAttemptsLeft] = useState<number>(MAX_ATTEMPTS);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [hintRevealed, setHintRevealed] = useState<boolean>(false);
  const [revealedHintText, setRevealedHintText] = useState<string>('');

  const generateSecretNumber = () => {
    // This will only run on the client, after initial hydration
    return Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER;
  };

  useEffect(() => {
    setSecretNumber(generateSecretNumber());
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentGuess(value);
    if (inputError) setInputError(null); // Clear error on new input
    if (!/^\d*$/.test(value)) {
      setInputError('Please enter only digits.');
    } else if (value) {
        const num = parseInt(value, 10);
        if (num < MIN_NUMBER || num > MAX_NUMBER) {
            setInputError(`Number must be between ${MIN_NUMBER} and ${MAX_NUMBER}.`);
        } else {
            setInputError(null);
        }
    }
  };

  const resetGame = () => {
    setSecretNumber(generateSecretNumber());
    setCurrentGuess('');
    setFeedbackMessage('');
    setAttemptsLeft(MAX_ATTEMPTS);
    setIsGameOver(false);
    setInputError(null);
    setHintRevealed(false);
    setRevealedHintText('');
  };

  const getHotOrColdFeedback = (guess: number, secret: number): string => {
    const diff = Math.abs(secret - guess);
    const direction = guess < secret ? "higher" : "lower";

    if (diff <= 5) return `Burning hot! Try ${direction}.`;
    if (diff <= 10) return `Hot! Try ${direction}.`;
    if (diff <= 20) return `Warm. Try ${direction}.`;
    if (diff <= 35) return `Cool. Try ${direction}.`;
    return `Cold. Try ${direction}.`;
  };

  const handleSubmitGuess = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isGameOver || secretNumber === null) return;
    if (!currentGuess) {
        setInputError("Please enter a guess.");
        return;
    }
    if (inputError) return;

    const guessNum = parseInt(currentGuess, 10);
    
    if (isNaN(guessNum) || guessNum < MIN_NUMBER || guessNum > MAX_NUMBER) {
      setInputError(`Number must be between ${MIN_NUMBER} and ${MAX_NUMBER}.`);
      return;
    }
    setInputError(null);

    const newAttemptsLeft = attemptsLeft - 1;
    setAttemptsLeft(newAttemptsLeft);

    if (guessNum === secretNumber) {
      setFeedbackMessage(`Congratulations! You guessed the number ${secretNumber} in ${MAX_ATTEMPTS - newAttemptsLeft} attempt${MAX_ATTEMPTS - newAttemptsLeft === 1 ? '' : 's'}!`);
      setIsGameOver(true);
    } else if (newAttemptsLeft === 0) {
      setFeedbackMessage(`Game Over! The secret number was ${secretNumber}.`);
      setIsGameOver(true);
    } else {
      setFeedbackMessage(getHotOrColdFeedback(guessNum, secretNumber));
    }
    setCurrentGuess('');
  };

  const handleRevealHint = () => {
    if (secretNumber === null) return;
    const hint = secretNumber % 2 === 0 ? "even" : "odd";
    setRevealedHintText(`Hint: The secret number is ${hint}.`);
    setHintRevealed(true);
  };

  const canShowHintButton = MAX_ATTEMPTS - attemptsLeft >= HINT_AFTER_ATTEMPTS && !isGameOver && !hintRevealed;

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center text-primary">Number Guesser</CardTitle>
        <CardDescription className="text-center font-mono pt-1">
          I'm thinking of a number between {MIN_NUMBER} and {MAX_NUMBER}. Can you guess it?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmitGuess} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="guessInput">Your Guess</Label>
            <Input
              id="guessInput"
              type="number" // Using number type for better mobile UX
              value={currentGuess}
              onChange={handleInputChange}
              placeholder={`Enter ${MIN_NUMBER}-${MAX_NUMBER}`}
              className="text-center text-lg font-mono h-12"
              disabled={isGameOver}
              min={MIN_NUMBER}
              max={MAX_NUMBER}
              aria-label="Your guess"
              aria-invalid={!!inputError}
              aria-describedby="input-error-message guess-info"
            />
            <p id="guess-info" className="text-xs text-muted-foreground text-center font-mono">
              You have {attemptsLeft} attempt{attemptsLeft === 1 ? '' : 's'} left.
            </p>
            {inputError && <p id="input-error-message" className="text-sm text-destructive text-center font-mono pt-1">{inputError}</p>}
          </div>
          <Button 
            type="submit" 
            className="w-full text-lg h-12"
            disabled={isGameOver || !!inputError || !currentGuess || secretNumber === null}
          >
            {secretNumber === null ? 'Loading...' : 'Submit Guess'}
          </Button>
        </form>
      </CardContent>
      
      {(feedbackMessage || revealedHintText || canShowHintButton) && (
        <CardFooter className="flex flex-col items-center justify-center pt-4 space-y-3">
          {feedbackMessage && (
            <Alert 
              variant={isGameOver && feedbackMessage.includes("Congratulations") ? "default" : (isGameOver ? "destructive" : "default")} 
              className="w-full text-center"
            >
              <AlertDescription className="font-mono text-base">
                {feedbackMessage}
              </AlertDescription>
            </Alert>
          )}
          {revealedHintText && (
            <Alert variant="default" className="w-full text-center border-primary/50">
              <AlertDescription className="font-mono text-sm text-primary">
                {revealedHintText}
              </AlertDescription>
            </Alert>
          )}
          {canShowHintButton && (
            <Button onClick={handleRevealHint} variant="outline" size="sm" className="text-accent-foreground hover:text-accent-foreground hover:bg-accent/80">
              Reveal Hint (Even/Odd)
            </Button>
          )}
        </CardFooter>
      )}

      {isGameOver && (
        <CardFooter className="flex justify-center pt-4">
          <Button onClick={resetGame} variant="outline" className="text-lg h-12">
            Play Again
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
