const amount_text = document.getElementById("amount") as HTMLElement;
const cps_shop_items = document.getElementById("cps_shop_items") as HTMLUListElement;
const power_shop_items = document.getElementById("power_shop_items") as HTMLUListElement;
const tap_power = document.getElementById("tap_power") as HTMLElement;
const cps = document.getElementById("cps") as HTMLElement;
const upgrades_c = document.getElementById("upgrades_count") as HTMLElement;

interface ICpsUpgrade {
    id: number,
    name: string,
    cost: bigint,
    gives: bigint
}

const CPS_UPGRADES: ICpsUpgrade[] = [
    {
        id: 0,
        name: "First CP/S upgrade",
        cost: 100n,
        gives: 1n,
    },
    {
        id: 1,
        name: "Second CP/S upgrade",
        cost: 400n,
        gives: 2n,
    },
    {
        id: 2,
        name: "Third CP/S upgrade",
        cost: 1600n,
        gives: 3n,
    },
]

interface IGeneralUpgrade {
    id: number,
    name: string,
    desc: string,
    cost: bigint,
    gives: {
        power?: BigInt,
        multipliers?: number[]
    }
}

const GENERAL_UPGRADES: IGeneralUpgrade[] = [
    {
        id: 0,
        name: "First upgrade",
        desc: "+1 tap power",
        cost: 1000n,
        gives: {
            power: 1n
        }
    }
]

const UPGRADE_MULTIPLIER = 1.15;

function create_upgrade_array<T>(arr: Array<T>) {
    let a = new Array<number>;
    arr.forEach(() => a.push(0));
    return a;
}

interface IKey {
    code: string,
    is_down: boolean
}

interface ISettings {
    key1: IKey,
    key2: IKey
}

class Cookiezi {
    amount: bigint;
    power: bigint;
    cps: bigint;

    cps_upgrades: number[];
    upgrades: number[];

    settings: ISettings;

    constructor() {
        this.amount = 0n;
        this.power = 1n;
        this.cps = 0n;

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

            const item_element = document.createElement("li");
            const div = document.createElement("div");
            const item_text = document.createTextNode(`${item.name}, ${item.cost}c`);
            const buy_button = document.createElement("button");
            const gives = document.createTextNode("+" + item.gives + " CP/S")

            buy_button.setAttribute("id", "cps_item" + item.id);
            buy_button.onclick = this.buy_cps(item);

            buy_button.appendChild(item_text);
            div.appendChild(buy_button);
            div.appendChild(gives);

            item_element.appendChild(div);

            cps_shop_items.appendChild(item_element);
        }
    }

    populate_shop(): void {
        for (const i in GENERAL_UPGRADES) {
            const item = GENERAL_UPGRADES[i] as IGeneralUpgrade;

            const item_element = document.createElement("li");
            const div = document.createElement("div");
            const item_text = document.createTextNode(`${item.name}, ${item.cost}c`);
            const buy_button = document.createElement("button");
            const desc = document.createTextNode(item.desc)

            buy_button.setAttribute("id", "power_item" + item.id);
            buy_button.onclick = this.buy(item);

            buy_button.appendChild(item_text);
            div.appendChild(buy_button);
            div.appendChild(desc);

            item_element.appendChild(div);

            power_shop_items.appendChild(item_element);
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
            CPS_UPGRADES[item.id]!.cost = CPS_UPGRADES[item.id]!.cost * BigInt(UPGRADE_MULTIPLIER * 100) / 100n;

            // Update UI
            let button = document.getElementById("cps_item" + item.id) as HTMLButtonElement;
            button.textContent = `${item.name}, ${item.cost}c`;

            self.update_item_stats();
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

            // This is general upgrade, so no need to change the price. Intead, remove the item from shop.
            let button = document.getElementById("power_item" + item.id) as HTMLButtonElement;
            button.disabled = true;

            self.update_item_stats();
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
        this.amount += this.cps / 20n;
    }

    update_text(): void {
        amount_text.textContent = this.amount.toString();
        tap_power.textContent = "Tap power: " + this.power;
        cps.textContent = "CP/S: " + this.cps;
        upgrades_c.textContent = "Upgrades count: " + this.cps_upgrades.reduce((a, b) => a + b, 0);
    }

    update_item_stats(): void {
        let result_cps = 0n;
        let result_power = 0n;

        for (const i in this.cps_upgrades) {
            result_cps += CPS_UPGRADES[i]!.gives * BigInt(this.cps_upgrades[i]!);
        }

        for (const i in this.upgrades) {
            //
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
