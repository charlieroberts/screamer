import { basicSetup, EditorView } from "codemirror"
import { keymap } from "@codemirror/view"
import screamer from '../screamer.js'
import { Prec, Compartment } from "@codemirror/state"
import { javascript } from "@codemirror/lang-javascript"
import { defaultKeymap } from "@codemirror/commands"
import { basicDark } from 'cm6-theme-basic-dark'

const shaderDefault = `render = med
fog = (.15,0,0,0)
box::rainbow | 2 + sin(time/4) * .35`

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
    doc: src,
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
