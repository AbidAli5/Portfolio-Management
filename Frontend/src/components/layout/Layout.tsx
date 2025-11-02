import {useState} from "react";
import type {ReactNode} from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
// import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({children}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64 p-6 bg-gray-50">{children}</main>
      </div>
      {/* <Footer /> */}
    </div>
  );
}
