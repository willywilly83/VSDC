var rokbox;
window.addEvent("domready", function() {
    rokbox = new RokBox({
        theme: "light",
        transition: Fx.Transitions.Quad.easeOut,
        duration: 400,
        chase: 50,
        "frame-border": 20,
        "content-padding": 0,
        "arrows-height": 35,
        effect: "growl",
        captions: 1,
        captionsDelay: 800,
        scrolling: 0,
        keyEvents: 1,
        overlay: {
            background: "#000",
            opacity: 0.2,
            duration: 200,
            transition: Fx.Transitions.Quad.easeInOut
        },
        defaultSize: {
            width: 640,
            height: 460
        },
        autoplay: "true",
        controller: "true",
        bgcolor: "#ffffff",
        youtubeAutoplay: 0,
        vimeoColor: "00adef",
        vimeoPortrait: 0,
        vimeoTitle: 0,
        vimeoFullScreen: 1,
        vimeoByline: 0
    })
});