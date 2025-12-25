import { Trip } from "./types/Trip";
import { calcNights, calcScore, expenseTotal } from "./util/expenseTotal";
import { formatCurrency } from "./util/format";
import { deleteTrip, duplicateTrip, moveTripToList } from "./useTripList";
import { Link } from "react-router";
import { useTripListList } from "./useTripListList";
import { useState, useRef, useEffect } from "react";

function DeleteButton({ id, tripName }: { id: string; tripName: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate, isPending } = deleteTrip(id);
  
  const handleDelete = () => {
    mutate();
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'var(--card-bg)',
          padding: 'var(--space-xl)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          maxWidth: '400px',
          width: '90%'
        }}>
          <h3 style={{ marginBottom: 'var(--space-md)', color: 'var(--text-primary)' }}>Delete Trip?</h3>
          <p style={{ marginBottom: 'var(--space-lg)', color: 'var(--text-secondary)' }}>
            Are you sure you want to delete <strong>{tripName}</strong>? This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
            <button
              className="btn-secondary"
              onClick={() => setShowConfirm(false)}
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              className="delete-button"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      className="delete-button"
      onClick={() => setShowConfirm(true)}
      disabled={isPending}
      style={{ width: '100%', textAlign: 'left' }}
    >
      Delete
    </button>
  );
}

function DuplicateButton({ trip }: { trip: Trip }) {
  const { mutate, isPending } = duplicateTrip();
  const handleClick = () => {
    mutate(trip);
  };
  return (
    <button
      className="duplicate-button"
      onClick={handleClick}
      disabled={isPending}
      style={{ width: '100%', textAlign: 'left' }}
    >
      {isPending ? 'Duplicating...' : 'Duplicate'}
    </button>
  );
}

function MoveToListDropdown({ trip }: { trip: Trip }) {
  const { data: tripLists } = useTripListList();
  const { mutate, isPending } = moveTripToList(trip.id);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    mutate(value === "" ? null : value);
  };

  return (
    <select
      value={trip.trip_list_id || ""}
      onChange={handleChange}
      disabled={isPending}
      style={{
        fontSize: "12px",
        padding: "4px 8px",
        backgroundColor: "var(--input-bg)",
        border: "1px solid var(--input-border)",
        borderRadius: "4px",
        color: "var(--input-text)",
      }}
    >
      <option value="">All Trips</option>
      {tripLists?.map((list) => (
        <option key={list.id} value={list.id}>
          {list.name}
        </option>
      ))}
    </select>
  );
}

function OverflowMenu({ trip }: { trip: Trip }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      const target = event.target;
      if (target instanceof Node && !menuRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      style={{ position: 'relative' }}
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        style={{
          padding: 'var(--space-sm)',
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          color: 'var(--text-secondary)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--card-hover)';
          e.currentTarget.style.borderColor = 'var(--border-light)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      >
        •••
      </button>
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: 'var(--space-xs)',
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          minWidth: '160px',
          zIndex: 100,
          overflow: 'hidden'
        }}>
          <div style={{ padding: 'var(--space-xs)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <DuplicateButton trip={trip} />
            <DeleteButton id={trip.id} tripName={trip.name || 'this trip'} />
          </div>
        </div>
      )}
    </div>
  );
}

export function TripSummary(props: Trip) {
  return (
    <div style={{ display: "flex", gap: "var(--space-md)", alignItems: "stretch" }}>
      <div className="trip-card" style={{ position: 'relative', flex: 1 }}>
        <Link
          to={`/${props.id}`}
          style={{ color: "inherit", textDecoration: 'none', display: 'block', height: '100%' }}
        >
          <div className="trip-card-header">
            <div style={{ flex: 1 }}>{props.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <div>{calcScore(props)}</div>
            </div>
          </div>
          <div className="trip-card-details">
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Fun</span>
              <strong>{props.fun}/10</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Nights</span>
              <strong>{calcNights(props)}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Cost</span>
              <strong>{formatCurrency(expenseTotal(props))}</strong>
            </div>
          </div>
        </Link>
        <div style={{ position: 'absolute', top: 'var(--space-sm)', right: 'var(--space-sm)' }}>
          <OverflowMenu trip={props} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-start' }}>
        <MoveToListDropdown trip={props} />
      </div>
    </div>
  );
}
