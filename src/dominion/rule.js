const ImmutableList = require('./immutablelist');


class Context {
  /** @param {!Map<!Key<?>, ?>} map */
  constructor(map) {
    this.map_ = map;
  }

  /**
   * @param {!Key<T>} key
   * @return {T|undefined}
   * @template T
   */
  get(key) {
    return /** @type {T|undefined} */ (this.map_.get(key));
  }
}


/** @template T */
class WritableContext extends Context {
  constructor() {
    const map = new Map();
    super(map);
  }

  /** @param {!Key<?>} key */
  delete(key) {
    this.map_.delete(key);
  }

  /**
   * @param {!Key<T>} key
   * @param {T|undefined} value
   * @template T
   */
  set(key, value) {
    this.map_.set(key, value);
  }

    // want to encode information about how many total cards
    // are being dealt, or how many remain, or whatever...?
    // init() functions should adjust these parameters before
    // any apply() methods run?  But what about types?

  /** @return {!Context} */ 
  freeze() {
    return new Context(new Map(this.map_.entries()));
  }
}


/** @template T */
class Key {}


/** @template T */
class Rule {
  constructor(weight = 1) {
    this.weight_ = weight;
  }

  /**
   * @param {!WritableContext} contex
   */
  init(ctx) {}


  // Rather than using Context, maybe allow rules to be aware of each other
  // Pass in an ImmutableMultimap of rules (by constructor) as well...?
  //   - rules.get(SelectionSize).kingdomCardsRemaining(selection)
  // ---> no way for YoungWitch to be a separate rule...  maybe that's fine
  // How to tag the bane?
  //   - need to rename the card somehow...


  /**
   // param {!ImmutableList<T>} cards  -- param {number} remaining ...
   * @param {!Context} context
   * @param {!ImmutableList<T>} selection
   * @return {function(T): number}
   */
  apply(ctx, selection) {
    throw new Error('Abstract Rule::apply not overridden in ' + this);
  }

  /**
   * @param {!ImmutableList<T>} cards
   * @param {!ImmutableList<T>} selection
   * @return {!ImmutableList<T>}
   */
  validate(cards, selection) {
    return selection; // must be reference-same as selection if valid...
  }

  get weight() {
    return this.weight_;
  }
}
module.exports = Rule;


// TODO - all this rule factory stuff is mainly for UI.

Rule.Arg = class {
  /** @param {string} name
      @param {string} description
      @param {string} type */
  constructor(name, description, type) {
    /** @private @const */
    this.name_ = name;
    /** @private @const */
    this.description_ = description;
    /** @private @const */
    this.type_ = type;
  }

  get name() { return this.name_; }
  get description() { return this.description_; }

  /** @param {*} arg
      @return {boolean} */
  checkType(arg) {
    // Note: could override this.
    return typeof arg == this.type_;
  }
};


Rule.Arg.String = class extends Rule.Arg {
  constructor(/** string */ name, /** string */ description) {
    super(name, description, 'string');
  }
};


Rule.Arg.Numeric = class extends Rule.Arg {
  constructor(
      /** string */ name, /** string */ description,
      /** number */ min, /** number */ max) {
    super(name, description, 'number');
    /** @private @const */
    this.min_ = min;
    /** @private @const */
    this.max_ = max;

    // integer or decimal?!?
  }

  get min() { return this.min_; }
  get max() { return this.max_; }
};


Rule.Factory = class {
  /** @param {function(new: Rule, ...?)} ctor
      @param {string} name
      @param {string} description
      @param {!Array<!Rule.Arg>} args */
  constructor(ctor, name, description, args) {
    /** @private @const */
    this.ctor_ = ctor;
    /** @private @const */
    this.name_ = name;
    /** @private @const */
    this.description_ = description;
    /** @private @const */
    this.args_ = args;
    // TODO - repeatable?!?
  }
  get name() { return this.name_; }
  get description() { return this.description_; }
  get args() { return this.args_; }

  create(params) {
    // Note: Seq.zip(params, this.args_)
    if (params.length != this.args_.length) {
      throw new Error('Bad number of args for ' + this.name_);
    }
    for (let i = 0; i < params.length; i++) {
      if (!this.args_[i].checkType(params[i])) {
        throw new Error(
            `Bad argument type for ${this.name_}.${this.args_[i].name}`);
      }
      return Reflect.construct(this.ctor_, params);
    }
  }
};
