'use strict';

const faker = require('faker');

module.exports = class Client {
  constructor(socket) {
    this.nickname = faker.internet.userName();
    this.socket = socket;
    this.userId = function uniqueId() {
      const id = new Date();
      return id;
    };
  }
};
