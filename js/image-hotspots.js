var H5P = H5P || {};

/**
 *
 */
H5P.ImageHotspots = (function ($, Hotspot, EventDispatcher) {

  var DEFAULT_FONT_SIZE = 24;
  /**
   * Constructor function.
   */
  function ImageHotspots(options, id) {
    EventDispatcher.call(this);

    // Extend defaults with provided options
    this.options = $.extend(true, {}, {
      image: null,
      hotspots: []
    }, options);
    // Keep provided id.
    this.id = id;
    this.isSmallDevice = false;
  }
  ImageHotspots.prototype = Object.create(EventDispatcher.prototype);
  ImageHotspots.prototype.constructor = ImageHotspots;

  /**
   * Attach function called by H5P framework to insert H5P content into
   * page
   *
   * @param {jQuery} $container
   */
  ImageHotspots.prototype.attach = function ($container) {
    var self = this;
    self.$container = $container;

    if (this.options.image === null || this.options.image === undefined) {
      $container.append('<div class="background-image-missing">I really need a background image :)</div>');
      return;
    }

    // Need to know since ios uses :hover when clicking on an element
    if (/(iPad|iPhone|iPod)/g.test( navigator.userAgent ) === false) {
      $container.addClass('not-an-ios-device');
    }

    $container.addClass('h5p-image-hotspots');

    this.$hotspotContainer = $('<div/>', {
      'class': 'h5p-image-hotspots-container'
    });

    this.initialWidth = $container.width();
    var height = (this.initialWidth/this.options.image.width)*this.options.image.height;

    if (this.options.image && this.options.image.path) {
      this.$image = $('<img/>', {
        'class': 'h5p-image-hotspots-background',
        src: H5P.getPath(this.options.image.path, this.id)
      }).css({width: this.initialWidth, height: height}).appendTo(this.$hotspotContainer);
    }

    var isSmallDevice = function () {
      return self.isSmallDevice;
    };

    // Add hotspots
    var numHotspots = this.options.hotspots.length;
    for(var i=0; i<numHotspots; i++) {
      new Hotspot(this.options.hotspots[i], this.options.color, this.id, isSmallDevice, self).appendTo(this.$hotspotContainer);
    }
    this.$hotspotContainer.appendTo($container);

    this.on('resize', function () {
      self.resize();
    });
    /*$(window).on('orientationchange', function () {
      self.trigger('resize');
      //alert('JALLA');
    });*/
    this.resize();
  };

  /**
   * Handle resizing
   */
  ImageHotspots.prototype.resize = function () {
    var self = this;
    var containerWidth = $(window.frameElement.parentNode).width();
    var containerHeight = self.$container.height();

    var width = containerWidth;
    var height = Math.floor((width/self.options.image.width)*self.options.image.height);

    // If fullscreen, we have both a max width and max height
    if (H5P.isFullscreen && height > containerHeight) {
      height = containerHeight;
      width = Math.floor((height/self.options.image.height)*self.options.image.width);
    }

    self.$image.css({
      width: width,
      height: height
    });

    self.fontSize = (DEFAULT_FONT_SIZE * (width/self.initialWidth));

    self.$hotspotContainer.css({
      width: width,
      height: height,
      fontSize: self.fontSize + 'px'
    });

    self.isSmallDevice = (containerWidth / parseFloat($("body").css("font-size")) < 45);
  };

  return ImageHotspots;
})(H5P.jQuery, H5P.ImageHotspots.Hotspot, H5P.EventDispatcher);
