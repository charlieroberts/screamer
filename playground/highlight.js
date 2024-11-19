window.bitty.rules = {
  // make sure operators are first as hyphens
  // and <> signs are used in surrounding
  // <span> elements and will be caught by
  // this rule after other rules have run;
  // works fine if it is run first.
  operators: /(@|\+{2,4}|\*{2,4}|#+|-{2,4}|%|\>)/g,
  
  comments: /(\/\/.*)/g,
  
  keywords: /\b(fog|background|render|post|fft|camera|lighting|voxel)(?=[^\w])/g,

  variables: /\b(time|mousex|mousey|i|low|mid|high)(?=[^\w])/g,

  numbers: /\b(\d+)/g,
}
