import { InsightCard } from '../types';

interface InsightGridProps {
  insights: InsightCard[];
}

export function InsightGrid({ insights }: InsightGridProps) {
  return (
    <div>
      <div className="summary-banner">Insights are informational only and not medical advice.</div>
      <div className="grid insights">
        {insights.map((insight) => (
          <article key={insight.id} className="insight-card">
            <h3>{insight.title}</h3>
            <p>{insight.summary}</p>
            <p style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>Related tests: {insight.relatedTests.join(', ')}</p>
            <p style={{ fontSize: '0.85rem' }}>{insight.detail}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
