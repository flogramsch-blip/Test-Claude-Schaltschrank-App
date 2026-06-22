import { NavLink } from "react-router-dom";
import { CalendarRange, Home, PieChart, Settings } from "lucide-react";
import clsx from "clsx";

const TABS = [
  { to: "/", label: "Übersicht", icon: Home },
  { to: "/planung", label: "Planung", icon: CalendarRange },
  { to: "/statistik", label: "Statistik", icon: PieChart },
  { to: "/einstellungen", label: "Einstellungen", icon: Settings },
];

export function TabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-separator bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl dark:border-separator-dark dark:bg-surface-dark/90">
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              clsx(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
                isActive ? "text-ios-blue" : "text-label-tertiary dark:text-label-tertiary-dark",
              )
            }
          >
            <Icon size={24} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
