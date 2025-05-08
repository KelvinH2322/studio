// src/app/admin/(routes)/instructions/page.tsx
"use client";

import type { useState, ChangeEvent } from 'react';
import { useEffect, useMemo } from 'react';
import PageHeader from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit3, Trash2, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { InstructionGuide } from '@/types';
import { INSTRUCTION_GUIDES as INITIAL_GUIDES, COFFEE_MACHINES } from '@/lib/data'; // Using static data for now
import InstructionGuideForm from './components/instruction-guide-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


export default function AdminInstructionsPage() {
  const [guides, setGuides] = React.useState<InstructionGuide[]>(INITIAL_GUIDES);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingGuide, setEditingGuide] = React.useState<InstructionGuide | null>(null);
  const { toast } = useToast();

  const filteredGuides = useMemo(() => {
    return guides.filter(guide => 
      guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.machineBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.machineModel.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [guides, searchTerm]);

  const handleAddGuide = () => {
    setEditingGuide(null);
    setIsFormOpen(true);
  };

  const handleEditGuide = (guide: InstructionGuide) => {
    setEditingGuide(guide);
    setIsFormOpen(true);
  };

  const handleDeleteGuide = (guideId: string) => {
    setGuides(prev => prev.filter(g => g.id !== guideId));
    toast({ title: "Guide Deleted", description: "The instruction guide has been removed." });
  };

  const handleSaveGuide = (guideData: InstructionGuide) => {
    if (editingGuide) {
      setGuides(prev => prev.map(g => g.id === editingGuide.id ? guideData : g));
      toast({ title: "Guide Updated", description: "The instruction guide has been updated successfully." });
    } else {
      // In a real app, generate a unique ID on the backend
      const newGuide = { ...guideData, id: `guide-${Date.now()}` };
      setGuides(prev => [newGuide, ...prev]);
      toast({ title: "Guide Created", description: "The new instruction guide has been added." });
    }
    setIsFormOpen(false);
    setEditingGuide(null);
  };

  const pageActions = (
    <Button onClick={handleAddGuide}>
      <PlusCircle className="mr-2 h-4 w-4" /> Add New Guide
    </Button>
  );

  return (
    <div>
      <PageHeader title="Manage Instruction Guides" description="Create, edit, and delete instruction guides." actions={pageActions} />

      <div className="mb-6">
        <Input 
          placeholder="Search guides by title, brand, or model..."
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="max-w-sm"
          icon={<Search className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {filteredGuides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map(guide => (
            <Card key={guide.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{guide.title}</CardTitle>
                <CardDescription>{guide.machineBrand} {guide.machineModel} - {guide.category}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">{guide.summary}</p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditGuide(guide)}>
                  <Edit3 className="mr-2 h-4 w-4" /> Edit
                </Button>
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the guide "{guide.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteGuide(guide.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No instruction guides found. {searchTerm && "Try adjusting your search."}</p>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGuide ? 'Edit' : 'Create'} Instruction Guide</DialogTitle>
            <DialogDescription>
              {editingGuide ? 'Update the details of this instruction guide.' : 'Fill in the form to add a new instruction guide.'}
            </DialogDescription>
          </DialogHeader>
          <InstructionGuideForm 
            guide={editingGuide} 
            onSubmit={handleSaveGuide} 
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
