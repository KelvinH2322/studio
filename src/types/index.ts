// src/types/index.ts
export interface InstructionGuide {
  id: string;
  title: string;
  category: 'Maintenance' | 'Repair' | 'Cleaning';
  machineBrand: string;
  machineModel: string;
  summary: string;
  imageUrl?: string; // Optional image for the card
  steps: { 
    title: string;
    description: string; 
    image?: string; 
    videoUrl?: string 
  }[];
  tools?: string[];
  safetyAlerts?: string[];
}

export interface TroubleshootOption {
  text: string;
  nextStepId: string; // Can be a question ID or solution ID
}

export interface TroubleshootQuestion {
  id: string;
  type: 'question';
  text: string;
  options: TroubleshootOption[];
}

export interface TroubleshootSolution {
  id: string;
  type: 'solution';
  title: string;
  description: string;
  guideId?: string; // Link to InstructionGuide
  professionalHelp?: boolean;
}

export type TroubleshootStep = TroubleshootQuestion | TroubleshootSolution;

export interface CoffeeMachine {
  id: string;
  brand: string;
  model: string;
}
