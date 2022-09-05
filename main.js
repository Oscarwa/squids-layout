const urlParams = new URLSearchParams(window.location.search);
const channel = urlParams.get("channel");
if (!channel) {
  document.getElementById("shoots").innerHTML = "<h1>No channel provided</h1>";
}
const channels = channel.split(",") || [];
let commandName = urlParams.get("command") || "splat";
const maxSquids = +urlParams.get("max_squids") || 20;
const cooldown = +urlParams.get("cooldown") || 1;
const minShoots = +urlParams.get("min") || 5;
const maxShoots = +urlParams.get("max") || minShoots + 3;
const volume = +urlParams.get("vol") || 0.2;
const botName = "NazBorg";

commandName = commandName.toLowerCase();

// twitch bot settings
const config = {
  connection: {
    reconnect: true,
    secure: true,
  },
  identity: {
    username: botName,
    password: "oauth:npuql7l86m3izzm98w3k7nit1tm1fs",
  },
  channels: channels,
};
let client = null;
if (channels.length) {
  client = new tmi.client(config);
  client.connect();

  client.on("raw_message", (_messageCloned, message) => {
    console.log(message.raw);
  });

  client.on("message", (_channel, user, message, self) => {
    if (self) return;

    if (message.startsWith("!") || message.startsWith("@")) return;
    if (["nightbot", "streamelements", "streamlabs"].includes(user.username))
      return;
    if (user["emote-only"]) return;

    const username = user["display-name"];
    const userColor = user.color;
    commandMessage(username, userColor, message);
  });
}

const mainCanvas = document.getElementById("shoots");

conversion = (ms) => {
  let sec = ms / 1000;
  let min = ms / (1000 * 60);
  let hrs = ms / (1000 * 60 * 60);
  if (sec < 60) {
    return `${sec.toFixed(1)}s`;
  } else if (min < 60) {
    sec = sec % 60;
    return `${min.toFixed(0)}m ${sec.toFixed(0)}s`;
  } else {
    sec = sec % 60;
    min = min % 60;
    return `${hrs.toFixed(0)}h ${min.toFixed(0)}m ${sec.toFixed(0)}s`;
  }
};

let acceleration = 3;
const squids = [];

const createSplattedVector = (color) => {
  const splattedVector = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  splattedVector.classList.add("splatted");
  splattedVector.setAttribute("viewBox", "0 0 300 225");
  splattedVector.innerHTML = `<path d="M120.082407,257.972052l29.917594-33.321388l32.192617,28.226266q13.131641-36.108745,12.415052-35.75045t56.25224,27.230383l-18.989609-40.128986l48.011467-19.347903-36.904335-21.49767l38.337515-39.054102-46.219993-3.582945l12.540308-41.920459-53.027588,22.930849-8.375889-38.352386-36.231779,31.54479-29.9176-29.341607-14.375135,36.149204L52.679684,78.824797l12.540308,41.920459-46.219993,3.582947l38.337515,39.0541-36.904335,21.49767l48.011467,19.347904-18.989609,40.128985l56.252235-27.230383q14.375135,41.203867,14.375135,40.845573" transform="matrix(1.141583-.000414 0.000414 1.141575-21.80937-71.309174)" stroke="#000"/>
    <path d="M115.497621,257.42407c.849773,2.778398.920373,11.720583,3.369045,9.079935c0,0,30.921793-32.065735,30.921793-32.065735l33.152349,19.985899q22.083259-30.006791,21.36667-29.648496t41.972941,15.541731l-5.435449-34.289965l35.860346-10.903526-24.044122-30.248282l24.04412-33.5875-33.020936-12.414352l3.945731-34.497223-47.77602,13.296676-16.851585-26.637197-32.041345,18.749987-32.589516-22.406647-16.308504,29.65047-42.710527-8.490042-1.696849,32.077136-30.35264,10.882506l21.907506,33.296826-26.98827,33.882991l35.966513,7.882172-2.259679,34.497878l46.090166-13.902573q13.478262,30.26733,13.478262,30.26733Z" transform="matrix(.799091-.000289 0.000269 0.742024 29.641175-8.338757)" fill="${color}" stroke="#000"/>
    <path d="M251.641696,6.087776c5.615631-1.079929,28.949313,43.118298,24.819331,49.8421s-16.369453-6.915127-18.463499,1.631203-4.410144,26.415025-10.628012,27.867182-2.105179-18.32968-4.27218-8.137485-5.894808,6.496724-7.527174,5.899677s1.088415-14.500065-2.034372-9.154672-2.705169,8.127541-7.1203,6.916863.697925-18.239322-3.051557-10.375294-7.631738,7.757451-9.764983,6.103114s3.945342-22.186064,5.521131-27.110862-11.509476-.180542-15.692988-4.625332c-5.420897-5.759455,25.104129-40.800364,48.214603-38.856494Z" transform="matrix(1.195577 0.31989-.319889 1.195574-118.496886-22.066491)" fill="#f8f8f8" stroke-width="0.6"/>
    <path d="M259.575751,71.391102q-.610312,0-19.93684-15.461223l-30.515572,4.88249-1.220623-7.934049l24.209019-3.865306-14.2406-9.154672l4.679055-5.69624l19.123091,12.81654l26.243391-4.679054l1.017186,7.527174-19.93684,3.661869L265.068552,65.69486q-4.88249,5.69624-5.492801,5.696242Z" transform="matrix(1.195577 0.31989-.319889 1.195574-116.915521-29.312229)" fill="${color}" stroke-width="0.6"/>`;
  return splattedVector;
};

const createSquidVector = (color) => {
  const squidVector = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  squidVector.classList.add("squid-vector");
  squidVector.setAttribute("viewBox", "0 0 951 1024");
  squidVector.style = "position: absolute; z-index: -1";
  squidVector.innerHTML = `
    <g transform="matrix(0.1, 0, 0, -0.1, 0, 1024.000015)" fill="#000000" stroke="none">
      <path fill="${color}" d="M 7440.118 4004.586 C 7427.413 3864.835 9103.786 4155.637 9123.075 4367.816 C 10432.985 4864.421 5706.747 10322.022 4812.769 10022.063 C 2789.744 9512.932 -705.734 4340.035 332.959 4585.753 C 1054.043 3406.442 1476.287 4276.61 2100.668 3919.835 C 2494.028 3695.066 2351.811 2671.031 2258.067 2382.171 C 1952.21 1439.716 2155.086 994.639 2839.232 517.601 C 3073.509 354.245 3271.281 702.585 3517.257 1316.701 C 3642.16 1628.54 3639.916 1197.33 4098.422 493.385 C 4290.067 199.151 4579.98 -59.65 4715.909 880.829 C 4758.602 1176.217 4863.534 1248.863 5042.814 432.847 C 5127.464 47.552 5583.516 3.157 6023.529 977.688 C 6162.64 1285.789 6069.646 1596.506 6302.004 723.43 C 6410.016 317.58 6979.825 241.147 7355.365 1461.993 C 7472.885 1844.04 7647.063 1904.459 7355.365 2309.525 C 7081.897 2689.275 6948.714 3496.446 7440.118 4004.586 Z"/>
      <g transform="matrix(10, 0, 0, -10, 0, 10240)">
        <ellipse style="fill: rgb(255, 255, 255);" cx="584.191" cy="524.259" rx="134.394" ry="146.502"/>
        <ellipse style="fill: rgb(255, 255, 255);" cx="363.228" cy="518.205" rx="130.157" ry="136.816"/>
      </g>
      <path d="M4945 2846 c-139 -61 -193 -252 -106 -373 15 -21 51 -51 79 -66 169 -92 351 3 352 183 0 97 -66 207 -152 251 -43 22 -128 25 -173 5z"/>
      <path d="M3443 2599 c-105 -40 -190 -162 -181 -258 8 -85 75 -193 139 -227 72 -37 218 -3 297 70 84 77 111 179 77 293 -19 65 -48 101 -99 124 -56 25 -164 24 -233 -2z"/>
      <path d="M5890 2531 c-96 -32 -195 -112 -225 -183 -51 -123 23 -317 142 -373 107 -51 305 34 381 163 24 42 27 56 27 142 0 81 -4 102 -25 145 -21 42 -34 55 -83 79 -61 30 -167 44 -217 27z"/>
      <path d="M4438 2206 c-103 -28 -192 -125 -230 -249 -23 -78 -21 -164 7 -230 21 -50 79 -114 129 -140 75 -39 221 -22 317 39 88 55 124 138 117 273 -7 138 -64 239 -161 285 -67 32 -120 38 -179 22z"/>
      <path d="M2860 1495 c-84 -38 -123 -106 -124 -216 0 -92 27 -147 92 -194 40 -27 51 -30 120 -30 59 0 85 5 112 20 77 46 114 198 70 289 -48 101 -187 168 -270 131z"/>
      <path d="M5169 1338 c-45 -30 -99 -136 -99 -192 1 -74 52 -161 114 -193 37 -19 144 -18 190 1 50 21 78 81 84 176 4 72 3 77 -29 125 -63 93 -186 132 -260 83z"/>
      <path d="M3475 6484 c-130 -19 -296 -66 -404 -115 -171 -78 -375 -250 -513 -433 -128 -171 -219 -386 -275 -651 -25 -119 -27 -149 -27 -350 -1 -236 11 -333 61 -505 128 -443 391 -779 759 -966 215 -109 359 -139 632 -132 278 8 391 38 708 187 183 85 257 105 374 98 104 -6 164 -25 367 -121 267 -126 379 -154 651 -163 248 -9 410 20 596 106 398 184 692 560 819 1046 59 225 61 617 5 860 -110 474 -384 837 -770 1020 -205 97 -394 130 -693 122 -289 -8 -414 -39 -722 -177 -256 -116 -315 -116 -563 0 -300 140 -435 171 -760 175 -118 2 -228 1 -245 -1z m388 -159 c220 -33 400 -120 600 -289 74 -63 197 -214 247 -305 25 -44 47 -81 50 -81 3 0 23 30 45 67 210 358 536 576 922 616 538 54 1051 -295 1232 -839 55 -164 66 -241 66 -444 0 -204 -13 -286 -67 -440 -149 -421 -473 -720 -878 -811 -327 -73 -657 0 -933 207 -133 100 -294 286 -355 411 -14 29 -29 50 -34 47 -5 -3 -21 -31 -37 -63 -38 -74 -134 -203 -208 -278 -137 -140 -358 -269 -548 -319 -87 -24 -121 -27 -260 -28 -98 0 -183 4 -220 12 -495 108 -858 480 -966 992 -31 148 -32 392 -1 535 58 272 176 498 352 675 202 204 399 299 710 344 62 9 193 5 283 -9z"/>
      <path d="M3606 6094 c-126 -30 -282 -132 -369 -239 -56 -69 -102 -158 -122 -235 -19 -71 -19 -229 0 -300 49 -186 198 -354 390 -441 423 -191 939 109 962 561 15 297 -198 572 -505 651 -91 23 -267 25 -356 3z"/>
      <path d="M4615 10206 c-318 -74 -785 -371 -1335 -851 -481 -419 -1215 -1164 -1666 -1690 -770 -899 -1321 -1783 -1518 -2436 -57 -189 -70 -273 -70 -464 0 -189 10 -258 54 -365 101 -245 303 -406 620 -493 251 -70 719 -117 1152 -117 l167 0 15 -52 c82 -283 100 -427 101 -803 l0 -310 -51 -105 c-254 -522 -290 -959 -110 -1335 129 -270 363 -532 691 -776 108 -80 253 -169 275 -169 9 0 53 23 99 51 179 110 314 277 391 484 14 39 32 70 39 70 7 0 27 -38 45 -90 69 -191 151 -318 294 -457 122 -118 332 -258 387 -258 20 0 127 54 185 93 25 17 78 62 119 101 117 113 182 219 226 372 14 48 28 90 30 93 11 10 24 -17 44 -92 59 -217 211 -405 423 -521 93 -52 132 -50 234 12 281 168 468 393 559 669 15 47 32 83 40 83 7 0 25 -35 40 -78 74 -212 236 -403 425 -501 l75 -39 120 80 c506 340 824 720 917 1096 30 118 32 443 5 569 -23 106 -95 315 -162 473 -85 197 -90 225 -89 505 1 312 28 525 95 752 l22 72 51 5 c28 3 152 8 276 11 848 21 1227 121 1477 389 119 127 179 272 192 465 23 342 -76 700 -330 1201 -413 816 -1107 1715 -2107 2731 -787 800 -1465 1346 -1915 1541 -200 87 -390 117 -532 84z m270 -326 c487 -167 1791 -1407 2794 -2654 758 -944 1210 -1699 1306 -2184 25 -121 18 -309 -13 -377 -113 -249 -609 -433 -1421 -530 -118 -14 -221 -31 -228 -37 -54 -44 -245 -571 -325 -896 -11 -48 -25 -92 -30 -98 -4 -6 -32 -14 -62 -17 -149 -15 -249 -144 -232 -301 10 -101 72 -166 198 -209 53 -19 64 -27 71 -52 5 -16 24 -70 43 -119 18 -49 33 -90 31 -91 -1 -1 -36 -18 -77 -38 -96 -45 -156 -98 -219 -193 -173 -258 -117 -571 124 -690 66 -33 83 -37 178 -41 l106 -6 -21 -41 c-76 -149 -264 -347 -447 -470 -59 -40 -85 -44 -113 -19 -27 24 -22 37 23 67 90 60 123 222 67 331 -35 67 -114 139 -196 178 -56 27 -78 32 -138 32 -60 -1 -82 -6 -135 -32 -56 -28 -66 -30 -78 -18 -8 8 -38 84 -66 170 l-52 156 -12 -111 c-31 -286 -106 -518 -227 -701 -95 -144 -307 -309 -395 -309 -89 1 -238 115 -338 260 -109 157 -208 444 -228 659 -8 79 -17 63 -33 -57 -35 -264 -148 -540 -281 -686 -88 -96 -215 -176 -281 -176 -35 0 -198 85 -205 107 -2 6 27 21 64 33 132 44 185 81 244 173 49 75 65 148 50 230 -39 224 -268 418 -492 419 -86 0 -142 -13 -211 -48 -26 -13 -49 -20 -51 -16 -2 4 -7 36 -11 72 -17 168 -15 166 -53 34 -18 -66 -54 -160 -78 -210 -92 -185 -248 -385 -404 -515 l-94 -79 -51 37 c-111 79 -239 188 -305 259 -83 89 -130 159 -181 267 -37 79 -76 204 -67 214 3 2 28 10 56 18 109 29 184 94 222 195 20 50 21 62 11 144 -14 110 -45 177 -112 240 -28 26 -50 52 -50 57 0 6 22 61 49 123 27 61 57 137 66 168 15 54 19 59 68 82 177 84 199 288 48 435 -30 29 -68 54 -93 62 l-42 14 -48 175 c-26 96 -66 231 -89 300 -58 176 -199 531 -213 535 -6 3 -96 14 -201 25 -499 56 -901 153 -1147 276 -277 139 -347 242 -335 494 22 466 483 1280 1304 2305 1016 1268 2347 2530 2828 2681 62 20 164 17 230 -6z"/>
      <path d="M5566 6095 c-126 -32 -277 -129 -364 -234 -57 -68 -106 -161 -127 -241 -19 -71 -19 -229 0 -300 37 -139 134 -275 260 -365 379 -271 897 -113 1063 323 23 58 26 83 26 187 1 138 -16 200 -86 319 -77 131 -226 248 -378 298 -86 28 -306 35 -394 13z"/>
    </g>`;
  return squidVector;
};

const users = [];
const MESSAGE_DURATION_MS = 8000;
const TextSize = {
  XS: "xs",
  SM: "sm",
  MD: "md",
  LG: "lg",
  XL: "xl",
};
const commandMessage = (username, color, message) => {
  let textSize = "";
  switch (true) {
    case message.length <= 3:
      textSize = TextSize.XS;
      break;
    case message.length <= 10:
      textSize = TextSize.SM;
      break;
    case message.length <= 20:
      textSize = TextSize.MD;
      break;
    case message.length <= 40:
      textSize = TextSize.LG;
      break;
    case message.length > 40:
      textSize = TextSize.XL;
      message = message.substring(0, 55) + "...";
      break;
  }
  let user = users.find((u) => u.username === username);
  let squid = null;
  if (!user) {
    user = { username, color };
    users.push(user);
    squid = createSquid(username, color);
    squid.element.classList.add("first");
    setTimeout(() => {
      squid.element.classList.remove("first");
    }, MESSAGE_DURATION_MS + 1000);
  }
  squid =
    squid ||
    squids.find((u) => u.username === username) ||
    createSquid(username, color);
  squid.timestamp = Date.now() + SQUID_DEFAULT_DURATION * 60 * 1000;
  squid.element.classList.remove("vanish");
  const el = squid.element;
  const mWrapper = document.createElement("div");
  mWrapper.classList.add("message-wrapper", textSize);
  const messageEl = document.createElement("div");
  messageEl.classList.add("name", "message");
  messageEl.innerHTML = message;
  mWrapper.append(messageEl);
  el.append(mWrapper);
  setTimeout(() => {
    messageEl.remove();
  }, MESSAGE_DURATION_MS);
};
const SQUID_DEFAULT_DURATION = 0.1; // minutes
const ACCELERATION = 2;

const createSquid = (username, color) => {
  if (squids.length < maxSquids) {
    const squidElement = document.createElement("div");
    squidElement.classList.add("squid");
    squidElement.append(createSquidVector(color));
    const squidName = document.createElement("span");
    squidName.classList.add("name");
    squidName.innerHTML = username;
    squidElement.append(squidName);
    squidElement.append(createSplattedVector(color));
    mainCanvas.append(squidElement);

    const x =
      document.body.clientWidth / 8 +
      (Math.random() * document.body.clientWidth) / 2;
    const y =
      document.body.clientHeight / 8 +
      (Math.random() * document.body.clientHeight) / 2;
    const baseAngle = 15 + Math.floor(Math.random() * 60); // number between 15 and 75.
    const radAngle = baseAngle * (Math.PI / 180);

    const acceleration =
      Math.floor(Math.random() * ACCELERATION) + ACCELERATION;
    const squid = {
      acc: acceleration,
      x,
      y,
      w: squidElement.clientWidth,
      h: squidElement.clientHeight,
      color,
      vx: acceleration * Math.cos(radAngle),
      vy: acceleration * Math.sin(radAngle),
      angle: radAngle,
      username,
      element: squidElement,
      timestamp: null,
    };
    squid.angle = determineAngle(squid);
    squids.push(squid);
    return squid;
  }
  return null;
};

showSquids = () => {
  const currentTimestamp = Date.now();
  for (const squidId in squids) {
    const squid = squids[squidId];
    if (
      currentTimestamp > squid.timestamp - 4_000 &&
      currentTimestamp < squid.timestamp
    ) {
      squid.element.classList.add("vanish");
      continue;
    } else if (currentTimestamp > squid.timestamp) {
      squid.element.remove();
      const squidIndex = squids.indexOf(squid);
      if (squidIndex >= 0) {
        squids.splice(squidIndex, 1);
      }
      continue;
    }
    if (currentTimestamp < squid.timestamp) {
      let angle = squid.angle;
      // Determine x velocity
      if (squid.x + squid.w > document.body.clientWidth || squid.x < 0) {
        squid.vx = -squid.vx;
        angle = determineAngle(squid);
      }

      // determine y velocity
      if (squid.y + squid.h > document.body.clientHeight || squid.y < 0) {
        squid.vy = -squid.vy;
        angle = determineAngle(squid);
      }

      squid.x += squid.vx;
      squid.y += squid.vy;
      squid.angle = angle;
      squid.element.style.top = `${squid.y}px`;
      squid.element.style.left = `${squid.x}px`;
      squid.element.style.transform = `rotate(${squid.angle}rad)`;

      // console.log(squid)
    }
  }
  requestAnimationFrame(showSquids);
};

requestAnimationFrame(showSquids);

const nhx = -Math.sin(Math.PI / 2);
const nhy = Math.cos(Math.PI / 2);

const determineAngle = (squid) => {
  let angleReflected = Math.atan2(
    squid.y + squid.vy - squid.y,
    squid.x + squid.vx - squid.x
  );
  let angle = (2 * Math.PI + angleReflected) % (2 * Math.PI);
  return angle + Math.PI / 2;
};

const debug = urlParams.get("debug");
const inkColors = [
  "#18D618",
  "#a72de1",
  "#cef41e",
  "#f1297e",
  "#ffce00",
  "#4324ca",
  "#fa29a4",
  "#36d6bd",
];
console.log("Debug:", debug !== null);
if (debug !== null) {
  document.body.addEventListener("click", (e) => {
    e.preventDefault();
    messages = [
      "X",
      "hello",
      "Splatoon 3 lesgoo",
      "Lorem ipsum dolor sit amet, consecteturs",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In molestie turpis eget suscipit egestas.",
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    commandMessage(
      `testing # ${Math.floor(Math.random() * 10)}`,
      inkColors[Math.floor(Math.random() * inkColors.length)],
      message.trim()
    );
  });

  document.body.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
}
