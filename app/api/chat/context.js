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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContext = void 0;
var ollama_1 = require("ollama");
var better_sqlite3_1 = require("better-sqlite3");
var db = new better_sqlite3_1.default('embedblob.db');
var sessionId = 'testUser';
// Register cosine_similarity for SQLite
db.function('cosine_similarity', function (vec1, vec2) {
    // Convert inputs to Float32Array consistently
    var v1 = vec1 instanceof Buffer
        ? new Float32Array(vec1.buffer, vec1.byteOffset, vec1.length / 4)
        : new Float32Array(vec1); // Ensure a new Float32Array copy to avoid type issues
    var v2 = vec2 instanceof Buffer
        ? new Float32Array(vec2.buffer, vec2.byteOffset, vec2.length / 4)
        : new Float32Array(vec2);
    if (v1.length !== v2.length)
        throw new Error("Vectors must be of the same length.");
    var dot = 0, norm1Sq = 0, norm2Sq = 0;
    for (var i = 0; i < v1.length; i++) {
        var a = v1[i];
        var b = v2[i];
        dot += a * b;
        norm1Sq += a * a;
        norm2Sq += b * b;
    }
    var normProduct = Math.sqrt(norm1Sq) * Math.sqrt(norm2Sq);
    return normProduct === 0 ? 0 : dot / normProduct;
});
/**
 * Generates embeddings for a user query
 * @param query - The user's input
 * @returns A promise resolving to a Float32Array of embeddings
 */
function EmbedUserQuery(query) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ollama_1.default.embed({
                        model: "mxbai-embed-large",
                        truncate: true,
                        input: query,
                    })];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, new Float32Array(res.embeddings.flat())];
            }
        });
    });
}
/**
 * Retrieves similar content from the database based on an embedding
 * @param f - An embedding of the user input
 * @returns The most similar content from the database
 */
var getSimilarContentFromDb = function (f) {
    var embeddingBuffer = Buffer.from(f.buffer);
    var rows = db.prepare("SELECT *, cosine_similarity(embeddings, ?) AS similarity FROM embeddings WHERE sessid = ? ORDER BY similarity DESC LIMIT 3").all(embeddingBuffer, sessionId);
    return rows[0].content;
};
/**
 * Gets contextually similar content for a given query
 * @param query - The user's input
 * @returns A promise resolving to similar content from the database
 */
var getContext = function (query) { return __awaiter(void 0, void 0, void 0, function () {
    var embedding, similarContent;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, EmbedUserQuery(query)];
            case 1:
                embedding = _a.sent();
                similarContent = getSimilarContentFromDb(embedding);
                return [2 /*return*/, similarContent];
        }
    });
}); };
exports.getContext = getContext;
// Run the function and handle the Promise
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, exports.getContext)("I need some kamande")];
            case 1:
                result = _a.sent();
                console.log(result);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error("Error:", error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); })();
