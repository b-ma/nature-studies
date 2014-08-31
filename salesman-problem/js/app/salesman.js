var Vector = require('vector')
  , Class  = require('../lib/class')
;

var Salesman = Class.extend({
    init: function(dna, type) {
        this.dna = dna;
        this.fitness = 0;
        this.distance = 0;
        this.currentGene = 0;
        this.isArrived = false;
        this.isElite = type === 'elite' ? true : false;
        // movement settings
        // assume pixels are meters
        this.position = this.dna[0].clone();
        this.startVelocity = new Vector(Math.random() * 4 - 2, Math.random() * 4 - 2);
        this.velocity = this.startVelocity.clone();
        this.target;

        this.MAX_SPEED = 300; // 1000 m/s
        this.MAX_ACC   = 40;
        this.DANGER_ZONE = 200; // how far from a city the MAX_SPEED starts decreasing
        this.mass = Math.random() * 5 + 4;

        // display settings
        this.radius = 7;
    },

    reset: function() {
        this.currentGene = 0;
        this.position = this.dna[0].clone();
        this.velocity = this.startVelocity.clone();
    },

    getDistance: function() {
        var path = this.dna;
        var distance = 0;
        for (var i = 0; i < path.length - 1; i++) {
            var start = path[i];
            var end   = path[i+1];
            var line  = Vector.substract(end, start);
            distance += line.magnitude();
        }

        return this.distance = distance;
    },

    arrived: function() {
        return this.isArrived;
    },

    followPath: function() {
        this.target = this.dna[this.currentGene];
        var distance = Vector.substract(this.target, this.position).magnitude();

        if (distance <= 4) {
            if (this.currentGene < this.dna.length - 1) {
                this.currentGene += 1;
            } else if (this.currentGene === this.dna.length - 1) {
                this.isArrived = true;
            }

            this.target = this.dna[this.currentGene];
        }
    },

    update: function(dt) {
        this.followPath();

        var desiredVelocity = Vector.substract(this.target, this.position)
            .normalize()
            .multiply(this.MAX_SPEED * dt);

        var steering = Vector.substract(desiredVelocity, this.velocity)
            .truncate(this.MAX_ACC * dt)
            .divide(this.mass);

        var distance = Vector.substract(this.target, this.position).magnitude();
        var ratio = 1;
        // if distance < 200, start decelerating
        if (distance < this.DANGER_ZONE) {
            if (this.currentGene !== this.dna.length - 1) {
                ratio = (distance / this.DANGER_ZONE) * 8/10 + 2/10;
            } else {
                ratio = (distance / this.DANGER_ZONE)
            }
        }

        this.velocity
            .add(steering)
            .truncate(this.MAX_SPEED * ratio * dt);

        if (!this.lastPosition) { this.lastPosition = this.position.clone(); }
        this.position.add(this.velocity);
    },

    display: function(ctx, buffer, dt) {
        var dna = this.dna;
        // draw path
        ctx.strokeStyle = '#20d6c7';
        ctx.font = '16px monospace';

        // draw path in buffer
        if (this.lastPosition /* && this.isElite */) {
            buffer.save();
            buffer.beginPath();
            if (!this.isElite) {
                buffer.globalOpacity = 0.2;
            } else {
                buffer.lineWidth = this.radius;
            }
            buffer.strokeStyle = this.isElite ? '#20d6c7' : '#efefef';
            buffer.moveTo(this.lastPosition.x, this.lastPosition.y);
            buffer.lineTo(this.position.x, this.position.y);
            buffer.stroke();
            buffer.restore();

            this.lastPosition = undefined;
        }

        var directionVector = this.velocity.clone().normalize(this.radius);
        // draw agent
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.velocity.direction());
        // main shape
        ctx.beginPath();
        ctx.fillStyle = 'rgba(140, 140, 140, 0.1)';
        ctx.strokeStyle = this.isElite ? '#232323' : '#676767';
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.stroke();
        // draw direction
        ctx.beginPath()
        ctx.moveTo(0, 0);
        ctx.lineTo(this.radius, 0);
        ctx.stroke();

        ctx.restore();
    }
});

module.exports = Salesman;
