const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/learningApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Define Schemas
const UserSchema = new mongoose.Schema({
  userId: String,
  name: String,
  email: String,
});

const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: String, // pending, completed
  dueDate: Date,
});

const LessonSchema = new mongoose.Schema({
  title: String,
  status: String, // active, completed
  progress: Number, // 0 to 100
  dueDate: Date,
});

// Models
const User = mongoose.model('User', UserSchema);
const Task = mongoose.model('Task', TaskSchema);
const Lesson = mongoose.model('Lesson', LessonSchema);

// Routes
app.get('/users/:id', async (req, res) => {
  const user = await User.findOne({ userId: req.params.id });
  res.json(user);
});

app.get('/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

app.get('/lessons', async (req, res) => {
  const lessons = await Lesson.find();
  res.json(lessons);
});

app.post('/tasks', async (req, res) => {
  const newTask = new Task(req.body);
  await newTask.save();
  res.json({ message: 'Task created successfully' });
});

app.post('/lessons', async (req, res) => {
  const newLesson = new Lesson(req.body);
  await newLesson.save();
  res.json({ message: 'Lesson created successfully' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});