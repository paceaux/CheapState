import { expect } from '@esm-bundle/chai';
import CheapState from '../src/index';

describe('CheapState: static methods', () => {
  describe('convertValue', () => {
    it('should convert an object to a string', () => {
      const obj = { a: 1, b: 2 };
      const result = CheapState.convertValue(obj);
      expect(result).to.equal('{"a":1,"b":2}');
    });
    it('should convert an array to a string', () => {
      const array = ['foo', 'bar'];
      const result = CheapState.convertValue(array);
      expect(result).to.equal('["foo","bar"]');
    });
    it('should not convert a number', () => {
      const num = 8675309;
      const result = CheapState.convertValue(num);
      expect(result).to.equal(8675309);
    });
    it('should  convert a truthy boolean', () => {
      const result = CheapState.convertValue(true);
      expect(result).to.equal(true);
    });
    it('should  convert a falsy boolean', () => {
      const result = CheapState.convertValue(false);
      expect(result).to.equal(false);
    });
  });
  describe('unconvertValue', () => {
    it('should convert a stringy Object to an object', () => {
      const str = '{"a":1,"b":2}';
      const result = CheapState.unconvertValue(str);
      expect(result).to.deep.equal({ a: 1, b: 2 });
    });
    it('should convert a string to an array', () => {
      const str = '["foo","bar"]';
      const result = CheapState.unconvertValue(str);
      expect(result).to.deep.equal(['foo', 'bar']);
    });
    it('should not convert a number', () => {
      const num = 8675309;
      const result = CheapState.unconvertValue(num);
      expect(result).to.equal(8675309);
    });
    it('should not convert a true boolean', () => {
      const result = CheapState.unconvertValue(true);
      expect(result).to.equal(true);
    });
    it('should not convert a falsy boolean', () => {
      const result = CheapState.unconvertValue(false);
      expect(result).to.equal(false);
    });
    it('should convert a stringy number', () => {
      const result = CheapState.unconvertValue('8675309');
      expect(result).to.equal(8675309);
    });
    it('should convert a stringy true boolean', () => {
      const result = CheapState.unconvertValue('true');
      expect(result).to.equal(true);
    });
  });
  describe('registerNamespace', () => {
    it('should register a namespace', () => {
      const namespace = 'foo';
      CheapState.registerNamespace(namespace, localStorage);
      const result = localStorage.getItem('CheapStateNamespaces');
      expect(result).to.equal('["foo"]');
    });
    it('should not register a namespace if it already exists', () => {
      const namespace = 'foo';
      CheapState.registerNamespace(namespace, localStorage);
      const result = localStorage.getItem('CheapStateNamespaces');
      expect(result).to.equal('["foo"]');
    });
    it('should not register a namespace if it is not provided', () => {
      const namespace = null;
      CheapState.registerNamespace(namespace, localStorage);
      const result = localStorage.getItem('CheapStateNamespaces');
      expect(result).to.equal('["foo"]');
    });
    it('can register multiple namespaces', () => {
      CheapState.registerNamespace('beep', localStorage);
      CheapState.registerNamespace('boop', localStorage);
      CheapState.registerNamespace('bap', localStorage);
      expect(localStorage.getItem('CheapStateNamespaces')).to.equal('["foo","beep","boop","bap"]');
    });
  });
  describe('getNamespacedKeyName', () => {
    it('should return a namespaced keyname', () => {
      const namespace = 'foo';
      const keyname = 'bar';
      const result = CheapState.getNamespacedKeyName(namespace, keyname);
      expect(result).to.equal('foo.bar');
    });
    it('should not return a namespaced keyname if there is no namespace', () => {
      const namespace = null;
      const keyname = 'bar';
      const result = CheapState.getNamespacedKeyName(namespace, keyname);
      expect(result).to.equal('');
    });
    it('should throw if keyname is not provided', () => {
      const namespace = 'foo';
      const keyname = null;
      const badCall = () => CheapState.getNamespacedKeyName(namespace, keyname);
      expect(badCall).to.throw('keyname is required');
    });
  });
});

describe('CheapState: instance', () => {
  describe('constructor', () => {
    it('should create a new instance', () => {
      const instance = new CheapState();
      expect(instance).to.be.an.instanceOf(CheapState);
    });
    it('should create a new instance with a namespace', () => {
      const namespace = 'foo';
      const instance = new CheapState(namespace);
      expect(instance.namespace).to.equal(namespace);
    });
    it('should throw if you create a type that is not local or session', () => {
      const namespace = 'foo';
      const type = 'foo';
      const badCall = () => new CheapState(namespace, type);
      expect(badCall).to.throw('type must be either "local" or "session"');
    });
  });
  describe('properties', () => {
    describe('storage', () => {
      it('should return localStorage', () => {
        const instance = new CheapState();
        expect(instance.storage).to.equal(localStorage);
      });
      it('should return sessionStorage', () => {
        const instance = new CheapState('', 'session');
        expect(instance.storage).to.equal(sessionStorage);
      });
    });
    describe('namespaces', () => {
      it('should return an array', () => {
        const instance = new CheapState();
        expect(instance.namespaces).to.be.an.instanceOf(Array);
      });
    });
    describe('size and length', () => {
      it('should return the length of the storage', () => {
        const instance = new CheapState('size-test');
        const result = instance.size;
        expect(result).to.equal(0);
      });
      it('should have a different size if something is added', () => {
        const instance = new CheapState('size-test');
        instance.set('foo', 'bar');
        const result = instance.size;
        expect(result).to.equal(1);
      });
      it('should have a length that is same as size', () => {
        const instance = new CheapState('size-test');
        instance.set('foo', 'bar');
        const result = instance.length;
        expect(result).to.equal(instance.size);
      });
    });
    describe('items', () => {
      it('should return a Map', () => {
        const instance = new CheapState('map-test');
        const { items } = instance;
        expect(items).to.be.an.instanceOf(Map);
      });
      it('should return a Map with items', () => {
        const instance = new CheapState('map-test1');
        instance.set('foo', 'bar');
        instance.set('bar', 1);
        instance.set('baz', { a: 1 });
        instance.set('beep', true);
        const { items } = instance;
        expect(items.get('foo')).to.equal('bar');
        expect(items.get('bar')).to.equal(1);
        expect(items.get('baz')).to.deep.equal({ a: 1 });
        expect(items.get('beep')).to.equal(true);
      });
    });
  });
  describe('methods', () => {
    describe('hasNamespace', () => {
      it('should return true if the namespace exists', () => {
        const instance = new CheapState('has-namespace');
        const result = instance.hasNamespace('has-namespace');
        expect(result).to.equal(true);
      });
      it('should return false if the namespace does not exist', () => {
        const instance = new CheapState('has-namespace');
        const result = instance.hasNamespace('no-namespace');
        expect(result).to.equal(false);
      });
    });
    describe('set', () => {
      it('should set an item', () => {
        const instance = new CheapState('set-test');
        instance.set('foo', 'bar');
        const result = instance.get('foo');
        expect(result).to.equal('bar');
        expect(localStorage.getItem('set-test.foo')).to.equal('bar');
      });
      it('should set an item with a namespace', () => {
        const instance = new CheapState('set-test', 'session');
        instance.set('foo', 'bar');
        const result = sessionStorage.getItem('set-test.foo');
        expect(result).to.equal('bar');
      });
    });
    describe('get', () => {
      it('should get an item', () => {
        const instance = new CheapState('get-test');
        instance.set('foo', 'bar');
        const result = instance.get('foo');
        expect(result).to.equal('bar');
      });
      it('should get an item with a namespace', () => {
        const instance = new CheapState('get-test', 'session');
        instance.set('foo', 'bar');
        const result = instance.get('foo');
        expect(result).to.equal('bar');
      });
    });
    describe('delete', () => {
      it('should delete an item', () => {
        const instance = new CheapState('delete-test');
        instance.set('foo', 'bar');
        instance.delete('foo');
        const result = instance.get('foo');
        expect(result).to.equal(null);
      });
      it('should delete an item with a namespace', () => {
        const instance = new CheapState('delete-test', 'session');
        instance.set('foo', 'bar');
        instance.delete('foo');
        const result = instance.get('foo');
        expect(result).to.equal(null);
      });
    });
    describe('has', () => {
      it('should return true if the item exists', () => {
        const instance = new CheapState('has-test');
        instance.set('foo', 'bar');
        const result = instance.has('foo');
        expect(result).to.equal(true);
      });
      it('should return false if the item does not exist', () => {
        const instance = new CheapState('has-test');
        const result = instance.has('booo');
        expect(result).to.equal(false);
      });
    });
    describe('setObject', () => {
      it('should set an object', () => {
        const instance = new CheapState('set-object-test');
        const obj = {
          foo: 'bar',
          bar: 1,
          baz: { a: 1 },
          beep: true,
        };
        instance.setObject(obj);
        const result = instance.get('foo');
        expect(result).to.equal('bar');
        expect(instance.get('bar')).to.equal(1);
        expect(instance.get('baz')).to.deep.equal({ a: 1 });
        expect(instance.get('beep')).to.equal(true);
      });
      it('should throw if an object is not provided', () => {
        const instance = new CheapState('set-object-test');
        const badCall = () => instance.setObject();
        expect(badCall).to.throw('setObject must be sent an object');
      });
      it('should work if sent an array', () => {
        const instance = new CheapState('set-object-test-array');
        const obj = ['foo', 'bar'];
        instance.setObject(obj);
        const result = instance.get('0');
        expect(result).to.equal('foo');
      });
      it('should work if sent a map', () => {
        const instance = new CheapState('set-object-test-map');
        const map = new Map([['foo', 'ood'], ['bar', 'ard']]);
        instance.setObject(map);
        expect(instance.get('foo')).to.equal('ood');
        expect(instance.get('bar')).to.equal('ard');
      });
      it('should work if sent a set', () => {
        const instance = new CheapState('set-set-test-set');
        const set = new Set(['foo', 'bar']);
        instance.setObject(set);
        expect(instance.get('0')).to.equal('foo');
        expect(instance.get('1')).to.equal('bar');
      });
    });
    describe('clear', () => {
      it('should clear the storage', () => {
        const instance = new CheapState('clear-test');
        instance.set('oof', 'rab');
        instance.clear();
        const result = instance.get('foo');
        expect(result).to.equal(null);
        expect(instance.size).to.equal(0);
      });
    });
  });
});
