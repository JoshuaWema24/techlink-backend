const socketIo = require("socket.io");
const http = require("http");

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all or specify your frontend origin
    methods: ["GET", "POST", "DELETE", "PUT"]
  }
});
io.on("connection", (socket) => {
  console.log("Technician connected:", socket.id);

  // Technician registers their ID
  socket.on("register", (technicianId) => {
    technicians[technicianId] = socket.id;
    console.log(`Technician ${technicianId} registered with socket ${socket.id}`);
  });

    socket.on("disconnect", () => {
    for (const [id, sockId] of Object.entries(technicians)) {
      if (sockId === socket.id) {
        delete technicians[id];
        console.log(`Technician ${id} disconnected`);
      }
    }
  });
});

const notifyTechnician = (technicianId, jobData) => {
  const socketId = technicians[technicianId];
  if (socketId) {
    io.to(socketId).emit("new-job", jobData);
    console.log(`Sent job to technician ${technicianId}`);
  } else {
    console.log(`Technician ${technicianId} is not connected`);
  }
};
  module.exports = { server, notifyTechnician };