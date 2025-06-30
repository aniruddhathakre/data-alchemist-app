"use client";
import { useAppStore } from "@/lib/store";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function ValidationSummary() {
  // This component connects to our global store and listens for changes to validationErrors
  const errors = useAppStore((state) => state.validationErrors);

  // If there are no errors, we render nothing.
  if (errors.length === 0) {
    return null;
  }

  // If there ARE errors, we render a destructive (red) alert box.
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Validation Errors ({errors.length})</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          {/* We loop over the errors array and create a list item for each one */}
          {errors.map((error, index) => (
            <li key={index} className="text-xs">
              <strong>ID: {error.entityId}</strong> (Field: {error.field}):{" "}
              {error.message}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
