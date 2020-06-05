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

  labels = ['expanded form: ', 'factors: ', 'roots: ', 'exponet of factors & roots: ', 'polynomial coefficients: ','powers of variables corresponding to each coefficient: ',
  'variable term for each coefficient: ','order: ', 'number of terms: '];
  var ans = ['poly', 'factors', 'roots', 'factorExp', 'coef', 'powers', 'polyTerms', 'order', 'numTerms'];//numerator
  var ans2 = ['poly2', 'factors2', 'roots2', 'factorExp2', 'coef2', 'powers2', 'polyTerms2', 'order2', 'numTerms2'];//denominator
  //document.getElementById(ans[2]).innerHTML = ans[2] +  [1, 1].toString();
  for (let i=0; i<ans.length; i++) {
    document.getElementById(ans[i]).innerHTML = labels[i] + numAns[ans[i]].toString();
    document.getElementById(ans2[i]).innerHTML = labels[i] + denomAns[ans[i]].toString();
  }
  document.getElementById('numerator').innerHTML = "Numerator";
  document.getElementById('denominator').innerHTML = "Denominator";
  if (numAns['order'] > denomAns['order']) {
    alert('Order of the numerator must be <= that of the denominator');
    return;
  }
  //rootsStrArrToChartFormat(numAns['roots']);
  //error for just rt. maybe problem w/ rootsStrArrToChartFormat is that roots[i] isn't just 1 item.
  /*(consT, consT_data, zOrigin_data, pOrigin_data, zReal_data, pReal_data, zComp_data, pComp_data,
     zRealCount, pRealCount, allFreq_data, zReal_dataApprox, pReal_dataApprox, zComp_dataApprox,
      pComp_dataApprox, nComp, dComp, options)*/
  var bdata = bodeData(numAns, denomAns);
  mkBode(bdata[0], bdata[1], bdata[2], bdata[3], bdata[4], bdata[5], bdata[6],
    bdata[7], bdata[8], bdata[9], bdata[10], bdata[11], bdata[12], bdata[13],
    bdata[14], bdata[15], bdata[16], bdata[17], bdata[18]);
  bdata = bodeDataPhase()
  //w, consT_data, zOrigin_data, pOrigin_data, zReals, pReals, zRealArr, pRealArr
  mkBodePhase(bdata[0], bdata[1], bdata[2], bdata[3]);

}
//returns list contaniing polynomial form, coefficients, roots, order, etc.
function finder (polynomialform) {
  var numTerms = 0;
  var ret;//return value
  var signs = [];//+ & - signs.
  var poly = polynomialform.trim();//get rid of whitespace
  var variable = document.getElementById('variable').value;
  var coef = nerdamer('coeffs('+ poly + ',' + variable + ')');
  var factors = nerdamer('factor('+ poly + ')');//with complex conjugate roots, you can't factor the polynomial.
  var roots = [];
  //var factorRoots = [];//roots based on the factors.
  var order;//nerdamer returns coefficients of x^0 to x^order
  var powers = [];//powers corresponding to each coefficent
  var polyTerms = [];//x-terms corresponding to each coefficient
  var factorPowers = [];//powers corresponding to each factor.
  //think about using coef.text() instead of objectToArray.
  coef = objectToArray(coef);//splits up all digits.
  if (factors.text() == nerdamer('expand('+ poly +')')) {//polynomial can't be factored.
    factors = factors.text();
    factorExp = [1];
    roots = objectToArray(nerdamer('roots('+ poly + ')'));
  }
  else {//polynomial can be factored.
    factors = factors.toString();//.text() vs .toString()
    ret = factorsArr(factors);//array of factors & their exponets.
    factors = ret[0];
    factorExp = ret[1];//can also view these as # of times that a root appears, since each root is calculated form a factor.
    for (let i=0; i<factors.length; i++) {
      roots.push(nerdamer('roots(' + factors[i] +')').toString());
    }
  }
  for (let i=0; i<coef.length; i++) {
    powers.push(i);
    polyTerms.push("x^" + i.toString());
    if (coef[i] != '0') {
      numTerms++;
    }
  }
  order = coef.length - 1;//powers.length - 1 also would have worked.
  var result = {"poly":poly, "factors": factors, "roots":roots, "factorExp": factorExp,
  "coef":coef, "powers":powers,"polyTerms":polyTerms,
  "order": order, "numTerms": numTerms};//, "factorPowers": factorPowers};
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
//given a string with list of factors, puts each factor in an array as an item
function factorsArr(str) {
  var openIndex = [];
  var closedIndex = [];
  var factorsList = [];
  var expIndex = [];//index of '^'
  var factorExp = []; //exponets of factors.
  if (str.indexOf('(') != -1) {//if there are opening/closing parentheses.
    for (let i=0; i<str.length; i++) {
      if (str[i] == '(') {
        openIndex.push(i);
      }
      else if (str[i] == ')') {
        closedIndex.push(i);
      }
    /*else if (str[i] == '^') {
      expIndex.push(i);
    }*/
    }
    for (let i=0; i<openIndex.length; i++) {
      factor = str.slice(openIndex[i], closedIndex[i]+1);
      factorsList.push(str.slice(openIndex[i]+1, closedIndex[i]))
      if (str[closedIndex[i]+1] == '^') { //if char after closed is ^. //expIndex.indexOf(closedIndex[i]+1) != -1) {
        if (i == openIndex.length-1) {//if we are at last open index, then exponet will be from after ')' to end.
          factorExp.push(str.slice(closedIndex[i]+2));
        }
        else {//if we are not at the last open index, then we can use the next one to determine the boundaries of exponets.
          factorExp.push(str.slice(closedIndex[i]+2, openIndex[i+1]))//exponet will be from after '^' to before '('
        }
      }
      else {
        factorExp.push(1);//default is 1 if no exponet is found.
      }
    }
  }
  else if (str.indexOf('x') != -1){//if no parentheses & is an x, must be 1 factor.
    factorsList.push(str);
    factorExp.push(1);
  }
  factorExp = factorExp.map(v=>v.toString().replace('*', ''));
  factorExp = factorExp.map(v=>parseInt(v, 10));
  return [factorsList, factorExp];
}
/*function repMult(item) {
  item = item.replace('*', '');
  return item;
}*/
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
        data: [[2, 0], [4, 1], [4, -1]]//numRoots

    }, {
        name: 'Denominator',
        color: 'rgba(119, 152, 191, .5)',
        data: [[-1, 0], [1, 0]]//denomRoots
    }]
});
}
//converts string array to format that can use.
function rootsStrArrToChartFormat(roots) {
  var temp, realPart, imagPart;
  var real = [];//real roots.
  var comp = [];//complex roots.
  roots = rem(roots, ['[', ']']);
  var len = roots.length;
  var ogLen = len;//original length
  for (let i=0; i<len; i++) {
    if (i < ogLen) {//if i<originial length, still going through strings.
      if (roots[i].indexOf(',') != -1) {//if there is a comma in one.
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
      real.push(parseInt(roots[i], 10));
    }
    if (typeof(parseInt(nerdamer('realpart('+roots[i].toString()+')').text(), 10)) == typeof(5)) {//it is complex, not just imaginary.
      realPart = parseInt(nerdamer('realpart('+roots[i].toString()+')').text(), 10);
      imagPart = parseInt(nerdamer('imagpart('+roots[i].toString()+')').text(), 10);
      roots[i] = [realPart, imagPart];
      comp.push([realPart, imagPart]);
    }
  }
  return [real, comp];
}
//takes array of coeffs for denominator and numerator (largest to smallest power)
//as input, form with smallest decimal as unity in the back.
function unity(coef, power) {//10:36
  //what if coef x includes a power? should we get it from poly()?
  //by dividing every coefficient by the last coefficient, we ensure that the last one equals 1.
  var index = power.indexOf(0);
  if (power[index] == 0) {
    coef = coef.map(v=>parseInt(v, 10));
    var divisor = coef[index];
    if (divisor != 0) {
      coef = coef.map(v=>v/divisor);
    }
  return {'coef':coef, 'divisor':divisor};
  }
  else {
    return 0;
  }
}
//converts a number like our constant out front to the decibal log scale.
//number inputs as [real, imaginary]
//https://www.rohde-schwarz.com/us/faq/converting-the-real-and-imaginary-numbers-to-magnitude-in-db-and-phase-in-degrees.-faq_78704-30465.html
//should we use if statements to filter out cases? does a sqrt take longer than an if?
//type = [0, 1, 2, 3]
//[const, zero, pole, etc.]
//returns coordinates to map DB.
function dB (num, type) {
  var x;
  var y;
  if (num[0] == 0 && num[1] == 0 &&  type == 1) {//zero at origin
    return [[1, 0], [10, 20], [0, -20]];
  }
  else if(num[0] == 0 && num[1] == 0 && type == 2) {
    return [[0, 20], [0, 1], [10, -20]];
  }
  //x = math.sqrt(Math.pow(num[0], 2) + Math.pow(num[1], 2));
  else if (type == 0) {//const
    x = num[0];//constant gain?
    x = 20*(math.log10(x));//nerdamer('log10('+num.toString()+')');
    return [[0, x], [1, x]];//frequency, dB. only need 2 points for a straight line
  }
}
//phase = arctan(Im/Real)
function phase (num) {
  if (num[0] != 0) {
    return math.atan2(num[1], num[0]);
  }
  else if (num[0] == 0 && num[1] == 0) {
    return 0;
  }
}
//gives how many times an item is in an array.
//can we use how nerdamer lists roots ot help us with this?
function times (arr, item) {
  var times = 0;
  for (let i=0; i<arr.length; i++) {
    if (arr[i] == item) {
      times++;
    }
  }
  return times;
}
function rad2Degrees(rad) {//converts radians to degrees.
  return (rad/Math.PI)*180;
}
function desmos(constant, nRoot, dRoot) {
  var elt = document.getElementById('desmos');
  var calculator = Desmos.GraphingCalculator(elt);
  var x;
  calculator.setExpression({ id: 'graph', latex: 'y='+consT.toString() });
  for (let i=0;i<nRoot[0].length; i++) {//numerator real zeros.
    if (nRoot[0][i] == 0) {//zero at origin
      zOrigin = 1;
      x = 20*nFactorExp[i];
      calculator.setExpression({ id: 'graph1', latex: 'y = '+x.toString()+'\\log_{10}(x)' });
    }
  }
  calculator.setExpression({ id: 'graph2', latex: 'f(x)=\\log_{10}(x)' });
  calculator.setExpression({ id: 'graph3', latex: 'y = '+constant.toString() });
}
//takes numAns, denomAns & returns list of data for bode plot
//each root will only occur once, and its exponet will be listed in numAns['factorExp'] or denomAns['factorExp'];
function bodeData (numAns, denomAns) {//add pReal & zReal nextx
  var nRoot = rootsStrArrToChartFormat(numAns['roots']);
  var dRoot = rootsStrArrToChartFormat(denomAns['roots']);
  var nComp = nRoot[1], dComp = dRoot[1];
  var n = unity(numAns['coef'], numAns['powers']);//make x^0's coefficeint 1
  var d = unity(denomAns['coef'], numAns['powers']);
  var nFactorExp = numAns['factorExp'];
  var dFactorExp = denomAns['factorExp'];
  var consT, calc, x, w0, zeta, realPart, imagPart, diff, base, peak, zOrigin = 0, pOrigin = 0, zReal = 0, pReal = 0;//false by default.
  var consT_data = [], zOrigin_data = [], pOrigin_data = [], zReal_data = [], pReal_data = [], zComp_data = [], pComp_data = [], allFreq_data = [];
  var zRealArr = [], pRealArr = [];//array storing data in more accessible form.
  var zReal_dataApprox = [], pReal_dataApprox = [], zComp_dataApprox = [], pComp_dataApprox = [], allFreq_dataApprox;//approximation of data.
  var zReals = [], pReals = [];//array for storing real zeros & poles.
  var zRealCount = 0, zCompCount = 0;//# of real zeros & complex zeros.
  var pRealCount = 0, pCompCount = 0;//# of real poles
  var w = [];//for omega, frequency. why was w ever at 100.

  if (n['divisor']) {
    consT = d['divisor']/n['divisor'];
  }
  else {//x^0 coefficient is 0 in numerator.
    consT = 1;//if multiply anything by 1, is still itself.
  }
  if (consT == Infinity || consT == -Infinity || consT == 0) {
    consT = 1;//log10(1) = 10, and a logarithmic scale won't work.
  }//what do we actually do here, where d[divisor] = 0?
  consT = 20*Math.log10(Math.abs(consT));
  for (let i=1; i<101; i++) {//started at 0, can't graph logarithmically.
    w.push(roundDecimal(i*0.1, 1));//w.push(roundDecimal(1+ i*0.1, 1)); might want multiple versions of this.
    consT_data.push([w[i-1], consT]);
  }
  for (let i=0;i<nRoot[0].length; i++) {//numerator real zeros.
    if (nRoot[0][i] == 0) {//zero at origin
      zOrigin = 1;
      for (let j=0; j<100; j++) {
        zOrigin_data.push([w[j], 20*nFactorExp[i]*Math.log10(w[j])]);
      }
    }
    if (nRoot[0][i]) {//real number zero
      zReals.push(nRoot[0][i]);//list of real zeros (that aren't zero) corresponding to data
      zReal = 1;
      zReal_data.push([nRoot[i][0], []]);//each zero is included with it's array of data.
      zReal_dataApprox.push([]);
      w0 = Math.abs(nRoot[i][0]);
      for (let j=0; j<100; j++) {
        x = w[j]/w0;
        if (w[j] <= w0) {
          zReal_dataApprox[zRealCount].push([w[j], 0]);
        }
        else if (w[j] > w0) {
          zReal_dataApprox[zRealCount].push([w[j], 20*nFactorExp[i]*Math.log10(x)]);
        }
        zReal_data[zRealCount][1].push([w[j], 20*nFactorExp[i]*Math.log10(Math.pow((1 + x*x), 0.5))]);//add data to array.
      }
      zRealCount++;
    }//lets figure out a good way to track how many of each root there are.
  }
  [zComp_data, zComp_dataApprox] = compConjugateData(nComp, w, 1);
  for (let j=0; j<zRealCount; j++) {//is there a more elegant solution?
    zRealArr.push(zReal_data[j][1]);
  }
  for (let i=0;i<dRoot[0].length; i++) {//loop through real zeros.
    if (dRoot[i][0] == 0 && dRoot[i][1] == 0) {//zero pole
      pOrigin = 1;
      for (let j=0; j<100; j++) {
        pOrigin_data.push([w[j], -20*dFactorExp[i]*Math.log10(w[j])]);
      }
    }
    if (dRoot[i][0] != 0 && dRoot[i][1] == 0) {//real pole
      pReal = 1;
      pReals.push(dRoot[i][0]);
      pReal_data.push([dRoot[i][0], []]);//push a 2D array to pReal_data. second item will become data for graphing every real root.
      w0 = Math.abs(dRoot[i][0]);
      for (let j=0; j<100; j++) {
        x = w[j]/w0;
        if (w[j] <= w0) {
          pReal_dataApprox[pRealCount].push(0);
        }
        else if (w[j] > w0) {
          pReal_dataApprox[pRealCount].push([w[j], -20*dFactorExp[i]*Math.log10(x)]);
        }
        pReal_data[pRealCount][1].push([w[j], -20*dFactorExp[i]*Math.log10(Math.pow((1 + x*x), 0.5))]);
      }
      pRealCount++;
    }
  }
  for (let j=0; j<pRealCount; j++) {//is there a more elegant solution?
    pRealArr.push(pReal_data[j][1]);
  }
  [pComp_data, pComp_dataApprox] = compConjugateData(dComp, w, -1);
  //should we consolidate all for loops & include if statements inside them?
  //each data point of total is sum of rest at its position.
  //multiply each one by varible storing 1 or 0 to determine if it is included.
  //find total exact frequency plot.
  allFreq_data = allFreq(consT_data, w, zOrigin, zOrigin_data, pOrigin, pOrigin_data, zReal, zRealCount, zRealArr, pReal, pRealArr, pRealCount, zComp_data, pComp_data);
  //find total approximate frequency plot.
  allFreq_dataApprox = allFreq(consT_data, w, zOrigin, zOrigin_data, pOrigin, pOrigin_data, zReal, zRealCount, zReal_dataApprox, pReal, pReal_dataApprox, pRealCount, zComp_dataApprox, pComp_dataApprox);

  /*if (JSON.stringify(allFreq_data) == JSON.stringify(allFreq_data2)) {
    console.log("Yes it works.");
  }*/
  return [consT, consT_data, zOrigin_data, pOrigin_data, zReal_data,
    pReal_data, zComp_data, pComp_data, zRealCount, pRealCount, allFreq_data,
    zReal_dataApprox, pReal_dataApprox, zComp_dataApprox, pComp_dataApprox, allFreq_dataApprox, nComp, dComp,
    [1, zOrigin, pOrigin, zReal, pReal, nComp.length, dComp.length]];
}
/* (consT, consT_data, zOrigin_data, pOrigin_data, zReal_data, pReal_data, zComp_data, pComp_data
   zRealCount, pRealCount, allFreq_data, zReal_dataApprox, pReal_dataApprox, zComp_dataApprox,
    pComp_dataApprox, nComp, dComp, options) */
//function rounds a number to a decimal # of decimal places.

function roundDecimal (num, decimal) {
  var a = Math.pow(10, decimal);
  return (Math.round(num*a)/a);
}
//turns an array of [real, img] to 'real + imag*i'
function compArrToStr(comp) {
  let print;
  if (comp[1] < 0) {//imaginary # is negative.
    if (comp[1] == -1) {
      print = comp[0].toString() + ' - i ';
    }
    else {
      print = comp[0].toString() + ' - ' + Math.abs(comp[1]).toString() + 'i';
    }
  }
  else {//imaginary # is positive
    if (comp[1] == 1) {
      print = comp[0].toString() + ' + i';
    }
    else {
      print = comp[0].toString() + ' + ' + comp[1].toString() + 'i';
    }
  }
  return print;
}
//works on dComp or nComp to get their data.
function compConjugateData (comp, w, sign) {//sign will be -1 or +1
  var comp_data = [], comp_dataApprox = [], base, peak, imagPart, realPart, x, zeta, w0;
  let a, b;//a + jb, a = 1-(w/w0)^2 b = 2*zeta*w/(w0) w[j]
  for (let i=0; i<comp.length; i++) {//loop through complex roots in numerator.
    realPart = comp[i][0];
    imagPart = comp[i][1];
    w0 = Math.sqrt(realPart*realPart + imagPart*imagPart);
    x = Math.atan2(imagPart,realPart);//y, x -> y/x, opposite/ajdacent
    zeta = Math.cos(x);
    //pg 293 of book vs https://lpsa.swarthmore.edu/Bode/BodeReviewRules.html: 0<zeta<1 or 0<=zeta<1?
    //how is this possible for a complex conjugate? one will be -, other will be +.
    if (zeta > 0 && zeta < 1) {//will have to account for a # & it's conjugate being in there (I think? or will zeta take care of that?)
    comp_data.push([]);
    comp_dataApprox.push([]);
      if (zeta < 0.5) {
        for (let j=0; j<100; j++) {
          x = w[j];//lines 40*Math.log10(x) & y=0 intersect at x = 1.
          if (w[j] < 1) {//for phase w[j] <= w0/(Math.pow(10, zeta))) {
            comp_dataApprox[i].push([w[j], 0]);
          }
          else if (w[j] > 1 && w[j] != roundDecimal(w0, 1)) { //might change to if so they will connect?
            comp_dataApprox[i].push([w[j], sign*40*Math.log10(x)]);
          }
          else if (w[j] == roundDecimal(w0, 1)) {//might ask prof cheever about his peak at some point.
            base = sign*40*Math.log10(x);
            peak = Math.abs(20*Math.log10(2*zeta))*Math.sign(base);
            //if the peak doesn't have the same size as the base, it iwll look like a valley.
            //zComp_dataApprox[i].push([w[j], base+(peak/3)]);//should we have nFactorExp[i] here?
            //zComp_dataApprox[i].push([w[j], base+(2*peak/3)]);//should we have nFactorExp[i] here?
            comp_dataApprox[i].push([w[j], base+peak]);//should we have nFactorExp[i] here?
          }
        }
      }
      else if (zeta >= 0.5) {//don't draw peak. it would seem like in this case w[0] doesn't matter.
        for (let j=0; j<100; j++) {
          x = w[j];
          if (w[j] < 1) {//for phase w[j] <= w0/(Math.pow(10, zeta))) {
            comp_dataApprox[i].push([w[j], 0]);
          }
          else if (w[j] >= 1) {
            comp_dataApprox[i].push([w[j], sign*40*Math.log10(x)]);
          }
        }
      }
      //exact version starts here:
      //a + jb, a = 1-(w/w0)^2 b = 2*zeta*w/(w0) w[j]. 20*log10(|a+jb|)
      for (let j=0; j<100; j++) {//should we have included this in both the other for loops or had there be only one?
        a = 1-Math.pow((w[j]/w0), 2);
        b = 2*zeta*(w[j]/w0);
        x = Math.sqrt(a*a+b*b);//magnitude |a+jb|
        comp_data[i].push([w[j], sign*40*Math.log10(x)]);
        //approx & exact are closer when both 20 or 40.
      }
    }//there is no way the exact way can be this easy.
  }
  return [comp_data, comp_dataApprox]
}
function allFreq(consT_data, w, zOrigin, zOrigin_data, pOrigin, pOrigin_data, zReal, zRealArr, zRealCount, pReal, pReal_data, pRealArr, zComp_data, pComp_data) {
  var allFreq_data = [], calc;
  for (let i=0; i<100; i++) {//each data point for total is sum of other data points.
    calc = parseInt(consT_data[0], 10);//consT will always be horizontal & the same
    if(zOrigin) {
      calc += parseInt(zOrigin_data[i], 10);
    }
    if (pOrigin) {
      calc += parseInt(pOrigin_data[i], 10);
    }
    if (zReal) {
      for (let j=0; j<zRealCount; j++) {//is htere any way you can work this into the rest?
        calc += parseInt(zRealArr[j][i], 10);
      }
    }
    if (pReal) {
      for (let j=0; j<pRealCount; j++) {//is htere any way you can work this into the rest?
        calc += parseInt(pRealArr[j][i], 10);
      }
    }
    if (zComp_data[0].length) {//if first item in zComp_data has anything in it.
      for (let j=0; j<zComp_data.length; j++) {//is htere any way you can work this into the rest?
        calc += parseInt(zComp_data[j][i], 10);
      }
    }
    if (pComp_data[0].length) {//if first item in zComp_data has anything in it.
      for (let j=0; j<pComp_data.length; j++) {//is htere any way you can work this into the rest?
        calc += parseInt(pComp_data[j][i], 10);
      }
    }
    allFreq_data.push([w[i], calc]);
  }
  return allFreq_data;
}
//atan2 can be more precise.
//what should we do for just imaginary #s?
//will have to do less coding if understand what you're doing first!
//format of list w/ each # a+bi as [a, b]
//first is whether it is the first time graphing plot.
//pass in data for plot. data itself will only be generated once, mkBode

function mkBode (consT, consT_data, zOrigin_data, pOrigin_data, zReal_data, pReal_data,
   zComp_data, pComp_data, zRealCount, pRealCount, allFreq_data, zReal_dataApprox,
   pReal_dataApprox, zComp_dataApprox, pComp_dataApprox, allFreq_dataApprox, nComp, dComp, options) {
  var series = [];
  if (options[0]) {
    series.push(
    {//if something is to not be graphed, it's data will be empty.
        name: 'Constant ' + consT,
        color: 'rgba(223, 83, 83, .5)',//data is [x, y];
        data: consT_data

    });
  }
  if (zOrigin_data.length && options[1]) {//if no z at origin, will just be 0.
    series.push({
        name: 'Zero at Origin',
        color: 'rgba(119, 152, 191, .5)',
        data: zOrigin_data
    });
  }
  if (pOrigin_data.length && options[2]) {//if no pole at origin, will just be 0.
    series.push({
        name: 'Pole at Origin',
        color: 'rgba(20, 191, 20, 1)',
        data: pOrigin_data
    });
  }
  if (zRealCount && options[3]) {//[]
      series.push({
          name: 'Real Zero '+zReal_data[i][0].toString(),
          color: 'rgba(119, 152, 191, 1)',
          data: zReal_data[i][1]//data for relevant real zero.
      });
    for (let i=0; i<zRealCount; i++) {
      series.push({
          name: 'Real Zero '+zReal_data[i][0].toString() + ' Approximation',
          color: 'rgba(119, 152, 191, 1)',
          data: zReal_dataApprox[i]//data for relevant real zero.
      });
    }
  }
  if (pRealCount && options[4]) {
    for (let i=0; i<pRealCount; i++) {
      series.push({
          name: 'Real Pole '+pReal_data[i][0].toString(),
          color: 'rgba(119, 152, 191, 1)',
          data: pReal_data[i][1]//data for relevant real zero.
      });
    }
    for (let i=0; i<pRealCount; i++) {
      series.push({
          name: 'Real Pole '+pReal_data[i][0].toString()+' Approximation',
          color: 'rgba(119, 152, 191, 1)',
          data: pReal_dataApprox[i]//data for relevant real zero.
      });
    }
  }
  if (options[5]) {//nComp.length
    let print = [];
    for (let i=0; i<zComp_dataApprox.length; i++) {
      print.push(compArrToStr(nComp[i]));
      series.push({
          name: 'Complex Zero '+ print[i] + ' Approximation',//nComp[i][0].toString() + ' + ' + nComp[i][1].toString() +' Approximation',
          color: 'rgba(5, 191, 5, 1)',
          data: zComp_dataApprox[i]//data for relevant real zero.
      });
    }
    for (let i=0; i<zComp_data.length; i++) {
      series.push({
          name: 'Complex Zero '+ print[i],//nComp[i][0].toString() + ' + ' + nComp[i][1].toString() +' Approximation',
          color: 'rgba(5, 191, 5, 1)',
          data: zComp_data[i]//data for relevant real zero.
      });
    }
  }
  if (options[6]) {//dComp.length
    let print = [];
    for (let i=0; i<pComp_dataApprox.length; i++) {
      print.push(compArrToStr(dComp[i]));
      series.push({
          name: 'Complex Pole '+ print[i],//nComp[i][0].toString() + ' + ' + nComp[i][1].toString() +' Approximation',
          color: 'rgba(5, 191, 5, 1)',
          data: pComp_dataApprox[i]//data for relevant real zero.
      });
    }
    for (let i=0; i<pComp_data.length; i++) {
      series.push({
          name: 'Complex Pole '+ print[i] + ' Approximation',//nComp[i][0].toString() + ' + ' + nComp[i][1].toString() +' Approximation',
          color: 'rgba(5, 191, 5, 1)',
          data: pComp_data[i]//data for relevant real zero.
      });
    }
  }
  if (allFreq_data.length) {
    series.push({
        name: 'Total Bode',
        color: 'rgba(0, 0, 0, 1)',
        data: allFreq_data//data for relevant real zero.
    });
    series.push({
        name: 'Total Bode',
        color: 'rgba(0, 0, 0, 1)',
        data: allFreq_dataApprox//data for relevant real zero.
    });
  }

  //at some point, numAns or denomAns will need to be able to tell us
  //how many times each root occurs (1 at minimum)
  Highcharts.chart('bode', {
    chart: {
        type: 'line',
        zoomType: 'xy'
    },
    title: {
        text: 'Bode Plot'
    },
    xAxis: {
      type: 'linear',//'logarithmic'. can't plot sub-zero values on a logarithmic axis
        title: {
            enabled: true,
            text: 'Frequency ω'//ω, &#x03C9;
        },
        startOnTick: true,
        endOnTick: true,
        showLastLabel: true
    },
    //type: 'linear','logarithmic'
    yAxis: {
      type: 'linear',
        title: {
            text: 'Magnitude dB'
        }
    },
    legend: {
        layout: 'vertical',
        align: 'right',//'left'
        verticalAlign: 'bottom',//'top'
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
                pointFormat: '{point.x} &#x03C9;, {point.y} dB'
            }
        }
    },
    series: series
  });
}
//w is input (like #s plugged in for x).
function bodeDataPhase (w, consT_data, zOrigin_data, pOrigin_data, zReals, pReals, zRealArr, pRealArr) {
  var w = [], consT_data = [], zOrigin_data = [], pOrigin_data = [];
  var zReal = zReals.length, pReal = pReals.length;
  //get w.
  for (let i=0; i<100; i++) {
    if (consT > 0) {
      consT_data[i] = [w, 0];
    }
    else if (consT < 0) {
      consT_data[i] = [w[i], 180];
    }
    if (zOrigin) {
      zOrigin_data[i] = [w[i], 90];
    }
    if (pOrigin) {
      pOrigin_data[i] = [w[i], -90];
    }
    /*if (zReal) {//loop through real zeros. figure out this again.
      for (let j=0; j<zReal; j++) {
        zReal_data.push([])
        if (w < 0.1*Math.abs(zReals[j])) {

        }
        else if (w > 10*Math.abs(zReals[j])) {

        }
        else {//if it's between them

        }
      }
    }*/
  }
}
function mkBodePhase (consT, consT_data, zOrigin_data, pOrigin_data) {
  var series = [];
  if (consT) {
    series.push(
    {//if something is to not be graphed, it's data will be empty.
        name: 'Constant ' + consT,
        color: 'rgba(223, 83, 83, .5)',//data is [x, y];
        data: consT_data

    });
  }
  if (zOrigin_data.length) {
    series.push({
        name: 'Zero at Origin',
        color: 'rgba(119, 152, 191, .5)',
        data: zOrigin_data
    });
  }
  if (pOrigin_data.length) {//if no pole at origin, will just be 0.
    series.push({
        name: 'Pole at Origin',
        color: 'rgba(20, 191, 20, 1)',
        data: pOrigin_data
    });
  }
  Highcharts.chart('bodePhase', {
    chart: {
        type: 'line',
        zoomType: 'xy'
    },
    title: {
        text: 'Bode Plot: Phase'
    },
    xAxis: {
      type: 'linear',//'logarithmic'. can't plot sub-zero values on a logarithmic axis
        title: {
            enabled: true,
            text: 'Frequency ω'//ω, &#x03C9;
        },
        startOnTick: true,
        endOnTick: true,
        showLastLabel: true
    },
    //type: 'linear','logarithmic'
    yAxis: {
      type: 'linear',
        title: {
            text: 'Phase'
        }
    },
    legend: {
        layout: 'vertical',
        align: 'right',//'left'
        verticalAlign: 'bottom',//'top'
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
                pointFormat: '{point.x} &#x03C9;, {point.y} dB'
            }
        }
    },
    series: series
  });
}
