const globals = {}

// ernie's favorite number
const EFN = 8243721

const mods = {
  '\'':  'scale',
  '\'\'': 'scaleBy', 
  '#':  'Repeat',
  '###': 'PolarRepeat',
  '##': 'SmoothRepetition',
  ':':  'material',
  '::': 'texture',
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
    fft: 512
  },

  init() {
    window.onpointermove = function(e) {
      mouse.x = e.clientX / window.innerWidth
      mouse.y = e.clientY / window.innerHeight
    }

    return this
  },

  mathwalk( obj ) {
    let out = EFN, a, b
    if( Array.isArray( obj ) ) { 
      if( obj.length > 1 ) {
        const a = screamer.mathwalk( obj[2] )
        const b = obj[3] !== undefined ? screamer.mathwalk( obj[3] ) : null

        const op = obj[1]                  
        switch( op ) {
          case '+': 
            out = t => a( t ) + b( t ) 
            break
          case '-':
            out = t => a( t ) - b( t ) 
            break
          case '*':
            out = t => a( t ) * b( t ) 
            break
          case '/':
            out = t => a( t ) / b( t ) 
            break
          case '%':
            out = t => a( t ) % b( t ) 
            break
          case '^':
            out = t => Math.pow(a( t ), b( t )) 
            break
          case 'sin':
            out = t => Math.sin( a( t ) )
            break
          case 'sinn':
            out = t => .5 + Math.sin( a( t ) ) * .5
            break
          case 'cos':
            out = t => Math.cos( a( t ) )
            break
          case 'cosn':
            out = t => .5 + Math.cos( a( t ) ) * .5
            break
          case 'round':
            out = t => Math.round( a( t ) )
            break
          case 'random':
            out = t => Math.random()
            break
          case 'floor':
            out = t => Math.floor( a( t ) )
            break
          case 'ceil':
            out = t => Math.ceil( a( t ) )
            break
          case 'abs':
            out = t => Math.abs( a( t ) )
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
        case 'time': out = t => t; break;
        case 'mousex': out = t => mouse.x; break;
        case 'mousey': out = t => mouse.y; break;
        case 'low':
          // .start() is a null operation if audio
          // has already been initialized
          Marching.FFT.start()
          Marching.FFT.windowSize = screamer.config.fft
          out = t => Marching.FFT.low
          break
        case 'mid':
          Marching.FFT.start()
          Marching.FFT.windowSize = screamer.config.fft
          out = t => Marching.FFT.mid
          break
        case 'high':
          Marching.FFT.start()
          Marching.FFT.windowSize = screamer.config.fft
          out = t => Marching.FFT.high
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
      if( obj[1] === 'post' ) {
        // correct for lists
        if( !Array.isArray( obj[2] )) { obj[2] = obj[2].values }

        obj[2] = obj[2].map( v => {
          const func = window[ v[0][0].toUpperCase() + v[0].slice(1) ]
          const out = v[1] !== null
            ? func( ...v[1] )
            : func()

          return out
        })
      }


      // test for string in case of render preset
      
      if( obj[1] === 'camera' ) {
        const camerafncs = obj[2].values.map( screamer.mathwalk )
        Marching.postrendercallbacks.push( time => {
          camera.pos.x = camerafncs[0]( time )
          camera.pos.y = camerafncs[1]( time )
          camera.pos.z = camerafncs[2]( time )
        })

        obj[2].values = obj[2].values.map( fnc => screamer.mathwalk( fnc )(0) )
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
          fog.amount   = fogfncs[0]( time )
          if( typeof fogfncs[1] === 'function' ) fog.color.r = fogfncs[1]( time )
          if( typeof fogfncs[2] === 'function' ) fog.color.g = fogfncs[2]( time )
          if( typeof fogfncs[3] === 'function' ) fog.color.b = fogfncs[3]( time )
        }
        Marching.postrendercallbacks.push( runfog )

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
              args.push( obj[ i ] )
          }else{
            // hmmm what is this?
            args.push( ...obj[i] )
          }
        }
      }

      return constructor( ...args )
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
              Marching.postrendercallbacks.push( time => {
                const __args = args.map( v => typeof v === 'function' ? v( time ) : v )
             
                geo[ name ]( ...__args )
              })
            }
          }else if( name === 'rotateDims' ) {
            // used to disable absolute rotations with axis/angle
            geo.transform.shouldRotate = false

            const idx = geo.transform.__rotations.length
            args[0] = screamer.mathwalk( mod[1] )

            const x = usesDims ? +!(dims.indexOf('x') === -1) : 1
            const y = usesDims ? +!(dims.indexOf('y') === -1) : 1
            const z = usesDims ? +!(dims.indexOf('z') === -1) : 1
            
            Marching.postrendercallbacks.push( time => {
              geo.transform.__rotations[ idx ] = Matrix.rotate( 
                args[0]( time ), 
                x,y,z
              )              
            })

            // needed to determine indexing
            geo.transform.__rotations.length++


            // I don't know why we have to call rotate here but
            // no rotation occurs if we don't, so...
            // out = geo.rotate(...args)
            name = 'rotate'
          }

          //if( out === null ) {
            if( isList ) { 
              out = geo[ name ]( ...args  )
            }else{
              if( usesDims ) {
                out = geo[ name ]( ...args )  
              }else{
                const v = screamer.mathwalk( mod[1] )
                out = geo[ name ]( v,v,v ) 
              }
            }
          //}
        }else if( name === 'material' || name === 'texture' ) {
          if( Array.isArray( mod[1] ) ) {
            const materialName = typeof mod[1][1] === 'string' ? mod[1][1] : mod[1][0]

            if( mod[1][1] !== undefined && mod[1][1] !== null) {
              const scalefnc = screamer.mathwalk( mod[1][1] )
              let uvfncs = null
              if( mod[1][2] !== undefined ) {
                uvfncs = mod[1][2][1].map( screamer.mathwalk )
              }
              
              Marching.postrendercallbacks.push( time => {
                geo.texture.scale = scalefnc( time )  
                if( uvfncs !== null ) {
                  const x = uvfncs[0]( time )
                  const y = uvfncs[1]( time )
                  const z = uvfncs[2]( time )

                  geo.texture.uv.x = x
                  geo.texture.uv.y = y
                  geo.texture.uv.z = z
                }
              })

              out = geo[ name ]( 
                materialName, 
                { 
                  scale: scalefnc( 0 ), 
                  uv:    uvfncs !== null ? uvfncs.map( f => f( 0 ) ) : [0,0,0]
                }
              )
            }else{
              out = geo[ name ]( materialName )
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

                if( name === 'Twist' ) {
                  const fnc   = Array.isArray( args ) ? args[0] : args
                  const twist = window.Twist( geo, Vec2( fnc,0 ) )
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
                out = window[ name ]( geo, screamer.mathwalk( mod[1] ), dims )
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
      const args = obj[1].map( screamer.mathwalk )

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
      console.log( 'code:', code )
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
          .post(   ...config.post )

        if( dims !== null ) m = m.setdim( dims[0], dims[1] )

        if( config.render.indexOf( 'voxel' ) !== -1 ) {
          m = m.voxel( config.voxel )
        } 

        m.render( config.render )
         .camera( ...config.camera )
      }
  }
}

export default screamer
