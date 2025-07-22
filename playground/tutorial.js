const tutorial = 
`// place your cursor in the line below and hit Ctrl+Enter
sphere

// also try box, cone, cylinder, julia, mandelbox...
// feel free to edit and try each one
box

// bigger sphere?
sphere'1.5

// bigger cone?
cone'5

// repeated boxes?
box # 3

// smaller boxes, more repeats
box'.1 # .4

// repeat on one axis
box'.2 #x .5

// repeat on two axes
box'.2 #xy .5

// we can specify better render settings for large repeats
// run these lines one by one. alternatively you can run the 
// code block your cursor is inside of using Alt+Enter; the block
// is defined as having blank lines on both sides of it. this
// the quickest way to run most examples in this tutorial...
// just click in a block and hit alt+enter.
render = repeat.med
box '.1 # .4

// a little fog makes things purdy
// first, the amount of fog, then, the color
// screamer will also remember your last used
// render settings (repeat.med)
fog = (.25,0,0,0)
sphere '.1 # .4

// play with your mouse
sphere ' mousex # mousey * 4

// animate with time
fog = (0,0,0,0)
sphere ' 1 + sin(time)

// combine two shapes
sphere'1.3 ++ box

// smoother
sphere'1.3 +++ box

// stepped
sphere'1.3 ++++ box

// rotate on all axes
sphere'1.3 ++++ box @ time * 30

// rotate on y-axis
sphere'1.3 ++++ box @y time * 30

// group with parenthesis and rotate
// rotateAngleAxis (@@) takes an angle in degrees, 
// followed by an xyz axis.
(sphere'1.3 ++++ box) @@(time*20, sin(time), 1, 0)

// get the difference of two shapes
box -- julia

// animate julia fractal folding and rotate
(box -- julia( 4 + sin(time ))'1.3 ) @y time*20 '1.35

// in the above example, it might be a bit hard to read... we
// can assign parts to variables to make it more readable
myshape = box -- julia( 4 + sin( time ) ) ' 1.3
myshape @y time*20
myshape ' 1.35

// color julia red,green,blue,cyan,magenta,yellow,black,white,grey
julia(time)'2.5 : red

// texture julia
render = fractal.med
fog = (.125,0,0,0)
julia( 5+sin(time/3) ) '2 : red :: stripes

// texture boxes
render = repeat.med
fog = (.25,0,0,0)
box '.2 ::rainbow @y time*20 # .75

// hit alt+c, then use WASD and the arrow keys to explore
// hit alt+c again to resume editing

// subtract a repeat
fog = (0,0,0,0)
box:red -- box:green '.125 #.3

// smooth out the jaggies with post-processing
post = ( antialias(3) )
(box:red -- box:green'.1#.3) @yz time*5

// fun with postprocessing and mouse
post = ( edge, invert(1) )
(box:red -- box:green'mousey/4#.2+mousex/3)'1.6 @yz time*15

// use low and high audio analysis to drive fractal
// the first time you use the low,med,or high variables
// your browser will request permission to access your
// audio input. shushing into your mic works well for 
// this demo :)
post   = ()
render = fractal.med
mandalay( high*5, low/4, 2 )'.75 @z time*5 ::rainbow

// mirror a julia
julia(time)'2 |

// mirror a box
box |

// hmmm... it does nothing?
// this is because a centered
// box is symmetrical, so you
// don't see the effects of
// mirroring. try translating
// and then mirroring.
box(.25) >(.35,.5,0) |

// just repeat on one axis
box(.25) >(.35,.5,0) |x

// more mirrors please
// run these lines one at a time
oct = octahedron(.2):red >x.25 |
oct = oct >(.6,.5,.4) |xy
oct = oct @@(time, 0, sin(time), cos(time/1.5) ) |xz
oct = oct >.5 |
oct = oct '1.25

// it's fun to chain a bunch
// of these mirrors together, but it
// can get hard to read / think about.
// as an alternative, screamer 
// provides a loop [] operator.
// here's 8 loops of translations,
// rotations, and scalings. you can use
// the variable i to refer to the current
// loop number for calculations.
render = high
post = ( antialias, focus(.1,.025) )
[octahedron(.125) 8 >(.25,.1,.05) @@(45,cos(i+time/3),0,1) | ]

// for a more complete reference see
// https://charlieroberts.github.io/screamer-docs/index.html
`
export default tutorial
