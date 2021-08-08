/*:
 * @plugindesc Plugin used to block all movement input via switch.
 * @author Poryg
 *
 * @help
 * Turn on the switch set in parameters and all movement will be dísabled.
 * As easy as it can get.
 *
 * @param BlockSwitch
 * @text Movement block switch
 * @type switch
 * @desc Sets the default switch for blocking all movement input.
 * @default 1
 */
Poryg_BlockInput = Game_Player.prototype.moveByInput
Game_Player.prototype.moveByInput = function() {
    if ($gameSwitches.value(PluginManager.parameters("POR_InputBlock")["BlockSwitch"])) return;
    return Poryg_BlockInput.call(this);
};
