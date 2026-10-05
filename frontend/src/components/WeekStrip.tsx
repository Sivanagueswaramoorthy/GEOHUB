import React from 'react';

export interface WeekDayItem {
  dateStr: string;
  dayName: string; // e.g. Mon, Tue
  dayNum: number;  // e.g. 28, 29, 3
  hasDot?: boolean;
  isToday?: boolean;
}

export interface WeekStripProps {
  days: WeekDayItem[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const WeekStrip: React.FC<WeekStripProps> = ({
  days,
  selectedDate,
  onSelectDate,
  className = '',
  style,
}) => {
  return (
    <div
      className={`flex items-center justify-between gap-1 w-full overflow-x-auto no-scrollbar py-1 ${className}`}
      style={style}
    >
      {days.map((item) => {
        const isSelected = item.dateStr === selectedDate;

        return (
          <button
            key={item.dateStr}
            type="button"
            onClick={() => onSelectDate(item.dateStr)}
            className="flex-1 flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer min-w-[42px]"
            style={{
              backgroundColor: isSelected ? '#10B981' : '#FFFFFF',
              border: isSelected ? '1px solid #10B981' : '1px solid #EEF1F5',
              boxShadow: isSelected
                ? '0 6px 16px rgba(16, 185, 129, 0.35)'
                : '0 2px 6px rgba(15, 23, 42, 0.02)',
              color: isSelected ? '#FFFFFF' : '#0F172A',
            }}
          >
            {/* Day name (Mon, Tue) */}
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: isSelected ? 'rgba(255, 255, 255, 0.9)' : '#94A3B8',
                marginBottom: '2px',
              }}
            >
              {item.dayName}
            </span>

            {/* Day number (28, 29, 3) */}
            <span
              style={{
                fontSize: '15px',
                fontWeight: 800,
                lineHeight: 1.2,
                color: isSelected ? '#FFFFFF' : '#0F172A',
              }}
            >
              {item.dayNum}
            </span>

            {/* Event indicator dot */}
            <div className="h-1.5 flex items-center justify-center mt-1">
              {item.hasDot && (
                <span
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? '#FFFFFF' : '#10B981',
                  }}
                />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
