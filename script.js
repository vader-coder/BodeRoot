//capital strings refer to input ids, lowercase refres to output id.
/*var nerdamer = require('nerdamer');
require('nerdamer/Algebra.js');
console.log("root to Poly: " + rootToPoly('-6, -5, 2', 3).toString());//(x+6)(x+5)(x-2) = x^3 -8x^2 -3x +90
//test stuff with node.js*/
function onClick() {
  var roots, roots2;//actual roots. I would like to check...
  var rootsInput, rootsInput2;//roots inputted
  var factors, factors2;
  var y, y2;//[-2,5],(-2+x)^2
  var order;
  //console.log("root to Poly: " + rootToPoly('-6, -5, 2', 3).toString());//(x+6)(x+5)(x-2) = x^3 -8x^2 -3x +90
  /*console.log("poly[-1, 1]: " + poly([-1, 1]).toString());
  console.log("poly([1,-1]): " + poly([1, -1]).toString());
  console.log("poly([2, 2]): " + poly([2, 2]).toString());*///(x-2)(x-2), [1, -4, 4]
  //console.log("poly([2, 4+i, 4-i]): " + poly(['2', '4+i', '4-i'], 0).toString());
  //console.log("arrMult(): " + arrMult(['4+i', '4+i'], ['4', '4-i'], 0).toString());
  //console.log("arrSub(): "  + arrSub(['4+i', '4+i'], ['4', '4-i'], 0).toString());
  var polyCheck = document.getElementById('polyCheck').checked;//check which checkbox was checked
  var factorCheck = document.getElementById('factorCheck').checked;
  var rootCheck = document.getElementById('rootCheck').checked;
  if (polyCheck && !factorCheck && !rootCheck) {//input is in polynomial form.
     y = document.getElementById('Polynomial').value;
     //factors = nerdamer('factor(' + y.toString() + ')');
     //rootsInput = document.getElementById('Roots').value;
     //console.log('roots: ' + roots);
     y2 = document.getElementById('Polynomial2').value;
     //factors2 = nerdamer('factor(' + y2.toString() + ')');
     //rootsInput2 = document.getElementById('Roots2').value;
     //console.log('roots: ' + roots2);
  }
  else if (factorCheck && !polyCheck && !rootCheck) {//input is factors
    factors = document.getElementById('Polynomial').value;//'(1-3x)(1+x)(1+2x)';
    y = nerdamer('expand(' + factors + ')');
    //rootsInput = document.getElementById('Roots').value;
    //roots = nerdamer('roots('+ y.toString() +')');
    factors2 = document.getElementById('Polynomial2').value;//'(1-3x)(1+x)(1+2x)';
    y2 = nerdamer('expand(' + factors2 + ')');
    //rootsInput2 = document.getElementById('Roots2').value;
    //roots2 = nerdamer('roots(' + y2.toString() + ')');
    //console.log('roots: ' + roots + ' roots2: ' + roots2);
  }
  else if (rootCheck && !polyCheck && !factorCheck) {//must be seperated by commas
    rootsInput = document.getElementById('Polynomial').value;
    order = document.getElementById('Order').value;
    y = rootToPoly(rootsInput, order);

    rootsInput2 = document.getElementById('Polynomial2').value;
    order2 = document.getElementById('Order2').value;
    y2 = rootToPoly(rootsInput2, order2);
  }
  else {
    alert('You need to check one box and only one box.');
    return;//stop execution of stript.
  }
  var polynomialform = y.toString();//numerator
  var polynomialform2 = y2.toString();//denominator
  console.log('polynomialform' + polynomialform);
  var numAns = finder(polynomialform);//numerator answers
  var denomAns = finder(polynomialform2);//denominator answers

  labels = ['expanded form: ', 'factors: ', 'roots: ', 'polynomial coefficients: ','powers of variables corresponding to each coefficient: ',
  'variable term for each coefficient: ','order: ', 'number of terms: '];
  //['poly', 'factors', 'roots', 'coef', 'powers', 'variable', 'order', 'numTerms']
  /*document.getElementById('polynomial').innerHTML = 'polynomial: ' + polynomialform;
  document.getElementById('factors').innerHTML = 'factors of polynomial: ' + factors;
  document.getElementById('roots').innerHTML = 'roots of polynomial: ' + roots;
  add .2
  */
  //['poly', 'factors', 'roots', 'coef', 'powers', 'polyTerms', 'order', 'numTerms']
  var ans = ['poly', 'factors', 'roots', 'coef', 'powers', 'polyTerms', 'order', 'numTerms'];//numerator
  var ans2 = ['poly2', 'factors2', 'roots2', 'factorRoots2', 'coef2', 'powers2', 'polyTerms2', 'order2', 'numTerms2'];//denominator
  //['poly', 'factors', 'roots',
  //'coef', 'powers', 'polyTerms',
  //'order', 'numTerms']
  console.log(numAns[ans[1]].toString());
  console.log('roots: ' + numAns[ans[2]]);
  console.log(typeof(numAns[ans[2]]));
  //document.getElementById(ans[2]).innerHTML = ans[2] +  [1, 1].toString();
  for (let i=0; i<ans.length; i++) {
    document.getElementById(ans[i]).innerHTML = labels[i] + numAns[ans[i]].toString();
    document.getElementById(ans2[i]).innerHTML = labels[i] + denomAns[ans[i]].toString();
  }
  document.getElementById('numerator').innerHTML = "Numerator";
  document.getElementById('denominator').innerHTML = "Denominator";
  /*document.getElementById('factors').innerHTML = labels[1] + "((x-1)^2)";
  document.getElementById('roots').innerHTML = labels[2] +  numAns['roots'].toString();*/
}
function finder (polynomialform) {
  var numTerms = 0;
  var signs = [];//+ & - signs.
  var poly = polynomialform.trim();//get rid of whitespace
  var variable = document.getElementById('variable').value;
  var coef = nerdamer('coeffs('+ poly + ',' + variable + ')');
  var factors = nerdamer('factor('+ poly + ')');
  var roots = [];
  //var factorRoots = [];//roots based on the factors.
  console.log("roots: " + roots.toString());
  console.log("onlyOnce: " + onlyOnce([1, 2, 5, 5, 3, 1]).toString());
  var order;//nerdamer returns coefficients of x^0 to x^order
  var powers = [];//powers corresponding to each coefficent
  var polyTerms = [];//x-terms corresponding to each coefficient
  //console.log("coef.length: " + coef.length.toString());
  //objects don't haave length, can't do coef.length
  //coef = coef.toString();
  coef = objectToArray(coef);//splits up all digits.
  /*roots = roots.toString();
  roots = roots.split(',');*/
  factors = factorsArr(factors.toString());
  for (let i=0; i<factors.length; i++) {
    roots.push(nerdamer('roots(' + factors[i] +')').toString());
  }
  //roots = objectToArray(roots);
  //roots = onlyOnce(roots);//we only need each root once.
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
  var arr = obj.toString().trim().split(',');//was '' before, needs to change.
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

function onlyOnce(arr) {
  var found = [];
  var indecies = [];
  for (let i=arr.length-1; i>=0; i--) {
    found.push(arr[i]);
    if (times(found, arr[i]) > 1) {//if we have already seen it, chop it off the original array
      found.pop();
      arr.splice(i, 1);//only remove 1 item. default take off all the way to the end.
    }
  }
  return arr;
}
//returns times something occurs in an array
function times(array,value){
    var n = 0;
    for(i = 0; i < array.length; i++){
        if(array[i] == value){n++}
    }
    return n;
}
//given a string with list of factors, puts each factor in an array as an item
function factorsArr(str) {
  var openIndex = [];
  var closedIndex = [];
  var factorsList = [];
  for (let i=0; i<str.length; i++) {
    if (str[i] == '(') {
      openIndex.push(i);
    }
    else if (str[i] == ')') {
      closedIndex.push(i);
    }
  }
  for (let i=0; i<openIndex.length; i++) {
    factor = str.slice(openIndex[i], closedIndex[i]+1);
    factorsList.push(str.slice(openIndex[i]+1, closedIndex[i]))
  }
  return factorsList;
}
//function to check if numerator order is > deonominator order.
//if you want to find polynomial by roots, will have to enter the order of the polynomial.
//otherwise, couldn't tell x^5+1 vs x^7+1.
//roots will be string seperated by commas.
function rootToPoly(roots, order) {
  var y = '';
  var coef;
  var real = 1;
  var factors = [];
  var factorStr = '';
  roots = roots.split(',');//one root in each
  var iIndex = roots.map(v=>v.indexOf('i'));
  for (let i=0; i<iIndex.length; i++) {
    if  (iIndex[i] != -1) {
      real = 0;//not all the roots are real
      break;
    }
  }
  if (real) {
    roots = roots.map(v=>parseInt(v,10));
  }
  coef = poly(roots, real);//list of coefficients, including 0s.
  var pow = coef.length-1;
  for (let i=0; i<coef.length; i++) {//3-0
    if (i==coef.length-1) {
      y = y.concat(coef[i].toString()+'x^'+pow.toString());
    }
    else {
      y = y.concat(coef[i].toString()+'x^' + pow.toString() + ' + ');
    }
    pow--;
  }
  /*if (roots.length == order) {//(x-1)(x-2)(x+3) etc.
    for (let i=0; i<order; i++) {
      factorStr = factorStr.concat('(' + 'x + ' + (parseInt(roots[i],10)*-1).toString() + ')');
    }
    y = nerdamer('expand(' + factorStr + ')');
  }*/
  return y;
}
//rootSelect() & polySelect() change html text to make it more comprehensible when a button is clicked.
function rootSelect() {
  document.getElementById('Order').value = '0';
  document.getElementById('Order2').value = '0';
  document.getElementById('numerLabel').innerHTML = 'Numerator Roots/Zeros: ';
  document.getElementById('denomLabel').innerHTML = 'Denominator Roots/Poles: ';
}
function polySelect() {
  document.getElementById('Order').value = 'Not needed';
  document.getElementById('Order2').value = 'Not needed';
  document.getElementById('numerLabel').innerHTML = 'Numerator: ';
  document.getElementById('denomLabel').innerHTML = 'Denominator: ';
}
//this is a js equivalent of the GNU Octave poly function
//returns list of coefficients for powers.
function poly(x, real) {
  var len = x.length;
  var v = x;
  var y;
  m = 1;//since arrray, will always be 1.
  n = len;//length of array.
  var change;
  y = zeros(len+1);//returns 1 by len+1 matrix of zeros (aka an array)
  //for each one in array
  y[0] = 1;
  for (let j=0; j<n; j++) {//for j=1:n
    /*for (let i=1; i<n; i++) {
      y[i] = y[i] - v[j]*y[i-1]
    }*/
    //y(2:(j+1)) = y(2:(j+1)) - v(j) .* y(1:j)
    //slice(start, end) -> end not included.
    change = arrSub(y.slice(1,j+2),scalArrMult(x[j],y.slice(0, j+1), real), real);
    for (let i=0; i<change.length; i++) {
      y.splice(i+1, 1, change[i]);
    }//replace necessary elements in y with those in change.
  }
  /*var count = 0;
  for (let i=0; i<x.length; i++) {//if there is no imagpart, returns simplified expresssion.
    if (nerdamer("imagpart(" + x[i].toString() + ")") == nerdamer("simplify("+ x[i].toString()+")")) {
      count++;
    }
  }*/
  if (real) {//if there is no imaginary part in x:
    for (let i=0; i<y.length; i++) {
      y[i] = nerdamer("realpart(" + y[i].toString() + ")");
    }
  }
  y.map(v=>v.toString());
  return y;
}
//returns a 1D array with only zeros in them.
function zeros(len) {
  var ret = [];
  for (let i=0; i<len; i++) {
    ret.push(0);
  }
  return ret;
}
//element wise multiplication, equivalent of *.
function arrMult(arr, arr2, real) {//real represents whether operands real or complex
    if (arr.length == arr2.length) {
      if (real) {
        for (let i=0; i<arr.length; i++) {
          arr[i] *= arr2[i]
        }
      }
      else {
        for (let i=0; i<arr.length; i++) {
          arr[i] = nerdamer(arr2[i].toString()).multiply(arr[i].toString());
          arr[i] = nerdamer('expand(' + arr[i] +')');
        }
      }
    }
    return arr;
}
//multiply 1D array by vector
function scalArrMult(scalar, arr, real) {
  if (real) {
  for (let i=0; i<arr.length; i++) {
    arr[i] *= scalar;
  }
  }
  else {
    for (let i=0; i<arr.length; i++) {
      arr[i] = nerdamer(arr[i].toString()).multiply(scalar.toString());
      arr[i] = nerdamer('expand(' + arr[i].toString() +')');
      arr[i] = arr[i].toString();
    }
  }
  return arr;
}
//subtracts the elements of one array from those of another
function arrSub (arr, arr2, real) {
  if (arr.length == arr2.length) {
    if (real) {
      for (let i=0; i<arr.length; i++) {
        arr[i] -= arr2[i];
      }
    }
    else {
      for (let i=0; i<arr.length; i++) {
        arr[i] = nerdamer(arr[i].toString()).subtract(arr2[i].toString());
        arr[i] = nerdamer('expand(' + arr[i].toString() +')');
        arr[i] = arr[i].toString();
      }
    }
    return arr;
  }
  else {
    var error = "error arrSub: need to use two arrays of same length";
    console.log(error);
    return error;
  }
}
//subtracts two complex numbers represented by a string.
//if wanted to add, could do third parameter to specify operations. (0, 1)
function complexSub (str, str2) {
  var imag = nerdamer('imagpart('+ str + ')');
  var imag2 = nerdamer('imagpart('+ str2 +')');
  var real = nerdamer('realpart(' + str + ')');
  var real2 = nerdamer('realpart(' + str2 +')');
  return (real-real2).toString() + ' + ' + (imag-imag2).toString() + 'i';
}
