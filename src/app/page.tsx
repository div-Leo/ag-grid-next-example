"use client";

import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  IServerSideDatasource,
  IServerSideGetRowsRequest,
  ModuleRegistry,
  ValidationModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule,
  IServerSideGetRowsParams,
  themeQuartz
} from "ag-grid-community";
import {
  MultiFilterModule,
  GroupFilterModule,
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  ServerSideRowModelModule,
} from "ag-grid-enterprise";


ModuleRegistry.registerModules([
  ColumnsToolPanelModule,
  ColumnMenuModule,
  ContextMenuModule,
  ServerSideRowModelModule,
  MultiFilterModule,
  GroupFilterModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule,
  ValidationModule /* Development Only */,
]);


export interface IOlympicData {
  athlete: string,
  age: number,
  country: string,
  year: number,
  date: string,
  sport: string,
  gold: number,
  silver: number,
  bronze: number,
  total: number
}

const myTheme = themeQuartz
  .withParams({
    backgroundColor: "#292C3D",
    accentColor: "#6271EB",
    browserColorScheme: "dark",
    chromeBackgroundColor: {
      ref: "foregroundColor",
      mix: 0.07,
      onto: "backgroundColor"
    },
    foregroundColor: "#FFF",
    headerFontSize: 14
  });

// Function to fetch data from the API
async function fetchDataFromApi(request: IServerSideGetRowsRequest) {
  try {
    const response = await fetch('/api/olympicWinners', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching data from API:', error);
    return { success: false, rows: [], lastRow: 0 };
  }
}

const App = () => {
  const [loading, setLoading] = useState(false);

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    { field: "athlete", minWidth: 220 },
    { field: "country", minWidth: 200 },
    {
      field: "year",
      filter: 'agNumberColumnFilter',
    },
    {
      pinned: "left",
      field: "sport",
      minWidth: 200,
      filter: true,
    },
    { field: "gold" },
    { field: "silver" },
    { field: "bronze" },
  ]);
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
      minWidth: 100,
      sortable: true,
      filter: true,
    };
  }, []);


  const datasource: IServerSideDatasource = useMemo(() => ({
    getRows: (params: IServerSideGetRowsParams & {
      success: (response: { rowData: any[], rowCount?: number }) => void;
      fail: () => void;
    }) => {
      setLoading(true);
      fetchDataFromApi(params.request)
        .then(response => {
          params.success({
            rowData: response.rows,
            rowCount: response.lastRow
          });
          setLoading(false);
        })
        .catch(error => {
          console.error(error);
          params.fail();
          setLoading(false);
        });
    }
  }), []);


  return (
    <div className="w-screen h-screen bg-gray-500">
      {loading && <div className="absolute top-2.5 right-2.5 px-2.5 py-1.5 rounded z-[1000]">Loading...</div>}
      <div className="w-full h-full">
        <AgGridReact<IOlympicData>
          theme={myTheme}
          serverSideDatasource={datasource}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowModelType={"serverSide"}
        />
      </div>
    </div>
  );
};



export default App;
