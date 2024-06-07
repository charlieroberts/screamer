# Screamer

*Screamer* is a declarative live coding language for creating visuals using ray marching. It builds on top of [marching.js](https://charlieroberts.github.io/marching), a JavaScript library that compiles GLSL shaders. In comparison to marching.js, screamer is intended to be more concise and enable faster iteration / experimentation.

In music, a "screamer" is a sped-up march used in circuses to ["stir audiences into a frenzy"](https://en.wikipedia.org/wiki/Screamer_(march)).

## Play
[Try the playground](https://charlieroberts.github.io/screamer/playground). Here's a few keyboard commands worth knowing:

- `Ctrl+Enter`: Execute the current line (as defined by where the cursor is placed).
- `Shift+Ctrl+Enter`: Execute all lines.
- `Alt+Enter`: Execute current code "block". Blocks are delimited by blank lines in the editor. 
- `Ctrl+.`: Clear the current scene.
- `Alt+C`: Enable camera controls. Use WASD + the arrow keys to move through the 3D scene. Hit `Alt+C` again to disable the controls and return to editing.

## Reference
The main programmatic elements of screamer are:

- *Configuration*: Used to control global properties of the renderer, for example, post-processing effects and render quality. Applies to all subsequent renderings.
- *Geometries*: mmmm enough said
- *Combinators*: Operators used to combine geometries or to nest combinators.
- *Modifcations*: Single-character operators to transform geometries and combinators in various ways.
- *Variables*: Values that change over time that can be modified with math expressions; these changes are declared once and then applied continuously ("reactive" programming).
- *Math*: A small assortment of operators and functions primarily intended to manipulate variables over time.

`(` and `)` begin and end a *group*, which can have modifications (like repeat and scale) applied to them. This is a simple way to make groupings explicit to the language parser.... if you have trouble running complex lines of code try grouping elements together.

`//` is the operator for a single-line comment.

### Configuration
Configuration primarily consists of assigning numbers, keywords, or lists to global properties. Once a configuration is run, you can then freely create different scenes and they will all use the existing configuration without having to re-execute it.

- *background*: assign a RGB list of floats representing a color for the rendering background, e.g. `(1,0,0)` for red or `(0,0,.5)` for dark blue. This configuration cannot be animated over time (although it's on the list!).

- *camera*: The xyz coordinates of the camera. Example: `camera = (0,0,3)`. Geometries are placed at the `0,0,0` coordinate by default, so you usally want your camera to be a bit back on the z-axis to properly view them (a z value of 5 is the default. This configuation *can* be animated. For example, to constantly move your camera forward through a scene: `camera = (0,0,time*-1)`.

- *fog*: A list containing four floats. The first is the amount of fog, while the last three present the RGB color of the fog. It often makes sense for the fog to be the same color as the `background`. Example: `fog = (.5, 0,0,0)`. This configuration *can* be animated over time, for example, to drive the fog with audio you could use: `fog = (high*2, .5*sin(low)*.5, 0, med )`. 

- *fft*: This determines the size of the FFT window, which *must* be a power of two (e.g. 512, 1024, 2048, 4096 etc.) The default is 512. For smoother audio windows, consider using 4096 or 8192. This configuration cannot be animated. For example: `fft = 8192`

- *post*: A list of post-processing effects to apply. Available effects include `antialias`, `focus`, `edge`, `invert`, `bloom`, `godrays`, and `blur`. Example: `post = ( antialias(2), edge, invert(1) )`. These effects cannot (currently) be animated over time.

- *render*: assign a rendering preset to be used, the default is `med`. Options include `low`, `med`, `high`, `fractal.low`, `fractal.med`, `fractal.high`, `repeat.low`, `repeat.med`, `repeat.high`, `voxel.low`, `voxel.med`, and `voxel.high`. The `fractal` presets are best for viewing fractals close to the camera, white the `repeat` presets are best for geometries that are endlessly repeated over space. The `voxel` presets convert geometries to voxelized representations (think Minecraft). This configuration cannot be animated over time.

### Geometries
Most of the geometries available in screamer are very simple; the fun comes in repeating, combining, and warping them in different ways. However, there is a also a selection of fractals that can create more complex scenes with very little code.

- *sphere*: A sphere that accepts a radius argument. Example: `sphere(.5)`
- *box*: A box that accepts a size argument, which can be either a single number (creates a cube) or a three-item list (different sizes for x,y, and z dimensions). Examples: `box(.25)` or `box( (1,.5,.1) )`
- *octahedron* :
- *julia*: A julia fractal that accepts a fold amount. Example: `julia(4.5)`
- *mandelbox*: A mandelbox fractal.
- *mandelbulb*: A mandelbulb fractal accepting a fold amount.
- *mandalay*: A mandalay fractal.
- *cone*
- *cylinder*: A cylinder accepts a size argument containing a radius and a height. For example, to create a long narrow cylinder: `cylinder((.1,2))`
- *capsule*
- *torus*
- *torus82*

### Combinators
Combinators are operators that are used to combine geometries (or multiple combinators). 

- `++`: Union. Adds two geometries. Example: `box ++ sphere(1.2)`
- `+++`: RoundUnion. Adds two geometries and creates a smooth transition between them, with an argument smoothing coefficient. Example:`box +++(.75) sphere(1.2)`.
- `++++`: StairsUnion. Adds two geometries and creates a stepped transition, with argument transition size and number of steps. Example:`box ++++(.35,6) sphere(1.2)`
- `--`: Difference. Subtracts two geometries. Example: `box -- sphere(1.2)`
- `---`: RoundDifference. Subtracts two geometries and creates a smooth transition between them, with an argument smoothing coefficient. Example:`box ---(.75) sphere(1.2)`.
- `----`: StairsDifference. Subtracts two geometries and creates a stepped transition, with argument transition size and number of steps. Example:`box ----(.35,6) sphere(1.2)`
- `**`: Intersection. Creates the intersection of two geometries. Example: `box *** sphere(1.2)`
- `***`: RoundIntersection. Intersects two geometries and creates a smooth transition between them, with an argument smoothing coefficient. Example:`box ***(.75) sphere(1.2)`.
- `****`: StairsIntersection. Intersects two geometries and creates a stepped transition, with argument transition size and number of steps. Example:`box ****(.35,6) sphere(1.2)`

### Modifiers
Modifiers are (mostly) single-character operators to modify the geometry, combinator, or modifier to their left. The `@`Rotate, `>`Translate, `#`Repeat, and `|`Mirror operators can be used with `xyz` *decorators* to specify which dimensions the operator will be applied to. For example, `box >x .5` will only translate on the x axis, while `sphere #yz 2` will repeat on the y and z axes. If no decorations are applied, the operation will be applied on all axes by default. 

- `'`: Scale. A uniform scaling coefficient. Example: `julia'2`
- `@`: Rotate. Rotate on all three axes by an argument amount. Example: `box@time*15`
- `@@`: Rotate (axis/angle). Rotate an argument number of degrees around an argument axis. Example: `box@(45,1,0,0)`
- `>`: Translate. Move along three axes. Example: `sphere>(1,0,0)`
- `#`: Repeat. Repeat on all three axes. Example: `sphere # 3`
- `##`: PolarRepeat. Repeat in a circle. Example (12 repeats, radius of 1): `(sphere(.2) ##(12,1)) @ (90,1,0,0)`
- `|` : Mirror. Mirrors the geometry. Example: `julia(time)'2 |`
- `:`: Color. Apply a color preset. Colors include `red`, `green`, `blue`, `cyan`, `magenta`, `yellow`, `white`, `black`, `grey`.
- `::`: Texture. Apply texture preset. Textures include `rainbow`, `stripes`, `dots`, `truchet`, `noise`, `cellular`, `zigzag`, and `voronoi`. Example: `box::truchet`. All textures also have two optional parameters: *scale*, which determines the scaling of procedural textures, and *uv* which is a three-item list that specifies offsets to look up texture values. Example: `box::rainbow( 10, (sin(time),0,.5))`

### Variables

- *time*: The time since the environment was loaded, measured in seconds. Example: `sphere(1 + sin(time) * .25)`
- *mousex*: The x position of the mouse mapped from 0--1. Example: `sphere(mousex)`
- *mousey*: The y position of the mouse mapped from 0--1. Example: `sphere | mousey * 6`
- *low*: Low frequency analysis of audio input mapped to 0--1. Example: `sphere(low)`
- *mid*: Mid frequency analysis of audio input mapped to 0--1. Example: `box(mid)`
- *high*: High frequency analysis of audio input mapped to 0--1. Example: `box@(high*90, low, 0, mid)`
- *i*: A special variable only used in loops that equals the current loop iteration number, starting at 0.

### Math
Note: traditional parenthesis `()` do not currently work in math expressions, as they're currently used by the language to group combinators, geometries, and modifiers together... this is a todo to fix.

- `+` Addition. Adds two numbers/variables together.
- `-` Subtraction. Subtracts two numbers/variables together.
- `*` Multiply. Multiplies two numbers/variables together.
- `/` Divide. Divide two numbers / variables.
- `%` Modules. Calculates the remainder of dividing two numbers.
- *sin*: Calculate the sin of the arugment. Example: `sphere( .5 + sin(time) * .35 )`
- *cos*: Calculate the cosine of the arguments. Example: `box | 3 + sin(time)`
- *random*: Generates a random number from 0--1. Example: `sphere( .5 + random() * .5)`
- *round*: Rounds a number.
- *floor*: Rounds down a number.
- *ceil*: Rounds up a number.
- *abs*: Gets the absolute value for a number.

### Misc
- `[ initialGeometry numberOfIterations modifications ]` Loop. This lets you apply a chain of modifications
to a geometry multiple times, which is useful to quickly create fractal-like shapes. You can use the special `i` variable in math expressions to represent the current loop iteration number. Example: `[octahedron(.125) 8 >(.25,.1,.05) @(45,cos(i+time/3),0,1) |0]`

