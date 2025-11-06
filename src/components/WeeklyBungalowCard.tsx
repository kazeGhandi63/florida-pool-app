import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

interface DailyReadingData {
  pH: string;
  temperature: string;
}

interface WeeklyBungalowData {
  id: number;
  name: string;
  alkalinity: string;
  calciumHardness: string;
  tds: string;
}

interface WeeklyBungalowCardProps {
  data: WeeklyBungalowData;
  dailyData: DailyReadingData | null;
  onUpdate: (id: number, field: keyof WeeklyBungalowData, value: string) => void;
}

export function WeeklyBungalowCard({ data, dailyData, onUpdate }: WeeklyBungalowCardProps) {
  // LSI Calculation
  const calculateLSI = (): { lsi: number | null; status: string; statusColor: string; comment: string } => {
    const pH = parseFloat(dailyData?.pH || "0");
    const temp = parseFloat(dailyData?.temperature || "0");
    const alkalinity = parseFloat(data.alkalinity || "0");
    const calcium = parseFloat(data.calciumHardness || "0");
    const tds = parseFloat(data.tds || "0");

    // Check if all values are valid
    if (!pH || !temp || !alkalinity || !calcium || !tds) {
      return { lsi: null, status: "Incomplete", statusColor: "bg-slate-500", comment: "Enter all values to calculate LSI" };
    }

    // Convert temperature to Celsius
    const tempCelsius = (temp - 32) * 5/9;

    // Calculate factors for pHs (saturation pH)
    // A = TDS Factor = (Log10[TDS] - 1) / 10
    const A = (Math.log10(tds) - 1) / 10;

    // B = Temperature Factor = -13.12 × Log10(°C + 273) + 34.55
    const B = -13.12 * Math.log10(tempCelsius + 273) + 34.55;

    // C = Calcium Hardness Factor = Log10[Ca as CaCO3] - 0.4
    const C = Math.log10(calcium) - 0.4;

    // D = Alkalinity Factor = Log10[Alkalinity as CaCO3]
    const D = Math.log10(alkalinity);

    // Calculate saturation pH
    const pHs = (9.3 + A + B) - (C + D);

    // Calculate LSI = pH - pHs
    const lsi = pH - pHs;

    let status = "";
    let statusColor = "";
    let comment = "";

    if (lsi >= -0.3 && lsi <= 0.3) {
      status = "Balanced";
      statusColor = "bg-green-500";
      comment = "Water is balanced with no negative effects on pool or equipment.";
    } else if (lsi < -0.3) {
      status = "Corrosive";
      statusColor = "bg-red-500";
      comment = "Water is undersaturated and aggressive. May cause etching, pitting, and staining of pool surfaces and equipment.";
    } else {
      status = "Scale-forming";
      statusColor = "bg-orange-500";
      comment = "Water is oversaturated. May lead to scale formation on pool surfaces, pipes, and filters.";
    }

    return { lsi, status, statusColor, comment };
  };

  const lsiResult = calculateLSI();

  return (
    <Card className="p-6 weekly-card">
      <h3 className="mb-4">{data.name}</h3>
      
      {/* Daily Reading References */}
      <div className="mb-4 p-3 bg-slate-100 rounded-md daily-ref">
        <p className="mb-1">From Daily:</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-slate-600">pH: </span>
            <span>{dailyData?.pH || "N/A"}</span>
          </div>
          <div>
            <span className="text-slate-600">T: </span>
            <span>{dailyData?.temperature || "N/A"}°F</span>
          </div>
        </div>
      </div>

      {/* Alkalinity */}
      <div className="mb-3">
        <Label htmlFor={`alkalinity-${data.id}`} className="field-label">Alkalinity</Label>
        <Input
          id={`alkalinity-${data.id}`}
          type="number"
          value={data.alkalinity}
          onChange={(e) => onUpdate(data.id, 'alkalinity', e.target.value)}
          placeholder="ppm"
        />
      </div>

      {/* Calcium Hardness */}
      <div className="mb-3">
        <Label htmlFor={`calcium-${data.id}`} className="field-label">Ca Hardness</Label>
        <Input
          id={`calcium-${data.id}`}
          type="number"
          value={data.calciumHardness}
          onChange={(e) => onUpdate(data.id, 'calciumHardness', e.target.value)}
          placeholder="ppm"
        />
      </div>

      {/* TDS */}
      <div className="mb-3">
        <Label htmlFor={`tds-${data.id}`} className="field-label">TDS</Label>
        <Input
          id={`tds-${data.id}`}
          type="number"
          value={data.tds}
          onChange={(e) => onUpdate(data.id, 'tds', e.target.value)}
          placeholder="ppm"
        />
      </div>

      {/* LSI Calculation Result */}
      <div className="mt-4 p-4 border-2 rounded-md bg-slate-50 lsi-result">
        <div className="flex items-center justify-between mb-2">
          <Label className="lsi-label">LSI</Label>
          {lsiResult.lsi !== null && (
            <Badge className={lsiResult.statusColor}>
              {lsiResult.status}
            </Badge>
          )}
        </div>
        {lsiResult.lsi !== null ? (
          <>
            <p className="mb-1">
              <span>{lsiResult.lsi.toFixed(2)}</span>
            </p>
            <p className="text-slate-600 lsi-comment">{lsiResult.comment}</p>
          </>
        ) : (
          <p className="text-slate-500">{lsiResult.comment}</p>
        )}
      </div>
    </Card>
  );
}
