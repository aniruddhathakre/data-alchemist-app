"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useAppStore } from "@/lib/store"; // <-- Import our global store
import { parseFile } from "@/lib/parser";
import { runAllValidators } from "@/lib/validators";

// We add a new 'prop' to tell the component which file it's responsible for
interface SingleFileUploaderProps {
  title: string;
  fileType: "client" | "workers" | "tasks";
}

export function SingleFileUploader({
  title,
  fileType,
}: SingleFileUploaderProps) {
  // We get ALL state and functions from our global store
  const {
    clientFile,
    workersFile,
    tasksFile,
    setClientFile,
    setWorkersFile,
    setTasksFile,
  } = useAppStore();

  // Based on the 'fileType' prop, we figure out which file and function to use
  let file: File | null;
  let setFile: (file: File | null) => void;

  if (fileType === "client") {
    file = clientFile;
    setFile = setClientFile;
  } else if (fileType === "workers") {
    file = workersFile;
    setFile = setWorkersFile;
  } else {
    file = tasksFile;
    setFile = setTasksFile;
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    // We make the onDrop function 'async' to handle the parsing
    onDrop: async (acceptedFiles) => {
      const uploadedFile = acceptedFiles[0];
      if (!uploadedFile) return;

      // 1. Set the raw File object in the store
      setFile(uploadedFile);

      // 2. Parse the file and update the corresponding data state
      try {
        const parsedData = await parseFile(uploadedFile);
        if (fileType === "client") {
          useAppStore.getState().setClientData(parsedData);
        } else if (fileType === "workers") {
          useAppStore.getState().setWorkersData(parsedData);
        } else {
          useAppStore.getState().setTasksData(parsedData);
        }
        console.log(`Successfully parsed ${fileType} data:`, parsedData);

        const errors = runAllValidators();
        useAppStore.getState().setValidationErrors(errors);
      } catch (error) {
        console.error(`Error parsing ${fileType} file:`, error);
      }
    },
    multiple: false,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
  });

  const handleRemoveFile = () => {
    // When removing a file, we must also clear its parsed data
    if (fileType === "client") {
      useAppStore.getState().setClientData([]);
    } else if (fileType === "workers") {
      useAppStore.getState().setWorkersData([]);
    } else {
      useAppStore.getState().setTasksData([]);
    }
    setFile(null);
  };

  // The JSX part below is identical to what we had before.
  // It will now show the file from the global state.
  return (
    <div>
      <p className="text-sm font-medium mb-2">{title}</p>
      <Card>
        <CardContent className="p-4">
          {file ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium truncate">
                  {file.name}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-md cursor-pointer hover:border-primary/50 transition-colors ${
                isDragActive ? "border-primary" : ""
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-muted-foreground">CSV or XLSX file</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
