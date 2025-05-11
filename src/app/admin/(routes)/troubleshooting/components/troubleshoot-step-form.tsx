// src/app/admin/(routes)/troubleshooting/components/troubleshoot-step-form.tsx
"use client";

import type { TroubleshootStep, TroubleshootQuestion, TroubleshootSolution, InstructionGuide } from '@/types';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area'; // Assuming it's in ui
import { useEffect, useState } from 'react';

const optionSchema = z.object({
  text: z.string().min(1, "Option text cannot be empty."),
  nextStepId: z.string().min(1, "Must select a next step."),
});

const formSchema = z.object({
  id: z.string().min(3, "ID must be at least 3 characters.").regex(/^[a-z0-9-]+$/, "ID must be lowercase alphanumeric with hyphens (e.g., 'my-step-id')."),
  stepType: z.enum(['question', 'solution']),
  // Question fields
  questionText: z.string().optional(),
  options: z.array(optionSchema).optional(),
  // Solution fields
  solutionTitle: z.string().optional(),
  solutionDescription: z.string().optional(),
  guideId: z.string().optional().nullable(), // Allow empty string or null
  professionalHelp: z.boolean().optional().default(false),
}).superRefine((data, ctx) => {
  if (data.stepType === 'question') {
    if (!data.questionText || data.questionText.length < 5) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Question text must be at least 5 characters.", path: ['questionText'] });
    }
    if (!data.options || data.options.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "At least one option is required for a question.", path: ['options'] });
    } else {
      data.options.forEach((opt, index) => {
        if (!opt.text) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Option text cannot be empty.", path: [`options.${index}.text`] });
        if (!opt.nextStepId) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Must select a next step.", path: [`options.${index}.nextStepId`] });
      });
    }
  } else if (data.stepType === 'solution') {
    if (!data.solutionTitle || data.solutionTitle.length < 5) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Solution title must be at least 5 characters.", path: ['solutionTitle'] });
    }
    if (!data.solutionDescription || data.solutionDescription.length < 10) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Solution description must be at least 10 characters.", path: ['solutionDescription'] });
    }
  }
});

type TroubleshootStepFormValues = z.infer<typeof formSchema>;

interface TroubleshootStepFormProps {
  initialStep: TroubleshootStep | null;
  formMode: 'create-question' | 'create-solution' | 'edit';
  allSteps: TroubleshootStep[];
  allGuides: InstructionGuide[];
  onSubmit: (data: TroubleshootStep) => void;
  onCancel: () => void;
  existingIds: string[];
}

export default function TroubleshootStepForm({
  initialStep,
  formMode,
  allSteps,
  allGuides,
  onSubmit,
  onCancel,
  existingIds
}: TroubleshootStepFormProps) {

  const isEditing = formMode === 'edit';
  const initialType = isEditing ? initialStep!.type : (formMode === 'create-question' ? 'question' : 'solution');
  
  const form = useForm<TroubleshootStepFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialStep ? {
      id: initialStep.id,
      stepType: initialStep.type,
      questionText: initialStep.type === 'question' ? (initialStep as TroubleshootQuestion).text : '',
      options: initialStep.type === 'question' ? (initialStep as TroubleshootQuestion).options : [],
      solutionTitle: initialStep.type === 'solution' ? (initialStep as TroubleshootSolution).title : '',
      solutionDescription: initialStep.type === 'solution' ? (initialStep as TroubleshootSolution).description : '',
      guideId: initialStep.type === 'solution' ? (initialStep as TroubleshootSolution).guideId || null : null,
      professionalHelp: initialStep.type === 'solution' ? !!(initialStep as TroubleshootSolution).professionalHelp : false,
    } : {
      id: '',
      stepType: initialType,
      questionText: '',
      options: [{ text: '', nextStepId: '' }],
      solutionTitle: '',
      solutionDescription: '',
      guideId: null,
      professionalHelp: false,
    },
  });

  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const watchedStepType = form.watch("stepType");

  // Ensure stepType is set correctly when formMode changes for creation
   useEffect(() => {
    if (!isEditing) {
      const typeToSet = formMode === 'create-question' ? 'question' : 'solution';
      if (form.getValues("stepType") !== typeToSet) {
          form.setValue("stepType", typeToSet);
      }
    }
  }, [formMode, isEditing, form]);

  const handleSubmit = (values: TroubleshootStepFormValues) => {
    if (!isEditing && existingIds.includes(values.id)) {
        form.setError("id", { type: "manual", message: "This ID already exists. Please choose a unique ID." });
        return;
    }

    let submittedStep: TroubleshootStep;
    if (values.stepType === 'question') {
      submittedStep = {
        id: values.id,
        type: 'question',
        text: values.questionText!,
        options: values.options!,
      };
    } else { // solution
      submittedStep = {
        id: values.id,
        type: 'solution',
        title: values.solutionTitle!,
        description: values.solutionDescription!,
        guideId: values.guideId || undefined, // Ensure empty string becomes undefined
        professionalHelp: values.professionalHelp,
      };
    }
    onSubmit(submittedStep);
  };

  const availableNextStepIds = allSteps
    .map(s => s.id)
    .filter(id => !isEditing || id !== initialStep?.id); // Prevent self-reference if editing

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-4 p-1">
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Step ID</FormLabel>
                  <FormControl><Input placeholder="e.g., check-power-cord" {...field} disabled={isEditing} /></FormControl>
                  <FormDescription>Unique identifier for this step (lowercase, hyphens only). Cannot be changed after creation.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stepType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Step Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isEditing} // Type cannot be changed after creation
                  >
                    <FormControl><SelectTrigger><SelectValue placeholder="Select step type" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="question">Question</SelectItem>
                      <SelectItem value="solution">Solution</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Cannot be changed after creation.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedStepType === 'question' && (
              <>
                <FormField
                  control={form.control}
                  name="questionText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Text</FormLabel>
                      <FormControl><Textarea placeholder="e.g., Is the machine leaking water?" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <FormLabel className="text-md font-semibold">Options</FormLabel>
                  {optionFields.map((field, index) => (
                    <div key={field.id} className="space-y-3 p-3 border rounded-md mt-2 relative bg-muted/50">
                      <h4 className="font-medium text-sm">Option {index + 1}</h4>
                      <FormField
                        control={form.control}
                        name={`options.${index}.text`}
                        render={({ field: optionField }) => (
                          <FormItem>
                            <FormLabel>Option Text</FormLabel>
                            <FormControl><Input placeholder="e.g., Yes, from the group head" {...optionField} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`options.${index}.nextStepId`}
                        render={({ field: optionField }) => (
                          <FormItem>
                            <FormLabel>Next Step ID</FormLabel>
                            <Select onValueChange={optionField.onChange} defaultValue={optionField.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Select next step" /></SelectTrigger></FormControl>
                              <SelectContent>
                                {availableNextStepIds.map(id => <SelectItem key={id} value={id}>{id}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)} className="absolute top-1 right-1 h-7 w-7">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendOption({ text: '', nextStepId: '' })} className="mt-2">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Option
                  </Button>
                </div>
              </>
            )}

            {watchedStepType === 'solution' && (
              <>
                <FormField
                  control={form.control}
                  name="solutionTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Solution Title</FormLabel>
                      <FormControl><Input placeholder="e.g., Clean the Shower Screen" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="solutionDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Solution Description</FormLabel>
                      <FormControl><Textarea placeholder="Detailed steps or explanation for this solution..." {...field} rows={4} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="guideId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Instruction Guide (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a guide" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {allGuides.map(guide => <SelectItem key={guide.id} value={guide.id}>{guide.title} ({guide.machineBrand} {guide.machineModel})</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="professionalHelp"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Recommend Professional Help?</FormLabel>
                        <FormDescription>
                          Check if this solution often requires a technician.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">{isEditing ? 'Save Changes' : 'Create Step'}</Button>
        </div>
      </form>
    </Form>
  );
}
