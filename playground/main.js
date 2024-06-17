import { basicSetup, minimalSetup, EditorView } from "codemirror"
import { closeBrackets } from "@codemirror/autocomplete"
import { keymap, lineNumbers, gutter } from "@codemirror/view"
import { Prec, Compartment } from "@codemirror/state"
import { javascript, javascriptLanguage } from "@codemirror/lang-javascript"
import { defaultKeymap } from "@codemirror/commands"
import { basicDark } from 'cm6-theme-basic-dark'
import { StreamLanguage } from "@codemirror/language"
import { screamer_def } from "./screamer-def.js"
import { demos } from './demos.js'
import tutorial from './tutorial.js' 
import screamer from '../screamer.js'

const isMobile = /iPhone|iPad|iPod|Android/i.test( navigator.userAgent )

let run
const init = async function() {
  screamer.init()
  const canvas = setupMarching()
  setupEditor()

  canvas.onclick = () => editor.focus() 
  Marching.materials.__clearOnEmit = false
  
  const err = console.error
  console.error = function( e ) {
    showError( e )
    err( e )
  }

  if( isMobile ) {
    const btn = document.createElement('button')
    btn.innerText = 'Next Demo >>'
    btn.style = 'position:fixed; bottom:0; right:0; background:rgba(0,0,0,.75); color:white; font-size:2.5rem; min-height:5.5rem; border:1px solid white'
    document.body.append( btn )
    btn.onclick = loadDemo
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

const editableCompartment = new Compartment

const toggleCamera = function( shouldToggleGUI=true) {
  Marching.cameraEnabled = !Marching.cameraEnabled
  //document.querySelector('#cameratoggle').checked = Marching.cameraEnabled
  //if( shouldToggleGUI ) toggleGUI()
  Marching.camera.on()
  editor.dispatch({
    effects: editableCompartment.reconfigure(EditorView.editable.of(!Marching.cameraEnabled))
  })

  if( !Marching.cameraEnabled ) editor.focus()
}

const starter = `// welcome to screamer!

// coding on this site targets desktops, but mobile users can
// click through demos using the "Next Demo >>" button in 
// the top right corner. for the adventurous, mobile users
// can also evaluate code using the $ key (or normal key
// combos if you have a physical keyboard connected).

// key commands (replace "alt" key with "option" key in macOS)
// - alt + l loads the next demo
// - ctrl + enter executes a line
// - alt + enter executes a block
// - shift + enter executes a block and resets default config
// - ctrl + . clears the scene
// - alt + c enables WASD + arrow keys camera control

// interactive reference:
// https://charlieroberts.github.io/screamer-docs
//
// tutorial:
// https://charlieroberts.github.io/screamer/playground/?tutorial
//
// have fun!

`

let demoidx = 0
const getStarterCode = function() {
  let out = starter
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
    out += code
    screamer.run( code )
  }
  
  return out
}

const reset = `camera = (0 0 5) render = med fog = (0 0 0 0) post = () background = (0 0 0)\n`
const loadDemo = function() {
  const code = demos[ ++demoidx % demos.length ]

  // do not include reset code in editor, but run it
  editor.dispatch({
    changes: { from: 0, to: editor.state.doc.length, insert: code }
  })
  
  screamer.run( reset + code )
}



const getBlock = function( cm ) {
  let startline = cm.state.doc.lineAt( cm.state.selection.main.head ).number, 
      endline = startline
      
  
  while ( startline >= 1 && cm.state.doc.line( startline ).text !== "" ) { startline-- }
  while ( endline < cm.state.doc.lines && cm.state.doc.line( endline ).text !== "" ) { endline++ }

  const text = cm.state.sliceDoc(
    cm.state.doc.line( startline+1 ).from, 
    cm.state.doc.line( endline ).to
  )

  const range = [ startline, endline ]
  if( cm.state.doc.line( endline ).text === "" ) range[1] -= 1

  return { text, range }
}

// this is the top-notch-pro way to flash code lines 
// in codemirror 6, without using all that newfangled
// decoration / facet stuff.
const flashColor = 'rgba(255,255,255,.35)'
const bgColor = 'rgba(0,0,0,.65)'

const markLine = function( lineNumber, color ) {
  const lines = document.querySelectorAll( '.cm-line' )
  lines[ lineNumber ].style.background = color
}

const flashLine = function( line ) {
  markLine( line, flashColor )
  setTimeout( ()=> markLine( line, bgColor ), 400 )
}

const flashBlock = function( range ) {
  for( let i = range[0]; i < range[1]; i++ ) markLine( i, flashColor )

  setTimeout( ()=> {
    for( let i = range[0]; i < range[1]; i++ ) markLine( i, bgColor )
  }, 400 )
}

const prefix = `camera=(0 0 5) fog = (0 0 0 0) post = () background = (0 0 0 ) render = med\n`
const setupEditor = function() {
  const p = Prec.highest(
    keymap.of([
      { 
        key: "Shift-Enter", 
        run(e) { 
          //localStorage.setItem("src", e.state.doc.toString())
          const block = getBlock( e )
          const code  = block.text 
          flashBlock( block.range )
          screamer.run( prefix+code )
          return true
        } 
      },
      // for mobile?
      { 
        key: "$", 
        run(e) { 
          //localStorage.setItem("src", e.state.doc.toString())
          const block = getBlock( e )
          const code  = block.text 
          flashBlock( block.range )
          screamer.run( prefix+code )
          return true
        } 
      },

      { 
        key: "Alt-Enter", 
        run(e) { 
          const block = getBlock( e )
          const code  = block.text 
          flashBlock( block.range )
          setTimeout( ()=>screamer.run( code ), 0 )
          return true
        } 
      }, 
      { 
        key: "Alt-l", 
        run(e) { 
          loadDemo()
          return true
        } 
      }, 

      {
        key: "Ctrl-Enter", 
        run(e) { 
          //localStorage.setItem("src", e.state.doc.toString())
          const line = getCurrentLine( e )
          flashLine( line.number - 1 ) 
          screamer.run( line.text )
          return true
        } 
      },
      { 
        key: "Shift-Ctrl-Enter", 
        run(e) { 
          //localStorage.setItem("src", e.state.doc.toString())
          screamer.run( getAllCode( e ) )
          return true
        } 
      },
      { 
        key: "Ctrl-.", 
        run(e) { 
          Marching.clear()
          return true
        } 
      }
    ])
  );

  //let src = localStorage.getItem("src")
  //src = src == null ? shaderDefault : src


  const sd = StreamLanguage.define( screamer_def )

  const theme = EditorView.theme({
    '&': {
      fontSize: '1.5rem',
    },
    '.cm-content': {
      fontFamily: "Menlo, Monaco, Lucida Console, monospace",
    } 
  })

  window.editor = new EditorView({
    doc: getStarterCode(),
    extensions: [
      minimalSetup, 
      closeBrackets(),
      //[lineNumbers(), gutter({class: "cm-mygutter"})],
      sd,
      p,
      basicDark,
      theme,
      editableCompartment.of( EditorView.editable.of( true ) ),
      // only close ( and [
      sd.data.of({closeBrackets: {brackets: ['(', '[']}})
    ],
    parent: document.body,
  });

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

  editor.focus()
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


  // DRY... also used for gabber button
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

