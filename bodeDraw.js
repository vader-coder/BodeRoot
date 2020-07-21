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
    this.w = [];//frequency input for graphs.
    this.wLen;//length of w
    this.allMag = [];
    this.allPhase = [];
    this.allMagApprox = [];
    this.allPhaseApprox = [];
    this.namesOfIds = [];
    this.magDescs = [];
    this.phaseDescs = [];
    this.magLeftMostPointDesc = '';
    this.lastClickedTopBoxTermNum;
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
    this.bothMagChart;
    this.bothPhaseChart;
    this.bothTotalMagSeries;
    this.bothTotalPhaseSeries;
    this.lowerBounds = [];//list of lower inflection points
    this.compLowerBounds = [];//list of lower inflection points for complex conjugates
    this.upperBounds = [];//list of upper inflection points
    this.compUpperBounds = [];//list of upper inflection points for complex conjugates
    this.complexW0s = [];//list of w0s for complex #s.
    this.isAnSInNumerator = 1;
    this.peakWidth;
};

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
    this.zeta = 0;//find out what this means for other than real & imaginary.
    this.sign = 0;//-1 if it's a pole, 1 if it's a zero.
    this.magSlope = 0;
    this.magBreakpt = '';//gives w point where slope starts being not zero
    this.lowerBound = '';
    this.upperBound = '';
    this.midPhaseSlope = '';
    this.endPhaseSlope = '';
    this.realPart;
    this.imagPart;
    this.topMagData = [];
    this.topPhaseData = [];
    this.peakHeight;
}

// Reset function
$(function () {
    BDO = new BDO_Obj(); // Create object.
    BDOupdate();
    setEventListeners();//setup event listeners.
});

// function called when polynomial is changed.
function BDOupdate(moreThanOnce) {
    /*getTerms();
    dispTerms();*/
    let cheevStart, cheevStop, patStart, patStop, cheevTime, patTime, ret;
    if (!moreThanOnce) {
      //if this is the first time BDOupdate() has been called, get the equation from the url parameters.
      getURLParams();
    }
    cheevStart = new Date().getTime();
    ret = getTerms();
    if (!ret) { return; }
    dispTerms();
    cheevStop = new Date().getTime();
    //reload document if > 14 terms entered.
    if (BDO.terms.length > 14) {
      alert("This page is not equipped to handle a transfer function with more than 14 terms.");
      location.reload();
    }
    getData();
    graphSinusoid();
    patStop = new Date().getTime();
    patStart = cheevStop;
    cheevTime = cheevStop - cheevStart;
    patTime = patStop - patStart;
    console.log("Prof. Cheever's code took "+cheevTime.toString() + "ms to run.");
    console.log("Patrick's code took "+patTime.toString() + "ms to run.");
}
/* This function gets the transfer function from the url and puts it
  into the input tags at the top of the page. */
function getURLParams() {
  let params = new URLSearchParams(window.location.search);
  let denom = params.get('den');//numerator in url
  let num = params.get('num');//denominator in url
  let C = params.get('c');//constant in url
  /*fill the input fields for the numerator, denominator, and constant
    with the strings retrieved from the url*/
  if (denom) {
    $('#D_of_s').val(denom);
  }
  if (num) {
    $('#N_of_s').val(num);
  }
  if (C) {
    $('#multConst').val(C);
  }
}

/* This function
 * grabs the text from the html page,
 * forms the transfer function,
 * factors numerator and denominator,
 * gets all the values about the different terms,
 * sorts the terms
 * creates all the TeX and HTML needed to display the function.
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
  BDO.peakWidth = 0.00001;
  
  //replace old query string with new one.
  let nParam = NStr.replace(/\+/g, '%2B');
  let dParam = DStr.replace(/\+/g, '%2B');
  window.history.replaceState(null, null, '/?c='+CStr+'&num='+nParam+'&den='+dParam);

  // Get poles and zeros
  let zeros, poles, numCoef = 1, denCoef = 1;
  //only get zeros or poles if a variable 's' is included in the respective input field
  if (BDO.num.indexOf("s") > -1) {
    zeros = nerdamer.roots(BDO.num);
    let factors = nerdamer('factor('+BDO.num+')');
    numCoef = factors.symbol.multiplier.num.value / factors.symbol.multiplier.den.value;
    BDO.C *= numCoef;
  }
  else {
    BDO.isAnSInNumerator = 0;
  }
  if (BDO.den.indexOf("s") > -1) {
    poles = nerdamer.roots(BDO.den);
    let factors = nerdamer('factor('+BDO.den+')');
    denCoef = factors.symbol.multiplier.num.value / factors.symbol.multiplier.den.value;
    BDO.C /= denCoef;
  }
  else {
    alert("You must include the variable 's' in the denominator.");
    return false;
  }

  let numOrd = nerdamer.deg(BDO.num).valueOf();
  let denOrd = nerdamer.deg(BDO.den).valueOf();
  let numTerms = numOrd + denOrd + 1;

  // changes zeros from Nerdamer to complex object {img: "a", re: "b"}
  zeros = roundToPrec(zeros, numOrd); 
  poles = roundToPrec(poles, denOrd);

  //reset all the BDO arrays to [];
  BDO.w = [];
  BDO.allMag = [];
  BDO.allPhase = [];
  BDO.allMagApprox = [];
  BDO.allPhaseApprox = [];
  BDO.namesOfIds = [];
  BDO.magDescs = [];
  BDO.phaseDescs = [];
  BDO.topMagSeries = [];
  BDO.topPhaseSeries = [];
  BDO.magSeries = [];
  BDO.phaseSeries = [];
  BDO.lowerBounds = [];
  BDO.upperBounds = [];
  BDO.compLowerBounds = [];
  BDO.compUpperBounds = [];
  BDO.complexW0s = [];

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
  while (i < (BDO.numTerms - 1)) {//for each item in terms except last, compare it to the other items in the series.
      for (let j = i + 1; j < BDO.numTerms; j++) {
          if (terms[i].termType == terms[j].termType) { // if type is the same
            if (terms[i].termType.indexOf('Comp') > -1) {
              //check if real part & imaginary part are same
              //if (terms[i].value == terms[j].value) does not work if term is complex conjugate.
              if ((terms[i].value.im == terms[j].value.im) && (terms[i].value.re == terms[j].value.re)) {//real part & imaginary part are same
                terms[i].mult++; // increase multiplicity
                terms.splice(j, 1); // delete repeated term
                BDO.numTerms--; // decrease number of terms
                j--;
              }
            }
            else if (terms[i].value == terms[j].value) {//type & value are same
              terms[i].mult++; // increase multiplicity
              terms.splice(j, 1); // delete repeated term
              BDO.numTerms--; // decrease number of terms
              j--;
            }
          }
      }
      i++;
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
  let realPart, imagPart, w0, zetaTemp, lowerBound, upperBound;
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
          // we'll use this phrase whenever the situation arises that includes a multiple pole or zero.
          terms[i].mH = m == 1 ? '' : `, of muliplicity ${m}`;
          BDO.terms[j++] = terms[i];
          /*calculate the inflection points for the magnitude plot (w0) 
          and the phase plot (lowerBound, upperBound)*/
          w0 = Math.abs(parseFloat(terms[i].value));
          lowerBound = 0.1*w0;
          upperBound = 10*w0;
          terms[i].w0 = w0;
          terms[i].lowerBound = lowerBound;
          terms[i].upperBound = upperBound;
          BDO.lowerBounds.push(lowerBound);
          BDO.upperBounds.push(upperBound);
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
          w0 = Math.abs(parseFloat(terms[i].value));
          lowerBound = 0.1*w0;
          upperBound = 10*w0;
          terms[i].w0 = w0;
          terms[i].lowerBound = lowerBound;
          terms[i].upperBound = upperBound;
          BDO.lowerBounds.push(lowerBound);
          BDO.upperBounds.push(upperBound); 
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
          terms[i].t2X = `(1 + 2${terms[i].tXz}(s/${terms[i].tXw}) +  (s/${terms[i].tXw}^2))${to_m(m)}`;
          terms[i].t1H = `(s^2 + 2${terms[i].tHz}${terms[i].tHw}s + ${terms[i].tHw}^2)${to_m(m)}`;
          terms[i].t2H = `(1 + 2${terms[i].tHz}(s/${terms[i].tHw}) +  (s/${terms[i].tHw}^2))${to_m(m)}`;
          terms[i].mH = m == 1 ? '' : `, of muliplicity ${m}`; // multiplicity phrase
          BDO.terms[j++] = terms[i];
          realPart = parseFloat(terms[i].value.re);
          imagPart = parseFloat(terms[i].value.im);
          w0 = Math.sqrt(realPart*realPart + imagPart*imagPart);
          zetaTemp = parseFloat(zeta(terms[i].value));
          lowerBound = w0/(Math.pow(10, Math.abs(zetaTemp)));
          upperBound = w0*Math.pow(10, Math.abs(zetaTemp));
          terms[i].w0 = w0;
          terms[i].zeta = zetaTemp;//calculate the damping ratio for complex conjugates
          terms[i].realPart = realPart;
          terms[i].imagPart = imagPart;
          terms[i].lowerBound = lowerBound;
          terms[i].upperBound = upperBound;
          BDO.lowerBounds.push(lowerBound);
          BDO.upperBounds.push(upperBound);
          BDO.compLowerBounds.push(lowerBound);
          BDO.compUpperBounds.push(upperBound);
          BDO.complexW0s.push(roundDecimal(w0, 1));        
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
          terms[i].t1H = `(s^2 + 2${terms[i].tHz}${terms[i].tHw}s + ${terms[i].tHw}^2)${to_m(m)}`;
          terms[i].t2H = `(1 + 2${terms[i].tHz}(s/${terms[i].tHw}) +  (s/${terms[i].tHw}^2))${to_m(m)}`;
          terms[i].mH = m == 1 ? '' : `, of muliplicity ${m}`; // multiplicity phrase
          BDO.terms[j++] = terms[i];
          realPart = parseFloat(terms[i].value.re);
          imagPart = parseFloat(terms[i].value.im);
          w0 = Math.sqrt(realPart*realPart + imagPart*imagPart);
          zetaTemp = parseFloat(zeta(terms[i].value));
          lowerBound = w0/(Math.pow(10, Math.abs(zetaTemp)));
          upperBound = w0*Math.pow(10, Math.abs(zetaTemp));
          terms[i].w0 = w0;
          terms[i].zeta = zetaTemp;
          terms[i].realPart = realPart;
          terms[i].imagPart = imagPart;
          terms[i].lowerBound = lowerBound;
          terms[i].upperBound = upperBound;
          BDO.lowerBounds.push(lowerBound);
          BDO.upperBounds.push(upperBound);
          BDO.compLowerBounds.push(lowerBound);
          BDO.compUpperBounds.push(upperBound);
          BDO.complexW0s.push(roundDecimal(w0, 1));            
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
  return true;
}
/* This function creates all the TeX and html for displaying the equations.
 */
function dispTerms() {
  let dS1 = ''; // Denominator String, form 1
  let dS2 = ''; // Denominator String, form 2
  let nS1 = ''; // Numerator String, form 1
  let nS2 = ''; // Numerator String, form 2
  let cdS = ''; // This is the denominator the term C multiplied by zeros, divided by poles.
  let cnS = ''; // This is the denominator the term C divided by zeros, multiplied by poles
  let oS = ''; // String for origin poles and zeros
  let lS = `<blockquote><p class="noindent">With:</p><ul style="margin-left:3em">
    <li>Constant: C=${BDO.C}</li>`;
  let isAnSInNumerator = BDO.isAnSInNumerator;
  let lSHtml = '<blockquote><p class="noindent">With:</p><ul style="margin-left:3em"> <li>Constant: C='+BDO.C.toString()+'</li>';
  let K = BDO.C; // We'll calculate K as we go.
  let numConst = parseFloat(BDO.num);
  if (!isAnSInNumerator && numConst) { K *= numConst; }
  let pt = [0, 1, 2, 3, 4, 5, 6], exp;
  //tHw & tHz instead of tXw & tXz
  //t1H & t2H 
  for (let i = 1; i < BDO.numTerms; i++) {
      if (BDO.terms[i].termType == 'RealPole') {
          lS = `${lS}<li>A real pole at s=${BDO.terms[i].value}${BDO.terms[i].mH}.<br />
          This is the ${BDO.terms[i].t1X} term in the denominator, with 
          ${BDO.terms[i].tXw}=${-BDO.terms[i].value}.</li>`;
          pt[0] = BDO.terms[i].value.toString()+BDO.terms[i].mH;
          pt[1] = BDO.terms[i].t1H.toString();
          pt[2] = BDO.terms[i].tHw.toString();
          pt[3] = -BDO.terms[i].value.toString();
          pt[4] = pt[2]+'='+pt[3];
          lSHtml += '<li>A real pole at s='+pt[0]+'.<br /> This is the '+pt[1]+' term in the denominator, with '+pt[4]+'.</li>';
          BDO.terms[i].desc = 'a real pole at '+pt[4] + BDO.terms[i].mH;
          dS1 = `${dS1}${BDO.terms[i].t1X}`;
          dS2 = `${dS2}${BDO.terms[i].t2X}`;
          cdS = `${cdS}${BDO.terms[i].tXw}${to_m(BDO.terms[i].mult)}`;
          K = K / Math.pow(Math.abs(BDO.terms[i].value), BDO.terms[i].mult); // Divide K by w0^m
      }

      if (BDO.terms[i].termType == 'RealZero') {
          lS = `${lS}<li>A real zero at s=${BDO.terms[i].value}${BDO.terms[i].mH}.<br />
          This is the $${BDO.terms[i].t1X}$ term in the numerator, with 
          $${BDO.terms[i].tXw}$=${-BDO.terms[i].value}.</li>`;
          pt[0] = BDO.terms[i].value.toString()+BDO.terms[i].mH;
          pt[1] = BDO.terms[i].t1H.toString();
          pt[2] = BDO.terms[i].tHw.toString();
          pt[3] = -BDO.terms[i].value.toString();
          pt[4] = pt[2]+'='+pt[3];
          lSHtml += '<li>A real zero at s='+pt[0]+'.<br /> This is the '+pt[1]+' term in the denominator, with '+pt[4]+'.</li>'
          BDO.terms[i].desc = 'a real zero at '+pt[4]+BDO.terms[i].mH;
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
          pt[0] = dispConj(BDO.terms[i].value).toString()+BDO.terms[i].mH;
          pt[1] = BDO.terms[i].t1H.toString();
          pt[2] = BDO.terms[i].tHw.toString();
          pt[3] = omega0(BDO.terms[i].value).toString();
          pt[4] = BDO.terms[i].tHz.toString();
          pt[5] = zeta(BDO.terms[i].value).toString();
          pt[6] = pt[2]+'='+pt[3]+', '+pt[4]+'='+pt[5]+BDO.terms[i].mH;
          lSHtml += '<li>Complex poles, at s = '+pt[0]+'. <br /> This is the '+pt[1]+' term in the denominator, with '+pt[6]+'.</li>';
          BDO.terms[i].desc = 'complex conjugate poles at '+pt[6];
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
          pt[0] = dispConj(BDO.terms[i].value).toString()+BDO.terms[i].mH;
          pt[1] = BDO.terms[i].t1H.toString();
          pt[2] = BDO.terms[i].tHw.toString();
          pt[3] = omega0(BDO.terms[i].value).toString();
          pt[4] = BDO.terms[i].tHz.toString();
          pt[5] = zeta(BDO.terms[i].value).toString();
          pt[6] = pt[2]+'='+pt[3]+', '+pt[4]+'='+pt[5]+BDO.terms[i].mH;
          lSHtml += '<li>Complex zeros, at s = '+pt[0]+'. <br /> This is the '+pt[1]+' term in the denominator, with '+pt[6]+'.</li>';
          BDO.terms[i].desc = 'complex conjugate zeros at s='+pt[6];
          nS1 = `${nS1}${BDO.terms[i].t1X}`;
          nS2 = `${nS2}${BDO.terms[i].t2X}`;
          cnS = `${cnS}(${BDO.terms[i].tXw}${to_m(2*BDO.terms[i].mult)}`;
          K = K * Math.pow(BDO.terms[i].value.abs(), 2 * BDO.terms[i].mult); // Multiply K by w0^(2m)
      }

      if (BDO.terms[i].termType == 'OriginPole') {
          lS = `${lS}<li>A pole at the origin${BDO.terms[i].mH}.</li>`;
          lSHtml += '<li>A pole at the origin'+BDO.terms[i].mH+'.</li>';
          oS = BDO.terms[i].t1X;
      }

      if (BDO.terms[i].termType == 'OriginZero') {
          lS = `${lS}<li>A zero at the origin${BDO.terms[i].mH}.</li>`;
          lSHtml += '<li>A zero at the origin'+BDO.terms[i].mH+'.</li>';
          oS = BDO.terms[i].t1X;
      }
  }
  BDO.K = K.toPrecision(BDO.prec);
  let KdB = 20 * Math.log10(Math.abs(K)).toPrecision(BDO.prec);

  lS = `${lS}</ul></blockquote>`
  let H1S = "\\[H(s)=C\\frac{"+BDO.num.toString()+"}{"+BDO.den+"}\\]";
  $('#H1').html(H1S);

  if (!BDO.isAnSInNumerator) {
    nS1 = BDO.num;
    cnS = BDO.num;
  }
  if (nS1 == '') { nS1 = '1'; }
  if (cnS == '') { cnS = '1'; }
  if (nS2 == '') { nS2 = '1'; }
  
  let H2S = "\\[H(s) = C"+oS.toString()+"\\frac{"+nS1.toString()+"}{"+dS1.toString()+"}\\]";
  $('#H2').html(H2S);

  $('#TermDisp').html(lSHtml);
  
  let H3S = "\\[H(s) = C\\frac{"+cnS.toString()+"}{"+cdS.toString()+"}{"+oS.toString()+"}\\frac{"+nS2.toString()+"}{"+dS2.toString()+"}\\]";
  $('#H3').html(H3S);

  let H4S = "\\[K = C\\frac{"+cnS.toString()+"}{"+cdS.toString()+"} = "+BDO.K.toString()+" = "+KdB.toPrecision(3)+"dB\\]";
  $('#H4').html(H4S);

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

//get zeta given s = BDO.terms[i].value
function zeta(s) {
    return (Math.acos(Math.abs(s.im / s.abs())).toPrecision(BDO.prec));
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
/* OWNERSHIP: Erik Cheever wrote most of the code above this line. Patrick Wheeler wrote all the code below it. */
/*getData() calculates the data points used to graph the magnitude
  and phase of each term. It creates a list of objects for the phase and the magnitude,
  each item of which contains the name of the term, the term's data points, its color in rgba(), 
  and its line width. This list of objects is referred to by highchats as a series.
  It also calculates the descriptions for charts that plot each term's phase and magnitude individually
  and the charts that illustrate the combined phase and magnitude of all the terms. 
  'w' is often used in variables to mean omega, the symbol for frequency which is our independent variable
  for both magnitude and phase.
  Throughout the code we use 'mag' as an abbreviation for 'magnitude.'
  */
function getData () {
  let terms = BDO.terms;
  let constantK = parseFloat(BDO.K), w1, w2, yEnd, w0, exp, iMax;
  let constMag = [], constPhase = [], magSeries = [], phaseSeries = [],
  topMagSeries = [], topPhaseSeries = [], desc, magDescs = [], phaseDescs = [],
  togetherMagSeries = [], togetherPhaseSeries = [], w0Mag, zMag, name, print, print2,
  bold = BDO.bold, faded = BDO.faded, checkBoxesHtml, iLen,
  names = [], blackRGBA = 'rgba(0, 0, 0, 1)', peakWidth = BDO.peakWidth;
  let w0Str = '&omega;<sub>0</sub>';
  var colors = ['rgba(0,114,189,'+bold+')',//list of colors for term plots
  'rgba(217,83,25,'+faded+')',
  'rgba(237,177,32,'+faded+')',
  'rgba(126,47,142,'+faded+')',
  'rgba(119,172,148,'+faded+')',
  'rgba(77,190,238,'+faded+')', 
  'rgba(162,20,47,'+faded+')',
  'rgba(0,114,189,'+faded+')',
  'rgba(217,83,25,'+faded+')',
  'rgba(237,177,32,'+faded+')',
  'rgba(126,47,142,'+faded+')',
  'rgba(119,172,148,'+faded+')',
  'rgba(77,190,238,'+faded+')', 
  'rgba(162,20,47,'+faded+')'], colorIndex = 0;//colorIndex = current index in list of colors.
  let lastSolidTermIndex = colors.length/2-1;//index of last term whose line is solid.
  let magLeftMostPointFormula, phaseLeftMostPointFormula, magLeftMostPointDesc, initialMagSlope = 0, magRestDesc = '', phaseRestDesc ='', termDesc;
  let id = 'topTerm:', bothTotalMagSeries = [], bothTotalPhaseSeries = [], dashStyle = 'Solid';
  magLeftMostPointDesc = 'Since we have a constant K='+BDO.K.toString();
  BDO.w = [];//reset w every time updated.
  let w = BDO.w, slopeDB, phaseLine, halfPhaseLine;
  let lowerBoundMin = Math.min(...BDO.lowerBounds), wMin = 0.1;//min = lowest frequency at which a term's slope becomes > 0
  let upperBoundMax = Math.max(...BDO.upperBounds), wMax = 100;
  /*lowerBound & upperBound are the w-coordinates of the two inflection points 
  in a phase graph approximation, with lowerBound > its corresponding upperBound*/
  //ensure smallest frequency on graph is < than the lowest inflection point frequency by a factor of 10
  while (wMin >= lowerBoundMin) {
    wMin *= 0.1;
  }
  //ensure largest frequency on graph is > than the highest inflection point frequency by a factor of 10
  while (wMax <= upperBoundMax) {
    wMax *= 10;
  }
  /*sort inflection points for magnitude plots of complex conjugates 
  and for phase plots of real and complex terms in ascending order*/
  let complexW0s = BDO.complexW0s.sort(function(a, b){return a-b});
  let lowerBounds = BDO.compLowerBounds.sort(function(a, b){return a-b});
  let upperBounds = BDO.compUpperBounds.sort(function(a, b){return a-b});
  let lowerBound, upperBound;
  let w0Index = 0, lastW0, lowerBoundIndex = 0, lastLowerBound, upperBoundIndex = 0, lastUpperBound, w_iTrunc;

  //if w is currently empty, add all the frequency coordinates we will be graphing to it.
  w.push(wMin);
  iMax = wMax*10+1;//since most points are 0.1 apart, we need 10*n w-values to reach a max value of n.
  //as we build array of frequency input points, we encounter the w-coordinates for
  //these inflection points. when we reach one, we ensure that the necessary w-coordinates are added
  //to the array so we can properly graph the relevant terms.
  w0 = roundDecimal(complexW0s[w0Index], 1);
  lowerBound =  roundDecimal(lowerBounds[lowerBoundIndex], 1);
  upperBound = roundDecimal(upperBounds[upperBoundIndex], 1);
  for (let i=1; i<iMax; i++) {
    w_iTrunc = truncDecimal(i*0.1, 1);
    if (w_iTrunc == w0) {
      //to graph a peak on the magnitude plot, we will need twp of the same w-coordinate
      w.push(w_iTrunc);
      w.push(w_iTrunc);
      /*add another point immediately to the bottom-right the peak 
      so it will appear as a vertical line*/
      w.push(roundDecimal(w0 + peakWidth, 5));
      //update w0 to reflect the next w0 in the list of complex w0s
      lastW0 = w0;
      while (complexW0s[w0Index] == lastW0) {
        w0Index++;
      }
      w0 = roundDecimal(complexW0s[w0Index], 1);
    }
    else if (w_iTrunc == lowerBound) {
      //plot will develop kinks if we include a phase inflection point rounded to the 
      //tenths place, so we must use the exact value.
      w.push(lowerBounds[lowerBoundIndex]);
      //update lowerBound to contain the next of the lower phase inflection points in the list
      lastLowerBound = w[w.length-1];
      while (lowerBounds[lowerBoundIndex] == lastLowerBound) {
        lowerBoundIndex++;
      }
      lowerBound =  roundDecimal(lowerBounds[lowerBoundIndex], 1);
    }
    else if (w_iTrunc == upperBound) {
      w.push(upperBounds[upperBoundIndex]);
      //update lowerBound to contain the next of the higher phase inflection points in the list
      lastUpperBound = w[w.length-1];
      while (upperBounds[upperBoundIndex] == lastUpperBound) {
        upperBoundIndex++
      }
      upperBound = roundDecimal(upperBounds[upperBoundIndex], 1);
    }
    else {
      w.push(w_iTrunc);
    }
  }
  BDO.wLen = w.length;
  BDO.magFormula += 'Magnitude: <br>20log<sub>10</sub>('+constantK.toString()+') ';
  //constMag & constPhase store data points for constant's magnitude & phase plot
  if (constantK > 0) {
    for (let i=0; i<w.length; i++) {
      constPhase.push([w[i], 0]);
      constMag.push([w[i], 20*Math.log10(Math.abs(constantK))]);
    }
    desc = 'Since the constant is positive, its phase is 0&deg;.';
    BDO.phaseFormula += 'Phase: <br>0&deg; ';
  }
  else if (constantK < 0) {
    for (let i=0; i<w.length; i++) {
      constPhase.push([w[i], 180]);
      constMag.push([w[i], 20*Math.log10(Math.abs(constantK))]);
    }
    desc =  'Since the constant is positive, its phase is &plusmn; 180&deg;.<br>We have chosen to represent it as +180&deg;.';
    BDO.phaseFormula += '180&deg; ';
  }
  terms[0].magData = constMag;
  terms[0].phaseData = constPhase;
  terms[0].magDataApprox = constMag;
  terms[0].phaseDataApprox = constPhase;
  terms[0].topMagData = getEndpoints(constMag);
  terms[0].topPhaseData = getEndpoints(constPhase);  
  magLeftMostPointFormula = constMag[0][1].toPrecision(3) + ' dB';
  phaseLeftMostPointFormula = constPhase[0][1].toPrecision(3) + ' &deg;';
  name = 'Constant K=' + constantK.toString();
  names.push(name);
  //html for list of checkboxes/radio buttons.
  checkBoxesHtml = "<div id='checkboxes' style='float:left;'><br>Elements Detected: <br>";
  checkBoxesHtml += "<input type='radio' id='" + id + "0' onclick=\"onTopCheckOne(this.id)\" checked></input>";
  checkBoxesHtml += "<label for='" + id + "0'>"+ name +"</label>";

  magDescs.push('The constant term is K= '+constantK.toPrecision(3)+' = '+terms[0].magData[0][1].toPrecision(3)+' dB = 20log10(|K|).');
  BDO.lastClickedTopBoxTermNum = 0;//stores the box # that was last selected. 1st box to be checked is the constant, of term number zero
  //add name, color, and list of data points for constant graph to its magnitude and phase series
  magSeries.push({
    name: 'Constant ' + constantK.toString(),
    color: colors[colorIndex],
    data: terms[0].topMagData,
    lineWidth: 4
  });
  phaseSeries.push({
    name: 'Constant ' + constantK.toString(),
    color: colors[colorIndex],
    data: terms[0].topPhaseData,
    lineWidth: 4
  });
  checkBoxesHtml += getBox(magSeries[magSeries.length-1].color, id+'0')+"<br>";
  colorIndex++;
  desc += '<br><a href="https://lpsa.swarthmore.edu/Bode/BodeHow.html#A%20Constant%20Term">Details</a>';
  phaseDescs.push(desc);
  BDO.termsLen = terms.length;
  iLen = BDO.termsLen;
  //the sign variable indicates if a term is a zero (1) or a pole (-1)
  for (let i=1; i<iLen; i++) {//loop through terms to find the information needed to graph them.
    if (terms[i].termType == "OriginZero") {
      //generate exact data points our term, here the zero @ origin
      [terms[i].magData, terms[i].phaseData] = originData(w, 1, i);
      terms[i].sign = 1;
      //for zero & phase at origin, the linear approximations are equal to the exact plots
      terms[i].magDataApprox = terms[i].magData;
      terms[i].phaseDataApprox = terms[i].phaseData;
      //the individual plots towards the top of the page will only need to use the points at
      //the ends of the line to show the graph
      terms[i].topMagData = getEndpoints(terms[i].magData);
      terms[i].topPhaseData = getEndpoints(terms[i].phaseData);
      initialMagSlope += 20*terms[i].mult;
      name = 'Zero at Origin'+terms[i].mH;
      magSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].topMagData,
        dashStyle: 'Solid',
        lineWidth: 2
      });
      phaseSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].topPhaseData,
        dashStyle: 'Solid',
        lineWidth: 2
      });
      exp = terms[i].mult;
      if (exp > 1) {
        slopeDB = (20*exp).toString();
        phaseLine = (90*exp).toString();
      }
      else {
        slopeDB = '20';
        phaseLine = '90';
      }
      names.push(name);
      //add the term's description for checkbox to the variable that stores it and the term's description for
      //the individual plots to the array that stores them.
      checkBoxesHtml+= "<input type='radio' id='"+id+i.toString()+"' onclick=\"onTopCheckOne(this.id)\"></input>";
      checkBoxesHtml+="<label for='"+id+i.toString()+"'>"+name+"</label>"
      checkBoxesHtml += getBox(magSeries[magSeries.length-1].color, id+i.toString())+"<br>";
      magDescs.push('The magnitude plot rises '+slopeDB+'dB/decade and goes through 0 dB at 1 rad/s.<br>');
      colorIndex++;
      desc = 'The phase plot of a zero at the origin is a horizontal line at +'+phaseLine+'&deg;.';
      desc += '<br><a href="https://lpsa.swarthmore.edu/Bode/BodeHow.html#A%20Zero%20at%20the%20Origin">Details</a>';
      phaseDescs.push(desc);
      magLeftMostPointFormula += ' - '+ slopeDB + ' dB';
      phaseLeftMostPointFormula += ' + ' + phaseLine+ ' &deg;';
      magLeftMostPointDesc += ' and a zero at the origin'+BDO.terms[i].mH;
    }
    else if (terms[i].termType == "OriginPole") {
      [terms[i].magData, terms[i].phaseData] = originData(w, -1, i);
      terms[i].sign = -1;
      terms[i].magDataApprox = terms[i].magData;
      terms[i].phaseDataApprox = terms[i].phaseData;
      initialMagSlope += -20*terms[i].mult;
      name = 'Pole at Origin' + terms[i].mH;
      terms[i].topMagData = getEndpoints(terms[i].magData);
      terms[i].topPhaseData = getEndpoints(terms[i].phaseData);
      magSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].topMagData,
        dashStyle: 'Solid',
        lineWidth: 2
      });
      phaseSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].topPhaseData, 
        dashStyle: 'Solid', 
        lineWidth: 2
      });
      exp = terms[i].mult;
      if (exp > 1) {
        slopeDB = (20*exp).toString();
        phaseLine = (90*exp).toString();
      }
      else {
        slopeDB = '20';
        phaseLine = '90';
      }
      checkBoxesHtml+="<input type='radio' id='"+id+i.toString()+"' onclick=\"onTopCheckOne(this.id)\"></input>";
      checkBoxesHtml+="<label for='"+id+i.toString()+"'>"+name+"</label>";
      checkBoxesHtml += getBox(magSeries[magSeries.length-1].color, id+i.toString())+"<br>";
      desc = 'The magnitude plot drops '+slopeDB+' dB/decade and goes through 0 dB at 1 rad/s.<br>';
      magDescs.push(desc);
      desc = 'The phase plot of a pole at the origin is a horizontal line at -'+phaseLine+'&deg;.';
      desc += '<br><a href="https://lpsa.swarthmore.edu/Bode/BodeHow.html#A%20Pole%20at%20the%20Origin">Details</a>';
      phaseDescs.push(desc);
      names.push(name);
      colorIndex++;
      exp = terms[i].mult.toString();
      magLeftMostPointFormula += ' + '+ slopeDB + ' dB';
      phaseLeftMostPointFormula += ' - ' + phaseLine+ ' &deg;';
      magLeftMostPointDesc += ' and a pole at the origin'+BDO.terms[i].mH;     
    }
    else if (terms[i].termType == "RealZero") {
      //generate data points for exact plot and linear approximation of our term, here the real zero
      [terms[i].magData, terms[i].phaseData, terms[i].magDataApprox, terms[i].phaseDataApprox] = realData(w, 1, i);
      terms[i].sign = 1;
      w0Mag = BDO.terms[i].w0.toPrecision(3);
      name = 'Real Zero, ' + terms[i].tHw + '= '+Math.abs(parseFloat(w0Mag)).toString() + terms[i].mH;
      if (colorIndex > lastSolidTermIndex) {
        dashStyle = 'shortdot';
      }
      magSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].topMagData, 
        dashStyle: dashStyle,
        lineWidth: 2
      });
      phaseSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].topPhaseData,
        dashStyle: dashStyle,
        lineWidth: 2
      });
      exp = terms[i].mult;
      if (exp > 1) {
        exp=exp.toString();
        slopeDB = (20*exp).toString();
        phaseLine = (90*exp).toString();
        halfPhaseLine = (45*exp).toString();//should it be +45 * exp?
      }
      else {
        slopeDB = '20';
        phaseLine = '90';
        halfPhaseLine = '45';
      }
      names.push(name);
      w0Mag = BDO.terms[i].w0.toPrecision(3);
      checkBoxesHtml+="<input type='radio' id='"+id+i.toString()+"' onclick=\"onTopCheckOne(this.id)\"></input>";
      checkBoxesHtml+="<label for='"+id+i.toString()+"'>"+name+"</label>";
      checkBoxesHtml += getBox(magSeries[magSeries.length-1].color, id+i.toString())+"<br>";
      desc = 'The real zero is at '+w0Str+' = '+w0Mag+' rad/s.';
      desc+= ' For the magnitude plot we draw a straight line from';
      desc += ' 0 dB to '+w0Str+' = '+w0Mag+', thereafter the line rises at '+slopeDB+' dB/decade.';
      magDescs.push(desc);
      w0Mag = parseFloat(w0Mag);
      desc = 'The phase plot is 0&deg; up to '+w0Str+'/10 = '+(w0Mag/10).toString()+',';
      desc += ' then climbs to '+phaseLine+'&deg; at '+w0Str+'&middot;10 = '+(w0Mag*10).toString()+' going through +'+halfPhaseLine+'&deg; at '+w0Mag.toString() + '.';
      desc+='<br><a href = "https://lpsa.swarthmore.edu/Bode/BodeHow.html#A%20Real%20Zero">Details</a>';
      phaseDescs.push(desc);
      termDesc = terms[i].desc;
      w0Mag = w0Mag.toString();
      magRestDesc += '<li>Add '+slopeDB+' dB/decade to slope at &omega; = '+w0Mag+' due to '+termDesc+'.</li>';//+BDO.terms[i].magBreakpt.toString() + '<br>'; 
      w1 = terms[i].lowerBound.toPrecision(3), w2 = terms[i].upperBound.toPrecision(3);
      yEnd = (90*terms[i].mult).toPrecision(3);
      if (colorIndex == 1) {
        desc = '<sup>&dagger;</sup>';
      }
      else {
        desc = '';
      }
      phaseRestDesc += '<li>Add slope of line connecting ('+w1+', 0&deg;)'+desc+' and ('+w2+', '+yEnd+'&deg;)';
      phaseRestDesc += ' to overall slope between &omega; = '+w1 + ' and &omega; = '+w2; 
      phaseRestDesc += ' and add '+ yEnd +'&deg; to the &omega; > ' + w2 + ' section due to '+termDesc+'.</li>';    
      colorIndex++;
    }
    else if (terms[i].termType == "RealPole") {
      [terms[i].magData, terms[i].phaseData, terms[i].magDataApprox, terms[i].phaseDataApprox] = realData(w, -1, i);
      terms[i].sign = -1;
      w0Mag = BDO.terms[i].w0.toPrecision(3);
      name = 'Real Pole, ' + terms[i].tHw + '= '+Math.abs(parseFloat(w0Mag)).toString() + terms[i].mH;
      if (colorIndex > lastSolidTermIndex) {
        dashStyle = 'shortdot';
      }
      magSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].topMagData,
        dashStyle: dashStyle,
        lineWidth: 2
      });
      phaseSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].topPhaseData,
        dashStyle: dashStyle,
        lineWidth: 2
      });
      exp = terms[i].mult;
      if (exp > 1) {
        slopeDB = (20*exp).toString();
        phaseLine = (90*exp).toString();
        halfPhaseLine = (45*exp).toString();
      }
      else {
        slopeDB = '20';
        phaseLine = '90';
        halfPhaseLine = '45'; 
      }
      names.push(name);
      checkBoxesHtml+="<input type='radio' id='"+id+i.toString()+"' onclick=\"onTopCheckOne(this.id)\"></input>";
      checkBoxesHtml+="<label for='"+id+i.toString()+"'>"+name+"</label>";
      checkBoxesHtml += getBox(magSeries[magSeries.length-1].color, id+i.toString())+"<br>";
      desc = 'The real pole is at '+w0Str+' = '+w0Mag+' rad/s.';
      desc+= ' For the magnitude plot we draw a straight line from';
      desc += ' 0 dB to '+w0Str+' = '+w0Mag+', thereafter the line falls at '+slopeDB+'dB/decade.';
      magDescs.push(desc);
      
      w0Mag = parseFloat(w0Mag);
      desc = 'The phase plot is 0&deg; up to '+w0Str+'/10 = '+(w0Mag/10).toString()+',';
      desc += ' then drops to -'+phaseLine+'&deg; at '+w0Str+'&middot;10 = '+(w0Mag*10).toString()+' going through -'+halfPhaseLine+'&deg; at '+w0Mag.toString()+'.';
      desc += '<br><a href = "https://lpsa.swarthmore.edu/Bode/BodeHow.html#A%20Real%20Pole">Details</a>';
      phaseDescs.push(desc);
      termDesc = terms[i].desc;
      w0Mag = w0Mag.toString();
      magRestDesc += '<li>Add -' + slopeDB + ' dB/decade to slope at &omega; = '+w0Mag+' due to '+termDesc+'.</li>';//+BDO.terms[i].magBreakpt.toString() + '<br>'; 
      if (colorIndex == 1) {
        desc = '<sup>&dagger;</sup>';
      }
      else {
        desc = '';
      }
      w1 = terms[i].lowerBound.toPrecision(3), w2 = terms[i].upperBound.toPrecision(3);
      yEnd = (-90*terms[i].mult).toPrecision(3);
      phaseRestDesc += '<li>Add slope of line connecting ('+w1+', 0&deg;)'+desc+' and ('+w2+', '+yEnd+'&deg;)';
      phaseRestDesc += ' to overall slope between &omega; = '+w1 + ' and &omega; = '+w2; 
      phaseRestDesc += ' and add '+ yEnd +'&deg; to the &omega; > ' + w2 + ' section due to '+termDesc+'.</li>';    
      colorIndex++;
    }
    else if (terms[i].termType == "ComplexZero") {
      [terms[i].magData, terms[i].phaseData, terms[i].magDataApprox, terms[i].phaseDataApprox] = compConjugateData(w, 1, i);
      terms[i].sign = 1;
      [print, print2] = compToStr(terms[i].value);
      w0Mag = BDO.terms[i].w0.toPrecision(3);
      zMag = BDO.terms[i].zeta.toPrecision(3);
      name = 'Complex Zero, ' + terms[i].tHw + '= '+Math.abs(parseFloat(w0Mag)).toString() + ', ' + terms[i].tHz + ' = ' +zMag + terms[i].mH;
      if (colorIndex > lastSolidTermIndex) {
        dashStyle = 'shortdot';
      }
      magSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].topMagData,
        dashStyle: dashStyle,
        lineWidth: 2
      });
      phaseSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].topPhaseData,
        dashStyle: dashStyle,
        lineWidth: 2
      });
      exp = terms[i].mult;
      if (exp > 1) {
        slopeDB = (40*exp).toString();
        phaseLine = (180*exp).toString();
        halfPhaseLine = (90*exp).toString();
      }
      else {
        slopeDB = '40';
        phaseLine = '180';//should it be +90 * exp?
        halfPhaseLine = '90';
      }
      checkBoxesHtml+="<input type='radio' id='"+id+i.toString()+"' onclick=\"onTopCheckOne(this.id)\"></input>";
      checkBoxesHtml+="<label for='"+id+i.toString()+"'>"+name+"</label>";
      checkBoxesHtml += getBox(magSeries[magSeries.length-1].color, id+i.toString())+"<br>";
      desc = 'For the magnitude plot we draw a straight line at 0 dB from up to '+w0Mag+', thereafter the line rises at '+slopeDB+' dB/decade.';
      if (parseFloat(zMag) < 0.5) {
        desc += '<br>Since '+zMag+'<0.5, we draw a peak of '+(-20*exp).toString()+'|log<sub>10</sub>(2&zeta;)| = ';//is this affected by mult?
        desc += terms[i].peakHeight +'dB at &omega; = '+w0Mag+'.';
      }
      magDescs.push(desc);

      desc = 'The phase plot is 0&deg; up to '+w0Mag+'/10<sup>'+zMag+'</sup>, ';
      desc += 'then climbs to '+phaseLine+'&deg; at '+w0Mag+'&middot;10<sup>'+zMag+'</sup> going through '+halfPhaseLine+'&deg; at '+w0Mag+'.';
      desc += '<br><a href="https://lpsa.swarthmore.edu/Bode/BodeHow.html#A%20Complex%20Conjugate%20Pair%20of%20Zeros">Details</a>';
      phaseDescs.push(desc);
      names.push(name);
      termDesc = terms[i].desc;
      magRestDesc += '<li>Add ' +slopeDB+ ' dB/decade to slope at &omega; = '+w0Mag+' due to '+termDesc+'</li>';//+BDO.terms[i].magBreakpt.toString() + '<br>'; 
      if (colorIndex == 1) {
        desc = '<sup>&dagger;</sup>';
      }
      else {
        desc = '';
      }
      w1 = terms[i].lowerBound.toPrecision(3), w2 = terms[i].upperBound.toPrecision(3);
      yEnd = (180*terms[i].mult).toPrecision(3);
      phaseRestDesc += '<li>Add slope of line connecting ('+w1+', 0&deg;)'+desc+' and ('+w2+', '+yEnd+'&deg;)';
      phaseRestDesc += ' to overall slope between &omega; = '+w1 + ' and &omega; = '+w2; 
      phaseRestDesc += ' and add '+ yEnd +'&deg; to the &omega; > ' + w2 + ' section due to '+termDesc+'.</li>';
      colorIndex++;
    }
    else if (terms[i].termType == "ComplexPole") {
      [terms[i].magData, terms[i].phaseData, terms[i].magDataApprox, terms[i].phaseDataApprox] = compConjugateData(w, -1, i);
      terms[i].sign = -1;
      [print, print2] = compToStr(terms[i].value);
      w0Mag = BDO.terms[i].w0.toPrecision(3);
      zMag = BDO.terms[i].zeta.toPrecision(3);
      name = 'Complex Pole, ' + terms[i].tHw + '= '+Math.abs(parseFloat(w0Mag)).toString() + ', ' + terms[i].tHz + ' = ' +zMag + terms[i].mH;
      if (colorIndex > lastSolidTermIndex) {
        dashStyle = 'shortdot';
      }
      magSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].topMagData,
        dashStyle: dashStyle,
        lineWidth: 2
      });
      phaseSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].topPhaseData,
        dashStyle: dashStyle,
        lineWidth: 2
      });
      exp = terms[i].mult;
      if (exp > 1) {
        slopeDB = (40*exp).toString();
        phaseLine = (180*exp).toString();
        halfPhaseLine = (90*exp).toString();
      }
      else {
        slopeDB = '40';
        phaseLine = '180';
        halfPhaseLine = '90'; 
      }
      checkBoxesHtml+="<input type='radio' id='"+id+i.toString()+"' onclick=\"onTopCheckOne(this.id)\"></input>";
      checkBoxesHtml+="<label for='"+id+i.toString()+"'>"+name+"</label>";
      checkBoxesHtml += getBox(magSeries[magSeries.length-1].color, id+i.toString())+"<br>";
      desc = 'For the magnitude plot we draw a straight line at 0 dB from up to '
      desc += w0Mag+', thereafter the line drops at '+slopeDB+' dB/decade.';
      if (zMag < 0.5) {
        desc+= '<br>Since '+zMag+'<0.5, we draw a peak of '+(20*exp).toString()+'|log<sub>10</sub>(2&zeta;)| = ';
        desc += terms[i].peakHeight +' dB at &omega; = '+w0Mag;
      }
      magDescs.push(desc);
      desc = 'The phase plot is 0&deg; up to '+w0Mag+'/10<sup>'+zMag+'</sup>, ';
      desc += 'then climbs to '+phaseLine+'&deg; at '+w0Mag+'&middot;10<sup>'+zMag+'</sup> going through '+halfPhaseLine+'&deg; at '+w0Mag+'.';
      desc += '<br><a href="https://lpsa.swarthmore.edu/Bode/BodeHow.html#A%20Complex%20Conjugate%20Pair%20of%20Zeros">Details</a>';
      phaseDescs.push(desc);
      names.push(name);
      termDesc = terms[i].desc;
      magRestDesc += '<li>Add -' + slopeDB + ' dB/decade to slope at &omega; = '+w0Mag+' due to '+termDesc+'.</li>';//+BDO.terms[i].magBreakpt.toString() + '<br>'; 
      if (colorIndex == 1) {
        desc = '<sup>&dagger;</sup>';
      }
      else {
        desc = '';
      }
      w1 = terms[i].lowerBound.toPrecision(3), w2 = terms[i].upperBound.toPrecision(3);
      yEnd = (-180*terms[i].mult).toPrecision();
      phaseRestDesc += '<li>Add slope of line connecting ('+w1+', 0&deg;)'+desc+' and ('+w2+', '+yEnd+'&deg;)';
      phaseRestDesc += ' to overall slope between &omega; = '+w1 + ' and &omega; = '+w2; 
      phaseRestDesc += ' and add '+ yEnd +'&deg; to the &omega; > ' + w2 + ' section due to '+termDesc+'.</li>';
      colorIndex++;
    }
  }
  topMagSeries = copyObject(magSeries);//same as other series except no allData();
  topPhaseSeries = copyObject(phaseSeries);

  [BDO.allMag, BDO.allPhase, BDO.allMagApprox, BDO.allPhaseApprox] = allData(w, terms);
  magSeries.push({
    name: 'Total Magnitude Approximation',
    color: blackRGBA,
    data: BDO.allMagApprox,
    dashStyle: 'shortdot',
    lineWidth: 2
  });
  phaseSeries.push({
    name: 'Total Phase Approximation',
    color: blackRGBA,
    data: BDO.allPhaseApprox,
    dashStyle: 'shortdot',
    lineWidth: 2
  });
  let magLen = magSeries.length, phaseLen = phaseSeries.length;
  //use series aleady generated to get series for 'putting it all together' graph
  //unlike the one at the top, these ones will include the magnitude and phase plots of all the
  //individual terms combined.
  togetherMagSeries = updateSeriesTransparency(copyObject(magSeries), bold, 1);
  togetherPhaseSeries = updateSeriesTransparency(copyObject(phaseSeries), bold, 1);
  togetherMagSeries[0].lineWidth = 2;
  togetherPhaseSeries[0].lineWidth = 2;
  //bothTotalMagSeries only contains the combined (or 'total') series.
  bothTotalMagSeries.push({
    name: 'Total Magnitude',
    color: blackRGBA,
    data: BDO.allMag, 
    dashStyle: 'Solid',
    lineWidth: 2
  });
  bothTotalPhaseSeries.push({
    name: 'Total Phase',
    color: blackRGBA,
    data: BDO.allPhase,
    dashStyle: 'Solid',
    lineWidth: 2 
  });
  bothTotalMagSeries.push(magSeries[magLen-1]);
  bothTotalPhaseSeries.push(phaseSeries[phaseLen-1]);

  //set html for descriptions for the topmost graph (individual plots),
  //the plot of all term data combined, and the checkboxes for the topmost graph.
  let togetherMagHtml = magLeftMostPointDesc+ " then the starting magnitude on the left side is " + magLeftMostPointFormula;
  togetherMagHtml += " and the initial slope is "+initialMagSlope.toString() + " dB per decade.";
  togetherMagHtml += "<ul>"+magRestDesc+"</ul>";
  let togetherPhaseHtml = magLeftMostPointDesc+" then the starting phase on the left side is "+phaseLeftMostPointFormula+".<ul>"+phaseRestDesc+".</ul><br><small><sup>&dagger;</sup>(&omega; , &theta;)</small>";
  //togetherHtml += 'with a slope of '+ BDO.startslope + 'dB per decade.';
  //DO this tomorrow. slope will be 0 + -20dB/decade*mult + 20dB/decade*mult (I think)
  //need to add starting slope right after magLeftMostPointDesc.
  colorIndex++;
  document.getElementById('individualGraphOptions').innerHTML = checkBoxesHtml+"</div";
  document.getElementById('togetherMagDesc').innerHTML = togetherMagHtml;
  document.getElementById('togetherPhaseDesc').innerHTML = togetherPhaseHtml;
  document.getElementById('topDescription').innerHTML = magDescs[0]+'<br>'+phaseDescs[0];
  let xAxis = '&omega;, rad/S';
  let yAxisMag = '|H(j&omega;)|, dB';
  let yAxisPhase = '&ang;H(j&omega;), &deg;';
  let plotStart = new Date().getTime();
  //draw plots.
  BDO.individualMagChart = highchartsPlot(topMagSeries, 'individualMag', '<b>Magnitude Plot</b>', xAxis, yAxisMag);
  BDO.individualPhaseChart = highchartsPlot(topPhaseSeries, 'individualPhase', '<b>Phase Plot</b>', xAxis, yAxisPhase, 'logarithmic', 90);
  highchartsPlot(togetherMagSeries, 'togetherMagPlot', '<b>Magnitude Plot</b>', xAxis, yAxisMag);
  highchartsPlot(togetherPhaseSeries, 'togetherPhasePlot', '<b>Phase Plot</b>', xAxis, yAxisPhase, 'logarithmic', 90);
  console.log((new Date().getTime() - plotStart).toString()+ " ms for plot")

  /*add series and descriptoins to BDO object 
  so we can use them in other functions*/
  BDO.magSeries = magSeries;
  BDO.phaseSeries = phaseSeries;
  BDO.topMagSeries = topMagSeries;
  BDO.topPhaseSeries = topPhaseSeries;
  BDO.bothTotalMagSeries = bothTotalMagSeries;
  BDO.bothTotalPhaseSeries = bothTotalPhaseSeries;
  BDO.magDescs = magDescs;
  BDO.phaseDescs = phaseDescs;
  BDO.namesOfIds = names;
  BDO.omega = document.querySelector('#freqInput');
  BDO.phi = document.querySelector('#phaseInput');
}
//returns array containing the endpoints of an array.
function getEndpoints (arr) {
  return [arr[0], arr[arr.length-1]];
}
//set event listeners for DOM events 
function setEventListeners() {
  //set e listeners triggered by 'Enter' key released in input field 
  //for numerator, denominator, or constant 
  const numerator = document.getElementById('N_of_s');
  const denominator = document.getElementById('D_of_s');
  const constant = document.getElementById('multConst');
  numerator.addEventListener('keyup', bdoKeyupHandler);
  denominator.addEventListener('keyup', bdoKeyupHandler);
  constant.addEventListener('keyup', bdoKeyupHandler);

  //set e listeners triggered by input in the field for 
  //frequency or phase input next to the sinusoid graph
  const freqSource = document.getElementById('freqInput');
  const phaseSource = document.getElementById('phaseInput');
  freqSource.addEventListener('input', freqInputHandler);
  freqSource.addEventListener('propertychange', freqInputHandler);
  freqSource.addEventListener('keyup', sinusoidEnterHandler);
  phaseSource.addEventListener('input', phaseInputHandler);
  phaseSource.addEventListener('propertychange', phaseInputHandler);
  phaseSource.addEventListener('keyup', sinusoidEnterHandler);
}
//when value in frequency field changes, update the thml showing the potential input.
function freqInputHandler(event) {
  let omega = event.target.value;
  let phi = document.getElementById('phaseInput').value;
  document.getElementById('sinusoidInput').innerHTML = 'cos('+omega+' &middot; t + '+phi+')';  
}
//when value in phase field changes, update the thml showing the potential input.
function phaseInputHandler(event) {
  let omega = document.getElementById('freqInput').value;
  let phi = event.target.value;
  document.getElementById('sinusoidInput').innerHTML = 'cos('+omega+' &middot; t + '+phi+')';
}
//handle keyup event in input field 
//for numerator, denominator, or constant 
function bdoKeyupHandler() {
  if (event.keyCode == 13) {//enter key pressed inside numerator, denominator, or constant input field
    BDOupdate(1);
  }
}
//if the keyup event in the frequency or phase input field is the 'Enter' key,
//call the function which graphs the sinusoid.
function sinusoidEnterHandler(event) {
  if (event.keyCode == 13) {//enter key
    graphSinusoid();
  }
}
/* graphs a cosine function based on frequency and phase inputted by the user and 
  the transfer function. also graphs exact and linear approximation of all magnitude & phase plots
  combined into one series. add red dot to mag & phase plots to indicate the frequency inputted by the user.*/
function graphSinusoid () {
  let start = new Date().getTime();
  let wIndex, mag, phase, html, theta, phi = parseFloat(BDO.phi.value), omega = parseFloat(BDO.omega.value);
  let inputData = [], outputData = [], t = [], series, period, tMin, tMax, tInterval, tCount, tLen, ptNum;//wish I had malloc.
  /*omega stores inputted frequency, phi stores input phase; theta stores phase calculated 
  from transfer function at the inputted frequency, & phase is phi+theta.*/
  if (isNaN(omega) || isNaN(phi) || omega <= 0) {
    alert('You must specify a numerical value for frequency and phase. The frequency must be positive.');
    return;
  }
  if (omega*10 == Math.trunc(omega*10)) {//will this ever not work?
    wIndex = BDO.w.indexOf(roundDecimal(omega, 1));
  }
  else {
    wIndex = -1;
  }
  /*if omega to the 1s decimal place of our frequency input list & only has one decimal place, 
  then just use the data points we generated in getData() to get the magnitude and phase from the transfer function.
  (would it be easier to just say BDO.w.indexOf(omega), or check if it has 1 decimal first.)*/
  if (wIndex > -1) {
    mag = dbToNumber(BDO.allMag[wIndex][1]).toPrecision(3);
    theta = BDO.allPhase[wIndex][1];
    phase = convertToUnitCircleRange(theta + phi);
    if (phase > 0) {
      phase = phase.toPrecision(3);
      html = mag+' &middot; cos('+BDO.omega.value+' &middot; t + '+phase+')';
    }
    else {
      phase = phase.toPrecision(3);
      html = mag+' &middot; cos('+BDO.omega.value+' &middot; t - '+Math.abs(phase)+')';
    }
  }
  else {
    /*if omega is not inside our frequency input point list, 
    use this function to get the magnitude & phase */
    [html, mag, phase] = getSinusoid(omega, phi);
  }
  //convert phase from input & phase combining transfer function phase & input phase to radians
  let phiRad = deg2Radians(phi);
  let phaseRad = deg2Radians(phase);
  html+= '<br><br>Magnitude: ' + mag + ' dB<br>' + 'Phase: '+phase+' &deg;';
  document.getElementById('sinusoidOutput').innerHTML = html;
  //construct array of input values (t) for sinusoid graph: #1184-1193
  tMax = parseFloat((20/(Math.pow(10, (Math.round(Math.log10(omega)))))).toPrecision(3));//Math.ceil(period*3);
  ptNum = 1000;
  tInterval = truncDecimal(tMax/ptNum, 10);
  tCount = 0;
  //while(tCount<tMax) {
  for (let i=0; i<ptNum; i++) {
    tCount = truncDecimal(tCount + tInterval, 10);
    t.push(tCount);
  }
  //construct array of data points for chart of input & output sinusoid
  tLen = t.length;
  for (let i=0; i<tLen; i++) {
    inputData.push([t[i], Math.cos(omega*t[i] + phiRad)]);
    outputData.push([t[i], mag*Math.cos(omega*t[i] + phaseRad)]);
  }
  series = [{
    name: 'Input',
    color: 'rgba(240, 52, 52, 1)',
    data: inputData,
    lineWidth: 2
  }, {
    name: 'Output',
    color: 'rgba(0, 0, 0, 1)',
    data: outputData,
    lineWidth: 2
  }];
  let chart = BDO.sinusoidChart;
  let bothTotalMagSeries = BDO.bothTotalMagSeries;
  let bothTotalPhaseSeries = BDO.bothTotalPhaseSeries;
  omega = roundDecimal(omega, 1);

  let magExact = bothTotalMagSeries[0].data;
  let magApprox = bothTotalMagSeries[1].data;
  let phaseExact = bothTotalPhaseSeries[0].data;
  let phaseApprox = bothTotalPhaseSeries[1].data;
  wIndex = getWIndex(omega);
  //if red dot already exists, remove it. don't want to retain red dot from last series we graphed.
  if (bothTotalMagSeries[3]) {
    bothTotalMagSeries.pop();
    bothTotalMagSeries.pop();
    bothTotalPhaseSeries.pop();
    bothTotalPhaseSeries.pop();
    BDO.bothMagChart.series[3].remove();
    BDO.bothMagChart.series[2].remove();
    BDO.bothPhaseChart.series[3].remove();
    BDO.bothPhaseChart.series[2].remove();//remove previous
  }
  // if no red dot in series, add one.
  if (!bothTotalMagSeries[3] && wIndex > -1) {
    bothTotalMagSeries.push({
      name: "point",
      data: [[omega, magExact[wIndex][1]]], 
      color: 'rgba(255,99,71, 1)'
    });
    bothTotalMagSeries.push({
      name: "point Approx",
      data: [[omega, magApprox[wIndex][1]]], 
      color: 'rgba(255,99,71, 1)'
    });
    bothTotalPhaseSeries.push({
      name: "point",
      data: [[omega, phaseExact[wIndex][1]]], 
      color: 'rgba(255,99,71, 1)'
    });
    bothTotalPhaseSeries.push({
      name: "point Approx",
      data: [[omega, phaseApprox[wIndex][1]]], 
      color: 'rgba(255,99,71, 1)'
    });
    if (chart) {
      //if a sinusoid chart has already been made at some point, then update
      //the total phase & mag plots below it to include the red dot.
      BDO.bothMagChart.addSeries(bothTotalMagSeries[2]);
      BDO.bothMagChart.addSeries(bothTotalMagSeries[3]);
      BDO.bothPhaseChart.addSeries(bothTotalPhaseSeries[2]);
      BDO.bothPhaseChart.addSeries(bothTotalPhaseSeries[3]);  
    }
  }
  if (chart) {
    /*sinusoid chart already made, then update all three charts
    to graph the data points we have calcluated.*/
    tMin = inputData[0][0];
    tMax = inputData[inputData.length-1][0];
    //max dependent value in sinusoid chart will at least 1 or the amplitude of 
    //the output sinusoid.
    let yMax = Math.max(1, Math.abs(parseFloat(mag)));
    let yMin = -1*yMax;
    chart.update({series: series, xAxis: {min: tMin, max: tMax}, yAxis: {min: yMin, max: yMax}});
    BDO.bothMagChart.update({series: bothTotalMagSeries});
    BDO.bothPhaseChart.update({series: bothTotalPhaseSeries});
  }
  else {//make new charts.
    BDO.sinusoidChart = highchartsPlot(series, 'sinusoidPlot', '<b>Sinusoids</b>', 'Time', 'Dependent Variable', 'linear');
    BDO.bothMagChart = highchartsPlot(bothTotalMagSeries, 'bothTotalMag', '<b>Total Magnitude Plot</b>', '&omega;, rad', '|H(j&omega;)|, dB');
    BDO.bothPhaseChart = highchartsPlot(bothTotalPhaseSeries, 'bothTotalPhase', '<b>Total Phase Plot</b>', '&omega;, rad', '&ang;H(j&omega;), &deg;', 'logarithmic', 90);
  }
  BDO.bothTotalMagSeries = bothTotalMagSeries;
  BDO.bothTotalPhaseSeries = bothTotalPhaseSeries;
  console.log((new Date().getTime() - start.toString()) + 'ms');
}

//when a checkbox near the topmost graph is checked,
//if user didn't click same box twice, then uncheck last box & call function to change which 
//line/series is transparent & which is opaque
function onTopCheckOne (id) {
  let termNum = parseInt(id.slice(id.indexOf(':')+1));//number of term represented by current clicked checkbox
  let lastTermNum = BDO.lastClickedTopBoxTermNum;//number of term represented by last checkbox clicked
  if (lastTermNum != termNum) {
    document.getElementById('topTerm:'+lastTermNum.toString()).checked = 0;
    topButtonHandler(termNum, lastTermNum);
    BDO.lastClickedTopBoxTermNum = termNum;
  }
}
/*input series item, returns series item with color attribute
  of 'alpha' transparency. 'alpha' variable contains  a number inside a string, 
  lower is more transparent, higher is more opaque*/
function updateTransparency (item, alpha) {
  let rgba = item.color;
  let alphaStart = rgba.lastIndexOf(',');
  rgba = rgba.slice(0, alphaStart+1) + alpha + ')';
  item.color = rgba;
  return item;
}
//update the transparency of every item in a series.
function updateSeriesTransparency(series, alpha, startIndex=0, endIndex=series.lenght-1) {
  for (let i=startIndex; i<endIndex+1; i++) {
    series[i] = updateTransparency(series[i], alpha);
  }
  return series;
}
/* When the checkbox that is selected is swiched, this function changes the graph
for the corresponding term in the topmost plot such that it will be more opaque and thicker. 
It makes the series that was previously selected more transparent and thinner.*/
function topButtonHandler (termNum, last) {
  const names = BDO.namesOfIds;
  var series = BDO.topMagSeries, series2 = BDO.topPhaseSeries, magDescs = BDO.magDescs, phaseDescs = BDO.phaseDescs;
  var magDescShown, phaseDescShown, bold = BDO.bold, faded = BDO.faded, xAxis, 
  magChart = BDO.individualMagChart, phaseChart = BDO.individualPhaseChart;
  let boxId = "topTerm:"+termNum.toString()+" box";
  let lastBoxId = "topTerm:"+last.toString()+" box";
  //change transparency in the series for the phase and frequency plot of the newly selected term
  series[termNum] = updateTransparency(series[termNum], bold);
  series2[termNum] = updateTransparency(series2[termNum], bold);
  magDescShown = magDescs[termNum];
  phaseDescShown = phaseDescs[termNum];
  updateBox(series[termNum].color, boxId);//change color of box next to newly selected term

  //change transparency in the series for the phase and frequency plot of the previously selected term
  series[last] = updateTransparency(series[last], faded);
  series2[last] = updateTransparency(series2[last], faded);
  updateBox(series[last].color, lastBoxId);  //change color of box next to previously selected term
  xAxis = '&omega;, rad/S';

  //update chart so it reflects the changes we made to the series.
  let start = new Date().getTime();//1553 ms.
  magChart.series[termNum].update({color: series[termNum].color, lineWidth: 4});
  magChart.series[last].update({color: series[last].color, lineWidth: 2});
  phaseChart.series[termNum].update({color: series2[termNum].color, lineWidth: 4});
  phaseChart.series[last].update({color: series2[last].color, lineWidth: 2});
  let time = new Date().getTime() - start;
  console.log(time.toString() + ' ms');
  //update description for topmost graph to describe the newly selected term
  document.getElementById('topDescription').innerHTML = magDescShown+'<br>'+phaseDescShown;
}
//rounds a number to a # 'decimal' of decimal places.
function roundDecimal (num, decimalPlaces) {
  var a = Math.pow(10, decimalPlaces);
  return (Math.round(num*a)/a);
}
//truncates a number to a # 'decimal' of decimal places.
function truncDecimal (num, decimalPlaces) {
  var a = Math.pow(10, decimalPlaces);
  return (Math.trunc(num*a)/a);
}
//converts radians to degrees.
function rad2Degrees(rad) {
  return (rad/Math.PI)*180;
}
//converts degrees to radians.
function deg2Radians(deg) {
  return (deg/180)*Math.PI;
}
//converts decibals to a unitless number
function dbToNumber(db) {
  return Math.pow(db/20, 10);
}
/* If number w exists in the array of input frequencies, return its
  index in this array. Otherwise, return -1. */
function getWIndex (w) {//w values from 0.1 to 1001. 
  let wArray = BDO.w;
  let len = wArray.length;
  let search = roundDecimal(w, 1);
  for (let i=0; i<len; i++) {
    if (search == wArray[i]) {
      return i;
    }
  }
  return -1;
}
//convert an angle < -179 degrees or > 180 degrees to
//a value between -179 degrees and 180 degrees
//why not 0-360?
function convertToUnitCircleRange(deg) {
    while (deg > 180) {
      deg -= 360;
    } 
    while (deg <= -180) {//why not < -180?
      deg += 360;
    }
    return deg;
}
//takes an object {re: 'a', im: 'b'} & returns a string 'a+bi'
function compToStr(comp) {
  let print, print2;//print includes '&plusmn;', print2 uses '+/-'
  let imagPart = parseFloat(comp.im);
  if (imagPart == -1.00 || imagPart == 1.00) {
    print = comp.re + ' &plusmn; i ';
    print2 = comp.re + ' +/- i ';
  }
  else {
    imagPart = Math.abs(imagPart).toString();
    print = comp.re + ' &plusmn; ' + imagPart + 'i';
    print2 = comp.re + ' +/- ' + imagPart + 'i';
  }
  return [print, print2];
}
/*gets data points for zero at origin or pole at origin
in a form that highcharts can graph
w: array of values for independent variable (frequency)
sign: 1 or -1 to signify if data is for a zero or pole at the origin.
termIndex: index of the term whose data it finds.
*/
function originData(w, sign, termIndex) {
  let magData = [], phaseData = [], wLen = BDO.wLen;
  let exp = BDO.terms[termIndex].mult //multiplicity of term
  //calculate magnitude & phase:
  for (let i=0; i<wLen; i++) {
    magData.push([w[i], 20*exp*sign*Math.log10(w[i])]);
    phaseData.push([w[i], sign*exp*90]);
  }
  //get formula string which will be added to a description
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
/*gets data points for real zero or real pole
  in a form that highcharts can graph
  w: array of values for independent variable (frequency)
  sign: 1 or -1 to signify if data is for a zero or pole at the origin.
  termIndex: index of the term whose data it finds.
*/
function realData (w, sign, termIndex) {
  let w0 = BDO.terms[termIndex].w0;
  let magApproxData = [], phaseApproxData = [], magExactData = [], phaseExactData = [], wLen = BDO.wLen;
  let exp = BDO.terms[termIndex].mult;//multiplicity of term 
  let lowerBound =  BDO.terms[termIndex].lowerBound, upperBound = BDO.terms[termIndex].upperBound;//0.1*w0 & 10*w0
  let middleDenominator = Math.log10(upperBound/lowerBound), theta, x;
  BDO.terms[termIndex].midPhaseSlope = '90&middot;'+exp.toString()+'/'+middleDenominator.toString();//how to calculate? want a per-decade measurement.
  BDO.terms[termIndex].endPhaseSlope = '90&middot;'+exp.toString();
  let topMagData = [[w[0], 0], [roundDecimal(w0, 1), 0]];
  let topPhaseData = [[w[0], 0], [roundDecimal(lowerBound, 1), 0], [roundDecimal(upperBound, 1), sign*exp*90]];
  BDO.terms[termIndex].magBreakpt = w0;
  BDO.terms[termIndex].magSlope = sign*20*exp;
  
  for (let j=0; j<wLen; j++) {
    //calculate magnitude (dB) approximation:
    x = w[j]/w0;
    if (w[j]<= w0) {
      magApproxData.push([w[j], 0]);
    }
    else if (w[j]>w0) {
      magApproxData.push([w[j], sign*20*exp*Math.log10(x)]);
    }
    BDO.terms[termIndex].magBreakpt = w0;
    BDO.terms[termIndex].magSlope = sign*20*exp;
    //calculate exact magnitude (dB):
    magExactData.push([w[j], sign*20*exp*Math.log10(Math.pow((1 + x*x), 0.5))]);
    //calculate phase (degrees) approximation
    if (w[j]<lowerBound) {
        phaseApproxData.push([w[j], 0]);
    }
    else if (w[j]>upperBound) {
      phaseApproxData.push([w[j], sign*exp*90]);
    }
    else {
      theta = (Math.log10(w[j]/lowerBound)/middleDenominator)*sign*exp*90;
      phaseApproxData.push([w[j], theta]);
    }
    //calculate exact phase (degrees): 
    theta = rad2Degrees(sign*exp*Math.atan2(w[j], w0));
    phaseExactData.push([w[j], theta]);
  }
  topMagData.push(magApproxData[magApproxData.length-1]);
  topPhaseData.push(phaseApproxData[phaseApproxData.length-1]);
  BDO.terms[termIndex].topMagData = topMagData;
  BDO.terms[termIndex].topPhaseData = topPhaseData;
  
  //get formula string which will be added to a description
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
  return [magExactData, phaseExactData, magApproxData, phaseApproxData];
}
/*gets data points for a pair of complex conjugate zeros or 
  a pair of complex conjuage poles in a form that highcharts can graph
  w: array of values for independent variable (frequency)
  sign: 1 or -1 to signify if data is for a zero or pole at the origin.
  termIndex: index of the term whose data it finds.
*/
function compConjugateData (w, sign, termIndex) {
  let realPart = BDO.terms[termIndex].realPart;//real part of zero or pole
  let imagPart = BDO.terms[termIndex].imagPart;//imaginary part of zero or pole
  let w0 = BDO.terms[termIndex].w0;//sqrt(realPart*realPart + imagPart*imagPart);
  let w0Rounded = roundDecimal(w0, 1);//round to 1 decimal place.
  let magApproxData = [], phaseApproxData = [], magExactData = [], phaseExactData = [];
  let exp = BDO.terms[termIndex].mult;//multiplicity of term 
  let zetaTemp = BDO.terms[termIndex].zeta,//damping ratio
  jMax = BDO.wLen, x, peak; 
  let lowerBound = BDO.terms[termIndex].lowerBound;//lowerBound = w0/(10^|zeta|)
  let upperBound = BDO.terms[termIndex].upperBound;//upperBound = w0*(10^|zeta|)
  let middleDenominator = Math.log10(upperBound/lowerBound);
  let theta, breakW;
  BDO.terms[termIndex].magBreakpt = w0Rounded;
  BDO.terms[termIndex].magSlope = sign*20*exp;
  if (zetaTemp < 0) {
    alert('A negative damping ratio is not permitted');
  }
  //breakW is w-coordinate for inflection poiont where horizontal and slanted part of magnitude plot approximation meet
  breakW = w0Rounded;//w coordinate where horizontal and slanted part meet
  let topMagData = [[w[0], 0], [w0Rounded, 0]];
  let topPhaseData = [[w[0], 0], [roundDecimal(lowerBound, 1), 0], [roundDecimal(upperBound, 1), sign*exp*180]];
  //0 undershoots offset, approx is below exact. breakW-1 might overshoot it?
  let offset = w0-1;//since logs normally intersects at x=1, to shift to breakW have to subtract breakW-1.s
  //calculate approximate Magnitude:
  let wJIsPointAtTopOfVerticalLine = 0;
  if (zetaTemp < 0.5) {//magnitude plot will have a peak
    let afterBreak = roundDecimal(breakW + BDO.peakWidth, 5);
    for (let j=0; j<jMax; j++) {
      x = w[j];
      if (x < breakW || x == afterBreak) {//horizontal part of magnitude plot approximation
        magApproxData.push([x, 0]);
      }
      else if (x > breakW) {//slanted part of magnitude plot approximation
        magApproxData.push([x, sign*40*exp*Math.log10(x/w0)]);//x-offset
      }
      else if (x == breakW) {//peak where horizontal and slanted line join
        if (!wJIsPointAtTopOfVerticalLine) {
          magApproxData.push([x, 0]);//bottom of line
          topMagData.push(magApproxData[j]);
          wJIsPointAtTopOfVerticalLine = 1;
        }
        else if (wJIsPointAtTopOfVerticalLine) {
          peak = 20*sign*-1*exp*Math.abs(Math.log10(2*Math.abs(zetaTemp)));//top of vertical line.
          //the peak will be opposite in sign to the non-zero part of the equation.
          magApproxData.push([x, peak]);
          topMagData.push(magApproxData[j]);
          topMagData.push([w[j+1], 0]);
          BDO.terms[termIndex].peakHeight = peak.toPrecision(3);
        }
      }
    }
  }
  else if (zetaTemp >= 0.5) {//no peak for magnitude plot approximation
    for (let j=0; j<jMax; j++) {
      x = w[j];
      if (x <= breakW) {
        magApproxData.push([x, 0]);
      }
      else if (x > breakW) {//x-offset
        magApproxData.push([x, sign*40*exp*Math.log10(x/w0)]);
      }
    }
  }
  //exact Magnitude version calculation starts here:
  //realPart + imagPart*i, realPart = 1-(w[j]/w0)^2, imagPart = 2*zeta*w[j]/(w0) 
  for (let j=0; j<jMax; j++) {
    realPart = 1-Math.pow((w[j]/w0), 2);
    imagPart = 2*zetaTemp*(w[j]/w0);
    x = Math.sqrt(realPart*realPart+imagPart*imagPart);//numerical magnitude |a+ib|
    magExactData.push([w[j], sign*20*exp*Math.log10(x)]);
  }
  BDO.terms[termIndex].midPhaseSlope = '180*'+exp.toString()+'/'+middleDenominator.toString();//how to calculate? want a per-decade measurement.
  BDO.terms[termIndex].endPhaseSlope = '180*'+exp.toString();
  //calculate phase approximation (sigmoid linear approximation):
  for (let j=0; j<jMax; j++) {
    x = w[j];
    //calculate three componets of approximation using w-coordinates of inflection points (lowerBound, upperBound)
    if (x < lowerBound) {//first horizontal componet
      phaseApproxData.push([x, 0]);
    }
    else if (x > upperBound) {//second horizontal componet
      phaseApproxData.push([x, sign*exp*180]);
    }
    else {//add slanted componet joining the two horizontal ones
      theta = (Math.log10(x/lowerBound)/middleDenominator)*sign*exp*180;
      phaseApproxData.push([x, theta]);
    }
  }
  //exact phase version starts here: 
  for (let j=0; j<jMax; j++) {
    x = w[j]
    realPart = 1-Math.pow((x/w0), 2);
    imagPart = 2*zetaTemp*x/w0;
    //is Math.abs() because we didn't normalize the degrees?
    phaseExactData.push([x, sign*exp*Math.abs(rad2Degrees(Math.atan2(imagPart, realPart)))]);
  }
  topMagData.push(magApproxData[magApproxData.length-1]);
  topPhaseData.push(phaseApproxData[phaseApproxData.length-1]);
  BDO.terms[termIndex].topMagData = topMagData;
  BDO.terms[termIndex].topPhaseData = topPhaseData;

  //get formula string which will be added to a description
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
  return [magExactData, phaseExactData, magApproxData, phaseApproxData];
}
//add data points for each term together to get a phase and magnitude plot of all the terms combined.
//(do this for both linear approximations and exact values)
function allData(w, terms) {
  let magApproxData = copyObject(terms[0].magDataApprox),
  phaseApproxData = copyObject(terms[0].phaseDataApprox),
  magExactData = copyObject(terms[0].magData),
  phaseExactData = copyObject(terms[0].phaseData), wLen = BDO.wLen, iLen = BDO.termsLen;
  //calculate magnitude & phase total data points for when both magnitude and phase have the same length:
  if (magExactData.length == phaseExactData.length) {
    for (let i=1; i<iLen; i++) {
      for (let j=0; j<wLen; j++) {
        magExactData[j] = [w[j], magExactData[j][1]+terms[i].magData[j][1]];
        magApproxData[j] = [w[j], magApproxData[j][1]+terms[i].magDataApprox[j][1]];
        phaseExactData[j] = [w[j], phaseExactData[j][1]+terms[i].phaseData[j][1]];
        phaseApproxData[j] = [w[j], phaseApproxData[j][1]+terms[i].phaseDataApprox[j][1]];
      }
    }
  }
  else {//calculations for if magnitude and phase have the different lengths
    let jLen = magExactData.length;
    for (let i=1; i<iLen; i++) {
      for (let j=0; j<jLen; j++) {
        magExactData[j] = [w[j], magExactData[j][1]+terms[i].magData[j][1]];
        magApproxData[j] = [w[j], magApproxData[j][1]+terms[i].magDataApprox[j][1]];
      }
    }
    jLen = phaseExactData.length;
    for (let i=1; i<iLen; i++) {
      for (let j=0; j<wLen; j++) {
        phaseExactData[j] = [w[j], phaseExactData[j][1]+terms[i].phaseData[j][1]];
        phaseApproxData[j] = [w[j], phaseApproxData[j][1]+terms[i].phaseDataApprox[j][1]];
      }
    }
  }
  return [magExactData, phaseExactData, magApproxData, phaseApproxData];
}

/*function that returns a copy of the object obj
 if we just assign an object to a variable, the variable gets a reference. 
 Before I used this function, changing the transparency of a term 
 in the topmost plot would also change that of the term in the 'putting it all together' plot*/
function copyObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}
//returns html describing a box of 'rgba' colors.
function getBox(rgba, name) {
  let id = name + " box";
  let box = "<div id='"+id+"' style='width:10px; height:10px; margin:5px; ";
  box += "background-color:"+rgba+"; display:inline-block;'></div>";
  return box;
}
//updates the background color of box w/ id 'boxId' 
function updateBox(rgba, boxId) {
  document.getElementById(boxId).style.backgroundColor = rgba;
}
/*uses frequency & phase input from the user (omega, phi) to calculate magnitude & phase values for output sinusoid
  and the html string to describe it*/  
function getSinusoid(omega, phi) {
  let terms = BDO.terms, phase, sign, exp, w0, x, a, b, realPart, imagPart, zetaTemp;
  let mag = terms[0].magData[0][1];
  let theta = terms[0].phaseData[0][1];
  let iLen = BDO.termsLen;
  /*loop through terms & calculate the exact magnitude & phase of the transfer funciton at the input frequency  
    formulas are the same as in originData(), realData(), compConjugateData() */
  for (let i=1; i<iLen; i++) {
    sign = terms[i].sign;
    exp = terms[i].mult;//term's multiplicity
    w0 = terms[i].w0;
    zetaTemp = terms[i].zeta;//damping ratio
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
      imagPart = 2*zetaTemp*(omega/w0);
      x = Math.sqrt(realPart*realPart+imagPart*imagPart);//magnitude |a+jb|
      mag += sign*20*exp*Math.log10(x);
      x = w[j]
      realPart = 1-Math.pow((x/w0), 2);
      imagPart = 2*zetaTemp*x/w0;
      //is Math.abs() because we didn't normalize the degrees?
      theta += sign*exp*Math.abs(rad2Degrees(Math.atan2(imagPart, realPart)));
    }
  }
  phase = convertToUnitCircleRange(phi+theta);
  mag = dbToNumber(mag).toPrecision(3);
  omega = omega.toPrecision(3);
  phase.toPrecision(3);
  return [mag +' &middot; cos('+omega+' rad &middot; t '+phase+'&deg;)', parseFloat(mag), parseFloat(phase)];
}
//plot a given series on an html element of an id of 'id'. 
function highchartsPlot (series, id, title, xAxis='&omega;, rad', yAxis, logOrLinear='logarithmic', tickInt) {
  let legend = false, data = series[0].data, chartType = 'scatter', showMarkers = false;
  let xMax = data[data.length-1][0], xMin = data[0][0], height = null;
  if (id == "bothTotalMag" || id == "bothTotalPhase") {
    //only bottommost graphs showing combined magnitude & phase plots (exact & linear approximation)
    //show the markers on the graph & are a 'line' type. other charts are scatter plots.
    showMarkers = true;
    chartType = 'line';
  }
  //only enable legend for plot of the sinusoid
  if (id == 'sinusoidPlot') {
    legend = true;
  }
  //calculate height of plot for individual (topmost) & 'Putting it all together' plot.
  if (id.indexOf('individual') > -1 || id.indexOf('together') > -1) {
    height = Math.trunc(0.82*window.innerHeight/2);//83vh/2
  }
  if (title.indexOf('Magnitude') > -1) {
    tickInt = 20;//interval between ticks for magnitude plots
  }
  //make chart:
  let chart = Highcharts.chart(id, {
    chart: {
        type: chartType,//'line' or 'scatter'
        spacing: [10, 0, 15, 0],//top, right, bottom, left spacing
        height: height
    },
    series: series,
    title: {
        text: title,
        useHTML: true,
        style: {
          color: '#333333',
          fontSize: '0.5em'
        }
    },
    tooltip: {
      enabled: false
    },
    xAxis: {
      type: logOrLinear,//'logarithmic' or 'linear' for type
      title: {
          enabled: true,
          text: xAxis,
          useHTML: true
      },
      startOnTick: true,
      endOnTick: true,
      showLastLabel: true,
      gridLineWidth: 1,
      max: xMax,
      min: xMin
    },
    yAxis: {
      type: 'linear',
      tickInterval: tickInt,
        title: {
            text: yAxis,
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
            zIndex: 20,
            enabled: legend
        },
    plotOptions: {
        scatter: {
            marker: {
                radius: 5,
                enabled: showMarkers,
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
        }
    }
  });
  return chart;
}