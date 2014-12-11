var express = require('express');
var fs = require('fs');
var crypto = require('crypto');
var sys = require('sys')
var exec = require('child_process').exec;
var router = express.Router();

var temppath = "./public/temp/";

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Sequence Coverage' });
});

router.get('/results?', function(req, res) {
  var id = req.query.id;
  if(id === 'demo') {
      fs.readFile("./public/demo/coverage.txt", "utf8", function (err, coverage){ 
	  res.render('results', {title: 'Results', coverage:coverage, id:id});
      })} else {
    fs.readFile(temppath + id + ".sequence", "utf8", function(err, sequence) {
	fs.readFile(temppath + id + ".refseq", "utf8", function(err, refseq) {
	    fs.readFile(temppath + id + ".coverage.txt", "utf8", function(err, coverage) {
		res.render('results', { title: 'Results', sequence: sequence, refseq:refseq, coverage: coverage, id:id});
	    });
	});
    });
}
});

router.post('/calculate-coverage', function(req, res) {
  var id = crypto.randomBytes(20).toString('hex');  
  console.log(req.body.sequence);
  var sequence = req.body.sequence;
  if (!(/^>/).test(sequence)) {
      var sequence = ">" + temppath + id + "\n" + sequence.replace(/ /g,'');
  }
  var refseq = req.body.refseq;
  if (!(/^>/).test(refseq)) {
      var refseq = ">" + temppath + id + "\n" + refseq.replace(/ /g,'');
  }  
//display progress here
  //write to files
  var sequenceFile = temppath + id + ".sequence";
  var refseqFile = temppath + id + ".refseq";
  fs.writeFileSync(sequenceFile, sequence);
  fs.writeFileSync(refseqFile, refseq);
  //bamtools coverage script
  var cmd = 'bash ./scripts/coverage.sh ' + sequenceFile + " " + refseqFile + " " + temppath + id;
  console.log(cmd);
    exec(cmd, function(error, stdout, stderr) {
	console.log('stdout: ' + stdout);
	console.log('stderr: ' + stderr);
	if (error !== null) {
            console.log('exec error: ' + error);
	}
	res.redirect("results?id="+id);
    });
  


});

module.exports = router;
