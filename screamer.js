const globals = {}

const mods = {
  '^':  'scale',
  '|':  'Repeat',
  '||': 'SmoothRepetition',
  ':':  'material',
  '::': 'texture',
  '>':  'translate',
  '@':  'rotate'
}
 
const mouse = { x:0, y:0 }

const vecMembers = ['x','y','z','w']

const screamer = {
  config : {
    render: 'med',
    fog: [0,0,0,0],
    background:[0,0,0],
    post: []
  },

  init() {
    /*const p = new Promise( (reject, resolve) => {
      const script = document.createElement( 'script' )
      script.src = '../screamer-lang.js'

      document.querySelector( 'head' ).appendChild( script )
      

      script.onload = resolve
    })*/

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
        case 'time': out = t => t; break;
        case 'mousex': out = t => mouse.x; break;
        case 'mousey': out = t => mouse.y; break;
        case 'low':
          // .start() is a null operation if audio
          // has already been initialized
          Marching.FFT.start()
          out = t => Marching.FFT.low
          break
        case 'med':
          Marching.FFT.start()
          out = t => Marching.FFT.med
          break
        case 'high':
          Marching.FFT.start()
          out = t => Marching.FFT.high
          break
      }
    }else{
      const val = parseFloat( obj )
      out = t => val 
    }

    return out
  },

  walk( obj ) {
    let out = null, isConfig = false

    if( obj[0] === 'comment' ) {
      out = false
    } else if( obj[0] === 'geometry' || obj[0] === 'combinator' ) {
      const constructor = window[ obj[1] ]
      const args = []
      for( let i = 2; i < obj.length; i++ ) {
        if( Array.isArray( obj[ i ] ) 
          && obj[i].length !== 0 ) {

          if( obj[0] === 'combinator' ){ 
            if( i === 4 ) {
              obj[i].forEach( v => {
                args.push( v )
              })
            }else{
              args.push( screamer.walk( obj[ i ] ) )
            }
          }else{
            args.push( screamer.walk( obj[ i ][0] ) )
          }
        }else{
          if( !Array.isArray( obj[i] ) ) {
            if( obj[i] !== null )
              args.push( obj[ i ] )
          }else{
            args.push( ...obj[i] )
          }
        }
      }
      out = constructor( ...args )
    }else if( obj[0] === 'mod' ) {
      const geo = screamer.walk( obj[1] )
      for( let mod of obj[2] ) {
        const name = mods[ mod[0] ]

        if( name === 'scale' || name === 'translate' || name === 'rotate' ) {
          let args, isList = false

          if( mod[1].name === 'list' ) {
            isList = true
            const vec = []
            args = mod[1].values.map( screamer.mathwalk )

            Marching.postrendercallbacks.push( time => {
              const __args = args.map( v => v( time ))
              geo[ name ]( ...__args )
            })
          }else{
            args = screamer.mathwalk( mod[1] )  
          }

          if( isList ) { 
            out = geo[ name ]( ...args  )
          }else{
            out = geo[ name ]( args )
          }
        }else if( name === 'material' || name === 'texture' ) {
          out = geo[ name ]( mod[1] )
        }else{
          out = window[ name ]( geo, screamer.mathwalk( mod[1] ) )
        }
      }
    } else if( obj[0] === 'config' ) {
      if( obj[1] === 'post' ) {
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
      out = false

    } else if( obj[0] === 'assignment' ) {
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

    } else if( obj[0] === 'math' || typeof obj[0] === 'string' ) {
      out = screamer.mathwalk( obj )
    } else {
      out = obj
    }

    return out
  },

  run( code ) {
    try {
      /*const selectedCode = getSelectionCodeColumn( cm, isBlock )

        flash( cm, selectedCode.selection )

        const code = selectedCode.code
        */
      //const code = cm.state.doc.toString()
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
            config.fog[0], 
            [ config.fog[1], config.fog[2], config.fog[3] ]
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
