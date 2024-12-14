import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { IconBell, IconSearch, IconUser, IconRobot } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

interface HeaderProps {
  onToggleAI: () => void;
  showAI: boolean;
}

const Header = ({ onToggleAI, showAI }: HeaderProps) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-[#1d1d1f]/80">
      <div className="flex h-14 items-center justify-between px-8 border-b border-gray-200/50 dark:border-gray-800/50">
        {/* Titre de la page */}
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-medium text-gray-900 dark:text-white">
            Dashboard
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Recherche */}
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="h-8 w-64 rounded-lg bg-gray-100 dark:bg-[#161617] pl-9 pr-4 text-sm 
                       text-gray-900 dark:text-gray-100 placeholder-gray-500 
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       transition-all duration-200"
            />
          </div>

          {/* Bouton IA */}
          <button
            onClick={onToggleAI}
            className={`relative rounded-full p-2 transition-colors
                      ${
                        showAI
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                          : "hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-[#161617]"
                      }`}
          >
            <IconRobot className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <button className="relative rounded-full p-2 hover:bg-gray-100 dark:hover:bg-[#161617] transition-colors">
            <IconBell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-500"></span>
          </button>

          {/* Menu utilisateur */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" 
                      className="relative h-8 w-8 rounded-full bg-gray-100 dark:bg-[#161617] 
                                hover:bg-gray-200 dark:hover:bg-[#202022] p-0.5">
                <IconUser className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" 
                               className="w-56 bg-white/80 dark:bg-[#161617]/80 backdrop-blur-xl 
                                        border-gray-200/50 dark:border-gray-800/50">
              <DropdownMenuLabel className="text-gray-700 dark:text-gray-300">
                Mon compte
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-800/50" />
              <DropdownMenuItem onClick={() => navigate("/profile")}
                              className="text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-[#202022]">
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}
                              className="text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-[#202022]">
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-800/50" />
              <DropdownMenuItem onClick={handleLogout}
                              className="text-red-600 dark:text-red-400 focus:bg-gray-100 dark:focus:bg-[#202022]">
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
