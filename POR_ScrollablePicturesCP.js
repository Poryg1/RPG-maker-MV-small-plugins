Game_Picture.prototype.update = function () {
    POR_ScrollPic_GamePic_update.call(this);
    if (!SceneManager._scene._messageWindow) return;
    if (MessageHide_messageWindowVisible) return;
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