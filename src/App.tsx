import { useState, useEffect } from "react";
import { BungalowCard } from "./components/BungalowCard";
import { WeeklyReadings } from "./components/WeeklyReadings";
import { WaterTreatment } from "./components/WaterTreatment";
import { Button } from "./components/ui/button";
import { Printer, Save, Calendar, CalendarDays, Droplet, Cloud, CloudOff } from "lucide-react";
import { toast, Toaster } from "sonner@2.0.3";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { getDailyReadings, saveDailyReadings } from "./utils/api";

interface BungalowData {
  id: number;
  name: string;
  acidReplace: boolean;
  chlorineReplace: boolean;
  chlorineLevel: string;
  pH: string;
  temperature: string;
  flow: string;
}

const STORAGE_KEY = "pool-readings-data";

function App() {
  const [bungalows, setBungalows] = useState<BungalowData[]>(() => {
    // Load from localStorage on initial mount
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved data:", e);
      }
    }
    // Default initial data
    return Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      name: `Bungalow ${String(i + 1).padStart(2, '0')}`,
      acidReplace: false,
      chlorineReplace: false,
      chlorineLevel: "",
      pH: "",
      temperature: "",
      flow: "",
    }));
  });

  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load data from Supabase on mount
  useEffect(() => {
    loadFromSupabase();
  }, []);

  const loadFromSupabase = async () => {
    const data = await getDailyReadings();
    if (data && data.length > 0) {
      setBungalows(data);
      // Also update localStorage as backup
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  };

  // Auto-save to both localStorage and Supabase whenever data changes
  useEffect(() => {
    const saveData = async () => {
      // Always save to localStorage immediately
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bungalows));
      
      // Also save to Supabase
      const success = await saveDailyReadings(bungalows);
      setIsOnline(success);
    };

    saveData();
  }, [bungalows]);

  const handleUpdate = (id: number, field: keyof BungalowData, value: string | boolean) => {
    setBungalows(prev =>
      prev.map(bungalow =>
        bungalow.id === id
          ? { ...bungalow, [field]: value }
          : bungalow
      )
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleManualSave = async () => {
    setIsSyncing(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bungalows));
    const success = await saveDailyReadings(bungalows);
    setIsSyncing(false);
    
    if (success) {
      toast.success("Data saved to cloud successfully!");
      setIsOnline(true);
    } else {
      toast.warning("Saved locally, but cloud sync failed. Will retry automatically.");
      setIsOnline(false);
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 no-print">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="mb-2">Florida Pool & Spa Monitoring</h1>
                <p className="text-slate-600 mb-2">
                  Monitoring 20 bungalows (500 gallons each) - State of Florida Pools and Spas Regulations
                </p>
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <Cloud className="h-4 w-4" />
                      <span>Cloud Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-amber-600 text-sm">
                      <CloudOff className="h-4 w-4" />
                      <span>Offline Mode (data saved locally)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-6 no-print">
              <TabsTrigger value="daily">
                <Calendar className="mr-2 h-4 w-4" />
                Daily Readings
              </TabsTrigger>
              <TabsTrigger value="weekly">
                <CalendarDays className="mr-2 h-4 w-4" />
                Weekly Readings
              </TabsTrigger>
              <TabsTrigger value="treatment">
                <Droplet className="mr-2 h-4 w-4" />
                Water Treatment
              </TabsTrigger>
            </TabsList>

            <TabsContent value="daily">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="print-only">
                    <h2>Daily Readings - All Bungalows</h2>
                    <p className="text-slate-600">Report Generated: {getCurrentDateTime()}</p>
                  </div>
                  <div className="flex gap-2 no-print ml-auto">
                    <Button onClick={handleManualSave} variant="outline" disabled={isSyncing}>
                      <Save className="mr-2 h-4 w-4" />
                      {isSyncing ? "Syncing..." : "Save"}
                    </Button>
                    <Button onClick={handlePrint} variant="outline">
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {bungalows.map((bungalow) => (
                  <BungalowCard
                    key={bungalow.id}
                    data={bungalow}
                    onUpdate={handleUpdate}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="weekly">
              <WeeklyReadings />
            </TabsContent>

            <TabsContent value="treatment">
              <WaterTreatment />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

export default App;