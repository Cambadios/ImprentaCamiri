import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // URL backend

export function useSocket() {
  const [mensajes, setMensajes] = useState([]);

  useEffect(() => {
    // Escuchar evento
    socket.on("mensaje", (msg) => {
      setMensajes((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("mensaje");
    };
  }, []);

  const enviarMensaje = (msg) => {
    socket.emit("mensaje", msg);
  };

  return { mensajes, enviarMensaje };
}
