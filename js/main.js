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
  };

  var displayRemixFailed = function () {
  };

  var remixTrack = function(t) {

  };

  var displayTrackLoading = function(p) {
    console.log("LOADING: " + p);
  };

  var displayTrackLoadFailed = function (status) {
    console.log("FAILED WITH STATUS: " + status);
  };

  var loadTrack = function () {
    var dfd = $.Deferred();

    dfd.progress(trackLoading);

    r.remixTrackById(r.trackId, r.trackUrl, function(t, p) {
      displayTrackLoading(p);

      if (t.status == 'ok') {
        dfd.resolve(t);
      }
      else {
        // i'm assuming this is an error
        // but who knows, no docs!!
        if (p == 100) {
          dfd.reject(t.status);
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
      loadTrack.then(remixTrack, displayTrackLoadFailed)
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
  use "strict";

  function remixTrack () {
    var apiKey = $('#api-key').val();
    var trackId = $('#track-id').val();
    var trackUrl = $('#track-url').val();

    var r = new ReReReRemix(apiKey, trackId, trackUrl);
    r.remixTrack();
  };
});
