import { NavLink, useLocation } from "react-router-dom";
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

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "All Projects", href: "/admin/projects", icon: FolderKanban },
  { name: "New Project", href: "/admin/projects/new", icon: PlusCircle },
];

const serviceLinks = [
  {
    name: "Content Writing",
    href: "/admin/projects?service=CW",
    icon: FileText,
  },
  { name: "Graphic Design", href: "/admin/projects?service=GD", icon: Palette },
  { name: "Website Design", href: "/admin/projects?service=WD", icon: Globe },
  { name: "ERP Development", href: "/admin/projects?service=ERP", icon: Code },
];

const bottomNavigation = [
  { name: "Team", href: "/admin/team", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function SideBar() {
  const location = useLocation();

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
      {/* Logo */}
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

          {/* Service Quick Links */}
          <div className="mt-8">
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              By Service
            </h3>
            <div className="space-y-1">
              {serviceLinks.map((item) => (
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