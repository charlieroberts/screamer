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
    bitty.focus() 
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

  introEle = showIntro()

  const help = document.querySelector('#help')

  help.addEventListener( 'click',  e => {
    introEle = showIntro()
    return true
  })

  window.screamer = screamer
}

const showIntro = function() {
  bitty.focus()
  if( introEle === null ) {
    const div = document.createElement('div')
    div.innerHTML = intro
    div.classList.add( 'intro' )
    div.classList.add( 'enter' )
    div.setAttribute( 'tabindex', 0 )

    div.addEventListener( 'keydown', e => {
      if( e.key === 'l' && e.altKey === true ) {
        loadDemo() 
      }
    })

    document.body.append( div )

    return div
  }else{
    return introEle
  }
}


const showError = function( msg ) {
  const div = document.createElement('div')
  div.style = `width:calc(100% - 1em); margin:0; padding:.5rem; height:2.5rem; position:absolute; bottom:0; left:0; background:rgb(127,0,0); color:white; z-index:1000; font-family:monospace; font-size:1.5rem;`
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

const toggleCamera = function( shouldToggleGUI=true) {
  Marching.cameraEnabled = !Marching.cameraEnabled
  Marching.camera.on()
  //editor.dispatch({
  //  effects: editableCompartment.reconfigure(EditorView.editable.of(!Marching.cameraEnabled))
  //})

  //if( !Marching.cameraEnabled ) editor.focus()
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

const updateLocation = function() {
  const code = editor.value.join('\n')
  const codeCompressed = btoa( code )
  const link = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${codeCompressed}`
  window.history.replaceState( {} , 'screamer', link );
}

const prefix = `camera=(0 0 5) fog = (0 0 0 0) post = () background = (0 0 0 ) render = med\n`

const setupEditor = function() {
  const intro = getStarterCode()
  const processed = bitty.process( intro, true )

  const b = bitty.create({ value:intro })

  b.subscribe( 'run', code => screamer.run( prefix+code ) ) 

  b.subscribe( 'keydown', e => {
    if( e.ctrlKey && e.key === '.' ) {
      Marching.clear( true )
      Marching.lighting.lights.length = 0
      screamer.config.lighting = null
    }else if( e.altKey && e.key === 'l' ) {
      loadDemo()  
    }else if( e.key === '$' ) {
      bitty.runBlock()
    }

    return false
  })

  window.addEventListener( 'keydown', e => {
    if( e.key === 'c' && e.altKey === true ) {
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

// taken wih gratitude from https://stackoverflow.com/a/52082569
function copyToClipboard(text) {
    var selected = false
    var el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'absolute'
    el.style.left = '-9999px'
    document.body.appendChild(el)
    if (document.getSelection().rangeCount > 0) {
        selected = document.getSelection().getRangeAt(0)
    }
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    if (selected) {
        document.getSelection().removeAllRanges()
        document.getSelection().addRange(selected)
    }
}

window.getlink = function( name='link' ) {
  const lines = getAllCode( window.editor )
  if( lines[ lines.length - 1].indexOf('getlink') > -1 ) {
    lines.pop()
  }

  const code = btoa( lines )
  const link = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${code}`

  const menu = document.createElement('div')
  menu.setAttribute('id', 'connectmenu')
  menu.style.fontFamily = 'sans-serif'
  menu.style.background = 'rgba(255,255,255,.85)'
  menu.style.color = 'black'
  menu.style.width = '12.5em'
  menu.style.height = '3.5em'
  menu.style.position = 'fixed'
  menu.style.display = 'block'
  menu.style.border = '1px var(--f_inv) solid'
  menu.style.borderTop = 0
  menu.style.top = 0
  menu.style.right = 0 
  menu.style.zIndex = 1000

  menu.innerHTML = `<p style='font-size:.7em; margin:.5em; margin-bottom:1.5em; color:var(--f_inv)'>Click here to copy a link that runs your code.</p>`

  document.body.appendChild( menu )

  const blurfnc = ()=> {
    copyToClipboard( link )
    menu.remove()
    document.body.removeEventListener( 'click', blurfnc )
  }
  document.body.addEventListener( 'click', blurfnc )

  return link
}
