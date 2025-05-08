"use client";

import type { ChangeEvent, FormEvent } from 'react';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { INSTRUCTION_GUIDES, COFFEE_MACHINES } from '@/lib/data';
import type { InstructionGuide, CoffeeMachine } from '@/types';
import { Search, Filter, XCircle } from 'lucide-react';

const categories = ['All', 'Maintenance', 'Repair', 'Cleaning'];
const brands = ['All', ...new Set(COFFEE_MACHINES.map(machine => machine.brand))];

export default function InstructionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedModel, setSelectedModel] = useState('All');
  
  const availableModels = useMemo(() => {
    if (selectedBrand === 'All') {
      return ['All', ...new Set(COFFEE_MACHINES.map(machine => machine.model))];
    }
    return ['All', ...COFFEE_MACHINES.filter(machine => machine.brand === selectedBrand).map(machine => machine.model)];
  }, [selectedBrand]);

  const filteredGuides = useMemo(() => {
    return INSTRUCTION_GUIDES.filter((guide) => {
      const matchesSearchTerm = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                guide.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                guide.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || guide.category === selectedCategory;
      const matchesBrand = selectedBrand === 'All' || guide.machineBrand === selectedBrand;
      const matchesModel = selectedModel === 'All' || guide.machineModel === selectedModel;
      
      return matchesSearchTerm && matchesCategory && matchesBrand && matchesModel;
    });
  }, [searchTerm, selectedCategory, selectedBrand, selectedModel]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedBrand('All');
    setSelectedModel('All');
  };
  
  const onBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    setSelectedModel('All'); // Reset model when brand changes
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Instruction Library</CardTitle>
          <CardDescription>Find maintenance and repair guides for your coffee machine.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search guides (e.g., 'descale', 'leaking')"
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 text-base"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="category-select" className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category-select" className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="brand-select" className="block text-sm font-medium text-muted-foreground mb-1">Brand</label>
                <Select value={selectedBrand} onValueChange={onBrandChange}>
                  <SelectTrigger id="brand-select" className="w-full">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="model-select" className="block text-sm font-medium text-muted-foreground mb-1">Model</label>
                 <Select value={selectedModel} onValueChange={setSelectedModel} disabled={selectedBrand === 'All' && availableModels.length <=1}>
                  <SelectTrigger id="model-select" className="w-full">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleClearFilters} variant="outline" className="self-end h-10">
                <XCircle className="mr-2 h-4 w-4" /> Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredGuides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map((guide) => (
            <Card key={guide.id} className="flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="p-0">
                {guide.imageUrl && (
                  <div className="aspect-video w-full relative">
                    <Image 
                        src={guide.imageUrl} 
                        alt={guide.title} 
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={`${guide.category} coffee machine`}
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-6 flex-grow">
                <CardTitle className="text-xl mb-2 text-primary">{guide.title}</CardTitle>
                <p className="text-sm text-muted-foreground mb-1">
                  <span className="font-semibold">Category:</span> {guide.category}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  <span className="font-semibold">Machine:</span> {guide.machineBrand} {guide.machineModel}
                </p>
                <CardDescription className="text-sm text-foreground/80 line-clamp-3">{guide.summary}</CardDescription>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href={`/instructions/${guide.id}`}>View Guide</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Filter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">No guides match your current filters.</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}
