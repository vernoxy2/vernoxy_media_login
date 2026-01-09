import React from "react";
import { SideBar } from "./SideBar";
import Header from "./Header";
import { Outlet, useLocation } from "react-router-dom";


const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();

  const toggleMobileSidebar = () => setMobileOpen(!mobileOpen);

  // Paths where header should be hidden
  const hideHeaderPaths = [
    "/admin/welcome",
    "/admin/admin-page",
    "/admin/user-page",
    "/admin/dashboard"
  ];

  const shouldHideHeader = hideHeaderPaths.includes(location.pathname);

  return (
    <div className="h-screen w-screen flex flex-col overflow-x-hidden bg-white text-black">
      {/* Conditionally render Header */}
      {!shouldHideHeader && <Header toggleMobileSidebar={toggleMobileSidebar} />}

      <div className="flex flex-1 w-full">
        {/* Sidebar */}
        <SideBar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        {/* Main Content */}
        <main className="flex flex-col px-6 py-6 md:pt-10 w-full container">
          {/* Page Content - takes up all available space */}
          <div className="flex-1">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;