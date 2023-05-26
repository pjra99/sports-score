const express = require("express");
const { Match, PastMatch } = require("./models/matches.js");
require("./db/connection.js");
const app = express();

app.use(express.json());

//scripts for get reqs
app.get("/matches", async (req, res) => {
  try {
    const matches = await Match.find();
    res.json(matches);
  } catch (e) {
    res.status(500).json({ error: "Failed to retrieve matches" });
  }
});

app.get("/", async (req, res) => {
  res.send("Get to know all about the IPL matches!");
});
app.get("/matches/id/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const match = await Match.findOne({ id });
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve match details" });
  }
});

app.get("/matches/date/:date", async (req, res) => {
  const { date } = req.params;

  try {
    const matches = await Match.find({ date });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve matches" });
  }
});

app.get("/past-matches", async (req, res) => {
  try {
    const pastMatches = await PastMatch.find();
    res.json(pastMatches);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve past matches" });
  }
});

app.get("/team-performance/:team", async (req, res) => {
  const { team } = req.params;

  try {
    const wins = await PastMatch.countDocuments({ winningTeam: team });
    const losses = await PastMatch.countDocuments({
      lossingTeam: team,
    });

    res.json({ wins, losses });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve team's performance" });
  }
});

//scripts for post reqs
app.post("/matches", async (req, res) => {
  const { id, ...matchDetails } = req.body;
  const date = matchDetails.date;
  const month = parseInt(date.substr(5, 7));
  const day = parseInt(date.substr(8, 10));

  const existingMatch = await Match.findOne({ id });

  if (existingMatch)
    return res.status(400).json({ error: "Duplicate match ID." });

  if (month < new Date().getMonth() + 1) {
    return res
      .status(400)
      .json({ error: "Cannot store past matches in future matches." });
  }

  if (day < new Date().getDate()) {
    return res
      .status(400)
      .json({ error: "Cannot store past matches in future matches." });
  }
  try {
    const match = new Match({ id, ...matchDetails });
    await match.save();
    res
      .status(201)
      .json({ message: "Match details stored successfully", match });
  } catch (error) {
    res.status(500).json({ error: "Failed to store match details" });
    console.log(error);
  }
});

app.post("/past-matches", async (req, res) => {
  const somePastMatch = req.body;
  const date = somePastMatch.date;
  const month = parseInt(date.substr(5, 7));
  const day = parseInt(date.substr(8, 10));

  if (month > new Date().getMonth() + 1) {
    return res
      .status(400)
      .json({ error: "Cannot store past matches in future matches." });
  }

  if (day > new Date().getDate()) {
    return res
      .status(400)
      .json({ error: "Cannot store past matches in future matches." });
  }

  try {
    const match = await PastMatch.create(somePastMatch);
    res
      .status(201)
      .json({ message: "Match details stored successfuly", match });
  } catch (e) {
    res.status(500).json({ error: "Failed to store match details" });
    console.log(e);
  }
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
