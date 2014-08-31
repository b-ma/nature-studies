var dat = require('dat-gui');

var model = {
    pause: false,
    slow: 1,
    bang: false,
    generationInterval: 1
};

var gui = new dat.GUI();

var pauseController = gui.add(model, 'pause');
gui.add(model, 'slow', 1, 10).step(1);
var bangController = gui.add(model, 'bang').listen();
gui.add(model, 'generationInterval').step(1);

module.exports = {
    model: model,
    controllers: {
        pause: pauseController,
        bang: bangController
    }
}
