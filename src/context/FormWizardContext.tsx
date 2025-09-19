'use client';

import { useRef, useMemo, useEffect, useReducer, useContext, createContext, type ReactNode } from "react";

import { type CampaignData, initialCleanCampaignData } from "../types/campaignTypes";

// Types
interface FormWizardContextType {
  state: CampaignData;
  dispatch: React.Dispatch<FormWizardAction>;
  updateCampaignData: (data: Partial<CampaignData>) => void;
  resetCampaignData: () => void;
}

type FormWizardAction =
  | { type: "UPDATE"; payload: Partial<CampaignData> }
  | { type: "RESET" };

function reducer(state: CampaignData, action: FormWizardAction): CampaignData {
  switch (action.type) {
    case "UPDATE":
      return { ...state, ...action.payload };
    case "RESET":
      return initialCleanCampaignData;
    default:
      return state;
  }
}

const FormWizardContext = createContext<FormWizardContextType | undefined>(undefined);

export function FormWizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialCleanCampaignData);
  const isInitialMount = useRef(true);
  const updateCampaignData = (data: Partial<CampaignData>) => {
    console.log('Salvando no contexto (FormWizard):', data);
    dispatch({ type: "UPDATE", payload: data });
  };
  const resetCampaignData = () => {
    dispatch({ type: "RESET" });
  };
  const contextValue = useMemo(
    () => ({ state, dispatch, updateCampaignData, resetCampaignData }),
    [state, dispatch]
  );

  
  useEffect(() => {
    if (isInitialMount.current) {
      const stored = sessionStorage.getItem("formWizardData");
      if (stored) {
        try {
          dispatch({ type: "UPDATE", payload: JSON.parse(stored) });
        } catch {
          dispatch({ type: "RESET" });
        }
      }
      isInitialMount.current = false;
    }
  }, []);

  useEffect(() => {
    if (!isInitialMount.current) {
      sessionStorage.setItem("formWizardData", JSON.stringify(state));
    }
  }, [state]);

  return (
    <FormWizardContext.Provider value={contextValue}>
      {children}
    </FormWizardContext.Provider>
  );
}

export function useFormWizard() {
  const context = useContext(FormWizardContext);
  if (!context) throw new Error("useFormWizard must be used within FormWizardProvider");
  return context;
}

export default FormWizardProvider;
