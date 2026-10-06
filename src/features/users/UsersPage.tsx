import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getUsers } from "../../lib/api";
import type { Status, User } from "../../types/models";

function UserRow({
  user,
  selectedId,
  onSelect,
}: {
  user: User;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <button
      className={`user-row ${selectedId === user.id ? "selected" : ""}`}
      onClick={() => onSelect(user.id)}
    >
      <span>
        <strong>{user.name}</strong>
        <small>{user.email}</small>
      </span>
      <span>{user.age}</span>
      <span className={`badge ${user.status}`}>{user.status}</span>
      <span>{user.country}</span>
    </button>
  );
}

export function UsersPage() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | Status>("all");
  const [sortBy, setSortBy] = useState<"name" | "age">("name");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // PERFORMANCE PRACTICE: filtering, sorting, inline callbacks, and 5,000 rows all happen again on each render.
  const visibleUsers = users
    .filter(
      (user) =>
        `${user.name} ${user.email} ${user.country}`
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (status === "all" || user.status === status),
    )
    .sort((a, b) =>
      sortBy === "name" ? a.name.localeCompare(b.name) : a.age - b.age,
    );
  if (isLoading) return <p>Loading users…</p>;
  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Large list</p>
          <h2>
            Users <span>{visibleUsers.length.toLocaleString()}</span>
          </h2>
          <p>Normal DOM list—virtualization is intentionally not enabled.</p>
        </div>
      </header>
      <div className="toolbar">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, email, country…"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as "all" | Status)}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as "name" | "age")}
        >
          <option value="name">Sort by name</option>
          <option value="age">Sort by age</option>
        </select>
      </div>
      <div className="user-list">
        <div className="user-row row-head">
          <span>User</span>
          <span>Age</span>
          <span>Status</span>
          <span>Country</span>
        </div>
        {visibleUsers.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        ))}
      </div>
    </>
  );
}
