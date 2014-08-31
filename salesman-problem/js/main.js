var loop = require('./lib/loop');
var Vector = require('vector');
var gui = require('./gui');
var Nest = require('./app/nest')
var Salesman = require('./app/salesman');

// colors : https://kuler.adobe.com/fr/Ice-Cream-color-theme-4185778/

// salesman problem - genetic algorithm
// http://perso.ensta-paristech.fr/~lunevill/sim_numerique/projets/vdc.pdf

var width = window.innerWidth,
    height = window.innerHeight,
    padding = 40;;

// prepare canvas
var canvas = document.querySelector('#scene');
var ctx = canvas.getContext('2d');
ctx.canvas.width  = width;
ctx.canvas.height = height;

// create a buffer
var bufferCanvas = document.createElement('canvas');
var buffer = bufferCanvas.getContext('2d');
buffer.canvas.width  = width;
buffer.canvas.height = height;

// define some random cities
var cities = [];
var citiesCount = 10;
var populationLength = 30;

// create cities
for (var i = 0; i < citiesCount; i++) {
    var position = new Vector(
        Math.round(Math.random() * (width - padding * 2) + padding),
        Math.round(Math.random() * (height - padding * 2) +  padding)
    );
    cities[i] = position;
}

var nest = new Nest(new Vector(width / 2, height / 2), populationLength, cities);
var currentGeneration;
// fitness is defined according to smallest distance found
// need memoising function to store results from calculaing distances
var update = function(dt) {
    var population = nest.update();

    for (var i = 0; i < populationLength; i++) {
        population[i].update(dt);
    }
};

var render = function(ctx, buffers, dt) {
    ctx.clearRect(0, 0, width, height);
    // draw buffer
    ctx.drawImage(buffers[0].canvas, 0, 0);

    var generation = nest.getGeneration();
    if (generation !== currentGeneration) {
        buffer.clearRect(0, 0, width, height);
        currentGeneration = generation;
        console.log('%cbestPath: ' + nest.getBestPath(), 'color:green');
        console.log('%cGeneration: ' + currentGeneration, 'color:green');
    }

    var population = nest.getPopulation();
    // draw paths
    for (var i = 0; i < populationLength; i++) {
        var salesman = population[i];
        salesman.display(ctx, buffers[0], dt);
    }

    // draw cities
    for (var i = 0; i < citiesCount; i++) {
        var c = cities[i];
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = '#113f59';
        ctx.translate(c.x, c.y);
        ctx.arc(0, 0, 5, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.restore();
    }

    // draw stating point
    ctx.beginPath();
    ctx.fillStyle = '#d54f58';
    ctx.arc(nest.position.x, nest.position.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
};

// console.log(render);
var options = {
    ctx: ctx,
    buffers: [buffer],
    update: update,
    render: render,
    fps: 60,
    gui: gui.model
};

gui.controllers.pause.onChange(function(value) {
    value ? loop.quit() : loop.run(options);
});

gui.controllers.bang.onChange(function(value) {
    if (!value) { return; }
    for (var i = 0; i < populationLength; i++) {
        population[i].reset();
        buffer.clearRect(0, 0, width, height);
    }
    gui.model.bang = false;
})

loop.run(options);


