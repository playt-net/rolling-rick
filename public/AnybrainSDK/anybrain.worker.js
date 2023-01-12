"use strict";
importScripts('anybrainSDK.js');
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
const SetCredentials = Module.cwrap('AnybrainSetCredentials', 'number', ['string', 'string']);
const SetUserId = Module.cwrap('AnybrainSetUserId', 'number', ['string']);
const SetScreenInfo = Module.cwrap('AnybrainSetScreenInfo', null, ['number', 'number']);
const SetKeyboardCallback = Module.cwrap('AnybrainSetKeyboardCallback', null, ['number', 'string']);
const SetMouseCallback = Module.cwrap('AnybrainSetMouseCallback', null, ['number', 'number', 'number', 'number', 'number']);
const StartSDK = Module.cwrap('AnybrainStartSDK', 'number', null);
const StopSDK = Module.cwrap('AnybrainStopSDK');
const PauseSDK = Module.cwrap('AnybrainPauseSDK');
const ResumeSDK = Module.cwrap('AnybrainResumeSDK');
const StartMatch = Module.cwrap('AnybrainStartMatch', 'number', ['string']);
const StopMatch = Module.cwrap('AnybrainStopMatch');
const ReportError = Module.cwrap('AnybrainReportError', 'number', ['string', 'string']);
const GetErrorDescription = Module.cwrap('AnybrainGetErrorDescription', 'string', ['number']);
onmessage = e => {
    const [type] = e.data;
    if (type === WorkerMessage.InitModule) {
        Module.onRuntimeInitialized = () => {
            postMessage([WorkerMessage.Success]);
        };
    }
    if (type === WorkerMessage.UserId) {
        const [_, userId] = e.data;
        SetUserId(userId);
    }
    if (type === WorkerMessage.Credentials) {
        const [_, gk, gs] = e.data;
        SetCredentials(gk, gs);
    }
    if (type === WorkerMessage.StartSDK) {
        const [_, screenX, screenY] = e.data;
        SetScreenInfo(screenX, screenY);
        const res = StartSDK();
        postMessage([WorkerMessage.Error, res, GetErrorDescription(res)]);
    }
    if (type === WorkerMessage.StopSDK) {
        StopSDK();
    }
    if (type === WorkerMessage.PauseSDK) {
        PauseSDK();
    }
    if (type === WorkerMessage.ResumeSDK) {
        ResumeSDK();
    }
    if (type === WorkerMessage.StartMatch) {
        const [_, matchId] = e.data;
        const res = StartMatch(matchId);
        postMessage([WorkerMessage.Error, res, GetErrorDescription(res)]);
    }
    if (type === WorkerMessage.StopMatch) {
        StopMatch();
    }
    if (type === WorkerMessage.ReportError) {
        const [_, severity, message] = e.data;
        ReportError(severity, message);
    }
    if (type === WorkerMessage.KeyboardCallback) {
        const [_, keyboard_type, keycode] = e.data;
        SetKeyboardCallback(keyboard_type, keycode);
    }
    ;
    if (type === WorkerMessage.MouseCallback) {
        const [_, mouse_type, button, x, y, delta] = e.data;
        SetMouseCallback(mouse_type, button, x, y, delta);
    }
    ;
};
