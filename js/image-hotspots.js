var H5P = H5P || {};
 
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
  };
 
  /**
   * Attach function called by H5P framework to insert H5P content into
   * page
   *
   * @param {jQuery} $container
   */
  C.prototype.attach = function ($container) {
    var self = this;
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
    
    // Add invisible layer:
    this.$hotspotsOverlay = $('<div/>', {'class': 'h5p-image-hotspots-overlay'}).appendTo(this.$hotspotContainer);
    
    // Add hotspots
    var numHotspots = this.options.hotspots.length;
    for(var i=0; i<numHotspots; i++) {
      var hotspot = this.options.hotspots[i];
      hotspot.$ = $('<div/>', {
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
    
    // Translate percent to pixels
    var hotspotLeft = (hotspot.x/100) * width;
    var toTheLeft = (hotspot.x > 50);
    
    var popupLeft = (toTheLeft ? 0 : hotspotLeft+(this.fontSize*2.8));
    var popupWidth = (toTheLeft ? hotspotLeft-(this.fontSize*1.2) : width-popupLeft);
    
    this.$popup = $('<div/>', {
      'class': 'h5p-image-hotspot-popup'
    }).css({
      left: (toTheLeft ? width : -width) + 'px',
      width: popupWidth + 'px'
    });
    
    $('body').on('click.h5p-image-hotspot-popup', function() { self.hidePopup(hotspot); });
    
    // Add content to popup:
    this.$popup.append($('<div/>', {'class': 'h5p-image-hotspot-popup-header', text: hotspot.header}));
    
    var $content = $('<div/>', {'class': 'h5p-image-hotspot-popup-text'});
    var action = H5P.newRunnable(hotspot.action, this.id);
    action.attach($content);
    $content.appendTo(this.$popup);
    // Need to add pointer to parent container, since this should be partly covered
    // by the popup
    this.$pointer = $('<div/>', {
      'class': 'h5p-image-hotspot-popup-pointer',
    }).css({
      left: (toTheLeft ? width : -width) + 'px',
      top: hotspot.y + '%'
    }).appendTo(this.$hotspotContainer);
    
    this.$popup.append($('<div/>', {
      'class': 'h5p-image-hotspot-popup-close',
      click: function() { self.hidePopup(hotspot); }
    }));
    this.$popup.appendTo(this.$hotspotContainer);
    
    // Show overlay:
    this.$hotspotsOverlay.addClass('visible');
    hotspot.$.addClass('active');
    hotspot.visible = true;
    
    // Create animation:
    setTimeout(function(){
      self.$popup.css({
        left: popupLeft + 'px'
      });
      self.$pointer.css({
        left: (toTheLeft ? popupWidth-(self.fontSize) : popupLeft-(self.fontSize/2)) + 'px'
      });
    }, 100);
  };
  
  /**
   * Hide the popup
   */
  C.prototype.hidePopup = function (hotspot) {
    $('body').off('click.h5p-image-hotspot-popup');
    this.$hotspotsOverlay.removeClass('visible');
    hotspot.$.removeClass('active');
    hotspot.visible = false;
    $('.h5p-image-hotspot-popup-pointer').remove();
    this.$popup.remove();
  };
  
  /**
   * Handle resizing
   */
  C.prototype.resize = function () {
    var containerWidth = this.$hotspotContainer.parent().width();
    var containerHeight = this.$hotspotContainer.parent().height();
    
    var width = containerWidth;
    var height = (width/this.options.image.width)*this.options.image.height;
    
    if(height > containerHeight) {
      height = containerHeight;
      width = (height/this.options.image.height)*this.options.image.width;
    }
    
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
  };
 
  return C;
})(H5P.jQuery);