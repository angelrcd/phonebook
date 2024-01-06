import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import Phonebook from './models/phonebook.js';

morgan.token('reqbody', (req, res) => {
  if(req.method === 'POST'){
    return JSON.stringify(req.body);
  }
});

const app = express();
app.use(cors());
app.use(express.static('dist'));
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :reqbody'));

// INFO
app.get('/info', (req, res, next) => {
  Phonebook.countDocuments({})
    .then(count => {
      const html = `
        <p>Phonebook has info for ${count} people</p>
        <p>${new Date()}</p>
      `;
      res.send(html);
    })
    .catch(err => next(err));
});

// GET all persons
app.get('/api/persons', (req, res) => {
  Phonebook.find({}).then(persons => {
    res.json(persons);
  });
});

// GET single person
app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;

  Phonebook.findById(id)
    .then(person => {
      if (!person)
        return res.status(404).end();

      res.json(person);
    })
    .catch(err => next(err));
});

// POST new person
app.post('/api/persons', (req, res, next) => {
  const newPerson = req.body;
  newPerson.id = Math.floor(Math.random() * Number.MAX_VALUE);

  // const isNameRepeated = persons.find(x => x.name === newPerson?.name)

  if(!newPerson.name)
    return res.status(400).json({ error: 'no name' });

  if(!newPerson.number)
    return res.status(400).json({ error: 'no number' });

  // if(isNameRepeated)
  // return res.status(400).json({error: "name must be unique"})

  // persons.push(newPerson);
  new Phonebook(newPerson).save()
    .then(saved => res.status(201).json(saved))
    .catch(err => next(err));
  // res.status(201).json(newPerson)
});

// PUT update number
app.put('/api/persons/:id', (req, res, next) => {
  const newInfo = req.body;
  const id = req.params.id;

  Phonebook.findByIdAndUpdate(id, newInfo, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => res.json(updatedPerson))
    .catch(err => next(err));
});

// DELETE single entry
app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;
  // persons = persons.filter(person => person.id !== id);
  Phonebook.findByIdAndDelete(id)
    .then(result => res.status(204).end())
    .catch(err => next(err));

  res.status(204).end();
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(unknownEndpoint);
// this has to be the last loaded middleware.
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log('Listening on port', process.env.PORT);
});