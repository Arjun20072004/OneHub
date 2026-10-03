import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Sidebar from "../components/navigation/Sidebar";
import MobileNavigation from "../components/navigation/MobileNavigation";
import AssistantWidget from "../components/assistant/AssistantWidget";
import "../components/navigation/Navigation.css";

export default function CustomerLayout() {
  return <div className="role-layout role-layout--customer"><Header /><div className="role-layout__body"><Sidebar /><main className="role-layout__content"><Outlet /></main></div><MobileNavigation /><AssistantWidget /></div>;
}
