import express from "express";
import cors from "cors";
const PORT = 5000;
const users = {};
const tweets = [];

const server = express();
server.use(cors());
server.use(express.json());
server.disable("x-powered-by");

server.get("/users", (req, res) => {
  res.send(Object.values(users));
})

server.post("/sign-up", (req, res) => {
  const newUser = req.body;
  if (!isValidUser(newUser)) {
    return res.sendStatus(400);
  }

  if (users[newUser.username]) {
    return res.status(422).send("Username already in use");
  }

  users[newUser.username] = {
    username: newUser.username,
    avatar: newUser.avatar,
    tweets: []
  };

  res.status(201).send("OK");
});

server.post("/tweets", (req, res) => {
  const { tweet } = req.body;
  const { user } = req.headers;

  if (!isValidTweet(tweet, user)) {
    return res.status(400);
  }

  if (!users[user]) {
    return res.status(401).send("UNAUTHORIZED");
  }

  tweets.push({
    tweet,
    username: user
  });

  res.status(201).send("OK");
});

server.get("/tweets", (req, res) => {
  const [page, per, valid] = validatePages(req.query.page, req.query.per);

  if (!valid) {
    return res.sendStatus(400);
  }

  res.send(tweetSerializer(tweets.slice(per * (page - 1), per * page)));
});

server.get("/tweets/:username", (req, res) => {
  const { username } = req.params;

  if (!isValidUser({ username, avatar: "placeholder" })) {
    return res.sendStatus(400);
  }

  if (!users[username]) {
    return res.sendStatus(404);
  }

  res.send(tweetSerializer(tweets.filter(tweet => tweet.username === username)));
});

function isValidUser(user) {
  const validatePresence = Boolean(user && user.username && user.avatar);
  if (!validatePresence) {
    return false;
  }
  const validateType = Boolean((typeof user.username === "string") && (typeof user.avatar === "string"));
  return validateType;
}

function isValidTweet(tweet, user) {
  return Boolean((tweet && (typeof tweet === "string")) && (user && (typeof user === "string")));
}

function validatePages(page, per) {
  let valid = true;
  page = page === undefined ? 1 : Number(page);
  per = per === undefined ? 10 : Number(per);

  if (isNaN(page) || page < 1) {
    valid = false;
  }

  if (isNaN(per) || per < 1) {
    valid = false;
  }

  return [page, per, valid];
}

function tweetSerializer(tweets) {
  if (Array.isArray(tweets)) {
    for (let i = 0; i < tweets.length; i++) {
      tweets[i].avatar = users[tweets[i].username].avatar;
    }
  } else {
    tweets.avatar = users[tweets.username].avatar;
  }
  return tweets;
}

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
