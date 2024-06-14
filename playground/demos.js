const demos = [
`render = repeat.med 
fog = (.5 0 0 0)
camera = (0 0 time*.25)

sphere(.1)::dots(30)@time*40 # .4 
`,

`render = fractal.med
camera = (0 0 4)
post = ( antialias )
(julia(time/2):red || >.5 || .25 ||) @y time*10
`,

`render = fractal.kindaclose
fog = (1 0 0 0)
camera = (0 0 .65)
post = (bloom(.55 1.25))
[torus((1,.05)):white 10 >xy i*.125 @i*10*sin(time/6) ||(.001)] '.05 @y time*10
`,

`render = voxel.med
fog = (.2 0 .3 0)
background = (0 .3 0)
camera = (0 0 time*-.1)
post = (invert(1), focus(.0, .05) )
sphere::rainbow( .5 ) '1.5 + sin(time/4) * .2 # 3`,

` // move your mouse around the window center
post = ( edge, invert(1) )
( box:red -- box:green'mousey/4 #.2+mousex/3 ) '1.6 @yz time*15
`,

`render = repeat.med
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
post = ( antialias(2) )
 
head = sphere :magenta
lear = sphere'.25 > .75:red
rear = sphere'.25 >(-.75,.75,.75):red
mouth = torus((.35,.05)) >(0,-.5,.55) @x 30 :green ++ torus((.35,.05)) >(0,-.6,.55) :green
nose = sphere'.1 > (0 0 1) :red >y -.1
lpupil = sphere:black '.1 >(-.25 .15 .95)
leye = lpupil ++ sphere:glue '.5 >(-.25 .15 .5)
rpupil = sphere:black '.1 >(.25 .15 .95)
reye = rpupil ++ sphere:glue '.5 >(.25 .15 .5)
face = ((head ++++(.2 3) lear ++++(.2 3) rear) ++(.05) mouth) ++ nose ++ leye ++ reye
face >x 1.85 >z .35 >y -1.25
 
body = sphere'.9 >y -1.35 >x .25::dots(2)
body = body ++ sphere '.8 >y -1.5 >x -1.::dots(6)
body = body ++ sphere '.5 >(-2,  -1.85,.25) ::dots(8)
body = body ++ sphere '.3 >(-2.5,-2,   .5)::dots(10)
body = body +++ sphere '.15 >(-2.4, -2.15, 1.05) ::dots(5)
face @y sin(time)*15
(face +++(.075) body:magenta) >y 1.25 >z .5 ++ plane:red ++ plane((0 0 1)):red
`

]

export { demos }
