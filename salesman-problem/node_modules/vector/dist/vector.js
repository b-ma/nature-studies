!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Vector=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// 2d vectors
var Vector = function(x, y) {
    this.x = !isNaN(x) ? x : 0;
    this.y = !isNaN(y) ? y : 0;
};

// static function - returns new vectors
Vector.add = function(v1, v2) {
    return new this(v1.x + v2.x, v1.y + v2.y);
}
Vector.substract = function(v1, v2) {
    return new this(v1.x - v2.x, v1.y - v2.y);
}
Vector.multiply = function(v1, v2) {
    return new this(v1.x * v2.x, v1.y * v2.y);
}
Vector.distance = function(v1, v2) {
    var v = this.substract(v2, v1);
    return v.magnitude();
}
Vector.clone = function(v) {
    return new this(v.x, v.y);
}

// instance methods
Vector.prototype.add = function(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
}
Vector.prototype.substract = function(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
}
Vector.prototype.multiply = function(value) {
    this.x *= value;
    this.y *= value;
    return this;
}
Vector.prototype.divide = function(value) {
    return this.multiply(1/value);
}
Vector.prototype.truncate = function(value) {
    if (this.magnitude() > value) {
        this.normalize(value);
    }
    return this;
}
Vector.prototype.normalize = function(multiplier) {
    var multiplier = multiplier ? multiplier : 1;
    var mag = this.magnitude();
    if (mag === 0) { return this; }

    this.x = (this.x / mag);
    this.y = (this.y / mag);
    this.multiply(multiplier);
    return this;
}
Vector.prototype.rotate = function(theta) {
    var finalTheta = this.direction() + theta;
    this.setAngle(finalTheta);
}
Vector.prototype.setAngle = function(theta) {
    var magnitude = this.magnitude();
    this.normalize();
    this.x = Math.cos(theta);
    this.y = Math.sin(theta);
    this.multiply(magnitude);
    return this;
}
Vector.prototype.magnitude = function() {
    var hyp = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    return Math.abs(hyp);
}
Vector.prototype.direction = function() {
    // cf. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
    return Math.atan2(this.y, this.x);
}
Vector.prototype.clone = function() {
    return new this.constructor(this.x, this.y);
}

module.exports = Vector;

},{}]},{},[1])(1)
});