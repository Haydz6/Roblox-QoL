// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const TOKEN_HEADER_NAME = "x-bound-auth-token";
const FETCH_TOKEN_METADATA_URL = "https://www.roblox.com/reference/blank";
const FETCH_TOKEN_METADATA_SELECTOR = 'meta[name="hardware-backed-authentication-data"]';
const FETCH_USER_DATA_SELECTOR = 'meta[name="user-data"]';
const FETCH_TOKEN_METADATA_REGEX = /name="hardware-backed-authentication-data"(\s|.)+?data-is-secure-authentication-intent-enabled="(.+?)"(\s|.)+?data-is-bound-auth-token-enabled="(.+?)"(\s|.)+?data-bound-auth-token-whitelist="(.+?)"(\s|.)+?data-bound-auth-token-exemptlist="(.+?)"(\s|.)+?data-hba-indexed-db-name="(.+?)"(\s|.)+?data-hba-indexed-db-obj-store-name="(.+?)"(\s|.)+?data-hba-indexed-db-key-name="(.+?)"(\s|.)+?data-hba-indexed-db-version="(.+?)"/;
const FETCH_USER_DATA_REGEX = /<meta[^name=]name="user-data"/;
const AUTH_TOKEN_SEPARATOR = "|";
const MATCH_ROBLOX_URL_BASE = ".roblox.com";
const DEFAULT_INDEXED_DB_VERSION = 1;
const FORCE_BAT_URLS = [
    "/account-switcher/v1/switch"
];
const TOKEN_SIGNATURE_ALGORITHM = {
    name: "ECDSA",
    hash: {
        name: "SHA-256"
    }
};
function decodeEntities(encodedString) {
    const translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    const translate = {
        "nbsp": " ",
        "amp": "&",
        "quot": "\"",
        "lt": "<",
        "gt": ">"
    };
    return encodedString.replace(translate_re, function(_, entity) {
        return translate[entity];
    }).replace(/&#(\d+);/gi, function(_, numStr) {
        const num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    });
}
async function hashStringSha256(str) {
    const uint8 = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest(TOKEN_SIGNATURE_ALGORITHM.hash.name, uint8);
    return arrayBufferToBase64String(hashBuffer);
}
function arrayBufferToBase64String(arrayBuffer) {
    let res = "";
    const bytes = new Uint8Array(arrayBuffer);
    for(let i = 0; i < bytes.byteLength; i++){
        res += String.fromCharCode(bytes[i]);
    }
    return btoa(res);
}
async function signWithKey(privateKey, data) {
    const bufferResult = await crypto.subtle.sign(TOKEN_SIGNATURE_ALGORITHM, privateKey, new TextEncoder().encode(data).buffer);
    return arrayBufferToBase64String(bufferResult);
}
function doesDatabaseExist(dbName) {
    return new Promise((resolve)=>{
        const db = indexedDB.open(dbName);
        db.onsuccess = ()=>{
            db.result.close();
            resolve(true);
        };
        db.onupgradeneeded = (evt)=>{
            evt.target?.transaction?.abort();
            resolve(false);
        };
    });
}
async function getCryptoKeyPairFromDB(dbName, dbObjectName, dbObjectChildId) {
    let targetVersion = 1;
    if ("databases" in indexedDB) {
        const databases = await indexedDB.databases();
        const database = databases.find((db)=>db.name === dbName);
        if (!database) {
            return null;
        }
        if (database?.version) {
            targetVersion = database.version;
        }
    } else {
        if (!await doesDatabaseExist(dbName)) {
            return null;
        }
    }
    return new Promise((resolve, reject)=>{
        const request = indexedDB.open(dbName, targetVersion);
        request.onsuccess = ()=>{
            try {
                const db = request.result;
                const transaction = db.transaction(dbObjectName, "readonly");
                const objectStore = transaction.objectStore(dbObjectName);
                const get = objectStore.get(dbObjectChildId);
                get.onsuccess = ()=>{
                    resolve(get.result);
                };
                get.onerror = ()=>{
                    reject(request.error);
                };
                transaction.oncomplete = ()=>{
                    db.close();
                };
            } catch (err) {
                reject(err);
            }
        };
        request.onerror = ()=>{
            reject(request.error);
        };
    });
}
function filterObject(obj) {
    return Object.fromEntries(Object.entries(obj).filter(([_, v])=>v !== null && v !== undefined));
}
class HBAClient {
    _fetchFn;
    cachedTokenMetadata;
    headers = {};
    cryptoKeyPair;
    onSite = false;
    suppliedCryptoKeyPair;
    baseUrl;
    cookie;
    isAuthenticated;
    fetch(url, params) {
        const headers = new Headers(filterObject(this.headers));
        if (params?.headers) {
            const headerParams = new Headers(params.headers);
            headerParams.forEach((value, key)=>{
                headers.set(key, value);
            });
        }
        if (this.cookie) {
            headers.set("cookie", this.cookie);
        }
        const init = {
            ...params,
            headers
        };
        if (this.onSite) {
            init.credentials = "include";
        }
        return (this._fetchFn ?? fetch)(url, init);
    }
    async generateBaseHeaders(requestUrl, includeCredentials, body) {
        if (!await this.isUrlIncludedInWhitelist(requestUrl, includeCredentials)) {
            return {};
        }
        const token = await this.generateBAT(body);
        if (!token) {
            return {};
        }
        return {
            [TOKEN_HEADER_NAME]: token
        };
    }
    async getTokenMetadata(uncached) {
        if (!uncached && await this.cachedTokenMetadata) {
            return this.cachedTokenMetadata;
        }
        const promise = (async ()=>{
            let isSecureAuthenticationIntentEnabled;
            let isBoundAuthTokenEnabledForAllUrls;
            let boundAuthTokenWhitelist;
            let boundAuthTokenExemptlist;
            let hbaIndexedDbName;
            let hbaIndexedDbObjStoreName;
            let hbaIndexedDbKeyName;
            let hbaIndexedDbVersion;
            let isAuthenticated;
            let doc;
            const canUseDoc = "DOMParser" in globalThis && "document" in globalThis;
            if (uncached || !canUseDoc || !document.querySelector?.(FETCH_TOKEN_METADATA_SELECTOR) || !document.querySelector?.(FETCH_USER_DATA_SELECTOR) && document?.readyState === "loading") {
                const text = await this.fetch(FETCH_TOKEN_METADATA_URL).then((res)=>res.text());
                if (!canUseDoc) {
                    const match = text.match(FETCH_TOKEN_METADATA_REGEX);
                    if (!match) {
                        return null;
                    }
                    try {
                        isAuthenticated = FETCH_USER_DATA_REGEX.test(text);
                        isSecureAuthenticationIntentEnabled = match[2] === "true";
                        isBoundAuthTokenEnabledForAllUrls = match[4] === "true";
                        try {
                            boundAuthTokenWhitelist = JSON.parse(decodeEntities(match[6]))?.Whitelist?.map((item)=>({
                                    ...item,
                                    sampleRate: Number(item.sampleRate)
                                }));
                        } catch  {
                            boundAuthTokenWhitelist = [];
                        }
                        try {
                            boundAuthTokenExemptlist = JSON.parse(decodeEntities(match[8]))?.Exemptlist;
                        } catch  {
                            boundAuthTokenExemptlist = [];
                        }
                        hbaIndexedDbName = match[10];
                        hbaIndexedDbObjStoreName = match[12];
                        hbaIndexedDbKeyName = match[14];
                        hbaIndexedDbVersion = parseInt(match[16], 10) || DEFAULT_INDEXED_DB_VERSION;
                    } catch  {
                        this.cachedTokenMetadata = undefined;
                        return null;
                    }
                } else {
                    doc = new DOMParser().parseFromString(text, "text/html");
                }
            } else {
                doc = document;
            }
            if (doc) {
                const el = doc.querySelector?.(FETCH_TOKEN_METADATA_SELECTOR);
                if (!el) {
                    return null;
                }
                try {
                    isAuthenticated = !!doc.querySelector?.(FETCH_USER_DATA_SELECTOR);
                    isSecureAuthenticationIntentEnabled = el.getAttribute("data-is-secure-authentication-intent-enabled") === "true";
                    isBoundAuthTokenEnabledForAllUrls = el.getAttribute("data-is-bound-auth-token-enabled") === "true";
                    try {
                        boundAuthTokenWhitelist = JSON.parse(el.getAttribute("data-bound-auth-token-whitelist"))?.Whitelist?.map((item)=>({
                                ...item,
                                sampleRate: Number(item.sampleRate)
                            }));
                    } catch  {
                        boundAuthTokenWhitelist = [];
                    }
                    try {
                        boundAuthTokenExemptlist = JSON.parse(el.getAttribute("data-bound-auth-token-exemptlist"))?.Exemptlist;
                    } catch  {
                        boundAuthTokenExemptlist = [];
                    }
                    hbaIndexedDbName = el.getAttribute("data-hba-indexed-db-name");
                    hbaIndexedDbObjStoreName = el.getAttribute("data-hba-indexed-db-obj-store-name");
                    hbaIndexedDbKeyName = el.getAttribute("data-hba-indexed-db-key-name");
                    hbaIndexedDbVersion = parseInt(el.getAttribute("data-hba-indexed-db-version"), 10) || DEFAULT_INDEXED_DB_VERSION;
                } catch  {
                    this.cachedTokenMetadata = undefined;
                    return null;
                }
            }
            const tokenMetadata = {
                isSecureAuthenticationIntentEnabled: isSecureAuthenticationIntentEnabled,
                isBoundAuthTokenEnabledForAllUrls: isBoundAuthTokenEnabledForAllUrls,
                boundAuthTokenWhitelist: boundAuthTokenWhitelist,
                boundAuthTokenExemptlist: boundAuthTokenExemptlist,
                hbaIndexedDbName: hbaIndexedDbName,
                hbaIndexedDbObjStoreName: hbaIndexedDbObjStoreName,
                hbaIndexedDbKeyName: hbaIndexedDbKeyName,
                hbaIndexedDbVersion: hbaIndexedDbVersion,
                isAuthenticated: isAuthenticated
            };
            this.cachedTokenMetadata = tokenMetadata;
            return tokenMetadata;
        })();
        this.cachedTokenMetadata = promise;
        return promise;
    }
    async getCryptoKeyPair(uncached) {
        if (this.suppliedCryptoKeyPair) {
            return this.suppliedCryptoKeyPair;
        }
        if (!uncached && await this.cryptoKeyPair) {
            return this.cryptoKeyPair;
        }
        if (!("indexedDB" in globalThis)) {
            return null;
        }
        const promise = (async ()=>{
            const metadata = await this.getTokenMetadata(uncached);
            if (!metadata) {
                return null;
            }
            try {
                const pair = await getCryptoKeyPairFromDB(metadata.hbaIndexedDbName, metadata.hbaIndexedDbObjStoreName, metadata.hbaIndexedDbKeyName);
                this.cryptoKeyPair = pair ?? undefined;
                return pair;
            } catch  {
                this.cryptoKeyPair = undefined;
                return null;
            }
        })();
        this.cryptoKeyPair = promise;
        return promise;
    }
    async generateBAT(body) {
        const pair = await this.getCryptoKeyPair();
        if (!pair?.privateKey) {
            return null;
        }
        const timestamp = Math.floor(Date.now() / 1000).toString();
        let strBody;
        if (typeof body === "object") {
            strBody = JSON.stringify(body);
        } else if (typeof body === "string") {
            strBody = body;
        }
        const hashedBody = await hashStringSha256(strBody);
        const payloadToSign = [
            hashedBody,
            timestamp
        ].join(AUTH_TOKEN_SEPARATOR);
        const signature = await signWithKey(pair.privateKey, payloadToSign);
        return [
            hashedBody,
            timestamp,
            signature
        ].join(AUTH_TOKEN_SEPARATOR);
    }
    async isUrlIncludedInWhitelist(tryUrl, includeCredentials) {
        const url = tryUrl.toString();
        if (!url.toString().includes(MATCH_ROBLOX_URL_BASE)) {
            return false;
        }
        if (this.onSite && this.baseUrl) {
            try {
                const targetUrl = new URL(url, this.baseUrl);
                if (!targetUrl.href.includes(MATCH_ROBLOX_URL_BASE)) {
                    return false;
                }
            } catch  {}
        }
        if (FORCE_BAT_URLS.some((url2)=>url.includes(url2))) {
            return true;
        }
        const metadata = await this.getTokenMetadata();
        if (!includeCredentials || !(metadata?.isAuthenticated || this.isAuthenticated)) {
            return false;
        }
        return !!metadata && (metadata.isBoundAuthTokenEnabledForAllUrls || metadata.boundAuthTokenWhitelist?.some((item)=>url.includes(item.apiSite) && Math.floor(Math.random() * 100) < item.sampleRate)) && !metadata.boundAuthTokenExemptlist?.some((item)=>url.includes(item.apiSite));
    }
    constructor({ fetch: fetch1, headers, onSite, keys, baseUrl, cookie } = {}){
        if (fetch1) {
            this._fetchFn = fetch1;
        }
        if (headers) {
            this.headers = headers instanceof Headers ? Object.fromEntries(headers.entries()) : headers;
        }
        if (baseUrl) {
            this.baseUrl = baseUrl;
        }
        if (onSite) {
            this.onSite = onSite;
            if (globalThis?.location?.href && !baseUrl) {
                this.baseUrl = globalThis.location.href;
            }
        }
        if (keys) {
            this.suppliedCryptoKeyPair = keys;
        }
        if (cookie) {
            this.cookie = cookie;
        }
    }
}