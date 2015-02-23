var H5P = H5P || {};

/**
 *
 */
H5P.ImageHotspots = (function ($) {

  var DEFAULT_FONT_SIZE = 24;
  /**
   * Constructor function.
   */
  function C(options, id) {
    // Extend defaults with provided options
    this.options = $.extend(true, {}, {
      image: null,
      hotspots: []
    }, options);
    // Keep provided id.
    this.id = id;
    this.isSmallDevice = false;
  };

  /**
   * Attach function called by H5P framework to insert H5P content into
   * page
   *
   * @param {jQuery} $container
   */
  C.prototype.attach = function ($container) {
    var self = this;
    self.$container = $container;

    // Need to know since ios uses :hover when clicking on an element
    if (/(iPad|iPhone|iPod)/g.test( navigator.userAgent ) === false) {
      $container.addClass("not-an-ios-device");
    }

    $container.addClass("h5p-image-hotspots");

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

    // Add hotspots
    var numHotspots = this.options.hotspots.length;
    for(var i=0; i<numHotspots; i++) {
      var hotspot = this.options.hotspots[i];
      hotspot.element = $('<div/>', {
        'class': 'h5p-image-hotspot',
        'data-hotspot-index': i,
        click: function () {
          var hs = self.options.hotspots[$(this).data('hotspot-index')];
          if(hs.visible) {
            self.hidePopup(hs);
          }
          else {
            self.showPopup(hs);
          }
          return false;
        }
      }).css({top: hotspot.y + '%', left: hotspot.x + '%', background: 'rgba('+ this.hexToRgb(this.options.color) + ',0.5)'}).appendTo(this.$hotspotContainer);
    }

    this.$hotspotContainer.appendTo($container);

    $(window).on('resize', function(){
      self.resize();
    });
    this.resize();
  };

  /**
   * Hex string to RGB
   *
   * eg: FFFFFF -> 255,255,255
   */
  C.prototype.hexToRgb = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if(result) {
      return parseInt(result[1], 16) + ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16);
    }
    return '0,0,0';
  };

  /**
   * Display the popup:
   */
  C.prototype.showPopup = function (hotspot) {
    var self = this;
    var width = this.$hotspotContainer.width();

    self.hotspot = hotspot;
    var popupLeft = 0;
    var popupWidth = 0;

    if (self.isSmallDevice) {
      popupWidth = width;
    }
    else {
      // Translate percent to pixels
      var hotspotLeft = (hotspot.x/100) * width;
      var toTheLeft = (hotspot.x > 45);

      popupLeft = (toTheLeft ? 0 : hotspotLeft+(this.fontSize*2.8));
      popupWidth = (toTheLeft ? hotspotLeft-(this.fontSize*1.2) : width-popupLeft);
    }

    this.$popupBackground = $('<div/>', {'class': 'h5p-image-hotspots-overlay'});

    this.$popup = $('<div/>', {
      'class': 'h5p-image-hotspot-popup'
    }).css({
      left: (toTheLeft ? width : -width) + 'px',
      width: popupWidth + 'px'
    }).click(function (event){
      // If clicking on popup, stop propagating:
      event.stopPropagation();
    }).appendTo(this.$popupBackground);

    /* We don't get click events on body for iOS-devices */
    $('body').children().on('click.h5p-image-hotspot-popup', function(event) {
      self.hidePopup(hotspot);
    });

    // Add content to popup:
    this.$popup.append($('<div/>', {'class': 'h5p-image-hotspot-popup-header', text: hotspot.header}));

    var $content = $('<div/>', {'class': 'h5p-image-hotspot-popup-text'});
    var action = H5P.newRunnable(hotspot.action, this.id);
    action.attach($content);
    $content.appendTo(this.$popup);
    // Need to add pointer to parent container, since this should be partly covered
    // by the popup
    if (self.isSmallDevice) {
      this.$closeButton = $('<div>', {
        'class': 'h5p-image-hotspot-close-popup-button'
      }).appendTo(this.$popupBackground);
    }
    else {
      this.$pointer = $('<div/>', {
        'class': 'h5p-image-hotspot-popup-pointer to-the-' + (toTheLeft ? 'left' : 'right'),
      }).css({
        left: (toTheLeft ? width : (-width-(0.7*self.fontSize))) + 'px',
        top: hotspot.y + '%'
      }).appendTo(this.$popupBackground);
    }

    this.$popupBackground.appendTo(this.$hotspotContainer);

    // Show overlay:
    hotspot.element.addClass('active');
    hotspot.visible = true;

    // Create animation:
    setTimeout(function(){
      self.$popup.css({
        left: popupLeft + 'px'
      });
      if (self.$pointer) {
        self.$pointer.css({
          left: (toTheLeft ? popupWidth : Math.ceil(popupLeft-(0.7*self.fontSize))) + 'px'
        });
      }
      self.$popupBackground.addClass('visible');
    }, 100);

    if (self.isSmallDevice) {
      H5P.Transition.onTransitionEnd(self.$popup, function () {
        self.$closeButton.css({
          right: 0
        });
      }, 300);
    }

  };

  /**
   * Hide the popup
   */
  C.prototype.hidePopup = function (hotspot) {
    /* We don't get click events on body for iOS-devices */
    $('body').children().off('click.h5p-image-hotspot-popup');
    hotspot.element.removeClass('active');
    hotspot.visible = false;
    this.$popupBackground.remove();

    this.hotspot = undefined;
  };

  /**
   * Handle resizing
   */
  C.prototype.resize = function () {
    var containerWidth = this.$container.width();
    var containerHeight = this.$container.height();

    // Hide popup:
    if (this.hotspot !== undefined) {
      this.hidePopup(this.hotspot);
    }

    var width = containerWidth;
    var height = Math.floor((width/this.options.image.width)*this.options.image.height);

    this.$image.css({
      width: width,
      height: height
    });

    this.fontSize = (DEFAULT_FONT_SIZE * (width/this.initialWidth));
    this.fontSize = this.fontSize < DEFAULT_FONT_SIZE ? DEFAULT_FONT_SIZE : this.fontSize;

    this.$hotspotContainer.css({
      width: width,
      height: height,
      fontSize: this.fontSize + 'px'
    });

    this.isSmallDevice = (containerWidth / parseFloat($("body").css("font-size")) < 40);
    this.$container.toggleClass('small-device', this.isSmallDevice);
  };

  C.prototype.getCopyrights = function () {
    var info = new H5P.ContentCopyrights();

    var image = new H5P.MediaCopyright(this.options.image.copyright);
    image.setThumbnail(new H5P.Thumbnail(H5P.getPath(this.options.image.path, this.id), this.options.image.width, this.options.image.height));
    info.addMedia(image);

    return info;
  };

  return C;
})(H5P.jQuery);
