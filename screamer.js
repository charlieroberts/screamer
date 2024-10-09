const globals = {}

// ernie's favorite number
const EFN = 8243721

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
}
 
const mouse = { x:0, y:0 }

const vecMembers = ['x','y','z','w']

const screamer = {
  __i:0,
  
  config : {
    render: 'med',
    fog: [0,0,0,0],
    background:[0,0,0],
    post: [],
    voxel:.1,
    camera: [0,0,5],
    fft: 512,
    lighting:null
  },

  textures: {},

  init() {
    window.onpointermove = function(e) {
      mouse.x = e.clientX / window.innerWidth
      mouse.y = e.clientY / window.innerHeight
    }

    screamer.initHydra()

    return this
  },

  isVarying( func, varies=false, a=null, b=null ) {
    func.varies = func.varies || varies || (a !== null && a.varies ) || (b !== null && b.varies )
  },

  mathwalk( obj ) {
    let out = EFN, a, b
    const varies = screamer.isVarying
    if( Array.isArray( obj ) ) { 
      if( obj.length > 1 ) {
        const a = screamer.mathwalk( obj[2] )
        const b = obj[3] !== undefined ? screamer.mathwalk( obj[3] ) : null

        let lastlow = 0, lastmid = 0, lasthigh = 0
        const op = obj[1]                  
        switch( op ) {
          case '+': 
            out = t => a( t ) + b( t )
            varies( out, false, a, b )
            break
          case '-':
            out = t => a( t ) - b( t ) 
            varies( out, false, a, b )
            break
          case '*':
            out = t => a( t ) * b( t ) 
            varies( out, false, a, b )
            break
          case '/':
            out = t => a( t ) / b( t ) 
            varies( out, false, a, b )
            break
          case '%':
            out = t => a( t ) % b( t ) 
            varies( out, false, a, b )
            break
          case '^':
            out = t => Math.pow(a( t ), b( t )) 
            varies( out, false, a, b )
            break
          case 'sin':
            out = t => Math.sin( a( t ) )
            varies( out, false, a )
            break
          case 'sinn':
            out = t => .5 + Math.sin( a( t ) ) * .5
            varies( out, false, a )
            break
          case 'cos':
            out = t => Math.cos( a( t ) )
            varies( out, false, a )
            break
          case 'cosn':
            out = t => .5 + Math.cos( a( t ) ) * .5
            varies( out, false, a )
            break
          case 'round':
            out = t => Math.round( a( t ) )
            varies( out, false, a )
            break
          case 'random':
            out = t => Math.random()
            varies( out, false )
            break
          case 'floor':
            out = t => Math.floor( a( t ) )
            varies( out, false, a )
            break
          case 'ceil':
            out = t => Math.ceil( a( t ) )
            varies( out, false, a )
            break
          case 'abs':
            out = t => Math.abs( a( t ) )
            varies( out, false, a )
            break
          case 'low':
            // .start() is a null operation if audio
            // has already been initialized
            Marching.FFT.start()
            Marching.FFT.windowSize = screamer.config.fft

            out = t => {
              lastlow = Marching.FFT.low * (1.0 - a(t)) + lastlow * a(t)
              return lastlow
            }
            varies( out, true )
            break
          case 'mid':
            Marching.FFT.start()
            Marching.FFT.windowSize = screamer.config.fft
            
            out = t => {
              lastmid = Marching.FFT.mid * (1.0 - a(t)) + lastmid * a(t)
              return lastmid
            }

            varies( out, true )
            break
          case 'high':
            Marching.FFT.start()
            Marching.FFT.windowSize = screamer.config.fft

            out = t => {
              lasthigh = Marching.FFT.high * (1.0 - a(t)) + lasthigh * a(t)
              return lasthigh
            }

            varies( out, true )
            break
          case 'fade':
            const _a = obj[2][0] || 120, 
                  _b = obj[2][1] || 0, 
                  _c = isNaN(obj[2][2]) ? 1 : obj[2][2]
            let counter = 0
            out = t => {
              if( counter++ < _a ) {
                if( _b < _c ) {
                  return _b + ((counter/_a) * (_c-_b))
                }else{
                  return _b - ((counter/_a) * (_b-_c))
                }
              }else{
                return _c
              }
            }
            varies( out, true )
            break
        }
      }else{
        out = screamer.mathwalk( obj[0] )
      }
    }else if( typeof obj === 'string' ) {       
      switch( obj ) {
        case 'i' : 
          const i = screamer.__i
          out = t => i
          break
        case 'time': 
          out = t => t
          varies( out, true )
          break
        case 'mousex': 
          out = t => mouse.x
          varies( out, true )
          varies( out, true )
          break
        case 'mousey': 
          out = t => mouse.y
          varies( out, true )
          break
        case 'low':
          // .start() is a null operation if audio
          // has already been initialized
          Marching.FFT.start()
          Marching.FFT.windowSize = screamer.config.fft
          out = t => Marching.FFT.low || 0 
          varies( out, true )
          break
        case 'mid':
          Marching.FFT.start()
          Marching.FFT.windowSize = screamer.config.fft
          out = t => Marching.FFT.mid || 0
          varies( out, true )
          break
        case 'high':
          Marching.FFT.start()
          Marching.FFT.windowSize = screamer.config.fft
          out = t => Marching.FFT.high || 0
          varies( out, true )
          break
        default:
          const isGlobal = globals[ obj ] !== undefined

          if( !isGlobal ) {
            if( obj === '.' ) {
              throw SyntaxError(`Did you forget a number before or after a . ?`)
            }else{
              throw ReferenceError(`The word "${obj}" is not a keyword in screamer, and not a variable that has been assigned a value`)
            }
          }else{
            throw SyntaxError(`The variable "${obj}" contains a geometry or combinator, and cannot be used in a math expression.`)
          }

          break

      }
    }else{
      const val = obj === null ? null : parseFloat( obj )
      out = t => val 
      varies( out, false )
    }

    return out
  },

  
  walkers: {
    assignment( obj ) {
      let out = obj
      if( obj[1].indexOf('.') === -1 ) {
        globals[ obj[1] ] = screamer.walk( obj[2] )
        out = globals[ obj[1] ]
      }else{
        const split = obj[1].split('.')
        let value = screamer.walk( obj[2] ),
          __obj = globals[ split[0] ]

        if( typeof value === 'function' ) {
          let __value = value

          Marching.postrendercallbacks.push( t => {
            __obj[ split[1] ] = __value( t )
          })

          value = value(0)
        }else if( Array.isArray( value ) ) {
          const __value = []
          const vec = window[ `Vec${value.length}` ](0)

          for( let i = 0; i < value.length; i++ ) {
            const v = screamer.mathwalk( value[ i ] )
            if( typeof v === 'function' ) {
              const fnc = time => {
                vec[ vecMembers[ i ] ] = v( time )
                __obj[ split[1] ] = vec
              }
              Marching.postrendercallbacks.push( fnc )

              vec[ vecMembers[i] ] = v(0)
            }else{
              vec[ vecMembers[i] ] = v
            }
          }
          __obj[ split[1] ] = vec
        }

        out = false
      }
      
      return out
    },

    color( obj ) {
      console.log( 'color', obj ) 
      return false
    },

    combinator( obj ) {
      const constructor = window[ obj[1] ]
      const args = []
      for( let i = 2; i < obj.length; i++ ) {
        const isList = Array.isArray( obj[ i ] ) && obj[i].length !== 0 
        if( isList ) {
          if( i === 4 ) {
            obj[i].forEach( v => {
              args.push( Array.isArray(v) ? screamer.walk(v) : v )
            })
          }else{
            args.push( screamer.walk( obj[ i ] ) )
          }
        }else{
          if( !Array.isArray( obj[i] ) ) {
            if( obj[i] !== null && obj[i] !== undefined )
              args.push( screamer.walk( obj[ i ] ) )
          }else{
            args.push( ...obj[i] )
          }
        }
      }

      return constructor( ...args )
    },

    comment() { return false },

    config( obj ) {
      if( obj[1] === 'lighting' ) {
        const lights = obj[2].values

        screamer.config.lighting = []

        for( const __light of lights ) {
          const lightdesc = __light[1][1]
          
          const light = Light( 
            Vec3(...lightdesc[0][1]), 
            Vec3(...lightdesc[1][1]), 
            lightdesc[2] || 1 
          )

          screamer.config.lighting.push( light )

          const posfncs = lightdesc[0][1].map( screamer.mathwalk )
          const colfncs = lightdesc[1][1].map( screamer.mathwalk )
          Marching.postrendercallbacks.push( time => {
            if( posfncs[0].varies ) light.pos.x = posfncs[0]( time )
            if( posfncs[1].varies ) light.pos.y = posfncs[1]( time )
            if( posfncs[2].varies ) light.pos.z = posfncs[2]( time )
            if( colfncs[0].varies ) light.color.x = colfncs[0]( time )
            if( colfncs[1].varies ) light.color.y = colfncs[1]( time )
            if( colfncs[2].varies ) light.color.z = colfncs[2]( time )
          })

          if( posfncs[0].varies !== true ) light.pos.x = posfncs[0]( 0 )
          if( posfncs[1].varies !== true ) light.pos.y = posfncs[1]( 0 )
          if( posfncs[2].varies !== true ) light.pos.z = posfncs[2]( 0 )
          if( colfncs[0].varies !== true ) light.color.x = colfncs[0]( 0 )
          if( colfncs[1].varies !== true ) light.color.y = colfncs[1]( 0 )
          if( colfncs[2].varies !== true ) light.color.z = colfncs[2]( 0 )

        }

        return false
      }

      if( obj[1] === 'post' ) {
        // correct for lists
        if( !Array.isArray( obj[2] )) { obj[2] = obj[2].values }

        obj[2] = obj[2].map( (v,i) => {
          const func = v[0] === 'motionblur' 
                ? window.MotionBlur
                : window[ v[0][0].toUpperCase() + v[0].slice(1) ]

          let __args = []
          
          // use postrender callbcaks to assign uniform values, 
          // leave constructor call empty, as setting values
          // before webgl is initialized will create problems
          // this means that all postprocessing properties are
          // reactive by default
          const out = func()
          const desc = Object.getOwnPropertyDescriptors( out )

          let idx = 0
          for( let key in desc ) {
            // avoid metadata
            if( key === '__wrapped__' ) continue

            if( v[1] !== null ) {
              __args = v[1].map( screamer.mathwalk )
              let num = idx++
              
              // will be undefined if no value for this argument
              // has been passed to consructor
              if( __args[ num ] !== undefined ) {
                Marching.postrendercallbacks.push( time => {
                  out[ key ] = __args[ num ]( time )
                })
              }
            }
          }

          return out
        })
      }


      // test for string in case of render preset
      
      if( obj[1] === 'camera' ) {
        const camerafncs = obj[2].values.map( screamer.mathwalk )
        if( camerafncs.findIndex( f => f.varies === true ) !== -1 ) {
          Marching.postrendercallbacks.push( time => {
            if( camerafncs[0].varies ) camera.pos.x = camerafncs[0]( time )
            if( camerafncs[1].varies ) camera.pos.y = camerafncs[1]( time )
            if( camerafncs[2].varies ) camera.pos.z = camerafncs[2]( time )
          })
        }else{
          setTimeout( ()=> {
          camera.pos.x = camerafncs[0]( 0 )
          camera.pos.y = camerafncs[1]( 0 )
          camera.pos.z = camerafncs[2]( 0 )
          }, 0 )
        }

        obj[2].values = camerafncs.map( fnc => fnc(0) )
      }

      if( obj[1] === 'fog' ) {
        let fogfncs
        if( obj[2].values === undefined ) {
          fogfncs = [ screamer.mathwalk( obj[2] ) ]
        }else{
          fogfncs = obj[2].values.map( screamer.mathwalk )
        }
        const runfog = time => {
          const fog = Marching.__scene.postprocessing[0]
          if( fogfncs[0].varies ) fog.amount   = fogfncs[0]( time )
          if( typeof fogfncs[1] === 'function' && fogfncs[1].varies ) fog.color.r = fogfncs[1]( time )
          if( typeof fogfncs[2] === 'function' && fogfncs[2].varies ) fog.color.g = fogfncs[2]( time )
          if( typeof fogfncs[3] === 'function' && fogfncs[3].varies ) fog.color.b = fogfncs[3]( time )
        }

        if( fogfncs.findIndex( f => f.varies === true ) !== -1 ) {
          Marching.postrendercallbacks.push( runfog )
        }else{
          setTimeout( ()=> {
            const fog = Marching.__scene.postprocessing[0]
            fog.amount   = fogfncs[0]( 0 )
            if( typeof fogfncs[1] === 'function' ) fog.color.r = fogfncs[1]( 0 )
            if( typeof fogfncs[2] === 'function' ) fog.color.g = fogfncs[2]( 0 )
            if( typeof fogfncs[3] === 'function' ) fog.color.b = fogfncs[3]( 0 )
          }, 0 )
        }
        // don't bother setting initial fog just use the render callback
      }

      const isPreset = Array.isArray( obj[2] ) 
        || (typeof obj[2] === 'string' || typeof obj[2] === 'number' )

      screamer.config[ obj[1] ] = isPreset ? obj[2] : obj[2].values

      return false
    },

    geometry( obj ) {
      const constructor = window[ obj[1] ]
      const args = []
      for( let i = 2; i < obj.length; i++ ) {
        const isArgList = Array.isArray( obj[ i ] ) && obj[i].length !== 0 
        if( isArgList ) {
          args.push( ...obj[ i ].map( screamer.walk ))
        }else{
          if( !Array.isArray( obj[i] ) ) {
            if( obj[i] !== null && obj[i] !== undefined )
              args.push( screamer.walk( obj[ i ] ) )
          }else{
            // hmmm what is this?
            args.push( ...obj[i] )
          }
        }
      }

      // have to account for vectors, hence typeof check
      // but what happens to reactive vectors?
      // nothing.
      //
      const __args = args.map( f => {
        return f.varies ? f : typeof f === 'function' ? f(0) : f 
      })
      return constructor( ...args )
      
    },

    hydra( obj ) {
      console.log( 'hydra:', obj[1] )
      new Function( obj[1] )()
      return false
    },

    loop( obj ) {
      let out = screamer.walk( obj[1] )
      const mods = obj[3]
      const count = obj[2]
      for( let i = 0; i < count; i++ ) {
        screamer.__i = i
        out = screamer.walkers.mod( mods, out )
      }

      return out
    },

    math( obj ) { return screamer.mathwalk( obj ) },

    mod( obj, __geo = null ) {
      let out = null
      
      let geo = __geo === null 
        ? screamer.walk( obj[1] )
        : __geo
      
      // "normal" call vs call in loop
      const __mods = __geo === null
        ? obj[2]
        : obj

      for( let mod of __mods  ) {
        let name = mod[0],
            dims = null,
            usesDims = false
 
        if( Array.isArray( name ) ) {
          dims = name[ 1 ].split('')
          name = mods[ name[0] ]
          usesDims = true
        }else{
          name = mods[ name ]
        }

        if( name === 'scale' 
          || name === 'translate' 
          || name === 'rotateDims'
          || name === 'rotate'
          || name === 'scaleBy' 
          || name === 'moveBy' ) {
          let args, isList = false
          
          if( mod[1] === null ) {
            throw SyntaxError(`Are you missing an argument to your ${mod[0]} (${name}) modifier?`) 
          }
          if( mod[1].name === 'list' ) {
            args = mod[1].values.map( screamer.mathwalk )
            isList = true
          }else{
            args = []
            //args = screamer.mathwalk( mod[1] )
          }

          if( usesDims ) {
            if( dims.indexOf( 'x' ) !== -1 ) {
              args[0] = isList ? args[0] : screamer.mathwalk( mod[1] )
            }else{
              args[0] = null
            }
            if( dims.indexOf( 'y' ) !== -1 ) {
              args[1] = isList ? args[1] : screamer.mathwalk( mod[1] ) 
            }else{
              args[1] = null
            }
            if( dims.indexOf( 'z' ) !== -1 ) {
              args[2] = isList ? args[2] : screamer.mathwalk( mod[1] ) 
            }else{
              args[2] = null
            }
          }

          if( isList ) {
            if( name !== 'rotateDims' ) {
              if( args.findIndex( v => v.varies === true ) !== -1 ) {
                Marching.postrendercallbacks.push( time => {
                  const __args = args.map( v => typeof v === 'function' ? v( time ) : v )
               
                  geo[ name ]( ...__args )
                })
              }else{
                geo[ name ]( ...(args.map( v => typeof v === 'function' ? v( 0 ) : v )) )
              }
              out = geo
            }
          }else if( name === 'rotateDims' ) {
            // used to disable absolute rotations with axis/angle
            geo.transform.shouldRotate = false

            const idx = geo.transform.__rotations.length
            args[0] = screamer.mathwalk( mod[1] )

            const x = usesDims ? +!(dims.indexOf('x') === -1) : 1
            const y = usesDims ? +!(dims.indexOf('y') === -1) : 1
            const z = usesDims ? +!(dims.indexOf('z') === -1) : 1
            
            if( args[0].varies ) {
              Marching.postrendercallbacks.push( time => {
                geo.transform.__rotations[ idx ] = Matrix.rotate( 
                  args[0]( time ), 
                  x,y,z
                )
                geo.transform.dirty = true
              })


            }else{
              geo.transform.__rotations[ idx ] = Matrix.rotate( args[0]( 0 ), x,y,z )
            }

            // needed to determine indexing
            geo.transform.__rotations.length++
            
            name = 'rotate'
            out = geo
          }else{
            if( isList ) { 

              const __args = args.map( f => f.varies ? f : f(0) )
              out = geo[ name ]( ...__args  )
            }else{
              if( usesDims ) {
                out = geo[ name ]( ...args )  
              }else{
                let v = screamer.mathwalk( mod[1] )
                if( v.varies === false ) v = v(0) 
                out = geo[ name ]( v,v,v ) 
              }
            }
          }
        }else if( name === 'material' || name === 'texture' || name === 'bump' ) {
          if( Array.isArray( mod[1] ) ) {
            const materialName = typeof mod[1][1] === 'string' ? mod[1][1] : mod[1][0]

            // if arguments are passed to texture...
            if( name !== 'material' && mod[1][1] !== undefined && mod[1][1] !== null) {
              let idx = name === 'bump' ? 2 : 1

              let scalefnc = null
              if( mod[1][idx] !== undefined ) scalefnc = screamer.mathwalk( mod[1][idx] )
              let uvfncs = null
              if( mod[1][idx+1] !== undefined ) {
                uvfncs = mod[1][idx+1][1].map( screamer.mathwalk )
              }
              let strengthfnc = null
              if( mod[1][idx+2] !== undefined ) {
                strengthfnc = screamer.mathwalk( mod[1][idx+2] )
              }

              const props = { 
                scale: scalefnc !== null ? scalefnc( 0 ) : 1, 
                uv:    uvfncs !== null ? uvfncs.map( f => f( 0 ) ) : [0,0,0],
                strength: strengthfnc !== null ? strengthfnc( 0 ) : 1
              }
              const t = materialName === 'hydra'
                ? screamer.textures.hydra( props ) 
                : Texture( materialName, props ) 
              
              if( scalefnc !== null || uvfncs !== null ) {
                Marching.postrendercallbacks.push( time => {
                  if( scalefnc !== null && scalefnc.varies ) t.scale = scalefnc( time )  
                  if( uvfncs !== null  ) {
                    if( uvfncs[0].varies ) t.uv.x = uvfncs[0]( time )
                    if( uvfncs[1].varies ) t.uv.y = uvfncs[1]( time )
                    if( uvfncs[2].varies ) t.uv.z = uvfncs[2]( time )
                  }
                  if( strengthfnc !== null ) t.strength = strengthfnc( time )
                  if( materialName === 'feedback' ) t.update()
                })
              }

              if( name === 'bump' ) {
                out = geo.texture( t ).bump( t, mod[1][1] )
              }else{
                out = geo[ name ]( t ) 
              }
            }else{
              if( name === 'texture' ) {
                if( materialName !== 'hydra' ) {
                  if( materialName === 'feedback' ) {
                    const t = Texture( 'feedback' )
                    Marching.postrendercallbacks.push( time => {
                      t.update()
                    })
                    out = geo[ name ]( t )
                  }else{
                    out = geo[ name ]( materialName )
                  }
                }else{
                  //screamer.use( 'hydra' )
                  
                  if( typeof screamer.textures.hydra !== 'function' ) {
                    console.warn( `hydra wasn't loaded; we'll load it now. you can load hydra using ctrl+alt+h` )
                    out = geo
                  }else{
                    if( screamer.libs.hydra === undefined ) {
                      console.warn( 'resetting hydra texture after clear. please re-run' )
                      out = geo
                    }else{
                      const t = screamer.textures.hydra()
                      out = geo.texture( t )
                    }
                  }
                }
              }else if( name === 'bump' ) {
                const t = Texture( materialName )
                out = geo.texture( t ).bump( t, .1 )
              }else{
                // material
                if( Array.isArray( mod[1] )) {
                  // if color material is used with arguments...
                  const m = Material( 'phong', Vec3(...(mod[1][1].map( v=>v*.1))), Vec3(...mod[1][1]), Vec3(1), mod[1][1][3] || 32, Vec3(0))
                  out = geo[ name ]( m )
                }else{
                  out = geo[ name ]( materialName )
                }
              }
            }
          }else{
            out = geo[ name ]( mod[1] )
          }
        }else{
          // repeat / polarrepeat etc.
          if( mod[1] !== null ) {

            // process distance dimensions for Repeat
            if( name === 'Repeat' || name === 'SmoothRepetition' || name === 'Twist' ) {
              let args, isList = false
              
              if( mod[1].name === 'list' ) {
                args = mod[1].values.map( screamer.mathwalk )
                isList = true
              }else{
                args = []
                //args = screamer.mathwalk( mod[1] )
              }

              const DNR = 123456 // do not repeat 
              if( usesDims ) {
                if( dims.indexOf( 'x' ) !== -1 ) {
                  args[0] = isList ? args[0] : screamer.mathwalk( mod[1] )
                }else{
                  args[0] = DNR
                }
                if( dims.indexOf( 'y' ) !== -1 ) {
                  args[1] = isList ? args[1] : screamer.mathwalk( mod[1] ) 
                }else{
                  args[1] = DNR
                }
                if( dims.indexOf( 'z' ) !== -1 ) {
                  args[2] = isList ? args[2] : screamer.mathwalk( mod[1] ) 
                }else{
                  args[2] = DNR
                }

                // are we repeating on all three axes?
                const is3Dim = args.indexOf( DNR ) === -1

                args = args.map( v => { return v.varies ? v : typeof v === 'function' ? v(0) : v })

                if( is3Dim ) {
                  // use 3D repeat
                  out = window[ name ]( geo, Vec3(...args) )
                }else{
                  // use individual repeats as needed
                  out = geo
                  if( args[0] !== DNR ) {
                    out = window.RepeatX( out, args[0] )
                  }
                  if( args[1] !== DNR ) {
                    out = window.RepeatY( out, args[1] )
                  }
                  if( args[2] !== DNR ) {
                    out = window.RepeatZ( out, args[2] )
                  }
                }
              }else{
                args = isList ? args : screamer.mathwalk( mod[1] ) 
                if( isList ) 
                  args = args.map( v => v.varies ? v : v(0) ) 
                else
                  args = args.varies ? args : args(0)

                if( name === 'Twist' ) {
                  const fnc   = Array.isArray( args ) ? args[0] : args
                  const twist = window.Twist( geo, Vec2( fnc,0 ) )
                  
                  if( fnc.varies )
                    Marching.postrendercallbacks.push( t => twist.amount.x = fnc(t) )
                  
                  out = geo = twist
                }else{
                  out = window[ name ]( geo, isList ? Vec3(...args) : args )
                }
              }
            }else{ 
              if( name === 'SmoothMirror' ) {
                let args, isList = mod[1].name === 'list' 
  
                dims = dims === null ? 'xyz': dims.join('')
                const count = dims.length

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
                  const l = mod[1].values.length
                  mod[1] = mod[1].values[0]
                  if( l !==1 )
                    console.warn( 'smoothmirror only accepts a single smoothness value for all axes.')
                }
                let __args = screamer.mathwalk( mod[1] )
                if( __args.varies === false ) __args = __args(0)

                out = window[ name ]( geo, __args, dims )
                //}
              }else{
                out = typeof mod[1] === 'object' && typeof mod[1].values !== 'function'
                  ? window[ name ]( geo, ...mod[1].values.map( screamer.mathwalk ) )
                  : window[ name ]( geo, screamer.mathwalk( mod[1] ) )
              }
            }
          }else{
            // mirror
            if( name === 'Mirror' || name === 'SmoothMirror' ) {
              dims = dims === null ? 'xyz': dims.join('')

              if( name === 'Mirror' )
                out = window[ name ]( geo, dims )
              else
                out = window[ name ]( geo, .03, dims ) 
            }else{
              if( mod[1] === null ) {
                throw SyntaxError(`Are you missing an argument to your ${mod[0]} (${name}) modifier?`) 
              }
              // what is this for?
              out = window[ name ]( geo )
            }
          }
        }
      }

      return out
    },

    string( obj ) { 
      const isGlobal = globals[ obj ] !== undefined
      const out = isGlobal ? globals[ obj ] : screamer.mathwalk( obj )


      
      if( out === EFN ) throw ReferenceError(`The word ${obj} is not a keyword in screamer, and it is not a variable that has been assigned a value`)

      return out
    },

    vec( obj ) {
      const len = obj[1].length
      const args = obj[1].map( screamer.mathwalk ).map( f => f.varies ? f : f(0) )

      return window[ 'Vec'+len ]( ...args )
    }
  },

  walk( obj ) {
    let out = obj
    const isFnc = obj[0] in screamer.walkers

    if( !isFnc ) {
      if( typeof obj[0] === 'string' ) {
        out = screamer.walkers.string( obj )
      }
    }else{
      out = screamer.walkers[ obj[0] ]( obj )
    }

    return out
  },

  run( code, dims=null ) {
      console.log( 'screamer:', code )
      let tree = null
      try{
        tree = walking.parse( code )
      }catch(e) {
        console.error( e.toString() )
        return
      }
      let out

      for( let s of tree ) {
        out = screamer.walk(s)
      }

      const config = screamer.config
      if( out !== false ) {
        let m = march( out )
          .fog( 
            config.fog.length > 0 ? config.fog[0] : 0, 
            config.fog.length > 0 ? config.fog.slice( 1 ) : [0,0,0]
          )
          .background( Vec3(...config.background ) )

          
        if( config.lighting !== null ) {
          Marching.lighting.lights = []
          m = m.light( ...config.lighting ) 
        }
        
        m = m.post( ...config.post )

        if( dims !== null ) m = m.setdim( dims[0], dims[1] )

        if( config.render.indexOf( 'voxel' ) !== -1 ) {
          m = m.voxel( config.voxel )
        } 

        m.render( config.render )
         .camera( ...config.camera )
      }
  },

  initHydra() {
    const Hydrasynth = Hydra

    //window.Hydra = function( w=500,h=500 ) {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 400

    // temporarily removing warning
    const warn = console.warn
    console.warn = ()=> {}
    setTimeout( ()=> console.warn = warn, 100 )

    const hydra = new Hydrasynth({ canvas, global:false, detectAudio:false }) 

    hydra.synth.canvas = canvas

    hydra.synth.texture = ( __props )=> {
      const props = Object.assign({ canvas:hydra.synth.canvas}, __props )
      const t = Texture('canvas', props )
      Marching.postrendercallbacks.push( ()=> t.update() )
      hydra.synth.__texture = t

      return t
    }

    screamer.libs.hydra = hydra
    screamer.textures.hydra = props => hydra.synth.texture( props )
  },

  libs: {}
}

export default screamer
