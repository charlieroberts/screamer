import { basicSetup, minimalSetup, EditorView } from "codemirror"
import { closeBrackets } from "@codemirror/autocomplete"
import { keymap } from "@codemirror/view"
import { Prec, Compartment } from "@codemirror/state"
import { javascript, javascriptLanguage } from "@codemirror/lang-javascript"
import { defaultKeymap } from "@codemirror/commands"
import { basicDark } from 'cm6-theme-basic-dark'
import { StreamLanguage } from "@codemirror/language"

import { screamer_def } from "./screamer-def.js"
import screamer from '../screamer.js'

let run
const init = async function() {
  screamer.init()
  const canvas = setupMarching()
  setupEditor()

  canvas.onclick = () => editor.focus() 
  Marching.materials.__clearOnEmit = false
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
const getCurrentLine = e => e.state.doc.lineAt( e.state.selection.main.head ).text

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

const getStarterCode = function() {
  let out = defaultCode
  if( window.location.search !== '' ) {
    // use slice to get rid of ?
    const query = window.location.search.slice(1)
    const params = query.split('&')
    out = atob( params[0] )
    screamer.run( out )
  }
  
  return out
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

  return text
}

const setupEditor = function() {
  const p = Prec.highest(
    keymap.of([
      { 
        key: "Alt-Enter", 
        run(e) { 
          //localStorage.setItem("src", e.state.doc.toString())
          const code = getBlock( e ) 
          screamer.run( code )
          return true
        } 
      }, 
      {
        key: "Ctrl-Enter", 
        run(e) { 
          //localStorage.setItem("src", e.state.doc.toString())
          screamer.run( getCurrentLine( e ) )
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

  window.editor = new EditorView({
    doc: getStarterCode(),
    extensions: [
      minimalSetup, 
      closeBrackets(),
      sd,
      p,
      basicDark,
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

const defaultCode = 
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
box'.1 # .4

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
`
