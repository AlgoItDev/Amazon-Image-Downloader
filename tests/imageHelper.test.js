import { getHighResImageUrl, isValidUrl } from '../src/utils/imageHelper.js';

describe('Amazon Image Helper', () => {
    describe('getHighResImageUrl', () => {
        test('should remove _AC_SL1500_ modifier', () => {
            const input = 'https://m.media-amazon.com/images/I/71s7D+-sPBL._AC_SL1500_.jpg';
            const expected = 'https://m.media-amazon.com/images/I/71s7D+-sPBL.jpg';
            expect(getHighResImageUrl(input)).toBe(expected);
        });

        test('should remove _SX679_ modifier', () => {
            const input = 'https://m.media-amazon.com/images/I/61kRk-yC5RL._SX679_.jpg';
            const expected = 'https://m.media-amazon.com/images/I/61kRk-yC5RL.jpg';
            expect(getHighResImageUrl(input)).toBe(expected);
        });

        test('should remove complex crop modifiers', () => {
            const input = 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1566425108i/33._SY75_.jpg';
            const expected = 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1566425108i/33.jpg';
            // Note: Our regex might be strictly looking for uppercase. Let's verify strictness.
            // Amazon usually uses uppercase codes.
            expect(getHighResImageUrl(input)).toBe(expected);
        });

        test('should return same URL if no modifier is present', () => {
            const input = 'https://m.media-amazon.com/images/I/71s7D+-sPBL.jpg';
            expect(getHighResImageUrl(input)).toBe(input);
        });

        test('should handle null or empty input', () => {
            expect(getHighResImageUrl(null)).toBeNull();
            expect(getHighResImageUrl('')).toBeNull();
        });
    });

    describe('isValidUrl', () => {
        test('should return true for valid URLs', () => {
            expect(isValidUrl('https://amazon.com')).toBe(true);
        });

        test('should return false for invalid URLs', () => {
            expect(isValidUrl('not a url')).toBe(false);
        });
    });
});
