import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["HR", "Manager", "Employee"], default: "Employee" }
}, { timestamps: true });
const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true }, email: String, department: String,
  position: String, status: { type: String, default: "Active" }
}, { timestamps: true });
const leaveSchema = new mongoose.Schema({
  employee: { type: String, required: true }, type: String, from: String, to: String,
  reason: String, status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" }
}, { timestamps: true });
const attendanceSchema = new mongoose.Schema({
  employee: String, date: { type: String, default: () => new Date().toISOString().slice(0,10) },
  checkIn: String, checkOut: String, status: { type: String, default: "Present" }
}, { timestamps: true });
const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true }, message: String, author: String
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Employee = mongoose.model("Employee", employeeSchema);
const Leave = mongoose.model("Leave", leaveSchema);
const Attendance = mongoose.model("Attendance", attendanceSchema);
const Announcement = mongoose.model("Announcement", announcementSchema);

function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace(/^Bearer\\s+/i, "");
  if (!token) return res.status(401).json({ message: "Authentication required" });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({ message: "Invalid or expired token" }); }
}
function crudRoutes(path, Model) {
  app.get(`/api/${path}`, auth, async (req,res) => {
    try { res.json(await Model.find().sort({ createdAt: -1 }).limit(200)); }
    catch { res.status(500).json({ message: "Could not load records" }); }
  });
}
app.get("/api/health", (_,res) => res.json({ status: "ok", app: "StaffSync API" }));
app.post("/api/auth/register", async (req,res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: email.toLowerCase(), password: hashed, role });
    const token = jwt.sign({ id: user._id, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { res.status(400).json({ message: e.code === 11000 ? "Email already registered" : "Registration failed" }); }
});
app.post("/api/auth/login", async (req,res) => {
  const user = await User.findOne({ email: (req.body.email || "").toLowerCase() });
  if (!user || !(await bcrypt.compare(req.body.password || "", user.password))) return res.status(401).json({ message: "Invalid email or password" });
  const token = jwt.sign({ id: user._id, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});
crudRoutes("employees", Employee);
crudRoutes("leaves", Leave);
crudRoutes("attendance", Attendance);
crudRoutes("announcements", Announcement);
app.post("/api/employees", auth, async (req,res) => { try { res.status(201).json(await Employee.create(req.body)); } catch { res.status(400).json({message:"Invalid employee data"}); } });
app.post("/api/leaves", auth, async (req,res) => { try { res.status(201).json(await Leave.create(req.body)); } catch { res.status(400).json({message:"Invalid leave request"}); } });
app.patch("/api/leaves/:id", auth, async (req,res) => { try { const item = await Leave.findByIdAndUpdate(req.params.id, {status:req.body.status}, {new:true,runValidators:true}); if(!item) return res.status(404).json({message:"Leave request not found"}); res.json(item); } catch { res.status(400).json({message:"Could not update leave"}); } });
app.post("/api/attendance", auth, async (req,res) => { try { res.status(201).json(await Attendance.create(req.body)); } catch { res.status(400).json({message:"Invalid attendance data"}); } });
app.post("/api/announcements", auth, async (req,res) => { try { res.status(201).json(await Announcement.create(req.body)); } catch { res.status(400).json({message:"Invalid announcement"}); } });

const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/staffsync")
  .then(() => app.listen(port, () => console.log(`StaffSync API running on ${port}`)))
  .catch(err => { console.error("MongoDB connection failed:", err.message); process.exit(1); });
