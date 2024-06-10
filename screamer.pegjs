out "out" = body:statement+ 

statement = _ __* body:(comment / config / assignment / expr ) _ __* { 
  //console.log( body )
  return body
}

comment = '//' _ (!'\n' .)*  _ '\n' { return ['comment'] }

config "config" = name:config_name _ '=' _ value:(word / pp / listparen / number) {
  return ['config', name, value ]
}

config_name = "render" / "fog" / "background" / "post" / "camera" / "fft" / "lights"

pp = lp fx:(post (lp arguments rp)? ','?)+ rp { 
   return fx.map( f => [ f[0], f[1] === null ? null : f[1][1] ] ) 
}

listparen = lp _ values:arguments _ rp { return { name:'list', values } }

loop "loop" = _ '[' _ 
  obj:(operation / group / geometry) _ 
  num:int _ 
  mods:( (modspecial/modchar) _ (mathoperation/listparen)?)* _ 
']' _ {
  mods = mods.map( v => [ v[0], v[2] ] )
  return ['loop', obj, num, mods]
}

assignment "assign" = name:word _ '=' _ statement:(expr/vector) {
  return [ 'assignment', name, statement ]
}

vector = lp a:arguments rp { return a }

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
union "union"   = a:operand _ '++' args:operandargs? _ b:expr* { 
  return ['combinator', 'Union', a,b[0],args ] 
}
roundunion "runion"   = a:operand _ '+++' args:operandargs? _ b:expr* { 
  return ['combinator', 'RoundUnion', a,b[0],args ] 
}
stairsunion "sunion"  = a:operand _ '++++' args:operandargs? _ b:expr* { 
  return ['combinator', 'StairsUnion', a,b[0],args ] 
}

// difference
difference "difference" = a:operand _ '--' args:operandargs? _ b:expr* {
 return ['combinator', 'Difference', a,b[0] ] 
}
rounddifference "rdifference"   = a:operand _ '---' args:operandargs? _ b:expr* { 
  return ['combinator', 'RoundDifference', a,b[0],args ] 
}
stairsdifference "sdifference"  = a:operand _ '----' args:operandargs? _ b:expr* { 
  return ['combinator', 'StairsDifference', a,b[0],args ] 
}

// intersection
intersection "intersection" = a:operand _ '**' args:operandargs? _ b:expr* {
  return ['combinator', 'Intersection', a,b[0] ]
}
roundintersection "rintersection"   = a:operand _ '***' args:operandargs? _ b:expr* { 
  return ['combinator', 'RoundIntersection', a,b[0],args ] 
}
stairsintersection "sintersection"  = a:operand _ '****' args:operandargs? _ b:expr* { 
  return ['combinator', 'StairsIntersection', a,b[0],args ] 
}

mathchar = '+' / '-' / '/' / '*'/ '%' / '^'
mathoperation "math" = a:mathoperand _ b:(mathchar _ mathoperation)* {
  // operations are represented as arrays. 
  // if b is instead a number, it is the final term
  // in a potential sequence of operations
  const isFinalTerm = b[0] === undefined
  return isFinalTerm ? a : ['math',b[0][0], a,b[0][2] ] 
}

modspecial = modchar $moddims+
moddims = [xyz]

/*modchar = "'" / '::' / ':' / '@@' / '@' / '>>' / '>' / '###'/ '##' / '#' / '||' / '|'*/
modchar = "'" / '::' / ':' / '@@' / '@' / '>>' / '>' / '##' / '#' / '||' / '|' / '~'

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

mathoperand "mathoperand" = number / variable / function 
variable = "time" / "low" / "mid" / "high" / "mousex" / "mousey" / "i"

function = maths / geometry

maths "math" = name:math lp a:arguments rp {
  return ['math', name, a ]
}

// support for optional parenthesis
geometry "geometries" = name:geometry_name a:(lp b:arguments rp)? {
  return ['geometry', name[0].toUpperCase() + name.slice(1), a===undefined||a===null ? null : a[1] ]
}

math = 
  "sinn" / "sin" /
  "round" /
  "cosn" / "cos" /
  "abs" /
  "floor" /
  "random" /
  "ceil" 

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

texture = _ name:texture_name args:(lp ((mathoperation/vec) ","?)* rp)? {
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
  "rainbow"/
  "stripes"/
  "dots"/
  "zigzag"/
  "truchet"/
  "noise"/
  "checkers"/
  "voronoi"/
  "cellular"
) _ { return name }

post = _ name: (
  "antialias" /
  "bloom" /
  "focus" /
  "godrays" /
  "edge" /
  "invert" /
  "blur"
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
