import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";
import { NextApiRequest, NextApiResponse } from "next";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: ServerIO;
    };
  };
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  try {
    if (res.socket.server.io) {
      console.log("Socket is already running");
    } else {
      console.log("Socket is initializing");
      const io = new ServerIO(res.socket.server, {
        path: "/api/socketio",
        cors: {
          origin: process.env.NODE_ENV === 'production' 
            ? process.env.NEXTAUTH_URL 
            : "http://localhost:3000",
          methods: ["GET", "POST"]
        }
      });
      res.socket.server.io = io;
      
      // Import and setup socket handlers
      import('@/lib/socket').then(({ setupSocket }) => {
        setupSocket(io);
      }).catch(error => {
        console.error("Failed to setup socket handlers:", error);
      });
    }
    res.end();
  } catch (error) {
    console.error("Socket handler error:", error);
    res.status(500).end("Socket initialization failed");
  }
};

export default SocketHandler;