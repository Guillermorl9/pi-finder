
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

interface SimulationParams {
  numRolls: string;
  boostInfo: {
    number: number;
    probability: number; // Stored as percentage, e.g., 25 for 25%
  } | null;
}

export default function DiceRoller() {
  const [numRollsInput, setNumRollsInput] = useState<string>('100');
  const [boostedNumber, setBoostedNumber] = useState<number | null>(null);
  const [targetProbabilityPercentInput, setTargetProbabilityPercentInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [probabilityError, setProbabilityError] = useState<string | null>(null);
  const [results, setResults] = useState<RollResult[] | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationKey, setSimulationKey] = useState<number>(0);
  const [lastSimulationParams, setLastSimulationParams] = useState<SimulationParams | null>(null);

  const handleNumRollsInputChange = (e: ChangeEvent<HTMLInputElement>) => {
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

  const handleProbabilityInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTargetProbabilityPercentInput(value);

    if (!value && boostedNumber !== null) { // Error if boosted but input is cleared
      setProbabilityError('Probability is required if a number is selected for boost.');
      return;
    }
    if (!value) { // Allow empty input if no boost selected or initial state
        setProbabilityError(null);
        return;
    }

    const num = parseFloat(value);
    if (isNaN(num)) {
      setProbabilityError('Please enter a valid number.');
    } else if (num < 0 || num > 100) {
      setProbabilityError('Probability must be between 0 and 100.');
    } else {
      setProbabilityError(null);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!numRollsInput) {
        setError("Please enter the number of rolls.");
        return;
    }
    const numRolls = parseInt(numRollsInput, 10);
    if (isNaN(numRolls) || numRolls < 1 || numRolls > 1000) {
      setError('Number of rolls must be between 1 and 1000.');
      return;
    }
    setError(null);

    let currentBoostInfo: SimulationParams['boostInfo'] = null;
    let targetProbValue: number | null = null;

    if (boostedNumber !== null) {
      if (!targetProbabilityPercentInput) {
        setProbabilityError('Probability is required if a number is selected for boost.');
        return;
      }
      targetProbValue = parseFloat(targetProbabilityPercentInput);
      if (isNaN(targetProbValue) || targetProbValue < 0 || targetProbValue > 100) {
        setProbabilityError('Probability must be between 0 and 100.');
        return;
      }
      setProbabilityError(null);
      currentBoostInfo = { number: boostedNumber, probability: targetProbValue };
    }


    setIsSimulating(true);
    setResults(null);

    // Simulate dice rolls
    setTimeout(() => {
      const counts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      let probabilities: number[] = Array(6).fill(1/6); // Default equal probability

      if (boostedNumber !== null && targetProbValue !== null) {
        const pTarget = targetProbValue / 100;
        if (pTarget >= 0 && pTarget <= 1) {
          const remainingProb = 1 - pTarget;
          const probPerOther = remainingProb / 5;
          probabilities = probabilities.map((_, index) => {
            const currentDieFace = index + 1;
            if (currentDieFace === boostedNumber) {
              return pTarget;
            } else {
              return probPerOther;
            }
          });
        }
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
        return 6; // Fallback
      };

      for (let i = 0; i < numRolls; i++) {
        const roll = rollDie();
        counts[roll]++;
      }
      const formattedResults: RollResult[] = Object.entries(counts).map(([key, value]) => ({
        name: key,
        count: value,
      }));
      setResults(formattedResults);
      setLastSimulationParams({ numRolls: numRollsInput, boostInfo: currentBoostInfo });
      setIsSimulating(false);
      setSimulationKey(prevKey => prevKey + 1);
    }, 50);
  };
  
  const isSubmitDisabled = !!error || 
                           numRollsInput.length === 0 || 
                           isSimulating || 
                           (boostedNumber !== null && (!!probabilityError || targetProbabilityPercentInput.length === 0));

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center text-primary">Dice Roller</CardTitle>
        <CardDescription className="text-center text-muted-foreground pt-2 text-sm">
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
              onChange={handleNumRollsInputChange}
              placeholder="e.g., 100"
              className="text-center text-lg font-mono h-12"
              min="1"
              max="1000"
              aria-label="Number of dice rolls"
              aria-invalid={!!error}
              aria-describedby="error-message rolls-info"
            />
            <p id="rolls-info" className="text-xs text-muted-foreground text-center">
              Enter how many times you want to roll the dice.
            </p>
            {error && <p id="error-message" className="text-sm text-destructive text-center pt-1">{error}</p>}
          </div>

          <div className="space-y-3">
            <Label className="text-base">Customize Chance for a Number</Label>
            <RadioGroup
              value={boostedNumber ? boostedNumber.toString() : "none"}
              onValueChange={(value) => {
                setTargetProbabilityPercentInput(""); // Reset probability input
                setProbabilityError(null);          // Clear probability error
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
             <p className="text-xs text-muted-foreground text-center pb-2">
              Select a number to customize its probability of appearing.
            </p>
            {boostedNumber !== null && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="targetProbabilityInput">Target Probability for {boostedNumber} (%)</Label>
                <Input
                  id="targetProbabilityInput"
                  type="number" // Using number type for better mobile UX and native validation hints
                  value={targetProbabilityPercentInput}
                  onChange={handleProbabilityInputChange}
                  placeholder="0-100"
                  className="text-center text-lg font-mono h-12"
                  min="0"
                  max="100"
                  step="0.1" // Allow decimals if desired, though parseFloat handles it
                  aria-label={`Target probability for number ${boostedNumber}`}
                  aria-invalid={!!probabilityError}
                  aria-describedby="probability-error-message probability-info-custom"
                />
                <p id="probability-info-custom" className="text-xs text-muted-foreground text-center">
                  Enter desired chance (0-100) for selected number.
                </p>
                {probabilityError && <p id="probability-error-message" className="text-sm text-destructive text-center pt-1">{probabilityError}</p>}
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full text-lg h-12"
            disabled={isSubmitDisabled}
          >
            {isSimulating ? 'Simulating...' : 'Roll Dice'}
          </Button>
        </form>
      </CardContent>
      {isSimulating && (
         <CardFooter className="flex flex-col items-center justify-center pt-6">
            <p className="text-lg">Simulating rolls...</p>
         </CardFooter>
      )}
      {results && !isSimulating && lastSimulationParams && (
        <CardFooter className="flex flex-col items-center justify-center pt-6 w-full">
          <p className="text-sm text-center mb-4">
            Results for <span className="font-bold text-primary">{lastSimulationParams.numRolls}</span> rolls:
            {lastSimulationParams.boostInfo && (
                <>
                <br />
                (Number <span className="font-bold text-accent">{lastSimulationParams.boostInfo.number}</span> targeted to <span className="font-bold text-accent">{lastSimulationParams.boostInfo.probability.toFixed(targetProbabilityPercentInput.includes('.') ? 2 : 0)}%</span> chance)
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

