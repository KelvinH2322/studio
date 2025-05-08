import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME } from "@/constants";
import { BookOpen, Wrench, RouterIcon, Coffee } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const features = [
    {
      title: "Instruction Library",
      description: "Access detailed guides for maintenance, cleaning, and repairs.",
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      href: "/instructions",
      imageHint: "manual book"
    },
    {
      title: "Troubleshooting Assistant",
      description: "Diagnose common coffee machine issues with our guided assistant.",
      icon: <Wrench className="h-8 w-8 text-primary" />,
      href: "/troubleshoot",
      imageHint: "tools wrench"
    },
    {
      title: "IoT Usage Monitor",
      description: "Track your machine's ON time with our smart plug integration (PoC).",
      icon: <RouterIcon className="h-8 w-8 text-primary" />,
      href: "/iot-monitor",
      imageHint: "smart plug"
    },
  ];

  return (
    <div className="flex flex-col items-center">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30 dark:bg-secondary/50 rounded-lg shadow-md">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-muted-foreground">
                  Your Coffee Companion
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                  Welcome to {APP_NAME}
                </h1>
                <p className="max-w-[600px] text-foreground/80 md:text-xl">
                  Keep your coffee machine in perfect condition with our expert guides, troubleshooting assistant, and innovative usage monitoring.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/instructions">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/troubleshoot">Troubleshoot Now</Link>
                </Button>
              </div>
            </div>
            <Image
              src="https://picsum.photos/seed/coffeehero/600/500"
              width="600"
              height="500"
              alt="Hero Coffee Machine"
              data-ai-hint="coffee machine"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square shadow-lg"
            />
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-primary">
                Everything You Need for Your Coffee Machine
              </h2>
              <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                From step-by-step repair guides to intelligent issue diagnosis, we've got you covered.
              </p>
            </div>
          </div>
          <div className="mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <CardHeader className="items-center pb-4">
                   <div className="p-3 rounded-full bg-accent/10 mb-2">
                     {feature.icon}
                   </div>
                  <CardTitle className="text-xl text-center">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground text-center">{feature.description}</p>
                   <div className="mt-4 aspect-video w-full relative">
                    <Image 
                        src={`https://picsum.photos/seed/${feature.title.replace(/\s+/g, '').toLowerCase()}/400/225`} 
                        alt={feature.title} 
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                        data-ai-hint={feature.imageHint}
                    />
                  </div>
                </CardContent>
                <div className="p-4 pt-0 mt-auto">
                  <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href={feature.href}>Explore</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

       <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30 dark:bg-secondary/50 rounded-lg shadow-md">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <Coffee className="mx-auto h-12 w-12 text-primary" />
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-primary">
              Ready to Brew the Perfect Cup?
            </h2>
            <p className="mx-auto max-w-[600px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {APP_NAME} provides the tools and knowledge to ensure your coffee machine performs at its best, every day.
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm space-y-2">
             <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/instructions">Explore All Guides</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
