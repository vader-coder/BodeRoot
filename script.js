var polyInput = [];

function onInput() {
  var terms = parseInt(document.getElementById('terms').value);
  console.log(terms);
  var eq = document.getElementById('equation').value;
  const node1 = math.parse('sqrt(5^2 - 4^2)');
  const code1 = node1.compile();
  var num = code1.evaluate(); // 5
  console.log(num);

  var factors = '(1+3x)(1+x)(1+2x)';
  console.log('original factors: ' + factors);
  var y = nerdamer('expand(' + factors + ')');
  var polynomialform = y.toString();
  console.log('polynomial form: ' + polynomialform);
  var coef = polynomialform.split('+').map(v=>v.trim()).map(v=>v.split('x')[0]).map(v=>v.replace(/^\*+|\*+$/g, ''));
  console.log('coeficients: ' + coef);
  /*for (let i=0; i<eq.length; i++) {
  }*/
}
