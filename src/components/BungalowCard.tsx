import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";

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

interface BungalowCardProps {
  data: BungalowData;
  onUpdate: (id: number, field: keyof BungalowData, value: string | boolean) => void;
}

export function BungalowCard({ data, onUpdate }: BungalowCardProps) {
  const chlorineValue = parseFloat(data.chlorineLevel);
  const pHValue = parseFloat(data.pH);
  
  const isChlorineHigh = !isNaN(chlorineValue) && chlorineValue > 5.0;
  const ispHHigh = !isNaN(pHValue) && pHValue > 7.8;
  const ispHIdeal = !isNaN(pHValue) && pHValue >= 7.4 && pHValue <= 7.6;

  // Generate chlorine level options from 1.0 to 10.0 in 0.1 increments
  const chlorineLevels = [];
  for (let i = 10; i <= 100; i++) {
    chlorineLevels.push((i / 10).toFixed(1));
  }

  // Generate pH options from 7.0 to 7.8 in 0.1 increments
  const pHLevels = [];
  for (let i = 70; i <= 78; i++) {
    pHLevels.push((i / 10).toFixed(1));
  }

  return (
    <Card className="p-6">
      <h3 className="mb-4">{data.name}</h3>
      
      {/* Top Row: Acid and Chlorine Checkboxes */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`acid-${data.id}`}
            checked={data.acidReplace}
            onCheckedChange={(checked) => 
              onUpdate(data.id, 'acidReplace', checked as boolean)
            }
          />
          <Label htmlFor={`acid-${data.id}`}>Acid</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`chlorine-replace-${data.id}`}
            checked={data.chlorineReplace}
            onCheckedChange={(checked) => 
              onUpdate(data.id, 'chlorineReplace', checked as boolean)
            }
          />
          <Label htmlFor={`chlorine-replace-${data.id}`}>Chlorine</Label>
        </div>
      </div>

      {/* Chlorine Level */}
      <div className="mb-4">
        <Label htmlFor={`chlorine-${data.id}`}>Chlorine Level</Label>
        <Select
          value={data.chlorineLevel}
          onValueChange={(value) => onUpdate(data.id, 'chlorineLevel', value)}
        >
          <SelectTrigger 
            id={`chlorine-${data.id}`}
            className={isChlorineHigh ? "border-red-500 bg-red-50" : ""}
          >
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            {chlorineLevels.map((level) => (
              <SelectItem 
                key={level} 
                value={level}
                className={parseFloat(level) > 5.0 ? "text-red-600" : ""}
              >
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isChlorineHigh && (
          <p className="text-red-600 mt-1">⚠ Above safe level (&gt;5.0)</p>
        )}
      </div>

      {/* pH Level */}
      <div className="mb-4">
        <Label htmlFor={`ph-${data.id}`}>pH Level</Label>
        <Select
          value={data.pH}
          onValueChange={(value) => onUpdate(data.id, 'pH', value)}
        >
          <SelectTrigger 
            id={`ph-${data.id}`}
            className={
              ispHHigh 
                ? "border-red-500 bg-red-50" 
                : ispHIdeal 
                ? "border-green-500 bg-green-50" 
                : ""
            }
          >
            <SelectValue placeholder="Select pH" />
          </SelectTrigger>
          <SelectContent>
            {pHLevels.map((level) => (
              <SelectItem 
                key={level} 
                value={level}
                className={
                  parseFloat(level) > 7.8 
                    ? "text-red-600" 
                    : parseFloat(level) >= 7.4 && parseFloat(level) <= 7.6
                    ? "text-green-600"
                    : ""
                }
              >
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {ispHHigh && (
          <p className="text-red-600 mt-1">⚠ Above safe level (&gt;7.8)</p>
        )}
        {ispHIdeal && (
          <p className="text-green-600 mt-1">✓ Ideal range (7.4-7.6)</p>
        )}
      </div>

      {/* Temperature */}
      <div className="mb-4">
        <Label htmlFor={`temp-${data.id}`}>Temperature (°F)</Label>
        <Input
          id={`temp-${data.id}`}
          type="number"
          value={data.temperature}
          onChange={(e) => onUpdate(data.id, 'temperature', e.target.value)}
          placeholder="Enter temperature"
        />
      </div>

      {/* Flow */}
      <div>
        <Label htmlFor={`flow-${data.id}`}>Flow (GPM)</Label>
        <Input
          id={`flow-${data.id}`}
          type="number"
          value={data.flow}
          onChange={(e) => onUpdate(data.id, 'flow', e.target.value)}
          placeholder="Enter flow rate"
        />
      </div>
    </Card>
  );
}
