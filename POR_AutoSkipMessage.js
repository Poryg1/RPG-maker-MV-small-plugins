/*:
 * @plugindesc Automatically skips messages after certain time.
 * @author Poryg
 *
 * @param charTime
 * @text Time per character (ms)
 * @desc Time each character adds before the message is closed. 
 * @default 100
 *
 * @param spaceTime
 * @text Time per space (ms)
 * @desc Time each space adds before the message is closed. 
 * @default 50
 * 
 * @param minTime
 * @text Minimal time (ms)
 * @desc Minimal time that has to be spent (for too short messages)
 * @default 500
 * 
 * @param fcTime
 * @text Force close time (ms)
 * @desc Time that has to pass for the message to be forcibly closed.
 * Useful when you have spaceTime and charTime set to 0.
 * @default 20000
 * 
 * @param active
 * @text Active
 * @type boolean
 * @desc Sets whether the plugin is active or inactive at the start.
 * @default true
 *
 * @help 
 * Plugin that implements an autoskip function for messages by
 * passing certain time defined by each character and space.
 * You can still close messages by pressing the action key etc.,
 * but if you don't want to, are recording or just want to implement
 * a time after which a message window forcibly closes, this plugin
 * might be useful for you.
 * A couple of implementation rules:
 * Force close time is relevant only when char close time is
 * 0. So if you turn off char close time for current message,
 * you're still backed up by force close time.
 * Space close time is relevant only when char close time is
 * not 0.
 * 
 * 
 * Plugin commands:
 * por_chartime x
 * por_spacetime x
 * por_mintime x
 * sets the appropriate times in miliseconds.
 * por_asmset x
 * activates or deactivates the autoskipmessage plugin.
 * x is number. For all of them.
 * For por_asmset 0 means false and 1 means true
 * 
 * Escape codes:
 * \chrt[x] - time per char in miliseconds (current message only)
 * \spct[x] - time per space in miliseconds (current message only)
 * \frct[x] - force close time in miliseconds (current message only)
 * Note that you can't set min time for the current message,
 * because I honestly doubt you will need it.
 * You can, however, set force close time to lower than min time.
 * This is the only case it will tolerate.
 * IMPORTANT!!!!!!!
 * \chrt escape tag needs to be right AT THE BEGINNING of the text!
 * This is an optimization feature, because Yanfly plugins contain
 * so many escape tags and it would be useless to crawl through them
 * if there is no need to find out how many characters are there in
 * your message.
 * \frct will override all settings! As such it should be AT THE
 * BEGINNING of the text as well!
 * 
 * Note:
 * The plugin has been made to be as compatible with Yanfly's message
 * plugins as possible. However, their ExtMessagePack2 contains a lot of
 * lunatic stuff, so I cannot guarantee 100 percent compatibility.
 * Credits to Yanfly for code from their plugins applied for the patching.
 */

var Imported = Imported || {};
Imported.POR_AutoSkipMessage = true;

var PORParameters = PORParameters || {};
PORParameters.autoSkipMessage = {};
var PORParams = PluginManager.parameters("POR_AutoSkipMessage");
PORParameters.autoSkipMessage.charTime = Number(PORParams.charTime);
PORParameters.autoSkipMessage.spaceTime = Number(PORParams.spaceTime);
PORParameters.autoSkipMessage.minTime = Number(PORParams.minTime);
PORParameters.autoSkipMessage.fcTime = Number(PORParams.fcTime);
PORParameters.autoSkipMessage.active = PORParams.active == "true" ? true : false;

POR_asm_gi_pc = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    POR_asm_gi_pc.call(this, command, args);
    if (command === 'por_chartime') PORParameters.autoSkipMessage.charTime = Number(args[0]);
    if (command === 'por_spacetime') PORParameters.autoSkipMessage.spaceTime = Number(args[0]);
    if (command === 'por_mintime') PORParameters.autoSkipMessage.minTime = Number(args[0]);
    if (command === 'por_fctime') PORParameters.autoSkipMessage.fcTime = Number(args[0]);
    if (command === 'por_asmset') PORParameters.autoSkipMessage.active = Boolean(Number(args[0]));
}



POR_asm_wm_i = Window_Message.prototype.initialize;
Window_Message.prototype.initialize = function() {
    POR_asm_wm_i.call (this);
    this._currentTimestamp = null;
    this._charTime = null;
    this._spaceTime = null;
    this._closeTime = 0;
    this._textLength = 0;
    this._spaces = 0;
};

POR_asm_wm_sm = Window_Message.prototype.startMessage;
Window_Message.prototype.startMessage = function() {
    if (PORParameters.autoSkipMessage.active && !this.containsFrct()) {
        if (PORParameters.autoSkipMessage.charTime) {
            for (var i in $gameMessage._texts) {
                var data = this.processDataEscapeCharacters($gameMessage._texts[i]);
                this._textLength += data[0];
                this._spaces += data[1];
            }
            this.calculateCloseTime();
        }else if (this.containsChrt()) {
            for (var i in $gameMessage._texts) {
                var data = this.processDataEscapeCharacters($gameMessage._texts[i]);
                this._textLength += data[0];
                this._spaces += data[1];
            }
        }else {
            this._closeTime = Math.max(PORParameters.autoSkipMessage.fcTime, PORParameters.autoSkipMessage.minTime);
            this._currentTimestamp = Date.now();
        }
    }
    POR_asm_wm_sm.call(this);
};

Window_Message.prototype.containsChrt = function () {
    return /\\CHRT\[/i.test($gameMessage._texts[0].substring(0, 6));
}

Window_Message.prototype.containsFrct = function () {
    return /\\Frct\[/i.test($gameMessage._texts[0].substring(0, 6));
}

POR_asm_wm_tm = Window_Message.prototype.terminateMessage;
Window_Message.prototype.terminateMessage = function() {
    POR_asm_wm_tm.call(this);
    this._currentTimestamp = null;
    this._charTime = null;
    this._spaceTime = null;
    this._closeTime = 0;
    this._textLength = 0;
    this._spaces = 0;
};

Window_Message.prototype.calculateCloseTime = function () {
    this._closeTime += (this._charTime || PORParameters.autoSkipMessage.charTime) * this._textLength;
    this._closeTime += (this._spaceTime || PORParameters.autoSkipMessage.spaceTime) * this._spaces;
    if (this._closeTime < PORParameters.autoSkipMessage.minTime) this._closeTime = PORParameters.autoSkipMessage._closeTime;
    this._currentTimestamp = Date.now();
}

POR_asm_wm_u = Window_Message.prototype.update;
Window_Message.prototype.update = function () {
    if (this._currentTimestamp && Date.now() - this._currentTimestamp >= this._closeTime) {
        this.pause = false;
        this.terminateMessage();
    }
    POR_asm_wm_u.call(this);
}

POR_asm_wb_pec = Window_Base.prototype.processEscapeCharacter;
Window_Base.prototype.processEscapeCharacter = function(code, textState) {
    switch (code) {
    case 'CHRT':
        if (!PORParameters.autoSkipMessage.active) break;
        this._charTime = this.obtainEscapeParam(textState);
        this.calculateCloseTime();
        break;
    case 'SPCT':
        if (!PORParameters.autoSkipMessage.active) break;
        this._spaceTime = this.obtainEscapeParam(textState);
        this.calculateCloseTime();
        break;
    case 'FRCT':
        if (!PORParameters.autoSkipMessage.active) break;
        this._closeTime = this.obtainEscapeParam(textState); 
        break;
    default:
        POR_asm_wb_pec.call(this, code, textState);
        break;
    }
};

Window_Base.prototype.processDataEscapeCharacters = function(basetext) {
    //processes escape characters containing any data and strips the rest.
    if (Imported.YEP_X_MessageMacros1) text = this.convertMacroText(text);
    var text = basetext.replace(/\\/g, '\x1b');
    text = text.replace(/\x1bCHRT\[(\d+)\]/gi, '');
    text = text.replace(/\x1bSPCT\[(\d+)\]/gi, '');
    text = text.replace(/\x1b\x1b/g, '');
    text = text.replace(/\x1b{/g, '');
    text = text.replace(/\x1b}/g, '');
    text = text.replace(/\x1b$/g, '');
    text = text.replace(/\x1b\./g, '');
    text = text.replace(/\x1b\|/g, '');
    text = text.replace(/\x1b!/g, '');
    text = text.replace(/\x1b</g, '');
    text = text.replace(/\x1b>/g, '');
    text = text.replace(/\x1b^/g, '');
    text = text.replace(/\x1bC\[(\d+)\]/gi, '');
    text = text.replace(/\x1bI\[(\d+)\]/gi, '');

    text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
        return $gameVariables.value(parseInt(arguments[1]));
    }.bind(this));
    text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
        return $gameVariables.value(parseInt(arguments[1]));
    }.bind(this));
    text = text.replace(/\x1bN\[(\d+)\]/gi, function() {
        return this.actorName(parseInt(arguments[1]));
    }.bind(this));
    text = text.replace(/\x1bP\[(\d+)\]/gi, function() {
        return this.partyMemberName(parseInt(arguments[1]));
    }.bind(this));
    text = text.replace(/\x1bG/gi, TextManager.currencyUnit);
    if (Imported.YEP_MessageCore) text = this.processYanflyDataEscapeCharacters(text);
    if (Imported.YEP_X_ExtMesPack1) text = this.processYanflyExtMessagePack1DataEC(text);
    if (Imported.YEP_X_ExtMesPack2) text = this.processYanflyExtMessagePack2DataEC(text);
    var spaces = 0;
    for (var i in text) if (text[i] == " ") spaces++;
    return [text.length - spaces, spaces];
};

Window_Base.prototype.processYanflyDataEscapeCharacters = function (text) {
    text = text.replace (/<(?:WordWrap)>/i, '');
    text = text.replace (/<br>/gi, '');
    text = text.replace (/<line break>/gi, '');
    text = text.replace(/\x1bFR/gi, '');
    text = text.replace(/\x1bFB/gi, '');
    text = text.replace(/\x1bFI/gi, '');
    text = text.replace(/\x1bAC\[(\d+)\]/gi, function() {
        return this.actorClassName(parseInt(arguments[1]));
    }.bind(this));
    text = text.replace(/\x1bAN\[(\d+)\]/gi, function() {
        return this.actorNickname(parseInt(arguments[1]));
    }.bind(this));
    text = text.replace(/\x1bPC\[(\d+)\]/gi, function() {
        return this.partyClassName(parseInt(arguments[1]));
    }.bind(this));
    text = text.replace(/\x1bPN\[(\d+)\]/gi, function() {
        return this.partyNickname(parseInt(arguments[1]));
    }.bind(this));
    text = text.replace(/\x1bNC\[(\d+)\]/gi, function() {
        return $dataClasses[parseInt(arguments[1])].name;
    }.bind(this));
    text = text.replace(/\x1bNI\[(\d+)\]/gi, function() {
        return $dataItems[parseInt(arguments[1])].name;
    }.bind(this));
    text = text.replace(/\x1bNW\[(\d+)\]/gi, function() {
        return $dataWeapons[parseInt(arguments[1])].name;
    }.bind(this));
    text = text.replace(/\x1bNA\[(\d+)\]/gi, function() {
        return $dataArmors[parseInt(arguments[1])].name;
    }.bind(this));
    text = text.replace(/\x1bNE\[(\d+)\]/gi, function() {
        return $dataEnemies[parseInt(arguments[1])].name;
    }.bind(this));
    text = text.replace(/\x1bNS\[(\d+)\]/gi, function() {
        return $dataSkills[parseInt(arguments[1])].name;
    }.bind(this));
    text = text.replace(/\x1bNT\[(\d+)\]/gi, function() {
        return $dataStates[parseInt(arguments[1])].name;
    }.bind(this));
    text = text.replace(/\x1bII\[(\d+)\]/gi, '');
    text = text.replace(/\x1bIW\[(\d+)\]/gi, '');
    text = text.replace(/\x1bIA\[(\d+)\]/gi, '');
    text = text.replace(/\x1bIS\[(\d+)\]/gi, '');
    text = text.replace(/\x1bIT\[(\d+)\]/gi, '');
    text = text.replace(/\x1bFS\[(\d+)\]/gi, '');
    text = text.replace(/\x1bFN\<(.*?)\>/gi, '');
    text = text.replace(/\x1bOC\[(\d+)\]/gi, '');
    text = text.replace(/\x1bOW\[(\d+)\]/gi, '');
    text = text.replace(/\x1bPX\[(\d+)\]/gi, '');
    text = text.replace(/\x1bPY\[(\d+)\]/gi, '');
    text = text.replace(/\x1bN\<(.*?)\>/gi, '');
    text = text.replace(/\x1bN1\<(.*?)\>/gi, '');
    text = text.replace(/\x1bN2\<(.*?)\>/gi, '');
    text = text.replace(/\x1bN3\<(.*?)\>/gi, '');
    text = text.replace(/\x1bNC\<(.*?)\>/gi, '');
    text = text.replace(/\x1bN4\<(.*?)\>/gi, '');
    text = text.replace(/\x1bN5\<(.*?)\>/gi, '');
    text = text.replace(/\x1bNR\<(.*?)\>/gi, '');
    text = text.replace(/\x1bAF\[(\d+)\]/gi, '');
    text = text.replace(/\x1bPF\[(\d+)\]/gi, '');
    text = text.replace(/\x1bW\[(\d+)\]/gi, '');
    return text;
}

Window_Base.prototype.processYanflyExtMessagePack1DataEC = function (text) {
    text = text.replace(/\x1bND\<(.*?)\>/gi, '');
    text = text.replace(/\x1bND1\<(.*?)\>/gi, '');
    text = text.replace(/\x1bND2\<(.*?)\>/gi, '');
    text = text.replace(/\x1bND3\<(.*?)\>/gi, '');
    text = text.replace(/\x1bNDC\<(.*?)\>/gi, '');
    text = text.replace(/\x1bND4\<(.*?)\>/gi, '');
    text = text.replace(/\x1bND5\<(.*?)\>/gi, '');
    text = text.replace(/\x1bNDR\<(.*?)\>/gi, '');
    text = text.replace(/\x1bNT\<(.*?)\>/gi, '');
    text = text.replace(/\x1bNT1\<(.*?)\>/gi, '');
    text = text.replace(/\x1bNT2\<(.*?)\>/gi, '');
    text = text.replace(/\x1bNT3\<(.*?)\>/gi, '');
    text = text.replace(/\x1bNTC\<(.*?)\>/gi, '');
    text = text.replace(/\x1bNT4\<(.*?)\>/gi, '');
    text = text.replace(/\x1bNT5\<(.*?)\>/gi, '');
    text = text.replace(/\x1bNTR\<(.*?)\>/gi, '');
    text = text.replace(/\x1bLSON/gi, '');
    text = text.replace(/\x1bLSOFF/gi, '');
    text = text.replace(/\x1bLSR/gi, '');
    text = text.replace(/\x1bLSN\<(.*?)\>/gi, '');
    text = text.replace(/\x1bLSV\[(\d+)\]/gi, '');
    text = text.replace(/\x1bLSPIV\[(\d+)\]/gi, '');
    text = text.replace(/\x1bLSPI\[(\d+)\]/gi, '');
    text = text.replace(/\x1bLSPAV\[(\d+)\]/gi, '');
    text = text.replace(/\x1bLSPA\[(\d+)\]/gi, '');
    text = text.replace(/\x1bLSI\[(\d+)\]/gi, '');
    text = text.replace(/\x1bLSRESET/gi, '');
    text = text.replace(/\x1bMSGPOSX\[(.*?)\]/gi, '');
    text = text.replace(/\x1bMSGPOSY\[(.*?)\]/gi, '');
    text = text.replace(/\x1bMSGEVENT\[(\d+)\]/gi, '');
    text = text.replace(/\x1bMSGACTOR\[(\d+)\]/gi, '');
    text = text.replace(/\x1bMSGPARTY\[(\d+)\]/gi, '');
    text = text.replace(/\x1bMSGENEMY\[(\d+)\]/gi, '');
    text = text.replace(/\x1bAUTOEVENT\[(\d+)\]/gi, '');
    text = text.replace(/\x1bAUTOACTOR\[(\d+)\]/gi, '');
    text = text.replace(/\x1bAUTOPARTY\[(\d+)\]/gi, '');
    text = text.replace(/\x1bAUTOENEMY\[(\d+)\]/gi, '');
    text = text.replace(/\x1bMSGROWS\[(.*?)\]/gi, '');
    text = text.replace(/\x1bMSGWIDTH\[(.*?)\]/gi, '');
    text = text.replace(/\x1bAUTO/gi, '');
    text = text.replace(/\x1bMSGRESET/gi, '');
    text = text.replace(/\x1bFACEINDEX\[(\d+)\]/gi, '');
    text = text.replace(/\x1bDG\[(\d+)\]/gi, function() {
        return this.groupDigits(parseInt(arguments[1]));
      }.bind(this));
    text = text.replace(/\x1bHC\[(\d+)\]/gi, '');
    text = text.replace(/\x1bPLAYTIME/gi, '');
    text = text.replace(/\x1bMAP\[(\d+)\]/gi, '');
    return text;
}

Window_Base.prototype.processYanflyExtMessagePack2DataEC = function (text) {
    text = text.replace(/\x1bQI\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = 1;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcQI);
        return text;
    }.bind(this));
    text = text.replace(/\x1bQW\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = 1;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcQW);
        return text;
    }.bind(this));
    text = text.replace(/\x1bQA\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = 1;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcQA);
        return text;
    }.bind(this));
    text = text.replace(/\x1bCOMPARE\<(.*?):(.*?)\>/gi, '');
    text = text.replace(/\x1bCOMPARE1\<(.*?):(.*?)\>/gi, '');
    text = text.replace(/\x1bCOMPARE2\<(.*?):(.*?)\>/gi, '');
    text = text.replace(/\x1bCOMPARE3\<(.*?):(.*?)\>/gi, '');
    text = text.replace(/\x1bCOMPARE4\<(.*?):(.*?)\>/gi, '');
    text = text.replace(/\x1bCOMPARE5\<(.*?):(.*?)\>/gi, '');
    text = text.replace(/\x1bCOMPARE6\<(.*?):(.*?)\>/gi, '');
    text = text.replace(/\x1bCOMPARE7\<(.*?):(.*?)\>/gi, '');
    text = text.replace(/\x1bCOMPARE8\<(.*?):(.*?)\>/gi, '');
    text = text.replace(/\x1bCOMPARE9\<(.*?):(.*?)\>/gi, '');
    text = text.replace(/\x1bCASESWITCH\{(.*?)\?(.*?):(.*?)\}/gi, function() {
        var s = $gameSwitches.value(Number(arguments[1]));
        var x = arguments[2];
        var y = arguments[3];
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcCSwitch);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bCASEEVAL\{(.*?)\?(.*?):(.*?)\}/gi, function() {
        var e = eval(arguments[1]);
        var x = arguments[2];
        var y = arguments[3];
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcCaseEval);
        return text;
    }.bind(this));
    text = text.replace(/\x1bALVL\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcALvl);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bAMHP\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAMhp);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bAHP\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAHp);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bAHP%\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAHpp);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bAMMP\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAMmp);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bAMP\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAMp);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bAMP%\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAMpp);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bAMTP\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcATmp);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bATP\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcATp);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bATP%\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcATpp);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bAATK\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAatk);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bADEF\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAdef);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bAMAT\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAmat);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bAMDF\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAmdf);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bAAGI\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAagi);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bALUK\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAluk);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bAHIT\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAhit);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bAEVA\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAeva);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bACRI\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAcri);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bACEV\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAcev);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bAMEV\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAmev);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bAMRF\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAmrf);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bACNT\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAcnt);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bAHRG\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAhrg);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bAMRG\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAmrg);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bATRG\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAtrg);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bATGR\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAtgr);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bAGRD\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAgrd);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bAREC\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcArec);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bAPHA\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcApha);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bAMCR\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAmcr);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bATCR\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAtcr);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bAPDR\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcApdr);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bAMDR\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAmdr);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bAFDR\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAfdr);
        return text;
    }.bind(this));
     
    text = text.replace(/\x1bAEXR\[(\d+)\]/gi, function() {
        var x = arguments[1];
        if (x <= 0) x = $gameParty.members()[0].actorId;
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcAexr);
        return text;
    }.bind(this));

    if (!$gameParty.inBattle()) return text;
    text = text.replace(/\x1bELVL\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcELvl);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEMHP\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEMhp);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEHP\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEHp);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEHP%\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEHpp);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEMMP\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEMmp);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEMP\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEMp);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEMP%\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEMpp);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEMTP\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcETmp);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bETP\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcETp);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bETP%\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcETpp);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEATK\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEatk);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEDEF\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEdef);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEMAT\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEmat);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEMDF\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEmdf);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEAGI\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEagi);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bELUK\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEluk);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEEXP\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEexp);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEGOLD\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEgold);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEHIT\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEhit);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEEVA\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEeva);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bECRI\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEcri);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bECEV\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEcev);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEMEV\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEmev);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEMRF\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEmrf);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bECNT\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEcnt);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEHRG\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEhrg);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEMRG\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEmrg);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bETRG\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEtrg);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bETGR\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEtgr);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEGRD\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEgrd);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEREC\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcErec);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEPHA\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEpha);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEMCR\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEmcr);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bETCR\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEtcr);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEPDR\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEpdr);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEMDR\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEmdr);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEFDR\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEfdr);
        return text;
    }.bind(this));
    
    text = text.replace(/\x1bEEXR\[(\d+)\]/gi, function() {
        var x = arguments[1] - 1;
        x = x.clamp(0, $gameTroop.members().length - 1)
        var text = '';
        eval(Yanfly.Lunatic.Msg.TcEexr);
        return text;
    }.bind(this));
    
    return text;
}
