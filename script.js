function onInput(input) {
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

  labels = ['polynomial form: ', 'factors: ', 'roots: ', 'polynomial coefficients: ','powers of variables corresponding to each coefficient: ',
  'variable term for each coefficient: ','order: ', 'number of terms: '];
  //['poly', 'factors', 'roots', 'coef', 'powers', 'variable', 'order', 'numTerms']
  /*document.getElementById('polynomial').innerHTML = 'polynomial: ' + polynomialform;
  document.getElementById('factors').innerHTML = 'factors of polynomial: ' + factors;
  document.getElementById('roots').innerHTML = 'roots of polynomial: ' + roots;
  add .2
  */
  //['poly', 'factors', 'roots', 'coef', 'powers', 'polyTerms', 'order', 'numTerms']
  var ans = ['poly', 'factors', 'roots', 'coef', 'powers', 'polyTerms', 'order', 'numTerms'];//numerator
  var ans2 = ['poly2', 'factors2', 'roots2', 'coef2', 'powers2', 'polyTerms2', 'order2', 'numTerms2'];//denominator
  //['poly', 'factors', 'roots',
  //'coef', 'powers', 'polyTerms',
  //'order', 'numTerms']

  for (let i=0; i<ans.length; i++) {
    document.getElementById(ans[i]).innerHTML = labels[i] + numAns[ans[i]];
    document.getElementById(ans2[i]).innerHTML = labels[i] + denomAns[ans[i]];
  }
  document.getElementById('numerator').innerHTML = "Numerator";
  document.getElementById('denominator').innerHTML = "Denominator";
}
function finder (polynomialform) {
  var numTerms = 0;
  var signs = [];//+ & - signs.
  var poly = polynomialform.trim();//get rid of whitespace
  var variable = document.getElementById('variable').value;
  var coef = nerdamer('coeffs('+ poly + ',' + variable + ')');
  var factors = nerdamer('factor('+ poly + ')');
  var roots = nerdamer('roots('+ poly + ')');
  var order;//nerdamer returns coefficients of x^0 to x^order
  var powers = [];//powers corresponding to each coefficent
  var polyTerms = [];//x-terms corresponding to each coefficient
  //console.log("coef.length: " + coef.length.toString());
  //objects don't haave length, can't do coef.length
  //coef = coef.toString();
  console.log('coef before: ' + coef.toString());//
  coef = objectToArray(coef);
  console.log('coef after: ' + coef.toString());
  //Object.keys(coef).length
  for (let i=0; i<coef.length; i++) {
    powers.push(i);
    polyTerms.push("x^" + i.toString());
    if (coef[i] != '0') {
      numTerms++;
    }
  }
  order = coef.length - 1;//powers.length - 1 also would have worked.
  var result = {"poly":poly, "factors": factors, "roots":roots,
  "coef":coef, "powers":powers,"polyTerms":polyTerms,
  "order": order, "numTerms": numTerms};
  return result;
}
function objectToArray(obj) {
  var arr = obj.toString().trim().split('');
  //take care of misplaced '-' signs
  for (let i=arr.length-1; i>=0; i--) {
    if (arr[i] == '-') {
      arr[i+1] = '-' + arr[i+1];
      arr.splice(i,1);
    }
  }

  if (arr[arr.length-1] == ';') { arr.pop() };//removes ;
  arr.pop();//removes ]
  arr.shift();//removes [

  arr = rem(arr, ',');//remove ','
  return arr;
}
function printEach(arr) {
  var str = '';
  for (let i=0; i<arr.length; i++) {
    str = str + arr[i].toString();
  }
  return str;
}
//replaces every instance of original with new_item in array.
function rep (arr, original, new_item) {
  for (let i=0; i<arr.length; i++) {
    if (arr[i]==original) {
      arr[i] = new_item;
    }
  }
  return arr;
}
//removes target from array, returns array
function rem(arr, target) {
  //console.log("arr = " + printEach(arr));
  for (let i=arr.length-1; i>=0; i--) {
    if (arr[i]==target) {
      arr.splice(i,1);
      //console.log("arr = " + printEach(arr));
    }
  }
  return arr;
}
