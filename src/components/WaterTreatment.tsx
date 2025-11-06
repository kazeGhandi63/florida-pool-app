import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Printer, AlertTriangle } from "lucide-react";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface WeeklyBungalowData {
  id: number;
  name: string;
  alkalinity: string;
  calciumHardness: string;
  tds: string;
}

interface TreatmentRecommendation {
  id: number;
  name: string;
  alkalinity: number | null;
  alkalinityCups: string | null;
  calciumHardness: number | null;
  calciumCups: string | null;
  needsTreatment: boolean;
}

const WEEKLY_STORAGE_KEY = "pool-weekly-readings-data";

export function WaterTreatment() {
  const [sundayBungalows, setSundayBungalows] = useState<WeeklyBungalowData[]>([]);
  const [wednesdayBungalows, setWednesdayBungalows] = useState<WeeklyBungalowData[]>([]);

  useEffect(() => {
    const loadData = () => {
      const saved = localStorage.getItem(WEEKLY_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSundayBungalows(parsed.sunday || []);
          setWednesdayBungalows(parsed.wednesday || []);
        } catch (e) {
          console.error("Failed to parse saved weekly data:", e);
        }
      }
    };

    loadData();
    
    // Listen for storage changes
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const getAlkalinityTreatment = (alkalinity: number): string | null => {
    if (alkalinity >= 30 && alkalinity <= 40) return "2 cups";
    if (alkalinity >= 50 && alkalinity <= 60) return "1.5 cups";
    if (alkalinity >= 70 && alkalinity <= 80) return "1 cup";
    return null;
  };

  const getCalciumTreatment = (calcium: number): string | null => {
    if (calcium <= 125) return "2 cups";
    if (calcium <= 150) return "1.5 cups";
    if (calcium <= 175) return "1 cup";
    return null;
  };

  const calculateTreatments = (bungalows: WeeklyBungalowData[]): TreatmentRecommendation[] => {
    return bungalows.map(bungalow => {
      const alkalinity = bungalow.alkalinity ? parseFloat(bungalow.alkalinity) : null;
      const calciumHardness = bungalow.calciumHardness ? parseFloat(bungalow.calciumHardness) : null;
      
      const alkalinityCups = alkalinity ? getAlkalinityTreatment(alkalinity) : null;
      const calciumCups = calciumHardness ? getCalciumTreatment(calciumHardness) : null;
      
      return {
        id: bungalow.id,
        name: bungalow.name,
        alkalinity,
        alkalinityCups,
        calciumHardness,
        calciumCups,
        needsTreatment: alkalinityCups !== null || calciumCups !== null
      };
    });
  };

  const sundayTreatments = calculateTreatments(sundayBungalows);
  const wednesdayTreatments = calculateTreatments(wednesdayBungalows);

  const handlePrint = () => {
    window.print();
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

  const TreatmentCard = ({ treatment }: { treatment: TreatmentRecommendation }) => {
    if (!treatment.needsTreatment) {
      return (
        <Card className="p-4 treatment-card">
          <h3 className="mb-3">{treatment.name}</h3>
          <div className="text-center py-4">
            <Badge className="bg-green-100 text-green-800">No Treatment Needed</Badge>
          </div>
        </Card>
      );
    }

    return (
      <Card className="p-4 treatment-card border-amber-200 bg-amber-50">
        <div className="flex items-center justify-between mb-3">
          <h3>{treatment.name}</h3>
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </div>
        
        {treatment.alkalinityCups && (
          <div className="mb-3 p-3 bg-white rounded border">
            <div className="flex justify-between items-start mb-1">
              <span className="text-slate-600">Alkalinity:</span>
              <span>{treatment.alkalinity} ppm</span>
            </div>
            <div className="mt-2 p-2 bg-blue-50 rounded">
              <p className="treatment-instruction">
                <strong>Add {treatment.alkalinityCups}</strong> of Sodium Bicarbonate
              </p>
            </div>
          </div>
        )}

        {treatment.calciumCups && (
          <div className="p-3 bg-white rounded border">
            <div className="flex justify-between items-start mb-1">
              <span className="text-slate-600">Calcium Hardness:</span>
              <span>{treatment.calciumHardness} ppm</span>
            </div>
            <div className="mt-2 p-2 bg-green-50 rounded">
              <p className="treatment-instruction">
                <strong>Add {treatment.calciumCups}</strong> of Calcium Chloride
              </p>
            </div>
          </div>
        )}
      </Card>
    );
  };

  const getTreatmentCount = (treatments: TreatmentRecommendation[]) => {
    return treatments.filter(t => t.needsTreatment).length;
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4 no-print">
            <div>
              <h2 className="mb-2">Water Treatment Recommendations</h2>
              <p className="text-slate-600">
                Based on weekly alkalinity and calcium hardness readings
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePrint} variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
          <div className="print-only print-header">
            <h2>Water Treatment Recommendations</h2>
            <p>Report Generated: {getCurrentDateTime()}</p>
          </div>
        </div>

        <Tabs defaultValue="sunday" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6 no-print">
            <TabsTrigger value="sunday">
              Sunday (1-10)
              {getTreatmentCount(sundayTreatments) > 0 && (
                <Badge className="ml-2 bg-amber-500">{getTreatmentCount(sundayTreatments)}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="wednesday">
              Wednesday (11-20)
              {getTreatmentCount(wednesdayTreatments) > 0 && (
                <Badge className="ml-2 bg-amber-500">{getTreatmentCount(wednesdayTreatments)}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sunday">
            {/* Treatment Guidelines - shown once at top */}
            <div className="mb-4 p-3 bg-slate-100 rounded-lg border border-slate-300 treatment-guide-section">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <strong className="text-slate-700">Alkalinity:</strong> 30-40ppm: 2 cups | 50-60ppm: 1.5 cups | 70-80ppm: 1 cup bicarb
                </div>
                <div>
                  <strong className="text-slate-700">Calcium:</strong> ≤125ppm: 2 cups | ≤150ppm: 1.5 cups | ≤175ppm: 1 cup calcium chloride
                </div>
              </div>
            </div>

            {/* Sunday: All Bungalows 1-10 */}
            <div className="page-section">
              <div className="mb-2 print-only print-day-header">
                <h3>Sunday Treatment - Bungalows 1-10</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 treatment-grid">
                {sundayTreatments.map((treatment) => (
                  <TreatmentCard key={treatment.id} treatment={treatment} />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="wednesday">
            {/* Treatment Guidelines - shown once at top */}
            <div className="mb-4 p-3 bg-slate-100 rounded-lg border border-slate-300 treatment-guide-section">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <strong className="text-slate-700">Alkalinity:</strong> 30-40ppm: 2 cups | 50-60ppm: 1.5 cups | 70-80ppm: 1 cup bicarb
                </div>
                <div>
                  <strong className="text-slate-700">Calcium:</strong> ≤125ppm: 2 cups | ≤150ppm: 1.5 cups | ≤175ppm: 1 cup calcium chloride
                </div>
              </div>
            </div>

            {/* Wednesday: All Bungalows 11-20 */}
            <div className="page-section">
              <div className="mb-2 print-only print-day-header">
                <h3>Wednesday Treatment - Bungalows 11-20</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 treatment-grid">
                {wednesdayTreatments.map((treatment) => (
                  <TreatmentCard key={treatment.id} treatment={treatment} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
