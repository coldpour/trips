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
  isOpen,
  onClose,
}: {
  tripLists: TripList[];
  selectedListId: string | null;
  onSelectList: (listId: string | null) => void;
  trips: Trip[];
  isOpen: boolean;
  onClose: () => void;
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

  const handleSelectList = (listId: string | null) => {
    onSelectList(listId);
    onClose(); // Close sidebar on mobile after selection
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div
        onClick={() => handleSelectList(null)}
        className={`sidebar-item ${selectedListId === null ? 'active' : ''}`}
      >
        <span className="sidebar-item-text">
          All Trips
        </span>
        <span className="sidebar-item-count">
          {trips.length}
        </span>
      </div>

      <div className="sidebar-section-header">
        TRIP LISTS
      </div>

      {tripLists.map((list) => (
        <TripListItem
          key={list.id}
          list={list}
          isSelected={selectedListId === list.id}
          onSelect={() => handleSelectList(list.id)}
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
        <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
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
            style={{ fontSize: "14px", padding: "4px 8px" }}
          />
          <div style={{ display: "flex", gap: "4px" }}>
            <button onClick={handleCreate} style={{ fontSize: "12px", padding: "4px 8px" }}>
              Add
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewListName("");
              }}
              style={{ fontSize: "12px", padding: "4px 8px" }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          style={{
            fontSize: "12px",
            padding: "8px",
            margin: "4px 0",
          }}
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
      <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
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
          style={{ fontSize: "14px", padding: "4px 8px" }}
        />
        <div style={{ display: "flex", gap: "4px" }}>
          <button onClick={handleSave} style={{ fontSize: "12px", padding: "4px 8px" }}>
            Save
          </button>
          <button onClick={onCancelEdit} style={{ fontSize: "12px", padding: "4px 8px" }}>
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
      style={{
        padding: "8px",
        cursor: "pointer",
        backgroundColor: isSelected ? "var(--card-bg)" : "transparent",
        borderRadius: "4px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
      }}
    >
      <div onClick={onSelect} style={{ flex: 1, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontWeight: isSelected ? "bold" : "normal" }}>
          {list.name}
        </span>
        <span className="sm" style={{ opacity: 0.7 }}>
          {tripCount}
        </span>
      </div>
      <div style={{ display: "flex", gap: "4px", marginLeft: "8px", opacity: showActions ? 1 : 0, visibility: showActions ? "visible" : "hidden" }}>
        <button
          onClick={async (e) => {
            e.stopPropagation();
            await handleShare();
          }}
          style={{ fontSize: "10px", padding: "2px 6px", position: "relative" }}
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
            style={{ fontSize: "10px", padding: "2px 6px" }}
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
          style={{ fontSize: "10px", padding: "2px 6px" }}
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
          style={{ fontSize: "10px", padding: "2px 6px" }}
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    <>
      {/* Backdrop for mobile */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div style={{ display: "flex", gap: "16px" }}>
        <TripListSidebar
          tripLists={tripLists || []}
          selectedListId={selectedListId}
          onSelectList={handleListSelect}
          trips={trips || []}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexDirection: "column",
            paddingTop: "8px",
            flex: 1,
          }}
        >
          <div className="stack row">
            {/* Hamburger button for mobile */}
            <button
              className="hamburger-button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>

            <Link to="/new" style={{ color: "inherit" }}>
              <button>Plan</button>
            </Link>

            <label className="stack sm">
              Filter
              <input
                className="input-field"
                type="text"
                placeholder="Search by name..."
                value={keyword}
                onChange={(e) => handleKeywordChange(e.target.value)}
              />
            </label>

            <label className="stack sm">
              Sort
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="score">Score</option>
                <option value="name">Name</option>
                <option value="cost">Cost</option>
              </select>
            </label>
          </div>
          {filteredAndSortedTrips.map((trip) => (
            <TripSummary key={trip.id} {...trip} />
          ))}
        </div>
      </div>
    </>
  );
}
