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

  /*var opt = [];//options
  var ids = ['constant', 'zOrigin', 'pOrigin', 'zReal', 'pReal'];
  for (let i=0; i<ids.length; i++) {
    opt.push(document.getElementById(ids[i]).checked);//1 or 0 depending on whether it is checked.
  }*/
  var bdata = bodeData(numAns, denomAns);
  mkBode(bdata[0], bdata[1], bdata[2], bdata[3], bdata[4], bdata[5], bdata[6], bdata[7], bode[8], [1, 1, 1, 1, 1])//, 1);//plot data for first time.
  //we actualy don't need options checkboxes because we can already choose wheich ones to show w/ js.
}
//returns list contaniing polynomial form, coefficients, roots, order, etc.
function finder (polynomialform) {
  var numTerms = 0;
  var ret;//return value
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
  var factorPowers = [];//powers corresponding to each factor.
  //think about using coef.text() instead of objectToArray.
  //console.log(coef.text());
  coef = objectToArray(coef);//splits up all digits.
  //console.log(coef[coef.length-1]); was ']'
  factors = factors.toString();
  ret = factorsArr(factors);//array of factors & their exponets.
  factors = ret[0];
  factorExp = ret[1];//can also view these as # of times that a root appears, since each root is calculated form a factor.
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
//takes numAns, denomAns & returns list of data for bode plot
//each root will only occur once, and its exponet will be listed in numAns['factorExp'] or denomAns['factorExp'];
function bodeData (numAns, denomAns) {//add pReal & zReal nextx
  var nRoot = rootsStrArrToChartFormat(numAns['roots']);
  var dRoot = rootsStrArrToChartFormat(denomAns['roots']);
  var n = unity(numAns['coef'], numAns['powers']);//make x^0's coefficeint 1
  var d = unity(denomAns['coef'], numAns['powers']);
  var nFactorExp = numAns['factorExp'];
  var dFactorExp = denomAns['factorExp'];
  var consT, calc;
  if (n['divisor']) {
    consT = d['divisor']/n['divisor'];
  }
  else {//x^0 coefficient is 0 in numerator.
    consT = 1;//if multiply anything by 1, is still itself.
  }
  var zOrigin = 0, pOrigin = 0, zReal = 0, pReal = 0;//false by default.
  var consT_data = [], zOrigin_data = [], pOrigin_data = [], zReal_data = [], pReal_data = [], allFreq_data = [];
  var zRealArr = [], pRealArr = [];
  var zRealCount = 0;//# of real zeros
  var pRealCount = 0;//# of real poles
  consT = 20*Math.log10(Math.abs(consT));
  var w = [];//for omega, frequency.
  for (let i=0; i<100; i++) {
    w.push(roundDecimal(1.0 + i*0.1, 1));
    consT_data.push([w, consT]);
  }
  for (let i=0;i<nRoot.length; i++) {
    if (nRoot[i][0] == 0 && nRoot[i][1] == 0) {
      zOrigin = 1;
      for (let j=0; j<100; j++) {
        zOrigin_data.push([w[j], 20*nFactorExp[i]*Math.log10(w[j])]);
      }
    }
    if (nRoot[i][0] != 0 && nRoot[i][1] == 0) {//real number zero
      zReal = 1;
      zReal_data.push([nRoot[i][0], []]);//each zero is included with it's array of data.
      for (let j=0; j<100; j++) {
        zReal_data[zRealCount][1].push([w[j], 20*nFactorExp[i]*Math.log10(w[j])]);//add data to array.
      }
      zRealCount++;
    }//lets figure out a good way to track how many of each root there are.
  }
  for (let j=0; j<zRealCount; j++) {//is there a more elegant solution?
    zRealArr.push(zReal_data[j][1]);
  }
  for (let i=0;i<dRoot.length; i++) {
    if (dRoot[i][0] == 0 && dRoot[i][1] == 0) {//zero pole
      pOrigin = 1;
      for (let j=0; j<100; j++) {
        pOrigin_data.push([w[j], -20*dFactorExp[i]*Math.log10(w[j])]);
      }
    }
    if (dRoot[i][0] != 0 && dRoot[i][1] == 0) {//real pole
      pReal = 1;
      pReal_data.push([dRoot[i][0], []]);//push a 2D array to pReal_data. second item will become data for graphing every real root.
      for (let j=0; j<100; j++) {
        pReal_data[pRealCount][1].push([w[j], -20*dFactorExp[i]*Math.log10(w[j])]);
      }
      pRealCount++;
    }
  }
  for (let j=0; j<pRealCount; j++) {//is there a more elegant solution?
    pRealArr.push(pReal_data[j][1]);
  }
  //should we consolidate all for loops & include if statements inside them?
  //each data point of total is sum of rest at its position.
  //multiply each one by varible storing 1 or 0 to determine if it is included.
  for (let i=0; i<100; i++) {//each data point for total is sum of other data points.
    calc = consT_data[i];
    if(zOrigin) {
      calc += zOrigin_data[i];
    }
    if (pOrigin) {
      calc += pOrigin_data[i];
    }
    if (zReal) {
      for (let j=0; j<zRealCount; j++) {//is htere any way you can work this into the rest?
        calc += zReal[i][1][j];
      }
    }
    if (pReal) {
      for (let j=0; j<zRealCount; j++) {//is htere any way you can work this into the rest?
        calc += pReal[i][1][j];
      }
    }
    allFreq_data.push([w[j], calc]);
  }
  return [consT, consT_data, zOrigin_data, pOrigin_data, zReal_data, pReal_data, zRealCount, pRealCount, allFreq_data];
}
//function rounds a number to a decimal # of decimal places.
function roundDecimal (num, decimal) {
  var a = Math.pow(10, decimal);
  return (Math.round(num*a)/a)
}
//executes when graph is clicked.
/*function onGraphClick () {
  var opt = [];//options
  var ids = ['constant', 'zOrigin', 'pOrigin', 'zReal', 'pReal'];
  for (let i=0; i<ids.length; i++) {
    opt.push(document.getElementById(ids[i])).checked);//1 or 0 depending on whether it is checked.
  }
  mkBode(, opt);
}*/
//atan2 can be more precise.
//what should we do for just imaginary #s?
//will have to do less coding if understand what you're doing first!
//format of list w/ each # a+bi as [a, b]
//first is whether it is the first time graphing plot.
//pass in data for plot. data itself will only be generated once, mkBode

function mkBode (consT, consT_data, zOrigin_data, pOrigin_data, zReal_data, pReal_data, zRealCount, pRealCount, allFreq_data, options){
  console.log(consT_data);
  console.log(zReal_data);
  console.log(pReal_data);
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
  if (zOrigin_data.length && options[2]) {//if no pole at origin, will just be 0.
    series.push({
        name: 'Pole at Origin',
        color: 'rgba(20, 191, 20, 1)',
        data: pOrigin_data
    });
  }
  if (zRealCount && options[3]) {//[]
    for (let i=0; i<zRealCount; i++) {
      series.push({
          name: 'Real Zero '+zReal_data[i][0].toString(),
          color: 'rgba(119, 152, 191, 1)',
          data: zReal_data[i][1]//data for relevant real zero.
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
  }
  if (allFreq_data.length) {
    series.push({
        name: 'Real Pole '+pReal_data[i][0].toString(),
        color: 'rgba(119, 152, 191, 1)',
        data: allFreq_data//data for relevant real zero.
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
      type: 'logarithmic',//'logarithmic'
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
                pointFormat: '{point.x} &#x03C9;, {point.y} dB'
            }
        }
    },
    series: series
  });
}
function desmos(constant) {
  var elt = document.getElementById('desmos');
  var calculator = Desmos.GraphingCalculator(elt);
  calculator.setExpression({ id: 'graph1', latex: 'f(x)=\log_{10}(x)' });
  calculator.setExpression({ id: 'graph2', latex: 'g\left(x\right)=-20\log\left(x\right)' });
  calculator.setExpression({ id: 'graph3', latex: 'y = '+constant.toString() });
}
//called when button clicked.
//only graphs the elements that the user wants to see (allows them to only look at one.)
//only supports zOrigin now for testing.
function onFrequency(appOrExact) {//will we need a new function?
  var constant, zOrigin, pOrigin;
  var zReal = [], pReal = [], zComp = [], pComp = [];
  if (!appOrExact) {
    if (document.getElementById('zOriginCheck').checked) {
      zOrigin = 1;
    }
    else {
      zOrigin = 0;
    }
    constant = 0;
    pOrigin = 0;
    zReal.push(0);
    pReal.push(0);
    zComp.push(0);
    bodeApprox(constant, zOrigin, pOrigin, zReal, pReal, zComp, pComp, 0);//0 so it won't create the box again.
  }
}
//constant is the constant const gain
//zOrigin & pOrigin specify whether there is a zero or pole (respectively) at the origin or not (1|0).
//zReal[0] & pReal[0] specify whether there is a zero or pole (respectively) at the origin or not (1|0).
//zReal[1] & pReal[1] are the list of real zeros or poles.
//zReal [2] & pReal[1] are a list of the # of times each zero appears (its order).
//worry about repeated zeros later.
//ω = &#x03C9;
//original specifies whether it is the first time this is being graphed or not.
function bodeApprox(constant, zOrigin, pOrigin, zReal, pReal, zComp, pComp, original) {
  //add array to specify which ones want graphed. could have each if testing if which[whatever] is 0 or 1.
  //actually not needed since already have these. would just need another function to call this one.
  // Create a function graph for f(x) = 0.5*x*x-2*x
  var uBoundX = 10;//upper and lower bound of x-axis
  var lBoundX = -1;
  var uBoundY = 21;
  var lBoundY = -21;//upper & lower bound of y-axis
  const board = JXG.JSXGraph.initBoard('bodeApprox', {
    boundingbox: [lBoundY, uBoundY, uBoundX, lBoundX], axis:true
});
   if (constant) {//graphing constant K out front
     var graph1 = board.create('functiongraph',
     [function(x){
       return 20*Math.log(constant);
     }, lBoundX, uBoundX]
     );
     if (original) {
       var add = "<input type='checkbox' id='zOriginCheck' onclick='console.log(Math.log(10))'></input>"
       document.getElementById('constant').innerHTML = add + " constant: dB = " + "20*log("+constant.toString()+")";
     }
   }
   if (zOrigin) {//graphing a zero at the origin
     var graph2 = board.create('functiongraph',
  [function(x){
      return 20*Math.log10(x);
    }, lBoundX, uBoundX]
  );
  document.getElementById('zOrigin').innerHTML = "Zero at Origin: dB = 20*log(&#x03C9;)";
  }
  if (pOrigin) {
  var graph3 = board.create('functiongraph',
  [function(x){
    return -20*Math.log10(x);
  }, lBoundX, uBoundX]
  );
  document.getElementById('pOrigin').innerHTML = "Pole at Origin: dB = -20*log(&#x03C9;)";
  }
  if (zReal[0]) {
    var len = zReal[1].length;
    var graph4 = [];
    var html = "";
    let w0;
    let power;//power of a zero, N in a textbook. default is 1.
    for (let i=0; i<len; i++) {
      w0 = Math.abs(zReal[1][i]);// s/(w0) + 1 = 0.
      power = zReal[2][i];
      graph4.push(i);//necessary?
      //will graph each one.
      //might want to give options to turn each one on & off.
      graph4[i] = board.create('functiongraph',
      [function(x){
        if (x>w0) {
          return 20*power*(Math.log(x)-Math.log(w0));
          //add N for powers! how determine power of 1 zero? # times it appears.
          //originally if x>=w0, 20*Math.log10(x-(w0-1));
        }
        else {
          return 0;
        }
      }, lBoundX, uBoundX]
      );
      //ask if -w0 is correct; it is a way to change the function such that it joins
      html = html + "Real Zero: dB = {20*N*log(&#x03C9;-"+w0+") if &#x03C9; >= "+ w0.toString() +"; 0 if &#x03C9; <= "+w0+"}<br>";
    }
    document.getElementById('zReal').innerHTML = html;
  }
  if (pReal[0]) {
    var len = pReal[1].length;
    var graph5 = [];
    var html = "";
    let w0;
    let power;
    for (let i=0; i<len; i++) {
      w0 = Math.abs(pReal[1][i]);// s/(w0) + 1 = 0.
      power = pReal[2][i];
      graph5.push(i);//necessary?
      graph5[i] = board.create('functiongraph',
      [function(x){
        if (x>=w0) {
          return -20*power*(Math.log10(x)-Math.log10(w0))// before book: -20*Math.log10(x-(w0-1));
        }//does this count as an approximation or a definite? they use ~= to refer to  it. seems like original was straight line.
        else {
          return 0;
        }
      }, lBoundX, uBoundX]
      );
      html = html + "Real Pole: dB = {20*log(&#x03C9;-"+w0+") if &#x03C9; >= "+ w0.toString() +"; 0 if &#x03C9; <= "+w0+"}<br>";
    }
    document.getElementById('pReal').innerHTML = html;
  }//still not sure how to do the complex ones
  if (zComp[0]) {
    var len = zComp[1].length;
    var graph6 = [];
    var html = "";
    let w0;
    for (let i=0; i<len; i++) {
      w0 = 1;// s/(w0) + 1 = 0.
      graph6.push(i);//necessary?
      graph6[i] = board.create('functiongraph',
      [function(x){
        if (x>=w0) {
          return 40*Math.log10(x-(w0-1));
        }
        else {
          return 0;
        }
      }, lBoundX, uBoundX]
      );
      html = html + "Complex Zero: dB = {40*log(&#x03C9;-"+w0+") if &#x03C9; >= "+ w0.toString() +"; 0 if &#x03C9; <= "+w0+"}<br>";
    }
    document.getElementById('zComp').innerHTML = html;
  }
  if (pComp[0]) {
    var len = pReal[1].length;
    var graph7 = [];
    var html = "";
    let w0;
    for (let i=0; i<len; i++) {
      w0 = 1;// s/(w0) + 1 = 0.
      graph7.push(i);//necessary?
      graph7[i] = board.create('functiongraph',
      [function(x){
        if (x>=w0) {
          return -40*Math.log10(x);
        }
        else {
          return 0;
        }
      }, lBoundX, uBoundX]
      );
      //html = html + "Real Pole: dB = {-40*log(w) if w >= ; 0 if ω <= "+w0+"}<br>";
    }
    //document.getElementById('pComp').innerHTML = html;
  }
}
//graphs exact versions from text.
function bodeExact (constant, zOrigin, pOrigin, zReal, pReal, zComp, pComp) {
  var uBoundX = 40;
  var lBoundX = -40;
  const board = JXG.JSXGraph.initBoard('bodeExact', {
    boundingbox: [lBoundX, uBoundX, uBoundX, lBoundX], axis:true
  });
     if (constant) {
       var graph1 = board.create('functiongraph',
       [function(x){
         return constant;
       }, lBoundX, uBoundX]
       );
       document.getElementById('constant').innerHTML = "constant: dB = " + constant.toString();
     }
     if (zOrigin) {
       var graph2 = board.create('functiongraph',
    [function(x){
        return 20*Math.log10(x);
      }, lBoundX, uBoundX]
    );
    document.getElementById('zOrigin').innerHTML = "Zero at Origin: dB = 20*log(ω)";
    }
    if (pOrigin) {
    var graph3 = board.create('functiongraph',
    [function(x){
      return -20*Math.log10(x);
    }, lBoundX, uBoundX]
    );
    document.getElementById('pOrigin').innerHTML = "Pole at Origin: dB = -20*log(ω)";
    }
    if (zReal[0]) {
      var len = zReal[1].length;
      var graph4 = [];
      var html = "";
      let w0;
      for (let i=0; i<len; i++) {
        w0 = Math.abs(zReal[1][i]);// s/(w0) + 1 = 0.
        graph4.push(i);//necessary?
        //will graph each one.
        //might want to give options to turn each one on & off.
        graph4[i] = board.create('functiongraph',
        [function(x){
          if (x>=w0) {
            return 20*Math.log10(x-(w0-1));
          }
          else {
            return 0;
          }
        }, lBoundX, uBoundX]
        );
        //ask if -w0 is correct; it is a way to change the function such that it joins
        html = html + "Real Zero: dB = {20*log(w-"+w0+") if w >= "+ w0.toString() +"; 0 if w <= "+w0+"}<br>";
      }
      document.getElementById('zReal').innerHTML = html;
    }
    if (pReal[0]) {
      var len = pReal[1].length;
      var graph5 = [];
      var html = "";
      let w0;
      for (let i=0; i<len; i++) {
        w0 = Math.abs(pReal[1][i]);// s/(w0) + 1 = 0.
        graph5.push(i);//necessary?
        graph5[i] = board.create('functiongraph',
        [function(x){
          if (x>=w0) {
            return -20*Math.log10(x-(w0-1));
          }
          else {
            return 0;
          }
        }, lBoundX, uBoundX]
        );
        html = html + "Real Pole: dB = {20*log(w-"+w0+") if w >= "+ w0.toString() +"; 0 if ω <= "+w0+"}<br>";
      }
      document.getElementById('pReal').innerHTML = html;
    }
    if (zComp[0]) {
      var len = zComp[1].length;
      var graph6 = [];
      var html = "";
      let w0;
      for (let i=0; i<len; i++) {
        w0 = 1;// s/(w0) + 1 = 0.
        graph6.push(i);//necessary?
        graph6[i] = board.create('functiongraph',
        [function(x){
          if (x>=w0) {
            return 40*Math.log10(x-(w0-1));
          }
          else {
            return 0;
          }
        }, lBoundX, uBoundX]
        );
        html = html + "Complex Zero: dB = {40*log(w-"+w0+") if w >= "+ w0.toString() +"; 0 if ω <= "+w0+"}<br>";
      }
      document.getElementById('zComp').innerHTML = html;
    }
    if (pComp[0]) {
      var len = pReal[1].length;
      var graph7 = [];
      var html = "";
      let w0;
      for (let i=0; i<len; i++) {
        w0 = 1;// s/(w0) + 1 = 0.
        graph7.push(i);//necessary?
        graph7[i] = board.create('functiongraph',
        [function(x){
          if (x>=w0) {
            return -40*Math.log10(x);
          }
          else {
            return 0;
          }
        }, lBoundX, uBoundX]
        );
        //html = html + "Real Pole: dB = {-40*log(w) if w >= ; 0 if ω <= "+w0+"}<br>";
      }
      //document.getElementById('pComp').innerHTML = html;
    }
}
