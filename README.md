# Screamer
*Screamer* is a declarative live coding language for creating visuals using ray marching. It builds on top of [marching.js](https://charlieroberts.github.io/marching), a JavaScript library that compiles GLSL shaders. In comparison to marching.js, screamer is intended to be more concise and enable faster iteration / experimentation.

In music, a "screamer" is a sped-up march used in circuses to ["stir audiences into a frenzy"](https://en.wikipedia.org/wiki/Screamer_(march)).

![A 3D scene rendered with feedback textures](https://github.com/user-attachments/assets/f78fd4cb-4e18-4fc3-932b-030ccd2dae18)

## Play
[Try the playground](https://charlieroberts.github.io/screamer/playground). Here's a few keyboard commands worth knowing. Use cmd and option in macOS instead of ctrl/alt:

- `Ctrl+Enter`: Execute the current line (as defined by where the cursor is placed).
- `Shift+Ctrl+Enter`: Execute all lines.
- `Alt+Enter`: Execute current code "block". Blocks are delimited by blank lines in the editor. 
- `Ctrl+.`: Clear the current scene.
- `Alt+C`: Enable camera controls. Use WASD + the arrow keys to move through the 3D scene. Hit `Alt+C` again to disable the controls and return to editing.

## Use
The [`standalone.html`](https://charlieroberts.github.io/screamer/standalone.html) file shows an example of how to use screamer in your own webpage. 

## Reference
[Read / play with the interactive reference](https://charlieroberts.github.io/screamer-docs/index.html). The reference will describe all the various functions found in screamer. In general, its main programmatic elements are:

- *Configuration*: Used to control global properties of the renderer, for example, post-processing effects and render quality. Applies to all subsequent renderings.
- *Geometries*: mmmm enough said
- *Combinators*: Operators used to combine geometries or to nest combinators.
- *Modifications*: Single-character operators to transform geometries and combinators in various ways.
- *Variables*: Values that change over time that can be modified with math expressions; these changes are declared once and then applied continuously ("reactive" programming).
- *Math*: A small assortment of operators and functions primarily intended to manipulate variables over time.
