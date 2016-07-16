class Shuffle {
  constructor(cards) {
    this.cards_ = cards;
    const n = cards.names.length;
    this.amplitudes_ = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      this.amplitudes_[i] = Math.random();
    }
  }

  /** @return {!Array<!CardJson>} */
  shuffle() {
    // Find the highest amplitudes... what about events?
    const names = this.cards_.names;
    const map = this.cards_.cards;
    const n = names.length;
    const cards = new Array(n);
    for (let i = 0; i < n; i++) {
      map.get(names[i]).text = [];
      cards[i] = [this.amplitudes_[i], map.get(names[i])];
    }
    cards.sort((a, b) => a[0] - b[0]);

    //console.dir(cards);

    const result = [];
    let bane = false;
    while (cards.length) {
      const card = cards.shift()[1];
      result.push(card);
      if (card.tags.indexOf('Bane') >= 0) bane = true;
      if (result.length >= 10) break;
    }
    if (bane) {
      while (cards.length) {
        const card = cards.shift()[1];
        if (!/^\$[1234]$/.test(card.cost)) continue;
        result.push(withName(card, card.name + ' (bane)'));
      }
    }

    return result;
  }
}


function withName(card, name) {
  const copy = JSON.parse(JSON.stringify(card));
  copy.name = name;
  return copy;
}


// Write constraints as metroplis weight functions
//   TwoExpansions:    cost = # of cards not in two biggest expansions
//   ThreeExpansions:  cost = # not in three biggest
//   BalancedCost:     cost = # in mode(sum(cost))
//   etc...

// Problem with this is that there's an exponential effect for
// underrepresented expansions - the half-expansions almost never
// show up, and when they do there's only a couple cards from them.

// Also options about # events and landmarks, etc, as part of shuffle...
// (default to 2 total) -- 

// Then do random shuffle, then 10k steps of equilibrating, anneal T -> 0 ???

// Idea: rather than a discrete shuffle, make it continuous...?
//  -- basically it's a superposition of all cards w/ different amplitudes
//  -- then we can _project_ it to a concrete shuffle using simple rules
//     (which takes young witch into account, for instance by taking the
//     highest-amplitude correct-cost card after the first 10).
//     -- also take the highest two events, for instance... - never set to zero?
//  -- could we do a difference map on this?


/** @interface */
class Constraint {
  /**
   * @param {!Array<!CardJson>}
   * @return {number}
   */
  cost(selection) {}
}


class ExpansionLimit {
  constructor(count = 2, exemption = 0) {
    this.count_ = count;
    this.exemption_ = exemption;
  }
  cost(selection) {
    const map = new DefaultMap(() => 0);
    for (const card of selection) {
      map.set(card.expansion, map.get(card.expansion) + 1);
    }
    const counts = [...map.values()].sort();
    if (counts <= this.count_) return 0;
    counts.splice(counts.length - this.count_, this.count_);
    return Math.max(0, counts.reduce((a, b) => a + b, 0) - this.exemption_);
  }
}


class SumConstraints {
  constructor(constraints) {
    this.constraints_ = constraints;
  }
  cost(selection) {
    return this.constraints_
        .map(c => c.cost(selection))
        .reduce((a, b) => a + b);
  }
}


function anneal(steps, constraint) {
  let cards = new Cards(CARD_LIST);
  let shuffle = cards.shuffle();
  let initialTemp = 20;
  let cost = constraint.cost(shuffle);
  for (let temp = initialTemp; temp > -initialTemp; temp -= (1.2 * initialTemp / steps)) {
    const newShuffle = cards.step(shuffle);
    const newCost = constraint.cost(newShuffle);
    const delta = Math.min(cost - newCost, 0);
    const temperature = Math.max(temp, 0);
    if (newCost <= cost ||
        Math.random() < Math.exp((cost - newCost) / Math.max(0, temp))) {
      cost = newCost;
      shuffle = newShuffle;
    }
  }
  return shuffle;
}


const result = anneal(1000, new ExpansionLimit(2));
