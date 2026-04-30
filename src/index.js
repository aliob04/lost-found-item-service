require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

let items = [];

app.get("/", (req, res) => {
  res.json({ service: "item-service", status: "running" });
});

app.post("/items", async (req, res) => {
  const item = {
    id: items.length + 1,
    type: req.body.type,
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    location: req.body.location,
    contact: req.body.contact
  };

  items.push(item);

  await fetch(`${process.env.MATCHING_URL}/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });

  res.json({
    message: "Item reported successfully",
    item
  });
});

app.get("/items", (req, res) => {
  res.json(items);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Item service running on port ${PORT}`));

