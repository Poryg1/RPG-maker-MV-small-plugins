//=============================================================================
// POR_Asset encrypter
//=============================================================================
/*:
 * @plugindesc Encrypts your game assets to prevent stealing
 * @author Poryg
 * 
 * @help
 * How to use:
 * 1. Activate the plugin
 * 2. Launch the game in playtest mode
 * 3. Deploy the game
 * 4. Open the deployed game's data folder
 * 5. Delete the base png and music files
 * Once this is done, this plugin is no longer necessary and can be removed.
 * 
 * Terms of use: MIT License
 * 
 * FAQ:
 * Does this make your game more secure?
 * It does. It's impossible to extract the resources with the default tool. One
 * needs to look into the code... Meaning you need to be a programmer. Or find
 * a tool specifically to counteract this plugin if there is one.
 * 
 * What's the performance cost?
 * The generic algorithm is basic as it makes no sense to make an advanced one.
 * As such the performance cost is unnoticeable. 
 * 
 * Is the performance cost unavoidable?
 * You're always going to have to pay with performance for safety. I'm not sure
 * if you can avoid this much performance loss though, because I don't know how
 * much performance other compression methods work.
 * 
 * I want a custom algorithm!
 * Then feel free to do it or send me a message. 
 */


function encryptFile(fileContents) {
    for (var i = 499; i > 99; i--) fileContents[i] += fileContents[i-5];
};

function findBottomLevelFolder(filepath, search, ignore){
    var fs = require("fs");
    var files = fs.readdirSync(filepath);
    for (var i in files) {
        var path = filepath + files[i];
        try {
            findBottomLevelFolder(path + "/", search, ignore);
        }catch(e){
            var containsIgnore = false;
            var rightFormat = false;
            for (var j in search) if (path.contains(search[j])) rightFormat = true;
            for (var j in ignore) if (path.contains(ignore[j])) containsIgnore = true;
            if (!containsIgnore) {
                if (rightFormat) {
                    var file = fs.readFileSync(path);
                    encryptFile(file);
                    fs.writeFileSync(path + "o", file);
                }
            }
        }
    }
}


if (Utils.isOptionValid("test")) {
    var fs = require("fs");
    findBottomLevelFolder("./audio/", [".m4a", ".ogg"], [".oggo", "m4ao"]);
    findBottomLevelFolder("./img", [".png"], [".pngo"]);
};