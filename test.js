function onInput(input) {
  var roots, roots2;
  var rootsInput, rootsInput2;//inputted roots
  var factors, factors2;
  var y, y2;//[-2,5],(-2+x)^2
  if (input == 0) {//input is in polynomial form.
     y = document.getElementById('polynomial').value;
     factors = nerdamer('factor(' + y.toString() + ')');
     rootsInput = document.getElementById('roots').value;
     //console.log('roots: ' + roots);
     y2 = document.getElementById('polynomial2').value;
     factors2 = nerdamer('factor(' + y2.toString() + ')');
     rootsInput2 = document.getElementById('roots2').value;
     //console.log('roots: ' + roots2);
  }
  else if (input == 1) {//input is factors
    factors = document.getElementById('factors').value;//'(1-3x)(1+x)(1+2x)';
    y = nerdamer('expand(' + factors + ')');
    rootsInput = document.getElementById('roots3').value;
    //roots = nerdamer('roots('+ y.toString() +')');
    factors2 = document.getElementById('factors2').value;//'(1-3x)(1+x)(1+2x)';
    y2 = nerdamer('expand(' + factors2 + ')');
    rootsInput2 = document.getElementById('roots4').value;
    //roots2 = nerdamer('roots(' + y2.toString() + ')');
    //console.log('roots: ' + roots + ' roots2: ' + roots2);
  }
  var polynomialform = y.toString();//numerator
  var roots = finder(polynomialform);
  //document.getElementById(ans[2]).innerHTML = ans[2] +  [1, 1].toString();
  document.getElementById('roots').innerHTML = 'roots: ' + roots;
}
function finder (polynomialform) {
  var poly = polynomialform.trim();//get rid of whitespace
  var roots = nerdamer('roots('+ poly + ')');
  console.log("roots: " + roots.toString());

  roots = objectToArray(roots);
  return roots;
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
      arr.splice(i);
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
