"use client";

import { useState, useEffect, useCallback } from 'react';
import { TROUBLESHOOT_DATA, INSTRUCTION_GUIDES, COFFEE_MACHINES } from '@/lib/data';
import type { TroubleshootStep, TroubleshootQuestion, TroubleshootSolution, CoffeeMachine, InstructionGuide } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, MessageSquare, Settings2, ExternalLink, Info, Search, AlertTriangle, BrainCircuit, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdvancedTroubleshootChat from './components/advanced-troubleshoot-chat';

export default function TroubleshootPage() {
  const [currentStepId, setCurrentStepId] = useState<string>('symptom-start');
  const [history, setHistory] = useState<string[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<CoffeeMachine | null>(null);
  const [mode, setMode] = useState<'normal' | 'advanced'>('normal');
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

  const handleRestartNormalMode = () => {
    setCurrentStepId('symptom-start');
    setHistory([]);
    // setSelectedMachine(null); // Optionally reset machine selection on full restart
    toast({
      title: "Troubleshooting Restarted",
      description: "You are back at the beginning. Please select your symptom.",
      variant: "default",
    });
  };
  
  const handleRestart = () => {
    if (mode === 'normal') {
      handleRestartNormalMode();
    } else {
      // For advanced mode, restart might mean clearing chat, handled in that component
      // Or we can provide a button within the chat component itself.
      // For now, a general toast.
      toast({
        title: "Advanced Chat",
        description: "To start a new conversation, you can clear current messages or refresh.",
      });
    }
     // Optionally reset machine for both modes
    // setSelectedMachine(null); // If uncommented, will reset machine for both modes
  };


  const handleMachineSelect = (machineId: string) => {
    if (machineId === "skip-selection") {
        setSelectedMachine(null); // Explicitly set to null if skipped
        toast({
            title: "Machine Selection Skipped",
            description: "Proceeding with general troubleshooting.",
        });
    } else {
        const machine = COFFEE_MACHINES.find(m => m.id === machineId);
        setSelectedMachine(machine || null);
        if (machine) {
            toast({
                title: "Machine Selected",
                description: `${machine.brand} ${machine.model} selected. This may help tailor suggestions.`,
            });
        }
    }
  };

  const getRelevantGuide = useCallback((guideId?: string): InstructionGuide | undefined => {
    if (!guideId) return undefined;
    let guide = INSTRUCTION_GUIDES.find(g => g.id === guideId);
    
    // If a machine is selected and the specific guide doesn't match, try to find a generic one for the brand or category
    if (selectedMachine && selectedMachine.id !== 'skip-selection' && guide && (guide.machineBrand !== selectedMachine.brand || guide.machineModel !== selectedMachine.model)) {
      // Try to find a guide for the same brand & category, prioritizing specific model, then generic model for the brand
      const brandModelSpecificGuide = INSTRUCTION_GUIDES.find(g => 
        g.machineBrand === selectedMachine.brand && 
        g.machineModel === selectedMachine.model &&
        g.category === guide?.category
      );
      if (brandModelSpecificGuide) return brandModelSpecificGuide;
      
      const brandGenericGuide = INSTRUCTION_GUIDES.find(g => 
        g.machineBrand === selectedMachine.brand && 
        g.machineModel === 'Generic' &&
        g.category === guide?.category
      );
      if (brandGenericGuide) return brandGenericGuide;
      
      // If still no match, try a completely generic guide for the same category
      const genericCategoryGuide = INSTRUCTION_GUIDES.find(g => 
        g.machineBrand === 'Generic' && 
        g.machineModel === 'Generic' && // Or just Espresso Pro if that's your generic model.
        g.category === guide?.category
      );
      if (genericCategoryGuide) return genericCategoryGuide;
    }
    return guide; // Return original guide if no better match or no machine selected
  }, [selectedMachine]);


  const renderNormalMode = () => {
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
          <Button onClick={handleRestartNormalMode} className="mt-4">Restart Troubleshooting</Button>
        </div>
      );
    }

    return (
      <>
        <CardHeader className="bg-secondary/30 dark:bg-secondary/50 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-primary flex items-center">
              <Settings2 className="mr-3 h-7 w-7" /> Normal Troubleshooter
            </CardTitle>
            {history.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleBack} className="text-sm">
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
            )}
          </div>
          <CardDescription className="mt-1">
            Follow the steps to diagnose the issue.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
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
          <Button onClick={handleRestartNormalMode} variant="outline" className="w-full">
            Restart Normal Mode
          </Button>
        </CardFooter>
      </>
    );
  };
  
  const renderAdvancedMode = () => (
    <>
      <CardHeader className="bg-secondary/30 dark:bg-secondary/50 p-6 rounded-t-lg">
         <CardTitle className="text-2xl font-bold text-primary flex items-center">
            <BrainCircuit className="mr-3 h-7 w-7" /> Advanced AI Assistant
          </CardTitle>
        <CardDescription className="mt-1">
          Describe your issue or upload an image. Our AI will try to help.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 md:p-2"> {/* Adjusted padding for chat */}
        <AdvancedTroubleshootChat 
            selectedMachine={selectedMachine} 
            allGuides={INSTRUCTION_GUIDES}
        />
      </CardContent>
      {/* Footer could be part of AdvancedTroubleshootChat or removed for more chat space */}
    </>
  );

  return (
    <div className="container mx-auto py-8 flex flex-col items-center">
      <div className="w-full max-w-2xl mb-6">
          <Card className="p-4 shadow-md">
            <CardHeader className="p-2 pb-4">
                <CardTitle className="text-lg">Select Your Coffee Machine (Optional)</CardTitle>
                <CardDescription className="text-sm">This helps us provide more relevant suggestions in both modes.</CardDescription>
            </CardHeader>
            <CardContent className="p-2">
                 <Select onValueChange={handleMachineSelect} value={selectedMachine?.id || "skip-selection"}>
                    <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your machine model" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="skip-selection">Skip / Not listed</SelectItem>
                    {COFFEE_MACHINES.map(machine => (
                        <SelectItem key={machine.id} value={machine.id}>
                        {machine.brand} - {machine.model}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </CardContent>
           {selectedMachine && selectedMachine.id !== 'skip-selection' && (
             <CardFooter className="p-2 pt-2">
                <p className="text-xs text-muted-foreground">
                    Selected: {selectedMachine.brand} {selectedMachine.model}
                </p>
             </CardFooter>
           )}
          </Card>
      </div>

      <Tabs value={mode} onValueChange={(value) => setMode(value as 'normal' | 'advanced')} className="w-full max-w-2xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="normal" className="gap-2">
            <ListChecks className="h-4 w-4"/> Normal Mode
            </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-2">
            <BrainCircuit className="h-4 w-4"/> Advanced AI Chat
            </TabsTrigger>
        </TabsList>
        <TabsContent value="normal">
          <Card className="w-full shadow-xl">
            {renderNormalMode()}
          </Card>
        </TabsContent>
        <TabsContent value="advanced">
          <Card className="w-full shadow-xl">
            {renderAdvancedMode()}
          </Card>
        </TabsContent>
      </Tabs>
       <Button onClick={handleRestart} variant="link" className="mt-6 text-sm text-muted-foreground">
        Start Over / Reset Selection
      </Button>
    </div>
  );
}
