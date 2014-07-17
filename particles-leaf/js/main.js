var Particle = function(location, options) {
    this.location = location.clone();
    this.velocity = new Vector(Math.random() * 2 -1, Math.random() * 2 - 2);
    this.acceleration = new Vector(0, 0.03);
    this.lifespan = 1;

    this.mass = Math.random() * 2 + 1;
    this.rotation = 0;
    this.angularVelocity = Math.PI / parseInt(Math.random() * 50 + 50);

    this.w = options.w;
    this.h = options.h;
    this.initializeShape();
}

extend(Particle.prototype, {
    initializeShape: function() {
        this.contextPoint = new Vector();
        this.endingPoint1 = new Vector(this.w / 4, this.h / 2);
        this.controlPoint1_1 = new Vector(this.w / 20, 0);
        this.controlPoint1_2 = new Vector(this.w / 20, this.h / 4);

        this.endingPoint2 = new Vector(this.w, 0);
        this.controlPoint2_1 = new Vector(this.w / 2, this.h / 2);
        this.controlPoint2_2 = new Vector(this.w * 0.7, this.h / 10);
    },

    run: function(ctx) {
        this.update();
        this.display(ctx);
    },

    update: function() {
        this.velocity.add(this.acceleration);
        this.location.add(this.velocity);
        this.lifespan -= 0.004;

        this.rotation = (this.rotation + this.angularVelocity) % (Math.PI * 2);
    },

    display: function(ctx) {
        ctx.save();

        ctx.translate(this.location.x, this.location.y);
        ctx.rotate(this.rotation);

        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, ' + (this.lifespan - 0.08) + ')';
        ctx.strokeStyle = 'rgba(255, 255, 255, ' + this.lifespan + ')';

        ctx.moveTo(this.contextPoint.x, this.contextPoint.y);
        ctx.bezierCurveTo(
            this.controlPoint1_1.x, this.controlPoint1_1.y,
            this.controlPoint1_2.x, this.controlPoint1_2.y,
            this.endingPoint1.x, this.endingPoint1.y
        );
        ctx.bezierCurveTo(
            this.controlPoint2_1.x, this.controlPoint2_1.y,
            this.controlPoint2_2.x, this.controlPoint2_2.y,
            this.endingPoint2.x, this.endingPoint2.y
        );

        ctx.moveTo(this.contextPoint.x, this.contextPoint.y);
        ctx.bezierCurveTo(
            this.controlPoint1_1.x, -1 * this.controlPoint1_1.y,
            this.controlPoint1_2.x, -1 * this.controlPoint1_2.y,
            this.endingPoint1.x, -1 * this.endingPoint1.y
        );
        ctx.bezierCurveTo(
            this.controlPoint2_1.x, -1 * this.controlPoint2_1.y,
            this.controlPoint2_2.x, -1 * this.controlPoint2_2.y,
            this.endingPoint2.x, -1 * this.endingPoint2.y
        );

        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    },

    applyForce: function(force) {
        var force = force.clone();
        force.divide(this.mass);

        this.acceleration.add(force);
    },

    isDead: function() {
        return this.lifespan < 0 ? true : false;
    }
});

var ParticleSystem = function(origin) {
    this.origin = origin.clone();
    this.particles = [];
}

extend(ParticleSystem.prototype, {
    setOrigin: function(vector) {
        this.origin = vector.clone();
    },

    addParticle: function() {
        var w = Math.random() * 10 + 10;
        var h = Math.random() * 4 + 4;
        this.particles.push(new Particle(this.origin, { w: w, h: h }));
    },

    run: function(ctx, wind) {
        this.particles.forEach(function(particle, index) {
            particle.applyForce(wind);
            particle.run(ctx);
        });

        this.particles = this.particles.filter(function(particle) {
            return !particle.isDead();
        });
    }
});

// -----------------------------------------------
var clearCtx = function(ctx) {
    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.rect(0, 0, w, h);
    ctx.fill();
    ctx.restore();
};

var w = 600;
var h = 300;
var canvas = document.getElementById('scene');
var ctx = canvas.getContext('2d');

ctx.canvas.width = w;
ctx.canvas.height = h;

var wind; // = new Vector(0.0004, 0);
var particles = new ParticleSystem(new Vector());

var sinDelta = Math.PI / 10;
var counter = 0;

(function draw() {
    counter = (sin + sinDelta) % (Math.PI * 2);
    var sin = Math.sin(counter) * 10;
    wind = new Vector(sin, 0);

    clearCtx(ctx);
    particles.setOrigin(new Vector(Math.random() * w, -20));
    particles.addParticle();
    particles.run(ctx, wind);

    window.requestAnimationFrame(draw);
}());




