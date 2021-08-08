/*:
 * @plugindesc Change terms as freely as you want
 * @author Poryg
 * 
 * @param customParams
 * @text Custom parameters
 * @desc Set your custom permanent parameters for the text manager.
 * @type []
 * 
 *
 * @help  Plugin for editing or creating terms of the game. Whether
 * you just want some name edit for HP or MP, or you want to have
 * variable menu command names... Everything is possible now!
 * 
 * Create new permanent parameters:
 * Format:
 * property: value
 * 
 * 
 * Plugin commands:
 * changeterm name value
 * Changes a certain term to the defined value.
 * 
 * deleteterm name
 * Deletes your custom term and if there's a default one, restores it.
 * 
 * 
 * List of default parameters you can change (they are case sensitive
 * and symbol sensitive):
 * 
 * ======Basic======
 * level
 * levelA (A means abbreviation)
 * hp
 * hpA
 * mp
 * mpA
 * tp
 * tpA
 * exp
 * expA
 * 
 * 
 * ======Commands======
 * fight
 * escape
 * attack
 * guard
 * item
 * skill
 * equip
 * status
 * formation
 * options
 * save
 * gameEnd
 * weapon
 * armor
 * keyItem
 * equip
 * optimize
 * clear
 * buy
 * sell
 * newGame
 * continue_
 * toTitle
 * cancel
 * 
 * 
 * ======message======
 * actionFailure
 * actorDamage
 * actorDrain
 * actorGain
 * actorLoss
 * actorNoDamage
 * actorNoHit
 * actorRecovery
 * alwaysDash
 * bgmVolume
 * bgsVolume
 * buffAdd
 * buffRemove
 * commandRemember
 * counterAttack
 * criticalToActor
 * criticalToEnemy
 * debuffAdd
 * defeat
 * emerge
 * enemyDamage
 * enemyDrain
 * enemyGain
 * enemyLoss
 * enemyNoDamage
 * enemyNoHit
 * enemyRecovery
 * escapeFailure
 * escapeStart
 * evasion
 * expNext
 * expTotal
 * file
 * levelUp
 * loadMessage
 * magicEvasion
 * magicReflection
 * meVolume
 * obtainExp
 * obtainGold
 * obtainItem
 * obtainSkill
 * partyName
 * possession
 * preemptive
 * saveMessage
 * seVolume
 * substitute
 * surprise
 * useItem
 * victory
 * 
 * 
 * ======Parameters======
 * You need to access them using their param ID. They DO NOT have a default
 * value in TextManager!:
 * 0 - Max hp
 * 1 - Max mp
 * 2 - attack
 * 3 - defence
 * 4 - Magical attack
 * 5 - Magical defence
 * 6 - Agility
 * 7 - Luck
 * 
 * 
 * ======Custom======
 * That's for your custom parameters.
 * */



var PORParameters = PORParameters || {};
PORParameters.extendedTextManager = {};
PORParameters.extendedTextManager.customParams = {};
if (PluginManager.parameters("POR_extendedTextManager").customParams.length) {
    var arr = JSON.parse (PluginManager.parameters("POR_extendedTextManager").customParams);
    for (var i in arr) {
        var prop = arr[i].split (":");
        if (prop[1][0] == " ") prop[1] = prop[1].substring(1);
        PORParameters.extendedTextManager.customParams[prop[0]] = prop[1];
    }
}


function POR_defineProps () {
    Object.defineProperties(TextManager, {
        level           : TextManager.getter('basic', 0),
        levelA          : TextManager.getter('basic', 1),
        hp              : TextManager.getter('basic', 2),
        hpA             : TextManager.getter('basic', 3),
        mp              : TextManager.getter('basic', 4),
        mpA             : TextManager.getter('basic', 5),
        tp              : TextManager.getter('basic', 6),
        tpA             : TextManager.getter('basic', 7),
        exp             : TextManager.getter('basic', 8),
        expA            : TextManager.getter('basic', 9),
        fight           : TextManager.getter('command', 0),
        escape          : TextManager.getter('command', 1),
        attack          : TextManager.getter('command', 2),
        guard           : TextManager.getter('command', 3),
        item            : TextManager.getter('command', 4),
        skill           : TextManager.getter('command', 5),
        equip           : TextManager.getter('command', 6),
        status          : TextManager.getter('command', 7),
        formation       : TextManager.getter('command', 8),
        save            : TextManager.getter('command', 9),
        gameEnd         : TextManager.getter('command', 10),
        options         : TextManager.getter('command', 11),
        weapon          : TextManager.getter('command', 12),
        armor           : TextManager.getter('command', 13),
        keyItem         : TextManager.getter('command', 14),
        equip2          : TextManager.getter('command', 15),
        optimize        : TextManager.getter('command', 16),
        clear           : TextManager.getter('command', 17),
        newGame         : TextManager.getter('command', 18),
        continue_       : TextManager.getter('command', 19),
        toTitle         : TextManager.getter('command', 21),
        cancel          : TextManager.getter('command', 22),
        buy             : TextManager.getter('command', 24),
        sell            : TextManager.getter('command', 25),
        alwaysDash      : TextManager.getter('message', 'alwaysDash'),
        commandRemember : TextManager.getter('message', 'commandRemember'),
        bgmVolume       : TextManager.getter('message', 'bgmVolume'),
        bgsVolume       : TextManager.getter('message', 'bgsVolume'),
        meVolume        : TextManager.getter('message', 'meVolume'),
        seVolume        : TextManager.getter('message', 'seVolume'),
        possession      : TextManager.getter('message', 'possession'),
        expTotal        : TextManager.getter('message', 'expTotal'),
        expNext         : TextManager.getter('message', 'expNext'),
        saveMessage     : TextManager.getter('message', 'saveMessage'),
        loadMessage     : TextManager.getter('message', 'loadMessage'),
        file            : TextManager.getter('message', 'file'),
        partyName       : TextManager.getter('message', 'partyName'),
        emerge          : TextManager.getter('message', 'emerge'),
        preemptive      : TextManager.getter('message', 'preemptive'),
        surprise        : TextManager.getter('message', 'surprise'),
        escapeStart     : TextManager.getter('message', 'escapeStart'),
        escapeFailure   : TextManager.getter('message', 'escapeFailure'),
        victory         : TextManager.getter('message', 'victory'),
        defeat          : TextManager.getter('message', 'defeat'),
        obtainExp       : TextManager.getter('message', 'obtainExp'),
        obtainGold      : TextManager.getter('message', 'obtainGold'),
        obtainItem      : TextManager.getter('message', 'obtainItem'),
        levelUp         : TextManager.getter('message', 'levelUp'),
        obtainSkill     : TextManager.getter('message', 'obtainSkill'),
        useItem         : TextManager.getter('message', 'useItem'),
        criticalToEnemy : TextManager.getter('message', 'criticalToEnemy'),
        criticalToActor : TextManager.getter('message', 'criticalToActor'),
        actorDamage     : TextManager.getter('message', 'actorDamage'),
        actorRecovery   : TextManager.getter('message', 'actorRecovery'),
        actorGain       : TextManager.getter('message', 'actorGain'),
        actorLoss       : TextManager.getter('message', 'actorLoss'),
        actorDrain      : TextManager.getter('message', 'actorDrain'),
        actorNoDamage   : TextManager.getter('message', 'actorNoDamage'),
        actorNoHit      : TextManager.getter('message', 'actorNoHit'),
        enemyDamage     : TextManager.getter('message', 'enemyDamage'),
        enemyRecovery   : TextManager.getter('message', 'enemyRecovery'),
        enemyGain       : TextManager.getter('message', 'enemyGain'),
        enemyLoss       : TextManager.getter('message', 'enemyLoss'),
        enemyDrain      : TextManager.getter('message', 'enemyDrain'),
        enemyNoDamage   : TextManager.getter('message', 'enemyNoDamage'),
        enemyNoHit      : TextManager.getter('message', 'enemyNoHit'),
        evasion         : TextManager.getter('message', 'evasion'),
        magicEvasion    : TextManager.getter('message', 'magicEvasion'),
        magicReflection : TextManager.getter('message', 'magicReflection'),
        counterAttack   : TextManager.getter('message', 'counterAttack'),
        substitute      : TextManager.getter('message', 'substitute'),
        buffAdd         : TextManager.getter('message', 'buffAdd'),
        debuffAdd       : TextManager.getter('message', 'debuffAdd'),
        buffRemove      : TextManager.getter('message', 'buffRemove'),
        actionFailure   : TextManager.getter('message', 'actionFailure'),
    });
    for (var i in PORParameters.extendedTextManager.customParams) {
        Object.defineProperty (TextManager, i, TextManager.getter ("custom", PORParameters.extendedTextManager.customParams[i]));
    }
}

TextManager.param = function(paramId) {
    if ($gameSystem.terms[paramId]) return $gameSystem.terms[paramId];
    return $dataSystem.terms.params[paramId] || '';
};

TextManager.custom = function (param) {
    return param;
}

 var POR_GS_i = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    POR_GS_i.call (this);
    this.terms = {};
};

var POR_GI_pC = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
POR_GI_pC.call(this, command, args);
if (command === 'changeterm') $gameSystem.redefineProperty (args[0], args[1]);
if (command === "deleteterm") $gameSystem.redefineProperty (args[0]);
}

var POR_SL_oLS = Scene_Load.prototype.onLoadSuccess;
Scene_Load.prototype.onLoadSuccess = function() {
    POR_SL_oLS.call (this);
    POR_defineProps ();
    $gameSystem.redefineProperties ();
};

Game_System.prototype.redefineProperty = function (property, value = null) {
    if (value) {
        Object.defineProperty (TextManager, property, {value: value, configurable: true});
        $gameSystem.terms[property] = value;
    }else {
        delete $gameSystem.terms[property];
        var type;
        var value;
        switch (property) {
            case "level":
                type = "basic";
                value = 0;
                break;
            case "levelA":
                type = "basic";
                value = 1;
                break;
            case "hp":
                type = "basic";
                value = 2;
                break;
            case "hpA":
                type = "basic";
                value = 3;
                break;
            case "mp":
                type = "basic";
                value = 4;
                break;
            case "mpA":
                type = "basic";
                value = 5;
                break;
            case "tp":
                type = "basic";
                value = 6;
                break;
            case "tpA":
                type = "basic";
                value = 7;
                break;
            case "exp":
                type = "basic";
                value = 8;
                break;
            case "expA":
                type = "basic";
                value = 9;
                break;
            case "fight":
                type = "command";
                value = 0;
                break;
                case "escape":
                type = "command";
                value = 1;
                break;
                case "attack":
                type = "command";
                value = 2;
                break;
                case "guard":
                type = "command";
                value = 3;
                break;
                case "item":
                type = "command";
                value = 4;
                break;
                case "skill":
                type = "command";
                value = 5;
                break;
                case "equip":
                type = "command";
                value = 6;
                break;
                case "status":
                type = "command";
                value = 7;
                break;
                case "formation":
                type = "command";
                value = 8;
                break;
                case "save":
                type = "command";
                value = 9;
                break;
                case "gameEnd":
                type = "command";
                value = 10;
                break;
                case "options":
                type = "command";
                value = 11;
                break;
                case "weapon":
                type = "command";
                value = 12;
                break;
                case "armor":
                type = "command";
                value = 13;
                break;
                case "keyItem":
                type = "command";
                value = 14;
                break;
                case "equip2":
                type = "command";
                value = 15;
                break;
                case "optimize":
                type = "command";
                value = 16;
                break;
                case "clear":
                type = "command";
                value = 17;
                break;
                case "newGame":
                type = "command";
                value = 18;
                break;
                case "continue_":
                type = "command";
                value = 19;
                break;
                case "toTitle":
                type = "command";
                value = 21;
                break;
                case "cancel":
                type = "command";
                value = 22;
                break;
                case "buy":
                type = "command";
                value = 23;
                break;
                case "sell":
                type = "command";
                value = 24;
                break;
                case "actionFailure":
                type = "command";
                value = "actionFailure";
                break;
                case "actorDamage":
                type = "command";
                value = "actorDamage";
                break;
                case "actorDrain":
                type = "command";
                value = "actorDrain";
                break;
                case "actorGain":
                type = "command";
                value = "actorGain";
                break;
                case "actorLoss":
                type = "command";
                value = "actorLoss";
                break;
                case "actorNoDamage":
                type = "command";
                value = "actorNoDamage";
                break;
                case "actorNoHit":
                type = "command";
                value = "actorNoHit";
                break;
                case "actorRecovery":
                type = "command";
                value = "actorRecovery";
                break;
                case "alwaysDash":
                type = "command";
                value = "alwaysDash";
                break;
                case "bgmVolume":
                type = "command";
                value = "bgmVolume";
                break;
                case "bgsVolume":
                type = "command";
                value = "bgsVolume";
                break;
                case "buffAdd":
                type = "command";
                value = "buffAdd";
                break;
                case "buffRemove":
                type = "command";
                value = "buffRemove";
                break;
                case "commandRemember":
                type = "command";
                value = "commandRemember";
                break;
                case "counterAttack":
                type = "command";
                value = "counterAttack";
                break;
                case "criticalToActor":
                type = "command";
                value = "criticalToActor";
                break;
                case "criticalToEnemy":
                type = "command";
                value = "criticalToEnemy";
                break;
                case "debuffAdd":
                type = "command";
                value = "debuffAdd";
                break;
                case "defeat":
                type = "command";
                value = "defeat";
                break;
                case "emerge":
                type = "command";
                value = "emerge";
                break;
                case "enemyDamage":
                type = "command";
                value = "enemyDamage";
                break;
                case "enemyDrain":
                type = "command";
                value = "enemyDrain";
                break;
                case "enemyGain":
                type = "command";
                value = "enemyGain";
                break;
                case "enemyLoss":
                type = "command";
                value = "enemyLoss";
                break;
                case "enemyNoDamage":
                type = "command";
                value = "enemyNoDamage";
                break;
                case "enemyNoHit":
                type = "command";
                value = "enemyNoHit";
                break;
                case "enemyRecovery":
                type = "command";
                value = "enemyRecovery";
                break;
                case "escapeFailure":
                type = "command";
                value = "escapeFailure";
                break;
                case "escapeStart":
                type = "command";
                value = "escapeStart";
                break;
                case "evasion":
                type = "command";
                value = "evasion";
                break;
                case "expNext":
                type = "command";
                value = "expNext";
                break;
                case "expTotal":
                type = "command";
                value = "expTotal";
                break;
                case "file":
                type = "command";
                value = "file";
                break;
                case "levelUp":
                type = "command";
                value = "levelUp";
                break;
                case "loadMessage":
                type = "command";
                value = "loadMessage";
                break;
                case "magicEvasion":
                type = "command";
                value = "magicEvasion";
                break;
                case "magicReflection":
                type = "command";
                value = "magicReflection";
                break;
                case "meVolume":
                type = "command";
                value = "meVolume";
                break;
                case "obtainExp":
                type = "command";
                value = "obtainExp";
                break;
                case "obtainGold":
                type = "command";
                value = "obtainGold";
                break;
                case "obtainItem":
                type = "command";
                value = "obtainItem";
                break;
                case "obtainSkill":
                type = "command";
                value = "obtainSkill";
                break;
                case "partyName":
                type = "command";
                value = "partyName";
                break;
                case "possession":
                type = "command";
                value = "possession";
                break;
                case "preemptive":
                type = "command";
                value = "preemptive";
                break;
                case "saveMessage":
                type = "command";
                value = "saveMessage";
                break;
                case "seVolume":
                type = "command";
                value = "seVolume";
                break;
                case "substitute":
                type = "command";
                value = "substitute";
                break;
                case "surprise":
                type = "command";
                value = "surprise";
                break;
                case "useItem":
                type = "command";
                value = "useItem";
                break;
                case "victory":
                type = "command";
                value = "victory";
                break;
        }
        if (PORParameters.extendedTextManager.customParams[property]) {
            type = "custom";
            value = PORParameters.extendedTextManager.customParams[property];
        }
        if (type) Object.defineProperty (TextManager, property, TextManager.getter (type, value));
        else delete TextManager[property];
    }
}

Game_System.prototype.redefineProperties = function () {
    for (var i in this.terms) {
        Object.defineProperty (TextManager, i, {
            value: this.terms[i],
            configurable: true
        })
    }
}

POR_ST_cNG = Scene_Title.prototype.commandNewGame;
Scene_Title.prototype.commandNewGame = function() {
    POR_ST_cNG.call (this);
    POR_defineProps();
};
