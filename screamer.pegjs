out "out" = body:statement+ 

statement = _ __* body:(comment / hydra / config / assignment / expr ) _ __* { 
  //console.log( body )
  return body
}

hydra "hydra" = "hydra`" _  body:$(!"`" .)* _ '`' {
  return ['hydra', body]
} 

comment = '//' _ (!'\n' .)*  _ '\n' { return ['comment'] }

config "config" = name:config_name _ '=' _ value:(number / word / pp / listparen) {
  return ['config', name, value ]
}

config_name = "render" / "fog" / "background" / "post" / "camera" / "fft" / "lights" / "voxel"

pp = lp fx:(post (lp arguments rp)? ','?)+ rp { 
   return fx.map( f => [ f[0], f[1] === null ? null : f[1][1] ] ) 
}

listparen = lp _ values:arguments _ b:rp? { 
  
  if( b===null ) {
    throw SyntaxError('Are you missing a closing parenthesis for your list?')
  }
  return { name:'list', values } 
}

loop "loop" = _ '[' _ 
  obj:(operation / group / geometry) _ 
  num:int _ 
  mods:( (modspecial/modchar) _ (mathoperation/listparen)?)* _ 
d:']'? _ {
  if( d === null ) throw SyntaxError( 'Did you forget to close your loop?' )
  mods = mods.map( v => [ v[0], v[2] ] )
  return ['loop', obj, num, mods]
}

assignment "assign" = name:word _ '=' _ statement:(expr/vector)? {
  if( statement === null ) {
    throw SyntaxError(`You didn't assign anything to ${name}.`)
  }
  return [ 'assignment', name, statement ]
}

vector = lp a:arguments rp { return a }

mathgroup "mathgroup" = _ lp body:mathoperation rp {
  return body
}

group "group" = _ '(' body:expr ')' _ { 
  return body 
}

expr "expr" = operation / group / loop  / geometry / operand / mathoperand

operation = 
  stairsunion /
  roundunion /
  union /
  stairsdifference /
  rounddifference /
  difference /
  stairsintersection /
  roundintersection /
  intersection /
  modoperation

// union
union "union"   = a:operand? _ '++' args:operandargs? _ b:expr? { 
  if( a===null ) { 
    throw SyntaxError(`Your union is missing an argument to the left of the ++ operator.`)
  }
  if( b===null ) { 
    throw SyntaxError(`Your union is missing an argument to the right of the ++ operator.`)
  }
  return ['combinator', 'Union', a,b,args ] 
}
roundunion "runion"   = a:operand _ '+++' args:operandargs? _ b:expr? {
  if( a===null ) { 
    throw SyntaxError(`Your round union is missing an argument to the left of the ++ operator.`)
  }
  if( b===null ) { 
    throw SyntaxError(`Your round union is missing an argument to the right of the +++ operator.`)
  }
  return ['combinator', 'RoundUnion', a,b,args ] 
}
stairsunion "sunion"  = a:operand _ '++++' args:operandargs? _ b:expr? { 
  if( a===null ) { 
    throw SyntaxError(`Your stairs union is missing an argument to the left of the ++ operator.`)
  }
  if( b===null ) { 
    throw SyntaxError(`Your stairs union is missing an argument to the right of the ++++ operator.`)
  }
  return ['combinator', 'StairsUnion', a,b,args ] 
}

// difference
difference "difference" = a:operand? _ '--' args:operandargs? _ b:expr? {
  if( a===null ) { 
    throw SyntaxError(`Your difference is missing an argument to the left of the -- operator.`)
  }
  if( b===null ) { 
    throw SyntaxError(`Your difference is missing an argument to the right of the -- operator.`)
  }
  return ['combinator', 'Difference', a,b, args] 
}
rounddifference "rdifference"   = a:operand? _ '---' args:operandargs? _ b:expr? { 
  if( a===null ) { 
    throw SyntaxError(`Your round difference is missing an argument to the left of the --- operator.`)
  }
  if( b===null ) { 
    throw SyntaxError(`Your round difference is missing an argument to the right of the --- operator.`)
  }
  return ['combinator', 'RoundDifference', a,b,args ] 
}
stairsdifference "sdifference"  = a:operand? _ '----' args:operandargs? _ b:expr? { 
  if( a===null ) { 
    throw SyntaxError(`Your stairs difference is missing an argument to the left of the ---- operator.`)
  }
  if( b===null ) { 
    throw SyntaxError(`Your stairs difference is missing an argument to the right of the ---- operator.`)
  }

  return ['combinator', 'StairsDifference', a,b,args ] 
}

// intersection
intersection "intersection" = a:operand? _ '**' args:operandargs? _ b:expr? {
  if( a===null ) { 
    throw SyntaxError(`Your intersection is missing an argument to the left of the ** operator.`)
  }
  if( b===null ) { 
    throw SyntaxError(`Your intersection is missing an argument to the right of the ** operator.`)
  }
  return ['combinator', 'Intersection', a,b,args ]
}
roundintersection "rintersection"   = a:operand? _ '***' args:operandargs? _ b:expr? { 
  if( a===null ) { 
    throw SyntaxError(`Your round intersection is missing an argument to the left of the *** operator.`)
  }
  if( b===null ) { 
     throw SyntaxError(`Your round intersection is missing an argument to the right of the *** operator.`)
  }

  return ['combinator', 'RoundIntersection', a,b,args ] 
}
stairsintersection "sintersection"  = a:operand? _ '****' args:operandargs? _ b:expr? { 
  if( a===null ) { 
    throw SyntaxError(`Your stairs intersection is missing an argument to the left of the **** operator.`)
  }
  if( b===null ) { 
    throw SyntaxError(`Your stairs intersection is missing an argument to the right of the **** operator.`)
  }

  return ['combinator', 'StairsIntersection', a,b,args ] 
}

mathoperand "mathoperand" = mathgroup / number / variable / function 
mathchar = '+' / '-' / '/' / '*'/ '%' / '^'
mathoperation "math" = a:mathoperand _ b:(mathchar _ mathoperation)? {
  // operations are represented as arrays. 
  // if b is instead a number, it is the final term
  // in a potential sequence of operations
  const isFinalTerm = b === null
  //if( !isFinalTerm && b[2] === null ) {
  //  throw SyntaxError(`You're missing a value to the right of your ${b[0]} operator.`)
  //}
  return isFinalTerm ? a : ['math',b[0], a,b[2] ] 
}

modspecial = modchar $moddims+
moddims = [xyz]

modchar = "'" / ':::' / '::' / ':' / '@@' / '@' / '>>' / '>' / '###' / '##' / '#' / '||' / '|' / '~'

modoperation "modop" = a:(geometry/group/loop/word) _ b:((modspecial/modchar) _ (material/texture/listparen/mathoperation/modoperation)?)* {
  const isBNull = b === null
  if( !isBNull ) {
    const isFinalTerm = b !== null && b[0] === undefined
    return isFinalTerm ? a : ['mod', a, b.map(v=>[v[0],v[2]]) ] 
  }else{
    return a
  }
}

operandargs = lp alist:list rp { return alist }
operand  "operand" = modoperation / group / geometry / loop / function

variable = "time" / "low" / "mid" / "high" / "mousex" / "mousey" / "i"

function = maths / geometry

maths "math" = name:math lp a:arguments rp {
  return ['math', name, a ]
}

// support for optional parenthesis
geometry "geometries" = name:geometry_name a:(lp b:arguments rp?)? {
  if( a !== null && a[2] === null ) {
    throw SyntaxError(`Are you missing a right parenthesis when creating your ${name}?`)
  }
  return ['geometry', name[0].toUpperCase() + name.slice(1), a===undefined||a===null ? null : a[1] ]
}

math = 
  "sinn" / "sin" /
  "round" /
  "cosn" / "cos" /
  "abs" /
  "floor" /
  "random" /
  "ceil" /
  "fade" 

geometry_name = _ name:(
  "box" /
  "capsule" /
  "cone" /
  "cylinder" /
  "hex" /
  "julia" /
  "mandelbulb" /
  "mandelbox" /
  "mandalay" /
  "KIFS" /
  "octahedron" /
  "plane" /
  "quad" /
  "roundbox" /
  "sphere" /
  "torus" /
  "torus88" /
  "torus82" /
  "triangle"
  ) _ { return name }

material = _ name:(
  "blackhole" /
  "white glow" /
  "red" /
  "green" /
  "blue" /
  "cyan" /
  "magenta" /
  "yellow" /
  "white" /
  "black" /
  "grey" /
  "glue" /
  "inverse" /
  "normal"
) _ { return name }

texture = _ name:(texture_name) args:(lp ((mathoperation/vec) ","?)* rp)? {
  if( args === null ) {
    return [ name, args ]
  }else{
    if( args[1].length === 0 ) {
      return [name, null ]
    }
    return [name, ...(args[1].map( v => v[0] ))]
  }
}

texture_name = _ name:(
  "rainbow" /
  "stripes" /
  "dots" /
  "zigzag" /
  "truchet" /
  "noise" /
  "checkers" /
  "voronoi" /
  "cellular" /
  "hydra"
) _ { return name }

post = _ name: (
  "antialias" /
  "bloom" /
  "focus" /
  "godrays" /
  "edge" /
  "invert" /
  "motionblur" /
  "blur" /
  "hue" /
  "brightness" /
  "contrast" /
  "glow"
) _ { return name }

vec = lp a:arguments rp { return ['vec', a] }

// argument list or empty
arguments = list / _
list = l:(argument ','? _ )+ {
  return l.map( v => v[0] )
}
argument = mathoperation / mathoperand / vec

rp = _')'_ { return ')' }
lp = _'('_ { return '(' }

number = "-"? (([0-9]+ "." [0-9]*) / ("."? [0-9]+)) { return +text() }
int = num:$[0-9]+ { return parseInt( num ) }

word = _ letters:char+ _ { return letters.join('') } 
char = [a-zA-Z.]

__ "line breaks" = [\n\r]
_ "whitespace" = [ \t]*
