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
  imageUrl?: string; // Optional image for the machine itself
}

export enum UserRole {
  NORMAL = "Normal",
  ADMIN = "Admin",
  SERVICE = "Service",
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  createdAt?: Date;
}

// Mock user data (in a real app, this would come from a database)
export const MOCK_USERS: User[] = [
  { id: 'user-norm1', email: 'normal@example.com', role: UserRole.NORMAL, name: 'Normal User', createdAt: new Date() },
  { id: 'user-admin1', email: 'admin@example.com', role: UserRole.ADMIN, name: 'Admin User', createdAt: new Date() },
  { id: 'user-serv1', email: 'service@example.com', role: UserRole.SERVICE, name: 'Service User', createdAt: new Date() },
];


// IoT Monitoring Specific Types
export enum MachineConnectionStatus {
  CONNECTED = "Connected",
  DISCONNECTED = "Disconnected",
}

export enum MachinePowerStatus {
  ON = "ON",
  OFF = "OFF",
  ERROR = "Error",
}

export enum MachineComponentStatus {
  OK = "OK",
  OPERATING = "Operating",
  NEEDS_ATTENTION = "Needs Attention",
  ERROR = "Error",
  OFF = "Off", 
  ON = "On", 
}

export enum WaterLevelStatus {
  FULL = "Full",
  MEDIUM = "Medium",
  LOW = "Low",
  EMPTY = "Empty",
  NOT_AVAILABLE = "N/A",
}

export interface MonitoredCoffeeMachine extends CoffeeMachine {
  connectionStatus: MachineConnectionStatus;
  powerStatus: MachinePowerStatus;
  pumpStatus: MachineComponentStatus;
  heaterStatus: MachineComponentStatus;
  grinderStatus: MachineComponentStatus;
  waterLevel: WaterLevelStatus;
  onTimeSecondsToday: number;
  cupsMadeToday: number;
  lastSync?: Date;
  imageUrl: string; // Mandatory for monitored machines cards
}
