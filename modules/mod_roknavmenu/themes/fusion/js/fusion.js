/**
 * @version   1.13 July 2, 2012
 * @author    RocketTheme http://www.rockettheme.com
 * @copyright Copyright (C) 2007 - 2012 RocketTheme, LLC
 * @license   http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 only
 */

var Fusion = new Class({
    Implements: [Options],
    version: "1.9.8",
    options: {
        centered: false,
        tweakInitial: {
            x: 0,
            y: 0
        },
        tweakSubsequent: {
            x: 0,
            y: 0
        },
        tweakSizes: {
            width: 0,
            height: 0
        },
        pill: true,
        direction: {
            x: "right",
            y: "down"
        },
        effect: "slide and fade",
        orientation: "horizontal",
        opacity: 1,
        hideDelay: 50000,
        menuFx: {
            duration: 500,
            transition: "quad:out"
        },
        pillFx: {
            duration: 400,
            transition: "back:out"
        }
    },
    initialize: function(f, k) {
        this.element = $$(f)[0];
        this.id = $$(".fusion")[0];
        if (this.id) {
            this.id = this.id.id;
        } else {
            this.id = "";
        }
        this.setOptions(k);
        var h = this.element.getElements(".item"),
            a = this.options;
        this.rtl = document.id(document.body).getStyle("direction") == "rtl";
        this.options.tweakSubsequent.x -= this.options.tweakSizes.width / 2;
        this.options.tweakSubsequent.y -= this.options.tweakSizes.height / 2;
        if (this.rtl) {
            this.options.direction.x = "left";
            this.options.tweakInitial.x *= -1;
            this.options.tweakSubsequent.x *= -1;
        }
        if (this.options.pill) {
            var d = new Element("div", {
                    "class": "fusion-pill-l"
                }).inject(this.element, "after").setStyle("display", "none"),
                j = this;
            new Element("div", {
                "class": "fusion-pill-r"
            }).inject(d);
            this.pillsRoots = this.element.getElements(".root");
            var c = this.element.getElement(".active");
            this.pillsMargins = d.getStyle("margin-left").toInt() + d.getStyle("margin-right").toInt();
            this.pillsTopMargins = d.getStyle("margin-top").toInt() + d.getStyle("margin-bottom").toInt();
            if (!c) {
                this.options.pill = false;
            } else {
                d.setStyle("display", "block");
                this.pillsDefaults = {
                    left: c.offsetLeft,
                    width: c.offsetWidth - this.pillsMargins,
                    top: c.offsetTop
                };
                this.pillFx = new Fx.Morph(d, {
                    duration: a.pillFx.duration,
                    transition: a.pillFx.transition,
                    link: "cancel"
                }).set(this.pillsDefaults);
                var b = this.pillsRoots.filter(function(l) {
                    return !l.hasClass("parent");
                });
                $$(b).addEvents({
                    mouseenter: function() {
                        j.ghostRequest = true;
                        j.pillFx.start({
                            left: this.offsetLeft,
                            width: this.offsetWidth - j.pillsMargins,
                            top: this.offsetTop
                        });
                    },
                    mouseleave: function() {
                        j.ghostRequest = false;
                        j.pillFx.start(j.pillsDefaults);
                    }
                });
            }
        }
        this.parentLinks = {};
        this.parentSubMenus = {};
        this.childMenu = {};
        this.menuType = {};
        this.subMenus = [];
        this.hideAllMenusTimeout = null;
        this.subMenuZindex = 1;
        h.each(function(o, m) {
            o.getCustomID();
            this.parentLinks[o.id] = o.getParent().getParents("li").getElement(".item");
            this.childMenu[o.id] = o.getNext(".fusion-submenu-wrapper") || o.getNext("ul") || o.getNext("ol");
            if (this.childMenu[o.id]) {
                o.fusionSize = this.childMenu[o.id].getCoordinates();
            }
            if (this.childMenu[o.id] && Browser.Engine.trident) {
                var l = this.childMenu[o.id].getElement("ul");
                if (l) {
                    var p = l.getStyle("padding-bottom").toInt() || 0;
                    o.fusionSize.height += p;
                }
            }
            var n = "subseq";
            if (document.id(o.getParent(".fusion-submenu-wrapper") || o.getParent("ul") || o.getParent("ol")) === this.element) {
                n = "init";
            }
            this.menuType[o.id] = n;
        }, this);
        this.jsContainer = new Element("div", {
            "class": "fusion-js-container menutop"
        }).inject(document.body);
        this.jsContainer.addEvents({
            mouseenter: function() {
                window.RTFUSION = true;
            },
            mouseleave: function() {
                window.RTFUSION = false;
            }
        });
        var i = this.element.className.replace("menutop", "");
        if (this.id.length) {
            this.jsContainer.id = this.id;
        }
        if (i.length) {
            var g = "fusion-js-container " + i + " menutop";
            this.jsContainer.className = g.clean();
        }
        var e = this.element.getElements(".fusion-submenu-wrapper");
        if (!e.length) {
            e = this.element.getElements("ul");
        }
        e.each(function(m, l) {
            var n = m.getElements(".item")[l];
            if (n && this.parentLinks[n.id].length == 1) {
                n = this.parentLinks[n.id].getLast().getParents("li")[0];
            }
            var o = new Element("div", {
                "class": "fusion-js-subs"
            }).inject(this.jsContainer).adopt(m);
            if (n && n.hasClass("active")) {
                m.getParent().addClass("active");
            }
        }, this);
        this.jsContainer.getElements(".item").setProperty("tabindex", "-1");
        h.each(function(o, m) {
            if (!this.childMenu[o.id]) {
                return;
            }
            this.childMenu[o.id] = this.childMenu[o.id].getParent("div");
            this.subMenus.include(this.childMenu[o.id]);
            var l = [];
            this.parentLinks[o.id].each(function(q, p) {
                l.push(this.childMenu[q.id]);
            }, this);
            this.parentSubMenus[o.id] = l;
            var n = new FusionSubMenu(this.options, this, o);
        }, this);
    }
});
var FusionSubMenu = new Class({
    Implements: [Options],
    options: {
        onSubMenuInit_begin: (function(a) {}),
        onSubMenuInit_complete: (function(a) {}),
        onMatchWidth_begin: (function(a) {}),
        onMatchWidth_complete: (function(a) {}),
        onHideSubMenu_begin: (function(a) {}),
        onHideSubMenu_complete: (function(a) {}),
        onHideOtherSubMenus_begin: (function(a) {}),
        onHideOtherSubMenus_complete: (function(a) {}),
        onHideAllSubMenus_begin: (function(a) {}),
        onHideAllSubMenus_complete: (function(a) {}),
        onPositionSubMenu_begin: (function(a) {}),
        onPositionSubMenu_complete: (function(a) {}),
        onShowSubMenu_begin: (function(a) {}),
        onShowSubMenu_complete: (function(a) {})
    },
    root: null,
    btn: null,
    hidden: true,
    myEffect: null,
    initialize: function(b, a, c) {
        this.setOptions(b);
        this.root = a;
        this.btn = document.id(c);
        this.childMenu = document.id(a.childMenu[c.id]);
        this.subMenuType = a.menuType[c.id];
        this.parentSubMenus = $$(a.parentSubMenus[c.id]);
        this.parentLinks = $$(a.parentLinks[c.id]);
        this.parentSubMenu = document.id(this.parentSubMenus[0]);
        this.otherSubMenus = {};
        this.fxMorph = {};
        this.rtl = a.rtl;
        this.options.tweakInitial = this.root.options.tweakInitial;
        this.options.tweakSubsequent = this.root.options.tweakSubsequent;
        this.options.centered = this.root.options.centered;
        this.childMenu.fusionStatus = "closed";
        this.options.onSubMenuInit_begin(this);
        this.childMenu.addEvent("hide", this.hideSubMenu.bind(this));
        this.childMenu.addEvent("show", this.showSubMenu.bind(this));
        var e = this.childMenu;
        if (this.options.effect) {
            this.myEffect = new Fx.Morph(this.childMenu.getFirst(), {
                duration: this.options.menuFx.duration,
                transition: this.options.menuFx.transition,
                link: "cancel",
                onStart: function() {
                    this.element.setStyle("display", "block");
                },
                onComplete: function() {
                    if (e.fusionStatus == "closed") {
                        if (!Browser.Engine.trident) {
                            e.setStyle("display", "none");
                        } else {
                            this.element.setStyle("display", "none");
                        }
                    }
                }
            });
        }
        if (this.options.effect == "slide" || this.options.effect == "slide and fade") {
            if (this.subMenuType == "init" && this.options.orientation == "horizontal") {
                this.myEffect.set({
                    "margin-top": "0"
                });
            } else {
                if (!this.rtl) {
                    this.myEffect.set({
                        "margin-left": "0"
                    });
                } else {
                    this.myEffect.set({
                        "margin-right": "0"
                    });
                }
            }
        } else {
            if (this.options.effect == "fade" || this.options.effect == "slide and fade") {
                this.myEffect.set({
                    opacity: 0
                });
            }
        }
        if (this.options.effect != "fade" && this.options.effect != "slide and fade") {
            this.myEffect.set({
                opacity: this.options.opacity
            });
        }
        var d = document.id(this.childMenu).getElements(".item").filter(function(g, f) {
            return !a.childMenu[g.id];
        });
        d.each(function(i, f) {
            document.id(i).getParent().addClass("f-submenu-item");
            var h = i.getParent();
            var g = i.getParents("li").length;
            if (g < 2 && !h.hasClass("fusion-grouped")) {
                h.addEvents({
                    mouseenter: function(j) {
                        this.childMenu.fireEvent("show");
                        this.cancellHideAllSubMenus();
                        this.hideOtherSubMenus();
                    }.bind(this),
                    focus: function(j) {
                        this.childMenu.fireEvent("show");
                        this.cancellHideAllSubMenus();
                        this.hideOtherSubMenus();
                    }.bind(this),
                    mouseleave: function(j) {
                        this.cancellHideAllSubMenus();
                        this.hideAllSubMenus();
                    }.bind(this),
                    blur: function(j) {
                        this.cancellHideAllSubMenus();
                        this.hideAllSubMenus();
                    }.bind(this)
                });
            } else {
                h.addEvents({
                    mouseenter: function(j) {
                        this.childMenu.fireEvent("show");
                        this.cancellHideAllSubMenus();
                        if (!h.hasClass("fusion-grouped")) {
                            this.hideOtherSubMenus();
                        }
                    }.bind(this),
                    mouseleave: function(j) {}.bind(this)
                });
            }
        }, this);
        this.btn.removeClass("fusion-submenu-item");
        if (this.subMenuType == "init") {
            this.btn.getParent().addClass("f-main-parent");
        } else {
            this.btn.getParent().addClass("f-parent-item");
        }
        this.btn.getParent().addEvents({
            mouseenter: function(f) {
                this.cancellHideAllSubMenus();
                this.hideOtherSubMenus();
                this.showSubMenu();
                if (this.subMenuType == "init" && this.options.mmbClassName && this.options.mmbFocusedClassName) {
                    if (!this.fxMorph[this.btn.id]) {
                        this.fxMorph[this.btn.id] = {};
                    }
                    if (!this.fxMorph[this.btn.id]["btnMorph"]) {
                        this.fxMorph[this.btn.id]["btnMorph"] = new Fx.Morph(this.btn, {
                            duration: this.options.menuFx.duration,
                            transition: this.options.menuFx.transition,
                            link: "cancel"
                        });
                    }
                    this.fxMorph[this.btn.id]["btnMorph"].start(this.options.mmbFocusedClassName);
                }
            }.bind(this),
            focus: function(f) {
                this.cancellHideAllSubMenus();
                this.hideOtherSubMenus();
                this.showSubMenu();
                if (this.subMenuType == "init" && this.options.mmbClassName && this.options.mmbFocusedClassName) {
                    if (!this.fxMorph[this.btn.id]) {
                        this.fxMorph[this.btn.id] = {};
                    }
                    if (!this.fxMorph[this.btn.id]["btnMorph"]) {
                        this.fxMorph[this.btn.id]["btnMorph"] = new Fx.Morph(this.btn, {
                            duration: this.options.menuFx.duration,
                            transition: this.options.menuFx.transition,
                            link: "cancel"
                        });
                    }
                    this.fxMorph[this.btn.id]["btnMorph"].start(this.options.mmbFocusedClassName);
                }
            }.bind(this),
            mouseleave: function(f) {
                this.cancellHideAllSubMenus();
                this.hideAllSubMenus(this.btn, this.btn.getParent().getParent().get("tag") == "ol");
            }.bind(this),
            blur: function(f) {
                this.cancellHideAllSubMenus();
                this.hideAllSubMenus();
            }.bind(this)
        });
        this.options.onSubMenuInit_complete(this);
    },
    matchWidth: function() {
        if (this.widthMatched || this.subMenuType === "subseq") {
            return;
        }
        this.options.onMatchWidth_begin(this);
        var a = this.btn.getCoordinates().width;
        this.childMenu.getElements(".item").each(function(e, d) {
            var c = parseFloat(this.childMenu.getFirst().getStyle("border-left-width")) + parseFloat(this.childMenu.getFirst().getStyle("border-right-width"));
            var b = parseFloat(e.getStyle("padding-left")) + parseFloat(e.getStyle("padding-right"));
            var f = c + b;
            if (a > e.getCoordinates().width) {
                e.setStyle("width", a - f);
                e.setStyle("margin-right", -c);
            }
        }.bind(this));
        this.width = this.btn.fusionSize.width;
        this.widthMatched = true;
        this.options.onMatchWidth_complete(this);
    },
    hideSubMenu: function() {
        if (this.childMenu.fusionStatus === "closed") {
            return;
        }
        this.options.onHideSubMenu_begin(this);
        if (this.subMenuType == "init") {
            if (this.options.mmbClassName && this.options.mmbFocusedClassName) {
                if (!this.fxMorph[this.btn.id]) {
                    this.fxMorph[this.btn.id] = {};
                }
                if (!this.fxMorph[this.btn.id]["btnMorph"]) {
                    this.fxMorph[this.btn.id]["btnMorph"] = new Fx.Morph(this.btn, {
                        duration: this.options.menuFx.duration,
                        transition: this.options.menuFx.transition,
                        link: "cancel"
                    });
                }
                this.fxMorph[this.btn.id]["btnMorph"].start(this.options.mmbClassName).chain(function() {
                    this.btn.getParent().removeClass("f-mainparent-itemfocus");
                    this.btn.getParent().addClass("f-mainparent-item");
                }.bind(this));
            } else {
                this.btn.getParent().removeClass("f-mainparent-itemfocus");
                this.btn.getParent().addClass("f-mainparent-item");
            }
        } else {
            this.btn.getParent().removeClass("f-menuparent-itemfocus");
            this.btn.getParent().addClass("f-menuparent-item");
        }
        this.childMenu.setStyle("z-index", 1);
        if (this.options.effect && this.options.effect.toLowerCase() === "slide") {
            if (this.subMenuType == "init" && this.options.orientation == "horizontal" && this.options.direction.y == "down") {
                this.myEffect.start({
                    "margin-top": -this.height
                }).chain(function() {
                    if (this.childMenu.fusionStatus == "closed") {
                        if (!Browser.Engine.trident) {
                            this.myEffect.set({
                                display: "none"
                            });
                        } else {
                            this.myEffect.element.setStyle("display", "none");
                        }
                    }
                }.bind(this));
            } else {
                if (this.subMenuType == "init" && this.options.orientation == "horizontal" && this.options.direction.y == "up") {
                    this.myEffect.start({
                        "margin-top": this.height
                    }).chain(function() {
                        if (this.childMenu.fusionStatus == "closed") {
                            if (!Browser.Engine.trident) {
                                this.myEffect.set({
                                    display: "none"
                                });
                            } else {
                                this.myEffect.element.setStyle("display", "none");
                            }
                        }
                    }.bind(this));
                } else {
                    if (this.options.direction.x == "right") {
                        if (!this.rtl) {
                            tmp = {
                                "margin-left": -this.width
                            };
                        } else {
                            tmp = {
                                "margin-right": this.width
                            };
                        }
                        this.myEffect.start(tmp).chain(function() {
                            if (this.childMenu.fusionStatus == "closed") {
                                if (!Browser.Engine.trident) {
                                    this.myEffect.set({
                                        display: "none"
                                    });
                                } else {
                                    this.myEffect.element.setStyle("display", "none");
                                }
                            }
                        }.bind(this));
                    } else {
                        if (this.options.direction.x == "left") {
                            if (!this.rtl) {
                                tmp = {
                                    "margin-left": this.width
                                };
                            } else {
                                tmp = {
                                    "margin-right": -this.width
                                };
                            }
                            this.myEffect.start(tmp).chain(function() {
                                if (this.childMenu.fusionStatus == "closed") {
                                    if (!Browser.Engine.trident) {
                                        this.myEffect.set({
                                            display: "none"
                                        });
                                    } else {
                                        this.myEffect.element.setStyle("display", "none");
                                    }
                                }
                            }.bind(this));
                        }
                    }
                }
            }
        } else {
            if (this.options.effect == "fade") {
                this.myEffect.start({
                    opacity: 0
                }).chain(function() {
                    if (this.childMenu.fusionStatus == "closed") {
                        if (!Browser.Engine.trident) {
                            this.myEffect.set({
                                display: "none"
                            });
                        } else {
                            this.myEffect.element.setStyle("display", "none");
                        }
                    }
                }.bind(this));
            } else {
                if (this.options.effect == "slide and fade") {
                    if (this.subMenuType == "init" && this.options.orientation == "horizontal" && this.options.direction.y == "down") {
                        this.myEffect.start({
                            "margin-top": -this.height,
                            opacity: 0
                        }).chain(function() {
                            if (this.childMenu.fusionStatus == "closed") {
                                if (!Browser.Engine.trident) {
                                    this.myEffect.set({
                                        display: "none"
                                    });
                                } else {
                                    this.myEffect.element.setStyle("display", "none");
                                }
                            }
                        }.bind(this));
                    } else {
                        if (this.subMenuType == "init" && this.options.orientation == "horizontal" && this.options.direction.y == "up") {
                            this.myEffect.start({
                                "margin-top": this.height,
                                opacity: 0
                            }).chain(function() {
                                if (this.childMenu.fusionStatus == "closed") {
                                    if (!Browser.Engine.trident) {
                                        this.myEffect.set({
                                            display: "none"
                                        });
                                    } else {
                                        this.myEffect.element.setStyle("display", "none");
                                    }
                                }
                            }.bind(this));
                        } else {
                            if (this.options.direction.x == "right") {
                                if (!this.rtl) {
                                    tmp = {
                                        "margin-left": -this.width,
                                        opacity: 0
                                    };
                                } else {
                                    tmp = {
                                        "margin-right": this.width,
                                        opacity: 0
                                    };
                                }
                                this.myEffect.start(tmp).chain(function() {
                                    if (this.childMenu.fusionStatus == "closed") {
                                        if (!Browser.Engine.trident) {
                                            this.myEffect.set({
                                                display: "none"
                                            });
                                        } else {
                                            this.myEffect.element.setStyle("display", "none");
                                        }
                                    }
                                }.bind(this));
                            } else {
                                if (this.options.direction.x == "left") {
                                    if (!this.rtl) {
                                        tmp = {
                                            "margin-left": this.width,
                                            opacity: 0
                                        };
                                    } else {
                                        tmp = {
                                            "margin-right": -this.width,
                                            opacity: 0
                                        };
                                    }
                                    this.myEffect.start(tmp).chain(function() {
                                        if (this.childMenu.fusionStatus == "closed") {
                                            if (!Browser.Engine.trident) {
                                                this.myEffect.set({
                                                    display: "none"
                                                });
                                            } else {
                                                this.myEffect.element.setStyle("display", "none");
                                            }
                                        }
                                    }.bind(this));
                                }
                            }
                        }
                    }
                } else {
                    if (!Browser.Engine.trident) {
                        this.myEffect.set({
                            display: "none"
                        });
                    } else {
                        this.myEffect.element.setStyle("display", "none");
                    }
                }
            }
        }
        this.childMenu.fusionStatus = "closed";
        this.options.onHideSubMenu_complete(this);
    },
    hideOtherSubMenus: function() {
        this.options.onHideOtherSubMenus_begin(this);
        if (!this.otherSubMenus[this.btn.id]) {
            this.otherSubMenus[this.btn.id] = $$(this.root.subMenus.filter(function(a) {
                return !this.root.parentSubMenus[this.btn.id].contains(a) && a != this.childMenu;
            }.bind(this)));
        }
        this.parentSubMenus.fireEvent("show");
        this.otherSubMenus[this.btn.id].fireEvent("hide");
        this.options.onHideOtherSubMenus_complete(this);
    },
    hideAllSubMenus: function(a, b) {
        this.options.onHideAllSubMenus_begin(this);
        $clear(this.root.hideAllMenusTimeout);
        this.root.hideAllMenusTimeout = (function() {
            if (!window.RTFUSION) {
                $clear(this.hideAllMenusTimeout);
                this.myEffect.cancel();
                if (this.root.options.pill && !this.root.ghostRequest) {
                    this.root.pillFx.start(this.root.pillsDefaults);
                }
                if (b) {
                    var c = $$(this.root.subMenus).filter(function(d) {
                        return !d.hasChild(a);
                    });
                    $$(c).fireEvent("hide");
                } else {
                    $$(this.root.subMenus).fireEvent("hide");
                }
            }
        }).bind(this).delay(this.options.hideDelay);
        this.options.onHideAllSubMenus_complete(this);
    },
    cancellHideAllSubMenus: function() {
        clearTimeout(this.root.hideAllMenusTimeout);
    },
    showSubMenu: function(a) {
        if (this.root.options.pill && this.subMenuType == "init") {
            this.root.ghostRequest = false;
            this.root.pillFx.start({
                left: this.btn.getParent().offsetLeft,
                width: this.btn.getParent().offsetWidth - this.root.pillsMargins,
                top: this.btn.getParent().offsetTop
            });
        }
        if (this.childMenu.fusionStatus === "open") {
            return;
        }
        this.options.onShowSubMenu_begin(this);
        if (this.subMenuType == "init") {
            this.btn.getParent().removeClass("f-mainparent-item");
            this.btn.getParent().addClass("f-mainparent-itemfocus");
        } else {
            this.btn.getParent().removeClass("f-menuparent-item");
            this.btn.getParent().addClass("f-menuparent-itemfocus");
        }
        this.root.subMenuZindex++;
        this.childMenu.setStyles({
            display: "block",
            visibility: "hidden",
            "z-index": this.root.subMenuZindex
        });
        if (!this.width || !this.height) {
            this.width = this.btn.fusionSize.width;
            this.height = this.btn.fusionSize.height;
            this.childMenu.getFirst().setStyle("height", this.height, "border");
            if (this.options.effect == "slide" || this.options.effect == "slide and fade") {
                if (this.subMenuType == "init" && this.options.orientation == "horizontal") {
                    this.childMenu.getFirst().setStyle("margin-top", "0");
                    if (this.options.direction.y == "down") {
                        this.myEffect.set({
                            "margin-top": -this.height
                        });
                    } else {
                        if (this.options.direction.y == "up") {
                            this.myEffect.set({
                                "margin-top": this.height
                            });
                        }
                    }
                } else {
                    if (this.options.direction.x == "left") {
                        if (!this.rtl) {
                            tmp = {
                                "margin-left": this.width
                            };
                        } else {
                            tmp = {
                                "margin-right": -this.width
                            };
                        }
                        this.myEffect.set(tmp);
                    } else {
                        if (!this.rtl) {
                            tmp = {
                                "margin-left": -this.width
                            };
                        } else {
                            tmp = {
                                "margin-right": this.width
                            };
                        }
                        this.myEffect.set(tmp);
                    }
                }
            }
        }
        this.matchWidth();
        this.positionSubMenu();
        this.fixedHeader = document.body.hasClass("fixedheader-1");
        if (this.fixedHeader && !this.scrollingEvent) {
            this.scrollingEvent = true;
            window.addEvent("scroll", function() {
                this.positionSubMenu();
            }.bind(this));
            this.positionSubMenu();
        }
        if (this.options.effect == "slide") {
            this.childMenu.setStyles({
                display: "block",
                visibility: "visible"
            });
            if (this.subMenuType === "init" && this.options.orientation === "horizontal") {
                if (a) {
                    this.myEffect.set({
                        "margin-top": 0
                    }).chain(function() {
                        this.showSubMenuComplete();
                    }.bind(this));
                } else {
                    this.myEffect.start({
                        "margin-top": 0
                    }).chain(function() {
                        this.showSubMenuComplete();
                    }.bind(this));
                }
            } else {
                if (!this.rtl) {
                    tmp = {
                        "margin-left": 0
                    };
                } else {
                    tmp = {
                        "margin-right": 0
                    };
                }
                if (a) {
                    this.myEffect.set(tmp).chain(function() {
                        this.showSubMenuComplete();
                    }.bind(this));
                } else {
                    this.myEffect.start(tmp).chain(function() {
                        this.showSubMenuComplete();
                    }.bind(this));
                }
            }
        } else {
            if (this.options.effect == "fade") {
                if (a) {
                    this.myEffect.set({
                        opacity: this.options.opacity
                    }).chain(function() {
                        this.showSubMenuComplete();
                    }.bind(this));
                } else {
                    this.myEffect.start({
                        opacity: this.options.opacity
                    }).chain(function() {
                        this.showSubMenuComplete();
                    }.bind(this));
                }
            } else {
                if (this.options.effect == "slide and fade") {
                    this.childMenu.setStyles({
                        display: "block",
                        visibility: "visible"
                    });
                    this.childMenu.getFirst().setStyles({
                        left: 0
                    });
                    if (this.subMenuType == "init" && this.options.orientation == "horizontal") {
                        if (a) {
                            this.myEffect.set({
                                "margin-top": 0,
                                opacity: this.options.opacity
                            }).chain(function() {
                                this.showSubMenuComplete();
                            }.bind(this));
                        } else {
                            this.myEffect.start({
                                "margin-top": 0,
                                opacity: this.options.opacity
                            }).chain(function() {
                                this.showSubMenuComplete();
                            }.bind(this));
                        }
                    } else {
                        if (!this.rtl) {
                            tmp = {
                                "margin-left": 0,
                                opacity: this.options.opacity
                            };
                        } else {
                            tmp = {
                                "margin-right": 0,
                                opacity: this.options.opacity
                            };
                        }
                        if (a) {
                            if (this.options.direction.x == "right") {
                                this.myEffect.set(tmp).chain(function() {
                                    this.showSubMenuComplete();
                                }.bind(this));
                            } else {
                                if (this.options.direction.x == "left") {
                                    this.myEffect.set(tmp).chain(function() {
                                        this.showSubMenuComplete();
                                    }.bind(this));
                                }
                            }
                        } else {
                            if (this.options.direction.x == "right") {
                                this.myEffect.set({
                                    "margin-left": -this.width,
                                    opacity: this.options.opacity
                                });
                                this.myEffect.start(tmp).chain(function() {
                                    this.showSubMenuComplete();
                                }.bind(this));
                            } else {
                                if (this.options.direction.x == "left") {
                                    this.myEffect.set({
                                        "margin-left": this.width,
                                        opacity: this.options.opacity
                                    });
                                    this.myEffect.start(tmp).chain(function() {
                                        this.showSubMenuComplete();
                                    }.bind(this));
                                }
                            }
                        }
                    }
                } else {
                    this.childMenu.setStyles({
                        display: "block",
                        visibility: "visible"
                    });
                    this.showSubMenuComplete(this);
                }
            }
        }
        this.childMenu.fusionStatus = "open";
    },
    showSubMenuComplete: function() {
        this.options.onShowSubMenu_complete(this);
    },
    positionSubMenu: function() {
        this.options.onPositionSubMenu_begin(this);
        var m = this.childMenu.getStyle("padding-bottom").toInt() + this.options.tweakSizes.height;
        var a = this.options.tweakSizes.width;
        if (!Browser.Engine.presto || !Browser.Engine.gecko || !Browser.Engine.webkit) {
            a = 0;
            m = 0;
        }
        if (!this.rtl) {
            this.childMenu.setStyles({
                width: this.width + this.options.tweakSizes.width,
                "padding-bottom": this.options.tweakSizes.height,
                "padding-top": this.options.tweakSizes.height / 2,
                "padding-left": this.options.tweakSizes.width / 2
            });
        } else {
            this.childMenu.setStyles({
                width: this.width + this.options.tweakSizes.width,
                "padding-bottom": this.options.tweakSizes.height,
                "padding-top": this.options.tweakSizes.height / 2,
                "padding-right": this.options.tweakSizes.width / 2
            });
        }
        this.childMenu.getFirst().setStyle("width", this.width);
        if (this.subMenuType == "subseq") {
            this.options.direction.x = "right";
            this.options.direction.xInverse = "left";
            this.options.direction.y = "down";
            this.options.direction.yInverse = "up";
            if (this.rtl) {
                this.options.direction.x = "left";
                this.options.direction.xInverse = "right";
            }
        }
        var h;
        var j;
        if (this.subMenuType == "init") {
            if (this.options.direction.y == "up") {
                if (this.options.orientation == "vertical") {
                    h = this.btn.getCoordinates().bottom - this.height + this.options.tweakInitial.y;
                } else {
                    h = this.btn.getCoordinates().top - this.height + this.options.tweakInitial.y;
                }
                this.childMenu.style.top = h + "px";
            } else {
                if (this.options.orientation == "horizontal") {
                    this.childMenu.style.top = this.btn.getCoordinates().bottom + this.options.tweakInitial.y + "px";
                } else {
                    if (this.options.orientation == "vertical") {
                        h = this.btn.getPosition().y + this.options.tweakInitial.y;
                        if ((h + this.childMenu.getSize2().y) >= document.body.getScrollSize2().y) {
                            j = (h + this.childMenu.getSize2().y) - document.body.getScrollSize2().y;
                            h = h - j - 20;
                        }
                        this.childMenu.style.top = h + "px";
                    }
                }
            }
            if (this.options.orientation == "horizontal") {
                var d = this.btn.getPosition().x + this.options.tweakInitial.x,
                    b = 0;
                if (this.rtl) {
                    var k = 0;
                    if (this.btn.getStyle("margin-left").toInt() < 0 && !this.options.centered) {
                        k = this.btn.getParent().getPosition().x + this.options.tweakInitial.x;
                    } else {
                        if (this.btn.getStyle("margin-left").toInt() < 0 && this.options.centered) {
                            k = this.btn.getPosition().x - this.options.tweakInitial.x;
                        } else {
                            k = this.btn.getPosition().x;
                        }
                    }
                    d = k + this.btn.getSize2().x - this.childMenu.getSize2().x;
                }
                if (this.options.centered) {
                    b = 0;
                    var l = this.btn.getSize2().x;
                    if (this.btn.getStyle("margin-left").toInt() < 0 && !this.rtl) {
                        b = Math.abs(this.btn.getStyle("margin-left").toInt()) - Math.abs(this.btn.getFirst().getStyle("padding-left").toInt());
                    } else {
                        b = Math.abs(this.btn.getStyle("margin-right").toInt()) - Math.abs(this.btn.getFirst().getStyle("padding-right").toInt());
                    }
                    var i = this.childMenu.getSize2().x;
                    l += b;
                    var g = Math.max(l, i),
                        c = Math.min(l, i);
                    size = (g - c) / 2;
                    if (!this.rtl) {
                        d -= size;
                    } else {
                        d += size;
                    }
                }
                this.childMenu.style.left = d + "px";
            } else {
                if (this.options.direction.x == "left") {
                    this.childMenu.style.left = this.btn.getPosition().x - this.childMenu.getCoordinates().width + this.options.tweakInitial.x + "px";
                } else {
                    if (this.options.direction.x == "right") {
                        this.childMenu.style.left = this.btn.getCoordinates().right + this.options.tweakInitial.x + "px";
                    }
                }
            }
        } else {
            if (this.subMenuType == "subseq") {
                if (this.options.direction.y === "down") {
                    if ((this.btn.getCoordinates().top + this.options.tweakSubsequent.y + this.childMenu.getSize2().y) >= document.body.getScrollSize2().y) {
                        j = (this.btn.getCoordinates().top + this.options.tweakSubsequent.y + this.childMenu.getSize2().y) - document.body.getScrollSize2().y;
                        this.childMenu.style.top = (this.btn.getCoordinates().top + this.options.tweakSubsequent.y) - j - 20 + "px";
                    } else {
                        this.childMenu.style.top = this.btn.getCoordinates().top + this.options.tweakSubsequent.y + "px";
                    }
                } else {
                    if (this.options.direction.y === "up") {
                        if ((this.btn.getCoordinates().bottom - this.height + this.options.tweakSubsequent.y) < 1) {
                            this.options.direction.y = "down";
                            this.options.direction.yInverse = "up";
                            this.childMenu.style.top = this.btn.getCoordinates().top + this.options.tweakSubsequent.y + "px";
                        } else {
                            this.childMenu.style.top = this.btn.getCoordinates().bottom - this.height + this.options.tweakSubsequent.y + "px";
                        }
                    }
                }
                if (this.options.direction.x == "left") {
                    this.childMenu.style.left = this.btn.getCoordinates().left - this.childMenu.getCoordinates().width + this.options.tweakSubsequent.x + "px";
                    if (this.childMenu.getPosition().x < 0) {
                        this.options.direction.x = "right";
                        this.options.direction.xInverse = "left";
                        this.childMenu.style.left = this.btn.getPosition().x + this.btn.getCoordinates().width + this.options.tweakSubsequent.x + "px";
                        if (this.options.effect === "slide" || this.options.effect === "slide and fade") {
                            if (!this.rtl) {
                                tmp = {
                                    "margin-left": -this.width,
                                    opacity: this.options.opacity
                                };
                            } else {
                                tmp = {
                                    "margin-right": this.width,
                                    opacity: this.options.opacity
                                };
                            }
                            this.myEffect.set(tmp);
                        }
                    }
                } else {
                    if (this.options.direction.x == "right") {
                        this.childMenu.style.left = this.btn.getCoordinates().right + this.options.tweakSubsequent.x + "px";
                        var e = this.childMenu.getCoordinates().right;
                        var f = document.body.getSize2().x + window.getScroll2().x;
                        if (e > f) {
                            this.options.direction.x = "left";
                            this.options.direction.xInverse = "right";
                            this.childMenu.style.left = this.btn.getCoordinates().left - this.childMenu.getCoordinates().width - this.options.tweakSubsequent.x + "px";
                            if (this.options.effect == "slide" || this.options.effect == "slide and fade") {
                                if (!this.rtl) {
                                    tmp = {
                                        "margin-left": this.width,
                                        opacity: this.options.opacity
                                    };
                                } else {
                                    tmp = {
                                        "margin-right": -this.width,
                                        opacity: this.options.opacity
                                    };
                                }
                                this.myEffect.set(tmp);
                            }
                        }
                    }
                }
            }
        }
        this.options.onPositionSubMenu_complete(this);
    }
});
Element.implement({
    getCustomID: function() {
        if (!this.id) {
            var a = this.get("tag") + "-" + $time() + $random(0, 1000);
            this.id = a;
        }
        return this.id;
    }
});
Native.implement([Element], {
    getSize2: function() {
        if ((/^(?:body|html)$/i).test(this.tagName)) {
            return this.getWindow().getSize();
        }
        return {
            x: this.offsetWidth,
            y: this.offsetHeight
        };
    },
    getScrollSize2: function() {
        if ((/^(?:body|html)$/i).test(this.tagName)) {
            return this.getWindow().getScrollSize();
        }
        return {
            x: this.scrollWidth,
            y: this.scrollHeight
        };
    },
    getScroll2: function() {
        if ((/^(?:body|html)$/i).test(this.tagName)) {
            return this.getWindow().getScroll();
        }
        return {
            x: this.scrollLeft,
            y: this.scrollTop
        };
    }
});
Native.implement([Document, Window], {
    getSize2: function() {
        return this.getSize();
    },
    getScroll2: function() {
        return this.getScroll();
    },
    getScrollSize2: function() {
        return this.getScrollSize();
    }
});