const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const auth = require("./middleware/auth");
const Customer = require("./models/customer.model");
const Technician = require("./models/technicians.model");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");

// ===== Create HTTP server and attach Socket.IO =====
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "https://techlink-website.vercel.app",
      "https://developer.safaricom.co.ke",
      "https://biz-link-admin.vercel.app",
      "http://localhost:3000", // local dev
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// ===== Map to track technician socket connections =====
const technicianSockets = new Map();

// ===== Socket.IO connection handling =====
io.on("connection", (socket) => {
  console.log("Technician connected:", socket.id);

  // Technician registers their ID after connecting
  socket.on("register", (technicianId) => {
    technicianSockets.set(technicianId, socket.id);
    console.log(
      `✅ Technician ${technicianId} registered with socket ${socket.id}`
    );
  });

  // Optional chat handler
  socket.on("send_message", (data) => {
    console.log("📨 Message received:", data);
    io.emit("receive_message", data);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    for (const [techId, sockId] of technicianSockets.entries()) {
      if (sockId === socket.id) {
        technicianSockets.delete(techId);
        console.log(`❌ Technician ${techId} disconnected`);
        break;
      }
    }
  });
});

// Make io and technicianSockets accessible to all controllers
app.set("io", io);
app.set("technicianSockets", technicianSockets);

// ===== Middleware =====
app.use(
  cors({
    origin: [
      "https://techlink-website.vercel.app",
      "https://developer.safaricom.co.ke",
      "https://biz-link-admin.vercel.app",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// ===== MongoDB Connection =====
const uri =
  "mongodb+srv://wotiajoshua:joshuawema@cluster0.quv4pzg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

async function run() {
  try {
    await mongoose.connect(uri, clientOptions);
    console.log("✅ Connected to MongoDB Atlas successfully.");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}
run();

// ===== AUTH: LOGIN =====
app.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  let UserModel;
  if (role === "customer") UserModel = require("./models/customer.model");
  else if (role === "technician")
    UserModel = require("./models/technicians.model");
  else return res.status(400).json({ message: "Invalid role" });

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: user._id, role }, "joshujoshu", {
      expiresIn: "1d",
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.json({ token, user: userObj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== PROFILE SECTION =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

app.get("/profile", auth, async (req, res) => {
  const { id, role } = req.user;
  const Model = role === "customer" ? Customer : Technician;

  try {
    const user = await Model.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post(
  "/profile/update",
  auth,
  upload.single("profilePicture"),
  async (req, res) => {
    const { id, role } = req.user;
    const Model = role === "customer" ? Customer : Technician;

    try {
      const updates = JSON.parse(req.body.profileData);
      if (req.file) {
        updates.profilePicture = `http://localhost:3000/uploads/${req.file.filename}`;
      }

      const updatedUser = await Model.findByIdAndUpdate(id, updates, {
        new: true,
      }).select("-password");
      res.json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update profile" });
    }
  }
);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// ===== ROUTES =====

// Admin routes
const adminControllers = require("./controllers/admin.controller.js");
app.post("/adminSignUp", adminControllers.createAdmin);
app.post("/adminLogin", adminControllers.loginAdmin);

// Customer routes
const customerControllers = require("./controllers/customer.controller");
app.post("/customerSignUp", customerControllers.createCustomer);
app.get("/getCustomers", customerControllers.getCustomers);
app.get("/getCustomer/:name", customerControllers.getCustomer);
app.put("/updateCustomer/:name", customerControllers.updateCustomer);
app.delete("/deleteCustomer/:id", customerControllers.deleteCustomer);

// Request routes
const requestControllers = require("./controllers/request.controllers");
app.post("/api/request-service", auth, requestControllers.createRequest);
app.get("/api/my-requests", auth, requestControllers.getRequestsByUser);
app.get("/api/requests", auth, requestControllers.getRequests);

// Technician routes
const technicianController = require("./controllers/technicians.controllers");
app.post("/technicianSignUp", technicianController.createTechnician);
app.get("/getTechnicians", technicianController.getTechnicians);
app.get("/getTechnician/:name", technicianController.getTechnician);
app.put("/updateTechnicians/:name", technicianController.updateTechnician);
app.delete("/deleteTechnician/:id", technicianController.deleteTechnician);
app.get("/api/technicians/:id", technicianController.getTechnicianByID);


// Job routes
const jobControllers = require("./controllers/jobs.controllers");
app.post("/createJob", auth, jobControllers.createJob);
app.get("/api/getJob/:id", auth, jobControllers.getJob);
app.get("/api/getAllJobs", auth, jobControllers.getAllJobs);
app.get("/api/jobs/technician/:id", auth, jobControllers.getJobsByTechnician);

const paymentController = require("./controllers/payments.controllers.js");

app.post("/api/payments/initiate", paymentController.initiatePayment);
app.post("/api/payments/callback", paymentController.handleCallback);
app.post("/api/payments/payout", paymentController.sendPayout);


// Service routes
const serviceControllers = require("./controllers/service.controller.js");
app.post("/api/service", serviceControllers.createService);
app.get("/api/getServices", serviceControllers.getServices);

// Announcement routes
const announcementControllers = require("./controllers/announcement.controllers.js");
app.post("/api/createAnnouncement", announcementControllers.createAnnouncement);
app.get("/api/getAnnouncements", announcementControllers.getAnnouncements);
app.put(
  "/api/updateAnnouncement/:id",
  announcementControllers.updateAnnouncement
);
app.delete(
  "/api/deleteAnnouncement/:id",
  announcementControllers.deleteAnnouncement
);

// Feedback routes
const feedbackControllers = require("./controllers/feedback.controller.js");
app.post("/api/feedback", feedbackControllers.createFeedback);
app.get("/api/feedbacks", feedbackControllers.getFeedbacks);

//const detailsControllers = require("./controllers/details.controller.js");
//app.post("/api/details", auth, detailsControllers.createDetail);
//app.get("/api/my-details", auth, detailsControllers.getMyDetails);
//app.get("/api/details/:id", auth, detailsControllers.getDetailById);
//app.put("/api/details/:id", auth, detailsControllers.updateDetail);
//app.delete("/api/details/:id", auth, detailsControllers.deleteDetail);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
