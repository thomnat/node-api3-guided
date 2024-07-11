const express = require('express');
const { checkHubId, checkNewHub } = require('./hubs-middleware');


const Hubs = require('./hubs-model.js');
const Messages = require('../messages/messages-model.js');

const router = express.Router();

router.get('/', (req, res, next) => {
  Hubs.find(req.query)
    .then(hubs => {
      res.status(200).json(hubs);
    })
    .catch(next); //what does catch expect as its argument?? a callback that can take an error object as its first argument and that is exactly what next is
});

router.get('/:id', checkHubId, (req, res, next) => { //include the imported middleware in this line. so the id check is going to be performed before the req object falls into the endpoint aka the rest of this code. if the req.params.id is not legit/not found, the rest of this code will not run.
  // Hubs.findById(req.params.id)
    // .then(hub => {
    //   if (hub) {
    //     res.status(200).json(hub);
    //   } else {
    //     res.status(404).json({ message: 'Hub not found' });
    //   }
    // })
    // .catch(next);
    res.json(req.hub); //if things go correctly with the checkHubId middleware and the hub is found, the hub will be existing inside the req object
});

router.post('/', checkNewHub, (req, res, next) => {
  Hubs.add(req.body)
    .then(hub => {
      res.status(201).json(hub);
    })
    .catch(next);
});

router.delete('/:id', checkHubId, (req, res, next) => {
  Hubs.remove(req.params.id)
    .then(() => {
      res.status(200).json({ message: 'The hub has been nuked' });
    })
    .catch(next);
});

router.put('/:id', [checkHubId, checkNewHub], (req, res, next) => { //so for this we can check if the id is legit and then also check that the payload of the request is legit so we can use both of those middlewares in this endpoint. can also send a pipeline of middleware, so we can group a bunch of middlewares into arrays 
  Hubs.update(req.params.id, req.body)
    .then(hub => {
      res.status(200).json(hub);
    })
    .catch(next);
});

router.get('/:id/messages', checkHubId, (req, res, next) => {
  Hubs.findHubMessages(req.params.id)
    .then(messages => {
      res.status(200).json(messages);
    })
    .catch(next);
});

router.post('/:id/messages', checkHubId, (req, res, next) => {//since endpoints are basically middleware, they also can take the next argument. next() without arguments makes the req object keep going and over to the next middlware in the pipeline, next WITH an argument like next(error) triggers the error handling middleware.
  const messageInfo = { ...req.body, hub_id: req.params.id };

  Messages.add(messageInfo)
    .then(message => {
      res.status(210).json(message);
    })
    .catch(next);
});

router.use((error, req, res, next) => { //eslint-disable-line
  res.status(error.status || 500).json({
    message: error.message,
    customMessage: 'Something bad happened inside the hubs router.',
  });
});

module.exports = router;
