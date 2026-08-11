"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useWorldGround } from "@/lib/hooks/useWorldGround";
import { getWorld } from "@/lib/worlds";
import { flyToBasket } from "./flyToBasket";
import { ProductArt } from "./ProductArt";
import styles from "./Mercato.module.css";

const WORLD = getWorld("mercato");

interface Product {
  id: string;
  name: string;
  maker: string;
  origin: string;
  category: string;
  price: number;
  unit: string;
  note: string;
  stock: number;
}

/**
 * The makers.
 *
 * Six of them for nine products, which is the actual reason this shop exists —
 * so the shop should be able to say who they are. It is a disclosure rather than
 * a paragraph on every card: a shopper who wants to know asks, and a shopper who
 * wants olive oil is not made to read about Umbria first.
 */
const MAKERS: Record<string, { since: string; who: string }> = {
  "Podere Lume": {
    since: "1974",
    who: "Forty hectares on a north slope, picked by nine people over eleven days. The mill is on the property, which is the only way to press within four hours.",
  },
  "Apiario Verde": {
    since: "2003",
    who: "Two hundred hives moved up the valley twice a season. Chestnut flowers for three weeks and they take nothing else while it does.",
  },
  "Saline di Trapani": {
    since: "1830s",
    who: "The same pans, worked by the same four families. Wind and sun do the work; the harvest happens when the crust is thick enough to walk on.",
  },
  "Acetaia Rossi": {
    since: "1961",
    who: "A loft of barrels that is never emptied, only topped. What ships is what was drawn off the smallest cask this year.",
  },
  "Atelier Rive": {
    since: "2011",
    who: "One thrower, one kiln, and a glaze mixed in batches of forty. She signs the underside and does not correct the weight.",
  },
  "Casa Belo": {
    since: "1948",
    who: "A weaving shed in Guimarães running looms older than the building's electricity. Linen only, in three weights.",
  },
  "Torrefazione Nord": {
    since: "1989",
    who: "A drum roaster in a Trieste courtyard, run by ear rather than by profile. They will not roast for filter.",
  },
  "Ferro Milano": {
    since: "1952",
    who: "Cast, machined and assembled in one shop. They still sell the gasket separately, which is the whole argument for buying it.",
  },
};

const PRODUCTS: Product[] = [
  { id: "oil-01", name: "Frantoio olive oil", maker: "Podere Lume", origin: "Umbria, IT", category: "Pantry", price: 28, unit: "500 ml", note: "Pressed within four hours of picking. Green, peppery, and finished in the throat rather than the mouth.", stock: 14 },
  { id: "hon-02", name: "Chestnut honey", maker: "Apiario Verde", origin: "Piedmont, IT", category: "Pantry", price: 16, unit: "340 g", note: "Dark, bitter at the edge, and better on cheese than on bread.", stock: 6 },
  { id: "sal-03", name: "Flaked sea salt", maker: "Saline di Trapani", origin: "Sicily, IT", category: "Pantry", price: 9, unit: "250 g", note: "Hand-harvested, dried in the sun, crushed once.", stock: 41 },
  { id: "vin-04", name: "Six-year vinegar", maker: "Acetaia Rossi", origin: "Modena, IT", category: "Pantry", price: 34, unit: "250 ml", note: "Aged in oak then cherry. Thick enough to coat a spoon.", stock: 9 },
  { id: "cer-05", name: "Stoneware bowl", maker: "Atelier Rive", origin: "Provence, FR", category: "Table", price: 42, unit: "18 cm", note: "Thrown and glazed by hand; no two are the same weight.", stock: 5 },
  { id: "cer-06", name: "Serving platter", maker: "Atelier Rive", origin: "Provence, FR", category: "Table", price: 78, unit: "36 cm", note: "Unglazed on the underside so it sits without sliding.", stock: 3 },
  { id: "lin-07", name: "Washed linen cloth", maker: "Casa Belo", origin: "Guimarães, PT", category: "Table", price: 24, unit: "45 × 70 cm", note: "Heavy weave, stonewashed twice. It will crease, and it should.", stock: 22 },
  { id: "cof-08", name: "Slow-roast coffee", maker: "Torrefazione Nord", origin: "Trieste, IT", category: "Coffee", price: 19, unit: "500 g", note: "Roasted for espresso, ground to order, shipped within a day.", stock: 30 },
  { id: "cof-09", name: "Moka pot, six cup", maker: "Ferro Milano", origin: "Milan, IT", category: "Coffee", price: 56, unit: "6 cup", note: "Cast aluminium, replaceable gasket, no coating to wear off.", stock: 11 },
];

const CATEGORIES = ["All", "Pantry", "Table", "Coffee"];
const PRICES = [
  { id: "any", label: "Any price", test: () => true },
  { id: "under20", label: "Under €20", test: (p: Product) => p.price < 20 },
  { id: "20to50", label: "€20 – €50", test: (p: Product) => p.price >= 20 && p.price <= 50 },
  { id: "over50", label: "Over €50", test: (p: Product) => p.price > 50 },
];

const euro = (n: number) => `€${n.toFixed(2)}`;

export function Mercato() {
  useWorldGround(WORLD);
  const [category, setCategory] = useState("All");
  const [price, setPrice] = useState("any");
  const [inStock, setInStock] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [cart, setCart] = useState<{ id: string; qty: number }[]>([]);
  const [drawer, setDrawer] = useState(false);
  /* Stock is state, not a printed number: adding something takes it off the
     shelf, the low-stock flag moves on its own, and the last one really is the
     last one. */
  const [stock, setStock] = useState<Record<string, number>>(() =>
    Object.fromEntries(PRODUCTS.map((product) => [product.id, product.stock])),
  );
  /** The last thing added, so the shop can confirm it and offer to take it back. */
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [maker, setMaker] = useState(false);
  const confirmTimer = useRef(0);

  const shown = useMemo(() => {
    const priceTest = PRICES.find((p) => p.id === price)?.test ?? (() => true);
    return PRODUCTS.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        priceTest(p) &&
        (!inStock || (stock[p.id] ?? 0) > 8),
    );
  }, [category, price, inStock, stock]);

  const reduced = useReducedMotion();
  const basketRef = useRef<HTMLButtonElement>(null);

  /* The confirmation clears itself after five seconds; leaving the shop before
     then must not leave a timer holding a reference to this tree. */
  useEffect(() => () => window.clearTimeout(confirmTimer.current), []);
  const landing = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(landing.current), []);

  const detail = PRODUCTS.find((p) => p.id === open) ?? null;
  const lines = cart
    .map((l) => ({ ...l, product: PRODUCTS.find((p) => p.id === l.id)! }))
    .filter((l) => l.product);
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const count = cart.reduce((n, l) => n + l.qty, 0);
  const shipping = subtotal >= 60 || subtotal === 0 ? 0 : 5.9;

  /**
   * Adding sends the object itself into the basket.
   *
   * The jar is lifted out of its plate, arcs across the shop and drops into the
   * basket control, which then takes the knock. It is done with the Web
   * Animations API on a cloned node rather than in React: the flight is
   * decoration on top of a state change that has already happened, so it must
   * never be able to delay or block the state change if it fails.
   */
  const add = (id: string, from?: Element | null) => {
    if ((stock[id] ?? 0) <= 0) return;
    setStock((all) => ({ ...all, [id]: Math.max(0, (all[id] ?? 0) - 1) }));
    setJustAdded(id);
    window.clearTimeout(confirmTimer.current);
    confirmTimer.current = window.setTimeout(() => setJustAdded(null), 5000);

    setCart((list) => {
      const found = list.find((l) => l.id === id);
      return found
        ? list.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l))
        : [...list, { id, qty: 1 }];
    });

    flyToBasket(id, from, basketRef.current, reduced);

    // The drawer waits for the object to land, so the two do not collide.
    // Tracked so a second add — or leaving the shop — cancels the pending open.
    window.clearTimeout(landing.current);
    if (reduced) {
      setDrawer(true);
    } else {
      landing.current = window.setTimeout(() => setDrawer(true), 620);
    }
  };

  /** Putting something back is putting it back: the shelf gets it again. */
  const undoAdd = (id: string) => {
    setStock((all) => ({ ...all, [id]: (all[id] ?? 0) + 1 }));
    setCart((list) =>
      list
        .map((l) => (l.id === id ? { ...l, qty: l.qty - 1 } : l))
        .filter((l) => l.qty > 0),
    );
    setJustAdded(null);
  };

  const setQty = (id: string, delta: number) =>
    setCart((list) =>
      list
        .map((l) => (l.id === id ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0),
    );

  return (
    <div className={styles.shop} data-drawer={drawer ? "" : undefined}>
      <header className={styles.head}>
        <a className={styles.logo} href="#catalogue">
          Mercato
        </a>
        <nav className={styles.headNav} aria-label="Departments">
          {CATEGORIES.filter((c) => c !== "All").map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setCategory(c);
                setOpen(null);
              }}
              data-on={category === c ? "" : undefined}
            >
              {c}
            </button>
          ))}
        </nav>
        <p className={styles.ship}>Free delivery over €60</p>
        <button
          type="button"
          ref={basketRef}
          className={styles.cartButton}
          onClick={() => setDrawer((d) => !d)}
          aria-expanded={drawer}
        >
          Basket
          <span className={styles.count} data-full={count > 0 ? "" : undefined}>
            {count}
          </span>
        </button>
      </header>

      {/* Named, not a checkmark: a shopper needs to know *what* went in, and to
          be able to change their mind without opening the basket. */}
      {justAdded && (
        <p className={styles.added} role="status">
          <b>{PRODUCTS.find((x) => x.id === justAdded)?.name}</b> added to the basket
          <button type="button" onClick={() => undoAdd(justAdded)}>
            Undo
          </button>
        </p>
      )}

      <section className={styles.intro}>
        <h1 className={styles.h1}>
          Provisions,
          <em> chosen slowly</em>
        </h1>
        <p className={styles.introText}>
          Nine things from six makers. We buy what we cook with, in quantities the maker can supply
          without changing how they work.
        </p>
        <dl className={styles.introMeta}>
          <div>
            <dt>Makers</dt>
            <dd>6</dd>
          </div>
          <div>
            <dt>Dispatch</dt>
            <dd>Next day</dd>
          </div>
          <div>
            <dt>Returns</dt>
            <dd>30 days</dd>
          </div>
        </dl>
      </section>

      <div className={styles.body} id="catalogue">
        <aside className={styles.filters} aria-label="Filters">
          <div className={styles.filterGroup}>
            <p className={styles.filterLabel}>Department</p>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className={styles.filter}
                data-on={category === c ? "" : undefined}
                onClick={() => {
                  setCategory(c);
                  setOpen(null);
                }}
              >
                {c}
                <span>{c === "All" ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === c).length}</span>
              </button>
            ))}
          </div>

          <div className={styles.filterGroup}>
            <p className={styles.filterLabel}>Price</p>
            {PRICES.map((p) => (
              <button
                key={p.id}
                type="button"
                className={styles.filter}
                data-on={price === p.id ? "" : undefined}
                onClick={() => setPrice(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <label className={styles.check}>
            <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
            Well stocked only
          </label>

          <p className={styles.filterNote}>
            Showing {shown.length} of {PRODUCTS.length}
          </p>
        </aside>

        <main className={styles.catalogue} id="main">
          {detail ? (
            <article className={styles.detail}>
              <button type="button" className={styles.back} onClick={() => setOpen(null)}>
                ← All products
              </button>
              <div className={styles.detailGrid}>
                <div className={styles.detailPlate}>
                  <ProductArt id={detail.id} className={styles.detailArt} />
                </div>
                <div className={styles.detailInfo}>
                  <p className={styles.maker}>{detail.maker} · {detail.origin}</p>
                  <h2 className={styles.detailName}>{detail.name}</h2>
                  <p className={styles.detailPrice}>
                    {euro(detail.price)} <span>/ {detail.unit}</span>
                  </p>
                  <p className={styles.detailNote}>{detail.note}</p>
                  <p
                    className={styles.stock}
                    data-low={(stock[detail.id] ?? 0) < 8 ? "" : undefined}
                    data-out={(stock[detail.id] ?? 0) === 0 ? "" : undefined}
                  >
                    {(stock[detail.id] ?? 0) === 0
                      ? "Sold out — back in ten days"
                      : (stock[detail.id] ?? 0) < 8
                        ? `Only ${stock[detail.id]} left`
                        : `${stock[detail.id]} in stock`}
                  </p>
                  <button
                    type="button"
                    className={styles.addBig}
                    disabled={(stock[detail.id] ?? 0) === 0}
                    onClick={(event) =>
                      add(detail.id, event.currentTarget.closest("div")?.parentElement?.querySelector("svg"))
                    }
                  >
                    {(stock[detail.id] ?? 0) === 0
                      ? "Sold out"
                      : `Add to basket — ${euro(detail.price)}`}
                  </button>

                  {/* The maker, on request. */}
                  {MAKERS[detail.maker] && (
                    <div className={styles.makerBlock}>
                      <button
                        type="button"
                        className={styles.makerToggle}
                        onClick={() => setMaker((v) => !v)}
                        aria-expanded={maker}
                      >
                        {maker ? "Close" : `Who makes it`}
                        <span aria-hidden="true">{maker ? "−" : "+"}</span>
                      </button>
                      {maker && (
                        <div className={styles.makerBody}>
                          <p className={styles.makerSince}>
                            {detail.maker} · making it since {MAKERS[detail.maker]!.since}
                          </p>
                          <p>{MAKERS[detail.maker]!.who}</p>
                        </div>
                      )}
                    </div>
                  )}
                  <dl className={styles.detailSpec}>
                    <div>
                      <dt>Unit</dt>
                      <dd>{detail.unit}</dd>
                    </div>
                    <div>
                      <dt>Department</dt>
                      <dd>{detail.category}</dd>
                    </div>
                    <div>
                      <dt>Dispatch</dt>
                      <dd>Next working day</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </article>
          ) : (
            <>
              <div className={styles.catalogueHead}>
                <h2 className={styles.h2}>{category === "All" ? "Everything" : category}</h2>
                <p className={styles.sortNote}>Sorted by what is freshest in the store</p>
              </div>

              {shown.length === 0 ? (
                <p className={styles.empty}>
                  Nothing matches those filters. Try a wider price, or clear the stock filter.
                </p>
              ) : (
                <ul className={styles.grid}>
                  {shown.map((p) => (
                    <li key={p.id} className={styles.product}>
                      <button
                        type="button"
                        className={styles.productMain}
                        onClick={() => {
                          setOpen(p.id);
                          setMaker(false);
                        }}
                      >
                        <span className={styles.plate}>
                          <ProductArt id={p.id} />
                          {(stock[p.id] ?? 0) === 0 ? (
                            <span className={styles.flag} data-out="">
                              Sold out
                            </span>
                          ) : (
                            (stock[p.id] ?? 0) < 8 && (
                              <span className={styles.flag}>{stock[p.id]} left</span>
                            )
                          )}
                        </span>
                        <span className={styles.productMaker}>{p.maker}</span>
                        <span className={styles.productName}>{p.name}</span>
                        <span className={styles.productMeta}>
                          {euro(p.price)} <i>/ {p.unit}</i>
                        </span>
                      </button>
                      <button
                        type="button"
                        className={styles.add}
                        onClick={(event) =>
                          add(p.id, event.currentTarget.closest("li")?.querySelector("svg"))
                        }
                      >
                        Add
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </main>
      </div>

      <section className={styles.makers}>
        <h2 className={styles.h2}>From the people who make it</h2>
        <p className={styles.makersText}>
          Podere Lume has 400 trees and presses once a year. When the oil runs out in March, it runs
          out — we do not substitute another mill and keep the label.
        </p>
      </section>

      <footer className={styles.foot}>
        <p>Mercato — a fictional shop, drawn as a design exercise</p>
        <p>ABUD · Multiverse 10</p>
      </footer>

      <aside className={styles.drawer} aria-label="Basket" aria-hidden={!drawer}>
        <div className={styles.drawerHead}>
          <p>Your basket</p>
          <button type="button" onClick={() => setDrawer(false)} aria-label="Close basket">
            ✕
          </button>
        </div>

        {lines.length === 0 ? (
          <p className={styles.drawerEmpty}>
            Nothing in the basket yet. Add something and it will appear here with the delivery
            total.
          </p>
        ) : (
          <>
            <ul className={styles.lines}>
              {lines.map((l) => (
                <li key={l.id}>
                  <span className={styles.linePlate}>
                    <ProductArt id={l.product.id} />
                  </span>
                  <span className={styles.lineInfo}>
                    <span className={styles.lineName}>{l.product.name}</span>
                    <span className={styles.lineUnit}>{l.product.unit}</span>
                  </span>
                  <span className={styles.qty}>
                    <button type="button" onClick={() => setQty(l.id, -1)} aria-label="One fewer">
                      −
                    </button>
                    <b>{l.qty}</b>
                    <button type="button" onClick={() => setQty(l.id, 1)} aria-label="One more">
                      +
                    </button>
                  </span>
                  <span className={styles.linePrice}>{euro(l.product.price * l.qty)}</span>
                </li>
              ))}
            </ul>

            <dl className={styles.totals}>
              <div>
                <dt>Subtotal</dt>
                <dd>{euro(subtotal)}</dd>
              </div>
              <div>
                <dt>Delivery</dt>
                <dd>{shipping === 0 ? "Free" : euro(shipping)}</dd>
              </div>
              <div className={styles.grand}>
                <dt>Total</dt>
                <dd>{euro(subtotal + shipping)}</dd>
              </div>
            </dl>

            {shipping > 0 && (
              <p className={styles.nudge}>
                {euro(60 - subtotal)} more for free delivery.
              </p>
            )}

            <button type="button" className={styles.checkout}>
              Checkout
            </button>
          </>
        )}
      </aside>

      {drawer && (
        <button
          type="button"
          className={styles.scrim}
          onClick={() => setDrawer(false)}
          aria-label="Close basket"
        />
      )}
    </div>
  );
}
