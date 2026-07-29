import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * Live online-presence set. Returns a Set of user ids (strings) that currently
 * have at least one open socket. Seeds itself via `presence:get` on mount /
 * reconnect and stays fresh through `presence:update` events.
 */
export default function usePresence() {
  const { socket, socketConnected } = useAuth();
  const [online, setOnline] = useState(() => new Set());

  useEffect(() => {
    if (!socket) return undefined;
    const onList = (ids) => setOnline(new Set((ids || []).map(String)));
    const onUpdate = ({ userId, online: on }) =>
      setOnline((prev) => {
        const next = new Set(prev);
        if (on) next.add(String(userId));
        else next.delete(String(userId));
        return next;
      });

    socket.on("presence:list", onList);
    socket.on("presence:update", onUpdate);
    if (socketConnected) socket.emit("presence:get");

    return () => {
      socket.off("presence:list", onList);
      socket.off("presence:update", onUpdate);
    };
  }, [socket, socketConnected]);

  return online;
}
