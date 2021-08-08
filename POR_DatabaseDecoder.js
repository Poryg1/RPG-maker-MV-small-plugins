//=============================================================================
// POR_Database Decoder
//=============================================================================
/*:
 * @plugindesc Reads files compressed by POR_DatabaseEncoder
 * @author Poryg
 * 
 * @help
 * Plugin used as a way to decode database files inside database encoder.
 */


function decodeDataFile(databaseFile) {
    return LZString.decompressFromBase64(databaseFile);
}

POR_DatabaseCompressor_DataManager_loadDataFile = DataManager.loadDataFile;
DataManager.loadDataFile = function(name, src) {
    if (Utils.isOptionValid("test")) {
        POR_DatabaseCompressor_DataManager_loadDataFile.call(this, name, src);
        return;
    }
    var xhr = new XMLHttpRequest();
    var url = 'data/' + src + 'o';
    xhr.open('GET', url);
    xhr.onload = function() {
        if (xhr.status < 400) {
            var LZDecompressed = decodeDataFile(xhr.responseText);
            window[name] = JSON.parse(LZDecompressed);
            DataManager.onLoad(window[name]);
        }
    };
    xhr.onerror = this._mapLoader || function() {
        DataManager._errorUrl = DataManager._errorUrl || url;
    };
    window[name] = null;
    xhr.send();
};