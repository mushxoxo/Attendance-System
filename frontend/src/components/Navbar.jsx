import React, { useState } from 'react';
import { Menu, X, Users, Camera, FileSpreadsheet } from 'lucide-react';

const Navbar = ({ currentStep, setCurrentStep, attendanceData }) => {
  const [isOpen, setIsOpen] = useState(false);

  const NavItem = ({ icon: Icon, label, step, disabled = false }) => {
    let className = "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ";
    
    if (currentStep === step) {
      className += "bg-blue-100 text-blue-700 ";
    } else {
      className += "text-gray-600 hover:text-blue-600 hover:bg-blue-50 ";
    }
    
    if (disabled) {
      className += "opacity-50 cursor-not-allowed";
    }
    
    return (
      <button
        onClick={() => {
          if (!disabled) {
            setCurrentStep(step);
            setIsOpen(false);
          }
        }}
        disabled={disabled}
        className={className}
      >
        <Icon size={16} />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 p-1">
              <Users className="h-6 w-6 text-white" />
            </div>
            <span className="hidden font-bold sm:inline-block text-xl">
              <span className="gradient-text">AI</span> Attendance System
            </span>
            <span className="sm:hidden font-bold text-lg">
              <span className="gradient-text">AI</span> Attendance
            </span>
          </div>
        </div>
        
        <div className="flex-1" />
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavItem 
            icon={Camera} 
            label="Upload Photos" 
            step="upload" 
          />
          <NavItem 
            icon={FileSpreadsheet} 
            label="Results" 
            step="results" 
            disabled={!attendanceData || attendanceData.length === 0} 
          />
        </nav>
        
        {/* Mobile menu button */}
        <button
          className="inline-flex md:hidden items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="sr-only">Open main menu</span>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      
      {/* Mobile navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 py-2 px-4 animate-fade-in-down">
          <div className="flex flex-col space-y-1">
            <NavItem 
              icon={Camera} 
              label="Upload Photos" 
              step="upload" 
            />
            <NavItem 
              icon={FileSpreadsheet} 
              label="Results" 
              step="results" 
              disabled={!attendanceData || attendanceData.length === 0} 
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
