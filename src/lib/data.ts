// src/lib/data.ts
import type { InstructionGuide, TroubleshootStep, CoffeeMachine } from '@/types';

export const COFFEE_MACHINES: CoffeeMachine[] = [
  { id: 'machine-001', brand: 'Breville', model: 'Barista Express' },
  { id: 'machine-002', brand: 'DeLonghi', model: 'Magnifica' },
  { id: 'machine-003', brand: 'Gaggia', model: 'Classic Pro' },
  { id: 'machine-004', brand: 'Generic', model: 'Espresso Pro' },
];

export const INSTRUCTION_GUIDES: InstructionGuide[] = [
  {
    id: 'guide-001',
    title: 'Daily Cleaning Routine for Breville Barista Express',
    category: 'Cleaning',
    machineBrand: 'Breville',
    machineModel: 'Barista Express',
    summary: 'Learn the essential daily cleaning steps to keep your Breville Barista Express in top condition.',
    imageUrl: 'https://picsum.photos/seed/guide1/400/300',
    steps: [
      { title: 'Flush Group Head', description: 'Run water through the group head to remove coffee grounds.' },
      { title: 'Clean Portafilter', description: 'Wipe the portafilter basket clean after each use.' },
      { title: 'Purge Steam Wand', description: 'Purge and wipe the steam wand immediately after frothing milk.', imageUrl: 'https://picsum.photos/seed/steamwand/300/200' },
    ],
    tools: ['Cleaning brush', 'Microfiber cloth'],
    safetyAlerts: ['Ensure machine is cooled down before cleaning steam wand tip.'],
  },
  {
    id: 'guide-002',
    title: 'Descale Your DeLonghi Magnifica',
    category: 'Maintenance',
    machineBrand: 'DeLonghi',
    machineModel: 'Magnifica',
    summary: 'A step-by-step guide to descaling your DeLonghi Magnifica for optimal performance and longevity.',
    imageUrl: 'https://picsum.photos/seed/guide2/400/300',
    steps: [
      { title: 'Prepare Descaling Solution', description: 'Mix the descaling solution according to the manufacturer\'s instructions.' },
      { title: 'Run Descaling Cycle', description: 'Follow your machine\'s specific descaling cycle instructions.', videoUrl: 'https://www.youtube.com/embed/exampleVideoID' },
      { title: 'Rinse Thoroughly', description: 'Run several tanks of fresh water through the machine to rinse.' },
    ],
    tools: ['DeLonghi descaler', 'Large container'],
  },
  {
    id: 'guide-003',
    title: 'Fixing Low Pressure on Gaggia Classic Pro',
    category: 'Repair',
    machineBrand: 'Gaggia',
    machineModel: 'Classic Pro',
    summary: 'Troubleshoot and fix common causes of low brew pressure on your Gaggia Classic Pro.',
    imageUrl: 'https://picsum.photos/seed/guide3/400/300',
    steps: [
      { title: 'Check Coffee Grind', description: 'Ensure your coffee grind is not too coarse.' },
      { title: 'Clean Shower Screen', description: 'A clogged shower screen can reduce pressure. Unscrew and clean it.' },
      { title: 'Inspect Pump (Advanced)', description: 'If other steps fail, the pump may need inspection or replacement. This may require professional help.' },
    ],
    tools: ['Screwdriver', 'Brush'],
    safetyAlerts: ['Unplug the machine before attempting any internal repairs.'],
  },
   {
    id: 'guide-004',
    title: 'Basic Espresso Machine Maintenance',
    category: 'Maintenance',
    machineBrand: 'Generic',
    machineModel: 'Espresso Pro',
    summary: 'General maintenance tips applicable to most espresso machines.',
    imageUrl: 'https://picsum.photos/seed/guide4/400/300',
    steps: [
      { title: 'Daily Wipe Down', description: 'Wipe the exterior of the machine daily.' },
      { title: 'Backflush (if applicable)', description: 'Perform a backflush routine if your machine supports it.' },
      { title: 'Check Water Reservoir', description: 'Regularly clean the water reservoir to prevent buildup.' },
    ],
    tools: ['Microfiber cloth', 'Blind basket (for backflushing)'],
  }
];

export const TROUBLESHOOT_DATA: TroubleshootStep[] = [
  {
    id: 'symptom-start',
    type: 'question',
    text: 'What problem are you experiencing with your coffee machine?',
    options: [
      { text: 'Machine is leaking water', nextStepId: 'q-leak-location' },
      { text: 'No coffee coming out', nextStepId: 'q-no-coffee-water' },
      { text: 'Coffee tastes bad', nextStepId: 'q-bad-taste-type' },
      { text: 'Machine not turning on', nextStepId: 'sol-power-check' },
    ],
  },
  {
    id: 'q-leak-location',
    type: 'question',
    text: 'Where is the machine leaking from?',
    options: [
      { text: 'Group head', nextStepId: 'sol-leak-grouphead' },
      { text: 'Steam wand', nextStepId: 'sol-leak-steamwand' },
      { text: 'Underneath the machine', nextStepId: 'sol-leak-underneath' },
    ],
  },
  {
    id: 'sol-leak-grouphead',
    type: 'solution',
    title: 'Leaking Group Head',
    description: 'A leaking group head is often due to a worn-out group head gasket. Consider replacing it. You can find general instructions for gasket replacement in many maintenance guides.',
    guideId: 'guide-003', // Example link, ideally a specific gasket guide
  },
  {
    id: 'q-no-coffee-water',
    type: 'question',
    text: 'Is water flowing through the group head when you try to brew (without portafilter)?',
    options: [
      { text: 'Yes, water flows', nextStepId: 'sol-no-coffee-grind-tamp' },
      { text: 'No, water does not flow or very little', nextStepId: 'sol-no-coffee-blockage' },
    ],
  },
  {
    id: 'sol-no-coffee-grind-tamp',
    type: 'solution',
    title: 'Check Grind and Tamp',
    description: 'If water flows but no coffee, your coffee grind might be too fine or you might be tamping too hard, choking the machine. Try a coarser grind or lighter tamp. Refer to your machine\'s manual for grind settings.',
    guideId: 'guide-003', 
  },
  {
    id: 'sol-no-coffee-blockage',
    type: 'solution',
    title: 'Potential Blockage or Pump Issue',
    description: 'If no water flows, there might be a blockage in the water line, a pump issue, or the machine needs descaling. Try descaling first. If the issue persists, it might require professional help or checking the pump.',
    guideId: 'guide-002',
    professionalHelp: true,
  },
  {
    id: 'q-bad-taste-type',
    type: 'question',
    text: 'How would you describe the bad taste?',
    options: [
      { text: 'Bitter or burnt', nextStepId: 'sol-bad-taste-bitter' },
      { text: 'Sour or acidic', nextStepId: 'sol-bad-taste-sour' },
      { text: 'Metallic or stale', nextStepId: 'sol-bad-taste-stale' },
    ],
  },
  {
    id: 'sol-bad-taste-bitter',
    type: 'solution',
    title: 'Bitter Coffee',
    description: 'Bitter coffee can be due to over-extraction (grind too fine, brew time too long), water too hot, or stale/over-roasted beans. Also, ensure your machine is clean.',
    guideId: 'guide-001',
  },
  {
    id: 'sol-power-check',
    type: 'solution',
    title: 'Machine Not Turning On',
    description: 'Ensure the machine is properly plugged into a working power outlet. Check the power cord for damage. If it still doesn\'t turn on, there might be an internal electrical issue requiring professional service.',
    professionalHelp: true,
  },
  // Add more symptoms, questions, and solutions
];
