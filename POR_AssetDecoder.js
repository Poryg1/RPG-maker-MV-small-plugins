//=============================================================================
// POR_Asset Decoder
//=============================================================================
/*:
 * @plugindesc Decrypts assets encrypted by POR_AssetEncrypter for the game
 * @author Poryg
 */

function decodeFile(fileContents) {
    var fbx = 100;
    var lbx = 500;
    for (var i = fbx; i < lbx; i++) {
        fileContents[i] -= fileContents[i-5];
        var x = fileContents[i];
        fileContents[i] = fileContents[i-fbx];
        fileContents[i-fbx] = x;
    }
}

POR_DatabaseCompresor_AudioManager_load = WebAudio.prototype._load;
WebAudio.prototype._load = function(url) {
    POR_DatabaseCompresor_AudioManager_load.call(this, url + "o");
}

Bitmap.prototype._onXhrLoad = function(xhr, url) {
    var u8arr = new Uint8Array(xhr.response);
    decodeFile(u8arr);
    var blob = new Blob([u8arr], {type: "image/png"});
    var url = URL.createObjectURL(blob);
    this._image.src = url;
}

Bitmap.prototype._requestImage = function(url){
    if(Bitmap._reuseImages.length !== 0){
        this._image = Bitmap._reuseImages.pop();
    }
    if (this._decodeAfterRequest && !this._loader) {
        this._loader = ResourceHandler.createLoader(url, this._requestImage.bind(this, url), this._onError.bind(this));
    }

    this._image = new Image();
    this._image.addEventListener('load', this._loadListener = Bitmap.prototype._onLoad.bind(this));
    this._image.addEventListener('error', this._errorListener = this._loader || Bitmap.prototype._onError.bind(this));
    this._url = url;
    this._loadingState = 'requesting';
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url + "o");
    xhr.responseType = "arraybuffer";
    xhr.onload = Bitmap.prototype._onXhrLoad.bind(this, xhr);
    xhr.send();
};

WebAudio.prototype._onXhrLoad = function(xhr) {
    var array = xhr.response;
    if(Decrypter.hasEncryptedAudio) array = Decrypter.decryptArrayBuffer(array);
    var u8arr = new Uint8Array(array);
    decodeFile(u8arr);
    this._readLoopComments(u8arr);
    WebAudio._context.decodeAudioData(array, function(buffer) {
        this._buffer = buffer;
        this._totalTime = buffer.duration;
        if (this._loopLength > 0 && this._sampleRate > 0) {
            this._loopStart /= this._sampleRate;
            this._loopLength /= this._sampleRate;
        } else {
            this._loopStart = 0;
            this._loopLength = this._totalTime;
        }
        this._onLoad();
    }.bind(this));
};



Game_Interpreter.prototype.videoFileExt = function() {
    if (Graphics.canPlayVideoType('video/webm') && !Utils.isMobileDevice()) {
        return '.webmo';
    } else {
        return '.mp4o';
    }
};

Graphics._returnVideoFormat = function() {
    if (Graphics.canPlayVideoType('video/webm') && !Utils.isMobileDevice()) {
        return 'video/webm';
    } else {
        return 'video/mp4';
    }
}

Graphics._playVideo = function(src) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", src);
    xhr.responseType = "arraybuffer";
    xhr.send();
    xhr.onload = Graphics._onXhrLoad.bind(this, xhr);
    this._videoLoading = true;
};

Graphics._onXhrLoad = function(xhr) {
    var u8arr = new Uint8Array(xhr.response);
    decodeFile(u8arr);
    var blob = new Blob([u8arr], {type: Graphics._returnVideoFormat()});
    var url = URL.createObjectURL(blob);
    this._video.src = url;
    this._video.onloadeddata = this._onVideoLoad.bind(this);
    this._video.onerror = this._videoLoader;
    this._video.onended = this._onVideoEnd.bind(this);
    this._video.load();
}

