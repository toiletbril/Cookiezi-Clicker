"use strict";
/*
 * TODO:
 * - Display how much you've bought of each upgrade somewhere near the buy button.
 * - Display only nearest upgrades in the shop, and hide the rest.
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
const CPS_UPGRADES = [
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
    },
];
const CPS_COST_MULTIPLIER = 1.15;
const GENERAL_UPGRADES = [
    {
        id: 0,
        name: "Buldak",
        desc: "+0.6 tap power",
        cost: 520,
        action: (self) => {
            self.power += 0.6;
        }
    },
    {
        id: 1,
        name: "Better wire",
        desc: "Logitech is twice more effective",
        cost: 840,
        action: (self) => {
            CPS_UPGRADES[0].gives *= 2;
            self.update_passive_cps;
        }
    },
    {
        id: 2,
        name: "Mousepad",
        desc: "+1.2 tap power",
        cost: 1300,
        action: (self) => {
            self.power += 1.2;
        }
    },
    {
        id: 3,
        name: "Wacom",
        desc: "+3.2 tap power",
        cost: 4600,
        action: (self) => {
            self.power += 2.8;
        }
    },
    {
        id: 4,
        name: "Power outlet",
        desc: "Left click and drill become better",
        cost: 10640,
        action: (self) => {
            CPS_UPGRADES[1].gives *= 3;
            CPS_UPGRADES[2].gives *= 2;
            self.update_passive_cps;
        }
    },
    {
        id: 5,
        name: "Sugar",
        desc: "Vaxei goes godmode",
        cost: 18900,
        action: (self) => {
            CPS_UPGRADES[3].gives *= 2;
            self.update_passive_cps;
        }
    },
    {
        id: 6,
        name: "Tablet cover",
        desc: "Click power is doubled",
        cost: 31200,
        action: (self) => {
            self.power *= 2;
        }
    },
    {
        id: 7,
        name: "Cookiezi",
        desc: "Cookiezi",
        cost: 69420,
        action: (self) => {
            CPS_UPGRADES[4].gives *= 2;
            self.update_passive_cps;
        }
    }
];
////////////////////////
function assert(desc, cond) {
    if (!cond)
        throw new Error("Assertion failed: " + desc);
}
function create_upgrade_array(array) {
    return new Array(array.length).fill(0);
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
class Cookiezi {
    constructor() {
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
        this.cps_upgrades = create_upgrade_array(CPS_UPGRADES);
        this.upgrades = create_upgrade_array(GENERAL_UPGRADES);
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
    populate_cps_shop() {
        for (const i in CPS_UPGRADES) {
            const item = CPS_UPGRADES[i];
            const item_element = make_shop_item(item, `+${item.gives} CP/S`, "cps_item" + item.id, this.buy_cps(item));
            CPS_SHOP_ITEMS_LIST_ELEMENT.appendChild(item_element);
        }
    }
    populate_shop() {
        for (const i in GENERAL_UPGRADES) {
            const item = GENERAL_UPGRADES[i];
            const item_element = make_shop_item(item, item.desc, "item" + item.id, this.buy(item));
            GENERAL_SHOP_ITEMS_LIST_ELEMENT.appendChild(item_element);
        }
    }
    // Buy methods return an action that you can put on a button.
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
            CPS_UPGRADES[item.id].cost = Math.floor(CPS_UPGRADES[item.id].cost * CPS_COST_MULTIPLIER);
            // Update UI
            let button = document.getElementById("cps_item" + item.id);
            button.textContent = `${item.name}, ${item.cost}c`;
            self.update_passive_cps();
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
            item.action(self);
            // This is general upgrade, so no need to change the price. Intead, remove the item from shop.
            let button = document.getElementById("item" + item.id);
            button.disabled = true;
            self.update_passive_cps();
        };
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
        CPS_TEXT_ELEMENT.textContent = "CP/S: " + speed.toFixed(1) + " (" + Math.floor(speed * 60 / 4) + " BPM)";
        UPGRADES_COUNT_TEXT_ELEMENT.textContent = "Upgrades bought: " + this.cps_upgrades.reduce((a, b) => a + b, 0);
    }
    update_passive_cps() {
        let result_cps = 0;
        for (const i in this.cps_upgrades) {
            const item = CPS_UPGRADES[i];
            result_cps += item.gives * this.cps_upgrades[i];
            const button = document.getElementById("pcps_item" + i);
            button.textContent = `+${item.gives} CP/S`;
        }
        this.cps = result_cps;
    }
    update_cps() {
        if (this.clicks.is_tapping) {
            this.clicks.ticks += 1;
        }
        else if (this.clicks.ticks != TPS) {
            // NOTE:
            // TPS should be the beginning value instead of 0, because cp/s is being calculated as:
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
const cookiezi = new Cookiezi();
cookiezi.update();
cookiezi.populate_cps_shop();
cookiezi.populate_shop();
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
// Invoke CP/S even when tab is inactive
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
