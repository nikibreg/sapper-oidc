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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
exports.SapperOIDCClient = void 0;
var openid_client_1 = require("openid-client");
var redis = require("async-redis");
var cookie_1 = require("cookie");
var uuid_1 = require("uuid");
var NODE_ENV = process.env.NODE_ENV;
var dev = NODE_ENV === "development";
var SapperOIDCClient = /** @class */ (function () {
    function SapperOIDCClient(options) {
        this.clientID = options.clientID;
        this.clientSecret = options.clientSecret;
        this.redirectURI = options.redirectURI;
        this.silentRedirectURI = options.silentRedirectURI
            ? options.silentRedirectURI
            : undefined;
        this.responseTypes = ["code"];
        this.issuerURL = options.issuerURL;
        this.sessionMaxAge = options.sessionMaxAge;
        this.authRequestMaxAge = options.authRequestMaxAge;
        this.redis = options.redisURL
            ? redis.createClient({ url: options.redisURL })
            : redis.createClient();
        this.authPath = options.authPath;
        this.protectedPaths = options.protectedPaths;
        this.callbackPath = options.callbackPath;
        this.silentCallbackPath = options.silentCallbackPath;
        this.authSuccessfulRedirectPath = options.authSuccessfulRedirectPath;
        this.refreshPath = options.refreshPath;
        this.silentPath = options.silentPath ? options.silentPath : undefined;
        this.scope = options.scope;
        this.debug = options.debug ? options.debug : false;
    }
    SapperOIDCClient.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var discoveredIssuer, redirect_uris;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, openid_client_1.Issuer.discover(this.issuerURL)];
                    case 1:
                        discoveredIssuer = _a.sent();
                        redirect_uris = [this.redirectURI];
                        if (this.silentRedirectURI)
                            redirect_uris.push(this.silentRedirectURI);
                        this.client = new discoveredIssuer.Client({
                            client_id: this.clientID,
                            client_secret: this.clientSecret,
                            redirect_uris: redirect_uris,
                            response_types: this.responseTypes,
                        });
                        this.ok = true;
                        this.redis.on("error", function (err) {
                            console.log("Error " + err);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    SapperOIDCClient.prototype.middleware = function () {
        var _this = this;
        if (!this.ok)
            throw new Error("Middfleware used before initialization");
        return function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var path, userHasValidSession, token, SID, result, toBrowser, toStore, claimed, toBrowser, error_1, state, stateID, error_2, redirectURL, params, stateID, state, tokenSet, claimed, resultToStore, toBrowser, SID_1, error_3, error_4, error_5, error_6, error_7, error_8, error_9, state, stateID, redirectURL, buffRedirectTo, base64RedirectTo, where_at, buffWhere_at, base64Where_at;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = req.originalUrl.replace(/\?.*$/, "");
                        if (!(!path.includes(".") && path !== "__sapper__")) return [3 /*break*/, 47];
                        // Polka doesn't have res.redirect
                        res.redirect = function (location) {
                            var str = "Redirecting to " + location;
                            res.writeHead(302, {
                                Location: location,
                                "Content-Type": "text/plain",
                                "Content-Length": str.length,
                            });
                            res.end(str);
                        };
                        userHasValidSession = false;
                        return [4 /*yield*/, getTokenSetFromCookie(req, this.redis)];
                    case 1:
                        token = _a.sent();
                        SID = getSIDFromCookie(req);
                        if (!(token !== undefined &&
                            token !== null &&
                            SID !== undefined &&
                            SID !== null)) return [3 /*break*/, 10];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 9, , 10]);
                        if (!(token.expires_at &&
                            token.expires_at * 1000 - Date.now() <= 600000)) return [3 /*break*/, 7];
                        return [4 /*yield*/, getRefreshedTokenSetAndClaims(token, this.client)];
                    case 3:
                        result = _a.sent();
                        if (!result) return [3 /*break*/, 5];
                        toBrowser = result.toBrowser, toStore = result.toStore;
                        return [4 /*yield*/, updateToStore(SID, toStore, this.redis)];
                    case 4:
                        _a.sent();
                        if (path === this.refreshPath) {
                            res.end(JSON.stringify(toBrowser));
                        }
                        else if (path === this.callbackPath) {
                            res.redirect(this.authSuccessfulRedirectPath);
                        }
                        else {
                            req.user = toBrowser;
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        this.redis.del(SID);
                        _a.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        try {
                            claimed = token.claims();
                            toBrowser = {
                                // We don't want the refresh token to be sent to the browser
                                raw: {
                                    access_token: token.access_token,
                                    id_token: token.id_token,
                                    expires_at: token.expires_at,
                                    scope: token.scope,
                                    token_type: token.token_type,
                                },
                                claimed: claimed,
                            };
                            if (path === this.refreshPath) {
                                res.end(JSON.stringify(toBrowser));
                            }
                            else if (path === this.callbackPath) {
                                res.redirect(this.authSuccessfulRedirectPath);
                            }
                            else {
                                req.user = toBrowser;
                            }
                        }
                        catch (error) {
                            this.redis.del(SID);
                            log("Error: We were not able to get the data from the token (claims)");
                        }
                        _a.label = 8;
                    case 8:
                        userHasValidSession = true;
                        return [3 /*break*/, 10];
                    case 9:
                        error_1 = _a.sent();
                        this.redis.del(SID);
                        log("Unknow error:");
                        console.log(error_1);
                        return [3 /*break*/, 10];
                    case 10:
                        if (!!userHasValidSession) return [3 /*break*/, 47];
                        if (!(path === this.authPath && req.method == "POST")) return [3 /*break*/, 17];
                        state = openid_client_1.generators.state();
                        stateID = req.query.stateID;
                        if (!stateID) return [3 /*break*/, 15];
                        _a.label = 11;
                    case 11:
                        _a.trys.push([11, 13, , 14]);
                        return [4 /*yield*/, this.redis.set(stateID, state, "EX", this.authRequestMaxAge)];
                    case 12:
                        _a.sent();
                        return [3 /*break*/, 14];
                    case 13:
                        error_2 = _a.sent();
                        log("Error: We were not able to store the state in the DB, check the following logs from redis:");
                        console.log(error_2);
                        res.end(JSON.stringify({ err: "DB_ERR" }));
                        return [3 /*break*/, 14];
                    case 14:
                        // We then send the redirect URL back to the frontend, the frontend will
                        // take care of redirecting the user to the idp.
                        try {
                            redirectURL = this.client.authorizationUrl({
                                scope: this.scope,
                                code_challenge_method: "S256",
                                redirect_uri: this.redirectURI,
                                state: state,
                            });
                            res.end(JSON.stringify({ url: redirectURL }));
                        }
                        catch (error) {
                            log("Error: We were not able to generate the authorization url, check the following logs:");
                            console.log(error);
                            res.end(JSON.stringify({ err: "AUTH_URL_ERR" }));
                        }
                        return [3 /*break*/, 16];
                    case 15:
                        log("Error: No stateID found in request");
                        res.end(JSON.stringify({ err: "NO_STATEID_FOUND_IN_REQ" }));
                        _a.label = 16;
                    case 16: return [3 /*break*/, 47];
                    case 17:
                        if (!((path === this.callbackPath || path === this.silentCallbackPath) &&
                            req.method == "POST")) return [3 /*break*/, 45];
                        _a.label = 18;
                    case 18:
                        _a.trys.push([18, 43, , 44]);
                        params = this.client.callbackParams(req.originalUrl);
                        _a.label = 19;
                    case 19:
                        _a.trys.push([19, 41, , 42]);
                        stateID = req.query.stateID;
                        if (!(stateID === null ||
                            stateID === undefined ||
                            stateID === "")) return [3 /*break*/, 20];
                        log("Error: No state found");
                        res.end(JSON.stringify({ err: "NO_STATE_FOUND_IN_REQ" }));
                        return [3 /*break*/, 40];
                    case 20:
                        _a.trys.push([20, 39, , 40]);
                        return [4 /*yield*/, this.redis.get(stateID)];
                    case 21:
                        state = _a.sent();
                        if (!state) return [3 /*break*/, 37];
                        _a.label = 22;
                    case 22:
                        _a.trys.push([22, 35, , 36]);
                        return [4 /*yield*/, this.client.callback(path === this.callbackPath
                                ? this.redirectURI
                                : this.silentRedirectURI, params, {
                                state: state,
                            })];
                    case 23:
                        tokenSet = _a.sent();
                        _a.label = 24;
                    case 24:
                        _a.trys.push([24, 33, , 34]);
                        claimed = tokenSet.claims();
                        resultToStore = { raw: tokenSet, claimed: claimed };
                        toBrowser = {
                            // We don't want the refresh token to be sent to the browser
                            raw: {
                                access_token: tokenSet.access_token,
                                id_token: tokenSet.id_token,
                                expires_at: tokenSet.expires_at,
                                scope: tokenSet.scope,
                                token_type: tokenSet.token_type,
                            },
                            claimed: claimed,
                        };
                        SID_1 = uuid_1.v4();
                        _a.label = 25;
                    case 25:
                        _a.trys.push([25, 31, , 32]);
                        return [4 /*yield*/, this.redis.set(String(SID_1), JSON.stringify(resultToStore), "EX", this.sessionMaxAge)];
                    case 26:
                        _a.sent();
                        res.setHeader("Set-Cookie", cookie_1.serialize("SID", String(SID_1), {
                            httpOnly: !dev,
                            secure: !dev,
                            sameSite: true,
                            maxAge: this.sessionMaxAge,
                            path: "/",
                        }));
                        _a.label = 27;
                    case 27:
                        _a.trys.push([27, 29, , 30]);
                        return [4 /*yield*/, this.redis.del(stateID)];
                    case 28:
                        _a.sent();
                        return [3 /*break*/, 30];
                    case 29:
                        error_3 = _a.sent();
                        log("Error: We were not able to delete the state from the DB, see the following logs:");
                        console.log(error_3);
                        res.end(JSON.stringify({ err: "DB_ERR" }));
                        return [3 /*break*/, 30];
                    case 30:
                        if (path !== this.silentCallbackPath) {
                            res.end(JSON.stringify({
                                url: this.authSuccessfulRedirectPath,
                            }));
                        }
                        else {
                            res.end(JSON.stringify(toBrowser));
                        }
                        return [3 /*break*/, 32];
                    case 31:
                        error_4 = _a.sent();
                        log("Error: We were not able to save the session to the db, check the following logs:");
                        console.log(error_4);
                        res.end(JSON.stringify({ err: "DB_ERR" }));
                        return [3 /*break*/, 32];
                    case 32: return [3 /*break*/, 34];
                    case 33:
                        error_5 = _a.sent();
                        log("Error: We were not able to claims the tokens, see the following logs:");
                        console.log(error_5);
                        res.end(JSON.stringify({ err: "CLAIMS_ERR" }));
                        return [3 /*break*/, 34];
                    case 34: return [3 /*break*/, 36];
                    case 35:
                        error_6 = _a.sent();
                        log("Error: We were not able to perform the callback for Authorization Server's authorization response, see the logs bellow:");
                        console.log(error_6);
                        res.end(JSON.stringify({
                            err: "CALLBACK_ERR",
                            op_err: error_6.error,
                        }));
                        return [3 /*break*/, 36];
                    case 36: return [3 /*break*/, 38];
                    case 37:
                        log("Error: No state found in db");
                        res.end(JSON.stringify({ err: "NO_STATE_FOUND_IN_DB" }));
                        _a.label = 38;
                    case 38: return [3 /*break*/, 40];
                    case 39:
                        error_7 = _a.sent();
                        log("Error: An error occured when fetching the state from the DB, see the error bellow:");
                        console.log(error_7);
                        res.end(JSON.stringify({ err: "DB_ERR" }));
                        return [3 /*break*/, 40];
                    case 40: return [3 /*break*/, 42];
                    case 41:
                        error_8 = _a.sent();
                        log("Error: body is undefined, have you forgot bodyParser middleware?");
                        return [3 /*break*/, 42];
                    case 42: return [3 /*break*/, 44];
                    case 43:
                        error_9 = _a.sent();
                        log("Error: We were not able to get the params from the callback, see the following logs:");
                        console.log(error_9);
                        res.end(JSON.stringify({ err: "NO_PARAMS_FOUND" }));
                        return [3 /*break*/, 44];
                    case 44: return [3 /*break*/, 47];
                    case 45:
                        if (!(this.silentPath &&
                            path !== this.silentPath &&
                            path !== this.authPath &&
                            path !== this.callbackPath &&
                            this.silentRedirectURI &&
                            path !== this.silentCallbackPath)) return [3 /*break*/, 47];
                        state = openid_client_1.generators.state();
                        stateID = uuid_1.v4();
                        return [4 /*yield*/, this.redis.set(stateID, state)];
                    case 46:
                        _a.sent();
                        redirectURL = this.client.authorizationUrl({
                            scope: this.scope,
                            code_challenge_method: "S256",
                            state: state,
                            redirect_uri: this.silentRedirectURI,
                        }) + "&prompt=none";
                        buffRedirectTo = new Buffer(redirectURL);
                        base64RedirectTo = buffRedirectTo.toString("base64");
                        where_at = req.originalUrl;
                        buffWhere_at = new Buffer(where_at);
                        base64Where_at = buffWhere_at.toString("base64");
                        console.log(where_at);
                        res.redirect(this.silentPath + "?redirect_to=" + base64RedirectTo + "&stateID=" + stateID + "&where_at=" + base64Where_at);
                        _a.label = 47;
                    case 47:
                        next();
                        return [2 /*return*/];
                }
            });
        }); };
    };
    return SapperOIDCClient;
}());
exports.SapperOIDCClient = SapperOIDCClient;
function getSIDFromCookie(req) {
    return req.headers.cookie ? cookie_1.parse(req.headers.cookie).SID : undefined;
}
function getTokenSetFromCookie(req, redisClient) {
    return __awaiter(this, void 0, void 0, function () {
        var SID, result, tokenSet, error_10, error_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    SID = getSIDFromCookie(req);
                    if (!SID) return [3 /*break*/, 11];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 9, , 10]);
                    return [4 /*yield*/, redisClient.get(SID)];
                case 2:
                    result = _a.sent();
                    if (!result) return [3 /*break*/, 7];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 4, , 6]);
                    tokenSet = new openid_client_1.TokenSet(JSON.parse(result).raw);
                    return [2 /*return*/, tokenSet];
                case 4:
                    error_10 = _a.sent();
                    // It would mean that the data stored in the DB are not correctly formated. We don't want that.
                    return [4 /*yield*/, redisClient.del(SID)];
                case 5:
                    // It would mean that the data stored in the DB are not correctly formated. We don't want that.
                    _a.sent();
                    return [2 /*return*/, undefined];
                case 6: return [3 /*break*/, 8];
                case 7: return [2 /*return*/, undefined];
                case 8: return [3 /*break*/, 10];
                case 9:
                    error_11 = _a.sent();
                    return [2 /*return*/, undefined];
                case 10: return [3 /*break*/, 12];
                case 11: return [2 /*return*/, undefined];
                case 12: return [2 /*return*/];
            }
        });
    });
}
function getRefreshedTokenSetAndClaims(tokenSet, client) {
    return __awaiter(this, void 0, void 0, function () {
        var refreshedTokenSet, claimed, resultToStore, resultToBrowser, error_12;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, client.refresh(tokenSet)];
                case 1:
                    refreshedTokenSet = _a.sent();
                    try {
                        claimed = refreshedTokenSet.claims();
                        resultToStore = { raw: refreshedTokenSet, claimed: claimed };
                        resultToBrowser = {
                            // We don't want the refresh token to be sent to the browser
                            raw: {
                                access_token: refreshedTokenSet.access_token,
                                id_token: refreshedTokenSet.id_token,
                                expires_at: refreshedTokenSet.expires_at,
                                scope: refreshedTokenSet.scope,
                                token_type: refreshedTokenSet.token_type,
                            },
                            claimed: claimed,
                        };
                        return [2 /*return*/, {
                                toStore: resultToStore,
                                toBrowser: resultToBrowser,
                            }];
                    }
                    catch (error) {
                        log("Error: We were not able to get the data from the token (claims)");
                        return [2 /*return*/, undefined];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_12 = _a.sent();
                    log("Error: We were not able to refresh the tokens");
                    return [2 /*return*/, undefined];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function updateToStore(SID, toStore, redisClient) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, redisClient.set(SID, JSON.stringify(toStore), "KEEPTTL")];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function log(message) {
    console.log("\x1b[36m%s\x1b[0m", "[sapper-oidc]", "\x1b[0m", message);
}
