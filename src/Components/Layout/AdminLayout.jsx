// import React from "react";
import React from "react";
import Header from "./Header";
import { SideBar } from "./SideBar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const toggleMobileSidebar = () => setMobileOpen(!mobileOpen);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Conditionally render Header */}

      <div className="flex flex-1 w-full">
        {/* Sidebar */}
        <SideBar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        {/* Main Content */}
        <main className="flex-1 flex-col px-0 py-0 md:pt-0 w-full overflow-y-auto ">
          {<Header toggleMobileSidebar={toggleMobileSidebar} />}
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
// import React from 'react';

// const AdminLayout = () => {
//   return (
//     <div className="flex h-screen overflow-hidden">
//       <SideBar />
//       <main className="flex-1 overflow-y-auto bg-background">
//         <Outlet />
//       </main>
//     </div>
//   );
// }

// export default AdminLayout;
