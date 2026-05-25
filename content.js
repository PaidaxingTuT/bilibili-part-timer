(function () {
  "use strict";

  function isDarkMode() {
    if (document.documentElement.getAttribute("data-dark") === "true") return true;
    if (document.documentElement.classList.contains("dark")) return true;
    var bg = getComputedStyle(document.body).backgroundColor;
    var m = bg.match(/\d+/g);
    if (m && m.length >= 3) {
      var avg = (parseInt(m[0]) + parseInt(m[1]) + parseInt(m[2])) / 3;
      return avg < 128;
    }
    return false;
  }

  function buildColors(dark) {
    return {
      bg:     dark ? "#303237" : "#F1F2F3",
      bg2:    dark ? "#252528" : "#e3e3e6",
      bg3:    dark ? "#1f1f22" : "#e8e8eb",
      text:   dark ? "#ccc"    : "#333",
      text2:  dark ? "#999"    : "#555",
      text3:  dark ? "#666"    : "#777",
      line:   dark ? "#444"    : "#d0d0d4",
      accent: "#00aeec",
      border: dark ? "#555"    : "#c8c8cc",
      shadow: dark ? "0.4"     : "0.10",
      shadow2:dark ? "0.5"     : "0.08"
    };
  }

  function init() {
    var css = [
      '.bili-timer-indent .video-pod__item,',
      '.bili-timer-indent .list-box li,',
      '.bili-timer-indent .on-demand-list-item,',
      '.bili-timer-indent .click-item {',
        'padding-left:35px!important;transition:padding .1s;position:relative!important;cursor:pointer!important;user-select:none!important;',
      '}',
      '.bili-timer-check {',
        'position:absolute!important;left:8px!important;top:50%!important;transform:translateY(-50%)!important;',
        'z-index:99999!important;width:16px!important;height:16px!important;cursor:pointer;',
        'accent-color:#00aeec;outline:none;margin:0!important;display:block!important;pointer-events:none;',
      '}',
      '#timer-panel {',
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;font-size:12px;border-radius:8px;',
      '}',
      '#timer-panel input[type="number"] {',
        'border:none;color:inherit;padding:5px;border-radius:6px;text-align:center;outline:none;font-family:monospace;',
      '}',
      '#timer-panel input[type="number"]:focus {',
        'box-shadow:0 0 0 1px #00aeec;',
      '}',
      '#timer-panel button {',
        'border-radius:6px;cursor:pointer;font-weight:600;border:none;transition:.1s;',
      '}',
      '#timer-panel button:active {',
        'transform:translateY(1px);',
      '}'
    ].join("");
    var styleTag = document.createElement("style");
    styleTag.innerHTML = css;
    document.head.appendChild(styleTag);

    var checkExist = setInterval(function () {
      if (document.querySelector(".duration, .time")) {
        clearInterval(checkExist);
        createUI();
      }
    }, 1000);

    function createUI() {
      var dark = isDarkMode();
      var C = buildColors(dark);

      var ball = document.createElement("div");
      ball.innerHTML = "🕒";
      ball.style.cssText = "";
      document.body.appendChild(ball);

      var panel = document.createElement("div");
      panel.id = "timer-panel";
      panel.style.cssText = "";
      document.body.appendChild(panel);

      var titleBar, closeBtn, stP, edP, calcBtn, toggleBtn, speedRow, spD;
      var resultArea, resDesc, resTime;
      var rangeLabel, toggleHint;

      function rebuildPanelHTML() {
        panel.innerHTML = [
          '<div id="titleBar" style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid ' + C.line + ';padding-bottom:8px;">',
            '<span style="font-weight:bold;color:#00aeec;">时长统计</span>',
            '<span id="closePanel" style="cursor:pointer;color:' + C.text2 + ';font-size:14px;padding:0 5px;">✕</span>',
          '</div>',
          '<div style="display:flex;flex-direction:column;gap:5px;">',
            '<span id="rangeLabel" style="color:' + C.text2 + ';font-size:11px;">按集数区间</span>',
            '<div style="display:flex;gap:5px;">',
              '<input id="stP" type="number" placeholder="开始" style="width:100%;background:' + C.bg2 + ';color:' + C.text + ';">',
              '<input id="edP" type="number" placeholder="结束" style="width:100%;background:' + C.bg2 + ';color:' + C.text + ';">',
            '</div>',
            '<button id="calcRange" style="background:' + C.bg2 + ';color:' + C.text + ';padding:6px;">计算区间时长</button>',
          '</div>',
          '<div style="display:flex;flex-direction:column;gap:5px;margin-top:5px;">',
            '<button id="toggleSelect" style="background:' + C.bg2 + ';color:' + C.text2 + ';border:1px dashed ' + C.line + ';border-radius:6px;padding:8px;font-size:12px;">开启 [选择模式]</button>',
            '<span id="toggleHint" style="font-size:10px;color:' + C.text3 + ';text-align:center;">* 支持按住左键滑动多选</span>',
          '</div>',
          '<div id="speedRow" style="display:flex;align-items:center;gap:8px;margin-top:5px;border-top:1px solid ' + C.line + ';padding-top:10px;">',
            '<span style="color:' + C.text2 + ';">倍速:</span>',
            '<input id="spD" type="number" value="1.0" step="0.25" style="width:50px;background:' + C.bg2 + ';color:' + C.text + ';">',
          '</div>',
          '<div id="resultArea" style="background:' + C.bg3 + ';border-radius:6px;padding:10px;text-align:center;margin-top:5px;">',
            '<div id="resDesc" style="color:' + C.text2 + ';font-size:11px;margin-bottom:2px;">等待操作</div>',
            '<div id="resTime" style="color:#00aeec;font-size:16px;font-weight:bold;font-family:monospace;">00:00:00</div>',
          '</div>'
        ].join("");

        titleBar  = panel.querySelector("#titleBar");
        closeBtn  = panel.querySelector("#closePanel");
        stP       = panel.querySelector("#stP");
        edP       = panel.querySelector("#edP");
        calcBtn   = panel.querySelector("#calcRange");
        toggleBtn = panel.querySelector("#toggleSelect");
        toggleHint= panel.querySelector("#toggleHint");
        speedRow  = panel.querySelector("#speedRow");
        spD       = panel.querySelector("#spD");
        resultArea= panel.querySelector("#resultArea");
        resDesc   = panel.querySelector("#resDesc");
        resTime   = panel.querySelector("#resTime");
        rangeLabel= panel.querySelector("#rangeLabel");
      }

      function applyBallStyle() {
        ball.style.cssText = [
          "position:fixed;right:0;top:30%;width:36px;height:36px;cursor:pointer;z-index:99999",
          "border-radius:6px 0 0 6px",
          "border:1px solid " + C.border + ";border-right:none",
          "display:flex;align-items:center;justify-content:center",
          "background:" + C.bg,
          "color:" + C.text,
          "box-shadow:-2px 0 8px rgba(0,0,0," + C.shadow + ")",
          "font-size:18px"
        ].join(";");
      }

      function applyPanelStyle() {
        panel.style.cssText = [
          "display:" + (panel.style.display === "flex" ? "flex" : "none"),
          "padding:15px;width:190px",
          "background:" + C.bg,
          "position:fixed;right:40px;top:30%",
          "border:1px solid " + C.border,
          "border-radius:8px;z-index:10000",
          "flex-direction:column;gap:12px",
          "box-shadow:0 4px 20px rgba(0,0,0," + C.shadow2 + ")"
        ].join(";");
      }

      function applyInnerStyles() {
        if (!titleBar) return;
        titleBar.style.borderBottomColor = C.line;
        closeBtn.style.color = C.text2;
        rangeLabel.style.color = C.text2;
        stP.style.background = C.bg2; stP.style.color = C.text;
        edP.style.background = C.bg2; edP.style.color = C.text;
        calcBtn.style.background = C.bg2; calcBtn.style.color = C.text;
        toggleHint.style.color = C.text3;
        speedRow.style.borderTopColor = C.line;
        spD.style.background = C.bg2; spD.style.color = C.text;
        resultArea.style.background = C.bg3;
        resDesc.style.color = C.text2;

        if (!isSelectMode) {
          toggleBtn.style.background = C.bg2;
          toggleBtn.style.color = C.text2;
          toggleBtn.style.border = "1px dashed " + C.line;
        }
      }

      function refreshTheme() {
        var newDark = isDarkMode();
        if (newDark === dark) return;
        dark = newDark;
        C = buildColors(dark);
        applyBallStyle();
        applyPanelStyle();
        applyInnerStyles();
      }

      rebuildPanelHTML();
      applyBallStyle();
      applyPanelStyle();

      closeBtn.onclick = function () {
        panel.style.display = "none";
      };

      ball.onclick = function () {
        var isHidden = panel.style.display === "none";
        panel.style.display = isHidden ? "flex" : "none";
        ball.style.background = isHidden ? C.bg2 : C.bg;
        if (isHidden) updateInfo();
      };

      var observer = new MutationObserver(function () {
        refreshTheme();
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-dark", "class"]
      });

      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
        refreshTheme();
      });

      var isSelectMode = false;
      var listObserver = null;
      var isDragging = false;
      var startDragIndex = -1;
      var initialCheckState = false;

      document.addEventListener("mouseup", function () {
        isDragging = false;
        startDragIndex = -1;
      });

      function getBiliItems() {
        var items = Array.from(document.querySelectorAll(".video-pod__item, .list-box li, .on-demand-list-item, .click-item"));
        return items.filter(function (item) { return item.querySelector(".duration, .time"); });
      }

      function parseToSeconds(timeStr) {
        var parts = timeStr.split(":").reverse().map(Number);
        return (parts[0] || 0) + (parts[1] || 0) * 60 + (parts[2] || 0) * 3600;
      }

      function formatTime(totalSec) {
        var h = Math.floor(totalSec / 3600);
        var m = Math.floor((totalSec % 3600) / 60);
        var s = Math.round(totalSec % 60);
        return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
      }

      function updateInfo() {
        var data = getBiliItems();
        var currentP = new URLSearchParams(window.location.search).get("p") || 1;
        if (!stP.value) stP.value = currentP;
        if (!edP.value) edP.value = data.length;
      }

      function displayResult(label, sec, speed) {
        resDesc.innerText = label;
        resTime.innerText = formatTime(sec / speed);
      }

      calcBtn.onclick = function () {
        var items = getBiliItems();
        var start = Math.max(1, parseInt(stP.value)) - 1;
        var end = Math.min(items.length, parseInt(edP.value)) - 1;
        var speed = parseFloat(spD.value) || 1.0;
        if (start > end) return;
        var totalSec = 0;
        for (var i = start; i <= end; i++) {
          totalSec += parseToSeconds(items[i].querySelector(".duration, .time").innerText.trim());
        }
        displayResult("区间 " + (start + 1) + "-" + (end + 1) + " 集", totalSec, speed);
      };

      function handleMouseDown(e) {
        if (!isSelectMode) return;
        e.preventDefault();
        e.stopPropagation();
        var items = getBiliItems();
        var currentItem = e.currentTarget;
        startDragIndex = items.indexOf(currentItem);
        isDragging = true;
        var cb = currentItem.querySelector(".bili-timer-check");
        if (cb) {
          cb.checked = !cb.checked;
          initialCheckState = cb.checked;
          calcCheckTotal();
        }
      }

      function handleMouseEnter(e) {
        if (!isSelectMode || !isDragging) return;
        var items = getBiliItems();
        var currentItem = e.currentTarget;
        var currentIndex = items.indexOf(currentItem);
        if (startDragIndex === -1 || currentIndex === -1) return;
        var min = Math.min(startDragIndex, currentIndex);
        var max = Math.max(startDragIndex, currentIndex);
        for (var i = min; i <= max; i++) {
          var cb = items[i].querySelector(".bili-timer-check");
          if (cb && cb.checked !== initialCheckState) {
            cb.checked = initialCheckState;
          }
        }
        calcCheckTotal();
      }

      function interceptClick(e) {
        if (isSelectMode) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      }

      function attachListeners() {
        var items = getBiliItems();
        items.forEach(function (item) {
          if (!item.querySelector(".bili-timer-check")) {
            var cb = document.createElement("input");
            cb.type = "checkbox";
            cb.className = "bili-timer-check";
            item.prepend(cb);
            item.addEventListener("mousedown", handleMouseDown);
            item.addEventListener("mouseenter", handleMouseEnter);
            item.addEventListener("click", interceptClick, true);
          }
        });
      }

      function detachListeners() {
        var items = getBiliItems();
        items.forEach(function (item) {
          var cb = item.querySelector(".bili-timer-check");
          if (cb) cb.remove();
          item.removeEventListener("mousedown", handleMouseDown);
          item.removeEventListener("mouseenter", handleMouseEnter);
          item.removeEventListener("click", interceptClick, true);
        });
      }

      var listContainerSelector = ".video-pod__list, .list-box, .on-demand-list-container, .part-list";

      toggleBtn.onclick = function () {
        isSelectMode = !isSelectMode;
        var containers = document.querySelectorAll(listContainerSelector);

        if (isSelectMode) {
          toggleBtn.innerText = "关闭 [选择模式]";
          toggleBtn.style.background = "#00aeec";
          toggleBtn.style.color = "#fff";
          toggleBtn.style.border = "none";
          containers.forEach(function (c) { c.classList.add("bili-timer-indent"); });
          attachListeners();
          if (containers.length > 0) {
            listObserver = new MutationObserver(function () { attachListeners(); });
            containers.forEach(function (c) { listObserver.observe(c, { childList: true, subtree: true }); });
          }
        } else {
          toggleBtn.innerText = "开启 [选择模式]";
          toggleBtn.style.background = C.bg2;
          toggleBtn.style.color = C.text2;
          toggleBtn.style.border = "1px dashed " + C.line;
          if (listObserver) { listObserver.disconnect(); listObserver = null; }
          containers.forEach(function (c) { c.classList.remove("bili-timer-indent"); });
          detachListeners();
          displayResult("准备就绪", 0, 1);
        }
      };

      function calcCheckTotal() {
        var checked = document.querySelectorAll(".bili-timer-check:checked");
        var totalSec = 0;
        checked.forEach(function (cb) {
          var item = cb.parentElement;
          totalSec += parseToSeconds(item.querySelector(".duration, .time").innerText.trim());
        });
        var speed = parseFloat(spD.value) || 1.0;
        displayResult("已勾选 " + checked.length + " 集", totalSec, speed);
      }

      spD.oninput = function () {
        if (isSelectMode) calcCheckTotal();
      };
    }
  }

  init();
})();