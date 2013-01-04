var ReReReRemix = (function($, _) {
  var r;

  $.wait = function (time) {
    return $.Deferred(function(dfd) {
      setTimeout(dfd.resolve, time);
    });
  };

  var initializeBrowser = function () {
    if (window.webkitAudioContext === undefined) {
      return false;
    }
    else {
      var context = new webkitAudioContext();
      r.remixer = createJRemixer(context, $, r.apiKey);
      r.player = r.remixer.getPlayer();
      
      return true;
    }
  };

  var displayTrackRemixed = function () {
    console.log("FINISHED REMIXING TRACK");
    console.log("PLAYING NOW");
    r.player.play(0, r.remix);
  };

  var displayRemixFailed = function () {
    console.log("REMIX FAILED, SOMETHING AWFUL HAPPENED");
  };

  // magic remixing code goes hurr
  var remixTrack = function(t) {
    var dfd = $.Deferred();
    
    var remix = [];

    for(var i=0; i < track.analysis.beats.length; i++) {
      if (i % 4 == 0)
        remix.push(track.analysis.beats[i]);
    }

    if (_.isEmpty(remix))
      return dfd.reject();

    r.remix = remix;

    return dfd.resolve();
  };

  var displayTrackLoading = function(p) {
    if (p == 100)
      console.log("TRACK LOADED, REMIXING");
    else
      console.log("TRACK LOADING: " + p);
  };

  var displayTrackLoadFailed = function (status) {
    console.log("FAILED TO LOAD TRACK, ERROR: " + status);
  };

  var loadTrack = function () {
    var dfd = $.Deferred();

    dfd.progress(displayTrackLoading);

    r.remixer.remixTrackById(r.trackId, r.trackUrl, function(t, p) {
      dfd.notify(p);

      if (t.status == 'ok') {
        return dfd.resolve(t);
      }
      else {
        // i'm assuming this is an error
        // but who knows, no docs!!
        if (p == 100) {
          return dfd.reject(t.status);
        }
      }
    });

    return dfd.promise();
  };

  var displayUpgradeBrowser = function () {
    console.log("Sorry, this app needs advanced web audio. Your browser doesn't support it.");
  };

  var attemptRemix = function () {
    if (!initializeBrowser())
      displayUpgradeBrowser();
    else
      return loadTrack().then(remixTrack, displayTrackLoadFailed)
                        .then(displayTrackRemixed, displayRemixFailed);
  };

  var displayFailedToAnalyzeTrack = function () {
    console.log("Failed to analyze track");
  };

  var displayFailedToUpload = function () {
    console.log("Failed to upload track");
  };

  var handleTrackStatusResponse = function(status) {
    var dfd = $.Deferred();

    if (status)
      dfd.resolve();
    else
      dfd.reject();

    return dfd.promise();
  };

  var checkTrackStatus = function () {
    return $.get('http://developer.echonest.com/api/v4/track/profile?format=json&bucket=audio_summary', 
                 { "api_key": r.apiKey, "id": r.trackId });
  };

  var checkTrackAnalyzed = function () {
    return checkTrackStatus()
      .pipe(function(data) {
        var status = data["response"]["track"]["status"];

        if (_.isEqual(status == "complete")) {
          return true;
        }
        else if (_.isEqual(status == "pending")) {
          return $.wait(2000).then(checkTrackStatus);
        }
        else {
          return false;
        }
      });
  };

  var uploadTrack = function () {
    var dfd = $.Deferred();

    $.post("http://developer.echonest.com/api/v4/track/upload", { "api_key": r.apiKey, "url": r.trackUrl })
      .done(function(data) {
        if (_.isEqual(data["response"]["track"]["status"], "pending")) {
          r.trackId = data["response"]["track"]["id"];
          dfd.resolve();
        }
        else {
          dfd.reject();
        }
      });

    return dfd.promise();
  };

  var attemptAnalyze = function () {
    return uploadTrack().then(checkTrackAnalyzed, displayFailedToUpload);
  };

  var attemptAnalyzeAndRemix = function () {
    attemptAnalyze().then(handleTrackStatusResponse, attemptRemix).then(displayFailedToAnalyzeTrack);
  };
  
  /* Constructor */
  var ReReReRemix = function (apiKey, trackUrl) {
    this.apiKey = apiKey;
    this.trackUrl = trackUrl;

    r = this;
  };

  ReReReRemix.prototype = {
    constructor: ReReReRemix,
    analyzeAndRemixTrack: attemptAnalyzeAndRemix
  };

  return ReReReRemix;
})($, _);

$(function() {

  function analyzeAndRemixTrack () {
    var apiKey = $('#api-key').val();
    var trackUrl = $('#track-url').val();
    
    var r = new ReReReRemix(apiKey, trackUrl);
    r.analyzeAndRemixTrack();

    $.post("http://developer.echonest.com/api/v4/track/upload", {
        "api_key": apiKey,
        "url": trackUrl
      }, function(d) {
        $('#track-id').val(d["response"]["track"]["id"]);
      });

  };

  $('#remix-btn').click(analyzeAndRemixTrack);
});
