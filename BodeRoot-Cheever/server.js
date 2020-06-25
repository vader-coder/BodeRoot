var http = require('http');
var fs = require('fs');
console.log("before creating server.");
function request (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  console.log("creating server");
  fs.readFile('./bodeDraw.html', null, function(err, data) {
    console.log("reading file");
    if (err) {
      res.writeHead(404);
      res.write('File not found');
    }
    else {
      res.write(data);
    }
    return res.end();
  });
}
http.createServer(request).listen(8080);
