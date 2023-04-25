const amount_text  = document.getElementById("amount");
const shop_items   = document.getElementById("shop_items");
const tap_power    = document.getElementById("tap_power");
const cps          = document.getElementById("cps");
const upgrades_c   = document.getElementById("upgrades_count");

const UPGRADES = [
    {
        id: 0,
        name: "First upgrade",
        cost: 500,
        gives: 1,
    },
    {
        id: 1,
        name: "Second upgrade",
        cost: 1800,
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
        key1: "KeyG",
        key2: "KeyH",
    },

    shop() {
        for (const i in UPGRADES) {
            const item = UPGRADES[i];

            const item_element = document.createElement("li");
            const div = document.createElement("div");
            const item_text = document.createTextNode(`${item.name}, ${item.cost}c`);
            const buy_button = document.createElement("button");

            buy_button.setAttribute("id", "item" + item.id);
            buy_button.onclick = this.buy(this, UPGRADES[item.id]);

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

        self.amount -= item.cost;
        self.cps += item.gives;
        self.upgrades[item.id] += 1;

        UPGRADES[item.id].cost = (UPGRADES[item.id].cost * 1.33).toFixed();
        let button = document.getElementById("item" + item.id);
        button.textContent = `${item.name}, ${item.cost}c`;

    },

    click() {
        this.amount += this.power;
    },

    invoke_cps() {
        this.amount += this.cps / 20;
    },

    initialize() {
        this.update();
    },

    update() {
        amount_text.textContent = this.amount.toFixed();
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
Cookiezi.shop();

setInterval(() => {
    Cookiezi.update();
    Cookiezi.invoke_cps();
}, 50)
