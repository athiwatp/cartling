'use strict';

var _ = require('lodash');
var ValidationErrors = require('./validation_errors');
var usergrid_sdk = require('usergrid');

var Usergrid = function() {

  // persistence

  this._errors = {};

  this.save = function(cb) {
    if (!this.isValid()) { return cb(this.getErrors()); }
    var self = this;
    usergrid_sdk.entity.prototype.save.call(this, function(err, data, reply) { // todo
      cb(err, self);
    });
  };

  // updates locally, no call to server
  this.updateAttributes = function(attributes) {
    if (!this._data) { this._data = {}; }
    var self = this;
    _.forOwn(attributes, function(v, k) {
      self.set(k, v);
    });
    return this;
  };

  // validation

  this.validates = function(validations) {
    this._validations = validations;
  };

  this.addError = function(attribute, error) {
    this._errors.addError(attribute, error);
  };

  this.clearErrors = function() {
    this._errors = new ValidationErrors();
  };

  this.getErrors = function() {
    return this._errors;
  };

  this.validate = function() {
    var self = this;
    self.clearErrors();
    _.each(self._validations, function(validations, name) {
      var value = self.get(name);
      _.each(validations, function(validator) {
        var err = validator(value);
        if (err) { self.addError(name, err); }
      });
    });
    return self._errors;
  };

  this.isValid = function() {
    return !(this.validate().hasErrors());
  };

  // utility

  this.toString = function() {
    var str = '';
    if (this._data) {
      if (this._data.type) {
        str += this._data.type;
      }
      if (this._data.name) {
        str += '[' + this._data.name + ']';
      } else {
        str += '[' + this._data.uuid + ']';
      }
    } else {
      str = '{}';
    }
    return str;
  };

  this.toJSON = function() {
    var json = JSON.stringify(this._data, function(k,v) {
      if (k === 'metadata') { return undefined; }
      return v;
    });
    return json;
  };
};
module.exports = Usergrid;
