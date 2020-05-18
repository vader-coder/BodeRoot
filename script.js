var polyInput = [];

function onInput() {
  var terms = parseInt(document.getElementById('terms').value);
  console.log(terms);
  var eq = document.getElementById('equation').value;
  const node1 = math.parse('sqrt(5^2 - 4^2)');
  const code1 = node1.compile();
  var num = code1.evaluate(); // 5
  console.log(num);
  /*for (let i=0; i<eq.length; i++) {
  }*/
}
