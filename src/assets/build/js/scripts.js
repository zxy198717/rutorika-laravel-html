$(document).ready(function () {
  ace.config.set("basePath", "/vendor/rutorika/form/vendor/ace/src-noconflict/");

  $('.rk-code-field').each(function () {
    var $field = $(this);
    var editor = ace.edit($field.siblings('.rk-code').get(0));

    editor.$blockScrolling = Infinity; // @see https://github.com/angular-ui/ui-ace/issues/104

    var mode = $field.data('mode') || 'html';
    var theme = $field.data('theme') || 'textmate';

    editor.setTheme('ace/theme/' + theme);
    editor.getSession().setMode('ace/mode/' + mode);

    editor.getSession().setValue($field.val());

    editor.getSession().on('change', function () {
      $field.val(editor.getSession().getValue());
    });
  });
});
$(document).ready(function(){
  $('.rk-color-field').each(function () {
    var $field = $(this);
    var settings = $field.data('minicolors');

    settings = $.extend({theme: 'bootstrap'}, settings);

    $field.minicolors(settings);
  });
});
$(function () {
  $('.rk-datetimepicker').each(function () {
    var $field = $(this).find('input');
    var dateOptions = $field.data('datetime');

    $(this).datetimepicker(dateOptions);
  });
});
L.Icon.Default.imagePath = '/vendor/rutorika/form/vendor/leaflet-0.7.5/images';

$(document).ready(function () {

  function parsePoint(value) {
    return value ? value.split(':') : null;
  }

  $('.rk-geopoint-field').each(function () {

    var $field = $(this);
    var $map = $(this).siblings('.rk-map');
    var pointMarker;

    var layerName = $field.data('layer') || 'osm';

    var options = $.extend({
      center: [51.476852, -0.000498],
      zoom: 12
    }, $field.data('map') || {});

    var point = parsePoint($field.val());

    if (point) {
      options.center = point;
    }

    var map = new L.Map($map.get(0), options);

    if (point) {
      setPointMarker(point);
    }

    var layer;
    var type;

    function setPointMarker(point) {
      if (!pointMarker) {
        pointMarker = L.marker(point, {draggable: true}).addTo(map);
        pointMarker.on('dragend', function (e) {
          var latLng = this.getLatLng();
          setPointMarker(latLng);
          $field.val(latLng.lat + ':' + latLng.lng);
        });
      } else {
        pointMarker.setLatLng(point);
      }
      map.panTo(point);
    }

    function removePointMarker() {
      if (pointMarker) {
        map.removeLayer(pointMarker);
        pointMarker = null;
      }
    }

    function getLayerType(layerName, variants, defaultType) {
      var type = $field.data('type') || defaultType;

      if (variants.indexOf(type) < 0) {
        console.warn(layerName + ' doesnt support `' + type + '` type. Only ' + variants.join(' | ') + '. Fallback to ' + defaultType);
        type = defaultType;
      }

      return type;
    }

    switch (layerName) {
      case 'yandex':
        // https://tech.yandex.ru/maps/doc/jsapi/2.1/dg/concepts/map-docpage/#parameters
        // map | satellite | hybrid | publicMap | publicMapHybrid
        type = getLayerType('Yandex', ['map', 'satellite', 'hybrid', 'publicMap', 'publicMapHybrid'], 'publicMap');
        layer = new L.Yandex(type);
        break;
      case 'osm':
        // e. g. 'http://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png'
        // some examples: http://leaflet-extras.github.io/leaflet-providers/preview/
        type = $field.data('type') || 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        if (!(type.indexOf('http') === 0 || type.indexOf('//') === 0)) {
          console.warn('OSM doesnt support `' + type + '` type. Fallback to http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
          type = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        }
        layer = new L.TileLayer(type);
        break;
      case 'google':
        // https://developers.google.com/maps/documentation/javascript/maptypes
        // ROADMAP | SATELLITE | HYBRID | TERRAIN
        type = getLayerType('Google', ['ROADMAP', 'SATELLITE', 'HYBRID', 'TERRAIN'], 'ROADMAP');
        layer = new L.Google('ROADMAP');
        break;
      case 'bing':
        // https://msdn.microsoft.com/en-us/library/ff701716.aspx
        // Road | Aerial | AerialWithLabels | Birdseye | BirdseyeWithLabels
        type = getLayerType('Bing', ['Road', 'Aerial', 'AerialWithLabels', 'Birdseye', 'BirdseyeWithLabels'], 'Road');
        layer = new L.BingLayer('AvoUren6Dm0PAAyhkqPcEQs3PtNsC_VHqb2Pxyac59fd-YME_3FZ_6No4BL5iEAe', {type: type});
        break;
      default:
        console.warn('Layer `' + layerName + '` doesn\'t supported, you should use one of yandex, google, osm or bing. Fallback to OSM layer');
        layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    }

    map.addLayer(layer);

    $field.on('change', function () {
      var val = $field.val();

      if (val) {
        var point = parsePoint(val);
        setPointMarker(point);
      } else {
        removePointMarker();
      }
    });

    map.on('click', function (e) {
      setPointMarker(e.latlng);
      $field.val(e.latlng.lat + ':' + e.latlng.lng);
    });
  });

});
$('.rk-select2').each(function () {
  var $select = $(this);

  var currentValue = $select.val();
  var value = $select.data('value');
  var url = $select.data('ajax--url');

  // if async, selected, and no option with selected value exists -- then prefetching selected item from server
  // and add fetched option to select.
  if (url && value && !currentValue) {
    var request = $.ajax({
      url: url + '/init',
      data: {
        ids: value
      }
    });

    request.then(function (response) {
      response.results.forEach(function (result) {
        var $option = $('<option>')
          .text(result.text)
          .attr('value', result.id)
          .prop('selected', true);

        $select.prepend($option);
      });

      initSelect2($select);
    });

  } else {
    initSelect2($select);
  }

  function initSelect2($select) {
    if ($select.data('options')) {
      $select.select2($select.data('options'));
    } else {
      $select.select2();
    }
  }
});

$(document).ready(function(){
  $('.rk-upload-container .rk-upload-preview').magnificPopup({delegate: 'a', type: 'image'});

  $('.rk-uploader-field').each(function () {
    var $field = $(this);
    var isMultiple = $field.hasClass('rk-uploader-multiple-field');
    var $container = $field.siblings('.rk-upload-container');
    var $preview = $container.find('.rk-upload-preview');

    var setValue = function (filename, filepath) {
      if (!isMultiple) {
        $field.val(filename);
        $container.find('.rk-upload-link').text(filename).attr('href', filepath);

        $preview.find('a').attr('href', filepath);
        $preview.find('img,audio').attr('src', filepath);
      } else {

        var template = $('#rk-item-template').html();
        var currentValue = $field.val();

        currentValue += (currentValue ? ':' : '') + filename;
        $field.val(currentValue);

        var itemHtml = template.replace(/\{fileSrc}/g, filepath).replace(/\{filename}/g, filename);
        $preview.append(itemHtml);
      }
    };


    $container.find('input:file').fileupload({
      dataType: 'json',
      url: $field.data('url') || '/upload',
      paramName: 'file',
      formData: [{
        name: 'type',
        value: $field.data('type') || 'default'
      }],

      done: function (e, data) {
        setValue(data.result.filename, data.result.path);
      },

      fail: function (e, data) {
        console.error('Whooooops', e, data);
      }
    });

    $preview.on('click', '.rk-upload-remove', function (e) {
      e.preventDefault();
      if (!isMultiple) {
        setValue('', '');
      } else {
        $(this).parents('.rk-upload-item').remove();
        updateImages();
      }

    });

    function updateImages () {
      var files = [];

      $preview.find('.rk-upload-item').each(function(){
        files.push($(this).data('filename'));
      });

      $field.val(files.join(':'));
    }

    if (isMultiple) {
      $preview.sortable({
        handle: '.sortable-handle',
        update: function(a, b){
          updateImages();
        },
        cursor: "move"
      });
    }
  });

});