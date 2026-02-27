import { useState, useCallback, useEffect, createContext, useContext } from "react";
import { AppData, AnneeData, Etablissement, SchoolData, Agent, EffectifClasse, Inspection, getDefaultAppData } from "@/data/schoolData";

const STORAGE_KEY = "school-app-data";
const YEAR_KEY = "school-selected-year";

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure the data has required structure
      if (!parsed.ecoles) {
        return getDefaultAppData();
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to load data from localStorage, using default data:', e);
  }
  return getDefaultAppData();
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export interface AppStore {
  data: AppData;
  selectedYear: string;
  selectedSchoolId: string | null; // Added to select specific school
  availableYears: string[];
  availableSchools: Etablissement[]; // List of schools
  currentAnnee: AnneeData; // Current year data for selected school or aggregated
  currentSchool: Etablissement | null; // Current selected school

  setSelectedYear: (year: string) => void;
  setSelectedSchool: (schoolId: string | null) => void; // Added to select school
  addYear: (year: string) => void;
  // School Management
  addSchool: (schoolData: SchoolData) => void;
  deleteSchool: (schoolId: string) => void;

  // Inspection settings
  updateInspection: (inspection: any) => void; // Updated for inspection settings

  // Etablissement (for selected school)
  updateEtablissement: (etab: Etablissement) => void;

  // Agents (for selected school)
  setAgents: (agents: Agent[]) => void;

  // Effectifs (for selected school)
  setEffectifs: (effectifs: EffectifClasse[]) => void;
  updateEffectif: (classeId: string, garcons: number, filles: number) => void;

  // Inspection Agents CRUD
  addInspectionAgent: (agent: any) => void;
  updateInspectionAgent: (id: string, agent: any) => void;
  deleteInspectionAgent: (id: string) => void;
  getInspectionAgents: () => any[];

  // Import/Export
  exportYearJSON: () => string;
  importYearJSON: (json: string, year: string, schoolId?: string) => void; // Updated to include schoolId
  getExportData: () => { etablissement: Etablissement; annee: string; data: AnneeData };
  getAggregatedData: () => { etablissement: Inspection; annee: string; data: AnneeData }; // Added for aggregated data
}

const emptyAnnee: AnneeData = { effectifs: [], agents: [] };

export function useAppStoreImpl(): AppStore {
  const [data, setData] = useState<AppData>(loadData);
  const [selectedYear, setSelectedYear] = useState<string>("2025-2026");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

  // Update selected year when data loads
  useEffect(() => {
    const firstSchool = Object.values(data.ecoles)[0];
    if (firstSchool && Object.keys(firstSchool.annees).length > 0) {
      const firstYear = Object.keys(firstSchool.annees)[0];
      setSelectedYear(firstYear);
    }
  }, [data.ecoles]);

  useEffect(() => { saveData(data); }, [data]);
  useEffect(() => { localStorage.setItem(YEAR_KEY, selectedYear); }, [selectedYear]);

  // Get available years from all schools
  const availableYears = Array.from(
    new Set(
      Object.values(data.ecoles || {}).flatMap(school => Object.keys(school.annees || {}))
    )
  ).sort();

  // Get available schools
  const availableSchools = Object.values(data.ecoles || {}).map(school => school.etablissement);

  // Get current school and year data
  const currentSchool = selectedSchoolId ? data.ecoles[selectedSchoolId]?.etablissement || null : null;
  const currentAnnee = selectedSchoolId && data.ecoles[selectedSchoolId] 
    ? (data.ecoles[selectedSchoolId].annees[selectedYear] ?? emptyAnnee)
    : emptyAnnee; // Return empty if no school is selected

  const addYear = useCallback((year: string) => {
    if (selectedSchoolId && data.ecoles[selectedSchoolId]) {
      // Add year to selected school
      setData(prev => ({
        ...prev,
        ecoles: {
          ...prev.ecoles,
          [selectedSchoolId]: {
            ...prev.ecoles[selectedSchoolId],
            annees: {
              ...prev.ecoles[selectedSchoolId].annees,
              [year]: prev.ecoles[selectedSchoolId].annees[year] ?? { effectifs: [], agents: [] },
            }
          }
        }
      }));
      setSelectedYear(year);
    }
  }, [selectedSchoolId, data.ecoles]);

  const setSelectedSchool = useCallback((schoolId: string | null) => {
    setSelectedSchoolId(schoolId);
  }, []);

  const addSchool = useCallback((schoolData: SchoolData) => {
    const schoolId = schoolData.etablissement.id;
    setData(prev => ({
      ...prev,
      ecoles: {
        ...prev.ecoles,
        [schoolId]: schoolData
      }
    }));
    // Automatically select the newly added school
    setSelectedSchoolId(schoolId);
  }, []);

  const deleteSchool = useCallback((schoolId: string) => {
    setData(prev => {
      const newEcoles = { ...prev.ecoles };
      delete newEcoles[schoolId];
      return { ...prev, ecoles: newEcoles };
    });
  }, []);

  const updateInspection = useCallback((inspection: any) => {
    setData(prev => ({ ...prev, inspection }));
  }, []);

  const updateEtablissement = useCallback((etab: Etablissement) => {
    if (selectedSchoolId) {
      setData(prev => ({
        ...prev,
        ecoles: {
          ...prev.ecoles,
          [selectedSchoolId]: {
            ...prev.ecoles[selectedSchoolId],
            etablissement: etab
          }
        }
      }));
    }
  }, [selectedSchoolId]);

  const setAgents = useCallback((agents: Agent[]) => {
    if (selectedSchoolId && data.ecoles[selectedSchoolId]) {
      setData(prev => ({
        ...prev,
        ecoles: {
          ...prev.ecoles,
          [selectedSchoolId]: {
            ...prev.ecoles[selectedSchoolId],
            annees: { 
              ...prev.ecoles[selectedSchoolId].annees, 
              [selectedYear]: { 
                ...prev.ecoles[selectedSchoolId].annees[selectedYear], 
                agents 
              } 
            }
          }
        }
      }));
    }
  }, [selectedSchoolId, selectedYear, data.ecoles]);

  const setEffectifs = useCallback((effectifs: EffectifClasse[]) => {
    if (selectedSchoolId && data.ecoles[selectedSchoolId]) {
      setData(prev => ({
        ...prev,
        ecoles: {
          ...prev.ecoles,
          [selectedSchoolId]: {
            ...prev.ecoles[selectedSchoolId],
            annees: { 
              ...prev.ecoles[selectedSchoolId].annees, 
              [selectedYear]: { 
                ...prev.ecoles[selectedSchoolId].annees[selectedYear], 
                effectifs 
              } 
            }
          }
        }
      }));
    }
  }, [selectedSchoolId, selectedYear, data.ecoles]);

  const updateEffectif = useCallback((classeId: string, garcons: number, filles: number) => {
    if (selectedSchoolId && data.ecoles[selectedSchoolId]) {
      setData(prev => {
        const annee = prev.ecoles[selectedSchoolId].annees[selectedYear] ?? emptyAnnee;
        const existing = annee.effectifs.findIndex(e => e.classeId === classeId);
        const newEffectifs = [...annee.effectifs];
        if (existing >= 0) {
          newEffectifs[existing] = { classeId, garcons, filles };
        } else {
          newEffectifs.push({ classeId, garcons, filles });
        }
        return {
          ...prev,
          ecoles: {
            ...prev.ecoles,
            [selectedSchoolId]: {
              ...prev.ecoles[selectedSchoolId],
              annees: { 
                ...prev.ecoles[selectedSchoolId].annees, 
                [selectedYear]: { ...annee, effectifs: newEffectifs } 
              }
            }
          }
        };
      });
    }
  }, [selectedSchoolId, selectedYear, data.ecoles]);

  const exportYearJSON = useCallback(() => {
    if (selectedSchoolId && data.ecoles[selectedSchoolId]) {
      const exportObj = {
        etablissement: data.ecoles[selectedSchoolId].etablissement,
        annee: selectedYear,
        data: data.ecoles[selectedSchoolId].annees[selectedYear] || emptyAnnee,
      };
      return JSON.stringify(exportObj, null, 2);
    } else {
      // If no school is selected, return empty data
      const exportObj = {
        etablissement: { id: "", nom: "No School Selected", chef: "", region: "", ville: "", prefecture: "", telephone: "" },
        annee: selectedYear,
        data: emptyAnnee,
      };
      return JSON.stringify(exportObj, null, 2);
    }
  }, [selectedSchoolId, data.ecoles, selectedYear]);

  const importYearJSON = useCallback((json: string, year: string, schoolId?: string) => {
    const parsed = JSON.parse(json);
    const anneeData: AnneeData = parsed.data ?? { effectifs: parsed.effectifs ?? [], agents: parsed.agents ?? [] };
    
    // If schoolId is provided, add to that specific school; otherwise, create a new school
    const targetSchoolId = schoolId || parsed.etablissement?.id || `school_${Date.now()}`;
    
    if (parsed.etablissement) {
      setData(prev => ({
        ...prev,
        ecoles: {
          ...prev.ecoles,
          [targetSchoolId]: {
            etablissement: { ...parsed.etablissement, id: targetSchoolId },
            annees: { 
              ...prev.ecoles[targetSchoolId]?.annees || {}, 
              [year]: anneeData 
            }
          }
        }
      }));
    } else {
      // If no etablissement is provided, we still need to add the data to a school
      // This case might occur when importing just data without school info
      if (targetSchoolId && data.ecoles[targetSchoolId]) {
        setData(prev => ({
          ...prev,
          ecoles: {
            ...prev.ecoles,
            [targetSchoolId]: {
              ...prev.ecoles[targetSchoolId],
              annees: { 
                ...prev.ecoles[targetSchoolId].annees, 
                [year]: anneeData 
              }
            }
          }
        }));
      }
    }
    setSelectedYear(year);
    setSelectedSchoolId(targetSchoolId);
  }, []);

  const getExportData = useCallback(() => {
    if (selectedSchoolId && data.ecoles[selectedSchoolId]) {
      return {
        etablissement: data.ecoles[selectedSchoolId].etablissement,
        annee: selectedYear,
        data: data.ecoles[selectedSchoolId].annees[selectedYear] || emptyAnnee,
      };
    } else {
      return {
        etablissement: { id: "", nom: "No School Selected", chef: "", region: "", ville: "", prefecture: "", telephone: "" },
        annee: selectedYear,
        data: emptyAnnee,
      };
    }
  }, [selectedSchoolId, data.ecoles, selectedYear]);

  const getAggregatedData = useCallback(() => {
    // Aggregate data from all schools for the selected year
    const allEffectifs: EffectifClasse[] = [];
    const allAgents: Agent[] = [];
    
    Object.values(data.ecoles || {}).forEach(school => {
      const yearData = school.annees?.[selectedYear];
      if (yearData) {
        allEffectifs.push(...yearData.effectifs);
        allAgents.push(...yearData.agents);
      }
    });
    
    return {
      etablissement: {
        denomination: "Données Agrégées de Toutes les Écoles",
        chef: data.inspection?.chef || "",
        region: data.inspection?.region || "",
        ville: data.inspection?.ville || "",
        prefecture: data.inspection?.prefecture || "",
        telephone: data.inspection?.telephone || ""
      },
      annee: selectedYear,
      data: {
        effectifs: allEffectifs,
        agents: allAgents
      }
    };
  }, [data.ecoles, selectedYear, data.inspection]);

  // Inspection Agents CRUD Functions
  const addInspectionAgent = useCallback((agent: any) => {
    setData(prev => ({
      ...prev,
      inspectionAgents: [...prev.inspectionAgents, agent]
    }));
  }, []);

  const updateInspectionAgent = useCallback((id: string, agent: any) => {
    setData(prev => ({
      ...prev,
      inspectionAgents: prev.inspectionAgents.map(a => 
        a.id === id ? { ...a, ...agent } : a
      )
    }));
  }, []);

  const deleteInspectionAgent = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      inspectionAgents: prev.inspectionAgents.filter(a => a.id !== id)
    }));
  }, []);

  const getInspectionAgents = useCallback(() => {
    return data.inspectionAgents || [];
  }, [data.inspectionAgents]);

  return {
    data, selectedYear, selectedSchoolId, availableYears, availableSchools, currentAnnee, currentSchool,
    setSelectedYear, setSelectedSchool, addYear, addSchool,
    updateInspection, updateEtablissement, setAgents, setEffectifs, updateEffectif,
    exportYearJSON, importYearJSON, getExportData, getAggregatedData,
    addInspectionAgent, updateInspectionAgent, deleteInspectionAgent, getInspectionAgents,
    deleteSchool,
  };
}

const AppStoreContext = createContext<AppStore | null>(null);

export const AppStoreProvider = AppStoreContext.Provider;

export function useAppStore(): AppStore {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
