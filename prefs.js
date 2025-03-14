'use strict';

import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

// Load reciters list
let RECITERS = [];
try {
    const recitersFile = Gio.File.new_for_path(GLib.build_filenamev([imports.misc.extensionUtils.getCurrentExtension().path, 'custom-reciters.json']));
    const [success, contents] = recitersFile.load_contents(null);
    if (success) {
        RECITERS = JSON.parse(new TextDecoder().decode(contents));
    }
} catch (e) {
    logError(e, 'Quran Player: Failed to load custom-reciters.json in preferences');
    // Default reciters as fallback
    RECITERS = [
      {
        "name": "Abdullah Basfar",
        "baseUrl": "https://podcasts.qurancentral.com/abdullah-basfar/abdullah-basfar-",
        "audioFormat": "%id%.mp3"
      },
      {
        "name": "Abdullah Matrood",
        "baseUrl": "https://podcasts.qurancentral.com/abdullah-al-matrood/abdullah-al-matrood-",
        "audioFormat": "%id%-muslimcentral.com.mp3"
      },
      {
        "name": "Abdul Rahman Al-Sudais",
        "baseUrl": "https://podcasts.qurancentral.com/abdul-rahman-al-sudais/192/abdul-rahman-al-sudais-",
        "audioFormat": "%id%-qurancentral.com-192.mp3"
      },
      {
        "name": "Abdulbasit Abdussamed",
        "baseUrl": "https://download.quranicaudio.com/quran/abdul_basit_murattal/",
        "audioFormat": "%id%.mp3"
      },
      {
        "name": "Ahmed Al Ajmi",
        "baseUrl": "https://podcasts.qurancentral.com/ahmed-al-ajmi/ahmed-al-ajmi-",
        "audioFormat": "%id%.mp3"
      },
      {
        "name": "Ali Al-Huthaify",
        "baseUrl": "https://podcasts.qurancentral.com/ali-al-huthaify/ali-al-huthaify-",
        "audioFormat": "%id%.mp3"
      },
      {
        "name": "Fatih Seferagic",
        "baseUrl": "https://download.quranicaudio.com/quran/fatih_seferagic/",
        "audioFormat": "%id%.mp3"
      },
      {
        "name": "Hani Ar-Rifai",
        "baseUrl": "https://podcasts.qurancentral.com/hani-ar-rifai/hani-ar-rifai-",
        "audioFormat": "%id%.mp3"
      },
      {
        "name": "Hayri Küçükdeniz-Suat Yıldırım Meali-Cüz",
        "baseUrl": "https://archive.org/download/Kurani.Kerim.Meali.30.cuz.Prof.Dr.SuatYildirim/",
        "audioFormat": "%id%cuz.mp3"
      },
      {
        "name": "Maher Al-Muaiqly",
        "baseUrl": "https://podcasts.qurancentral.com/maher-al-muaiqly/maher-al-muaiqly-",
        "audioFormat": "%id%.mp3"
      },
      {
        "name": "Mishary Al-Afasy",
        "baseUrl": "https://podcasts.qurancentral.com/mishary-al-afasy/mishary-al-afasy-",
        "audioFormat": "%id%.mp3"
      },
      {
        "name": "Mehmet Emin Ay-Cüz",
        "baseUrl": "https://ia800307.us.archive.org/1/items/MehmetEminAYmp3/Mehmet%20Emin%20AY%20_%20Hatm-i%20%C5%9Eerif%2",
        "audioFormat": "%id%.C%C3%BCz.mp3"
      },
      {
        "name": "Muhammad Ayyub",
        "baseUrl": "https://podcasts.qurancentral.com/muhammad-ayyub/muhammad-ayyub-",
        "audioFormat": "%id%.mp3"
      },
      {
        "name": "Mustafa Ismail",
        "baseUrl": "https://download.quranicaudio.com/quran/mostafa_ismaeel/",
        "audioFormat": "%id%.mp3"
      },
      {
        "name": "Saad El-Ghamidi",
        "baseUrl": "https://podcasts.qurancentral.com/saad-al-ghamdi/saad-al-ghamdi-surah-",
        "audioFormat": "%id%.mp3"
      },
      {
        "name": "Saud Al-Shuraim",
        "baseUrl": "https://podcasts.qurancentral.com/saud-al-shuraim/saud-al-shuraim-",
        "audioFormat": "%id%.mp3"
      },
      {
        "name": "Wadee Hammadi Al Yamani",
        "baseUrl": "https://download.quranicaudio.com/quran/wadee_hammadi_al-yamani/",
        "audioFormat": "%id%.mp3"
      },
      {
        "name": "Yusuf Ziya Özkan-Elmalı Meali-Cüz",
        "baseUrl": "https://archive.org/download/Yusuf-Ziya-Ozkan-Meal/",
        "audioFormat": "%id%_cuz.mp3"
      },
      {
        "name": "Yasser Al-Dosari",
        "baseUrl": "https://podcasts.qurancentral.com/yasser-al-dosari/yasser-al-dosari-",
        "audioFormat": "%id%.mp3"
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
            reciterModel.append(reciter.name);
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
                this._settings.set_string('selected-reciter', RECITERS[row.selected].name);
            }
        });

        generalGroup.add(reciterRow);

        // Autoplay next surah
        const autoplayRow = new Adw.SwitchRow({
            title: _('Autoplay next surah'),
            subtitle: _('Automatically play the next surah when current one finishes'),
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

        // Advanced Settings Group
        const advancedGroup = new Adw.PreferencesGroup({
            title: _('Advanced Settings'),
        });
        this.add(advancedGroup);

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

        // Custom surah list path
        const customSurahsPathRow = new Adw.EntryRow({
            title: _('Custom surah list file path'),
            text: this._settings.get_string('custom-surahs-list-path'),
        });

        customSurahsPathRow.connect('notify::text', (row) => {
            this._settings.set_string('custom-surahs-list-path', row.get_text());
        });
        
        advancedGroup.add(customSurahsPathRow);

        // File Chooser Button
        const fileChooserButton = new Gtk.Button({
            label: _('Select File'),
            margin_top: 5,
            halign: Gtk.Align.START,
        });

        fileChooserButton.connect('clicked', () => {
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

        advancedGroup.add(fileChooserButton);
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