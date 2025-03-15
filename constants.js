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
import * as ExtensionUtils from 'resource:///org/gnome/shell/misc/extensionUtils.js';

// Default reciters if custom JSON fails to load
export const DEFAULT_RECITERS = [
  {
    "name": "Abdullah Basfar",
    "baseUrl": "https://podcasts.qurancentral.com/abdullah-basfar/abdullah-basfar-",
    "audioFormat": "%id%.mp3",
    "type": "surah"
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
    "name": "Hayri Küçükdeniz-Suat Yıldırım Meali",
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
    "name": "Yusuf Ziya Özkan-Elmalı Meali",
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
  },
  {
    "name": "Yasser Al-Dosari",
    "baseUrl": "https://podcasts.qurancentral.com/yasser-al-dossari/yasser-al-dossari-",
    "audioFormat": "%id%.mp3",
    "type": "surah"
  }
];

// Load reciters from file
export function loadReciters(extension) {
  try {
      const extensionPath = extension.path;
      const recitersFile = Gio.File.new_for_path(GLib.build_filenamev([extensionPath, 'custom-reciters.json']));
      const [success, contents] = recitersFile.load_contents(null);
      
      if (success) {
          let reciters = JSON.parse(new TextDecoder().decode(contents));
          
          // Make sure each reciter has a type field (default to 'surah')
          reciters = reciters.map(reciter => {
              if (!reciter.type) {
                  // Try to auto-detect by checking the reciter name and audioFormat
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
      logError(e, "Quran Player: Error loading reciters");
      return DEFAULT_RECITERS;
  }
}

// Load surahs from file
export function loadSurahs(extension) {
    try {
        const settings = extension.getSettings();
        
        // Check if custom path is set and try to load from there first
        const customPath = settings.get_string('custom-surahs-list-path');
        if (customPath && customPath.trim() !== '') {
            try {
                const customFile = Gio.File.new_for_path(customPath);
                const [success, contents] = customFile.load_contents(null);
                if (success) {
                    return JSON.parse(new TextDecoder().decode(contents));
                }
            } catch (customErr) {
                logError(customErr,"Quran Player: Error loading custom surahs file, falling back to default");
            }
        }
        
        // Fall back to default file if custom path fails or isn't set
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
            logError(e,"Quran Player: Error loading surahs");
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

// Load juz data from file
export function loadJuz(extension) {
  try {
      const settings = extension.getSettings();
      
      // Check if custom path is set and try to load from there first
      const customPath = settings.get_string('custom-juz-list-path');
      if (customPath && customPath.trim() !== '') {
          try {
              const customFile = Gio.File.new_for_path(customPath);
              const [success, contents] = customFile.load_contents(null);
              if (success) {
                  return JSON.parse(new TextDecoder().decode(contents));
              }
          } catch (customErr) {
              logError(customErr,"Quran Player: Error loading custom juz file, falling back to default");
          }
      }
      
      // Fall back to default file if custom path fails or isn't set
      const juzFile = Gio.File.new_for_path(GLib.build_filenamev([extension.path, 'juz.json']));
      const [success, contents] = juzFile.load_contents(null);
      
      if (success) {
          return JSON.parse(new TextDecoder().decode(contents));
      } else {
          log("Quran Player: Failed to load juz file");
          return [];
      }
  } catch (e) {
      logError(e,"Quran Player: Error loading juz data");
      return [];
  }
}

// Helper function to check if reciter is juz-based
export function isJuzBasedReciter(reciter) {
  if (!reciter) return false;
  
  // Check explicit type first
  if (reciter.type === 'juz') return true;
  
  // Check name and format as fallback
  const nameIndicatesJuz = reciter.name.toLowerCase().includes('cüz') || 
                            reciter.name.toLowerCase().includes('juz');
                            
  const formatIndicatesJuz = reciter.audioFormat.includes('cuz') || 
                             reciter.audioFormat.includes('juz');
                             
  return nameIndicatesJuz || formatIndicatesJuz;
}