import React from 'react';
import { Card, CardContent } from './ui/card';
import { Brain } from 'lucide-react';

const steps = [
  { label: 'Detecting faces', detail: 'Locating all faces in the class photo' },
  { label: 'Matching identities', detail: 'Comparing against reference photos' },
  { label: 'Generating report', detail: 'Building the attendance record' },
];

const ProcessingCard = () => {
  const [progress, setProgress] = React.useState(0);
  const [activeStep, setActiveStep] = React.useState(0);

  React.useEffect(() => {
    const t1 = setTimeout(() => { setProgress(38); setActiveStep(0); }, 300);
    const t2 = setTimeout(() => { setProgress(68); setActiveStep(1); }, 1400);
    const t3 = setTimeout(() => { setProgress(95); setActiveStep(2); }, 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <Card style={{ width: '100%', maxWidth: '26rem', margin: '0 auto' }}>
      <CardContent style={{ paddingTop: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.75rem' }}>

          {/* Spinning rings */}
          <div style={{ position: 'relative', width: '6rem', height: '6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Outer glow */}
            <div style={{
              position: 'absolute',
              inset: '-0.5rem',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            {/* Outer ring */}
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.04)',
              borderTop: '3px solid #3b82f6',
              borderRight: '3px solid transparent',
              animation: 'spin 1.3s cubic-bezier(0.68,-0.55,0.27,1.55) infinite',
            }} />
            {/* Inner ring */}
            <div style={{
              position: 'absolute',
              inset: '0.75rem',
              borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.04)',
              borderBottom: '3px solid #a855f7',
              borderLeft: '3px solid transparent',
              animation: 'spin 0.9s ease infinite reverse',
            }} />
            {/* Icon center */}
            <div style={{
              width: '2.5rem', height: '2.5rem', borderRadius: '50%',
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid rgba(59,130,246,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1,
            }}>
              <Brain size={18} color="#93c5fd" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.35rem' }}>
              Processing Attendance
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '20rem' }}>
              AI face recognition in progress — this may take a moment
            </p>
          </div>

          {/* Progress bar */}
          <div style={{ width: '100%' }}>
            <div style={{
              width: '100%',
              height: '6px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '9999px',
              overflow: 'hidden',
              marginBottom: '0.75rem',
            }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                borderRadius: '9999px',
                background: 'linear-gradient(90deg, #3b82f6 0%, #a855f7 100%)',
                boxShadow: '0 0 10px rgba(59,130,246,0.6)',
                transition: 'width 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
              }} />
            </div>

            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {steps.map((step, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.4rem 0.7rem',
                  borderRadius: '0.5rem',
                  transition: 'all 0.3s ease',
                  background: i === activeStep ? 'rgba(59,130,246,0.08)' : 'transparent',
                  border: i === activeStep ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
                }}>
                  <div style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: i < activeStep
                      ? '#4ade80'
                      : i === activeStep
                      ? '#60a5fa'
                      : 'rgba(255,255,255,0.1)',
                    boxShadow: i === activeStep ? '0 0 8px rgba(96,165,250,0.6)' : 'none',
                    animation: i === activeStep ? 'pulse 1.5s ease-in-out infinite' : 'none',
                  }} />
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: i === activeStep ? 600 : 400,
                    color: i < activeStep ? '#4ade80' : i === activeStep ? '#93c5fd' : '#475569',
                    transition: 'all 0.3s',
                  }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pulsing text */}
          <p style={{
            fontSize: '0.8rem',
            color: '#60a5fa',
            fontWeight: 500,
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            Please wait...
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingCard;
