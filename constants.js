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
    "audioFormat": "%id%cuz.mp3",
    "type": "juz"
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
    "baseUrl": "https://ia800307.us.archive.org/1/items/MehmetEminAYmp3/Mehmet%20Emin%20AY%20_%20Hatm-i%20%C5%9Eerif%2",
    "audioFormat": "%id%.C%C3%BCz.mp3",
    "type": "juz"
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
    "baseUrl": "https://archive.org/download/Yusuf-Ziya-Ozkan-Meal/",
    "audioFormat": "%id%_cuz.mp3",
    "type": "juz"
  },
  {
    "name": "Yasser Al-Dosari",
    "baseUrl": "https://podcasts.qurancentral.com/yasser-al-dossari/yasser-al-dossari-",
    "audioFormat": "%id%.mp3",
    "type": "surah"
  }
];

// Load reciters from file
export function loadReciters() {
    try {
        const extensionPath = ExtensionUtils.getCurrentExtension().path;
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
            console.log("Quran Player: Failed to load reciters file, using defaults");
            return DEFAULT_RECITERS;
        }
    } catch (e) {
        console.error("Quran Player: Error loading reciters", e);
        return DEFAULT_RECITERS;
    }
}

// Load surahs from file
export function loadSurahs() {
    try {
        const extension = ExtensionUtils.getCurrentExtension();
        const settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.quran-player');
        
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
                console.error("Quran Player: Error loading custom surahs file, falling back to default", customErr);
            }
        }
        
        // Fall back to default file if custom path fails or isn't set
        const surahsFile = Gio.File.new_for_path(GLib.build_filenamev([extension.path, 'surahs.json']));
        const [success, contents] = surahsFile.load_contents(null);
        
        if (success) {
            return JSON.parse(new TextDecoder().decode(contents));
        } else {
            console.log("Quran Player: Failed to load surahs file, using defaults");
            return [
                {"name": "Fatiha", "id": 1, "audioId": "001"},
                {"name": "Bakara", "id": 2, "audioId": "002"},
                {"name": "Al-i İmran", "id": 3, "audioId": "003"},
                {"name": "Nisa", "id": 4, "audioId": "004"},
                {"name": "Maide", "id": 5, "audioId": "005"},
                {"name": "En'am", "id": 6, "audioId": "006"},
                {"name": "A'raf", "id": 7, "audioId": "007"},
                {"name": "Enfal", "id": 8, "audioId": "008"},
                {"name": "Tevbe", "id": 9, "audioId": "009"},
                {"name": "Yunus", "id": 10, "audioId": "010"},
                {"name": "Hud", "id": 11, "audioId": "011"},
                {"name": "Yusuf", "id": 12, "audioId": "012"},
                {"name": "Ra'd", "id": 13, "audioId": "013"},
                {"name": "İbrahim", "id": 14, "audioId": "014"},
                {"name": "Hicr", "id": 15, "audioId": "015"},
                {"name": "Nahl", "id": 16, "audioId": "016"},
                {"name": "İsra", "id": 17, "audioId": "017"},
                {"name": "Kehf", "id": 18, "audioId": "018"},
                {"name": "Meryem", "id": 19, "audioId": "019"},
                {"name": "Taha", "id": 20, "audioId": "020"},
                {"name": "Enbiya", "id": 21, "audioId": "021"},
                {"name": "Hac", "id": 22, "audioId": "022"},
                {"name": "Mü'minun", "id": 23, "audioId": "023"},
                {"name": "Nur", "id": 24, "audioId": "024"},
                {"name": "Furkan", "id": 25, "audioId": "025"},
                {"name": "Şuara", "id": 26, "audioId": "026"},
                {"name": "Neml", "id": 27, "audioId": "027"},
                {"name": "Kasas", "id": 28, "audioId": "028"},
                {"name": "Ankebut", "id": 29, "audioId": "029"},
                {"name": "Rum", "id": 30, "audioId": "030"},
                {"name": "Lokman", "id": 31, "audioId": "031"},
                {"name": "Secde", "id": 32, "audioId": "032"},
                {"name": "Ahzab", "id": 33, "audioId": "033"},
                {"name": "Sebe", "id": 34, "audioId": "034"},
                {"name": "Fatır", "id": 35, "audioId": "035"},
                {"name": "Yasin", "id": 36, "audioId": "036"},
                {"name": "Saffat", "id": 37, "audioId": "037"},
                {"name": "Sad", "id": 38, "audioId": "038"},
                {"name": "Zümer", "id": 39, "audioId": "039"},
                {"name": "Mü'min", "id": 40, "audioId": "040"},
                {"name": "Fussilet", "id": 41, "audioId": "041"},
                {"name": "Şura", "id": 42, "audioId": "042"},
                {"name": "Zuhruf", "id": 43, "audioId": "043"},
                {"name": "Duhan", "id": 44, "audioId": "044"},
                {"name": "Casiye", "id": 45, "audioId": "045"},
                {"name": "Ahkaf", "id": 46, "audioId": "046"},
                {"name": "Muhammed", "id": 47, "audioId": "047"},
                {"name": "Fetih", "id": 48, "audioId": "048"},
                {"name": "Hucurat", "id": 49, "audioId": "049"},
                {"name": "Kaf", "id": 50, "audioId": "050"},
                {"name": "Zariyat", "id": 51, "audioId": "051"},
                {"name": "Tur", "id": 52, "audioId": "052"},
                {"name": "Necm", "id": 53, "audioId": "053"},
                {"name": "Kamer", "id": 54, "audioId": "054"},
                {"name": "Rahman", "id": 55, "audioId": "055"},
                {"name": "Vakıa", "id": 56, "audioId": "056"},
                {"name": "Hadid", "id": 57, "audioId": "057"},
                {"name": "Mücadele", "id": 58, "audioId": "058"},
                {"name": "Haşr", "id": 59, "audioId": "059"},
                {"name": "Mümtehine", "id": 60, "audioId": "060"},
                {"name": "Saff", "id": 61, "audioId": "061"},
                {"name": "Cuma", "id": 62, "audioId": "062"},
                {"name": "Münafikun", "id": 63, "audioId": "063"},
                {"name": "Teğabün", "id": 64, "audioId": "064"},
                {"name": "Talak", "id": 65, "audioId": "065"},
                {"name": "Tahrim", "id": 66, "audioId": "066"},
                {"name": "Mülk", "id": 67, "audioId": "067"},
                {"name": "Kalem", "id": 68, "audioId": "068"},
                {"name": "Hakka", "id": 69, "audioId": "069"},
                {"name": "Mearic", "id": 70, "audioId": "070"},
                {"name": "Nuh", "id": 71, "audioId": "071"},
                {"name": "Cin", "id": 72, "audioId": "072"},
                {"name": "Müzzemmil", "id": 73, "audioId": "073"},
                {"name": "Müddessir", "id": 74, "audioId": "074"},
                {"name": "Kıyame", "id": 75, "audioId": "075"},
                {"name": "İnsan", "id": 76, "audioId": "076"},
                {"name": "Mürselat", "id": 77, "audioId": "077"},
                {"name": "Nebe", "id": 78, "audioId": "078"},
                {"name": "Naziat", "id": 79, "audioId": "079"},
                {"name": "Abese", "id": 80, "audioId": "080"},
                {"name": "Tekvir", "id": 81, "audioId": "081"},
                {"name": "İnfitar", "id": 82, "audioId": "082"},
                {"name": "Mutaffifin", "id": 83, "audioId": "083"},
                {"name": "İnşikak", "id": 84, "audioId": "084"},
                {"name": "Büruc", "id": 85, "audioId": "085"},
                {"name": "Tarık", "id": 86, "audioId": "086"},
                {"name": "A'la", "id": 87, "audioId": "087"},
                {"name": "Gaşiye", "id": 88, "audioId": "088"},
                {"name": "Fecr", "id": 89, "audioId": "089"},
                {"name": "Beled", "id": 90, "audioId": "090"},
                {"name": "Şems", "id": 91, "audioId": "091"},
                {"name": "Leyl", "id": 92, "audioId": "092"},
                {"name": "Duha", "id": 93, "audioId": "093"},
                {"name": "İnşirah", "id": 94, "audioId": "094"},
                {"name": "Tin", "id": 95, "audioId": "095"},
                {"name": "Alak", "id": 96, "audioId": "096"},
                {"name": "Kadir", "id": 97, "audioId": "097"},
                {"name": "Beyyine", "id": 98, "audioId": "098"},
                {"name": "Zilzal", "id": 99, "audioId": "099"},
                {"name": "Adiyat", "id": 100, "audioId": "100"},
                {"name": "Karia", "id": 101, "audioId": "101"},
                {"name": "Tekasür", "id": 102, "audioId": "102"},
                {"name": "Asr", "id": 103, "audioId": "103"},
                {"name": "Hümeze", "id": 104, "audioId": "104"},
                {"name": "Fil", "id": 105, "audioId": "105"},
                {"name": "Kureyş", "id": 106, "audioId": "106"},
                {"name": "Maun", "id": 107, "audioId": "107"},
                {"name": "Kevser", "id": 108, "audioId": "108"},
                {"name": "Kafirun", "id": 109, "audioId": "109"},
                {"name": "Nasr", "id": 110, "audioId": "110"},
                {"name": "Tebbet", "id": 111, "audioId": "111"},
                {"name": "İhlas", "id": 112, "audioId": "112"},
                {"name": "Felak", "id": 113, "audioId": "113"},
                {"name": "Nas", "id": 114, "audioId": "114"}
              ];
            }
        } catch (e) {
            console.error("Quran Player: Error loading surahs", e);
            return [
            {"name": "Fatiha", "id": 1, "audioId": "001"},
            {"name": "Bakara", "id": 2, "audioId": "002"},
            {"name": "Al-i İmran", "id": 3, "audioId": "003"},
            {"name": "Nisa", "id": 4, "audioId": "004"},
            {"name": "Maide", "id": 5, "audioId": "005"},
            {"name": "En'am", "id": 6, "audioId": "006"},
            {"name": "A'raf", "id": 7, "audioId": "007"},
            {"name": "Enfal", "id": 8, "audioId": "008"},
            {"name": "Tevbe", "id": 9, "audioId": "009"},
            {"name": "Yunus", "id": 10, "audioId": "010"},
            {"name": "Hud", "id": 11, "audioId": "011"},
            {"name": "Yusuf", "id": 12, "audioId": "012"},
            {"name": "Ra'd", "id": 13, "audioId": "013"},
            {"name": "İbrahim", "id": 14, "audioId": "014"},
            {"name": "Hicr", "id": 15, "audioId": "015"},
            {"name": "Nahl", "id": 16, "audioId": "016"},
            {"name": "İsra", "id": 17, "audioId": "017"},
            {"name": "Kehf", "id": 18, "audioId": "018"},
            {"name": "Meryem", "id": 19, "audioId": "019"},
            {"name": "Taha", "id": 20, "audioId": "020"},
            {"name": "Enbiya", "id": 21, "audioId": "021"},
            {"name": "Hac", "id": 22, "audioId": "022"},
            {"name": "Mü'minun", "id": 23, "audioId": "023"},
            {"name": "Nur", "id": 24, "audioId": "024"},
            {"name": "Furkan", "id": 25, "audioId": "025"},
            {"name": "Şuara", "id": 26, "audioId": "026"},
            {"name": "Neml", "id": 27, "audioId": "027"},
            {"name": "Kasas", "id": 28, "audioId": "028"},
            {"name": "Ankebut", "id": 29, "audioId": "029"},
            {"name": "Rum", "id": 30, "audioId": "030"},
            {"name": "Lokman", "id": 31, "audioId": "031"},
            {"name": "Secde", "id": 32, "audioId": "032"},
            {"name": "Ahzab", "id": 33, "audioId": "033"},
            {"name": "Sebe", "id": 34, "audioId": "034"},
            {"name": "Fatır", "id": 35, "audioId": "035"},
            {"name": "Yasin", "id": 36, "audioId": "036"},
            {"name": "Saffat", "id": 37, "audioId": "037"},
            {"name": "Sad", "id": 38, "audioId": "038"},
            {"name": "Zümer", "id": 39, "audioId": "039"},
            {"name": "Mü'min", "id": 40, "audioId": "040"},
            {"name": "Fussilet", "id": 41, "audioId": "041"},
            {"name": "Şura", "id": 42, "audioId": "042"},
            {"name": "Zuhruf", "id": 43, "audioId": "043"},
            {"name": "Duhan", "id": 44, "audioId": "044"},
            {"name": "Casiye", "id": 45, "audioId": "045"},
            {"name": "Ahkaf", "id": 46, "audioId": "046"},
            {"name": "Muhammed", "id": 47, "audioId": "047"},
            {"name": "Fetih", "id": 48, "audioId": "048"},
            {"name": "Hucurat", "id": 49, "audioId": "049"},
            {"name": "Kaf", "id": 50, "audioId": "050"},
            {"name": "Zariyat", "id": 51, "audioId": "051"},
            {"name": "Tur", "id": 52, "audioId": "052"},
            {"name": "Necm", "id": 53, "audioId": "053"},
            {"name": "Kamer", "id": 54, "audioId": "054"},
            {"name": "Rahman", "id": 55, "audioId": "055"},
            {"name": "Vakıa", "id": 56, "audioId": "056"},
            {"name": "Hadid", "id": 57, "audioId": "057"},
            {"name": "Mücadele", "id": 58, "audioId": "058"},
            {"name": "Haşr", "id": 59, "audioId": "059"},
            {"name": "Mümtehine", "id": 60, "audioId": "060"},
            {"name": "Saff", "id": 61, "audioId": "061"},
            {"name": "Cuma", "id": 62, "audioId": "062"},
            {"name": "Münafikun", "id": 63, "audioId": "063"},
            {"name": "Teğabün", "id": 64, "audioId": "064"},
            {"name": "Talak", "id": 65, "audioId": "065"},
            {"name": "Tahrim", "id": 66, "audioId": "066"},
            {"name": "Mülk", "id": 67, "audioId": "067"},
            {"name": "Kalem", "id": 68, "audioId": "068"},
            {"name": "Hakka", "id": 69, "audioId": "069"},
            {"name": "Mearic", "id": 70, "audioId": "070"},
            {"name": "Nuh", "id": 71, "audioId": "071"},
            {"name": "Cin", "id": 72, "audioId": "072"},
            {"name": "Müzzemmil", "id": 73, "audioId": "073"},
            {"name": "Müddessir", "id": 74, "audioId": "074"},
            {"name": "Kıyame", "id": 75, "audioId": "075"},
            {"name": "İnsan", "id": 76, "audioId": "076"},
            {"name": "Mürselat", "id": 77, "audioId": "077"},
            {"name": "Nebe", "id": 78, "audioId": "078"},
            {"name": "Naziat", "id": 79, "audioId": "079"},
            {"name": "Abese", "id": 80, "audioId": "080"},
            {"name": "Tekvir", "id": 81, "audioId": "081"},
            {"name": "İnfitar", "id": 82, "audioId": "082"},
            {"name": "Mutaffifin", "id": 83, "audioId": "083"},
            {"name": "İnşikak", "id": 84, "audioId": "084"},
            {"name": "Büruc", "id": 85, "audioId": "085"},
            {"name": "Tarık", "id": 86, "audioId": "086"},
            {"name": "A'la", "id": 87, "audioId": "087"},
            {"name": "Gaşiye", "id": 88, "audioId": "088"},
            {"name": "Fecr", "id": 89, "audioId": "089"},
            {"name": "Beled", "id": 90, "audioId": "090"},
            {"name": "Şems", "id": 91, "audioId": "091"},
            {"name": "Leyl", "id": 92, "audioId": "092"},
            {"name": "Duha", "id": 93, "audioId": "093"},
            {"name": "İnşirah", "id": 94, "audioId": "094"},
            {"name": "Tin", "id": 95, "audioId": "095"},
            {"name": "Alak", "id": 96, "audioId": "096"},
            {"name": "Kadir", "id": 97, "audioId": "097"},
            {"name": "Beyyine", "id": 98, "audioId": "098"},
            {"name": "Zilzal", "id": 99, "audioId": "099"},
            {"name": "Adiyat", "id": 100, "audioId": "100"},
            {"name": "Karia", "id": 101, "audioId": "101"},
            {"name": "Tekasür", "id": 102, "audioId": "102"},
            {"name": "Asr", "id": 103, "audioId": "103"},
            {"name": "Hümeze", "id": 104, "audioId": "104"},
            {"name": "Fil", "id": 105, "audioId": "105"},
            {"name": "Kureyş", "id": 106, "audioId": "106"},
            {"name": "Maun", "id": 107, "audioId": "107"},
            {"name": "Kevser", "id": 108, "audioId": "108"},
            {"name": "Kafirun", "id": 109, "audioId": "109"},
            {"name": "Nasr", "id": 110, "audioId": "110"},
            {"name": "Tebbet", "id": 111, "audioId": "111"},
            {"name": "İhlas", "id": 112, "audioId": "112"},
            {"name": "Felak", "id": 113, "audioId": "113"},
            {"name": "Nas", "id": 114, "audioId": "114"}
          ];
        }
    }

// Load juz data from file
export function loadJuz() {
  try {
      const extension = ExtensionUtils.getCurrentExtension();
      const settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.quran-player');
      
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
              console.error("Quran Player: Error loading custom juz file, falling back to default", customErr);
          }
      }
      
      // Fall back to default file if custom path fails or isn't set
      const juzFile = Gio.File.new_for_path(GLib.build_filenamev([extension.path, 'juz.json']));
      const [success, contents] = juzFile.load_contents(null);
      
      if (success) {
          return JSON.parse(new TextDecoder().decode(contents));
      } else {
          console.log("Quran Player: Failed to load juz file");
          return [];
      }
  } catch (e) {
      console.error("Quran Player: Error loading juz data", e);
      return [];
  }
}

// Check if reciter is juz-based
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