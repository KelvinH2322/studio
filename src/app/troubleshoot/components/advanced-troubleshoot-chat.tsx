"use client";

import type { ChangeEvent } from 'react';
import { useState, useRef, useEffect } from 'react';
import type { CoffeeMachine, InstructionGuide } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Textarea not used directly, using Input for chat
import { ScrollArea } from '@/components/ui/scroll-area';
import { Paperclip, Send, Bot, User, Loader2, ExternalLink, Image as ImageIcon, XCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { advancedTroubleshootFlow, type AdvancedTroubleshootInput, type AdvancedTroubleshootOutput } from '@/ai/flows/advanced-troubleshoot-flow';
import Image from 'next/image';
import Link from 'next/link';

interface AdvancedTroubleshootChatProps {
  selectedMachine: CoffeeMachine | null;
  allGuides: InstructionGuide[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  imageUrl?: string; // For displaying user uploaded image with their message
  suggestedGuides?: { id: string, title: string }[];
  isLoading?: boolean;
}

export default function AdvancedTroubleshootChat({ selectedMachine, allGuides }: AdvancedTroubleshootChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [inputImageFile, setInputImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null); // This will be the Data URI
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // Initial message effect
  useEffect(() => {
    // Only set initial message if messages array is empty
    if (messages.length > 0) return;

    let initialText = "";
    if (selectedMachine && selectedMachine.id !== 'skip-selection') {
        initialText = `Okay, you've selected the ${selectedMachine.brand} ${selectedMachine.model}. How can I help you with it? You can describe the problem or upload an image.`;
    } else {
        initialText = `Hello! How can I help you with your coffee machine today? You can describe the problem or upload an image. If you know your machine model, selecting it above might give more specific advice.`;
    }
    setMessages([{
        id: `init-${Date.now()}`,
        role: 'assistant',
        text: initialText,
    }]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMachine]); // Rerun if selectedMachine changes and messages are empty


  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          title: "Image too large",
          description: "Please select an image smaller than 4MB.",
          variant: "destructive",
        });
        return;
      }
      setInputImageFile(file); // Store the file object
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImageUrl(reader.result as string); // This is the Data URI
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setInputImageFile(null);
    setPreviewImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !inputImageFile) return;

    const userMessageId = `user-${Date.now()}`;
    const newUserMessage: Message = {
      id: userMessageId,
      role: 'user',
      text: inputText.trim(),
    };

    // Use previewImageUrl directly if it's a Data URI
    const imageDataUriForBackend: string | undefined = previewImageUrl && previewImageUrl.startsWith('data:image') 
      ? previewImageUrl 
      : undefined;

    if (imageDataUriForBackend) {
      newUserMessage.imageUrl = imageDataUriForBackend; // For display
    }
    
    // Add user message to local state immediately for responsiveness
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    
    const assistantMessageId = `assistant-${Date.now()}`;
    setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', isLoading: true }]);
    setIsAssistantLoading(true);

    const currentInputText = inputText.trim();
    // Clear input fields after capturing their values
    setInputText('');
    removeImage(); 

    try {
      // Construct chat history from the state *before* adding the current assistant placeholder
      const chatHistoryForFlow = updatedMessages 
        .filter(msg => msg.id !== userMessageId) // Exclude current user message as it's passed separately
        .map(msg => ({
            role: msg.role, 
            // Ensure text property exists, even if empty for image-only messages (though UI prevents this)
            text: msg.text || (msg.imageUrl && msg.role === 'user' ? "[User sent an image]" : "[Message content unavailable]"),
      }));
      
      const flowInput: AdvancedTroubleshootInput = {
        currentMessageText: currentInputText,
        currentImageUri: imageDataUriForBackend,
        chatHistory: chatHistoryForFlow,
        selectedMachine: (selectedMachine && selectedMachine.id !== 'skip-selection') ? { brand: selectedMachine.brand, model: selectedMachine.model } : undefined,
      };

      const result: AdvancedTroubleshootOutput = await advancedTroubleshootFlow(flowInput);
      
      const suggestedGuidesData = result.suggestedGuideIds?.map(id => {
        const guide = allGuides.find(g => g.id === id);
        return guide ? { id: guide.id, title: guide.title } : null;
      }).filter(Boolean) as { id: string, title: string }[] | undefined;

      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
        ? { ...msg, text: result.assistantResponse, suggestedGuides: suggestedGuidesData, isLoading: false } 
        : msg
      ));

    } catch (error: any) {
      console.error('Error calling advanced troubleshoot flow:', error);
      let errorMessage = 'Failed to get response from AI assistant. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
        ? { ...msg, text: "Sorry, I encountered an error. Please try again. Details: " + errorMessage, isLoading: false, role: 'assistant' } 
        : msg
      ));
    } finally {
      setIsAssistantLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-[calc(var(--vh,1vh)*70)] md:h-[70vh] bg-background rounded-b-lg"> {/* Adjusted height for mobile */}
      <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <Card className={`max-w-[85%] shadow-md ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
              <CardHeader className="p-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-accent" />}
                  {msg.role === 'user' ? 'You' : 'AI Assistant'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 text-sm">
                {msg.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                ) : (
                  <>
                    {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                    {msg.imageUrl && ( // Display user uploaded image
                        <div className="mt-2 rounded-md overflow-hidden border">
                            <Image 
                                src={msg.imageUrl} 
                                alt="User upload" 
                                width={200} 
                                height={200} 
                                className="object-contain max-h-[200px] w-auto"
                                data-ai-hint="uploaded problem"
                            />
                        </div>
                    )}
                    {msg.suggestedGuides && msg.suggestedGuides.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-border/50 dark:border-border/20">
                            <p className={`text-xs font-semibold mb-1 ${msg.role === 'user' ? 'text-primary-foreground/90' : 'text-card-foreground/90'}`}>Suggested Guides:</p>
                            <ul className="space-y-1">
                                {msg.suggestedGuides.map(guide => (
                                <li key={guide.id}>
                                    <Button 
                                      variant="link" 
                                      asChild 
                                      className={`p-0 h-auto text-xs ${msg.role === 'user' ? 'text-primary-foreground/80 hover:text-primary-foreground' : 'text-accent hover:text-accent/80'}`}
                                    >
                                    <Link href={`/instructions/${guide.id}`} target="_blank" rel="noopener noreferrer">
                                        {guide.title} <ExternalLink className="ml-1 h-3 w-3"/>
                                    </Link>
                                    </Button>
                                </li>
                                ))}
                            </ul>
                        </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </ScrollArea>

      {previewImageUrl && (
        <div className="p-2 border-t bg-muted/30">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
                <ImageIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                {inputImageFile && <span className="text-xs text-muted-foreground truncate">{inputImageFile.name}</span>}
                 <Image src={previewImageUrl} alt="Preview" width={32} height={32} className="rounded object-cover flex-shrink-0 border" data-ai-hint="image preview" />
            </div>
            <Button variant="ghost" size="icon" onClick={removeImage} className="h-7 w-7 flex-shrink-0">
                <XCircle className="h-4 w-4" />
                <span className="sr-only">Remove image</span>
            </Button>
          </div>
        </div>
      )}

      <div className="p-4 border-t bg-background">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isAssistantLoading && handleSendMessage()}
            disabled={isAssistantLoading}
            className="flex-grow h-10"
            aria-label="Chat input"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isAssistantLoading}
            aria-label="Attach image"
            className="h-10 w-10"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/png, image/jpeg, image/webp, image/gif"
            className="hidden"
            disabled={isAssistantLoading}
            aria-label="File input for image"
          />
          <Button onClick={handleSendMessage} disabled={isAssistantLoading || (!inputText.trim() && !inputImageFile)} className="h-10 w-10" size="icon">
            {isAssistantLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
