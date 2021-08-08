/*:
 * @plugindesc Plugin for setting one particular party "leader" on map.
 * @author Poryg
 *
 * @help
 * Set the actor ID and you're good to go.
 * As easy as it can get.
 * If you need to change the leader, use plugin command
 * changeleadergraphic 1, where 1 is actor 1. If you need other actors,
 * substitute 1 for whatever actorID.
 * Note that the leader is only a cosmetic thing and will not influence
 * your party at all!
 * Note that this plugin counts on followers turned off.
 *
 * @param PartyLeader
 * @text Leader's actor ID
 * @type number
 * @desc Sets the actor ID of your leader.
 * @default 1
 */

POR_FixedLeader_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    POR_FixedLeader_pluginCommand.call(this, command, args);
    if (command === "changeleadergraphic") this.changeLeaderGraphic(args[0]);
};

Game_Interpreter.prototype.changeLeaderGraphic = function (actorId) {
	$gamePlayer._leaderId = actorId;
	$gamePlayer.refresh ();
}

Game_Player.prototype.refresh = function() {
    var actor = this._leaderId ? $gameActors.actor (this._leaderId) : $gameActors.actor(PluginManager.parameters("POR_FixedLeader")["PartyLeader"]);
    var characterName = actor ? actor.characterName() : '';
    var characterIndex = actor ? actor.characterIndex() : 0;
    this.setImage(characterName, characterIndex);
    this._followers.refresh();
};