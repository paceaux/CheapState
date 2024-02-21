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

describe('CheapState: instance methods', () => {
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
});
