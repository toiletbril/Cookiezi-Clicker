"use strict";
/*
 * TODO:
 * - Cascading style sheet
 */
////////////////////////
const AMOUNT_TEXT_ELEMENT = document.getElementById("amount");
const CPS_SHOP_ITEMS_LIST_ELEMENT = document.getElementById("cps_shop_items");
const GENERAL_SHOP_ITEMS_LIST_ELEMENT = document.getElementById("shop_items");
const TAP_POWER_TEXT_ELEMENT = document.getElementById("tap_power");
const CPS_TEXT_ELEMENT = document.getElementById("cps");
const UPGRADES_COUNT_TEXT_ELEMENT = document.getElementById("upgrades_count");
const CHANGE_KEYS_BUTTON_ELEMENT = document.getElementById("change_keys");
const KEYS_TEXT_ELEMENT = document.getElementById("keys");
const MAIN_DIV_ELEMENT = document.getElementById("main");
assert("All elements are not null", // dude dynamic languages
!!AMOUNT_TEXT_ELEMENT &&
    !!CPS_SHOP_ITEMS_LIST_ELEMENT &&
    !!GENERAL_SHOP_ITEMS_LIST_ELEMENT &&
    !!TAP_POWER_TEXT_ELEMENT &&
    !!CPS_SHOP_ITEMS_LIST_ELEMENT &&
    !!UPGRADES_COUNT_TEXT_ELEMENT &&
    !!CHANGE_KEYS_BUTTON_ELEMENT &&
    !!KEYS_TEXT_ELEMENT &&
    !!MAIN_DIV_ELEMENT);
const TPS = 40;
// NOTE: This is here to account for setTimeout's delays ;(
const TPS_ADJ = Math.floor(TPS - TPS / 9);
const KEY_COUNT = 2;
const CHANGE_KEYS_TEXT = "Change keys...";
const CHANGING_KEYS_TEXT = "Press new a new key...";
const CURRENT_KEYS_TEXT = (k1, k2, n) => `Tap ${n <= 0 ? "?" : k1.toUpperCase()}/${n <= 1 ? "?" : k2.toUpperCase()} to gain points.`;
const CENT = "¢";
////////////////////////
function assert(desc, cond) {
    if (!cond)
        throw new Error("Assertion failed: " + desc);
}
function create_cps_array(array) {
    return new Array(array.length).fill(0);
}
function create_multiplier_array(array) {
    return new Array(array.length).fill(1);
}
function make_shop_item(item, item_description, element_id, click_action) {
    const item_element = document.createElement("li");
    const div = document.createElement("div");
    const p = document.createElement("p");
    const item_text = document.createTextNode(`${item.name}, ${item.cost}${CENT}`);
    const buy_button = document.createElement("button");
    const desc = document.createTextNode(item_description);
    p.setAttribute("id", "p" + element_id);
    buy_button.setAttribute("id", element_id);
    item_element.setAttribute("id", "list_" + element_id);
    buy_button.onclick = click_action;
    buy_button.appendChild(item_text);
    div.appendChild(buy_button);
    p.appendChild(desc);
    div.appendChild(p);
    item_element.appendChild(div);
    return item_element;
}
////////////////////////
class Shop {
    constructor() {
        this.cps_upgrades = [
            {
                id: 0,
                name: "Logitech",
                cost: 80,
                gives: 0.4,
            },
            {
                id: 1,
                name: "Left click",
                cost: 240,
                gives: 1,
            },
            {
                id: 2,
                name: "A drill",
                cost: 860,
                gives: 4,
            },
            {
                id: 3,
                name: "Vaxei",
                cost: 6420,
                gives: 10,
            },
            {
                id: 4,
                name: "Cookiezi",
                cost: 24500,
                gives: 50,
            }
        ];
        this.cps_cost_multiplier = 1.15;
        this.general_upgrades = [
            {
                id: 0,
                name: "Buldak",
                desc: "Very spicy. +0.6 tap power",
                cost: 520,
                action: {
                    type: "tap_power",
                    value: 0.6
                }
            },
            {
                id: 1,
                name: "Better wire",
                desc: "Logitech is twice more effective.",
                cost: 840,
                action: {
                    type: "multiplier",
                    item_ids: [0],
                    value: 2
                }
            },
            {
                id: 2,
                name: "Mousepad",
                desc: "Less mouse drift. +1.2 tap power",
                cost: 1300,
                action: {
                    type: "tap_power",
                    value: 1.2
                }
            },
            {
                id: 3,
                name: "Wacom",
                desc: "+3.2 tap power",
                cost: 4600,
                action: {
                    type: "tap_power",
                    value: 3.2
                }
            },
            {
                id: 4,
                name: "Power outlet",
                desc: "Left click and drill become twice as effective.",
                cost: 10640,
                action: {
                    type: "multiplier",
                    item_ids: [1, 2],
                    value: 2
                }
            },
            {
                id: 5,
                name: "Sugar",
                desc: "Vaxei becomes twice as effective.",
                cost: 18900,
                action: {
                    type: "multiplier",
                    item_ids: [3],
                    value: 2
                }
            },
            {
                id: 6,
                name: "Tablet cover",
                desc: "Click power is doubled.",
                cost: 23200,
                action: {
                    type: "tap_power_multiplier",
                    value: 2
                }
            },
            {
                id: 7,
                name: "Cookiezi comeback",
                desc: "Cookiezi becomes twice as effective.",
                cost: 69420,
                action: {
                    type: "multiplier",
                    item_ids: [4],
                    value: 2
                }
            }
        ];
        this.cps_upgrades_bought = create_cps_array(this.cps_upgrades);
        this.upgrades_bought = create_cps_array(this.general_upgrades);
    }
    get_multipliers() {
        const result_array = new Array(this.cps_upgrades.length).fill(1);
        for (const i in this.general_upgrades) {
            if (this.upgrades_bought[i] === 0)
                continue;
            const upgrade = this.general_upgrades[i];
            if (upgrade?.action.type == "multiplier") {
                for (const j in upgrade.action.item_ids) {
                    const id = upgrade.action.item_ids[j];
                    result_array[id] *= this.upgrades_bought[id] * upgrade.action.value;
                }
            }
        }
        return result_array;
    }
    get_cps() {
        const multipliers = this.get_multipliers();
        assert("multipliers is valid length", multipliers.length === this.cps_upgrades.length);
        return this.cps_upgrades_bought
            .map((a, i) => a * multipliers[i] * this.cps_upgrades[i].gives)
            .reduce((a, b) => a + b);
    }
    get_tap_power() {
        let result = 1;
        let multiplier = 1;
        for (const i in this.upgrades_bought) {
            if (this.upgrades_bought[i] === 0)
                continue;
            const upgrade = this.general_upgrades[i];
            switch (upgrade?.action.type) {
                case "tap_power":
                    {
                        result += upgrade.action.value * this.upgrades_bought[i];
                    }
                    break;
                case "tap_power_multiplier":
                    {
                        multiplier *= upgrade.action.value * this.upgrades_bought[i];
                    }
                    break;
            }
        }
        return result * multiplier;
    }
    buy(item) {
        this.upgrades_bought[item.id] += 1;
        const button = document.getElementById("item" + item.id);
        button.disabled = true;
        this.update_shop_element();
        this.update_cps_shop_element();
    }
    buy_cps(item) {
        this.cps_upgrades_bought[item.id] += 1;
        this.cps_upgrades[item.id].cost = Math.floor(this.cps_upgrades[item.id].cost * this.cps_cost_multiplier);
        this.update_cps_shop_element();
    }
    update_shop_element() {
        for (const i in this.upgrades_bought) {
            const item = this.general_upgrades[i];
            if (this.upgrades_bought[i] > 0) {
                let button = document.getElementById("item" + item.id);
                button.disabled = true;
            }
            if (this.upgrades_bought[parseInt(i) - 1] > 0) {
                let li = document.getElementById("list_item" + item.id);
                li.hidden = false;
            }
        }
    }
    update_cps_shop_element() {
        const multipliers = this.get_multipliers();
        for (const i in this.cps_upgrades_bought) {
            const item = this.cps_upgrades[i];
            let button = document.getElementById("cps_item" + item.id);
            let desc = document.getElementById("pcps_item" + item.id);
            const count = this.cps_upgrades_bought[item.id];
            const producing = count > 0
                ? `| You have ${count}, producing ${(item.gives * count * multipliers[item.id]).toFixed(1)} ${CENT}/s`
                : "";
            button.textContent = `${item.name}, ${item.cost}${CENT}`;
            desc.textContent = `+${item.gives * multipliers[item.id]} ${CENT}/s\n
                                ${producing}`;
            if (this.cps_upgrades_bought[parseInt(i) - 1] > 0) {
                let li = document.getElementById("list_cps_item" + item.id);
                li.hidden = false;
            }
        }
    }
}
class Cookiezi {
    constructor(shop) {
        this.last_inactive_time = new Date().getTime();
        this.clicks = {
            is_tapping: false,
            stopped_interval: 0,
            tapped: 0,
            ticks: TPS
        };
        this.amount = 0;
        this.power = 1;
        this.cps = 0;
        this.shop = shop;
        this.settings = {
            keys: [
                {
                    key: "z",
                    is_down: false
                },
                {
                    key: "x",
                    is_down: false
                },
            ],
            is_changing_keys: -1
        };
    }
    initialize_shop() {
        for (const i in this.shop.cps_upgrades) {
            const item = this.shop.cps_upgrades[i];
            const item_element = make_shop_item(item, `+${item.gives} ${CENT}/s`, "cps_item" + item.id, this.buy_cps(item));
            if (parseInt(i) > 0)
                item_element.hidden = true;
            CPS_SHOP_ITEMS_LIST_ELEMENT.appendChild(item_element);
        }
        for (const i in this.shop.general_upgrades) {
            const item = this.shop.general_upgrades[i];
            const item_element = make_shop_item(item, item.desc, "item" + item.id, this.buy(item));
            if (parseInt(i) > 0)
                item_element.hidden = true;
            GENERAL_SHOP_ITEMS_LIST_ELEMENT.appendChild(item_element);
        }
    }
    // Buy methods return an action that you can put on a button.
    buy_cps(item) {
        const self = this;
        const shop = this.shop;
        return function () {
            if (self.amount < item.cost) {
                alert("Not enough " + CENT + " to buy \"" + item.name + "\" :(");
                return;
            }
            self.amount -= item.cost;
            shop.buy_cps(item);
            self.update_cps_shop_element();
            self.cps = self.shop.get_cps();
        };
    }
    buy(item) {
        const self = this;
        const shop = this.shop;
        return function () {
            if (self.amount < item.cost) {
                alert("Not enough " + CENT + " to buy \"" + item.name + "\" :(");
                return;
            }
            self.amount -= item.cost;
            shop.buy(item);
            self.update_shop_element();
            self.power = shop.get_tap_power();
            self.cps = shop.get_cps();
        };
    }
    update_cps_shop_element() {
        this.shop.update_cps_shop_element();
    }
    update_shop_element() {
        this.shop.update_shop_element();
    }
    // This is to avoid clicking when holding button down.
    press_key(k) {
        if (k.is_down)
            return;
        k.is_down = true;
        this.clicks.tapped += 1;
        this.click();
        this.clicks.is_tapping = true;
        clearInterval(this.clicks.stopped_interval);
        this.clicks.stopped_interval = setTimeout(() => {
            this.clicks.is_tapping = false;
        }, 1000);
    }
    unpress_key(k) {
        k.is_down = false;
    }
    click() {
        this.amount += this.power;
    }
    invoke_cps() {
        this.amount += this.cps / TPS;
    }
    update_elements() {
        const speed = this.cps + (this.clicks.tapped * TPS_ADJ / this.clicks.ticks);
        AMOUNT_TEXT_ELEMENT.textContent = Math.floor(this.amount).toString() + CENT;
        TAP_POWER_TEXT_ELEMENT.textContent = "Tap power: " + this.power;
        CPS_TEXT_ELEMENT.textContent = CENT + "/s: " + speed.toFixed(1) + " (" + Math.floor(speed * 60 / 4) + " BPM)";
        UPGRADES_COUNT_TEXT_ELEMENT.textContent = "Upgrades bought: " + this.shop.cps_upgrades_bought.reduce((a, b) => a + b, 0);
    }
    update_passive_cps() {
        this.cps = this.shop.get_cps();
    }
    update_cps() {
        if (this.clicks.is_tapping) {
            this.clicks.ticks += 1;
        }
        else if (this.clicks.ticks != TPS) {
            // NOTE:
            // TPS should be the beginning value instead of 0, because CP/s is being calculated as:
            // TOTAL_TAPPED * TPS / TICKS -> TOTAL_TAPPED / SECONDS_PASSED
            this.clicks.tapped = Math.floor(this.clicks.tapped / this.clicks.ticks * TPS_ADJ);
            this.clicks.ticks = TPS;
        }
        else if (this.clicks.tapped > 0) {
            this.clicks.tapped -= 1;
        }
    }
    update() {
        this.invoke_cps();
        this.update_cps();
        this.update_elements();
    }
}
////////////////////////
const shop = new Shop();
const cookiezi = new Cookiezi(shop);
cookiezi.initialize_shop();
assert("settings.keys is of KEY_COUNT size", cookiezi.settings.keys.length == KEY_COUNT);
setInterval(() => {
    cookiezi.update();
}, 1000 / TPS);
document.addEventListener("keydown", (k) => {
    const k1 = cookiezi.settings.keys[0];
    const k2 = cookiezi.settings.keys[1];
    if (cookiezi.settings.is_changing_keys >= 0) {
        cookiezi.settings.keys[cookiezi.settings.is_changing_keys].key = k.key;
        cookiezi.settings.is_changing_keys += 1;
        KEYS_TEXT_ELEMENT.textContent = CURRENT_KEYS_TEXT(k1.key, k2.key, cookiezi.settings.is_changing_keys);
        if (cookiezi.settings.is_changing_keys >= KEY_COUNT) {
            cookiezi.settings.is_changing_keys = -1;
            CHANGE_KEYS_BUTTON_ELEMENT.textContent = CHANGE_KEYS_TEXT;
        }
        return;
    }
    switch (k.key.toLowerCase()) {
        case k1.key:
            {
                cookiezi.press_key(k1);
            }
            break;
        case k2.key:
            {
                cookiezi.press_key(k2);
            }
            break;
    }
});
document.addEventListener("keyup", (k) => {
    const k1 = cookiezi.settings.keys[0];
    const k2 = cookiezi.settings.keys[1];
    switch (k.key.toLowerCase()) {
        case k1.key:
            {
                cookiezi.unpress_key(k1);
            }
            break;
        case k2.key:
            {
                cookiezi.unpress_key(k2);
            }
            break;
    }
});
CHANGE_KEYS_BUTTON_ELEMENT.onclick = (() => {
    const k1 = cookiezi.settings.keys[0];
    const k2 = cookiezi.settings.keys[1];
    cookiezi.settings.is_changing_keys = 0;
    KEYS_TEXT_ELEMENT.textContent = CURRENT_KEYS_TEXT(k1.key, k2.key, cookiezi.settings.is_changing_keys);
    CHANGE_KEYS_BUTTON_ELEMENT.textContent = CHANGING_KEYS_TEXT;
});
// Invoke CP/s even when tab is inactive
window.onfocus = () => {
    const current_time = new Date().getTime();
    const time_difference = current_time - cookiezi.last_inactive_time;
    if (time_difference > 1000) {
        cookiezi.amount += cookiezi.cps * (time_difference / 1000);
    }
};
window.onblur = () => {
    cookiezi.last_inactive_time = new Date().getTime();
};
