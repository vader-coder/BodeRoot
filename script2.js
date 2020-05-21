var polyInput = [];

function onInput(input) {
  console.log(nerdamer('factor(x^2-4*x+4)').toString());
  console.log('cos(pi/2): ' + nerdamer('cos(pi/2)').toString());
  var roots, roots2;
  var factors, factors2;
  var y, y2;//[-2,5],(-2+x)^2
  if (input == 0) {//input is in polynomial form.
     y = document.getElementById('polynomial').value;
     factors = nerdamer('factor(' + y.toString() + ')');
     //console.log('roots: ' + roots);
     y2 = document.getElementById('polynomial2').value;
     factors2 = nerdamer('factor(' + y2.toString() + ')');
     //console.log('roots: ' + roots2);
     var z = nerdamer("roots(x^2-3*x-10)");
     console.log('z: ' + z);
  }
  else if (input == 1) {//input is factors
    factors = document.getElementById('factors').value;//'(1-3x)(1+x)(1+2x)';
    y = nerdamer('expand(' + factors + ')');
    //roots = nerdamer('roots('+ y.toString() +')');
    factors2 = document.getElementById('factors2').value;//'(1-3x)(1+x)(1+2x)';
    y2 = nerdamer('expand(' + factors2 + ')');
    //roots2 = nerdamer('roots(' + y2.toString() + ')');
    //console.log('roots: ' + roots + ' roots2: ' + roots2);
  }
  else if (input == 2) {//input is roots
    roots = document.getElementById('roots').value;
    y = nerdamer('somefunc()');
    roots2 = document.getElementById('roots2').value;
    y2 = nerdamer('somefunc()');
  }
  var polynomialform = y.toString();//numerator
  var polynomialform2 = y2.toString();//denominator
  var numAns = finder(polynomialform);//numerator answers
  var denomAns = finder(polynomialform2);//denominator answers

  labels = ['polynomial: ','roots of polynomial: ','polynomial coefficients: ','powers of variables corresponding to each coefficient: ','variable term for each coefficient: '];
  if (input == 1) {//factored form
    document.getElementById('poly/factors').innerHTML = labels[0] + polynomialform;
  }
  else if (input == 0) {
    document.getElementById('poly/factors').innerHTML = labels[1] + roots;
  }
  document.getElementById('numerator').innerHTML = "Numerator";
  document.getElementById('coef').innerHTML = labels[2] + numAns["coef"];
  document.getElementById('powers').innerHTML = labels[3] + numAns["powers"];
  document.getElementById('polyTerms').innerHTML = labels[4] + numAns["polyTerms"];

  document.getElementById('denominator').innerHTML = "Denominator";
  document.getElementById('coef2').innerHTML = labels[2] + denomAns["coef"];
  document.getElementById('powers2').innerHTML = labels[3] + denomAns["powers"];
  document.getElementById('polyTerms2').innerHTML = labels[4] + denomAns["polyTerms"];

}
function finder (polynomialform) {
  var terms = 1;
  var signs = [];//+ & - signs.
  var poly = polynomialform.trim();//get rid of whitespace
  for (let i=0; i<polynomialform.length; i++) {
    if (poly[i] == '+') {
      terms++;
      signs.push('+');
    }
    else if (poly[i] == '-') {
      terms++;
      signs.push('-');
    }
  }
  var coef2 = poly.split('+');
  coef2 = coef2.map(v=>v.split('-'));
  var variable = document.getElementById('variable').value;
  //loop through and after pliting and make each element that has - equal to itself + '-'
  coef = [];
  for(let i = 0; i < coef2.length; i++){
      coef = coef.concat(coef2[i]);
  }//cocat 2d array into 1d.
  if (poly[0] == '-' || poly[0] == '+') {
    coef.shift();//remove first element to get rid of extra ,
  }
  for (let i=0; i<coef.length; i++) {
    if (signs[i] == '-') {
      coef[i] = '-' + coef[i];
    }
  }
  //coef = coef.map(v=>v.replace('*',''));
  var powers = [];//array to contain the corresponding powers of x for each coefficient.
  var polyTerms = [];//array to contain polynomial terms (1, x^2, x^3, etc.);
  var ind = -1;//index of *x
  var expInd = -1;//index of ^
  var xInd = -1;//index of x, or whatever variable is chosen
  for (let i=0; i<coef.length; i++) {
    ind = coef[i].indexOf('*');
    if (ind != -1) {
      coef[i] = coef[i].replace(coef[i].slice(ind,ind+1),'');//replace * with nothing
      xInd = coef[i].indexOf(variable);
    }
    expInd = coef[i].indexOf('^');
    xInd = coef[i].indexOf(variable);//'x' is default
    if (xInd != -1) {//if 'x' is in string
      powers.push(coef[i].slice(expInd+1));
      polyTerms.push(coef[i].slice(xInd));//slicing from x onward gives polynomial terms
      coef[i] = coef[i].replace(coef[i].slice(xInd),'');//replace variable onwoard w/ nothing
      //replace all text between & including '*' & the end with nothing (get rid of variables.)
    }
    else {//if it is
      powers.push('0');//x^0 = 1.
      polyTerms.push(variable +'^0');
    }
  }
  var result = {"coef":coef,"powers":powers,"polyTerms":polyTerms};
  return result;
}
