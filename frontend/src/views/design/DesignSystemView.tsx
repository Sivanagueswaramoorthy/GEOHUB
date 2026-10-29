import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  ArrowRight,
  Shield,
  Search,
  Bell,
  Heart,
  FileText,
  User,
  Clock,
  Layers,
} from 'lucide-react';
import {
  Mascot,
  MascotName,
  TopBar,
  HeroCard,
  PillButton,
  PastelCard,
  BentoGrid,
  BentoItem,
  StatTile,
  StatusChip,
  StatusType,
  SegmentedTabs,
  BottomSheet,
  ListRow,
  SearchField,
  EmptyState,
  ProgressRing,
  FormField,
  SectionHeader,
  Toast,
  ConfirmDialog,
  Avatar,
  Skeleton,
  ErrorState,
  OfflineBanner,
  UploadCard,
  PeoplePicker,
  DatePickerField,
  AmountInput,
} from '../../components/shared';

export const DesignSystemView: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'tokens' | 'mascots' | 'components' | 'states'>('tokens');
  const [searchValue, setSearchValue] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [demoFormValue, setDemoFormValue] = useState('Green Eco Hub');
  const [demoAmount, setDemoAmount] = useState<number>(2500);
  const [demoDate, setDemoDate] = useState('2026-10-28');
  const [selectedPeople, setSelectedPeople] = useState<string[]>(['usr_01']);
  const [isPeoplePickerOpen, setIsPeoplePickerOpen] = useState(false);

  const showDemoToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const allMascots: MascotName[] = [
    'leaf',
    'globe',
    'tree',
    'drone',
    'gps-pin',
    'qr-code',
    'camera',
    'notebook',
    'coin',
    'wallet',
    'megaphone',
    'calendar',
    'trophy',
    'clipboard',
    'shield',
    'magnifier',
    'lock',
  ];

  const brandColors = [
    { name: 'pine-950', hex: '#051F20', desc: 'Darkest text, dark hero cards, scanner bg' },
    { name: 'pine-900', hex: '#0B2B26', desc: 'Dark surfaces, headings on mint' },
    { name: 'pine-800', hex: '#163832', desc: 'Primary buttons, active pill tabs, key icons' },
    { name: 'pine-700', hex: '#235347', desc: 'Secondary text, links, helper meta, chart lines' },
    { name: 'sage-400', hex: '#8EB69B', desc: 'Dividers, chips, progress fills, secondary borders' },
    { name: 'mint-100', hex: '#DAF1DE', desc: 'Selected states, card tints, hero radial glow' },
  ];

  const derivedNeutrals = [
    { name: 'app background', hex: '#F6FBF7', desc: 'App scaffold with soft radial mint glow' },
    { name: 'card white', hex: '#FFFFFF', desc: '1px #DAF1DE hairline, 0 10px 30px shadow' },
    { name: 'amber warn', hex: '#F2B84B', desc: 'Semantic pending, review, low stock' },
    { name: 'red danger', hex: '#D9534F', desc: 'Semantic cancel, reject, delete' },
  ];

  const statusChipsList: StatusType[] = [
    'draft',
    'submitted',
    'approved',
    'live',
    'done',
    'archived',
    'cancelled',
    'pending',
    'low-stock',
  ];

  const mascotSizes: ('sm' | 'md' | 'lg' | 'xl')[] = ['sm', 'md', 'lg', 'xl'];

  const peopleOptions = [
    { uid: 'usr_01', name: 'Elena Rostova', department: 'Geoinformatics' },
    { uid: 'usr_02', name: 'Alex Rivera', department: 'Computer Science' },
    { uid: 'usr_03', name: 'Dr. Sarah Mitchell', department: 'Faculty Board' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '96px' }} className="select-none">
      {/* Toast Alert */}
      {toastMsg && (
        <Toast message={toastMsg} onClose={() => setToastMsg(null)} />
      )}

      {/* TopBar with Design System Header */}
      <TopBar
        title="Design System"
        subtitle="Single Source of Truth"
        showBack={false}
        rightAction={
          <button
            type="button"
            onClick={() => showDemoToast('Design system tokens verified!')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '9999px',
              backgroundColor: '#FFFFFF',
              color: '#163832',
              boxShadow: '0 4px 12px rgba(5,31,32,0.06)',
              border: '1px solid #DAF1DE',
              cursor: 'pointer',
            }}
            aria-label="Alerts"
          >
            <Bell size={18} strokeWidth={2} />
          </button>
        }
      />

      {/* Hero Banner with Friendly Leaf Mascot */}
      <HeroCard
        variant="mint"
        title="GeoHub Aesthetics"
        subtitle="Soft 3D mobile design with clay vector mascots & strict brand tokens"
        mascot="leaf"
        mascotSize="xl"
        chip={<StatusChip status="live" label="Production Tokens" />}
      />

      {/* Segmented Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <SegmentedTabs
          tabs={[
            { key: 'tokens', label: '1. Tokens' },
            { key: 'mascots', label: '2. Mascots (17)' },
            { key: 'components', label: '3. Components' },
            { key: 'states', label: '4. Dialogs & States' },
          ]}
          activeTab={selectedTab}
          onChange={(key) => setSelectedTab(key as any)}
        />
      </div>

      {/* TAB 1: DESIGN TOKENS */}
      {selectedTab === 'tokens' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Brand Palette (6 brand colors) */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <SectionHeader title="Brand Palette (Only brand colors allowed)" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              {brandColors.map((color) => (
                <div
                  key={color.name}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '16px',
                    borderRadius: '24px',
                    border: '1px solid #DAF1DE',
                    boxShadow: '0 4px 14px rgba(5,31,32,0.04)',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '60px',
                      borderRadius: '16px',
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 800,
                      backgroundColor: color.hex,
                      color: ['#051F20', '#0B2B26', '#163832', '#235347'].includes(color.hex)
                        ? '#FFFFFF'
                        : '#051F20',
                    }}
                  >
                    {color.hex}
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '14px', color: '#051F20' }}>
                    {color.name}
                  </span>
                  <span style={{ fontSize: '12px', color: '#235347', fontWeight: 500, marginTop: '2px', lineHeight: 1.4 }}>
                    {color.desc}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Derived Neutrals (4 derived colors with hex labels) */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <SectionHeader title="Derived & Semantic Palette" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              {derivedNeutrals.map((color) => (
                <div
                  key={color.name}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '16px',
                    borderRadius: '24px',
                    border: '1px solid #DAF1DE',
                    boxShadow: '0 4px 14px rgba(5,31,32,0.04)',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '56px',
                      borderRadius: '16px',
                      marginBottom: '10px',
                      border: '1px solid #DAF1DE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 800,
                      backgroundColor: color.hex,
                      color: ['#D9534F'].includes(color.hex) ? '#FFFFFF' : '#051F20',
                    }}
                  >
                    {color.hex}
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '14px', color: '#051F20', textTransform: 'capitalize' }}>
                    {color.name}
                  </span>
                  <span style={{ fontSize: '12px', color: '#235347', fontWeight: 500, marginTop: '2px', lineHeight: 1.4 }}>
                    {color.desc}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Typography Scale with 12px Hard Floor */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <SectionHeader title="Typography Scale (Plus Jakarta Sans)" />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                padding: '20px',
                borderRadius: '24px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #DAF1DE',
                boxShadow: '0 10px 30px rgba(5,31,32,0.08)',
              }}
            >
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#235347', textTransform: 'uppercase' }}>
                  Headline (28/32 bold, max 2 lines)
                </span>
                <h1 style={{ fontSize: '28px', lineHeight: '32px', fontWeight: 800, color: '#051F20', margin: '4px 0 0 0' }}>
                  Good morning, Elena
                </h1>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #DAF1DE', margin: 0 }} />
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#235347', textTransform: 'uppercase' }}>
                  Section Title (18 semibold)
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#051F20', margin: '4px 0 0 0' }}>
                  Next chapter activity
                </h3>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #DAF1DE', margin: 0 }} />
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#235347', textTransform: 'uppercase' }}>
                  Stat Numbers (24 extra bold)
                </span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#051F20', margin: '4px 0 0 0' }}>
                  ₹24,500
                </div>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #DAF1DE', margin: 0 }} />
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#235347', textTransform: 'uppercase' }}>
                  Body (14-15px, 4.5:1 contrast)
                </span>
                <p style={{ fontSize: '14px', color: '#051F20', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                  Soft pastel cards with 24px radius, 1px #DAF1DE hairlines, and smooth micro-animations.
                </p>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #DAF1DE', margin: 0 }} />
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#235347', textTransform: 'uppercase' }}>
                  Caption (12px hard floor, never below)
                </span>
                <p style={{ fontSize: '12px', color: '#235347', fontWeight: 600, margin: '4px 0 0 0' }}>
                  Turnstile scanner active • 2 open slots • Cryptographic pass valid
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: ALL 17 MASCOTS AT 4 SIZES */}
      {selectedTab === 'mascots' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SectionHeader title="Clay Mascot System (All 17 Mascots)" />
          <p style={{ fontSize: '12px', fontWeight: 500, color: '#235347', margin: 0 }}>
            Soft clay-style SVG with friendly dot eyes and subtle smile across 4 standard sizes (sm: 32px, md: 48px, lg: 64px, xl: 96px).
          </p>

          {/* Sizes Showroom for Leaf */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              padding: '20px',
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #DAF1DE',
            }}
          >
            {mascotSizes.map((sz) => (
              <div key={sz} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <Mascot name="leaf" size={sz} floating={sz === 'xl'} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#163832' }}>
                  size="{sz}"
                </span>
              </div>
            ))}
          </div>

          {/* All 17 Mascots Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
            }}
          >
            {allMascots.map((mascotName) => (
              <div
                key={mascotName}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                  borderRadius: '24px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #DAF1DE',
                  boxShadow: '0 8px 24px rgba(5,31,32,0.06)',
                  textAlign: 'center',
                }}
              >
                <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mascot name={mascotName} size="md" />
                </div>
                <span style={{ fontWeight: 800, fontSize: '12px', color: '#051F20', marginTop: '8px', textTransform: 'capitalize' }}>
                  {mascotName.replace(/-/g, ' ')}
                </span>
                <span style={{ fontSize: '12px', color: '#235347', marginTop: '2px' }}>
                  &lt;{mascotName}&gt;
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SHARED COMPONENTS */}
      {selectedTab === 'components' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Button Showroom (4 variants x default/hover/loading) */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <SectionHeader title="Button Showroom (4 Variants x Pill)" />
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '12px',
                padding: '20px',
                borderRadius: '24px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #DAF1DE',
                boxShadow: '0 8px 24px rgba(5,31,32,0.06)',
              }}
            >
              <PillButton variant="primary">Primary</PillButton>
              <PillButton variant="secondary">Secondary</PillButton>
              <PillButton variant="ghost">Ghost</PillButton>
              <PillButton variant="destructive">Destructive</PillButton>
              <PillButton variant="primary" size="sm" icon={<Calendar size={14} />}>
                Small
              </PillButton>
              <PillButton variant="primary" loading>
                Loading
              </PillButton>
            </div>
          </section>

          {/* StatusChip Gallery */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <SectionHeader title="StatusChip Gallery" />
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                padding: '20px',
                borderRadius: '24px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #DAF1DE',
                boxShadow: '0 8px 24px rgba(5,31,32,0.06)',
              }}
            >
              {statusChipsList.map((st) => (
                <StatusChip key={st} status={st} />
              ))}
            </div>
          </section>

          {/* Live ProgressRing & StatTiles */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <SectionHeader title="Live ProgressRing & StatTiles" />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                  borderRadius: '24px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #DAF1DE',
                  boxShadow: '0 8px 24px rgba(5,31,32,0.06)',
                }}
              >
                <ProgressRing progress={75} size={72} strokeWidth={6} label="75%" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#235347', marginTop: '6px' }}>
                  Gate Turnstile
                </span>
              </div>

              <StatTile
                icon={<Calendar size={18} strokeWidth={2} />}
                value="14"
                label="Events"
                tint="mint"
              />
              <StatTile
                icon={<Shield size={18} strokeWidth={2} />}
                value="8"
                label="Approvals"
                tint="amber"
              />
              <StatTile
                icon={<User size={18} strokeWidth={2} />}
                value="248"
                label="Members"
                tint="white"
              />
            </div>
          </section>

          {/* BentoGrid & PastelCards */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <SectionHeader title="BentoGrid & PastelCards (24px Radius)" />
            <BentoGrid>
              <BentoItem span="full">
                <PastelCard variant="mint" showArrow onClick={() => showDemoToast('Clicked workshop card')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Mascot name="drone" size="md" />
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#235347', textTransform: 'uppercase' }}>
                        Featured Workshop
                      </span>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#051F20', margin: '2px 0 0 0' }}>
                        Autonomous Drone Survey & GIS Mapping
                      </h3>
                      <p style={{ fontSize: '12px', color: '#235347', margin: '4px 0 0 0' }}>
                        Oct 12 • Grand Auditorium
                      </p>
                    </div>
                  </div>
                </PastelCard>
              </BentoItem>

              <BentoItem span="half">
                <PastelCard variant="white" showArrow onClick={() => showDemoToast('Clicked squads')}>
                  <Mascot name="globe" size="sm" />
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#051F20', margin: '6px 0 0 0' }}>
                    Squads
                  </h4>
                  <p style={{ fontSize: '12px', color: '#235347', margin: '2px 0 0 0' }}>
                    4 tracks active
                  </p>
                </PastelCard>
              </BentoItem>

              <BentoItem span="half">
                <PastelCard variant="sage" showArrow onClick={() => showDemoToast('Clicked pass')}>
                  <Mascot name="qr-code" size="sm" />
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#051F20', margin: '6px 0 0 0' }}>
                    Turnstile Pass
                  </h4>
                  <p style={{ fontSize: '12px', color: '#235347', margin: '2px 0 0 0' }}>
                    Active 60s QR
                  </p>
                </PastelCard>
              </BentoItem>
            </BentoGrid>
          </section>

          {/* Form Fields & Inputs */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <SectionHeader title="Form Fields (16px Radius, Floating Label)" />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                padding: '20px',
                borderRadius: '24px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #DAF1DE',
                boxShadow: '0 8px 24px rgba(5,31,32,0.06)',
              }}
            >
              <FormField
                label="Chapter Organization"
                value={demoFormValue}
                onChange={(e) => setDemoFormValue(e.target.value)}
              />
              <AmountInput
                value={demoAmount}
                onChange={setDemoAmount}
              />
              <DatePickerField
                label="Event Date"
                value={demoDate}
                onChange={setDemoDate}
              />
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: DIALOGS, SHEETS & STATES */}
      {selectedTab === 'states' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SectionHeader title="Interactive Sheets & Dialogs" />

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <PillButton variant="primary" onClick={() => setIsSheetOpen(true)}>
              Open BottomSheet
            </PillButton>
            <PillButton variant="destructive" onClick={() => setIsConfirmOpen(true)}>
              Open ConfirmDialog
            </PillButton>
            <PillButton variant="secondary" onClick={() => setIsPeoplePickerOpen(true)}>
              Open PeoplePicker
            </PillButton>
          </div>

          <SectionHeader title="Specialized States (Shimmer, Error, Offline)" />
          <OfflineBanner />

          <div
            style={{
              padding: '20px',
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #DAF1DE',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#235347' }}>
              Mint Shimmer Skeletons
            </span>
            <Skeleton width="100%" height={24} borderRadius={12} />
            <Skeleton width="60%" height={18} borderRadius={10} />
          </div>

          <ErrorState
            title="Connection error"
            description="Unable to reach campus turnstile cluster"
            onRetry={() => showDemoToast('Retrying turnstile handshake...')}
          />

          <EmptyState
            mascot="leaf"
            title="Zero state"
            description="All activities successfully reviewed"
            actionLabel="Refresh"
            onAction={() => showDemoToast('Refreshed!')}
          />

          {/* BottomSheet */}
          <BottomSheet
            isOpen={isSheetOpen}
            onClose={() => setIsSheetOpen(false)}
            title="Shared BottomSheet"
            subtitle="24px top radius with drag handle"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
              <p style={{ fontSize: '13px', color: '#051F20', margin: 0, lineHeight: 1.5 }}>
                All sheets in GeoHub feature 24px top border-radius, smooth slide-up animation, and 40px circular close targets.
              </p>
              <PillButton variant="primary" fullWidth onClick={() => setIsSheetOpen(false)}>
                Confirm
              </PillButton>
            </div>
          </BottomSheet>

          {/* ConfirmDialog */}
          <ConfirmDialog
            isOpen={isConfirmOpen}
            onClose={() => setIsConfirmOpen(false)}
            onConfirm={(reason) => {
              showDemoToast(`Declined with reason: ${reason || 'None'}`);
              setIsConfirmOpen(false);
            }}
            title="Critical Action"
            message="Are you sure you want to proceed with this rejection?"
            variant="destructive"
            requireReason={true}
            reasonPlaceholder="State official reason..."
          />

          {/* PeoplePicker */}
          <PeoplePicker
            isOpen={isPeoplePickerOpen}
            onClose={() => setIsPeoplePickerOpen(false)}
            title="Select Volunteers"
            people={peopleOptions}
            selectedUids={selectedPeople}
            onSelectionChange={setSelectedPeople}
          />
        </div>
      )}
    </div>
  );
};

export default DesignSystemView;
