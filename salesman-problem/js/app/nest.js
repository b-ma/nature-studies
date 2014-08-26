var Class = require('../lib/class');
var Salesman = require('./salesman');
var gui = require('../gui');

var Nest = Class.extend({
    init: function(position, populationLength, genome) {
        this.position = position;
        this.populationLength = populationLength;
        this.genome = genome;

        this.population = [];
        this.generation = 1;
        this.bestPath = +Infinity;

        this.crossoverProbability = 1;
        this.mutationProbability = 0.01;

        this.createPopulation();
    },

    getPopulation: function() {
        return this.population;
    },

    getGeneration: function() {
        return this.generation;
    },

    getBestPath: function() {
        return this.bestPath;
    },

    createPopulation: function() {
        for (var i = 0; i < this.populationLength; i++) {
            var dna = [];
            for (var j = 0; j < this.genome.length; j++) {
                var gene = this.genome[j];
                dna.push(gene);
            }

            dna.sort(function() { return Math.random() - 0.5; });
            //  add start and end point
            dna.unshift(this.position);
            dna.push(this.position);

            var salesman = new Salesman(dna);
            this.population.push(salesman);
        }
    },

    // @TODO refactor
    evolvePopulation: function() {
        this.generation += 1;
        this.bestPath = +Infinity;
        // evaluate fitness
        var totalDistance = 0;
        var totalFitness = 0;
        for (var i = 0; i < this.population.length; i++) {
            var distance = this.population[i].getDistance();
            if (distance < this.bestPath) { this.bestPath = distance; }
            totalDistance += distance;
        }

        for (var i = 0; i < this.populationLength; i++) {
            var salesman = this.population[i];
            var fitness = salesman.distance / totalDistance;
            salesman.fitness = Math.pow(1 - fitness, 2);
            totalFitness += salesman.fitness;
        }

        console.log('%cAverage distance: ' + (totalDistance / this.population.length), 'color:red');

        // new population
        var newPopulation = [];
            // elitism - keep better elements from old population (10% ?)
        var sortedPopulation = this.population.slice(0);
        sortedPopulation.sort(function(a, b) { return a.distance < b.distance ? -1 : 1; });
        var eliteDna1 = sortedPopulation[0].dna.slice(0);
        var eliteDna2 = sortedPopulation[0].dna.slice(0);

        // create an elite copy with mutation
        eliteDna2.shift();
        eliteDna2.pop();
        var indexA = Math.floor(Math.random() * eliteDna2.length);
        var indexB = Math.floor(Math.random() * eliteDna2.length);

        var memo = eliteDna2[indexA];
        // console.log(indexA, indexB);
        // console.log(sortedPopulation[0].dna);
        eliteDna2[indexA] = eliteDna2[indexB];
        eliteDna2[indexB] = memo;
        // console.log(eliteDna2);

        eliteDna2.push(this.position);
        eliteDna2.unshift(this.position);

        // console.log('-------------------------------------');
        // console.log(eliteDna2.length);

        var eliteCopy = new Salesman(eliteDna1, true);
        var eliteMutated = new Salesman(eliteDna2);
        newPopulation.push(eliteMutated);
        newPopulation.push(eliteCopy);

        while(newPopulation.length < this.populationLength) {
            // selection
            var parentsDna = [];
            for (var i = 0; i < 2; i++) {
                var probability = Math.random() * totalFitness;
                var sum = 0;

                for (var j = 0; j < this.populationLength; j++) {
                    var salesman = this.population[j];
                    sum += salesman.fitness;
                    if (sum >= probability) {
                        var dna = salesman.dna.slice(0);
                        // remove nest coordinates
                        dna.shift();
                        dna.pop();
                        // store parent dna
                        parentsDna.push(dna);
                        break;
                    }
                }
            }

            // crossover - create offspring
            var crossoverIndex = Math.floor(Math.random() * parentsDna[0].length);
            var dna = [];

            dna = dna.concat(parentsDna[0].splice(0, crossoverIndex));
            // take genes not present from parent 1 in order
            for (var i = 0; i < parentsDna[1].length; i++) {
                var gene = parentsDna[1][i];
                if (dna.indexOf(gene) === -1) { dna.push(gene); }
            }

            // mutation
            if (Math.random() < this.mutationProbability) {
                var indexA = Math.floor(Math.random() * dna.length);
                var indexB = Math.floor(Math.random() * dna.length);

                var memo = dna[indexA];
                dna[indexA] = dna[indexB];
                dna[indexB] = memo;
            }

            // acception
            dna.push(this.position);
            dna.unshift(this.position);
            var salesman = new Salesman(dna);
            newPopulation.push(salesman);
        }

        // replace old generation with new one
        this.population = newPopulation;
    },

    update: function(dt) {
        var allDone = true;
        for (var i = 0; i < this.populationLength; i++) {
            if (!this.population[i].arrived()) { allDone = false; }
        }

        if (allDone) {
            // skip ten generations
            for (var i = 0; i < gui.model.generationInterval; i++) {
                this.evolvePopulation();
            }
        }

        return this.population;
    }
});

module.exports = Nest;
