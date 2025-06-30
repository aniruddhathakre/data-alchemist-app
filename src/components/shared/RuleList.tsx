"use client";
import { useAppStore } from "@/lib/store";

import { Button } from "@/components/ui/button";

export function RuleList() {
  // Get the rules array and the clearRules function from the store
  const { rules, clearRules } = useAppStore();

  // If there are no rules, don't show anything
  if (rules.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Current Rules</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearRules}
          className="h-auto py-1 px-2"
        >
          Clear All
        </Button>
      </div>
      {/* The <pre> tag is great for displaying formatted JSON data for debugging */}
      <pre className="text-xs p-4 bg-muted rounded-md overflow-x-auto">
        {JSON.stringify(rules, null, 2)}
      </pre>
    </div>
  );
}
