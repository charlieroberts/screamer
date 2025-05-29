import { demos } from './demos.js'
import tutorial from './tutorial.js' 
import intro    from './intro.js'
import screamer from '../screamer.js'

const isMobile = /iPhone|iPad|iPod|Android/i.test( navigator.userAgent )

let run
let introEle = null

const removeIntro = function() {
  if( introEle !== null ) {
    introEle.classList.remove('enter')
    introEle.classList.add('exit')
    setTimeout( ()=> { if( introEle !== null ) { introEle.remove(); introEle = null } }, 900 )
    editor.el.focus() 
  }
}

let bitty = null, editor = null
const init = async function() {
  screamer.init()
  const canvas = setupMarching()
  Marching.materials.__clearOnEmit = false

  const err = console.error
  console.error = function( e ) {
    showError( e )
    err( e )
  }
  const warning = console.warn
  console.warn = function( e ) {
    showWarning( e )
    warning( e )
  }

  bitty = window.bitty
  editor = setupEditor()
  
  if( isMobile ) {
    const btn = document.createElement('button')
    btn.innerText = 'Next Demo >>'
    btn.classList.add( 'next' )
    document.body.append( btn )
    btn.onclick = loadDemo
  }

  const help = document.querySelector('#help')

  introEle = showIntro()

  help.addEventListener( 'click',  e => {
    introEle = showIntro()
    return true
  })

  window.screamer = screamer
}

const showIntro = function() {
  editor.el.focus()
  if( window.location.search.indexOf('HIDE') === -1 ) {
    if( introEle === null ) {
      const div = document.createElement('div')
      div.innerHTML = intro
      div.classList.add( 'intro' )
      div.classList.add( 'enter' )
      div.setAttribute( 'tabindex', 0 )

      div.addEventListener( 'keydown', e => {
        if( e.key === 'l' && e.ctrlKey === true ) {
          loadDemo() 
        }
      })

      document.body.append( div )

      return div
    }else{
      return introEle
    }
  }else{
    document.querySelector('#help').remove()
    return introEle
  }
}


const showError = function( msg ) {
  const div = document.createElement('div')
  const size = bitty.instances.baseFontSize
  div.style = `width:calc(100% - ${size*2}px); margin:0; padding:.5rem; height:${4*size}px; position:absolute; bottom:0; left:0; background:rgb(127,0,0); color:white; z-index:1000; font-family:monospace; font-size:${size}px;`
  div.textContent = msg
  document.body.append( div )
  setTimeout( t=> {
    div.style.opacity = 0;
    div.style.transition = 'opacity 1s linear'
  }, 4000 )
  setTimeout( t=> div.remove(), 5000 )
  setTimeout( t=> { div.style.background='rgba(0,0,0,.75)' }, 250 )
}

const showWarning = function( msg ) {
  const div = document.createElement('div')
  div.style = `width:calc(100% - 1em); margin:0; padding:.5rem; height:2.5rem; position:absolute; bottom:0; left:0; background:rgb(127,127,0); color:white; z-index:1000; font-family:monospace; font-size:1.5rem;`
  div.textContent = msg
  document.body.append( div )
  setTimeout( t=> {
    div.style.opacity = 0;
    div.style.transition = 'opacity 1s linear'
  }, 4000 )
  setTimeout( t=> div.remove(), 5000 )
  setTimeout( t=> { div.style.background='rgba(0,0,0,.75)' }, 250 )
}


const setupMarching = function() {
  const c = document.querySelector('canvas')
  Marching.init( c )
  Marching.export( window )
  Marching.keys = {
    w:0,
    a:0,
    s:0,
    d:0,
    alt:0
  }

  return c
}

window.onload = init

const getAllCode = editor => editor.state.doc.toString()
const getCurrentLine = e => { 
  return e.state.doc.lineAt( e.state.selection.main.head )
}

let cameraIsOn = false
const toggleCamera = function() {
  cameraIsOn = !cameraIsOn
  if( cameraIsOn ) 
    cameraOn()
  else
    cameraOff()
}
const cameraOn = function( shouldToggleGUI=true) {
  Marching.cameraEnabled = true //!Marching.cameraEnabled
  Marching.camera.on()

  editor.el.style.display = 'none'
}
const cameraOff = function( shouldToggleGUI=true) {
  Marching.cameraEnabled = false //!Marching.cameraEnabled

  const idx = Marching.callbacks.indexOf( Marching.camera.__framefnc )
  if( idx !== -1 ) {
    Marching.callbacks.splice( idx, 1 )
  }

  editor.el.style.display = 'block'
}

let demoidx = 0
const getStarterCode = function() {
  let out = intro 
  if( window.location.search !== '' ) {
    // use slice to get rid of ?
    const query = window.location.search.slice(1)
    const params = query.split('&')
    
    if( params[0] === 'tutorial' ) {
      out = tutorial 
    }else{
      out = atob( params[0] )
      screamer.run( out )
    }
  }else{
    const code = demos[ 0 ]
    out = code
    screamer.run( code )
  }
  
  return out
}

const reset = `camera = (0 0 5) render = med fog = (0 0 0 0) post = () background = (0 0 0) lighting = ()\n`
const loadDemo = function() {
  Marching.postrendercallbacks.length = 0

  const code = demos[ ++demoidx % demos.length ]

  // do not include reset code in editor, but run it
  
  editor.value = code
  screamer.run( reset + code )
}

const updateLocation = function( code ) {
  //const code = bitty.value//.join('\n')
  const codeCompressed = btoa( code )
  const link = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${codeCompressed}`
  window.history.replaceState( {} , 'screamer', link );
}

const prefix = `fog = (0 0 0 0) post = () background = (0 0 0 ) render=med shadow=0.1\n`

const setupEditor = function() {
  const intro = getStarterCode()
  const processed = bitty.process( intro, true )

  const b = bitty.create({ value:intro })

  b.subscribe( 'run', code => {
    const __code = prefix+code.trim()
    if( Marching.camera.__camera !== undefined ) {
      const pos = Marching.camera.__camera.position.slice(0)
      const rot = Marching.camera.__camera.rotation.slice(0)
      screamer.run( __code )
      if( screamer.DO_NOT_RESET_CAMERA === false ) {
        Marching.camera.__camera.position = pos
        Marching.camera.__camera.rotation = rot
        Marching.camera.update()
      }else{
        Marching.camera.__camera.rotation = [0,Math.PI, Math.PI]
      }
    }
    updateLocation( code.trim() )
  }) 

  b.subscribe( 'keydown', e => {
    if( e.ctrlKey && e.key === '.' ) {
      Marching.clear( true )
      Marching.lighting.lights.length = 0
      screamer.config.lighting = null
    }else if( e.altKey && e.code === 'KeyL' ) {
      loadDemo()  
      e.preventDefault()
      e.stopImmediatePropagation()
    }else if( e.key === '$' ) {
      bitty.runBlock()
      e.preventDefault()
    }else if( e.altKey && e.code === 'KeyC' ) {
      //toggleCamera()
    }else if( Marching.keys[ e.key ] !== undefined && Marching.cameraEnabled ) {
      Marching.keys[ e.key ] = 1
    }else if( e.altKey && (e.key === '=' || e.key === '≠') ) {
      bitty.instances[0].changeFontSize( 2 )
      e.stopImmediatePropagation()
      e.preventDefault()
    }else if( e.altKey && e.key === '-' || e.key === '–') {
      e.stopImmediatePropagation()
      e.preventDefault()
      bitty.instances[0].changeFontSize( -2 )
    }else if( e.altKey && (e.key === '/' || e.keyy === '÷' ) ) {
      const help = document.querySelector('#help')
      help.style.display = 'none'
      e.stopImmediatePropagation()
      e.preventDefault()
    }

    return false
  })

  b.subscribe('keyup', event => {
    if( Marching.cameraEnabled ) {
      const code = event.key//.code.slice(3).toLowerCase()
      Marching.keys[ code ] = 0
    }else if( event.key === 'Alt' ) {
      for( let key in Marching.keys ) {
        Marching.keys[ key ] = 0
      }
    } 
  })


  window.addEventListener( 'keydown', e => {
    console.log( e )
    if( ( e.key === 'c' || e.key === 'ç' ) && e.altKey === true ) {
      toggleCamera()
    }else if( e.key === '.' && e.ctrlKey === true && e.shiftKey === true ) {
      Marching.pause()
    }else if( Marching.cameraEnabled ) {
      Marching.keys[ e.key ] = 1
    }
  })

  window.addEventListener( 'keyup', e => {
    if( Marching.cameraEnabled ) {
      Marching.keys[ e.key ] = 0
    }
  })

  b.subscribe( 'click', e=> {
    removeIntro() 
  })

  b.focus()

  return b
}
