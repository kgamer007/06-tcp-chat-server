'use strict';

const uuid = require('server');

module.exports = class Client {
  constructor(socket) {
    this._id = uuid();
    this.nickname = `User no. ${this._id}`;
    this.socket = socket;
  }
};
