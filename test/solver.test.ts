// test/solver.test.ts
import {SolverEngine} from '../src';
import {Tile} from '../src';

describe('SolverEngine.findBestArrangement', () => {

    // Testleri yazmayı kolaylaştıracak küçük bir yardımcı fonksiyon
    const createTile = (id: string, color: Tile['color'], value: number): Tile => ({
        id, color, value
    });

    describe('Temel Per ve Seri Çözümleri', () => {
        it('Basit bir 3\'lü Per dizilimini bulmalıdır', () => {
            const tiles: Tile[] = [
                createTile('r5', 'RED', 5),
                createTile('b5', 'BLUE', 5),
                createTile('y5', 'YELLOW', 5),
                createTile('bk9', 'BLACK', 9) // Boşta kalacak taş
            ];

            const result = SolverEngine.findBestArrangement(tiles);

            expect(result.melds.length).toBe(1);
            expect(result.melds[0].type).toBe('PER');
            expect(result.melds[0].tiles.length).toBe(3);
            expect(result.remainingTiles.length).toBe(1);
            expect(result.remainingTiles[0].id).toBe('bk9');
            // 5 + 5 + 5 = 15 toplam skor (Mevcut logic'e göre)
            expect(result.totalScore).toBe(15);
        });

        it('Basit bir 4\'lü Seri dizilimini bulmalıdır', () => {
            const tiles: Tile[] = [
                createTile('r1', 'RED', 1),
                createTile('r2', 'RED', 2),
                createTile('r3', 'RED', 3),
                createTile('r4', 'RED', 4),
                createTile('b10', 'BLUE', 10) // Boşta kalacak taş
            ];

            const result = SolverEngine.findBestArrangement(tiles);

            expect(result.melds.length).toBe(1);
            expect(result.melds[0].type).toBe('SERI');
            expect(result.melds[0].tiles.length).toBe(4);
            expect(result.remainingTiles.length).toBe(1);
            expect(result.remainingTiles[0].id).toBe('b10');
            // 1 + 2 + 3 + 4 = 10 toplam skor
            expect(result.totalScore).toBe(10);
        });
    });

    describe('Optimizasyon ve Çakışma (Backtracking) Senaryoları', () => {

        it('Aynı taştan iki tane olduğunda (Kopya Taşlar) doğru komboyu seçmelidir', () => {
            // Elimizde Kırmızı 5, Kırmızı 6 ve İKİ tane Kırmızı 7 var.
            // Motorun çökmemesi ve R5-R6-R7 serisini bulup, diğer R7'yi boşa ayırması lazım.
            const tiles: Tile[] = [
                createTile('r5', 'RED', 5),
                createTile('r6', 'RED', 6),
                createTile('r7_A', 'RED', 7),
                createTile('r7_B', 'RED', 7),
            ];

            const result = SolverEngine.findBestArrangement(tiles);

            expect(result.melds.length).toBe(1);
            expect(result.remainingTiles.length).toBe(1);
            expect(result.remainingTiles[0].value).toBe(7); // Boşta kalan 7 olmalı
        });

        it('Taş çakışması (Greedy vs Optimal) durumunda en yüksek skoru veren dizilimi bulmalıdır', () => {
            // ÇOK KRİTİK TEST:
            // Elimizde: Kırmızı 7, Mavi 7, Sarı 7 (Per olabilir)
            // Ayrıca: Kırmızı 8, Kırmızı 9 var.
            // Eğer Kırmızı 7'yi PER'de kullanırsak -> Skor = 7+7+7 = 21 (R8, R9 boşta kalır)
            // Eğer Kırmızı 7'yi SERİ'de kullanırsak -> Skor = 7+8+9 = 24 (Mavi 7, Sarı 7 boşta kalır)
            // Motor Backtracking sayesinde 24'lük seriyi seçmelidir!

            const tiles: Tile[] = [
                createTile('r7', 'RED', 7),
                createTile('b7', 'BLUE', 7),
                createTile('y7', 'YELLOW', 7),
                createTile('r8', 'RED', 8),
                createTile('r9', 'RED', 9),
            ];

            const result = SolverEngine.findBestArrangement(tiles);

            expect(result.melds.length).toBe(1);
            expect(result.melds[0].type).toBe('SERI');
            expect(result.totalScore).toBe(24);
            expect(result.remainingTiles.length).toBe(2);
            expect(result.remainingTiles.map(t => t.id)).toEqual(expect.arrayContaining(['b7', 'y7']));
        });

        it('Aynı anda hem per hem seri oluşturabiliyorsa ikisini de bulmalıdır', () => {
            const tiles: Tile[] = [
                // Seri: Siyah 10, 11, 12
                createTile('bk10', 'BLACK', 10),
                createTile('bk11', 'BLACK', 11),
                createTile('bk12', 'BLACK', 12),
                // Per: Sarı 3, Mavi 3, Kırmızı 3
                createTile('y3', 'YELLOW', 3),
                createTile('b3', 'BLUE', 3),
                createTile('r3', 'RED', 3),
                // Boşta
                createTile('r13', 'RED', 13)
            ];

            const result = SolverEngine.findBestArrangement(tiles);

            expect(result.melds.length).toBe(2);
            expect(result.remainingTiles.length).toBe(1);
            expect(result.remainingTiles[0].id).toBe('r13');
        });

        it('Uzun bir seriyi (örn: 5 taş) parçalamadan almalıdır', () => {
            // Kırmızı 1,2,3,4,5
            const tiles: Tile[] = [
                createTile('r1', 'RED', 1),
                createTile('r2', 'RED', 2),
                createTile('r3', 'RED', 3),
                createTile('r4', 'RED', 4),
                createTile('r5', 'RED', 5),
            ];

            const result = SolverEngine.findBestArrangement(tiles);

            // Jeneratör (1,2,3), (2,3,4), (3,4,5), (1,2,3,4) vs üretecek ama Backtracking
            // en yüksek skor (1+2+3+4+5=15) için tamamını tek bir seri olarak almalıdır.
            expect(result.melds.length).toBe(1);
            expect(result.melds[0].tiles.length).toBe(5);
            expect(result.totalScore).toBe(15);
            expect(result.remainingTiles.length).toBe(0);
        });

    });

    describe('Negatif Senaryolar (Kural İhlalleri)', () => {
        it('Geçersiz taş gruplarından dizilim çıkarmamalıdır', () => {
            const tiles: Tile[] = [
                createTile('r5', 'RED', 5),
                createTile('r5_kopya', 'RED', 5), // Aynı renk, aynı sayı (Hatalı Per)
                createTile('b5', 'BLUE', 5),
                createTile('y1', 'YELLOW', 1),
                createTile('y2', 'YELLOW', 2) // Yetersiz seri uzunluğu (2 taş)
            ];

            const result = SolverEngine.findBestArrangement(tiles);

            expect(result.melds.length).toBe(0);
            expect(result.remainingTiles.length).toBe(5);
            expect(result.totalScore).toBe(0);
        });
    });

    describe('Kompleks Algoritma ve Derinlik Senaryoları', () => {

        it('Kesişen Taş (Bridge) Senaryosu: Toplam skoru maksimize edecek şekilde bölmelidir', () => {
            // Elimizde: Kırmızı 7, 8, 9, 10 ve Mavi 10, Sarı 10 var.
            // Açgözlü seçim: R7,R8,R9,R10 serisi -> 34 puan. (B10, Y10 çöpe gider)
            // Optimal seçim: R7,R8,R9 (24 puan) + R10,B10,Y10 (30 puan) -> Toplam 54 puan!
            // Algoritma büyük seriyi bozup 54 puanı bulmalıdır.
            const tiles: Tile[] = [
                createTile('r7', 'RED', 7),
                createTile('r8', 'RED', 8),
                createTile('r9', 'RED', 9),
                createTile('r10', 'RED', 10),
                createTile('b10', 'BLUE', 10),
                createTile('y10', 'YELLOW', 10),
            ];

            const result = SolverEngine.findBestArrangement(tiles);

            expect(result.melds.length).toBe(2);
            expect(result.totalScore).toBe(54); // 34 değil, 54 bulmalı!
            expect(result.remainingTiles.length).toBe(0);

            // Kırmızı 10'un kesinlikle PER grubunda kullanıldığını doğrula
            const perGroup = result.melds.find(m => m.type === 'PER');
            expect(perGroup?.tiles.some(t => t.id === 'r10')).toBe(true);

            // Serinin sadece 3 elemanlı kaldığını doğrula
            const seriGroup = result.melds.find(m => m.type === 'SERI');
            expect(seriGroup?.tiles.length).toBe(3);
        });

        it('Çift Kopya Taşlar (Gerçek Okey Seti) Senaryosu: Kopyaları ayrı serilerde kullanabilmelidir', () => {
            // Okey setinde her taştan 2 adet vardır.
            // Elimizde: Kırmızı 5(x2), Kırmızı 6(x2), Kırmızı 7(x2)
            // Algoritma bunu tek bir 6 taşlı geçersiz grup değil,
            // İKİ ADET ayrı R5-R6-R7 serisi olarak bulmalıdır.
            const tiles: Tile[] = [
                createTile('r5_1', 'RED', 5),
                createTile('r5_2', 'RED', 5),
                createTile('r6_1', 'RED', 6),
                createTile('r6_2', 'RED', 6),
                createTile('r7_1', 'RED', 7),
                createTile('r7_2', 'RED', 7),
            ];

            const result = SolverEngine.findBestArrangement(tiles);

            expect(result.melds.length).toBe(2);
            expect(result.melds[0].type).toBe('SERI');
            expect(result.melds[1].type).toBe('SERI');
            // (5+6+7) + (5+6+7) = 36
            expect(result.totalScore).toBe(36);
            expect(result.remainingTiles.length).toBe(0);
        });

        it('Çapraz Tuzak Senaryosu: Per yerine Serileri seçerek global maksimumu bulmalıdır', () => {
            // Elimizde:
            // R7, R8, R9 -> Seri (24)
            // B8, B9, B10 -> Seri (27)
            // Y9, Y10, Y11 -> Seri (30)
            // Eğer algoritma açgözlü (greedy) davranıp R9, B9, Y9 ile PER yaparsa:
            // Per(R9,B9,Y9) = 27. Diğer tüm taşlar bozulur (seri olamazlar). Toplam = 27 kalır.
            // Backtracking bunun bir tuzak olduğunu görüp 3 ayrı seriyi (Toplam: 81) seçmelidir.
            const tiles: Tile[] = [
                createTile('r7', 'RED', 7),
                createTile('r8', 'RED', 8),
                createTile('r9', 'RED', 9),

                createTile('b8', 'BLUE', 8),
                createTile('b9', 'BLUE', 9),
                createTile('b10', 'BLUE', 10),

                createTile('y9', 'YELLOW', 9),
                createTile('y10', 'YELLOW', 10),
                createTile('y11', 'YELLOW', 11),
            ];

            const result = SolverEngine.findBestArrangement(tiles);

            expect(result.melds.length).toBe(3);
            expect(result.melds.every(m => m.type === 'SERI')).toBe(true);
            expect(result.totalScore).toBe(81);
            expect(result.remainingTiles.length).toBe(0);
        });

        it('Performans ve Derinlik: Tam bir eli (21 taş) makul sürede çözmelidir', () => {
            // 101'de elde 21 taş bulunur. Motorun çok fazla kombinasyon arasında
            // call stack limitine takılmadan en iyiyi bulup bulmadığını test ediyoruz.
            const tiles: Tile[] = [
                // Seri 1 (24)
                createTile('b7', 'BLUE', 7), createTile('b8', 'BLUE', 8), createTile('b9', 'BLUE', 9),
                // Seri 2 (36)
                createTile('y11', 'YELLOW', 11), createTile('y12', 'YELLOW', 12), createTile('y13', 'YELLOW', 13),
                // Per 1 (6)
                createTile('r2', 'RED', 2), createTile('b2', 'BLUE', 2), createTile('y2', 'YELLOW', 2),
                // Per 2 (27)
                createTile('r9', 'RED', 9), createTile('b9_2', 'BLUE', 9), createTile('bk9', 'BLACK', 9),

                // Çöp Taşlar (9 adet rastgele taş, kombinasyon yaratmayacak şekilde)
                createTile('r1', 'RED', 1),
                createTile('bk13', 'BLACK', 13),
                createTile('y4', 'YELLOW', 4),
                createTile('b1', 'BLUE', 1),
                createTile('r5', 'RED', 5),
                createTile('bk6', 'BLACK', 6),
                createTile('y8', 'YELLOW', 8),
                createTile('r11', 'RED', 11),
                createTile('b4', 'BLUE', 4),
            ];

            // Jest default timeout 5 saniyedir.
            // Eğer algoritma $O(2^n)$ karmaşıklığında boğulursa bu test timeout'a düşer.
            const startTime = performance.now();
            const result = SolverEngine.findBestArrangement(tiles);
            const endTime = performance.now();

            expect(result.melds.length).toBe(4);
            expect(result.remainingTiles.length).toBe(9);
            // 24 + 36 + 6 + 27 = 93
            expect(result.totalScore).toBe(93);

            // Çözüm süresinin 1 saniyenin (1000ms) altında olduğunu doğrula
            expect(endTime - startTime).toBeLessThan(1000);
        });

    });
});