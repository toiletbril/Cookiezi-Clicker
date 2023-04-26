"use strict";
const amount_text = document.getElementById("amount");
const cps_shop_items = document.getElementById("cps_shop_items");
const power_shop_items = document.getElementById("power_shop_items");
const tap_power = document.getElementById("tap_power");
const cps = document.getElementById("cps");
const upgrades_c = document.getElementById("upgrades_count");
const CPS_UPGRADES = [
    {
        id: 0,
        name: "First CP/S upgrade",
        cost: 100,
        gives: 1,
    },
    {
        id: 1,
        name: "Second CP/S upgrade",
        cost: 400,
        gives: 2,
    },
    {
        id: 2,
        name: "Third CP/S upgrade",
        cost: 1600,
        gives: 3,
    },
];
const GENERAL_UPGRADES = [
    {
        id: 0,
        name: "First upgrade",
        desc: "+1 tap power",
        cost: 1000,
        gives: {
            power: 1
        }
    }
];
const UPGRADE_MULTIPLIER = 1.15;
function create_upgrade_array(arr) {
    let a = new Array;
    arr.forEach(() => a.push(0));
    return a;
}
class Cookiezi {
    constructor() {
        this.amount = 0;
        this.power = 1;
        this.cps = 0;
        this.cps_upgrades = create_upgrade_array(CPS_UPGRADES);
        this.upgrades = create_upgrade_array(GENERAL_UPGRADES);
        this.settings = {
            key1: {
                code: "KeyG",
                is_down: false
            },
            key2: {
                code: "KeyH",
                is_down: false
            }
        };
    }
    populate_cps_shop() {
        for (const i in CPS_UPGRADES) {
            const item = CPS_UPGRADES[i];
            const item_element = document.createElement("li");
            const div = document.createElement("div");
            const item_text = document.createTextNode(`${item.name}, ${item.cost}c`);
            const buy_button = document.createElement("button");
            const gives = document.createTextNode("+" + item.gives + " CP/S");
            buy_button.setAttribute("id", "cps_item" + item.id);
            buy_button.onclick = this.buy_cps(item);
            buy_button.appendChild(item_text);
            div.appendChild(buy_button);
            div.appendChild(gives);
            item_element.appendChild(div);
            cps_shop_items.appendChild(item_element);
        }
    }
    populate_shop() {
        for (const i in GENERAL_UPGRADES) {
            const item = GENERAL_UPGRADES[i];
            const item_element = document.createElement("li");
            const div = document.createElement("div");
            const item_text = document.createTextNode(`${item.name}, ${item.cost}c`);
            const buy_button = document.createElement("button");
            const desc = document.createTextNode(item.desc);
            buy_button.setAttribute("id", "power_item" + item.id);
            buy_button.onclick = this.buy(item);
            buy_button.appendChild(item_text);
            div.appendChild(buy_button);
            div.appendChild(desc);
            item_element.appendChild(div);
            power_shop_items.appendChild(item_element);
        }
    }
    buy_cps(item) {
        const self = this;
        return function () {
            if (self.amount < item.cost) {
                alert("Not enough amount to buy \"" + item.name + "\" :(");
                return;
            }
            self.amount -= item.cost;
            self.cps_upgrades[item.id] += 1;
            // Increase price
            CPS_UPGRADES[item.id].cost = Math.floor(CPS_UPGRADES[item.id].cost * UPGRADE_MULTIPLIER);
            // Update UI
            let button = document.getElementById("cps_item" + item.id);
            button.textContent = `${item.name}, ${item.cost}c`;
            self.update_item_stats();
        };
    }
    buy(item) {
        const self = this;
        return function () {
            if (self.amount < item.cost) {
                alert("Not enough amount to buy \"" + item.name + "\" :(");
                return;
            }
            self.amount -= item.cost;
            self.upgrades[item.id] += 1;
            // This is general upgrade, so no need to change the price. Intead, remove the item from shop.
            let button = document.getElementById("power_item" + item.id);
            button.disabled = true;
            self.update_item_stats();
        };
    }
    press_key(k) {
        if (k.is_down)
            return;
        k.is_down = true;
        this.click();
    }
    unpress_key(k) {
        k.is_down = false;
    }
    click() {
        this.amount += this.power;
    }
    invoke_cps() {
        this.amount += this.cps / 20;
    }
    update_text() {
        amount_text.textContent = Math.floor(this.amount).toString();
        tap_power.textContent = "Tap power: " + this.power;
        cps.textContent = "CP/S: " + this.cps;
        upgrades_c.textContent = "Upgrades count: " + this.cps_upgrades.reduce((a, b) => a + b, 0);
    }
    update_item_stats() {
        let result_cps = 0;
        let result_power = 0;
        for (const i in this.cps_upgrades) {
            result_cps += CPS_UPGRADES[i].gives * this.cps_upgrades[i];
        }
        for (const i in this.upgrades) {
            // todo
        }
        this.power = result_power;
        this.cps = result_cps;
    }
    update() {
        this.invoke_cps();
        this.update_text();
    }
}
const cookiezi = new Cookiezi();
cookiezi.update();
cookiezi.populate_cps_shop();
cookiezi.populate_shop();
setInterval(() => {
    cookiezi.update();
}, 50);
document.addEventListener("keydown", (k) => {
    let k1 = cookiezi.settings.key1;
    let k2 = cookiezi.settings.key2;
    switch (k.code) {
        case k1.code:
            {
                cookiezi.press_key(k1);
            }
            break;
        case k2.code:
            {
                cookiezi.press_key(k2);
            }
            break;
    }
});
document.addEventListener("keyup", (k) => {
    let k1 = cookiezi.settings.key1;
    let k2 = cookiezi.settings.key2;
    switch (k.code) {
        case k1.code:
            {
                cookiezi.unpress_key(k1);
            }
            break;
        case k2.code:
            {
                cookiezi.unpress_key(k2);
            }
            break;
    }
});
