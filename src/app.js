import express from "express";
import cors from "cors";
const PORT = 5000;
const users = [];
const tweets = [];

const server = express();
server.use(cors());
server.use(express.json());

server.post("/sign-up", (req, res) => {
  const newUser = req.body;
  if (!isValidUser(newUser))  {
    return res.sendStatus(400);
  }

  if (users.find(user => user.username === newUser.username)) {
    return res.status(422).send("Username already in use");
  }

  users.push({
    username: newUser.username,
    avatar: newUser.avatar
  });

  res.status(201).send("OK");
});

server.post("/tweets", (req, res) => {
  const newTweet = req.body;
  if (!isValidTweet(newTweet)) {
    return res.status(400);
  }

  const userIndex = users.findIndex(user => user.username === newTweet.username)
  if (userIndex === -1) {
    return res.status(401).send("UNAUTHORIZED");
  }

  tweets.push({
    tweet: newTweet.tweet,
    username: newTweet.username
  });
  users[userIndex].push(newTweet.tweet);

  res.status(201).send("OK");
});

server.get("/tweets", (req, res) => {
  res.send(tweets.slice(0, 10));
});

function isValidUser(user) {
  const validatePresence = Boolean(user && user.username && user.avatar);
  if (!validatePresence) {
    return false;
  }
  const validateType = Boolean((typeof user.username === "string") && (typeof user.avatar === "string"));
  return validateType;
}

function isValidTweet(tweet) {
  const validatePresence = Boolean(tweet && tweet.tweet && tweet.username);
  if (!validatePresence) {
    return false;
  }
  const validateType = Boolean((typeof tweet.tweet === "string") || (typeof tweet.username));
  return validateType;
}
