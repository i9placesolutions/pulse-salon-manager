
import { useState } from "react";
import { Navbar } from "./Navbar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-secondary-soft">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Navbar />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
