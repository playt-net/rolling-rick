"use strict";
if (!window.Worker) {
    console.error("Your browser doesn't support web workers.");
}
var WorkerMessage;
(function (WorkerMessage) {
    WorkerMessage[WorkerMessage["InitModule"] = 0] = "InitModule";
    WorkerMessage[WorkerMessage["Success"] = 1] = "Success";
    WorkerMessage[WorkerMessage["Error"] = 2] = "Error";
    WorkerMessage[WorkerMessage["UserId"] = 3] = "UserId";
    WorkerMessage[WorkerMessage["Credentials"] = 4] = "Credentials";
    WorkerMessage[WorkerMessage["StartSDK"] = 5] = "StartSDK";
    WorkerMessage[WorkerMessage["StopSDK"] = 6] = "StopSDK";
    WorkerMessage[WorkerMessage["PauseSDK"] = 7] = "PauseSDK";
    WorkerMessage[WorkerMessage["ResumeSDK"] = 8] = "ResumeSDK";
    WorkerMessage[WorkerMessage["StartMatch"] = 9] = "StartMatch";
    WorkerMessage[WorkerMessage["StopMatch"] = 10] = "StopMatch";
    WorkerMessage[WorkerMessage["ReportError"] = 11] = "ReportError";
    WorkerMessage[WorkerMessage["GetErrorDescription"] = 12] = "GetErrorDescription";
    WorkerMessage[WorkerMessage["KeyboardCallback"] = 13] = "KeyboardCallback";
    WorkerMessage[WorkerMessage["MouseCallback"] = 14] = "MouseCallback";
})(WorkerMessage || (WorkerMessage = {}));
var Keyboard;
(function (Keyboard) {
    Keyboard[Keyboard["DOWN"] = 0] = "DOWN";
    Keyboard[Keyboard["UP"] = 1] = "UP";
})(Keyboard || (Keyboard = {}));
var Mouse;
(function (Mouse) {
    Mouse[Mouse["DOWN"] = 0] = "DOWN";
    Mouse[Mouse["UP"] = 1] = "UP";
    Mouse[Mouse["MOVED"] = 2] = "MOVED";
    Mouse[Mouse["WHEEL"] = 3] = "WHEEL";
})(Mouse || (Mouse = {}));
;
const anyWorker = new Worker('AnybrainSDK/anybrain.worker.js');
anyWorker.postMessage([WorkerMessage.InitModule]);
anyWorker.addEventListener("message", event => {
    if (event.data[0] === WorkerMessage.Success) {
        document.dispatchEvent(new CustomEvent('anybrain', {
            bubbles: true,
            detail: {
                loadModuleSuccess: () => true,
                code: -1,
                message: ""
            }
        }));
    }
    if (event.data[0] === WorkerMessage.Error) {
        const [_, err, message] = event.data;
        document.dispatchEvent(new CustomEvent('anybrain', {
            bubbles: true,
            detail: {
                loadModuleSuccess: () => { },
                code: err,
                message: message
            }
        }));
    }
});
// Browser keyboard / mouse events listeners
window.addEventListener("keydown", (event) => {
    anyWorker.postMessage([WorkerMessage.KeyboardCallback, Keyboard.DOWN, event.code]);
});
window.addEventListener("keyup", (event) => {
    anyWorker.postMessage([WorkerMessage.KeyboardCallback, Keyboard.UP, event.code]);
});
window.addEventListener("mousedown", (event) => {
    anyWorker.postMessage([WorkerMessage.MouseCallback, Mouse.DOWN, event.button, event.screenX, event.screenY, 0]);
});
window.addEventListener("mouseup", (event) => {
    anyWorker.postMessage([WorkerMessage.MouseCallback, Mouse.UP, event.button, event.screenX, event.screenY, 0]);
});
window.addEventListener("mousemove", (event) => {
    anyWorker.postMessage([WorkerMessage.MouseCallback, Mouse.MOVED, -1, event.screenX, event.screenY, 0]);
});
window.addEventListener("wheel", (event) => {
    anyWorker.postMessage([WorkerMessage.MouseCallback, Mouse.WHEEL, -1, event.screenX, event.screenY, event.deltaY]);
});
// SDK Methods
function AnybrainSetCredentials(gk, gs) {
    anyWorker.postMessage([WorkerMessage.Credentials, gk, gs]);
}
function AnybrainSetUserId(userId) {
    anyWorker.postMessage([WorkerMessage.UserId, userId]);
}
function AnybrainStartSDK() {
    anyWorker.postMessage([WorkerMessage.StartSDK, window.screen.availWidth, window.screen.availHeight]);
}
function AnybrainStopSDK() {
    anyWorker.postMessage([WorkerMessage.StopSDK]);
}
function AnybrainPauseSDK() {
    anyWorker.postMessage([WorkerMessage.PauseSDK]);
}
function AnybrainResumeSDK() {
    anyWorker.postMessage([WorkerMessage.ResumeSDK]);
}
function AnybrainStartMatch(matchId) {
    anyWorker.postMessage([WorkerMessage.StartMatch, matchId]);
}
function AnybrainStopMatch() {
    anyWorker.postMessage([WorkerMessage.StopMatch]);
}
function AnybrainReportError(severity, message) {
    anyWorker.postMessage([WorkerMessage.ReportError]);
}
function AnybrainGetErrorDescription(number) {
    anyWorker.postMessage([WorkerMessage.GetErrorDescription]);
}
