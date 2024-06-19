const demos = [
`render = repeat.low 
fog = (.5 0 0 0)
camera = (0 0 time*.25)

sphere(.1) ::dots(30) @time*40 # .4 
`,

`render = fractal.med
camera = (0 0 4)
post = ( antialias )
(julia(time/2):red || >.5 || .25 ||) @y time*10
`,

`render = med
fog = (.4 .25 0 0) background = (.25 0 0)
ring = cylinder((.125,3)) ###(20 1)
ring:red::stripes(5 (0 time/6 0)) 
ring @x 90 @y time*20 ++ plane::checkers`,

`render = fractal.kindaclose
fog = (1 0 0 0)
camera = (0 0 .65)
post = (bloom(.55 1.25))
[torus((1,.05)):white 10 >xy i*.125 @i*10*sin(time/6) ||(.001)] '.035 @y time*10
`,

`render = voxel.low
fog = (.2 0 .3 0)
background = (0 .3 0)
camera = (0 0 time*-.1)
post = (invert(1), focus(.0, .05) )
sphere ::rainbow( .5 ) '1.5 + sin(time/4) * .2 # 3`,

` // move your mouse around the window center
post = ( edge, invert(1) )
( box:red -- box:green'mousey/4 #.2+mousex/3 ) '1.6 @yz time*15
`,

`render = repeat.low
camera = (0 0 time*-.15)
fog = (.5 0 0 0)
  
cross = cylinder((1,1.5)) ::dots
cross = cross ++ (cylinder((.95 1.5))::stripes( 1 )) @z 90
cross = cross ++ (cylinder((.95 1.5))::checkers( 5 )) @x 90
cross '.15 @@( time*45,1,.5,.5 )
cross # .75
`,

`// requires microphone access
// shushing sounds work great!
render = fractal.med
fft = 4096
mandalay( high*5, .25, 4 )'.75 @z time*5 ::rainbow(.3)
`,


`fog = (.05 1 0 0)
background = (.5 0 .25)
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
 
(face+++(.075) body) >y 1.25 >z .5 ++ plane:red
`
]

export { demos }
