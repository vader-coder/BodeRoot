//capital strings refer to input ids, lowercase refres to output id.
function onClick() {
  var roots, roots2;//actual roots. I would like to check...
  var rootsInput, rootsInput2;//roots inputted
  var factors, factors2;
  var y, y2;//[-2,5],(-2+x)^2
  var order;
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
  else if (rootCheck && !polyCheck && !rootCheck) {//must be seperated by commas
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

  labels = ['expanded form: ', 'factors: ', 'roots by calling nerdamer on polynomial form: ', 'roots by factoring individual factors: ', 'polynomial coefficients: ','powers of variables corresponding to each coefficient: ',
  'variable term for each coefficient: ','order: ', 'number of terms: '];
  //['poly', 'factors', 'roots', 'coef', 'powers', 'variable', 'order', 'numTerms']
  /*document.getElementById('polynomial').innerHTML = 'polynomial: ' + polynomialform;
  document.getElementById('factors').innerHTML = 'factors of polynomial: ' + factors;
  document.getElementById('roots').innerHTML = 'roots of polynomial: ' + roots;
  add .2
  */
  //['poly', 'factors', 'roots', 'coef', 'powers', 'polyTerms', 'order', 'numTerms']
  var ans = ['poly', 'factors', 'roots', 'factorRoots', 'coef', 'powers', 'polyTerms', 'order', 'numTerms'];//numerator
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
  var roots = nerdamer('roots('+ poly + ')');
  var factorRoots = [];//roots based on the factors.
  console.log("roots: " + roots.toString());
  console.log("onlyOnce: " + onlyOnce([1, 2, 5, 5, 3, 1]).toString());
  var order;//nerdamer returns coefficients of x^0 to x^order
  var powers = [];//powers corresponding to each coefficent
  var polyTerms = [];//x-terms corresponding to each coefficient
  //console.log("coef.length: " + coef.length.toString());
  //objects don't haave length, can't do coef.length
  //coef = coef.toString();
  coef = objectToArray(coef);
  roots = roots.toString();
  roots = roots.split(',');
  factors = factorsArr(factors.toString());
  for (let i=0; i<factors.length; i++) {
    factorRoots.push(nerdamer('roots(' + factors[i] +')').toString());
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
  var result = {"poly":poly, "factors": factors, "roots":roots, "factorRoots":factorRoots,
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
  var y;
  var factors = [];
  var factorStr = '';
  roots = roots.split(',');//one root in each
  if (roots.length == order) {
    for (let i=0; i<order; i++) {
      factorStr.concat('(' + (parseInt(roots[i],10)*-1).toString() + 'x' + ')');
    }
    y = nerdamer('expand(' + factorStr + ')');
  }
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
