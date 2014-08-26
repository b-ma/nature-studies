Vector2d
=================================================

-   umd compliant
-   global namespace `window.Vector`

built and minified version are located here:
-   `path/to/module/dist/vector.js`
-   `path/to/module/dist/vector.min.js`


@TODOS:
-   register as npm module
-   register as bower module
-   test with requirejs
-   add `bower.json`

Install
-------------------------------------------------

npm : `npm install git+https://github.com/b-ma/vector2d.git`

bower : `bower install git+https://github.com/b-ma/vector2d.git` (need test)


Usage :
-------------------------------------------------

```javascript
require('vector');

var x = 20, y = 20;
var vector = new vector(x, y);
````


API
-------------------------------------------------

Static methods :

-   `Vector.add`
-   `Vector.substract`
-   `Vector.multiply`
-   `Vector.distance`
-   `Vector.clone`

Instance methods :

-   `add`
-   `substract`
-   `multiply`
-   `divide`
-   `truncate`
-   `normalize`
-   `rotate`
-   `setAngle`
-   `magnitude`
-   `direction`
-   `clone`