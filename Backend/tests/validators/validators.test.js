import { describe, it, expect } from 'vitest';

import {
  DOC_TYPES,
  normalizeEmail,
  normalizeText,
  normalizePhone,
  isValidEmail,
  normalizeDocument,
  isValidDocument,
} from '../../src/utils/validators.js';

describe('DOC_TYPES', () => {
  it('contiene los tipos de documento del dominio', () => {
    expect(DOC_TYPES).toEqual(['TI', 'CC', 'CE', 'PA']);
  });
});

describe('isValidEmail', () => {
  it('AUTH-027 rechaza un correo sin @ ni dominio', () => {
    expect(isValidEmail('correo-invalido')).toBe(false);
  });

  it('acepta un correo válido', () => {
    expect(isValidEmail('usuario@example.com')).toBe(true);
  });

  it('rechaza un correo vacío o nulo', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail(null)).toBe(false);
  });
});

describe('normalizeEmail', () => {
  it('AUTH-030 recorta espacios y pasa a minúsculas', () => {
    expect(normalizeEmail('  USUARIO@Example.COM  ')).toBe('usuario@example.com');
  });

  it('devuelve "" para null/undefined', () => {
    expect(normalizeEmail(null)).toBe('');
    expect(normalizeEmail(undefined)).toBe('');
  });
});

describe('normalizeDocument', () => {
  it('recorta espacios y elimina espacios internos', () => {
    expect(normalizeDocument(' 123 456 ')).toBe('123456');
  });
});

describe('normalizeText', () => {
  it('elimina caracteres peligrosos < > y recorta', () => {
    expect(normalizeText('Juan<Perez>')).toBe('JuanPerez');
    expect(normalizeText('  Ana  ')).toBe('Ana');
  });

  it('devuelve "" para null/undefined', () => {
    expect(normalizeText(null)).toBe('');
    expect(normalizeText(undefined)).toBe('');
  });
});

describe('normalizePhone', () => {
  it('conserva solo dígitos', () => {
    expect(normalizePhone('(301) 234-5678')).toBe('3012345678');
  });

  it('devuelve null para vacío/undefined', () => {
    expect(normalizePhone('')).toBe(null);
    expect(normalizePhone(undefined)).toBe(null);
  });
});

describe('isValidDocument', () => {
  it('AUTH-028 rechaza TI con 3 dígitos (deben ser 8-10)', () => {
    expect(isValidDocument('123', 'TI')).toBe(false);
  });

  it('AUTH-029 rechaza un tipo de documento desconocido', () => {
    expect(isValidDocument('12345678', 'XYZ')).toBe(false);
  });

  it('TI válido: 8-10 dígitos', () => {
    expect(isValidDocument('12345678', 'TI')).toBe(true);
    expect(isValidDocument('1234567890', 'TI')).toBe(true);
    expect(isValidDocument('1234567', 'TI')).toBe(false); // 7 dígitos
  });

  it('CC válido: 6-10 dígitos', () => {
    expect(isValidDocument('123456', 'CC')).toBe(true);
    expect(isValidDocument('12345', 'CC')).toBe(false); // 5 dígitos
  });

  it('CE válido: 5-12 dígitos', () => {
    expect(isValidDocument('12345', 'CE')).toBe(true);
    expect(isValidDocument('1234', 'CE')).toBe(false); // 4 dígitos
  });

  it('PA válido: alfanumérico 6-9', () => {
    expect(isValidDocument('ABCD1234', 'PA')).toBe(true);
    expect(isValidDocument('ABC', 'PA')).toBe(false);
  });

  it('documento vacío es inválido', () => {
    expect(isValidDocument('', 'CC')).toBe(false);
    expect(isValidDocument(null, 'CC')).toBe(false);
  });

  it('es case-insensitive respecto al tipo', () => {
    expect(isValidDocument('12345678', 'ti')).toBe(true);
    expect(isValidDocument('123456', 'cc')).toBe(true);
  });
});