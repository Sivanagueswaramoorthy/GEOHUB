import React from 'react';
import {
  History,
  CheckCircle2,
  Send,
  FileCheck,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AuditTimelineItem } from './audit.types';
import { cleanQuotedText } from './audit.data';

interface ActivityTimelineProps {
  timeline: AuditTimelineItem[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ timeline }) => {
  const getTimelineIcon = (type?: string) => {
    switch (type) {
      case 'publish':
        return <Send size={14} className="text-emerald-600" />;
      case 'approval':
      case 'audit':
        return <FileCheck size={14} className="text-emerald-700" />;
      case 'sync':
        return <RefreshCw size={14} className="text-blue-600" />;
      default:
        return <CheckCircle2 size={14} className="text-emerald-600" />;
    }
  };

  return (
    <section className="audit-card activity-timeline-card" aria-labelledby="timeline-heading">
      <div className="audit-card-header">
        <div className="flex items-center gap-2">
          <div className="audit-card-icon-wrap">
            <History size={16} strokeWidth={2.4} className="text-emerald-700" />
          </div>
          <span id="timeline-heading" className="audit-section-label">
            Activity Timeline & Historical Actions
          </span>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          {timeline.length} Recorded Events
        </span>
      </div>

      <div className="timeline-container">
        {timeline.map((item, idx) => {
          const isLatest = idx === 0;
          const cleanedTitle = cleanQuotedText(item.title);

          return (
            <div key={item.id || idx} className={`timeline-item ${isLatest ? 'timeline-item-latest' : ''}`}>
              {/* Connector line and Node dot */}
              <div className="timeline-marker">
                <div className={`timeline-dot ${isLatest ? 'timeline-dot-active' : ''}`}>
                  {getTimelineIcon(item.type)}
                </div>
                {idx !== timeline.length - 1 && <div className="timeline-line" />}
              </div>

              {/* Event Content */}
              <div className="timeline-content">
                <div className="timeline-content-top">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="timeline-title">{cleanedTitle}</h4>
                    {isLatest && (
                      <span className="timeline-latest-pill">
                        <Sparkles size={10} className="text-emerald-600" />
                        <span>Most Recent</span>
                      </span>
                    )}
                    {item.statusBadge && (
                      <span className="timeline-badge">
                        {item.statusBadge}
                      </span>
                    )}
                  </div>

                  <span className="timeline-time">
                    <Clock size={12} className="text-slate-400" />
                    <span>{item.timestamp}</span>
                  </span>
                </div>

                <p className="timeline-desc">{item.description}</p>

                <div className="timeline-author-row">
                  <span className="text-slate-500">By</span>
                  <span className="timeline-author">{item.author}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
