'use server';
/**
 * @fileOverview A coffee machine troubleshooting AI agent that uses chat, images, and instruction guides.
 *
 * - advancedTroubleshootFlow - A function that handles the advanced troubleshooting process.
 * - AdvancedTroubleshootInput - The input type for the advancedTroubleshootFlow function.
 * - AdvancedTroubleshootOutput - The return type for the advancedTroubleshootFlow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod'; 
import { INSTRUCTION_GUIDES } from '@/lib/data'; 
import type { InstructionGuide } from '@/types'; 

// Zod schema for client-facing input
const AdvancedTroubleshootInputSchema = z.object({
  currentMessageText: z.string().optional().describe("The user's current text message."),
  currentImageUri: z.string().optional().describe("A data URI of an image provided by the user for the current turn. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  chatHistory: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      text: z.string(), // Assuming text is always present. If image-only messages are possible, this needs adjustment.
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


// Zod schema for client-facing output
const AdvancedTroubleshootOutputSchema = z.object({
  assistantResponse: z.string().describe("The AI assistant's textual response to the user."),
  suggestedGuideIds: z.array(z.string()).optional().describe("An array of IDs for relevant instruction guides. These IDs must exist in the provided list of guides."),
});
export type AdvancedTroubleshootOutput = z.infer<typeof AdvancedTroubleshootOutputSchema>;


function formatGuidesForPrompt(guides: InstructionGuide[]): string {
  if (!guides || guides.length === 0) return "No specific instruction guides available.";
  // Provide more details to the LLM so it can make better choices
  return guides.map(g => 
    `Guide ID: ${g.id}\nTitle: ${g.title}\nCategory: ${g.category}\nMachine Brand: ${g.machineBrand}\nMachine Model: ${g.machineModel}\nSummary: ${g.summary.substring(0, 150)}...` // Increased summary length slightly
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
You have access to a library of instruction guides. Utilize these guides to inform your responses and suggest them when they are directly relevant to solving the user's current problem.

{{#if selectedMachineText}}
The user is working with a {{selectedMachineText}} machine. Prioritize advice and guides specific to this machine if available.
{{else}}
The user has not specified a particular machine model. Provide general advice. You can ask if they know their machine type if it becomes relevant for guide selection.
{{/if}}

Available Instruction Guides:
{{{formattedGuidesText}}}
---

Previous Conversation History (if any):
{{{formattedChatHistoryText}}}
---

User's latest message: {{{currentMessageText}}}
{{#if currentImageUri}}
User has also provided an image: {{media url=currentImageUri}}
Carefully analyze this image in conjunction with their text message, conversation history, and available guides to understand the problem. The image might show:
- A specific part of the machine that is problematic (e.g., leaking, broken).
- An error code displayed on the machine.
- The result of a process (e.g., bad coffee shot, unusual steam).
- The general state of the machine or a component.
Your analysis of the image should inform both your textual response and any guide suggestions.
{{/if}}

Based on ALL available information (user's message, image, history, selected machine, and the list of instruction guides):
1.  Provide a helpful, conversational response to the user's query.
2.  If you identify any HIGHLY RELEVANT instruction guides from the list that could help solve the user's CURRENT problem, include their EXACT "Guide ID"s in the 'suggestedGuideIds' array of your JSON response.
    - Only suggest guides that are a strong match for the problem being discussed.
    - Do not suggest more than 2-3 guides per response.
    - Ensure the suggested guide ID exists in the "Available Instruction Guides" list provided above.
    - Explain briefly WHY you are suggesting a particular guide, if not obvious.
3.  Your response should be helpful even if no image is provided or no specific guide is a perfect match.
4.  If the problem seems complex or requires internal repairs beyond simple steps (even if a guide exists), advise the user that professional help might be needed, especially if safety is a concern.
5.  Do not make up guide IDs. Only use IDs from the provided list.

Respond strictly with a JSON object matching the output schema. Ensure your response is well-formed JSON.
`,
});

const advancedTroubleshootFlowDefinition = ai.defineFlow(
  {
    name: 'advancedTroubleshootFlow',
    inputSchema: AdvancedTroubleshootInputSchema, 
    outputSchema: AdvancedTroubleshootOutputSchema,
  },
  async (input: AdvancedTroubleshootInput): Promise<AdvancedTroubleshootOutput> => {
    // Cast INSTRUCTION_GUIDES to InstructionGuide[] to satisfy the type, assuming it conforms
    const formattedGuides = formatGuidesForPrompt(INSTRUCTION_GUIDES as InstructionGuide[]); 
    const formattedHistory = formatChatHistoryForPrompt(input.chatHistory);
    const selectedMachineText = input.selectedMachine ? `${input.selectedMachine.brand} ${input.selectedMachine.model}` : undefined;

    const promptInput: z.infer<typeof AdvancedPromptInternalContextSchema> = {
        currentMessageText: input.currentMessageText,
        currentImageUri: input.currentImageUri,
        formattedChatHistoryText: formattedHistory,
        selectedMachineText: selectedMachineText,
        formattedGuidesText: formattedGuides,
    };
    
    const { output } = await troubleshootPrompt(promptInput);

    if (!output) {
        console.error("Advanced troubleshoot flow received no output from prompt for input:", JSON.stringify(promptInput, null, 2));
        return {
            assistantResponse: "I'm sorry, I couldn't process that request at the moment. Could you try rephrasing or providing more details?",
            suggestedGuideIds: [],
        };
    }
    
    // Validate suggestedGuideIds
    const validGuideIds = INSTRUCTION_GUIDES.map(g => g.id);
    const filteredSuggestedGuideIds = Array.isArray(output.suggestedGuideIds) 
        ? output.suggestedGuideIds.filter(id => {
            const isValid = validGuideIds.includes(id);
            if (!isValid) {
                console.warn(`LLM suggested an invalid guide ID: ${id}`);
            }
            return isValid;
          })
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
