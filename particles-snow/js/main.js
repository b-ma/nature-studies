var Particle = function(location, type) {
    this.location = location.clone();
    this.velocity = new Vector(Math.random() * 2 -1, Math.random() * 2 - 1);
    this.acceleration = new Vector(); //  = new Vector(0, 0.05);
    this.lifespan = 1;
    this.type = type;

    this.width = this.type === 'bg' ? 12 : 4;
    this.color = this.type === 'bg' ? '121, 189, 224' : '210, 220, 255';

    this.rotation = 0;
    this.mass = Math.random() * 20 + 10;
    this.angularVelocity = Math.PI / parseInt(Math.random() * 20 + 20);
}

extend(Particle.prototype, {
    run: function(ctx) {
        this.update();
        this.display(ctx);
    },

    update: function() {
        this.velocity.add(this.acceleration);
        this.location.add(this.velocity);
        this.lifespan -= 0.005;
        this.lifespan = constrain(this.lifespan, 0, 1);

        this.rotation = (this.rotation + this.angularVelocity) % (Math.PI * 2);

        this.acceleration.multiply(0);
    },

    display: function(ctx) {
        var w = 4;

        ctx.save();
        ctx.translate(this.location.x, this.location.y);
        // ctx.rotate(this.rotation);

        ctx.beginPath();
        // ctx.fillStyle = 'rgba(0, 0, 255, ' + this.lifespan + ')';

        var radgrad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width);
        radgrad.addColorStop(0, 'rgba(' + this.color + ', ' + this.lifespan * 1 + ')');
        radgrad.addColorStop(0.3, 'rgba(' + this.color + ', ' + this.lifespan * 0.7 + ')');
        radgrad.addColorStop(1, 'rgba(' + this.color + ', ' + this.lifespan * 0 + ')');

        ctx.fillStyle = radgrad;
        ctx.arc(0, 0, this.width, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();
        /*
        ctx.beginPath();
        ctx.strokeStyle = '#000000';
        ctx.moveTo(0, 0);
        ctx.lineTo(8, 0);
        ctx.stroke();
        ctx.closePath();
        */
        ctx.restore();
    },

    applyForce: function(force) {
        var force = force.clone();
        force.divide(this.mass);
        this.acceleration.add(force);
    },

    isDead: function() {
        return this.lifespan === 0 ? true : false;
    }
});

var ParticleSystem = function(origin, type) {
    this.origin = origin.clone();
    this.type = type;
    this.particles = [];
}

extend(ParticleSystem.prototype, {
    setOrigin: function(vector) {
        this.origin = vector.clone();
    },

    addParticle: function() {
        this.particles.push(new Particle(this.origin, this.type));
    },

    applyForce: function(force) {
        this.particles.forEach(function(particle) {
            particle.applyForce(force);
        });
    },

    applyRepeller: function(repeller) {
        this.particles.forEach(function(particle) {
            var force = repeller.repel(particle);
            particle.applyForce(force);
        });
    },

    run: function(ctx) {
        this.particles.forEach(function(particle, index) {
            particle.run(ctx);
        });

        this.particles = this.particles.filter(function(particle) {
            return !particle.isDead();
        });
    }
});

var Repeller = function(location) {
    this.radius = 5;
    this.location = location.clone();
}

extend(Repeller.prototype, {
    setLocation: function(location) {
        this.location = location.clone();
    },

    repel: function(particle) {
        var dir = Vector.substract(this.location, particle.location);
        var mag = dir.magnitude();
        mag = constrain(mag, 5, 100);
        dir.normalize();
        force = -1 * 100 / (mag * mag);

        dir.multiply(force);
        return dir;
    },

    display: function(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.translate(this.location.x, this.location.y);
        ctx.fillStyle = '#00ff00';
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
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
var particlesPerFgFrame = 6;
var particlesPerBgFrame = 8;
var canvas = document.getElementById('scene');
var ctx = canvas.getContext('2d');

ctx.canvas.width = w;
ctx.canvas.height = h;

var gravity = new Vector(0, 1.2);
var particlesBg = new ParticleSystem(new Vector(w / 2, h / 4), 'bg');
var particlesFg = new ParticleSystem(new Vector(w / 2, h / 4), 'fg');
var repellers = [];

canvas.addEventListener('click', function(e) {
    e.preventDefault();
    var location = new Vector(e.layerX, e.layerY);
    var repeller = new Repeller(location);
    repellers.push(repeller);
}, false);

(function draw() {
    clearCtx(ctx);

    // console.log(particles.particles.length);
    // particles.setOrigin(new Vector(Math.random() * w - (w / 4), -10));
    for (var i = 0; i < particlesPerBgFrame; i++) {
        particlesBg.addParticle();
    }

    for (var i = 0; i < particlesPerFgFrame; i++) {
        particlesFg.addParticle();
    }

    repellers.forEach(function(repeller) {
        particlesBg.applyRepeller(repeller);
        particlesFg.applyRepeller(repeller);
    });

    particlesBg.applyForce(gravity);
    particlesFg.applyForce(gravity);

    particlesBg.run(ctx);
    particlesFg.run(ctx);

    repellers.forEach(function(repeller) {
        repeller.display(ctx);
    });

    window.requestAnimationFrame(draw);
}());




