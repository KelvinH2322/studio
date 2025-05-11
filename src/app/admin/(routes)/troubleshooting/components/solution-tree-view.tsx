// src/app/admin/(routes)/troubleshooting/components/solution-tree-view.tsx
"use client";

import type { TroubleshootStep, TroubleshootQuestion, TroubleshootSolution, InstructionGuide } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, CornerDownRight, HelpCircle, LinkIcon, Repeat } from 'lucide-react';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SolutionTreeViewProps {
  steps: TroubleshootStep[];
  guides: InstructionGuide[];
  onEditStep: (step: TroubleshootStep) => void;
}

interface RenderStepProps {
  stepId: string;
  allSteps: TroubleshootStep[];
  allGuides: InstructionGuide[];
  level: number;
  path: Set<string>; // For cycle detection
  onEditStep: (step: TroubleshootStep) => void;
}

const RenderStepNode: React.FC<RenderStepProps> = ({ stepId, allSteps, allGuides, level, path, onEditStep }) => {
  const step = allSteps.find(s => s.id === stepId);

  if (path.has(stepId) && step) {
    return (
      <div style={{ paddingLeft: `${level * 20}px` }} className="mb-2">
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-900/30">
          <CardHeader className="p-2">
            <CardTitle className="text-sm flex items-center text-orange-700 dark:text-orange-400">
              <Repeat className="mr-2 h-4 w-4" />
              Recursive Link to: {stepId}
            </CardTitle>
            <CardDescription className="text-xs">
              This step is already in the current path, creating a cycle.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!step) {
    return (
      <div style={{ paddingLeft: `${level * 20}px` }} className="mb-2">
        <Card className="border-destructive bg-destructive/10">
          <CardHeader className="p-2">
            <CardTitle className="text-sm flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Error: Step Not Found
            </CardTitle>
            <CardDescription className="text-xs">The step with ID &quot;{stepId}&quot; could not be found.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const currentPath = new Set(path);
  currentPath.add(stepId);

  const guide = step.type === 'solution' ? allGuides.find(g => g.id === (step as TroubleshootSolution).guideId) : undefined;

  return (
    <div style={{ paddingLeft: `${level * 20}px` }} className="mb-3">
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="p-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center">
              {step.type === 'question' ? <HelpCircle className="mr-2 h-5 w-5 text-blue-500" /> : <CheckCircle className="mr-2 h-5 w-5 text-green-500" />}
              {step.type === 'question' ? (step as TroubleshootQuestion).text.substring(0, 60) + '...' : (step as TroubleshootSolution).title}
            </CardTitle>
            <CardDescription className="text-xs font-mono mt-1">ID: {step.id} <Badge variant={step.type === 'question' ? 'secondary' : 'default'} className="ml-2">{step.type}</Badge></CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => onEditStep(step)}>Edit</Button>
        </CardHeader>
        {step.type === 'solution' && (
          <CardContent className="p-3 pt-0 text-sm">
            <p className="text-muted-foreground line-clamp-2">{(step as TroubleshootSolution).description}</p>
            {guide && (
              <div className="mt-2">
                <Link href={`/instructions/${guide.id}`} target="_blank" className="text-xs text-accent hover:underline flex items-center">
                  <LinkIcon className="mr-1 h-3 w-3" /> Related Guide: {guide.title}
                </Link>
              </div>
            )}
            {(step as TroubleshootSolution).professionalHelp && (
                <p className="text-xs text-destructive mt-1 flex items-center"><AlertTriangle className="mr-1 h-3 w-3" /> Prof. Help Recommended</p>
            )}
          </CardContent>
        )}
      </Card>

      {step.type === 'question' && (
        <div className="mt-2 space-y-2 pl-4 border-l-2 border-dashed ml-3">
          {(step as TroubleshootQuestion).options.map((option, index) => (
            <div key={index} className="pt-1">
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <CornerDownRight className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="italic">Option: &quot;{option.text}&quot; leads to &rarr; <strong>{option.nextStepId}</strong></span>
              </div>
              <RenderStepNode
                stepId={option.nextStepId}
                allSteps={allSteps}
                allGuides={allGuides}
                level={0} // Child nodes are visually indented by structure, not margin here
                path={currentPath}
                onEditStep={onEditStep}
              />
            </div>
          ))}
           {(step as TroubleshootQuestion).options.length === 0 && (
             <p className="text-xs text-muted-foreground pl-2 italic">(No options defined for this question)</p>
           )}
        </div>
      )}
    </div>
  );
};


export default function SolutionTreeView({ steps, guides, onEditStep }: SolutionTreeViewProps) {
  const [rootStepId, setRootStepId] = useState('symptom-start');
  const [filterTerm, setFilterTerm] = useState('');

  const rootStep = steps.find(s => s.id === rootStepId);

  // For now, we only support editing the start node for visualization if 'symptom-start' doesn't exist or for exploration.
  // A more robust "tree management" would be needed for multiple named trees.
  const handleSetRoot = (id: string) => {
    if(steps.find(s => s.id === id)) {
        setRootStepId(id);
    } else {
        alert(`Step with ID "${id}" not found.`);
    }
  }
  
  const filteredStepsForDropdown = steps
    .filter(step => step.type === 'question') // Typically trees start with questions
    .filter(step => step.id.toLowerCase().includes(filterTerm.toLowerCase()) || (step as TroubleshootQuestion).text.toLowerCase().includes(filterTerm.toLowerCase()));


  if (steps.length === 0) {
    return <p className="text-muted-foreground p-4">No troubleshooting steps available to display a tree.</p>;
  }
  
  const startNode = steps.find(s => s.id === rootStepId);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Solution Tree Visualizer</CardTitle>
        <CardDescription>
          Visual representation of the troubleshooting workflow starting from &quot;{rootStepId}&quot;.
          You can edit steps by clicking the &apos;Edit&apos; button on a node. Changes made in the &apos;Steps List&apos; tab will also reflect here.
        </CardDescription>
         {/* Basic root selector for exploration - not full tree management */}
        <div className="flex gap-2 items-center mt-2">
            <p className="text-sm font-medium">Display tree starting from:</p>
            <select 
                value={rootStepId} 
                onChange={(e) => handleSetRoot(e.target.value)}
                className="p-2 border rounded-md text-sm bg-background"
            >
                {/* Could filter this list or offer a search if too many steps */}
                {steps.filter(s => s.type === 'question').map(s => (
                    <option key={s.id} value={s.id}>{s.id} - {(s as TroubleshootQuestion).text.substring(0,30)}...</option>
                ))}
                 {steps.filter(s => s.type === 'solution').map(s => ( // Also allow solutions as roots for partial views
                    <option key={s.id} value={s.id}>{s.id} - {(s as TroubleshootSolution).title.substring(0,30)}...</option>
                ))}
            </select>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh] w-full p-1 border rounded-md">
          {startNode ? (
            <RenderStepNode
              stepId={rootStepId}
              allSteps={steps}
              allGuides={guides}
              level={0}
              path={new Set<string>()}
              onEditStep={onEditStep}
            />
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Root Step Not Found</AlertTitle>
              <AlertDescription>
                The starting step &quot;{rootStepId}&quot; for the tree could not be found. Please ensure it exists.
                 Try selecting another start node.
              </AlertDescription>
            </Alert>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}