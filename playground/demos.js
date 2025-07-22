const demos = [
`render = repeat.low 
fog = .5
 
field = sphere(.1):black::dots(30) @time*40 # .4 
field >z time * -.125`,

`camera = (0 0 3)
post = (antialias)
zoom = .4
background = (1 1 1) 
foreground = (5 0 0) 
 
s = [cylinder((.01,.1)) 7 >.0125+i*.05 @sin(i+time/20)*360 ||.0001]
s = sphere(1.5)---s@time*10
s = s::rainbow(5 (0 .0 0) .25)
s +++ plane((0 0 1)):color(5 0 0)`,

/*
`render = fractal.med
lighting = ( light( (0 0 5) (1 1 1 ) .25) )
(julia(time/5):color(1 0 0) || >.5 || .25 ||) @y time*10 ' 1.25`,

`render = med
fog = (.4 .25 0 0) background = (.25 0 0)
ring = cylinder((.125,3)) ###(20 1)
ring:red::stripes(5 (0 time/6 0)) 
ring @x 90 @y time*20 ++ plane::checkers`,
*/

`post = ( antialias focus(.1) bloom(.9 1.3) )
camera = (0 0 5)
fg = (1 1 1)
fog = -.15
zoom = .25
m = mandelbox(.1 3 5) @z time*10 ## 3
m >z time/3`,

`render = fractal.kindaclose
fog = (1 0 0 0)
camera = (0 0 .65)
post = (bloom(.55 1.25))
[torus((1,.05)):white 10 >xy i*.125 @i*10*sin(time/6) ||(.001)] '.035 @y time*10`,

`render = voxel.low
fog = (.2 0 .3 0)
background = (0 .3 0)
camera = (0 0 time*-.1)
post = (invert(1), focus(.0, .05) )
sphere ::rainbow( .5 ) '1.5 + sin(time/4) * .2 # 3`,

`// hit alt+c (option+c in macos) and then use
// the wasd and arrow keys to navigate the scene.
// hit alt+c again when you're done
render = repeat.med
fog = .15
post = (edge invert(1) bloom(.8 1.3) motionblur(.75))
camera=(1 1 5)
zoom = .4
fg = (1 0 0)
s=[sphere(.025+low*.025) >0 9 >i*i*.1 @i*i+time ||.00025]
s+++sphere(2.5+low(.95))`,

`// this demo uses the hydra live coding language
// to texture a fractal. 
render = fractal.med fog = .125

// every thing between the \` characters is 
// javascript. you can re-run the hydra block
// without needing to recompile the main screamer
// shader
hydra\`
  osc(5,.25,.5).kaleid(6).out()
\`

container = sphere(2):blackhole
fractal = mandelbox(.75, 3+sin(time/2)) '.5 ::hydra :white
fractal @y time*10
container --- fractal`,

` // move your mouse around the window center
post = ( edge, invert(1) )
( box:red ---- box:green'mousey/4 #.2+mousex/3 ) '1.6 @yz time*15`,

/*
`render = repeat.low
camera = (0 0 time*-.15)
fog = (.5 0 0 0)
  
cross = cylinder((1,1.5)) ::dots
cross = cross ++ (cylinder((.95 1.5))::stripes( 1 )) @z 90
cross = cross ++ (cylinder((.95 1.5))::checkers( 5 )) @x 90
cross '.15 @@( time*45,1,.5,.5 )
cross # .75`,

`post = (focus(.125))
fog = .05
s = sphere(1.5):red:::voronoi(0.1 3+sin(time/4)*2 (time/4 0 0)) @ time*20
s ++ plane((0 0 1) .25 ):red::cellular(1 (time/4 0 0))`,
*/

`// requires microphone access
// shushing sounds work great!
render = fractal.med
zoom = .35
mandalay( high(.9)*5, .25, 4 )'.75 @z time*5 ::rainbow(.3)`,

`fog = (.05 1 0 0)
background = (.5 0 .25)
zoom = .35
post = ( antialias )
 
head = sphere :magenta
ears = sphere'.25 > .75:red |x
mouth = torus((.35,.05)) >(0,-.5,.55) @x 30 :green
nose = sphere'.1 > (0 0 1) :red >y -.1
 
pupil = sphere:black '.1 >(.25 .15 .95)
eye  = pupil ++ sphere:glue '.5 >(.25 .15 .5)
eyes = eye |x
face = ((head ++++(.2 3) ears ) ++(.05) mouth) ++ nose ++ eyes
face >x 1.85 >z .35 >y -1.25
 
body = ((sphere'.9 #x 1.5):magenta *** capsule((-1.5,0,0) (1.5,0,0))'1.45)::dots(10):magenta >x -1.5 >y -1.7
 
face @y sin(time)*20
 
(face+++(.075) body) >y 1.25 >z .5 ++ plane:red`
]

export { demos }
