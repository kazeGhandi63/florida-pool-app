import { useState, useEffect } from "react";
import { WeeklyBungalowCard } from "./WeeklyBungalowCard";
import { Button } from "./ui/button";
import { Printer, Save, Cloud, CloudOff } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { getWeeklyReadings, saveWeeklyReadings, getDailyReadings } from "../utils/api";

interface WeeklyBungalowData {
  id: number;
  name: string;
  alkalinity: string;
  calciumHardness: string;
  tds: string;
}

interface DailyBungalowData {
  id: number;
  name: string;
  acidReplace: boolean;
  chlorineReplace: boolean;
  chlorineLevel: string;
  pH: string;
  temperature: string;
  flow: string;
}

const WEEKLY_STORAGE_KEY = "pool-weekly-readings-data";
const DAILY_STORAGE_KEY = "pool-readings-data";

export function WeeklyReadings() {
  const [sundayBungalows, setSundayBungalows] = useState<WeeklyBungalowData[]>(() => {
    const saved = localStorage.getItem(WEEKLY_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.sunday || createDefaultBungalows(1, 10);
      } catch (e) {
        console.error("Failed to parse saved weekly data:", e);
      }
    }
    return createDefaultBungalows(1, 10);
  });

  const [wednesdayBungalows, setWednesdayBungalows] = useState<WeeklyBungalowData[]>(() => {
    const saved = localStorage.getItem(WEEKLY_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.wednesday || createDefaultBungalows(11, 20);
      } catch (e) {
        console.error("Failed to parse saved weekly data:", e);
      }
    }
    return createDefaultBungalows(11, 20);
  });

  const [dailyReadings, setDailyReadings] = useState<DailyBungalowData[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load data from Supabase on mount
  useEffect(() => {
    loadFromSupabase();
  }, []);

  const loadFromSupabase = async () => {
    // Load weekly readings
    const weeklyData = await getWeeklyReadings();
    if (weeklyData) {
      if (weeklyData.sunday && weeklyData.sunday.length > 0) {
        setSundayBungalows(weeklyData.sunday);
      }
      if (weeklyData.wednesday && weeklyData.wednesday.length > 0) {
        setWednesdayBungalows(weeklyData.wednesday);
      }
      // Update localStorage as backup
      localStorage.setItem(WEEKLY_STORAGE_KEY, JSON.stringify(weeklyData));
    }

    // Load daily readings for LSI calculation
    const dailyData = await getDailyReadings();
    if (dailyData) {
      setDailyReadings(dailyData);
      localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(dailyData));
    }
  };

  // Load daily readings from localStorage initially
  useEffect(() => {
    const saved = localStorage.getItem(DAILY_STORAGE_KEY);
    if (saved) {
      try {
        setDailyReadings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse daily readings:", e);
      }
    }
  }, []);

  // Auto-save weekly readings to both localStorage and Supabase
  useEffect(() => {
    const saveData = async () => {
      // Always save to localStorage immediately
      localStorage.setItem(
        WEEKLY_STORAGE_KEY,
        JSON.stringify({
          sunday: sundayBungalows,
          wednesday: wednesdayBungalows,
        })
      );
      
      // Also save to Supabase
      const success = await saveWeeklyReadings(sundayBungalows, wednesdayBungalows);
      setIsOnline(success);
    };

    saveData();
  }, [sundayBungalows, wednesdayBungalows]);

  function createDefaultBungalows(start: number, end: number): WeeklyBungalowData[] {
    return Array.from({ length: end - start + 1 }, (_, i) => ({
      id: start + i,
      name: `Bungalow ${String(start + i).padStart(2, '0')}`,
      alkalinity: "",
      calciumHardness: "",
      tds: "",
    }));
  }

  const getDailyReadingForBungalow = (id: number) => {
    const daily = dailyReadings.find(b => b.id === id);
    if (!daily) return null;
    return {
      pH: daily.pH,
      temperature: daily.temperature,
    };
  };

  const handleSundayUpdate = (id: number, field: keyof WeeklyBungalowData, value: string) => {
    setSundayBungalows(prev =>
      prev.map(bungalow =>
        bungalow.id === id
          ? { ...bungalow, [field]: value }
          : bungalow
      )
    );
  };

  const handleWednesdayUpdate = (id: number, field: keyof WeeklyBungalowData, value: string) => {
    setWednesdayBungalows(prev =>
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
    localStorage.setItem(
      WEEKLY_STORAGE_KEY,
      JSON.stringify({
        sunday: sundayBungalows,
        wednesday: wednesdayBungalows,
      })
    );
    const success = await saveWeeklyReadings(sundayBungalows, wednesdayBungalows);
    setIsSyncing(false);
    
    if (success) {
      toast.success("Weekly data saved to cloud successfully!");
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
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4 no-print">
            <div>
              <h2 className="mb-2">Weekly Pool Readings</h2>
              <p className="text-slate-600 mb-2">
                Sunday: Bungalows 1-10 | Wednesday: Bungalows 11-20
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
            <div className="flex gap-2">
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
          <div className="print-only print-header">
            <h2>Weekly Pool Readings</h2>
            <p>Report Generated: {getCurrentDateTime()}</p>
          </div>
        </div>

        <Tabs defaultValue="sunday" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6 no-print">
            <TabsTrigger value="sunday">Sunday (1-10)</TabsTrigger>
            <TabsTrigger value="wednesday">Wednesday (11-20)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sunday">
            {/* Sunday Page 1: Bungalows 1-6 */}
            <div className="page-section">
              <div className="mb-2 print-only print-day-header">
                <h3>Sunday Readings - Bungalows 1-6</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 weekly-grid">
                {sundayBungalows.slice(0, 6).map((bungalow) => (
                  <WeeklyBungalowCard
                    key={bungalow.id}
                    data={bungalow}
                    dailyData={getDailyReadingForBungalow(bungalow.id)}
                    onUpdate={handleSundayUpdate}
                  />
                ))}
              </div>
            </div>

            {/* Sunday Page 2: Bungalows 7-10 */}
            <div className="page-section page-break">
              <div className="mb-2 print-only print-day-header">
                <h3>Sunday Readings - Bungalows 7-10</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 weekly-grid">
                {sundayBungalows.slice(6, 10).map((bungalow) => (
                  <WeeklyBungalowCard
                    key={bungalow.id}
                    data={bungalow}
                    dailyData={getDailyReadingForBungalow(bungalow.id)}
                    onUpdate={handleSundayUpdate}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="wednesday">
            {/* Wednesday Page 1: Bungalows 11-16 */}
            <div className="page-section">
              <div className="mb-2 print-only print-day-header">
                <h3>Wednesday Readings - Bungalows 11-16</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 weekly-grid">
                {wednesdayBungalows.slice(0, 6).map((bungalow) => (
                  <WeeklyBungalowCard
                    key={bungalow.id}
                    data={bungalow}
                    dailyData={getDailyReadingForBungalow(bungalow.id)}
                    onUpdate={handleWednesdayUpdate}
                  />
                ))}
              </div>
            </div>

            {/* Wednesday Page 2: Bungalows 17-20 */}
            <div className="page-section page-break">
              <div className="mb-2 print-only print-day-header">
                <h3>Wednesday Readings - Bungalows 17-20</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 weekly-grid">
                {wednesdayBungalows.slice(6, 10).map((bungalow) => (
                  <WeeklyBungalowCard
                    key={bungalow.id}
                    data={bungalow}
                    dailyData={getDailyReadingForBungalow(bungalow.id)}
                    onUpdate={handleWednesdayUpdate}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}