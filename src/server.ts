// Import the 'express' module
import express from "express";

// Create an Express application
const app = express();
app.use(express.json());

// Set the port number for the server
const port = 3000;

type Event = {
  id: number;
  name: string;
  date: string;
  organiser: string;
  capacity: number;
};

type Participant = {
  id: number;
  name: string;
  surname: string;
};

let events: Event[] = [];
let participants: Participant[] = [];
let eventToParticipants: Map<number, Set<Participant>> = new Map();
let participantToEvents: Map<number, Set<Event>> = new Map();

// add new event
app.post("/events", (req, res) => {
  const { name, date, organiser, capacity } = req.body;
  if (!name || !date || !organiser || !capacity) {
    return res.status(400).send("Missing title or author");
  }

  const newEvent = { id: getRandomInt(), name, date, organiser, capacity };
  events.push(newEvent);
  eventToParticipants.set(newEvent.id, new Set());

  res.status(201).send(newEvent);
});

// get all events
app.get("/events", (req, res) => {
  // Send a response to the client
  res.json(events);
});

// get a single events
app.get("/events/:id", (req, res) => {
  const event = events.find((it) => it.id === parseInt(req.params.id));
  if (!event) {
    return res.status(404).send("Event not found");
  }
  const _participants = eventToParticipants.get(event.id);
  res.json({ event, participants: [..._participants!] });
});

// update a event
app.put("/events/:id", (req, res) => {
  // Logic to update a event
});

// delete a event
app.delete("/events/:id", (req, res) => {
  const eventId = events.findIndex((it) => it.id === parseInt(req.params.id));
  if (eventId === -1) {
    return res.status(404).send("Event not found");
  }

  events.splice(eventId, 1);
  res.status(204).send();
});

// registry to event
app.post("/events/registry", (req, res) => {
  const { eventId, name, surname } = req.body;

  const event = events.find((it) => it.id === eventId);
  if (!event) {
    return res.status(404).send("Event not found");
  }
  const _participants = eventToParticipants.get(eventId)!;
  if (_participants.size === event.capacity) {
    return res.status(200).send("Sorry we are sold out for requested event!");
  }

  let participant = participants.find((it) => it.name === name && it.surname);
  if (!participant) {
    participant = { id: getRandomInt(), name, surname };
    participants.push(participant);
    participantToEvents.set(participant.id, new Set([event]));
  } else {
    let userEvents = participantToEvents.get(participant.id)!;
    userEvents.add(event);
  }
  _participants.add(participant);

  // Send a response to the client
  const msg = `Successfully registered for the event - ${event.name} - your ID is ${participant.id}`
  console.log(msg)
  res.status(200).send(msg);
});

// get my list events
app.get("/events/registry/:id", (req, res) => {
  console.log(participantToEvents);
  const userEvents = participantToEvents.get(parseInt(req.params.id));
  if (userEvents === undefined) {
    return res.status(404).send("Events not found");
  }

  res.json({ events: [...userEvents!] });
});

// Start the server and listen on the specified port
app.listen(port, () => {
  // Log a message when the server is successfully running
  console.log(`Server is running on http://localhost:${port}`);
});

// Define a route for the root path ('/')
app.get("/", (req, res) => {
  // Send a response to the client
  res.send("Hello, TypeScript + Node.js + Express!");
});

// just for PoC should be replace to uuid
function getRandomInt() {
  return Math.floor(Math.random() * 100);
}
