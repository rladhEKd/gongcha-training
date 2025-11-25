// --- 상태 정의 ---
const STEPS = {
  CATEGORY: "CATEGORY",
  MENU: "MENU",
  OPTIONS: "OPTIONS",
  CART: "CART",
  PAYMENT: "PAYMENT",
  DONE: "DONE",
};

let currentStep = STEPS.CATEGORY;

// 미션 조건 (이걸 기준으로 미션 성공 여부 판단)
const missionTarget = {
  category: "milktea",
  drink: "taro_milktea",
  temp: "ice",
};

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

// 유틸: 포맷
const formatPrice = (p) => p.toLocaleString("ko-KR") + "원";

const getSugarLabel = (key) =>
  sugarOptions.find((s) => s.key === key)?.label || "";
const getIceLabel = (key) =>
  iceOptions.find((i) => i.key === key)?.label || "";
const getToppingLabel = (key) =>
  toppingOptions.find((t) => t.key === key)?.label || "";

// --- 렌더 함수 ---
function render() {
  screenEl.innerHTML = "";
  let html = "";

  if (currentStep === STEPS.CATEGORY) {
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
        💡 미션: [밀크티] 카테고리를 먼저 선택해 보세요.
      </div>
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
            const isMissionDrink = d.key === missionTarget.drink;
            return `
          <div class="card" data-role="drink" data-key="${d.key}">
            <div class="card-title">
              ${d.name}
              ${
                isMissionDrink
                  ? `<span class="badge">미션 메뉴</span>`
                  : ""
              }
            </div>
            <div class="card-desc">${d.desc}</div>
            <div class="card-price">${formatPrice(d.price)}</div>
          </div>
        `;
          })
          .join("")}
      </div>
      <div class="toast info show">
        💡 미션: '타로 밀크티'를 찾아 선택해 보세요.
      </div>
      <button class="secondary-btn" data-role="back-category">← 카테고리 다시 선택</button>
    `;
  } else if (currentStep === STEPS.OPTIONS) {
    const toppingsLabel =
      order.toppings.length > 0
        ? order.toppings.map(getToppingLabel).join(", ")
        : "선택 안 함";

    html += `
      <div class="screen-title">3단계 · 옵션 선택</div>
      <div class="screen-subtitle">당도, 얼음량, 토핑, 온도·사이즈를 선택한 후 장바구니에 담아 주세요.</div>

      <div class="section-title">선택한 메뉴</div>
      <div class="card">
        <div class="card-title">${order.drinkName}</div>
        <div class="card-price">${formatPrice(order.price)}</div>
      </div>

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
      </di
