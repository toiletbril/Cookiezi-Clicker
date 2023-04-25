const amount_text  = document.getElementById("amount");
const shop_items   = document.getElementById("shop_items");
const tap_power    = document.getElementById("tap_power");
const cps          = document.getElementById("cps");
const upgrades_c   = document.getElementById("upgrades_count");

const UPGRADES = [
    {
        id: 0,
        name: "First upgrade",
        cost: 100,
        gives: 1,
    },
    {
        id: 1,
        name: "Second upgrade",
        cost: 400,
        gives: 2,
    },
]

function create_upgrade_array() {
    let a = [];
    for (_ in UPGRADES) a.push(0);
    return a;
}

const Cookiezi = {
    amount:   0,
    power:    1,
    cps:      0,
    upgrades: create_upgrade_array(),

    settings: {
        key1: {
            code: "KeyG",
            is_down: false
        },
        key2: {
            code: "KeyH",
            is_down: false
        }
    },

    populate_cps_shop() {
        for (const i in UPGRADES) {
            const item = UPGRADES[i];

            const item_element = document.createElement("li");
            const div = document.createElement("div");
            const item_text = document.createTextNode(`${item.name}, ${item.cost}c`);
            const buy_button = document.createElement("button");
            const gives = document.createTextNode(item.gives + " CP/S")

            buy_button.setAttribute("id", "item" + item.id);
            buy_button.onclick = this.buy(this, UPGRADES[item.id]);

            buy_button.appendChild(item_text);
            div.appendChild(buy_button);
            div.appendChild(gives);

            item_element.appendChild(div);

            shop_items.appendChild(item_element);
        }
    },

    buy: (self, item) => () => {
        if (self.amount < item.cost) {
            alert("Not enough amount to buy \"" + item.name + "\" :(");
            return;
        }

        self.amount -= item.cost;
        self.cps += item.gives;
        self.upgrades[item.id] += 1;

        UPGRADES[item.id].cost = (UPGRADES[item.id].cost * 1.33).toFixed();
        let button = document.getElementById("item" + item.id);
        button.textContent = `${item.name}, ${item.cost}c`;

    },

    press_key(k) {
        if (k.is_down) return;
        this.click();
        k.is_down = true;
    },

    unpress_key(k) {
        k.is_down = false;
    },

    click() {
        this.amount += this.power;
    },

    invoke_cps() {
        this.amount += this.cps / 20;
    },

    update_text() {
        amount_text.textContent = this.amount.toFixed();
        tap_power.textContent   = "Tap power: " + this.power;
        cps.textContent         = "CP/S: " + this.cps;
        upgrades_c.textContent  = "Upgrades count: " + this.upgrades.reduce((a, b) => a + b, 0);
    },

    initialize() {
        this.update();
    },

    update() {
        this.invoke_cps();
        this.update_text();
    },
}

document.addEventListener("keydown", (k) => {
    let k1 = Cookiezi.settings.key1;
    let k2 = Cookiezi.settings.key2;
    switch (k.code) {
        case k1.code: {
            Cookiezi.press_key(k1)
        } break;
        case k2.code: {
            Cookiezi.press_key(k2)
        } break;
    }
});

document.addEventListener("keyup", (k) => {
    let k1 = Cookiezi.settings.key1;
    let k2 = Cookiezi.settings.key2;
    switch (k.code) {
        case k1.code: {
            Cookiezi.unpress_key(k1)
        } break;
        case k2.code: {
            Cookiezi.unpress_key(k2)
        } break;
    }
});

Cookiezi.initialize();
Cookiezi.populate_cps_shop();

setInterval(() => {
    Cookiezi.update();
}, 50)
