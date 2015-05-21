var H5P = H5P || {};
H5P.ImageHotspots = H5P.ImageHotspots || {};
/**
 * SingleChoiceResultSlide - Represents the result slide
 */
H5P.ImageHotspots.Hotspot = (function ($, Popup) {

  function Hotspot(config, color, id, isSmallDeviceCB, parent) {
    var self = this;
    this.config = config;
    this.visible = false;
    this.id = id;
    this.isSmallDeviceCB = isSmallDeviceCB;

    this.$element = $('<div/>', {
      'class': 'h5p-image-hotspot',
      click: function(){
        if(self.visible) {
          self.hidePopup();
        }
        else {
          self.showPopup();
        }
        return false;
      }
    }).css({
      top: this.config.position.y + '%',
      left: this.config.position.x + '%',
      background: 'rgba('+ hexToRgb(color) + ',0.5)'
    });

    this.actionInstance = H5P.newRunnable(this.config.action, this.id);

    parent.on('resize', function () {
      if (self.popup && self.actionInstance.trigger !== undefined) {
        // The reason for this timeout is fullscreen on chrome on android
        setTimeout(function () {
          self.actionInstance.trigger('resize');
        }, 1);
      }
    });
  }

  /**
   * Append the resultslide to a container
   *
   * @param  {domElement} $container The container
   * @return {domElement}            This dom element
   */
  Hotspot.prototype.appendTo = function ($container) {
    this.$container = $container;
    this.$element.appendTo($container);
  };

  /**
   * Display the popup
   */
  Hotspot.prototype.showPopup = function () {
    var self = this;

    // Create popup content:
    var $popupBody = $('<div/>', {'class': 'h5p-image-hotspot-popup-body'});
    this.actionInstance.attach($popupBody);

    this.popup = new Popup(this.$container, $popupBody, this.config.position.x, this.config.position.y, this.$element.outerWidth(), this.config.header, this.config.action.library.split(' ')[0].replace('.','-').toLowerCase(), this.config.alwaysFullscreen || this.isSmallDeviceCB());
    this.$element.addClass('active');
    this.visible = true;

    if (this.actionInstance.trigger !== undefined) {
      this.actionInstance.trigger('resize');
    }

    // We don't get click events on body for iOS-devices
    $('body').children().on('click.h5p-image-hotspot-popup', function(event) {
      var $target = $(event.target);
      if(!$target.hasClass('h5p-enable-fullscreen') && !$target.hasClass('h5p-disable-fullscreen')) {
        self.hidePopup();
      }
    });
  };

  /**
   * Hide popup
   */
  Hotspot.prototype.hidePopup = function () {
    if (this.popup) {
      // We don't get click events on body for iOS-devices
      $('body').children().off('click.h5p-image-hotspot-popup');

      this.popup.hide();
      this.$element.removeClass('active');
      this.visible = false;

      this.popup = undefined;
    }
  };

  /**
   * Hex string to RGB
   *
   * eg: FFFFFF -> 255,255,255
   */
  var hexToRgb = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if(result) {
      return parseInt(result[1], 16) + ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16);
    }
    return '0,0,0';
  };

  return Hotspot;

})(H5P.jQuery, H5P.ImageHotspots.Popup);
