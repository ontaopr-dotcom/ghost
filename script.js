const toast = document.querySelector(".toast");
const navTabs = document.querySelectorAll(".nav-tab");
const tabLinks = document.querySelectorAll("[data-tab]");
const panels = document.querySelectorAll("[data-panel]");
const cartCountSpan = document.querySelector(".cart-count");
const cartItemsList = document.querySelector(".cart-items");
const totalPriceSpan = document.querySelector(".total-price");
const orderModal = document.querySelector("#order-modal");
const nicknameInput = document.querySelector("#nickname-input");
const orderTotalDisplay = document.querySelector("#order-total-display");
const confirmOrderButton = document.querySelector("#confirm-order-button");
const closeModalButton = document.querySelector(".close-modal");

let toastTimer;
let cartItems = [];

const saveCart = () => {
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
};

const loadCart = () => {
  const savedCart = localStorage.getItem("cartItems");
  if (savedCart) {
    cartItems = JSON.parse(savedCart);
    renderCart();
  }
};

const renderCart = () => {
  cartItemsList.innerHTML = "";
  let total = 0;
  cartItems.forEach((item, index) => {
    const li = document.createElement("li");
    li.classList.add("cart-item");
    let itemPrice = item.basePrice;

    let optionsHtml = "";
    if (item.isPrefix) {
      if (item.hasEmoji) {
        itemPrice += item.optionPrice;
      }
      optionsHtml = `
        <label class="cart-emoji-option">
          <input type="checkbox" data-item-index="${index}" ${item.hasEmoji ? "checked" : ""}>
          <span>+ Смайлик (+${item.optionPrice} ⭐)</span>
        </label>
      `;
    }

    total += itemPrice;

    li.innerHTML = `
      <div class="cart-item-info">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price">${itemPrice} ⭐</span>
      </div>
      <div class="cart-item-actions">
        ${optionsHtml}
        <button class="cart-item-remove" data-item-index="${index}">✖</button>
      </div>
    `;
    cartItemsList.appendChild(li);
  });

  totalPriceSpan.textContent = `${total} ⭐`;
  cartCountSpan.textContent = `Корзина (${cartItems.length})`;

  // Добавляем обработчики для чекбоксов смайликов в корзине
  cartItemsList.querySelectorAll(".cart-emoji-option input[type=\"checkbox\"]").forEach(checkbox => {
    checkbox.addEventListener("change", (event) => {
      const index = parseInt(event.target.dataset.itemIndex);
      cartItems[index].hasEmoji = event.target.checked;
      saveCart();
      renderCart();
    });
  });

  // Добавляем обработчики для кнопок удаления
  cartItemsList.querySelectorAll(".cart-item-remove").forEach(button => {
    button.addEventListener("click", (event) => {
      const index = parseInt(event.target.dataset.itemIndex);
      cartItems.splice(index, 1);
      saveCart();
      renderCart();
    });
  });
};

const setActiveTab = (targetTab) => {
  navTabs.forEach((item) => {
    const isActive = item.dataset.tab === targetTab;
    item.classList.toggle("is-active", isActive);

    if (isActive) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  });

  panels.forEach((panel) => {
    panel.classList.toggle("is-visible", panel.dataset.panel === targetTab);
  });

  if (targetTab === "cart") {
    renderCart();
  } else if (targetTab === "server") {
    loadServerContent();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
};

const loadServerContent = async () => {
  try {
    const response = await fetch("./server-content.html"); 
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const content = await response.text();
    document.querySelector("#server-content-placeholder").innerHTML = content;
  } catch (error) {
    console.error("Ошибка загрузки содержимого сервера:", error);
    document.querySelector("#server-content-placeholder").innerHTML = "<p>Не удалось загрузить содержимое сервера.</p>";
  }
};

tabLinks.forEach((tab) => {
  tab.addEventListener("click", () => {
    setActiveTab(tab.dataset.tab);
  });
});

document.querySelectorAll(".buy-button").forEach((button) => {
  button.addEventListener("click", () => {
    const productId = button.dataset.productId;
    const productName = button.dataset.productName;
    const basePrice = parseInt(button.dataset.basePrice);
    const isPrefix = productId === "cutie" || productId === "killer";
    const optionPrice = 10; // Цена за смайлик

    const newItem = {
      id: productId + "-" + Date.now(), // Уникальный ID для каждого элемента
      name: productName,
      basePrice: basePrice,
      isPrefix: isPrefix,
      hasEmoji: false,
      optionPrice: optionPrice,
    };
    cartItems.push(newItem);
    saveCart();
    renderCart();

    toast.textContent = `${productName} добавлен в корзину!`;
    toast.classList.add("is-visible");

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 4000); // Увеличил время отображения для чтения
  });
});

document.querySelector(".checkout-button").addEventListener("click", () => {
  if (cartItems.length === 0) {
    toast.textContent = "Корзина пуста. Добавьте товары, чтобы оформить заказ!";
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 4000);
  } else {
    orderTotalDisplay.textContent = totalPriceSpan.textContent;
    nicknameInput.value = ""; // Очищаем поле никнейма
    orderModal.classList.add("is-visible");
  }
});

confirmOrderButton.addEventListener("click", () => {
  const nickname = nicknameInput.value.trim();
  if (nickname === "") {
    toast.textContent = "Пожалуйста, введите ваш никнейм!";
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 4000);
  } else {
    const total = totalPriceSpan.textContent;
    toast.textContent = `Заказ на сумму ${total} оформлен на никнейм: ${nickname}!`;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 4000);

    cartItems = [];
    saveCart();
    renderCart();
    orderModal.classList.remove("is-visible");
  }
});

closeModalButton.addEventListener("click", () => {
  orderModal.classList.remove("is-visible");
});

orderModal.addEventListener("click", (event) => {
  if (event.target === orderModal) {
    orderModal.classList.remove("is-visible");
  }
});

loadCart();
