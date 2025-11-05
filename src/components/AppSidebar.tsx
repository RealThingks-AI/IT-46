import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Headphones,
  Package,
  Settings,
  Wifi,
  FileText,
  BarChart3,
  Bell,
  Shield,
  ChevronLeft,
  User,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { NotificationPanel } from "@/components/NotificationPanel";
import { ThemeToggle } from "@/components/ThemeToggle";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Support Center", url: "/support", icon: Headphones },
  { title: "Inventory & Procurement", url: "/inventory", icon: Package },
  { title: "System & Updates", url: "/system-updates", icon: Settings },
  { title: "Network & Connectivity", url: "/network", icon: Wifi },
  { title: "Access Control", url: "/access", icon: Shield },
  { title: "Audit", url: "/audit", icon: FileText },
  { title: "Reports & Analytics", url: "/reports", icon: BarChart3 },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Admin Console", url: "/admin", icon: Settings },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
            RT
          </div>
          <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
            RealThingx
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <div className="space-y-1 px-2 pb-2">
          <NotificationPanel />
          <ThemeToggle />
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggleSidebar} tooltip="Collapse">
              <ChevronLeft className="group-data-[collapsible=icon]:rotate-180 transition-transform" />
              <span>Collapse</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Admin">
              <Link to="/profile">
                <User />
                <span>Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Logout">
              <Link to="/logout">
                <LogOut />
                <span>Logout</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
