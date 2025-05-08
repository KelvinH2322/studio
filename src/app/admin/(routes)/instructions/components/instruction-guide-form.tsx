// src/app/admin/(routes)/instructions/components/instruction-guide-form.tsx
"use client";

import type { InstructionGuide } from '@/types';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { COFFEE_MACHINES } from '@/lib/data';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const guideCategories = ['Maintenance', 'Repair', 'Cleaning'] as const;

const stepSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image: z.string().url().optional().or(z.literal('')),
  videoUrl: z.string().url().optional().or(z.literal('')),
});

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  category: z.enum(guideCategories),
  machineBrand: z.string().min(1, "Machine brand is required"),
  machineModel: z.string().min(1, "Machine model is required"),
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  imageUrl: z.string().url().optional().or(z.literal('')),
  steps: z.array(stepSchema).min(1, "At least one step is required"),
  tools: z.array(z.string().min(1)).optional(),
  safetyAlerts: z.array(z.string().min(1)).optional(),
});

type InstructionGuideFormValues = z.infer<typeof formSchema>;

interface InstructionGuideFormProps {
  guide: InstructionGuide | null;
  onSubmit: (data: InstructionGuide) => void;
  onCancel: () => void;
}

export default function InstructionGuideForm({ guide, onSubmit, onCancel }: InstructionGuideFormProps) {
  const uniqueMachineBrands = [...new Set(COFFEE_MACHINES.map(m => m.brand))];
  
  const form = useForm<InstructionGuideFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: guide ? {
      ...guide,
      tools: guide.tools || [],
      safetyAlerts: guide.safetyAlerts || [],
    } : {
      title: '',
      category: 'Maintenance',
      machineBrand: '',
      machineModel: '',
      summary: '',
      imageUrl: '',
      steps: [{ title: '', description: '', image: '', videoUrl: '' }],
      tools: [],
      safetyAlerts: [],
    },
  });

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control: form.control,
    name: "steps",
  });

  const { fields: toolFields, append: appendTool, remove: removeTool } = useFieldArray({
    control: form.control,
    name: "tools",
  });
    
  const { fields: safetyAlertFields, append: appendSafetyAlert, remove: removeSafetyAlert } = useFieldArray({
    control: form.control,
    name: "safetyAlerts",
  });

  const handleSubmit = (values: InstructionGuideFormValues) => {
    const submittedGuide: InstructionGuide = {
      id: guide?.id || '', // ID will be handled by parent
      ...values,
      tools: values.tools?.filter(t => t.trim() !== ''), // Filter out empty strings
      safetyAlerts: values.safetyAlerts?.filter(a => a.trim() !== ''), // Filter out empty strings
    };
    onSubmit(submittedGuide);
  };
  
  const watchedBrand = form.watch("machineBrand");
  const availableModels = COFFEE_MACHINES.filter(m => m.brand === watchedBrand).map(m => m.model);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <ScrollArea className="h-[calc(90vh-10rem)] pr-4"> {/* Adjust height as needed */}
        <div className="space-y-4 p-1">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl><Input placeholder="e.g., Daily Cleaning Routine" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                    <SelectContent>
                    {guideCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="machineBrand"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Machine Brand</FormLabel>
                <Select onValueChange={(value) => { field.onChange(value); form.setValue('machineModel', ''); }} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger></FormControl>
                    <SelectContent>
                        {uniqueMachineBrands.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
                         <SelectItem value="Generic">Generic (All Brands)</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="machineModel"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Machine Model</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!watchedBrand || availableModels.length === 0 && watchedBrand !== "Generic"}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger></FormControl>
                    <SelectContent>
                        {watchedBrand === "Generic" ? (
                             <SelectItem value="Generic">Generic (All Models)</SelectItem>
                        ) : (
                            availableModels.map(model => <SelectItem key={model} value={model}>{model}</SelectItem>)
                        )}
                         <SelectItem value="Generic">Generic (Selected Brand)</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Summary</FormLabel>
              <FormControl><Textarea placeholder="Brief overview of the guide..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (Optional)</FormLabel>
              <FormControl><Input placeholder="https://example.com/image.jpg" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel className="text-lg font-semibold">Steps</FormLabel>
          {stepFields.map((field, index) => (
            <div key={field.id} className="space-y-3 p-4 border rounded-md mt-2 relative">
              <h4 className="font-medium">Step {index + 1}</h4>
              <FormField
                control={form.control}
                name={`steps.${index}.title`}
                render={({ field: stepField }) => (
                  <FormItem>
                    <FormLabel>Step Title</FormLabel>
                    <FormControl><Input placeholder="e.g., Flush Group Head" {...stepField} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`steps.${index}.description`}
                render={({ field: stepField }) => (
                  <FormItem>
                    <FormLabel>Step Description</FormLabel>
                    <FormControl><Textarea placeholder="Detailed instructions for this step..." {...stepField} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name={`steps.${index}.image`}
                    render={({ field: stepField }) => (
                    <FormItem>
                        <FormLabel>Step Image URL (Optional)</FormLabel>
                        <FormControl><Input placeholder="https://example.com/step-image.jpg" {...stepField} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name={`steps.${index}.videoUrl`}
                    render={({ field: stepField }) => (
                    <FormItem>
                        <FormLabel>Step Video URL (Optional)</FormLabel>
                        <FormControl><Input placeholder="https://youtube.com/embed/..." {...stepField} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
              <Button type="button" variant="destructive" size="sm" onClick={() => removeStep(index)} className="absolute top-2 right-2">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => appendStep({ title: '', description: '', image: '', videoUrl: '' })} className="mt-2">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Step
          </Button>
        </div>
        
        {/* Tools Array */}
        <div>
          <FormLabel className="text-lg font-semibold">Tools Required (Optional)</FormLabel>
          {toolFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2 mt-2">
              <FormField
                control={form.control}
                name={`tools.${index}`}
                render={({ field: toolField }) => (
                  <FormItem className="flex-grow">
                     <FormControl><Input placeholder="e.g., Screwdriver" {...toolField} value={toolField.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeTool(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => appendTool('')} className="mt-2">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Tool
          </Button>
        </div>

        {/* Safety Alerts Array */}
        <div>
          <FormLabel className="text-lg font-semibold">Safety Alerts (Optional)</FormLabel>
          {safetyAlertFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2 mt-2">
              <FormField
                control={form.control}
                name={`safetyAlerts.${index}`}
                render={({ field: alertField }) => (
                  <FormItem className="flex-grow">
                    <FormControl><Input placeholder="e.g., Unplug machine before opening" {...alertField} value={alertField.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeSafetyAlert(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => appendSafetyAlert('')} className="mt-2">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Safety Alert
          </Button>
        </div>
        </div>
      </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">{guide ? 'Save Changes' : 'Create Guide'}</Button>
        </div>
      </form>
    </Form>
  );
}
