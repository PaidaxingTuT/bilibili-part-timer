(function () {
  "use strict";

  function init() {
    const css = `
      .bili-timer-indent .video-pod__item,
      .bili-timer-indent .list-box li,
      .bili-timer-indent .on-demand-list-item,
      .bili-timer-indent .click-item {
        padding-left: 35px !important;
        transition: padding 0.1s;
        position: relative !important;
        cursor: pointer !important;
        user-select: none !important;
      }

      .bili-timer-check {
        position: absolute !important;
        left: 8px !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        z-index: 99999 !important;
        width: 16px !important;
        height: 16px !important;
        cursor: pointer;
        accent-color: #00aeec;
        outline: none;
        margin: 0 !important;
        display: block !important;
        pointer-events: none;
      }

      #timer-panel {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 12px;
        color: #ddd;
        border-radius: 2px;
      }
      #timer-panel input[type="number"] {
        background: #222;
        border: 1px solid #444;
        color: #fff;
        padding: 5px;
        border-radius: 2px;
        text-align: center;
        outline: none;
        font-family: monospace;
      }
      #timer-panel input[type="number"]:focus {
        border-color: #00aeec;
      }
      #timer-panel button {
        border-radius: 2px;
        cursor: pointer;
        font-weight: 600;
        border: none;
        transition: 0.1s;
      }
      #timer-panel button:active {
        transform: translateY(1px);
      }
    `;
    const styleTag = document.createElement("style");
    styleTag.innerHTML = css;
    document.head.appendChild(styleTag);

    const checkExist = setInterval(() => {
      if (document.querySelector(".duration, .time")) {
        clearInterval(checkExist);
        createUI();
      }
    }, 1000);

    function createUI() {
      const ball = document.createElement("div");
      ball.innerHTML = "🕒";
      ball.style.cssText = `
        position: fixed;
        right: 0;
        top: 30%;
        width: 36px;
        height: 36px;
        cursor: pointer;
        z-index: 99999;
        border-radius: 4px 0 0 4px;
        border: 1px solid rgba(0,174,236,0.3);
        border-right: none;
        background: #181818;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      ball.style.cssText += "font-size: 18px;";
      document.body.appendChild(ball);

      const panel = document.createElement("div");
      panel.id = "timer-panel";
      panel.style.cssText = `
        display: none;
        padding: 15px;
        width: 190px;
        background: #181818;
        position: fixed;
        right: 40px;
        top: 30%;
        border: 1px solid #444;
        z-index: 10000;
        flex-direction: column;
        gap: 12px;
      `;
      document.body.appendChild(panel);

      ball.onclick = () => {
        const isHidden = panel.style.display === "none";
        panel.style.display = isHidden ? "flex" : "none";
        ball.style.background = isHidden ? "#222" : "#181818";
      };
    }
  }

  init();
})();