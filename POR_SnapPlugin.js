/*:
 * @plugindesc Plugin that saves a snapshot of current map into parallax BG
 * @author Poryg
 * 
 * @help
 * Plugin command: POR_snap
 * */


var POR_SP_GI_pC = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    POR_SP_GI_pC.call(this, command, args);
    if (command === 'POR_snap') POR_snapBackground(); 
};

function POR_snapBackground () {
    delete ImageManager._imageCache._items["img/parallaxes/!MenuBG.png:0"];
    var rt = PIXI.RenderTexture.create(Graphics.boxWidth, Graphics.boxHeight);
    Graphics._renderer.render(SceneManager._scene, rt);
    var base = Graphics._renderer.extract.base64(rt);
    var bin = atob(base.split(",")[1]);
    var fs = require ("fs");
    var filepath;
    var versionNums = [Number(Utils.RPGMAKER_VERSION[2], Utils.RPGMAKER_VERSION[4])];
    if (versionNums[0] > 5 || (versionNums[0] == 5 && versionNums[1] == 2)) filepath = "./"; 
    else {
        var path = require("path");
        filepath = path.dirname(process.mainModule.filename);
    }
    fs.writeFileSync (filepath + "img/parallaxes/!MenuBG.png", bin, "binary");    
    var tex = PIXI.BaseTexture.fromImage ("img/parallaxes/!MenuBG.png");
    tex.destroy();
}
