//=============================================================================
// POR_Database encoder
//=============================================================================
/*:
 * @plugindesc Compresses the database files so they're not human readable
 * @author Poryg
 * 
 * @help
 * How to use:
 * 1. Activate the plugin
 * 2. Launch the game in playtest mode
 * 3. Deploy the game
 * 4. Open the deployed game's data folder
 * 5. Delete the base json files
 * Once this is done, this plugin is no longer necessary and can be removed.
 * 
 * Plugin is not compatible with any plugins that use JSON files
 * from other folders than the base /data one
 * Terms of use: MIT License
 * 
 * FAQ:
 * Does this make your game more secure?
 * Yes and no. It's a basic security feature, so it's easy to break through,
 * but nobody is able to read your data files, so they can't just open it
 * in a text editor.
 * 
 * What's the performance cost?
 * The base64 encoding increases the file size to 1.6-2x. So it will increase
 * loading times too. With small files it's not a bother, but you can expect
 * some increased loading times especially with large maps. 
 * 
 * Is the performance cost unavoidable?
 * You're always going to have to pay with performance for safety. I'm not sure
 * if you can avoid this much performance loss though, because I don't know how
 * much performance other compression methods work. 
 * 
 * If you want to choose other methods of encoding/decoding, feel free to.
 * 
 * Changelog:
 * V1.1 - changed plugin structure to support custom encoding/decoding algorithms
 */

function encodeDataFile(databaseFile) {
    return LZString.compressToBase64(databaseFile);
}

function decodeDataFile(databaseFile) {
    return LZString.decompressFromBase64(databaseFile);
}

if (Utils.isOptionValid("test")) {
    var fs = require("fs");
    var datadir = fs.readdirSync("./data/");
    for (var i in datadir) {
        if (!datadir[i].contains(".json") || datadir[i].contains(".jsono")) continue;
        var file = fs.readFileSync("./data/" + datadir[i], {encoding: "utf-8"});
        var LZCompressed = encodeDataFile(file);
        fs.writeFileSync("./data/" + datadir[i] + 'o', LZCompressed);
    }
};

DataManager.loadDataFile = function(name, src) {
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