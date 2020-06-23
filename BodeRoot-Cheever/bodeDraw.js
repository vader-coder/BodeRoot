'use strict';

var BDO; // Bode Draw Object

// Create Bode Draw Object
function BDO_Obj() {
    this.num = ''; // Numerator polynomial
    this.den = ''; // Denominator polynomial
    this.C = ''; // Value of constant C
    this.K = ''; // Value of K
    this.terms = ''; // object that holds all the terms.
    this.prec = 3; // precision for rounding
    this.numTerms = 0; // number of terms
    this.w = [];//input for graphs.
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
    this.freqData = [];//array for containing the data that will be graphed in frequency plot..
    this.phaseData = [];//array for containing data for phase plot
    this.freqDataApprox = [];//approximation of frequency data.
    this.phaseDataApprox = [];//approximation of frequency data.
    this.zeta = 0;//for real & imaginary, zeta is not relevant.
}

// Reset function
$(function () {
    BDO = new BDO_Obj(); // Create object.
    BDOupdate();
});

// function called when polynomial is changed.
function BDOupdate() {
    getTerms();
    //getData();
    dispTerms();
    getData();
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
    terms[0].t2 = 'K'; // TeX for form 2 (1+s/wp1)^m
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
            terms[i].tXw = `\\omega_{p${idx}}`;
            terms[i].tHw = `&omega;<sub>p${idx}</sub>`;
            terms[i].t1X = `(s + ${terms[i].tXw})${to_m(m)}`;
            terms[i].t2X = `(1 + s/${terms[i].tXw})${to_m(m)}`;
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
            terms[i].mH = m == 1 ? '' : `, of muliplicity ${m}`; // multiplicity phrase
            BDO.terms[j++] = terms[i];
        }
    }
    for (let i = 1; i < BDO.numTerms; i++) {
        if (terms[i].termType == 'OriginPole') {
            let m = terms[i].mult
            terms[i].t1X = `\\left( \\frac{1}{s} \\right)${to_m(m)}`;
            terms[i].t2X = `\\left( \\frac{1}{s} \\right)${to_m(m)}`;
            terms[i].mH = m == 1 ? '' : `, of muliplicity ${m}`; // multiplicity phrase
            BDO.terms[j++] = terms[i];
        }
    }
    for (let i = 1; i < BDO.numTerms; i++) {
        if (terms[i].termType == 'OriginZero') {
            let m = terms[i].mult
            terms[i].t1X = `s${to_m(m)}`;
            terms[i].t2X = `s${to_m(m)}`;
            terms[i].mH = m == 1 ? '' : `, of muliplicity ${m}`; // multiplicity phrase
            BDO.terms[j++] = terms[i];
        }
    }



    console.log(BDO);
}

//updates BDO object to contain data for each term.
function getData() {
  let terms = BDO.terms;
  let w = BDO.w, constantK = parseInt(BDO.K);
  let constFreq = [], constPhase = [];
  for (let i=1; i<10001; i++) {
    w.push(roundDecimal(i*0.1, 1));//w.push(roundDecimal(1+ i*0.1, 1)); might want multiple versions of this.
    constFreq.push([w[i-1], 20*Math.log10(constantK)]);
  }
  if (constantK > 0) {
    for (let i=0; i<w.length; i++) {
      constPhase.push([w[i], 0]);
    }
  }
  else if (constantK < 0) {
    for (let i=0; i<w.length; i++) {
      constPhase.push([w[i], 180]);
    }
  }
  terms[0].freqData = constFreq;
  terms[0].phaseData = constPhase;
  for (let i=1; i<terms[i].length; i++) {
    if (terms[i].termType == "OriginZero") {
      [terms[i].freqData, terms[i].phaseData] = originData(w, 1, i);
      terms[i].freqDataApprox = terms[i].freqData;
      terms[i].phaseDataApprox = terms[i].phaseData;
    }
    else if (terms[i].termType == "OriginPole") {
      [terms[i].freqData, terms[i].phaseData] = originData(w, -1, i);
      terms[i].freqDataApprox = terms[i].freqData;
      terms[i].phaseDataApprox = terms[i].phaseData;
    }
    else if (terms[i].termType == "RealZero") {
      [terms[i].freqData, terms[i].phaseData, terms[i].freqDataApprox, terms[i].phaseDataApprox] = realData(w, 1, i);
    }
    else if (terms[i].termType == "RealPole") {
      [terms[i].freqData, terms[i].phaseData, terms[i].freqDataApprox, terms[i].phaseDataApprox] = realData(w, -1, i);
    }
    /*else if (terms[i].termType == "ComplexZero") {
      [terms[i].freqData, terms[i].phaseData, [terms[i].freqDataApprox, terms[i].phaseDataApprox] = compConjugateData(w, 1, i);
    }
    else if (terms[i].termType == "ComplexPole") {
      [terms[i].freqData, terms[i].phaseData, [terms[i].freqDataApprox, terms[i].phaseDataApprox] = compConjugateData(w, -1, i);
    }*/
  }
}
//function rounds a number to a decimal # of decimal places.
function roundDecimal (num, decimal) {
  var a = Math.pow(10, decimal);
  return (Math.round(num*a)/a);
}
function rad2Degrees(rad) {//converts radians to degrees.
  return (rad/Math.PI)*180;
}
function getZeta (img, real) {
  var temp = Math.atan2(img, real);//y, x -> y/x, opposite/ajdacent
  return Math.cos(temp);
}
function originData(w, sign, termIndex) {
  let freqData = [], phaseData = [], exp = BDO.terms[termIndex].mult;
  for (let i=0; i<w.length; i++) {
    freqData.push([w[i], 20*exp*sign*Math.log10(w[i])]);
    phaseData.push([w[i], sign*90]);
  }
  return [freqData, phaseData];
}
function realData (w, sign, termIndex) {
  let w0 = Math.abs(parseFloat(BO.terms[termIndex].value));//w0, abs of a zero.
  let freqApproxData = [], phaseApproxData = [], freqExactData = [], phaseExactData = [];
  let exp = BO.terms[termIndex].mult, lowerBound = 0.1*w0, upperBound = 10*w0,
  middleDenominator = Math.log10(upperBound/lowerBound), theta;

  for (let j=0; j<w.length; j++) {
    //approximate fequency:
    x = w[j]/w0;
    if (w[j]<= w0) {
      freqApproxData.push([w[j], 0]);
    }
    else if (w[j]>w0) {
      freqApproxData.push([w[j], sign*20*exp*Math.log10(x)]);
    }
    //exact frequency
    freqExactData[i].push([w[j], sign*20*exp*Math.log10(Math.pow((1 + x*x), 0.5))]);
    if (w[j]<lowerBound) {
        phaseApproxData.push([w[j], 0]);
    }
    else if (w[j]>upperBound) {
      phaseApproxData.push([w[j], sign*90]);
    }
    else {
      theta = (Math.log10(w[j]/lowerBound)/middleDenominator)*sign*90;
      phaseApproxData.push([w[j], theta]);
    }
    //exact
    theta = rad2Degrees(sign*Math.atan2(w[j], w0));
    phaseExactData.push([w[j], theta]);
  }
  return [freqExactData, phaseExactData, freqApproxData, phaseApproxData];
}
function compConjugateData(w, sign, termIndex) {
  let realPart = parseFloat(BDO.terms[termIndex].value.re);
  let imagPart = parseFloat(BDO.terms[termIndex].value.im);
  let w0 = Math.sqrt(realPart*realPart + imagPart*imagPart);
  let w0Rounded = roundDecimal(w0, 1);//round to 1 decimal place.
  let freqApproxData = [], phaseApproxData = [], freqExactData = [], phaseExactData = [];
  let exp = BO.terms[termIndex].mult, zeta = zeta(BO.terms[termIndex].value),
  jMax = w.length;
  BO.terms[termIndex].zeta = zeta;
  if (zeta < 0) {
    alert('A negative damping ratio is not permitted');
  }
  
  return [freqExactData, phaseExactData, freqApproxData, phaseExactData];
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
        <li>Constant: C=${BDO.C}</li>`
    let K = BDO.C; // We'll calculate K as we go.

    for (let i = 1; i < BDO.numTerms; i++) {
        if (BDO.terms[i].termType == 'RealPole') {
            lS = `${lS}<li>A real pole at s=${BDO.terms[i].value}${BDO.terms[i].mH}.<br />
            This is the $${BDO.terms[i].t1X}$ term in the denominator, with
            $${BDO.terms[i].tXw}$=${-BDO.terms[i].value}.</li>`;
            dS1 = `${dS1}${BDO.terms[i].t1X}`;
            dS2 = `${dS2}${BDO.terms[i].t2X}`;
            cdS = `${cdS}${BDO.terms[i].tXw}${to_m(BDO.terms[i].mult)}`;
            K = K / Math.pow(Math.abs(BDO.terms[i].value), BDO.terms[i].mult); // Divide K by w0^m
        }

        if (BDO.terms[i].termType == 'RealZero') {
            lS = `${lS}<li>A real zero at s=${BDO.terms[i].value}${BDO.terms[i].mH}.<br />
            This is the $${BDO.terms[i].t1X}$ term in the numerator, with
            $${BDO.terms[i].tXw}$=${-BDO.terms[i].value}.</li>`;
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
            nS1 = `${nS1}${BDO.terms[i].t1X}`;
            nS2 = `${nS2}${BDO.terms[i].t2X}`;
            cnS = `${cnS}(${BDO.terms[i].tXw}${to_m(2*BDO.terms[i].mult)}`;
            K = K * Math.pow(BDO.terms[i].value.abs(), 2 * BDO.terms[i].mult); // Multiply K by w0^(2m)
        }

        if (BDO.terms[i].termType == 'OriginPole') {
            lS = `${lS}<li>A pole at the origin${BDO.terms[i].mH}.</li>`;
            oS = BDO.terms[i].t1X;
        }

        if (BDO.terms[i].termType == 'OriginZero') {
            lS = `${lS}<li>A zero at the origin${BDO.terms[i].mH}.</li>`;
            oS = BDO.terms[i].t1X;
        }
    }
    BDO.K = K.toPrecision(BDO.prec);
    let KdB = 20 * Math.log10(K).toPrecision(BDO.prec);

    lS = `${lS}</ul></blockquote>`

    let H1S = `$H(s)=C\\frac{${BDO.num}}{${BDO.den}}$`;
    $('#H1').html(H1S);

    let H2S = `$H(s) = C${oS}\\frac{${nS1}}{${dS1}}$`;
    $('#H2').html(H2S);

    $('#TermDisp').html(lS);

    let H3S = `$H(s) = C\\frac{${cnS}}{${cdS}}${oS}\\frac{${nS2}}{${dS2}}$`;
    $('#H3').html(H3S);

    let H4S = `$K = C\\frac{${cnS}}{${cdS}} = ${BDO.K} = ${KdB}dB$`;
    $('#H4').html(H4S);

    let H5S = `$H(s) = K${oS}\\frac{${nS2}}{${dS2}}$`;
    $('#H5').html(H5S);

    // MathJax.Hub.Queue(["Typeset", MathJax.Hub, "TFS"]);
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

function zeta(s) {
    return (Math.abs(s.im / s.abs()).toPrecision(BDO.prec));
}

function to_m(m) { // a string for raising to the mth power (show nothing if m=1).
    return (m == 1 ? '' : `^${m}`);
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
