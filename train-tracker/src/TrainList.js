import React, { useMemo, useState } from 'react';
import './styles/TrainList.css';

function TrainList({ trains, handleTrainClick }) {

  // Added in this version: state for interactive table sorting.
  // The original project displayed trains in a fixed order.
  const [sortKey, setSortKey] = useState('number');
  const [sortDir, setSortDir] = useState('asc');

  // Added feature: allow users to filter and view only delayed trains.
  const [showLateOnly, setShowLateOnly] = useState(false);

  // Normalize punctuality text for display and sorting.
  const normalizeStatus = (t) => {
    const raw = t.punctuality || '';
    return raw.replace('MI', 'min.').replace('HR', 'hr.').toLowerCase();
  };

  // Helper function to check if a train is delayed.
  const isLate = (t) => (t.punctuality || '').endsWith('LATE');

  // New behavior: clicking a table header sorts the train list.
  // Clicking the same header again toggles ascending/descending order.
  const handleHeaderClick = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Visual indicator for the currently sorted column.
  const headerArrow = (key) => {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  };

  // Compared to the original version, the train list is now
  // dynamically filtered and sorted based on user interaction.
  const visibleTrains = useMemo(() => {
    const filtered = showLateOnly ? trains.filter(isLate) : [...trains];

    const getValue = (t) => {
      switch (sortKey) {
        case 'number':
          return Number(t.number) || 0;
        case 'routeName':
          return (t.routeName || '').toLowerCase();
        case 'from':
          return (t.from || '').toLowerCase();
        case 'to':
          return (t.to || '').toLowerCase();
        case 'status':
          return normalizeStatus(t);
        default:
          return '';
      }
    };

    filtered.sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [trains, showLateOnly, sortKey, sortDir]);

  function TrainRow({ train }) {
    const status = normalizeStatus(train);
    const punctualityClassName = isLate(train) ? 'late' : 'ontime';

    return (
      <tr onClick={() => handleTrainClick(train)} className="train-row">
        <td>#{train.number}</td>
        <td>{train.routeName}</td>
        <td>{train.from}</td>
        <td>{train.to}</td>
        <td className={punctualityClassName}>{status}</td>
      </tr>
    );
  }

  const hasResults = visibleTrains.length > 0;

  return (
    <div className="train-list-container">

      {/* New UI controls added above the table for filtering and feedback */}
      <div className="train-list-toolbar">
        <label className="train-list-toggle">
          <input
            type="checkbox"
            checked={showLateOnly}
            onChange={(e) => setShowLateOnly(e.target.checked)}
          />
          Show late only
        </label>
        <div className="train-list-count">
          {visibleTrains.length} / {trains.length}
        </div>
      </div>

      <table className="train-list">
        <thead>
          <tr>
            <th role="button" onClick={() => handleHeaderClick('number')}>
              Train Number{headerArrow('number')}
            </th>
            <th role="button" onClick={() => handleHeaderClick('routeName')}>
              Line Name{headerArrow('routeName')}
            </th>
            <th role="button" onClick={() => handleHeaderClick('from')}>
              From{headerArrow('from')}
            </th>
            <th role="button" onClick={() => handleHeaderClick('to')}>
              To{headerArrow('to')}
            </th>
            <th role="button" onClick={() => handleHeaderClick('status')}>
              Status{headerArrow('status')}
            </th>
          </tr>
        </thead>

        <tbody>
          {hasResults ? (
            visibleTrains.map((t) => (
              <TrainRow
                train={t}
                key={`${t.heading} ${t.number} ${t.lastVisitedStation}`}
              />
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ padding: '16px' }}>
                No trains found for these options.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {!hasResults && (
        <h3 style={{ marginTop: '12px' }}>
          Try changing the search or turning off “late only”.
        </h3>
      )}
    </div>
  );
}

export default TrainList;
