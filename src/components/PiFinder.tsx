"use client";

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PI_FIRST_2000_DECIMALS, searchNumberInPi, type SearchResult } from '@/lib/pi';

export default function PiFinder() {
  const [inputValue, setInputValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setResult(null); // Clear previous result on new input

    if (!/^\d*$/.test(value)) {
      setError('Please enter only digits.');
    } else if (value.length > 6) {
      setError('Number cannot exceed 6 digits.');
    } else {
      setError(null);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.length === 0) {
      setError("Please enter a number.");
      return;
    }
    if (error) { // If there's a validation error already (e.g. non-digits, too long)
      return;
    }
    
    // Final check, though covered by length and regex mostly
    const numericValue = parseInt(inputValue, 10);
    if (numericValue < 0 || numericValue > 999999) {
      setError('Number must be between 0 and 999999.');
      return;
    }
    
    setError(null);
    const searchRes = searchNumberInPi(inputValue);
    setResult(searchRes);
  };

  const getContextualPiSlice = (searchTerm: string, position: number) => {
    const zeroBasedPosition = position - 1;
    const contextBefore = PI_FIRST_2000_DECIMALS.substring(Math.max(0, zeroBasedPosition - 15), zeroBasedPosition);
    const contextAfter = PI_FIRST_2000_DECIMALS.substring(zeroBasedPosition + searchTerm.length, zeroBasedPosition + searchTerm.length + 15);
    return (
      <>
        {zeroBasedPosition > 15 ? "..." : ""}
        {contextBefore}
        <span className="text-primary font-bold bg-accent/20 px-1 rounded mx-px">
          {searchTerm}
        </span>
        {contextAfter}
        {zeroBasedPosition + searchTerm.length + 15 < PI_FIRST_2000_DECIMALS.length ? "..." : ""}
      </>
    );
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center text-primary">Pi Finder</CardTitle>
        <CardDescription className="text-center font-mono pt-1">
          Search in the first 2000 decimal places of Pi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="piSearchInput" className="sr-only">Number to search</Label>
            <Input
              id="piSearchInput"
              type="text" 
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter 0-999999"
              className="text-center text-lg font-mono h-12"
              maxLength={6}
              aria-label="Number to search in Pi"
              aria-invalid={!!error}
              aria-describedby="error-message pi-decimal-info"
            />
            <p id="pi-decimal-info" className="text-xs text-muted-foreground text-center font-mono">
              Input a number with up to 6 digits.
            </p>
            {error && <p id="error-message" className="text-sm text-destructive text-center font-mono pt-1">{error}</p>}
          </div>
          <Button 
            type="submit" 
            className="w-full text-lg h-12"
            disabled={!!error || inputValue.length === 0}
          >
            Search
          </Button>
        </form>
      </CardContent>
      {result && (
        <CardFooter className="flex flex-col items-center justify-center pt-6">
          <p className="text-lg font-mono text-center">
            {result.found ? (
              <>
                Number <span className="font-bold text-primary">{result.searchedTerm}</span> found at position{' '}
                <span className="font-bold">{result.position}</span>.
              </>
            ) : (
              <>
                Number <span className="font-bold text-primary">{result.searchedTerm}</span> not found.
              </>
            )}
          </p>
          {result.found && result.position !== null && result.searchedTerm.length > 0 && (
            <div className="mt-4 p-3 bg-secondary rounded-md w-full overflow-x-auto text-center">
              <p className="font-mono text-sm text-muted-foreground break-all">
                {getContextualPiSlice(result.searchedTerm, result.position)}
              </p>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

// Need to import Label from shadcn/ui if not already available through another component
// For this specific file, as it's self-contained and Label is simple, it's fine.
// If not, ensure `import { Label } from '@/components/ui/label';` is present.
// It seems Label might not be automatically included, so I will add it.
import { Label } from '@/components/ui/label';
