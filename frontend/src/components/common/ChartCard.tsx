import React from 'react';
import { MonthlyAttendance, TeamMetric } from '../../types';

interface AttendanceChartProps {
  data: MonthlyAttendance[];
  title?: string;
}

export const AttendanceChart: React.FC<AttendanceChartProps> = ({
  data,
  title = 'Monthly Attendance Trends',
}) => {
  const maxCount = Math.max(...data.map((d) => d.count), 220);

  return (
    <div className="app-card" style={{ marginBottom: '16px' }}>
      <div className="card-header">
        <div>
          <h3 className="card-title">{title}</h3>
          <p className="card-subtitle">Verified QR check-ins per symposium</p>
        </div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#0F766E',
            backgroundColor: '#F0FDFA',
            padding: '4px 8px',
            borderRadius: '999px',
          }}
        >
          AVG 88.4%
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          height: '140px',
          paddingTop: '20px',
          gap: '12px',
        }}
      >
        {data.map((item, idx) => {
          const heightPercent = Math.round((item.count / maxCount) * 100);
          return (
            <div
              key={idx}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#0F766E',
                  marginBottom: '4px',
                }}
              >
                {item.count}
              </span>
              <div
                style={{
                  width: '100%',
                  maxWidth: '36px',
                  height: `${heightPercent}%`,
                  background: 'linear-gradient(180deg, #14B8A6 0%, #0F766E 100%)',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 400ms ease',
                }}
              />
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#64748B',
                  marginTop: '8px',
                }}
              >
                {item.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface TeamProgressChartProps {
  metrics: TeamMetric[];
}

export const TeamProgressChart: React.FC<TeamProgressChartProps> = ({ metrics }) => {
  return (
    <div className="app-card" style={{ marginBottom: '16px' }}>
      <div className="card-header">
        <div>
          <h3 className="card-title">Team Task Execution</h3>
          <p className="card-subtitle">Completed tasks vs allocated tasks</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {metrics.map((tm, idx) => {
          const rate = tm.totalTasks > 0 ? Math.round((tm.completedTasks / tm.totalTasks) * 100) : 0;
          return (
            <div key={idx}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  fontWeight: 500,
                  marginBottom: '6px',
                }}
              >
                <span style={{ color: '#0F172A', fontWeight: 600 }}>{tm.teamName}</span>
                <span style={{ color: '#64748B' }}>
                  {tm.completedTasks} / {tm.totalTasks} ({rate}%)
                </span>
              </div>
              <div
                style={{
                  height: '8px',
                  width: '100%',
                  background: '#F1F5F9',
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${rate}%`,
                    background: '#0F766E',
                    borderRadius: '999px',
                    transition: 'width 500ms ease-out',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
