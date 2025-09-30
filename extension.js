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

import GObject from 'gi://GObject';
import St from 'gi://St';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Clutter from 'gi://Clutter';
import Gst from 'gi://Gst';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as ExtensionUtils from 'resource:///org/gnome/shell/extensions/extension.js';
import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js';

import { loadSurahs, loadReciters, loadJuz, isJuzBasedReciter } from './constants.js';


function initializeJuzData(extension) {
    try {
        const juzFilePath = GLib.build_filenamev([extension.path, 'juz.json']);
        const juzFile = Gio.File.new_for_path(juzFilePath);
        
        if (!juzFile.query_exists(null)) {
            console.log('Quran Player: juz.json not found at path: ' + juzFilePath);
            return [];
        }
        
        const [success, contents] = juzFile.load_contents(null);
        
        if (success && contents && contents.length > 0) {
            const jsonData = JSON.parse(new TextDecoder().decode(contents));
            console.log('Quran Player: Successfully loaded Juz data with ' + jsonData.length + ' entries');
            return jsonData;
        } else {
            console.log('Quran Player: Failed to parse Juz data');
            return [];
        }
    } catch (e) {
        console.log('Quran Player: Error loading Juz data: ' + e.message);
        return [];
    }
}

function debugJuzLoading(extension) {
    try {
        console.log('Quran Player: Extension path: ' + extension.path);
        
        const juzFilePath = GLib.build_filenamev([extension.path, 'juz.json']);
        console.log('Quran Player: Checking for juz.json at: ' + juzFilePath);
        
        const juzFile = Gio.File.new_for_path(juzFilePath);
        const exists = juzFile.query_exists(null);
        
        console.log('Quran Player: juz.json exists: ' + exists);
        
        if (!exists) {
            console.log('Quran Player: File not found. Creating juz.json with default data...');
            
            const juzData = [
                {
                    "name": "1. Juz",
                    "id": 1,
                    "audioId": "01",
                    "description": "Al-Fatiha 1 - Al-Baqarah 141",
                    "startSurah": 1,
                    "endSurah": 2,
                    "endVerse": 141
                  },
                  {
                    "name": "2. Juz",
                    "id": 2,
                    "audioId": "02",
                    "description": "Al-Baqarah 142 - Al-Baqarah 252",
                    "startSurah": 2,
                    "startVerse": 142,
                    "endSurah": 2,
                    "endVerse": 252
                  },
                  {
                    "name": "3. Juz",
                    "id": 3,
                    "audioId": "03",
                    "description": "Al-Baqarah 253 - Al-Imran 92",
                    "startSurah": 2,
                    "startVerse": 253,
                    "endSurah": 3,
                    "endVerse": 92
                  },
                  {
                    "name": "4. Juz",
                    "id": 4,
                    "audioId": "04",
                    "description": "Al-Imran 93 - An-Nisa 23",
                    "startSurah": 3,
                    "startVerse": 93,
                    "endSurah": 4,
                    "endVerse": 23
                  },
                  {
                    "name": "5. Juz",
                    "id": 5,
                    "audioId": "05",
                    "description": "An-Nisa 24 - An-Nisa 147",
                    "startSurah": 4,
                    "startVerse": 24,
                    "endSurah": 4,
                    "endVerse": 147
                  },
                  {
                    "name": "6. Juz",
                    "id": 6,
                    "audioId": "06",
                    "description": "An-Nisa 148 - Al-Ma'idah 81",
                    "startSurah": 4,
                    "startVerse": 148,
                    "endSurah": 5,
                    "endVerse": 81
                  },
                  {
                    "name": "7. Juz",
                    "id": 7,
                    "audioId": "07",
                    "description": "Al-Ma'idah 82 - Al-An'am 110",
                    "startSurah": 5,
                    "startVerse": 82,
                    "endSurah": 6,
                    "endVerse": 110
                  },
                  {
                    "name": "8. Juz",
                    "id": 8,
                    "audioId": "08",
                    "description": "Al-An'am 111 - Al-A'raf 87",
                    "startSurah": 6,
                    "startVerse": 111,
                    "endSurah": 7,
                    "endVerse": 87
                  },
                  {
                    "name": "9. Juz",
                    "id": 9,
                    "audioId": "09",
                    "description": "Al-A'raf 88 - Al-Anfal 40",
                    "startSurah": 7,
                    "startVerse": 88,
                    "endSurah": 8,
                    "endVerse": 40
                  },
                  {
                    "name": "10. Juz",
                    "id": 10,
                    "audioId": "10",
                    "description": "Al-Anfal 41 - At-Tawbah 92",
                    "startSurah": 8,
                    "startVerse": 41,
                    "endSurah": 9,
                    "endVerse": 92
                  },
                  {
                    "name": "11. Juz",
                    "id": 11,
                    "audioId": "11",
                    "description": "At-Tawbah 93 - Hud 5",
                    "startSurah": 9,
                    "startVerse": 93,
                    "endSurah": 11,
                    "endVerse": 5
                  },
                  {
                    "name": "12. Juz",
                    "id": 12,
                    "audioId": "12",
                    "description": "Hud 6 - Yusuf 52",
                    "startSurah": 11,
                    "startVerse": 6,
                    "endSurah": 12,
                    "endVerse": 52
                  },
                  {
                    "name": "13. Juz",
                    "id": 13,
                    "audioId": "13",
                    "description": "Yusuf 53 - Ibrahim 52",
                    "startSurah": 12,
                    "startVerse": 53,
                    "endSurah": 14,
                    "endVerse": 52
                  },
                  {
                    "name": "14. Juz",
                    "id": 14,
                    "audioId": "14",
                    "description": "Al-Hijr 1 - An-Nahl 128",
                    "startSurah": 15,
                    "startVerse": 1,
                    "endSurah": 16,
                    "endVerse": 128
                  },
                  {
                    "name": "15. Juz",
                    "id": 15,
                    "audioId": "15",
                    "description": "Al-Isra 1 - Al-Kahf 74",
                    "startSurah": 17,
                    "startVerse": 1,
                    "endSurah": 18,
                    "endVerse": 74
                  },
                  {
                    "name": "16. Juz",
                    "id": 16,
                    "audioId": "16",
                    "description": "Al-Kahf 75 - Ta-Ha 135",
                    "startSurah": 18,
                    "startVerse": 75,
                    "endSurah": 20,
                    "endVerse": 135
                  },
                  {
                    "name": "17. Juz",
                    "id": 17,
                    "audioId": "17",
                    "description": "Al-Anbiya 1 - Al-Hajj 78",
                    "startSurah": 21,
                    "startVerse": 1,
                    "endSurah": 22,
                    "endVerse": 78
                  },
                  {
                    "name": "18. Juz",
                    "id": 18,
                    "audioId": "18",
                    "description": "Al-Mu'minun 1 - Al-Furqan 20",
                    "startSurah": 23,
                    "startVerse": 1,
                    "endSurah": 25,
                    "endVerse": 20
                  },
                  {
                    "name": "19. Juz",
                    "id": 19,
                    "audioId": "19",
                    "description": "Al-Furqan 21 - An-Naml 55",
                    "startSurah": 25,
                    "startVerse": 21,
                    "endSurah": 27,
                    "endVerse": 55
                  },
                  {
                    "name": "20. Juz",
                    "id": 20,
                    "audioId": "20",
                    "description": "An-Naml 56 - Al-Ankabut 45",
                    "startSurah": 27,
                    "startVerse": 56,
                    "endSurah": 29,
                    "endVerse": 45
                  },
                  {
                    "name": "21. Juz",
                    "id": 21,
                    "audioId": "21",
                    "description": "Al-Ankabut 46 - Al-Ahzab 30",
                    "startSurah": 29,
                    "startVerse": 46,
                    "endSurah": 33,
                    "endVerse": 30
                  },
                  {
                    "name": "22. Juz",
                    "id": 22,
                    "audioId": "22",
                    "description": "Al-Ahzab 31 - Ya-Sin 27",
                    "startSurah": 33,
                    "startVerse": 31,
                    "endSurah": 36,
                    "endVerse": 27
                  },
                  {
                    "name": "23. Juz",
                    "id": 23,
                    "audioId": "23",
                    "description": "Ya-Sin 28 - Az-Zumar 31",
                    "startSurah": 36,
                    "startVerse": 28,
                    "endSurah": 39,
                    "endVerse": 31
                  },
                  {
                    "name": "24. Juz",
                    "id": 24,
                    "audioId": "24",
                    "description": "Az-Zumar 32 - Fussilat 46",
                    "startSurah": 39,
                    "startVerse": 32,
                    "endSurah": 41,
                    "endVerse": 46
                  },
                  {
                    "name": "25. Juz",
                    "id": 25,
                    "audioId": "25",
                    "description": "Fussilat 47 - Al-Jathiyah 37",
                    "startSurah": 41,
                    "startVerse": 47,
                    "endSurah": 45,
                    "endVerse": 37
                  },
                  {
                    "name": "26. Juz",
                    "id": 26,
                    "audioId": "26",
                    "description": "Al-Ahqaf 1 - Adh-Dhariyat 30",
                    "startSurah": 46,
                    "startVerse": 1,
                    "endSurah": 51,
                    "endVerse": 30
                  },
                  {
                    "name": "27. Juz",
                    "id": 27,
                    "audioId": "27",
                    "description": "Adh-Dhariyat 31 - Al-Hadid 29",
                    "startSurah": 51,
                    "startVerse": 31,
                    "endSurah": 57,
                    "endVerse": 29
                  },
                  {
                    "name": "28. Juz",
                    "id": 28,
                    "audioId": "28",
                    "description": "Al-Mujadila 1 - At-Tahrim 12",
                    "startSurah": 58,
                    "startVerse": 1,
                    "endSurah": 66,
                    "endVerse": 12
                  },
                  {
                    "name": "29. Juz",
                    "id": 29,
                    "audioId": "29",
                    "description": "Al-Mulk 1 - Al-Mursalat 50",
                    "startSurah": 67,
                    "startVerse": 1,
                    "endSurah": 77,
                    "endVerse": 50
                  },
                  {
                    "name": "30. Juz",
                    "id": 30,
                    "audioId": "30",
                    "description": "An-Naba 1 - An-Nas 6",
                    "startSurah": 78,
                    "startVerse": 1,
                    "endSurah": 114,
                    "endVerse": 6
                  }
                ];
            
            const juzContent = JSON.stringify(juzData, null, 2);
            
            try {
                const bytes = new TextEncoder().encode(juzContent);
                const outputStream = juzFile.replace(null, false, Gio.FileCreateFlags.NONE, null);
                outputStream.write_all(bytes, null);
                outputStream.close(null);
                console.log('Quran Player: Successfully created juz.json with default data');
                return juzData;
            } catch (writeError) {
                console.log('Quran Player: Error writing juz.json: ' + writeError.message);
                return [];
            }
        }
        
        try {
            const [success, contents] = juzFile.load_contents(null);
            
            if (success && contents && contents.length > 0) {
                const jsonData = JSON.parse(new TextDecoder().decode(contents));
                console.log('Quran Player: Successfully loaded Juz data with ' + jsonData.length + ' entries');
                return jsonData;
            } else {
                console.log('Quran Player: Failed to read juz.json contents');
                return [];
            }
        } catch (readError) {
            console.log('Quran Player: Error reading juz.json: ' + readError.message);
            return [];
        }
    } catch (e) {
        console.log('Quran Player: Debug error: ' + e.message);
        return [];
    }
}

const QuranPlayerIndicator = GObject.registerClass(
class QuranPlayerIndicator extends PanelMenu.Button {
    _init(extension) {
        super._init(0.0, _('Quran Player'));
        
        this._extension = extension;
        this._settings = extension.getSettings();
        
       
        this._surahs = loadSurahs(extension);
        this._reciters = loadReciters(extension);
        this._juzData = initializeJuzData(extension);
        
       
        this._log('Loaded ' + this._surahs.length + ' surahs');
        this._log('Loaded ' + this._juzData.length + ' juz entries');
        this._log('Loaded ' + this._reciters.length + ' reciters');
        
       
        if (this._juzData.length === 0) {
            this._juzData = debugJuzLoading(extension);
            this._log('Debug loaded ' + this._juzData.length + ' juz entries');
        }
        
       
        this._panelBox = new St.BoxLayout({
            style_class: 'panel-status-menu-box'
        });
        
        try {
            this._icon = new St.Icon({
                gicon: Gio.icon_new_for_string(GLib.build_filenamev([this._extension.path, 'icons', 'icon.svg'])),
                style_class: 'system-status-icon'
            });
        } catch (e) {
            this._log('Error loading icon: ' + e.message);
            this._icon = new St.Icon({
                icon_name: 'audio-headphones-symbolic',
                style_class: 'system-status-icon'
            });
        }
        
       
        this._panelLabel = new St.Label({
            text: _('Quran Player'), 
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'quran-panel-label'
        });
        
        this._panelBox.add_child(this._icon);
        this._panelBox.add_child(this._panelLabel);
        
        this.add_child(this._panelBox);
        
       
        this._player = null;
        this._currentItem = null;
        this._isPlaying = false;
        this._usingFallback = false;
        this._busEosId = 0;
        this._busErrorId = 0;
        this._timeoutSources = [];
        this._playerPid = 0;
        this._selectedReciter = this._reciters.length > 0 ? this._reciters[0] : null;
        this._isJuzMode = false;
        this._isMuted = false;
        this._volume = 1.0;
        
       
        this._loadSettings();
        
       
        this._createPlayerUI();
        
       
        this._rebuildContentMenu();
       
       
        this._connectSignals();
    }

    _attachPlayerUI() {
        let playerItem = new PopupMenu.PopupBaseMenuItem({
            reactive: false,
            can_focus: false
        });
        playerItem.add_child(this._playerBox);
        this.menu.addMenuItem(playerItem);
    }

    _loadSettings() {
        if (this._reciters.length === 0) {
            this._reciters.push({
                "name": "Mustafa Ismail",
                "baseUrl": "https://download.quranicaudio.com/quran/mostafa_ismaeel/",
                "audioFormat": "%id%.mp3",
                "type": "surah"
            });
            this._selectedReciter = this._reciters[0];
            this._isJuzMode = false;
            return;
        }
        
        const reciterId = this._settings.get_string('selected-reciter');
        if (reciterId) {
            const foundReciter = this._reciters.find(r => r.name === reciterId);
            if (foundReciter) {
                this._selectedReciter = foundReciter;
                this._isJuzMode = isJuzBasedReciter(foundReciter);
                this._log(`Reciter selected: ${foundReciter.name}, Juz mode: ${this._isJuzMode}`);
            } else {
                this._selectedReciter = this._reciters[0];
                this._isJuzMode = isJuzBasedReciter(this._selectedReciter);
                this._log(`Saved reciter not found, using first reciter: ${this._selectedReciter.name}`);
            }
        } else {
            this._selectedReciter = this._reciters[0];
            this._isJuzMode = isJuzBasedReciter(this._selectedReciter);
            this._log(`No setting found, using first reciter: ${this._selectedReciter.name}`);
        }
    }
    
    _rebuildContentMenu() {
        this._log("Completely rebuilding menu");
        
       
        if (this._controlSignalHandlers) {
            this._controlSignalHandlers.forEach(handler => {
                if (handler.obj && handler.id) {
                    try {
                        handler.obj.disconnect(handler.id);
                    } catch (e) {
                        this._log(`Error disconnecting control signal: ${e.message}`);
                    }
                }
            });
            this._controlSignalHandlers = [];
        }
        
       
        if (this._controlsBox) {
            this._controlsBox.destroy();
            this._controlsBox = null;
        }
        
       
        const items = this.menu._getMenuItems();
        for (let i = items.length - 1; i >= 0; i--) {
            items[i].destroy();
        }
        
       
        this._createPlayerUI(true);
        
       
        const categoryTitle = this._isJuzMode ? 
            new PopupMenu.PopupMenuItem(_("Juz Selection"), { reactive: false, style_class: 'category-title' }) :
            new PopupMenu.PopupMenuItem(_("Surah Selection"), { reactive: false, style_class: 'category-title' });
        
        this.menu.addMenuItem(categoryTitle);
        
       
        if (this._isJuzMode) {
            this._log("Juz mode active, showing juz groups only");
            this._addJuzGroups();
        } else {
            this._log("Surah mode active, showing surah groups only");
            this._addSurahGroups();
        }
        
        this._addSettingsMenu();
    }

    _createPlayerUI(fullReset = false) {
       
        this._playerBox = new St.BoxLayout({
            vertical: true,
            style_class: 'quran-player-box'
        });
        
       
        this._nowPlayingLabel = new St.Label({
            text: _('Quran Player'),
            style_class: 'quran-now-playing',
            x_align: Clutter.ActorAlign.CENTER
        });
        
       
        this._playerBox.add_child(this._nowPlayingLabel);
            
        if (fullReset || !this._controlsBox) {
           
            this._resetPlayerControls();
        }
        
        this._playerBox.add_child(this._controlsBox);
        
       
        this._createStatusBar();
        this._playerBox.add_child(this._statusBar);
        
       
        let playerItem = new PopupMenu.PopupBaseMenuItem({
            reactive: false,
            can_focus: false
        });
        playerItem.add_child(this._playerBox);
        this.menu.addMenuItem(playerItem);
        
       
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    }
    
    _resetPlayerControls() {
       
        if (this._controlsBox) {
            this._controlsBox.destroy();
            this._controlsBox = null;
        }
        
       
        this._controlsBox = new St.BoxLayout({
            style_class: 'quran-controls-box'
        });
        
       
        this._prevButton = new St.Button({
            style_class: 'quran-control-button',
            can_focus: true,
            track_hover: true,
            child: new St.Icon({
                icon_name: 'media-skip-backward-symbolic',
                icon_size: 16
            })
        });
        
        this._playButton = new St.Button({
            style_class: 'quran-control-button',
            can_focus: true,
            track_hover: true,
            child: new St.Icon({
                icon_name: 'media-playback-start-symbolic', 
                icon_size: 16
            })
        });
        
        this._stopButton = new St.Button({
            style_class: 'quran-control-button',
            can_focus: true,
            track_hover: true,
            child: new St.Icon({
                icon_name: 'media-playback-stop-symbolic',
                icon_size: 16
            })
        });
        
        this._nextButton = new St.Button({
            style_class: 'quran-control-button',
            can_focus: true,
            track_hover: true,
            child: new St.Icon({
                icon_name: 'media-skip-forward-symbolic',
                icon_size: 16
            })
        });
        
       
        this._volumeButton = new St.Button({
            style_class: 'quran-control-button',
            can_focus: true,
            track_hover: true,
            child: new St.Icon({
                icon_name: 'audio-volume-high-symbolic',
                icon_size: 16
            })
        });
        
        
       
        this._seekBackButton = new St.Button({
            style_class: 'quran-control-button',
            can_focus: true,
            track_hover: true,
            child: new St.Icon({
                icon_name: 'media-seek-backward-symbolic',
                icon_size: 16
            })
        });
        
        this._seekForwardButton = new St.Button({
            style_class: 'quran-control-button',
            can_focus: true,
            track_hover: true,
            child: new St.Icon({
                icon_name: 'media-seek-forward-symbolic',
                icon_size: 16
            })
        });
        
       
        this._controlsBox.add_child(this._seekBackButton);
        this._controlsBox.add_child(this._prevButton);
        this._controlsBox.add_child(this._playButton);
        this._controlsBox.add_child(this._stopButton);
        this._controlsBox.add_child(this._nextButton);
        this._controlsBox.add_child(this._seekForwardButton);
        this._controlsBox.add_child(this._volumeButton);
        
       
        this._connectControlSignals();
        
        return this._controlsBox;
    }

    _createStatusBar() {
       
        this._statusBar = new St.BoxLayout({
            vertical: true,
            style_class: 'quran-status-bar'
        });
        
       
        this._progressBox = new St.BoxLayout({
            style_class: 'quran-progress-box'
        });
        
       
        this._progressBar = new St.BoxLayout({
            width: 300,
            height: 16,
            style_class: 'quran-progress-bar'
        });
        
        // Progress bar'a click özelliği ekle
        this._progressBar.reactive = true;
        this._progressBar.can_focus = true;
        
       
        this._progressBackground = new St.BoxLayout({
            width: 300,
            height: 16,
            style_class: 'quran-progress-background'
        });
        
        this._progressFill = new St.BoxLayout({
            width: 0,
            height: 16,
            style_class: 'quran-progress-fill'
        });
        
        this._progressBackground.add_child(this._progressFill);
        this._progressBar.add_child(this._progressBackground);
        
       
        this._timeBox = new St.BoxLayout({
            style_class: 'quran-time-box'
        });
        
       
        this._currentTimeLabel = new St.Label({
            text: '00:00',
            style_class: 'quran-time-label'
        });
        
        this._totalTimeLabel = new St.Label({
            text: '00:00',
            style_class: 'quran-time-label'
        });
        
       
        this._timeBox.add_child(this._currentTimeLabel);
        this._timeBox.add_child(this._totalTimeLabel);
        
       
        this._progressBox.add_child(this._progressBar);
        this._statusBar.add_child(this._progressBox);
        this._statusBar.add_child(this._timeBox);
        
       
        this._progressPosition = 0;
        this._totalDuration = 0;
        this._currentPosition = 0;
        this._progressUpdateId = 0;
    }

    _updateProgressBar() {
        if (!this._progressFill || !this._progressBackground) {
            this._log("Progress bar elements not found");
            return;
        }
        
        if (this._totalDuration > 0) {
            const progress = this._currentPosition / this._totalDuration;
            const progressWidth = Math.floor(300 * progress);
            
            this._progressFill.width = progressWidth;
            this._log(`Progress bar updated: ${progressWidth}px (${Math.round(progress * 100)}%)`);
        } else {
            this._progressFill.width = 0;
        }
    }

    _updateProgress() {
        if (!this._player) {
            this._log("Player not available, skipping progress update");
            return;
        }
        
        if (!this._isPlaying) {
            this._log("Player not playing, skipping progress update");
            return;
        }
        
        try {
            let format = Gst.Format.TIME;
            let query = Gst.Query.new_position(format);
            
            if (this._player.query(query)) {
                let [, position] = query.parse_position();
                this._currentPosition = position;
                
               
                if (this._totalDuration === 0) {
                    let durationQuery = Gst.Query.new_duration(format);
                    if (this._player.query(durationQuery)) {
                        let [, duration] = durationQuery.parse_duration();
                        this._totalDuration = duration;
                        this._log(`Total duration: ${duration / Gst.SECOND} seconds`);
                    }
                }
                
               
                this._updateTimeDisplay();
                this._updateProgressBar();
                
                this._log(`Progress: ${this._currentPosition / Gst.SECOND}s / ${this._totalDuration / Gst.SECOND}s`);
            } else {
                this._log("Failed to query position");
            }
        } catch (e) {
            this._log(`Error updating progress: ${e.message}`);
        }
    }

    _updateTimeDisplay() {
        if (this._currentTimeLabel && this._totalTimeLabel) {
            this._currentTimeLabel.text = this._formatTime(this._currentPosition);
            this._totalTimeLabel.text = this._formatTime(this._totalDuration);
        }
    }

    _formatTime(nanoseconds) {
        if (!nanoseconds || nanoseconds === 0) {
            return '00:00';
        }
        
        const seconds = Math.floor(nanoseconds / Gst.SECOND);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    _startProgressUpdates() {
        if (this._progressUpdateId) {
            GLib.Source.remove(this._progressUpdateId);
        }
        
        this._progressUpdateId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
            this._updateProgress();
            return GLib.SOURCE_CONTINUE;
        });
    }

    _stopProgressUpdates() {
        if (this._progressUpdateId) {
            GLib.Source.remove(this._progressUpdateId);
            this._progressUpdateId = 0;
        }
    }

    _connectControlSignals() {
       
        if (this._controlSignalHandlers) {
            this._controlSignalHandlers.forEach(handler => {
                if (handler.obj && handler.id) {
                    try {
                        handler.obj.disconnect(handler.id);
                    } catch (e) {
                        this._log(`Error disconnecting control signal: ${e.message}`);
                    }
                }
            });
        }
        
        this._controlSignalHandlers = [];
        
       
        const safeConnect = (obj, signal, callback) => {
            if (obj) {
                try {
                    const id = obj.connect(signal, callback);
                    this._controlSignalHandlers.push({ obj, id });
                    return id;
                } catch (e) {
                    this._log(`Error connecting control signal ${signal}: ${e.message}`);
                }
            }
            return 0;
        };
        
       
        safeConnect(this._playButton, 'clicked', () => {
            this._log("Play button clicked");
            this._togglePlay();
            return Clutter.EVENT_PROPAGATE;
        });
        
        safeConnect(this._stopButton, 'clicked', () => {
            this._log("Stop button clicked");
            this._stopPlayback();
            return Clutter.EVENT_PROPAGATE;
        });
        
        safeConnect(this._prevButton, 'clicked', () => {
            this._log("Previous button clicked");
            this._playPrevious();
            return Clutter.EVENT_PROPAGATE;
        });
        
        safeConnect(this._nextButton, 'clicked', () => {
            this._log("Next button clicked");
            this._playNext();
            return Clutter.EVENT_PROPAGATE;
        });
        
        safeConnect(this._seekBackButton, 'clicked', () => {
            this._log("Seek back button clicked");
            this._seekBackward();
            return Clutter.EVENT_PROPAGATE;
        });
        
        safeConnect(this._seekForwardButton, 'clicked', () => {
            this._log("Seek forward button clicked");
            this._seekForward();
            return Clutter.EVENT_PROPAGATE;
        });
        
        safeConnect(this._volumeButton, 'clicked', () => {
            this._log("Volume button clicked");
            this._toggleMute();
            return Clutter.EVENT_PROPAGATE;
        });
        
        
        // Progress bar click handler
        safeConnect(this._progressBar, 'button-press-event', (actor, event) => {
            this._log("Progress bar clicked");
            this._seekToPosition(event);
            return Clutter.EVENT_PROPAGATE;
        });
    }

    _connectSignals() {
       
        if (this._signalHandlers) {
            this._signalHandlers.forEach(handler => {
                if (handler.obj && handler.id) {
                    try {
                        handler.obj.disconnect(handler.id);
                    } catch (e) {
                        this._log(`Error disconnecting signal: ${e.message}`);
                    }
                }
            });
        }
        
        this._signalHandlers = [];
        
       
        const safeConnect = (obj, signal, callback) => {
            if (obj) {
                try {
                    const id = obj.connect(signal, callback);
                    this._signalHandlers.push({ obj, id });
                    return id;
                } catch (e) {
                    this._log(`Error connecting signal ${signal}: ${e.message}`);
                }
            }
            return 0;
        };
        
       
        if (this._settings) {
            safeConnect(this._settings, 'changed::interface-language', () => {
                this._log('Language setting changed');
                this._showNotification(_("Language Changed"), 
                    _("Please restart GNOME Shell for the language change to take effect"));
            });
        }
    }

    _addSurahGroups() {
       
        const groupSize = 15;
        const groupCount = Math.ceil(this._surahs.length / groupSize);
        
        for (let i = 0; i < groupCount; i++) {
            const startIdx = i * groupSize;
            const endIdx = Math.min(startIdx + groupSize, this._surahs.length);
            
           
            const firstId = this._surahs[startIdx].id;
            const lastId = this._surahs[endIdx-1].id;
            const groupLabel = `${firstId}-${lastId}`;
            
           
            let subMenu = new PopupMenu.PopupSubMenuMenuItem(groupLabel);
            
           
            for (let j = startIdx; j < endIdx; j++) {
                const surah = this._surahs[j];
                let item = new PopupMenu.PopupMenuItem(`${surah.id}. ${surah.name}`);
                
               
                item.connect('activate', () => {
                    this._playSurah(surah);
                });
                
                subMenu.menu.addMenuItem(item);
            }
            
            this.menu.addMenuItem(subMenu);
        }
    }

    _addJuzGroups() {
       
        if (!this._juzData || this._juzData.length === 0) {
           
            this._juzData = initializeJuzData(this._extension);
            
           
            if (!this._juzData || this._juzData.length === 0) {
                this._log("No Juz data available, please check juz.json file");
                let noDataItem = new PopupMenu.PopupMenuItem(_('No Juz data available'));
                noDataItem.setSensitive(false);
                this.menu.addMenuItem(noDataItem);
                return;
            }
        }
    
       
        const groupSize = 5;
        const groupCount = Math.ceil(this._juzData.length / groupSize);
        
        for (let i = 0; i < groupCount; i++) {
            const startIdx = i * groupSize;
            const endIdx = Math.min(startIdx + groupSize, this._juzData.length);
            
           
            const firstId = this._juzData[startIdx].id;
            const lastId = this._juzData[endIdx-1].id;
            const groupLabel = `${_("Juz")} ${firstId}-${lastId}`;

            let subMenu = new PopupMenu.PopupSubMenuMenuItem(groupLabel);
            
           
            for (let j = startIdx; j < endIdx; j++) {
                const juz = this._juzData[j];
                let item = new PopupMenu.PopupMenuItem(juz.name);
                
               
                item.connect('activate', () => {
                    this._playJuz(juz);
                });
                
                subMenu.menu.addMenuItem(item);
            }
            
            this.menu.addMenuItem(subMenu);
        }
    }
        
    _addSettingsMenu() {
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
       
        let reciterMenu = new PopupMenu.PopupSubMenuMenuItem(_('Reciters'));
        
       
        if (this._reciters && this._reciters.length > 0) {
            this._reciters.forEach(reciter => {
                if (!reciter || !reciter.name) return;
                
               
                const isJuzReciter = isJuzBasedReciter(reciter);
                let displayName = reciter.name;
                if (isJuzReciter) {
                    displayName = `${displayName} [${_("Juz")}]`;
                }
                
                let item = new PopupMenu.PopupMenuItem(displayName);
                
               
                if (this._selectedReciter && this._selectedReciter.name === reciter.name) {
                    item.setOrnament(PopupMenu.Ornament.DOT);
                }
                
               
                item.connect('activate', () => {
                    try {
                       
                        this._stopPlayback();
                        
                       
                        this._selectedReciter = {...reciter};
                        
                       
                        const wasJuzMode = this._isJuzMode;
                        this._isJuzMode = isJuzBasedReciter(reciter);
                        
                       
                        this._rebuildContentMenu();
                        
                       
                        this._settings.set_string('selected-reciter', reciter.name);
                        
                       
                        this._updateReciterSelection();
                        
                        if (this._currentItem) {
                            this._updatePlayerUI();
                        }
                    } catch (e) {
                        this._log(`Error changing reciter: ${e.message}`);
                    }
                });
                
                reciterMenu.menu.addMenuItem(item);
            });
        } else {
           
            let placeholderItem = new PopupMenu.PopupMenuItem(_('No reciters available'));
            placeholderItem.setSensitive(false);
            reciterMenu.menu.addMenuItem(placeholderItem);
        }
        
        this.menu.addMenuItem(reciterMenu);
        
       
        let settingsItem = new PopupMenu.PopupMenuItem(_('Settings'));
        settingsItem.connect('activate', () => {
            this._log("Settings button clicked, opening preferences");
            try {
                this._extension.openPreferences();
            } catch (e) {
                this._log(`Error opening settings: ${e.message}`);
            }
        });
        
        this.menu.addMenuItem(settingsItem);
    }

   
    _updateReciterSelection() {
        try {
           
            const reciterMenuItem = this.menu._getMenuItems().find(item => 
                item instanceof PopupMenu.PopupSubMenuMenuItem && 
                item.label.text === _('Reciter')
            );
            
            if (reciterMenuItem) {
               
                reciterMenuItem.menu._getMenuItems().forEach(item => {
                    if (item instanceof PopupMenu.PopupMenuItem) {
                       
                        const displayName = item.label.text;
                        const reciterName = displayName.replace(' ${_("Juz")}', '');
                        
                        const isSelected = this._selectedReciter && 
                                        reciterName === this._selectedReciter.name;
                        item.setOrnament(isSelected ? PopupMenu.Ornament.DOT : PopupMenu.Ornament.NONE);
                    }
                });
            }
        } catch (e) {
            this._log(`Error updating reciter selection: ${e.message}`);
        }
    }

    _showNotification(title, body) {
       
        if (!this._settings || !this._settings.get_boolean('show-notifications')) {
            return;
        }
        
        try {
           
            Main.notify(title, body);
        } catch (e) {
            console.error(`[Quran Player] Notification error: ${e.message}`);
        }
    }
    
    _playSurah(surah) {
        if (!surah) {
            this._log("Invalid surah object");
            return;
        }
        
       
        this._currentItem = { ...surah, type: 'surah' };
        
       
        if (this._player) {
            try {
                this._player.set_state(Gst.State.NULL);
                this._player = null;
            } catch (e) {
                this._log(`Error stopping previous playback: ${e.message}`);
            }
        }
        
       
        if (!this._selectedReciter && this._reciters.length > 0) {
            this._selectedReciter = this._reciters[0];
        } else if (!this._selectedReciter) {
           
            this._selectedReciter = {
                "name": "Mustafa Ismail",
                "baseUrl": "https://download.quranicaudio.com/quran/mostafa_ismaeel/",
                "audioFormat": "%id%.mp3",
                "type": "surah"
            };
        }
        
       
        let audioUrl;
        
       
        const paddedId = surah.id.toString().padStart(3, '0');
        
       
        const audioId = surah.audioId || paddedId;
        
        try {
           
            if (this._selectedReciter.hasSpecialFormat && this._selectedReciter.formatMap) {
               
                const twoDigitId = surah.id.toString().padStart(2, '0');
                
                if (this._selectedReciter.formatMap[twoDigitId]) {
                    const specialFormat = this._selectedReciter.formatMap[twoDigitId];
                    audioUrl = `${this._selectedReciter.baseUrl}${specialFormat}`;
                    this._log(`Using special format for surah ${surah.id}: ${audioUrl}`);
                } else {
                   
                    audioUrl = `${this._selectedReciter.baseUrl}${this._selectedReciter.audioFormat}`
                        .replace(/%id%/g, paddedId)
                        .replace(/%audioId%/g, audioId)
                        .replace(/%name%/g, surah.name);
                    this._log(`No special format found for surah ${surah.id}, using standard format: ${audioUrl}`);
                }
            } else {
               
                audioUrl = `${this._selectedReciter.baseUrl}${this._selectedReciter.audioFormat}`
                    .replace(/%id%/g, paddedId)
                    .replace(/%audioId%/g, audioId)
                    .replace(/%name%/g, surah.name);
            }
            
           
            console.log(`🎧 AUDIO URL (Surah): ${audioUrl}`);
            this._log(`Playing surah: ${surah.name}, URL: ${audioUrl}`);
        } catch (urlError) {
            this._log(`Error creating audio URL: ${urlError.message}`);
            return;
        }
        // Check for saved position
        const savedPosition = this._getSavedPosition(surah.id, this._selectedReciter.name);
        this._lastPosition = savedPosition || 0;
        
        this._playAudio(audioUrl, `Now playing: ${surah.name}`, `Reciter: ${this._selectedReciter ? this._selectedReciter.name : "Unknown"}`);
    }
    _playJuz(juz) {
        if (!juz) {
            this._log("Invalid juz object");
            return;
        }
        
       
        // Juz description bilgisini de ekle
        this._currentItem = { 
            ...juz, 
            type: 'juz',
            description: juz.description || ''
        };
        
       
        if (this._player) {
            try {
                this._player.set_state(Gst.State.NULL);
                this._player = null;
            } catch (e) {
                this._log(`Error stopping previous playback: ${e.message}`);
            }
        }
        
       
        if (!this._selectedReciter && this._reciters.length > 0) {
            this._selectedReciter = this._reciters.find(r => isJuzBasedReciter(r)) || this._reciters[0];
        } else if (!this._selectedReciter) {
           
            this._selectedReciter = {
                "name": "Hayri Küçükdeniz-Suat Yıldırım Meali",
                "baseUrl": "https://archive.org/download/Kurani.Kerim.Meali.30.cuz.Prof.Dr.SuatYildirim/",
                "audioFormat": "%id%Cuz.mp3",
                "type": "juz"
            };
        }
        
        let audioUrl;
        
        const paddedId = juz.id.toString().padStart(2, '0');
        
        const audioId = juz.audioId || paddedId;
        
        try {
           
            if (this._selectedReciter.hasSpecialFormat && this._selectedReciter.formatMap) {
               
                if (this._selectedReciter.formatMap[audioId]) {
                    const specialFormat = this._selectedReciter.formatMap[audioId];
                    audioUrl = `${this._selectedReciter.baseUrl}${specialFormat}`;
                    this._log(`Using special format for juz ${juz.id}: ${audioUrl}`);
                } else {
                   
                    audioUrl = `${this._selectedReciter.baseUrl}${this._selectedReciter.audioFormat}`
                        .replace(/%id%/g, paddedId)
                        .replace(/%audioId%/g, audioId)
                        .replace(/%name%/g, juz.name)
                        .replace(/%specialFormat%/g, `${paddedId}Cuz.mp3`);
                    this._log(`Using fallback format for juz ${juz.id}: ${audioUrl}`);
                }
            } else {
               
                audioUrl = `${this._selectedReciter.baseUrl}${this._selectedReciter.audioFormat}`
                    .replace(/%id%/g, paddedId)
                    .replace(/%audioId%/g, audioId)
                    .replace(/%name%/g, juz.name);
                this._log(`Using standard format for juz ${juz.id}: ${audioUrl}`);
            }
            
           
            console.log(`🎧 AUDIO URL (Juz): ${audioUrl}`);
            this._log(`Playing juz: ${juz.name}, URL: ${audioUrl}`);
        } catch (urlError) {
            this._log(`Error creating audio URL: ${urlError.message}`);
            return;
        }
        // Check for saved position
        const savedPosition = this._getSavedPosition(juz.id, this._selectedReciter.name);
        this._lastPosition = savedPosition || 0;
        
        this._playAudio(audioUrl, `Now playing: ${juz.name}`, `Reciter: ${this._selectedReciter ? this._selectedReciter.name : "Unknown"}`);
    }
    
    _playAudio(audioUrl, notificationTitle, notificationBody) {
       
        try {
            // Check for hardware compatibility to prevent freezes on old GPUs
            if (!this._checkHardwareCompatibility()) {
                this._showNotification(_("Hardware Compatibility"), 
                    _("Your system may not be compatible with audio playback. Please check system requirements."));
                return;
            }
            
            if (!Gst.init_check(null)) {
                Gst.init(null);
            }
            
           
            this._stopPlayback();
            
           
            this._player = Gst.ElementFactory.make("playbin", "player");
            
            if (!this._player) {
                throw new Error("Could not create GStreamer playbin element");
            }
            
            // Set the URI
            this._player.set_property("uri", audioUrl);
            
            // Configure HTTP headers for souphttpsrc to avoid 403 Forbidden errors
            this._player.connect('source-setup', (playbin, source) => {
                if (source.get_factory().get_name() === 'souphttpsrc') {
                    // Determine domain-specific header strategy
                    const url = audioUrl.toLowerCase();
                    
                    if (url.includes('podcasts.qurancentral.com/raad-mohammad-al-kurdi')) {
                        // Raad Mohammad Al-Kurdi needs specific headers
                        source.set_property('user-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
                        try {
                            source.set_property('referer', 'https://podcasts.qurancentral.com/');
                        } catch (e) {
                            this._log(`Could not set referer: ${e.message}`);
                        }
                        this._log(`Configured headers for Raad Mohammad Al-Kurdi: User-Agent and Referer set`);
                    } else if (url.includes('podcasts.qurancentral.com')) {
                        // All QuranCentral reciters need browser-like headers to avoid 403 errors
                        source.set_property('user-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
                        try {
                            source.set_property('referer', 'https://podcasts.qurancentral.com/');
                        } catch (e) {
                            this._log(`Could not set referer: ${e.message}`);
                        }
                        this._log(`Configured browser headers for QuranCentral reciter`);
                    } else if (url.includes('download.quranicaudio.com')) {
                        // QuranicAudio.com doesn't need special headers
                        this._log(`Using default headers for QuranicAudio.com`);
                    } else {
                        // Default browser-like headers for unknown domains
                        source.set_property('user-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
                        this._log(`Using default browser headers for unknown domain`);
                    }
                }
            });
            
            // Get the bus for messages
            const bus = this._player.get_bus();
            bus.add_signal_watch();
            
           
            this._busEosId = bus.connect('message::eos', () => {
                this._onPlaybackEnded();
            });
            
           
            this._busErrorId = bus.connect('message::error', (_, msg) => {
                let [error, debug] = msg.parse_error();
                this._log(`GStreamer playback error: ${error.message} (${debug})`);
                this._onPlaybackEnded();
            });
            
           
            const stateChange = this._player.set_state(Gst.State.PLAYING);
            if (stateChange === Gst.StateChangeReturn.FAILURE) {
                throw new Error("Failed to start playback");
            }
            
           
            try {
                if (this._settings && this._settings.get_boolean('show-notifications')) {
                   
                    const timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
                        try {
                            this._showNotification(notificationTitle, notificationBody);
                        } catch (e) {
                            this._log(`Delayed notification error: ${e.message}`);
                        }
                        return GLib.SOURCE_REMOVE;
                    });
                    
                   
                    if (!this._timeoutSources) {
                        this._timeoutSources = [];
                    }
                    this._timeoutSources.push(timeoutId);
                }
            } catch (notifyError) {
               
                this._log(`Notification error: ${notifyError.message}`);
            }
            
            this._isPlaying = true;
            
            // Start progress updates
            this._startProgressUpdates();
            
        } catch (gstError) {
            this._log(`GStreamer error: ${gstError.message}`);
            
           
            let playbackSuccess = false;
            
            try {
               
                let [success, pid] = GLib.spawn_async(
                    null,
                    ['bash', '-c', `curl -s '${audioUrl}' | mpv --no-terminal --no-video -`],
                    null,
                    GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD,
                    null
                );
                
                if (success) {
                    this._playerPid = pid;
                   
                    GLib.child_watch_add(GLib.PRIORITY_DEFAULT, pid, (pid, status) => {
                        this._log(`Fallback player exited with status: ${status}`);
                        this._playerPid = 0;
                        this._isPlaying = false;
                        this._updatePlayerUI();
                        GLib.spawn_close_pid(pid);
                    });
                    playbackSuccess = true;
                    this._usingFallback = true;
                }
            } catch (e2) {
                this._log(`curl+mpv fallback failed: ${e2.message}`);
                
               
                try {
                    let [success, pid] = GLib.spawn_async(
                        null,
                        ['mpv', '--no-terminal', '--no-video', audioUrl],
                        null,
                        GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD,
                        null
                    );
                    
                    if (success) {
                        this._playerPid = pid;
                       
                        GLib.child_watch_add(GLib.PRIORITY_DEFAULT, pid, (pid, status) => {
                            this._log(`Fallback player exited with status: ${status}`);
                            this._playerPid = 0;
                            this._isPlaying = false;
                            this._updatePlayerUI();
                            GLib.spawn_close_pid(pid);
                        });
                        playbackSuccess = true;
                        this._usingFallback = true;
                    }
                } catch (e3) {
                    this._log(`mpv fallback failed: ${e3.message}`);
                    
                   
                    try {
                        GLib.spawn_command_line_async(`xdg-open "${audioUrl}"`);
                        playbackSuccess = true;
                        this._usingFallback = true;
                    } catch (e4) {
                        this._log(`xdg-open fallback failed: ${e4.message}`);
                        console.error("Quran Player: Could not play audio file", e4);
                        
                       
                        try {
                            this._showNotification("Error", "Could not play audio file");
                        } catch (notifyError) {
                           
                        }
                        return;
                    }
                }
            }
            
           
            if (playbackSuccess) {
                try {
                    if (this._settings && this._settings.get_boolean('show-notifications')) {
                        this._showNotification(notificationTitle, 
                                               `${notificationBody} (fallback mode)`);
                    }
                } catch (e) {
                   
                }
                
                this._isPlaying = true;
            }
        }
        
       
        this._updatePlayerUI();
    }

    _log(message) {
        console.log(`[Quran Player] ${message}`);
       
       
       
    }

    _togglePlay() {
        this._log(`Toggle play called. Player exists: ${!!this._player}, Using fallback: ${this._usingFallback}, Is playing: ${this._isPlaying}`);
       
        if (!this._player || this._usingFallback) {
            if (this._isPlaying) {
                this._stopPlayback();
                return;
            } else if (this._currentItem) {
                if (this._currentItem.type === 'surah') {
                    this._playSurah(this._currentItem);
                } else if (this._currentItem.type === 'juz') {
                    this._playJuz(this._currentItem);
                }
                return;
            }
            return;
        }
        
        try {
            if (this._isPlaying) {
                // PAUSE LOGIC
                this._log("Pausing playback...");
                
                // Get current position before pausing
                let currentPosition = 0;
                try {
                    let format = Gst.Format.TIME;
                    let query = Gst.Query.new_position(format);
                    
                    if (this._player.query(query)) {
                        let [, position] = query.parse_position();
                        currentPosition = position;
                        this._lastPosition = position;
                        this._log(`Current position: ${position / Gst.SECOND} seconds`);
                    }
                } catch (posError) {
                    this._log(`Error getting position: ${posError.message}`);
                }
                
                // Pause the player
                const stateResult = this._player.set_state(Gst.State.PAUSED);
                this._log(`Pause state result: ${stateResult}`);
                
                // Update flags
                this._isPlaying = false;
                
                // Stop progress updates
                this._stopProgressUpdates();
                
                // Save position
                if (this._currentItem && this._selectedReciter && currentPosition > 0) {
                    const itemId = this._currentItem.id;
                    const reciterName = this._selectedReciter.name;
                    this._savePosition(itemId, reciterName, currentPosition);
                }
                
                this._log("Playback paused successfully");
                
            } else {
                // PLAY/RESUME LOGIC
                this._log("Starting/resuming playback...");
                
                // Seek to saved position if available
                if (this._lastPosition > 0) {
                    this._log(`Seeking to saved position: ${this._lastPosition / Gst.SECOND} seconds`);
                    try {
                        this._player.seek_simple(
                            Gst.Format.TIME,
                            Gst.SeekFlags.FLUSH | Gst.SeekFlags.KEY_UNIT,
                            this._lastPosition
                        );
                    } catch (seekError) {
                        this._log(`Seek error: ${seekError.message}`);
                    }
                }
                
                // Start playing
                const stateResult = this._player.set_state(Gst.State.PLAYING);
                this._log(`Play state result: ${stateResult}`);
                
                // Update flags
                this._isPlaying = true;
                
                // Start progress updates
                this._startProgressUpdates();
                
                this._log("Playback started/resumed successfully");
            }
            
            // Update UI
            this._updatePlayerUI();
            
        } catch (e) {
            this._log(`Error in toggle play: ${e.message}`);
            
            // Reset everything on error
            try {
                this._stopPlayback();
                if (this._currentItem) {
                    if (this._currentItem.type === 'surah') {
                        this._playSurah(this._currentItem);
                    } else if (this._currentItem.type === 'juz') {
                        this._playJuz(this._currentItem);
                    }
                }
            } catch (resetError) {
                this._log(`Error resetting player: ${resetError.message}`);
            }
        }
    }

    _playPrevious() {
        if (!this._currentItem) return;
        this._log("Play previous");
        if (this._currentItem.type === 'surah') {
            const currentIndex = this._surahs.findIndex(s => s.id === this._currentItem.id);
            if (currentIndex > 0) {
                const prevSurah = this._surahs[currentIndex - 1];
                this._playSurah(prevSurah);
            }
        } else if (this._currentItem.type === 'juz') {
            const currentIndex = this._juzData.findIndex(j => j.id === this._currentItem.id);
            if (currentIndex > 0) {
                const prevJuz = this._juzData[currentIndex - 1];
                this._playJuz(prevJuz);
            }
        }
    }
    
    _stopPlayback() {
       
        if (this._player) {
            try {
                const bus = this._player.get_bus();
                if (bus) {
                    if (this._busEosId) {
                        bus.disconnect(this._busEosId);
                        this._busEosId = 0;
                    }
                    if (this._busErrorId) {
                        bus.disconnect(this._busErrorId);
                        this._busErrorId = 0;
                    }
                    
                   
                    bus.remove_signal_watch();
                }
                
               
                this._player.set_state(Gst.State.NULL);
                this._player = null;
            } catch (e) {
                this._log(`Error during GStreamer cleanup: ${e.message}`);
            }
        }
        
       
        if (this._usingFallback && this._playerPid > 0) {
            try {
               
                GLib.spawn_command_line_async(`kill ${this._playerPid}`);
                this._playerPid = 0;
            } catch (e) {
                this._log(`Error stopping fallback player: ${e.message}`);
            }
            this._usingFallback = false;
        }
        
        // Stop progress updates
        this._stopProgressUpdates();
        
        this._lastPosition = 0;
        this._isPlaying = false;
        this._updatePlayerUI();
        //this._log("Stopped playback");
    }
    
    _playNext() {
        if (!this._currentItem) return;
        this._log("Play next");
        if (this._currentItem.type === 'surah') {
            const currentIndex = this._surahs.findIndex(s => s.id === this._currentItem.id);
            if (currentIndex < this._surahs.length - 1) {
                const nextSurah = this._surahs[currentIndex + 1];
                this._playSurah(nextSurah);
            }
        } else if (this._currentItem.type === 'juz') {
            const currentIndex = this._juzData.findIndex(j => j.id === this._currentItem.id);
            if (currentIndex < this._juzData.length - 1) {
                const nextJuz = this._juzData[currentIndex + 1];
                this._playJuz(nextJuz);
            }
        }
    }

    _seekBackward() {
        if (!this._player || this._usingFallback) return;
        
        try {
            const seekAmount = 10 * Gst.SECOND; // 10 seconds back
            const newPosition = Math.max(0, this._currentPosition - seekAmount);
            
            this._player.seek_simple(
                Gst.Format.TIME,
                Gst.SeekFlags.FLUSH | Gst.SeekFlags.KEY_UNIT,
                newPosition
            );
            
            this._log(`Seeked backward to ${newPosition / Gst.SECOND} seconds`);
        } catch (e) {
            this._log(`Error seeking backward: ${e.message}`);
        }
    }

    _seekForward() {
        if (!this._player || this._usingFallback) return;
        
        try {
            const seekAmount = 10 * Gst.SECOND; // 10 seconds forward
            const newPosition = Math.min(this._totalDuration, this._currentPosition + seekAmount);
            
            this._player.seek_simple(
                Gst.Format.TIME,
                Gst.SeekFlags.FLUSH | Gst.SeekFlags.KEY_UNIT,
                newPosition
            );
            
            this._log(`Seeked forward to ${newPosition / Gst.SECOND} seconds`);
        } catch (e) {
            this._log(`Error seeking forward: ${e.message}`);
        }
    }

    _toggleMute() {
        if (!this._player || this._usingFallback) return;
        
        try {
            this._isMuted = !this._isMuted;
            const volume = this._isMuted ? 0.0 : this._volume;
            
            this._player.set_property('volume', volume);
            
            // Update volume button icon
            const volumeIcon = this._volumeButton.get_child();
            if (this._isMuted) {
                volumeIcon.icon_name = 'audio-volume-muted-symbolic';
            } else {
                volumeIcon.icon_name = 'audio-volume-high-symbolic';
            }
            
            this._log(`Volume ${this._isMuted ? 'muted' : 'unmuted'}`);
        } catch (e) {
            this._log(`Error toggling mute: ${e.message}`);
        }
    }

    _setVolume(volume) {
        if (!this._player || this._usingFallback) return;
        
        try {
            this._volume = Math.max(0.0, Math.min(1.0, volume));
            
            if (!this._isMuted) {
                this._player.set_property('volume', this._volume);
            }
            
            // Update volume button icon based on level
            const volumeIcon = this._volumeButton.get_child();
            if (this._volume === 0) {
                volumeIcon.icon_name = 'audio-volume-muted-symbolic';
            } else if (this._volume < 0.5) {
                volumeIcon.icon_name = 'audio-volume-low-symbolic';
            } else {
                volumeIcon.icon_name = 'audio-volume-high-symbolic';
            }
            
            this._log(`Volume set to ${Math.round(this._volume * 100)}%`);
        } catch (e) {
            this._log(`Error setting volume: ${e.message}`);
        }
    }


    _seekToPosition(event) {
        if (!this._player || this._usingFallback || this._totalDuration === 0) return;
        
        try {
            // Mouse pozisyonunu al
            const [x, y] = event.get_coords();
            const progressBarX = this._progressBar.get_allocation_box().x1;
            const progressBarWidth = this._progressBar.width;
            
            // Click pozisyonunu hesapla
            const clickX = x - progressBarX;
            const progress = Math.max(0, Math.min(1, clickX / progressBarWidth));
            const newPosition = Math.floor(this._totalDuration * progress);
            
            // Seek to position
            this._player.seek_simple(
                Gst.Format.TIME,
                Gst.SeekFlags.FLUSH | Gst.SeekFlags.KEY_UNIT,
                newPosition
            );
            
            this._log(`Seeked to ${newPosition / Gst.SECOND} seconds (${Math.round(progress * 100)}%)`);
        } catch (e) {
            this._log(`Error seeking to position: ${e.message}`);
        }
    }

    _getSavedPosition(itemId, reciterName) {
        try {
            const key = `position_${itemId}_${reciterName}`;
            const savedPosition = this._settings.get_int(key);
            if (savedPosition > 0) {
                this._log(`Found saved position for ${itemId}: ${savedPosition / Gst.SECOND} seconds`);
                return savedPosition;
            }
        } catch (e) {
            this._log(`Error loading saved position: ${e.message}`);
        }
        return 0;
    }

    _savePosition(itemId, reciterName, position) {
        try {
            const key = `position_${itemId}_${reciterName}`;
            this._settings.set_int(key, position);
            this._log(`Saved position for ${itemId}: ${position / Gst.SECOND} seconds`);
        } catch (e) {
            this._log(`Error saving position: ${e.message}`);
        }
    }

    _clearSavedPosition(itemId, reciterName) {
        try {
            const key = `position_${itemId}_${reciterName}`;
            this._settings.reset(key);
            this._log(`Cleared saved position for ${itemId}`);
        } catch (e) {
            this._log(`Error clearing saved position: ${e.message}`);
        }
    }
    
    _updatePlayerUI() {
        if (this._currentItem) {
           
            if (this._currentItem.type === 'surah') {
                this._nowPlayingLabel.text = `${this._currentItem.id}. ${this._currentItem.name}`;
            } else if (this._currentItem.type === 'juz') {
                // Juz için description bilgisini ekle
                const juzDescription = this._currentItem.description || '';
                if (juzDescription) {
                    this._nowPlayingLabel.text = `${this._currentItem.name} - ${juzDescription}`;
                } else {
                    this._nowPlayingLabel.text = this._currentItem.name;
                }
            }
            //this._log("Update player UI");
           
            const reciterName = this._selectedReciter ? this._selectedReciter.name : "";
            this._panelLabel.text = ` ${this._currentItem.name} - ${reciterName}`;
            
           
            const playIcon = this._playButton.get_child();
            if (this._isPlaying) {
                playIcon.icon_name = 'media-playback-pause-symbolic';
            } else {
                playIcon.icon_name = 'media-playback-start-symbolic';
            }
        } else {
           
            this._nowPlayingLabel.text = _('Quran Player');
            this._panelLabel.text = _('Quran Player');
            this._playButton.get_child().icon_name = 'media-playback-start-symbolic';
        }
    }
    
   
    _onPlaybackEnded() {
        if (!this._player) return;
        
        try {
            this._player.set_state(Gst.State.NULL);
            this._player = null;
            this._isPlaying = false;
            
           
            if (this._settings.get_boolean('repeat-current') && this._currentItem) {
                this._log("Repeat mode active, playing current item again");
               
                if (this._currentItem.type === 'surah') {
                    this._playSurah(this._currentItem);
                } else if (this._currentItem.type === 'juz') {
                    this._playJuz(this._currentItem);
                }
            }
           
            else if (this._settings.get_boolean('autoplay-next') && this._currentItem) {
                this._playNext();
            } else {
                this._updatePlayerUI();
            }
        } catch (e) {
            this._log(`Error handling playback end: ${e.message}`);
            this._updatePlayerUI();
        }
    }
    
    destroy() {
       
        if (this._signalHandlers) {
            this._signalHandlers.forEach(handler => {
                if (handler.obj && handler.id) {
                    try {
                        handler.obj.disconnect(handler.id);
                    } catch (e) {
                        this._log(`Error disconnecting signal in destroy: ${e.message}`);
                    }
                }
            });
            this._signalHandlers = [];
        }
        
       
        if (this._controlSignalHandlers) {
            this._controlSignalHandlers.forEach(handler => {
                if (handler.obj && handler.id) {
                    try {
                        handler.obj.disconnect(handler.id);
                    } catch (e) {
                        this._log(`Error disconnecting control signal in destroy: ${e.message}`);
                    }
                }
            });
            this._controlSignalHandlers = [];
        }
        
       
       
        if (this._timeoutSources) {
            this._timeoutSources.forEach(sourceId => {
                if (sourceId > 0) {
                    try {
                        GLib.Source.remove(sourceId);
                    } catch (e) {
                       
                        this._log(`Error removing source ${sourceId}: ${e.message}`);
                    }
                }
            });
            this._timeoutSources = [];
        }


        this._stopPlayback();
        
       
        if (this._controlsBox) {
            this._controlsBox.destroy();
            this._controlsBox = null;
        }
        
       
        super.destroy();
    }
    
    _checkHardwareCompatibility() {
        try {
            // Check for known problematic GPU drivers/hardware
            const gpuInfo = GLib.spawn_command_line_sync('lspci | grep -i vga')[1];
            if (gpuInfo) {
                const gpuString = new TextDecoder().decode(gpuInfo).toLowerCase();
                
                // Check for old NVIDIA GTX 200 series and other problematic GPUs
                const problematicGPUs = [
                    'gtx 2', // GTX 200 series
                    'geforce 8', // GeForce 8 series
                    'geforce 9', // GeForce 9 series
                ];
                
                for (const gpu of problematicGPUs) {
                    if (gpuString.includes(gpu)) {
                        console.log(`Quran Player: Detected potentially problematic GPU: ${gpu}`);
                        // Still allow playback but with warning
                        this._showNotification(_("Hardware Warning"), 
                            _("Your GPU may cause system instability. If you experience freezes, please disable the extension."));
                        break;
                    }
                }
            }
            
            // Always return true to allow playback, but with warnings for problematic hardware
            return true;
        } catch (e) {
            console.log(`Quran Player: Could not check hardware compatibility: ${e.message}`);
            return true; // Default to allowing playback
        }
    }
});

export default class QuranPlayerExtension extends Extension {
    enable() {
        console.log('Quran Player: Enabling extension');
        
       
        try {
            if (!Gst.init_check(null)) {
                Gst.init(null);
            }
        } catch (e) {
            console.error('Quran Player: Failed to initialize GStreamer', e);
        }
        
       
        this._settings = this.getSettings();
        
        // GNOME Shell 48: Use built-in localization system, no manual locale configuration needed
        console.log('Quran Player: Using GNOME Shell 48 built-in localization');
        
        // CRITICAL FIX: Reset any problematic environment variables that might have been set previously
        try {
            // Reset environment variables to prevent system-wide language changes
            GLib.unsetenv('LANGUAGE');
            GLib.setenv('LANGUAGE', 'en_US.UTF-8', true);
            GLib.setenv('LC_MESSAGES', 'en_US.UTF-8', true);
            console.log('Quran Player: Reset environment variables to prevent system locale interference');
        } catch (e) {
            console.log(`Quran Player: Could not reset environment variables: ${e.message}`);
        }
        
       
        this._settingsChangedId = this._settings.connect('changed::interface-language', () => {
            console.log('Quran Player: Language setting changed - but no system locale changes will be made');
            // GNOME Shell 48: No manual locale configuration - extension will use built-in gettext only
           
            if (this._indicator && this._indicator._showNotification) {
                this._indicator._showNotification(_("Language Setting"), 
                    _("Language preference saved. Extension uses GNOME Shell localization only."));
            }
        });
        
       
        this._indicator = new QuranPlayerIndicator(this);
        Main.panel.addToStatusArea('quran-player', this._indicator);
        
        console.log('Quran Player: Extension enabled');
    }


           
    _refreshIndicator() {
        if (this._indicator) {
           
            this._indicator.destroy();
            
           
            this._indicator = new QuranPlayerIndicator(this);
            Main.panel.addToStatusArea('quran-player', this._indicator);
        }
    }
    
    disable() {
        console.log('Quran Player: Disabling extension');
        
       
        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = 0;
        }
       
       
        if (this._indicator) {
            try {
                if (typeof this._indicator._stopPlayback === 'function') {
                    this._indicator._stopPlayback();
                }
            } catch (e) {
                console.log(`Quran Player: Error stopping playback during disable: ${e.message}`);
            }
        }
        
       
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
        
        this._settings = null;
        
        console.log('Quran Player: Extension disabled');
    }
}
