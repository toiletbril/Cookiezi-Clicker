/*
 * TODO:
 * - Display only nearest upgrades in the shop, and hide the rest.
 * - Cascading style sheet =D
 *
 */

////////////////////////

const AMOUNT_TEXT_ELEMENT = document.getElementById("amount") as HTMLElement;
const CPS_SHOP_ITEMS_LIST_ELEMENT = document.getElementById("cps_shop_items") as HTMLUListElement;
const GENERAL_SHOP_ITEMS_LIST_ELEMENT = document.getElementById("shop_items") as HTMLUListElement;
const TAP_POWER_TEXT_ELEMENT = document.getElementById("tap_power") as HTMLElement;
const CPS_TEXT_ELEMENT = document.getElementById("cps") as HTMLElement;
const UPGRADES_COUNT_TEXT_ELEMENT = document.getElementById("upgrades_count") as HTMLElement;
const CHANGE_KEYS_BUTTON_ELEMENT = document.getElementById("change_keys") as HTMLButtonElement;
const KEYS_TEXT_ELEMENT = document.getElementById("keys") as HTMLButtonElement;
const MAIN_DIV_ELEMENT = document.getElementById("main") as HTMLDivElement;

assert("All elements are not null", // dude dynamic languages
    !!AMOUNT_TEXT_ELEMENT &&
    !!CPS_SHOP_ITEMS_LIST_ELEMENT &&
    !!GENERAL_SHOP_ITEMS_LIST_ELEMENT &&
    !!TAP_POWER_TEXT_ELEMENT &&
    !!CPS_SHOP_ITEMS_LIST_ELEMENT &&
    !!UPGRADES_COUNT_TEXT_ELEMENT &&
    !!CHANGE_KEYS_BUTTON_ELEMENT &&
    !!KEYS_TEXT_ELEMENT &&
    !!MAIN_DIV_ELEMENT
);

const TPS = 40;

const KEY_COUNT = 2;
const CHANGE_KEYS_TEXT = "Change keys..."
const CHANGING_KEYS_TEXT = "Press new a new key..."
const CURRENT_KEYS_TEXT = (k1: string, k2: string, n: number) =>
    `Tap ${k1.toUpperCase()}/${n == 1 ? k2.toUpperCase() : "?"} to gain points.`

const CENT = "¢";

const CPS_UPGRADES: ICpsUpgrade[] = [
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
]

const CPS_COST_MULTIPLIER = 1.15;

const GENERAL_UPGRADES: IGeneralUpgrade[] = [
    {
        id: 0,
        name: "Buldak",
        desc: "+0.6 tap power",
        cost: 520,
        action: (self: Cookiezi) => {
            self.power += 0.6;
        }
    },
    {
        id: 1,
        name: "Mousepad",
        desc: "+1.2 tap power",
        cost: 1100,
        action: (self: Cookiezi) => {
            self.power += 1.2;
        }
    }
]

////////////////////////

function assert(desc: string, cond: boolean): void {
    if (!cond) throw new Error("Assertion failed: " + desc);
}

function create_upgrade_array<T>(array: Array<T>): Array<number> {
    return new Array<number>(array.length).fill(0);
}

function make_shop_item(item: ICpsUpgrade | IGeneralUpgrade, item_description: string,
                        element_id: string, click_action: () => void): HTMLLIElement {
    const item_element = document.createElement("li");
    const div = document.createElement("div");
    const p = document.createElement("p")
    const item_text = document.createTextNode(`${item.name}, ${item.cost}${CENT}`);
    const buy_button = document.createElement("button");
    const desc = document.createTextNode(item_description)

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

interface ICpsUpgrade {
    id: number,
    name: string,
    cost: number,
    gives: number
}

interface IGeneralUpgrade {
    id: number,
    name: string,
    desc: string,
    cost: number,
    action: (self: Cookiezi) => void
}

interface IKey {
    key: string,
    is_down: boolean
}

interface ISettings {
    keys: IKey[],
    is_changing_keys: number
}

////////////////////////

class Cookiezi {
    amount: number;
    power: number;
    cps: number;

    cps_upgrades: number[];
    upgrades: number[];

    settings: ISettings;

    constructor() {
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
        }
    }

    last_inactive_time = new Date().getTime();

    clicks = {
        is_tapping: false,
        stopped_interval: 0,
        tapped: 0,
        ticks: TPS
    }

    populate_cps_shop(): void {
        for (const i in CPS_UPGRADES) {
            const item = CPS_UPGRADES[i]!;
            const item_element = make_shop_item(item, `+${item.gives} CP/S`, "cps_item" + item.id, this.buy_cps(item));
            CPS_SHOP_ITEMS_LIST_ELEMENT.appendChild(item_element);
        }
    }

    populate_shop(): void {
        for (const i in GENERAL_UPGRADES) {
            const item = GENERAL_UPGRADES[i]!;
            const item_element = make_shop_item(item, item.desc, "item" + item.id, this.buy(item));
            GENERAL_SHOP_ITEMS_LIST_ELEMENT.appendChild(item_element);
        }
    }

    // Buy methods return an action that you can put on a button.
    buy_cps(item: ICpsUpgrade): () => void {
        const self = this;
        return function () {
            if (self.amount < item.cost) {
                alert("Not enough amount to buy \"" + item.name + "\" :(");
                return;
            }

            self.amount -= item.cost;
            self.cps_upgrades[item.id] += 1;

            // Increase price
            CPS_UPGRADES[item.id]!.cost = Math.floor(CPS_UPGRADES[item.id]!.cost * CPS_COST_MULTIPLIER);

            // Update UI
            let button = document.getElementById("cps_item" + item.id) as HTMLButtonElement;
            button.textContent = `${item.name}, ${item.cost}c`;

            self.update_passive_cps();
        }
    }

    buy(item: IGeneralUpgrade): () => void {
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
            let div = document.getElementById("list_item" + item.id) as HTMLDivElement;
            div.hidden = true;

            self.update_passive_cps();
        }
    }

    // This is to avoid clicking when holding button down.
    press_key(k: IKey): void {
        if (k.is_down) return;

        k.is_down = true;
        this.clicks.tapped += 1;
        this.click();

        this.clicks.is_tapping = true;

        clearInterval(this.clicks.stopped_interval);

        this.clicks.stopped_interval = setTimeout(() => {
            this.clicks.is_tapping = false;
        }, 1000)
    }

    unpress_key(k: IKey): void {
        k.is_down = false;
    }

    click(): void {
        this.amount += this.power;
    }

    invoke_cps(): void {
        this.amount += this.cps / TPS;
    }

    update_elements(): void {
        // NOTE: Adjusting TPS here to account for setTimeout's delays shrug
        const tps_adj = Math.floor(TPS - TPS / 5);
        const speed = this.cps + (this.clicks.tapped * tps_adj / this.clicks.ticks);

        AMOUNT_TEXT_ELEMENT.textContent = Math.floor(this.amount).toString() + CENT;
        TAP_POWER_TEXT_ELEMENT.textContent = "Tap power: " + this.power;
        CPS_TEXT_ELEMENT.textContent = "CP/S: " + speed.toFixed(1) + " (" + Math.round(speed * 60 / 4) + " BPM)";
        UPGRADES_COUNT_TEXT_ELEMENT.textContent = "Upgrades bought: " + this.cps_upgrades.reduce((a, b) => a + b, 0);
    }

    update_passive_cps(): void {
        let result_cps = 0;

        for (const i in this.cps_upgrades) {
            result_cps += CPS_UPGRADES[i]!.gives * this.cps_upgrades[i]!;
        }

        this.cps = result_cps;
    }

    update_cps(): void {
        if (this.clicks.is_tapping) {
            this.clicks.ticks += 1;
        } else if (this.clicks.ticks != TPS) {
            // NOTE:
            // TPS should be the beginning value instead of 0, because cp/s is being calculated as:
            // TOTAL_TAPPED * TPS / TICKS -> TOTAL_TAPPED / SECONDS_PASSED
            this.clicks.tapped = Math.floor(this.clicks.tapped / this.clicks.ticks * TPS);
            this.clicks.ticks = TPS;
        } else if (this.clicks.tapped > 0) {
            this.clicks.tapped -= 1;
        }
    }

    update(): void {
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
}, 1000 / TPS)

document.addEventListener("keydown", (k) => {
    const k1 = cookiezi.settings.keys[0]!;
    const k2 = cookiezi.settings.keys[1]!;

    if (cookiezi.settings.is_changing_keys >= 0) {
        cookiezi.settings.keys[cookiezi.settings.is_changing_keys]!.key = k.key;
        KEYS_TEXT_ELEMENT.textContent = CURRENT_KEYS_TEXT(k1.key, k2.key, cookiezi.settings.is_changing_keys);
        cookiezi.settings.is_changing_keys += 1;

        if (cookiezi.settings.is_changing_keys >= KEY_COUNT) {
            cookiezi.settings.is_changing_keys = -1;
            CHANGE_KEYS_BUTTON_ELEMENT.textContent = CHANGE_KEYS_TEXT;
        }
        return;
    }

    switch (k.key.toLowerCase()) {
        case k1.key: {
            cookiezi.press_key(k1);
        } break;
        case k2.key: {
            cookiezi.press_key(k2);
        } break;
    }
});

document.addEventListener("keyup", (k) => {
    const k1 = cookiezi.settings.keys[0]!;
    const k2 = cookiezi.settings.keys[1]!;

    switch (k.key.toLowerCase()) {
        case k1.key: {
            cookiezi.unpress_key(k1);
        } break;
        case k2.key: {
            cookiezi.unpress_key(k2);
        } break;
    }
});

CHANGE_KEYS_BUTTON_ELEMENT.onclick = (() => {
    cookiezi.settings.is_changing_keys = 0;
    CHANGE_KEYS_BUTTON_ELEMENT.textContent = CHANGING_KEYS_TEXT;
});

// Invoke CP/S even when tab is inactive
window.onfocus = () => {
    let current_time = new Date().getTime();
    let time_difference = current_time - cookiezi.last_inactive_time;
    if (time_difference > 1000) {
        cookiezi.amount += cookiezi.cps * (time_difference / 1000);
    }
}

window.onblur = () => {
    cookiezi.last_inactive_time = new Date().getTime();
}
