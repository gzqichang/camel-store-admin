var Canvas2Image = (function() {
  var $support = (function() {
    var canvas = document.createElement("canvas"),
      ctx = canvas.getContext("2d");
    return {
      canvas: !!ctx,
      imageData: !!ctx.getImageData,
      dataURL: !!canvas.toDataURL,
      btoa: !!window.btoa
    };
  })();
  var downloadMime = "image/octet-stream";
  function scaleCanvas(canvas, width, height) {
    var w = canvas.width,
      h = canvas.height;
    if (width == undefined) {
      width = w;
    }
    if (height == undefined) {
      height = h;
    }
    var retCanvas = document.createElement("canvas");
    var retCtx = retCanvas.getContext("2d");
    retCanvas.width = width;
    retCanvas.height = height;
    retCtx.drawImage(canvas, 0, 0, w, h, 0, 0, width, height);
    return retCanvas;
  }
  function getDataURL(canvas, type, width, height) {
    canvas = scaleCanvas(canvas, width, height);
    return canvas.toDataURL(type);
  }
  function saveFile(strData) {
    document.location.href = strData;
  }
  function genImage(strData) {
    var img = document.createElement("img");
    img.src = strData;
    return img;
  }
  function fixType(type) {
    type = type.toLowerCase().replace(/jpg/i, "jpeg");
    var r = type.match(/png|jpeg|bmp|gif/)[0];
    return "image/" + r;
  }
  function encodeData(data) {
    if (!window.btoa) {
      throw "btoa undefined";
    }
    var str = "";
    if (typeof data == "string") {
      str = data;
    } else {
      for (var i = 0; i < data.length; i++) {
        str += String.fromCharCode(data[i]);
      }
    }
    return btoa(str);
  }
  function getImageData(canvas) {
    var w = canvas.width,
      h = canvas.height;
    return canvas.getContext("2d").getImageData(0, 0, w, h);
  }
  function makeURI(strData, type) {
    return "data:" + type + ";base64," + strData;
  }
  var genBitmapImage = function(oData) {
    var biWidth = oData.width;
    var biHeight = oData.height;
    var biSizeImage = biWidth * biHeight * 3;
    var bfSize = biSizeImage + 54;
    var BITMAPFILEHEADER = [
      66,
      77,
      bfSize & 255,
      (bfSize >> 8) & 255,
      (bfSize >> 16) & 255,
      (bfSize >> 24) & 255,
      0,
      0,
      0,
      0,
      54,
      0,
      0,
      0
    ];
    var BITMAPINFOHEADER = [
      40,
      0,
      0,
      0,
      biWidth & 255,
      (biWidth >> 8) & 255,
      (biWidth >> 16) & 255,
      (biWidth >> 24) & 255,
      biHeight & 255,
      (biHeight >> 8) & 255,
      (biHeight >> 16) & 255,
      (biHeight >> 24) & 255,
      1,
      0,
      24,
      0,
      0,
      0,
      0,
      0,
      biSizeImage & 255,
      (biSizeImage >> 8) & 255,
      (biSizeImage >> 16) & 255,
      (biSizeImage >> 24) & 255,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ];
    var iPadding = (4 - ((biWidth * 3) % 4)) % 4;
    var aImgData = oData.data;
    var strPixelData = "";
    var biWidth4 = biWidth << 2;
    var y = biHeight;
    var fromCharCode = String.fromCharCode;
    do {
      var iOffsetY = biWidth4 * (y - 1);
      var strPixelRow = "";
      for (var x = 0; x < biWidth; x++) {
        var iOffsetX = x << 2;
        strPixelRow +=
          fromCharCode(aImgData[iOffsetY + iOffsetX + 2]) +
          fromCharCode(aImgData[iOffsetY + iOffsetX + 1]) +
          fromCharCode(aImgData[iOffsetY + iOffsetX]);
      }
      for (var c = 0; c < iPadding; c++) {
        strPixelRow += String.fromCharCode(0);
      }
      strPixelData += strPixelRow;
    } while (--y);
    var strEncoded =
      encodeData(BITMAPFILEHEADER.concat(BITMAPINFOHEADER)) +
      encodeData(strPixelData);
    return strEncoded;
  };
  var saveAsImage = function(canvas, width, height, type) {
    if ($support.canvas && $support.dataURL) {
      if (typeof canvas == "string") {
        canvas = document.getElementById(canvas);
      }
      if (type == undefined) {
        type = "png";
      }
      type = fixType(type);
      if (/bmp/.test(type)) {
        var data = getImageData(scaleCanvas(canvas, width, height));
        var strData = genBitmapImage(data);
        saveFile(makeURI(strData, downloadMime));
      } else {
        var strData = getDataURL(canvas, type, width, height);
        saveFile(strData.replace(type, downloadMime));
      }
    }
  };
  var convertToImage = function(canvas, width, height, type) {
    if ($support.canvas && $support.dataURL) {
      if (typeof canvas == "string") {
        canvas = document.getElementById(canvas);
      }
      if (type == undefined) {
        type = "png";
      }
      type = fixType(type);
      if (/bmp/.test(type)) {
        var data = getImageData(scaleCanvas(canvas, width, height));
        var strData = genBitmapImage(data);
        return genImage(makeURI(strData, "image/bmp"));
      } else {
        var strData = getDataURL(canvas, type, width, height);
        return genImage(strData);
      }
    }
  };
  return {
    saveAsImage: saveAsImage,
    saveAsPNG: function(canvas, width, height) {
      return saveAsImage(canvas, width, height, "png");
    },
    saveAsJPEG: function(canvas, width, height) {
      return saveAsImage(canvas, width, height, "jpeg");
    },
    saveAsGIF: function(canvas, width, height) {
      return saveAsImage(canvas, width, height, "gif");
    },
    saveAsBMP: function(canvas, width, height) {
      return saveAsImage(canvas, width, height, "bmp");
    },
    convertToImage: convertToImage,
    convertToPNG: function(canvas, width, height) {
      return convertToImage(canvas, width, height, "png");
    },
    convertToJPEG: function(canvas, width, height) {
      return convertToImage(canvas, width, height, "jpeg");
    },
    convertToGIF: function(canvas, width, height) {
      return convertToImage(canvas, width, height, "gif");
    },
    convertToBMP: function(canvas, width, height) {
      return convertToImage(canvas, width, height, "bmp");
    }
  };
})();
export default Canvas2Image;
