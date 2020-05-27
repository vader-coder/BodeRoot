//capital strings refer to input ids, lowercase refres to output id.
function onClick() {
  var roots, roots2;//actual roots. I would like to check...
  var polyCheck = document.getElementById('polyCheck1').checked;//check which checkbox was checked
  var factorCheck = document.getElementById('factorCheck1').checked;
  var rootCheck = document.getElementById('rootCheck1').checked;
  var polyCheck2 = document.getElementById('polyCheck2').checked;//check which checkbox was checked
  var factorCheck2 = document.getElementById('factorCheck2').checked;
  var rootCheck2 = document.getElementById('rootCheck2').checked;
  var polynomialform = getPoly(polyCheck, factorCheck, rootCheck, '1');//numerator
  var polynomialform2 = getPoly(polyCheck2, factorCheck2, rootCheck2, '2');//denominator
  var numAns = finder(polynomialform);//numerator answers
  var denomAns = finder(polynomialform2);//denominator answers

  labels = ['expanded form: ', 'factors: ', 'roots: ', 'polynomial coefficients: ','powers of variables corresponding to each coefficient: ',
  'variable term for each coefficient: ','order: ', 'number of terms: '];
  var ans = ['poly', 'factors', 'roots', 'coef', 'powers', 'polyTerms', 'order', 'numTerms'];//numerator
  var ans2 = ['poly2', 'factors2', 'roots2', 'coef2', 'powers2', 'polyTerms2', 'order2', 'numTerms2'];//denominator

  //document.getElementById(ans[2]).innerHTML = ans[2] +  [1, 1].toString();
  for (let i=0; i<ans.length; i++) {
    document.getElementById(ans[i]).innerHTML = labels[i] + numAns[ans[i]].toString();
    document.getElementById(ans2[i]).innerHTML = labels[i] + denomAns[ans[i]].toString();
  }
  document.getElementById('numerator').innerHTML = "Numerator";
  document.getElementById('denominator').innerHTML = "Denominator";
  /*document.getElementById('factors').innerHTML = labels[1] + "((x-1)^2)";
  document.getElementById('roots').innerHTML = labels[2] +  numAns['roots'].toString();*/
  mkPlot(numAns["roots"], denomAns["roots"]);
}
//returns list contaniing polynomial form, coefficients, roots, order, etc.
function finder (polynomialform) {
  var numTerms = 0;
  var signs = [];//+ & - signs.
  var poly = polynomialform.trim();//get rid of whitespace
  var variable = document.getElementById('variable').value;
  var coef = nerdamer('coeffs('+ poly + ',' + variable + ')');
  var factors = nerdamer('factor('+ poly + ')');
  var roots = [];
  //var factorRoots = [];//roots based on the factors.
  var order;//nerdamer returns coefficients of x^0 to x^order
  var powers = [];//powers corresponding to each coefficent
  var polyTerms = [];//x-terms corresponding to each coefficient

  //think about using coef.text() instead of objectToArray.
  //console.log(coef.text());
  coef = objectToArray(coef);//splits up all digits.
  //console.log(coef[coef.length-1]); was ']'
  factors = factorsArr(factors.toString());
  for (let i=0; i<factors.length; i++) {
    roots.push(nerdamer('roots(' + factors[i] +')').toString());
  }
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
  //split(',') vs split('') means not every character is in a different array.
  arr = rem(arr, ['[', ']', ',', ';']);
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
//removes each item in target from array, returns array
function rem(arr, target) {
  var index;
  for (let i=0; i<arr.length; i++) {
    for (let j=0; j<target.length; j++) {
      //for each index, check it for every item in target.
      index = arr[i].indexOf(target[j]);
      if (index != -1) {
        arr[i] = arr[i].replace(target[j], '');
      }
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
function rootToPoly(roots) {
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
function rootSelect(num) {
  /*document.getElementById('Order').value = '0';
  document.getElementById('Order2').value = '0';*/
  if (num == 1) {//numerator
    document.getElementById('numerLabel').innerHTML = 'Numerator Roots/Zeros: ';
    document.getElementById('polyCheck1').checked = 0;
    document.getElementById('factorCheck1').checked = 0;//if one is selected, the others can't be.

  }
  else if (num == 2) {//denominator
    document.getElementById('denomLabel').innerHTML = 'Denominator Roots/Poles: ';
    document.getElementById('polyCheck2').checked = 0;
    document.getElementById('factorCheck2').checked = 0;//if one is selected, the others can't be.
  }
}
function polySelect(num, expOrFactors) {
  /*document.getElementById('Order').value = 'Not needed';
  document.getElementById('Order2').value = 'Not needed';*/
  if (num == 1) {
    document.getElementById('numerLabel').innerHTML = 'Numerator: ';
    if (!expOrFactors) {//if expanded is selected
      document.getElementById('factorCheck1').checked = 0;
      document.getElementById('rootCheck1').checked = 0;//if one is selected, the others can't be.
    }
    else {
      document.getElementById('polyCheck1').checked = 0;
      document.getElementById('rootCheck1').checked = 0;//if one is selected, the others can't be.
    }
  }
  else if (num == 2) {
    document.getElementById('denomLabel').innerHTML = 'Denominator: ';
    if (!expOrFactors) {//if expanded is selected
      document.getElementById('factorCheck2').checked = 0;
      document.getElementById('rootCheck2').checked = 0;//if one is selected, the others can't be.
    }
    else {
      document.getElementById('polyCheck2').checked = 0;
      document.getElementById('rootCheck2').checked = 0;//if one is selected, the others can't be.
    }
  }
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
//figures out the polynomial form depending on which box was checked.
//num specifies numerator or denominator ('1' or '2')
function getPoly (polyCheck, factorCheck, rootCheck, num) {
  var factors,rootsInput, y;
  if (polyCheck && !factorCheck && !rootCheck) {//input is in polynomial form.
     y = document.getElementById('Polynomial'+num).value;
  }
  else if (factorCheck && !polyCheck && !rootCheck) {//input is factors
    factors = document.getElementById('Polynomial'+num).value;//'(1-3x)(1+x)(1+2x)';
    y = nerdamer('expand(' + factors + ')');
  }
  else if (rootCheck && !polyCheck && !factorCheck) {//must be seperated by commas
    rootsInput = document.getElementById('Polynomial'+num).value;
    y = rootToPoly(rootsInput);
  }
  else {
    alert('You must check one box for the numerator and one for the denominator.');
    throw new Error('You must check one box for the numerator and one for the denominator.');
    return;//stop execution of stript.
  }
  return y.toString();
}
//function to make plot
//copyright policy on code from demos?
function mkPlot(numRootStr, denomRootStr) {
  var numRoots = rootsStrArrToChartFormat(numRootStr);
  var denomRoots = rootsStrArrToChartFormat(denomRootStr);
  Highcharts.chart('container', {
    chart: {
        type: 'scatter',
        zoomType: 'xy'
    },
    title: {
        text: 'Plot of Roots on Imaginary and Real Axis'
    },
    xAxis: {
        title: {
            enabled: true,
            text: 'Real'
        },
        startOnTick: true,
        endOnTick: true,
        showLastLabel: true
    },
    yAxis: {
        title: {
            text: 'Imaginary'
        }
    },
    legend: {
        layout: 'vertical',
        align: 'left',
        verticalAlign: 'top',
        x: 100,
        y: 70,
        floating: true,
        backgroundColor: Highcharts.defaultOptions.chart.backgroundColor,
        borderWidth: 1
    },
    plotOptions: {
        scatter: {
            marker: {
                radius: 5,
                states: {
                    hover: {
                        enabled: true,
                        lineColor: 'rgb(100,100,100)'
                    }
                }
            },
            states: {
                hover: {
                    marker: {
                        enabled: false
                    }
                }
            },
            tooltip: {
                headerFormat: '<b>{series.name}</b><br>',
                pointFormat: '{point.x} + {point.y}i'
            }
        }
    },
    series: [{
        name: 'Numerator',
        color: 'rgba(223, 83, 83, .5)',//data is [x, y];
        data: numRoots//[[2, 0], [4, 1], [4, -1]]

    }, {
        name: 'Denominator',
        color: 'rgba(119, 152, 191, .5)',
        data: denomRoots//[[-1, 0], [1, 0]]
    }]
});
}
//converts string array to format that can use.
function rootsStrArrToChartFormat(roots) {
  var temp;
  roots = rem(roots, ['[', ']']);
  var len = roots.length;
  var ogLen = len;//original length
  for (let i=0; i<len; i++) {
    if (i < ogLen) {//if i<originial length, still going through strings.
      if (roots[i].indexOf(',') != -1) {//if there is a
        temp = roots[i].split(',');
        roots[i] = temp[0];//make original have 1st item from array.
        for (let j=1; j<temp.length; j++) {
          roots.push(temp[j]);//push rest of items to end of array
          len++;
        }
      }
    }
    if (roots[i].indexOf('i') == -1) {//no i, isn't irrational.
      roots[i] = [parseInt(roots[i], 10), 0];
    }
    else {//it is imaginary.
      roots[i] = [parseInt(nerdamer('realpart('+roots[i]+')').text(), 10), parseInt(nerdamer('imagpart('+roots[i]+')').text(), 10)];
    }
  }
  return roots;
}
//takes array of coeffs for denominator and numerator (largest to smallest power)
//as input, form with smallest decimal as unity in the back.
function unity(nCoef, dCoef) {//10:36
  //what if coef x includes a power? should we get it from poly()?
  //by dividing every coefficient by the last coefficient, we ensure that the last one equals 1.
  var nDivisor = nCoef[nCoef.length-1];
  var dDivisor = dCoef[dCoef.length-1];
  if (nDivisor != 0) {
    nCoef = nCoef.map(v=>v/nDivisor);
  }
  if (dDivisor != 0) {
    dCoef = dCoef.map(v=>v/dDivisor);
  }
  return {"nCoef":nCoef, "dCoef":dCoef}
}
