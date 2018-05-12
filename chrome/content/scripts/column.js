/* global RspamdSpamness:false */

"use strict";

const RspamdSpamnessColumn = {};

RspamdSpamnessColumn.handler = {
    getCellProperties:   function () {
        // Do nothing.
    },
    getCellText:         function (row) {
        if (Services.prefs.getIntPref("extensions.rspamd-spamness.display.column") === 2)
            return null;
        const score = RspamdSpamnessColumn.getScoreByRow(row);
        return (isNaN(score)) ? "" : score;
    },
    getImageSrc:         function (row) {
        if (Services.prefs.getIntPref("extensions.rspamd-spamness.display.column") === 1)
            return null;
        const score = RspamdSpamnessColumn.getScoreByRow(row);
        return RspamdSpamness.getImageSrc(score);
    },
    getRowProperties:    function () {
        // Do nothing.
    },
    getSortLongForRow:   function (hdr) {
        return RspamdSpamnessColumn.getScoreByHdr(hdr) * 1e4 + 1e8;
    },
    getSortStringForRow: function () {
        return null;
    },
    isString:            function () {
        return false;
    }
};

RspamdSpamnessColumn.getScoreByRow = function (row) {
    const key = gDBView.getKeyAt(row);
    const hdr = gDBView.db.GetMsgHdrForKey(key);
    return RspamdSpamnessColumn.getScoreByHdr(hdr);
};

RspamdSpamnessColumn.getScoreByHdr = function (hdr) {
    const re = /(?:^|: \S+ \[)([-\d.]+?) [(/]/;
    const headerStr = RspamdSpamness.getHeaderStr(hdr) || hdr.getStringProperty("x-spam-score");
    return (headerStr)
        ? parseFloat(re.exec(headerStr)[1])
        : Number.NaN;
};

RspamdSpamnessColumn.onLoad = function () {
    Services.obs.addObserver(RspamdSpamnessColumn.dbObserver, "MsgCreateDBView", false);
};

RspamdSpamnessColumn.dbObserver = {
    observe: function () {
        RspamdSpamnessColumn.addColumnHandler();
    }
};

RspamdSpamnessColumn.addColumnHandler = function () {
    gDBView.addColumnHandler("spamScoreCol", RspamdSpamnessColumn.handler);
};

RspamdSpamnessColumn.onUnload = function () {
    Services.obs.removeObserver(RspamdSpamnessColumn.dbObserver, "MsgCreateDBView", false);
    window.removeEventListener("load", RspamdSpamnessColumn.onLoad, false);
    window.removeEventListener("unload", RspamdSpamnessColumn.onUnload, false);
};

window.addEventListener("load", RspamdSpamnessColumn.onLoad, false);
window.addEventListener("unload", RspamdSpamnessColumn.onUnload, false);
