import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { menuItems, MenuItem } from '../../config/menuConfig';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const isMenuActive = (item: MenuItem): boolean => {
    if (location.pathname === item.path) return true;
    return item.subItems?.some(sub => location.pathname === sub.path) ?? false;
  };

  const isSubMenuActive = (path: string): boolean =>
    location.pathname === path;

  const toggleMenu = (path: string) => {
    setExpandedMenus(prev =>
      prev.includes(path)
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) onClose();
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-10 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={` 
          fixed lg:sticky top-16 left-0 
          h-[calc(100vh-4rem)] w-72 
          bg-vert border-r  shadow-sm
          
          transform transition-transform duration-300 ease-in-out 
          z-20
          
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <nav className="p-3 space-y-1  overflow-x-auto h-full  ">
          {menuItems.map(item => {
            const Icon = item.icon;
            const hasSubItems = !!item.subItems?.length;
            const isExpanded = expandedMenus.includes(item.path);
            const isActive = isMenuActive(item);

            return (
              <div key={item.path}>
                {hasSubItems ? (
                  <button
                    onClick={() => toggleMenu(item.path)}
                    className={`w-full flex items-center justify-between mt-2   text-white px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-darkVert text-white font-medium'
                        : 'text-white hover:bg-darkVert '
                    }`}
                  >
                    <div className="flex items-center gap-2   ">
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                       ? 'bg-darkVert text-white '
                        : 'text-white hover:bg-darkVert font-medium' 
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                )}

                {hasSubItems && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                    {item.subItems!.map(sub => {
                      const SubIcon = sub.icon;

                      return (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          onClick={handleLinkClick}
                          className={`flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-all ${
                            isSubMenuActive(sub.path)
                              ? 'bg-darkVert text-white font-medium'
                              : 'text-white hover:bg-darkVert  hover:text-white'
                          }`}
                        >
                          {SubIcon && <SubIcon size={16} />}
                          <span>{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
