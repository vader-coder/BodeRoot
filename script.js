var polyInput = [];

function onInput(input) {
  console.log(terms);
  var factors;
  var y;
  if (input == 1) {//factors
    factors = document.getElementById('factors').value;//'(1-3x)(1+x)(1+2x)';
    y = nerdamer('expand(' + factors + ')');
  }
  else if (input == 0) {
     y = document.getElementById('equation').value;
  }
  var polynomialform = y.toString();

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
  console.log('terms ' + terms);
  console.log('signs ' + signs);
  var coef2 = poly.split('+');
  console.log('1: ' + coef2);
  coef2 = coef2.map(v=>v.split('-'));
  var variable = document.getElementById('variable').value;
  console.log('variable: ' + variable);
  /*if (variable != 'x') {
    coef2 = coef2.map(v=>(v.toString()).replace(variable,'x'));
  }*/
  /*if/ (poly[0] == '-' || poly[0] == '+') {
    coef2.shift();//remove first element to get rid of extra ,
  }*/
  console.log('1.5: ' + coef2);
  //loop through and after pliting and make each element that has - equal to itself + '-'
  coef = [];
  for(let i = 0; i < coef2.length; i++){
      coef = coef.concat(coef2[i]);
  }//cocat 2d array into 1d.
  console.log(coef);
  if (poly[0] == '-' || poly[0] == '+') {
    coef.shift();//remove first element to get rid of extra ,
  }
  for (let i=0; i<coef.length; i++) {
    if (signs[i] == '-') {
      coef[i] = '-' + coef[i];
    }
  }
  console.log('2: ' + coef);
  //coef = coef.map(v=>v.replace('*',''));
  var powers = [];//array to contain the corresponding powers of x for each coefficient.
  var polyTerms = [];//array to contain polynomial terms (1, x^2, x^3, etc.);
  var ind = -1;//index of *x
  var expInd = -1;//index of ^
  var xInd = -1;//index of x, or whatever variable is chosen
  for (let i=0; i<coef.length; i++) {
    ind = coef[i].indexOf('*');
    console.log('ind : ' + ind.toString());
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
  //coef = coef.map(v=>v.replace(/^\*+|\*+$/g, ''));
  console.log('3: ' + coef)
  console.log('powers of variable ('+ variable + '): ' + powers);
  console.log('polyTerms: ' + polyTerms);
  if (input == 1) {//factored form
    document.getElementById('polynomialform').innerHTML = poly;
  }
  labels = ['polynomial coefficients: ','powers of variables corresponding to each coefficient: ','variable term for each coefficient: '];
  document.getElementById('coef').innerHTML = labels[0] + coef;
  document.getElementById('powers').innerHTML = labels[1] + powers;
  document.getElementById('polyTerms').innerHTML = labels[2] + polyTerms;
  console.log("why isn't this working?");
}
