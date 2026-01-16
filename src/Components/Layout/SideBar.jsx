import { NavLink, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { cn } from "../../lib/utils";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "All Projects", href: "/admin/projects", icon: FolderKanban },
  { name: "New Project", href: "/admin/projects/new", icon: PlusCircle },
];

const allServiceLinks = [
  {
    name: "Content Writing",
    href: "/admin/projects?service=CW",
    icon: FileText,
    code: "CW",
  },
  { 
    name: "Graphic Design", 
    href: "/admin/projects?service=GD", 
    icon: Palette,
    code: "GD",
  },
  { 
    name: "Website Design", 
    href: "/admin/projects?service=WD", 
    icon: Globe,
    code: "WD",
  },
  { 
    name: "ERP Development", 
    href: "/admin/projects?service=ERP", 
    icon: Code,
    code: "ERP",
  },
];

const bottomNavigation = [
  { name: "Team", href: "/admin/team", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

// Department access rules
const departmentAccess = {
  "Content Writing": ["CW", "GD"], 
  "Graphic Design": ["GD", "WD", "ERP"], 
  "Front-End Developer": ["WD", "GD", "ERP"], 
  "ERP": ["ERP", "GD", "WD"], 
};

export function SideBar() {
  const location = useLocation();
  const [userDepartment, setUserDepartment] = useState(null);
  const [filteredServices, setFilteredServices] = useState(allServiceLinks);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get user document from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const department = userData.department;
            setUserDepartment(department);
            const allowedServices = departmentAccess[department] || [];
            const filtered = allServiceLinks.filter((service) =>
              allowedServices.includes(service.code)
            );
            setFilteredServices(filtered);
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
    const [hrefPath, hrefQuery] = href.split("?");
    const currentPath = location.pathname;
    const currentQuery = location.search.substring(1); 

    if (hrefPath === "/admin") {
      return (
        (currentPath === "/admin" || currentPath === "/admin/") &&
        !currentQuery
      );
    }
    if (hrefQuery) {
      return currentPath === hrefPath && currentQuery === hrefQuery;
    }
    if (hrefPath === "/admin/projects" && !hrefQuery) {
      return currentPath === "/admin/projects" && !currentQuery;
    }
    return currentPath.startsWith(hrefPath);
  };

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <FolderKanban className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">
          Vernoxy Media
        </span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3">
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Service Quick Links - FILTERED BY DEPARTMENT */}
          {filteredServices.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                By Service
              </h3>
              <div className="space-y-1">
                {filteredServices.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive(item.href)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
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
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-sidebar-border p-3">
        <div className="space-y-1">
          {bottomNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  );
}