// test/okey-features.test.ts
import { SolverEngine } from '../src';
import { Tile, OkeyMeta } from '../src';

const createTile = (id: string, color: Tile['color'], value: number): Tile => ({ id, color, value });

// Okey taşını temsil eden meta: Kırmızı 7 okey
const okeyMeta: OkeyMeta = { color: 'RED', value: 7 };

// Joker taşları (gerçek okey taşları)
const joker1 = createTile('okey_1', 'RED', 7);
const joker2 = createTile('okey_2', 'RED', 7);

describe('Okey Taşı (Joker/Wildcard) Entegrasyonu', () => {
    describe('Joker ile Seri Oluşturma', () => {
        it('Joker, seri ortasındaki eksik taşın yerine geçmelidir (R4 + JOKER + R6)', () => {
            const tiles: Tile[] = [
                createTile('r4', 'RED', 4),
                joker1,
                createTile('r6', 'RED', 6),
            ];

            const result = SolverEngine.findBestArrangement(tiles, okeyMeta);

            expect(result.melds.length).toBe(1);
            expect(result.melds[0].type).toBe('SERI');
            expect(result.melds[0].tiles.length).toBe(3);
            expect(result.remainingTiles.length).toBe(0);
        });

        it('Joker, serinin başına geçmelidir (JOKER + R5 + R6)', () => {
            const tiles: Tile[] = [
                joker1,
                createTile('r5', 'RED', 5),
                createTile('r6', 'RED', 6),
            ];

            const result = SolverEngine.findBestArrangement(tiles, okeyMeta);

            expect(result.melds.length).toBe(1);
            expect(result.melds[0].type).toBe('SERI');
            expect(result.remainingTiles.length).toBe(0);
        });

        it('Joker, serinin sonuna geçmelidir (R5 + R6 + JOKER)', () => {
            const tiles: Tile[] = [
                createTile('r5', 'RED', 5),
                createTile('r6', 'RED', 6),
                joker1,
            ];

            const result = SolverEngine.findBestArrangement(tiles, okeyMeta);

            expect(result.melds.length).toBe(1);
            expect(result.melds[0].type).toBe('SERI');
            expect(result.remainingTiles.length).toBe(0);
        });

        it('2 joker ile 5 taşlı seri tamamlanabilmelidir', () => {
            // Mavi okey. Joker taşlar mavi.
            const blueOkeyMeta: OkeyMeta = { color: 'BLUE', value: 10 };
            const blueJoker1 = createTile('bjoker1', 'BLUE', 10);
            const blueJoker2 = createTile('bjoker2', 'BLUE', 10);

            // Mavi 4 + Mavi 5 + Joker(6) + Joker(7) + Mavi 8 = seri (4+5+6+7+8=30)
            // veya Joker(3) + Joker(4) + Mavi 5 + Mavi 6 + Mavi 7 vs. Solver en yüksek skoru seçer.
            const tiles: Tile[] = [
                createTile('b4', 'BLUE', 4),
                createTile('b5', 'BLUE', 5),
                blueJoker1,
                blueJoker2,
                createTile('b8', 'BLUE', 8),
            ];

            // Mavi 4 + Mavi 5 + Joker(6) + Joker(7) + Mavi 8 = geçerli seri
            const result = SolverEngine.findBestArrangement(tiles, blueOkeyMeta);

            expect(result.melds.length).toBe(1);
            expect(result.melds[0].type).toBe('SERI');
            expect(result.melds[0].tiles.length).toBe(5);
            expect(result.remainingTiles.length).toBe(0);
        });
    });

    describe('Joker ile Per Oluşturma', () => {
        it('Joker, per\'de eksik rengin yerine geçmelidir (Y7 + B7 + JOKER)', () => {
            const tiles: Tile[] = [
                createTile('y7', 'YELLOW', 7),
                createTile('b7', 'BLUE', 7),
                joker1,
            ];

            const result = SolverEngine.findBestArrangement(tiles, okeyMeta);

            expect(result.melds.length).toBe(1);
            expect(result.melds[0].type).toBe('PER');
            expect(result.melds[0].tiles.length).toBe(3);
            expect(result.remainingTiles.length).toBe(0);
        });

        it('2 joker ile sadece 1 normal taş ile 3\'lü per yapılabilmelidir', () => {
            // Joker: Sarı 13. Elimizde Siyah 13 + 2 joker var.
            // Değer 13 olduğundan jokerler 14 yapamaz, seri imkansız.
            // Jokerler RED 13 ve BLUE 13 olarak simüle edilir => Siyah-Kırmızı-Mavi 13 = PER
            const yellowThirteenMeta: OkeyMeta = { color: 'YELLOW', value: 13 };
            const yjok1 = createTile('yjok1', 'YELLOW', 13);
            const yjok2 = createTile('yjok2', 'YELLOW', 13);

            const tiles: Tile[] = [
                createTile('bk13', 'BLACK', 13),
                yjok1,
                yjok2,
            ];

            const result = SolverEngine.findBestArrangement(tiles, yellowThirteenMeta);

            // Jokerler 14 yapamaz, dolayısıyla seri yok, per yapılır
            expect(result.melds.length).toBe(1);
            expect(result.melds[0].type).toBe('PER');
            expect(result.remainingTiles.length).toBe(0);
        });

    });
});

describe('12-13-1 Döngüsel Seri Kuralı', () => {
    it('12-13-1 serisi geçerli olmalıdır', () => {
        const tiles: Tile[] = [
            createTile('r12', 'RED', 12),
            createTile('r13', 'RED', 13),
            createTile('r1', 'RED', 1),
        ];

        const result = SolverEngine.findBestArrangement(tiles);

        expect(result.melds.length).toBe(1);
        expect(result.melds[0].type).toBe('SERI');
        expect(result.remainingTiles.length).toBe(0);
    });

    it('11-12-13-1 serisi (4 taşlı döngüsel) geçerli olmalıdır', () => {
        const tiles: Tile[] = [
            createTile('r11', 'RED', 11),
            createTile('r12', 'RED', 12),
            createTile('r13', 'RED', 13),
            createTile('r1', 'RED', 1),
        ];

        const result = SolverEngine.findBestArrangement(tiles);

        expect(result.melds.length).toBe(1);
        expect(result.melds[0].type).toBe('SERI');
        expect(result.melds[0].tiles.length).toBe(4);
        expect(result.remainingTiles.length).toBe(0);
    });

    it('Joker ile 12-JOKER-1 serisi tamamlanabilmelidir', () => {
        const tiles: Tile[] = [
            createTile('b12', 'BLUE', 12),
            joker1,
            createTile('b1', 'BLUE', 1),
        ];

        // Mavi okey ise joker mavi 13 olabilir
        const blueOkeyMeta: OkeyMeta = { color: 'BLUE', value: 13 };
        const blueJoker = createTile('bjoker', 'BLUE', 13);
        const tilesWithBlueJoker = [
            createTile('b12', 'BLUE', 12),
            blueJoker,
            createTile('b1', 'BLUE', 1),
        ];

        const result = SolverEngine.findBestArrangement(tilesWithBlueJoker, blueOkeyMeta);

        expect(result.melds.length).toBe(1);
        expect(result.melds[0].type).toBe('SERI');
        expect(result.remainingTiles.length).toBe(0);
    });
});

describe('Sahte Okey Entegrasyonu', () => {
    it('Sahte Okey (JOKER rengi), gerçek okey taşı değerini alarak seri oluşturabilmelidir', () => {
        // Okey = Sarı 5. Sahte Okey rengi JOKER olan bir taş.
        const yellowFiveMeta: OkeyMeta = { color: 'YELLOW', value: 5 };
        const falseOkey = createTile('sahte_okey', 'JOKER', 0); // Sahte Okey

        const tiles: Tile[] = [
            createTile('y3', 'YELLOW', 3),
            createTile('y4', 'YELLOW', 4),
            falseOkey, // Sahte Okey => Sarı 5 olarak çözülür
        ];

        const result = SolverEngine.findBestArrangement(tiles, yellowFiveMeta);

        // Sahte Okey Sarı 5 gibi davranır => Y3-Y4-Y5 serisi
        expect(result.melds.length).toBe(1);
        expect(result.melds[0].type).toBe('SERI');
        expect(result.remainingTiles.length).toBe(0);
    });

    it('Sahte Okey, per içinde de gerçek okey değeriyle kullanılabilmelidir', () => {
        // Okey = Mavi 8. Sahte Okey Mavi 8 gibi davranır.
        const blueEightMeta: OkeyMeta = { color: 'BLUE', value: 8 };
        const falseOkey = createTile('sahte_okey', 'JOKER', 0);

        const tiles: Tile[] = [
            createTile('r8', 'RED', 8),
            createTile('y8', 'YELLOW', 8),
            falseOkey, // Sahte Okey => Mavi 8 gibi, bu bir PER tamamlar
        ];

        const result = SolverEngine.findBestArrangement(tiles, blueEightMeta);

        expect(result.melds.length).toBe(1);
        expect(result.melds[0].type).toBe('PER');
        expect(result.remainingTiles.length).toBe(0);
    });
});

describe('Çifte Gitme (findBestPairs)', () => {
    it('Özdeş çiftleri doğru bulmalıdır', () => {
        const tiles: Tile[] = [
            createTile('r5_1', 'RED', 5),
            createTile('r5_2', 'RED', 5),
            createTile('b9_1', 'BLUE', 9),
            createTile('b9_2', 'BLUE', 9),
            createTile('y3', 'YELLOW', 3), // Tekli
        ];

        const result = SolverEngine.findBestPairs(tiles);

        expect(result.totalPairs).toBe(2);
        expect(result.remainingTiles.length).toBe(1);
        expect(result.remainingTiles[0].id).toBe('y3');
    });

    it('Joker olmadan 7 çift (çifte gitme senaryosu)', () => {
        const tiles: Tile[] = [
            createTile('r1_1', 'RED', 1), createTile('r1_2', 'RED', 1),
            createTile('b2_1', 'BLUE', 2), createTile('b2_2', 'BLUE', 2),
            createTile('y3_1', 'YELLOW', 3), createTile('y3_2', 'YELLOW', 3),
            createTile('bk4_1', 'BLACK', 4), createTile('bk4_2', 'BLACK', 4),
            createTile('r5_1', 'RED', 5), createTile('r5_2', 'RED', 5),
            createTile('b6_1', 'BLUE', 6), createTile('b6_2', 'BLUE', 6),
            createTile('y7_1', 'YELLOW', 7), createTile('y7_2', 'YELLOW', 7),
        ];

        const result = SolverEngine.findBestPairs(tiles);

        expect(result.totalPairs).toBe(7);
        expect(result.remainingTiles.length).toBe(0);
    });

    it('Joker ile eksik çifti tamamlayarak 7 çifte ulaşmalıdır', () => {
        // 6 çift + 1 tekli taş + 1 Joker => Joker tekli taşın çifti olur = 7 çift
        const okeyM: OkeyMeta = { color: 'YELLOW', value: 11 };
        const jokTile = createTile('jok', 'YELLOW', 11);

        const tiles: Tile[] = [
            createTile('r1_1', 'RED', 1), createTile('r1_2', 'RED', 1),
            createTile('b2_1', 'BLUE', 2), createTile('b2_2', 'BLUE', 2),
            createTile('y3_1', 'YELLOW', 3), createTile('y3_2', 'YELLOW', 3),
            createTile('bk4_1', 'BLACK', 4), createTile('bk4_2', 'BLACK', 4),
            createTile('r5_1', 'RED', 5), createTile('r5_2', 'RED', 5),
            createTile('b6_1', 'BLUE', 6), createTile('b6_2', 'BLUE', 6),
            createTile('bk8', 'BLACK', 8), // Tekli - çifti yok
            jokTile, // Joker bu tekli ile çift yapar
        ];

        const result = SolverEngine.findBestPairs(tiles, okeyM);

        expect(result.totalPairs).toBe(7);
        expect(result.remainingTiles.length).toBe(0);
    });

    it('Per olan bir grup (farklı renkli özdeş değerler) çift sayılmamalıdır', () => {
        // Kırmızı 5 ve Mavi 5 => Farklı renk, per yapabilir ama ÇİFT DEĞİL
        const tiles: Tile[] = [
            createTile('r5', 'RED', 5),
            createTile('b5', 'BLUE', 5),
        ];

        const result = SolverEngine.findBestPairs(tiles);

        // Çift = aynı renk + aynı değer. R5 ve B5 çift DEĞİL.
        expect(result.totalPairs).toBe(0);
        expect(result.remainingTiles.length).toBe(2);
    });
});
