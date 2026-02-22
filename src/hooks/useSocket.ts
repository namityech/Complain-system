import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const useSocket = (onEvent?: (event: string, data: any) => void) => {
  useEffect(() => {
    if (!socket) {
      socket = io();
    }

    const handleNewComplaint = (data: any) => onEvent?.("new-complaint", data);
    const handleStatusChange = (data: any) => onEvent?.("status-change", data);

    socket.on("new-complaint", handleNewComplaint);
    socket.on("status-change", handleStatusChange);

    return () => {
      socket?.off("new-complaint", handleNewComplaint);
      socket?.off("status-change", handleStatusChange);
    };
  }, [onEvent]);

  return socket;
};
