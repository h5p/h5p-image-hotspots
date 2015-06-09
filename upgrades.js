var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.ImageHotspots'] = (function ($) {
  return {
    1: {
       /**
       * Asynchronous content upgrade hook.
       * Upgrades content parameters to support ImageHotspots 1.1.
       *
       * Moves the fields named x and y into the position group
       *
       * @params {Object} parameters
       * @params {function} finished
       */
      1: function (parameters, finished) {
        // Move x and y
        if (parameters.hotspots !== undefined) {
          for (var i = 0; i < parameters.hotspots.length; i++) {
            parameters.hotspots[i].position = {
              x: parameters.hotspots[i].x || 0,
              y: parameters.hotspots[i].y || 0
            };

            delete parameters.hotspots[i].x;
            delete parameters.hotspots[i].y;
          }
        }

        finished(null, parameters);
      }
    }
  };
})(H5P.jQuery);
