const express = require('express'); // importing a CommonJS module
const morgan = require('morgan');

const hubsRouter = require('./hubs/hubs-router.js');

const server = express();

function customMorgan(req, res, next) {
  //inside this middleware we can do whatever we want. we can respond to requests, we can add information to the request object, we can make log statements, we can do anything we would normally do inside of an endpoint. 
  console.log(`you made a ${req.method} request`); //a GET request or a POST request etc
  //need to invoke next, which is a callback that allows the request to proceed over to the next middleware in the pipeline. An Express application is like a pipeline of middlewares.
  next();
}
//this (above this line) is a custom Middelware that acts similarly to morgan. And a Middleware if just a function.

function shortCircuit(req, res, next) {
  res.json('The request was short circuited!'); //bc we aren't invoking next
}

function addFriend(req, res, next) { //this middleware is going to add a friend to the req object for later middlewares to be able to use.
  //the req object is writeable, you can write a friend property on the req object and set it to whatever you want.
  req.friend = "Lady Gaga";
  next();
}

server.use(express.json());
server.use(morgan('dev')); //this is using a middleware gloablly. morgan is not a middleware, morgan is a function that takes configuration (dev) because this middleware is configurable. morgan is a function that invokes a configuration of middlware.
//we can create our own Middlewares or we can just install a middleware from NPM like we did with morgan
server.use(customMorgan); //customMorgan is not configurable, its not a function that returns a middleware like morgan does, it is a middleware itself so we dont need to invoke it 
// server.use(shortCircuit); //depending on where this is placed, the request will be short circuited and the rest of the middleware will not be reached, since this is below morgan and customMorgan those will still run. but if this was moved to above/before morgan and customMorgan those two middlewares would not be executed/reached. So the order in which we connect/place the middlewares is important.
server.use(addFriend);

server.use('/api/hubs', hubsRouter);

server.get('/', (req, res) => {//also endpoints are middlewares at the end of the day. since this endpoint/middleware is after the addFriend middleware, we are able to access the req.friend property that was added earlier by the addFriend middleware
  res.send(`
    <h2>Hubs API</h2>
    <p>Welcome to the Hubs API ${req.friend}</p>
  `);
});

server.use('*', (req, res) => {
  // catch all 404 errors middleware
  res.status(404).json({ message: `${req.method} ${req.baseUrl} not found!` });
});

module.exports = server;


//Middlewares are the fundamental units of organization in any Express application. Express applications have their code partitioned into functions called Middlewares. Each Middleware has a very specific task or purpose, and they allow to have an application that is clean, neatly organized and with highly reusable pieces.
//Middlewares are used to make our code reusable and modular.
//There are some Middlewares that are used surgically, on specific locations of the application, or globally OR globally to affect the entire application.
//There are also Error-Handling Middlewares - great for avoiding repeating error handling code. Like what is typically in the catch block. Error handling Middlewares are connected at the END of the middlewares pipeline, so in this case in the hubs-router file it will be at the VERY end of the file. Error-handling middlewares take error as the first argument then req, res, next.
//If you expand the data folder, you will see a SQLite database inside. SQLite allows to have a SQL database in a file embedded inside the project, and all the software needed to run this databse also lives inside this project.This makes SQLite an excellent choice for embedded databases. So if you install a software called SQLite Studio, you will be able to open those physical databases and explore their structure and data.
//In this project/database - there are two tables of interest Hubs and Messages. 
  //Hubs is a table with two columns. A primary key called id and a non-primary key called name. Hubs are like chat rooms, and each chat room is uniquely identified by its id and name.
  //Messages is a table with 4 columns. The primary key is called id, a sender column, a text column, and a foreign key called hub_id. A foreign key points to the primary key in another table. 