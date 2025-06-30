"use client";
import { useAppStore, Rule } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export function RuleBuilder() {
  const { tasksData, clientData, workersData, addRule } = useAppStore();

  // --- State for manual rules ---
  const [coRunTask, setCoRunTask] = useState<string | null>(null);
  const [slotRuleGroupType, setSlotRuleGroupType] = useState<
    "client" | "worker"
  >("client");
  const [slotRuleGroup, setSlotRuleGroup] = useState<string | null>(null);
  const [minCommonSlots, setMinCommonSlots] = useState<number>(1);
  const [loadLimitGroup, setLoadLimitGroup] = useState<string | null>(null);
  const [maxSlots, setMaxSlots] = useState<number>(1);

  // --- State for the Natural Language rule input ---
  const [nlRuleText, setNlRuleText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const clientGroups = useMemo(
    () =>
      Array.from(new Set(clientData.map((c) => c.GroupTag).filter(Boolean))),
    [clientData]
  );
  const workerGroups = useMemo(
    () =>
      Array.from(
        new Set(workersData.map((w) => w.WorkerGroup).filter(Boolean))
      ),
    [workersData]
  );

  if (
    tasksData.length === 0 ||
    clientData.length === 0 ||
    workersData.length === 0
  ) {
    return (
      <p className="text-sm text-muted-foreground">
        Please upload all data files to begin creating rules.
      </p>
    );
  }

  const handleCreateCoRunRule = () => {
    if (!coRunTask) return;
    const newRule: Rule = {
      type: "coRun",
      tasks: [coRunTask, "T_DUMMY_FOR_TESTING"],
    };
    addRule(newRule);
    console.log("New co-run rule added:", newRule);
  };

  const handleCreateSlotRule = () => {
    if (!slotRuleGroup) return;
    const newRule: Rule = {
      type: "slot-restriction",
      groupType: slotRuleGroupType,
      group: slotRuleGroup,
      minCommonSlots: minCommonSlots,
    };
    addRule(newRule);
    console.log("New slot restriction rule added:", newRule);
  };

  const handleCreateLoadLimitRule = () => {
    if (!loadLimitGroup) return;
    const newRule: Rule = {
      type: "load-limit",
      group: loadLimitGroup,
      maxSlotsPerPhase: maxSlots,
    };
    addRule(newRule);
    console.log("New load limit rule added:", newRule);
  };

  const handleGenerateRuleFromNL = async () => {
    if (!nlRuleText.trim()) return;
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-rule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruleText: nlRuleText }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const newRule = await response.json();
      addRule(newRule);
      console.log("Successfully generated and added rule:", newRule);
      setNlRuleText("");
    } catch (error) {
      console.error("Error generating rule from NL:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* --- Co-run Rule Card --- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Co-run Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Select a task to create a sample co-run rule.
          </p>
          <Select onValueChange={(value) => setCoRunTask(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a task..." />
            </SelectTrigger>
            <SelectContent>
              {tasksData.map((task) => (
                // FIX: We cast the unknown values to String to satisfy TypeScript.
                <SelectItem
                  key={String(task.TaskID)}
                  value={String(task.TaskID)}
                >
                  {String(task.TaskName)} ({String(task.TaskID)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleCreateCoRunRule}
            size="sm"
            className="w-full"
            disabled={!coRunTask}
          >
            Add Co-run Rule
          </Button>
        </CardContent>
      </Card>

      {/* --- Slot Restriction Rule Card --- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Slot Restriction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Enforce a minimum number of common slots for a group.
          </p>
          <RadioGroup
            defaultValue="client"
            onValueChange={(value: "client" | "worker") => {
              setSlotRuleGroupType(value);
              setSlotRuleGroup(null);
            }}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="client" id="r-client" />
              <Label htmlFor="r-client">Client Group</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="worker" id="r-worker" />
              <Label htmlFor="r-worker">Worker Group</Label>
            </div>
          </RadioGroup>
          <Select value={slotRuleGroup || ""} onValueChange={setSlotRuleGroup}>
            <SelectTrigger>
              <SelectValue placeholder="Select a group..." />
            </SelectTrigger>
            <SelectContent>
              {(slotRuleGroupType === "client"
                ? clientGroups
                : workerGroups
              ).map((group) => (
                // FIX: We cast the unknown value to String.
                <SelectItem key={String(group)} value={String(group)}>
                  {String(group)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div>
            <Label htmlFor="min-slots">Min. Common Slots</Label>
            <Input
              id="min-slots"
              type="number"
              value={minCommonSlots}
              onChange={(e) => setMinCommonSlots(Number(e.target.value))}
              min="1"
            />
          </div>
          <Button
            onClick={handleCreateSlotRule}
            size="sm"
            className="w-full"
            disabled={!slotRuleGroup}
          >
            Add Slot Restriction Rule
          </Button>
        </CardContent>
      </Card>

      {/* --- Load Limit Rule Card --- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Load Limit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Set a maximum load for a specific worker group.
          </p>
          <Select onValueChange={setLoadLimitGroup}>
            <SelectTrigger>
              <SelectValue placeholder="Select a worker group..." />
            </SelectTrigger>
            <SelectContent>
              {workerGroups.map((group) => (
                // FIX: We cast the unknown value to String.
                <SelectItem key={String(group)} value={String(group)}>
                  {String(group)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div>
            <Label htmlFor="max-slots">Max Slots Per Phase</Label>
            <Input
              id="max-slots"
              type="number"
              value={maxSlots}
              onChange={(e) => setMaxSlots(Number(e.target.value))}
              min="1"
            />
          </div>
          <Button
            onClick={handleCreateLoadLimitRule}
            size="sm"
            className="w-full"
            disabled={!loadLimitGroup}
          >
            Add Load Limit Rule
          </Button>
        </CardContent>
      </Card>

      {/* --- Visual separator --- */}
      <div className="pt-4">
        <Separator />
      </div>

      {/* --- AI Rule Generation Card --- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Generate Rule from Text (AI)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Describe a rule in plain English and let the AI build it.
          </p>
          <Textarea
            placeholder='e.g., "Workers in DevTeamA can only work on 2 tasks per phase"'
            value={nlRuleText}
            onChange={(e) => setNlRuleText(e.target.value)}
          />
          <Button
            onClick={handleGenerateRuleFromNL}
            size="sm"
            className="w-full"
            disabled={!nlRuleText.trim() || isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Generate Rule with AI"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
