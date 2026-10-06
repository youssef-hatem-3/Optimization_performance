import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getOrders, getProducts, getUsers } from "../../lib/api";
import { useNotifications } from "../../app/providers/NotificationsProvider";

type SummaryCardProps = {
  label: string;
  value: number;
  hint: string;
  accent: string;
};
function SummaryCard({ label, value, hint, accent }: SummaryCardProps) {
  return (
    <article className="summary-card">
      <span className={`dot ${accent}`} />
      <p>{label}</p>
      <strong>{value.toLocaleString()}</strong>
      <small>{hint}</small>
    </article>
  );
}
function NoisyStats({
  totalUsers,
  totalOrders,
  refreshes,
}: {
  totalUsers: number;
  totalOrders: number;
  refreshes: number;
}) {
  return (
    <section className="panel">
      <h2>Live practice statistics</h2>
      <p>
        {totalOrders
          ? Math.round((totalOrders / Math.max(totalUsers, 1)) * 100)
          : 0}
        % order-to-user ratio · parent refreshed {refreshes} times
      </p>
    </section>
  );
}

export function DashboardPage() {
  const [refreshes, setRefreshes] = useState(0);
  const users = useQuery({ queryKey: ["users"], queryFn: getUsers });
  const products = useQuery({ queryKey: ["products"], queryFn: getProducts });
  const orders = useQuery({ queryKey: ["orders"], queryFn: getOrders });
  const { notifications } = useNotifications();
  // PERFORMANCE PRACTICE: This intentionally expensive calculation runs during every parent render.
  const score = (users.data ?? []).reduce(
    (total, user) =>
      total +
      Array.from({ length: 30 }, (_, i) => (user.age * (i + 1)) % 17).reduce(
        (a, b) => a + b,
        0,
      ),
    0,
  );
  const loading = users.isLoading || products.isLoading || orders.isLoading;
  if (loading) return <p>Loading dashboard data…</p>;
  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Dashboard</h2>
          <p>Deliberately unoptimized baseline for profiling React.</p>
        </div>
        <button onClick={() => setRefreshes(refreshes + 1)}>
          Refresh parent ({refreshes})
        </button>
      </header>
      <section className="summary-grid">
        <SummaryCard
          label="Total users"
          value={users.data!.length}
          hint="External API"
          accent="blue"
        />
        <SummaryCard
          label="Total products"
          value={products.data!.length}
          hint="Inventory catalog"
          accent="purple"
        />
        <SummaryCard
          label="Total orders"
          value={orders.data!.length}
          hint="Table dataset"
          accent="orange"
        />
        <SummaryCard
          label="Notifications"
          value={notifications.length}
          hint="Global context state"
          accent="green"
        />
      </section>
      <section className="two-column">
        <NoisyStats
          totalUsers={users.data!.length}
          totalOrders={orders.data!.length}
          refreshes={refreshes}
        />
        <section className="panel">
          <h2>Render calculation</h2>
          <strong className="large-number">{score.toLocaleString()}</strong>
          <p>
            Computed directly in render. Try the Profiler, then improve it
            later.
          </p>
        </section>
      </section>
    </>
  );
}
