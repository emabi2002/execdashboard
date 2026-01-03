"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { ExecutiveDashboard } from "@/components/dashboards/executive-dashboard";
import { DivisionDashboard } from "@/components/dashboards/division-dashboard";
import { getExecAlerts } from "@/lib/ilms-service";

export default function Home() {
  const [activeLayer, setActiveLayer] = useState("executive");
  const [activeSection, setActiveSection] = useState("overview");
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    // Fetch alert count on mount
    const fetchAlerts = async () => {
      try {
        const alerts = await getExecAlerts(true);
        setAlertCount(alerts.length);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }
    };
    fetchAlerts();

    // Refresh alerts every 2 minutes
    const interval = setInterval(fetchAlerts, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (layer: string, section?: string) => {
    setActiveLayer(layer);
    if (section) {
      setActiveSection(section);
    } else {
      setActiveSection("overview");
    }
  };

  const renderDashboard = () => {
    switch (activeLayer) {
      case "executive":
        return <ExecutiveDashboard section={activeSection} />;
      case "survey":
        return <DivisionDashboard divisionCode="survey" section={activeSection} />;
      case "planning":
        return <DivisionDashboard divisionCode="planning" section={activeSection} />;
      case "ilg":
        return <DivisionDashboard divisionCode="ilg" section={activeSection} />;
      case "state":
        return <DivisionDashboard divisionCode="state" section={activeSection} />;
      case "titles":
        return <DivisionDashboard divisionCode="titles" section={activeSection} />;
      case "customer":
        return <DivisionDashboard divisionCode="customer" section={activeSection} />;
      case "legal":
        return <DivisionDashboard divisionCode="legal" section={activeSection} />;
      case "audit":
        return <DivisionDashboard divisionCode="audit" section={activeSection} />;
      case "corporate":
        return <DivisionDashboard divisionCode="corporate" section={activeSection} />;
      case "ict":
        return <DivisionDashboard divisionCode="ict" section={activeSection} />;
      default:
        return <ExecutiveDashboard section={activeSection} />;
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950">
      <Sidebar
        activeLayer={activeLayer}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        alertCount={alertCount}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-[1600px] mx-auto">
          {renderDashboard()}
        </div>
      </main>
    </div>
  );
}
