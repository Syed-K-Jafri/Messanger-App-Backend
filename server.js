// importing express

import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
import Pusher from "pusher";
import cors from "cors";

// app config

const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "564896",
  key: "56846418848984",
  secret: "48484848984605iji5",
  cluster: "us2",
  useTLS: true,
});

// middleware

app.use(express.json());
app.use(cors());

// DB config - this connects to database

const connection_url = `mongodb+srv://admin:856fs6526sddew88@cluster0.hmc1p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once("open", () => {
  console.log("DB connected");

  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    console.log("A changed occured", change);

    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.user,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      });
    } else {
      console.log("Error triggering Pusher");
    }
  });
});

// ?????

// api routes - used to post messages into mongodb

app.get("/", (req, res) => res.status(200).send("hello world"));

app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

// To post messages
app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

// listen

app.listen(port, () => console.log(`Listening on localhost:${port}`));
