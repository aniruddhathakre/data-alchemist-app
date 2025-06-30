"use client";
import { useAppStore } from "@/lib/store";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function PrioritizationWeights() {
  // Get the weights and the setter function from our global store
  const { weights, setWeight } = useAppStore();

  return (
    <div className="space-y-6 pt-4">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label htmlFor="fulfillment-slider">Maximize Fulfillment</Label>
          <span className="text-sm font-medium text-primary">
            {weights.fulfillment || 50}
          </span>
        </div>
        <Slider
          id="fulfillment-slider"
          defaultValue={[weights.fulfillment || 50]}
          onValueChange={(value) => setWeight("fulfillment", value[0])}
          max={100}
          step={1}
        />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label htmlFor="fairness-slider">Ensure Fairness</Label>
          <span className="text-sm font-medium text-primary">
            {weights.fairness || 50}
          </span>
        </div>
        <Slider
          id="fairness-slider"
          defaultValue={[weights.fairness || 50]}
          onValueChange={(value) => setWeight("fairness", value[0])}
          max={100}
          step={1}
        />
      </div>
    </div>
  );
}
