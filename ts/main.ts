/*
 * TODO:
 * - Cascading style sheet
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

// NOTE: This is here to account for setTimeout's delays ;(
const TPS_ADJ = Math.floor(TPS - TPS / 9);

const KEY_COUNT = 2;
const CHANGE_KEYS_TEXT = "Change keys..."
const CHANGING_KEYS_TEXT = "Press new a new key..."
const CURRENT_KEYS_TEXT = (k1: string, k2: string, n: number) =>
    `Tap ${n <= 0 ? "?" : k1.toUpperCase()}/${n <= 1 ? "?" : k2.toUpperCase()} to gain points.`

const CENT = "¢";
const FORMAT_CHAR = ",";

////////////////////////

function assert(desc: string, cond: boolean): void {
    if (!cond) throw new Error("Assertion failed: " + desc);
}

function create_cps_array<T>(array: Array<T>): Array<number> {
    return new Array<number>(array.length).fill(0);
}

function create_multiplier_array<T>(array: Array<T>): Array<number> {
    return new Array<number>(array.length).fill(1);
}

// 1000000 -> 1,000,000
function format_number(n: number, fixed: number): string {
    // Regex version
    return n.toFixed(fixed).replace(/\B(?=(\d{3})+(?!\d))/g, FORMAT_CHAR);

    // Normal version, breaks with very large numbers
    /*
    if (n < 1000) return n.toString();
    let result = "";

    while (n > 999) {
        let c = n % 1000;
        let new_char = c < 10 ? "00" + c
                     : c < 100 ? "0" + c
                     : c

        result += FORMAT_CHAR + new_char;
        n = Math.floor((n - (n % 100)) / 1000);
    }

    return n + result;
    */
}

function make_shop_item(item: ICpsUpgrade | IGeneralUpgrade, item_description: string,
    element_id: string, click_action: () => void): HTMLLIElement {
    const item_element = document.createElement("li");
    const div = document.createElement("div");
    const p = document.createElement("p");
    const item_text = document.createTextNode(`${item.name}, ${item.cost}${CENT}`);
    const buy_button = document.createElement("button");
    const desc = document.createTextNode(item_description)

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

interface ICpsUpgrade {
    id: number,
    name: string,
    cost: number,
    gives: number
}

type ActionType = "multiplier"
                | "tap_power"
                | "tap_power_multiplier"

interface IGeneralUpgrade {
    id: number,
    name: string,
    desc: string,
    cost: number,
    action: {
        type: ActionType,
        value: number,
        item_ids?: number[]
    }
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

class Shop {
    cps_upgrades: ICpsUpgrade[] = [
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
    ]

    cps_cost_multiplier = 1.15;

    general_upgrades: IGeneralUpgrade[] = [
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
    ]

    cps_upgrades_bought: number[];
    upgrades_bought: number[];

    constructor() {
        this.cps_upgrades_bought = create_cps_array(this.cps_upgrades);
        this.upgrades_bought = create_cps_array(this.general_upgrades);
    }

    get_multipliers(): Array<number> {
        const result_array = new Array<number>(this.cps_upgrades.length).fill(1);

        for (const i in this.general_upgrades) {
            if (this.upgrades_bought[i] === 0) continue;
            const upgrade = this.general_upgrades[i];

            if (upgrade?.action.type === "multiplier") {
                for (const j in upgrade.action.item_ids!) {
                    const id = upgrade.action.item_ids[j]!;
                    result_array[id] *= this.upgrades_bought[id]! * upgrade.action.value;
                }
            }
        }
        return result_array;
    }

    get_cps() {
        const multipliers = this.get_multipliers()!;
        assert("multipliers is valid length", multipliers.length === this.cps_upgrades.length);
        return this.cps_upgrades_bought
            .map((a, i) => a * multipliers[i]! * this.cps_upgrades[i]!.gives)
            .reduce((a, b) => a + b);
    }

    get_tap_power() {
        let result = 1;
        let multiplier = 1;

        for (const i in this.upgrades_bought) {
            if (this.upgrades_bought[i] === 0) continue;
            const upgrade = this.general_upgrades[i];

            switch (upgrade?.action.type) {
                case "tap_power": {
                    result += upgrade.action.value * this.upgrades_bought[i]!;
                } break;
                case "tap_power_multiplier": {
                    multiplier *= upgrade.action.value * this.upgrades_bought[i]!;
                } break;
            }
        }
        return result * multiplier;
    }

    buy(item: IGeneralUpgrade) {
        this.upgrades_bought[item.id] += 1;

        const button = document.getElementById("item" + item.id) as HTMLButtonElement;
        button.disabled = true;

        this.update_shop_element();
        this.update_cps_shop_element();
    }

    buy_cps(item: ICpsUpgrade) {
        this.cps_upgrades_bought[item.id] += 1;
        this.cps_upgrades[item.id]!.cost = Math.floor(
            this.cps_upgrades[item.id]!.cost * this.cps_cost_multiplier);
        this.update_cps_shop_element();
    }

    update_shop_element() {
        for (const i in this.upgrades_bought) {
            const item = this.general_upgrades[i]!;

            if (this.upgrades_bought[i]! > 0) {
                let button = document.getElementById("item" + item.id) as HTMLButtonElement;
                button.disabled = true;
            }

            if (this.upgrades_bought[parseInt(i) - 1]! > 0) {
                let li = document.getElementById("list_item" + item.id) as HTMLLIElement;
                li.hidden = false;
            }
        }
    }

    update_cps_shop_element() {
        const multipliers = this.get_multipliers();
        for (const i in this.cps_upgrades_bought) {
            const item = this.cps_upgrades[i]!;

            let button = document.getElementById("cps_item" + item.id) as HTMLButtonElement;
            let desc = document.getElementById("pcps_item" + item.id) as HTMLParagraphElement;

            const count = this.cps_upgrades_bought[item.id]!;
            const producing = count > 0
                ? `| You have ${count}, producing ${(item.gives * count * multipliers[item.id]!).toFixed(1)} ${CENT}/s`
                : "";

            button.textContent = `${item.name}, ${item.cost}${CENT}`;
            desc.textContent = `+${item.gives * multipliers[item.id]!} ${CENT}/s\n
                                ${producing}`;

            if (this.cps_upgrades_bought[parseInt(i) - 1]! > 0) {
                let li = document.getElementById("list_cps_item" + item.id) as HTMLLIElement;
                li.hidden = false;
            }
        }
    }
}

class Cookiezi {
    amount: number;
    power: number;
    cps: number;

    settings: ISettings;
    shop: Shop;

    constructor(shop: Shop) {
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
        }
    }

    last_inactive_time = new Date().getTime();

    clicks = {
        stopped_interval: 0,
        is_tapping: false,
        tapped: 0,
        ticks: TPS
    }

    initialize_shop() {
        for (const i in this.shop.cps_upgrades) {
            const item = this.shop.cps_upgrades[i]!;
            const item_element = make_shop_item(item, `+${item.gives} ${CENT}/s`, "cps_item" + item.id, this.buy_cps(item));

            if (parseInt(i) > 0) item_element.hidden = true;
            CPS_SHOP_ITEMS_LIST_ELEMENT.appendChild(item_element);
        }

        for (const i in this.shop.general_upgrades) {
            const item = this.shop.general_upgrades[i]!;
            const item_element = make_shop_item(item, item.desc, "item" + item.id, this.buy(item));

            if (parseInt(i) > 0) item_element.hidden = true;
            GENERAL_SHOP_ITEMS_LIST_ELEMENT.appendChild(item_element);
        }
    }

    // Buy methods return an action that you can put on a button.
    buy_cps(item: ICpsUpgrade): () => void {
        const self = this;
        return function () {
            if (self.amount < item.cost) {
                alert("Not enough " + CENT + " to buy \"" + item.name + "\" :(");
                return;
            }
            self.amount -= item.cost;

            self.shop.buy_cps(item);
            self.update_cps_shop_element();

            self.cps = self.shop.get_cps();
        }
    }

    buy(item: IGeneralUpgrade): () => void {
        const self = this;
        return function () {
            if (self.amount < item.cost) {
                alert("Not enough " + CENT + " to buy \"" + item.name + "\" :(");
                return;
            }
            self.amount -= item.cost;

            self.shop.buy(item);

            self.update_shop_element();

            self.power = self.shop.get_tap_power();
            self.cps = self.shop.get_cps();
        }
    }

    update_cps_shop_element(): void {
        this.shop.update_cps_shop_element();
    }

    update_shop_element(): void {
        this.shop.update_shop_element();
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
        const speed = this.cps + (this.clicks.tapped * TPS_ADJ / this.clicks.ticks);

        AMOUNT_TEXT_ELEMENT.textContent = format_number(Math.floor(this.amount), 0) + CENT;
        CPS_TEXT_ELEMENT.textContent = CENT + "/s: " + format_number(speed, 1) + " (" + Math.floor(speed * 60 / 4) + " BPM)";
        TAP_POWER_TEXT_ELEMENT.textContent = "Tap power: " + this.power;
        UPGRADES_COUNT_TEXT_ELEMENT.textContent = "Upgrades bought: " + this.shop.cps_upgrades_bought.reduce((a, b) => a + b, 0);
    }

    update_passive_cps(): void {
        this.cps = this.shop.get_cps();
    }

    update_cps(): void {
        if (this.clicks.is_tapping) {
            this.clicks.ticks += 1;
        } else if (this.clicks.ticks != TPS) {
            // NOTE:
            // TPS should be the beginning value instead of 0, because CP/s is being calculated as:
            // TOTAL_TAPPED * TPS / TICKS -> TOTAL_TAPPED / SECONDS_PASSED
            this.clicks.tapped = Math.floor(this.clicks.tapped / this.clicks.ticks * TPS_ADJ);
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

const shop = new Shop();
const cookiezi = new Cookiezi(shop);

cookiezi.initialize_shop();

assert("settings.keys is of KEY_COUNT size", cookiezi.settings.keys.length === KEY_COUNT);

setInterval(() => {
    cookiezi.update();
}, 1000 / TPS)

document.addEventListener("keydown", (k) => {
    const k1 = cookiezi.settings.keys[0]!;
    const k2 = cookiezi.settings.keys[1]!;

    if (cookiezi.settings.is_changing_keys >= 0) {
        cookiezi.settings.keys[cookiezi.settings.is_changing_keys]!.key = k.key;

        cookiezi.settings.is_changing_keys += 1;
        KEYS_TEXT_ELEMENT.textContent = CURRENT_KEYS_TEXT(k1.key, k2.key, cookiezi.settings.is_changing_keys);

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
    const k1 = cookiezi.settings.keys[0]!;
    const k2 = cookiezi.settings.keys[1]!;

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
}

window.onblur = () => {
    cookiezi.last_inactive_time = new Date().getTime();
}
