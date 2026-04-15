import React, { useState } from 'react';
import { Menu, X, Users, Camera, FileSpreadsheet, Zap } from 'lucide-react';

const Navbar = ({ currentStep, setCurrentStep, attendanceData }) => {
  const [isOpen, setIsOpen] = useState(false);

  const NavItem = ({ icon: Icon, label, step, disabled = false }) => {
    const isActive = currentStep === step;
    return (
      <button
        onClick={() => {
          if (!disabled) {
            setCurrentStep(step);
            setIsOpen(false);
          }
        }}
        disabled={disabled}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.4rem 0.85rem',
          borderRadius: '0.55rem',
          fontSize: '0.82rem',
          fontWeight: isActive ? 600 : 500,
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.4 : 1,
          transition: 'all 0.2s ease',
          background: isActive
            ? 'rgba(59,130,246,0.18)'
            : 'transparent',
          color: isActive ? '#93c5fd' : 'rgba(148,163,184,0.9)',
          boxShadow: isActive ? '0 0 0 1px rgba(59,130,246,0.3)' : 'none',
        }}
        onMouseEnter={e => {
          if (!disabled && !isActive) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.color = '#e2e8f0';
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'rgba(148,163,184,0.9)';
          }
        }}
      >
        <Icon size={14} />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(8,13,26,0.75)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      boxShadow: '0 1px 0 rgba(255,255,255,0.03)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: '3.75rem' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginRight: '1.5rem' }}>
          <div style={{
            width: '2.2rem',
            height: '2.2rem',
            borderRadius: '0.65rem',
            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
            flexShrink: 0,
          }}>
            <Zap size={14} color="white" fill="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f1f5f9', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
            <span style={{
              background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}>AI</span>
            {' '}Attendance
          </span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="hidden md:flex">
          <NavItem icon={Camera} label="Upload" step="upload" />
          <NavItem
            icon={FileSpreadsheet}
            label="Results"
            step="results"
            disabled={!attendanceData || attendanceData.length === 0}
          />
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2rem',
            height: '2rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            color: '#94a3b8',
            cursor: 'pointer',
          }}
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div
          className="md:hidden animate-fade-in-down"
          style={{
            padding: '0.75rem 1.25rem',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          <NavItem icon={Camera} label="Upload Photos" step="upload" />
          <NavItem
            icon={FileSpreadsheet}
            label="Results"
            step="results"
            disabled={!attendanceData || attendanceData.length === 0}
          />
        </div>
      )}
    </header>
  );
};

export default Navbar;
