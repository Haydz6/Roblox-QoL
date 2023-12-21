! function() {
    var t = {
            779: function(e, r) {
                var t;
                /*!
                	Copyright (c) 2018 Jed Watson.
                	Licensed under the MIT License (MIT), see
                	http://jedwatson.github.io/classnames
                */
                ! function() {
                    "use strict";
                    var o = {}.hasOwnProperty;

                    function s() {
                        for (var e = [], r = 0; r < arguments.length; r++) {
                            var t = arguments[r];
                            if (t) {
                                var n, a = typeof t;
                                if ("string" == a || "number" == a) e.push(t);
                                else if (Array.isArray(t)) !t.length || (n = s.apply(null, t)) && e.push(n);
                                else if ("object" == a)
                                    if (t.toString === Object.prototype.toString || t.toString.toString().includes("[native code]"))
                                        for (var i in t) o.call(t, i) && t[i] && e.push(i);
                                    else e.push(t.toString())
                            }
                        }
                        return e.join(" ")
                    }
                    e.exports ? (s.default = s, e.exports = s) : void 0 === (t = function() {
                        return s
                    }.apply(r, [])) || (e.exports = t)
                }()
            }
        },
        n = {};

    function yt(e) {
        if (n[e]) return n[e].exports;
        var r = n[e] = {
            exports: {}
        };
        return t[e](r, r.exports, yt), r.exports
    }
    yt.n = function(e) {
            var r = e && e.__esModule ? function() {
                return e.default
            } : function() {
                return e
            };
            return yt.d(r, {
                a: r
            }), r
        }, yt.d = function(e, r) {
            for (var t in r) yt.o(r, t) && !yt.o(e, t) && Object.defineProperty(e, t, {
                enumerable: !0,
                get: r[t]
            })
        }, yt.o = function(e, r) {
            return Object.prototype.hasOwnProperty.call(e, r)
        },
        function() {
            "use strict";
            var u = CoreUtilities,
                R = React,
                O = yt.n(R),
                e = ReactDOM,
                r = 5,
                t = 15,
                n = 50,
                a = 4,
                i = {
                    friend: {
                        key: "friends",
                        value: "Friend"
                    },
                    public: {
                        value: "Public"
                    },
                    Vip: {
                        key: "private",
                        value: "VIP"
                    }
                },
                o = {
                    descending: "Desc",
                    ascending: "Asc"
                },
                s = {
                    sortOrder: "Desc",
                    excludeFullGames: !1
                },
                l = {
                    friendsServersTitle: "Heading.ServersMyFriendsAreIn",
                    publicServersTitle: "Heading.OtherServers",
                    loadMoreButtonText: "Action.LoadMore",
                    playerCountText: "Label.CurrentPlayerCount",
                    noServersFoundText: "Label.NoServersFound",
                    configureServerText: "Action.ConfigureServer",
                    shutdownServerText: "Label.ShutDownServer",
                    shutdownServerSuccess: "Message.ShutdownServerSuccess",
                    shutdownServerError: "Message.ShutdownServerError",
                    slowGameWarning: "Label.SlowGame",
                    joinServerText: "Label.ServerListJoin",
                    serversText: "Label.Servers",
                    privateServerHeader: "Heading.PrivateServers",
                    privateServerTooltip: "Label.PrivateServersAbout",
                    privateServerRefreshText: "Action.Refresh",
                    privateServerPrice: "Label.Price",
                    privateServerPlayWithOthers: "Label.PlayWithOthers",
                    seeAllPrivateServersText: "Label.SeeAllPrivateServers",
                    privateServersNotSupported: "Label.VipServersNotSupported",
                    freeGameText: "Label.Free",
                    maxFreePrivateServersText: "Description.MaxFreePrivateServers",
                    createPrivateServerText: "Action.CreatePrivateServer",
                    paymentCancelledText: "Label.PaymentCancelled",
                    insufficientFunds: "Label.InsufficientFunds",
                    inactiveServerText: "Label.Inactive",
                    renewServerListText: "Label.Renew",
                    renewPrivateServerTitle: "Label.RenewPrivateServer",
                    renewSubscriptionSuccess: "Message.RenewSubscriptionSuccess",
                    renewSubscriptionError: "Message.RenewSubscriptionError",
                    confirmEnableFuturePaymentsText: "Label.ConfirmEnableFuturePayments",
                    startRenewingPrivateServerPrice: "Label.StartRenewingPrivateServerPrice",
                    cancelText: "Label.Cancel",
                    createPrivateServerPriceText: "Label.CreatePrivateServerFor",
                    gameNameText: "Label.GameName",
                    serverNameText: "Label.ServerName",
                    createPrivateServerTitle: "Action.CreatePrivateServer",
                    buyNowText: "Action.BuyNow",
                    createServerFooterText: "Label.FooterText",
                    privateServerLabel: "Label.PrivateServer",
                    cancelAction: "Action.Cancel",
                    transactionFailedHeading: "Heading.TransactionFailed",
                    createServerFooterDescription: "Description.RecurringSubscriptionRenewal",
                    friendInServerLabel: "Label.FriendInServer",
                    twoFriendsInServerLabel: "Label.TwoFriendsInServer",
                    manyFriendsInServerLabel: "Label.ManyFriendsInThisServer",
                    loadServersError: "Message.LoadServersFailure",
                    purchaseError: "Message.InternalErrorPurchaseError",
                    numberOfPlayers: "Label.NumberOfPlayers",
                    hideFullServers: "Label.ExcludeFullServers",
                    descending: "Action.Descending",
                    ascending: "Action.Ascending"
                },
                c = PropTypes,
                d = yt.n(c),
                m = ReactUtilities,
                C = HeaderScripts,
                v = Roblox,
                p = v.EnvironmentUrls.gamesApi,
                f = function(e) {
                    return u.urlService.getAbsoluteUrl("/users/".concat(e, "/profile"))
                },
                g = function(e) {
                    return u.urlService.getUrlWithQueries("/private-server/configure", {
                        privateServerId: e
                    })
                },
                N = function(e) {
                    return u.urlService.getUrlWithLocale("/info/vip-server", e)
                };

            function b(r, e) {
                var t, n = Object.keys(r);
                return Object.getOwnPropertySymbols && (t = Object.getOwnPropertySymbols(r), e && (t = t.filter(function(e) {
                    return Object.getOwnPropertyDescriptor(r, e).enumerable
                })), n.push.apply(n, t)), n
            }

            function h(n) {
                for (var e = 1; e < arguments.length; e++) {
                    var a = null != arguments[e] ? arguments[e] : {};
                    e % 2 ? b(Object(a), !0).forEach(function(e) {
                        var r, t;
                        r = n, e = a[t = e], t in r ? Object.defineProperty(r, t, {
                            value: e,
                            enumerable: !0,
                            configurable: !0,
                            writable: !0
                        }) : r[t] = e
                    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(n, Object.getOwnPropertyDescriptors(a)) : b(Object(a)).forEach(function(e) {
                        Object.defineProperty(n, e, Object.getOwnPropertyDescriptor(a, e))
                    })
                }
                return n
            }
            var y = i,
                S = function(e, r) {
                    return u.urlService.getAbsoluteUrl("".concat(p, "/v1/games/").concat(e, "/servers/").concat(r))
                },
                w = function(e) {
                    return u.urlService.getAbsoluteUrl("".concat(p, "/v1/games/").concat(e, "/private-servers"))
                },
                I = function() {
                    return u.urlService.getAbsoluteUrl("/game-instances/shutdown")
                },
                E = function(e) {
                    return "".concat(p, "/v1/vip-servers/").concat(e)
                },
                P = function(e) {
                    return "".concat(p, "/v1/games/vip-servers/").concat(e)
                },
                x = function(e) {
                    return "".concat(p, "/v1/games/vip-servers/").concat(e)
                },
                T = function(e) {
                    return "".concat(p, "/v1/vip-servers/").concat(e, "/subscription")
                },
                L = {
                    getPublicGameInstances: function(e, r, t) {
                        t = 2 < arguments.length && void 0 !== t ? t : {}, e = {
                            url: S(e, y.public.value),
                            retryable: !0,
                            withCredentials: !0
                        }, t = h({
                            cursor: r
                        }, t);
                        return u.httpService.get(e, t)
                    },
                    getFriendsGameInstances: function(e, r, t) {
                        t = 2 < arguments.length && void 0 !== t ? t : {}, e = {
                            url: S(e, y.friend.value),
                            retryable: !0,
                            withCredentials: !0
                        }, t = h({
                            cursor: r
                        }, t);
                        return u.httpService.get(e, t)
                    },
                    getVipGameInstances: function(e, r, t) {
                        t = 2 < arguments.length && void 0 !== t ? t : {}, e = {
                            url: w(e),
                            retryable: !0,
                            withCredentials: !0
                        }, t = h({
                            cursor: r
                        }, t);
                        return u.httpService.get(e, t)
                    },
                    shutdownGameInstance: function(e, r, t) {
                        var n = null === (a = document.getElementsByName("__RequestVerificationToken")[0]) || void 0 === a ? void 0 : a.value,
                            a = {
                                url: I(),
                                retryable: !0,
                                withCredentials: !0
                            },
                            r = {
                                __RequestVerificationToken: n,
                                placeId: e,
                                gameId: r
                            };
                        return t && (r.privateServerId = t), u.httpService.post(a, r)
                    },
                    createPrivateServer: function(e, r, t) {
                        e = {
                            url: x(e),
                            retryable: !0,
                            withCredentials: !0
                        }, t = {
                            name: r,
                            expectedPrice: t
                        };
                        return u.httpService.post(e, t)
                    },
                    getVipServer: function(e) {
                        e = {
                            url: E(e),
                            retryable: !0,
                            withCredentials: !0
                        };
                        return u.httpService.get(e)
                    },
                    createVipServer: function(e, r, t) {
                        e = {
                            url: P(e),
                            retryable: !0,
                            withCredentials: !0
                        };
                        return u.httpService.post(e, {
                            name: r,
                            expectedPrice: t
                        })
                    },
                    updateVipServerSubscription: function(e, r, t) {
                        e = {
                            url: T(e),
                            retryable: !0,
                            withCredentials: !0
                        };
                        return u.httpService.patch(e, {
                            active: r,
                            price: t
                        })
                    }
                },
                A = function() {
                    var e = document.getElementById("game-detail-meta-data");
                    return e ? {
                        gameDetailUniverseId: parseInt(e.getAttribute("data-universe-id"), 10),
                        gameDetailPlaceName: e.getAttribute("data-place-name"),
                        gameDetailPlaceId: parseInt(e.getAttribute("data-place-id"), 10),
                        gameDetailPageId: e.getAttribute("data-page-id"),
                        gameDetailGameInstanceId: e.getAttribute("data-game-instance-id"),
                        gameDetailShowShutdownAllButton: "True" === e.getAttribute("data-show-shut-down-all-button"),
                        gameDetailUserCanManagePlace: "True" === e.getAttribute("data-user-can-manage-place"),
                        gameDetailPrivateServerPrice: parseInt(e.getAttribute("data-private-server-price"), 10),
                        gameDetailCanCreateServer: "True" === e.getAttribute("data-can-create-server"),
                        gameDetailPrivateServerLimit: parseInt(e.getAttribute("data-private-server-limit"), 10) || 0,
                        gameDetailSellerName: e.getAttribute("data-seller-name"),
                        gameDetailSellerId: parseInt(e.getAttribute("data-seller-id"), 10),
                        gameDetailPrivateServerProductId: parseInt(e.getAttribute("data-private-server-product-id"), 10),
                        gameDetailPreopenCreatePrivateServerModal: "True" === e.getAttribute("data-preopen-create-private-server-modal"),
                        gameDetailExperienceInviteLinkId: e.getAttribute("data-experience-invite-link-id"),
                        gameDetailExperienceInviteStatus: e.getAttribute("data-experience-invite-status")
                    } : null
                };

            function D(e, r, t, n, a, i, o) {
                try {
                    var s = e[i](o),
                        l = s.value
                } catch (e) {
                    return void t(e)
                }
                s.done ? r(l) : Promise.resolve(l).then(n, a)
            }

            function j(s) {
                return function() {
                    var e = this,
                        o = arguments;
                    return new Promise(function(r, t) {
                        var n = s.apply(e, o);

                        function a(e) {
                            D(n, r, t, a, i, "next", e)
                        }

                        function i(e) {
                            D(n, r, t, a, i, "throw", e)
                        }
                        a(void 0)
                    })
                }
            }

            function F(e) {
                return function(e) {
                    if (Array.isArray(e)) return M(e)
                }(e) || function(e) {
                    if ("undefined" != typeof Symbol && Symbol.iterator in Object(e)) return Array.from(e)
                }(e) || q(e) || function() {
                    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
                }()
            }

            function k(e, r) {
                return function(e) {
                    if (Array.isArray(e)) return e
                }(e) || function(e, r) {
                    if ("undefined" == typeof Symbol || !(Symbol.iterator in Object(e))) return;
                    var t = [],
                        n = !0,
                        a = !1,
                        i = void 0;
                    try {
                        for (var o, s = e[Symbol.iterator](); !(n = (o = s.next()).done) && (t.push(o.value), !r || t.length !== r); n = !0);
                    } catch (e) {
                        a = !0, i = e
                    } finally {
                        try {
                            n || null == s.return || s.return()
                        } finally {
                            if (a) throw i
                        }
                    }
                    return t
                }(e, r) || q(e, r) || function() {
                    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
                }()
            }

            function q(e, r) {
                if (e) {
                    if ("string" == typeof e) return M(e, r);
                    var t = Object.prototype.toString.call(e).slice(8, -1);
                    return "Object" === t && e.constructor && (t = e.constructor.name), "Map" === t || "Set" === t ? Array.from(e) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? M(e, r) : void 0
                }
            }

            function M(e, r) {
                (null == r || r > e.length) && (r = e.length);
                for (var t = 0, n = new Array(r); t < r; t++) n[t] = e[t];
                return n
            }
            var G, B = A,
                U = s,
                H = function(o) {
                    var s = 1 < arguments.length && void 0 !== arguments[1] && arguments[1],
                        e = (w = B()).gameDetailUniverseId,
                        l = w.gameDetailPlaceId,
                        r = w.gameDetailPlaceName,
                        t = w.gameDetailCanCreateServer,
                        n = w.gameDetailPrivateServerPrice,
                        a = w.gameDetailUserCanManagePlace,
                        i = w.gameDetailSellerId,
                        c = w.gameDetailSellerName,
                        u = w.gameDetailPrivateServerProductId,
                        d = (I = k((0, R.useState)(!1), 2))[0],
                        m = I[1],
                        v = (S = k((0, R.useState)(!1), 2))[0],
                        p = S[1],
                        f = (w = k((0, R.useState)([]), 2))[0],
                        g = w[1],
                        b = (I = k((0, R.useState)(""), 2))[0],
                        h = I[1],
                        y = (0, R.useCallback)(j(regeneratorRuntime.mark(function e() {
                            var r, t, n, a, i = arguments;
                            return regeneratorRuntime.wrap(function(e) {
                                for (;;) switch (e.prev = e.next) {
                                    case 0:
                                        if (r = 0 < i.length && void 0 !== i[0] ? i[0] : {}, t = 1 < i.length && void 0 !== i[1] && i[1], d) throw Error("Cannot load more servers while a request is in flight");
                                        e.next = 4;
                                        break;
                                    case 4:
                                        return m(!0), p(!1), e.prev = 6, e.next = 9, o(l, t ? "" : b, r);
                                    case 9:
                                        return n = e.sent, a = n.data, n = a.data, a = a.nextPageCursor, e.next = 15, Promise.all(n.map(function() {
                                            var r = j(regeneratorRuntime.mark(function e(r) {
                                                var t, n, a, i;
                                                return regeneratorRuntime.wrap(function(e) {
                                                    for (;;) switch (e.prev = e.next) {
                                                        case 0:
                                                            if (void 0 === r.players && (r.players = []), t = r.players, n = r.playerTokens, a = {}, t.forEach(function(e) {
                                                                    a[e.playerToken] = e
                                                                }), n.forEach(function(e) {
                                                                    null == a[e] && t.push({
                                                                        id: null,
                                                                        name: null,
                                                                        playerToken: e,
                                                                        displayName: null
                                                                    })
                                                                }), s && r.vipServerId && (null === (n = r.owner) || void 0 === n ? void 0 : n.id) === C.authenticatedUser.id) return i = r.vipServerId, e.prev = 7, e.next = 10, L.getVipServer(i);
                                                            e.next = 17;
                                                            break;
                                                        case 10:
                                                            i = e.sent, i = i.data, r.vipServerSubscription = i.subscription, e.next = 17;
                                                            break;
                                                        case 15:
                                                            e.prev = 15, e.t0 = e.catch(7);
                                                        case 17:
                                                        case "end":
                                                            return e.stop()
                                                    }
                                                }, e, null, [
                                                    [7, 15]
                                                ])
                                            }));
                                            return function(e) {
                                                return r.apply(this, arguments)
                                            }
                                        }()));
                                    case 15:
                                        g(t ? n : function(e, r) {
                                            var t = F(e),
                                                n = {};
                                            return t.forEach(function(e) {
                                                void 0 !== e.id && (n[e.id] = e)
                                            }), r.forEach(function(e) {
                                                var r = n[e.id];
                                                r ? Object.assign(r, e) : t.push(e)
                                            }), t
                                        }(f, n)), h(a), e.next = 24;
                                        break;
                                    case 19:
                                        e.prev = 19, e.t0 = e.catch(6), g([]), h(""), p(!0);
                                    case 24:
                                        return e.prev = 24, m(!1), e.finish(24);
                                    case 27:
                                    case "end":
                                        return e.stop()
                                }
                            }, e, null, [
                                [6, 19, 24, 27]
                            ])
                        })), [d, l, b, f, o, s]),
                        S = (0, R.useCallback)(function(e) {
                            if (d) throw Error("Cannot remove server from list while a request is in flight");
                            var r = F(f);
                            r.splice(e, 1), g(r)
                        }, [d, f]),
                        w = (0, R.useCallback)(function(e) {
                            if (d) throw Error("Cannot clear server while a request is in flight");
                            var r = F(f),
                                e = r[e];
                            e.playerTokens = [], e.players = [], e.playing = 0, e.id = null, g(r)
                        }, [d, f]),
                        I = (0, R.useCallback)(function() {
                            var e = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {};
                            if (d) throw Error("Cannot refresh server list while a request is in flight");
                            y(e, !0)
                        }, [d, y]);
                    return (0, R.useEffect)(function() {
                        y(U)
                    }, []), {
                        metaData: {
                            universeId: e,
                            placeId: l,
                            placeName: r,
                            canCreateServer: t,
                            price: n,
                            userCanManagePlace: a,
                            sellerId: i,
                            sellerName: c,
                            privateServerProductId: u
                        },
                        servers: f,
                        loadMoreServers: y,
                        removeServerAtIndex: S,
                        clearServerAtIndex: w,
                        refreshServers: I,
                        hasNext: !!b,
                        isBusy: d,
                        setIsBusy: m,
                        hasError: v
                    }
                },
                W = {
                    common: ["CommonUI.Controls"],
                    feature: "Feature.ServerList"
                },
                V = {
                    common: [],
                    feature: "Feature.PrivateServers"
                },
                z = {
                    common: [],
                    feature: "Purchasing.PurchaseDialog"
                },
                _ = {
                    common: [],
                    feature: "Feature.VIPServer"
                },
                J = ReactStyleGuide,
                K = yt(779),
                $ = yt.n(K),
                Q = RobloxThumbnails,
                X = "robloxAttributionIds";

            function Y(e) {
                var r = window,
                    t = r[X];
                return t || (t = {}, r[X] = t), (r = t[e]) || (r = u.uuidService.generateRandomUuid(), t[e] = r), r
            }

            function Z(t) {
                return Object.keys(t).reduce(function(e, r) {
                    return "object" == typeof t[r] && t[r] && (e[r] = JSON.stringify(t[r])), "number" == typeof t[r] && (e[r] = t[r]), "string" == typeof t[r] && (e[r] = encodeURIComponent(t[r])), "boolean" == typeof t[r] && (e[r] = t[r] ? 1 : 0), e
                }, {})
            }(G = G || {}).GameDetailReferral = "gameDetailReferral";
            var ee, re = Y,
                te = CoreRobloxUtilities,
                ne = (new v.Intl).getDateTimeFormatter(),
                ae = u.urlService.parseQueryString,
                c = u.abbreviateNumber.getAbbreviatedValue,
                K = u.numberFormat.getNumberFormat;

            function ie() {
                return document.referrer
            }(c = ee = ee || {}).SearchPage = "searchPage", c.SortDetailPageDiscover = "sortDetailPageDiscover", c.SortDetailPageHome = "sortDetailPageHome", c.GameDetailPage = "gameDetailPage", c.GamesPage = "gamesPage", c.HomePage = "homePage", c.PeopleListInHomePage = "peopleListInHomePage";
            var oe, se, le = function() {
                    return (le = Object.assign || function(e) {
                        for (var r, t = 1, n = arguments.length; t < n; t++)
                            for (var a in r = arguments[t]) Object.prototype.hasOwnProperty.call(r, a) && (e[a] = r[a]);
                        return e
                    }).apply(this, arguments)
                },
                ce = function(e, r) {
                    var t = {};
                    for (a in e) Object.prototype.hasOwnProperty.call(e, a) && r.indexOf(a) < 0 && (t[a] = e[a]);
                    if (null != e && "function" == typeof Object.getOwnPropertySymbols)
                        for (var n = 0, a = Object.getOwnPropertySymbols(e); n < a.length; n++) r.indexOf(a[n]) < 0 && Object.prototype.propertyIsEnumerable.call(e, a[n]) && (t[a[n]] = e[a[n]]);
                    return t
                },
                ue = (ne = te.eventStreamService.eventTypes).pageLoad,
                de = ne.formInteraction;

            function me(r, e) {
                var t, n = Object.keys(r);
                return Object.getOwnPropertySymbols && (t = Object.getOwnPropertySymbols(r), e && (t = t.filter(function(e) {
                    return Object.getOwnPropertyDescriptor(r, e).enumerable
                })), n.push.apply(n, t)), n
            }

            function ve(n) {
                for (var e = 1; e < arguments.length; e++) {
                    var a = null != arguments[e] ? arguments[e] : {};
                    e % 2 ? me(Object(a), !0).forEach(function(e) {
                        var r, t;
                        r = n, e = a[t = e], t in r ? Object.defineProperty(r, t, {
                            value: e,
                            enumerable: !0,
                            configurable: !0,
                            writable: !0
                        }) : r[t] = e
                    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(n, Object.getOwnPropertyDescriptors(a)) : me(Object(a)).forEach(function(e) {
                        Object.defineProperty(n, e, Object.getOwnPropertyDescriptor(a, e))
                    })
                }
                return n
            }

            function pe() {
                return +window.location.pathname.split("/")[2]
            }

            function fe(e, r, t) {
                function n() {
                    v.EventStream.SendEventWithTarget("playGameClicked", s, ve({
                        attributionId: re(se.GameDetailReferral)
                    }, l), v.EventStream.TargetTypes.WWW)
                }
                var a = r.instanceId,
                    i = r.accessCode,
                    o = v.GameLauncher.isJoinAttemptIdEnabled() ? u.uuidService.generateRandomUuid() : void 0,
                    s = "".concat(t, "ServerListJoin"),
                    l = {
                        pid: pe(),
                        joinAttemptId: o
                    };
                if ("computer" === he && !ye || "tablet" === he && ge || ye) return function() {
                    n(), v.EventStream.SendEventWithTarget("gamePlayIntent", s, ve({
                        lType: "protocol",
                        refuid: null,
                        pg: "gameDetail"
                    }, l), v.EventStream.TargetTypes.WWW), i ? v.GameLauncher.joinPrivateGame(e, i, void 0, o, v.GameLauncher.isJoinAttemptIdEnabled() ? s : void 0) : a && v.GameLauncher.joinGameInstance(e, a, !1, !1, o, v.GameLauncher.isJoinAttemptIdEnabled() ? s : void 0)
                };
                var c = "",
                    c = Se ? u.urlService.getUrlWithQueries("/games/start", {
                        placeId: e
                    }) : "robloxmobile://placeID=".concat(e);
                return a && (c += "&gameInstanceId=".concat(a)), i && (c += "&accessCode=".concat(i)), v.GameLauncher.isJoinAttemptIdEnabled() && o && (c += "&joinAttemptId=".concat(o, "&joinAttemptOrigin=").concat(s)),
                    function() {
                        n(), window.location.href = c
                    }
            }(ae = oe = oe || {}).AbsPositions = "absPositions", ae.AdsPositions = "adsPositions", ae.AdFlags = "adFlags", ae.Algorithm = "algorithm", ae.AttributionId = "attributionId", ae.HttpReferrer = "httpReferrer", ae.EmphasisFlag = "emphasisFlag", ae.GameSetTargetId = "gameSetTargetId", ae.GameSetTypeId = "gameSetTypeId", ae.IsAd = "isAd", ae.NativeAdData = "nativeAdData", ae.AdIds = "adIds", ae.NumberOfLoadedTiles = "numberOfLoadedTiles", ae.Page = "page", ae.PlaceId = "placeId", ae.Position = "position", ae.RootPlaceIds = "rootPlaceIds", ae.SortId = "sortId", ae.SortPos = "sortPos", ae.SuggestionKwd = "suggestionKwd", ae.SuggestionReplacedKwd = "suggestionReplacedKwd", ae.SuggestionCorrectedKwd = "suggestionCorrectedKwd", ae.SuggestionAlgorithm = "suggestionAlgorithm", ae.Topics = "topics", ae.TreatmentType = "treatmentType", ae.UniverseId = "universeId", ae.UniverseIds = "universeIds", ae.FriendId = "friendId", (c = se = se || {}).GameImpressions = "gameImpressions", c.GameDetailReferral = "gameDetailReferral", c.SortDetailReferral = "sortDetailReferral", (ne = {}).HomePageSessionInfo = "homePageSessionInfo", ne.GameSearchSessionInfo = "gameSearchSessionInfo", ne.DiscoverPageSessionInfo = "discoverPageSessionInfo", (ae = {})[se.GameImpressions] = function(e) {
                e = ce(e, []);
                return [{
                    name: se.GameImpressions,
                    type: se.GameImpressions,
                    context: de
                }, Z(le({}, e))]
            }, ae[se.GameDetailReferral] = function(e) {
                var r;
                return void 0 === e && (e = {}), [{
                    name: se.GameDetailReferral,
                    type: se.GameDetailReferral,
                    context: ue
                }, Z(le(((r = {})[oe.AttributionId] = Y(G.GameDetailReferral), r[oe.HttpReferrer] = ie(), r), e))]
            }, ae[se.SortDetailReferral] = function(e) {
                return void 0 === e && (e = {}), [{
                    name: se.SortDetailReferral,
                    type: se.SortDetailReferral,
                    context: ue
                }, Z(le({}, e))]
            };
            var ge = C.jsClientDeviceIdentifier.isIE11,
                be = A,
                he = (c = (0, v.DeviceMeta)()).deviceType,
                ye = c.isUWPApp,
                Se = c.isInApp,
                we = l,
                Ie = g;

            function Ee(e) {
                var r = e.className,
                    t = e.translate,
                    n = e.gameId,
                    a = e.vipServerId,
                    i = e.isOwner,
                    o = e.canManagePlace,
                    s = e.shutdownServer,
                    l = e.isLoading,
                    e = 0 < a,
                    i = e && i,
                    o = null !== n && (!e && o || i);
                return i || o ? O().createElement("div", {
                    className: r
                }, O().createElement(J.Popover, {
                    id: "game-instance-dropdown-menu",
                    button: O().createElement(J.IconButton, {
                        iconName: "more",
                        size: J.IconButton.sizes.small,
                        isDisabled: l
                    }),
                    trigger: "click",
                    placement: "bottom"
                }, O().createElement("ul", {
                    className: "dropdown-menu",
                    role: "menu"
                }, i && O().createElement("li", null, O().createElement(J.Link, {
                    url: Ie(a),
                    className: "rbx-private-server-configure"
                }, t(we.configureServerText))), o && O().createElement("li", null, O().createElement("button", {
                    type: "button",
                    onClick: s,
                    className: "rbx-private-server-shutdown rbx-private-server-shutdown"
                }, t(we.shutdownServerText)))))) : O().createElement(R.Fragment, null)
            }
            Ee.defaultProps = {
                className: "",
                gameId: null,
                vipServerId: 0,
                isOwner: !1,
                canManagePlace: !1
            }, Ee.propTypes = {
                className: d().string,
                translate: d().func.isRequired,
                gameId: d().string,
                vipServerId: d().number,
                isOwner: d().bool,
                canManagePlace: d().bool,
                shutdownServer: d().func.isRequired,
                isLoading: d().bool.isRequired
            };
            var Pe = Ee,
                xe = ReactDOMServer,
                Te = RobloxItemPurchase;

            function Ae(e, r) {
                return function(e) {
                    if (Array.isArray(e)) return e
                }(e) || function(e, r) {
                    if ("undefined" == typeof Symbol || !(Symbol.iterator in Object(e))) return;
                    var t = [],
                        n = !0,
                        a = !1,
                        i = void 0;
                    try {
                        for (var o, s = e[Symbol.iterator](); !(n = (o = s.next()).done) && (t.push(o.value), !r || t.length !== r); n = !0);
                    } catch (e) {
                        a = !0, i = e
                    } finally {
                        try {
                            n || null == s.return || s.return()
                        } finally {
                            if (a) throw i
                        }
                    }
                    return t
                }(e, r) || function(e, r) {
                    if (!e) return;
                    if ("string" == typeof e) return Ne(e, r);
                    var t = Object.prototype.toString.call(e).slice(8, -1);
                    "Object" === t && e.constructor && (t = e.constructor.name);
                    if ("Map" === t || "Set" === t) return Array.from(e);
                    if ("Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)) return Ne(e, r)
                }(e, r) || function() {
                    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
                }()
            }

            function Ne(e, r) {
                (null == r || r > e.length) && (r = e.length);
                for (var t = 0, n = new Array(r); t < r; t++) n[t] = e[t];
                return n
            }
            var Re = l;

            function Oe(e) {
                var r = e.translate,
                    t = e.placeName,
                    n = e.creatorName,
                    a = e.price,
                    i = e.renewPrivateServer,
                    o = e.isLoading,
                    s = Ae((0, R.useState)(!1), 2),
                    l = s[0],
                    c = s[1],
                    e = Ae((0, R.useState)(!1), 2),
                    s = e[0],
                    u = e[1],
                    n = O().createElement(R.Fragment, null, O().createElement("p", {
                        className: "renew-server-modal-body-text"
                    }, r(Re.confirmEnableFuturePaymentsText, {
                        placeName: t,
                        creatorName: n
                    })), O().createElement("p", {
                        className: "renew-server-modal-body-text",
                        dangerouslySetInnerHTML: {
                            __html: r(Re.startRenewingPrivateServerPrice, {
                                price: (0, xe.renderToString)(O().createElement(Te.PriceLabel, {
                                    price: a
                                }))
                            })
                        }
                    })),
                    d = (0, R.useCallback)(function() {
                        c(!1)
                    }, []),
                    a = (0, R.useCallback)(function() {
                        d(), u(!0), i().finally(function() {
                            u(!1)
                        })
                    }, [i]);
                return O().createElement(R.Fragment, null, O().createElement(J.Button, {
                    className: "rbx-private-server-renew",
                    onClick: function() {
                        return c(!0)
                    },
                    size: J.Button.sizes.extraSmall,
                    width: J.Button.widths.full,
                    variant: J.Button.variants.control,
                    isDisabled: o || s
                }, r(Re.renewServerListText)), O().createElement(J.SimpleModal, {
                    show: l,
                    title: r(Re.renewPrivateServerTitle),
                    body: n,
                    actionButtonText: r(Re.renewServerListText),
                    neutralButtonText: r(Re.cancelText),
                    onAction: a,
                    onClose: d,
                    onNeutral: d,
                    actionButtonShow: !0
                }))
            }
            Oe.propTypes = {
                translate: d().func.isRequired,
                placeName: d().string.isRequired,
                creatorName: d().string.isRequired,
                price: d().number.isRequired,
                renewPrivateServer: d().func.isRequired,
                isLoading: d().bool.isRequired
            };
            var Ce = (0, m.withTranslations)(Oe, V),
                Le = A,
                De = l;

            function je(e) {
                var t = e.translate,
                    r = e.privateServerId,
                    n = e.isPaymentCancelled,
                    a = e.isInsufficientFunds,
                    i = e.isServerInactive,
                    o = e.canRenew,
                    s = e.setSubscription,
                    l = e.isLoading,
                    c = e.systemFeedbackService,
                    u = Le(),
                    d = u.gameDetailPlaceName,
                    m = u.gameDetailPrivateServerPrice,
                    e = u.gameDetailSellerName,
                    u = (0, R.useCallback)(function() {
                        return new Promise(function(e) {
                            L.updateVipServerSubscription(r, !0, m).then(function(e) {
                                e = e.data;
                                s(e), c.success(t(De.renewSubscriptionSuccess) || "Successfully renewed private server")
                            }, function(e) {
                                var r = e.data;
                                0 < (null === (e = r.errors) || void 0 === e ? void 0 : e.length) ? (e = r.errors[0], c.warning(null !== (r = e.userFacingMessage) && void 0 !== r ? r : e.message)) : c.warning(t(De.renewSubscriptionError) || "Unable to renew subscription.")
                            }).finally(function() {
                                e()
                            })
                        })
                    }, [r, m, s, t, c]);
                return O().createElement(R.Fragment, null, n && O().createElement("div", {
                    className: "rbx-private-server-subscription-alert text-alert"
                }, O().createElement("span", {
                    className: "icon-remove"
                }), O().createElement("span", {
                    className: "rbx-private-server-subscription-alert-text"
                }, t(De.paymentCancelledText))), a && O().createElement("div", {
                    className: "rbx-private-server-insufficient-funds text-alert"
                }, O().createElement("span", {
                    className: "icon-remove"
                }), t(De.insufficientFunds)), i && O().createElement("div", {
                    className: "rbx-private-server-inactive"
                }, O().createElement("span", {
                    className: "icon-turn-off"
                }), t(De.inactiveServerText)), o && O().createElement(Ce, {
                    placeName: d,
                    creatorName: e,
                    price: m,
                    renewPrivateServer: u,
                    isLoading: l
                }))
            }
            je.propTypes = {
                translate: d().func.isRequired,
                privateServerId: d().number.isRequired,
                isPaymentCancelled: d().bool.isRequired,
                isInsufficientFunds: d().bool.isRequired,
                isServerInactive: d().bool.isRequired,
                canRenew: d().bool.isRequired,
                setSubscription: d().func.isRequired,
                isLoading: d().bool.isRequired,
                systemFeedbackService: d().shape({
                    success: d().func.isRequired,
                    warning: d().func.isRequired
                }).isRequired
            };
            var Fe = (0, m.withTranslations)(je, W),
                ke = RobloxBadges,
                qe = f;

            function Me(e) {
                var r = e.ownerUserId,
                    t = e.ownerName,
                    e = e.ownerHasVerifiedBadge;
                return O().createElement("div", {
                    className: "rbx-private-owner"
                }, O().createElement(J.Link, {
                    title: t,
                    url: qe(r),
                    className: "avatar avatar-card-fullbody owner-avatar"
                }, O().createElement(Q.Thumbnail2d, {
                    type: Q.ThumbnailTypes.avatarHeadshot,
                    size: Q.DefaultThumbnailSize,
                    targetId: r,
                    containerClass: "avatar-card-image"
                })), O().createElement(J.Link, {
                    url: qe(r),
                    className: "text-name text-overflow"
                }, O().createElement(ke.VerifiedBadgeStringContainer, {
                    size: ke.BadgeSizes.CAPTIONHEADER,
                    showVerifiedBadge: e,
                    text: t
                })))
            }
            Me.propTypes = {
                ownerUserId: d().number.isRequired,
                ownerName: d().string.isRequired,
                ownerHasVerifiedBadge: d().bool.isRequired
            };
            var Ge = Me,
                Be = f,
                Ue = l;

            function He(e) {
                function n(e) {
                    return void 0 === e ? O().createElement(R.Fragment, null) : O().createElement(J.Link, {
                        href: Be(e.id),
                        className: "text-name"
                    }, e.displayName)
                }
                var a = e.translate,
                    r = e.players,
                    i = (0, R.useMemo)(function() {
                        return r.filter(function(e) {
                            return null !== e.id && e.id !== C.authenticatedUser.id
                        })
                    }, [r]),
                    e = (0, R.useMemo)(function() {
                        if (0 === i.length) return "";
                        var e = (0, xe.renderToString)(n(i[0]));
                        if (1 === i.length) return a(Ue.friendInServerLabel, {
                            friend: e
                        }) || "Friends in this server: ".concat(e);
                        var r = (0, xe.renderToString)(n(i[1]));
                        if (2 === i.length) return a(Ue.twoFriendsInServerLabel, {
                            firstFriend: e,
                            secondFriend: r
                        }) || "Friends in this server: ".concat(e, " and ").concat(r);
                        var t = i.length - 2;
                        return "Friends in this server: ".concat(e, ", ").concat(r, ", and ").concat(t, " ").concat(1 == t ? "other" : "others")
                    }, [i, a]);
                return 0 === i.length ? O().createElement(R.Fragment, null) : O().createElement("div", {
                    className: "text friends-in-server-label",
                    dangerouslySetInnerHTML: {
                        __html: e
                    }
                })
            }
            He.propTypes = {
                translate: d().func.isRequired,
                players: d().arrayOf(d().any).isRequired
            };
            var We, Ve = He,
                ze = v.EnvironmentUrls.apiGatewayUrl,
                _e = {
                    getExperimentationValues: function(e, r, t) {
                        return {
                            url: ze + "/product-experimentation-platform/v1/projects/" + e + "/layers/" + r + "/values?parameters=" + t.join(","),
                            withCredentials: !0
                        }
                    }
                },
                ne = {
                    homePage: {},
                    homePageWeb: {},
                    serverTab: {
                        ShouldDisableJoinButtonForFullServers: !1
                    },
                    gameDetails: {
                        ShouldHidePrivateServersInAboutTab: !1
                    },
                    searchPage: {
                        ShouldUseOmniSearchAPI: !1
                    },
                    discoverPage: {
                        IsGamesOmniFeedEnabled: !1
                    }
                },
                ae = {
                    homePage: "PlayerApp.HomePage.UX",
                    homePageWeb: "Website.Homepage",
                    serverTab: "GameDetails.ServersTab",
                    gameDetails: "Website.GameDetails",
                    searchPage: "Website.SearchResultsPage",
                    discoverPage: "Website.GamesPage"
                },
                c = v.EnvironmentUrls.apiGatewayUrl;

            function Je(e) {
                var r = e.children,
                    t = (0, R.useState)(er),
                    e = t[0],
                    n = t[1];
                return (0, R.useEffect)(function() {
                    Xe(Ye.serverTab, Ze.serverTab).then(function(e) {
                        n({
                            disableJoinButtonForFullServers: !(null == e || !e.ShouldDisableJoinButtonForFullServers)
                        })
                    }).catch(function(e) {
                        console.error(e)
                    })
                }, []), O().createElement(rr.Provider, {
                    value: e
                }, r)
            }(c = {}).Game = "Game", c.CatalogAsset = "CatalogAsset", c.CatalogBundle = "CatalogBundle", (c = We = We || {}).Carousel = "Carousel", c.AvatarCarousel = "AvatarCarousel", c.SortlessGrid = "SortlessGrid", (c = {}).Sponsored = "Sponsored", c.SponsoredGame = "SponsoredGame", (c = {}).AppGameTileNoMetadata = "AppGameTileNoMetadata", c.GridTile = "GridTile", (c = {}).Always = "Always", c.Hover = "Hover";
            var Ke = function() {
                    return (Ke = Object.assign || function(e) {
                        for (var r, t = 1, n = arguments.length; t < n; t++)
                            for (var a in r = arguments[t]) Object.prototype.hasOwnProperty.call(r, a) && (e[a] = r[a]);
                        return e
                    }).apply(this, arguments)
                },
                $e = function(e, o, s, l) {
                    return new(s = s || Promise)(function(t, r) {
                        function n(e) {
                            try {
                                i(l.next(e))
                            } catch (e) {
                                r(e)
                            }
                        }

                        function a(e) {
                            try {
                                i(l.throw(e))
                            } catch (e) {
                                r(e)
                            }
                        }

                        function i(e) {
                            var r;
                            e.done ? t(e.value) : ((r = e.value) instanceof s ? r : new s(function(e) {
                                e(r)
                            })).then(n, a)
                        }
                        i((l = l.apply(e, o || [])).next())
                    })
                },
                Qe = function(t, n) {
                    var a, i, o, s = {
                            label: 0,
                            sent: function() {
                                if (1 & o[0]) throw o[1];
                                return o[1]
                            },
                            trys: [],
                            ops: []
                        },
                        e = {
                            next: r(0),
                            throw: r(1),
                            return: r(2)
                        };
                    return "function" == typeof Symbol && (e[Symbol.iterator] = function() {
                        return this
                    }), e;

                    function r(r) {
                        return function(e) {
                            return function(r) {
                                if (a) throw new TypeError("Generator is already executing.");
                                for (; s;) try {
                                    if (a = 1, i && (o = 2 & r[0] ? i.return : r[0] ? i.throw || ((o = i.return) && o.call(i), 0) : i.next) && !(o = o.call(i, r[1])).done) return o;
                                    switch (i = 0, o && (r = [2 & r[0], o.value]), r[0]) {
                                        case 0:
                                        case 1:
                                            o = r;
                                            break;
                                        case 4:
                                            return s.label++, {
                                                value: r[1],
                                                done: !1
                                            };
                                        case 5:
                                            s.label++, i = r[1], r = [0];
                                            continue;
                                        case 7:
                                            r = s.ops.pop(), s.trys.pop();
                                            continue;
                                        default:
                                            if (!(o = 0 < (o = s.trys).length && o[o.length - 1]) && (6 === r[0] || 2 === r[0])) {
                                                s = 0;
                                                continue
                                            }
                                            if (3 === r[0] && (!o || r[1] > o[0] && r[1] < o[3])) {
                                                s.label = r[1];
                                                break
                                            }
                                            if (6 === r[0] && s.label < o[1]) {
                                                s.label = o[1], o = r;
                                                break
                                            }
                                            if (o && s.label < o[2]) {
                                                s.label = o[2], s.ops.push(r);
                                                break
                                            }
                                            o[2] && s.ops.pop(), s.trys.pop();
                                            continue
                                    }
                                    r = n.call(t, s)
                                } catch (e) {
                                    r = [6, e], i = 0
                                } finally {
                                    a = o = 0
                                }
                                if (5 & r[0]) throw r[1];
                                return {
                                    value: r[0] ? r[1] : void 0,
                                    done: !0
                                }
                            }([r, e])
                        }
                    }
                },
                Xe = function(n, a, i) {
                    return void 0 === i && (i = 1), $e(void 0, void 0, Promise, function() {
                        var t, r;
                        return Qe(this, function(e) {
                            switch (e.label) {
                                case 0:
                                    return e.trys.push([0, 2, , 3]), [4, u.httpService.get(_e.getExperimentationValues(i, n, Object.keys(a)))];
                                case 1:
                                    return t = e.sent().data, r = Object.keys(t).reduce(function(e, r) {
                                        return null !== t[r] && (e[r] = t[r]), e
                                    }, {}), [2, Ke(Ke({}, a), r)];
                                case 2:
                                    return e.sent(), [2, a];
                                case 3:
                                    return [2]
                            }
                        })
                    })
                },
                Ye = ae,
                Ze = ne,
                er = {
                    disableJoinButtonForFullServers: !1
                },
                rr = (0, R.createContext)(er),
                tr = rr;

            function nr(e, r) {
                return function(e) {
                    if (Array.isArray(e)) return e
                }(e) || function(e, r) {
                    if ("undefined" == typeof Symbol || !(Symbol.iterator in Object(e))) return;
                    var t = [],
                        n = !0,
                        a = !1,
                        i = void 0;
                    try {
                        for (var o, s = e[Symbol.iterator](); !(n = (o = s.next()).done) && (t.push(o.value), !r || t.length !== r); n = !0);
                    } catch (e) {
                        a = !0, i = e
                    } finally {
                        try {
                            n || null == s.return || s.return()
                        } finally {
                            if (a) throw i
                        }
                    }
                    return t
                }(e, r) || function(e, r) {
                    if (!e) return;
                    if ("string" == typeof e) return ar(e, r);
                    var t = Object.prototype.toString.call(e).slice(8, -1);
                    "Object" === t && e.constructor && (t = e.constructor.name);
                    if ("Map" === t || "Set" === t) return Array.from(e);
                    if ("Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)) return ar(e, r)
                }(e, r) || function() {
                    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
                }()
            }

            function ar(e, r) {
                (null == r || r > e.length) && (r = e.length);
                for (var t = 0, n = new Array(r); t < r; t++) n[t] = e[t];
                return n
            }
            var ir = f,
                or = l,
                sr = r,
                lr = i;

            function cr(e) {
                var r = e.maxPlayerCount,
                    e = e.currentPlayerCount;
                if (!r) return O().createElement(R.Fragment, null);
                r = Math.round(e / r * 100);
                return O().createElement("div", {
                    className: "server-player-count-gauge border"
                }, O().createElement("div", {
                    className: "gauge-inner-bar border",
                    style: {
                        width: "".concat(r, "%")
                    }
                }))
            }

            function ur(e) {
                e = e.player;
                return O().createElement("span", {
                    key: e.playerToken,
                    className: "avatar avatar-headshot-md player-avatar"
                }, null == e.id ? O().createElement(Q.Thumbnail2d, {
                    type: Q.ThumbnailTypes.avatarHeadshot,
                    token: e.playerToken,
                    containerClass: "avatar-card-image"
                }) : O().createElement(J.Link, {
                    className: "avatar-card-link",
                    href: ir(e.id)
                }, O().createElement(Q.Thumbnail2d, {
                    type: Q.ThumbnailTypes.avatarHeadshot,
                    targetId: e.id,
                    containerClass: "avatar-card-image",
                    altName: e.displayName
                })))
            }

            function dr(e) {
                var r = e.id,
                    t = e.translate,
                    n = e.cssKey,
                    a = e.serverListType,
                    i = e.placeId,
                    o = e.gameServerStatus,
                    s = e.canManagePlace,
                    l = e.name,
                    c = e.vipServerId,
                    u = e.vipServerSubscription,
                    d = e.accessCode,
                    m = e.showSlowGameMessage,
                    v = e.owner,
                    p = e.players,
                    f = e.onShutdownServerSuccess,
                    g = e.systemFeedbackService,
                    b = e.isLoading,
                    h = e.setIsLoading,
                    y = e.maxPlayers,
                    S = e.currentPlayersCount,
                    w = nr((0, R.useState)(u), 2),
                    I = w[0],
                    E = w[1],
                    P = (null == v ? void 0 : v.id) === C.authenticatedUser.id,
                    x = !!c,
                    T = x && !d,
                    A = (0, R.useContext)(tr);
                (0, R.useEffect)(function() {
                    E(u)
                }, [u]);
                var N = sr && 0 < sr ? null == p ? void 0 : p.slice(0, sr) : p,
                    e = 0 < c,
                    w = e && P,
                    e = w || null !== r && (!e && s || w),
                    w = 0 < S - N.length && "+".concat(S - N.length);
                return O().createElement("li", {
                    className: "rbx-".concat(n, "game-server-item col-md-3 col-sm-4 col-xs-6")
                }, O().createElement("div", {
                    className: "card-item"
                }, O().createElement("div", {
                    className: "player-thumbnails-container"
                }, N.map(function(e) {
                    return O().createElement(ur, {
                        key: e.playerToken,
                        player: e
                    })
                }), !!w && O().createElement("span", {
                    className: "avatar avatar-headshot-md player-avatar hidden-players-placeholder"
                }, w)), O().createElement("div", {
                    className: $()("rbx-".concat(n, "game-server-details"), "game-server-details", {
                        "border-right": a === lr.Vip.key
                    })
                }, (!!l || !!e) && O().createElement("div", {
                    className: "section-header"
                }, l && O().createElement("span", {
                    className: "font-bold"
                }, l), O().createElement(Pe, {
                    className: "link-menu rbx-".concat(n, "game-server-menu"),
                    translate: t,
                    placeId: i,
                    gameId: r,
                    vipServerId: c,
                    isOwner: P,
                    canManagePlace: s,
                    shutdownServer: function() {
                        b && g.warning(t(or.shutdownServerError)), h(!0), L.shutdownGameInstance(i, r, c).then(function() {
                            g.success(t(or.shutdownServerSuccess)), f()
                        }, function() {
                            g.warning(t(or.shutdownServerError))
                        }).finally(function() {
                            h(!1)
                        })
                    },
                    isLoading: b
                })), x && O().createElement(Ge, {
                    ownerUserId: v.id,
                    ownerName: v.displayName,
                    ownerHasVerifiedBadge: v.hasVerifiedBadge
                }), O().createElement("div", {
                    className: "text-info rbx-game-status rbx-".concat(n, "game-server-status text-overflow")
                }, o), O().createElement(cr, {
                    maxPlayerCount: y,
                    currentPlayerCount: S
                }), !x && O().createElement(Ve, {
                    translate: t,
                    players: p
                }), m && O().createElement("div", {
                    className: "rbx-".concat(n, "game-server-alert")
                }, O().createElement("span", {
                    className: "icon-remove"
                }), t(or.slowGameWarning)), x && O().createElement(Fe, {
                    privateServerId: c,
                    isPaymentCancelled: !(null != I && I.active) && 0 < (null == I ? void 0 : I.price),
                    isInsufficientFunds: null == I ? void 0 : I.hasInsufficientFunds,
                    isServerInactive: T,
                    canRenew: (null == I ? void 0 : I.canRenew) && !(null != I && I.active),
                    setSubscription: E,
                    isLoading: b,
                    systemFeedbackService: g
                }), !T && !(null != I && I.isExpired) && O().createElement("span", {
                    "data-placeid": i
                }, O().createElement(J.Button, {
                    className: "btn-full-width btn-control-xs rbx-".concat(n, "game-server-join game-server-join-btn"),
                    onClick: fe(i, {
                        instanceId: r,
                        accessCode: d
                    }, a),
                    isDisabled: b || A.disableJoinButtonForFullServers && y <= S
                }, t(or.joinServerText))))))
            }
            dr.defaultProps = {
                id: null,
                cssKey: "",
                serverListType: "",
                canManagePlace: !1,
                name: "",
                vipServerId: 0,
                accessCode: "",
                showSlowGameMessage: !1,
                owner: void 0,
                vipServerSubscription: void 0,
                players: [],
                maxPlayers: 0,
                currentPlayersCount: 0
            }, dr.propTypes = {
                id: d().string,
                translate: d().func.isRequired,
                cssKey: d().string,
                serverListType: d().string,
                placeId: d().number.isRequired,
                name: d().string,
                vipServerId: d().number,
                maxPlayers: d().number,
                currentPlayersCount: d().number,
                vipServerSubscription: {
                    canRenew: d().bool.isRequired,
                    active: d().bool.isRequired,
                    hasInsufficientFunds: d().bool.isRequired,
                    price: d().number.isRequired,
                    expired: d().bool.isRequired
                },
                accessCode: d().string,
                gameServerStatus: d().string.isRequired,
                canManagePlace: d().bool,
                showSlowGameMessage: d().bool,
                owner: {
                    id: d().number.isRequired,
                    name: d().string.isRequired,
                    displayName: d().string.isRequired,
                    hasVerifiedBadge: d().bool.isRequired
                },
                players: d().arrayOf(d().any),
                onShutdownServerSuccess: d().func.isRequired,
                isLoading: d().bool.isRequired,
                setIsLoading: d().func.isRequired,
                systemFeedbackService: d().shape({
                    success: d().func.isRequired,
                    warning: d().func.isRequired
                }).isRequired
            };
            var mr = dr,
                vr = function() {
                    return (vr = Object.assign || function(e) {
                        for (var r, t = 1, n = arguments.length; t < n; t++)
                            for (var a in r = arguments[t]) Object.prototype.hasOwnProperty.call(r, a) && (e[a] = r[a]);
                        return e
                    }).apply(this, arguments)
                },
                pr = l,
                fr = o,
                gr = (0, m.withTranslations)(function(e) {
                    var r = e.translate,
                        t = e.options,
                        n = e.setOptions,
                        e = void 0 !== (e = e.isLoading) && e;
                    return O().createElement("div", {
                        className: "server-list-options"
                    }, O().createElement("div", {
                        className: "select-group"
                    }, O().createElement("label", {
                        className: "select-label text-label",
                        htmlFor: "sort-select"
                    }, r(pr.numberOfPlayers) || "Number of Players"), O().createElement("div", {
                        className: "rbx-select-group select-group"
                    }, O().createElement("select", {
                        onChange: function(r) {
                            v.EventStream.SendEventWithTarget("serverListOptionsInteraction", "sortSelect", {
                                pid: pe(),
                                sort: r.currentTarget.value
                            }, v.EventStream.TargetTypes.WWW), n(function(e) {
                                return vr(vr({}, e), {
                                    sortOrder: r.currentTarget.value
                                })
                            })
                        },
                        onFocus: function() {
                            v.EventStream.SendEventWithTarget("serverListOptionsInteraction", "sortDropdown", {
                                pid: pe()
                            }, v.EventStream.TargetTypes.WWW)
                        },
                        disabled: e,
                        value: t.sortOrder,
                        id: "sort-select",
                        "data-testid": "sort-select",
                        className: "input-field rbx-select select-option"
                    }, O().createElement("option", {
                        value: fr.descending
                    }, r(pr.descending) || "Descending"), O().createElement("option", {
                        value: fr.ascending
                    }, r(pr.ascending) || "Ascending")), O().createElement("span", {
                        className: "icon-arrow icon-down-16x16"
                    }))), O().createElement("div", {
                        className: "checkbox"
                    }, O().createElement("input", {
                        onChange: function(r) {
                            v.EventStream.SendEventWithTarget("serverListOptionsInteraction", "filterSelect", {
                                pid: pe(),
                                checked: r.currentTarget.checked
                            }, v.EventStream.TargetTypes.WWW), n(function(e) {
                                return vr(vr({}, e), {
                                    excludeFullGames: r.currentTarget.checked
                                })
                            })
                        },
                        disabled: e,
                        type: "checkbox",
                        id: "filter-checkbox",
                        "data-testid": "filter-checkbox",
                        checked: t.excludeFullGames
                    }), O().createElement("label", {
                        className: "checkbox-label text-label",
                        htmlFor: "filter-checkbox"
                    }, r(pr.hideFullServers) || "Hide Full Servers")))
                }, W);

            function br() {
                return (br = Object.assign || function(e) {
                    for (var r = 1; r < arguments.length; r++) {
                        var t, n = arguments[r];
                        for (t in n) Object.prototype.hasOwnProperty.call(n, t) && (e[t] = n[t])
                    }
                    return e
                }).apply(this, arguments)
            }

            function hr(e, r) {
                return function(e) {
                    if (Array.isArray(e)) return e
                }(e) || function(e, r) {
                    if ("undefined" == typeof Symbol || !(Symbol.iterator in Object(e))) return;
                    var t = [],
                        n = !0,
                        a = !1,
                        i = void 0;
                    try {
                        for (var o, s = e[Symbol.iterator](); !(n = (o = s.next()).done) && (t.push(o.value), !r || t.length !== r); n = !0);
                    } catch (e) {
                        a = !0, i = e
                    } finally {
                        try {
                            n || null == s.return || s.return()
                        } finally {
                            if (a) throw i
                        }
                    }
                    return t
                }(e, r) || function(e, r) {
                    if (!e) return;
                    if ("string" == typeof e) return yr(e, r);
                    var t = Object.prototype.toString.call(e).slice(8, -1);
                    "Object" === t && e.constructor && (t = e.constructor.name);
                    if ("Map" === t || "Set" === t) return Array.from(e);
                    if ("Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)) return yr(e, r)
                }(e, r) || function() {
                    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
                }()
            }

            function yr(e, r) {
                (null == r || r > e.length) && (r = e.length);
                for (var t = 0, n = new Array(r); t < r; t++) n[t] = e[t];
                return n
            }
            var Sr = (o = hr((0, J.createSystemFeedback)(), 2))[0],
                wr = o[1],
                Ir = t,
                Er = l,
                Pr = a,
                xr = s;

            function Tr(e) {
                var d = e.translate,
                    r = e.headerTitle,
                    m = e.type,
                    v = e.placeId,
                    t = e.showLoadMoreButton,
                    n = e.gameInstances,
                    a = e.loadMoreGameInstances,
                    i = e.refreshGameInstances,
                    p = e.handleGameInstanceShutdownAtIndex,
                    f = e.userCanManagePlace,
                    o = e.loadingError,
                    g = e.isLoading,
                    b = e.setIsLoading,
                    h = m ? "".concat(m, "-") : "",
                    y = "rbx-".concat(h, "running-games"),
                    s = 0 === n.length,
                    l = "rbx-".concat(h, "game-server-item-container"),
                    c = "card-list rbx-".concat(h, "game-server-item-container"),
                    u = "rbx-".concat(h, "running-games-footer"),
                    S = (0, R.useMemo)(function() {
                        var e = n.length % Pr;
                        return 0 < e && t ? n.slice(0, -1 * e) : n
                    }, [n, t]),
                    e = hr((0, R.useState)(xr), 2),
                    w = e[0],
                    e = e[1];
                (0, R.useContext)(tr);
                return (0, R.useEffect)(function() {
                    null != i && i(w)
                }, [w]), O().createElement(R.Fragment, null, O().createElement(Sr, null), O().createElement("div", {
                    id: y,
                    className: "stack server-list-section",
                    "data-placeid": v,
                    "data-showshutdown": !0
                }, r && O().createElement("div", {
                    className: "container-header"
                }, O().createElement("div", {
                    className: "server-list-container-header"
                }, O().createElement("h2", {
                    className: "server-list-header"
                }, r), O().createElement(J.Button, {
                    size: J.Button.sizes.extraSmall,
                    variant: J.Button.variants.control,
                    className: "btn-more rbx-refresh refresh-link-icon",
                    onClick: function() {
                        return i(w)
                    },
                    isDisabled: g
                }, d(Er.privateServerRefreshText) || "Refresh")), "" === m && O().createElement(gr, {
                    translate: d,
                    isLoading: g,
                    options: w,
                    setOptions: e
                })), s ? O().createElement("div", {
                    className: "section-content-off empty-game-instances-container"
                }, g ? O().createElement(J.Loading, null) : O().createElement("p", {
                    className: "no-servers-message"
                }, o ? d(Er.loadServersError) || "Unable to load servers." : d(Er.noServersFoundText))) : O().createElement(R.Fragment, null, O().createElement("ul", {
                    id: l,
                    className: c
                }, S.map(function(e, r) {
                    var t = e.id,
                        n = e.playing,
                        a = e.maxPlayers,
                        i = e.pfs,
                        o = e.vipServerId,
                        s = e.vipServerSubscription,
                        l = e.accessCode,
                        c = e.name,
                        u = e.owner,
                        e = e.players;
                    return O().createElement(mr, br({
                        key: y
                    }, {
                        id: t,
                        translate: d,
                        cssKey: h,
                        serverListType: m,
                        placeId: v,
                        canManagePlace: f,
                        name: c,
                        vipServerId: o,
                        vipServerSubscription: s,
                        owner: u,
                        accessCode: l,
                        currentPlayersCount: n || e.length,
                        showSlowGameMessage: i < Ir,
                        gameServerStatus: d(Er.playerCountText, {
                            currentPlayers: n || e.length,
                            maximumAllowedPlayers: a
                        }),
                        players: e,
                        onShutdownServerSuccess: function() {
                            p(r)
                        },
                        systemFeedbackService: wr,
                        isLoading: g,
                        setIsLoading: b,
                        maxPlayers: a
                    }))
                })), O().createElement("div", {
                    className: u
                }, t && O().createElement(J.Button, {
                    type: "button",
                    onClick: function() {
                        return a(w)
                    },
                    className: "rbx-running-games-load-more",
                    variant: J.Button.variants.control,
                    width: J.Button.widths.full,
                    isDisabled: g
                }, d(Er.loadMoreButtonText))))))
            }
            Tr.defaultProps = {
                type: "",
                showLoadMoreButton: !1,
                loadMoreButtonText: "",
                headerTitle: "",
                gameInstances: []
            }, Tr.propTypes = {
                translate: d().func.isRequired,
                type: d().string,
                placeId: d().number.isRequired,
                headerTitle: d().string,
                loadMoreGameInstances: d().func.isRequired,
                showLoadMoreButton: d().bool,
                loadMoreButtonText: d().string,
                gameInstances: d().arrayOf(d().any),
                refreshGameInstances: d().func.isRequired,
                handleGameInstanceShutdownAtIndex: d().func.isRequired,
                userCanManagePlace: d().bool.isRequired,
                isLoading: d().bool.isRequired,
                setIsLoading: d().func.isRequired,
                loadingError: d().bool.isRequired
            };
            var Ar = (0, m.withTranslations)(Tr, W);

            function Nr(e) {
                var r = e.type,
                    t = e.translate,
                    n = e.headerTitleResource,
                    a = e.getGameServers,
                    i = H(a),
                    o = i.servers,
                    s = i.loadMoreServers,
                    l = i.refreshServers,
                    c = i.removeServerAtIndex,
                    u = i.hasNext,
                    d = i.isBusy,
                    m = i.setIsBusy,
                    e = i.hasError,
                    a = i.metaData,
                    i = a.placeId,
                    a = a.userCanManagePlace;
                return O().createElement(Ar, {
                    type: r,
                    placeId: i,
                    gameInstances: o,
                    headerTitle: t(n),
                    showLoadMoreButton: u,
                    loadMoreGameInstances: s,
                    refreshGameInstances: l,
                    handleGameInstanceShutdownAtIndex: c,
                    userCanManagePlace: a,
                    isLoading: d,
                    setIsLoading: m,
                    loadingError: e
                })
            }
            Nr.defaultProps = {
                type: ""
            }, Nr.propTypes = {
                type: d().string,
                translate: d().func.isRequired,
                headerTitleResource: d().string.isRequired,
                getGameServers: d().func.isRequired
            };
            var Rr = (0, m.withTranslations)(Nr, W);

            function Or(e, r) {
                (null == r || r > e.length) && (r = e.length);
                for (var t = 0, n = new Array(r); t < r; t++) n[t] = e[t];
                return n
            }
            var a = (0, J.createModal)(),
                Cr = (W = (s = 2, function(e) {
                    if (Array.isArray(e)) return e
                }(a = a) || function(e, r) {
                    if ("undefined" == typeof Symbol || !(Symbol.iterator in Object(e))) return;
                    var t = [],
                        n = !0,
                        a = !1,
                        i = void 0;
                    try {
                        for (var o, s = e[Symbol.iterator](); !(n = (o = s.next()).done) && (t.push(o.value), !r || t.length !== r); n = !0);
                    } catch (e) {
                        a = !0, i = e
                    } finally {
                        try {
                            n || null == s.return || s.return()
                        } finally {
                            if (a) throw i
                        }
                    }
                    return t
                }(a, s) || function(e, r) {
                    if (!e) return;
                    if ("string" == typeof e) return Or(e, r);
                    var t = Object.prototype.toString.call(e).slice(8, -1);
                    "Object" === t && e.constructor && (t = e.constructor.name);
                    if ("Map" === t || "Set" === t) return Array.from(e);
                    if ("Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)) return Or(e, r)
                }(a, s) || function() {
                    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
                }()))[0],
                s = W[1],
                Lr = l,
                Dr = n;

            function jr() {
                return (jr = Object.assign || function(e) {
                    for (var r = 1; r < arguments.length; r++) {
                        var t, n = arguments[r];
                        for (t in n) Object.prototype.hasOwnProperty.call(n, t) && (e[t] = n[t])
                    }
                    return e
                }).apply(this, arguments)
            }

            function Fr(e, r) {
                return function(e) {
                    if (Array.isArray(e)) return e
                }(e) || function(e, r) {
                    if ("undefined" == typeof Symbol || !(Symbol.iterator in Object(e))) return;
                    var t = [],
                        n = !0,
                        a = !1,
                        i = void 0;
                    try {
                        for (var o, s = e[Symbol.iterator](); !(n = (o = s.next()).done) && (t.push(o.value), !r || t.length !== r); n = !0);
                    } catch (e) {
                        a = !0, i = e
                    } finally {
                        try {
                            n || null == s.return || s.return()
                        } finally {
                            if (a) throw i
                        }
                    }
                    return t
                }(e, r) || function(e, r) {
                    if (!e) return;
                    if ("string" == typeof e) return kr(e, r);
                    var t = Object.prototype.toString.call(e).slice(8, -1);
                    "Object" === t && e.constructor && (t = e.constructor.name);
                    if ("Map" === t || "Set" === t) return Array.from(e);
                    if ("Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)) return kr(e, r)
                }(e, r) || function() {
                    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
                }()
            }

            function kr(e, r) {
                (null == r || r > e.length) && (r = e.length);
                for (var t = 0, n = new Array(r); t < r; t++) n[t] = e[t];
                return n
            }
            var qr = l,
                n = (W = Fr((Mr.defaultProps = {
                    serverName: "",
                    createServerError: !1,
                    loading: !1
                }, Mr.propTypes = {
                    translate: d().func.isRequired,
                    privateServerTranslate: d().func.isRequired,
                    thumbnail: d().node.isRequired,
                    assetName: d().string.isRequired,
                    expectedPrice: d().number.isRequired,
                    serverName: d().string,
                    onAction: d().func.isRequired,
                    onServerNameChange: d().func.isRequired,
                    createServerError: d().bool,
                    loading: d().bool,
                    clearForm: d().func.isRequired
                }, [(0, m.withTranslations)(Mr, z), s]), 2))[0],
                W = W[1];

            function Mr(e) {
                var r = e.translate,
                    t = e.privateServerTranslate,
                    n = e.assetName,
                    a = e.expectedPrice,
                    i = e.thumbnail,
                    o = e.serverName,
                    s = e.onAction,
                    l = e.onServerNameChange,
                    c = e.clearForm,
                    u = e.loading,
                    e = O().createElement("span", {
                        className: "purchase-private-server-modal-footer-text"
                    }, O().createElement(Te.BalanceAfterSaleText, {
                        expectedPrice: a
                    }), " ", t(Lr.createServerFooterDescription) || "This is a subscription-based feature. It will auto-renew once a month until you cancel the subscription."),
                    i = O().createElement("div", {
                        className: "private-server-purchase"
                    }, O().createElement("div", {
                        className: "modal-list-item private-server-main-text",
                        dangerouslySetInnerHTML: {
                            __html: t(Lr.createPrivateServerPriceText, {
                                target: (0, xe.renderToString)(O().createElement(Te.PriceLabel, {
                                    price: a
                                }))
                            })
                        }
                    }), O().createElement("div", {
                        className: "modal-list-item"
                    }, O().createElement("span", {
                        className: "text-label private-server-game-name"
                    }, t(Lr.gameNameText)), O().createElement("span", {
                        className: "game-name"
                    }, n)), O().createElement("div", {
                        className: "modal-list-item private-server-name-input"
                    }, O().createElement("span", {
                        className: "text-label"
                    }, t(Lr.serverNameText)), O().createElement("div", {
                        className: "form-group form-has-feedback"
                    }, O().createElement("input", {
                        type: "text",
                        value: o,
                        onChange: l,
                        maxLength: Dr,
                        className: "form-control input-field private-server-name",
                        id: "private-server-name-text-box"
                    }), 0 < o.length && O().createElement("p", {
                        className: "form-control-label text-secondary"
                    }, o.length, "/", Dr))), O().createElement("div", {
                        className: "modal-image-container"
                    }, i));
                return O().createElement(Cr, {
                    id: "purchase-private-server-modal",
                    title: t(Lr.createPrivateServerTitle),
                    body: i,
                    actionButtonText: r(Lr.buyNowText),
                    neutralButtonText: r(Lr.cancelAction),
                    footerText: e,
                    onAction: s,
                    onNeutral: c,
                    loading: u,
                    actionButtonShow: !0,
                    disableActionButton: 0 === o.length
                })
            }
            var Gr = (W = Fr((0, Te.createItemPurchase)({
                    customPurchaseVerificationModal: n,
                    customPurchaseVerificationModalService: W
                }), 2))[0],
                Br = W[1],
                Ur = A;

            function Hr(e) {
                var r = e.privateServerTranslate,
                    i = e.translate,
                    o = e.refreshServers,
                    s = e.universeId,
                    l = e.price,
                    t = e.placeName,
                    n = e.canCreatePrivateServer,
                    a = e.productId,
                    c = e.currency,
                    u = e.sellerId,
                    d = e.sellerName,
                    e = Fr((0, R.useState)(""), 2),
                    m = e[0],
                    v = e[1];
                Ur().gameDetailPreopenCreatePrivateServerModal && Br.start();

                function p() {
                    return v(""), !0
                }
                e = O().createElement(Q.Thumbnail2d, {
                    type: Q.ThumbnailTypes.gameIcon,
                    size: Q.DefaultThumbnailSize,
                    targetId: s,
                    containerClass: "modal-thumb",
                    imgClassName: "original-image",
                    format: Q.ThumbnailFormat.jpeg
                });
                return O().createElement("span", {
                    className: "rbx-private-server-create"
                }, O().createElement(J.Button, {
                    className: "btn-more rbx-private-server-create-button",
                    size: J.Button.sizes.medium,
                    variant: J.Button.variants.secondary,
                    onClick: Br.start,
                    isDisabled: !n
                }, r(qr.createPrivateServerTitle)), O().createElement(Gr, jr({
                    productId: a,
                    expectedPrice: l,
                    thumbnail: e,
                    assetName: t,
                    assetType: r(qr.privateServerLabel),
                    sellerName: d,
                    expectedCurrency: c,
                    expectedSellerId: u,
                    handlePurchase: function(e) {
                        var r = e.handleError,
                            t = e.setLoading,
                            n = e.openConfirmation,
                            a = e.closeAll;
                        t(!0), L.createPrivateServer(s, m, l).then(function(e) {
                            e = e.data;
                            t(!1), a();
                            var r = e.vipServerId;
                            n({
                                transactionVerb: Te.TransactionVerb.Bought,
                                onAccept: function() {
                                    window.location.href = g(r)
                                },
                                onDecline: function() {
                                    return o(), p(), !0
                                }
                            })
                        }, function(e) {
                            var e = e.data;
                            t(!1), a();
                            e = null !== (e = null === (e = e.errors) || void 0 === e ? void 0 : e[0].userFacingMessage) && void 0 !== e ? e : i(qr.purchaseError);
                            r({
                                showDivId: Te.errorTypeIds.transactionFailure,
                                title: i(qr.transactionFailedHeading),
                                errorMsg: e,
                                onDecline: function() {
                                    return o(), !0
                                }
                            })
                        })
                    },
                    customProps: {
                        privateServerTranslate: r,
                        serverName: m,
                        onServerNameChange: function(e) {
                            e = e.target.value;
                            return v(e)
                        },
                        clearForm: p
                    }
                }, {
                    isPrivateServer: !0
                })), !n && O().createElement("span", {
                    className: "text-footer rbx-private-server-create-disabled-text"
                }, i(qr.maxFreePrivateServersText)))
            }
            Hr.defaultProps = {
                canCreatePrivateServer: !0,
                currency: 1
            }, Hr.propTypes = {
                translate: d().func.isRequired,
                privateServerTranslate: d().func.isRequired,
                refreshServers: d().func.isRequired,
                universeId: d().number.isRequired,
                price: d().number.isRequired,
                placeName: d().string.isRequired,
                canCreatePrivateServer: d().bool,
                currency: d().number,
                productId: d().number.isRequired,
                sellerId: d().number.isRequired,
                sellerName: d().string.isRequired
            };
            var Wr = (0, m.withTranslations)(Hr, _);

            function Vr() {
                return (Vr = Object.assign || function(e) {
                    for (var r = 1; r < arguments.length; r++) {
                        var t, n = arguments[r];
                        for (t in n) Object.prototype.hasOwnProperty.call(n, t) && (e[t] = n[t])
                    }
                    return e
                }).apply(this, arguments)
            }

            function zr(e, r, t, n, a, i, o) {
                try {
                    var s = e[i](o),
                        l = s.value
                } catch (e) {
                    return void t(e)
                }
                s.done ? r(l) : Promise.resolve(l).then(n, a)
            }

            function _r(e, r) {
                return function(e) {
                    if (Array.isArray(e)) return e
                }(e) || function(e, r) {
                    if ("undefined" == typeof Symbol || !(Symbol.iterator in Object(e))) return;
                    var t = [],
                        n = !0,
                        a = !1,
                        i = void 0;
                    try {
                        for (var o, s = e[Symbol.iterator](); !(n = (o = s.next()).done) && (t.push(o.value), !r || t.length !== r); n = !0);
                    } catch (e) {
                        a = !0, i = e
                    } finally {
                        try {
                            n || null == s.return || s.return()
                        } finally {
                            if (a) throw i
                        }
                    }
                    return t
                }(e, r) || function(e, r) {
                    if (!e) return;
                    if ("string" == typeof e) return Jr(e, r);
                    var t = Object.prototype.toString.call(e).slice(8, -1);
                    "Object" === t && e.constructor && (t = e.constructor.name);
                    if ("Map" === t || "Set" === t) return Array.from(e);
                    if ("Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)) return Jr(e, r)
                }(e, r) || function() {
                    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
                }()
            }

            function Jr(e, r) {
                (null == r || r > e.length) && (r = e.length);
                for (var t = 0, n = new Array(r); t < r; t++) n[t] = e[t];
                return n
            }
            var Kr = l,
                $r = i,
                Qr = ae,
                Xr = ne;

            function Yr(e) {
                var r, t = e.translate,
                    n = e.showServers,
                    a = e.intl,
                    i = e.isAboutTab,
                    o = H(L.getVipGameInstances, n),
                    s = o.servers,
                    l = o.loadMoreServers,
                    c = o.refreshServers,
                    u = o.clearServerAtIndex,
                    d = o.hasNext,
                    m = o.isBusy,
                    v = o.setIsBusy,
                    p = o.hasError,
                    f = o.metaData,
                    g = f.universeId,
                    b = f.placeId,
                    h = f.placeName,
                    y = f.canCreateServer,
                    S = f.price,
                    w = f.userCanManagePlace,
                    I = f.sellerId,
                    E = f.sellerName,
                    P = f.privateServerProductId,
                    x = (T = s, r = be().gameDetailPrivateServerLimit, T.forEach(function(e) {
                        e.owner.id === C.authenticatedUser.id && --r
                    }), 0 < r),
                    e = 0 !== P,
                    o = '<a class="text-link" href="#!/game-instances">'.concat(t(Kr.serversText), "</a>"),
                    f = '<a class="text-link" href="'.concat(N(a.getRobloxLocale()), '">').concat(t(Kr.privateServerHeader), "</a>"),
                    T = _r((0, R.useState)(null), 2),
                    a = T[0],
                    A = T[1];
                return (0, R.useEffect)(function() {
                    var s;
                    i && (s = regeneratorRuntime.mark(function e() {
                        var r;
                        return regeneratorRuntime.wrap(function(e) {
                            for (;;) switch (e.prev = e.next) {
                                case 0:
                                    return e.next = 2, Xe(Qr.gameDetails, Xr.gameDetails);
                                case 2:
                                    r = e.sent, r = !(null == r || !r.ShouldHidePrivateServersInAboutTab), A(r);
                                case 5:
                                case "end":
                                    return e.stop()
                            }
                        }, e)
                    }), function() {
                        var e = this,
                            o = arguments;
                        new Promise(function(r, t) {
                            var n = s.apply(e, o);

                            function a(e) {
                                zr(n, r, t, a, i, "next", e)
                            }

                            function i(e) {
                                zr(n, r, t, a, i, "throw", e)
                            }
                            a(void 0)
                        })
                    }())
                }, [i]), a && i && !e ? null : O().createElement("div", {
                    id: "rbx-private-servers",
                    className: "stack"
                }, O().createElement("div", {
                    className: "container-header"
                }, O().createElement("h2", null, t(Kr.privateServerHeader)), n && e && O().createElement(J.Button, {
                    size: J.Button.sizes.extraSmall,
                    variant: J.Button.variants.control,
                    className: "btn-more rbx-refresh refresh-link-icon",
                    onClick: function() {
                        return c()
                    },
                    isDisabled: m
                }, t(Kr.privateServerRefreshText)), O().createElement(J.Tooltip, {
                    id: "private-server-tooltip",
                    placement: "bottom",
                    content: t(Kr.privateServerTooltip)
                }, O().createElement("span", {
                    className: "icon-moreinfo"
                }))), e ? O().createElement(R.Fragment, null, O().createElement("div", {
                    className: "create-server-banner section-content remove-panel"
                }, O().createElement("div", {
                    className: "create-server-banner-text text"
                }, y && O().createElement("span", {
                    className: "private-server-price",
                    dangerouslySetInnerHTML: {
                        __html: t(Kr.privateServerPrice, {
                            price: (0, xe.renderToString)(O().createElement(Te.PriceLabel, {
                                price: S
                            }))
                        })
                    }
                }), O().createElement("span", {
                    className: "play-with-others-text"
                }, t(Kr.privateServerPlayWithOthers), O().createElement("br", null), !n && O().createElement("span", {
                    dangerouslySetInnerHTML: {
                        __html: t(Kr.seeAllPrivateServersText, {
                            serversLink: o
                        })
                    }
                }))), y && O().createElement(Wr, Vr({
                    privateServerTranslate: t,
                    refreshServers: c
                }, {
                    placeName: h,
                    universeId: g,
                    price: S,
                    canCreatePrivateServer: x,
                    sellerId: I,
                    sellerName: E,
                    productId: P
                }))), O().createElement("div", {
                    className: "section tab-server-only"
                }, n && O().createElement(Ar, {
                    type: $r.Vip.key,
                    placeId: b,
                    gameInstances: s,
                    showLoadMoreButton: d,
                    loadMoreGameInstances: l,
                    handleGameInstanceShutdownAtIndex: u,
                    userCanManagePlace: w,
                    isLoading: m,
                    setIsLoading: v,
                    loadingError: p
                }))) : O().createElement("div", {
                    className: "section-content-off",
                    dangerouslySetInnerHTML: {
                        __html: t(Kr.privateServersNotSupported, {
                            vipServersLink: f
                        })
                    }
                }))
            }
            Yr.defaultProps = {
                showServers: !0,
                isAboutTab: !1
            }, Yr.propTypes = {
                translate: d().func.isRequired,
                showServers: d().bool,
                intl: d().shape({
                    getRobloxLocale: d().func.isRequired
                }).isRequired,
                isAboutTab: d().bool
            };
            var Zr = (0, m.withTranslations)(Yr, V),
                et = (V = {
                    gameDetailTabs: V = {
                        about: "tab-about",
                        store: "tab-store",
                        servers: "tab-game-instances"
                    },
                    gameDetailHashesToTabs: {
                        "#!/about": V.about,
                        "#!/store": V.store,
                        "#!/game-instances": V.servers
                    }
                }).gameDetailTabs;

            function rt(e, r) {
                return function(e) {
                    if (Array.isArray(e)) return e
                }(e) || function(e, r) {
                    if ("undefined" == typeof Symbol || !(Symbol.iterator in Object(e))) return;
                    var t = [],
                        n = !0,
                        a = !1,
                        i = void 0;
                    try {
                        for (var o, s = e[Symbol.iterator](); !(n = (o = s.next()).done) && (t.push(o.value), !r || t.length !== r); n = !0);
                    } catch (e) {
                        a = !0, i = e
                    } finally {
                        try {
                            n || null == s.return || s.return()
                        } finally {
                            if (a) throw i
                        }
                    }
                    return t
                }(e, r) || function(e, r) {
                    if (!e) return;
                    if ("string" == typeof e) return tt(e, r);
                    var t = Object.prototype.toString.call(e).slice(8, -1);
                    "Object" === t && e.constructor && (t = e.constructor.name);
                    if ("Map" === t || "Set" === t) return Array.from(e);
                    if ("Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)) return tt(e, r)
                }(e, r) || function() {
                    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
                }()
            }

            function tt(e, r) {
                (null == r || r > e.length) && (r = e.length);
                for (var t = 0, n = new Array(r); t < r; t++) n[t] = e[t];
                return n
            }

            function nt() {
                if (!ot()) return null;
                var e = it[window.location.hash];
                return e || at.about
            }
            var at = V.gameDetailTabs,
                it = V.gameDetailHashesToTabs,
                ot = function() {
                    var r = document.getElementById("horizontal-tabs");
                    if (r) {
                        var e = Object.values(et);
                        try {
                            e.forEach(function(e) {
                                if (!r.querySelector("#".concat(e))) throw new Error("Unable to find horizontal tab with id ".concat(e))
                            })
                        } catch (e) {
                            return console.log(e.message), !1
                        }
                        return !0
                    }
                    return !1
                },
                st = function() {
                    function e() {
                        n(nt())
                    }
                    var r = rt((0, R.useState)(nt()), 2),
                        t = r[0],
                        n = r[1];
                    return (0, R.useEffect)(function() {
                        return window.addEventListener("hashchange", e),
                            function() {
                                window.removeEventListener("hashchange", e)
                            }
                    }, []), t
                };

            function lt(e, r) {
                return function(e) {
                    if (Array.isArray(e)) return e
                }(e) || function(e, r) {
                    if ("undefined" == typeof Symbol || !(Symbol.iterator in Object(e))) return;
                    var t = [],
                        n = !0,
                        a = !1,
                        i = void 0;
                    try {
                        for (var o, s = e[Symbol.iterator](); !(n = (o = s.next()).done) && (t.push(o.value), !r || t.length !== r); n = !0);
                    } catch (e) {
                        a = !0, i = e
                    } finally {
                        try {
                            n || null == s.return || s.return()
                        } finally {
                            if (a) throw i
                        }
                    }
                    return t
                }(e, r) || function(e, r) {
                    if (!e) return;
                    if ("string" == typeof e) return ct(e, r);
                    var t = Object.prototype.toString.call(e).slice(8, -1);
                    "Object" === t && e.constructor && (t = e.constructor.name);
                    if ("Map" === t || "Set" === t) return Array.from(e);
                    if ("Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)) return ct(e, r)
                }(e, r) || function() {
                    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
                }()
            }

            function ct(e, r) {
                (null == r || r > e.length) && (r = e.length);
                for (var t = 0, n = new Array(r); t < r; t++) n[t] = e[t];
                return n
            }
            var ut = i,
                dt = l,
                mt = V.gameDetailTabs;

            function vt() {
                var e = lt((0, R.useState)(!1), 2),
                    r = e[0],
                    t = e[1],
                    n = st();
                return (0, R.useEffect)(function() {
                    r || n === mt.servers && t(!0)
                }, [n, r]), n && !r ? O().createElement(R.Fragment, null) : O().createElement(Je, null, O().createElement(Zr, null), O().createElement(Rr, {
                    type: ut.friend.key,
                    getGameServers: L.getFriendsGameInstances,
                    headerTitleResource: dt.friendsServersTitle
                }), O().createElement(Rr, {
                    getGameServers: L.getPublicGameInstances,
                    headerTitleResource: dt.publicServersTitle
                }))
            }
            vt.propTypes = {};
            var pt = vt;

            function ft(e, r) {
                return function(e) {
                    if (Array.isArray(e)) return e
                }(e) || function(e, r) {
                    if ("undefined" == typeof Symbol || !(Symbol.iterator in Object(e))) return;
                    var t = [],
                        n = !0,
                        a = !1,
                        i = void 0;
                    try {
                        for (var o, s = e[Symbol.iterator](); !(n = (o = s.next()).done) && (t.push(o.value), !r || t.length !== r); n = !0);
                    } catch (e) {
                        a = !0, i = e
                    } finally {
                        try {
                            n || null == s.return || s.return()
                        } finally {
                            if (a) throw i
                        }
                    }
                    return t
                }(e, r) || function(e, r) {
                    if (!e) return;
                    if ("string" == typeof e) return gt(e, r);
                    var t = Object.prototype.toString.call(e).slice(8, -1);
                    "Object" === t && e.constructor && (t = e.constructor.name);
                    if ("Map" === t || "Set" === t) return Array.from(e);
                    if ("Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)) return gt(e, r)
                }(e, r) || function() {
                    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
                }()
            }

            function gt(e, r) {
                (null == r || r > e.length) && (r = e.length);
                for (var t = 0, n = new Array(r); t < r; t++) n[t] = e[t];
                return n
            }
            var bt = "running-game-instances-container",
                ht = "private-server-container-about-tab";
            (0, u.ready)(function() {
                document.getElementById(bt) && (0, e.render)(O().createElement(pt, null), document.getElementById(bt)), document.getElementById(ht) && ((0, e.render)(O().createElement(Zr, {
                    showServers: !1,
                    isAboutTab: !0
                }), document.getElementById(ht)))
            })
        }()
}();
//# sourceMappingURL=https://js.rbxcdn.com/bc0da79040f56473350f13001724291f-serverList.bundle.min.js.map

/* Bundle detector */
window.Roblox && window.Roblox.BundleDetector && window.Roblox.BundleDetector.bundleDetected("ServerList");