import express from 'express';
import {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket
} from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'ticket API is running' });
});

app.get('/api/tickets', (req, res) => {
  const tickets = getAllTickets();
  res.json(tickets);
});

app.get('/api/tickets/:id', (req, res) => {
  const ticket = getTicketById(req.params.id);

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  res.json(ticket);
});

app.post('/api/tickets', (req, res) => {
  const { title, description, priority, requester_email } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      error: 'Title and description are required'
    });
  }

  const ticket = createTicket({
    title,
    description,
    priority: priority || 'medium',
    requester_email: requester_email || null
  });

  res.status(201).json(ticket);
});

app.patch('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  const existing = getTicketById(id);

  if (!existing) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const updated = updateTicket(id, req.body);
  res.json(updated);
});

app.delete('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  const deleted = deleteTicket(id);

  if (!deleted) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  res.json({ message: 'Ticket deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`Ticket API running on http://localhost:${PORT}`);
});
