/*============================================*
*                                             *
*             Cookiezi Clicker :3             *
*                     by                      *
*              toiletbril@github              *
*                                             *
*============================================*/

/*
TODO:
 - Make calc functions calc only particular values.
 - Separate this into several files. (impossible)
 - Improve design and make CSS cooler.
*/

const DEBUG_MODE = true;
const VERSION = "1 beta";

const AMOUNT_TEXT_ELEMENT = document
    .getElementById("amount") as HTMLElement;
const PPS_SHOP_ITEMS_LIST_ELEMENT = document
    .getElementById("pps_shop_items") as HTMLUListElement;
const GENERAL_SHOP_ITEMS_LIST_ELEMENT = document
    .getElementById("general_shop_items") as HTMLUListElement;
const TAP_POWER_TEXT_ELEMENT = document
    .getElementById("tap_power") as HTMLElement;
const PPS_TEXT_ELEMENT = document
    .getElementById("pps") as HTMLElement;
const UPGRADES_COUNT_TEXT_ELEMENT = document
    .getElementById("upgrade_count") as HTMLElement;
const CHANGE_KEYS_BUTTON_ELEMENT = document
    .getElementById("change_keys") as HTMLButtonElement;
const KEYS_TEXT_ELEMENT = document
    .getElementById("keys") as HTMLButtonElement;
const BPM_TEXT_ELEMENT = document
    .getElementById("bpm") as HTMLHeadingElement;
const STATS_LIST_ELEMENT = document
    .getElementById("stats_list") as HTMLUListElement;
const GAME_TITLE_ELEMENT = document
    .getElementById("game_title") as HTMLHeadingElement;
const GAME_ELEMENT = document
    .getElementById("game") as HTMLDivElement;
const FOOTER_ELEMENT = document
    .getElementById("footer_text") as HTMLParagraphElement;

assert("All elements are not null",
    !!AMOUNT_TEXT_ELEMENT &&
    !!PPS_SHOP_ITEMS_LIST_ELEMENT &&
    !!GENERAL_SHOP_ITEMS_LIST_ELEMENT &&
    !!TAP_POWER_TEXT_ELEMENT &&
    !!UPGRADES_COUNT_TEXT_ELEMENT &&
    !!CHANGE_KEYS_BUTTON_ELEMENT &&
    !!KEYS_TEXT_ELEMENT &&
    !!BPM_TEXT_ELEMENT &&
    !!STATS_LIST_ELEMENT &&
    !!GAME_TITLE_ELEMENT
);

const TPS = 40;

// This is here to account for setTimeout's delays ;(
const TPS_ADJ = Math.floor(TPS + TPS / 10);

const KEY_COUNT = 2;
const STOPPED_TAPPING_INTERVAL = 2 * 1000;

const CHANGE_KEYS_TEXT
    = "Change keys..."
const CHANGING_KEYS_TEXT
    = "Press a new key..."
const CURRENCY_TEXT
    = "pp";
const TAP_POWER_TEXT
    = "pp/tap";
const FORMAT_CHAR
    = ",";

const PPS_COST_MULTIPLIER = 1.15;

//===========================================//

function assert(desc: string, cond: boolean) {
    console.assert(cond, desc);
}

function calc_time_diff_s(prev_time: number): number {
    const current_time = new Date().getTime();
    const time_difference = current_time - prev_time;

    return time_difference / 1000;
}

function make_current_keys_text(k1: string, k2: string, n: number): string {
    return `Tap ${n <= 0 ? "?" : k1.toUpperCase()}/${n <= 1 ? "?" : k2.toUpperCase()} to gain pp.`;
}

// 1000000 -> 1,000,000
function format_number(n: number, fixed: number): string {
    // Regex version is better :3
    return n.toFixed(fixed).replace(/\B(?=(\d{3})+(?!\d))/g, FORMAT_CHAR);
}

function make_shop_item(item: PpsUpgrade | GeneralUpgrade, stat_text: string,
    item_type: "pps_item" | "item", click_action: () => void): HTMLLIElement {

    const item_element = document
        .createElement("li");
    const buy_button = document
        .createElement("button");
    const div = document
        .createElement("div");
    const name_div = document
        .createElement("div");
    const cost_div = document
        .createElement("div");
    const desc_div = document
        .createElement("div");
    const p_desc = document
        .createElement("p");
    const p_stat = document
        .createElement("p");

    const item_name = document
        .createTextNode(item.name);
    const item_cost = document
        .createTextNode(format_number(item.cost, 0) + CURRENCY_TEXT);
    const stats = document
        .createTextNode(stat_text);
    const desc = document
        .createTextNode(item.desc);

    buy_button.onclick = click_action;

    const id = item_type + item.id;

    // List item: list_item1
    // Button: button_pps_item0
    item_element
        .setAttribute("id", "list_" + id);
    buy_button
        .setAttribute("id", "button_" + id);
    p_stat
        .setAttribute("id", "p_stat_" + id);
    p_desc
        .setAttribute("id", "p_" + id);
    desc_div
        .setAttribute("id", "desc_div_" + id)
    cost_div
        .setAttribute("id", "cost_div_" + id);
    div
        .setAttribute("id", "div_" + id);

    p_desc
        .setAttribute("class", "description");

    cost_div.appendChild(item_cost);
    name_div.appendChild(item_name)

    buy_button.appendChild(name_div);
    buy_button.appendChild(cost_div);

    p_stat.appendChild(stats);
    p_desc.appendChild(desc);

    desc_div.appendChild(p_stat);
    desc_div.appendChild(p_desc);

    if (item_type === "pps_item") {
        const p_producing = document.createElement("p");
        // Number of pps that item is producing: p_producing_pps_item3
        p_producing
            .setAttribute("id", "p_producing_" + id);
        desc_div.appendChild(p_producing);
    }

    div.appendChild(buy_button);
    div.appendChild(desc_div);

    item_element.appendChild(div);

    return item_element;
}

// This is all you get >:(
function game_end(self: Cookiezi): void {
    const current_time = new Date().getTime()
    const minutes_wasted = Math.floor((current_time - self.started_time) / 1000 / 60);

    const the =
        "To be fair, you have to have a very high IQ to understand technical    \
        mapping. The SV changes are extremely subtle, and without a solid       \
        grasp of music theory most of the quality will go over a typical        \
        player's head. There's also Monstrata's triangular outlook, which is    \
        deftly woven into his mapping - his personal philosophy draws heavily   \
        from Pishifat literature, for instance. The fans understand this        \
        stuff; they have the intellectual capacity to truly appreciate the      \
        Depths of these patterns, to realize that they're not just high         \
        quality- they say something deep about MAPPING. As a consequence        \
        people who dislike technical maps truly ARE idiots- of course they      \
        wouldn't appreciate, for instance, the quality in Sotarks'              \
        existencial catchphrase \"this needs more overdone jumps,\" which       \
        itself is a Cryptic reference to Monstrata's map quaver. I'm smirking   \
        right now just imagining one of those addlepated simpletons             \
        scratching their heads in confusion as Natsu's genius unfolds itself    \
        on their computer screens. What fools... how I pity them. And yes       \
        by the way, I DO have a Monstrata slider butterfly tattoo.And no,       \
        you cannot see it.It's for the ladies' eyes only - And even they have   \
        to demonstrate that they're within 5 PP points of my own (preferably    \
        lower) beforehand.";

    alert(`${the}\n\nYou completed the game in ${minutes_wasted} minutes.\nThanks for playing.`)
}

//===========================================//

type ActionTypeMult
    = "multiplier";

type ActionTypeSimple
    = "tap_power"
    | "tap_power_multiplier";

type ActionTypeFunc
    = "func";

type ShowConditionTypeUpgrade
    = "has_upgrade"
    | "has_pps_upgrade";

type ShowConditionTypeSimple
    = "has_pps"
    | "has_current_pp"
    | "total_pp";

type ShowCondition
    = {
        type: ShowConditionTypeUpgrade,
        item: number,
        amount?: number;
    }
    | {
        type: ShowConditionTypeSimple,
        value: number;
    }

type UpgradeActionType
    = {
        type: ActionTypeSimple,
        value: number
    }
    | {
        type: ActionTypeMult,
        value: number,
        item_ids: number[]
    }
    | {
        type: ActionTypeFunc
        action: (self: Cookiezi) => any
    }

type PpsUpgrade = {
    id: number,
    name: string,
    desc: string,
    cost: number,
    gives: number,
    show_conditions?: ShowCondition[]
}

type GeneralUpgrade = {
    id: number,
    name: string,
    stat: string,
    desc: string,
    cost: number,
    action: UpgradeActionType,
    show_conditions?: ShowCondition[]
}

type Key = {
    key: string,
    is_down: boolean
}

type Settings = {
    keys: Key[],
    is_changing_keys: number
}

//===========================================//

let UPG_IOTA = 0;
let PPS_IOTA = 0;

class Shop {
    pps_upgrades: PpsUpgrade[] = [
        {
            id: PPS_IOTA++, // 0
            name: "Keyboard button",
            desc: "A button on an old keyboard.",
            cost: 80,
            gives: 0.4
        },
        {
            id: PPS_IOTA++, // 1
            name: "Trackball",
            desc: "A pointing device.",
            cost: 540,
            gives: 2.6,
            show_conditions: [
                {
                    type: "has_pps_upgrade",
                    item: 0,
                    amount: 4
                }
            ]
        },
        {
            id: PPS_IOTA++, // 2
            name: "Drill",
            desc: "Drill, usually fitted with a driving tool attachment, \
                   now fitted with a keyboard.",
            cost: 2770,
            gives: 8,
            show_conditions: [
                {
                    type: "has_pps_upgrade",
                    item: 1,
                    amount: 6
                }
            ]
        },
        {
            id: PPS_IOTA++, // 3
            name: "Vaxei",
            desc: "The following README will serve to document all of Vaxei's skins.",
            cost: 19000,
            gives: 52,
            show_conditions: [
                {
                    type: "has_pps_upgrade",
                    item: 2,
                    amount: 6
                }
            ]
        },
        {
            id: PPS_IOTA++, // 4
            name: "Cookiezi",
            desc: "Shigetora, better known online as chocomint and formerly as Cookiezi, \
                   is a famous South Korean osu!standard player.",
            cost: 85000,
            gives: 184,
            show_conditions: [
                {
                    type: "has_pps_upgrade",
                    item: 3,
                    amount: 6
                }
            ]
        },
        {
            id: PPS_IOTA++, // 5
            name: "Aetrna",
            desc: "Once, he fingered a girl. She died.",
            cost: 996000,
            gives: 1020,
            show_conditions: [
                {
                    type: "has_pps_upgrade",
                    item: 4,
                    amount: 6
                }
            ]
        },
        {
            id: PPS_IOTA++, // 6
            name: "peppy",
            desc: "The creator of the.",
            cost: 8496000,
            gives: 9800,
            show_conditions: [
                {
                    type: "has_pps_upgrade",
                    item: 5,
                    amount: 6
                }
            ]
        },
    ];

    general_upgrades: GeneralUpgrade[] = [
        {
            id: UPG_IOTA++, // 0
            name: "Bateron switch",
            desc: "You order some switches.",
            stat: "Keyboard buttons are twice more effective.",
            cost: 340,
            action: {
                type: "multiplier",
                item_ids: [0],
                value: 2
            },
            show_conditions: [
                {
                    type: "has_pps_upgrade",
                    item: 0,
                    amount: 5
                }
            ]
        },
        {
            id: UPG_IOTA++, // 1
            name: "Spicy ramen",
            desc: "You start to sweat.",
            stat: `+0.6 ${TAP_POWER_TEXT}`,
            cost: 620,
            action: {
                type: "tap_power",
                value: 0.6
            }
        },
        {
            id: UPG_IOTA++, // 2
            name: "Mousepad",
            desc: "Finally, less mouse drift.",
            stat: `+1.2 ${TAP_POWER_TEXT}`,
            cost: 1800,
            action: {
                type: "tap_power",
                value: 1.2
            },
            show_conditions: [
                {
                    type: "has_upgrade",
                    item: 0
                }
            ]
        },
        {
            id: UPG_IOTA++, // 3
            name: "Vacom toilet",
            desc: "10 Reasons Why You Might Want a High-Tech Super Toilet.",
            stat: `+3.2 ${TAP_POWER_TEXT}`,
            cost: 5600,
            action: {
                type: "tap_power",
                value: 3.2
            },
            show_conditions: [
                {
                    type: "has_upgrade",
                    item: 2
                }
            ]
        },
        {
            id: UPG_IOTA++, // 4
            name: "Ultra lube",
            desc: "You waste several hours lubing your keyboard.",
            stat: "Keyboard buttons are twice more effective.",
            cost: 8040,
            action: {
                type: "multiplier",
                item_ids: [0],
                value: 2
            },
            show_conditions: [
                {
                    type: "has_pps_upgrade",
                    item: 0,
                    amount: 12
                }
            ]
        },
        {
            id: UPG_IOTA++, // 5
            name: "Power outlet",
            desc: "The consequences of industrial revolution.",
            stat: "Trackballs and drills become twice as effective.",
            cost: 15640,
            action: {
                type: "multiplier",
                item_ids: [1, 2],
                value: 2
            },
            show_conditions: [
                {
                    type: "has_pps_upgrade",
                    item: 1,
                    amount: 4
                },
                {
                    type: "has_pps_upgrade",
                    item: 2,
                    amount: 2
                }
            ]
        },
        {
            id: UPG_IOTA++, // 6
            name: "Mooting",
            desc: "You finally receive your Mooting keyboard.",
            stat: "Click power is doubled.",
            cost: 23200,
            action: {
                type: "tap_power_multiplier",
                value: 2
            },
            show_conditions: [
                {
                    type: "has_upgrade",
                    item: 5
                }
            ]
        },
        {
            id: UPG_IOTA++, // 7
            name: "Sugar",
            desc: "The generic name for sweet-tasting, soluble carbohydrates, \
                   many of which are used in food.",
            stat: "Vaxei becomes twice as effective.",
            cost: 104900,
            action: {
                type: "multiplier",
                item_ids: [3],
                value: 2
            },
            show_conditions: [
                {
                    type: "has_pps_upgrade",
                    item: 3,
                    amount: 6
                }
            ]
        },
        {
            id: UPG_IOTA++, // 8
            name: "PP rework",
            desc: "I am justice, I am honor, I am hope and living water.",
            stat: "You gain +20% PP/s",
            cost: 282000,
            action: {
                type: "multiplier",
                item_ids: [0, 1, 2, 3, 4, 5],
                value: 1.2
            },
            show_conditions: [
                {
                    type: "has_pps_upgrade",
                    item: 3,
                    amount: 10
                }
            ]
        },
        {
            id: UPG_IOTA++, // 9
            name: "Cookiezi comeback",
            desc: "Chocomint's Made of Fire HDDT 98.54 full combo. \
                   Without a doubt, one of the most impressive plays ever set in osu! history, \
                   but one that takes some experience to appreciate fully.",
            stat: "Cookiezi becomes twice as effective.",
            cost: 379000,
            action: {
                type: "multiplier",
                item_ids: [4],
                value: 2
            },
            show_conditions: [
                {
                    type: "has_pps_upgrade",
                    item: 4,
                    amount: 3
                }
            ]
        },
        {
            id: UPG_IOTA++, // 10
            name: "Rising fevers",
            desc: "Ascencion to heaven.",
            stat: "Xeltol is twice more effective.",
            cost: 7260000,
            action: {
                type: "multiplier",
                item_ids: [5],
                value: 2
            },
            show_conditions: [
                {
                    type: "has_pps_upgrade",
                    item: 5,
                    amount: 6
                }
            ]
        },
        {
            id: UPG_IOTA++, // 11
            name: "osu! lazer",
            desc: "2042.",
            stat: "You gain 20% PP/s.",
            cost: 14060000,
            action: {
                type: "multiplier",
                item_ids: [0, 1, 2, 3, 4, 5],
                value: 1.2
            },
            show_conditions: [
                {
                    type: "has_upgrade",
                    item: 9
                },
                {
                    type: "has_upgrade",
                    item: 10
                },
                {
                    type: "has_pps_upgrade",
                    item: 5,
                    amount: 6
                }
            ]
        },
        {
            id: UPG_IOTA++, // 12
            name: "Private jet",
            desc: "Make peppy's dreams come true.",
            stat: "Makes peppy work twice as fast.",
            cost: 29000000,
            action: {
                type: "multiplier",
                item_ids: [6],
                value: 2
            },
            show_conditions: [
                {
                    type: "has_pps_upgrade",
                    item: 6,
                    amount: 4
                },
            ]
        },
        {
            id: UPG_IOTA++, // 13
            name: "Rank #1",
            desc: "Hopefully this game has given you some osu! of all time.",
            stat: "...",
            cost: 72700000,
            action: {
                type: "func",
                action: game_end
            },
            show_conditions: [
                {
                    type: "has_upgrade",
                    item: 11,
                },
                {
                    type: "has_upgrade",
                    item: 12,
                }
            ]
        }
    ];

    owned_pps_upgrades: number[];
    owned_upgrades: boolean[];

    constructor() {
        this.owned_pps_upgrades = new Array<number>(this.pps_upgrades.length).fill(0);
        this.owned_upgrades = new Array<boolean>(this.general_upgrades.length).fill(false);
    }

    get_multipliers(): Array<number> {
        const result_array = new Array<number>(this.pps_upgrades.length).fill(1);

        for (const s in this.general_upgrades) {
            const i = parseInt(s, 10);

            if (this.owned_upgrades[i] === false) continue;

            const upgrade = this.general_upgrades[i]!;

            if (upgrade.action.type === "multiplier") {
                for (const j in upgrade.action.item_ids!) {
                    result_array[upgrade.action.item_ids[j]!] *= upgrade.action.value;
                }
            }
        }

        return result_array;
    }

    calc_pps(): number {
        const multipliers = this.get_multipliers()!;
        assert("multipliers is valid length", multipliers.length === this.pps_upgrades.length);

        return this.owned_pps_upgrades
            .map((a, i) => a * this.pps_upgrades[i]!.gives * multipliers[i]!)
            .reduce((a, b) => a + b);
    }

    calc_tap_power(): number {
        let result = 1;
        let multiplier = 1;

        for (const s in this.owned_upgrades) {
            const i = parseInt(s, 10);

            if (this.owned_upgrades[i] === false) continue;
            const upgrade = this.general_upgrades[i];

            switch (upgrade?.action.type) {
                case "tap_power": {
                    result += upgrade.action.value;
                } break;

                case "tap_power_multiplier": {
                    multiplier *= upgrade.action.value;
                } break;
            }
        }
        return result * multiplier;
    }

    buy(item: GeneralUpgrade): void {
        const button = document
            .getElementById("button_item" + item.id) as HTMLButtonElement;

        button.disabled = true;
        this.owned_upgrades[item.id] = true;
    }

    buy_pps(item: PpsUpgrade): void {
        this.owned_pps_upgrades[item.id] += 1;
        this.pps_upgrades[item.id]!.cost = Math.floor(this.pps_upgrades[item.id]!.cost * PPS_COST_MULTIPLIER);
    }
}

class Cookiezi {
    private pp: number;
    private total: number;
    private power: number;
    private pps: number;

    public started_time: number;
    public settings: Settings;
    public shop: Shop;

    constructor() {
        this.pp = 0;
        this.total = 0;

        this.power = 1;
        this.pps = 0;

        this.started_time = (new Date()).getTime();

        this.shop = new Shop();

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

    taps = {
        stopped_interval: 0,
        is_tapping: false,
        tapped: 0,
        ticks: TPS
    }

    get_pps(): number {
        return this.pps;
    }

    get_pp(): number {
        return this.pp;
    }

    get_total(): number {
        return this.total;
    }

    initialize_shop(): void {
        for (const s in this.shop.pps_upgrades) {
            const i = parseInt(s, 10);

            const item = this.shop.pps_upgrades[i]!;
            const item_element = make_shop_item(item, `+${item.gives} ${CURRENCY_TEXT}/s`, "pps_item", this.buy_pps(item));

            if (item.show_conditions) {
                item_element.classList.add("hidden");
            }

            PPS_SHOP_ITEMS_LIST_ELEMENT.appendChild(item_element);
        }

        for (const s in this.shop.general_upgrades) {
            const i = parseInt(s, 10);

            const item = this.shop.general_upgrades[i]!;
            const item_element = make_shop_item(item, item.stat, "item", this.buy(item));

            if (item.show_conditions) {
                item_element.classList.add("hidden");
            }

            GENERAL_SHOP_ITEMS_LIST_ELEMENT.appendChild(item_element);
        }
    }

    meets_show_conditions(item: GeneralUpgrade | PpsUpgrade): boolean {
        if (!item.show_conditions) return true;

        for (const s in item.show_conditions) {
            const i = parseInt(s, 10);
            const condition = item.show_conditions[i]!;

            switch (condition.type) {
                case "has_pps": {
                    if (this.get_pps() < condition.value) {
                        return false;
                    }
                } break;

                case "has_pps_upgrade": {
                    assert("has_pps_upgrade value is not out of range",
                        condition.item < this.shop.owned_pps_upgrades.length);
                    if (this.shop.owned_pps_upgrades[condition.item]! < (condition.amount || 1)) {
                        return false;
                    }
                } break;

                case "has_current_pp": {
                    if (this.get_pp() < condition.value) {
                        return false;
                    }
                } break;

                case "has_upgrade": {
                    assert("has_upgrade value is not out of range",
                        condition.item < this.shop.owned_upgrades.length);
                    if (!this.shop.owned_upgrades[condition.item]) {
                        return false;
                    }
                } break;

                case "total_pp": {
                    if (this.get_total() < condition.value) {
                        return false;
                    }
                } break;
            }
        }
        return true;
    }

    // TODO: encapsulation Am I Right
    update_shop_element(): void {
        for (const s in this.shop.owned_upgrades) {
            const i = parseInt(s, 10);
            const item = this.shop.general_upgrades[i]!;

            // Disable the button if you bought that upgrade.
            if (this.shop.owned_upgrades[i]) {
                const button = document
                    .getElementById("button_item" + item.id) as HTMLButtonElement;

                button.disabled = true;
            }

            const li = document
                .getElementById("list_item" + item.id) as HTMLLIElement;

            if (item.show_conditions) {
                if (this.meets_show_conditions(item)) {
                    li.classList.remove("hidden");
                }
            } else {
                li.classList.remove("hidden");
            }
        }
    }

    update_pps_shop_element(): void {
        const multipliers = this.shop.get_multipliers();
        for (const s in this.shop.owned_pps_upgrades) {
            const i = parseInt(s, 10);
            const item = this.shop.pps_upgrades[i]!;

            const cost = document
                .getElementById("cost_div_pps_item" + item.id) as HTMLParagraphElement;
            const stat = document
                .getElementById("p_stat_pps_item" + item.id) as HTMLParagraphElement;

            const count = this.shop.owned_pps_upgrades[item.id]!;

            cost.textContent =
                `${format_number(item.cost, 0)}${CURRENCY_TEXT}`;
            stat.textContent =
                `+${format_number(item.gives * multipliers[item.id]!, 1)} ${CURRENCY_TEXT}/s`;

            if (count > 0) {
                const producing = document
                    .getElementById("p_producing_pps_item" + item.id) as HTMLParagraphElement;
                const producing_text =
                    `You have ${count}, producing ${format_number(item.gives * count * multipliers[item.id]!, 1)} ${CURRENCY_TEXT}/s`;
                producing.textContent = producing_text;
            }

            const li = document
                .getElementById("list_pps_item" + item.id) as HTMLLIElement;

            if (item.show_conditions) {
                if (this.meets_show_conditions(item)) {
                    li.classList.remove("hidden");
                }
            } else {
                li.classList.remove("hidden");
            }
        }
    }

    buy_pps(item: PpsUpgrade): () => void {
        const self = this;
        return function () {
            if (self.pp < item.cost) {
                alert("Not enough " + CURRENCY_TEXT + " to buy \"" + item.name + "\" :(");
                return;
            }

            self.remove_pp(item.cost);

            self.shop.buy_pps(item);

            self.update_shop_element();
            self.update_pps_shop_element();

            self.pps = self.shop.calc_pps();
        }
    }

    buy(item: GeneralUpgrade): () => void {
        const self = this;
        return function () {
            if (self.pp < item.cost) {
                alert("Not enough " + CURRENCY_TEXT + " to buy \"" + item.name + "\" :(");
                return;
            }

            self.remove_pp(item.cost);

            self.shop.buy(item);

            if (item.action.type === "func") {
                item.action.action(self);
            }

            self.update_shop_element();
            self.update_pps_shop_element();

            self.power = self.shop.calc_tap_power();
            self.pps = self.shop.calc_pps();
        }
    }

    // This is to avoid clicking when holding button down.
    press_key(k: Key): void {
        if (k.is_down) return;

        k.is_down = true;

        this.taps.tapped += 1;
        this.tap();

        this.taps.is_tapping = true;

        clearInterval(this.taps.stopped_interval);

        this.taps.stopped_interval = setTimeout(() => {
            this.taps.is_tapping = false;
        }, STOPPED_TAPPING_INTERVAL)
    }

    unpress_key(k: Key): void {
        k.is_down = false;
    }

    add_pp(amount: number) {
        this.total += amount;
        this.pp += amount;
    }

    remove_pp(amount: number) {
        this.pp -= amount;
    }

    tap(): void {
        this.add_pp(this.power);
    }

    invoke_pps(): void {
        this.add_pp(this.pps / TPS);
    }

    update_main_elements(): void {
        // NOTE: this doesn't calculate properly and I don't want to redo it for 50th time.
        const speed = (this.taps.tapped * TPS_ADJ / this.taps.ticks);

        BPM_TEXT_ELEMENT.textContent =
            speed > 0 ? Math.floor(speed * 60 / 4) + " BPM" : ":3c";

        AMOUNT_TEXT_ELEMENT.textContent =
            format_number(Math.floor(this.pp), 0) + CURRENCY_TEXT;

        PPS_TEXT_ELEMENT.textContent =
            CURRENCY_TEXT + "/s: " + format_number(this.pps, 1);

        TAP_POWER_TEXT_ELEMENT.textContent =
            TAP_POWER_TEXT + ": " + this.power;

        UPGRADES_COUNT_TEXT_ELEMENT.textContent =
            "Items bought: " + this.shop.owned_pps_upgrades.reduce((a, b) => a + b, 0);
    }

    update_passive_pps(): void {
        this.pps = this.shop.calc_pps();
    }

    update_tapping_speed(): void {
        if (this.taps.is_tapping) {
            this.taps.ticks += 1;
        }

        else if (this.taps.ticks != TPS) {
            // NOTE: TPS is the starting value instead of 0
            this.taps.tapped = Math.floor(this.taps.tapped / this.taps.ticks * TPS_ADJ);
            this.taps.ticks = TPS;
        }

        else if (this.taps.tapped > 0) {
            this.taps.tapped -= 1;
        }
    }

    update(): void {
        this.invoke_pps();
        this.update_tapping_speed();
        this.update_main_elements();
    }
}

//===========================================//

window.onload = () => {
    FOOTER_ELEMENT.textContent = `version ${VERSION}`;

    const cookiezi: Cookiezi = new Cookiezi();

    cookiezi.initialize_shop();

    document.addEventListener("keydown", (k) => {
        const k1 = cookiezi.settings.keys[0]!;
        const k2 = cookiezi.settings.keys[1]!;

        if (cookiezi.settings.is_changing_keys >= 0) {
            cookiezi.settings.keys[cookiezi.settings.is_changing_keys]!.key = k.key;

            cookiezi.settings.is_changing_keys += 1;
            KEYS_TEXT_ELEMENT.textContent = make_current_keys_text(k1.key, k2.key, cookiezi.settings.is_changing_keys);

            if (cookiezi.settings.is_changing_keys >= KEY_COUNT) {
                cookiezi.settings.is_changing_keys = -1;
                CHANGE_KEYS_BUTTON_ELEMENT.disabled = false;
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
        CHANGE_KEYS_BUTTON_ELEMENT.disabled = true;

        KEYS_TEXT_ELEMENT.textContent =
            make_current_keys_text(k1.key, k2.key, cookiezi.settings.is_changing_keys);
        CHANGE_KEYS_BUTTON_ELEMENT.textContent =
            CHANGING_KEYS_TEXT;
    }

    // Invoke CP/s even when tab is inactive.
    window.onfocus = () => {
        cookiezi.add_pp(cookiezi.get_pps() * calc_time_diff_s(cookiezi.last_inactive_time));
    }

    window.onblur = () => {
        cookiezi.last_inactive_time = new Date().getTime();
    }

    if (DEBUG_MODE) {
        const amount = 10000000;

        const debug_text = document
            .createTextNode("+" + format_number(amount, 0) + CURRENCY_TEXT)
        const debug_button = document
            .createElement("button");

        debug_button.setAttribute("id", "debug_button");

        debug_button.onclick = () => {
            cookiezi.add_pp(amount);
        }

        debug_button.appendChild(debug_text);
        STATS_LIST_ELEMENT.appendChild(debug_button);

        FOOTER_ELEMENT.textContent = FOOTER_ELEMENT.textContent + " (DEBUGGING)"
    }

    setInterval(() => {
        cookiezi.update();
    }, 1000 / TPS)

    // Show the game after everything is done.
    GAME_ELEMENT.classList.remove("hidden");
}
