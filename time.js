var n;
var start;
var time;
start = new Date().getTime();
for (let i=0; i<1000; i++) {
  n = Math.pow(5936, 2);
}
time = new Date().getTime() - start;
console.log(time);
start = new Date().getTime();
for (let i=0; i<1000; i++) {
  n = 5936*5936;
}
time = new Date().getTime() - start;
console.log(time);
