const AMOUNT_TEXT = document.getElementById("amount") as HTMLElement;
const CPS_SHOP_ITEMS_LIST = document.getElementById("cps_shop_items") as HTMLUListElement;
const GENERAL_SHOP_ITEMS_LIST = document.getElementById("power_shop_items") as HTMLUListElement;
const TAP_POWER_TEXT = document.getElementById("tap_power") as HTMLElement;
const CPS_TEXT = document.getElementById("cps") as HTMLElement;
const UPGRADES_COUNT_TEXT = document.getElementById("upgrades_count") as HTMLElement;

const CENT = "¢";

const CPS_UPGRADES: ICpsUpgrade[] = [
    {
        id: 0,
        name: "First CP/S upgrade",
        cost: 100,
        gives: 0.4,
    },
    {
        id: 1,
        name: "Second CP/S upgrade",
        cost: 400,
        gives: 1,
    },
    {
        id: 2,
        name: "Third CP/S upgrade",
        cost: 1700,
        gives: 4,
    },
]

const GENERAL_UPGRADES: IGeneralUpgrade[] = [
    {
        id: 0,
        name: "First upgrade",
        desc: "+1 tap power",
        cost: 1000,
        action: (self: Cookiezi) => {
            self.power += 1;
        }
    }
]

const UPGRADE_COST_MULTIPLIER = 1.15;

function create_upgrade_array<T>(arr: Array<T>) {
    let a = new Array<number>;
    arr.forEach(() => a.push(0));
    return a;
}

function populate(item: ICpsUpgrade | IGeneralUpgrade, item_description: string, element_id: string, click_action: () => void) {
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

////////////

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
    code: string,
    is_down: boolean
}

interface ISettings {
    key1: IKey,
    key2: IKey
}

////////////

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
            key1: {
                code: "KeyG",
                is_down: false
            },
            key2: {
                code: "KeyH",
                is_down: false
            }
        }
    }

    populate_cps_shop(): void {
        for (const i in CPS_UPGRADES) {
            const item = CPS_UPGRADES[i] as ICpsUpgrade;

            const item_element = populate(item, `+${item.gives} CP/S`, "cps_item" + item.id, this.buy_cps(item));

            CPS_SHOP_ITEMS_LIST.appendChild(item_element);
        }
    }

    populate_shop(): void {
        for (const i in GENERAL_UPGRADES) {
            const item = GENERAL_UPGRADES[i] as IGeneralUpgrade;

            const item_element = populate(item, item.desc, "item" + item.id, this.buy(item));

            GENERAL_SHOP_ITEMS_LIST.appendChild(item_element);
        }
    }

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
            CPS_UPGRADES[item.id]!.cost = Math.floor(CPS_UPGRADES[item.id]!.cost * UPGRADE_COST_MULTIPLIER);

            // Update UI
            let button = document.getElementById("cps_item" + item.id) as HTMLButtonElement;
            button.textContent = `${item.name}, ${item.cost}c`;

            self.update_cps_stats();
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

            self.update_cps_stats();
        }
    }

    press_key(k: IKey): void {
        if (k.is_down) return;
        k.is_down = true;
        this.click();
    }

    unpress_key(k: IKey): void {
        k.is_down = false;
    }

    click(): void {
        this.amount += this.power;
    }

    invoke_cps(): void {
        this.amount += this.cps / 20;
    }

    update_text(): void {
        AMOUNT_TEXT.textContent = Math.floor(this.amount).toString();
        TAP_POWER_TEXT.textContent = "Tap power: " + this.power;
        CPS_TEXT.textContent = "CP/S: " + this.cps;
        UPGRADES_COUNT_TEXT.textContent = "Upgrades count: " + this.cps_upgrades.reduce((a, b) => a + b, 0);
    }

    update_cps_stats(): void {
        let result_cps = 0;

        for (const i in this.cps_upgrades) {
            result_cps += CPS_UPGRADES[i]!.gives * this.cps_upgrades[i]!;
        }

        this.cps = result_cps;
    }

    update() {
        this.invoke_cps();
        this.update_text();
    }
}

////////////

const cookiezi = new Cookiezi();

cookiezi.update()
cookiezi.populate_cps_shop();
cookiezi.populate_shop();

setInterval(() => {
    cookiezi.update();
}, 50)

document.addEventListener("keydown", (k) => {
    let k1 = cookiezi.settings.key1;
    let k2 = cookiezi.settings.key2;
    switch (k.code) {
        case k1.code: {
            cookiezi.press_key(k1)
        } break;
        case k2.code: {
            cookiezi.press_key(k2)
        } break;
    }
});

document.addEventListener("keyup", (k) => {
    let k1 = cookiezi.settings.key1;
    let k2 = cookiezi.settings.key2;
    switch (k.code) {
        case k1.code: {
            cookiezi.unpress_key(k1)
        } break;
        case k2.code: {
            cookiezi.unpress_key(k2)
        } break;
    }
});
