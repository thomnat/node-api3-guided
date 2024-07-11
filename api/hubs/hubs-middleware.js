//going to need the model in here (hubs-model.js) because our middleware is going to have to do some databse operation

const Hubs = require('./hubs-model.js');

async function checkHubId(req, res, next) { //this is to reduce the code in the endpoints that are checking if the id passed is an actual id in database
  try {
    const hub = await Hubs.findById(req.params.id);
    if (hub) { //if there is an id in the hub object in the database
      req.hub = hub; //we can tack the entire hub to the req object so endpoints down the pipeline can benefit 
      next(); //we can proceed with the request if the id is found
    } else {
      next({ status: 404, message: `Hub ${req.params.id} not found`});
    }
  } catch (err) {
      next(err); //if the try promise doesn't work then this error will be thrown
  }
}

//so now we need another middleware to ensure the req.body that is in the request object from the client contains a name
function checkNewHub(req, res, next) {
  const { name } = req.body; //extract name from the req body
  if (name !== undefined && typeof name === 'string' && name.length && name.trim().length) { //going to perform validation here, if name looks good then proceed over to the next middleware which would be the endpoint where this middleware is apart of like the POST request in the hubs-router and if the name is wrong during this check then the middleware is going to send an error message to the client
    next();  //if the checks pass then we can proceed through the endpoint that this middleware is apart of like the rest of the POST request
  } else {
      next({ status: 422, message: 'hubs need a name'});
  }
}

module.exports = {
  checkHubId,
  checkNewHub,
}; //dont forget to import this middleware into the desired file, in this case hubs-router