  //===========================================//
 /*                                            *
 *             Cookiezi Clicker :3             *
 *                     by                      *
 *              toiletbril@github              *
 *                                            */
//===========================================//

 /*
TODO:
  - Cooler descriptions
  - Cascase style sheet
 */

//===========================================//

const AMOUNT_TEXT_ELEMENT
    = document.getElementById("amount") as HTMLElement;
const CPS_SHOP_ITEMS_LIST_ELEMENT
    = document.getElementById("cps_shop_items") as HTMLUListElement;
const GENERAL_SHOP_ITEMS_LIST_ELEMENT
    = document.getElementById("shop_items") as HTMLUListElement;
const TAP_POWER_TEXT_ELEMENT
    = document.getElementById("tap_power") as HTMLElement;
const CPS_TEXT_ELEMENT
    = document.getElementById("cps") as HTMLElement;
const UPGRADES_COUNT_TEXT_ELEMENT
    = document.getElementById("upgrades_count") as HTMLElement;
const CHANGE_KEYS_BUTTON_ELEMENT
    = document.getElementById("change_keys") as HTMLButtonElement;
const KEYS_TEXT_ELEMENT
    = document.getElementById("keys") as HTMLButtonElement;
const MAIN_DIV_ELEMENT
    = document.getElementById("main") as HTMLDivElement;
const BPM_TEXT_ELEMENT
    = document.getElementById("bpm") as HTMLHeadingElement;

assert("All elements are not null",
    !!AMOUNT_TEXT_ELEMENT &&
    !!CPS_SHOP_ITEMS_LIST_ELEMENT &&
    !!GENERAL_SHOP_ITEMS_LIST_ELEMENT &&
    !!TAP_POWER_TEXT_ELEMENT &&
    !!CPS_SHOP_ITEMS_LIST_ELEMENT &&
    !!UPGRADES_COUNT_TEXT_ELEMENT &&
    !!CHANGE_KEYS_BUTTON_ELEMENT &&
    !!KEYS_TEXT_ELEMENT &&
    !!BPM_TEXT_ELEMENT &&
    !!MAIN_DIV_ELEMENT
);

const TPS = 40;

// This is here to account for setTimeout's delays ;(
const TPS_ADJ = Math.floor(TPS - TPS / 11);

const KEY_COUNT = 2;

const CHANGE_KEYS_TEXT
    = "Change keys..."
const CHANGING_KEYS_TEXT
    = "Press a new key..."
const CURRENCY_TEXT =
    "pp";
const TAP_POWER_TEXT =
    "pp/tap";
const FORMAT_CHAR =
    ",";

const CPS_COST_MULTIPLIER = 1.15;

//===========================================//

function assert(desc: string, cond: boolean): void {
    if (!cond) throw new Error("Assertion failed: " + desc);
}

function make_current_keys_text(k1: string, k2: string, n: number): string {
    return `Tap ${n <= 0 ? "?" : k1.toUpperCase()}/${n <= 1 ? "?" : k2.toUpperCase()} to gain pp.`;
}

// 1000000 -> 1,000,000
function format_number(n: number, fixed: number): string {
    // Regex version is better :3
    return n.toFixed(fixed).replace(/\B(?=(\d{3})+(?!\d))/g, FORMAT_CHAR);
}

function make_shop_item(item: ICpsUpgrade | IGeneralUpgrade, stat_text: string,
    item_type: "cps_item" | "item", click_action: () => void): HTMLLIElement {

    const item_element =
        document.createElement("li");
    const buy_button =
        document.createElement("button");
    const div =
        document.createElement("div");
    const desc_div =
        document.createElement("div");
    const p_desc =
        document.createElement("p");
    const p_stat =
        document.createElement("p");

    const item_text = document.createTextNode
        (`${item.name}, ${item.cost}${CURRENCY_TEXT}`);
    const stats = document.createTextNode
        (stat_text);
    const desc = document.createTextNode
        (item.desc);

    buy_button.onclick = click_action;

    const id = item_type + item.id;

    // LIST ITEM: list_item1
    item_element
        .setAttribute("id", "list_" + id);
    // BUTTON: button_cps_item0
    buy_button
        .setAttribute("id", "button_" + id);
    // STATS STRING: p_stat_item3
    p_stat
        .setAttribute("id", "p_stat_" + id);
    // DESC STRING: p_cps_item2
    p_desc
        .setAttribute("id", "p_" + id);
    // DIV WITH TEXT: desc_div_item5
    desc_div
        .setAttribute("id", "desc_div_" + id);
    // DIV WITH TEXT: div_item5
    div
        .setAttribute("id", "div_" + id);

    buy_button.appendChild(item_text);

    p_stat.appendChild(stats);
    p_desc.appendChild(desc);

    desc_div.appendChild(p_desc);
    desc_div.appendChild(p_stat);

    if (item_type == "cps_item") {
        const p_producing = document.createElement("p");
        // NUMBER OF CPS THAT ITEM IS PRODUING: p_producing_cps_item3
        p_producing
            .setAttribute("id", "p_producing_" + id);
        desc_div.appendChild(p_producing);
    }

    div.appendChild(buy_button);
    div.appendChild(desc_div);

    item_element.appendChild(div);

    return item_element;
}

//===========================================//

interface ICpsUpgrade {
    id: number,
    name: string,
    desc: string,
    cost: number,
    gives: number
}

type ActionType = "multiplier"
                | "tap_power"
                | "tap_power_multiplier"

interface IGeneralUpgrade {
    id: number,
    name: string,
    stat: string,
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

//===========================================//

class Shop {
    cps_upgrades: ICpsUpgrade[] = [
        {
            id: 0,
            name: "Keyboard macro",
            desc: "A macro on an old keyboard.",
            cost: 80,
            gives: 0.4,
        },
        {
            id: 1,
            name: "Logitech",
            desc: "Item description =D",
            cost: 440,
            gives: 1,
        },
        {
            id: 2,
            name: "A drill",
            desc: "Drill, usually fitted with a driving tool attachment, now fitted with a keyboard.",
            cost: 1960,
            gives: 4,
        },
        {
            id: 3,
            name: "Vaxei",
            desc: "Item description =D",
            cost: 9420,
            gives: 10,
        },
        {
            id: 4,
            name: "Cookiezi",
            desc: "Item description =D",
            cost: 54500,
            gives: 50,
        }
    ]

    general_upgrades: IGeneralUpgrade[] = [
        {
            id: 0,
            name: "Buldak",
            desc: "You start to sweat.",
            stat: `+0.6 ${TAP_POWER_TEXT}`,
            cost: 520,
            action: {
                type: "tap_power",
                value: 0.6
            }
        },
        {
            id: 1,
            name: "Gateron switch",
            desc: "You order some switches.",
            stat: "Keyboard button is twice more effective.",
            cost: 1340,
            action: {
                type: "multiplier",
                item_ids: [0],
                value: 2
            }
        },
        {
            id: 2,
            name: "Mousepad",
            desc: "Finally, less mouse drift.",
            stat: `+1.2 ${TAP_POWER_TEXT}`,
            cost: 1800,
            action: {
                type: "tap_power",
                value: 1.2
            }
        },
        {
            id: 3,
            name: "Wacom",
            desc: "Item description =D",
            stat: `+3.2 ${TAP_POWER_TEXT}`,
            cost: 4600,
            action: {
                type: "tap_power",
                value: 3.2
            }
        },
        {
            id: 4,
            name: "Power outlet",
            desc: "The consequences of industrial revolution.",
            stat: "Keyboard buttons and drills become twice as effective.",
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
            desc: "Item description =D",
            stat: "Vaxei becomes twice as effective.",
            cost: 18900,
            action: {
                type: "multiplier",
                item_ids: [3],
                value: 2
            }
        },
        {
            id: 6,
            name: "Wooting",
            desc: "You finally receive your Wooting.",
            stat: "Click power is doubled.",
            cost: 23200,
            action: {
                type: "tap_power_multiplier",
                value: 2
            }
        },
        {
            id: 7,
            name: "Cookiezi comeback",
            desc: "Chocomint's Made of Fire HDDT 98.54 full combo. Without a doubt, one of the most impressive plays ever set in osu! history, but one that takes some experience to appreciate fully.",
            stat: "Cookiezi becomes twice as effective.",
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
        this.cps_upgrades_bought = new Array<number>(this.cps_upgrades.length).fill(0);
        this.upgrades_bought = new Array<number>(this.general_upgrades.length).fill(0);
    }

    get_multipliers(): Array<number> {
        const result_array = new Array<number>(this.cps_upgrades.length).fill(1);

        for (const s in this.general_upgrades) {
            const i = parseInt(s, 10);
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
                .map((a, i) => a * this.cps_upgrades[i]!.gives * multipliers[i]!)
                .reduce((a, b) => a + b);
    }

    get_tap_power() {
        let result = 1;
        let multiplier = 1;

        for (const s in this.upgrades_bought) {
            const i = parseInt(s, 10);
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

        const button = document.getElementById("button_item" + item.id) as HTMLButtonElement;
        button.disabled = true;

        this.update_shop_element();
        this.update_cps_shop_element();
    }

    buy_cps(item: ICpsUpgrade) {
        this.cps_upgrades_bought[item.id] += 1;
        this.cps_upgrades[item.id]!.cost = Math.floor(this.cps_upgrades[item.id]!.cost * CPS_COST_MULTIPLIER);
        this.update_cps_shop_element();
    }

    update_shop_element() {
        for (const s in this.upgrades_bought) {
            const i = parseInt(s, 10);
            const item = this.general_upgrades[i]!;

            // Disable the button if you bought that upgrade.
            if (this.upgrades_bought[i]! > 0) {
                const button = document
                    .getElementById("button_item" + item.id) as HTMLButtonElement;

                button.disabled = true;
            }

            // Enable the next item if you bought the previous one.
            if (this.upgrades_bought[i - 1]! > 0) {
                const li = document.getElementById("list_item" + item.id) as HTMLLIElement;
                li.hidden = false;
            }
        }
    }

    update_cps_shop_element() {
        const multipliers = this.get_multipliers();
        for (const s in this.cps_upgrades_bought) {
            const i = parseInt(s, 10);
            const item = this.cps_upgrades[i]!;

            const button = document
                .getElementById("button_cps_item" + item.id) as HTMLButtonElement;
            const stat = document
                .getElementById("p_stat_cps_item" + item.id) as HTMLParagraphElement;

            const count = this.cps_upgrades_bought[item.id]!;

            button.textContent =
            `${item.name}, ${format_number(item.cost, 0)}${CURRENCY_TEXT}`;
            stat.textContent =
            `+${item.gives * multipliers[item.id]!} ${CURRENCY_TEXT}/s`;

            // NOTE: this is temporary
            if (count > 0) {
                const producing = document
                    .getElementById("p_producing_cps_item" + item.id) as HTMLParagraphElement;
                const producing_text =
                    `You have ${count}, producing ${format_number(item.gives * count * multipliers[item.id]!, 1)} ${CURRENCY_TEXT}/s`;
                producing.textContent = producing_text;
            }

            // Enable the next item if *you bought the previous one*
            // NOTE: there should be more general way to have different type of conditions for this to happen
            if (this.cps_upgrades_bought[i - 1]! > 0) {
                const li = document
                    .getElementById("list_cps_item" + item.id) as HTMLLIElement;
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

        assert("settings.keys is of KEY_COUNT size", this.settings.keys.length === KEY_COUNT);
    }

    last_inactive_time = 0;

    clicks = {
        stopped_interval: 0,
        is_tapping: false,
        tapped: 0,
        ticks: TPS
    }

    initialize_shop() {
        for (const s in this.shop.cps_upgrades) {
            const i = parseInt(s, 10);
            const item = this.shop.cps_upgrades[i]!;
            const item_element = make_shop_item(item, `+${item.gives} ${CURRENCY_TEXT}/s`, "cps_item", this.buy_cps(item));

            if (i > 0) item_element.hidden = true;
            CPS_SHOP_ITEMS_LIST_ELEMENT.appendChild(item_element);
        }

        for (const s in this.shop.general_upgrades) {
            const i = parseInt(s, 10);
            const item = this.shop.general_upgrades[i]!;
            const item_element = make_shop_item(item, item.stat, "item", this.buy(item));

            if (i > 0) item_element.hidden = true;
            GENERAL_SHOP_ITEMS_LIST_ELEMENT.appendChild(item_element);
        }
    }

    // Buy methods return an action that you can put on a button.
    buy_cps(item: ICpsUpgrade): () => void {
        const self = this;
        return function () {
            if (self.amount < item.cost) {
                alert("Not enough " + CURRENCY_TEXT + " to buy \"" + item.name + "\" :(");
                return;
            }
            self.amount -= item.cost;

            self.shop.buy_cps(item);
            self.shop.update_cps_shop_element();

            self.cps = self.shop.get_cps();
        }
    }

    buy(item: IGeneralUpgrade): () => void {
        const self = this;
        return function () {
            if (self.amount < item.cost) {
                alert("Not enough " + CURRENCY_TEXT + " to buy \"" + item.name + "\" :(");
                return;
            }
            self.amount -= item.cost;

            self.shop.buy(item);
            self.shop.update_shop_element();

            self.power = self.shop.get_tap_power();
            self.cps = self.shop.get_cps();
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

    update_main_elements(): void {
        const speed = (this.clicks.tapped * TPS_ADJ / this.clicks.ticks);

        // TODO: This doesn't calculate properly.
        BPM_TEXT_ELEMENT.textContent =
            Math.floor(speed * 60 / 4) + " BPM";
        AMOUNT_TEXT_ELEMENT.textContent =
            format_number(Math.floor(this.amount), 0) + CURRENCY_TEXT;
        CPS_TEXT_ELEMENT.textContent =
            CURRENCY_TEXT + "/s: " + format_number(this.cps + speed, 1);
        TAP_POWER_TEXT_ELEMENT.textContent =
            TAP_POWER_TEXT + ": " + this.power;
        UPGRADES_COUNT_TEXT_ELEMENT.textContent =
            "Items bought: " + this.shop.cps_upgrades_bought.reduce((a, b) => a + b, 0);
    }

    update_passive_cps(): void {
        this.cps = this.shop.get_cps();
    }

    update_cps(): void {
        if (this.clicks.is_tapping) {
            this.clicks.ticks += 1;
        } else if (this.clicks.ticks != TPS) {
            // NOTE:
            // TPS is the starting value instead of 0, because CP/s is being calculated as:
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
        this.update_main_elements();
    }
}

//===========================================//

const shop: Shop = new Shop();
const cookiezi: Cookiezi = new Cookiezi(shop);

cookiezi.initialize_shop();

setInterval(() => {
    cookiezi.update();
}, 1000 / TPS)

document.addEventListener("keydown", (k) => {
    const k1 = cookiezi.settings.keys[0]!;
    const k2 = cookiezi.settings.keys[1]!;

    if (cookiezi.settings.is_changing_keys >= 0) {
        cookiezi.settings.keys[cookiezi.settings.is_changing_keys]!.key = k.key;

        cookiezi.settings.is_changing_keys += 1;
        KEYS_TEXT_ELEMENT.textContent = make_current_keys_text(k1.key, k2.key, cookiezi.settings.is_changing_keys);

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

CHANGE_KEYS_BUTTON_ELEMENT.onclick = () => {
    const k1 = cookiezi.settings.keys[0]!;
    const k2 = cookiezi.settings.keys[1]!;

    cookiezi.settings.is_changing_keys = 0;
    KEYS_TEXT_ELEMENT.textContent = make_current_keys_text(k1.key, k2.key, cookiezi.settings.is_changing_keys);
    CHANGE_KEYS_BUTTON_ELEMENT.textContent = CHANGING_KEYS_TEXT;
}

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
