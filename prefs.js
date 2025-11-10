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
import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';


import { DEFAULT_RECITERS, isJuzBasedReciter } from './constants.js';

const QuranPlayerPrefsPage = GObject.registerClass(
    class QuranPlayerPrefsPage extends Adw.PreferencesPage {
        _init(settings, reciters) {
            super._init({
                title: _('Quran Player Settings'),
                icon_name: 'audio-headphones-symbolic',
                name: 'QuranPlayerPrefsPage',
            });
    
            this._settings = settings;
            this._reciters = reciters;

           
            const generalGroup = new Adw.PreferencesGroup({
                title: _('General Settings'),
            });
            this.add(generalGroup);

           
            const reciterModel = new Gtk.StringList();
            this._reciters.forEach(reciter => {
               
                const isJuzReciter = isJuzBasedReciter(reciter);
                let displayName = reciter.name;
                if (isJuzReciter) {
                    displayName = `${displayName} [${_("Juz")}]`;
                }
                reciterModel.append(displayName);
            });

            const reciterRow = new Adw.ComboRow({
                title: _('Quran Reciters'),
                subtitle: _('Select a reciter for audio playback'),
                model: reciterModel,
            });

           
            const currentReciterName = this._settings.get_string('selected-reciter');
            const reciterIndex = this._reciters.findIndex(r => r.name === currentReciterName);
            if (reciterIndex >= 0) {
                reciterRow.selected = reciterIndex;
            }

           
            reciterRow.connect('notify::selected', (row) => {
                if (row.selected >= 0 && row.selected < this._reciters.length) {
                   
                    this._settings.set_string('selected-reciter', this._reciters[row.selected].name);
                }
            });

            generalGroup.add(reciterRow);

           
            const autoplayRow = new Adw.SwitchRow({
                title: _('Autoplay next item'),
                subtitle: _('Automatically play the next surah/juz when current one finishes'),
            });

            autoplayRow.set_active(this._settings.get_boolean('autoplay-next'));
            autoplayRow.connect('notify::active', (row) => {
                this._settings.set_boolean('autoplay-next', row.get_active());
            });
            
            generalGroup.add(autoplayRow);

           
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
            
           
            const languageRow = new Adw.ComboRow({
                title: _('Interface Language'),
                subtitle: _('Select language for the interface (changes take effect after restart)'),
            });
            
           
            const languageModel = Gtk.StringList.new([
                _('System Default'),
                'Türkçe',
                'Deutsch',
                'English',
                'العربية'
            ]);
            languageRow.model = languageModel;
            
           
            const currentLanguage = this._settings.get_string('interface-language');
            let langIndex = 0;
            const langCodes = ['', 'tr', 'de', 'en', 'ar'];
            const foundIndex = langCodes.indexOf(currentLanguage);
            if (foundIndex >= 0) {
                langIndex = foundIndex;
            }
            languageRow.selected = langIndex;
            
           
            languageRow.connect('notify::selected', (row) => {
                if (row.selected >= 0 && row.selected < langCodes.length) {
                    const selectedLang = langCodes[row.selected];
                    this._settings.set_string('interface-language', selectedLang);
                }
            });
                
            languageGroup.add(languageRow);

           
            const advancedGroup = new Adw.PreferencesGroup({
                title: _('Advanced Settings'),
            });
            this.add(advancedGroup);
            
           
            const customJuzPathRow = new Adw.EntryRow({
                title: _('Custom juz list file path'),
                text: this._settings.get_string('custom-juz-list-path') || '',
            });

            customJuzPathRow.connect('notify::text', (row) => {
                this._settings.set_string('custom-juz-list-path', row.get_text());
            });
            
            advancedGroup.add(customJuzPathRow);

           
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

           
            const customSurahsPathRow = new Adw.EntryRow({
                title: _('Custom surah list file path'),
                text: this._settings.get_string('custom-surahs-list-path') || '',
            });

            customSurahsPathRow.connect('notify::text', (row) => {
                this._settings.set_string('custom-surahs-list-path', row.get_text());
            });
            
            advancedGroup.add(customSurahsPathRow);

           
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
    _loadReciters() {
        try {
           
            const recitersFile = Gio.File.new_for_path(GLib.build_filenamev([this.path, 'custom-reciters.json']));
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
                logError(e, "Quran Player: Failed to load reciters file, using defaults");
                return DEFAULT_RECITERS;
            }
        } catch (e) {
            logError(e, "Quran Player: Error loading reciters");
            return DEFAULT_RECITERS;
        }
    }

    fillPreferencesWindow(window) {
       
        const reciters = this._loadReciters();
        
       
        const settings = this.getSettings();
        
       
        const page = new QuranPlayerPrefsPage(settings, reciters);
        
       
        window.add(page);
        
       
        window.connect('close-request', () => {
           
        });
    }
}