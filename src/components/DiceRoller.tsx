"use client";

import { useState, type ChangeEvent, type FormEvent, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RollResult {
  name: string; // "1", "2", ..., "6"
  count: number;
}

export default function DiceRoller() {
  const [numRollsInput, setNumRollsInput] = useState<string>('100');
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<RollResult[] | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationKey, setSimulationKey] = useState<number>(0); // Used to force re-render chart

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNumRollsInput(value);
    // Don't clear results immediately, allow user to see old results while typing
    // setResults(null); 

    if (!/^\d*$/.test(value)) {
      setError('Please enter only digits.');
    } else if (value) {
      const num = parseInt(value, 10);
      if (num < 1 || num > 1000) {
        setError('Number of rolls must be between 1 and 1000.');
      } else {
        setError(null);
      }
    } else {
      // Allow empty input, but error on submit if still empty
      setError(null); 
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!numRollsInput) {
        setError("Please enter the number of rolls.");
        return;
    }
    const num = parseInt(numRollsInput, 10);
    if (isNaN(num) || num < 1 || num > 1000) {
      setError('Number of rolls must be between 1 and 1000.');
      return;
    }
    setError(null);
    setIsSimulating(true);
    setResults(null); // Clear results before new simulation

    // Simulate dice rolls
    // setTimeout is used here to ensure the UI updates to show "Simulating..."
    // before the potentially blocking loop starts.
    setTimeout(() => {
      const counts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      for (let i = 0; i < num; i++) {
        const roll = Math.floor(Math.random() * 6) + 1;
        counts[roll]++;
      }
      const formattedResults: RollResult[] = Object.entries(counts).map(([key, value]) => ({
        name: key,
        count: value,
      }));
      setResults(formattedResults);
      setIsSimulating(false);
      setSimulationKey(prevKey => prevKey + 1); // Force re-render of chart
    }, 50); // Short delay for UI update
  };
  
  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center text-primary">Dice Roller</CardTitle>
        <CardDescription className="text-center font-mono pt-1">
          Simulate dice rolls and see the frequency of each number.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="numRollsInput">Number of Rolls (1-1000)</Label>
            <Input
              id="numRollsInput"
              type="number"
              value={numRollsInput}
              onChange={handleInputChange}
              placeholder="e.g., 100"
              className="text-center text-lg font-mono h-12"
              min="1"
              max="1000"
              aria-label="Number of dice rolls"
              aria-invalid={!!error}
              aria-describedby="error-message rolls-info"
            />
            <p id="rolls-info" className="text-xs text-muted-foreground text-center font-mono">
              Enter how many times you want to roll the dice.
            </p>
            {error && <p id="error-message" className="text-sm text-destructive text-center font-mono pt-1">{error}</p>}
          </div>
          <Button 
            type="submit" 
            className="w-full text-lg h-12"
            disabled={!!error || numRollsInput.length === 0 || isSimulating}
          >
            {isSimulating ? 'Simulating...' : 'Roll Dice'}
          </Button>
        </form>
      </CardContent>
      {isSimulating && (
         <CardFooter className="flex flex-col items-center justify-center pt-6">
            <p className="text-lg font-mono">Simulating rolls...</p>
            {/* You could add a simple visual loading indicator here if desired */}
         </CardFooter>
      )}
      {results && !isSimulating && (
        <CardFooter className="flex flex-col items-center justify-center pt-6 w-full">
          <p className="text-lg font-mono text-center mb-4">
            Results for <span className="font-bold text-primary">{numRollsInput}</span> rolls:
          </p>
          <div className="w-full h-64 md:h-72">
            <ResponsiveContainer key={simulationKey} width="100%" height="100%">
              <BarChart data={results} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                <YAxis allowDecimals={false} stroke="hsl(var(--foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))', /* Use card for popover-like bg */
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-lg)' /* Optional: add shadow if desired */
                  }}
                  labelStyle={{ color: 'hsl(var(--card-foreground))' }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                  cursor={{ fill: 'hsl(var(--accent)/0.3)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', color: 'hsl(var(--foreground))' }}/>
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
