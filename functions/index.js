/* eslint-disable */
const functions = require("firebase-functions");

const express = require("express");
const cors = require("cors");

const app = express();

const admin = require("firebase-admin");
const credentials = require("./key.json");

admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = admin.firestore();

// GET TASKS
app.get("/tasks", async (req, res) => {
  const snapshot = await db.collection("tasks").get();

  let tasks = [];
  snapshot.forEach((doc) => {
    let id = doc.id;
    let data = doc.data();
    tasks.push({ id, ...data });
  });

  res.status(200).send(tasks);
});

// ADD TASK
app.post("/add-task", async (req, res) => {
  const response = await db.collection("tasks").add(req.body);
  res.status(201).send(response);
});

// UPDATE TASK
app.put("/tasks/:title", async (req, res) => {
  const body = req.body;
  const snapshot = await db
    .collection("tasks")
    .where("title", "==", req.params.title)
    .get();

  let id = 0;

  snapshot.forEach((doc) => {
    id = doc.id;
  });

  const task = await db.collection("tasks").doc(id).update(body);

  res.status(200).send(task);
});

exports.kanban = functions.https.onRequest(app);
