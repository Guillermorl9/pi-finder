
"use client";

import { useState, type ChangeEvent, type FormEvent, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RollResult {
  name: string; // "1", "2", ..., "6"
  count: number;
}

export default function DiceRoller() {
  const [numRollsInput, setNumRollsInput] = useState<string>('100');
  const [boostedNumber, setBoostedNumber] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<RollResult[] | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationKey, setSimulationKey] = useState<number>(0); // Used to force re-render chart

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNumRollsInput(value);

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
    setResults(null); 

    setTimeout(() => {
      const counts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      
      let probabilities: number[];
      if (boostedNumber !== null) {
        probabilities = Array(6).fill(0).map((_, index) => {
          const currentDieFace = index + 1;
          if (currentDieFace === boostedNumber) {
            return (1/6) + 0.02; // Boosted probability
          } else {
            return (1/6) - (0.02 / 5); // Reduced probability for others
          }
        });
      } else {
        probabilities = Array(6).fill(1/6); // Equal probability
      }

      const rollDie = () => {
        const rand = Math.random();
        let cumulativeProbability = 0;
        for (let i = 0; i < 6; i++) {
          cumulativeProbability += probabilities[i];
          if (rand < cumulativeProbability) {
            return i + 1; // Die face (1-6)
          }
        }
        return 6; // Fallback for the very unlikely event Math.random() is 1 or due to floating point issues
      };

      for (let i = 0; i < num; i++) {
        const roll = rollDie();
        counts[roll]++;
      }
      const formattedResults: RollResult[] = Object.entries(counts).map(([key, value]) => ({
        name: key,
        count: value,
      }));
      setResults(formattedResults);
      setIsSimulating(false);
      setSimulationKey(prevKey => prevKey + 1); 
    }, 50); 
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
            {error && !numRollsInput && <p id="error-message" className="text-sm text-destructive text-center font-mono pt-1">{error}</p>}
            {error && numRollsInput && <p id="error-message" className="text-sm text-destructive text-center font-mono pt-1">{error}</p>}
          </div>

          <div className="space-y-3">
            <Label className="text-base">Boost a Number (Extra 2% Chance)</Label>
            <RadioGroup
              value={boostedNumber ? boostedNumber.toString() : "none"}
              onValueChange={(value) => {
                if (value === "none") {
                  setBoostedNumber(null);
                } else {
                  setBoostedNumber(parseInt(value, 10));
                }
              }}
              className="flex flex-wrap justify-center gap-x-4 gap-y-2 pt-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="boost-none" />
                <Label htmlFor="boost-none" className="font-normal">None</Label>
              </div>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} className="flex items-center space-x-2">
                  <RadioGroupItem value={num.toString()} id={`boost-${num}`} />
                  <Label htmlFor={`boost-${num}`} className="font-normal">{num}</Label>
                </div>
              ))}
            </RadioGroup>
             <p className="text-xs text-muted-foreground text-center font-mono">
              Select a number to give it a slight advantage.
            </p>
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
         </CardFooter>
      )}
      {results && !isSimulating && (
        <CardFooter className="flex flex-col items-center justify-center pt-6 w-full">
          <p className="text-lg font-mono text-center mb-4">
            Results for <span className="font-bold text-primary">{numRollsInput}</span> rolls:
            {boostedNumber && (
                <>
                <br />
                (Number <span className="font-bold text-accent">{boostedNumber}</span> was boosted)
                </>
            )}
          </p>
          <div className="w-full h-64 md:h-72">
            <ResponsiveContainer key={simulationKey} width="100%" height="100%">
              <BarChart data={results} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                <YAxis allowDecimals={false} stroke="hsl(var(--foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-lg)' 
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

