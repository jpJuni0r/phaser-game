var express = require('express');
var app = express();

app.use(express.static('.'));

app.listen(3000, function() {
  console.log('Server running at http://localhost:3000');
});
