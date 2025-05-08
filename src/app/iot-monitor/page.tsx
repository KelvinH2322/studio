"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Power, Bell, Clock, AlertTriangle, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { getSmartPlugStatus, controlSmartPlug, type SmartPlugStatus } from '@/services/smart-plug';

const MOCK_DEVICE_ID = "coffee-machine-plug-001"; // In a real app, this would be user-configurable

export default function IotMonitorPage() {
  const [plugStatus, setPlugStatus] = useState<SmartPlugStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationThreshold, setNotificationThreshold] = useState(8 * 3600); // Default 8 hours in seconds
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { toast } = useToast();

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const status = await getSmartPlugStatus(MOCK_DEVICE_ID);
      setPlugStatus(status);
    } catch (err) {
      console.error("Error fetching plug status:", err);
      setError("Failed to connect to the smart plug. Please check its connection and try again.");
      setPlugStatus(null); // Clear status on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh status every 30 seconds
    return () => clearInterval(interval);
  }, [fetchStatus]);

  useEffect(() => {
    if (plugStatus && notificationsEnabled && plugStatus.onTimeSeconds >= notificationThreshold) {
      toast({
        title: "Coffee Machine Usage Alert",
        description: `Your coffee machine has been ON for ${formatDuration(plugStatus.onTimeSeconds)}. Consider turning it off if not in use.`,
        variant: "destructive",
        duration: 10000, // Show for 10 seconds
      });
      // Potentially disable notifications for a while to prevent spamming
      // setNotificationsEnabled(false); 
    }
  }, [plugStatus, notificationsEnabled, notificationThreshold, toast]);


  const handleTogglePlug = async () => {
    if (!plugStatus) return;
    setIsLoading(true);
    try {
      await controlSmartPlug(MOCK_DEVICE_ID, !plugStatus.isOn);
      // Optimistically update UI, then refresh
      setPlugStatus(prev => prev ? { ...prev, isOn: !prev.isOn } : null);
      toast({
        title: `Smart Plug ${!plugStatus.isOn ? "Turned ON" : "Turned OFF"}`,
        description: "The command has been sent to your smart plug.",
      });
      await fetchStatus(); // Fetch actual status after control action
    } catch (err) {
      console.error("Error controlling plug:", err);
      setError("Failed to control the smart plug.");
      toast({
        title: "Error Controlling Plug",
        description: "Could not send command to the smart plug. Please try again.",
        variant: "destructive",
      });
      // Re-fetch status to ensure UI is consistent with actual state
      await fetchStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hours = parseInt(e.target.value, 10);
    if (!isNaN(hours) && hours > 0) {
      setNotificationThreshold(hours * 3600);
    } else if (e.target.value === "") {
       setNotificationThreshold(0); // Or some sensible default / allow empty to clear
    }
  };

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const onTimePercentage = plugStatus ? Math.min((plugStatus.onTimeSeconds / notificationThreshold) * 100, 100) : 0;

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-lg mx-auto shadow-xl">
        <CardHeader className="bg-secondary/30 dark:bg-secondary/50 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-primary flex items-center">
             {plugStatus ? <Wifi className="mr-3 h-7 w-7 text-green-500" /> : <WifiOff className="mr-3 h-7 w-7 text-destructive" />}
              IoT Usage Monitor (PoC)
            </CardTitle>
            {isLoading && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
          </div>
          <CardDescription className="mt-1">
            Monitor your coffee machine&apos;s ON time using a smart plug.
            This is an experimental feature.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!error && plugStatus && (
            <>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-background shadow">
                <div className="space-y-1">
                  <Label htmlFor="plug-power" className="text-lg font-medium text-foreground">
                    Machine Power
                  </Label>
                  <p className={`text-2xl font-bold ${plugStatus.isOn ? 'text-green-600' : 'text-red-600'}`}>
                    {plugStatus.isOn ? 'ON' : 'OFF'}
                  </p>
                </div>
                <Switch
                  id="plug-power"
                  checked={plugStatus.isOn}
                  onCheckedChange={handleTogglePlug}
                  disabled={isLoading}
                  aria-label="Toggle coffee machine power"
                  className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                />
              </div>

              <div className="p-4 border rounded-lg bg-background shadow space-y-3">
                <Label className="text-lg font-medium text-foreground flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-primary" /> Total ON Time Today
                </Label>
                <p className="text-3xl font-bold text-primary">{formatDuration(plugStatus.onTimeSeconds)}</p>
                {notificationsEnabled && notificationThreshold > 0 && (
                   <div>
                    <Progress value={onTimePercentage} className="w-full h-3 [&>div]:bg-accent" />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                        {formatDuration(plugStatus.onTimeSeconds)} of {formatDuration(notificationThreshold)} limit
                    </p>
                   </div>
                )}
                 <p className="text-xs text-muted-foreground">
                    Based on smart plug data since last reset.
                </p>
              </div>
            </>
          )}
          
          {!error && !plugStatus && !isLoading && (
             <Alert>
              <WifiOff className="h-4 w-4" />
              <AlertTitle>No Data Available</AlertTitle>
              <AlertDescription>
                Could not retrieve status from the smart plug. It might be offline or not configured.
              </AlertDescription>
            </Alert>
          )}


          <Card className="p-4 bg-background shadow">
            <CardTitle className="text-lg font-medium mb-3 text-foreground flex items-center">
                <Bell className="mr-2 h-5 w-5 text-primary" /> Usage Notifications
            </CardTitle>
            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Switch
                    id="notifications-enabled"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                    disabled={!plugStatus}
                    />
                    <Label htmlFor="notifications-enabled" className="text-sm text-muted-foreground">
                    Enable ON time notifications
                    </Label>
                </div>
                {notificationsEnabled && (
                <div className="space-y-2">
                    <Label htmlFor="threshold-hours" className="text-sm font-medium text-muted-foreground">
                    Notify when ON time exceeds (hours):
                    </Label>
                    <Input
                    id="threshold-hours"
                    type="number"
                    min="1"
                    value={notificationThreshold / 3600}
                    onChange={handleThresholdChange}
                    className="w-full md:w-1/2"
                    disabled={!plugStatus}
                    />
                </div>
                )}
            </div>
           </Card>
        </CardContent>

        <CardFooter className="p-6 border-t">
          <Button onClick={fetchStatus} disabled={isLoading} variant="outline" className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Power className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Refreshing...' : 'Refresh Status'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
