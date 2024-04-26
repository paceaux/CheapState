<p align="center">
    <img  width="300" src="./cheapStateLogo.svg">
  <p align="center">The easy way to do state</p>
</p>

[![License][license-image]][license-url] [![Downloads][downloads-image]][downloads-url]

# CheapState

A namespaceable localStorage pub/sub utility for the masses.

Event-driven, persistent state management built on top of localStorage and sessionStorage.

## Examples

### Instantiantiating:

```javascript
const pointsStorage = new CheapState('points');
pointsStorage.set('paceaux', 10);
```

Optionally, instantiate with sessionStorage:
    
```javascript
const pointsStorage = new CheapState('points', 'session');
```

### Saving & Getting items
```javascript

pointsStorage.set('frank', 10);
pointsStorage.get('frank');// 10

```

#### Saving an object

```javascript

pointsStorage.setObject({
    'frank': 10,
    'joe': 20,
    'sally': 30
});
pointsStorage.get('frank'); // 10
```

#### Saving a map

```javascript
const points = new Map([
    ['frank', 10],
    ['joe', 20],
    ['sally', 30]
]);

pointsStorage.setObject(points);
pointsStorage.get('frank'); // 10
```

### Deleting and Clearing

#### Delete an item

```javascript
pointsStorage.delete('sally');
```

#### Clearing the storage

```javascript
pointsStorage.clear();
```

### Adding & subscribing

```javascript
const badgeEls = document.querySelectorAll('.badge');
badgeEls.forEach((badgeEl) => {
    updateBadge(badgeEl)

    // add a subscriber
    pointsStorage.subscribe((payload) => {
        // does the key match this element's key?
        if (payload.key === badgeEl.dataset.key) {
            // update it!
            updateBadge(badgeEl);
        }
    });
});
```

# API

## CheapState

Global Class

`new CheapState(namespace, type)`
##### Parameters
| name      | type  | Description   |
| ---       |---    | ---           |
| namespace    | string       |     the namespaces that goes with the CheapState class        |
| type    | string       |     `local` or `session`      | either local or session storage. Defaults to local.        |

### Static Methods

#### `getNameSpacedKeyName(namespace, keyname)`

##### Parameters

| name      | type  | Description   |
| ---       |---    | ---           |
| namespace    | string       |     the namespaces that goes with the CheapState class        |
| keyname    | string       |     the keyname to be namespaced        |

##### Returns
`string` with with `<namespace>.<keyname>`.

#### `convertValue(value)`
Makes a value safe to be stored in localStorage.

##### Parameters

| name      | type  | Description   |
| ---       |---    | ---           |
| value    | any       |     the value to be converted to a string        |

##### Returns

`string` version of the value.

#### `unconvertValue(value)`

Converts a string into a JavaScript value;

##### Parameters

| name      | type  | Description   |
| ---       |---    | ---           |
| value    | any       |     the value to be converted from a string        |

##### Returns

`any` version of the value.

#### `registerNamespace(namespace, storage)`

Adds a namespace to storage

| name      | type  | Description   |
| ---       |---    | ---           |
| namespace    | string       |     Adds a namespace to storage |
| storage    | Storage       |     either the localStorage or sessionStorage object |

### Instance Members

#### `namespace`

`string` the namespace for the CheapState instance.

#### `observers`

`Function[]` a list of the observers for the CheapState instance.

#### `namespaces`

`string[]` a list of the namespaces in storage.

#### `storage`

`Storage` either localStorage or sessionStorage.

#### `items`

`Map<'string', any>` all of the items in storage for the given namespace.

#### `size`

`number` the number of items in storage for the given namespace.

#### `length`

`number` the number of items in storage for the given namespace. (alias for `size`)

### Instance Methods

#### `hasNamespace(namespace)`
Determines if a namespace already exists

##### Parameters

| name      | type  | Description   |
| ---       |---    | ---           |
| namespace    | string       |     the namespace to check        |

##### Returns
`boolean` if the namespace exists.

#### `set(key, value)`

Sets an item into storage

##### Parameters

| name      | type  | Description   |
| ---       |---    | ---           |
| key    | string       |     the key to set        |
| value    | any       |     the value to set        |

#### `setObject(dataObject)`

Sets an object's keys and values into storage. 

##### Parameters

| name      | type  | Description   |
| ---       |---    | ---           |
| dataObject    | Object|Map|Set|Array       |   an object to be serialized and stored        |


#### `get(key)`

Gets an item from storage.

##### Parameters

| name      | type  | Description   |
| ---       |---    | ---           |
| key    | string       |  an unnamespaced key name       |

##### Returns
`any` the value of the key.


#### `has(key)`

Determines if an item exists in storage.

##### Parameters

| name      | type  | Description   |
| ---       |---    | ---           |
| key    | string       |  an unnamespaced key name       |

##### Returns
`boolean` whether the key exists.

#### `delete(key)`

Deletes an item from storage.

##### Parameters

| name      | type  | Description   |
| ---       |---    | ---           |
| key    | string       |  an unnamespaced key 
name       |

#### `clear()`

Deletes all items in the namespaced storage.

##### Parameters

| name      | type  | Description   |
| ---       |---    | ---           |
| key    | string       |  an unnamespaced key name       |

#### `subscribe(observable)`

Adds a function to observables; allows it to receive a payload when storage changes

##### Parameters

| name      | type  | Description   |
| ---       |---    | ---           |
| observable    | Function       |  a function that should fire when a change happens to storage      |

#### `unsubscribe(observable)`

Removes a function from observables

| name      | type  | Description   |
| ---       |---    | ---           |
| observable    | Function       |  a function to remove      |

#### `notify(data)`

Sends a payload to the observer

| name      | type  | Description   |
| ---       |---    | ---           |
| data    | any       |  a message to send when a change happens. It's sent to all observers.      |


[license-image]: http://img.shields.io/npm/l/cheapstate.svg
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/cheapstate.svg
[downloads-url]: http://npm-stat.com/charts.html?package=cheapstate
