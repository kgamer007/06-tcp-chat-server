'use strict';

const EventEmitter = require('events');
const net = require('net');
const logger = require('./logger');
const User = require('./../model/user');

const PORT = process.env.PORT || 3000;

const server = net.createServer();
const event = new EventEmitter();
const socketPool = {};
const clientPool = [];

const parseData = (buffer) => {
  let text = buffer.toString().trim();
  if (!text.startsWith('@')) return null;
  // text = text.split(' '); this makes a 
  // new array shaped like [ '@command', 'message'] where it      splits the string 
  // ino an array based on a passed in "seperator", in this case white space


  // const command = text[0];

  // this is the same as above line
  // text.slice(1) = ['message']
  // const ['message'] = text.slice(1);
  // text.slice(1).join(' ') = 'message'
  // changes an array such as ['i', 'entered', 'a', 'chatroom'] to "I entered a chatroom"
  text = text.split(' ');
  const [command] = text;
  const message = text.slice(1).join(' ');

  logger.log(logger.INFO, `THIS IS THE MESSAGE: ${command}`);
  logger.log(logger.INFO, `THIS IS THE MESSAGE: ${message}`);

  return {
    command,
    message,
  };
};

const dispatchAction = (user, buffer) => {
  const entry = parseData(buffer);
  console.log(entry, 'THIS IS THE ENTRY'); //eslint-disable-line
  if (entry) event.emit(entry.command, entry, user);
};
server.on('connection', (socket) => {
  const user = new User(socket);
  socket.write(`Chatroom initiated, ${user.nickname}!\n`);
  clientPool[user._id] = user;
  logger.log(logger.INFO, `New user ${user.nickname} has joined`);

  socket.on('data', (buffer) => {
    dispatchAction(user, buffer);
  });
});

// these are all the event listeners
event.on('@all', (data, user) => {
  logger.log(logger.INFO, data);
  Object.keys(socketPool).forEach((userIdKey) => {
    const targetedUser = clientPool[userIdKey];
    targetedUser.socket.write(`<${user.nickname}>: ${data.message}`);
  });
});

event.on('@nn', (data, user) => {
  logger.log(logger.INFO, data);
  socketPool[user._id].nickname = data.message;
  user.socket.write(`New username, your username is: ${data.message}\n`);
});

// returns a list of all users in the chat
event.on('@users', (data, user) => {
  logger.log(logger.INFO, data);
  Object.keys(socketPool).forEach((userIdKey) => {
    user.socket.write(`${socketPool[userIdKey].nickname}\n`);
  });
});

event.on('@dm', (data, user) => {
  const nickname = data.message.split(' ').shift().trim();
  const message = data.message.split(' ').splice(1).join(' ').trim();
  console.log('message: ', message); //eslint-disable-line
  Object.keys(clientPool).forEach((userIdKey) => {
    if (clientPool[userIdKey].nickname === nickname) {
      const targetedUser = clientPool[userIdKey];
      targetedUser.socket.write(`${user.nickname}: ${message}\n`);
      user.socket.write(`>>${user.nickname}<<: ${message}\n`);
    }
  });
});

server.listen(PORT, () => {
  logger.log(logger.INFO, `Server up on PORT: ${PORT}`);
});
