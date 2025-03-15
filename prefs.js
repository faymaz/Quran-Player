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

import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

// Helper function to detect juz-based reciters
function isJuzBasedReciter(reciter) {
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

// Load reciters list
let RECITERS = [];
try {
    const recitersFile = Gio.File.new_for_path(GLib.build_filenamev([Me.path, 'custom-reciters.json']));
    const [success, contents] = recitersFile.load_contents(null);
    if (success) {
        let reciters = JSON.parse(new TextDecoder().decode(contents));
        
        // Make sure each reciter has a type field (default to 'surah')
        RECITERS = reciters.map(reciter => {
            if (!reciter.type) {
                reciter.type = isJuzBasedReciter(reciter) ? 'juz' : 'surah';
            }
            return reciter;
        });
    }
} catch (e) {
    logError('Quran Player: Failed to load custom-reciters.json in preferences', e);
    // Default reciters as fallback (with type field)
    RECITERS = [
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
}

// Main preferences page
const QuranPlayerPrefsPage = GObject.registerClass(
    class QuranPlayerPrefsPage extends Adw.PreferencesPage {
        _init(settings) {
            super._init({
                title: _('Quran Player Settings'),
                icon_name: 'audio-headphones-symbolic',
                name: 'QuranPlayerPrefsPage',
            });
    
            this._settings = settings;

        // General Settings Group
        const generalGroup = new Adw.PreferencesGroup({
            title: _('General Settings'),
        });
        this.add(generalGroup);

        // Reciter Selection
        const reciterModel = new Gtk.StringList();
        RECITERS.forEach(reciter => {
            // Add badge to indicate juz-based reciters
            const isJuzReciter = isJuzBasedReciter(reciter);
            let displayName = reciter.name;
            if (isJuzReciter) {
                displayName = `${displayName} [Cüz]`;
            }
            reciterModel.append(displayName);
        });

        const reciterRow = new Adw.ComboRow({
            title: _('Quran Reciter'),
            subtitle: _('Select a reciter for audio playback'),
            model: reciterModel,
        });

        // Select current reciter from settings
        const currentReciterName = this._settings.get_string('selected-reciter');
        const reciterIndex = RECITERS.findIndex(r => r.name === currentReciterName);
        if (reciterIndex >= 0) {
            reciterRow.selected = reciterIndex;
        }

        // Update settings when changed
        reciterRow.connect('notify::selected', (row) => {
            if (row.selected >= 0 && row.selected < RECITERS.length) {
                // Extract original reciter name (removing [Cüz] if present)
                this._settings.set_string('selected-reciter', RECITERS[row.selected].name);
            }
        });

        generalGroup.add(reciterRow);

        // Autoplay next surah
        const autoplayRow = new Adw.SwitchRow({
            title: _('Autoplay next item'),
            subtitle: _('Automatically play the next surah/juz when current one finishes'),
        });

        autoplayRow.set_active(this._settings.get_boolean('autoplay-next'));
        autoplayRow.connect('notify::active', (row) => {
            this._settings.set_boolean('autoplay-next', row.get_active());
        });
        
        generalGroup.add(autoplayRow);

        // Show notifications
        const notifyRow = new Adw.SwitchRow({
            title: _('Show notifications'),
            subtitle: _('Display notifications when playback starts/stops'),
        });

        notifyRow.set_active(this._settings.get_boolean('show-notifications'));
        notifyRow.connect('notify::active', (row) => {
            this._settings.set_boolean('show-notifications', row.get_active());
        });
        
        generalGroup.add(notifyRow);


        const repeatRow = new Adw.SwitchRow({
            title: _('Repeat current item'),
            subtitle: _('Repeatedly play the current surah/juz until stopped'),
        });
        
        repeatRow.set_active(this._settings.get_boolean('repeat-current'));
        repeatRow.connect('notify::active', (row) => {
            this._settings.set_boolean('repeat-current', row.get_active());
        });
        
        generalGroup.add(repeatRow);

        const languageGroup = new Adw.PreferencesGroup({
            title: _('Language Settings'),
        });
        this.add(languageGroup);
        
        // Dil Seçimi
        const languageRow = new Adw.ComboRow({
            title: _('Interface Language'),
            subtitle: _('Select language for the interface (changes take effect after restart)'),
        });
        
        // Dil listesi modeli
        const languageModel = Gtk.StringList.new([
            _('System Default'),
            'Türkçe',
            'Deutsch',
            'English',
            'العربية'
        ]);
        languageRow.model = languageModel;
        
        // Mevcut dili seç
        const currentLanguage = this._settings.get_string('interface-language');
        let langIndex = 0; // Default to system
        const langCodes = ['', 'tr', 'de', 'en', 'ar'];
        const foundIndex = langCodes.indexOf(currentLanguage);
        if (foundIndex >= 0) {
            langIndex = foundIndex;
        }
        languageRow.selected = langIndex;
        
        // Değiştiğinde ayarları güncelle
        languageRow.connect('notify::selected', (row) => {
            if (row.selected >= 0 && row.selected < langCodes.length) {
                this._settings.set_string('interface-language', langCodes[row.selected]);
            }
        });
        
        languageGroup.add(languageRow);

        // Advanced Settings Group
        const advancedGroup = new Adw.PreferencesGroup({
            title: _('Advanced Settings'),
        });
        this.add(advancedGroup);
        
        // Custom juz file path
        const customJuzPathRow = new Adw.EntryRow({
            title: _('Custom juz list file path'),
            text: this._settings.get_string('custom-juz-list-path') || '',
        });

        customJuzPathRow.connect('notify::text', (row) => {
            this._settings.set_string('custom-juz-list-path', row.get_text());
        });
        
        advancedGroup.add(customJuzPathRow);

        // Juz File Chooser Button
        const juzFileChooserButton = new Gtk.Button({
            label: _('Select Juz File'),
            margin_top: 5,
            halign: Gtk.Align.START,
        });

        juzFileChooserButton.connect('clicked', () => {
            const fileChooser = new Gtk.FileChooserDialog({
                title: _('Select custom juz list JSON file'),
                action: Gtk.FileChooserAction.OPEN,
                transient_for: this.get_root(),
                modal: true,
            });

            fileChooser.add_button(_('Cancel'), Gtk.ResponseType.CANCEL);
            fileChooser.add_button(_('Select'), Gtk.ResponseType.ACCEPT);

            const filter = new Gtk.FileFilter();
            filter.set_name('JSON files');
            filter.add_mime_type('application/json');
            fileChooser.add_filter(filter);

            fileChooser.connect('response', (dialog, response) => {
                if (response === Gtk.ResponseType.ACCEPT) {
                    const file = dialog.get_file();
                    const path = file.get_path();
                    customJuzPathRow.text = path;
                    this._settings.set_string('custom-juz-list-path', path);
                }
                dialog.destroy();
            });

            fileChooser.show();
        });

        advancedGroup.add(juzFileChooserButton);

        // Custom surah list path
        const customSurahsPathRow = new Adw.EntryRow({
            title: _('Custom surah list file path'),
            text: this._settings.get_string('custom-surahs-list-path') || '',
        });

        customSurahsPathRow.connect('notify::text', (row) => {
            this._settings.set_string('custom-surahs-list-path', row.get_text());
        });
        
        advancedGroup.add(customSurahsPathRow);

        // Surah File Chooser Button
        const surahFileChooserButton = new Gtk.Button({
            label: _('Select Surah File'),
            margin_top: 5,
            halign: Gtk.Align.START,
        });

        surahFileChooserButton.connect('clicked', () => {
            const fileChooser = new Gtk.FileChooserDialog({
                title: _('Select custom surah list JSON file'),
                action: Gtk.FileChooserAction.OPEN,
                transient_for: this.get_root(),
                modal: true,
            });

            fileChooser.add_button(_('Cancel'), Gtk.ResponseType.CANCEL);
            fileChooser.add_button(_('Select'), Gtk.ResponseType.ACCEPT);

            const filter = new Gtk.FileFilter();
            filter.set_name('JSON files');
            filter.add_mime_type('application/json');
            fileChooser.add_filter(filter);

            fileChooser.connect('response', (dialog, response) => {
                if (response === Gtk.ResponseType.ACCEPT) {
                    const file = dialog.get_file();
                    const path = file.get_path();
                    customSurahsPathRow.text = path;
                    this._settings.set_string('custom-surahs-list-path', path);
                }
                dialog.destroy();
            });

            fileChooser.show();
        });

        advancedGroup.add(surahFileChooserButton);

        // Debug logging
        const debugRow = new Adw.SwitchRow({
            title: _('Enable debug logs'),
            subtitle: _('Enable debug logging for troubleshooting'),
        });

        debugRow.set_active(this._settings.get_boolean('enable-debug-log'));
        debugRow.connect('notify::active', (row) => {
            this._settings.set_boolean('enable-debug-log', row.get_active());
        });
        
        advancedGroup.add(debugRow);
    }
});

export default class QuranPlayerPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        
        // Add main page
        const page = new QuranPlayerPrefsPage(settings);
        window.add(page);
    }
}