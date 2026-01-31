import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  Users,
  Settings,
  FileText,
  Palette,
  Globe,
  Code,
  ClipboardList,
  LogOut,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { logUserLogout } from "../../services/loginLogService";
import { useTimer } from "../../context/TimerContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "All Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "New Project", href: "/dashboard/projects/new", icon: PlusCircle },
];

const allServiceLinks = [
  {
    name: "Content Writing",
    href: "/dashboard/projects?service=CW",
    icon: FileText,
    code: "CW",
  },
  {
    name: "Graphic Design",
    href: "/dashboard/projects?service=GD",
    icon: Palette,
    code: "GD",
  },
  {
    name: "Website Design",
    href: "/dashboard/projects?service=WD",
    icon: Globe,
    code: "WD",
  },
  {
    name: "ERP Development",
    href: "/dashboard/projects?service=ERP",
    icon: Code,
    code: "ERP",
  },
];

const bottomNavigation = [
  { name: "Team", href: "/dashboard/team", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

// Admin-only navigation items
const adminOnlyNavigation = [
  {
    name: "User Login Logs",
    href: "/dashboard/login-logs",
    icon: ClipboardList,
  },
];

const departmentAccess = {
  Admin: ["CW", "GD", "WD", "ERP"],
  "Content Writer": ["CW", "GD", "WD", "ERP"],
  "Graphic Design": ["GD", "WD", "ERP"],
  "Front End Developer": ["WD", "GD", "ERP"],
  ERP: ["ERP", "WD", "GD"],
};

export function SideBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userDepartment, setUserDepartment] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [filteredServices, setFilteredServices] = useState(allServiceLinks);
  const [userEmail, setUserEmail] = useState(null);
  const userInitial = userRole?.charAt(0).toUpperCase();

  // Get timer context
  const { activeTimer, isRunning, pauseTimer } = useTimer();

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const department = userData.department;
            const role = userData.role;
            setUserDepartment(department);
            setUserRole(role);
            const email = user.email;
            setUserEmail(email);

            if (role === "admin") {
              setFilteredServices(allServiceLinks);
            } else {
              const allowedServices = departmentAccess[department] || [];
              const filtered = allServiceLinks.filter((service) =>
                allowedServices.includes(service.code),
              );
              setFilteredServices(filtered);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setFilteredServices(allServiceLinks);
        }
      } else {
        setFilteredServices(allServiceLinks);
      }
    });
    return () => unsubscribe();
  }, []);

  const isActive = (href) => {
    const currentPath = location.pathname;
    const currentSearch = location.search;
    const [hrefPath, hrefQuery] = href.split("?");
    if (hrefPath === "/dashboard") {
      return (
        (currentPath === "/dashboard" || currentPath === "/dashboard/") &&
        !currentSearch
      );
    }
    if (hrefPath === "/dashboard/projects/new") {
      return currentPath === "/dashboard/projects/new";
    }
    if (hrefQuery && hrefPath === "/dashboard/projects") {
      return (
        currentPath === "/dashboard/projects" &&
        currentSearch === `?${hrefQuery}`
      );
    }
    if (hrefPath === "/dashboard/projects" && !hrefQuery) {
      return currentPath === "/dashboard/projects" && !currentSearch;
    }
    return currentPath.startsWith(hrefPath);
  };

  const handleAllProjectsClick = (e) => {
    e.preventDefault();
    navigate("/dashboard/projects");
  };

  const handleServiceClick = (e, href) => {
    e.preventDefault();
    navigate(href);
  };

  const handleNavClick = (e, href) => {
    e.preventDefault();
    navigate(href);
  };

  // Logout function matching Header component exactly
  const handleLogout = async () => {
    try {
      const auth = getAuth();

      // ✅ Pause timer BEFORE logout if it's running
      if (activeTimer && isRunning) {
        await pauseTimer("User logged out");
        // Small delay to ensure Firebase update completes
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      // ✅ LOG THE LOGOUT TO loginLogs COLLECTION
      try {
        await logUserLogout();
        console.log("Logout logged successfully");
      } catch (logError) {
        console.error("Failed to log logout:", logError);
        // Don't block logout if logging fails
      }

      // Then proceed with logout
      await auth.signOut();
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userDisplayRole");
      localStorage.removeItem("userDepartment");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      navigate("/login", { replace: true });
    }
  };

  return (
    <aside className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center text-start gap-3 px-6 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <FolderKanban className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <span className="text-lg font-semibold text-white">
            Vernoxy Media
          </span>
          <p className="text-xs text-gray-400">
            <span className="font-bold capitalize text-white">
              {" "}
              {userRole?.toLowerCase() === "admin" ? "Admin Panel" : userRole}
            </span>
            {userDepartment && ` | ${userDepartment}`}
          </p>
        </div>
      </div>

      {/* Page Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              // Special handling for "All Projects" to clear filters
              if (item.name === "All Projects") {
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={handleAllProjectsClick}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                      isActive(item.href)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </a>
                );
              }

              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                    isActive(item.href)
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </a>
              );
            })}
          </div>

          {/* Service Quick Links - FILTERED BY DEPARTMENT */}
          {filteredServices.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-sidebar-primary">
                By Service
              </h3>
              <div className="space-y-1">
                {filteredServices.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleServiceClick(e, item.href)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
                      isActive(item.href)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Admin-Only Section */}
          {userRole === "admin" && (
            <div className="mt-4">
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                LOGS
              </h3>
              <div className="space-y-1">
                {adminOnlyNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </div>

        <hr className="mx-6 m-3 border-sidebar-border" />

        {/* Bottom Navigation */}
        <div className="p-3 pt-0">
          <div className="space-y-1">
            {bottomNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div
        className="flex text-start items-center gap-3 p-3 transition-colors mx-2m mb-2 border-t border-sidebar-border
      "
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-white font-semibold text-sm">
          {userInitial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate capitalize">
            {userRole}
          </p>
          <p className="text-xs text-gray-400 truncate">{userEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-[#4ED5E2]/30 text-gray-300 hover:text-white transition-colors"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
