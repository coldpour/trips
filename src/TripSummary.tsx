import { Trip } from "./types/Trip";
import { calcNights, calcScore, expenseTotal } from "./util/expenseTotal";
import { formatCurrency } from "./util/format";
import { deleteTrip, duplicateTrip, moveTripToList } from "./useTripList";
import { Link } from "react-router";
import { useTripListList, createTripList } from "./useTripListList";
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
      className="trip-card-menu-item delete-button"
      onClick={() => setShowConfirm(true)}
      disabled={isPending}
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
      className="trip-card-menu-item duplicate-button"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? 'Duplicating...' : 'Duplicate'}
    </button>
  );
}

function MoveTripDialog({
  trip,
  onClose,
}: {
  trip: Trip;
  onClose: () => void;
}) {
  const { data: tripLists } = useTripListList();
  const { mutate, isPending } = moveTripToList(trip.id);
  const { mutateAsync: createList, isPending: isCreating } = createTripList();
  const [filterText, setFilterText] = useState("");
  const [newListName, setNewListName] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleMove = (listId: string | null) => {
    mutate(listId);
    onClose();
  };

  const handleCreateAndMove = async () => {
    if (!newListName.trim()) return;
    const created = await createList(newListName.trim());
    if (created?.id) {
      mutate(created.id);
      onClose();
    }
  };

  const normalizedFilter = filterText.trim().toLowerCase();
  const filteredLists = (tripLists || []).filter((list) =>
    list.name.toLowerCase().includes(normalizedFilter)
  );

  return (
    <div
      data-testid="move-trip-dialog"
      style={{
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
        maxWidth: '420px',
        width: '90%'
      }}>
        <h3 style={{ marginBottom: 'var(--space-md)', color: 'var(--text-primary)' }}>Move Trip</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)' }} htmlFor={`move-trip-filter-${trip.id}`}>
            Filter lists
          </label>
          <input
            id={`move-trip-filter-${trip.id}`}
            className="input-field"
            type="text"
            placeholder="Search lists..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            disabled={isPending || isCreating}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
            <button
              className="btn-secondary"
              onClick={() => handleMove(null)}
              disabled={isPending || isCreating}
              style={{ textAlign: 'left' }}
            >
              All Trips
            </button>
            {filteredLists.map((list) => (
              <button
                key={list.id}
                className="btn-secondary"
                onClick={() => handleMove(list.id)}
                disabled={isPending || isCreating}
                style={{ textAlign: 'left' }}
              >
                {list.name}
              </button>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-sm)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }} htmlFor={`move-trip-new-${trip.id}`}>
              Create new list
            </label>
            <input
              id={`move-trip-new-${trip.id}`}
              className="input-field"
              type="text"
              placeholder="New list name..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              disabled={isPending || isCreating}
            />
            <button
              className="btn-primary"
              onClick={handleCreateAndMove}
              disabled={isPending || isCreating || !newListName.trim()}
              style={{ alignSelf: 'flex-end' }}
            >
              Create & Move
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end', marginTop: 'var(--space-lg)' }}>
          <button
            className="btn-secondary"
            onClick={onClose}
            disabled={isPending || isCreating}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function OverflowMenu({ trip }: { trip: Trip }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
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
    <>
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
              <Link
                to={`/${trip.id}`}
                className="trip-card-menu-item"
                onClick={() => setIsOpen(false)}
              >
                Edit
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowMoveDialog(true);
                }}
                className="trip-card-menu-item"
              >
                Move
              </button>
              <DuplicateButton trip={trip} />
              <DeleteButton id={trip.id} tripName={trip.name || 'this trip'} />
            </div>
          </div>
        )}
      </div>
      {showMoveDialog && (
        <MoveTripDialog
          trip={trip}
          onClose={() => setShowMoveDialog(false)}
        />
      )}
    </>
  );
}

export function TripSummary(props: Trip) {
  const { data: tripLists } = useTripListList();
  const tripListName = props.trip_list_id
    ? tripLists?.find((list) => list.id === props.trip_list_id)?.name || "Trip list"
    : "All Trips";

  return (
    <div style={{ display: "flex", gap: "var(--space-md)", alignItems: "stretch" }}>
      <div className="trip-card" style={{ position: 'relative', flex: 1 }}>
        <div className="trip-card-header">
          <div className="trip-card-score">{calcScore(props)}</div>
          <div className="trip-card-title">{props.name}</div>
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
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>List</span>
            <strong>{tripListName}</strong>
          </div>
        </div>
        <div className="trip-card-top-actions">
          <OverflowMenu trip={props} />
        </div>
      </div>
    </div>
  );
}
