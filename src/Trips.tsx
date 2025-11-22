import { useTripList } from "./useTripList";
import { calcScore, expenseTotal } from "./util/expenseTotal";
import { Link, useSearchParams } from "react-router";
import { TripSummary } from "./TripSummary";
import { useMemo, useState } from "react";
import { Trip } from "./types/Trip";
import { useTripListList, createTripList, updateTripList, deleteTripList } from "./useTripListList";
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
    <div
      style={{
        width: "200px",
        borderRight: "1px solid var(--input-border)",
        paddingTop: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      <div
        onClick={() => onSelectList(null)}
        style={{
          padding: "8px",
          cursor: "pointer",
          backgroundColor: selectedListId === null ? "var(--card-bg)" : "transparent",
          borderRadius: "4px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: selectedListId === null ? "bold" : "normal" }}>
          All Trips
        </span>
        <span className="sm" style={{ opacity: 0.7 }}>
          {trips.length}
        </span>
      </div>

      <div style={{ marginTop: "8px", marginBottom: "4px", fontSize: "12px", opacity: 0.7, padding: "0 8px" }}>
        TRIP LISTS
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
  const [showActions, setShowActions] = useState(false);

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
      {showActions && (
        <div style={{ display: "flex", gap: "4px", marginLeft: "8px" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit();
            }}
            style={{ fontSize: "10px", padding: "2px 6px" }}
            title="Rename"
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
          >
            🗑️
          </button>
        </div>
      )}
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
    <div style={{ display: "flex", gap: "16px" }}>
      <TripListSidebar
        tripLists={tripLists || []}
        selectedListId={selectedListId}
        onSelectList={handleListSelect}
        trips={trips || []}
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
  );
}
