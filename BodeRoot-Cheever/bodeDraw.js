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
    this.allFreq = [];
    this.allPhase = [];
    this.allFreqApprox = [];
    this.allPhaseApprox = [];
    this.namesOfIds = [];
    this.freqDescs = [];
    this.phaseDescs = [];
    this.lastClickedTopBoxName;
    this.topFreqSeries = [];
    this.topPhaseSeries = [];
    this.freqSeries = [];
    this.phaseSeries = [];
    this.freqFormula = '';//gives formula for all frequency & phase.
    this.phaseFormula = '';
    this.omega;
    this.phi;
    this.sinusoidInput;
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
    this.w0 = 0;//w0, 0 by default.
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
    /*getTerms();
    dispTerms();*/
    let cheevStart, cheevStop, patStart, patStop, cheevTime, patTime;
    cheevStart = new Date().getTime();
    getTerms();
    dispTerms();
    cheevStop = new Date().getTime();
    getData();
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
  let constFreq = [], constPhase = [], freqSeries = [], phaseSeries = [],
  topFreqSeries = [], topPhaseSeries = [], desc, freqDescs = [], phaseDescs = [],
  togetherFreqSeries = [], togetherPhaseSeries = [], w0Mag, zMag, print, print2, name,
  descIndex, bold = '1', faded = '0.2', checkHtml, graphHtml, graphs, graphCheck,
  names = [], phaseDescription, freqDescription;
  var colors = ['rgba(0,114,189,'+bold+')','rgba(217,83,25,'+bold+')','rgba(237,177,32,'+bold+')','rgba(126,47,142,'+bold+')','rgba(119,172,148,'+bold+')','rgba(77,190,238,'+bold+')', 'rgba(162,20,47,'+bold+')'], colorIndex = 0;

  for (let i=1; i<10001; i++) {
    w.push(roundDecimal(i*0.1, 1));//w.push(roundDecimal(1+ i*0.1, 1)); might want multiple versions of this.
    constFreq.push([w[i-1], 20*Math.log10(constantK)]);
  }
  BDO.freqFormula += 'Frequency: <br>20log<sub>10</sub>('+constantK.toString()+') ';
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
  terms[0].freqData = constFreq;
  terms[0].phaseData = constPhase;
  terms[0].freqDataApprox = constFreq;
  terms[0].phaseDataApprox = constPhase;

  name = 'Constant ' + constantK.toString();//was just constantK
  names.push(name);
  checkHtml = "<br>Elements Detected: <br>";
  checkHtml += "<input type='radio' id='" + name + "' onclick=\"onTopCheckOne(\'"+name+"\')\" checked></input>";
  checkHtml += "<label for='" + name + "'>"+ name +"</label><br>";
  graphHtml = "<p id='topDescription'></p><br>";
  graphHtml +=  "<div id='freq'></div><br>";
  graphHtml += "<div id='phase'></div><br>";
  freqDescs.push('The constant term is K= ~'+roundDecimal(constantK, 4).toString()+' = '+terms[0].freqData[0][1].toString()+'dB = 20log10(|K|).');
  //1 description, 1 graph
  BDO.lastClickedTopBoxName = name;//1st box to be checked is the constant.
  freqSeries.push({name: 'Constant ' + constantK.toString(),
  color: colors[colorIndex],data: constFreq});
  phaseSeries.push({name: 'Constant ' + constantK.toString(),
  color: colors[colorIndex],data: constPhase});
  topFreqSeries.push(copyObject(freqSeries[freqSeries.length-1]));
  topPhaseSeries.push(copyObject(phaseSeries[phaseSeries.length-1]));
  colorIndex++;
  desc += '<br><a href="https://lpsa.swarthmore.edu/Bode/BodeHow.html#A%20Constant%20Term">Details</a>';
  phaseDescs.push(desc);
  /*phaseDescription = document.getElementById('phaseDescription');
  phaseDescription.innerHTML = phaseDescs[0];//default is constantK
  document.getElementById('topDescription').insertAdjacentHTML('beforeend', '<br>'+phaseDescs[0]);*/

  for (let i=1; i<terms.length; i++) {
    if (terms[i].termType == "OriginZero") {
      [terms[i].freqData, terms[i].phaseData] = originData(w, 1, i);
      terms[i].freqDataApprox = terms[i].freqData;
      terms[i].phaseDataApprox = terms[i].phaseData;
      name = 'Zero at Origin';
      freqSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].freqData
      });
      phaseSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].phaseData
      });
      topFreqSeries.push(copyObject(freqSeries[freqSeries.length-1]));
      topFreqSeries[topFreqSeries.length-1] = updateAlpha(topFreqSeries[topFreqSeries.length-1], faded);
      topPhaseSeries.push(copyObject(phaseSeries[phaseSeries.length-1]));
      topPhaseSeries[topPhaseSeries.length-1] = updateAlpha(topPhaseSeries[topPhaseSeries.length-1], faded);
      names.push(name);
      checkHtml+= "<input type='radio' id='"+name+"' onclick=\"onTopCheckOne(\'"+name+"\')\"></input>";
      checkHtml+="<label for='"+name+"'>Zero at Origin</label><br>";
      freqDescs.push('The magnitude plot rises 20dB/decade and goes through 0 dB at 1 rad sec.<br>');
      colorIndex++;
      desc = 'The phase plot of a zero at the origin is a horizontal line at +90&deg;.';
      desc += '<br><a href="https://lpsa.swarthmore.edu/Bode/BodeHow.html#A%20Zero%20at%20the%20Origin">Details</a>';
      phaseDescs.push(desc);
    }
    else if (terms[i].termType == "OriginPole") {
      [terms[i].freqData, terms[i].phaseData] = originData(w, -1, i);
      terms[i].freqDataApprox = terms[i].freqData;
      terms[i].phaseDataApprox = terms[i].phaseData;
      name = 'Pole at Origin';
      freqSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].freqData
      });
      phaseSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].phaseData
      });
      topFreqSeries.push(copyObject(freqSeries[freqSeries.length-1]));
      topFreqSeries[topFreqSeries.length-1] = updateAlpha(topFreqSeries[topFreqSeries.length-1], faded);
      topPhaseSeries.push(copyObject(phaseSeries[phaseSeries.length-1]));
      topPhaseSeries[topPhaseSeries.length-1] = updateAlpha(topPhaseSeries[topPhaseSeries.length-1], faded);
      checkHtml+="<input type='radio' id='"+name+"' onclick=\"onTopCheckOne(\'"+name+"\')\"></input>";
      checkHtml+="<label for='"+name+"'>Pole at Origin</label><br>";
      desc = 'The magnitude plot drops 20dB/decade and goes through 0 dB at 1 rad sec.<br>';
      freqDescs.push(desc);
      desc = 'The phase plot of a pole at the origin is a horizontal line at -90&deg;.';
      desc += '<br><a href="https://lpsa.swarthmore.edu/Bode/BodeHow.html#A%20Pole%20at%20the%20Origin">Details</a>';
      phaseDescs.push(desc);
      names.push(name);
      colorIndex++;
    }
    else if (terms[i].termType == "RealZero") {
      [terms[i].freqData, terms[i].phaseData, terms[i].freqDataApprox, terms[i].phaseDataApprox] = realData(w, 1, i);
      name = 'Real Zero ' + terms[i].value + ' Approximation';
      freqSeries.push({
        name: 'Real Zero ' + terms[i].value,
        color: colors[colorIndex],
        data: terms[i].freqData
      });
      freqSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].freqDataApprox
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
      topFreqSeries.push(copyObject(freqSeries[freqSeries.length-1]));
      topFreqSeries[topFreqSeries.length-1] = updateAlpha(topFreqSeries[topFreqSeries.length-1], faded);
      topPhaseSeries.push(copyObject(phaseSeries[phaseSeries.length-1]));
      topPhaseSeries[topPhaseSeries.length-1] = updateAlpha(topPhaseSeries[topPhaseSeries.length-1], faded);
      names.push(name);
      w0Mag = BDO.terms[i].w0.toString();
      checkHtml+="<input type='radio' id='"+name+"' onclick=\"onTopCheckOne(\'"+name+"\')\"></input>";
      checkHtml+="<label for='"+name+"'>"+name+"</label><br>";
      desc = 'The real zero is at &omega; = &omega;<sub>0</sub> = '+w0Mag+' rad/sec.';
      desc+= ' For the magnitude plot we draw a straight line ';
      desc += 'at 0 dB from up to '+w0Mag+', thereafter the line rises at 20dB/decade.';
      freqDescs.push(desc);
      desc = 'The phase plot is 0 up to &omega; = &omega;<sub>0</sub> = '+w0Mag+'/10,';
      desc += ' then drops to +90 at '+w0Mag+'*10 going through +45 at '+w0Mag + '.';
      desc+='<br><a href = "https://lpsa.swarthmore.edu/Bode/BodeHow.html#A%20Real%20Zero">Details</a>';
      phaseDescs.push(desc);
      colorIndex++;
    }
    else if (terms[i].termType == "RealPole") {
      [terms[i].freqData, terms[i].phaseData, terms[i].freqDataApprox, terms[i].phaseDataApprox] = realData(w, -1, i);
      w0Mag = BDO.terms[i].w0.toString();
      name = 'Real Pole ' + terms[i].value + ' Approximation';
      freqSeries.push({
        name: 'Real Pole ' + terms[i].value,
        color: colors[colorIndex],
        data: terms[i].freqData
      });
      freqSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].freqDataApprox
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
      topFreqSeries.push(copyObject(freqSeries[freqSeries.length-1]));
      topFreqSeries[topFreqSeries.length-1] = updateAlpha(topFreqSeries[topFreqSeries.length-1], faded);
      topPhaseSeries.push(copyObject(phaseSeries[phaseSeries.length-1]));
      topPhaseSeries[topPhaseSeries.length-1] = updateAlpha(topPhaseSeries[topPhaseSeries.length-1], faded);
      names.push(name);
      checkHtml+="<input type='radio' id='"+name+"' onclick=\"onTopCheckOne(\'"+name+"\')\"></input>";
      checkHtml+="<label for='"+name+"'>"+name+"</label><br>";
      desc = 'The real pole is at &omega; = &omega;<sub>0</sub> = '+w0Mag+' rad/sec.';
      desc+= ' For the magnitude plot we draw a straight line ';
      desc += 'at 0 dB from up to '+w0Mag+', thereafter the line drops at 20dB/decade.';
      freqDescs.push(desc);

      desc = 'The phase plot is 0 up to &omega; = &omega;<sub>0</sub> = '+w0Mag+'/10,';
      desc += ' then drops to -90 at '+w0Mag+'*10 going through -45 at '+w0Mag+'.';
      desc += '<br><a href = "https://lpsa.swarthmore.edu/Bode/BodeHow.html#A%20Real%20Pole">Details</a>';
      phaseDescs.push(desc);
      colorIndex++;
    }
    else if (terms[i].termType == "ComplexZero") {
      [terms[i].freqData, terms[i].phaseData, terms[i].freqDataApprox, terms[i].phaseDataApprox] = compConjugateData(w, 1, i);
      [print, print2] = compToStr(terms[i].value);
      name = 'Complex Zero ' + print2 + ' Approximation';
      freqSeries.push({
        name: 'Complex Zero ' + print,
        color: colors[colorIndex],
        data: terms[i].freqData
      });
      freqSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].freqDataApprox
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
      topFreqSeries.push(copyObject(freqSeries[freqSeries.length-1]));
      topFreqSeries[topFreqSeries.length-1] = updateAlpha(topFreqSeries[topFreqSeries.length-1], faded);
      topPhaseSeries.push(copyObject(phaseSeries[phaseSeries.length-1]));
      topPhaseSeries[topPhaseSeries.length-1] = updateAlpha(topPhaseSeries[topPhaseSeries.length-1], faded);
      w0Mag = BDO.terms[i].w0.toString();
      zMag = zBDO.terms[i].zeta.toString();
      checkHtml+="<input type='radio' id='"+name+"' onclick=\"onTopCheckOne(\'"+name+"\')\"></input>";
      checkHtml+="<label for='"+name+"'>"+name+"</label><br>";
      desc = 'For the magnitude plot we draw a straight line at 0 dB from up to '+w0Mag+', thereafter the line rises at 40dB/decade.';
      if (parseFloat(zMag) < 0.5) {
        desc += '<br>Since '+zMag+'<0.5, we draw a peak of 20log<sub>10</sub>(2&zeta;) = ';
        desc += (20*Math.log10(2*parseFloat(zMag,10))).toString()+'db at &omega; = '+w0Mag+'.';
      }
      freqDescs.push(desc);

      desc = 'The phase plot is 0 up to '+w0Mag+'/10<sup>'+zMag+'</sup, ';
      desc += 'then climbs to 180 at '+w0Mag+'*10<sup>'+zMag+'</sup> going through 90 at '+w0Mag+'.';
      desc += '<br><a href="https://lpsa.swarthmore.edu/Bode/BodeHow.html#A%20Complex%20Conjugate%20Pair%20of%20Zeros">Details</a>';
      phaseDescs.push(desc);
      names.push(name);
      colorIndex++;
    }
    else if (terms[i].termType == "ComplexPole") {
      [terms[i].freqData, terms[i].phaseData, terms[i].freqDataApprox, terms[i].phaseDataApprox] = compConjugateData(w, -1, i);
      [print, print2] = compToStr(terms[i].value);
      name = 'Complex Pole ' + print2 + ' Approximation';
      freqSeries.push({
        name: 'Complex Pole ' + print,
        color: colors[colorIndex],
        data: terms[i].freqData
      });
      freqSeries.push({
        name: name,
        color: colors[colorIndex],
        data: terms[i].freqDataApprox
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
      topFreqSeries.push(copyObject(freqSeries[freqSeries.length-1]));
      topFreqSeries[topFreqSeries.length-1] = updateAlpha(topFreqSeries[topFreqSeries.length-1], faded);
      topPhaseSeries.push(copyObject(phaseSeries[phaseSeries.length-1]));
      topPhaseSeries[topPhaseSeries.length-1] = updateAlpha(topPhaseSeries[topPhaseSeries.length-1], faded);
      w0Mag = BDO.terms[i].w0.toString();
      zMag = BDO.terms[i].zeta.toString();
      checkHtml+="<input type='radio' id='"+name+"' onclick=\"onTopCheckOne(\'"+name+"\')\"></input>";
      checkHtml+="<label for='"+name+"'>"+name+"</label><br>";
      desc = 'For the magnitude plot we draw a straight line at 0 dB from up to '
      desc += w0Mag+', thereafter the line drops at 40dB/decade.';
      if (zMag < 0.5) {
        desc+= '<br>Since '+zMag+'<0.5, we draw a peak of -20log<sub>10</sub>(2&zeta;) = ';
        desc += (-20*Math.log10(2*parseFloat(zMag,10))).toString()+'db at &omega; = '+w0Mag;
      }
      freqDescs.push(desc);
      desc = 'The phase plot is 0 up to '+w0Mag+'/10<sup>'+zMag+'</sup, ';
      desc += 'then climbs to 180 at '+w0Mag+'*10<sup>'+zMag+'</sup> going through 90 at '+w0Mag+'.';
      desc += '<br><a href="https://lpsa.swarthmore.edu/Bode/BodeHow.html#A%20Complex%20Conjugate%20Pair%20of%20Zeros">Details</a>';
      phaseDescs.push(desc);
      names.push(name);
      colorIndex++;
    }
  }
  [BDO.allFreq, BDO.allPhase, BDO.allFreqApprox, BDO.allPhaseApprox] = allData(w, terms);
  freqSeries.push({
    name: 'Total Frequency',
    color: colors[colorIndex],
    data: BDO.allFreq
  });
  freqSeries.push({
    name: 'Total Frequency Approximation',
    color: colors[colorIndex],
    data: BDO.allFreqApprox
  });
  phaseSeries.push({
    name: 'Total Phase',
    color: colors[colorIndex],
    data: BDO.allPhase
  });
  phaseSeries.push({
    name: 'Total Phase Approximation',
    color: colors[colorIndex],
    data: BDO.allPhaseApprox
  });
  togetherFreqSeries = copyObject(topFreqSeries);
  togetherFreqSeries.push(copyObject(freqSeries[freqSeries.length-2]));
  togetherFreqSeries.push(copyObject(freqSeries[freqSeries.length-1]));
  togetherFreqSeries[0] = updateAlpha(togetherFreqSeries[0], faded);
  togetherPhaseSeries = copyObject(topPhaseSeries);
  togetherPhaseSeries.push(copyObject(phaseSeries[phaseSeries.length-2]));
  togetherPhaseSeries.push(copyObject(phaseSeries[phaseSeries.length-1]));
  togetherPhaseSeries[0] = updateAlpha(togetherPhaseSeries[0], faded);
  let togetherHtml = "To get the total frequency and phase plot, we add the equations for the approximate and exact terms together.";
  togetherHtml+="<br>"+BDO.freqFormula+"<br>"+BDO.phaseFormula+"<br><div id='togetherFreq'></div>"+"<br><div id='togetherPhase'></div>";
  togetherHtml+="<br>Input sinusoid of form cos(&omega;t + &phi;).";
  togetherHtml+="<br><label for='freqInput'>Input a frequency &omega;</label><input type='text' id='freqInput' value='1.0'></input>";
  togetherHtml+="<br><label for='phaseInput'>Input a phase &phi;</label><input type='text' id='phaseInput' value='1.0'></input>";
  togetherHtml+="<br><label for='sinusoidInput'>Input sinusoid: </label><div id='sinusoidInput'>cos(1.0t + 1.0)</div>";
  togetherHtml+="<br><input type='button' onclick='onOutputPress()' value='Find Output Function'></input>";
  togetherHtml+="<br><label for='sinusoidOutput'>Output sinusoid: </label><div id='sinusoidOutput'>cos(&omega;t + &phi;)</div>";
  colorIndex++;
  graphCheck = document.getElementById('graphOptions');
  graphs = document.getElementById('graphs');
  let together = document.getElementById('together');
  graphCheck.innerHTML = checkHtml;
  graphs.innerHTML = graphHtml;
  together.innerHTML = togetherHtml;
  document.getElementById('topDescription').innerHTML = freqDescs[0]+'<br>'+phaseDescs[0];
  highchartsPlot(freqSeries, 'bode', 'Frequency Plot', 'Magnitude dB');
  highchartsPlot(phaseSeries, 'bodePhase', 'Bode Plot: Phase', 'Phase in Degrees', 90);
  highchartsPlot(topFreqSeries, 'freq', 'Frequency Plot', 'Magnitude dB');
  highchartsPlot(topPhaseSeries, 'phase', 'Bode Plot: Phase', 'Phase in Degrees', 90);
  highchartsPlot(togetherFreqSeries, 'togetherFreq', 'Frequency Plot', 'Magnitude dB');
  highchartsPlot(togetherPhaseSeries, 'togetherPhase', 'Bode Plot: Phase', 'Phase in Degrees', 90);

  BDO.freqSeries = freqSeries;
  BDO.phaseSeries = phaseSeries;
  BDO.topFreqSeries = topFreqSeries;
  BDO.topPhaseSeries = topPhaseSeries;
  BDO.freqDescs = freqDescs;
  BDO.phaseDescs = phaseDescs;
  BDO.namesOfIds = names;
  BDO.omega = document.querySelector('#freqInput');
  BDO.phi = document.querySelector('#phaseInput');
  BDO.sinusoidInput = document.getElementById('sinusoidInput');
  BDO.omega.addEventListener('#freqInput', updateSinusoidInput);
  BDO.phi.addEventListener('#phaseInput', updateSinusoidInput2);
  //only want to plot constant by default on top graph.
  //highchartsPlot(freqSeries, 'freq', 'Frequency Plot', 'Magnitude dB');
}
//call when input frequency or phase changes.
function updateSinusoidInput(e) {
  BDO.sinusoidInput.textContent = 'cos('+e.target.value+'t + '+BDO.phi.value+')';
  BDO.omega.value = e.target.value;
}
function updateSinusoidInput2(e) {
  BDO.sinusoidInput.textContent = 'cos('+BDO.omega.value+'t + '+e.target.value+')';
  BDO.phi.value = e.target.value;
}
function onOutputPress() {
  let wIndex = BDO.w.indexOf(roundDecimal(parseFloat(BDO.omega.value), 1));
  let mag = BDO.allFreq[wIndex][1].toString();
  let phi = BDO.allPhase[wIndex][1], html;
  if (phi > 0) {
    html = mag+'cos('+BDO.omega.value+'t + '+phi.toString()+')';
  }
  else {
    html = mag+'cos('+BDO.omega.value+'t - '+Math.abs(phi).toString()+')';
  }
  document.getElementById('sinusoidOutput').innerHTML = html;
}
//called when one of the checkboxes is checked.
function onTopCheckOne(name) {
  if (BDO.lastClickedTopBoxName == name) {//make sure you didn't accidentally double click.
    document.getElementById(BDO.lastClickedTopBoxName).checked = 1;
  }
  else {
    document.getElementById(BDO.lastClickedTopBoxName).checked = 0;
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
function onGraphPress() {//1st try w/ zero at origin, p at origin.
  //order is consT, zOrigin, pOrigin, zReal, pReal, (might be > 1), zComp, pComp
  //might set array to track # left behind. use name to find stuff.
  const names = BDO.namesOfIds;
  var series = BDO.topFreqSeries;
  var series2 = BDO.topPhaseSeries;
  var freqDescs = BDO.freqDescs;
  var phaseDescs = BDO.phaseDescs;
  var freqDescShown, phaseDescShown;
  var bold = '1', faded = '0.2';
  for (let i=0; i<names.length; i++) {
    if (document.getElementById(names[i])) {
      if (document.getElementById(names[i]).checked) {
        for (let j=0; j<series.length; j++) {
          if (series[j].name == names[i]) {//find the dictionary of data with the right name
            series[j] = updateAlpha(series[j], bold);
            series2[j] = updateAlpha(series2[j], bold);
            freqDescShown = freqDescs[j];//descriptions correspond to names.
            phaseDescShown = phaseDescs[j];
          }
          else if (series[j].name == BDO.lastClickedTopBoxName) {
            series[j] = updateAlpha(series[j], faded);
            series2[j] = updateAlpha(series2[j], faded);
          }
        }
        break;
      }
    }
  }
  //plots the series with the ones not selected faded.
  highchartsPlot(series, 'freq', 'Frequency Plot', 'Magnitude dB');
  highchartsPlot(series2, 'phase', 'Phase Plot', 'Phase in Degrees', 90);
  document.getElementById('topDescription').innerHTML = freqDescShown+'<br>'+phaseDescShown;
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
  let freqData = [], phaseData = [], exp = BDO.terms[termIndex].mult;
  for (let i=0; i<w.length; i++) {
    freqData.push([w[i], 20*exp*sign*Math.log10(w[i])]);
    phaseData.push([w[i], sign*exp*90]);
  }
  exp = exp.toString();
  if (sign > 0) {
    sign = '+';
  }
  else {
    sign = '-';
  }
  BDO.freqFormula += ('<br>'+sign +' 20*'+exp+'*log<sub>10</sub>(&omega;) ');
  BDO.phaseFormula += ('<br>'+sign +' '+exp+'*90 ');
  return [freqData, phaseData];
}
function realData (w, sign, termIndex) {
  let w0 = Math.abs(parseFloat(BDO.terms[termIndex].value));//w0, abs of a zero.
  BDO.terms[termIndex].w0 = w0;
  let freqApproxData = [], phaseApproxData = [], freqExactData = [], phaseExactData = [];
  let exp = BDO.terms[termIndex].mult, lowerBound = 0.1*w0, upperBound = 10*w0,
  middleDenominator = Math.log10(upperBound/lowerBound), theta, x;

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
    freqExactData.push([w[j], sign*20*exp*Math.log10(Math.pow((1 + x*x), 0.5))]);
    //phase approximation
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
  BDO.freqFormula += ('<br>+ {&omega;<='+w0+':0, &omega;>&omega;<sub>0</sub>:'+sign+exp+'*20log<sub>10</sub>(&omega;)} ');
  BDO.phaseFormula += '<br>+ {&omega;<'+lowerBound+':0, '+'&omega;>'+upperBound+': '+sign+exp+'90, ';
  BDO.phaseFormula += lowerBound+'<&omega;<'+upperBound+': '+sign+exp+'*90log<sub>10</sub>(&omega;/'+lowerBound +')';
  BDO.phaseFormula += '/'+middleDenominator+'} ';
  return [freqExactData, phaseExactData, freqApproxData, phaseApproxData];
}
function compConjugateData(w, sign, termIndex) {
  let realPart = parseFloat(BDO.terms[termIndex].value.re);
  let imagPart = parseFloat(BDO.terms[termIndex].value.im);
  let w0 = Math.sqrt(realPart*realPart + imagPart*imagPart);
  let w0Rounded = roundDecimal(w0, 1);//round to 1 decimal place.
  let freqApproxData = [], phaseApproxData = [], freqExactData = [], phaseExactData = [];
  let exp = BDO.terms[termIndex].mult, zetaTemp = zeta(BDO.terms[termIndex].value),
  jMax = w.length, x, base, peak, lowerBound, upperBound,
  middleDenominator, a, b, theta;
  BDO.terms[termIndex].zeta = zetaTemp;
  if (zetaTemp < 0) {
    alert('A negative damping ratio is not permitted');
  }
  //approximate frequency:
  if (zetaTemp < 0.5) {
    for (let j=0; j<jMax; j++) {
      x = w[j];
      if (w[j] < w0Rounded) {//for phase w[j] <= w0/(Math.pow(10, zeta))) {
        freqApproxData.push([w[j], 0]);
      }//was w0Rounded.
      else if (w[j] > w0Rounded && w[j] != w0Rounded) { //might change to if so they will connect?
        freqApproxData.push([w[j], sign*40*exp*Math.log10(x)]);//-w0Rounded+1)]);
      }//w0Rounded pushes the asymptote so it is more in sync w/ exact function.
      else if (w[j] == w0Rounded) {//might ask prof cheever about his peak at some point.
        base = sign*40*exp*Math.log10(x);
        peak = 20*Math.abs(Math.log10(2*Math.abs(zetaTemp)))*Math.sign(base);
        freqApproxData.push([w[j], base+peak]);
      }
    }
  }
  else if (zetaTemp >= 0.5) {//don't draw peak. it would seem like in this case w[0] doesn't matter.
    for (let j=0; j<jMax; j++) {
      x = w[j];
      if (w[j] <= w0Rounded) {// w0Rounded for phase w[j] <= w0/(Math.pow(10, zeta))) {
        freqApproxData.push([w[j], 0]);
      }
      else if (w[j] > w0Rounded) {
        freqApproxData.push([w[j], sign*40*exp*Math.log10(x)]);
      }
    }
  }
  //exact frequency version starts here:
  //a + jb, a = 1-(w/w0)^2 b = 2*zeta*w/(w0) w[j]. 20*log10(|a+jb|)
  for (let j=0; j<jMax; j++) {//should we have included this in both the other for loops or had there be only one?
    realPart = 1-Math.pow((w[j]/w0), 2);
    imagPart = 2*zetaTemp*(w[j]/w0);//also j, j^2 = -1
    //+ works, - doesn't.
    x = Math.sqrt(realPart*realPart+imagPart*imagPart);//magnitude |a+jb|
    freqExactData.push([w[j], sign*20*exp*Math.log10(x)]);
    //approx & exact are closer when both 20 or 40.
  }
  lowerBound = w0/(Math.pow(10, Math.abs(zetaTemp)));////(x,y) = (lowerBound, 0)
  upperBound = w0*Math.pow(10, Math.abs(zetaTemp));//(x,y) = (upperBound, sign*180)
  middleDenominator = Math.log10(upperBound/lowerBound);
  //phase approximation
  for (let j=0; j<jMax; j++) {
    x = w[j];
    //lower & upper boundarises of line in x coordinates
    if (w[j] < lowerBound) {//for phase w[j] <= w0/(Math.pow(10, zeta))) {
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
  BDO.freqFormula += '<br>+ {&omega;<'+w0Rounded+':0, &omega;>&omega;<sub>0</sub>: '+sign+exp+'*40log<sub>10</sub>(&omega;-'+w0Rounded+'+1)';
  if (zetaTemp < 0.5) {
    BDO.freqFormula += ', &omega;='+w0Rounded+': ' +sign+exp+'40*log<sub>10</sub>(&omega;) '+sign+' 20*log<sub>10</sub>(2*&zeta;)} ';
  }
  else {
    BDO.freqFormula += '} ';
  }
  BDO.phaseFormula += '<br>+ {&omega;<'+lowerBound+':0, '+'&omega;>'+upperBound+': '+sign+exp+'90, ';
  BDO.phaseFormula += lowerBound+'<&omega;<'+upperBound+': '+sign+exp+'*90log<sub>10</sub>(&omega;/'+lowerBound +')';
  BDO.phaseFormula += '/'+middleDenominator+'} ';
  //}//there is no way the exact way can be this easy.
  return [freqExactData, phaseExactData, freqApproxData, phaseApproxData];
}
//finds summary of data:
function allData(w, terms) {
  let freqApproxData = copyObject(terms[0].freqDataApprox),
  phaseApproxData = copyObject(terms[0].phaseDataApprox),
  freqExactData = copyObject(terms[0].freqData),
  phaseExactData = copyObject(terms[0].phaseData);
  let wTerm = [];
  var bold = '1.0', faded = '0.2', topSeries = [], zMag, w0Mag;
  for (let i=1; i<terms.length; i++) {
    for (let j=0; j<w.length; j++) {
      freqExactData[j] = [w[j], freqExactData[j][1]+terms[i].freqData[j][1]];
      freqApproxData[j] = [w[j], freqApproxData[j][1]+terms[i].freqDataApprox[j][1]];
      phaseExactData[j] = [w[j], phaseExactData[j][1]+terms[i].phaseData[j][1]];
      phaseApproxData[j] = [w[j], phaseApproxData[j][1]+terms[i].phaseDataApprox[j][1]];
    }
  }
  return [freqExactData, phaseExactData, freqApproxData, phaseApproxData];
}// [BDO.allFreq, BDO.allPhase, BDO.allFreqApprox, BDO.allPhaseApprox]

function copyObject(obj) {
  return JSON.parse(JSON.stringify(obj));
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

function zeta(s) {//zeta(BDO.terms[i].value)
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
function highchartsPlot(series, id, title, yAxis, tickInt) {
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
      tickInterval: tickInt,
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
