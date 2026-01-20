import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { CalendarModule } from "@/types/calendar.types";

export type ModuleType = CalendarModule | "config";

interface ActiveModuleContextType {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  goToToday: () => void;
}

const getTodayDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const ActiveModuleContext = createContext<ActiveModuleContextType>({
  activeModule: "tasks",
  setActiveModule: () => {},
  selectedDate: getTodayDate(),
  setSelectedDate: () => {},
  goToToday: () => {}
});

interface ActiveModuleProviderProps {
  children: ReactNode;
}

export function ActiveModuleProvider({ children }: ActiveModuleProviderProps) {
  const [activeModule, setActiveModule] = useState<ModuleType>("tasks");
  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  const goToToday = useCallback(() => {
    setSelectedDate(getTodayDate());
  }, []);

  return (
    <ActiveModuleContext.Provider
      value={{
        activeModule,
        setActiveModule,
        selectedDate,
        setSelectedDate,
        goToToday
      }}
    >
      {children}
    </ActiveModuleContext.Provider>
  );
}

export function useActiveModule() {
  const context = useContext(ActiveModuleContext);
  if (!context) {
    throw new Error("useActiveModule must be used within ActiveModuleProvider");
  }
  return context;
}
