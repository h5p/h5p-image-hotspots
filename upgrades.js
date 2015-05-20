var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.ImageHotspots'] = (function ($) {
  return {
    1: {
      1: function (parameters, finished) {
        // move x and y
        if (parameters.hotspots !== undefined) {
          for (var i=0; i<parameters.hotspots.length; i++) {
            parameters.hotspots[i].position = {
              x: parameters.hotspots[i].x || 0,
              y: parameters.hotspots[i].y || 0
            };
          }
        }

        finished(null, parameters);
      }
    }
  };
})(H5P.jQuery);
