
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-secondary-soft">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`${isSidebarOpen ? "lg:ml-64" : "lg:ml-20"} transition-[margin] duration-300`}>
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
