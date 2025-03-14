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
    const recitersFile = Gio.File.new_for_path(GLib.build_filenamev([imports.misc.extensionUtils.getCurrentExtension().path, 'custom-reciters.json']));
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
    logError(e, 'Quran Player: Failed to load custom-reciters.json in preferences');
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