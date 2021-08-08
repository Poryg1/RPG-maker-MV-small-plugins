/*:
 *
 * @plugindesc V1.0 Spawns events from dummy map
 * @author Poryg
 *
 * @param dummyMapId
 * @text Dummy map ID
 * @desc Sets the ID of the map you will use as a dummy for the stored events.
 * 0 means use same map as ExtraEventPages plugin.
 * @type number
 * @default 0
 * 
 * @help Capable of spawning events from a dummy map. Also allows to save a map
 * to your hdd after it is done. Unlike GALV's event spawner it doesn't allow you
 * to spawn events only temporarily, but that has never been the aim of this plugin.
 * By default uses the same map as Extra event pages plugin, but you can set your
 * own by specifying a parameter.
 * Note that you cannot spawn new events during other times than on map load. The
 * reason for that is, GALV's plugin already does the job, so it wouldn't make sense
 * to try to do that.
 * 
 * 
 * Plugin commands:
 * savemap
 * saves the current map. This will also save all modifications made with
 * the extra event pages plugin.
 * 
 * Notetags:
 * <savemap>
 * saves the current map. This happens BEFORE any event page appending by 
 * extraEventPages plugin happens.
 * 
 * <POR_spawnEvents: [eventId], [x], [y]>
 * multiple instances are separated by an "n" ;
 * 
 * <savemap>
 * <POR_spawnEvents:
 * 1,3,3;
 * 1;
 * 5>
 * will summon: event 1 on coords 3,3
 * another event 1 on its native coordinates
 * and event 5 on its native coordinates
 * */

var imported = imported || {};
imported.POR_eventSpawner = true;

POR_eventSpawner_title_start = Scene_Title.prototype.start;
Scene_Title.prototype.start = function () {
    if (!imported.POR_extraEventPages) throw new Error ("POR_EventSpawner requires POR_ExtraEventPages plugin. If it is installed,\ncheck whether this plugin is underneath it in Plugin manager.");
    POR_eventSpawner_title_start.call(this);
}

PORParameters = PluginManager.parameters("POR_ExtraEventPages");
var PORParams = PORParams || {};
PORParams.eventSpawner = {};
PORParams.eventSpawner.dummyMapId = Number(PORParameters.dummyMapId) || Number(PORParams.extraEventPages.dummyMapId);

POR_eventSpawner_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    POR_eventSpawner_pluginCommand.call(this, command, args)
    if (command === 'savemap') saveable();
};

POR_eventSpawner_SceneMap_onMapLoaded = Scene_Map.prototype.onMapLoaded;
Scene_Map.prototype.onMapLoaded = function() {
    if ($dataMap.meta.POR_spawnEvents) this.spawnNewEvents();
    if ($dataMap.meta.savemap) saveMap();
    POR_eventSpawner_SceneMap_onMapLoaded.call(this);
};

Scene_Map.prototype.spawnNewEvents = function () {
    var newEvents = $dataMap.meta.POR_spawnEvents;
    newEvents = newEvents.replace(/\n/g, "");
    newEvents = newEvents.replace (/ /g, "");
    newEvents = newEvents.split("n");
    if (!newEvents[newEvents.length - 1].length) newEvents.pop();
    while ($dataMap.events[$dataMap.events.length - 1] === null) $dataMap.events.pop();
    if (!$dataMap.events.length) $dataMap.events.push(null);
    for (var i in newEvents) {
        newEvents[i] = newEvents[i].split(",");
        this.spawnNewEvent(newEvents[i][0], newEvents[i][1], newEvents[i][2]);
    }
}

Scene_Map.prototype.spawnNewEvent = function (eventId, x, y) {
    var event = JSON.parse(JSON.stringify($dummyMap.events[eventId]));
    if (x == 0 || Number(x)) event.x = Number(x);
    if (y == 0 || Number(y)) event.y = Number(y);
    event.name = event.name.replace (eventId.padZero(3), "");
    event.name = event.name + $dataMap.events.length.padZero(3);
    $dataMap.events.push(event);
}


function saveable () {
    for (var i = 1; i < $dataMap.events.length; i++) {
        if ($dataMap.events[i].pages.length > 20) {
            if (confirm ("You're trying to save a map when an event has more than 20 event pages. Opening this event in the MV editor would crash the program. \nProceed regardless?")) {
            continue;
            }else return;
        }
    }
    saveMap();
}
function saveMap () {
    var mapId = $gameMap._mapId || $gamePlayer.newMapId();
    if (Utils.isNwjs ()) {
        var fs = require("fs");
        var saveMap = JSON.stringify($dataMap);
        saveMap = saveMap.replace ('"autoplayBgm"', '\n"autoplayBgm"');
        saveMap = saveMap.replace ('"data"', '\n' + '"data"');
        saveMap = saveMap.replace ('"events"', '\n' + '"events"');
        saveMap = saveMap.replace ('ents":[null,', 'ents":[' + '\n' + "null,");
        saveMap = saveMap.replace (/{"id"/g, '\n{"id"');
        saveMap = saveMap.replace ('"meta":{}}]}', '"meta":{}}' + "\n" + ']' + "\n" + '}');
        fs.writeFileSync("data/Map" + mapId.padZero(3) + ".json", saveMap);
        alert ("Map saved (hopefully). It is recommended to close the program and reload the project in your MV editor to prevent event duplicates. \nAlso, don't forget to delete the command when you don't need it anymore.");
    }
    else {
        throw new Error ("Saving the map requires NW.js");
    }
}