export default class CheapState {
  /**
   * Converts a string into a namespaced string
   * @param  {string} namespace the namespace
   * @param  {string} keyname keyname
   * @returns {string} a string with namespace.keyname
   */
  static getNamespacedKeyName(namespace, keyname) {
    let namespacedKeyName = '';

    if (!keyname) throw new Error('keyname is required');

    if (namespace && !keyname.includes(`${namespace}.`)) {
      namespacedKeyName = `${namespace}.${keyname}`;
    }
    return namespacedKeyName;
  }

  /**
   *
   * @param {string} namespace a namespace to register
   * @param {Storage} [storage] either localStorage or sessionStorage
   */
  static registerNamespace(namespace, storage) {
    if (!namespace) return;
    const storedNamespaces = storage.getItem('CheapStateNamespaces');
    const currentNamespaces = CheapState.unconvertValue(storedNamespaces) || [];

    if (currentNamespaces.length === 0) {
      const namespaces = [namespace];
      storage.setItem('CheapStateNamespaces', CheapState.convertValue(namespaces));
    } else if (!currentNamespaces.includes(namespace)) {
      currentNamespaces.push(namespace);
      storage.setItem('CheapStateNamespaces', CheapState.convertValue(currentNamespaces));
    }
  }

  /**
   * @param  {*} value item to be stringified
   * @returns {string} stringified item
   */
  static convertValue(value) {
    let convertedValue = value;
    if (value && typeof value === 'object') {
      convertedValue = JSON.stringify(value);
    }
    return convertedValue;
  }

  /**
   * @param  {string} value Item that should be parsed
   * @returns {string | boolean | number | object | Array} whatever the value is, it's returned parsed
   */
  static unconvertValue(value) {
    let unconvertedValue = value;
    const isString = typeof value === 'string';
    const isStringyObject = isString && value.indexOf('{') !== -1;
    const isStringyArray = isString && value.indexOf('[') !== -1;
    const isStringyNumber = isString && !Number.isNaN(Number(value)) && !Number.isNaN(parseFloat(value));
    const isStringyBoolean = isString && (value === 'true' || value === 'false');
    if (isString) {
      unconvertedValue = value.trim();
    }

    // you can JSON.parse just about everything except an actual string
    if (isStringyObject || isStringyArray || isStringyNumber || isStringyBoolean) {
      unconvertedValue = JSON.parse(unconvertedValue);
    }

    return unconvertedValue;
  }

  /**
   * @typedef {"local" | "session"} StorageType
   */

  /**
   * @param  {string} [namespace] the namespace that goes with this CheapState class
   * @param  {StorageType} [type="local"] either local or session
   */
  constructor(namespace = '', type = 'local') {
    this.namespace = namespace;
    this.observers = [];

    const typeName = type
      .toLowerCase()
      .replace(/storage/i, '')
      .trim();

    if (typeName === 'local' || typeName === 'session') {
      this.type = type;
    } else {
      throw new Error('type must be either "local" or "session"');
    }

    if (namespace) {
      CheapState.registerNamespace(namespace, this.storage);
    }

    window.addEventListener('storage', (evt) => {
      const key = this.namespace
        ? evt.key.replace(`${this.namespace}.`, '')
        : evt.key;

      const notifyObject = {
        type: 'storageEvent',
        oldValue: evt.oldValue,
        value: evt.newValue,
        key,
      };
      this.notify(notifyObject);
    });
  }

  /**
   * @returns {Storage} either localStorage or sessionStorage
   */
  get storage() {
    return window[`${this.type}Storage`];
  }

  /**
   * @returns {Map<'key', value>} items de-namespaced map of items
   */
  get items() {
    const items = new Map();
    const storageSize = this.storage.length;
    let index = storageSize;

    // eslint-disable-next-line no-plusplus
    while (--index > -1) {
      const keyName = this.storage.key(index);
      if (keyName.indexOf(this.namespace) === 0) {
        const unnamespacedKey = keyName.replace(`${this.namespace}.`, '');
        items.set(unnamespacedKey, this.get(unnamespacedKey));
      }
    }

    return items;
  }

  /**
   * @returns {number} size the number of items in storage
   */
  get size() {
    return this.items.size;
  }

  /**
   * @returns {number} size the number of items in storage
   */
  get length() {
    return this.items.size;
  }

  /**
   * @returns {string[]} list of the namespaces in storage
   */
  get namespaces() {
    let namespaces = [];
    const currentNamespaces = this.storage.getItem('CheapStateNamespaces');
    if (currentNamespaces) {
      namespaces = CheapState.unconvertValue(currentNamespaces);
    }
    return namespaces;
  }

  /**
   * determines if a namespace already exists
   * @param {string} namespace a namespace to look for in local or sessionStorage
   * @returns {boolean} whether the namespace exists
   */
  hasNamespace(namespace) {
    const { namespaces } = this;
    return namespaces?.includes(namespace);
  }

  /**
   * Sets an item into storage
   * @param {string} key unnamespaced key
   * @param {string|number|boolean|object|Array} value item to be serialized and stored
   */
  set(key, value) {
    const keyName = CheapState.getNamespacedKeyName(this.namespace, key);
    const convertedValue = CheapState.convertValue(value);

    const notifyObj = { type: 'set', key, value: convertedValue };

    if (this.has(key)) {
      notifyObj.oldValue = this.get(key);
    }

    this.storage.setItem(keyName, convertedValue);
    this.notify(notifyObj);
  }

  /**
   * Sets an object's keys and values into storage
   * @param {object} dataObject an object to be serialized and stored
   */
  setObject(dataObject) {
    if (!dataObject && typeof dataObject !== 'object') {
      throw new Error('setObject must be sent an object');
    }
    const isSet = dataObject instanceof Set;
    const isMap = dataObject instanceof Map;
    let data = dataObject;

    if (isSet) {
      data = Array.from(dataObject);
    }

    if (isMap) {
      data = Object.fromEntries(dataObject);
    }

    const clone = JSON.parse(JSON.stringify(data));
    Object.keys(clone).forEach((key) => {
      this.set(key, clone[key]);
    });
  }

  /**
   * gets an item from storage
   * @param {string} key unnamespaced key name
   * @returns {*} the value of the key
   */
  get(key) {
    const keyName = CheapState.getNamespacedKeyName(this.namespace, key);
    const item = this.storage.getItem(keyName);

    return CheapState.unconvertValue(item);
  }

  /**
   * removes item from storage
   * @param {string} key unnamespaced keyname to remove
   */
  delete(key) {
    const keyName = CheapState.getNamespacedKeyName(this.namespace, key);
    const notifyObj = { type: 'delete', key };

    if (this.has(key)) {
      notifyObj.oldValue = this.get(key);
    }

    this.storage.removeItem(keyName);
    this.notify(notifyObj);
  }

  /**
   * Determines if the item is in storage
   * @param {string} key unnamespaced key name
   * @returns {boolean} whether the key exists for the namespace
   */
  has(key) {
    const keyName = key.replace(`${this.namespace}.`, '');
    const keys = this.items.keys();
    let hasKey = false;

    let item = keys.next();

    while (!item.done && !hasKey) {
      if (item.value !== keyName) {
        item = keys.next();
      } else {
        hasKey = true;
      }
    }
    return hasKey;
  }

  /**
   * Deletes all items in the namespaced storage
   */
  clear() {
    [...this.items.keys()].forEach((keyName) => {
      this.delete(keyName);
    });
  }

  /**
   * Adds a function to observables; allows it to receive a payload when storage changes
   * @param  {Function} observable a function that should fire when a change happens to storage
   */
  subscribe(observable) {
    if (typeof observable !== 'function') {
      throw new Error(`observer must be a function, was sent a ${typeof observable}`);
    }

    this.observers.push(observable);
  }

  /**
   * Removes a function from observables
   * @param  {Function} observable a function to remove
   */
  unsubscribe(observable) {
    if (typeof observable !== 'function') {
      throw new Error(`observer must be a function, was sent a ${typeof observable}`);
    }

    this.observers = this.observers.filter((observer) => observer !== observable);
  }

  /**
   * Sends a payload to the observer
   * @param  {*} data a message to send when a change happens to storage
   */
  notify(data) {
    this.observers.forEach((observer) => {
      observer(data);
    });
  }
}
