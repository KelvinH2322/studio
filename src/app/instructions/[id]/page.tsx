import { INSTRUCTION_GUIDES } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle, FileText, ListChecks, PenToolIcon, Youtube } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface GuidePageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  return INSTRUCTION_GUIDES.map((guide) => ({
    id: guide.id,
  }));
}

export default function InstructionGuidePage({ params }: GuidePageProps) {
  const guide = INSTRUCTION_GUIDES.find((g) => g.id === params.id);

  if (!guide) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <Link href="/instructions" className="mb-6 inline-block">
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" /> Back to Library
        </Button>
      </Link>

      <Card className="overflow-hidden shadow-xl">
        {guide.imageUrl && (
          <div className="relative h-64 w-full md:h-96">
            <Image 
                src={guide.imageUrl} 
                alt={guide.title} 
                layout="fill" 
                objectFit="cover" 
                priority
                data-ai-hint={`${guide.category} detail`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">{guide.title}</h1>
              <p className="text-lg text-gray-200 drop-shadow-sm">{guide.machineBrand} - {guide.machineModel}</p>
            </div>
          </div>
        )}
        <CardContent className="p-6 md:p-8">
          {!guide.imageUrl && (
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-3xl md:text-4xl font-bold text-primary">{guide.title}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">{guide.machineBrand} - {guide.machineModel}</CardDescription>
            </CardHeader>
          )}
          
          <p className="text-foreground/80 mb-6 text-base">{guide.summary}</p>

          {guide.safetyAlerts && guide.safetyAlerts.length > 0 && (
            <Card className="mb-6 border-destructive bg-destructive/10">
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <AlertTriangle className="mr-2 h-5 w-5" /> Safety Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1 text-destructive/90">
                  {guide.safetyAlerts.map((alert, index) => (
                    <li key={index}>{alert}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {guide.tools && guide.tools.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 flex items-center text-primary">
                <PenToolIcon className="mr-2 h-5 w-5" /> Tools Required
              </h3>
              <div className="flex flex-wrap gap-2">
                {guide.tools.map((tool, index) => (
                  <span key={index} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <Separator className="my-8" />

          <div>
            <h2 className="text-2xl font-semibold mb-6 flex items-center text-primary">
              <ListChecks className="mr-2 h-6 w-6" /> Steps
            </h2>
            <ol className="space-y-8">
              {guide.steps.map((step, index) => (
                <li key={index} className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold mb-2 text-foreground">{step.title}</h4>
                    <p className="text-foreground/80 mb-4">{step.description}</p>
                    {step.image && (
                      <div className="my-4 rounded-lg overflow-hidden shadow-md aspect-video relative max-w-md">
                        <Image 
                            src={step.image} 
                            alt={`Step ${index + 1}: ${step.title}`} 
                            layout="fill"
                            objectFit="cover"
                            data-ai-hint="instruction step"
                         />
                      </div>
                    )}
                    {step.videoUrl && (
                      <div className="my-4">
                        <iframe
                          className="aspect-video w-full max-w-md rounded-lg shadow-md"
                          src={step.videoUrl}
                          title={`Step ${index + 1} Video: ${step.title}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                        <a href={step.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-accent hover:underline mt-2">
                           <Youtube className="mr-1 h-4 w-4" /> Watch on YouTube
                        </a>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <Separator className="my-8" />

          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <p className="text-lg font-medium text-foreground">You've completed the guide!</p>
            <p className="text-muted-foreground">We hope this was helpful. Feel free to provide feedback.</p>
            {/* Add feedback mechanism here in future */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export async function generateMetadata({ params }: GuidePageProps) {
  const guide = INSTRUCTION_GUIDES.find((g) => g.id === params.id);
  if (!guide) {
    return {
      title: "Guide Not Found"
    }
  }
  return {
    title: `${guide.title} | CoffeeHelper`,
    description: guide.summary,
  };
}
