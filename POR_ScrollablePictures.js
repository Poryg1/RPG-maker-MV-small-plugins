/*:
 * @plugindesc Scroll pictures that are larger than your screen
 * @author Poryg
 *
 * @help Simple plugin that serves for moving pictures shown via Show picture
 * with your mouse wheel. Works for pictures that have either greater width
 * or greater height than the respective screen dimension. It prioritizes width
 * over height, so if it's both wider and higher, only the width counts.
 * 
 * Plugin commands:
 * POR_scrollPic true/false - toggle wherther you're allowed to scroll. (default: true)
 * POR_scrollPicBattle true/false Same as the above, just for battle (default: false)
 * POR_changePicScrollRate integer - Scroll rate in pixels (default: 48)
 * POR_changePicScrollDuration integer - Scroll duration in frames (default: 20)
 * example:
 * POR_scrollPic true
 * POR_scrollPicBattle false
 * POR_changePicScrollRate 20
 * POR_changePicScrollDuration 35
 * 
 * 
 * @param scrollPixels
 * @desc Sets the amount of pixels per wheel scroll.
 * @type number
 * @default 48
 * 
 * @param scrollDuration
 * @desc Sets the duration of a scroll. A new one won't begin until the previous
 * has been finished.
 * @type number
 * @default 20
 * */

var PORParams = PluginManager.parameters("POR_ScrollablePictures");
var POR_ScrollPic_GameInterpreter_plugComm = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function (command, args) {
    POR_ScrollPic_GameInterpreter_plugComm.call(this, command, args);
    if (command === "POR_scrollPic") $gameSystem._canScrollPics = JSON.parse(args[0]);
    else if (command === "POR_scrollPicBattle") $gameSystem._canScrollPicsBattle = JSON.parse(args[0]);
    else if (command === "POR_changePicScrollRate") $gameSystem._pictureScrollRate = Math.ceil(Number(args[0]));
    else if (command === "POR_changePicScrollDuration") $gameSystem._pictureScrollDuration = Math.ceil(Number(args[0]));
}

var POR_ScrollPic_GameSys_init = Game_System.prototype.initialize;
Game_System.prototype.initialize = function () {
    POR_ScrollPic_GameSys_init.call(this);
    this._canScrollPics = true;
    this._canScrollPicsBattle = false;
    this._pictureScrollRate = Number(PORParams.scrollPixels);
    this._pictureScrollDuration = Number (PORParams.scrollDuration);
}

var POR_ScrollPic_GameScr_showPic = Game_Screen.prototype.showPicture;
Game_Screen.prototype.showPicture = function(pictureId, name, origin, x, y, scaleX, scaleY, opacity, blendMode) {
    POR_ScrollPic_GameScr_showPic.call(this, pictureId, name, origin, x, y, scaleX, scaleY, opacity, blendMode);
    var realPictureId = this.realPictureId(pictureId);
    this._pictures[realPictureId]._index = realPictureId;
    this._pictures[realPictureId]._spriteId = pictureId - 1;
};

var POR_ScrollPic_GamePic_initBasic = Game_Picture.prototype.initBasic;
Game_Picture.prototype.initialize = function () {
    POR_ScrollPic_GamePic_initBasic.call(this);
    this._isScrolling = false;
}

var POR_ScrollPic_GamePic_update = Game_Picture.prototype.update;
Game_Picture.prototype.update = function () {
    POR_ScrollPic_GamePic_update.call(this);
    if (this._duration <= 0) this._isScrolling = false; 
    if (TouchInput.wheelY > 0 && !this._isScrolling) {
        if ($gameParty.inBattle()) {
            if ($gameSystem._canScrollPicsBattle && this._index > 100) this.scrollDown();
        }else if ($gameSystem._canScrollPics && this._index <= 100) this.scrollDown();
    }
    if (TouchInput.wheelY < 0 && !this._isScrolling) {
        if ($gameParty.inBattle()) {
            if ($gameSystem._canScrollPicsBattle && this._index > 100) this.scrollUp();
        }else if ($gameSystem._canScrollPics && this._index <= 100) this.scrollUp();
    }
}

Game_Picture.prototype.scrollDown = function () {
    var currentTex = SceneManager._scene._spriteset._pictureContainer.children[this._spriteId].texture;
    if (currentTex.width > Graphics.boxWidth) {
        var x1 = Graphics.boxWidth - currentTex.width;
        if (this._x == x1) return;
        var x = Math.max(x1, this._x - $gameSystem._pictureScrollRate);
        this.move (0, x, this._y, this._scaleX, this._scaleY, this._opacity, this._blendMode, $gameSystem._pictureScrollDuration);

    }else if (currentTex.height > Graphics.boxHeight) {
        var y1 = Graphics.boxHeight - currentTex.height;
        if (this._y == y1) return;
        var y = Math.max(y1, this._y - $gameSystem._pictureScrollRate);
        this.move (0, this._x, y, this._scaleX, this._scaleY, this._opacity, this._blendMode, $gameSystem._pictureScrollDuration);
    }
}

Game_Picture.prototype.scrollUp = function () {
    var currentTex = SceneManager._scene._spriteset._pictureContainer.children[this._spriteId].texture;
    if (currentTex.width > Graphics.boxWidth) {
        if (this._x == 0) return;
        var x = Math.min(0, this._x + $gameSystem._pictureScrollRate);
        this.move (0, x, this._y, this._scaleX, this._scaleY, this._opacity, this._blendMode, $gameSystem._pictureScrollDuration);

    }else if (currentTex.height > Graphics.boxHeight) {
        if (this._y == 0) return;
        var y = Math.min(0, this._y + $gameSystem._pictureScrollRate);
        this.move (0, this._x, y, this._scaleX, this._scaleY, this._opacity, this._blendMode, $gameSystem._pictureScrollDuration);
    }
}