import React from 'react';
import { TYPOGRAPHY, COMPONENTS } from '../styles/tokens';

export interface Column<T> {
  key: string;
  header: string;
  isNumeric?: boolean;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  className?: string;
  style?: React.CSSProperties;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  className = '',
  style,
}: DataTableProps<T>) {
  return (
    <div
      className={`w-full overflow-x-auto ${className}`}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <table
        className="w-full text-left border-collapse"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: '#FFFFFF',
        }}
      >
        <thead>
          <tr style={{ borderBottom: '1px solid #EEF1F5' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  fontSize: `${TYPOGRAPHY.scale.overline.fontSize}px`,
                  lineHeight: `${TYPOGRAPHY.scale.overline.lineHeight}px`,
                  fontWeight: TYPOGRAPHY.scale.overline.fontWeight,
                  letterSpacing: TYPOGRAPHY.scale.overline.letterSpacing,
                  textTransform: 'uppercase',
                  color: '#64748B',
                  padding: '12px 16px',
                  textAlign: col.isNumeric ? 'right' : 'left',
                  fontFamily: 'var(--font-family)',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              style={{
                height: `${COMPONENTS.tables.rowHeight}px`,
                borderBottom: '1px solid #EEF1F5',
              }}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    fontSize: `${TYPOGRAPHY.scale.body.fontSize}px`,
                    lineHeight: `${TYPOGRAPHY.scale.body.lineHeight}px`,
                    fontWeight: 400,
                    color: '#0F172A',
                    padding: '0 16px',
                    textAlign: col.isNumeric ? 'right' : 'left',
                    fontFeatureSettings: col.isNumeric ? '"tnum"' : undefined,
                    fontFamily: 'var(--font-family)',
                  }}
                >
                  {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as React.ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
