"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.handle_NewMessage = handle_NewMessage;
require("dotenv/config");
var openai_1 = require("openai");
var context_ts_1 = require("./context.ts"); // Assuming getContext is defined in context.ts
var systemPrompt_ts_1 = require("./systemPrompt.ts"); // Assuming getContext is defined in context.ts
console.log('DEEPSEEK_API_KEY:', ((_a = process.env.DEEPSEEK_API_KEY) === null || _a === void 0 ? void 0 : _a.substring(0, 7)) + '...'); // Log only the first 7 characters for security
var DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
var openai = new openai_1.OpenAI({
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: DEEPSEEK_API_KEY
});
var communicationhistoryList = [{ contact: "contact", role: "role", content: "content" }];
function getResponseFromDeepSeek(userQuery) {
    return __awaiter(this, void 0, void 0, function () {
        var completion, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, openai.chat.completions.create({
                            messages: [
                                { role: "system", content: systemPrompt_ts_1.systemPrompt },
                                { role: "user", content: userQuery }
                            ],
                            model: "deepseek-chat",
                        })];
                case 1:
                    completion = _a.sent();
                    return [2 /*return*/, completion.choices[0].message.content];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error calling DeepSeek API:', error_1);
                    return [2 /*return*/, 'Sorry, something went wrong. We are experiencing very high traffic. Please try again later.'];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function handle_NewMessage(msg) {
    return __awaiter(this, void 0, void 0, function () {
        var userNumber, userMessagesContext, commsHistoryString, userInput, context, query, response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userNumber = msg.from;
                    userMessagesContext = communicationhistoryList.filter(function (item) { return item.contact === userNumber; });
                    commsHistoryString = JSON.stringify(userMessagesContext);
                    userInput = msg.body.trim();
                    return [4 /*yield*/, (0, context_ts_1.getContext)(userInput)];
                case 1:
                    context = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 6]);
                    communicationhistoryList.push({ contact: userNumber, role: "user", content: userInput });
                    query = "chatHistory: ".concat(commsHistoryString, " question: ").concat(userInput, " context: ").concat(context);
                    return [4 /*yield*/, getResponseFromDeepSeek(query)];
                case 3:
                    response = _a.sent();
                    console.log('Response from DeepSeek:', response);
                    communicationhistoryList.push({ contact: userNumber, role: "system", content: response });
                    return [3 /*break*/, 6];
                case 4:
                    error_2 = _a.sent();
                    console.error('Error handling message:', error_2);
                    return [4 /*yield*/, msg.reply('Sorry, an error occurred. Please try again.')];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
handle_NewMessage({
    from: '1234567890',
    body: 'Hello, I need help with my kamande.',
    reply: function (response) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, console.log('Reply:', response)];
    }); }); }
}).then(function () {
    console.log('Message processed successfully.');
}).catch(function (error) {
    console.error('Error processing message:', error);
});
