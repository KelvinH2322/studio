"use client";

import { useState, useEffect, useCallback } from 'react';
import { TROUBLESHOOT_DATA, INSTRUCTION_GUIDES, COFFEE_MACHINES } from '@/lib/data';
import type { TroubleshootStep, TroubleshootQuestion, TroubleshootSolution, CoffeeMachine, InstructionGuide } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, MessageSquare, Settings2, ExternalLink, Info, Search } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";


export default function TroubleshootPage() {
  const [currentStepId, setCurrentStepId] = useState<string>('symptom-start');
  const [history, setHistory] = useState<string[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<CoffeeMachine | null>(null);
  const { toast } = useToast();

  const currentStep = TROUBLESHOOT_DATA.find(step => step.id === currentStepId) as TroubleshootStep | undefined;

  const handleOptionClick = (nextStepId: string) => {
    setHistory([...history, currentStepId]);
    setCurrentStepId(nextStepId);
  };

  const handleBack = () => {
    const previousStepId = history.pop();
    if (previousStepId) {
      setCurrentStepId(previousStepId);
      setHistory([...history]);
    }
  };

  const handleRestart = () => {
    setCurrentStepId('symptom-start');
    setHistory([]);
    // setSelectedMachine(null); // Optionally reset machine selection
    toast({
        title: "Troubleshooting Restarted",
        description: "You are back at the beginning. Please select your symptom.",
        variant: "default",
    });
  };

  const handleMachineSelect = (machineId: string) => {
    const machine = COFFEE_MACHINES.find(m => m.id === machineId);
    setSelectedMachine(machine || null);
    toast({
        title: "Machine Selected",
        description: `${machine?.brand} ${machine?.model} selected. This may help tailor suggestions.`,
    });
  };

  const getRelevantGuide = useCallback((guideId?: string): InstructionGuide | undefined => {
    if (!guideId) return undefined;
    let guide = INSTRUCTION_GUIDES.find(g => g.id === guideId);
    
    // If a machine is selected and the specific guide doesn't match, try to find a generic one for the brand or category
    if (selectedMachine && guide && (guide.machineBrand !== selectedMachine.brand || guide.machineModel !== selectedMachine.model)) {
      // Try to find a guide for the same brand & category, but generic model
      const brandCategoryGuide = INSTRUCTION_GUIDES.find(g => 
        g.machineBrand === selectedMachine.brand && 
        g.category === guide?.category && 
        (g.machineModel === 'Generic' || g.machineModel === selectedMachine.model) // Prioritize specific model, then generic
      );
      if (brandCategoryGuide) guide = brandCategoryGuide;
      else {
        // Try to find a generic guide for the same category
        const genericCategoryGuide = INSTRUCTION_GUIDES.find(g => 
          g.machineBrand === 'Generic' && 
          g.category === guide?.category
        );
        if (genericCategoryGuide) guide = genericCategoryGuide;
      }
    }
    return guide;
  }, [selectedMachine]);


  if (!currentStep) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Troubleshooting step not found. Please restart.
          </AlertDescription>
        </Alert>
        <Button onClick={handleRestart} className="mt-4">Restart Troubleshooting</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 flex flex-col items-center">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="bg-secondary/30 dark:bg-secondary/50 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-primary flex items-center">
              <Settings2 className="mr-3 h-7 w-7" /> Troubleshooting Assistant
            </CardTitle>
            {history.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleBack} className="text-sm">
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
            )}
          </div>
          <CardDescription className="mt-1">
            Let&apos;s diagnose the issue with your coffee machine.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {!selectedMachine ? (
            <div className="space-y-3 p-4 border rounded-lg bg-background shadow">
              <h3 className="text-lg font-semibold text-foreground">First, select your coffee machine (optional):</h3>
              <p className="text-sm text-muted-foreground">This helps us provide more relevant suggestions.</p>
              <Select onValueChange={handleMachineSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your machine model" />
                </SelectTrigger>
                <SelectContent>
                  {COFFEE_MACHINES.map(machine => (
                    <SelectItem key={machine.id} value={machine.id}>
                      {machine.brand} - {machine.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="link" onClick={() => setSelectedMachine({id: 'skip', brand: 'Skip', model: 'Selection'})} className="text-sm p-0 h-auto">
                Skip machine selection for now
              </Button>
            </div>
          ) : (
             <div className="p-3 border rounded-lg bg-secondary/20 dark:bg-secondary/40 text-sm">
              <p className="font-medium text-foreground">
                Selected Machine: <span className="font-bold">{selectedMachine.brand} {selectedMachine.model}</span>
              </p>
              <Button variant="link" onClick={() => setSelectedMachine(null)} className="text-xs p-0 h-auto text-accent hover:text-accent/80">
                Change machine
              </Button>
            </div>
          )}

          <div className="p-6 border rounded-lg bg-background shadow-inner">
            <p className="text-lg font-semibold mb-4 text-foreground flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-primary" /> {currentStep.text || (currentStep as TroubleshootSolution).title}
            </p>

            {currentStep.type === 'question' && (
              <div className="space-y-3">
                {(currentStep as TroubleshootQuestion).options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleOptionClick(option.nextStepId)}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3"
                  >
                    {option.text}
                  </Button>
                ))}
              </div>
            )}

            {currentStep.type === 'solution' && (
              <div className="space-y-4">
                <p className="text-muted-foreground">{(currentStep as TroubleshootSolution).description}</p>
                {(currentStep as TroubleshootSolution).professionalHelp && (
                  <Alert variant="destructive" className="bg-destructive/10">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <AlertTitle className="font-semibold text-destructive">Professional Assistance Recommended</AlertTitle>
                    <AlertDescription className="text-destructive/90">
                      This issue may require a qualified technician. Attempting complex repairs without experience can cause further damage or safety hazards.
                    </AlertDescription>
                  </Alert>
                )}
                {getRelevantGuide((currentStep as TroubleshootSolution).guideId) && (
                  <Button asChild variant="default" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href={`/instructions/${getRelevantGuide((currentStep as TroubleshootSolution).guideId)?.id}`}>
                      <Search className="mr-2 h-4 w-4" /> View Related Guide: {getRelevantGuide((currentStep as TroubleshootSolution).guideId)?.title}
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-6 border-t">
          <Button onClick={handleRestart} variant="outline" className="w-full">
            Restart Troubleshooting
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
