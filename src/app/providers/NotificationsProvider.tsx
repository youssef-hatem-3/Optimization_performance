import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";
import { getNotifications } from "../../lib/api";
import type { Notification } from "../../types/models";

type NotificationsContextValue = {
  notifications: Notification[];
  isLoading: boolean;
  markRead: (id: number) => void;
  markAllRead: () => void;
};
const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function NotificationsProvider({ children }: PropsWithChildren) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });
  const [changedNotifications, setChangedNotifications] = useState<
    Notification[] | null
  >(null);
  const notifications = changedNotifications ?? data;
  // PERFORMANCE PRACTICE: This state is deliberately high in the app tree. Context updates can re-render consumers.
  const markRead = (id: number) =>
    setChangedNotifications(
      notifications.map((item) =>
        item.id === id ? { ...item, read: true } : item,
      ),
    );
  const markAllRead = () =>
    setChangedNotifications(
      notifications.map((item) => ({ ...item, read: true })),
    );
  return (
    <NotificationsContext.Provider
      value={{ notifications, isLoading, markRead, markAllRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const value = useContext(NotificationsContext);
  if (!value)
    throw new Error(
      "useNotifications must be used inside NotificationsProvider",
    );
  return value;
}
