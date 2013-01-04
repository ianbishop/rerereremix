var ReReReRemix = (function($, _) {
  var r;

  var initializeBrowser = function () {
    if (window.webkitAudioContext === undefined) {
      return false;
    }
    else {
      var context = new webkitAudioContext();
      r.remixer = createJRemixer(context, $, r.apiKey);
      r.player = r.remixer.getPlayer();
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
    if (!initializeBrowser)
      displayUpgradeBrowser();
    else
      loadTrack().then(remixTrack, displayTrackLoadFailed)
                 .then(displayTrackRemixed, displayRemixFailed);
  };
  
  /* Constructor */
  var ReReReRemix = function (apiKey, trackId, trackUrl) {
    this.apiKey = apiKey;
    this.trackId = trackId;
    this.trackUrl = trackUrl;

    r = this;
  };

  ReReReRemix.prototype = {
    constructor: ReReReRemix,
    remixTrack: attemptRemix
  };

  return ReReReRemix;
})($, _);

$(function() {

  function remixTrack () {
    var apiKey = $('#api-key').val();
    var trackId = $('#track-id').val();
    var trackUrl = $('#track-url').val();

    var r = new ReReReRemix(apiKey, trackId, trackUrl);
    r.remixTrack();
  };

  $('#remix-btn').click(remixTrack);
});
