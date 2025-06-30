"use client";
import { AgGridReact } from "ag-grid-react";
import {
  ModuleRegistry,
  AllCommunityModule,
  ColDef,
  CellValueChangedEvent,
  CellClassParams,
} from "ag-grid-community";
// FIX: Removed 'ValidationError' as it was not being used in this file.
import { useAppStore, DataRow } from "@/lib/store";
import { runAllValidators } from "@/lib/validators";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useTheme } from "next-themes";
import { useMemo } from "react";

ModuleRegistry.registerModules([AllCommunityModule]);

interface DataGridProps {
  rowData: DataRow[];
  fileType: "client" | "workers" | "tasks";
}

export function DataGrid({ rowData, fileType }: DataGridProps) {
  const { setClientData, setWorkersData, setTasksData, validationErrors } =
    useAppStore();
  const { theme } = useTheme();

  const cellClassRules = useMemo(
    () => ({
      "cell-error": (params: CellClassParams) => {
        // FIX: Explicitly cast the data and ID fields to String to ensure type safety.
        const rowData = params.data as DataRow;
        const cell_id = String(
          rowData.ClientID || rowData.WorkerID || rowData.TaskID
        );
        const cell_field = params.colDef.field;

        return validationErrors.some(
          (error) => error.entityId === cell_id && error.field === cell_field
        );
      },
    }),
    [validationErrors]
  );

  const colDefs: ColDef[] = useMemo(() => {
    if (rowData.length === 0) return [];
    return Object.keys(rowData[0]).map((key) => ({
      headerName: key,
      field: key,
      filter: true,
      sortable: true,
      resizable: true,
      editable: true,
      cellClassRules: cellClassRules,
    }));
  }, [rowData, cellClassRules]);

  const onCellValueChanged = (event: CellValueChangedEvent) => {
    const updatedData = event.api
      .getRenderedNodes()
      .map((node) => node.data as DataRow);

    if (fileType === "client") {
      setClientData(updatedData);
    } else if (fileType === "workers") {
      setWorkersData(updatedData);
    } else {
      setTasksData(updatedData);
    }

    const errors = runAllValidators();
    useAppStore.getState().setValidationErrors(errors);
  };

  const gridTheme =
    theme === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";

  if (rowData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-md">
        <p className="text-muted-foreground">
          Please upload a file to see the data.
        </p>
      </div>
    );
  }

  return (
    <div className={gridTheme} style={{ height: 600, width: "100%" }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        pagination={true}
        paginationPageSize={20}
        paginationPageSizeSelector={[20, 50, 100]}
        onCellValueChanged={onCellValueChanged}
        theme="legacy"
      />
    </div>
  );
}
