
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

export default function NumberGuesser() {
  const [secretNumber, setSecretNumber] = useState<number | null>(null);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [attemptsLeft, setAttemptsLeft] = useState<number>(MAX_ATTEMPTS);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [inputError, setInputError] = useState<string | null>(null);

  const generateSecretNumber = () => {
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
  };

  const handleSubmitGuess = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isGameOver || secretNumber === null) return;
    if (!currentGuess) {
        setInputError("Please enter a guess.");
        return;
    }
    if (inputError) return; // Don't submit if there's an existing validation error

    const guessNum = parseInt(currentGuess, 10);
    
    if (isNaN(guessNum) || guessNum < MIN_NUMBER || guessNum > MAX_NUMBER) {
      setInputError(`Number must be between ${MIN_NUMBER} and ${MAX_NUMBER}.`);
      return;
    }
    setInputError(null);

    const newAttemptsLeft = attemptsLeft - 1;
    setAttemptsLeft(newAttemptsLeft);

    if (guessNum === secretNumber) {
      setFeedbackMessage(`Congratulations! You guessed the number ${secretNumber} in ${MAX_ATTEMPTS - newAttemptsLeft} attempts!`);
      setIsGameOver(true);
    } else if (newAttemptsLeft === 0) {
      setFeedbackMessage(`Game Over! The secret number was ${secretNumber}.`);
      setIsGameOver(true);
    } else if (guessNum < secretNumber) {
      setFeedbackMessage('Too low! Try again.');
    } else {
      setFeedbackMessage('Too high! Try again.');
    }
    setCurrentGuess(''); // Clear input after guess
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center text-primary">Number Guesser</CardTitle>
        <CardDescription className="text-center font-mono pt-1">
          Guess the secret number between {MIN_NUMBER} and {MAX_NUMBER}. You have {MAX_ATTEMPTS} attempts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmitGuess} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="guessInput">Your Guess</Label>
            <Input
              id="guessInput"
              type="number"
              value={currentGuess}
              onChange={handleInputChange}
              placeholder={`Enter a number ${MIN_NUMBER}-${MAX_NUMBER}`}
              className="text-center text-lg font-mono h-12"
              disabled={isGameOver}
              min={MIN_NUMBER}
              max={MAX_NUMBER}
              aria-label="Your guess"
              aria-invalid={!!inputError}
              aria-describedby="input-error-message guess-info"
            />
            <p id="guess-info" className="text-xs text-muted-foreground text-center font-mono">
              You have {attemptsLeft} attempts left.
            </p>
            {inputError && <p id="input-error-message" className="text-sm text-destructive text-center font-mono pt-1">{inputError}</p>}
          </div>
          <Button 
            type="submit" 
            className="w-full text-lg h-12"
            disabled={isGameOver || !!inputError || !currentGuess}
          >
            Submit Guess
          </Button>
        </form>
      </CardContent>
      {feedbackMessage && (
        <CardFooter className="flex flex-col items-center justify-center pt-4">
          <Alert variant={isGameOver && feedbackMessage.includes("Congratulations") ? "default" : (isGameOver ? "destructive" : "default")} className="w-full text-center">
            <AlertDescription className="font-mono">
              {feedbackMessage}
            </AlertDescription>
          </Alert>
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
