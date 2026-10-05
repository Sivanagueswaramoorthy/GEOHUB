import React from 'react';
import {
  Scan,
  Image,
  QrCode,
  BarChart3,
  ClipboardList,
  CheckSquare,
  UserCheck,
  Users2,
  Layers,
  Calendar,
  Bell,
  User,
  ShieldCheck,
  UserPlus,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface OperationModule {
  key: string;
  name: string;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
  auraGradient: string;
  icon: React.ReactNode;
}

interface OperationCategorySection {
  title: string;
  items: OperationModule[];
}

export const OperationsView: React.FC = () => {
  const { setActiveTab } = useApp();

  const categories: OperationCategorySection[] = [
    {
      title: 'Attendance & Gates',
      items: [
        {
          key: 'scan_qr',
          name: 'Gate Scanner',
          iconBg: '#EFF6FF',
          iconBorder: '#BFDBFE',
          iconColor: '#2563EB',
          auraGradient: 'radial-gradient(circle, rgba(219, 234, 254, 0.75) 0%, rgba(239, 246, 255, 0.25) 50%, transparent 75%)',
          icon: <Scan size={21} />,
        },
        {
          key: 'my_qr',
          name: 'Advisor Pass',
          iconBg: '#F5F3FF',
          iconBorder: '#DDD6FE',
          iconColor: '#7C3AED',
          auraGradient: 'radial-gradient(circle, rgba(237, 233, 254, 0.75) 0%, rgba(245, 243, 255, 0.25) 50%, transparent 75%)',
          icon: <QrCode size={21} />,
        },
      ],
    },
    {
      title: 'Gate Logs & Archives',
      items: [
        {
          key: 'attendance',
          name: 'Live Gate Logs',
          iconBg: '#ECFEFF',
          iconBorder: '#A5F3FC',
          iconColor: '#0284C7',
          auraGradient: 'radial-gradient(circle, rgba(207, 250, 254, 0.75) 0%, rgba(236, 254, 255, 0.25) 50%, transparent 75%)',
          icon: <ClipboardList size={21} />,
        },
        {
          key: 'gallery',
          name: 'Media Archives',
          iconBg: '#FFF1F2',
          iconBorder: '#FECDD3',
          iconColor: '#E11D48',
          auraGradient: 'radial-gradient(circle, rgba(255, 228, 230, 0.75) 0%, rgba(255, 241, 242, 0.25) 50%, transparent 75%)',
          icon: <Image size={21} />,
        },
      ],
    },
    {
      title: 'Governance & Audit',
      items: [
        {
          key: 'approvals',
          name: 'Faculty Sanctions',
          iconBg: '#FFFBEB',
          iconBorder: '#FDE68A',
          iconColor: '#D97706',
          auraGradient: 'radial-gradient(circle, rgba(254, 243, 199, 0.75) 0%, rgba(255, 251, 235, 0.25) 50%, transparent 75%)',
          icon: <CheckSquare size={21} />,
        },
        {
          key: 'reports',
          name: 'Executive Dossier',
          iconBg: '#ECFDF5',
          iconBorder: '#A7F3D0',
          iconColor: '#059669',
          auraGradient: 'radial-gradient(circle, rgba(209, 250, 229, 0.75) 0%, rgba(236, 253, 245, 0.25) 50%, transparent 75%)',
          icon: <BarChart3 size={21} />,
        },
      ],
    },
    {
      title: 'Activities & Bulletins',
      items: [
        {
          key: 'events',
          name: 'Event Operations',
          iconBg: '#FDF4FF',
          iconBorder: '#F5D0FE',
          iconColor: '#A21CAF',
          auraGradient: 'radial-gradient(circle, rgba(250, 232, 255, 0.75) 0%, rgba(253, 244, 255, 0.25) 50%, transparent 75%)',
          icon: <Calendar size={21} />,
        },
        {
          key: 'notifications',
          name: 'Official Bulletins',
          iconBg: '#FEF2F2',
          iconBorder: '#FECACA',
          iconColor: '#DC2626',
          auraGradient: 'radial-gradient(circle, rgba(254, 226, 226, 0.75) 0%, rgba(254, 242, 242, 0.25) 50%, transparent 75%)',
          icon: <Bell size={21} />,
        },
      ],
    },
    {
      title: 'Squads & Scholars',
      items: [
        {
          key: 'members',
          name: 'Scholars Roster',
          iconBg: '#F0FDFA',
          iconBorder: '#99F6E4',
          iconColor: '#0D9488',
          auraGradient: 'radial-gradient(circle, rgba(204, 251, 241, 0.75) 0%, rgba(240, 253, 250, 0.25) 50%, transparent 75%)',
          icon: <UserCheck size={21} />,
        },
        {
          key: 'teams',
          name: 'Squad Leadership',
          iconBg: '#ECFDF5',
          iconBorder: '#A7F3D0',
          iconColor: '#10B981',
          auraGradient: 'radial-gradient(circle, rgba(209, 250, 229, 0.75) 0%, rgba(236, 253, 245, 0.25) 50%, transparent 75%)',
          icon: <Users2 size={21} />,
        },
        {
          key: 'tasks',
          name: 'Sprint Matrix',
          iconBg: '#EFF6FF',
          iconBorder: '#BFDBFE',
          iconColor: '#3B82F6',
          auraGradient: 'radial-gradient(circle, rgba(219, 234, 254, 0.75) 0%, rgba(239, 246, 255, 0.25) 50%, transparent 75%)',
          icon: <Layers size={21} />,
        },
        {
          key: 'profile',
          name: 'Institutional ID',
          iconBg: '#F8FAFC',
          iconBorder: '#E2E8F0',
          iconColor: '#475569',
          auraGradient: 'radial-gradient(circle, rgba(241, 245, 249, 0.85) 0%, rgba(248, 250, 252, 0.35) 50%, transparent 75%)',
          icon: <User size={21} />,
        },
      ],
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        paddingBottom: '30px',
      }}
    >
      {/* Top Header */}
      <div>
        <div style={{ marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#4F46E5',
              backgroundColor: '#EEF2FF',
              padding: '4px 12px',
              borderRadius: '999px',
              letterSpacing: '0.02em',
              display: 'inline-block',
            }}
          >
            Activity Hub
          </span>
        </div>
        <h1
          style={{
            fontSize: '26px',
            fontWeight: 800,
            color: '#0F172A',
            lineHeight: 1.15,
            margin: '0 0 6px 0',
            letterSpacing: '-0.02em',
          }}
        >
          Explore Activities
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: '#64748B',
            margin: 0,
            lineHeight: 1.4,
            fontWeight: 500,
          }}
        >
          Browse modules by category and jump straight into the task you need.
        </p>
      </div>

      {/* Quick Action Shortcuts Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
        }}
      >
        {/* Team Leaders */}
        <button
          onClick={() => setActiveTab('members')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            border: '1.5px solid #E8ECF2',
            padding: '12px 4px 10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
            cursor: 'pointer',
            transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#0284C7';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(2, 132, 199, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#E8ECF2';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.02)';
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#F0F9FF',
              color: '#0284C7',
              border: '1px solid #BAE6FD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UserPlus size={19} />
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#0F172A',
              textAlign: 'center',
              lineHeight: 1.15,
            }}
          >
            Team<br />Leaders
          </span>
        </button>

        {/* Approvals */}
        <button
          onClick={() => setActiveTab('approvals')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            border: '1.5px solid #E8ECF2',
            padding: '12px 4px 10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
            cursor: 'pointer',
            transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#10B981';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#E8ECF2';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.02)';
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#ECFDF5',
              color: '#047857',
              border: '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={19} />
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#0F172A',
              textAlign: 'center',
              lineHeight: 1.15,
            }}
          >
            Approvals
          </span>
        </button>

        {/* Reports */}
        <button
          onClick={() => setActiveTab('reports')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            border: '1.5px solid #E8ECF2',
            padding: '12px 4px 10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
            cursor: 'pointer',
            transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#10B981';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#E8ECF2';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.02)';
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#ECFDF5',
              color: '#047857',
              border: '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BarChart3 size={19} />
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#0F172A',
              textAlign: 'center',
              lineHeight: 1.15,
            }}
          >
            Reports
          </span>
        </button>

        {/* Squads */}
        <button
          onClick={() => setActiveTab('teams')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            border: '1.5px solid #E8ECF2',
            padding: '12px 4px 10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
            cursor: 'pointer',
            transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#10B981';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#E8ECF2';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.02)';
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#ECFDF5',
              color: '#047857',
              border: '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users2 size={19} />
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#0F172A',
              textAlign: 'center',
              lineHeight: 1.15,
            }}
          >
            Squads
          </span>
        </button>
      </div>

      {/* Categorized Sections: Pure White Box with Light Icon Colors and Subtle Aura Pattern */}
      {categories.map((category) => (
        <div
          key={category.title}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #E8ECF2',
            padding: '18px 16px 16px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* Section Header: Title + Count Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h2
              style={{
                fontSize: '17px',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.01em',
                margin: 0,
              }}
            >
              {category.title}
            </h2>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#EEF2FF',
                color: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {category.items.length}
            </div>
          </div>

          {/* Module Cards Grid: Pure White Box with Light Pastel Icon Colors */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
            }}
          >
            {category.items.map((item) => (
              <div
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1.5px solid #F1F5F9',
                  padding: '16px 14px',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  minHeight: '130px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 3px 12px rgba(0, 0, 0, 0.02)',
                  transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms ease, border-color 180ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = item.iconBorder;
                  e.currentTarget.style.boxShadow = `0 10px 24px -4px ${item.iconColor}18, 0 2px 8px rgba(0, 0, 0, 0.03)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#F1F5F9';
                  e.currentTarget.style.boxShadow = '0 3px 12px rgba(0, 0, 0, 0.02)';
                }}
              >
                {/* 1. Diffused Soft Ambient Aura */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '110px',
                    height: '110px',
                    borderRadius: '50%',
                    background: item.auraGradient,
                    filter: 'blur(16px)',
                    opacity: 0.9,
                    pointerEvents: 'none',
                  }}
                />

                {/* 2. Concentric Vector Hairline Rings */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-30px',
                    right: '-30px',
                    width: '105px',
                    height: '105px',
                    borderRadius: '50%',
                    border: `1.5px solid ${item.iconBorder}`,
                    opacity: 0.45,
                    pointerEvents: 'none',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '-15px',
                    width: '75px',
                    height: '75px',
                    borderRadius: '50%',
                    border: `1px dashed ${item.iconBorder}`,
                    opacity: 0.4,
                    pointerEvents: 'none',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '0px',
                    right: '0px',
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    border: `1px solid ${item.iconBorder}`,
                    opacity: 0.35,
                    pointerEvents: 'none',
                  }}
                />

                {/* Top: Light Pastel Icon Squircle */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '13px',
                      backgroundColor: item.iconBg,
                      border: `1.5px solid ${item.iconBorder}`,
                      color: item.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 2px 8px ${item.iconColor}15`,
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                </div>

                {/* Bottom: Module Name & Open Action */}
                <div style={{ marginTop: '12px', position: 'relative', zIndex: 2 }}>
                  <h3
                    style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: '#0F172A',
                      margin: '0 0 3px 0',
                      lineHeight: 1.25,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {item.name}
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      fontSize: '11px',
                      color: item.iconColor,
                      fontWeight: 700,
                    }}
                  >
                    <span>Open module</span>
                    <ChevronRight size={13} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
