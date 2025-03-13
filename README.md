# Simulasi Efisiensi Energi Bangunan

Aplikasi web interaktif untuk mensimulasikan penghematan energi melalui berbagai intervensi efisiensi energi pada bangunan.

## Deskripsi

Aplikasi ini memungkinkan pengguna untuk:
- Memasukkan data bangunan seperti dimensi, jumlah lantai, dan karakteristik lainnya
- Memilih dari berbagai intervensi efisiensi energi
- Melihat penghematan energi yang diproyeksikan, pengurangan emisi CO₂, dan analisis biaya

## Fitur

### Data Bangunan
- Input dimensi bangunan (lebar, panjang, tinggi)
- Jumlah lantai dan tinggi lantai
- Window to Wall Ratio (WWR)
- Jenis atap dan kemiringan
- Tagihan listrik bulanan

### Parameter Perhitungan
- Jenis sistem pendingin (AC Split atau AC Central)
- Tarif listrik
- Faktor emisi grid

### Intervensi Efisiensi Energi
Simulasi mencakup berbagai intervensi, masing-masing dengan persentase pengurangan konsumsi energi:

1. **Kaca solar pada jendela**
   - Nilai pengurangan dinamis: 8% default, 6% jika cat reflektif dipilih, 2% jika sistem pendingin dipilih

2. **Cat reflektif pada atap**
   - Nilai pengurangan dinamis: 4% default, 2% jika kaca solar dipilih, 1% jika sistem pendingin dipilih

3. **Sistem Pendingin**
   - Berbagai pilihan sistem AC Central atau AC Split
   - Pengurangan bervariasi (28-33%) dengan penyesuaian dinamis berdasarkan pemilihan kaca solar/atap reflektif

4. **Sensor exhaust fan**
   - Nilai pengurangan dinamis: 1% default, 0% jika BMS dipilih

5. **Lampu LED**
   - Nilai pengurangan dinamis: 4% default, 1% jika BMS dipilih

6. **Sistem Kendali Pencahayaan**
   - Sistem terpisah (2%) atau terpusat (3%)
   - Nilai pengurangan menjadi 0% jika BMS dipilih

7. **Sistem Pompa Air**
   - Pompa air baru (2%) atau retrofit (4%)
   - Nilai pengurangan menjadi 1% jika BMS dipilih

8. **Pemanas air on-demand**
   - Nilai pengurangan 0,4%

9. **Building Management System (BMS)**
   - Nilai pengurangan dinamis: 15% default, 8% jika sistem pendingin dipilih

10. **Energy Monitoring System**
    - Nilai pengurangan dinamis: 4% default, 2% jika sistem pendingin dipilih

### Analisis Hasil
- Penghematan energi tahunan (MWh/tahun)
- Pengurangan emisi CO₂ (ton CO₂e/tahun)
- Penghematan biaya (Rp/tahun)
- Investasi yang diperlukan (Rp)
- Payback period (tahun)

### Visualisasi
- Grafik distribusi konsumsi energi
- Visualisasi penghematan untuk berbagai kategori konsumsi energi

## Cara Menggunakan

1. Masukkan data bangunan pada kartu "Data Bangunan"
2. Isi parameter perhitungan
3. Pilih intervensi efisiensi energi yang ingin disimulasikan
4. Lihat hasil analisis dan grafik distribusi energi

## Ketergantungan

- Bootstrap 5.3.0
- Chart.js

## Fitur Terbaru

- Implementasi nilai pengurangan dinamis untuk intervensi berdasarkan interaksi antar intervensi
- Perhitungan otomatis investasi berdasarkan luas bangunan
- Visualisasi penghematan energi per kategori
