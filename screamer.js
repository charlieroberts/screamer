const globals = {}

const mods = {
  '\'':  'scale',
  '\'\'': 'scaleBy', 
  '#':  'Repeat',
  '##': 'PolarRepeat',
  ':':  'material',
  '::': 'texture',
  '>':  'translate',
  '>>': 'moveBy',
  '@':  'rotateDims',
  '@@': 'rotate',
  '|':  'Mirror',
}
 
const mouse = { x:0, y:0 }

const vecMembers = ['x','y','z','w']

const screamer = {
  __i:0,
  config : {
    render: 'med',
    fog: [0,0,0,0],
    background:[0,0,0],
    post: []
      
  },

  init() {
    window.onmousemove = function(e) {
      mouse.x = e.clientX / window.innerWidth
      mouse.y = e.clientY / window.innerHeight
    }

    return this
  },

  mathwalk( obj ) {
    let out = 1, a, b
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
          case 'sin':
            out = t => Math.sin( a( t ) )
            break
          case 'cos':
            out = t => Math.cos( a( t ) )
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
          out = t => Marching.FFT.low
          break
        case 'mid':
          Marching.FFT.start()
          out = t => Marching.FFT.mid
          break
        case 'high':
          Marching.FFT.start()
          out = t => Marching.FFT.high
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
      const isPreset = Array.isArray( obj[2] ) || typeof obj[2] === 'string' 
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
      
      const geo = __geo === null 
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
          out = geo[ name ]( mod[1] )
        }else{
          // repeat / polarrepeat etc.
          if( mod[1] !== null ) {

            // process distance dimensions for Repeat
            if( name === 'Repeat' ) {
              const val = screamer.mathwalk( mod[1] )
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
                out = window[ name ]( geo, isList ? Vec3(...args) : args )
              }
            }else{
              out = typeof mod[1] === 'object' && typeof mod[1].values !== 'function'
                ? window[ name ]( geo, ...mod[1].values.map( screamer.mathwalk ) )
                : window[ name ]( geo, screamer.mathwalk( mod[1] ) )
            }
          }else{
            // mirror
            if( name === 'Mirror' ) {
              dims = dims === null ? 'xyz': dims.join('')
              out = window[ name ]( geo, dims )
            }else{
              out = window[ name ]( geo )
            }
          }
        }
      }

      return out
    },

    string( obj ) { 
      const isGlobal = globals[ obj ] !== undefined
      return isGlobal ? globals[ obj ] : screamer.mathwalk( obj ) 
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

  run( code ) {
    try {
      console.log( 'code:', code )
      const tree = walking.parse( code )
      let out

      for( let s of tree ) {
        out = screamer.walk(s)
      }

      const config = screamer.config
      if( out !== false ) {
        march( out )
          .fog( 
            config.fog.length > 0 ? config.fog[0] : 0, 
            config.fog.length > 0 ? config.fog.slice( 1 ) : [0,0,0]
          )
          .background( Vec3(...config.background ) )
          .post(   ...config.post )
          .render( config.render )
      }
    } catch (e) {
      console.log( e )
    }
  }
}

export default screamer
