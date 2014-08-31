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
            this.addNestPosition(dna);

            var salesman = new Salesman(dna);
            this.population.push(salesman);
        }
    },

    // add the nest position at the begining and at the end of dna
    addNestPosition: function(dna) {
        //  add start and end point
        dna.unshift(this.position);
        dna.push(this.position);
        return dna;
    },

    // the nest position shouldn't be in crossover and mutation
    removeNestPosition: function(dna) {
        dna.pop();
        dna.shift();
        return dna;
    },

    evaluateFitness: function() {
        var totalDistance = 0;
        this.totalFitness = 0;
        // calculate the distance for each agent
        for (var i = 0; i < this.population.length; i++) {
            var distance = this.population[i].getDistance();
            if (distance < this.bestPath) { this.bestPath = distance; }
            totalDistance += distance;
        }

        // define fitness - the lower the distance, the higher the fitness
        for (var i = 0; i < this.populationLength; i++) {
            var salesman = this.population[i];
            var fitness = salesman.distance / totalDistance;
            salesman.fitness = Math.pow(1 - fitness, 2);
            this.totalFitness += salesman.fitness;
        }

        // console.log('%cAverage distance: ' + (totalDistance / this.population.length), 'color:red');
    },

    // swap two genes
    mutate: function(dna) {
        var indexA = Math.floor(Math.random() * dna.length);
        var indexB = Math.floor(Math.random() * dna.length);

        var memo = dna[indexA];

        dna[indexA] = dna[indexB];
        dna[indexB] = memo;

        return dna;
    },

    applyElitism: function(newPopulation) {
        // get the best agent
        var sortedPopulation = this.population.slice(0);
        sortedPopulation.sort(function(a, b) { return a.distance < b.distance ? -1 : 1; });
        var eliteDna = sortedPopulation[0].dna;

        // keep the best agent (tag it as best agent)
        var salesman = new Salesman(eliteDna.slice(0), 'elite');
        newPopulation.push(salesman);

        // create a mutated version of the best agent
        var dna = eliteDna.slice(0);
        this.removeNestPosition(dna);
        this.mutate(dna);
        this.addNestPosition(dna);
        var salesman = new Salesman(dna);
        newPopulation.push(salesman);

        // @TODO - create a reverse version of the best agent
        var dna = eliteDna.slice(0).reverse();
        var salesman = new Salesman(dna);
        newPopulation.push(salesman);
    },

    selectParents: function() {
        var parentsDna = [];
        // select two parents randomly weighted to the fitness
        for (var i = 0; i < 2; i++) {
            var probability = Math.random() * this.totalFitness;
            var sum = 0;

            for (var j = 0; j < this.populationLength; j++) {
                var salesman = this.population[j];
                sum += salesman.fitness;

                if (sum >= probability) {
                    var dna = salesman.dna.slice(0);
                    // remove nest coordinates
                    this.removeNestPosition(dna);
                    // store parent dna
                    parentsDna.push(dna);
                    break;
                }
            }
        }

        return parentsDna;
    },

    crossover: function(parentsDna) {
        var dna = new Array(this.genome.length);
        // select a bunh of gene from the parent dna
        var crossoverLimits = [
            Math.floor(Math.random() * parentsDna[0].length),
            Math.floor(Math.random() * parentsDna[0].length)
        ];

        var start = Math.min.apply(null, crossoverLimits);
        var stop  = Math.max.apply(null, crossoverLimits);
        // copy the extracted sequence from parent 0
        for (var i = start; i <= stop; i++) {
            dna[i] = parentsDna[0][i];
        }

        // fill the holes with parents 2 genes
        var j = 0;
        for (var i = 0; i < dna.length; i++) {
            while (dna[i] === undefined)  {
                var gene = parentsDna[1][j];

                if (dna.indexOf(gene) === -1) {
                    dna[i] = gene;
                } else {
                    j += 1; // find the next parent gene
                }
            }
        }

        return dna;
    },

    evolvePopulation: function() {
        this.generation += 1;
        this.bestPath = +Infinity;
        var newPopulation = [];
        // define fitness
        this.evaluateFitness();
        // sort the population
        this.applyElitism(newPopulation);
        // evolve the rest of the population
        while(newPopulation.length < this.populationLength) {
            // selection (nest position is removed from parents dna)
            var parentsDna = this.selectParents();
            // crossover - create offspring
            var dna = this.crossover(parentsDna);
            // mutation according to this.mutationProbability
            if (Math.random() < this.mutationProbability) {
                this.mutate(dna);
            }
            // add the nest position back
            this.addNestPosition(dna);
            // acception - add the offspring to the new population
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
            // compute next generations
            for (var i = 0; i < gui.model.generationInterval; i++) {
                this.evolvePopulation();
            }
        }

        return this.population;
    }
});

module.exports = Nest;
