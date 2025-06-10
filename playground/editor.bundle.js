const demos = [
`render = repeat.low 
fog = .5
 
field = sphere(.1)::dots(30) @time*40 # .4 
field >z time * -.125`,

`render = fractal.med
lighting = ( light( (0 0 5) (1 1 1 ) .25) )
(julia(time/5):color(1 0 0) || >.5 || .25 ||) @y time*10 ' 1.25`,

`render = med
fog = (.4 .25 0 0) background = (.25 0 0)
ring = cylinder((.125,3)) ###(20 1)
ring:red::stripes(5 (0 time/6 0)) 
ring @x 90 @y time*20 ++ plane::checkers`,

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
( box:red -- box:green'mousey/4 #.2+mousex/3 ) '1.6 @yz time*15`,

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

`// requires microphone access
// shushing sounds work great!
render = fractal.med
fft = 4096
mandalay( high*5, .25, 4 )'.75 @z time*5 ::rainbow(.3)`,


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
 
(face+++(.075) body) >y 1.25 >z .5 ++ plane:red`
];

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
// https://charlieroberts.github.io/screamer
`;

const intro = `<p>Welcome to <i>screamer</i>, a live-coding language for strange art. A screamer is a sped-up circus march composed to <a href="https://en.wikipedia.org/wiki/Screamer_(march)" target=_blank>"to stir audiences into a frenzy"</a>; this language uses a technique called raymarching to render graphical oddities.</p>

<p>Coding on this site targets desktops, but mobile users can
click through demos using the "Next Demo >>" button in 
the top right corner (this button is only available
on mobile, desktop users can hit alt+l). Adventurous mobile users
can also evaluate code using the $ key, or normal key
combos if you have an external keyboard connected to your mobile device.</p>

<p>Key commands are as follows (replace "alt" key with "option"
key in macOS):</p>

<ul>
<li><pre>alt + l</pre> loads the next demo
<li><pre>ctrl + enter</pre> executes a line
<li><pre>alt + enter</pre> executes a block
<li><pre>shift + enter</pre> executes a block and resets default config
<li><pre>ctrl + .</pre> clears the scene
<li><pre>alt + c</pre> enables WASD + arrow keys camera control
</ul>

Whenver code is executed, the URL for the site is updated to include your code; just copy the link from your address bar to share your creation.

<p>For more help, see:</p>
<a href="https://charlieroberts.github.io/screamer-docs">Interactive reference</a><br>
<a href="https://charlieroberts.github.io/screamer/playground/?tutorial" target=_blank>Tutorial</a><br>
<a href="https://discord.gg/JfFVSr8RhH">Discord server</a><br>

<p>Click outside this panel to dismiss it. Have fun!</p>`;

const globals = {};

// ernie's favorite number
const EFN = 8243721;

const mods = {
  '\'': 'scale',
  '\'\'':'scaleBy', 
  '#':  'Repeat',
  '###':'PolarRepeat',
  '##': 'SmoothRepetition',
  ':':  'material',
  '::': 'texture',
  ':::':'bump',
  '>':  'translate',
  '>>': 'moveBy',
  '@':  'rotateDims',
  '@@': 'rotate',
  '|':  'Mirror',
  '||': 'SmoothMirror',
  '~':  'Twist'
};
 
const mouse = { x:0, y:0 };

const vecMembers = ['x','y','z','w'];

const screamer = {
  __i:0,
  DO_NOT_RESET_CAMERA:false,
  
  config : {
    shadow: .2,
    foreground:null,
    render: 'med',
    fog: [0,0,0,0],
    background:[0,0,0],
    post: [],
    voxel:.1,
    camera: [0,0,5],
    fft: 512,
    lighting:null,
    zoom:null
  },

  textures: {},

  init( shouldInitHydra = true ) {
    window.onpointermove = function(e) {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
    };

    if( shouldInitHydra ) screamer.initHydra();

    return this
  },

  isVarying( func, varies=false, a=null, b=null ) {
    func.varies = func.varies || varies || (a !== null && a.varies ) || (b !== null && b.varies );
  },

  mathwalk( obj ) {
    let out = EFN;
    const varies = screamer.isVarying;
    if( Array.isArray( obj ) ) { 
      if( obj.length > 1 ) {
        const a = screamer.mathwalk( obj[2] );
        const b = obj[3] !== undefined ? screamer.mathwalk( obj[3] ) : null;

        let lastlow = 0, lastmid = 0, lasthigh = 0;
        const op = obj[1];                  
        switch( op ) {
          case '+': 
            out = t => a( t ) + b( t );
            varies( out, false, a, b );
            break
          case '-':
            out = t => a( t ) - b( t ); 
            varies( out, false, a, b );
            break
          case '*':
            out = t => a( t ) * b( t ); 
            varies( out, false, a, b );
            break
          case '/':
            out = t => a( t ) / b( t ); 
            varies( out, false, a, b );
            break
          case '%':
            out = t => a( t ) % b( t ); 
            varies( out, false, a, b );
            break
          case '^':
            out = t => Math.pow(a( t ), b( t )); 
            varies( out, false, a, b );
            break
          case 'sin':
            out = t => Math.sin( a( t ) );
            varies( out, false, a );
            break
          case 'sinn':
            out = t => .5 + Math.sin( a( t ) ) * .5;
            varies( out, false, a );
            break
          case 'cos':
            out = t => Math.cos( a( t ) );
            varies( out, false, a );
            break
          case 'cosn':
            out = t => .5 + Math.cos( a( t ) ) * .5;
            varies( out, false, a );
            break
          case 'round':
            out = t => Math.round( a( t ) );
            varies( out, false, a );
            break
          case 'random':
            out = t => Math.random();
            varies( out, false );
            break
          case 'floor':
            out = t => Math.floor( a( t ) );
            varies( out, false, a );
            break
          case 'ceil':
            out = t => Math.ceil( a( t ) );
            varies( out, false, a );
            break
          case 'abs':
            out = t => Math.abs( a( t ) );
            varies( out, false, a );
            break
          case 'low':
            // .start() is a null operation if audio
            // has already been initialized
            Marching.FFT.start();
            Marching.FFT.windowSize = screamer.config.fft;

            out = t => {
              lastlow = Marching.FFT.low * (1.0 - a(t)) + lastlow * a(t);
              return lastlow
            };
            varies( out, true );
            break
          case 'mid':
            Marching.FFT.start();
            Marching.FFT.windowSize = screamer.config.fft;
            
            out = t => {
              lastmid = Marching.FFT.mid * (1.0 - a(t)) + lastmid * a(t);
              return lastmid
            };

            varies( out, true );
            break
          case 'high':
            Marching.FFT.start();
            Marching.FFT.windowSize = screamer.config.fft;

            out = t => {
              lasthigh = Marching.FFT.high * (1.0 - a(t)) + lasthigh * a(t);
              return lasthigh
            };

            varies( out, true );
            break
          case 'fade':
            const _a = obj[2][0] || 120, 
                  _b = obj[2][1] || 0, 
                  _c = isNaN(obj[2][2]) ? 1 : obj[2][2];
            let counter = 0;
            out = t => {
              if( counter++ < _a ) {
                if( _b < _c ) {
                  return _b + ((counter/_a) * (_c-_b))
                }else {
                  return _b - ((counter/_a) * (_b-_c))
                }
              }else {
                return _c
              }
            };
            varies( out, true );
            break
        }
      }else {
        out = screamer.mathwalk( obj[0] );
      }
    }else if( typeof obj === 'string' ) {       
      switch( obj ) {
        case 'i' : 
          const i = screamer.__i;
          out = t => i;
          break
        case 'time': 
          out = t => t;
          varies( out, true );
          break
        case 'mousex': 
          out = t => mouse.x;
          varies( out, true );
          varies( out, true );
          break
        case 'mousey': 
          out = t => mouse.y;
          varies( out, true );
          break
        case 'low':
          // .start() is a null operation if audio
          // has already been initialized
          Marching.FFT.start();
          Marching.FFT.windowSize = screamer.config.fft;
          out = t => Marching.FFT.low || 0; 
          varies( out, true );
          break
        case 'mid':
          Marching.FFT.start();
          Marching.FFT.windowSize = screamer.config.fft;
          out = t => Marching.FFT.mid || 0;
          varies( out, true );
          break
        case 'high':
          Marching.FFT.start();
          Marching.FFT.windowSize = screamer.config.fft;
          out = t => Marching.FFT.high || 0;
          varies( out, true );
          break
        default:
          const isGlobal = globals[ obj ] !== undefined;

          if( !isGlobal ) {
            if( obj === '.' ) {
              throw SyntaxError(`Did you forget a number before or after a . ?`)
            }else {
              throw ReferenceError(`The word "${obj}" is not a keyword in screamer, and not a variable that has been assigned a value`)
            }
          }else {
            throw SyntaxError(`The variable "${obj}" contains a geometry or combinator, and cannot be used in a math expression.`)
          }

      }
    }else {
      const val = obj === null ? null : parseFloat( obj );
      out = t => val; 
      varies( out, false );
    }

    return out
  },

  
  walkers: {
    assignment( obj ) {
      let out = obj;
      if( obj[1].indexOf('.') === -1 ) {
        globals[ obj[1] ] = screamer.walk( obj[2] );
        out = globals[ obj[1] ];
      }else {
        const split = obj[1].split('.');
        let value = screamer.walk( obj[2] ),
          __obj = globals[ split[0] ];

        if( typeof value === 'function' ) {
          let __value = value;

          Marching.postrendercallbacks.push( t => {
            __obj[ split[1] ] = __value( t );
          });

          value = value(0);
        }else if( Array.isArray( value ) ) {
          const vec = window[ `Vec${value.length}` ](0);

          for( let i = 0; i < value.length; i++ ) {
            const v = screamer.mathwalk( value[ i ] );
            if( typeof v === 'function' ) {
              const fnc = time => {
                vec[ vecMembers[ i ] ] = v( time );
                __obj[ split[1] ] = vec;
              };
              Marching.postrendercallbacks.push( fnc );

              vec[ vecMembers[i] ] = v(0);
            }else {
              vec[ vecMembers[i] ] = v;
            }
          }
          __obj[ split[1] ] = vec;
        }

        out = false;
      }
      
      return out
    },

    color( obj ) {
      return false
    },

    combinator( obj ) {
      const constructor = window[ obj[1] ];
      const args = [];
      for( let i = 2; i < obj.length; i++ ) {
        const isList = Array.isArray( obj[ i ] ) && obj[i].length !== 0; 
        if( isList ) {
          if( i === 4 ) {
            obj[i].forEach( v => {
              args.push( Array.isArray(v) ? screamer.walk(v) : v );
            });
          }else {
            args.push( screamer.walk( obj[ i ] ) );
          }
        }else {
          if( !Array.isArray( obj[i] ) ) {
            if( obj[i] !== null && obj[i] !== undefined )
              args.push( screamer.walk( obj[ i ] ) );
          }else {
            args.push( ...obj[i] );
          }
        }
      }

      return constructor( ...args )
    },

    comment() { return false },

    config( obj ) {
      if( obj[1] === 'lighting' ) {
        const lights = obj[2].values;

        screamer.config.lighting = [];

        for( const __light of lights ) {
          const lightdesc = __light[1][1];
          
          const light = Light( 
            Vec3(...lightdesc[0][1]), 
            Vec3(...lightdesc[1][1]), 
            lightdesc[2] || 1 
          );

          screamer.config.lighting.push( light );

          const posfncs = lightdesc[0][1].map( screamer.mathwalk );
          const colfncs = lightdesc[1][1].map( screamer.mathwalk );
          Marching.postrendercallbacks.push( time => {
            if( posfncs[0].varies ) light.pos.x = posfncs[0]( time );
            if( posfncs[1].varies ) light.pos.y = posfncs[1]( time );
            if( posfncs[2].varies ) light.pos.z = posfncs[2]( time );
            if( colfncs[0].varies ) light.color.x = colfncs[0]( time );
            if( colfncs[1].varies ) light.color.y = colfncs[1]( time );
            if( colfncs[2].varies ) light.color.z = colfncs[2]( time );
          });

          if( posfncs[0].varies !== true ) light.pos.x = posfncs[0]( 0 );
          if( posfncs[1].varies !== true ) light.pos.y = posfncs[1]( 0 );
          if( posfncs[2].varies !== true ) light.pos.z = posfncs[2]( 0 );
          if( colfncs[0].varies !== true ) light.color.x = colfncs[0]( 0 );
          if( colfncs[1].varies !== true ) light.color.y = colfncs[1]( 0 );
          if( colfncs[2].varies !== true ) light.color.z = colfncs[2]( 0 );

        }

        return false
      }

      if( obj[1] === 'post' ) {
        // correct for lists
        if( !Array.isArray( obj[2] )) { obj[2] = obj[2].values; }

        obj[2] = obj[2].map( (v,i) => {
          const func = v[0] === 'motionblur' 
                ? window.MotionBlur
                : window[ v[0][0].toUpperCase() + v[0].slice(1) ];

          let __args = [];
          
          // use postrender callbcaks to assign uniform values, 
          // leave constructor call empty, as setting values
          // before webgl is initialized will create problems
          // this means that all postprocessing properties are
          // reactive by default
          let cargs = null;
          if( v[1] !== null ) {
            cargs = v[1].map( vv => {
              let rvalue = 0;
              if( Array.isArray(vv) && vv[0].indexOf('vec') !== -1 ) {
                rvalue = vv[1].map( vvv => isNaN(vvv) ? 0 : vvv );
              }else if( !isNaN(vv) ) {
                rvalue = vv;
              }
              return rvalue
            });
          }
          const out = v[1] === null 
            ? func() 
            : func( ...cargs  );

          const desc = Object.getOwnPropertyDescriptors( out );

          let idx = 0;
          for( let key in desc ) {
            // avoid metadata
            if( key === '__wrapped__' ) continue

            if( v[1] !== null ) {
              __args = v[1].map( screamer.mathwalk );
              let num = idx++;
              
              // will be undefined if no value for this argument
              // has been passed to consructor
              if( __args[ num ] !== undefined ) {
                Marching.postrendercallbacks.push( time => {
                  out[ key ] = __args[ num ]( time );
                });
              }
            }
          }

          return out
        });
      }


      // test for string in case of render preset
      
      if( obj[1] === 'camera' ) {
        const camerafncs = obj[2].values.map( screamer.mathwalk );
        if( camerafncs.findIndex( f => f.varies === true ) !== -1 ) {
          Marching.postrendercallbacks.push( time => {
            if( camerafncs[0].varies ) camera.pos.x = camerafncs[0]( time );
            if( camerafncs[1].varies ) camera.pos.y = camerafncs[1]( time );
            if( camerafncs[2].varies ) camera.pos.z = camerafncs[2]( time );
          });
        }else {
          screamer.DO_NOT_RESET_CAMERA=true;
          setTimeout( ()=> {
            camera.pos.x = camerafncs[0]( 0 );
            camera.pos.y = camerafncs[1]( 0 );
            camera.pos.z = camerafncs[2]( 0 );
            screamer.DO_NOT_RESET_CAMERA=false;
          }, 0 );
        }

        obj[2].values = camerafncs.map( fnc => fnc(0) );
      }

      if( obj[1] === 'fog' ) {
        let fogfncs;
        if( obj[2].values === undefined ) {
          fogfncs = [ screamer.mathwalk( obj[2] ) ];
        }else {
          fogfncs = obj[2].values.map( screamer.mathwalk );
        }
        const runfog = time => {
          const fog = Marching.__scene.postprocessing[0];
          if( fogfncs[0].varies ) fog.amount   = fogfncs[0]( time );
          if( typeof fogfncs[1] === 'function' && fogfncs[1].varies ) fog.color.r = fogfncs[1]( time );
          if( typeof fogfncs[2] === 'function' && fogfncs[2].varies ) fog.color.g = fogfncs[2]( time );
          if( typeof fogfncs[3] === 'function' && fogfncs[3].varies ) fog.color.b = fogfncs[3]( time );
        };

        if( fogfncs.findIndex( f => f.varies === true ) !== -1 ) {
          Marching.postrendercallbacks.push( runfog );
        }else {
          setTimeout( ()=> {
            const fog = Marching.__scene.postprocessing[0];
            fog.amount   = fogfncs[0]( 0 );
            if( typeof fogfncs[1] === 'function' ) fog.color.r = fogfncs[1]( 0 );
            if( typeof fogfncs[2] === 'function' ) fog.color.g = fogfncs[2]( 0 );
            if( typeof fogfncs[3] === 'function' ) fog.color.b = fogfncs[3]( 0 );
          }, 0 );
        }
        // don't bother setting initial fog just use the render callback
      }

      if( obj[1] === 'foreground' ) {
        const c = obj[2].values;
        const m = Material( 'phong', Vec3(...(c.map( v=>v*.1))), Vec3(...c), Vec3(1), c[3] || 32, Vec3(0));
        screamer.config.foreground = m; 
      }

      const isPreset = Array.isArray( obj[2] ) 
        || (typeof obj[2] === 'string' || typeof obj[2] === 'number' );

      if( obj[1] !== 'foreground' )
        screamer.config[ obj[1] ] = isPreset ? obj[2] : obj[2].values;

      return false
    },

    geometry( obj ) {
      const constructor = window[ obj[1] ];
      const args = [];
      for( let i = 2; i < obj.length; i++ ) {
        const isArgList = Array.isArray( obj[ i ] ) && obj[i].length !== 0; 
        if( isArgList ) {
          args.push( ...obj[ i ].map( screamer.walk ));
        }else {
          if( !Array.isArray( obj[i] ) ) {
            if( obj[i] !== null && obj[i] !== undefined )
              args.push( screamer.walk( obj[ i ] ) );
          }else {
            // hmmm what is this?
            args.push( ...obj[i] );
          }
        }
      }

      // have to account for vectors, hence typeof check
      // but what happens to reactive vectors?
      // nothing.
      //
      args.map( f => {
        return f.varies ? f : typeof f === 'function' ? f(0) : f 
      });
      const geo = constructor( ...args );
      if( screamer.config.foreground !== null ) {
        geo.material( screamer.config.foreground );
      }

      return geo
    },

    hydra( obj ) {
      console.log( 'hydra:', obj[1] );
      new Function( obj[1] )();
      return false
    },

    loop( obj ) {
      let out = screamer.walk( obj[1] );
      const mods = obj[3];
      const count = obj[2];
      for( let i = 0; i < count; i++ ) {
        screamer.__i = i;
        out = screamer.walkers.mod( mods, out );
      }

      return out
    },

    math( obj ) { return screamer.mathwalk( obj ) },

    mod( obj, __geo = null ) {
      let out = null;
      
      let geo = __geo === null 
        ? screamer.walk( obj[1] )
        : __geo;
      
      // "normal" call vs call in loop
      const __mods = __geo === null
        ? obj[2]
        : obj;

      for( let mod of __mods  ) {
        let name = mod[0],
            dims = null,
            usesDims = false;
 
        if( Array.isArray( name ) ) {
          dims = name[ 1 ].split('');
          name = mods[ name[0] ];
          usesDims = true;
        }else {
          name = mods[ name ];
        }

        if( name === 'scale' 
          || name === 'translate' 
          || name === 'rotateDims'
          || name === 'rotate'
          || name === 'scaleBy' 
          || name === 'moveBy' ) {
          let args, isList = false;
          
          if( mod[1] === null ) {
            throw SyntaxError(`Are you missing an argument to your ${mod[0]} (${name}) modifier?`) 
          }
          if( mod[1].name === 'list' ) {
            args = mod[1].values.map( screamer.mathwalk );
            isList = true;
          }else {
            args = [];
            //args = screamer.mathwalk( mod[1] )
          }

          if( usesDims ) {
            if( dims.indexOf( 'x' ) !== -1 ) {
              args[0] = isList ? args[0] : screamer.mathwalk( mod[1] );
            }else {
              args[0] = null;
            }
            if( dims.indexOf( 'y' ) !== -1 ) {
              args[1] = isList ? args[1] : screamer.mathwalk( mod[1] ); 
            }else {
              args[1] = null;
            }
            if( dims.indexOf( 'z' ) !== -1 ) {
              args[2] = isList ? args[2] : screamer.mathwalk( mod[1] ); 
            }else {
              args[2] = null;
            }
          }

          if( isList ) {
            if( name !== 'rotateDims' ) {
              if( args.findIndex( v => v.varies === true ) !== -1 ) {
                Marching.postrendercallbacks.push( time => {
                  const __args = args.map( v => typeof v === 'function' ? v( time ) : v );
               
                  geo[ name ]( ...__args );
                });
              }else {
                geo[ name ]( ...(args.map( v => typeof v === 'function' ? v( 0 ) : v )) );
              }
              out = geo;
            }
          }else if( name === 'rotateDims' ) {
            // used to disable absolute rotations with axis/angle
            geo.transform.shouldRotate = false;

            const idx = geo.transform.__rotations.length;
            args[0] = screamer.mathwalk( mod[1] );

            const x = usesDims ? +!(dims.indexOf('x') === -1) : 1;
            const y = usesDims ? +!(dims.indexOf('y') === -1) : 1;
            const z = usesDims ? +!(dims.indexOf('z') === -1) : 1;
            
            if( args[0].varies ) {
              Marching.postrendercallbacks.push( time => {
                geo.transform.__rotations[ idx ] = Matrix.rotate( 
                  args[0]( time ), 
                  x,y,z
                );
                geo.transform.dirty = true;
              });


            }else {
              geo.transform.__rotations[ idx ] = Matrix.rotate( args[0]( 0 ), x,y,z );
            }

            // needed to determine indexing
            geo.transform.__rotations.length++;
            
            name = 'rotate';
            out = geo;
          }else {
            if( isList ) { 

              const __args = args.map( f => f.varies ? f : f(0) );
              out = geo[ name ]( ...__args  );
            }else {
              if( usesDims ) {
                out = geo[ name ]( ...args );  
              }else {
                let v = screamer.mathwalk( mod[1] );
                if( v.varies === false ) v = v(0); 
                out = geo[ name ]( v,v,v ); 
              }
            }
          }
        }else if( name === 'material' || name === 'texture' || name === 'bump' ) {
          if( Array.isArray( mod[1] ) ) {
            const materialName = typeof mod[1][1] === 'string' ? mod[1][1] : mod[1][0];

            // if arguments are passed to texture...
            if( name !== 'material' && mod[1][1] !== undefined && mod[1][1] !== null) {
              let idx = name === 'bump' ? 2 : 1;

              let scalefnc = null;
              if( mod[1][idx] !== undefined ) scalefnc = screamer.mathwalk( mod[1][idx] );
              let uvfncs = null;
              if( mod[1][idx+1] !== undefined ) {
                uvfncs = mod[1][idx+1][1].map( screamer.mathwalk );
              }
              let strengthfnc = null;
              if( mod[1][idx+2] !== undefined ) {
                strengthfnc = screamer.mathwalk( mod[1][idx+2] );
              }

              const props = { 
                scale: scalefnc !== null ? scalefnc( 0 ) : 1, 
                uv:    uvfncs !== null ? uvfncs.map( f => f( 0 ) ) : [0,0,0],
                strength: strengthfnc !== null ? strengthfnc( 0 ) : 1
              };
              const t = materialName === 'hydra'
                ? screamer.textures.hydra( props ) 
                : Texture( materialName, props ); 
              
              if( scalefnc !== null || uvfncs !== null ) {
                Marching.postrendercallbacks.push( time => {
                  if( scalefnc !== null && scalefnc.varies ) t.scale = scalefnc( time );  
                  if( uvfncs !== null  ) {
                    if( uvfncs[0].varies ) t.uv.x = uvfncs[0]( time );
                    if( uvfncs[1].varies ) t.uv.y = uvfncs[1]( time );
                    if( uvfncs[2].varies ) t.uv.z = uvfncs[2]( time );
                  }
                  if( strengthfnc !== null ) t.strength = strengthfnc( time );
                  if( materialName === 'feedback' ) t.update();
                });
              }

              if( name === 'bump' ) {
                out = geo.texture( t ).bump( t, mod[1][1] );
              }else {
                out = geo[ name ]( t ); 
              }
            }else {
              if( name === 'texture' ) {
                if( materialName !== 'hydra' ) {
                  if( materialName === 'feedback' ) {
                    const t = Texture( 'feedback' );
                    Marching.postrendercallbacks.push( time => {
                      t.update();
                    });
                    out = geo[ name ]( t );
                  }else {
                    out = geo[ name ]( materialName );
                  }
                }else {
                  //screamer.use( 'hydra' )
                  
                  if( typeof screamer.textures.hydra !== 'function' ) {
                    console.warn( `hydra wasn't loaded; we'll load it now. you can load hydra using ctrl+alt+h` );
                    out = geo;
                  }else {
                    if( screamer.libs.hydra === undefined ) {
                      console.warn( 'resetting hydra texture after clear. please re-run' );
                      out = geo;
                    }else {
                      const t = screamer.textures.hydra();
                      out = geo.texture( t );
                    }
                  }
                }
              }else if( name === 'bump' ) {
                const t = Texture( materialName );
                out = geo.texture( t ).bump( t, .1 );
              }else {
                // material
                if( Array.isArray( mod[1] )) {
                  // if color material is used with arguments...
                  const m = Material( 'phong', Vec3(...(mod[1][1].map( v=>v*.1))), Vec3(...mod[1][1]), Vec3(1), mod[1][1][3] || 32, Vec3(0));
                  out = geo[ name ]( m );
                }else {
                  out = geo[ name ]( materialName );
                }
              }
            }
          }else {
            out = geo[ name ]( mod[1] );
          }
        }else {
          // repeat / polarrepeat etc.
          if( mod[1] !== null ) {

            // process distance dimensions for Repeat
            if( name === 'Repeat' || name === 'SmoothRepetition' || name === 'Twist' ) {
              let args, isList = false;
              
              if( mod[1].name === 'list' ) {
                args = mod[1].values.map( screamer.mathwalk );
                isList = true;
              }else {
                args = [];
                //args = screamer.mathwalk( mod[1] )
              }

              const DNR = 123456; // do not repeat 
              if( usesDims ) {
                if( dims.indexOf( 'x' ) !== -1 ) {
                  args[0] = isList ? args[0] : screamer.mathwalk( mod[1] );
                }else {
                  args[0] = DNR;
                }
                if( dims.indexOf( 'y' ) !== -1 ) {
                  args[1] = isList ? args[1] : screamer.mathwalk( mod[1] ); 
                }else {
                  args[1] = DNR;
                }
                if( dims.indexOf( 'z' ) !== -1 ) {
                  args[2] = isList ? args[2] : screamer.mathwalk( mod[1] ); 
                }else {
                  args[2] = DNR;
                }

                // are we repeating on all three axes?
                const is3Dim = args.indexOf( DNR ) === -1;

                args = args.map( v => { return v.varies ? v : typeof v === 'function' ? v(0) : v });

                if( is3Dim ) {
                  // use 3D repeat
                  out = window[ name ]( geo, Vec3(...args) );
                }else {
                  // use individual repeats as needed
                  out = geo;
                  if( args[0] !== DNR ) {
                    out = window.RepeatX( out, args[0] );
                  }
                  if( args[1] !== DNR ) {
                    out = window.RepeatY( out, args[1] );
                  }
                  if( args[2] !== DNR ) {
                    out = window.RepeatZ( out, args[2] );
                  }
                }
              }else {
                args = isList ? args : screamer.mathwalk( mod[1] ); 
                if( isList ) 
                  args = args.map( v => v.varies ? v : v(0) ); 
                else
                  args = args.varies ? args : args(0);

                if( name === 'Twist' ) {
                  const fnc   = Array.isArray( args ) ? args[0] : args;
                  const twist = window.Twist( geo, Vec2( fnc,0 ) );
                  
                  if( fnc.varies )
                    Marching.postrendercallbacks.push( t => twist.amount.x = fnc(t) );
                  
                  out = geo = twist;
                }else {
                  out = window[ name ]( geo, isList ? Vec3(...args) : args );
                }
              }
            }else { 
              if( name === 'SmoothMirror' ) {
                let isList = mod[1].name === 'list'; 
  
                dims = dims === null ? 'xyz': dims.join('');
                dims.length;

                //if( isList ) {
                  
                  // TODO: fix so smoothmirror can accept different
                  // arguments on different axes (this is a marching.js fix)
                 
                  //const __args = mod[1].values.map( screamer.mathwalk )
                  //console.log( 'args:', __args )
                  //out = isList && count !== 1
                  //  ? window[ name ]( geo, window['Vec'+count]( ...__args ), dims )
                  //  : window[ name ]( geo, screamer.mathwalk( mod[1].values[0] ), dims )
                //}else{
                if( isList ) {
                  const l = mod[1].values.length;
                  mod[1] = mod[1].values[0];
                  if( l !==1 )
                    console.warn( 'smoothmirror only accepts a single smoothness value for all axes.');
                }
                let __args = screamer.mathwalk( mod[1] );
                if( __args.varies === false ) __args = __args(0);

                out = window[ name ]( geo, __args, dims );
                //}
              }else {
                out = typeof mod[1] === 'object' && typeof mod[1].values !== 'function'
                  ? window[ name ]( geo, ...mod[1].values.map( screamer.mathwalk ) )
                  : window[ name ]( geo, screamer.mathwalk( mod[1] ) );
              }
            }
          }else {
            // mirror
            if( name === 'Mirror' || name === 'SmoothMirror' ) {
              dims = dims === null ? 'xyz': dims.join('');

              if( name === 'Mirror' )
                out = window[ name ]( geo, dims );
              else
                out = window[ name ]( geo, .03, dims ); 
            }else {
              if( mod[1] === null ) {
                throw SyntaxError(`Are you missing an argument to your ${mod[0]} (${name}) modifier?`) 
              }
              // what is this for?
              out = window[ name ]( geo );
            }
          }
        }
      }

      return out
    },

    string( obj ) { 
      const isGlobal = globals[ obj ] !== undefined;
      const out = isGlobal ? globals[ obj ] : screamer.mathwalk( obj );


      
      if( out === EFN ) throw ReferenceError(`The word ${obj} is not a keyword in screamer, and it is not a variable that has been assigned a value`)

      return out
    },

    vec( obj ) {
      const len = obj[1].length;
      const args = obj[1].map( screamer.mathwalk ).map( f => f.varies ? f : f(0) );

      return window[ 'Vec'+len ]( ...args )
    }
  },

  walk( obj ) {
    let out = obj;
    const isFnc = obj[0] in screamer.walkers;

    if( !isFnc ) {
      if( typeof obj[0] === 'string' ) {
        out = screamer.walkers.string( obj );
      }
    }else {
      out = screamer.walkers[ obj[0] ]( obj );
    }

    return out
  },

  run( code, dims=null ) {
      console.log( 'screamer:', code );
      let tree = null;
      try{
        tree = walking.parse( code );
      }catch(e) {
        console.error( e.toString() );
        return
      }
      let out;

      for( let s of tree ) {
        out = screamer.walk(s);
      }

      const config = screamer.config;
      if( out !== false ) {
        let m = march( out )
          .fog( 
            config.fog.length > 0 ? config.fog[0] : 0, 
            config.fog.length > 0 ? config.fog.slice( 1 ) : [0,0,0]
          )
          .background( Vec3(...config.background ) )
          .shadow( config.shadow );

          
        if( config.lighting !== null ) {
          Marching.lighting.lights = [];
          m = m.light( ...config.lighting ); 
        }

        m = m.post( ...config.post );

        if( dims !== null ) m = m.setdim( dims[0], dims[1] );

        if( config.render.indexOf( 'voxel' ) !== -1 ) {
          m = m.voxel( config.voxel );
        } 

        if( config.zoom !== null ) {
          m = m.resolution( config.zoom );
        }

        m.render( config.render )
         .camera( ...config.camera );
      }
  },

  initHydra() {
    if( window.Hydra !== undefined ) {
      const Hydrasynth = Hydra;

      //window.Hydra = function( w=500,h=500 ) {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;

      // temporarily removing warning
      const warn = console.warn;
      console.warn = ()=> {};
      setTimeout( ()=> console.warn = warn, 100 );

      const hydra = new Hydrasynth({ canvas, global:false, detectAudio:false }); 

      hydra.synth.canvas = canvas;

      hydra.synth.texture = ( __props )=> {
        const props = Object.assign({ canvas:hydra.synth.canvas}, __props );
        const t = Texture('canvas', props );
        Marching.postrendercallbacks.push( ()=> t.update() );
        hydra.synth.__texture = t;

        return t
      };

      screamer.libs.hydra = hydra;
      screamer.textures.hydra = props => hydra.synth.texture( props );
    }else {
      console.warn( 'hydra was not loaded' );
    }
  },

  libs: {}
};

const isMobile = /iPhone|iPad|iPod|Android/i.test( navigator.userAgent );
let introEle = null;

const removeIntro = function() {
  if( introEle !== null ) {
    introEle.classList.remove('enter');
    introEle.classList.add('exit');
    setTimeout( ()=> { if( introEle !== null ) { introEle.remove(); introEle = null; } }, 900 );
    editor.el.focus(); 
  }
};

let bitty = null, editor = null;
const init = async function() {
  screamer.init();
  setupMarching();
  Marching.materials.__clearOnEmit = false;

  const err = console.error;
  console.error = function( e ) {
    showError( e );
    err( e );
  };
  const warning = console.warn;
  console.warn = function( e ) {
    showWarning( e );
    warning( e );
  };

  bitty = window.bitty;
  editor = setupEditor();
  
  if( isMobile ) {
    const btn = document.createElement('button');
    btn.innerText = 'Next Demo >>';
    btn.classList.add( 'next' );
    document.body.append( btn );
    btn.onclick = loadDemo;
  }

  const help = document.querySelector('#help');

  introEle = showIntro();

  help.addEventListener( 'click',  e => {
    introEle = showIntro();
    return true
  });

  window.screamer = screamer;
};

const showIntro = function() {
  editor.el.focus();
  if( window.location.search.indexOf('HIDE') === -1 ) {
    if( introEle === null ) {
      const div = document.createElement('div');
      div.innerHTML = intro;
      div.classList.add( 'intro' );
      div.classList.add( 'enter' );
      div.setAttribute( 'tabindex', 0 );

      div.addEventListener( 'keydown', e => {
        if( e.key === 'l' && e.ctrlKey === true ) {
          loadDemo(); 
        }
      });

      document.body.append( div );

      return div
    }else {
      return introEle
    }
  }else {
    document.querySelector('#help').remove();
    return introEle
  }
};


const showError = function( msg ) {
  const div = document.createElement('div');
  const size = bitty.instances.baseFontSize;
  div.style = `width:calc(100% - ${size*2}px); margin:0; padding:.5rem; height:${4*size}px; position:absolute; bottom:0; left:0; background:rgb(127,0,0); color:white; z-index:1000; font-family:monospace; font-size:${size}px;`;
  div.textContent = msg;
  document.body.append( div );
  setTimeout( t=> {
    div.style.opacity = 0;
    div.style.transition = 'opacity 1s linear';
  }, 4000 );
  setTimeout( t=> div.remove(), 5000 );
  setTimeout( t=> { div.style.background='rgba(0,0,0,.75)'; }, 250 );
};

const showWarning = function( msg ) {
  const div = document.createElement('div');
  div.style = `width:calc(100% - 1em); margin:0; padding:.5rem; height:2.5rem; position:absolute; bottom:0; left:0; background:rgb(127,127,0); color:white; z-index:1000; font-family:monospace; font-size:1.5rem;`;
  div.textContent = msg;
  document.body.append( div );
  setTimeout( t=> {
    div.style.opacity = 0;
    div.style.transition = 'opacity 1s linear';
  }, 4000 );
  setTimeout( t=> div.remove(), 5000 );
  setTimeout( t=> { div.style.background='rgba(0,0,0,.75)'; }, 250 );
};


const setupMarching = function() {
  const c = document.querySelector('canvas');
  Marching.init( c );
  Marching.export( window );
  Marching.keys = {
    w:0,
    a:0,
    s:0,
    d:0,
    alt:0
  };

  return c
};

window.onload = init;

let cameraIsOn = false;
const toggleCamera = function() {
  cameraIsOn = !cameraIsOn;
  if( cameraIsOn ) 
    cameraOn();
  else
    cameraOff();
};
const cameraOn = function( shouldToggleGUI=true) {
  Marching.cameraEnabled = true; //!Marching.cameraEnabled
  Marching.camera.on();

  editor.el.style.display = 'none';
};
const cameraOff = function( shouldToggleGUI=true) {
  Marching.cameraEnabled = false; //!Marching.cameraEnabled

  const idx = Marching.callbacks.indexOf( Marching.camera.__framefnc );
  if( idx !== -1 ) {
    Marching.callbacks.splice( idx, 1 );
  }

  editor.el.style.display = 'block';
};

let demoidx = 0;
const getStarterCode = function() {
  let out = intro; 
  if( window.location.search !== '' ) {
    // use slice to get rid of ?
    const query = window.location.search.slice(1);
    const params = query.split('&');
    
    if( params[0] === 'tutorial' ) {
      out = tutorial; 
    }else {
      out = atob( params[0] );
      screamer.run( out );
    }
  }else {
    const code = demos[ 0 ];
    out = code;
    screamer.run( code );
  }
  
  return out
};

const reset = `camera = (0 0 5) render = med fog = (0 0 0 0) post = () background = (0 0 0) lighting = ()\n`;
const loadDemo = function() {
  Marching.postrendercallbacks.length = 0;

  const code = demos[ ++demoidx % demos.length ];

  // do not include reset code in editor, but run it
  
  editor.value = code;
  screamer.run( reset + code );
};

const updateLocation = function( code ) {
  //const code = bitty.value//.join('\n')
  const codeCompressed = btoa( code );
  const link = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${codeCompressed}`;
  window.history.replaceState( {} , 'screamer', link );
};

const prefix = `fog = (0 0 0 0) post = () background = (0 0 0 ) render=med shadow=0.1\n`;

const setupEditor = function() {
  const intro = getStarterCode();
  bitty.process( intro, true );

  const b = bitty.create({ value:intro });

  b.subscribe( 'run', code => {
    const __code = prefix+code.trim();
    if( Marching.camera.__camera !== undefined ) {
      const pos = Marching.camera.__camera.position.slice(0);
      const rot = Marching.camera.__camera.rotation.slice(0);
      screamer.run( __code );
      if( screamer.DO_NOT_RESET_CAMERA === false ) {
        Marching.camera.__camera.position = pos;
        Marching.camera.__camera.rotation = rot;
        Marching.camera.update();
      }else {
        Marching.camera.__camera.rotation = [0,Math.PI, Math.PI];
      }
    }
    updateLocation( code.trim() );
  }); 

  b.subscribe( 'keydown', e => {
    if( e.ctrlKey && e.key === '.' ) {
      Marching.clear( true );
      Marching.lighting.lights.length = 0;
      screamer.config.lighting = null;
    }else if( e.altKey && e.code === 'KeyL' ) {
      loadDemo();  
      e.preventDefault();
      e.stopImmediatePropagation();
    }else if( e.key === '$' ) {
      bitty.runBlock();
      e.preventDefault();
    }else if( e.altKey && e.code === 'KeyC' ) ;else if( Marching.keys[ e.key ] !== undefined && Marching.cameraEnabled ) {
      Marching.keys[ e.key ] = 1;
    }else if( e.altKey && (e.key === '=' || e.key === '≠') ) {
      bitty.instances[0].changeFontSize( 2 );
      e.stopImmediatePropagation();
      e.preventDefault();
    }else if( e.altKey && e.key === '-' || e.key === '–') {
      e.stopImmediatePropagation();
      e.preventDefault();
      bitty.instances[0].changeFontSize( -2 );
    }else if( e.altKey && (e.key === '/' || e.keyy === '÷' ) ) {
      const help = document.querySelector('#help');
      help.style.display = 'none';
      e.stopImmediatePropagation();
      e.preventDefault();
    }

    return false
  });

  b.subscribe('keyup', event => {
    if( Marching.cameraEnabled ) {
      const code = event.key;//.code.slice(3).toLowerCase()
      Marching.keys[ code ] = 0;
    }else if( event.key === 'Alt' ) {
      for( let key in Marching.keys ) {
        Marching.keys[ key ] = 0;
      }
    } 
  });


  window.addEventListener( 'keydown', e => {
    if( ( e.key === 'c' || e.key === 'ç' ) && e.altKey === true ) {
      toggleCamera();
    }else if( e.key === '.' && e.ctrlKey === true && e.shiftKey === true ) {
      Marching.pause();
    }else if( Marching.cameraEnabled ) {
      Marching.keys[ e.key ] = 1;
    }
  });

  window.addEventListener( 'keyup', e => {
    if( Marching.cameraEnabled ) {
      Marching.keys[ e.key ] = 0;
    }
  });

  b.subscribe( 'click', e=> {
    removeIntro(); 
  });

  b.focus();

  return b
};
