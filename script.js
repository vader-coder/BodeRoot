//capital strings refer to input ids, lowercase refres to output id.
function onClick() {
  var roots, roots2;//actual roots. I would like to check...
  var polyCheck = document.getElementById('polyCheck1').checked;//check which checkbox was checked
  var factorCheck = document.getElementById('factorCheck1').checked;
  var polyCheck2 = document.getElementById('polyCheck2').checked;//check which checkbox was checked
  var factorCheck2 = document.getElementById('factorCheck2').checked;
  var variable = document.getElementById('variable').value;
  if (document.getElementById('Polynomial1').value.indexOf(variable) == -1 && document.getElementById('Polynomial2').value.indexOf(variable) == -1) {
    alert("You need to enter a variable in at least the denominator.");
    return;
  }
  var polynomialform = getPoly(polyCheck, factorCheck, '1');//numerator
  var polynomialform2 = getPoly(polyCheck2, factorCheck2, '2');//denominator
  var numAns = finder(polynomialform);//numerator answers
  var denomAns = finder(polynomialform2);//denominator answers

  if (numAns['order'] > denomAns['order']) {
    alert('Order of the numerator must be <= that of the denominator');
    return;
  }
  //rootsStrArrToChartFormat(numAns['roots']);
  //error for just rt. maybe problem w/ rootsStrArrToChartFormat is that roots[i] isn't just 1 item.

  var bdata, pdata;
  [bdata, pdata] = bodeData(numAns, denomAns);
  mkBode(bdata[0], bdata[1], bdata[2], bdata[3], bdata[4], bdata[5], bdata[6],
    bdata[7], bdata[8], bdata[9], bdata[10], bdata[11], bdata[12], bdata[13],
    bdata[14], bdata[15], bdata[16], bdata[17], bdata[18], bdata[19]);

//(consT, consT_data, zOrigin_data, pOrigin_data, zReals, zRealArr, pReals, pRealArr, zComp_data, pComp_data, zComp_dataApprox, pComp_data, pComp_dataApprox, nComp, dComp)
  pdata = bodeDataPhase(pdata[0], pdata[1], pdata[2], pdata[3], pdata[4], pdata[5],
    pdata[6], pdata[7], pdata[8], pdata[9], pdata[10], pdata[11], pdata[12], pdata[13], pdata[14]);
  //(consT, consT_data, zOrigin_data, pOrigin_data, zReals, zRealArr, pReals, pRealArr, zComp_data, pComp_data, zComp_dataApprox, pComp_data, pComp_dataApprox)
  mkBodePhase(pdata[0], pdata[1], pdata[2], pdata[3], pdata[4], pdata[5], pdata[6],
    pdata[7], pdata[8], pdata[9], pdata[10], pdata[11], pdata[12], pdata[13], pdata[14],
    pdata[15], pdata[16], pdata[17], pdata[18]);
  document.getElementById('bode').scrollIntoView();
}
//returns list contaniing polynomial form, coefficients, roots, order, etc.
function finder(polynomialform) {
  var numTerms = 0, len;
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
    if (poly.indexOf(variable) > -1) {
      roots = objectToArray(nerdamer('roots('+ poly + ')'));
    }
    else {
      roots = [];//constants don't have any roots.
    }
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
    }
    else {
      document.getElementById('polyCheck1').checked = 0;
    }
  }
  else if (num == 2) {
    document.getElementById('denomLabel').innerHTML = 'Denominator: ';
    if (!expOrFactors) {//if expanded is selected
      document.getElementById('factorCheck2').checked = 0;
    }
    else {
      document.getElementById('polyCheck2').checked = 0;
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
function getPoly(polyCheck, factorCheck, num) {
  var factors,rootsInput, y;
  if (polyCheck && !factorCheck) {//input is in polynomial form.
     y = document.getElementById('Polynomial'+num).value;
  }
  else if (factorCheck && !polyCheck) {//input is factors
    factors = document.getElementById('Polynomial'+num).value;//'(1-3x)(1+x)(1+2x)';
    y = nerdamer('expand(' + factors + ')');
  }
  //is rootToPoly() still needed?
  else {
    alert('You must check one box for the numerator and one for the denominator.');
    throw new Error('You must check one box for the numerator and one for the denominator.');
    return;//stop execution of stript.
  }
  return y.toString();
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
    realPart = parseInt(nerdamer('realpart('+roots[i].toString()+')').text(), 10);
    }
    if (roots[i].indexOf('i') == -1) {//no i, isn't irrational.
      //roots[i] = [parseInt(roots[i], 10), 0];
      real.push(parseInt(roots[i], 10));
    }
    else if (typeof(realPart) == typeof(5)) {//it is complex, not just imaginary.
      imagPart = parseInt(nerdamer('imagpart('+roots[i].toString()+')').text(), 10);
      if (imagPart < 0 && realPart != 0) {//should we weed out imaginary #s?
        continue;//for complex conjugates, we only want to use +i version for generating conjugate data.
      }
      //roots[i] = [realPart, imagPart];
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
function bodeData(numAns, denomAns) {//add pReal & zReal nextx
  var nRoot, dRoot, n, d, nFactorExp, dFactorExp;
  if (numAns['roots'][0]) {
    nRoot = rootsStrArrToChartFormat(numAns['roots']);
  }
  else {
    nRoot = [[], []];
  }
  var dRoot = rootsStrArrToChartFormat(denomAns['roots']);
  var nComp = nRoot[1], dComp = dRoot[1], nReal = nRoot[0], dReal = nRoot[0];
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
  var w = [], wMin, wMax, wMaxExp;//for omega, frequency. why was w ever at 100.
  var graphHtml, checkHtml;
  [wMin, wMax] = wBound(nRoot, dRoot);
  //I feel like we should just always start at 0.
  wMax = wMax.toString();
  if (wMax[0] == '1') {
    wMax = parseInt(wMax, 10).toExponential();
    wMaxExp = parseInt(wMax.slice(wMax.indexOf('+')+1), 10);
    wMax = Math.pow(10, wMaxExp);
  }
  else {
    wMax = parseInt(wMax);
  }
  if (n['divisor']) {
    consT = n['divisor']/d['divisor'];
  }
  else {//x^0 coefficient is 0 in numerator.
    consT = 1;//if multiply anything by 1, is still itself.
  }
  if (consT == Infinity || consT == -Infinity || consT == 0) {
    consT = 1;//log10(1) = 10, and a logarithmic scale won't work.
  }//what do we actually do here, where d[divisor] = 0?
  x = 20*Math.log10(Math.abs(consT));
  for (let i=1; i<(wMax*10+1); i++) {//started at 0, can't graph logarithmically.
    w.push(roundDecimal(i*0.1, 1));//w.push(roundDecimal(1+ i*0.1, 1)); might want multiple versions of this.
    consT_data.push([w[i-1], x]);
  }
  //mbe should have 2 html vars & add to them throughout, then at the end add them to innerHTML

  //graphCheck.innerHtML = checkHtml;

  var zCheckboxes = ['Title', 'zOrigin', 'zReal', 'zComp'];
  var pCheckboxes = ['pTitle', 'pOrigin', 'pReal', 'pComp'];
  if (nRoot[0].length) {
    [zReal_data, zReal_dataApprox, zOrigin_data, zOrigin, zReals] = realData(w, 1, nRoot, nFactorExp);
  }
  if (nComp.length) {//only call this if there are complex conjugate roots in the numerator.
    [zComp_data, zComp_dataApprox] = compConjugateData(nComp, w, 1);
  }
  //function realData(w, sign, nRoot, nFactorExp) {
  if (dRoot[0]) {
    [pReal_data, pReal_dataApprox, pOrigin_data, pOrigin, pReals] = realData(w, -1, dRoot, dFactorExp);
  }
  if (dComp) {
    [pComp_data, pComp_dataApprox] = compConjugateData(dComp, w, -1);//should have one for real
  }
  //should we consolidate all for loops & include if statements inside them?
  //each data point of total is sum of rest at its position.
  //multiply each one by varible storing 1 or 0 to determine if it is included.
  //find total exact frequency plot.
  pRealCount = pReals.length, zRealCount = zReals.length;
  //function allFreq(consT_data, w, zOrigin, zOrigin_data, pOrigin, pOrigin_data, zReal, zRealArr, zRealCount, pReal, pRealCount, pRealArr, zComp_data, pComp_data) {
  //allFreq(consT_data, w, zOrigin, zOrigin_data, pOrigin, pOrigin_data, zReal, zRealCount, zRealArr, pReal, pRealCount, pRealArr, zComp_data, pComp_data
  allFreq_data = allFreq(consT_data, w, zOrigin, zOrigin_data, pOrigin, pOrigin_data, zReals, zRealCount, zReal_data, pReals, pRealCount, pReal_data, zComp_data, pComp_data);
  //find total approximate frequency plot.
  allFreq_dataApprox = allFreq(consT_data, w, zOrigin, zOrigin_data, pOrigin, pOrigin_data, zReals, zRealCount, zReal_dataApprox, pReals, pRealCount, pReal_dataApprox, zComp_dataApprox, pComp_dataApprox);
  /*if (JSON.stringify(allFreq_data) == JSON.stringify(allFreq_data2)) {
    console.log("Yes it works.");
  }*/
  /* (consT, consT_data, zOrigin_data, pOrigin_data, zReal_data,
    pReal_data, zReals, pReals, zComp_data, pComp_data, zRealCount, pRealCount,
    allFreq_data, zReal_dataApprox, pReal_dataApprox, zComp_dataApprox, pComp_dataApprox,
    allFreq_dataApprox, nComp, dComp) */
  return [[consT, consT_data, zOrigin_data, pOrigin_data, zReal_data,
    pReal_data, zReals, pReals, zComp_data, pComp_data, zRealCount,
    pRealCount, allFreq_data, zReal_dataApprox, pReal_dataApprox,
    zComp_dataApprox, pComp_dataApprox, allFreq_dataApprox, nComp, dComp],
    [w, consT, consT_data, zOrigin_data, pOrigin_data, zReals, pReals,
      zRealArr, pRealArr, nComp, dComp, nFactorExp, dFactorExp]];
}//w, consT, consT_data, zOrigin_data, pOrigin_data, zReals, pReals, zRealArr, pRealArr, nComp, dComp)

//takes roots and uses them to find the bounds of w (omega)
function wBound(nRoot, dRoot) {
  var wMin, wMax, n = [], d = [], total;
  n = w0List(nRoot);
  d = w0List(dRoot);
  total = n.concat(d);
  wMin = Math.min(...total);
  wMax = Math.max(...total);
  wMin = Math.pow(Math.floor(Math.log10(wMin)-1), 10);
  wMax = Math.pow(Math.ceil(Math.log10(wMax)+1), 10);
  if (wMax == Infinity || wMax < 100) {
    wMax = 100;
  }
  return [wMin, wMax];
}//so far this has not given us reasonable answers.
function w0List(rootList) {
  var ret = [], realRoots = rootList[0], imagRoots = rootList[1];
  if (realRoots && imagRoots) {
    for (let i=0; i<realRoots.length; i++) {// loop through real roots
      ret.push(Math.abs(rootList[i]));
    }
    for (let i=0; i<imagRoots.length; i++) {//loop through imaginary roots
      ret.push(Math.sqrt(Math.pow(rootList[1][i][0], 2)+Math.pow(rootList[1][i][1], 2)));
    }
  }
  return ret;
}

//function rounds a number to a decimal # of decimal places.
function roundDecimal (num, decimal) {
  var a = Math.pow(10, decimal);
  return (Math.round(num*a)/a);
}
//turns an array of [real, img] to 'real + imag*i'
//this one assumes we are only making one graph for a pair of complex conjugates
function compArrToStr(comp) {
  let print;
  if (comp[1] == -1 || comp[1] == 1) {
    print = comp[0].toString() + ' -+ i ';
  }
  else {
    print = comp[0].toString() + ' -+ ' + Math.abs(comp[1]).toString() + 'i';
  }
  return print;
}
//works on dComp or nComp to get their data.
function compConjugateData(comp, w, sign) {//sign will be -1 or +1
  var comp_data = [], comp_dataApprox = [], base, peak, imagPart,
  realPart, x, zeta, w0, w0Rounded, jMax = w.length, xIntercept;
  let a, b;//a + jb, a = 1-(w/w0)^2 b = 2*zeta*w/(w0) w[j]
  for (let i=0; i<comp.length; i++) {//loop through complex roots in numerator.
    realPart = comp[i][0];
    imagPart = comp[i][1];
    w0 = Math.sqrt(realPart*realPart + imagPart*imagPart);
    w0Rounded = roundDecimal(w0, 1);//round to 1 decimal place.
    x = Math.atan2(imagPart,realPart);//y, x -> y/x, opposite/ajdacent
    zeta = Math.cos(x);
    //w/ x^2+2x+5, roots are complex conjugate but zeta is -, so not btw 0 & 1.
    //once had Math.cos in abs so wouldn't have to worry about - & 0 < zeta < 1
    //got NaN on that one.
    //pg 293 of book vs https://lpsa.swarthmore.edu/Bode/BodeReviewRules.html: 0<zeta<1 or 0<=zeta<1?
    //how is this possible for a complex conjugate? one will be -, other will be +.
    comp_data.push([]);
    comp_dataApprox.push([]);
    //if (zeta > 0 && zeta < 1) {//will have to account for a # & it's conjugate being in there (I think? or will zeta take care of that?)
      if (zeta < 0.5) {
        for (let j=0; j<jMax; j++) {
          x = w[j];//lines 40*Math.log10(x) & y=0 intersect at x = 1.
          if (w[j] <= w0Rounded) {//for phase w[j] <= w0/(Math.pow(10, zeta))) {
            comp_dataApprox[i].push([w[j], 0]);
          }//was w0Rounded.
          else if (w[j] > w0Rounded && w[j] != w0Rounded) { //might change to if so they will connect?
            comp_dataApprox[i].push([w[j], sign*40*Math.log10(x-w0Rounded+1)]);
          }//w0Rounded pushes the asymptote so it is more in sync w/ exact function.
          else if (w[j] == w0Rounded) {//might ask prof cheever about his peak at some point.
            base = sign*40*Math.log10(x);
            peak = 20*Math.abs(Math.log10(2*Math.abs(zeta)))*Math.sign(base);
            //if the peak doesn't have the same size as the base, it iwll look like a valley.
            //zComp_dataApprox[i].push([w[j], base+(peak/3)]);//should we have nFactorExp[i] here?
            //zComp_dataApprox[i].push([w[j], base+(2*peak/3)]);//should we have nFactorExp[i] here?
            comp_dataApprox[i].push([w[j], base+peak]);//should we have nFactorExp[i] here?
          }
        }
      }
      else if (zeta >= 0.5) {//don't draw peak. it would seem like in this case w[0] doesn't matter.
        for (let j=0; j<jMax; j++) {
          x = w[j];
          if (w[j] < w0Rounded) {//for phase w[j] <= w0/(Math.pow(10, zeta))) {
            comp_dataApprox[i].push([w[j], 0]);
          }
          else if (w[j] >= w0Rounded) {
            comp_dataApprox[i].push([w[j], sign*40*Math.log10(x)]);
          }
        }
      }
      //exact version starts here:
      //a + jb, a = 1-(w/w0)^2 b = 2*zeta*w/(w0) w[j]. 20*log10(|a+jb|)
      for (let j=0; j<jMax; j++) {//should we have included this in both the other for loops or had there be only one?
        realPart = 1-Math.pow((w[j]/w0), 2);
        imagPart = 2*zeta*(w[j]/w0);//also j, j^2 = -1
        //+ works, - doesn't.
        x = Math.sqrt(realPart*realPart+imagPart*imagPart);//magnitude |a+jb|
        comp_data[i].push([w[j], sign*20*Math.log10(x)]);
        //approx & exact are closer when both 20 or 40.
      }
    //}//there is no way the exact way can be this easy.
  }
  return [comp_data, comp_dataApprox]
}
function allFreq(consT_data, w, zOrigin, zOrigin_data, pOrigin, pOrigin_data, zReal, zRealCount, zRealArr, pReal, pRealCount, pRealArr, zComp_data, pComp_data) {
  var allFreq_data = [], calc, pointNum = w.length;
  //Math.min(zComp_data[0].length, pComp_data[0].length); this only works when both of these are defined, not otherwise.
  for (let i=0; i<pointNum; i++) {//each data point for total is sum of other data points.
    calc = parseInt(consT_data[i][1], 10);//consT will always be horizontal & the same
    if(zOrigin) {
      calc += parseInt(zOrigin_data[i][1], 10);
    }
    if (pOrigin) {
      calc += parseInt(pOrigin_data[i][1], 10);
    }
    if (zReal[0]) {
      for (let j=0; j<zRealCount; j++) {//is htere any way you can work this into the rest?
        calc += parseInt(zRealArr[j][i][1], 10);
      }
    }
    if (pReal[0]) {
      for (let j=0; j<pRealCount; j++) {//is htere any way you can work this into the rest?
        calc += parseInt(pRealArr[j][i][1], 10);
      }
    }
    if (zComp_data[0]) {//if first item in zComp_data exists
      for (let j=0; j<zComp_data.length; j++) {//is htere any way you can work this into the rest?
        if (zComp_data[j][i] == undefined) {
          console.log('undefined: ' + i.toString() + 'i, ' + j.toString() + 'j');
        }
        calc += parseInt(zComp_data[j][i][1], 10);
      }
    }
    if (pComp_data[0]) {//if first item in zComp_data has anything in it.
      for (let j=0; j<pComp_data.length; j++) {//is htere any way you can work this into the rest?
        calc += parseInt(pComp_data[j][i][1], 10);
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

function mkBode(consT, consT_data, zOrigin_data, pOrigin_data, zReal_data,
  pReal_data, zReals, pReals, zComp_data, pComp_data, zRealCount, pRealCount,
  allFreq_data, zReal_dataApprox, pReal_dataApprox, zComp_dataApprox, pComp_dataApprox,
  allFreq_dataApprox, nComp, dComp) {
  var series = [], graphs, graphCheck, checkHtml, graphHtml, checkId, freqId, phaseId, x;
  graphCheck = document.getElementById('graphOptions');
  graphs = document.getElementById('graphs');
  checkHtml = "<br>Elements Detected: <br>";
  checkHtml += "<input type='checkbox' id='consTCheck' checked></input>";
  checkHtml += "<label for='consTCheck'>Constant "+consT.toString()+"</label><br>";
  graphHtml =  "<div id='consT'><div id='consTFreq'></div><br><p class='freqDescription'></p><br>";
  graphHtml += "<div id='consTPhase'></div><br><p class='phaseDescription'></p></div><br>";
  x = consT_data[0][0].toString();

  series.push({//if something is to not be graphed, it's data will be empty.
      name: 'Constant ' + consT,
      color: 'rgba(223, 83, 83, 1)',//data is [x, y];
      data: consT_data
  });
  var consTSeries = [{
    name: 'Constant ' + consT,
    color: 'rgba(223, 83, 83, 1)',//data is [x, y];
    data: consT_data}];
  graphCheck.innerHTML = checkHtml;
  graphs.innerHTML = graphHtml;
  highchartsPlot(consTSeries, 'consTFreq', 'Constant '+consT.toString()+' Plot', 'Magnitude dB');
  if (zOrigin_data[0]) {//if no z at origin, will just be 0.
    series.push({
        name: 'Zero at Origin',
        color: 'rgba(119, 152, 191, 1)',
        data: zOrigin_data
    });
    var zOriginSeries = [{
      name: 'Constant ' + consT,
      color: 'rgba(119, 152, 191, 1)',//data is [x, y];
      data: zOrigin_data}];
    checkHtml = "<input type='checkbox' id='zOriginCheck' checked></input>";
    checkHtml+="<label for='zOriginCheck'>Zero at Origin</label><br>"
    graphHtml =  "<div id='zOrigin'><div id='zOriginFreq'></div><br><p class='freqDescription'></p><br>";
    graphHtml += "<div id='zOriginPhase'></div><br><p class='phaseDescription'></p></div><br>";
    graphCheck.insertAdjacentHTML('beforeend', checkHtml);
    graphs.insertAdjacentHTML('beforeend', graphHtml);
    highchartsPlot(zOriginSeries, 'zOriginFreq', 'Zero at the Origin Frequency Plot', 'Magnitude dB');
  }
  if (pOrigin_data[0]) {//check if 1st item exists
    series.push({
        name: 'Pole at Origin',
        color: 'rgba(119, 152, 191, 1)',
        data: pOrigin_data
    });
    checkHtml="<input type='checkbox' id='pOriginCheck' checked></input>";
    checkHtml+="<label for='pOriginCheck'>Pole at Origin</label><br>"
    graphCheck.insertAdjacentHTML('beforeend', checkHtml);
  }
  if (zReal_data[0]) {//check if 1st item exists
    for (let i=0; i<zRealCount; i++) {
      series.push({
          name: 'Real Zero '+zReals[i].toString(),
          color: 'rgba(119, 152, 191, 1)',
          data: zReal_data[i]//zReal_data[i][1]//data for relevant real zero.
      });
      series.push({
          name: 'Real Zero '+zReals.toString() + ' Approximation',
          color: 'rgba(119, 152, 191, 1)',
          data: zReal_dataApprox[i]//data for relevant real zero.
      });
      checkId = 'zRealCheck_'+zReals[i].toString();
      checkHtml="<input type='checkbox' id="+checkId+" checked></input>";
      checkHtml+="<label for="+checkId+">Real Zero "+zReals[i].toString()+"</label><br>";
      graphCheck.insertAdjacentHTML('beforeend', checkHtml);
    }
  }
  if (pReal_data[0]) {//is having two for loops more secure?
    for (let i=0; i<pRealCount; i++) {
      series.push({
          name: 'Real Pole '+pReals[i].toString(),
          color: 'rgba(119, 152, 191, 1)',
          data: pReal_data[i]//data for relevant real zero.
      });
      series.push({
          name: 'Real Pole '+pReals[i].toString()+' Approximation',
          color: 'rgba(119, 152, 191, 1)',
          data: pReal_dataApprox[i]//data for relevant real zero.
      });
      checkId = 'pRealCheck_'+pReals[i].toString();
      checkHtml="<input type='checkbox' id="+checkId+" checked></input>";
      checkHtml+="<label for="+checkId+">Real Poles "+pReals[i].toString()+"</label><br>";
      graphCheck.insertAdjacentHTML('beforeend', checkHtml);
    }
  }
  if (nComp[0]) {//nComp.length
    let print = [];
    let compDone = [];
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
      checkId = 'zCompCheck_'+nComp[i][0].toString()+","+nComp[i][1].toString();//pattern: real,imaginary.
      checkHtml="<input type='checkbox' id="+checkId+" checked></input>";
      checkHtml+="<label for="+checkId+">Complex Conjugate Zeros "+print[i]+"</label><br>";
      graphCheck.insertAdjacentHTML('beforeend', checkHtml);
    }
  }
  if (dComp[0]) {//dComp.length
    let print = [];
    for (let i=0; i<pComp_dataApprox.length; i++) {
      print.push(compArrToStr(dComp[i]));
      series.push({
          name: 'Complex Pole '+ print[i],//nComp[i][0].toString() + ' + ' + nComp[i][1].toString() +' Approximation',
          color: 'rgba(5, 191, 5, 1)',
          data: pComp_data[i]//data for relevant real zero.
      });
    }
    for (let i=0; i<pComp_data.length; i++) {
      series.push({
          name: 'Complex Pole '+ print[i] + ' Approximation',//nComp[i][0].toString() + ' + ' + nComp[i][1].toString() +' Approximation',
          color: 'rgba(5, 191, 5, 1)',
          data: pComp_dataApprox[i]//data for relevant real zero.
      });
      checkId = 'pCompCheck_'+dComp[i][0].toString()+","+nComp[i][1].toString();//pattern: real,imaginary.
      checkHtml="<input type='checkbox' id="+checkId+" checked></input>";
      checkHtml+="<label for="+checkId+">Complex Conjugate Poles "+print[i]+"</label><br>";
      graphCheck.insertAdjacentHTML('beforeend', checkHtml);
    }
  }
  if (allFreq_data.length) {
    series.push({
        name: 'Total Bode',
        color: 'rgba(0, 0, 0, 1)',
        data: allFreq_data//data for relevant real zero.
    });
    series.push({
        name: 'Total Bode' + ' Approximation',
        color: 'rgba(50, 0, 50, 1)',
        data: allFreq_dataApprox//data for relevant real zero.
    });
  }
  checkHtml = "<button onclick='graph()'>Graph</button><br>";
  graphCheck.insertAdjacentHTML('beforeend', checkHtml);
  var desc = 'Constant '+consT.toString()+' in dB: 20log10(|'+consT.toString()+'|) = ' + x;
  setDescription('consT', desc, 'freq');
  highchartsPlot(series, 'bode', 'Bode Plot', 'Magnitude dB');
}
//w is input (like #s plugged in for x).
function bodeDataPhase(w, consT, consT_data, zOrigin_data, pOrigin_data, zReals, pReals, zReal_data, pReal_data, nComp, dComp, nFactorExp, dFactorExp) {
  var x, w0, theta, zReal = zReals.length, pReal = pReals.length,
  zOrigin = 0, pOrigin = 0, zRealCount = zReal, pRealCount = pReal, zReal_dataApprox,
  pReal_dataApprox, zComp_data = [], pComp_data = [], zComp_dataApprox = [],
  pComp_dataApprox = [], allPhase_data, allPhase_dataApprox, jMax = w.length, desc;
  //pRealCount vs pReal might confuse your readers.. mbe try to eliminate the flags you can?
  //get w.
  for (let i=0; i<jMax; i++) {
    if (consT > 0) {
      consT_data[i] = [w[i], 0];
    }
    else if (consT < 0) {
      consT_data[i] = [w[i], 180];//-180 would also work.
    }
    if (zOrigin_data.length) {//they wouldn't have a length if there was no zero at origin.
      zOrigin_data[i] = [w[i], 90];
      zOrigin = 1;
    }
    if (pOrigin_data[0]) {
      pOrigin_data[i] = [w[i], -90];
      pOrigin = 1;
    }
  }//works if either real zeros ar complex, not both bc nFactorExp has exp of all factors.
  if (zReal) {//loop through real zeros. figure out this again.
    [zReal_data, zReal_dataApprox] = realPhaseData(w, 1, zReals, nFactorExp);
    //would it be better to change original items w/ zRealArr[i]? we would pass in zRealArr as a parameter.
  }
  if (pReal) {
    [pReal_data, pReal_dataApprox] = realPhaseData(w, -1, pReals, dFactorExp);
  }
  //function compConjugatePhaseData (comp, w, sign) {//sign will be -1 or +1
  if (nComp[0]) {
    [zComp_data, zComp_dataApprox] = compConjugatePhaseData(nComp, w, 1);
  }
  if (dComp[0]) {//double check that this is not true when there are no complex poles.
    [pComp_data, pComp_dataApprox] = compConjugatePhaseData(dComp, w, -1);
  }
  // allFreq(consT_data, w, zOrigin, zOrigin_data, pOrigin, pOrigin_data, zReal, zRealCount, zRealArr, pReal, pRealCount, pRealArr, zComp_data, pComp_data) {

  allPhase_data = allFreq(consT_data, w, zOrigin, zOrigin_data, pOrigin, pOrigin_data,
    zReals, zRealCount, zReal_data, pReals, pRealCount, pReal_data, zComp_data, pComp_data);
  allPhase_dataApprox = allFreq(consT_data, w, zOrigin, zOrigin_data, pOrigin, pOrigin_data,
    zReals, zRealCount, zReal_dataApprox, pReals, pRealCount, pReal_dataApprox, zComp_dataApprox, pComp_dataApprox);
  return [consT, consT_data, zOrigin_data, pOrigin_data, zReals, zReal_data,
    zReal_dataApprox, pReals, pReal_data, pReal_dataApprox, zComp_data, pComp_data,
    zComp_dataApprox, pComp_data, pComp_dataApprox, nComp, dComp, allPhase_data, allPhase_dataApprox];
  //(consT, consT_data, zOrigin_data, pOrigin_data, zReals, zRealArr, pReals, pRealArr, zComp_data, pComp_data, zComp_dataApprox, pComp_data, pComp_dataApprox, nComp, dComp)
}
// generates phase data for real zeros & poles.
//sign = 1 for real zeros, sign = -1 for real poles.
function realData(w, sign, nRoot, nFactorExp) {
  var zReal_data = [], zReal_dataApprox = [], zReals = [], x, w0, zOrigin = 0, zOrigin_data = [], jMax = w.length;
  for (let i=0; i<nRoot[0].length; i++) {//loop through real zeros.
    if (nRoot[0][i] == 0) {
      zOrigin = 1;
      for (let j=0; j<jMax; j++) {//might have to redo the nFactorExp[i]
        zOrigin_data.push([w[j], 20*nFactorExp[i]*sign*Math.log10(w[j])]);
      }
    }
    else if (nRoot[0][i]) {//real number zero
      zReals.push(nRoot[0][i]);
      zReal_data.push([]);
      zReal_dataApprox.push([]);
      w0 = Math.abs(nRoot[0][i]);//w0, reciprocal of zero.
      for (let j=0; j<jMax; j++) {
        //approximate:
        x = w[j]/w0;
        if (w[j]<= w0) {
          zReal_dataApprox[i].push([w[j], 0]);
        }
        else if (w[j]>w0) {
          zReal_dataApprox[i].push([w[j], sign*20*nFactorExp[i]*Math.log10(x)]);
        }
        //exact
        zReal_data[i].push([w[j], sign*20*nFactorExp[i]*Math.log10(Math.pow((1 + x*x), 0.5))]);
      }
    }
  }
  return [zReal_data, zReal_dataApprox, zOrigin_data, zOrigin, zReals];
}
function realPhaseData(w, sign, zReals, nFactorExp) {
  var zReal_data = [], zReal_dataApprox = [], theta, x, w0, zReal = zReals.length,
  lowerBound, upperBound, slope, yIntercept, jMax = w.length, ret;
  for (let i=0; i<zReal; i++) {//loop through real zeros.
      zReal_data.push([]);
      zReal_dataApprox.push([]);
      w0 = Math.abs(zReals[i]);//w0, reciprocal of zero.
      lowerBound = 0.1*w0;
      upperBound = 10*w0;
      for (let j=0; j<jMax; j++) {
        //approximate:
        if (w[j]<lowerBound) {
          zReal_dataApprox[i].push([w[j], 0]);
        }
        else if (w[j]>upperBound) {
          //nFactorExp[i]
          theta = sign*90;
          zReal_dataApprox[i].push([w[j], theta]);
        }
        else {//betweeen the two.
          //nFactorExp[i] in slope
          slope = 90*sign/(upperBound - lowerBound);
          yIntercept = slope*(-1*lowerBound);// m*(-x1)+y1 in point-slope form. y1 = 0.
          theta = slope*w[j]+yIntercept;
          zReal_dataApprox[i].push([w[j], theta]);
        }
        //exact
        x = w[j]/w0;
        theta = rad2Degrees(sign*Math.atan2(w[j], w0));
        zReal_data[i].push([w[j], theta]);
      }
  }
  return [zReal_data, zReal_dataApprox];
}
//works on dComp or nComp to get their phase data.
//should we pass it w0, zeta, etc from other functions?
function compConjugatePhaseData(comp, w, sign) {//sign will be -1 or +1
  var comp_data = [], comp_dataApprox = [], base, peak, imagPart, realPart,
  x, zeta, w0, upperBound, lowerBound, slope, yIntercept, jMax = w.length;
  var compDone = [];//comp already done.
  let a, b;//a + jb, a = 1-(w/w0)^2 b = 2*zeta*w/(w0) w[j]
  for (let i=0; i<comp.length; i++) {//loop through complex roots in numerator.
    realPart = comp[i][0];
    imagPart = comp[i][1];
    w0 = Math.sqrt(realPart*realPart + imagPart*imagPart);
    x = Math.atan2(imagPart,realPart);//y, x -> y/x, opposite/ajdacent
    zeta = Math.cos(x);//zeta will be a ratio.
    //pg 293 of book vs https://lpsa.swarthmore.edu/Bode/BodeReviewRules.html: 0<zeta<1 or 0<=zeta<1?
    //how is this possible for a complex conjugate? one will be -, other will be +.
    comp_data.push([]);
    comp_dataApprox.push([]);
    //roundDecimal() on lower & upperBound?
    //0.7, 6.3
    lowerBound = w0/(Math.pow(10, Math.abs(zeta)));////(x,y) = (lowerBound, 0)
    upperBound = w0*Math.pow(10, Math.abs(zeta));//(x,y) = (upperBound, sign*180)
    slope = 180*sign/(upperBound - lowerBound);
    //slope = sign*180/(Math.log10(upperBound) - Math.log10(lowerBound));
    yIntercept = slope*(-1*lowerBound);// m*(-x1)+y1 in point-slope form. y1 = 0.*/

    /*slope = sign*180/(Math.log10(upperBound) - Math.log10(lowerBound));
    yIntercept = sign*180 - slope*Math.log10(upperBound +1-lowerBound);*/
    //if (zeta > 0 && zeta < 1) {//will have to account for a # & it's conjugate being in there (I think? or will zeta take care of that?)
      for (let j=0; j<jMax; j++) {
        x = w[j];
        //lower & upper boundarises of line in x coordinates
        if (w[j] < lowerBound) {//for phase w[j] <= w0/(Math.pow(10, zeta))) {
          comp_dataApprox[i].push([w[j], 0]);
        }
        else if (w[j] > upperBound) {
          comp_dataApprox[i].push([w[j], sign*180]);
        }
        else {
          comp_dataApprox[i].push([w[j], slope*(w[j]+1-lowerBound)+yIntercept]);
          //comp_dataApprox[i].push([w[j], slope*(w[j]+1-lowerBound)+yIntercept]);
        }
      }
    //}
      //exact version starts here:
      //a + jb, a = 1-(w/w0)^2 b = 2*zeta*w/(w0) w[j]. 20*log10(|a+jb|)
    for (let j=0; j<jMax; j++) {//should we have included this in both the other for loops or had there be only one?
      a = w[j]/w0;
      b = 1-a*a;
      x = (2*zeta*a)/b;//magnitude |a+jb|
      //ends up being arctan(img/real)
      //should Math.abs() be necessary here, or are we doing somehting else wrong?
      comp_data[i].push([w[j], sign*Math.abs(rad2Degrees(Math.atan2(2*zeta*a, b)))]);//vs Math.atan2(x)
      //we need rad2Degrees bc graph is in degrees & Math.atan2() returns radians.
    }
  }
  //there is no way the exact way can be this easy.
  return [comp_data, comp_dataApprox];
}
function mkBodePhase(consT, consT_data, zOrigin_data, pOrigin_data, zReals, zRealArr,
  zReal_dataApprox, pReals, pRealArr, pReal_dataApprox, zComp_data, pComp_data,
  zComp_dataApprox, pComp_data, pComp_dataApprox, nComp, dComp, allPhase_data, allPhase_dataApprox) {
  var series = [], zOriginSeries = [], desc;
  if (consT) {
    series.push(
    {//if something is to not be graphed, it's data will be empty.
        name: 'Constant ' + consT,
        color: 'rgba(223, 83, 83, 1)',//data is [x, y];
        data: consT_data
    });
    var consTSeries = [{
      name: 'Constant ' + consT,
      color: 'rgba(223, 83, 83, 1)',//data is [x, y];
      data: consT_data}];
    if (consT > 0) {
      desc = 'Constant '+consT.toString()+' > 0, so its phase = 0 degrees.';
    }
    else {
      desc = 'Constant '+consT.toString()+' < 0, so its phase = +- 180 degrees.';
    }
    setDescription('consT', desc, 'phase');
    highchartsPlot(consTSeries, 'consTPhase', 'Constant '+consT.toString()+' Phase Plot', 'Phase in Degrees');
  }
  if (zOrigin_data.length) {
    series.push({
        name: 'Zero at Origin',
        color: 'rgba(119, 152, 191, 1)',
        data: zOrigin_data
    });
    zOriginSeries.push({
        name: 'Zero at Origin',
        color: 'rgba(119, 152, 191, 1)',
        data: zOrigin_data
    });
    setDescription('zOrigin', desc, 'phase');
    highchartsPlot(zOriginSeries, 'zOriginFreq', 'Zero at the Origin Phase Plot', 'Phase in Degrees');
  }
  if (pOrigin_data.length) {//if no pole at origin, will just be 0.
    series.push({
        name: 'Pole at Origin',
        color: 'rgba(119, 152, 191, 1)',
        data: pOrigin_data
    });
  }
  if (zReals.length) {
    for (let i=0; i<zRealArr.length; i++) {
      series.push({
          name: 'Real Zero: ' + zReals[i].toString(),
          color: 'rgba(119, 152, 191, 1)',
          data: zRealArr[i]
      });
      series.push({
          name: 'Real Zero: ' + zReals[i].toString() + ' Approximation',
          color: 'rgba(119, 152, 191, 1)',
          data: zReal_dataApprox[i]
      });
    }
  }
  if (pReals.length) {
    for (let i=0; i<pRealArr.length; i++) {
      series.push({
          name: 'Real Pole: ' + pReals[i].toString(),
          color: 'rgba(119, 152, 191, 1)',
          data: pRealArr[i]
      });
      series.push({
          name: 'Real Pole: ' + pReals[i].toString() + ' Approximation',
          color: 'rgba(119, 152, 191, 1)',
          data: pReal_dataApprox[i]
      });
    }
  }
  if (allPhase_data.length) {
    series.push({
        name: 'Total Phase',
        color: 'rgba(0, 0, 0, 1)',
        data: allPhase_data//data for relevant real zero.
    });
    series.push({
        name: 'Total Phase Approximation',
        color: 'rgba(50, 0, 50, 1)',
        data: allPhase_dataApprox//data for relevant real zero.
    });
  }
  if (nComp[0]) {//nComp.length
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
  if (dComp[0]) {//dComp.length
    let print = [];//two lengths should be equal
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
  highchartsPlot(series, 'bodePhase', 'Bode Plot: Phase', 'Phase in Degrees');
}
//sets a discription within a div with id divId.
//description type can be 'freq' or 'phase'
function setDescription(divId, description, type) {
  var desc = document.getElementById(divId).getElementsByClassName(type+'description')[0];
  desc.textContent = description;
}
//series: data to be plotted. id: id of div to plot it in.
//title: array w/ title of chart, yAxis has title of yAxis.
function highchartsPlot(series, id, title, yAxis) {
  Highcharts.chart(id, {
    chart: {
        type: 'line',
        zoomType: 'xy'
    },
    title: {
        text: title
    },
    xAxis: {
      type: 'logarithmic',//'logarithmic'. can't plot sub-zero values on a logarithmic axis
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
            text: yAxis//'Magnitude dB'
        }
    },
    legend: {
            layout: 'vertical',
            backgroundColor: 'white',
            align: 'right',
            verticalAlign: 'top',
            y: 60,
            x: -10,
            borderWidth: 1,
            borderRadius: 0,
            title: {
                text: ':: Drag me'
            },
            floating: true,
            draggable: true,
            zIndex: 20
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
