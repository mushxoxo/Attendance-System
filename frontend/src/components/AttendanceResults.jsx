import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, User, CheckCircle, BarChart2, Users, ChevronDown, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import toast from 'react-hot-toast';

// Helper: determine confidence color
const getConfColor = (confidence) => {
  const v = parseFloat(confidence.replace('%', ''));
  if (v >= 90) return { bar: '#22c55e', badge: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', text: '#4ade80' } };
  if (v >= 70) return { bar: '#f59e0b', badge: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24' } };
  return { bar: '#ef4444', badge: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#f87171' } };
};

const StatCard = ({ label, value, icon: Icon, color, bgColor }) => (
  <Card className="card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
    <div style={{ padding: '1.25rem 1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flex: 1 }}>
      <div>
        <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
          {label}
        </p>
        <p style={{ fontSize: '1.75rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
      </div>
      <div style={{
        width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem',
        background: bgColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={18} color={color} />
      </div>
    </div>
  </Card>
);

const AttendanceResults = ({ attendanceData, csvFilename }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, present: 0, avgConf: 0, high: 0, medium: 0, low: 0 });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!attendanceData?.length) return;
    const vals = attendanceData.map(r => parseFloat(r.Confidence.replace('%', '')));
    const avg = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
    setStats({
      total: attendanceData.length,
      present: attendanceData.length,
      avgConf: avg,
      high:   vals.filter(v => v >= 90).length,
      medium: vals.filter(v => v >= 70 && v < 90).length,
      low:    vals.filter(v => v < 70).length,
    });
  }, [attendanceData]);

  const handleDownload = async () => {
    if (!csvFilename) return;
    setIsDownloading(true);
    const t = toast.loading('Downloading CSV...');
    try {
      const link = document.createElement('a');
      link.href = `${API_URL}/download-csv/${encodeURIComponent(csvFilename)}`;
      link.setAttribute('download', csvFilename);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 100);
      toast.success('Download started!', { id: t });
    } catch (e) {
      toast.error('Download failed', { id: t });
    } finally {
      setIsDownloading(false);
    }
  };

  const filtered = attendanceData?.filter(r =>
    r.Student_ID.toLowerCase().includes(query.toLowerCase())
  ) || [];
  const displayed = showAll ? filtered : filtered.slice(0, 5);

  if (!attendanceData?.length) return null;

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* Header Banner */}
      <div style={{
        borderRadius: '1rem',
        background: 'linear-gradient(135deg, rgba(37,99,235,0.25) 0%, rgba(99,102,241,0.2) 50%, rgba(147,51,234,0.15) 100%)',
        border: '1px solid rgba(99,102,241,0.25)',
        padding: '1.5rem 1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
          }}>
            <FileSpreadsheet size={18} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2 }}>
              Attendance Results
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'rgba(147,197,253,0.8)', marginTop: '0.15rem' }}>
              {stats.total} student{stats.total !== 1 ? 's' : ''} identified in the class photo
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleDownload} disabled={isDownloading} style={{ borderColor: 'rgba(99,102,241,0.4)', color: '#c4b5fd' }}>
          <Download size={14} style={{ marginRight: '0.4rem' }} />
          <span>{isDownloading ? 'Downloading...' : 'Download CSV'}</span>
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '1rem' }}>
        <StatCard label="Total Detected" value={stats.total}   icon={Users}       color="#60a5fa" bgColor="rgba(59,130,246,0.12)" />
        <StatCard label="Present"        value={stats.present} icon={CheckCircle} color="#4ade80" bgColor="rgba(34,197,94,0.12)" />
        <StatCard label="Avg. Confidence" value={`${stats.avgConf}%`} icon={BarChart2} color="#c084fc" bgColor="rgba(168,85,247,0.12)" />
      </div>

      {/* Confidence Distribution */}
      <Card>
        <CardHeader style={{ paddingBottom: '0.75rem' }}>
          <CardTitle style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>Confidence Distribution</CardTitle>
          <CardDescription>Recognition confidence levels across all detected students</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Bar */}
          <div style={{ display: 'flex', height: '8px', borderRadius: '9999px', overflow: 'hidden', background: 'rgba(255,255,255,0.04)', gap: '2px', marginBottom: '0.875rem' }}>
            {stats.total > 0 && (<>
              <div style={{ flex: stats.high, background: '#22c55e', transition: 'flex 0.6s ease', borderRadius: stats.medium === 0 && stats.low === 0 ? '9999px' : '9999px 0 0 9999px' }} title={`High: ${stats.high}`} />
              {stats.medium > 0 && <div style={{ flex: stats.medium, background: '#f59e0b', transition: 'flex 0.6s ease' }} title={`Medium: ${stats.medium}`} />}
              {stats.low > 0 && <div style={{ flex: stats.low, background: '#ef4444', transition: 'flex 0.6s ease', borderRadius: stats.high === 0 && stats.medium === 0 ? '9999px' : '0 9999px 9999px 0' }} title={`Low: ${stats.low}`} />}
            </>)}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {[
              { color: '#22c55e', label: 'High (≥90%)', count: stats.high },
              { color: '#f59e0b', label: 'Medium (70-89%)', count: stats.medium },
              { color: '#ef4444', label: 'Low (<70%)', count: stats.low },
            ].map(({ color, label, count }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#64748b' }}>
                <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: color }} />
                <span>{label}: <strong style={{ color: '#94a3b8' }}>{count}</strong></span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader style={{ paddingBottom: '0.5rem' }}>
          <CardTitle style={{ fontSize: '0.9rem', color: '#e2e8f0', marginBottom: '0.75rem' }}>Present Students</CardTitle>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', top: '50%', left: '0.75rem', transform: 'translateY(-50%)', color: '#475569' }} />
            <input
              type="text"
              placeholder="Search by student ID..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </CardHeader>

        <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {displayed.length > 0 ? displayed.map((record, i) => {
            const { bar, badge } = getConfColor(record.Confidence);
            return (
              <div key={i} className="student-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '2.2rem', height: '2.2rem', borderRadius: '50%',
                    background: 'rgba(59,130,246,0.12)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <User size={14} color="#93c5fd" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#e2e8f0' }}>{record.Student_ID}</p>
                    <p style={{ fontSize: '0.7rem', color: '#475569' }}>{record.Timestamp}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    background: 'rgba(34,197,94,0.12)',
                    border: '1px solid rgba(34,197,94,0.25)',
                    color: '#4ade80',
                  }}>
                    {record.Status}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: '4.5rem', height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: record.Confidence, background: bar, borderRadius: '9999px', transition: 'width 0.6s ease', boxShadow: `0 0 6px ${bar}` }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', minWidth: '2.5rem' }}>{record.Confidence}</span>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#475569', fontSize: '0.85rem' }}>
              No students match your search
            </div>
          )}

          {filtered.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              style={{
                width: '100%',
                marginTop: '0.5rem',
                padding: '0.6rem',
                borderRadius: '0.6rem',
                border: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(255,255,255,0.03)',
                color: '#64748b',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#94a3b8'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#64748b'; }}
            >
              <ChevronDown size={14} style={{ transform: showAll ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
              {showAll ? 'Show Less' : `Show All (${filtered.length})`}
            </button>
          )}
        </CardContent>

        <CardFooter style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', justifyContent: 'center' }}>
          <Button variant="gradient" onClick={handleDownload} disabled={isDownloading} style={{ minWidth: '14rem' }}>
            <Download size={14} style={{ marginRight: '0.5rem' }} />
            {isDownloading ? 'Downloading...' : 'Download Attendance CSV'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AttendanceResults;
