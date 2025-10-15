/*
 * Quran Player GNOME Shell Extension
 * Copyright (C) 2025 faymaz - https://github.com/faymaz
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';

import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

//console.log('Constants file loaded from:', import.meta.url);

export const DEFAULT_RECITERS = [
  {
    "name": "Abdullah Basfar",
    "baseUrl": "https://podcasts.qurancentral.com/abdullah-basfar/abdullah-basfar-",
    "audioFormat": "%id%.mp3",
    "type": "surah"
  },
  {
    "name": "Abdullah Basfar Quran With English Translation",
    "baseUrl": "https://archive.org/download/abdullah-basfar-quran-mp3-with-english-translation/",
    "audioFormat": "%specialFormat%",
    "type": "surah",
    "hasSpecialFormat": true,
    "formatMap": {
      "01": "Abdullah-Basfar-Quran-English-001-Al-Fatihah.mp3",
      "02": "Abdullah-Basfar-Quran-English-002-Al-Baqarah.mp3",
      "40": "Abdullah-Basfar-Quran-English-040-Al-Ghafir.mp3",
      "41": "Abdullah-Basfar-Quran-English-041-Al-Fushilat.mp3",
      "42": "Abdullah-Basfar-Quran-English-042-Asy-Syuura.mp3",
      "43": "Abdullah-Basfar-Quran-English-043-Az-Zukhruf.mp3",
      "44": "Abdullah-Basfar-Quran-English-044-Ad-Dukhaan.mp3",
      "45": "Abdullah-Basfar-Quran-English-045-Al-Jaatsiyah.mp3",
      "46": "Abdullah-Basfar-Quran-English-046-Al-Ahqaaf.mp3",
      "47": "Abdullah-Basfar-Quran-English-047-Muhammad.mp3",
      "48": "Abdullah-Basfar-Quran-English-048-Al-Fath.mp3",
      "49": "Abdullah-Basfar-Quran-English-049-Al-Hujuraat.mp3",
      "50": "Abdullah-Basfar-Quran-English-050-Qaaf.mp3",
      "51": "Abdullah-Basfar-Quran-English-051-Adz-Dzaariyaat.mp3",
      "52": "Abdullah-Basfar-Quran-English-052-Ath-Thuur.mp3",
      "53": "Abdullah-Basfar-Quran-English-053-An-Najm.mp3",
      "54": "Abdullah-Basfar-Quran-English-054-Al-Qamar.mp3",
      "55": "Abdullah-Basfar-Quran-English-055-Ar-Rahmaan.mp3",
      "56": "Abdullah-Basfar-Quran-English-056-Al-Waaqiah.mp3",
      "57": "Abdullah-Basfar-Quran-English-057-Al-Hadiid.mp3",
      "58": "Abdullah-Basfar-Quran-English-058-Al-Mujaadalah.mp3",
      "59": "Abdullah-Basfar-Quran-English-059-Al-Hasyr.mp3",
      "60": "Abdullah-Basfar-Quran-English-060-Al-Mumtahanah.mp3",
      "61": "Abdullah-Basfar-Quran-English-061-Ash-Shaff.mp3",
      "62": "Abdullah-Basfar-Quran-English-062-Al-Jumuah.mp3",
      "63": "Abdullah-Basfar-Quran-English-063-Al-Munafiqun.mp3",
      "64": "Abdullah-Basfar-Quran-English-064-Ath-Taghabun.mp3",
      "65": "Abdullah-Basfar-Quran-English-065-Ath-Thalaaq.mp3",
      "66": "Abdullah-Basfar-Quran-English-066-At-Tahriim.mp3",
      "67": "Abdullah-Basfar-Quran-English-067-Al-Mulk.mp3",
      "68": "Abdullah-Basfar-Quran-English-068-Al-Qalam.mp3",
      "69": "Abdullah-Basfar-Quran-English-069-Al-Haaqqah.mp3",
      "70": "Abdullah-Basfar-Quran-English-070-Al-Maarij.mp3",
      "71": "Abdullah-Basfar-Quran-English-071-Nuh.mp3",
      "72": "Abdullah-Basfar-Quran-English-072-Al-Jin.mp3",
      "73": "Abdullah-Basfar-Quran-English-073-Al-Muzammil.mp3",
      "74": "Abdullah-Basfar-Quran-English-074-Al-Muddastir.mp3",
      "75": "Abdullah-Basfar-Quran-English-075-Al-Qiyaamah.mp3",
      "76": "Abdullah-Basfar-Quran-English-076-Al-Insaan.mp3",
      "77": "Abdullah-Basfar-Quran-English-077-Al-Mursalaat.mp3",
      "78": "Abdullah-Basfar-Quran-English-078-An-Naba.mp3",
      "79": "Abdullah-Basfar-Quran-English-079-An-Naaziaat.mp3",
      "80": "Abdullah-Basfar-Quran-English-080-Abasa.mp3",
      "81": "Abdullah-Basfar-Quran-English-081-At-Takwiir.mp3",
      "82": "Abdullah-Basfar-Quran-English-082-Al-Infithaar.mp3",
      "83": "Abdullah-Basfar-Quran-English-083-Al-Muthaffifiin.mp3",
      "84": "Abdullah-Basfar-Quran-English-084-Al-Insyiqaaq.mp3",
      "85": "Abdullah-Basfar-Quran-English-085-Al-Buruuj.mp3",
      "86": "Abdullah-Basfar-Quran-English-086-Ath-Thariq.mp3",
      "87": "Abdullah-Basfar-Quran-English-087-Al-Alaa.mp3",
      "88": "Abdullah-Basfar-Quran-English-088-Al-Ghasyiyah.mp3",
      "89": "Abdullah-Basfar-Quran-English-089-Al-Fajr.mp3",
      "90": "Abdullah-Basfar-Quran-English-090-Al-Balad.mp3",
      "91": "Abdullah-Basfar-Quran-English-091-Asy-Syams.mp3",
      "92": "Abdullah-Basfar-Quran-English-092-Al-Lail.mp3",
      "93": "Abdullah-Basfar-Quran-English-093-Adh-Dhuha.mp3",
      "94": "Abdullah-Basfar-Quran-English-094-As-Syarh.mp3",
      "95": "Abdullah-Basfar-Quran-English-095-At-Tiin.mp3",
      "96": "Abdullah-Basfar-Quran-English-096-Al-Alaq.mp3",
      "97": "Abdullah-Basfar-Quran-English-097-Al-Qadr.mp3",
      "98": "Abdullah-Basfar-Quran-English-098-Al-Bayyinah.mp3",
      "99": "Abdullah-Basfar-Quran-English-099-Az-Zalzalah.mp3",
      "100": "Abdullah-Basfar-Quran-English-100-Al-Adiyaat.mp3",
      "101": "Abdullah-Basfar-Quran-English-101-Al-Qaariah.mp3",
      "102": "Abdullah-Basfar-Quran-English-102-At-Takaatsur.mp3",
      "103": "Abdullah-Basfar-Quran-English-103-Al-Ashr.mp3",
      "104": "Abdullah-Basfar-Quran-English-104-Al-Humazah.mp3",
      "105": "Abdullah-Basfar-Quran-English-105-Al-Fiil.mp3",
      "106": "Abdullah-Basfar-Quran-English-106-Quraisy.mp3",
      "107": "Abdullah-Basfar-Quran-English-107-Al-Maauun.mp3",
      "108": "Abdullah-Basfar-Quran-English-108-Al-Kautsar.mp3",
      "109": "Abdullah-Basfar-Quran-English-109-Al-Kaafiruun.mp3",
      "110": "Abdullah-Basfar-Quran-English-110-An-Nashr.mp3",
      "111": "Abdullah-Basfar-Quran-English-111-Al-Lahb.mp3",
      "112": "Abdullah-Basfar-Quran-English-112-Al-Ikhlash.mp3",
      "113": "Abdullah-Basfar-Quran-English-113-Al-Falaq.mp3",
      "114": "Abdullah-Basfar-Quran-English-114-An-Naas.mp3"
    }
  },
  {
    "name": "Abdullah Matrood",
    "baseUrl": "https://podcasts.qurancentral.com/abdullah-al-matrood/abdullah-al-matrood-",
    "audioFormat": "%id%-muslimcentral.com.mp3",
    "type": "surah"
  },
  {
    "name": "Abdul Rahman Al-Sudais",
    "baseUrl": "https://podcasts.qurancentral.com/abdul-rahman-al-sudais/192/abdul-rahman-al-sudais-",
    "audioFormat": "%id%-qurancentral.com-192.mp3",
    "type": "surah"
  },
  {
    "name": "AbdulBaset AbdulSamad",
    "baseUrl": "https://download.quranicaudio.com/quran/abdul_basit_murattal/",
    "audioFormat": "%id%.mp3",
    "type": "surah"
  },
  {
    "name": "Ahmed Al Ajmi",
    "baseUrl": "https://podcasts.qurancentral.com/ahmed-al-ajmi/ahmed-al-ajmi-",
    "audioFormat": "%id%.mp3",
    "type": "surah"
  },
  {
    "name": "Ali Al-Huthaify",
    "baseUrl": "https://podcasts.qurancentral.com/ali-abdur-rahman-al-huthaify/ali-abdur-rahman-al-huthaify-",
    "audioFormat": "%id%.mp3",
    "type": "surah"
  },
  {
    "name": "Der edle Koran - Deutsch Übersetzung",
    "baseUrl": "https://archive.org/download/Der_edle_Koran/",
    "audioFormat": "%id%.mp3",
    "type": "surah"
  },
  {
    "name": "Fatih Seferagic",
    "baseUrl": "https://download.quranicaudio.com/quran/fatih_seferagic/",
    "audioFormat": "%id%.mp3",
    "type": "surah"
  },
  {
    "name": "Hani Ar-Rifai",
    "baseUrl": "https://podcasts.qurancentral.com/hani-ar-rifai/hani-ar-rifai-",
    "audioFormat": "%id%.mp3",
    "type": "surah"
  },
  {
    "name": "Hayri Küçükdeniz-Suat Yıldırım Türkçe Meali",
    "baseUrl": "https://archive.org/download/Kurani.Kerim.Meali.30.cuz.Prof.Dr.SuatYildirim/",
    "audioFormat": "%specialFormat%",
    "type": "juz",
    "hasSpecialFormat": true,
    "formatMap": {
      "01": "01cuz.mp3",
      "02": "02Cuz.mp3",
      "03": "03Cuz.mp3",
      "04": "04Cuz.mp3",
      "05": "05Cuz.mp3",
      "06": "06Cuz.mp3",
      "07": "07Cuz.mp3",
      "08": "08Cuz.mp3",
      "09": "09Cuz.mp3",
      "10": "10Cuz.mp3",
      "11": "11Cuz.mp3",
      "12": "12Cuz.mp3",
      "13": "13Cuz.mp3",
      "14": "14Cuz.mp3",
      "15": "15Cuz.mp3",
      "16": "16Cuz.mp3",
      "17": "17Cuz.mp3",
      "18": "18Cuz.mp3",
      "19": "19Cuz.mp3",
      "20": "20Cuz.mp3",
      "21": "21Cuz.mp3",
      "22": "22Cuz.mp3",
      "23": "23Cuz.mp3",
      "24": "24Cuz.mp3",
      "25": "25Cuz.mp3",
      "26": "26Cuz.mp3",
      "27": "27Cuz.mp3",
      "28": "28Cuz.mp3",
      "29": "29Cuz.mp3",
      "30": "30Cuz.mp3"
    }
  },
  {
    "name": "Maher Al-Muaiqly",
    "baseUrl": "https://podcasts.qurancentral.com/ali-abdur-rahman-al-huthaify/ali-abdur-rahman-al-huthaify-",
    "audioFormat": "%id%.mp3",
    "type": "surah"
  },
  {
    "name": "Mishary Al-Afasy",
    "baseUrl": "https://podcasts.qurancentral.com/mishary-rashid-alafasy/mishary-rashid-alafasy-",
    "audioFormat": "%id%-muslimcentral.com.mp3",
    "type": "surah"
  },
  {
    "name": "Mehmet Ali Şengül",
    "baseUrl": "https://archive.org/download/mehmetalisengul/Mehmet%20Ali%20%C5%9Eeng%C3%BCl%20ile%20Hatm-i%20%C5%9Eerif%20_%20",
    "audioFormat": "%id%.%20C%C3%BCz%20%28256kbit%29.mp3",
    "type": "juz"
  },
  {
    "name": "Mehmet Emin Ay",
    "baseUrl": "https://archive.org/download/MehmetEminAYmp3/Mehmet%20Emin%20AY%20_%20Hatm-i%20%C5%9Eerif%20",
    "audioFormat": "%specialFormat%",
    "type": "juz",
    "hasSpecialFormat": true,
    "formatMap": {
      "01": "01.C%C3%BCz.mp3",
      "02": "02.C%C3%BCz.mp3",
      "03": "03.C%C3%BCz.mp3",
      "04": "04.C%C3%BCz.mp3",
      "05": "05.C%C3%BCz.mp3",
      "06": "06.C%C3%BCz.mp3",
      "07": "07.C%C3%BCz.mp3",
      "08": "08.C%C3%BCz.mp3",
      "09": "09.C%C3%BCz.mp3",
      "10": "10.C%C3%BCz.mp3",
      "11": "11.C%C3%BCz.mp3",
      "12": "12.C%C3%BCz.mp3",
      "13": "13.C%C3%BCz.mp3",
      "14": "14.C%C3%BCz.mp3",
      "15": "15.C%C3%BCz.mp3",
      "16": "16.C%C3%BCz.mp3",
      "17": "17.C%C3%BCz.mp3",
      "18": "18.C%C3%BCz.mp3",
      "19": "19.C%C3%BCz.mp3",
      "20": "20.C%C3%BCz.mp3",
      "21": "21.C%C3%BCz.mp3",
      "22": "22.C%C3%BCz.mp3",
      "23": "23.C%C3%BCz.mp3",
      "24": "24.C%C3%BCz.mp3",
      "25": "25.C%C3%BCz.mp3",
      "26": "26.C%C3%BCz.mp3",
      "27": "27.C%C3%BCz.mp3",
      "28": "28.C%C3%BCz.mp3",
      "29": "29.C%C3%BCz.mp3",
      "30": "30.c%C3%BCz.mp3"
    }
  },
  {
    "name": "Muhammad Ayyub",
    "baseUrl": "https://podcasts.qurancentral.com/muhammad-ayyub/muhammad-ayyub-",
    "audioFormat": "%id%.mp3",
    "type": "surah"
  },
  {
    "name": "Mustafa Ismail",
    "baseUrl": "https://download.quranicaudio.com/quran/mostafa_ismaeel/",
    "audioFormat": "%id%.mp3",
    "type": "surah"
  },
  {
    "name": "Quran with English Translation - Basfar",
    "baseUrl": "https://archive.org/download/Basfar/",
    "audioFormat": "%id%.mp3",
    "type": "surah"
  },
  {
    "name": "Quran With English Translation Audio (Mishary)",
    "baseUrl": "https://archive.org/download/Quran_With_English_Translation/",
    "audioFormat": "%specialFormat%",
    "type": "surah",
    "hasSpecialFormat": true,
    "formatMap": {
        "01": "001 surah_al_fatihah.mp3",
        "02": "002 surah_al_baqarah.mp3",
        "03": "003 surah_al_imran.mp3",
        "04": "004 surah_an_nisa.mp3",
        "05": "005 surah_al_maidah.mp3",
        "06": "006 surah_al_anam.mp3",
        "07": "007 surah_al_araf.mp3",
        "08": "008 surah_al_anfal.mp3",
        "09": "009 surah_at_tawbah.mp3",
        "10": "010 surah_yunus.mp3",
        "11": "011 surah_hud.mp3",
        "12": "012 surah_yusuf.mp3",
        "13": "013 surah_ar_rad.mp3",
        "14": "014 surah_ibrahim.mp3",
        "15": "015 surah_al_hijr.mp3",
        "16": "016 surah_an_nahl.mp3",
        "17": "017 surah_al_isra.mp3",
        "18": "018 surah_al_kahf.mp3",
        "19": "019 surah_maryam.mp3",
        "20": "020 surah_ta_ha.mp3",
        "21": "021 surah_al_anbiya.mp3",
        "22": "022 surah_al_hajj.mp3",
        "23": "023 surah_al_muminun.mp3",
        "24": "024 surah_an_nur.mp3",
        "25": "025 surah_al_furqan.mp3",
        "26": "026 surah_ash_shuara.mp3",
        "27": "027 surah_an_naml.mp3",
        "28": "028 surah_al_qasas.mp3",
        "29": "029 surah_al_ankabut.mp3",
        "30": "030 surah_ar_rum.mp3",
        "31": "031Surah_luqman.mp3",
        "32": "032Surah_as_sajdah.mp3",
        "33": "033Surah_al_ahzab.mp3",
        "34": "034Surah_saba.mp3",
        "35": "035Surah_fatir.mp3",
        "36": "036Surah_ya_sin.mp3",
        "37": "037Surah_as_safat.mp3",
        "38": "038Surah_sad.mp3",
        "39": "039Surah_az_zumar.mp3",
        "40": "040Surah_ghafir.mp3",
        "41": "041Surah_fussilat.mp3",
        "42": "042Surah_ash_shura.mp3",
        "43": "043Surah_az_zukhruf.mp3",
        "44": "044Surah_ad_dukhan.mp3",
        "45": "045Surah_al_jathiyah.mp3",
        "46": "046Surah_al_ahqaf.mp3",
        "47": "047Surah_muhammad.mp3",
        "48": "048Surah_al_fath.mp3",
        "49": "049Surah_al_hujurat.mp3",
        "50": "050Surah_qaf.mp3",
        "51": "051Surah_adh_dhariyat.mp3",
        "52": "052Surah_at_tur.mp3",
        "53": "053Surah_an_najm.mp3",
        "54": "054Surah_al_qamar.mp3",
        "55": "055Surah_ar_rahman.mp3",
        "56": "056Surah_al_waqiah.mp3",
        "57": "057Surah_al_hadid.mp3",
        "58": "058Surah_al_mujadilah.mp3",
        "59": "059Surah_al_hashr.mp3",
        "60": "060Surah_al_mumtahanah.mp3",
        "61": "061Surah_as_saff.mp3",
        "62": "062Surah_al_jumuah.mp3",
        "63": "063Surah_al_munafiqun.mp3",
        "64": "064Surah_at_taghabun.mp3",
        "65": "065Surah_at_talaq.mp3",
        "66": "066Surah_at_tahrim.mp3",
        "67": "067Surah_al_mulk.mp3",
        "68": "068Surah_al_qalam.mp3",
        "69": "069Surah_al_haqqah.mp3",
        "70": "070Surah_al_maarij.mp3",
        "71": "071Surah_nuh.mp3",
        "72": "072Surah_al_jinn.mp3",
        "73": "073Surah_al_muzzammil.mp3",
        "74": "074Surah_al_muddaththir.mp3",
        "75": "075Surah_al_qiyamah.mp3",
        "76": "076Surah_al_insan.mp3",
        "77": "077Surah_al_mursalat.mp3",
        "78": "078Surah_an_naba.mp3",
        "79": "079Surah_an_naziat.mp3",
        "80": "080Surah_abasa.mp3",
        "81": "081Surah_at_takwir.mp3",
        "82": "082Surah_al_infitar.mp3",
        "83": "083Surah_al_mutaffifin.mp3",
        "84": "084Surah_al_inshiqaq.mp3",
        "85": "085Surah_al_buruj.mp3",
        "86": "086Surah_at_tariq.mp3",
        "87": "087Surah_al_ala.mp3",
        "88": "088Surah_al_ghashiyah.mp3",
        "89": "089Surah_al_fajr.mp3",
        "90": "090Surah_al_balad.mp3",
        "91": "091Surah_ash_shams.mp3",
        "92": "092Surah_al_layl.mp3",
        "93": "093Surah_ad_duha.mp3",
        "94": "094Surah_ash_sharh.mp3",
        "95": "095Surah_at_tin.mp3",
        "96": "096Surah_al_alaq.mp3",
        "97": "097Surah_al_qadr.mp3",
        "98": "098Surah_al_bayyinah.mp3",
        "99": "099Surah_az_zalzalah.mp3",
        "100": "100Surah_al_adiyat.mp3",
        "101": "101Surah_al_qariah.mp3",
        "102": "102Surah_at_takathur.mp3",
        "103": "103Surah_al_asr.mp3",
        "104": "104Surah_al_humazah.mp3",
        "105": "105Surah_al_fil.mp3",
        "106": "106Surah_quraysh.mp3",
        "107": "107Surah_al_maun.mp3",
        "108": "108Surah_al_kawthar.mp3",
        "109": "109Surah_al_kafirun.mp3",
        "110": "110Surah_an_nasr.mp3",
        "111": "111Surah_al_masad.mp3",
        "112": "112Surah_al_ikhlas.mp3",
        "113": "113Surah_al_falaq.mp3",
        "114": "114Surah_an_nas.mp3"
  }
  },
  {
    "name": "Saad El-Ghamidi",
    "baseUrl": "https://podcasts.qurancentral.com/saad-al-ghamdi/saad-al-ghamdi-surah-",
    "audioFormat": "%id%.mp3",
    "type": "surah"
  },
  {
    "name": "Saud Al-Shuraim",
    "baseUrl": "https://podcasts.qurancentral.com/saud-al-shuraim/saud-al-shuraim-",
    "audioFormat": "%id%.mp3",
    "type": "surah"
  },
  {
    "name": "Wadee Hammadi Al Yamani",
    "baseUrl": "https://download.quranicaudio.com/quran/wadee_hammadi_al-yamani/",
    "audioFormat": "%id%.mp3",
    "type": "surah"
  },
  {
    "name": "Yasser Al-Dosari",
    "baseUrl": "https://podcasts.qurancentral.com/yasser-al-dossari/yasser-al-dossari-",
    "audioFormat": "%id%.mp3",
    "type": "surah"
  },
  {
    "name": "Yusuf Ziya Özkan-Elmalı Türkçe Meali",
    "baseUrl": "https://archive.org/download/dinimizislam_003/",
    "audioFormat": "%specialFormat%",
    "type": "juz",
    "hasSpecialFormat": true,
    "formatMap": {
      "01": "01Cuz-Fatiha1-Bakara141.mp3",
      "02": "02Cuz-Bakara142-Bakara252.mp3",
      "03": "03Cuz-Bakara253-AliImran91.mp3",
      "04": "04Cuz-AliImran92-Nisa23.mp3",
      "05": "05Cuz-Nisa24-Nisa147.mp3",
      "06": "06Cuz-Nisa148-Maide82.mp3",
      "07": "07Cuz-Maide83-Enam110.mp3",
      "08": "08Cuz-Enam111-Araf87.mp3",
      "09": "09Cuz-Araf88-Enfal40.mp3",
      "10": "10Cuz-Enfal41-Tevbe93.mp3",
      "11": "11Cuz-Tevbe94-Hud5.mp3",
      "12": "12Cuz-Hud6-Yusuf52.mp3",
      "13": "13Cuz-Yusuf53-Ibrahim52.mp3",
      "14": "14Cuz-Hicr1-Nahl128.mp3",
      "15": "15Cuz-Isra1-Kehf74.mp3",
      "16": "16Cuz-Kehf75-TaHa135.mp3",
      "17": "17Cuz-Enbiya1-Hac78.mp3",
      "18": "18Cuz-Muminun1-Furkan20.mp3",
      "19": "19Cuz-Furkan21-Nelm55.mp3",
      "20": "20Cuz-Nelm56-Ankebut45.mp3",
      "21": "21Cuz-Ankebut46-Ahzab30.mp3",
      "22": "22Cuz-Ahzab31-YaSin27.mp3",
      "23": "23Cuz-YaSin28-Zumer31.mp3",
      "24": "24Cuz-Zumer32-Fussilet46.mp3",
      "25": "25Cuz-Fussilet47-Casiye32.mp3",
      "26": "26Cuz-Casiye33-Zariyat30.mp3",
      "27": "27Cuz-Zariyat31-Hadid29.mp3",
      "28": "28Cuz-Mucadele1-Tahrim12.mp3",
      "29": "29Cuz-Mulk1-Murselat50.mp3",
      "30": "30Cuz-Nebe1-Nas6.mp3"
    }
  }
  ];


export function loadReciters(extension) {
  try {
      const extensionPath = extension.path;
      const recitersFile = Gio.File.new_for_path(GLib.build_filenamev([extensionPath, 'custom-reciters.json']));
      const [success, contents] = recitersFile.load_contents(null);
      
      if (success) {
          let reciters = JSON.parse(new TextDecoder().decode(contents));
          
         
          reciters = reciters.map(reciter => {
              if (!reciter.type) {
                 
                  if (reciter.name.toLowerCase().includes('cüz') || 
                      reciter.name.toLowerCase().includes('juz') ||
                      reciter.audioFormat.includes('cuz') ||
                      reciter.audioFormat.includes('juz')) {
                      reciter.type = 'juz';
                  } else {
                      reciter.type = 'surah';
                  }
              }
              return reciter;
          });
          
          return reciters;
      } else {
         log("Quran Player: Failed to load reciters file, using defaults");
          return DEFAULT_RECITERS;
      }
  } catch (e) {
      logError(e4, "Quran Player: Error loading reciters", e);
      return DEFAULT_RECITERS;
  }
}



export function loadSurahs(extension) {
  try {
      const settings = extension.getSettings();
      
     
      const customPath = settings.get_string('custom-surahs-list-path');
      if (customPath && customPath.trim() !== '') {
          try {
              const customFile = Gio.File.new_for_path(customPath);
              const [success, contents] = customFile.load_contents(null);
              if (success) {
                  return JSON.parse(new TextDecoder().decode(contents));
              }
          } catch (customErr) {
              logError(e4, "Quran Player: Error loading custom surahs file, falling back to default", customErr);
          }
      }
      
     
      const surahsFile = Gio.File.new_for_path(GLib.build_filenamev([extension.path, 'surahs.json']));
      const [success, contents] = surahsFile.load_contents(null);
      
      if (success) {
          return JSON.parse(new TextDecoder().decode(contents));
      } else {
         log("Quran Player: Failed to load surahs file, using defaults");
         
          return [
                {"name": "Al-Fatihah", "id": 1, "audioId": "001"},
                {"name": "Al-Baqarah", "id": 2, "audioId": "002"},
                {"name": "Ali 'Imran", "id": 3, "audioId": "003"},
                {"name": "An-Nisa", "id": 4, "audioId": "004"},
                {"name": "Al-Ma'idah", "id": 5, "audioId": "005"},
                {"name": "Al-An'am", "id": 6, "audioId": "006"},
                {"name": "Al-A'raf", "id": 7, "audioId": "007"},
                {"name": "Al-Anfal", "id": 8, "audioId": "008"},
                {"name": "At-Tawbah", "id": 9, "audioId": "009"},
                {"name": "Yunus", "id": 10, "audioId": "010"},
                {"name": "Hud", "id": 11, "audioId": "011"},
                {"name": "Yusuf", "id": 12, "audioId": "012"},
                {"name": "Ar-Ra'd", "id": 13, "audioId": "013"},
                {"name": "Ibrahim", "id": 14, "audioId": "014"},
                {"name": "Al-Hijr", "id": 15, "audioId": "015"},
                {"name": "An-Nahl", "id": 16, "audioId": "016"},
                {"name": "Al-Isra", "id": 17, "audioId": "017"},
                {"name": "Al-Kahf", "id": 18, "audioId": "018"},
                {"name": "Maryam", "id": 19, "audioId": "019"},
                {"name": "Ta-Ha", "id": 20, "audioId": "020"},
                {"name": "Al-Anbiya", "id": 21, "audioId": "021"},
                {"name": "Al-Hajj", "id": 22, "audioId": "022"},
                {"name": "Al-Mu'minun", "id": 23, "audioId": "023"},
                {"name": "An-Nur", "id": 24, "audioId": "024"},
                {"name": "Al-Furqan", "id": 25, "audioId": "025"},
                {"name": "Ash-Shu'ara", "id": 26, "audioId": "026"},
                {"name": "An-Naml", "id": 27, "audioId": "027"},
                {"name": "Al-Qasas", "id": 28, "audioId": "028"},
                {"name": "Al-'Ankabut", "id": 29, "audioId": "029"},
                {"name": "Ar-Rum", "id": 30, "audioId": "030"},
                {"name": "Luqman", "id": 31, "audioId": "031"},
                {"name": "As-Sajdah", "id": 32, "audioId": "032"},
                {"name": "Al-Ahzab", "id": 33, "audioId": "033"},
                {"name": "Saba", "id": 34, "audioId": "034"},
                {"name": "Fatir", "id": 35, "audioId": "035"},
                {"name": "Ya-Sin", "id": 36, "audioId": "036"},
                {"name": "As-Saffat", "id": 37, "audioId": "037"},
                {"name": "Sad", "id": 38, "audioId": "038"},
                {"name": "Az-Zumar", "id": 39, "audioId": "039"},
                {"name": "Ghafir", "id": 40, "audioId": "040"},
                {"name": "Fussilat", "id": 41, "audioId": "041"},
                {"name": "Ash-Shura", "id": 42, "audioId": "042"},
                {"name": "Az-Zukhruf", "id": 43, "audioId": "043"},
                {"name": "Ad-Dukhan", "id": 44, "audioId": "044"},
                {"name": "Al-Jathiyah", "id": 45, "audioId": "045"},
                {"name": "Al-Ahqaf", "id": 46, "audioId": "046"},
                {"name": "Muhammad", "id": 47, "audioId": "047"},
                {"name": "Al-Fath", "id": 48, "audioId": "048"},
                {"name": "Al-Hujurat", "id": 49, "audioId": "049"},
                {"name": "Qaf", "id": 50, "audioId": "050"},
                {"name": "Adh-Dhariyat", "id": 51, "audioId": "051"},
                {"name": "At-Tur", "id": 52, "audioId": "052"},
                {"name": "An-Najm", "id": 53, "audioId": "053"},
                {"name": "Al-Qamar", "id": 54, "audioId": "054"},
                {"name": "Ar-Rahman", "id": 55, "audioId": "055"},
                {"name": "Al-Waqi'ah", "id": 56, "audioId": "056"},
                {"name": "Al-Hadid", "id": 57, "audioId": "057"},
                {"name": "Al-Mujadilah", "id": 58, "audioId": "058"},
                {"name": "Al-Hashr", "id": 59, "audioId": "059"},
                {"name": "Al-Mumtahanah", "id": 60, "audioId": "060"},
                {"name": "As-Saff", "id": 61, "audioId": "061"},
                {"name": "Al-Jumu'ah", "id": 62, "audioId": "062"},
                {"name": "Al-Munafiqun", "id": 63, "audioId": "063"},
                {"name": "At-Taghabun", "id": 64, "audioId": "064"},
                {"name": "At-Talaq", "id": 65, "audioId": "065"},
                {"name": "At-Tahrim", "id": 66, "audioId": "066"},
                {"name": "Al-Mulk", "id": 67, "audioId": "067"},
                {"name": "Al-Qalam", "id": 68, "audioId": "068"},
                {"name": "Al-Haqqah", "id": 69, "audioId": "069"},
                {"name": "Al-Ma'arij", "id": 70, "audioId": "070"},
                {"name": "Nuh", "id": 71, "audioId": "071"},
                {"name": "Al-Jinn", "id": 72, "audioId": "072"},
                {"name": "Al-Muzzammil", "id": 73, "audioId": "073"},
                {"name": "Al-Muddathir", "id": 74, "audioId": "074"},
                {"name": "Al-Qiyamah", "id": 75, "audioId": "075"},
                {"name": "Al-Insan", "id": 76, "audioId": "076"},
                {"name": "Al-Mursalat", "id": 77, "audioId": "077"},
                {"name": "An-Naba", "id": 78, "audioId": "078"},
                {"name": "An-Nazi'at", "id": 79, "audioId": "079"},
                {"name": "Abasa", "id": 80, "audioId": "080"},
                {"name": "At-Takwir", "id": 81, "audioId": "081"},
                {"name": "Al-Infitar", "id": 82, "audioId": "082"},
                {"name": "Al-Mutaffifin", "id": 83, "audioId": "083"},
                {"name": "Al-Inshiqaq", "id": 84, "audioId": "084"},
                {"name": "Al-Buruj", "id": 85, "audioId": "085"},
                {"name": "At-Tariq", "id": 86, "audioId": "086"},
                {"name": "Al-A'la", "id": 87, "audioId": "087"},
                {"name": "Al-Ghashiyah", "id": 88, "audioId": "088"},
                {"name": "Al-Fajr", "id": 89, "audioId": "089"},
                {"name": "Al-Balad", "id": 90, "audioId": "090"},
                {"name": "Ash-Shams", "id": 91, "audioId": "091"},
                {"name": "Al-Layl", "id": 92, "audioId": "092"},
                {"name": "Ad-Duha", "id": 93, "audioId": "093"},
                {"name": "Ash-Sharh", "id": 94, "audioId": "094"},
                {"name": "At-Tin", "id": 95, "audioId": "095"},
                {"name": "Al-Alaq", "id": 96, "audioId": "096"},
                {"name": "Al-Qadr", "id": 97, "audioId": "097"},
                {"name": "Al-Bayyinah", "id": 98, "audioId": "098"},
                {"name": "Az-Zalzalah", "id": 99, "audioId": "099"},
                {"name": "Al-Adiyat", "id": 100, "audioId": "100"},
                {"name": "Al-Qari'ah", "id": 101, "audioId": "101"},
                {"name": "At-Takathur", "id": 102, "audioId": "102"},
                {"name": "Al-Asr", "id": 103, "audioId": "103"},
                {"name": "Al-Humazah", "id": 104, "audioId": "104"},
                {"name": "Al-Fil", "id": 105, "audioId": "105"},
                {"name": "Quraysh", "id": 106, "audioId": "106"},
                {"name": "Al-Ma'un", "id": 107, "audioId": "107"},
                {"name": "Al-Kawthar", "id": 108, "audioId": "108"},
                {"name": "Al-Kafirun", "id": 109, "audioId": "109"},
                {"name": "An-Nasr", "id": 110, "audioId": "110"},
                {"name": "Al-Masad", "id": 111, "audioId": "111"},
                {"name": "Al-Ikhlas", "id": 112, "audioId": "112"},
                {"name": "Al-Falaq", "id": 113, "audioId": "113"},
                {"name": "An-Nas", "id": 114, "audioId": "114"}
              ];
            }
        } catch (e) {
          console.error(e,"Quran Player: Error loading surahs");
            return [
              [
                {"name": "Al-Fatihah", "id": 1, "audioId": "001"},
                {"name": "Al-Baqarah", "id": 2, "audioId": "002"},
                {"name": "Ali 'Imran", "id": 3, "audioId": "003"},
                {"name": "An-Nisa", "id": 4, "audioId": "004"},
                {"name": "Al-Ma'idah", "id": 5, "audioId": "005"},
                {"name": "Al-An'am", "id": 6, "audioId": "006"},
                {"name": "Al-A'raf", "id": 7, "audioId": "007"},
                {"name": "Al-Anfal", "id": 8, "audioId": "008"},
                {"name": "At-Tawbah", "id": 9, "audioId": "009"},
                {"name": "Yunus", "id": 10, "audioId": "010"},
                {"name": "Hud", "id": 11, "audioId": "011"},
                {"name": "Yusuf", "id": 12, "audioId": "012"},
                {"name": "Ar-Ra'd", "id": 13, "audioId": "013"},
                {"name": "Ibrahim", "id": 14, "audioId": "014"},
                {"name": "Al-Hijr", "id": 15, "audioId": "015"},
                {"name": "An-Nahl", "id": 16, "audioId": "016"},
                {"name": "Al-Isra", "id": 17, "audioId": "017"},
                {"name": "Al-Kahf", "id": 18, "audioId": "018"},
                {"name": "Maryam", "id": 19, "audioId": "019"},
                {"name": "Ta-Ha", "id": 20, "audioId": "020"},
                {"name": "Al-Anbiya", "id": 21, "audioId": "021"},
                {"name": "Al-Hajj", "id": 22, "audioId": "022"},
                {"name": "Al-Mu'minun", "id": 23, "audioId": "023"},
                {"name": "An-Nur", "id": 24, "audioId": "024"},
                {"name": "Al-Furqan", "id": 25, "audioId": "025"},
                {"name": "Ash-Shu'ara", "id": 26, "audioId": "026"},
                {"name": "An-Naml", "id": 27, "audioId": "027"},
                {"name": "Al-Qasas", "id": 28, "audioId": "028"},
                {"name": "Al-'Ankabut", "id": 29, "audioId": "029"},
                {"name": "Ar-Rum", "id": 30, "audioId": "030"},
                {"name": "Luqman", "id": 31, "audioId": "031"},
                {"name": "As-Sajdah", "id": 32, "audioId": "032"},
                {"name": "Al-Ahzab", "id": 33, "audioId": "033"},
                {"name": "Saba", "id": 34, "audioId": "034"},
                {"name": "Fatir", "id": 35, "audioId": "035"},
                {"name": "Ya-Sin", "id": 36, "audioId": "036"},
                {"name": "As-Saffat", "id": 37, "audioId": "037"},
                {"name": "Sad", "id": 38, "audioId": "038"},
                {"name": "Az-Zumar", "id": 39, "audioId": "039"},
                {"name": "Ghafir", "id": 40, "audioId": "040"},
                {"name": "Fussilat", "id": 41, "audioId": "041"},
                {"name": "Ash-Shura", "id": 42, "audioId": "042"},
                {"name": "Az-Zukhruf", "id": 43, "audioId": "043"},
                {"name": "Ad-Dukhan", "id": 44, "audioId": "044"},
                {"name": "Al-Jathiyah", "id": 45, "audioId": "045"},
                {"name": "Al-Ahqaf", "id": 46, "audioId": "046"},
                {"name": "Muhammad", "id": 47, "audioId": "047"},
                {"name": "Al-Fath", "id": 48, "audioId": "048"},
                {"name": "Al-Hujurat", "id": 49, "audioId": "049"},
                {"name": "Qaf", "id": 50, "audioId": "050"},
                {"name": "Adh-Dhariyat", "id": 51, "audioId": "051"},
                {"name": "At-Tur", "id": 52, "audioId": "052"},
                {"name": "An-Najm", "id": 53, "audioId": "053"},
                {"name": "Al-Qamar", "id": 54, "audioId": "054"},
                {"name": "Ar-Rahman", "id": 55, "audioId": "055"},
                {"name": "Al-Waqi'ah", "id": 56, "audioId": "056"},
                {"name": "Al-Hadid", "id": 57, "audioId": "057"},
                {"name": "Al-Mujadilah", "id": 58, "audioId": "058"},
                {"name": "Al-Hashr", "id": 59, "audioId": "059"},
                {"name": "Al-Mumtahanah", "id": 60, "audioId": "060"},
                {"name": "As-Saff", "id": 61, "audioId": "061"},
                {"name": "Al-Jumu'ah", "id": 62, "audioId": "062"},
                {"name": "Al-Munafiqun", "id": 63, "audioId": "063"},
                {"name": "At-Taghabun", "id": 64, "audioId": "064"},
                {"name": "At-Talaq", "id": 65, "audioId": "065"},
                {"name": "At-Tahrim", "id": 66, "audioId": "066"},
                {"name": "Al-Mulk", "id": 67, "audioId": "067"},
                {"name": "Al-Qalam", "id": 68, "audioId": "068"},
                {"name": "Al-Haqqah", "id": 69, "audioId": "069"},
                {"name": "Al-Ma'arij", "id": 70, "audioId": "070"},
                {"name": "Nuh", "id": 71, "audioId": "071"},
                {"name": "Al-Jinn", "id": 72, "audioId": "072"},
                {"name": "Al-Muzzammil", "id": 73, "audioId": "073"},
                {"name": "Al-Muddathir", "id": 74, "audioId": "074"},
                {"name": "Al-Qiyamah", "id": 75, "audioId": "075"},
                {"name": "Al-Insan", "id": 76, "audioId": "076"},
                {"name": "Al-Mursalat", "id": 77, "audioId": "077"},
                {"name": "An-Naba", "id": 78, "audioId": "078"},
                {"name": "An-Nazi'at", "id": 79, "audioId": "079"},
                {"name": "Abasa", "id": 80, "audioId": "080"},
                {"name": "At-Takwir", "id": 81, "audioId": "081"},
                {"name": "Al-Infitar", "id": 82, "audioId": "082"},
                {"name": "Al-Mutaffifin", "id": 83, "audioId": "083"},
                {"name": "Al-Inshiqaq", "id": 84, "audioId": "084"},
                {"name": "Al-Buruj", "id": 85, "audioId": "085"},
                {"name": "At-Tariq", "id": 86, "audioId": "086"},
                {"name": "Al-A'la", "id": 87, "audioId": "087"},
                {"name": "Al-Ghashiyah", "id": 88, "audioId": "088"},
                {"name": "Al-Fajr", "id": 89, "audioId": "089"},
                {"name": "Al-Balad", "id": 90, "audioId": "090"},
                {"name": "Ash-Shams", "id": 91, "audioId": "091"},
                {"name": "Al-Layl", "id": 92, "audioId": "092"},
                {"name": "Ad-Duha", "id": 93, "audioId": "093"},
                {"name": "Ash-Sharh", "id": 94, "audioId": "094"},
                {"name": "At-Tin", "id": 95, "audioId": "095"},
                {"name": "Al-Alaq", "id": 96, "audioId": "096"},
                {"name": "Al-Qadr", "id": 97, "audioId": "097"},
                {"name": "Al-Bayyinah", "id": 98, "audioId": "098"},
                {"name": "Az-Zalzalah", "id": 99, "audioId": "099"},
                {"name": "Al-Adiyat", "id": 100, "audioId": "100"},
                {"name": "Al-Qari'ah", "id": 101, "audioId": "101"},
                {"name": "At-Takathur", "id": 102, "audioId": "102"},
                {"name": "Al-Asr", "id": 103, "audioId": "103"},
                {"name": "Al-Humazah", "id": 104, "audioId": "104"},
                {"name": "Al-Fil", "id": 105, "audioId": "105"},
                {"name": "Quraysh", "id": 106, "audioId": "106"},
                {"name": "Al-Ma'un", "id": 107, "audioId": "107"},
                {"name": "Al-Kawthar", "id": 108, "audioId": "108"},
                {"name": "Al-Kafirun", "id": 109, "audioId": "109"},
                {"name": "An-Nasr", "id": 110, "audioId": "110"},
                {"name": "Al-Masad", "id": 111, "audioId": "111"},
                {"name": "Al-Ikhlas", "id": 112, "audioId": "112"},
                {"name": "Al-Falaq", "id": 113, "audioId": "113"},
                {"name": "An-Nas", "id": 114, "audioId": "114"}
              ]
          ];
        }
    }


  export function loadJuz(extension) {
    try {
        const settings = extension.getSettings();
        
       
        const customPath = settings.get_string('custom-juz-list-path');
        if (customPath && customPath.trim() !== '') {
            try {
                const customFile = Gio.File.new_for_path(customPath);
                const [success, contents] = customFile.load_contents(null);
                if (success) {
                    return JSON.parse(new TextDecoder().decode(contents));
                }
            } catch (customErr) {
                logError(e4, "Quran Player: Error loading custom juz file, falling back to default", customErr);
            }
        }
        
       
        const juzFile = Gio.File.new_for_path(GLib.build_filenamev([extension.path, 'juz.json']));
        const [success, contents] = juzFile.load_contents(null);
        
        if (success) {
            return JSON.parse(new TextDecoder().decode(contents));
        } else {
           log("Quran Player: Failed to load juz file");
            return [];
        }
    } catch (e) {
        logError(e4, "Quran Player: Error loading juz data", e);
        return [];
    }
  }
    


  export function isJuzBasedReciter(reciter) {
    if (!reciter) return false;
    
   
    if (reciter.type === 'juz') return true;
    
   
    const nameIndicatesJuz = reciter.name.toLowerCase().includes('cüz') || 
                            reciter.name.toLowerCase().includes('juz');
                            
    const formatIndicatesJuz = reciter.audioFormat.includes('cuz') || 
                             reciter.audioFormat.includes('juz');
                             
    return nameIndicatesJuz || formatIndicatesJuz;
  }