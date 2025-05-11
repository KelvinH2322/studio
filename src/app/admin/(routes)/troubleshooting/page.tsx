// src/app/admin/(routes)/troubleshooting/page.tsx
"use client";

import { useState, useMemo, type ChangeEvent, useEffect } from 'react';
import PageHeader from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit3, Trash2, Search, AlertTriangleIcon, HelpCircleIcon, CheckCircleIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { TroubleshootStep, TroubleshootQuestion, TroubleshootSolution, InstructionGuide } from '@/types';
import { TROUBLESHOOT_DATA as INITIAL_STEPS, INSTRUCTION_GUIDES } from '@/lib/data'; // Using static data
import TroubleshootStepForm from './components/troubleshoot-step-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function AdminTroubleshootingPage() {
  const [steps, setSteps] = useState<TroubleshootStep[]>(INITIAL_STEPS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<TroubleshootStep | null>(null);
  const [formMode, setFormMode] = useState<'create-question' | 'create-solution' | 'edit'>('create-question');
  const { toast } = useToast();

  const filteredSteps = useMemo(() => {
    return steps.filter(step => {
      const term = searchTerm.toLowerCase();
      if (step.id.toLowerCase().includes(term)) return true;
      if (step.type === 'question' && (step as TroubleshootQuestion).text.toLowerCase().includes(term)) return true;
      if (step.type === 'solution' && (step as TroubleshootSolution).title.toLowerCase().includes(term)) return true;
      return false;
    });
  }, [steps, searchTerm]);

  const handleAddStep = (type: 'question' | 'solution') => {
    setEditingStep(null);
    setFormMode(type === 'question' ? 'create-question' : 'create-solution');
    setIsFormOpen(true);
  };

  const handleEditStep = (step: TroubleshootStep) => {
    setEditingStep(step);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeleteStep = (stepId: string) => {
    // Check for dependencies
    const dependentQuestions = steps.filter(s => 
      s.type === 'question' && (s as TroubleshootQuestion).options.some(opt => opt.nextStepId === stepId)
    );

    if (dependentQuestions.length > 0) {
      toast({
        title: "Deletion Blocked",
        description: `Step "${stepId}" is used as a 'nextStepId' in other questions: ${dependentQuestions.map(q => q.id).join(', ')}. Please update these questions first.`,
        variant: "destructive",
        duration: 7000,
      });
      return;
    }
    if (stepId === 'symptom-start') {
      toast({
        title: "Deletion Blocked",
        description: "The 'symptom-start' step cannot be deleted as it's the entry point.",
        variant: "destructive",
      });
      return;
    }

    setSteps(prev => prev.filter(s => s.id !== stepId));
    toast({ title: "Step Deleted", description: `The troubleshooting step "${stepId}" has been removed.` });
  };

  const handleSaveStep = (stepData: TroubleshootStep) => {
    if (formMode === 'edit' && editingStep) {
      setSteps(prev => prev.map(s => s.id === editingStep.id ? stepData : s));
      toast({ title: "Step Updated", description: `Step "${stepData.id}" has been updated.` });
    } else { // Creating new step
      if (steps.some(s => s.id === stepData.id)) {
        toast({
          title: "Error: Duplicate ID",
          description: `A step with ID "${stepData.id}" already exists. Please use a unique ID.`,
          variant: "destructive",
        });
        return; // Prevent saving
      }
      setSteps(prev => [stepData, ...prev]);
      toast({ title: "Step Created", description: `New step "${stepData.id}" has been added.` });
    }
    setIsFormOpen(false);
    setEditingStep(null);
  };
  
  const validateTree = () => {
    let issuesFound = 0;
    let messages: string[] = [];

    const stepIds = new Set(steps.map(s => s.id));

    if (!stepIds.has('symptom-start')) {
      messages.push("Critical: Entry point 'symptom-start' is missing.");
      issuesFound++;
    }

    steps.forEach(step => {
      if (step.type === 'question') {
        const question = step as TroubleshootQuestion;
        if (question.options.length === 0) {
          messages.push(`Warning: Question "${question.id}" has no options defined.`);
          issuesFound++;
        }
        question.options.forEach(option => {
          if (!stepIds.has(option.nextStepId)) {
            messages.push(`Error: Question "${question.id}", option "${option.text}" points to non-existent step ID "${option.nextStepId}".`);
            issuesFound++;
          }
        });
      } else if (step.type === 'solution') {
        const solution = step as TroubleshootSolution;
        if (solution.guideId && !INSTRUCTION_GUIDES.some(guide => guide.id === solution.guideId)) {
           messages.push(`Warning: Solution "${solution.id}" points to non-existent guide ID "${solution.guideId}".`);
           issuesFound++;
        }
      }
    });
    
    // Basic reachability check (simplified)
    const reachable = new Set<string>();
    const queue: string[] = ['symptom-start'];
    if (stepIds.has('symptom-start')) reachable.add('symptom-start');

    let head = 0;
    while(head < queue.length) {
        const currentId = queue[head++];
        const current = steps.find(s => s.id === currentId);
        if (current?.type === 'question') {
            (current as TroubleshootQuestion).options.forEach(opt => {
                if (stepIds.has(opt.nextStepId) && !reachable.has(opt.nextStepId)) {
                    reachable.add(opt.nextStepId);
                    queue.push(opt.nextStepId);
                }
            });
        }
    }

    steps.forEach(step => {
        if (!reachable.has(step.id)) {
            messages.push(`Warning: Step "${step.id}" might be orphaned (not reachable from 'symptom-start').`);
            // Not incrementing issuesFound for orphans as it might be intentional during editing.
        }
    });


    if (issuesFound === 0 && messages.length === 0) {
      toast({ title: "Tree Validated", description: "No obvious issues found in the troubleshooting tree structure.", className: "bg-green-500 text-white" });
    } else {
      toast({
        title: `Tree Validation: ${issuesFound} Critical Issues / ${messages.length - issuesFound} Warnings`,
        description: (
          <ScrollArea className="h-40">
            <ul className="list-disc pl-5 space-y-1">
              {messages.map((msg, i) => <li key={i} className={cn(msg.startsWith("Error:") || msg.startsWith("Critical:") ? "text-destructive" : "text-yellow-700", "whitespace-pre-wrap")}>{msg}</li>)}
            </ul>
          </ScrollArea>
        ),
        variant: issuesFound > 0 ? "destructive" : "default",
        duration: 15000,
      });
    }
  };


  const pageActions = (
    <div className="flex gap-2">
      <Button onClick={() => handleAddStep('question')} variant="outline">
        <HelpCircleIcon className="mr-2 h-4 w-4" /> Add Question
      </Button>
      <Button onClick={() => handleAddStep('solution')}>
        <CheckCircleIcon className="mr-2 h-4 w-4" /> Add Solution
      </Button>
       <Button onClick={validateTree} variant="secondary">
        Validate Tree
      </Button>
    </div>
  );

  return (
    <div>
      <PageHeader title="Manage Troubleshooting Content" description="Create, edit, and link troubleshooting steps." actions={pageActions} />

      <div className="mb-6">
        <Input
          placeholder="Search steps by ID, title, or text..."
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="max-w-md"
          // The icon prop is not a standard Input prop. It was removed earlier from the Input component.
          // If an icon is needed, it should be placed manually next to or within the Input.
          // For now, I'll remove it to avoid potential errors.
          // icon={<Search className="h-4 w-4 text-muted-foreground" />} 
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">ID</TableHead>
              <TableHead className="w-[120px]">Type</TableHead>
              <TableHead>Text / Title</TableHead>
              <TableHead className="text-right w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSteps.length > 0 ? filteredSteps.map(step => (
              <TableRow key={step.id}>
                <TableCell className="font-mono text-xs">{step.id}</TableCell>
                <TableCell>
                  <Badge variant={step.type === 'question' ? 'secondary' : 'default'}>
                    {step.type === 'question' ? <HelpCircleIcon className="mr-1 h-3 w-3" /> : <CheckCircleIcon className="mr-1 h-3 w-3" />}
                    {step.type}
                  </Badge>
                </TableCell>
                <TableCell>{step.type === 'question' ? (step as TroubleshootQuestion).text : (step as TroubleshootSolution).title}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEditStep(step)} className="h-8 w-8">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" disabled={step.id === 'symptom-start'}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the step "{step.id}".
                          Dependent steps might be affected.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteStep(step.id)} className="bg-destructive hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  No troubleshooting steps found. {searchTerm && "Try adjusting your search."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formMode === 'edit' ? 'Edit' : (formMode === 'create-question' ? 'Create New Question' : 'Create New Solution')} Step
            </DialogTitle>
            <DialogDescription>
              {formMode === 'edit' ? `Editing step ID: ${editingStep?.id}` : 'Define the details for the new troubleshooting step.'}
            </DialogDescription>
          </DialogHeader>
          <TroubleshootStepForm
            key={editingStep?.id || 'create'} // Re-mount form on edit/create change
            initialStep={editingStep}
            formMode={formMode}
            allSteps={steps}
            allGuides={INSTRUCTION_GUIDES}
            onSubmit={handleSaveStep}
            onCancel={() => setIsFormOpen(false)}
            existingIds={steps.map(s => s.id)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

declare module 'react' {
  interface HTMLAttributes<T> {
    // icon?: React.ReactNode; // Removed as it's not standard and Input component was simplified
  }
}
