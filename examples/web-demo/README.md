# Web Demo

Bu, `okey-solver-ts` kütüphanesinin tüm özelliklerini sergileyen interaktif bir web demo uygulamasıdır.

## Nasıl Çalıştırılır?

`index.html` dosyası tamamen bağımsız çalışır — hiçbir build adımı gerekmez.

```bash
# Yöntem 1: Direkt tarayıcıda aç
open examples/web-demo/index.html

# Yöntem 2: Python ile basit HTTP sunucusu
cd examples/web-demo
python3 -m http.server 8080
# Tarayıcıda: http://localhost:8080
```

## Özellikler

- **El Oluşturma**: Renk ve değer seçerek elle taş ekleme.
- **En İyi Dizilim**: `SolverEngine.findBestArrangement()` ile Backtracking algoritması.
- **Joker Modu**: Okey taşı belirterek Wildcard entegrasyonu.
- **Çifte Gitme**: `SolverEngine.findBestPairs()` ile 7 çift bulma.
- **Sahte Okey**: `JOKER` renkli taşlar otomatik olarak gerçek okey değerine çözülür.
- **12-13-1 Döngüsel Seri**: Circular sliding window ile desteklenir.
- **Örnek El**: "Örnek El Yükle" butonu ile hızlı demo.
