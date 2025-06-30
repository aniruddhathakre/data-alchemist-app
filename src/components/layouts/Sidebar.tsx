import { SingleFileUploader } from "@/components/shared/SingleFileUploader";
import { ValidationSummary } from "@/components/shared/ValidationSummary";
import { RuleBuilder } from "@/components/shared/RuleBuilder";
import { RuleList } from "@/components/shared/RuleList";
import { PrioritizationWeights } from "@/components/shared/PrioritizationWeights";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { jsonToCsv } from "@/lib/parser"; // <-- New import

export function Sidebar() {
  // This is a generic helper function to trigger a file download
  const triggerDownload = (
    content: string,
    fileName: string,
    mimeType: string
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // UPDATED handleExport function
  const handleExport = () => {
    const { rules, weights, clientData, workersData, tasksData } =
      useAppStore.getState();

    // --- Export rules.json ---
    const exportConfig = { rules, weights };
    const jsonString = JSON.stringify(exportConfig, null, 2);
    triggerDownload(jsonString, "rules.json", "application/json");

    // --- Export the three data files ---
    // We only export if there is data to prevent empty file downloads
    if (clientData.length > 0) {
      triggerDownload(jsonToCsv(clientData), "clients_cleaned.csv", "text/csv");
    }
    if (workersData.length > 0) {
      triggerDownload(
        jsonToCsv(workersData),
        "workers_cleaned.csv",
        "text/csv"
      );
    }
    if (tasksData.length > 0) {
      triggerDownload(jsonToCsv(tasksData), "tasks_cleaned.csv", "text/csv");
    }
  };

  return (
    <aside className="w-80 border-r p-4 flex flex-col">
      <h2 className="text-lg font-semibold tracking-tight mb-4">Controls</h2>

      <div className="flex-grow overflow-y-auto pr-2">
        <Accordion
          type="multiple"
          defaultValue={["item-1", "item-2", "item-3", "item-4"]}
          className="w-full"
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>File Uploads</AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <SingleFileUploader title="Clients Data" fileType="client" />
              <SingleFileUploader title="Workers Data" fileType="workers" />
              <SingleFileUploader title="Tasks Data" fileType="tasks" />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Rule Configuration</AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <RuleBuilder />
              <RuleList />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Prioritization & Weights</AccordionTrigger>
            <AccordionContent>
              <PrioritizationWeights />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Validation Summary</AccordionTrigger>
            <AccordionContent className="pt-4">
              <ValidationSummary />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="mt-auto pt-4 border-t">
        <Button className="w-full" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export All Files
        </Button>
      </div>
    </aside>
  );
}
