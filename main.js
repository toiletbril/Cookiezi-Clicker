const amount_text  = document.getElementById("amount");
const shop_items   = document.getElementById("shop_items");
const tap_power    = document.getElementById("tap_power");
const cps          = document.getElementById("cps");
const upgrades_c   = document.getElementById("upgrades_count");

const UPGRADES = [
    {
        id: 0,
        name: "First upgrade",
        cost: 1000,
        gives: 1,
    },
    {
        id: 1,
        name: "Second upgrade",
        cost: 3000,
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
        key1: "KeyZ",
        key2: "KeyX",
    },

    populate_shop() {
        for (const i in UPGRADES) {
            const item = UPGRADES[i];

            const item_element = document.createElement("li");
            const div = document.createElement("div");
            const item_text = document.createTextNode(`${item.name}, ${item.cost}c`);
            const buy_button = document.createElement("button");

            buy_button.setAttribute("id", item.name);
            buy_button.onclick = this.buy(this, item);

            buy_button.appendChild(item_text);
            div.appendChild(buy_button);

            item_element.appendChild(div);

            shop_items.appendChild(item_element);
        }
    },

    buy: (self, item) => () => {
        if (self.amount < item.cost) {
            console.log("Insufficient amount, can't buy item" + item.id);
            return;
        }

        UPGRADES[item.id].cost *= 1.33;

        self.amount -= item.cost;
        self.power += item.gives;
        self.upgrades[item.id] += 1;

        self.update();
    },

    click() {
        this.amount += this.power;
        this.update()
    },

    initialize() {
        this.update();
    },

    update() {
        amount_text.textContent = this.amount;
        tap_power.textContent   = "Tap power: " + this.power;
        cps.textContent         = "CP/S: " + this.cps;
        upgrades_c.textContent  = "Upgrades count: " + this.upgrades.reduce((a, b) => a + b, 0);
    },
}

document.addEventListener("keypress", (k) => {
    switch (k.code) {
        case Cookiezi.settings.key1:
        case Cookiezi.settings.key2: {
            Cookiezi.click();
        } break;
    }
});

Cookiezi.initialize();
Cookiezi.populate_shop();
