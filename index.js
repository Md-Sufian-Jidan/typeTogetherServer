import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

import { Connection } from "./database/db.js";
import { getDocument, updateDocument } from "./controller/docController.js";
import Document from "./schema/docSchema.js";

const app = express();
const port = process.env.PORT || 7000;

Connection();

// middlewares
app.use(cors({
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// getting user's documents
app.get("/documents", async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
        const myDocs = await Document.find({ email }).sort({ updatedAt: -1 });
        res.json(myDocs);
    } catch (error) {
        console.error("Error fetching user documents:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.delete("/documents/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await Document.findByIdAndDelete(id);
        return res.status(200).json({ message: "Document deleted successfully" });
    } catch (error) {
        console.error("Error deleting document:", error);
        return res.status(500).json({ error: "Server error" });
    }
});

const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173'],
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// WebSocket events
io.on("connection", socket => {
    console.log("New client connected");

    socket.on("get-document", async ({ documentId, user }) => {
        if (!documentId || !user) return;

        const document = await getDocument(documentId, user);
        socket.join(documentId);
        socket.emit("load-document", document.data);

        // Clean old listeners
        socket.removeAllListeners("send-changes");
        socket.removeAllListeners("save-document");

        // Broadcast changes
        socket.on("send-changes", delta => {
            socket.broadcast.to(documentId).emit("receive-changes", delta);
        });

        // Save content
        socket.on("save-document", async ({ content, user }) => {
            try {
                console.log(user);
                await updateDocument(documentId, content, user);
                console.log(`Document updated by ${user?.name} (${user?.email})`);
            } catch (error) {
                console.error("Error saving document:", error);
            }
        });
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

// Start server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
