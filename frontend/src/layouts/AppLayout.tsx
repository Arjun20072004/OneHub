import { Outlet } from "react-router-dom";

import Header from "../components/layout/Header";
import Sidebar from "../components/navigation/Sidebar";
import MobileNavigation from "../components/navigation/MobileNavigation";
import AssistantWidget from "../components/assistant/AssistantWidget";
import "../components/navigation/Navigation.css";

export default function AppLayout() {
  return (
    <div className="min-h-screen">
      <Header />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>

      <MobileNavigation />
      <AssistantWidget />
    </div>
  );
}