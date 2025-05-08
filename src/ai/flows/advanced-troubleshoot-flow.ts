'use server';
/**
 * @fileOverview A coffee machine troubleshooting AI agent that uses chat and images.
 *
 * - advancedTroubleshootFlow - A function that handles the advanced troubleshooting process.
 * - AdvancedTroubleshootInput - The input type for the advancedTroubleshootFlow function.
 * - AdvancedTroubleshootOutput - The return type for the advancedTroubleshootFlow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit/zod'; // Using genkit's zod for schema definitions
import { INSTRUCTION_GUIDES } from '@/lib/data'; // Assuming this path is correct and INSTRUCTION_GUIDES is typed
import type { InstructionGuide } from '@/types'; // For typing INSTRUCTION_GUIDES

// Client-facing input schema
export const AdvancedTroubleshootInputSchema = z.object({
  currentMessageText: z.string().optional().describe("The user's current text message."),
  currentImageUri: z.string().optional().describe("A data URI of an image provided by the user for the current turn. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  chatHistory: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      text: z.string(),
    })
  ).optional().describe("The history of the conversation so far."),
  selectedMachine: z.object({
    brand: z.string(),
    model: z.string(),
  }).optional().describe("The coffee machine model selected by the user."),
});
export type AdvancedTroubleshootInput = z.infer<typeof AdvancedTroubleshootInputSchema>;


// Schema for the data passed to the Genkit prompt
const AdvancedPromptInternalContextSchema = z.object({
    currentMessageText: z.string().optional(),
    currentImageUri: z.string().optional().describe("A data URI of an image provided by the user for the current turn. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
    formattedChatHistoryText: z.string().optional().describe("The pre-formatted text of the conversation history."),
    selectedMachineText: z.string().optional().describe("Text describing the selected machine, e.g., 'Breville Barista Express'."),
    formattedGuidesText: z.string().describe("A formatted list of available instruction guides with their IDs, titles, categories, and machine specifics."),
});


export const AdvancedTroubleshootOutputSchema = z.object({
  assistantResponse: z.string().describe("The AI assistant's textual response to the user."),
  suggestedGuideIds: z.array(z.string()).optional().describe("An array of IDs for relevant instruction guides. These IDs must exist in the provided list of guides."),
});
export type AdvancedTroubleshootOutput = z.infer<typeof AdvancedTroubleshootOutputSchema>;


function formatGuidesForPrompt(guides: InstructionGuide[]): string {
  if (!guides || guides.length === 0) return "No specific instruction guides available.";
  // Provide more details to the LLM so it can make better choices
  return guides.map(g => 
    `Guide ID: ${g.id}\nTitle: ${g.title}\nCategory: ${g.category}\nMachine Brand: ${g.machineBrand}\nMachine Model: ${g.machineModel}\nSummary: ${g.summary.substring(0, 100)}...`
  ).join('\n---\n'); // Separator for better readability by LLM
}

function formatChatHistoryForPrompt(chatHistory?: Array<{role: 'user' | 'assistant', text: string}>): string {
    if (!chatHistory || chatHistory.length === 0) return "This is the beginning of the conversation.";
    return chatHistory.map(entry => `${entry.role === 'user' ? 'User' : 'Assistant'}: ${entry.text}`).join('\n');
}


const troubleshootPrompt = ai.definePrompt({
  name: 'advancedTroubleshootPrompt',
  input: { schema: AdvancedPromptInternalContextSchema },
  output: { schema: AdvancedTroubleshootOutputSchema },
  prompt: `You are an expert Coffee Machine Troubleshooting Assistant.
Your goal is to help the user diagnose and solve issues with their coffee machine in a conversational manner.
Be empathetic, ask clarifying questions if needed, and provide clear, step-by-step, actionable advice.
If possible, suggest relevant instruction guides from the list provided below. When suggesting guides, refer to them by their "Guide ID".

{{#if selectedMachineText}}
The user is working with a {{selectedMachineText}} machine. Prioritize advice and guides specific to this machine if available.
{{else}}
The user has not specified a particular machine model. Provide general advice. You can ask if they know their machine type if it becomes relevant.
{{/if}}

Previous Conversation History (if any):
{{{formattedChatHistoryText}}}

User's latest message: {{{currentMessageText}}}
{{#if currentImageUri}}
User has also provided an image: {{media url=currentImageUri}}
Carefully analyze this image in conjunction with their text message and conversation history to understand the problem. The image might show:
- A specific part of the machine that is problematic (e.g., leaking, broken).
- An error code displayed on the machine.
- The result of a process (e.g., bad coffee shot, unusual steam).
- The general state of the machine or a component.
Describe what you see in the image if it's relevant to your diagnosis.
{{/if}}

Available Instruction Guides:
{{{formattedGuidesText}}}

Based on all the information (user's message, image, history, selected machine):
1.  Provide a helpful, conversational response.
2.  If you identify any highly relevant instruction guides from the list that could solve the user's CURRENT problem, include their EXACT "Guide ID"s in the 'suggestedGuideIds' array.
    - Only suggest guides that are a strong match for the problem being discussed.
    - Do not suggest more than 2-3 guides per response.
    - Ensure the suggested guide ID exists in the provided list.
3.  Your response should be helpful even if no image is provided.
4.  If the problem seems complex or requires internal repairs beyond simple steps, advise the user that professional help might be needed, especially if safety is a concern.

Respond with a JSON object matching the output schema.
`,
});

const advancedTroubleshootFlowDefinition = ai.defineFlow(
  {
    name: 'advancedTroubleshootFlow',
    inputSchema: AdvancedTroubleshootInputSchema,
    outputSchema: AdvancedTroubleshootOutputSchema,
  },
  async (input: AdvancedTroubleshootInput): Promise<AdvancedTroubleshootOutput> => {
    const formattedGuides = formatGuidesForPrompt(INSTRUCTION_GUIDES as InstructionGuide[]); // Cast if INSTRUCTION_GUIDES is not strictly typed
    const formattedHistory = formatChatHistoryForPrompt(input.chatHistory);
    const selectedMachineText = input.selectedMachine ? `${input.selectedMachine.brand} ${input.selectedMachine.model}` : undefined;

    const promptInput: z.infer<typeof AdvancedPromptInternalContextSchema> = {
        currentMessageText: input.currentMessageText,
        currentImageUri: input.currentImageUri,
        formattedChatHistoryText: formattedHistory,
        selectedMachineText: selectedMachineText,
        formattedGuidesText: formattedGuides,
    };
    
    // Use Gemini Flash as it supports multimodal input (text + image)
    // If a different model is configured globally in genkit.ts, this explicitly uses flash for this flow.
    // If your global model in genkit.ts is already gemini-pro or gemini-ultra (or flash), this specific model line can be omitted.
    const { output } = await troubleshootPrompt(promptInput, { model: 'googleai/gemini-1.5-flash-latest' });


    if (!output) {
        // Fallback or error handling if prompt returns no output
        return {
            assistantResponse: "I'm sorry, I couldn't process that request. Could you try rephrasing or providing more details?",
            suggestedGuideIds: [],
        };
    }
    
    // Ensure suggestedGuideIds is always an array, even if empty or undefined from LLM
    // And filter to ensure IDs are valid from the INSTRUCTION_GUIDES
    const validGuideIds = INSTRUCTION_GUIDES.map(g => g.id);
    const filteredSuggestedGuideIds = Array.isArray(output.suggestedGuideIds) 
        ? output.suggestedGuideIds.filter(id => validGuideIds.includes(id))
        : [];

    return {
      assistantResponse: output.assistantResponse,
      suggestedGuideIds: filteredSuggestedGuideIds,
    };
  }
);

// Exported wrapper function
export async function advancedTroubleshootFlow(input: AdvancedTroubleshootInput): Promise<AdvancedTroubleshootOutput> {
  return advancedTroubleshootFlowDefinition(input);
}
