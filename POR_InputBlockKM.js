/*:
 * @plugindesc Plugin used to block all movement input via switch.
 * @author Poryg
 *
 * @help
 * Turn on the switch set in parameters and all movement will be dísabled.
 * As easy as it can get.
 *
 * @param BlockSwitchKeyboard
 * @text Keyboard block switch
 * @type switch
 * @desc Sets the default switch for blocking keyboard input.
 * @default 1
 * 
 * @param BlockSwitchMouse
 * @text mouse block switch
 * @type switch
 * @desc Sets the default switch for blocking mouse input.
 * @default 2
 */

Poryg_BlockInputKeyboard = Game_Player.prototype.getInputDirection;
Game_Player.prototype.getInputDirection = function() {
    if ($gameSwitches.value(PluginManager.parameters("POR_InputBlockKM")["BlockSwitchKeyboard"])) return;
    return Poryg_BlockInputKeyboard.call(this);
};

Poryg_BlockInputMouse = Game_Temp.prototype.isDestinationValid;
Game_Temp.prototype.isDestinationValid = function() {
    if ($gameSwitches.value(PluginManager.parameters("POR_InputBlockKM")["BlockSwitchMouse"])) return;
    return Poryg_BlockInputMouse.call(this);
};

/*
Game_Player.prototype.moveByInput = function() {
    if (!this.isMoving() && this.canMove()) {
        var direction = this.getInputDirection();
        if (direction > 0) {
            $gameTemp.clearDestination();
        } else if (!$gameSwitches.value(2) && $gameTemp.isDestinationValid()){
            var x = $gameTemp.destinationX();
            var y = $gameTemp.destinationY();
            direction = this.findDirectionTo(x, y);
        }
        if (direction > 0) {
            this.executeMove(direction);
        }
    }
};
*/