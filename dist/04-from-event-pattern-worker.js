onmessage = function(e) {
  var workerResult = e.data * 100;
  postMessage(workerResult);
};