{{
  const dict = {
    '++':'Union',
    '+++':'RoundUnion',
    '++++':'StairsUnion',
    '+++++': 'ChamferUnion',
    '++++++': 'ColumnsUnion',
    '--':'Difference',
    '---':'RoundDifference',
    '----':'StairsDifference',
    '-----': 'ChamferDifference',
    '-------': 'ColumnsDifference',
    '**':'Intersection',
    '***':'RoundIntersection',
    '****':'StairsIntersection',
    '*****': 'ChamferIntersection',
    '******': 'ColumnsIntersection'
  }
  const vars = []
  
  function combo( a, op, args, b ) {
  	const name = dict[ op ]
    if( a===null ) { 
      throw SyntaxError(`Your ${name} is missing an argument to the left of the ${op} operator.`)
    } 
    if( b===null ) { 
      throw SyntaxError(`Your ${name} is missing an argument to the right of the ${op} operator.`)
    }
    return ['combinator', name, a,b,args ] 
  }
}}

out "out" = body:statement+ 

statement = _ __* body:(comment / hydra / config / assignment / color / expr  ) _ __* { 
  return body
}

hydra "hydra" = "hydra`" _  body:$(!"`" .)* _ '`' {
  return ['hydra', body]
} 

comment = '//' _ (!'\n' .)*  _ '\n' { return ['comment'] }

config "config" = name:config_name _ '=' _ value:(number / word / pp / listparen) {
  return ['config', name, value ]
}

config_name = name:("render" / "fog" / "background" / "post" / "camera" / "fft" / "lighting" / "voxel" / "shadow" / "foreground" / "fg" / "bg" / "zoom" / "res" ) {
  if( name === "fg" ) { 
    name = 'foreground' 
  }else if( name === "bg" ) {
    name = 'background'
  }else if( name === 'res' ) {
    name = 'zoom'
  }
  
  return name
}

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

assignment "assign" = name:word _ '=' _ statement:(expr)? {
  if( statement === null ) {
    throw SyntaxError(`You didn't assign anything to ${name}.`)
  }
  const out = [ 'assignment', name, statement ]
  vars.push( name )
  
  return out
}

vector = lp a:arguments rp { return a }

mathgroup "mathgroup" = _ lp body:mathoperation rp {
  return body
}

group "group" = _ '(' body:expr ')' _ { 
  return body 
}

expr "expr" = operation / group / loop  / geometry / operand / mathoperand

operation = comboexpr / modchain

combinator = 
  '++++++' / '+++++' / '++++' / '+++' / '++' /
	'------' / '-----' / '----' / '---' / '--' /
  '******' / '*****' / '****' / '***' / '**'
    
comboexpr = a:operand? _ name:combinator args:operandargs? _ b:expr? {
  return combo(a,name,args,b)
}

mathoperand "mathoperand" = audio / oscaddress / mathgroup / number / variable / function 
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

modspecial = xyzchar $moddims+
moddims = [xyz]

modchar = xyzchar/rgbchar 
rgbchar = '::::' / ':::' / '::' / ':' 
xyzchar = '@@' / '@' / '>>' / '>' / '###' / '##' / '#' / '||' / '|' / '~' / "'"

modoperation = rgbop/xyzop

modchain = a:(geometry/group/loop/word) _ b:modoperation+ {
  const mods = []
  b.forEach( m => {
    if( m.length === 1 ) 
      mods.push( m[0] )
    else
      m.forEach( m1 => mods.push(m1) )
  })
  return ['modchain',a,mods]
}

rgbop "rgbop" = b:(rgbchar _ (color/material/texture/modoperation))+ {
  const isBNull = b === null
  if( !isBNull ) {
    const isFinalTerm = b !== null && b[0] === undefined
    return isFinalTerm ? b[0] : b.map(v=>[v[0],v[2]])
  }else{
    return b
  }
}

// some xyz ops can be used without arguments, like | and ||
xyzop "xyzdop" = b:((modspecial/xyzchar) _ (listparen/mathoperation/modoperation)?)+ {
  const isBNull = b === null
  if( !isBNull ) {
    const isFinalTerm = b !== null && b[0] === undefined
    return isFinalTerm ? b[0] : b.map(v=>[v[0],v[2]])
  }else{
    return b
  }
}

operandargs = lp alist:list rp { return alist }
operand  "operand" = modchain / group / geometry / loop / function / var

variable = "time" / "mousex" / "mousey" / "i"
var = a:word {
  if( vars.indexOf( a ) === -1 ) {
    throw SyntaxError(`The variable ${a} has not been declared`)
  }
  return a
}
function = maths / geometry

maths "math" = name:math lp a:arguments rp {
  return ['math', name, a ]
}

audiovar = name:("low"/"mid"/"high") { return name }
audiofnc = name:("low"/"mid"/"high") lp a:arguments rp {
  return ['math', name, a ]
}

audio = audiofnc / audiovar 

// support for optional parenthesis
geometry "geometries" = name:geometry_name a:(lp b:arguments rp?)? {
  if( a !== null && a[2] === null ) {
    throw SyntaxError(`Are you missing a right parenthesis when creating your ${name}?`)
  }
  return ['geometry', name[0].toUpperCase() + name.slice(1), a===undefined||a===null ? null : a[1] ]
}

color "color" = 'color' lp args:arguments rp {
  return ['color', args ]
}

math = 
  "sinn" / "sin" /
  "round" /
  "cosn" / "cos" /
  "abs" /
  "floor" /
  "random" /
  "ceil" /
  "fade" /
  "osc" 
  

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
  "redp" /
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
  "hydra" /
  "feedback"
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

light = 'light' vec  

// argument list or empty
arguments = list / _
list = l:(argument ','? _ )+ {
  return l.map( v => v[0] )
}
argument = oscaddress / mathoperation / mathoperand / light / vec / word 

oscaddress = '\\' addr:oscword { 
  return ['math', 'osc', '\\'+addr ] 
}

rp = _')'_ { return ')' }
lp = _'('_ { return '(' }

numword = _ letters:numchar+ _ { return letters.join('') } 
numchar = [a-zA-Z.]/number
number = "-"? (([0-9]+ "." [0-9]*) / ("."? [0-9]+)) { return +text() }
int = num:$[0-9]+ { return parseInt( num ) }

oscword = _ letters:(char / '/')+ _ { return letters.join('') } 
word = _ letters:char+ _ { return letters.join('') } 
char = [a-zA-Z.]

__ "line breaks" = [\n\r]
_ "whitespace" = [ \t]*
