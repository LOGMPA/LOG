import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  CheckCircle,
  Presentation,
  Tractor,
  Wallet,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";

const navigationItems = [
  { title: "Painel Logística 2026", to: "/painel", icon: LayoutDashboard },
  { title: "Calendário", to: "/calendario", icon: Calendar },
  { title: "Solicitações de Transporte", to: "/solicitacoes", icon: FileText },
  { title: "Transportes Concluídos", to: "/concluidos", icon: CheckCircle },
  { title: "Demonstrações", to: "/demos", icon: Presentation },
  { title: "Painel de Custos", to: "/custos", icon: Wallet },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#FAFAF9]">
        <Sidebar className="border-r border-gray-200">
          <SidebarHeader className="border-b border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: "#275317" }}
              >
                <Tractor className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Logística</h2>
                <p className="text-xs text-gray-500">Sistema 2026</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-2 mb-1">
                Navegação
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const active = location.pathname.startsWith(item.to);

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link
                            to={item.to}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1
                              ${
                                active
                                  ? "bg-[#367C2B] text-white font-semibold"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                          >
                            <item.icon
                              className={`w-4 h-4 ${
                                active ? "text-white" : "text-gray-500"
                              }`}
                            />
                            <span className="text-sm">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 px-6 py-4 md:hidden sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors" />
              <h1 className="text-lg font-semibold text-gray-900">
                Logística 2026
              </h1>
            </div>
          </header>
          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
