'use strict';

var BDO; // Bode Draw Object
// Create Bode Draw Object
function BDO_Obj() {
    this.num = ''; // Numerator polynomial
    this.den = ''; // Denominator polynomial
    this.C = ''; // Value of constant C
    this.K = ''; // Value of K
    this.terms = ''; // object that holds all the terms.
    this.termsLen;//number of terms
    this.prec = 3; // precision for rounding
    this.numTerms = 0; // number of terms
    this.w = [];//input for graphs.
    this.wLen;//length of w
    this.allMag = [];
    this.allPhase = [];
    this.allMagApprox = [];
    this.allPhaseApprox = [];
    this.namesOfIds = [];
    this.magDescs = [];
    this.phaseDescs = [];
    this.magYIntDesc = '';
    this.lastClickedTopBoxName;
    this.topMagSeries = [];
    this.topPhaseSeries = [];
    this.magSeries = [];
    this.phaseSeries = [];
    this.magFormula = '';//gives formula for all Magnitude & phase.
    this.phaseFormula = '';
    this.omega;
    this.phi;
    this.sinusoidInput;
    this.bold = '1.0';
    this.faded = '0.5';
    this.individualMagChart = '';
    this.individualPhaseChart = '';
    this.sinusoidChart;
};//way to just reference chart from id?

// Create the object that has information needed for each "term"
// of the Bode plotting process.
function termObj() {
    this.value = ''; // the location of the root (either real or complex)
    this.termType = ''; // type of term "RealPole", "RealZero", "ComplexPole"...
    this.mult = 1; // multiplicity of term, m
    this.t1X = ''; // TeX for form 1 (s+wp1)^m  (more elaborate for complex...)
    this.t2X = ''; // TeX for form 2 (1+s/wp1)^m
    this.tXw = ''; // TeX for wp1...
    this.tHw = ''; // html for wp1...  (Not currently using this)
    this.tXz = ''; // TeX for zeta...
    this.tHz = ''; // html for zeta...  (Not currently using this)
    this.mH = ''; // html for string showing multiplicity.
    this.desc = '';//descripton that will be used in putting it all together.
    this.w0;//w0.
    this.magData = [];//array for containing the data that will be graphed in Magnitude plot..
    this.phaseData = [];//array for containing data for phase plot
    this.magDataApprox = [];//approximation of Magnitude data.
    this.phaseDataApprox = [];//approximation of Magnitude data.
    this.zeta = 0;//for real & imaginary, zeta is not relevant.
    this.sign = 0;//-1 if it's a pole, 1 if it's a zero.
    this.magSlope = 0;
    this.magBreakpt = '';//gives w point where slope starts being not zero
    this.lowerBound = '';
    this.upperBound = '';
    this.midPhaseSlope = '';
    this.endPhaseSlope = '';
}

// Reset function
$(function () {
    BDO = new BDO_Obj(); // Create object.
    BDOupdate();
});

// function called when polynomial is changed.
function BDOupdate() {
    /*getTerms();
    dispTerms();*/
    let cheevStart, cheevStop, patStart, patStop, cheevTime, patTime;
    cheevStart = new Date().getTime();
    getTerms();
    dispTerms();
    cheevStop = new Date().getTime();
    getData();
    setEventListeners();
    patStop = new Date().getTime();
    patStart = cheevStop;
    cheevTime = cheevStop - cheevStart;
    patTime = patStop - patStart;
    console.log("Prof. Cheever's code took "+cheevTime.toString() + "ms to run.");
    console.log("Patrick's code took "+patTime.toString() + "ms to run.");
    //cheever's time couold have been spent on that resource.
}

/* This function
 * grabs the text from the html page,
 * forms the transfer function,
 * factors numerator and denominator,
 * gets all the value about the different terms,
 * sorts the terms
 * creates all the TeX needed to display the function.
 */
function getTerms() {
  // Pull info from web page
  // **TODO** take other forms of input like 10(s+100)/((s+10)(s^2+s+1))
  let CStr = $('#multConst').val();
  let NStr = $('#N_of_s').val();
  let DStr = $('#D_of_s').val();
  BDO.num = NStr;
  BDO.den = DStr;
  BDO.C = parseFloat(CStr);

  // Get poles and zeros
  let zeros = nerdamer.roots(BDO.num);
  let poles = nerdamer.roots(BDO.den);

  let numOrd = nerdamer.deg(BDO.num).valueOf();
  let denOrd = nerdamer.deg(BDO.den).valueOf();
  let numTerms = numOrd + denOrd + 1;

  zeros = roundToPrec(zeros, numOrd); // changes zeros from Nerdamer to complex
  poles = roundToPrec(poles, denOrd);

  // We'll figure numTerms out as we go because, for example, a pair of complex
  // conjugate poles counts as a single term.
  BDO.numTerms = 0;

  // Create array to hold all of the terms.
  let terms = new Array(numTerms);

  // The first (index 0) term is the constant.
  terms[0] = new termObj();
  terms[0].value = 0; // Place Holder, we'll change to K later.
  terms[0].termType = 'Constant';
  terms[0].t1X = 'K'; // TeX for form 1 (s+wp1)^m
  terms[0].t1H = 'K';
  terms[0].t2X = 'K'; // TeX for form 2 (1+s/wp1)^m
  terms[0].t2H = 'K';
  BDO.numTerms++;

  // Find all the different kinds of poles, and get their value (i.e., location)
  for (let i = 0; i < denOrd; i++) {
      terms[BDO.numTerms] = new termObj();
      if (poles[i].im == 0) { // Real number
          if (poles[i].re == 0) { // Origin
              terms[BDO.numTerms].termType = 'OriginPole';
              terms[BDO.numTerms].value = 0;
              BDO.numTerms++;
          } else {
              terms[BDO.numTerms].termType = 'RealPole';
              terms[BDO.numTerms].value = poles[i].re;
              BDO.numTerms++;
          }
      } else {
          terms[BDO.numTerms].termType = 'ComplexPole';
          terms[BDO.numTerms].value = poles[i];
          BDO.numTerms++
          i++; // skip over conjugate pole
      }
  }
  // Find all the zeros.
  for (let i = 0; i < numOrd; i++) {
      terms[BDO.numTerms] = new termObj();
      if (zeros[i].im == 0) { // Real number
          if (zeros[i].re == 0) { // Origin
              terms[BDO.numTerms].termType = 'OriginZero';
              terms[BDO.numTerms].value = 0;
              BDO.numTerms++;
          } else {
              terms[BDO.numTerms].termType = 'RealZero';
              terms[BDO.numTerms].value = zeros[i].re;
              BDO.numTerms++;
          }
      } else {
          terms[BDO.numTerms].termType = 'ComplexZero';
          terms[BDO.numTerms].value = zeros[i];
          i++; // skip over conjugate pole
          BDO.numTerms++;
      }
  }


  terms = terms.slice(0, BDO.numTerms); // Truncate extra terms

  // Check for multiple roots, and consolidate them 
  let i = 0;
  // Check against all following terms (no term follows last one, so
  // we don't need to include it.)
  while (i < (BDO.numTerms - 1)) {
      for (let j = i + 1; j < BDO.numTerms; j++) {
          if (terms[i].termType == terms[j].termType) { // if type is the same
              if (terms[i].value == terms[j].value) { // and value is the same
                  terms[i].mult++; // increase multiplicity
                  terms.splice(j, 1); // delete repeated term
                  BDO.numTerms--; // decrease number of terms
              }
          }
          i++;
      }
  }

  // Sort terms into order they will be displayed:
  // Constant, real poles, real zeros, complex poles, complex zeros, origin poles, origin zeros.
  // Also create TeX and html strings for each term.
  // We will store these terms in the BDO object, so create array.
  BDO.terms = new Array(BDO.numTerms);
  BDO.terms[0] = terms[0];

  // j is the counter for the array, we start at the beginning (j=1), look throughout 
  // the "terms" array for all real poles (increment j each time we find one). 
  // Repeat for real zeros...
  let j = 1;

  // The '0' term is constant, it stays put, so start loop at 1.
  // This first loop will add all of the real poles to our array.
  let idx = 0;
  for (let i = 1; i < BDO.numTerms; i++) {
      if (terms[i].termType == 'RealPole') {
          idx++; // increase index for the real poles.
          let m = terms[i].mult
          terms[i].tXw = `\\omega_{p${idx}}`;//originally x had & and ;
          terms[i].tHw = `&omega;<sub>p${idx}</sub>`;
          terms[i].t1X = `(s + ${terms[i].tXw})${to_m(m)}`;
          terms[i].t2X = `(1 + s/${terms[i].tXw})${to_m(m)}`;
          terms[i].t1H = `(s + ${terms[i].tHw})${to_m(m, 1)}`;
          terms[i].t2H = `(1 + s/${terms[i].tHw})${to_m(m, 1)}`;
          // we'll use this phrase whenever the situation arieses that includes a multiple pole or zero.
          terms[i].mH = m == 1 ? '' : `, of muliplicity ${m}`;
          BDO.terms[j++] = terms[i];
      }
  }
  // Now add the zeros.
  idx = 0;
  for (let i = 1; i < BDO.numTerms; i++) {
      if (terms[i].termType == 'RealZero') {
          idx++;
          let m = terms[i].mult
          terms[i].tXw = `\\omega_{z${idx}}`;
          terms[i].tHw = `&omega;<sub>z${idx}</sub>`;
          terms[i].t1X = `(s + ${terms[i].tXw})${to_m(m)}`;
          terms[i].t2X = `(1 + s/${terms[i].tXw})${to_m(m)}`;
          terms[i].t1H = `(s + ${terms[i].tHw})${to_m(m, 1)}`;
          terms[i].t2H = `(1 + s/${terms[i].tHw})${to_m(m, 1)}`;
          terms[i].mH = m == 1 ? '' : `, of muliplicity ${m}`; // multiplicity phrase
          BDO.terms[j++] = terms[i];
      }
  }
  idx = 0;
  for (let i = 1; i < BDO.numTerms; i++) {
      if (terms[i].termType == 'ComplexPole') {
          idx++;
          let m = terms[i].mult
          terms[i].tXw = `\\omega_{0p${idx}}`;
          terms[i].tHw = `&omega;<sub>0p${idx}</sub>`;
          terms[i].tXz = `\\zeta_{p${idx}}`;
          terms[i].tHz = `&zeta;<sub>p${idx}</sub>`;
          terms[i].t1X = `(s^2 + 2${terms[i].tXz}${terms[i].tXw}s + ${terms[i].tXw}^2)${to_m(m)}`;
          terms[i].t2X = `(1 + 2${terms[i].tXz}(s/${terms[i].tXw}) +  (s/${terms[i].tXw}^2))${to_m(m)}`
          terms[i].t1H = `(s + ${terms[i].tHw})${to_m(m, 1)}`;
          terms[i].t2H = `(1 + s/${terms[i].tHw})${to_m(m, 1)}`;
          terms[i].mH = m == 1 ? '' : `, of muliplicity ${m}`; // multiplicity phrase
          BDO.terms[j++] = terms[i];
      }
  }
  idx = 0;
  for (let i = 1; i < BDO.numTerms; i++) {
      if (terms[i].termType == 'ComplexZero') {
          idx++;
          let m = terms[i].mult
          terms[i].tXw = `\\omega_{0z${idx}}`;
          terms[i].tHw = `&omega;<sub>0z${idx}</sub>`;
          terms[i].tXz = `\\zeta_{0z${idx}}`;
          terms[i].tHz = `&zeta;<sub>z${idx}</sub>`;
          terms[i].t1X = `(s^2 + 2${terms[i].tXz}${terms[i].tXw}s + ${terms[i].tXw}^2)${to_m(m)}`;
          terms[i].t2X = `(1 + 2${terms[i].tXz}(s/${terms[i].tXw}) +  (s/${terms[i].tXw}^2))${to_m(m)}`;
          terms[i].t1H = `(s + ${terms[i].tHw})${to_m(m, 1)}`;
          terms[i].t2H = `(1 + s/${terms[i].tHw})${to_m(m, 1)}`;
          terms[i].mH = m == 1 ? '' : `, of muliplicity ${m}`; // multiplicity phrase
          BDO.terms[j++] = terms[i];
      }
  }
  for (let i = 1; i < BDO.numTerms; i++) {
      if (terms[i].termType == 'OriginPole') {
          let m = terms[i].mult
          terms[i].t1X = `\\left( \\frac{1}{s} \\right)${to_m(m)}`;
          terms[i].t2X = `\\left( \\frac{1}{s} \\right)${to_m(m)}`;
          terms[i].t1H = `(s + ${terms[i].tHw})${to_m(m, 1)}`;
          terms[i].t2H = `(1 + s/${terms[i].tHw})${to_m(m, 1)}`;
          terms[i].mH = m == 1 ? '' : `, of muliplicity ${m}`; // multiplicity phrase
          BDO.terms[j++] = terms[i];
      }
  }
  for (let i = 1; i < BDO.numTerms; i++) {
      if (terms[i].termType == 'OriginZero') {
          let m = terms[i].mult
          terms[i].t1X = `s${to_m(m)}`;
          terms[i].t2X = `s${to_m(m)}`;
          terms[i].t1H = `(s + ${terms[i].tHw})${to_m(m, 1)}`;
          terms[i].t2H = `(1 + s/${terms[i].tHw})${to_m(m, 1)}`;
          terms[i].mH = m == 1 ? '' : `, of muliplicity ${m}`; // multiplicity phrase
          BDO.terms[j++] = terms[i];
      }
  }
  console.log(BDO);
}

//updates BDO object to contain data for each term.
function getData() {
  let terms = BDO.terms;
  let w = BDO.w, constantK = parseInt(BDO.K), w1, w2, yEnd;
  let constMag = [], constPhase = [], magSeries = [], phaseSeries = [],
  topMagSeries = [], topPhaseSeries = [], desc, magDescs = [], phaseDescs = [],
  togetherMagSeries = [], togetherPhaseSeries = [], w0Mag, zMag, print, print2, name,
  descIndex, bold = BDO.bold, faded = BDO.faded, checkHtml, graphHtml, graphs, graphCheck, iLen,
  names = [], togetherPhaseDesc, togetherMagDesc, blackRGBA = 'rgba(0, 0, 0, 1)';
  var colors = ['rgba(0,114,189,'+bold+')','rgba(217,83,25,'+bold+')','rgba(237,177,32,'+bold+')','rgba(126,47,142,'+bold+')','rgba(119,172,148,'+bold+')','rgba(77,190,238,'+bold+')', 'rgba(162,20,47,'+bold+')'], colorIndex = 0;
  let magYIntFormula, phaseYIntFormula, magYIntDesc, initMagSlope = 0, magRestDesc = '', phaseRestDesc ='', termDesc;
  
  magYIntDesc = 'Since we have a constant C='+BDO.C.toString();
  /*magYIntDesc += 'a zero at the origin'+BDO.terms[i].mH.toString();
  magYIntDesc += 'a pole at the origin'+BDO.terms[i].mH.toString();*/ 
  //change magYIntDesc to local.
  for (let i=1; i<10001; i++) {
    w.push(roundDecimal(i*0.1, 1));//w.push(roundDecimal(1+ i*0.1, 1)); might want multiple versions of this.
    constMag.push([w[i-1], 20*Math.log10(constantK)]);
  }
  BDO.wLen = w.length;
  BDO.magFormula += 'Magnitude: <br>20log<sub>10</sub>('+constantK.toString()+') ';
  if (constantK > 0) {
    for (let i=0; i<w.length; i++) {
      constPhase.push([w[i], 0]);
    }
    desc = 'Since the constant is positive, its phase is 0&deg;.';
    BDO.phaseFormula += 'Phase: <br>0&deg; ';
  }
  else if (constantK < 0) {
    for (let i=0; i<w.length; i++) {
      constPhase.push([w[i], 180]);
    }
    desc =  'Since the constant is positive, its phase is &plusmn; 180&deg;.<br>We have chosen to represent it as +180#&deg;.';
    BDO.phaseFormula += '180&deg; ';
  }
  terms[0].magData = constMag;
  terms[0].phaseData = constPhase;
  terms[0].magDataApprox = constMag;
  terms[0].phaseDataApprox = constPhase;
  magYIntFormula = BDO.K;
  phaseYIntFormula = constPhase[0][1].toString();
  name = 'Constant ' + constantK.toString();//was just constantK
  names.push(name);
  checkHtml = "<br>Elements Detected: <br>";
  checkHtml += "<input type='radio' id='" + name + "' onclick=\"onTopCheckOne(\'"+name+"\')\" checked></input>";
  checkHtml += "<label for='" + name + "'>"+ name +"</label>";
  graphHtml = "<p id='topDescription'></p><br>";
  graphHtml +=  "<div id='mag'></div><br>";
  graphHtml += "<div id='phase'></div><br>";
  magDescs.push('The constant term is K= ~'+roundDecimal(constantK, 4).toString()+' = '+terms[0].magData[0][1].toString()+'dB = 20log10(|K|).');
  //1 description, 1 graph
  BDO.lastClickedTopBoxName = name;//1st box to be checked is the constant.
  magSeries.push({name: 'Constant ' + constantK.toString(),
  color: colors[colorIndex],data: constMag});
  phaseSeries.push({name: 'Constant ' + constantK.toString(),
  color: colors[colorIndex],data: constPhase});
  topMagSeries.push(copyObject(magSeries[magSeries.length-1]));
  topPhaseSeries.push(copyObject(phaseSeries[phaseSeries.length-1]));
  checkHtml += getBox(topMagSeries[topMagSeries.length-1].color, name)+"<br>";
  colorIndex++;
  desc += '<br><a href="https://lpsa.swarthmore.edu/Bode/BodeHow.html#A%20Constant%20Term">Details</a>';
  phaseDescs.push(desc);
  /*phaseDescription = document.getElementById('phaseDescription');
  phaseDescription.innerHTML = phaseDescs[0];//default is constantK
  document.getElementById('topDescription').insertAdjacentHTML('beforeend', '<br>'+phaseDescs[0]);*/
  BDO.termsLen = terms.length;
  iLen = BDO.termsLen;
  for (let i=1; i<iLen; i++) {
    if (terms[i].termType == "OriginZero") {
      [terms[i].magData, terms[i].phaseData] = originData(w, 1, i);
      terms[i].sign = 1;
      terms[i].magDataApprox = terms[i].magData;
      terms[i].phaseDataApprox = terms[i].phaseData;
      initMagSlope += 20*terms[i].mult;
      name = 'Zero at Origin';
      magSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].magData
      });
      phaseSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].phaseData
      });
      topMagSeries.push(copyObject(magSeries[magSeries.length-1]));
      topMagSeries[topMagSeries.length-1] = updateAlpha(topMagSeries[topMagSeries.length-1], faded);
      topPhaseSeries.push(copyObject(phaseSeries[phaseSeries.length-1]));
      topPhaseSeries[topPhaseSeries.length-1] = updateAlpha(topPhaseSeries[topPhaseSeries.length-1], faded);
      names.push(name);
      checkHtml+= "<input type='radio' id='"+name+"' onclick=\"onTopCheckOne(\'"+name+"\')\"></input>";
      checkHtml+="<label for='"+name+"'>Zero at Origin</label>"
      checkHtml += getBox(topMagSeries[topMagSeries.length-1].color, name)+"<br>";
      magDescs.push('The magnitude plot rises 20dB/decade and goes through 0 dB at 1 rad sec.<br>');
      colorIndex++;
      desc = 'The phase plot of a zero at the origin is a horizontal line at +90&deg;.';
      desc += '<br><a href="https://lpsa.swarthmore.edu/Bode/BodeHow.html#A%20Zero%20at%20the%20Origin">Details</a>';
      phaseDescs.push(desc);
      let exp = terms[i].mult.toString();
      magYIntFormula += ' - 20*'+ exp + ' dB';
      phaseYIntFormula += ' + 90*' + exp + ' dB';
      magYIntDesc += ' and a zero at the origin'+BDO.terms[i].mH.toString();
      //we can't have both a pole at origin & a zero at origin because 1 will cancel out the other
    }
    else if (terms[i].termType == "OriginPole") {
      [terms[i].magData, terms[i].phaseData] = originData(w, -1, i);
      terms[i].sign = -1;
      terms[i].magDataApprox = terms[i].magData;
      terms[i].phaseDataApprox = terms[i].phaseData;
      initMagSlope += -20*terms[i].mult;
      name = 'Pole at Origin';
      magSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].magData
      });
      phaseSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].phaseData
      });
      topMagSeries.push(copyObject(magSeries[magSeries.length-1]));
      topMagSeries[topMagSeries.length-1] = updateAlpha(topMagSeries[topMagSeries.length-1], faded);
      topPhaseSeries.push(copyObject(phaseSeries[phaseSeries.length-1]));
      topPhaseSeries[topPhaseSeries.length-1] = updateAlpha(topPhaseSeries[topPhaseSeries.length-1], faded);
      checkHtml+="<input type='radio' id='"+name+"' onclick=\"onTopCheckOne(\'"+name+"\')\"></input>";
      checkHtml+="<label for='"+name+"'>Pole at Origin</label>";
      checkHtml += getBox(topMagSeries[topMagSeries.length-1].color, name)+"<br>";
      desc = 'The magnitude plot drops 20dB/decade and goes through 0 dB at 1 rad sec.<br>';
      magDescs.push(desc);
      desc = 'The phase plot of a pole at the origin is a horizontal line at -90&deg;.';
      desc += '<br><a href="https://lpsa.swarthmore.edu/Bode/BodeHow.html#A%20Pole%20at%20the%20Origin">Details</a>';
      phaseDescs.push(desc);
      names.push(name);
      colorIndex++;
      let exp = terms[i].mult.toString()
      magYIntFormula += ' + 20*'+ exp + ' dB';
      phaseYIntFormula += ' - 90*' + exp + ' dB';
      magYIntDesc += ' and a pole at the origin'+BDO.terms[i].mH.toString();     
    }
    else if (terms[i].termType == "RealZero") {
      [terms[i].magData, terms[i].phaseData, terms[i].magDataApprox, terms[i].phaseDataApprox] = realData(w, 1, i);
      terms[i].sign = 1;
      name = 'Real Zero ' + terms[i].value + ' Approximation';
      magSeries.push({
        name: 'Real Zero ' + terms[i].value,
        color: colors[colorIndex],
        data: terms[i].magData
      });
      magSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].magDataApprox
      });
      phaseSeries.push({
        name: 'Real Zero ' + terms[i].value,
        color: colors[colorIndex],
        data: terms[i].phaseData
      });
      phaseSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].phaseDataApprox
      });
      topMagSeries.push(copyObject(magSeries[magSeries.length-1]));
      topMagSeries[topMagSeries.length-1] = updateAlpha(topMagSeries[topMagSeries.length-1], faded);
      topPhaseSeries.push(copyObject(phaseSeries[phaseSeries.length-1]));
      topPhaseSeries[topPhaseSeries.length-1] = updateAlpha(topPhaseSeries[topPhaseSeries.length-1], faded);
      names.push(name);
      w0Mag = BDO.terms[i].w0.toString();
      checkHtml+="<input type='radio' id='"+name+"' onclick=\"onTopCheckOne(\'"+name+"\')\"></input>";
      checkHtml+="<label for='"+name+"'>"+name+"</label>";
      checkHtml += getBox(topMagSeries[topMagSeries.length-1].color, name)+"<br>";
      desc = 'The real zero is at &omega; = &omega;<sub>0</sub> = '+w0Mag+' rad/sec.';
      desc+= ' For the magnitude plot we draw a straight line ';
      desc += 'at 0 dB from up to '+w0Mag+', thereafter the line rises at 20dB/decade.';
      magDescs.push(desc);
      desc = 'The phase plot is 0 up to &omega; = &omega;<sub>0</sub> = '+w0Mag+'/10,';
      desc += ' then drops to +90 at '+w0Mag+'*10 going through +45 at '+w0Mag + '.';
      desc+='<br><a href = "https://lpsa.swarthmore.edu/Bode/BodeHow.html#A%20Real%20Zero">Details</a>';
      phaseDescs.push(desc);
      termDesc = terms[i].desc;
      if (terms[i].mult > 1) {
        magRestDesc += '<li>Add 20*' +terms[i].mult.toString() + ' dB/decade to slope at &omega; = 1 due to '+termDesc+'.</li>';//+BDO.terms[i].magBreakpt.toString() + '<br>'; 
      }
      else {
        magRestDesc += '<li>Add 20 dB/decade to slope at &omega; = 1 due to '+termDesc+'.</li>';//+BDO.terms[i].magBreakpt.toString() + '<br>'; 
      }
      /*phaseRestDesc += 'Add '+terms[i].midPhaseSlope + ' dB/decade to slope at &omega; = '+terms[i].lowerBound;
      phaseRestDesc += ' and add '+ terms[i]finalPhaseSlope +' dB/decade to slope at &omega; = ' + terms[i].upperBound + ' due to '+termDesc+'.<br>';*/
      w1 = terms[i].lowerBound, w2 = terms[i].upperBound;
      yEnd = 90*terms[i].mult.toString();
      if (colorIndex == 1) {
        desc = '<sup>&dagger;</sup>';
      }
      else {
        desc = '';
      }
      phaseRestDesc += '<li>Add slope of line connecting ('+w1+', 0)'+desc+' and ('+w2+', '+yEnd+')';
      phaseRestDesc += ' to overall slope between &omega; = '+w1 + ' and &omega; = '+w2; 
      phaseRestDesc += ' and add '+ yEnd +' to the &omega; > ' + terms[i].upperBound + ' section due to '+termDesc+'.</li>';    
      colorIndex++;
    }
    else if (terms[i].termType == "RealPole") {
      [terms[i].magData, terms[i].phaseData, terms[i].magDataApprox, terms[i].phaseDataApprox] = realData(w, -1, i);
      terms[i].sign = -1;
      w0Mag = BDO.terms[i].w0.toString();
      name = 'Real Pole ' + terms[i].value + ' Approximation';
      magSeries.push({
        name: 'Real Pole ' + terms[i].value,
        color: colors[colorIndex],
        data: terms[i].magData
      });
      magSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].magDataApprox
      });
      phaseSeries.push({
        name: 'Real Pole ' + terms[i].value,
        color: colors[colorIndex],
        data: terms[i].phaseData
      });
      phaseSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].phaseDataApprox
      });
      topMagSeries.push(copyObject(magSeries[magSeries.length-1]));
      topMagSeries[topMagSeries.length-1] = updateAlpha(topMagSeries[topMagSeries.length-1], faded);
      topPhaseSeries.push(copyObject(phaseSeries[phaseSeries.length-1]));
      topPhaseSeries[topPhaseSeries.length-1] = updateAlpha(topPhaseSeries[topPhaseSeries.length-1], faded);
      names.push(name);
      checkHtml+="<input type='radio' id='"+name+"' onclick=\"onTopCheckOne(\'"+name+"\')\"></input>";
      checkHtml+="<label for='"+name+"'>"+name+"</label>";
      checkHtml += getBox(topMagSeries[topMagSeries.length-1].color, name)+"<br>";
      desc = 'The real pole is at &omega; = &omega;<sub>0</sub> = '+w0Mag+' rad/sec.';
      desc+= ' For the magnitude plot we draw a straight line ';
      desc += 'at 0 dB from up to '+w0Mag+', thereafter the line drops at 20dB/decade.';
      magDescs.push(desc);

      desc = 'The phase plot is 0 up to &omega; = &omega;<sub>0</sub> = '+w0Mag+'/10,';
      desc += ' then drops to -90 at '+w0Mag+'*10 going through -45 at '+w0Mag+'.';
      desc += '<br><a href = "https://lpsa.swarthmore.edu/Bode/BodeHow.html#A%20Real%20Pole">Details</a>';
      phaseDescs.push(desc);
      termDesc = terms[i].desc;
      if (terms[i].mult > 1) {
        magRestDesc += '<li>Add -20*' +terms[i].mult.toString() + ' dB/decade to slope at &omega; = 1 due to '+termDesc+'.</li>';//+BDO.terms[i].magBreakpt.toString() + '<br>'; 
      }
      else {
        magRestDesc += '<li>Add -20 dB/decade to slope at &omega; = 1 due to '+termDesc+'.</li>';//+BDO.terms[i].magBreakpt.toString() + '<br>'; 
      }    
      /*phaseRestDesc += 'Add '+terms[i].midPhaseSlope + ' dB/decade to slope at &omega; = '+terms[i].lowerBound;
      phaseRestDesc += ' and add '+ terms[i].midPhaseSlope +' dB/decade to slope at &omega; = ' + terms[i].upperBound + ' due to '+termDesc+'.<br>';    
      */
      if (colorIndex == 1) {
        desc = '<sup>&dagger;</sup>';
      }
      else {
        desc = '';
      }
      w1 = terms[i].lowerBound, w2 = terms[i].upperBound;
      yEnd = -90*terms[i].mult.toString();
      phaseRestDesc += '<li>Add slope of line connecting ('+w1+', 0)'+desc+' and ('+w2+', '+yEnd+')';
      phaseRestDesc += ' to overall slope between &omega; = '+w1 + ' and &omega; = '+w2; 
      phaseRestDesc += ' and add '+ yEnd +' to the &omega; > ' + terms[i].upperBound + ' section due to '+termDesc+'.</li>';    
      colorIndex++;
    }
    else if (terms[i].termType == "ComplexZero") {
      [terms[i].magData, terms[i].phaseData, terms[i].magDataApprox, terms[i].phaseDataApprox] = compConjugateData(w, 1, i);
      terms[i].sign = 1;
      [print, print2] = compToStr(terms[i].value);
      name = 'Complex Zero ' + print2 + ' Approximation';
      magSeries.push({
        name: 'Complex Zero ' + print,
        color: colors[colorIndex],
        data: terms[i].magData
      });
      magSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].magDataApprox
      });
      phaseSeries.push({
        name: 'Complex Zero ' + print,
        color: colors[colorIndex],
        data: terms[i].phaseData
      });
      phaseSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].phaseDataApprox
      });
      topMagSeries.push(copyObject(magSeries[magSeries.length-1]));
      topMagSeries[topMagSeries.length-1] = updateAlpha(topMagSeries[topMagSeries.length-1], faded);
      topPhaseSeries.push(copyObject(phaseSeries[phaseSeries.length-1]));
      topPhaseSeries[topPhaseSeries.length-1] = updateAlpha(topPhaseSeries[topPhaseSeries.length-1], faded);
      w0Mag = BDO.terms[i].w0.toString();
      zMag = zBDO.terms[i].zeta.toString();
      checkHtml+="<input type='radio' id='"+name+"' onclick=\"onTopCheckOne(\'"+name+"\')\"></input>";
      checkHtml+="<label for='"+name+"'>"+name+"</label>";
      checkHtml += getBox(topMagSeries[topMagSeries.length-1].color, name)+"<br>";
      desc = 'For the magnitude plot we draw a straight line at 0 dB from up to '+w0Mag+', thereafter the line rises at 40dB/decade.';
      if (parseFloat(zMag) < 0.5) {
        desc += '<br>Since '+zMag+'<0.5, we draw a peak of 20log<sub>10</sub>(2&zeta;) = ';
        desc += (20*Math.log10(2*parseFloat(zMag,10))).toString()+'db at &omega; = '+w0Mag+'.';
      }
      magDescs.push(desc);

      desc = 'The phase plot is 0 up to '+w0Mag+'/10<sup>'+zMag+'</sup, ';
      desc += 'then climbs to 180 at '+w0Mag+'*10<sup>'+zMag+'</sup> going through 90 at '+w0Mag+'.';
      desc += '<br><a href="https://lpsa.swarthmore.edu/Bode/BodeHow.html#A%20Complex%20Conjugate%20Pair%20of%20Zeros">Details</a>';
      phaseDescs.push(desc);
      names.push(name);
      termDesc = terms[i].desc;
      if (terms[i].mult > 1) {
        magRestDesc += '<li>Add 40*' +terms[i].mult.toString() + ' dB/decade to slope at &omega; = 1 due to '+termDesc+'</li>';//+BDO.terms[i].magBreakpt.toString() + '<br>'; 
      }
      else {
        magRestDesc += '<li>Add 40 dB/decade to slope at &omega; = 1 due to '+termDesc+'</li>';//+BDO.terms[i].magBreakpt.toString() + '<br>'; 
      }
      /*phaseRestDesc += 'Add '+terms[i].midPhaseSlope + ' dB/decade to slope at &omega; = '+terms[i].lowerBound;
      phaseRestDesc += ' and add '+ terms[i].midPhaseSlope +' dB/decade to slope at &omega; = ' + terms[i].upperBound + ' due to '+termDesc+'<br>';    
      */
      if (colorIndex == 1) {
        desc = '<sup>&dagger;</sup>';
      }
      else {
        desc = '';
      }
      w1 = terms[i].lowerBound, w2 = terms[i].upperBound;
      yEnd = 180*terms[i].mult.toString();
      phaseRestDesc += '<li>Add slope of line connecting ('+w1+', 0) and ('+w2+', '+yEnd+')';
      phaseRestDesc += ' to overall slope between &omega; = '+w1 + ' and &omega; = '+w2; 
      phaseRestDesc += ' and add '+ yEnd +' to the &omega; > ' + terms[i].upperBound + ' section due to '+termDesc+'.</li>';
      colorIndex++;
    }
    else if (terms[i].termType == "ComplexPole") {
      [terms[i].magData, terms[i].phaseData, terms[i].magDataApprox, terms[i].phaseDataApprox] = compConjugateData(w, -1, i);
      terms[i].sign = -1;
      [print, print2] = compToStr(terms[i].value);
      name = 'Complex Pole ' + print2 + ' Approximation';
      magSeries.push({
        name: 'Complex Pole ' + print,
        color: colors[colorIndex],
        data: terms[i].magData
      });
      magSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].magDataApprox
      });
      phaseSeries.push({
        name: 'Complex Pole ' + print,
        color: colors[colorIndex],
        data: terms[i].phaseData
      });
      phaseSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].phaseDataApprox
      });
      topMagSeries.push(copyObject(magSeries[magSeries.length-1]));
      topMagSeries[topMagSeries.length-1] = updateAlpha(topMagSeries[topMagSeries.length-1], faded);
      topPhaseSeries.push(copyObject(phaseSeries[phaseSeries.length-1]));
      topPhaseSeries[topPhaseSeries.length-1] = updateAlpha(topPhaseSeries[topPhaseSeries.length-1], faded);
      w0Mag = BDO.terms[i].w0.toString();
      zMag = BDO.terms[i].zeta.toString();
      checkHtml+="<input type='radio' id='"+name+"' onclick=\"onTopCheckOne(\'"+name+"\')\"></input>";
      checkHtml+="<label for='"+name+"'>"+name+"</label>";
      checkHtml += getBox(topMagSeries[topMagSeries.length-1].color, name)+"<br>";
      desc = 'For the magnitude plot we draw a straight line at 0 dB from up to '
      desc += w0Mag+', thereafter the line drops at 40dB/decade.';
      if (zMag < 0.5) {
        desc+= '<br>Since '+zMag+'<0.5, we draw a peak of -20log<sub>10</sub>(2&zeta;) = ';
        desc += (-20*Math.log10(2*parseFloat(zMag,10))).toString()+'db at &omega; = '+w0Mag;
      }
      magDescs.push(desc);
      desc = 'The phase plot is 0 up to '+w0Mag+'/10<sup>'+zMag+'</sup, ';
      desc += 'then climbs to 180 at '+w0Mag+'*10<sup>'+zMag+'</sup> going through 90 at '+w0Mag+'.';
      desc += '<br><a href="https://lpsa.swarthmore.edu/Bode/BodeHow.html#A%20Complex%20Conjugate%20Pair%20of%20Zeros">Details</a>';
      phaseDescs.push(desc);
      names.push(name);
      termDesc = terms[i].desc;
      if (terms[i].mult > 1) {
        magRestDesc += '<li>Add -40*' +terms[i].mult.toString() + ' dB/decade to slope at &omega; = 1 due to '+termDesc+'.</li>';//+BDO.terms[i].magBreakpt.toString() + '<br>'; 
      }
      else {
        magRestDesc += '<li>Add -40 dB/decade to slope at &omega; = 1 due to '+termDesc+'.</li>';//+BDO.terms[i].magBreakpt.toString() + '<br>'; 
      }
      /*phaseRestDesc += 'Add '+terms[i].midPhaseSlope + ' dB/decade to slope at &omega; = '+terms[i].lowerBound;
      phaseRestDesc += ' and add '+ terms[i].midPhaseSlope +' dB/decade to slope at &omega; = ' + terms[i].upperBound + ' due to '+termDesc+'<br>';    
    */
      if (colorIndex == 1) {
        desc = '<sup>&dagger;</sup>';
      }
      else {
        desc = '';
      }
      w1 = terms[i].lowerBound, w2 = terms[i].upperBound;
      yEnd = -180*terms[i].mult.toString();
      phaseRestDesc += '<li>Add slope of line connecting ('+w1+', 0) and ('+w2+', '+yEnd+')';
      phaseRestDesc += ' to overall slope between &omega; = '+w1 + ' and &omega; = '+w2; 
      phaseRestDesc += ' and add '+ yEnd +' to the &omega; > ' + terms[i].upperBound + ' section due to '+termDesc+'.</li>';
      colorIndex++;
    }
  }
  [BDO.allMag, BDO.allPhase, BDO.allMagApprox, BDO.allPhaseApprox] = allData(w, terms);
  magSeries.push({
    name: 'Total Magnitude',
    color: blackRGBA,//I like black. colors[colorIndex],
    data: BDO.allMag, 
    dashStyle: 'Solid' 
  });
  magSeries.push({
    name: 'Total Magnitude Approximation',
    color: blackRGBA,
    data: BDO.allMagApprox,
    dashStyle: 'shortdot'
  });
  phaseSeries.push({
    name: 'Total Phase',
    color: blackRGBA,
    data: BDO.allPhase,
    dashStyle: 'Solid' 
  });
  phaseSeries.push({
    name: 'Total Phase Approximation',
    color: blackRGBA,
    data: BDO.allPhaseApprox,
    dashStyle: 'shortdot'
  });
  togetherMagSeries = copyObject(topMagSeries);
  togetherMagSeries.push(copyObject(magSeries[magSeries.length-2]));
  togetherMagSeries.push(copyObject(magSeries[magSeries.length-1]));
  togetherMagSeries[0] = updateAlpha(togetherMagSeries[0], faded);
  togetherPhaseSeries = copyObject(topPhaseSeries);
  togetherPhaseSeries.push(copyObject(phaseSeries[phaseSeries.length-2]));
  togetherPhaseSeries.push(copyObject(phaseSeries[phaseSeries.length-1]));
  togetherPhaseSeries[0] = updateAlpha(togetherPhaseSeries[0], faded);
  let lastMag = togetherMagSeries.length-1, lastPhase = togetherPhaseSeries.length-1;
  togetherPhaseSeries[lastPhase].dashStyle = 'Solid';
  togetherPhaseSeries.splice(lastPhase-1, 1);//remove total exact.
  togetherMagSeries[lastMag].dashStyle = 'Solid';
  togetherMagSeries.splice(lastMag-1, 1);//remove total exact.
  let togetherMagHtml = magYIntDesc+ " then the magnitude y-intercept is " + magYIntFormula;
  togetherMagHtml += " and the initial slope is "+initMagSlope.toString() + "dB per decade.";
  togetherMagHtml += "<ul>"+magRestDesc+"</ul>";
  let togetherPhaseHtml = magYIntDesc+" then the phase y-intercept is "+phaseYIntFormula+".<ul>"+phaseRestDesc+".</ul><br><small><sup>&dagger;</sup>(&omega; , &theta;)</small>";
  //togetherHtml += 'with a slope of '+ BDO.startslope + 'dB per decade.';
  //DO this tomorrow. slope will be 0 + -20dB/decade*mult + 20dB/decade*mult (I think)
  //need to add starting slop eright after magYIntDesc.
  colorIndex++;
  //graphCheck = document.getElementById('graphOptions');
  //graphs = document.getElementById('graphs');
  document.getElementById('graphOptions').innerHTML = checkHtml;
  document.getElementById('graphs').innerHTML = graphHtml;
  document.getElementById('togetherMagDesc').innerHTML = togetherMagHtml;
  document.getElementById('togetherPhaseDesc').innerHTML = togetherPhaseHtml;
  document.getElementById('topDescription').innerHTML = magDescs[0]+'<br>'+phaseDescs[0];
  let xAxis = '&omega;, rad/S';
  let yAxisMag = '|H(j&omega;)|, dB';
  let yAxisPhase = '&ang;H(j&omega;), &deg;';
  // highchartsPlot(series, id, title, xAxis, yAxis, logOrLinear, tickInt) {
  //highchartsPlot(magSeries, 'bode', 'Magnitude Plot', xAxis, yAxisMag);
  //highchartsPlot(phaseSeries, 'bodePhase', 'Phase Plot', xAxis, yAxisPhase, 'logarithmic', 90);
  BDO.individualMagChart = highchartsPlot(topMagSeries, 'mag', '<b>Magnitude Plot</b>', xAxis, yAxisMag);
  BDO.individualPhaseChart = highchartsPlot(topPhaseSeries, 'phase', '<b>Phase Plot</b>', xAxis, yAxisPhase, 'logarithmic', 90);
  highchartsPlot(togetherMagSeries, 'togetherMagPlot', '<b>Magnitude Plot</b>', xAxis, yAxisMag);
  highchartsPlot(togetherPhaseSeries, 'togetherPhasePlot', '<b>Phase Plot</b>', xAxis, yAxisPhase, 'logarithmic', 90);

  BDO.magSeries = magSeries;
  BDO.phaseSeries = phaseSeries;
  BDO.topMagSeries = topMagSeries;
  BDO.topPhaseSeries = topPhaseSeries;
  BDO.magDescs = magDescs;
  BDO.phaseDescs = phaseDescs;
  BDO.namesOfIds = names;
  BDO.omega = document.querySelector('#freqInput');
  BDO.phi = document.querySelector('#phaseInput');
  /*BDO.sinusoidInput = document.getElementById('sinusoidInput');
  BDO.omega.addEventListener('#magInput', updateSinusoidInput);
  BDO.phi.addEventListener('#phaseInput', updateSinusoidInput2);*/
  //only want to plot constant by default on top graph.
  //highchartsPlot(magSeries, 'mag', 'Magnitude Plot', 'Magnitude dB');
}
function setEventListeners() {
  const freqSource = document.getElementById('freqInput');
  const phaseSource = document.getElementById('phaseInput');
  freqSource.addEventListener('input', freqInputHandler);
  freqSource.addEventListener('propertychange', freqInputHandler);
  phaseSource.addEventListener('input', phaseInputHandler);
  phaseSource.addEventListener('propertychange', phaseInputHandler);
}
//call when input Magnitude or phase changes.
function freqInputHandler(e) {
  let omega = e.target.value;
  let phi = document.getElementById('phaseInput').value;
  document.getElementById('sinusoidInput').textContent = 'cos('+omega+'t + '+phi+')';
}
function phaseInputHandler(e) {
  let omega = document.getElementById('freqInput').value;
  let phi = e.target.value;
  document.getElementById('sinusoidInput').textContent = 'cos('+omega+'t + '+phi+')';
}
function graphSinusoid() {
  let start = new Date().getTime();
  let wIndex, mag, phase, html, theta, phi = parseFloat(BDO.phi.value), omega = parseFloat(BDO.omega.value);
  let inputData = [], outputData = [], t = [], series, period, tMax, tInterval, tCount, tLen, ptNum;//wish I had malloc.
  //phi is input; theta is phase outputted from function, & phae is phi+theta
  //if within confines of input & not more than 1 decimal place, then just use the data we made.
  if (isNaN(omega) || isNaN(phi) || omega <= 0) {
    alert('You must specify a value for frequency and phase. The frequency must be positive.');
    return;
  }
  if (omega <= BDO.w[BDO.wLen-1] && (omega*10) == Math.round(omega*10)) {
    wIndex = BDO.w.indexOf(roundDecimal(omega, 1));
    mag = BDO.allMag[wIndex][1].toString();
    theta = BDO.allPhase[wIndex][1];
    phase = theta + phi;
    if (phase > 0) {
      html = mag+'cos('+BDO.omega.value+'t + '+phase.toString()+')';
    }
    else {
      html = mag+'cos('+BDO.omega.value+'t - '+Math.abs(phase).toString()+')';
    }
  }
  else {
    [html, mag, phase] = getSinusoid(omega, phi);
  }
  document.getElementById('sinusoidOutput').innerHTML = html;
  period = 2*Math.PI/omega;//period is reciprocal of frequency.
  //desmos api would look better for this.
  tMax = Math.ceil(period*3);
  ptNum = 1000;
  tInterval = truncDecimal(tMax/ptNum, 10);
  tCount = 0;
  //while(tCount<tMax) {
  for (let i=0; i<ptNum; i++) {
    tCount = truncDecimal(tCount + tInterval, 10);
    t.push(tCount);
  }
  tLen = t.length;
  for (let i=0; i<tLen; i++) {
    inputData.push([t[i], Math.cos(omega*t[i] + phi)]);
    outputData.push([t[i], mag*Math.cos(omega*t[i] + phase)]);
  }//function highchartsPlot(series, id, title, xAxis, yAxis, logOrLinear, tickInt) 
  series = [{
    name: 'Input',
    color: 'rgba(240, 52, 52, 1)',
    data: inputData
  }, {
    name: 'Output',
    color: 'rgba(0, 0, 0, 1)',
    data: outputData
  }];
  let chart = BDO.sinusoidChart;
  if (chart) {//already made
    chart.update({series: series});
  }
  else {
    BDO.sinusoidChart = highchartsPlot(series, 'sinusoidPlot', '<b>Sinusoids</b>', 'Time', 'Dependent Variable', 'linear');
  }
  console.log((new Date().getTime() - start.toString()) + 'ms');
}
//called when one of the checkboxes is checked.
function onTopCheckOne(name) {
  let lName = BDO.lastClickedTopBoxName;
  if (lName == name) {//make sure you didn't accidentally double click.
    document.getElementById(lName).checked = 1;
  }
  else {
    document.getElementById(lName).checked = 0;
    onGraphPress();
    BDO.lastClickedTopBoxName = name;
  }
}
//input series item, returns series item w/ updated alpha in color: 'rgba(0, 0, 0, 1)'
function updateAlpha(item, alpha) {
  let rgba = item.color;
  let alphaStart = rgba.lastIndexOf(',');
  rgba = rgba.slice(0, alphaStart+1) + alpha + ')';
  item.color = rgba;
  return item;
}
function onGraphPress () {//1st try w/ zero at origin, p at origin.
  //order is consT, zOrigin, pOrigin, zReal, pReal, (might be > 1), zComp, pComp
  //might set array to track # left behind. use name to find stuff.
  let start = new Date().getTime();//1553 ms.
  const names = BDO.namesOfIds;
  var series = BDO.topMagSeries, series2 = BDO.topPhaseSeries, magDescs = BDO.magDescs, phaseDescs = BDO.phaseDescs;
  var magDescShown, phaseDescShown, bold = BDO.bold, faded = BDO.faded, xAxis, iLen, jLen;
  iLen = names.length;
  jLen = series.length;
  for (let i=0; i<iLen; i++) {
    if (document.getElementById(names[i]).checked) {
      for (let j=0; j<jLen; j++) {
        if (series[j].name == names[i]) {//find the dictionary of data with the right name
          series[j] = updateAlpha(series[j], bold);
          series2[j] = updateAlpha(series2[j], bold);
          magDescShown = magDescs[j];//descriptions correspond to names.
          phaseDescShown = phaseDescs[j];
          updateBox(series[j].color, names[i]+" box");//series[j].name also works.
        }
        else if (series[j].name == BDO.lastClickedTopBoxName) {
          series[j] = updateAlpha(series[j], faded);
          series2[j] = updateAlpha(series2[j], faded);
          updateBox(series[j].color, series[j].name+" box");
        }
      }
      break;
    }
  }
  //plots the series with the ones not selected faded.
  // highchartsPlot(series, id, title, xAxis, yAxis, logOrLinear, tickInt) {
  xAxis = '&omega;, rad/S';
  
  //highchartsPlot(series, 'mag', '<b>Magnitude Plot</b>', xAxis, 'Magnitude dB');
  //highchartsPlot(series2, 'phase', '<b>Phase Plot</b>', xAxis, 'Phase in Degrees', 'logarithmic', 90);
  BDO.individualMagChart.update({series: series});
  BDO.individualPhaseChart.update({series: series2});
  document.getElementById('topDescription').innerHTML = magDescShown+'<br>'+phaseDescShown;
  console.log((new Date().getTime() - start).toString() + ' ms');
}
//function rounds a number to a decimal # of decimal places.
function roundDecimal (num, decimal) {
  var a = Math.pow(10, decimal);
  return (Math.round(num*a)/a);
}
function truncDecimal (num, decimal) {
  var a = Math.pow(10, decimal);
  return (Math.trunc(num*a)/a);
}
//returns number of decimals in a number.
function decimalNum (num) {
  let decimals = 0;
  while (num % 10) {
    num = num / 10;
    decimals++;
  }
  return decimals;
}
function rad2Degrees(rad) {//converts radians to degrees.
  return (rad/Math.PI)*180;
}
function getZeta (img, real) {
  var temp = Math.atan2(img, real);//y, x -> y/x, opposite/ajdacent
  return Math.cos(temp);
}
//turns an object of {re: 'a', im: 'b'} into 'a+bi'
//this one assumes we are only making one graph for a pair of complex conjugates
function compToStr(comp) {
  let print, print2;
  let imagPart = parseFloat(comp.im);
  if (imagPart == -1.00 || imagPart == 1.00) {
    print = comp.re + ' &plusmn; i ';
    print2 = comp.re + ' +/- i ';
  }
  else if (imagPart == parseInt(comp.im)){
    imagPart = Math.abs(parseInt(comp.im)).toString();
    print = comp.re + ' &plusmn; ' + imagPart + 'i';
    print2 = comp.re + ' +/- ' + imagPart + 'i';
  }
  else {
    imagPart = Math.abs(imagPart).toString();
    print = comp.re + ' &plusmn; ' + imagPart + 'i';
    print2 = comp.re + ' +/- ' + imagPart + 'i';
  }
  return [print, print2];
}
function originData(w, sign, termIndex) {
  let magData = [], phaseData = [], exp = BDO.terms[termIndex].mult, wLen = BDO.wLen;
  for (let i=0; i<wLen; i++) {
    magData.push([w[i], 20*exp*sign*Math.log10(w[i])]);
    phaseData.push([w[i], sign*exp*90]);
  }
  exp = exp.toString();
  if (sign > 0) {
    sign = '+';
  }
  else {
    sign = '-';
  }
  BDO.magFormula += ('<br>'+sign +' 20*'+exp+'*log<sub>10</sub>(&omega;) ');
  BDO.phaseFormula += ('<br>'+sign +' '+exp+'*90 ');
  return [magData, phaseData];
}
function realData (w, sign, termIndex) {
  let w0 = Math.abs(parseFloat(BDO.terms[termIndex].value));//w0, abs of a zero.
  BDO.terms[termIndex].w0 = w0;
  let magApproxData = [], phaseApproxData = [], magExactData = [], phaseExactData = [], wLen = BDO.wLen;
  let exp = BDO.terms[termIndex].mult, lowerBound = 0.1*w0, upperBound = 10*w0,
  middleDenominator = Math.log10(upperBound/lowerBound), theta, x;
  BDO.terms[termIndex].midPhaseSlope = '90*'+exp.toString()+'/'+middleDenominator.toString();//how to calculate? want a per-decade measurement.
  BDO.terms[termIndex].endPhaseSlope = '90*'+exp.toString();
  BDO.terms[termIndex].upperBound = upperBound.toString();
  BDO.terms[termIndex].lowerBound = lowerBound.toString();
  for (let j=0; j<wLen; j++) {
    //approximate fequency:
    x = w[j]/w0;
    if (w[j]<= w0) {
      magApproxData.push([w[j], 0]);
    }
    else if (w[j]>w0) {
      magApproxData.push([w[j], sign*20*exp*Math.log10(x)]);
    }
    BDO.terms[termIndex].magBreakpt = w0;
    BDO.terms[termIndex].magSlope = sign*20*exp;
    //exact Magnitude
    magExactData.push([w[j], sign*20*exp*Math.log10(Math.pow((1 + x*x), 0.5))]);
    //phase approximation
    if (w[j]<lowerBound) {
        phaseApproxData.push([w[j], 0]);
    }
    else if (w[j]>upperBound) {
      phaseApproxData.push([w[j], sign*exp*90]);
    }
    else {
      theta = (Math.log10(w[j]/lowerBound)/middleDenominator)*sign*exp*90;
      //y = m(Math.log10(w[j])-Math.log10(lowerBound)), m = sign*exp*90/middleDenominator
      //middleDenominator = Math.log10(upperBound/lowerBound)
      // y = m (log10(w/lowerBound)/(log10(upperBound/lowerBound)))
      //log10(w/x)log10(x/y)
      phaseApproxData.push([w[j], theta]);
    }
    //exact
    theta = rad2Degrees(sign*exp*Math.atan2(w[j], w0));
    phaseExactData.push([w[j], theta]);
  }
  exp = exp.toString();
  w0 = w0.toString();
  lowerBound = lowerBound.toString();
  upperBound = upperBound.toString();
  middleDenominator = middleDenominator.toString();
  if (sign > 0) {
    sign = '+';
  }
  else {
    sign = '-';
  }
  BDO.magFormula += ('<br>+ {&omega;<='+w0+':0, &omega;>&omega;<sub>0</sub>:'+sign+exp+'*20log<sub>10</sub>(&omega;)} ');
  BDO.phaseFormula += '<br>+ {&omega;<'+lowerBound+':0, '+'&omega;>'+upperBound+': '+sign+exp+'90, ';
  BDO.phaseFormula += lowerBound+'<&omega;<'+upperBound+': '+sign+exp+'*90log<sub>10</sub>(&omega;/'+lowerBound +')';
  BDO.phaseFormula += '/'+middleDenominator+'} ';
  //might do together description here instead. might be faster. 
  return [magExactData, phaseExactData, magApproxData, phaseApproxData];
}
function compConjugateData(w, sign, termIndex) {
  let realPart = parseFloat(BDO.terms[termIndex].value.re);
  let imagPart = parseFloat(BDO.terms[termIndex].value.im);
  let w0 = Math.sqrt(realPart*realPart + imagPart*imagPart);
  BDO.terms[termIndex].w0 = w0;
  let w0Rounded = roundDecimal(w0, 1);//round to 1 decimal place.
  let magApproxData = [], phaseApproxData = [], magExactData = [], phaseExactData = [];
  let exp = BDO.terms[termIndex].mult, zetaTemp = zeta(BDO.terms[termIndex].value),
  jMax = BDO.wLen, x, base, peak, lowerBound, upperBound,
  middleDenominator, a, b, theta, breakW = 1;
  BDO.terms[termIndex].zeta = zetaTemp;
  BDO.terms[termIndex].magBreakpt = 1;
  BDO.terms[termIndex].magSlope = sign*20*exp;
  if (zetaTemp < 0) {
    alert('A negative damping ratio is not permitted');
  }
  //approximate Magnitude:
  if (zetaTemp < 0.5) {
    for (let j=0; j<jMax; j++) {
      x = w[j];
      if (w[j] < breakW) {//for phase w[j] <= w0/(Math.pow(10, zeta))) {
        magApproxData.push([w[j], 0]);
      }//was w0Rounded.
      else if (w[j] > breakW && w[j] != breakW) { //might change to if so they will connect?
        magApproxData.push([w[j], sign*40*exp*Math.log10(x)]);//-w0Rounded+1)]);
      }//w0Rounded pushes the asymptote so it is more in sync w/ exact function.
      else if (w[j] == breakW) {//might ask prof cheever about his peak at some point.
        base = sign*40*exp*Math.log10(x);
        peak = 20*Math.abs(Math.log10(2*Math.abs(zetaTemp)))*Math.sign(base);
        magApproxData.push([w[j], base+peak]);
      }
    }
  }
  else if (zetaTemp >= 0.5) {//don't draw peak. it would seem like in this case w[0] doesn't matter.
    for (let j=0; j<jMax; j++) {
      x = w[j];
      if (w[j] <= breakW) {// w0Rounded for phase w[j] <= w0/(Math.pow(10, zeta))) {
        magApproxData.push([w[j], 0]);
      }
      else if (w[j] > breakW) {//w0Rounded vs 1
        magApproxData.push([w[j], sign*40*exp*Math.log10(x)]);
      }
    }
  }
  //exact Magnitude version starts here:
  //a + jb, a = 1-(w/w0)^2 b = 2*zeta*w/(w0) w[j]. 20*log10(|a+jb|)
  for (let j=0; j<jMax; j++) {//should we have included this in both the other for loops or had there be only one?
    realPart = 1-Math.pow((w[j]/w0), 2);
    imagPart = 2*zetaTemp*(w[j]/w0);//also j, j^2 = -1
    //+ works, - doesn't.
    x = Math.sqrt(realPart*realPart+imagPart*imagPart);//magnitude |a+jb|
    magExactData.push([w[j], sign*20*exp*Math.log10(x)]);
    //approx & exact are closer when both 20 or 40.
  }
  lowerBound = w0/(Math.pow(10, Math.abs(zetaTemp)));////(x,y) = (lowerBound, 0)
  upperBound = w0*Math.pow(10, Math.abs(zetaTemp));//(x,y) = (upperBound, sign*180)
  middleDenominator = Math.log10(upperBound/lowerBound);
  BDO.terms[termIndex].midPhaseSlope = '180*'+exp.toString()+'/'+middleDenominator.toString();//how to calculate? want a per-decade measurement.
  BDO.terms[termIndex].endPhaseSlope = '180*'+exp.toString();
  BDO.terms[termIndex].upperBound = upperBound.toString();
  BDO.terms[termIndex].lowerBound = lowerBound.toString();
  //phase approximation
  for (let j=0; j<jMax; j++) {
    x = w[j];
    //lower & upper boundarises of line in x coordinates
    if (w[j] <= lowerBound+0.1) {//for phase w[j] <= w0/(Math.pow(10, zeta))) {
      phaseApproxData.push([w[j], 0]);
    }
    else if (w[j] > upperBound) {
      phaseApproxData.push([w[j], sign*exp*180]);
    }
    else {
      theta = (Math.log10(w[j]/lowerBound)/middleDenominator)*sign*exp*180;
      phaseApproxData.push([w[j], theta]);
    }
  }
  //exact phase version starts here:
  //a + jb, a = 1-(w/w0)^2 b = 2*zeta*w/(w0) w[j]. 20*log10(|a+jb|)
  for (let j=0; j<jMax; j++) {//should we have included this in both the other for loops or had there be only one?
    a = w[j]/w0;
    b = 1-a*a;
    x = (2*zetaTemp*a)/b;//magnitude |a+jb|
    //ends up being arctan(img/real)
    //should Math.abs() be necessary here, or are we doing somehting else wrong?
    phaseExactData.push([w[j], sign*exp*Math.abs(rad2Degrees(Math.atan2(2*zetaTemp*a, b)))]);//vs Math.atan2(x)
    //we need rad2Degrees bc graph is in degrees & Math.atan2() returns radians.
  }
  exp = exp.toString();
  w0 = w0.toString();
  lowerBound = lowerBound.toString();
  upperBound = upperBound.toString();
  middleDenominator = middleDenominator.toString();
  if (sign > 0) {
    sign = '+';
  }
  else {
    sign = '-';
  }
  BDO.magFormula += '<br>+ {&omega;<'+w0Rounded+':0, &omega;>&omega;<sub>0</sub>: '+sign+exp+'*40log<sub>10</sub>(&omega;-'+w0Rounded+'+1)';
  if (zetaTemp < 0.5) {
    BDO.magFormula += ', &omega;='+w0Rounded+': ' +sign+exp+'40*log<sub>10</sub>(&omega;) '+sign+' 20*log<sub>10</sub>(2*&zeta;)} ';
  }
  else {
    BDO.magFormula += '} ';
  }
  BDO.phaseFormula += '<br>+ {&omega;<'+lowerBound+':0, '+'&omega;>'+upperBound+': '+sign+exp+'90, ';
  BDO.phaseFormula += lowerBound+'<&omega;<'+upperBound+': '+sign+exp+'*90log<sub>10</sub>(&omega;/'+lowerBound +')';
  BDO.phaseFormula += '/'+middleDenominator+'} ';
  //}//there is no way the exact way can be this easy.
  return [magExactData, phaseExactData, magApproxData, phaseApproxData];
}
//finds summary of data:
function allData(w, terms) {
  let magApproxData = copyObject(terms[0].magDataApprox),
  phaseApproxData = copyObject(terms[0].phaseDataApprox),
  magExactData = copyObject(terms[0].magData),
  phaseExactData = copyObject(terms[0].phaseData), wLen = BDO.wLen, iLen = BDO.termsLen;
  for (let i=1; i<iLen; i++) {
    for (let j=0; j<wLen; j++) {
      magExactData[j] = [w[j], magExactData[j][1]+terms[i].magData[j][1]];
      magApproxData[j] = [w[j], magApproxData[j][1]+terms[i].magDataApprox[j][1]];
      phaseExactData[j] = [w[j], phaseExactData[j][1]+terms[i].phaseData[j][1]];
      phaseApproxData[j] = [w[j], phaseApproxData[j][1]+terms[i].phaseDataApprox[j][1]];
    }
  }
  return [magExactData, phaseExactData, magApproxData, phaseApproxData];
}// [BDO.allMag, BDO.allPhase, BDO.allMagApprox, BDO.allPhaseApprox]

function copyObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}
//returns html for box of rgba colors.
function getBox(rgba, name) {
  let id = name + " box";
  let box = "<div id='"+id+"' style='width:10px; height:10px; margin:5px; ";
  box += "background-color:"+rgba+"; display:inline-block;'></div>";
  return box;
}
//updates the background color of box w/ id boxId 
function updateBox(rgba, boxId) {
  document.getElementById(boxId).style.backgroundColor = rgba;
}
//uses data to get exact sinusoid. 
function getSinusoid(omega, phi) {
  let terms = BDO.terms, phase, sign, exp, w0, x, a, b, realPart, imagPart, zetaTemp;
  let mag = terms[0].magData[0][1];//add constant.;
  let theta = terms[0].phaseData[0][1];//add constant.
  let iLen = BDO.termsLen;
  for (let i=1; i<iLen; i++) {
    sign = terms[i].sign;
    exp = terms[i].mult;
    w0 = terms[i].w0;
    zetaTemp = terms[i].zeta;
    if (terms[i].termType.indexOf('Origin') > -1) {
      mag += 20*exp*sign*Math.log10(omega);
      theta += sign*exp*90;
    }
    else if (terms[i].termType.indexOf('Real') > -1) {
      mag +=  sign*20*exp*Math.log10(Math.pow((1 + omega*omega), 0.5));
      theta += rad2Degrees(sign*exp*Math.atan2(omega, w0));
    }
    else if (terms[i].termType.indexOf('Complex') > -1) {
      realPart = 1-Math.pow(omega/w0, 2);
      imagPart = 2*zetaTemp*(omega/w0);//also j, j^2 = -1
      x = Math.sqrt(realPart*realPart+imagPart*imagPart);//magnitude |a+jb|
      mag += sign*20*exp*Math.log10(x);
      a = omega/w0;
      b = 1-a*a;
      x = (2*zetaTemp*a)/b;//magnitude |a+jb|
      //should Math.abs() be necessary here, or are we doing somehting else wrong?
      theta += sign*exp*Math.abs(rad2Degrees(Math.atan2(2*zetaTemp*a, b)));
    }
  }
  phase = phi+theta;
  return [mag.toString()+'cos('+omega.toString()+' '+phase.toString()+')', mag, phase];
}

/* This function creates all the TeX and html for displaying the equations.
 */
function dispTerms() {
  let dS1 = ''; // Denominator String, form 1
  let dS2 = ''; // Denominator String, form 2
  let nS1 = ''; // Numerator String, form 1
  let nS2 = ''; // Numerator String, form 2
  let cdS = ''; // This is the denominator the term C multiplied by zeros, divided by oles.
  let cnS = '';
  let oS = ''; // String for origin poles and zeros
  let lS = `<blockquote><p class="noindent">With:</p><ul style="margin-left:3em">
    <li>Constant: C=${BDO.C}</li>`;
  let lSHtml = '<blockquote><p class="noindent">With:</p><ul style="margin-left:3em"> <li>Constant: C='+BDO.C.toString()+'</li>';
  let K = BDO.C; // We'll calculate K as we go.
  let pt = [0, 1, 2, 3, 4, 5], exp;
  //tHw & tHz instead of tXw & tXz
  //t1H & t2H 
  for (let i = 1; i < BDO.numTerms; i++) {
      if (BDO.terms[i].termType == 'RealPole') {
          lS = `${lS}<li>A real pole at s=${BDO.terms[i].value}${BDO.terms[i].mH}.<br />
          This is the ${BDO.terms[i].t1X} term in the denominator, with 
          ${BDO.terms[i].tXw}=${-BDO.terms[i].value}.</li>`;
          //-1.00 w/ multiplicity 2. 
          pt[0] = BDO.terms[i].value.toString()+BDO.terms[i].mH.toString();
          pt[1] = BDO.terms[i].t1H.toString();
          pt[2] = BDO.terms[i].tHw.toString();
          pt[3] = -BDO.terms[i].value.toString();
          lSHtml += '<li>A real pole at s='+pt[0]+'.<br /> This is the '+pt[1]+' term in the denominator, with '+pt[2]+'='+pt[3]+'.</li>';
          BDO.terms[i].desc = 'a real pole at s='+pt[0];
          //originally had $${BDO.terms[i].tXw} & .value.
          dS1 = `${dS1}${BDO.terms[i].t1X}`;
          dS2 = `${dS2}${BDO.terms[i].t2X}`;
          cdS = `${cdS}${BDO.terms[i].tXw}${to_m(BDO.terms[i].mult)}`;
          K = K / Math.pow(Math.abs(BDO.terms[i].value), BDO.terms[i].mult); // Divide K by w0^m
      }

      if (BDO.terms[i].termType == 'RealZero') {
          lS = `${lS}<li>A real zero at s=${BDO.terms[i].value}${BDO.terms[i].mH}.<br />
          This is the $${BDO.terms[i].t1X}$ term in the numerator, with 
          $${BDO.terms[i].tXw}$=${-BDO.terms[i].value}.</li>`;
          pt[0] = BDO.terms[i].value.toString()+BDO.terms[i].mH.toString();
          pt[1] = BDO.terms[i].t1H.toString();
          pt[2] = BDO.terms[i].tHw.toString();
          pt[3] = -BDO.terms[i].value.toString();
          lSHtml += '<li>A real zero at s='+pt[0]+'.<br /> This is the '+pt[1]+' term in the denominator, with '+pt[2]+'='+pt[3]+'.</li>'
          BDO.terms[i].desc = 'a real zero at s='+pt[0];
          nS1 = `${nS1}${BDO.terms[i].t1X}`;
          nS2 = `${nS2}${BDO.terms[i].t2X}`;
          cnS = `${cnS}${BDO.terms[i].tXw}${to_m(BDO.terms[i].mult)}`;
          K = K * Math.pow(Math.abs(BDO.terms[i].value), BDO.terms[i].mult); // Multiply K by w0^m
      }

      if (BDO.terms[i].termType == 'ComplexPole') {
          lS = `${lS}<li>Complex poles, at s = ${dispConj(BDO.terms[i].value)}${BDO.terms[i].mH}. <br />
          This is the $${BDO.terms[i].t1X}$ term in the denominator, 
          with $${BDO.terms[i].tXw}$=${omega0(BDO.terms[i].value)}, 
          $${BDO.terms[i].tXz}$=${zeta(BDO.terms[i].value)}.</li>`;
          //we are here in filling out lSHtml. For whatever reason lS tex is not working for us.
          pt[0] = dispConj(BDO.terms[i].value).toString()+BDO.terms[i].mH.toString();
          pt[1] = BDO.terms[i].t1H.toString();
          pt[2] = BDO.terms[i].tHw.toString();
          pt[3] = omega0(BDO.terms[i].value).toString();
          pt[4] = BDO.terms[i].tHz.toString();
          pt[5] = zeta(BDO.terms[i].value).toString();
          lSHtml += '<li>Complex poles, at s = '+pt[0]+'. <br /> This is the '+pt[1]+' term in the denominator, with '+pt[2]+'='+pt[3]+', '+pt[4]+'='+pt[5]+'.</li>';
          BDO.terms[i].desc = 'complex poles at s='+pt[0];
          dS1 = `${dS1}${BDO.terms[i].t1X}`;
          dS2 = `${dS2}${BDO.terms[i].t2X}`;
          cdS = `${cdS}${BDO.terms[i].tXw}${to_m(2*BDO.terms[i].mult)}`;
          K = K / Math.pow(BDO.terms[i].value.abs(), 2 * BDO.terms[i].mult); // Divide K by w0^(2m)
      }

      if (BDO.terms[i].termType == 'ComplexZero') {
          lS = `${lS}<li>Complex zeros, at s = ${dispConj(BDO.terms[i].value)}${BDO.terms[i].mH}. <br />
          This is the $${BDO.terms[i].t1X}$ term in the numerator, 
          with $${BDO.terms[i].tXw}$=${omega0(BDO.terms[i].value)}, 
          $${BDO.terms[i].tXz}$=${zeta(BDO.terms[i].value)}.</li>`;
          pt[0] = dispConj(BDO.terms[i].value).toString()+BDO.terms[i].mH.toString();
          pt[1] = BDO.terms[i].t1H.toString();
          pt[2] = BDO.terms[i].tHw.toString();
          pt[3] = omega0(BDO.terms[i].value).toString();
          pt[4] = BDO.terms[i].tHz.toString();
          pt[5] = zeta(BDO.terms[i].value).toString();
          lSHtml += '<li>Complex zeros, at s = '+pt[0]+'. <br /> This is the '+pt[1]+' term in the denominator, with '+pt[2]+'='+pt[3]+', '+pt[4]+'='+pt[5]+'.</li>';
          BDO.terms[i].desc = 'complex zeros at s='+pt[0];
          nS1 = `${nS1}${BDO.terms[i].t1X}`;
          nS2 = `${nS2}${BDO.terms[i].t2X}`;
          cnS = `${cnS}(${BDO.terms[i].tXw}${to_m(2*BDO.terms[i].mult)}`;
          K = K * Math.pow(BDO.terms[i].value.abs(), 2 * BDO.terms[i].mult); // Multiply K by w0^(2m)
      }

      if (BDO.terms[i].termType == 'OriginPole') {
          lS = `${lS}<li>A pole at the origin${BDO.terms[i].mH}.</li>`;
          lSHtml += '<li>A pole at the origin'+BDO.terms[i].mH.toString()+'.</li>';
          oS = BDO.terms[i].t1X;
      }

      if (BDO.terms[i].termType == 'OriginZero') {
          lS = `${lS}<li>A zero at the origin${BDO.terms[i].mH}.</li>`;
          lSHtml += '<li>A zero at the origin'+BDO.terms[i].mH.toString()+'.</li>';
          oS = BDO.terms[i].t1X;
      }
  }
  BDO.K = K.toPrecision(BDO.prec);
  let KdB = 20 * Math.log10(K).toPrecision(BDO.prec);

  lS = `${lS}</ul></blockquote>`
  //  \[H(s)=C\frac{s^2 + 5s + 6}{s^5 + 4s^4 + 7s^3 + 6s^2 + 2s}\]
  //was `$H(s)=C\\frac{${BDO.num}}{${BDO.den}}$`
  let H1S = "\\[H(s)=C\\frac{"+BDO.num.toString()+"}{"+BDO.den+"}\\]";
  $('#H1').html(H1S);

  //let H2S = `H(s) = C${oS}\\frac{${nS1}}{${dS1}}`;
  let H2S = "\\[H(s) = C"+oS.toString()+"\\frac{"+nS1.toString()+"}{"+dS1.toString()+"}\\]";
  $('#H2').html(H2S);

  //$('#TermDisp').html(lS.toString());//find lS somewhere.
  $('#TermDisp').html(lSHtml);

  //let H3S = `H(s) = C\\frac{${cnS}}{${cdS}}${oS}\frac{${nS2}}{${dS2}}`;
  let H3S = "\\[H(s) = C\\frac{"+cnS.toString()+"}{"+cdS.toString()+"}{"+oS.toString()+"}\\frac{"+nS2.toString()+"}{"+dS2.toString()+"}\\]";
  $('#H3').html(H3S);

  //let H4S = `K = C\\frac{${cnS}}{${cdS}} = ${BDO.K} = ${KdB}dB`;
  let H4S = "\\[K = C\\frac{"+cnS.toString()+"}{"+cdS.toString()+"} = "+BDO.K.toString()+" = "+KdB.toString()+"dB\\]";
  $('#H4').html(H4S);

  //let H5S = `H(s) = K${oS}\\frac{${nS2}}{${dS2}}`;
  let H5S = "\\[H(s) = K"+oS.toString()+"\\frac{"+nS2.toString()+"}{"+dS2.toString()+"}\\]";
  $('#H5').html(H5S);

   MathJax.Hub.Queue(["Typeset", MathJax.Hub, "TFS"]);
  setTimeout(function () {
      MathJax.Hub.Queue(["Typeset", MathJax.Hub, "TFS"])
  }, 2000);

}

// take in a complex number and display it with +/- to indicate number and conjugate.
function dispConj(x) {
    return (x.re + ' &plusmn; ' + x.im + 'j');
}

function omega0(s) { //get omega0 of complex number
    return (s.abs().toPrecision(BDO.prec));
}

function zeta(s) {//zeta(BDO.terms[i].value)
    return (Math.abs(s.im / s.abs()).toPrecision(BDO.prec));
}

function to_m(m, html) { // a string for raising to the mth power (show nothing if m=1).
  if (html == undefined) {
      return (m == 1 ? '' : `^${m}`);
  }
  else {
      return (m == 1 ? '' : `<sup>${m}</sup>`);
  }
}

// Round all roots to "prec" to make checks for equality possible.
// Also check to see if number is sufficiently close to zero.
function roundToPrec(r, n) { // n = digits of precision, r=nedamer object with roots, returns array of complex;
    let rArray = new Array(n)

    for (let i = 0; i < n; i++) {
        let rl = nerdamer.realpart(nerdamer.vecget(r, i)).valueOf().toPrecision(BDO.prec);
        rl = Math.abs(rl) < 1e-3 ? 0 : rl;
        let im = nerdamer.imagpart(nerdamer.vecget(r, i)).valueOf().toPrecision(BDO.prec);
        im = Math.abs(im) < 1e-3 ? 0 : im;
        rArray[i] = new Complex(rl, im);
    }
    return (rArray);
}
function highchartsPlot (series, id, title, xAxis, yAxis, logOrLinear, tickInt) {
  if (xAxis == undefined) {
    xAxis = 'ω';
  }
  if (logOrLinear == undefined) {
    logOrLinear = 'logarithmic';
  }
  let chart = Highcharts.chart(id, {
    chart: {
        type: 'line',
        zoomType: 'xy'
    },
    title: {
        text: title,
        useHTML: true
    },
    xAxis: {
      type: logOrLinear,//'logarithmic'. can't plot sub-zero values on a logarithmic axis
      title: {
          enabled: true,
          text: xAxis,//ω, &#x03C9;
          useHTML: true
      },
      startOnTick: true,
      endOnTick: true,
      showLastLabel: true,
      gridLineWidth: 1,
    },
    //type: 'linear','logarithmic'
    yAxis: {
      type: 'linear',
      tickInterval: tickInt,
        title: {
            text: yAxis,//'Magnitude dB',
            useHTML: true
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
  return chart;
}
