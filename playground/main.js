import { basicSetup, EditorView } from "codemirror"
import { keymap } from "@codemirror/view"
import screamer from '../screamer.js'
import { Prec, Compartment } from "@codemirror/state"
import { javascript } from "@codemirror/lang-javascript"
import { defaultKeymap } from "@codemirror/commands"
import { basicDark } from 'cm6-theme-basic-dark'



let run
const init = async function() {
  let src = localStorage.getItem("src")
  src = src == null ? shaderDefault : src

  screamer.init()
  setupEditor()
  setupMarching()


}

const setupMarching = function() {
  Marching.init( document.querySelector('canvas') )
  Marching.export( window )
  Marching.keys = {
    w:0,
    a:0,
    s:0,
    d:0,
    alt:0
  }
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

const setupEditor = function() {
  const p = Prec.highest(
    keymap.of([
      { 
        key: "Ctrl-Enter", 
        run(e) { 
          localStorage.setItem("src", e.state.doc.toString())
          screamer.run( getCurrentLine( e ) )
          return true
        } 
      },
      { 
        key: "Shift-Ctrl-Enter", 
        run(e) { 
          localStorage.setItem("src", e.state.doc.toString())
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

  let src = localStorage.getItem("src")
  src = src == null ? shaderDefault : src

  window.editor = new EditorView({
    doc: shaderDefault,
    extensions: [
      basicSetup, 
      javascript(),
      p,
      basicDark,
      editableCompartment.of(EditorView.editable.of(true)),
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

const shaderDefault = 
`// place your cursor in the line below and hit Ctrl+Enter
sphere

// also try box, cone, cylinder, julia, mandelbox...
box

// bigger sphere?
sphere^1.5

// bigger cone?
cone^5

// repeated boxes?
box | 3

// smaller boxes, more repeats
box^.1 | .4

// we can specify better render settings for large repeats
// run these lines one by one or highlight them both
// and hit ctrl+enter
render = repeat.med
box^.1 | .4

// a little fog makes things purdy
// first, the amount of fog, then, the color
// screamer will also remember your last used
// render settings (repeat.med)
fog = (.25,0,0,0)
sphere ^.1 | .4

// play with your mouse
sphere ^ mousex | mousey * 4

// animate with time
fog = (0,0,0,0)
sphere ^ 1 + sin(time)

// combine two shapes
sphere^1.3 ++ box

// smoother
sphere^1.3 +++ box

// stepped
sphere^1.3 ++++ box

// group with parenthesis and rotate
// rotate (@) takes an amount in degrees, followed by an axis
(sphere^1.3 ++++ box)@(time*20, sin(time), 1, 0)

// get the difference of two shapes
box -- julia

// animate julia fractal folding and rotate
((box -- julia( 4 + sin(time ))^1.3 ) @ (time*20,0,1,0)) ^ 1.35

// color julia red,green,blue,cyan,magenta,yellow,black,white,grey
julia(time)^2.5 : red

// texture julia
render = fractal.med
fog = (.125,0,0,0)
julia( 5+sin(time/3) ) ^2 : red :: stripes

// texture boxes
render = repeat.med
fog = (.25,0,0,0)
(box@(time*25,0,1,0)::rainbow^.2 | .75)

// hit alt+c, then use WASD and the arrow keys to explore
// hit alt+c again to resume editing

// subtract a repeat
fog = (0,0,0,0)
(box:red -- box:green^.1|.3)@(time*5,0,1,1)

// smooth out the jaggies with post-processing
post = ( antialias(3) )
(box:red -- box:green^.1|.3)@(time*5,0,1,1)

// fun with postprocessing and mouse
post = ( edge, invert(1) )
(box:red -- box:green^mousey/4|.2+mousex/3)^1.6@(time*15,0,1,1)
`
