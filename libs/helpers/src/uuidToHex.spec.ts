import { uuidToHex } from './uuidToHex';

describe('helpers', () => {
  it('should work', () => {
    expect(uuidToHex('3d6b7e8f-2e15-4A9C-B54d-63e8d3A7726a')).toEqual(
      '3d6b7e8f2e154a9cb54d63e8d3a7726a',
    );
  });
});
