// --- 상태 정의 ---
const STEPS = {
  HOME: "HOME",
  CATEGORY: "CATEGORY",
  MENU: "MENU",
  OPTIONS: "OPTIONS",
  CART: "CART",
  PAYMENT: "PAYMENT",
  DONE: "DONE",
};

let currentStep = STEPS.HOME;
let currentLevel = null; // 'easy' | 'medium' | 'hard'

// 난이도별 설정
const LEVEL_CONFIG = {
  easy: {
    key: "easy",
    label: "초급",
    title: "미션: 타로 밀크티 아이스를 주문해 보세요",
    sub: "초급 단계에서는 카테고리 → 메뉴 → ICE/HOT 선택까지만 연습합니다.",
    missionTarget: {
      category: "milktea",
      drink: "taro_milktea",
      temp: "ice",
    },
    options: {
      temp: true,
      size: false,
      sugar: false,
      ice: false,
      toppings: false,
    },
  },
  medium: {
    key: "medium",
    label: "중급",
    title: "미션: 블랙 밀크티 핫 점보를 주문해 보세요",
    sub: "중급 단계에서는 ICE/HOT과 사이즈까지 함께 선택합니다.",
    missionTarget: {
      category: "milktea",
      drink: "black_milktea",
      temp: "hot",
      size: "large",
    },
    options: {
      temp: true,
      size: true,
      sugar: false,
      ice: false,
      toppings: false,
    },
  },
  hard: {
    key: "hard",
    label: "고급",
    title:
      "미션: 타로 밀크티 아이스(당도 50%, 얼음 적게, 펄 토핑)를 주문해 보세요",
    sub: "고급 단계에서는 당도·얼음·토핑까지 실제 공차처럼 모두 선택합니다.",
    missionTarget: {
      category: "milktea",
      drink: "taro_milktea",
      temp: "ice",
      sugar: "50",
      iceLevel: "less",
      toppings: ["pearl"],
    },
    options: {
      temp: true,
      size: true,
      sugar: true,
      ice: true,
      toppings: true,
    },
  },
};

// 현재 선택된 미션 타깃 (난이도 선택 시 세팅)
let missionTarget = null;

// 메뉴 / 옵션 데이터
const categories = [
  { key: "milktea", label: "밀크티" },
  { key: "smoothie", label: "스무디" },
  { key: "coffee", label: "커피" },
];

const drinksByCategory = {
  milktea: [
    {
      key: "taro_milktea",
      name: "타로 밀크티",
      desc: "부드러운 타로와 밀크티의 조합",
      price: 4500,
    },
    {
      key: "black_milktea",
      name: "블랙 밀크티",
      desc: "공차 대표 오리지널 밀크티",
      price: 4300,
    },
    {
      key: "jasmine_milktea",
      name: "자스민 그린 밀크티",
      desc: "은은한 자스민향 밀크티",
      price: 4500,
    },
  ],
  smoothie: [
    {
      key: "strawberry_sm",
      name: "딸기 스무디",
      desc: "상큼한 딸기 얼음 블렌드",
      price: 4800,
    },
    {
      key: "mango_sm",
      name: "망고 스무디",
      desc: "달콤한 망고 스무디",
      price: 4800,
    },
  ],
  coffee: [
    {
      key: "americano",
      name: "아메리카노",
      desc: "깔끔한 블랙 커피",
      price: 4000,
    },
    {
      key: "latte",
      name: "카페라떼",
      desc: "부드러운 우유와 에스프레소",
      price: 4300,
    },
  ],
};

// 옵션 데이터
const sugarOptions = [
  { key: "0", label: "0%" },
  { key: "30", label: "30%" },
  { key: "50", label: "50%" },
  { key: "70", label: "70%" },
  { key: "100", label: "100%" },
];

const iceOptions = [
  { key: "none", label: "0 얼음" },
  { key: "less", label: "적게" },
  { key: "regular", label: "보통" },
  { key: "more", label: "많이" },
];

const toppingOptions = [
  { key: "pearl", label: "펄" },
  { key: "coconut", label: "코코넛" },
  { key: "milkfoam", label: "밀크폼" },
];

// 현재 주문 정보
const order = {
  level: null, // easy/medium/hard
  category: null,
  drinkKey: null,
  drinkName: null,
  price: 0,
  temp: "ice", // ice / hot
  size: "regular", // regular / large
  sugar: "50", // 0,30,50,70,100
  iceLevel: "regular", // none,less,regular,more
  toppings: [], // ['pearl','coconut',...]
  quantity: 1,
};

const screenEl = document.getElementById("screen");
const cartTitleEl = document.getElementById("cart-title");
const cartSubEl = document.getElementById("cart-sub");
const payBtn = document.getElementById("pay-btn");
const missionTextEl = document.getElementById("mission-text");
const missionSubEl = document.getElementById("mission-sub");

// 유틸: 포맷
const formatPrice = (p) => p.toLocaleString("ko-KR") + "원";

const getSugarLabel = (key) =>
  sugarOptions.find((s) => s.key === key)?.label || "";
const getIceLabel = (key) =>
  iceOptions.find((i) => i.key === key)?.label || "";
const getToppingLabel = (key) =>
  toppingOptions.find((t) => t.key === key)?.label || "";

// 난이도 설정 함수
function setLevel(levelKey) {
  const cfg = LEVEL_CONFIG[levelKey];
  if (!cfg) return;
  currentLevel = levelKey;
  missionTarget = cfg.missionTarget;
  order.level = levelKey;

  // 헤더 미션 문구 업데이트
  missionTextEl.textContent = cfg.title;
  missionSubEl.textContent = cfg.sub;

  // 주문 기본값 리셋
  order.category = null;
  order.drinkKey = null;
  order.drinkName = null;
  order.price = 0;
  order.temp = "ice";
  order.size = "regular";
  order.sugar = "50";
  order.iceLevel = "regular";
  order.toppings = [];
  order.quantity = 1;

  currentStep = STEPS.CATEGORY;
  render();
}

// --- 렌더 함수 ---
function render() {
  screenEl.innerHTML = "";
  let html = "";

  // 0단계: 난이도 선택 홈 화면
  if (currentStep === STEPS.HOME) {
    html += `
      <div class="screen-title">공차 키오스크 연습 난이도 선택</div>
      <div class="screen-subtitle">
        단계별로 연습 범위가 달라집니다. 초급 → 메뉴 + ICE/HOT, 중급 → +사이즈, 고급 → 전체 옵션.
      </div>
      <div class="grid">
        <div class="card" data-role="level" data-key="easy">
          <div class="card-title">초급 · Easy</div>
          <div class="card-desc">
            - 카테고리 선택<br/>
            - 메뉴 선택<br/>
            - ICE / HOT 선택
          </div>
        </div>
        <div class="card" data-role="level" data-key="medium">
          <div class="card-title">중급 · Medium</div>
          <div class="card-desc">
            - 메뉴 + ICE/HOT<br/>
            - 사이즈(레귤러 / 점보) 선택
          </div>
        </div>
        <div class="card" data-role="level" data-key="hard">
          <div class="card-title">고급 · Hard</div>
          <div class="card-desc">
            - 메뉴 + ICE/HOT + 사이즈<br/>
            - 당도 · 얼음량 · 토핑까지 전체 연습
          </div>
        </div>
      </div>
      <div class="toast info show">
        💡 먼저 연습하고 싶은 난이도를 선택해 주세요.
      </div>
    `;
  } else if (currentStep === STEPS.CATEGORY) {
    html += `
      <div class="screen-title">1단계 · 카테고리 선택</div>
      <div class="screen-subtitle">밀크티, 스무디, 커피 중에서 원하는 카테고리를 선택하세요.</div>
      <div class="chip-row">
        ${categories
          .map(
            (c) => `
          <button class="chip ${
            order.category === c.key ? "active" : ""
          }" data-role="category" data-key="${c.key}">
            ${c.label}
          </button>
        `
          )
          .join("")}
      </div>
      <div class="toast info show">
        💡 미션에 맞는 메뉴가 있는 카테고리를 선택해 보세요.
      </div>
      <button class="secondary-btn" data-role="back-home">← 난이도 다시 선택</button>
    `;
  } else if (currentStep === STEPS.MENU) {
    const list = drinksByCategory[order.category] || [];
    const categoryLabel =
      categories.find((c) => c.key === order.category)?.label || "";
    html += `
      <div class="screen-title">2단계 · 메뉴 선택</div>
      <div class="screen-subtitle">'${categoryLabel}' 카테고리에서 원하는 음료를 선택하세요.</div>
      <div class="grid">
        ${list
          .map((d) => {
            const isMissionDrink =
              missionTarget && d.key === missionTarget.drink;
            return `
          <div class="card" data-role="drink" data-key="${d.key}">
            <div class="card-title">
              ${d.name}
              ${isMissionDrink ? `<span class="badge">미션 메뉴</span>` : ""}
            </div>
            <div class="card-desc">${d.desc}</div>
            <div class="card-price">${formatPrice(d.price)}</div>
          </div>
        `;
          })
          .join("")}
      </div>
      <div class="toast info show">
        💡 미션에 나온 메뉴를 찾아 선택해 보세요.
      </div>
      <button class="secondary-btn" data-role="back-category">← 카테고리 다시 선택</button>
    `;
  } else if (currentStep === STEPS.OPTIONS) {
    const cfg = LEVEL_CONFIG[currentLevel];
    const opt = cfg?.options || {};
    const toppingsLabel =
      order.toppings.length > 0
        ? order.toppings.map(getToppingLabel).join(", ")
        : "선택 안 함";

    html += `
      <div class="screen-title">3단계 · 옵션 선택</div>
      <div class="screen-subtitle">난이도에 따라 선택해야 하는 옵션이 다릅니다.</div>

      <div class="section-title">선택한 메뉴</div>
      <div class="card">
        <div class="card-title">${order.drinkName}</div>
        <div class="card-price">${formatPrice(order.price)}</div>
      </div>
    `;

    // 당도
    if (opt.sugar) {
      html += `
        <div class="section-title">당도</div>
        <div class="option-row">
          ${sugarOptions
            .map(
              (s) => `
            <button class="option-btn ${
              order.sugar === s.key ? "active" : ""
            }" data-role="sugar" data-key="${s.key}">
              ${s.label}
            </button>
          `
            )
            .join("")}
        </div>
      `;
    }

    // 얼음량
    if (opt.ice) {
      html += `
        <div class="section-title">얼음량</div>
        <div class="option-row">
          ${iceOptions
            .map(
              (i) => `
            <button class="option-btn ${
              order.iceLevel === i.key ? "active" : ""
            }" data-role="iceLevel" data-key="${i.key}">
              ${i.label}
            </button>
          `
            )
            .join("")}
        </div>
      `;
    }

    // 토핑
    if (opt.toppings) {
      html += `
        <div class="section-title">토핑 (복수 선택 가능)</div>
        <div class="option-row">
          ${toppingOptions
            .map(
              (t) => `
            <button class="option-btn ${
              order.toppings.includes(t.key) ? "active" : ""
            }" data-role="topping" data-key="${t.key}">
              ${t.label}
            </button>
          `
            )
            .join("")}
        </div>
        <div class="screen-subtitle">현재 선택: ${toppingsLabel}</div>
      `;
    }

    // 온도 (모든 난이도 공통)
    if (opt.temp) {
      html += `
        <div class="section-title">온도</div>
        <div class="option-row">
          <button class="option-btn ${
            order.temp === "ice" ? "active" : ""
          }" data-role="temp" data-key="ice">아이스 ICE</button>
          <button class="option-btn ${
            order.temp === "hot" ? "active" : ""
          }" data-role="temp" data-key="hot">핫 HOT</button>
        </div>
      `;
    }

    // 사이즈 (중급 이상)
    if (opt.size) {
      html += `
        <div class="section-title">사이즈</div>
        <div class="option-row">
          <button class="option-btn ${
            order.size === "regular" ? "active" : ""
          }" data-role="size" data-key="regular">레귤러</button>
          <button class="option-btn ${
            order.size === "large" ? "active" : ""
          }" data-role="size" data-key="large">점보(+500원)</button>
        </div>
      `;
    }

    html += `
      <button class="primary-btn" data-role="add-cart">장바구니에 담기</button>
      <button class="secondary-btn" data-role="back-menu">← 메뉴 다시 선택</button>

      <div class="toast info show">
        💡 현재 난이도에서 요구하는 옵션만 정확히 선택하면 미션 조건을 만족할 수 있습니다.
      </div>
    `;
  } else if (currentStep === STEPS.CART) {
    const sizeExtra = order.size === "large" ? 500 : 0;
    const totalPrice = (order.price + sizeExtra) * order.quantity;
    const cfg = LEVEL_CONFIG[currentLevel];
    const opt = cfg?.options || {};

    const toppingsLabel =
      order.toppings.length > 0
        ? order.toppings.map(getToppingLabel).join(", ")
        : "토핑 없음";

    let descLines = [];

    if (opt.temp) descLines.push(order.temp === "ice" ? "아이스" : "핫");
    if (opt.sugar) descLines.push(`당도 ${getSugarLabel(order.sugar)}`);
    if (opt.ice) descLines.push(`얼음 ${getIceLabel(order.iceLevel)}`);
    if (opt.size)
      descLines.push(order.size === "regular" ? "레귤러" : "점보");
    if (opt.toppings) descLines.push(`토핑: ${toppingsLabel}`);

    html += `
      <div class="screen-title">4단계 · 장바구니 확인</div>
      <div class="screen-subtitle">선택한 메뉴와 옵션을 확인한 뒤 결제를 진행해 주세요.</div>

      <div class="card">
        <div class="card-title">${order.drinkName}</div>
        <div class="card-desc">
          ${descLines.join(" · ")} · x${order.quantity}
        </div>
        <div class="card-price">합계: ${formatPrice(totalPrice)}</div>
      </div>

      <button class="primary-btn" data-role="go-payment">결제 화면으로 이동</button>
      <button class="secondary-btn" data-role="back-options">← 옵션 다시 선택</button>

      <div class="toast info show">
        💡 '결제 화면으로 이동'을 누르면 실제 결제 단계까지 경험해 볼 수 있습니다.
      </div>
    `;
  } else if (currentStep === STEPS.PAYMENT) {
    const sizeExtra = order.size === "large" ? 500 : 0;
    const totalPrice = (order.price + sizeExtra) * order.quantity;
    const cfg = LEVEL_CONFIG[currentLevel];
    const opt = cfg?.options || {};

    const toppingsLabel =
      order.toppings.length > 0
        ? order.toppings.map(getToppingLabel).join(", ")
        : "토핑 없음";

    let descLines = [];

    if (opt.temp) descLines.push(order.temp === "ice" ? "아이스" : "핫");
    if (opt.sugar) descLines.push(`당도 ${getSugarLabel(order.sugar)}`);
    if (opt.ice) descLines.push(`얼음 ${getIceLabel(order.iceLevel)}`);
    if (opt.size)
      descLines.push(order.size === "regular" ? "레귤러" : "점보");
    if (opt.toppings) descLines.push(`토핑: ${toppingsLabel}`);
    descLines.push(`x${order.quantity}`);

    html += `
      <div class="screen-title">5단계 · 결제</div>
      <div class="screen-subtitle">공차 키오스크의 결제 화면과 유사한 형태로 구성했습니다.</div>

      <div class="card">
        <div class="card-title">주문 내역</div>
        <div class="card-desc">
          ${order.drinkName}<br/>
          ${descLines.join(" · ")}
        </div>
        <div class="card-price">총 결제금액: ${formatPrice(totalPrice)}</div>
      </div>

      <div class="section-title">결제 수단 (예시)</div>
      <div class="option-row">
        <button class="option-btn active" disabled>카드 결제</button>
        <button class="option-btn" disabled>모바일 결제</button>
      </div>

      <button class="primary-btn" data-role="pay-complete">결제 진행하기 (모의)</button>
      <button class="secondary-btn" data-role="back-cart">← 장바구니로 돌아가기</button>

      <div class="toast info show">
        💡 실제 결제는 일어나지 않고, '결제 진행하기'를 누르면 미션 성공 여부를 확인합니다.
      </div>
    `;
  } else if (currentStep === STEPS.DONE) {
    const isMissionSuccess = checkMissionSuccess();

    html += `
      <div class="center-message">
        ${
          isMissionSuccess
            ? `<div style="font-size:1.2rem; margin-bottom:8px;">🎉 미션 성공!</div>
               <div>선택한 난이도에 맞게 정확하게 주문했습니다.</div>`
            : `<div style="font-size:1.2rem; margin-bottom:8px;">주문 완료</div>
               <div>주문은 완료되었지만, 미션과는 조금 다른 옵션일 수 있습니다.</div>`
        }
        <div style="margin-top:16px; font-size:0.85rem; color:#777;">
          다시 연습하고 싶다면 아래 버튼을 눌러 난이도부터 다시 선택해 보세요.
        </div>
      </div>

      <button class="primary-btn" data-role="restart">처음으로 돌아가기</button>
    `;
  }

  screenEl.innerHTML = html;
  updateBottomBar();
  attachHandlers();
}

// 미션 성공 여부 체크
function checkMissionSuccess() {
  if (!missionTarget) return false;

  const cfg = LEVEL_CONFIG[currentLevel];
  const opt = cfg?.options || {};
  const t = missionTarget;

  if (t.category && order.category !== t.category) return false;
  if (t.drink && order.drinkKey !== t.drink) return false;
  if (opt.temp && t.temp && order.temp !== t.temp) return false;
  if (opt.size && t.size && order.size !== t.size) return false;
  if (opt.sugar && t.sugar && order.sugar !== t.sugar) return false;
  if (opt.ice && t.iceLevel && order.iceLevel !== t.iceLevel) return false;
  if (opt.toppings && t.toppings) {
    // 미션에 지정된 토핑들이 모두 포함되어 있는지
    for (const top of t.toppings) {
      if (!order.toppings.includes(top)) return false;
    }
  }
  return true;
}

// 하단 장바구니 표시 업데이트
function updateBottomBar() {
  if (!order.drinkName || currentStep === STEPS.DONE) {
    cartTitleEl.textContent = "선택된 메뉴 없음";
    cartSubEl.textContent = "메뉴를 선택하면 여기에서 확인할 수 있어요.";
    payBtn.disabled = true;
    payBtn.textContent = "결제하기";
    return;
  }

  const basePrice = order.price;
  const sizeExtra = order.size === "large" ? 500 : 0;
  const totalPrice = (basePrice + sizeExtra) * order.quantity;

  cartTitleEl.textContent = order.drinkName;
  cartSubEl.textContent = `${
    order.temp === "ice" ? "아이스" : "핫"
  } · ${order.size === "regular" ? "레귤러" : "점보"} · x${order.quantity}`;
  payBtn.disabled = !(
    currentStep === STEPS.CART || currentStep === STEPS.PAYMENT
  );
  payBtn.textContent =
    currentStep === STEPS.PAYMENT
      ? "결제 완료"
      : `결제하기 (${formatPrice(totalPrice)})`;
}

// 클릭 핸들러 부착
function attachHandlers() {
  screenEl
    .querySelectorAll("[data-role]")
    .forEach((el) =>
      el.addEventListener("click", (e) => handleAction(e.target))
    );

  payBtn.onclick = () => {
    if (currentStep === STEPS.CART) {
      currentStep = STEPS.PAYMENT;
      render();
    } else if (currentStep === STEPS.PAYMENT) {
      currentStep = STEPS.DONE;
      render();
    }
  };
}

// 액션 처리
function handleAction(el) {
  const role = el.dataset.role;
  const key = el.dataset.key;

  if (role === "level" && currentStep === STEPS.HOME) {
    setLevel(key);
  } else if (role === "back-home") {
    currentStep = STEPS.HOME;
    render();
  } else if (role === "category" && currentStep === STEPS.CATEGORY) {
    order.category = key;
    currentStep = STEPS.MENU;
    render();
  } else if (role === "drink" && currentStep === STEPS.MENU) {
    const drink = (drinksByCategory[order.category] || []).find(
      (d) => d.key === key
    );
    if (!drink) return;
    order.drinkKey = drink.key;
    order.drinkName = drink.name;
    order.price = drink.price;

    // 기본 옵션 초기화
    order.temp = "ice";
    order.size = "regular";
    order.sugar = "50";
    order.iceLevel = "regular";
    order.toppings = [];
    order.quantity = 1;

    currentStep = STEPS.OPTIONS;
    render();
  } else if (role === "sugar" && currentStep === STEPS.OPTIONS) {
    order.sugar = key;
    render();
  } else if (role === "iceLevel" && currentStep === STEPS.OPTIONS) {
    order.iceLevel = key;
    render();
  } else if (role === "topping" && currentStep === STEPS.OPTIONS) {
    if (order.toppings.includes(key)) {
      order.toppings = order.toppings.filter((t) => t !== key);
    } else {
      order.toppings.push(key);
    }
    render();
  } else if (role === "temp" && currentStep === STEPS.OPTIONS) {
    order.temp = key; // ice / hot
    render();
  } else if (role === "size" && currentStep === STEPS.OPTIONS) {
    order.size = key; // regular / large
    render();
  } else if (role === "add-cart" && currentStep === STEPS.OPTIONS) {
    currentStep = STEPS.CART;
    render();
  } else if (role === "go-payment" && currentStep === STEPS.CART) {
    currentStep = STEPS.PAYMENT;
    render();
  } else if (role === "back-category") {
    currentStep = STEPS.CATEGORY;
    render();
  } else if (role === "back-menu") {
    currentStep = STEPS.MENU;
    render();
  } else if (role === "back-options") {
    currentStep = STEPS.OPTIONS;
    render();
  } else if (role === "back-cart") {
    currentStep = STEPS.CART;
    render();
  } else if (role === "pay-complete" && currentStep === STEPS.PAYMENT) {
    currentStep = STEPS.DONE;
    render();
  } else if (role === "restart") {
    currentLevel = null;
    missionTarget = null;
    order.level = null;
    currentStep = STEPS.HOME;
    // 헤더 초기 문구로 되돌리기
    missionTextEl.textContent = "먼저 난이도를 선택해 연습을 시작해 보세요.";
    missionSubEl.textContent =
      "초급: 메뉴 + ICE/HOT · 중급: +사이즈 · 고급: 당도·얼음·토핑까지 연습합니다.";
    render();
  }
}

// 초기 렌더링
render();
