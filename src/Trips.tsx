import { useTripList } from "./useTripList";
import { calcScore, expenseTotal } from "./util/expenseTotal";
import { Link, useSearchParams } from "react-router";
import { TripSummary } from "./TripSummary";
import { useMemo, useState } from "react";
import { Trip } from "./types/Trip";
import { useTripListList, createTripList, updateTripList, deleteTripList, generateShareToken, revokeShareToken } from "./useTripListList";
import { TripList } from "./types/TripList";

function sortFn(option: string) {
  switch (option) {
    case "name":
      return (a: Trip) => a.name;
    case "cost":
      return expenseTotal;
    case "score":
    default:
      return calcScore;
  }
}

function descending(a, b) {
  return a < b ? 1 : -1;
}

function ascending(a, b) {
  return a > b ? 1 : -1;
}
function sortDirection(option: string) {
  switch (option) {
    case "name":
      return ascending;
    case "cost":
      return ascending;
    case "score":
    default:
      return descending;
  }
}

function TripListSidebar({
  tripLists,
  selectedListId,
  onSelectList,
  trips,
}: {
  tripLists: TripList[];
  selectedListId: string | null;
  onSelectList: (listId: string | null) => void;
  trips: Trip[];
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState("");
  const { mutate: createList } = createTripList();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleCreate = () => {
    if (newListName.trim()) {
      createList(newListName, {
        onSuccess: () => {
          setNewListName("");
          setIsCreating(false);
        },
      });
    }
  };

  const getTripCount = (listId: string | null) => {
    return trips.filter((trip) => trip.trip_list_id === listId).length;
  };

  return (
    <div className="trips-sidebar">
      <div className="trips-sidebar-header">Trip Lists</div>

      <div
        onClick={() => onSelectList(null)}
        className={`trip-list-item ${selectedListId === null ? 'active' : ''}`}
      >
        <span>All Trips</span>
        <span className="text-sm">{trips.length}</span>
      </div>

      {tripLists.map((list) => (
        <TripListItem
          key={list.id}
          list={list}
          isSelected={selectedListId === list.id}
          onSelect={() => onSelectList(list.id)}
          tripCount={getTripCount(list.id)}
          isEditing={editingId === list.id}
          editingName={editingName}
          onStartEdit={() => {
            setEditingId(list.id);
            setEditingName(list.name);
          }}
          onCancelEdit={() => {
            setEditingId(null);
            setEditingName("");
          }}
          onSaveEdit={() => {
            setEditingId(null);
            setEditingName("");
          }}
          onEditNameChange={setEditingName}
        />
      ))}

      {isCreating ? (
        <div className="stack" style={{ padding: "var(--space-sm)" }}>
          <input
            className="input-field"
            type="text"
            placeholder="List name..."
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") {
                setIsCreating(false);
                setNewListName("");
              }
            }}
            autoFocus
          />
          <div className="stack row" style={{ gap: "var(--space-xs)" }}>
            <button onClick={handleCreate} className="btn-sm btn-success">
              Add
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewListName("");
              }}
              className="btn-sm btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          className="btn-sm"
          style={{ marginTop: "var(--space-md)" }}
        >
          + New List
        </button>
      )}
    </div>
  );
}

function TripListItem({
  list,
  isSelected,
  onSelect,
  tripCount,
  isEditing,
  editingName,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditNameChange,
}: {
  list: TripList;
  isSelected: boolean;
  onSelect: () => void;
  tripCount: number;
  isEditing: boolean;
  editingName: string;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (newName: string) => void;
  onEditNameChange: (name: string) => void;
}) {
  const { mutate: updateList } = updateTripList(list.id);
  const { mutate: deleteList } = deleteTripList(list.id);
  const { mutate: generateToken } = generateShareToken(list.id);
  const { mutate: revokeToken } = revokeShareToken(list.id);
  const [showActions, setShowActions] = useState(false);
  const [showShareCopied, setShowShareCopied] = useState(false);

  const handleSave = () => {
    if (editingName.trim()) {
      updateList({ name: editingName }, {
        onSuccess: () => onSaveEdit(editingName),
      });
    }
  };

  const handleDelete = () => {
    if (confirm(`Delete list "${list.name}"? Trips in this list will be moved to "All Trips".`)) {
      deleteList();
    }
  };

  const handleShare = async () => {
    if (list.share_token) {
      // Already shared - copy the link
      await copyShareLink(list.share_token);
    } else {
      // Generate new share token
      generateToken(undefined, {
        onSuccess: async (shareToken) => {
          await copyShareLink(shareToken);
        },
      });
    }
  };

  const copyShareLink = async (token: string) => {
    const url = `${window.location.origin}/trips/shared/${token}`;
    await navigator.clipboard.writeText(url).then(() => {
      setShowShareCopied(true);
      setTimeout(() => setShowShareCopied(false), 2000);
    });
  };

  const handleRevoke = () => {
    if (confirm(`Revoke share link for "${list.name}"? The current link will stop working.`)) {
      revokeToken();
    }
  };

  if (isEditing) {
    return (
      <div className="stack" style={{ padding: "var(--space-sm)" }}>
        <input
          className="input-field"
          type="text"
          value={editingName}
          onChange={(e) => onEditNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") onCancelEdit();
          }}
          autoFocus
        />
        <div className="stack row" style={{ gap: "var(--space-xs)" }}>
          <button onClick={handleSave} className="btn-sm btn-success">
            Save
          </button>
          <button onClick={onCancelEdit} className="btn-sm btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`trip-list-item ${isSelected ? 'active' : ''}`}
    >
      <div onClick={onSelect} style={{ flex: 1, display: "flex", justifyContent: "space-between" }}>
        <span>{list.name}</span>
        <span className="text-sm">{tripCount}</span>
      </div>
      <div className="trip-list-actions">
        <button
          onClick={async (e) => {
            e.stopPropagation();
            await handleShare();
          }}
          className="btn-sm btn-ghost"
          title={list.share_token ? "Copy share link" : "Share this list"}
          data-testid={`share-list-${list.id}`}
        >
          {showShareCopied ? "✓" : list.share_token ? "🔗" : "📤"}
        </button>
        {list.share_token && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRevoke();
            }}
            className="btn-sm btn-ghost"
            title="Revoke share link"
            data-testid={`revoke-share-${list.id}`}
          >
            🔒
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStartEdit();
          }}
          className="btn-sm btn-ghost"
          title="Rename"
          data-testid={`rename-list-${list.id}`}
        >
          ✏️
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="btn-sm btn-ghost"
          title="Delete"
          data-testid={`delete-list-${list.id}`}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

export function Trips() {
  const { data: trips, error, isLoading, refetch } = useTripList();
  const { data: tripLists } = useTripListList();
  const [sort, setSort] = useState<string>("score");
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("s") || "";
  const selectedListId = searchParams.get("list") || null;

  const filteredAndSortedTrips = useMemo(() => {
    // First filter by trip list
    let filtered = selectedListId
      ? trips?.filter((trip) => trip.trip_list_id === selectedListId)
      : trips;

    // Then filter by keyword
    filtered = keyword
      ? filtered?.filter((trip) =>
          trip.name?.toLowerCase().includes(keyword.toLowerCase())
        )
      : filtered;

    // Then sort
    const sortBy = sortFn(sort);
    const direction = sortDirection(sort);
    // oxlint-disable-next-line no-array-sort
    return filtered?.sort((a, b) => direction(sortBy(a), sortBy(b)));
  }, [keyword, selectedListId, sort, trips]);

  const handleKeywordChange = (value: string) => {
    setSearchParams(prev => {
      if (value) {
        prev.set("s", value);
      } else {
        prev.delete("s");
      }
      return prev;
    });
  };

  const handleListSelect = (listId: string | null) => {
    setSearchParams(prev => {
      if (listId) {
        prev.set("list", listId);
      } else {
        prev.delete("list");
      }
      return prev;
    });
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return (
      <div>
        {error.message === "TypeError: Failed to fetch" ? (
          <p style={{ color: "red" }}>Failed to fetch</p>
        ) : (
          <pre style={{ color: "red" }}>
            Error: {JSON.stringify(error, null, 2)}
          </pre>
        )}
        <button onClick={() => refetch()}>Try again</button>
      </div>
    );
  }

  return (
    <div className="trips-container">
      <TripListSidebar
        tripLists={tripLists || []}
        selectedListId={selectedListId}
        onSelectList={handleListSelect}
        trips={trips || []}
      />

      <div>
        <div className="trips-controls">
          <div className="trips-controls-row">
            <Link to="/new" style={{ textDecoration: "none" }}>
              <button className="btn-primary">+ Plan New Trip</button>
            </Link>

            <input
              className="input-field search-input"
              type="text"
              placeholder="🔍 Search by name..."
              value={keyword}
              onChange={(e) => handleKeywordChange(e.target.value)}
            />

            <select
              className="sort-dropdown"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="score">Sort by Score</option>
              <option value="name">Sort by Name</option>
              <option value="cost">Sort by Cost</option>
            </select>
          </div>
        </div>

        <div className="trips-grid">
          {filteredAndSortedTrips.map((trip) => (
            <TripSummary key={trip.id} {...trip} />
          ))}
        </div>
      </div>
    </div>
  );
}
