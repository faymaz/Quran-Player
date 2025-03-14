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
import * as ExtensionUtils from 'resource:///org/gnome/shell/misc/extensionUtils.js';
import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js';

// Initialize Juz data directly from extension path
function initializeJuzData(extension) {
    try {
        // Use the extension parameter instead of ExtensionUtils
        const juzFilePath = GLib.build_filenamev([extension.path, 'juz.json']);
        const juzFile = Gio.File.new_for_path(juzFilePath);
        
        if (!juzFile.query_exists(null)) {
            log('Quran Player: juz.json not found at path: ' + juzFilePath);
            return [];
        }
        
        const [success, contents] = juzFile.load_contents(null);
        
        if (success && contents && contents.length > 0) {
            const jsonData = JSON.parse(new TextDecoder().decode(contents));
            log('Quran Player: Successfully loaded Juz data with ' + jsonData.length + ' entries');
            return jsonData;
        } else {
            log('Quran Player: Failed to parse Juz data');
            return [];
        }
    } catch (e) {
        log('Quran Player: Error loading Juz data: ' + e.message);
        return [];
    }
}
// Load surahs list from JSON file
function loadSurahs(extension) {
    try {
        const surahsFile = Gio.File.new_for_path(GLib.build_filenamev([extension.path, 'surahs.json']));
        const [success, contents] = surahsFile.load_contents(null);
        if (success) {
            return JSON.parse(new TextDecoder().decode(contents));
        }
    } catch (e) {
        logError(e, 'Quran Player: Failed to load surahs.json');
    }
    
    // Default surahs if failed to load
    return [
        {"name": "Fatiha", "id": 1, "audioId": "001"},
        {"name": "Bakara", "id": 2, "audioId": "002"},
        // ... more default surahs
    ];
}

// Load reciters from JSON file
function loadReciters(extension) {
    try {
        const recitersFile = Gio.File.new_for_path(GLib.build_filenamev([extension.path, 'custom-reciters.json']));
        const [success, contents] = recitersFile.load_contents(null);
        if (success) {
            let reciters = JSON.parse(new TextDecoder().decode(contents));
            
            // Make sure each reciter has a type field
            reciters = reciters.map(reciter => {
                if (!reciter.type) {
                    // Auto-detect type
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
        }
    } catch (e) {
        logError(e, 'Quran Player: Failed to load custom-reciters.json');
    }
    
    // Default reciters if failed to load
    return [
        {
            "name": "Mustafa Ismail",
            "baseUrl": "https://download.quranicaudio.com/quran/mostafa_ismaeel/",
            "audioFormat": "%id%.mp3",
            "type": "surah"
        },
        {
            "name": "AbdulBaset AbdulSamad",
            "baseUrl": "https://download.quranicaudio.com/quran/abdul_basit_murattal/",
            "audioFormat": "%id%.mp3",
            "type": "surah"
          }
        ];
    }

    // Helper function to check if reciter is juz-based
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

function debugJuzLoading(extension) {
    try {
        // Log extension path
        log('Quran Player: Extension path: ' + extension.path);
        
        // Check if juz.json exists
        const juzFilePath = GLib.build_filenamev([extension.path, 'juz.json']);
        log('Quran Player: Checking for juz.json at: ' + juzFilePath);
        
        const juzFile = Gio.File.new_for_path(juzFilePath);
        const exists = juzFile.query_exists(null);
        
        log('Quran Player: juz.json exists: ' + exists);
        
        if (!exists) {
            log('Quran Player: File not found. Creating juz.json with default data...');
            
            // Create default juz data
            const juzData = [
                {
                    "name": "1. Cüz",
                    "id": 1,
                    "audioId": "01",
                    "description": "Al-Fatiha 1 - Al-Baqarah 141",
                    "startSurah": 1,
                    "endSurah": 2,
                    "endVerse": 141
                  },
                  {
                    "name": "2. Cüz",
                    "id": 2,
                    "audioId": "02",
                    "description": "Al-Baqarah 142 - Al-Baqarah 252",
                    "startSurah": 2,
                    "startVerse": 142,
                    "endSurah": 2,
                    "endVerse": 252
                  },
                  {
                    "name": "3. Cüz",
                    "id": 3,
                    "audioId": "03",
                    "description": "Al-Baqarah 253 - Al-Imran 92",
                    "startSurah": 2,
                    "startVerse": 253,
                    "endSurah": 3,
                    "endVerse": 92
                  },
                  {
                    "name": "4. Cüz",
                    "id": 4,
                    "audioId": "04",
                    "description": "Al-Imran 93 - An-Nisa 23",
                    "startSurah": 3,
                    "startVerse": 93,
                    "endSurah": 4,
                    "endVerse": 23
                  },
                  {
                    "name": "5. Cüz",
                    "id": 5,
                    "audioId": "05",
                    "description": "An-Nisa 24 - An-Nisa 147",
                    "startSurah": 4,
                    "startVerse": 24,
                    "endSurah": 4,
                    "endVerse": 147
                  },
                  {
                    "name": "6. Cüz",
                    "id": 6,
                    "audioId": "06",
                    "description": "An-Nisa 148 - Al-Ma'idah 81",
                    "startSurah": 4,
                    "startVerse": 148,
                    "endSurah": 5,
                    "endVerse": 81
                  },
                  {
                    "name": "7. Cüz",
                    "id": 7,
                    "audioId": "07",
                    "description": "Al-Ma'idah 82 - Al-An'am 110",
                    "startSurah": 5,
                    "startVerse": 82,
                    "endSurah": 6,
                    "endVerse": 110
                  },
                  {
                    "name": "8. Cüz",
                    "id": 8,
                    "audioId": "08",
                    "description": "Al-An'am 111 - Al-A'raf 87",
                    "startSurah": 6,
                    "startVerse": 111,
                    "endSurah": 7,
                    "endVerse": 87
                  },
                  {
                    "name": "9. Cüz",
                    "id": 9,
                    "audioId": "09",
                    "description": "Al-A'raf 88 - Al-Anfal 40",
                    "startSurah": 7,
                    "startVerse": 88,
                    "endSurah": 8,
                    "endVerse": 40
                  },
                  {
                    "name": "10. Cüz",
                    "id": 10,
                    "audioId": "10",
                    "description": "Al-Anfal 41 - At-Tawbah 92",
                    "startSurah": 8,
                    "startVerse": 41,
                    "endSurah": 9,
                    "endVerse": 92
                  },
                  {
                    "name": "11. Cüz",
                    "id": 11,
                    "audioId": "11",
                    "description": "At-Tawbah 93 - Hud 5",
                    "startSurah": 9,
                    "startVerse": 93,
                    "endSurah": 11,
                    "endVerse": 5
                  },
                  {
                    "name": "12. Cüz",
                    "id": 12,
                    "audioId": "12",
                    "description": "Hud 6 - Yusuf 52",
                    "startSurah": 11,
                    "startVerse": 6,
                    "endSurah": 12,
                    "endVerse": 52
                  },
                  {
                    "name": "13. Cüz",
                    "id": 13,
                    "audioId": "13",
                    "description": "Yusuf 53 - Ibrahim 52",
                    "startSurah": 12,
                    "startVerse": 53,
                    "endSurah": 14,
                    "endVerse": 52
                  },
                  {
                    "name": "14. Cüz",
                    "id": 14,
                    "audioId": "14",
                    "description": "Al-Hijr 1 - An-Nahl 128",
                    "startSurah": 15,
                    "startVerse": 1,
                    "endSurah": 16,
                    "endVerse": 128
                  },
                  {
                    "name": "15. Cüz",
                    "id": 15,
                    "audioId": "15",
                    "description": "Al-Isra 1 - Al-Kahf 74",
                    "startSurah": 17,
                    "startVerse": 1,
                    "endSurah": 18,
                    "endVerse": 74
                  },
                  {
                    "name": "16. Cüz",
                    "id": 16,
                    "audioId": "16",
                    "description": "Al-Kahf 75 - Ta-Ha 135",
                    "startSurah": 18,
                    "startVerse": 75,
                    "endSurah": 20,
                    "endVerse": 135
                  },
                  {
                    "name": "17. Cüz",
                    "id": 17,
                    "audioId": "17",
                    "description": "Al-Anbiya 1 - Al-Hajj 78",
                    "startSurah": 21,
                    "startVerse": 1,
                    "endSurah": 22,
                    "endVerse": 78
                  },
                  {
                    "name": "18. Cüz",
                    "id": 18,
                    "audioId": "18",
                    "description": "Al-Mu'minun 1 - Al-Furqan 20",
                    "startSurah": 23,
                    "startVerse": 1,
                    "endSurah": 25,
                    "endVerse": 20
                  },
                  {
                    "name": "19. Cüz",
                    "id": 19,
                    "audioId": "19",
                    "description": "Al-Furqan 21 - An-Naml 55",
                    "startSurah": 25,
                    "startVerse": 21,
                    "endSurah": 27,
                    "endVerse": 55
                  },
                  {
                    "name": "20. Cüz",
                    "id": 20,
                    "audioId": "20",
                    "description": "An-Naml 56 - Al-Ankabut 45",
                    "startSurah": 27,
                    "startVerse": 56,
                    "endSurah": 29,
                    "endVerse": 45
                  },
                  {
                    "name": "21. Cüz",
                    "id": 21,
                    "audioId": "21",
                    "description": "Al-Ankabut 46 - Al-Ahzab 30",
                    "startSurah": 29,
                    "startVerse": 46,
                    "endSurah": 33,
                    "endVerse": 30
                  },
                  {
                    "name": "22. Cüz",
                    "id": 22,
                    "audioId": "22",
                    "description": "Al-Ahzab 31 - Ya-Sin 27",
                    "startSurah": 33,
                    "startVerse": 31,
                    "endSurah": 36,
                    "endVerse": 27
                  },
                  {
                    "name": "23. Cüz",
                    "id": 23,
                    "audioId": "23",
                    "description": "Ya-Sin 28 - Az-Zumar 31",
                    "startSurah": 36,
                    "startVerse": 28,
                    "endSurah": 39,
                    "endVerse": 31
                  },
                  {
                    "name": "24. Cüz",
                    "id": 24,
                    "audioId": "24",
                    "description": "Az-Zumar 32 - Fussilat 46",
                    "startSurah": 39,
                    "startVerse": 32,
                    "endSurah": 41,
                    "endVerse": 46
                  },
                  {
                    "name": "25. Cüz",
                    "id": 25,
                    "audioId": "25",
                    "description": "Fussilat 47 - Al-Jathiyah 37",
                    "startSurah": 41,
                    "startVerse": 47,
                    "endSurah": 45,
                    "endVerse": 37
                  },
                  {
                    "name": "26. Cüz",
                    "id": 26,
                    "audioId": "26",
                    "description": "Al-Ahqaf 1 - Adh-Dhariyat 30",
                    "startSurah": 46,
                    "startVerse": 1,
                    "endSurah": 51,
                    "endVerse": 30
                  },
                  {
                    "name": "27. Cüz",
                    "id": 27,
                    "audioId": "27",
                    "description": "Adh-Dhariyat 31 - Al-Hadid 29",
                    "startSurah": 51,
                    "startVerse": 31,
                    "endSurah": 57,
                    "endVerse": 29
                  },
                  {
                    "name": "28. Cüz",
                    "id": 28,
                    "audioId": "28",
                    "description": "Al-Mujadila 1 - At-Tahrim 12",
                    "startSurah": 58,
                    "startVerse": 1,
                    "endSurah": 66,
                    "endVerse": 12
                  },
                  {
                    "name": "29. Cüz",
                    "id": 29,
                    "audioId": "29",
                    "description": "Al-Mulk 1 - Al-Mursalat 50",
                    "startSurah": 67,
                    "startVerse": 1,
                    "endSurah": 77,
                    "endVerse": 50
                  },
                  {
                    "name": "30. Cüz",
                    "id": 30,
                    "audioId": "30",
                    "description": "An-Naba 1 - An-Nas 6",
                    "startSurah": 78,
                    "startVerse": 1,
                    "endSurah": 114,
                    "endVerse": 6
                  }
                ];
            
                // Convert to JSON
                const juzContent = JSON.stringify(juzData, null, 2);
                
                // Write to file
                try {
                    const bytes = new TextEncoder().encode(juzContent);
                    const outputStream = juzFile.replace(null, false, Gio.FileCreateFlags.NONE, null);
                    outputStream.write_all(bytes, null);
                    outputStream.close(null);
                    log('Quran Player: Successfully created juz.json with default data');
                    return juzData;
                } catch (writeError) {
                    log('Quran Player: Error writing juz.json: ' + writeError.message);
                    return [];
                }
            }
            
            // Try to read the file
            try {
                const [success, contents] = juzFile.load_contents(null);
                
                if (success && contents && contents.length > 0) {
                    const jsonData = JSON.parse(new TextDecoder().decode(contents));
                    log('Quran Player: Successfully loaded Juz data with ' + jsonData.length + ' entries');
                    return jsonData;
                } else {
                    log('Quran Player: Failed to read juz.json contents');
                    return [];
                }
            } catch (readError) {
                log('Quran Player: Error reading juz.json: ' + readError.message);
                return [];
            }
        } catch (e) {
            log('Quran Player: Debug error: ' + e.message);
            return [];
        }
    }
    // Ensure GStreamer is initialized
try {
    if (!Gst.init_check(null)) {
        Gst.init(null);
    }
} catch (e) {
    logError(e, 'Quran Player: Failed to initialize GStreamer');
}

const QuranPlayerIndicator = GObject.registerClass(
class QuranPlayerIndicator extends PanelMenu.Button {
    _init(extension) {
        super._init(0.0, _('Quran Player'));
        
        this._extension = extension;
        this._settings = extension.getSettings();
        
        // Initialize data
        this._surahs = loadSurahs(extension);
        this._reciters = loadReciters(extension);
        this._juzData = initializeJuzData(extension);
        
        // Log data status
        log('Quran Player: Loaded ' + this._surahs.length + ' surahs');
        log('Quran Player: Loaded ' + this._juzData.length + ' juz entries');
        log('Quran Player: Loaded ' + this._reciters.length + ' reciters');
        
        // If juz data is still empty, try debug loading
        if (this._juzData.length === 0) {
            this._juzData = debugJuzLoading(extension);
            log('Quran Player: Debug loaded ' + this._juzData.length + ' juz entries');
        }
        
        // Create panel icon and label container
        this._panelBox = new St.BoxLayout({
            style_class: 'panel-status-menu-box'
        });
        
        let icon = new St.Icon({
            icon_name: 'audio-headphones-symbolic',
            style_class: 'system-status-icon',
        });
        
        // Add label for currently playing surah or juz
        this._panelLabel = new St.Label({
            text: '',
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'quran-panel-label'
        });
        
        this._panelBox.add_child(icon);
        this._panelBox.add_child(this._panelLabel);
        
        this.add_child(this._panelBox);
        
        // Initialize player state
        this._player = null;
        this._currentItem = null; // Will hold either surah or juz
        this._isPlaying = false;
        this._selectedReciter = this._reciters.length > 0 ? this._reciters[0] : null;
        this._isJuzMode = false; // Track if we're in juz mode
        
        // Load saved settings
        this._loadSettings();
        
        // Create player UI
        this._createPlayerUI();
        
        // Create menu items based on mode
        this._rebuildContentMenu();
        
        // Add settings menu
        this._addSettingsMenu();
        
        // Connect button event handlers
        this._connectSignals();
    }
    _loadSettings() {
        // Make sure reciters array is not empty
        if (this._reciters.length === 0) {
            // Add fallback reciter if array is empty
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
        
        // Try to load reciter from settings
        const reciterId = this._settings.get_string('selected-reciter');
        if (reciterId) {
            // Find reciter by name (using name as ID)
            const foundReciter = this._reciters.find(r => r.name === reciterId);
            if (foundReciter) {
                this._selectedReciter = foundReciter;
                // Set juz mode based on reciter type
                this._isJuzMode = isJuzBasedReciter(foundReciter);
            } else {
                // Default to first reciter if saved one not found
                this._selectedReciter = this._reciters[0];
                this._isJuzMode = isJuzBasedReciter(this._selectedReciter);
            }
        } else {
            // Default to first reciter if none saved
            this._selectedReciter = this._reciters[0];
            this._isJuzMode = isJuzBasedReciter(this._selectedReciter);
        }
    }
    
    _rebuildContentMenu() {
        // Remove existing surah or juz groups
        let items = this.menu._getMenuItems();
        
        // Find where our content starts and ends (after player controls and before settings)
        let contentStartIndex = -1;
        let contentEndIndex = -1;
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item instanceof PopupMenu.PopupSeparatorMenuItem) {
                if (contentStartIndex === -1) {
                    contentStartIndex = i + 1;
                } else if (contentEndIndex === -1) {
                    contentEndIndex = i;
                    break;
                }
            }
        }
        
        // If we found our section, remove those items
        if (contentStartIndex !== -1 && contentEndIndex !== -1) {
            for (let i = contentEndIndex - 1; i >= contentStartIndex; i--) {
                let item = this.menu._getMenuItems()[i];
                if (item) {
                    item.destroy();
                }
            }
        }
        
        // Add new content based on current mode
        if (this._isJuzMode) {
            this._addJuzGroups();
        } else {
            this._addSurahGroups();
        }
    }
    
    _createPlayerUI() {
        // Main player container
        this._playerBox = new St.BoxLayout({
            vertical: true,
            style_class: 'quran-player-box'
        });
        
        // Now playing label
        this._nowPlayingLabel = new St.Label({
            text: _('Quran Player'),
            style_class: 'quran-now-playing',
            x_align: Clutter.ActorAlign.CENTER
        });
        
        // Controls container
        this._controlsBox = new St.BoxLayout({
            style_class: 'quran-controls-box'
        });
        
        // Control buttons
        this._prevButton = new St.Button({
            style_class: 'quran-control-button',
            child: new St.Icon({
                icon_name: 'media-skip-backward-symbolic',
                icon_size: 16
            })
        });
        
        this._playButton = new St.Button({
            style_class: 'quran-control-button',
            child: new St.Icon({
                icon_name: 'media-playback-start-symbolic', 
                icon_size: 16
            })
        });
        
        this._stopButton = new St.Button({
            style_class: 'quran-control-button',
            child: new St.Icon({
                icon_name: 'media-playback-stop-symbolic',
                icon_size: 16
            })
        });
        
        this._nextButton = new St.Button({
            style_class: 'quran-control-button',
            child: new St.Icon({
                icon_name: 'media-skip-forward-symbolic',
                icon_size: 16
            })
        });
        
        // Add buttons to controls box
        this._controlsBox.add_child(this._prevButton);
        this._controlsBox.add_child(this._playButton);
        this._controlsBox.add_child(this._stopButton);
        this._controlsBox.add_child(this._nextButton);
        
        // Add elements to player box
        this._playerBox.add_child(this._nowPlayingLabel);
        this._playerBox.add_child(this._controlsBox);
        
        // Add player to menu
        let playerItem = new PopupMenu.PopupBaseMenuItem({
            reactive: false,
            can_focus: false
        });
        playerItem.add_child(this._playerBox);
        this.menu.addMenuItem(playerItem);
        
        // Add separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    }
    
    _connectSignals() {
        this._playButton.connect('clicked', () => {
            this._togglePlay();
        });
        
        this._stopButton.connect('clicked', () => {
            this._stopPlayback();
        });
        
        this._prevButton.connect('clicked', () => {
            this._playPrevious();
        });
        
        this._nextButton.connect('clicked', () => {
            this._playNext();
        });
    }        
    
    _addSurahGroups() {
        // Group surahs in sets of 15
        const groupSize = 15;
        const groupCount = Math.ceil(this._surahs.length / groupSize);
        
        for (let i = 0; i < groupCount; i++) {
            const startIdx = i * groupSize;
            const endIdx = Math.min(startIdx + groupSize, this._surahs.length);
            
            // Format group label like "1-15", "16-30", etc.
            const firstId = this._surahs[startIdx].id;
            const lastId = this._surahs[endIdx-1].id;
            const groupLabel = `${firstId}-${lastId}`;
            
            // Create submenu for this group
            let subMenu = new PopupMenu.PopupSubMenuMenuItem(groupLabel);
            
            // Add surahs to this group's submenu
            for (let j = startIdx; j < endIdx; j++) {
                const surah = this._surahs[j];
                let item = new PopupMenu.PopupMenuItem(`${surah.id}. ${surah.name}`);
                
                // Play surah when clicked
                item.connect('activate', () => {
                    this._playSurah(surah);
                });
                
                subMenu.menu.addMenuItem(item);
            }
            
            this.menu.addMenuItem(subMenu);
        }
    }

    _addJuzGroups() {
        // Check if we have juz data
        if (!this._juzData || this._juzData.length === 0) {
            // Try loading directly one more time
            this._juzData = initializeJuzData(this._extension);
            
            // If still no data, show a message
            if (!this._juzData || this._juzData.length === 0) {
                this._log("No Juz data available, please check juz.json file");
                let noDataItem = new PopupMenu.PopupMenuItem(_('No Juz data available'));
                noDataItem.setSensitive(false);
                this.menu.addMenuItem(noDataItem);
                return;
            }
        }
    
        // Group juz in sets of 5 (1-5, 6-10, etc)
        const groupSize = 5;
        const groupCount = Math.ceil(this._juzData.length / groupSize);
        
        for (let i = 0; i < groupCount; i++) {
            const startIdx = i * groupSize;
            const endIdx = Math.min(startIdx + groupSize, this._juzData.length);
            
            // Format group label like "Juz 1-5", "Juz 6-10", etc.
            const firstId = this._juzData[startIdx].id;
            const lastId = this._juzData[endIdx-1].id;
            const groupLabel = `Cüz ${firstId}-${lastId}`;
            
            // Create submenu for this group
            let subMenu = new PopupMenu.PopupSubMenuMenuItem(groupLabel);
            
            // Add juz to this group's submenu
            for (let j = startIdx; j < endIdx; j++) {
                const juz = this._juzData[j];
                let item = new PopupMenu.PopupMenuItem(juz.name);
                
                // Play juz when clicked
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
        
        // Reciter selection submenu
        let reciterMenu = new PopupMenu.PopupSubMenuMenuItem(_('Reciter'));
        
        // Add reciters to submenu
        if (this._reciters && this._reciters.length > 0) {
            this._reciters.forEach(reciter => {
                if (!reciter || !reciter.name) return; // Skip invalid reciters
                
                // Add badge to indicate juz-based reciters
                const isJuzReciter = isJuzBasedReciter(reciter);
                let displayName = reciter.name;
                if (isJuzReciter) {
                    displayName = `${displayName} [Cüz]`;
                }
                
                let item = new PopupMenu.PopupMenuItem(displayName);
                
                // Mark selected reciter
                if (this._selectedReciter && this._selectedReciter.name === reciter.name) {
                    item.setOrnament(PopupMenu.Ornament.DOT);
                }
                
                // Safer reciter change handler
                item.connect('activate', () => {
                    try {
                        // First stop any current playback
                        this._stopPlayback();
                        
                        // Change reciter
                        this._selectedReciter = {...reciter}; // Create a copy to avoid reference issues
                        
                        // Update juz mode based on reciter type
                        const wasJuzMode = this._isJuzMode;
                        this._isJuzMode = isJuzBasedReciter(reciter);
                        
                        // Rebuild menu if mode changed
                        if (wasJuzMode !== this._isJuzMode) {
                            this._rebuildContentMenu();
                        }
                        
                        // Save to settings
                        if (this._settings) {
                            try {
                                this._settings.set_string('selected-reciter', reciter.name);
                            } catch (settingsError) {
                                this._log(`Settings error: ${settingsError.message}`);
                            }
                        }
                        
                        // Update UI without full rebuild
                        this._updateReciterSelection();
                        
                        // Update now playing label if needed
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
            // Add a placeholder item if no reciters are available
            let placeholderItem = new PopupMenu.PopupMenuItem(_('No reciters available'));
            placeholderItem.setSensitive(false);
            reciterMenu.menu.addMenuItem(placeholderItem);
        }
        
        this.menu.addMenuItem(reciterMenu);
        
        // Settings button
        let settingsItem = new PopupMenu.PopupMenuItem(_('Settings'));
        settingsItem.connect('activate', () => {
            try {
                ExtensionUtils.openPrefs();
            } catch (e) {
                this._log(`Error opening preferences: ${e.message}`);
            }
        });
        this.menu.addMenuItem(settingsItem);
    }

    // Helper function to update reciter selection UI
    _updateReciterSelection() {
        // Update ornaments in the reciter menu without rebuilding everything
        try {
            // Find the reciter menu
            const reciterMenuItem = this.menu._getMenuItems().find(item => 
                item instanceof PopupMenu.PopupSubMenuMenuItem && 
                item.label.text === _('Reciter')
            );
            
            if (reciterMenuItem) {
                // Update ornaments
                reciterMenuItem.menu._getMenuItems().forEach(item => {
                    if (item instanceof PopupMenu.PopupMenuItem) {
                        // Extract reciter name by removing the [Cüz] badge if present
                        const displayName = item.label.text;
                        const reciterName = displayName.replace(' [Cüz]', '');
                        
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
        // Skip notifications if disabled or if settings aren't available
        if (!this._settings || !this._settings.get_boolean('show-notifications')) {
            return;
        }
        
        try {
            // Simple notification without using complex objects
            Main.notify(title, body);
        } catch (e) {
            // Log the error but don't crash
            log(`[Quran Player] Notification error: ${e.message}`);
        }
    }
    
    _playSurah(surah) {
        if (!surah) {
            this._log("Invalid surah object");
            return;
        }
        
        // We're playing a surah now
        this._currentItem = { ...surah, type: 'surah' };
        
        // Stop previous playback if any
        if (this._player) {
            try {
                this._player.set_state(Gst.State.NULL);
                this._player = null;
            } catch (e) {
                this._log(`Error stopping previous playback: ${e.message}`);
            }
        }
        
        // Ensure we have a valid reciter
        if (!this._selectedReciter && this._reciters.length > 0) {
            this._selectedReciter = this._reciters[0];
        } else if (!this._selectedReciter) {
            // Create a default reciter if none available
            this._selectedReciter = {
                "name": "Mustafa Ismail",
                "baseUrl": "https://download.quranicaudio.com/quran/mostafa_ismaeel/",
                "audioFormat": "%id%.mp3",
                "type": "surah"
            };
        }
        
        // Generate audio URL based on reciter configuration
        let audioUrl;
        
        // Get the 3-digit padded surah ID (e.g., 001, 036, 114)
        const paddedId = surah.id.toString().padStart(3, '0');
        
        // Use the audioId from the surah if available, otherwise use padded ID
        const audioId = surah.audioId || paddedId;
        
        try {
            // Build URL using reciter's format
            audioUrl = `${this._selectedReciter.baseUrl}${this._selectedReciter.audioFormat}`
                .replace(/%id%/g, paddedId)
                .replace(/%audioId%/g, audioId)
                .replace(/%name%/g, surah.name);
                
            this._log(`Playing surah: ${surah.name}, URL: ${audioUrl}`);
        } catch (urlError) {
            this._log(`Error creating audio URL: ${urlError.message}`);
            return;
        }
        
        this._playAudio(audioUrl, `Now playing: ${surah.name}`, `Reciter: ${this._selectedReciter ? this._selectedReciter.name : "Unknown"}`);
    }
    
    _playJuz(juz) {
        if (!juz) {
            this._log("Invalid juz object");
            return;
        }
        
        // We're playing a juz now
        this._currentItem = { ...juz, type: 'juz' };
        
        // Stop previous playback if any
        if (this._player) {
            try {
                this._player.set_state(Gst.State.NULL);
                this._player = null;
            } catch (e) {
                this._log(`Error stopping previous playback: ${e.message}`);
            }
        }
        
        // Ensure we have a valid reciter
        if (!this._selectedReciter && this._reciters.length > 0) {
            this._selectedReciter = this._reciters.find(r => isJuzBasedReciter(r)) || this._reciters[0];
        } else if (!this._selectedReciter) {
            // Create a default juz reciter if none available
            this._selectedReciter = {
                "name": "Hayri Küçükdeniz-Suat Yıldırım Meali",
                "baseUrl": "https://archive.org/download/Kurani.Kerim.Meali.30.cuz.Prof.Dr.SuatYildirim/",
                "audioFormat": "%id%Cuz.mp3",
                "type": "juz"
            };
        }
        
        // Generate audio URL based on reciter configuration
        let audioUrl;
        
        // Use padded ID for juz (01, 02, ..., 30)
        const paddedId = juz.id.toString().padStart(2, '0');
        
        // Use the audioId from the juz if available, otherwise use padded ID
        const audioId = juz.audioId || paddedId;
        
        try {
            // Check if this reciter has special format handling
            if (this._selectedReciter.hasSpecialFormat && this._selectedReciter.formatMap) {
                // Use special format map for this reciter
                if (this._selectedReciter.formatMap[audioId]) {
                    const specialFormat = this._selectedReciter.formatMap[audioId];
                    audioUrl = `${this._selectedReciter.baseUrl}${specialFormat}`;
                    this._log(`Using special format for juz ${juz.id}: ${audioUrl}`);
                } else {
                    // Fallback to regular format if specific mapping not found
                    audioUrl = `${this._selectedReciter.baseUrl}${this._selectedReciter.audioFormat}`
                        .replace(/%id%/g, paddedId)
                        .replace(/%audioId%/g, audioId)
                        .replace(/%name%/g, juz.name)
                        .replace(/%specialFormat%/g, `${paddedId}Cuz.mp3`); // Default fallback
                    this._log(`Using fallback format for juz ${juz.id}: ${audioUrl}`);
                }
            } else {
                // Build URL using reciter's standard format
                audioUrl = `${this._selectedReciter.baseUrl}${this._selectedReciter.audioFormat}`
                    .replace(/%id%/g, paddedId)
                    .replace(/%audioId%/g, audioId)
                    .replace(/%name%/g, juz.name);
                this._log(`Using standard format for juz ${juz.id}: ${audioUrl}`);
            }
            
            this._log(`Playing juz: ${juz.name}, URL: ${audioUrl}`);
        } catch (urlError) {
            this._log(`Error creating audio URL: ${urlError.message}`);
            return;
        }
        
        this._playAudio(audioUrl, `Now playing: ${juz.name}`, `Reciter: ${this._selectedReciter ? this._selectedReciter.name : "Unknown"}`);
    }
    
    _playAudio(audioUrl, notificationTitle, notificationBody) {
        // Always try to use GStreamer directly to avoid opening web browser
        try {
            // Initialize GStreamer if needed
            if (!Gst.init_check(null)) {
                Gst.init(null);
            }
            
            // Create new player
            this._player = Gst.ElementFactory.make("playbin", "player");
            
            if (!this._player) {
                throw new Error("Could not create GStreamer playbin element");
            }
            
            // Configure player
            this._player.set_property("uri", audioUrl);
            
            // Set up bus for handling messages (EOS, errors, etc.)
            const bus = this._player.get_bus();
            bus.add_signal_watch();
            
            // Handle end of stream
            bus.connect('message::eos', () => {
                this._onPlaybackEnded();
            });
            
            // Handle errors
            bus.connect('message::error', (_, msg) => {
                let [error, debug] = msg.parse_error();
                this._log(`GStreamer playback error: ${error.message} (${debug})`);
                this._onPlaybackEnded();
            });
            
            // Start playback
            const stateChange = this._player.set_state(Gst.State.PLAYING);
            if (stateChange === Gst.StateChangeReturn.FAILURE) {
                throw new Error("Failed to start playback");
            }
            
            // Show notification (safely)
            try {
                if (this._settings && this._settings.get_boolean('show-notifications')) {
                    // Use a timeout to prevent blocking the UI
                    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
                        try {
                            this._showNotification(notificationTitle, notificationBody);
                        } catch (e) {
                            this._log(`Delayed notification error: ${e.message}`);
                        }
                        return GLib.SOURCE_REMOVE;
                    });
                }
            } catch (notifyError) {
                // Only log notification errors, don't let them break playback
                this._log(`Notification error: ${notifyError.message}`);
            }
        } catch (gstError) {
            this._log(`GStreamer error: ${gstError.message}`);
            
            // Fallback: Try to play using system commands, avoiding web browser if possible
            let playbackSuccess = false;
            
            try {
                // Try to download and play with mpv or similar
                GLib.spawn_command_line_async(`bash -c "curl -s '${audioUrl}' | mpv --no-terminal --no-video -"`);
                playbackSuccess = true;
            } catch (e2) {
                this._log(`curl+mpv fallback failed: ${e2.message}`);
                
                // Try direct mpv
                try {
                    GLib.spawn_command_line_async(`mpv --no-terminal --no-video '${audioUrl}'`);
                    playbackSuccess = true;
                } catch (e3) {
                    this._log(`mpv fallback failed: ${e3.message}`);
                    
                    // Last resort: xdg-open (might open browser)
                    try {
                        GLib.spawn_command_line_async(`xdg-open "${audioUrl}"`);
                        playbackSuccess = true;
                    } catch (e4) {
                        this._log(`xdg-open fallback failed: ${e4.message}`);
                        logError(e4, "Quran Player: Could not play audio file");
                        
                        // Try to show a notification about the error
                        try {
                            this._showNotification("Error", "Could not play audio file");
                        } catch (notifyError) {
                            // Ignore notification errors at this point
                        }
                        return;
                    }
                }
            }
            
            // If we reached here with a fallback method, show notification
            if (playbackSuccess) {
                try {
                    if (this._settings && this._settings.get_boolean('show-notifications')) {
                        this._showNotification(notificationTitle, 
                                               `${notificationBody} (fallback mode)`);
                    }
                } catch (e) {
                    // Ignore notification errors in fallback mode
                }
            }
        }
        
        this._isPlaying = true;
        
        // Update UI
        this._updatePlayerUI();
    }

    _log(message) {
        if (this._settings && this._settings.get_boolean('enable-debug-log')) {
            log(`[Quran Player] ${message}`);
        }
    }
    
    _togglePlay() {
        if (!this._player || !this._currentItem) {
            if (this._currentItem) {
                if (this._currentItem.type === 'surah') {
                    this._playSurah(this._currentItem);
                } else if (this._currentItem.type === 'juz') {
                    this._playJuz(this._currentItem);
                }
            }
            return;
        }
        
        try {
            if (this._isPlaying) {
                this._player.set_state(Gst.State.PAUSED);
                this._isPlaying = false;
            } else {
                this._player.set_state(Gst.State.PLAYING);
                this._isPlaying = true;
            }
            
            this._updatePlayerUI();
        } catch (e) {
            this._log(`Error toggling playback: ${e.message}`);
        }
    }
    
    _playPrevious() {
        if (!this._currentItem) return;
        
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
                this._player.set_state(Gst.State.NULL);
                this._player = null;
                this._isPlaying = false;
                this._updatePlayerUI();
            } catch (e) {
                this._log(`Error stopping playback: ${e.message}`);
            }
        }
    }
    
    _playNext() {
        if (!this._currentItem) return;
        
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
    
    _updatePlayerUI() {
        if (this._currentItem) {
            // Update player box label
            if (this._currentItem.type === 'surah') {
                this._nowPlayingLabel.text = `${this._currentItem.id}. ${this._currentItem.name}`;
            } else if (this._currentItem.type === 'juz') {
                this._nowPlayingLabel.text = this._currentItem.name;
            }
            
            // Update top panel label to show playing item and reciter
            const reciterName = this._selectedReciter ? this._selectedReciter.name : "";
            this._panelLabel.text = ` ${this._currentItem.name} - ${reciterName}`;
            
            // Update play/pause button icon
            const playIcon = this._playButton.get_child();
            if (this._isPlaying) {
                playIcon.icon_name = 'media-playback-pause-symbolic';
            } else {
                playIcon.icon_name = 'media-playback-start-symbolic';
            }
        } else {
            // Reset labels when nothing is playing
            this._nowPlayingLabel.text = _('Quran Player');
            this._panelLabel.text = '';
            this._playButton.get_child().icon_name = 'media-playback-start-symbolic';
        }
    }
    
    // Handle playback end
    _onPlaybackEnded() {
        if (!this._player) return;
        
        try {
            this._player.set_state(Gst.State.NULL);
            this._player = null;
            this._isPlaying = false;
            
            // Auto-play next if enabled
            if (this._settings.get_boolean('autoplay-next') && this._currentItem) {
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
        if (this._player) {
            try {
                this._player.set_state(Gst.State.NULL);
            } catch (e) {
                // Ignore errors during cleanup
            }
            this._player = null;
        }
        
        super.destroy();
    }
});

export default class QuranPlayerExtension extends Extension {
    enable() {
        log('Quran Player: Enabling extension');
        
        // Load settings schema
        this._settings = this.getSettings();
        
        // Create and add indicator to panel
        this._indicator = new QuranPlayerIndicator(this);
        Main.panel.addToStatusArea('quran-player', this._indicator);
        
        log('Quran Player: Extension enabled');
    }
    
    disable() {
        log('Quran Player: Disabling extension');
        
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
        this._settings = null;
        
        log('Quran Player: Extension disabled');
    }
}

// export default class QuranPlayerExtension extends Extension {
//     enable() {
//         log('Quran Player: Enabling extension');
        
//         // Load juz data directly
//         if (juzData.length === 0) {
//             log('Quran Player: No Juz data loaded, trying debug loading...');
//             juzData = debugJuzLoading();
//             log('Quran Player: Debug loaded ' + juzData.length + ' juz entries');
//         }
        
//         // Load settings schema
//         this._settings = this.getSettings();
        
//         // Create and add indicator to panel
//         this._indicator = new QuranPlayerIndicator(this);
//         Main.panel.addToStatusArea('quran-player', this._indicator);
        
//         log('Quran Player: Extension enabled');
//     }
    
//     disable() {
//         log('Quran Player: Disabling extension');
        
//         if (this._indicator) {
//             this._indicator.destroy();
//             this._indicator = null;
//         }
//         this._settings = null;
        
//         log('Quran Player: Extension disabled');
//     }
    
//     getSettings() {
//         try {
//             // Load schema
//             let gschema = Gio.SettingsSchemaSource.new_from_directory(
//                 this.path + '/schemas',
//                 Gio.SettingsSchemaSource.get_default(),
//                 false
//             );
            
//             let schema = gschema.lookup('org.gnome.shell.extensions.quran-player', true);
            
//             if (!schema) {
//                 throw new Error('Schema not found: org.gnome.shell.extensions.quran-player');
//             }
            
//             return new Gio.Settings({ settings_schema: schema });
//         } catch (e) {
//             logError(e, "Failed to get settings");
//             return null;
//         }
//     }
// }




// // Initialize globals
// let surahs = [];
// let juzData = []; 
// let RECITERS = [];

// try {
//     // Load data
//     surahs = loadSurahs();
//     RECITERS = loadReciters();
    
//     // Load Juz data with direct method to ensure it's loaded
//     juzData = initializeJuzData();
    
//     // Log data status
//     log('Quran Player: Loaded ' + surahs.length + ' surahs');
//     log('Quran Player: Loaded ' + juzData.length + ' juz entries');
//     log('Quran Player: Loaded ' + RECITERS.length + ' reciters');
// } catch (e) {
//     logError(e, 'Quran Player: Failed to load data');
//     // Default fallbacks are handled in the loading functions
// }

// const QuranPlayerIndicator = GObject.registerClass(
// class QuranPlayerIndicator extends PanelMenu.Button {
//     _init(extension) {
//         super._init(0.0, _('Quran Player'));
        
//         this._extension = extension;
//         this._settings = extension.getSettings();
        
//         // Create panel icon and label container
//         this._panelBox = new St.BoxLayout({
//             style_class: 'panel-status-menu-box'
//         });
        
//         let icon = new St.Icon({
//             icon_name: 'audio-headphones-symbolic',
//             style_class: 'system-status-icon',
//         });
        
//         // Add label for currently playing surah or juz
//         this._panelLabel = new St.Label({
//             text: '',
//             y_align: Clutter.ActorAlign.CENTER,
//             style_class: 'quran-panel-label'
//         });
        
//         this._panelBox.add_child(icon);
//         this._panelBox.add_child(this._panelLabel);
        
//         this.add_child(this._panelBox);
        
//         // Initialize player state
//         this._player = null;
//         this._currentItem = null; // Will hold either surah or juz
//         this._isPlaying = false;
//         this._selectedReciter = RECITERS.length > 0 ? RECITERS[0] : null;
//         this._isJuzMode = false; // Track if we're in juz mode
        
//         // Reload Juz data to make sure it's available
//         if (juzData.length === 0) {
//             juzData = initializeJuzData();
//             log('Quran Player: Reloaded Juz data, now have ' + juzData.length + ' entries');
//         }
        
//         // Load saved settings
//         this._loadSettings();
        
//         // Create player UI
//         this._createPlayerUI();
        
//         // Create menu items based on mode
//         this._rebuildContentMenu();
        
//         // Add settings menu
//         this._addSettingsMenu();
        
//         // Connect button event handlers
//         this._connectSignals();
//     }
    
//     _loadSettings() {
//         // Make sure RECITERS array is not empty
//         if (RECITERS.length === 0) {
//             // Add fallback reciter if array is empty
//             RECITERS.push({
//                 "name": "Mustafa Ismail",
//                 "baseUrl": "https://download.quranicaudio.com/quran/mostafa_ismaeel/",
//                 "audioFormat": "%id%.mp3",
//                 "type": "surah"
//             });
//             this._selectedReciter = RECITERS[0];
//             this._isJuzMode = false;
//             return;
//         }
        
//         // Try to load reciter from settings
//         const reciterId = this._settings.get_string('selected-reciter');
//         if (reciterId) {
//             // Find reciter by name (using name as ID)
//             const foundReciter = RECITERS.find(r => r.name === reciterId);
//             if (foundReciter) {
//                 this._selectedReciter = foundReciter;
//                 // Set juz mode based on reciter type
//                 this._isJuzMode = isJuzBasedReciter(foundReciter);
//             } else {
//                 // Default to first reciter if saved one not found
//                 this._selectedReciter = RECITERS[0];
//                 this._isJuzMode = isJuzBasedReciter(this._selectedReciter);
//             }
//         } else {
//             // Default to first reciter if none saved
//             this._selectedReciter = RECITERS[0];
//             this._isJuzMode = isJuzBasedReciter(this._selectedReciter);
//         }
//     }
    
//     _rebuildContentMenu() {
//         // Remove existing surah or juz groups
//         let items = this.menu._getMenuItems();
        
//         // Find where our content starts and ends (after player controls and before settings)
//         let contentStartIndex = -1;
//         let contentEndIndex = -1;
        
//         for (let i = 0; i < items.length; i++) {
//             const item = items[i];
//             if (item instanceof PopupMenu.PopupSeparatorMenuItem) {
//                 if (contentStartIndex === -1) {
//                     contentStartIndex = i + 1;
//                 } else if (contentEndIndex === -1) {
//                     contentEndIndex = i;
//                     break;
//                 }
//             }
//         }
        
//         // If we found our section, remove those items
//         if (contentStartIndex !== -1 && contentEndIndex !== -1) {
//             for (let i = contentEndIndex - 1; i >= contentStartIndex; i--) {
//                 let item = this.menu._getMenuItems()[i];
//                 if (item) {
//                     item.destroy();
//                 }
//             }
//         }
        
//         // Add new content based on current mode
//         if (this._isJuzMode) {
//             this._addJuzGroups();
//         } else {
//             this._addSurahGroups();
//         }
//     }
    
//     _createPlayerUI() {
//         // Main player container
//         this._playerBox = new St.BoxLayout({
//             vertical: true,
//             style_class: 'quran-player-box'
//         });
        
//         // Now playing label
//         this._nowPlayingLabel = new St.Label({
//             text: _('Quran Player'),
//             style_class: 'quran-now-playing',
//             x_align: Clutter.ActorAlign.CENTER
//         });
        
//         // Controls container
//         this._controlsBox = new St.BoxLayout({
//             style_class: 'quran-controls-box'
//         });
        
//         // Control buttons
//         this._prevButton = new St.Button({
//             style_class: 'quran-control-button',
//             child: new St.Icon({
//                 icon_name: 'media-skip-backward-symbolic',
//                 icon_size: 16
//             })
//         });
        
//         this._playButton = new St.Button({
//             style_class: 'quran-control-button',
//             child: new St.Icon({
//                 icon_name: 'media-playback-start-symbolic', 
//                 icon_size: 16
//             })
//         });
        
//         this._stopButton = new St.Button({
//             style_class: 'quran-control-button',
//             child: new St.Icon({
//                 icon_name: 'media-playback-stop-symbolic',
//                 icon_size: 16
//             })
//         });
        
//         this._nextButton = new St.Button({
//             style_class: 'quran-control-button',
//             child: new St.Icon({
//                 icon_name: 'media-skip-forward-symbolic',
//                 icon_size: 16
//             })
//         });
        
//         // Add buttons to controls box
//         this._controlsBox.add_child(this._prevButton);
//         this._controlsBox.add_child(this._playButton);
//         this._controlsBox.add_child(this._stopButton);
//         this._controlsBox.add_child(this._nextButton);
        
//         // Add elements to player box
//         this._playerBox.add_child(this._nowPlayingLabel);
//         this._playerBox.add_child(this._controlsBox);
        
//         // Add player to menu
//         let playerItem = new PopupMenu.PopupBaseMenuItem({
//             reactive: false,
//             can_focus: false
//         });
//         playerItem.add_child(this._playerBox);
//         this.menu.addMenuItem(playerItem);
        
//         // Add separator
//         this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
//     }
    
//     _connectSignals() {
//         this._playButton.connect('clicked', () => {
//             this._togglePlay();
//         });
        
//         this._stopButton.connect('clicked', () => {
//             this._stopPlayback();
//         });
        
//         this._prevButton.connect('clicked', () => {
//             this._playPrevious();
//         });
        
//         this._nextButton.connect('clicked', () => {
//             this._playNext();
//         });
//     }        
    
//     _addSurahGroups() {
//         // Group surahs in sets of 15
//         const groupSize = 15;
//         const groupCount = Math.ceil(surahs.length / groupSize);
        
//         for (let i = 0; i < groupCount; i++) {
//             const startIdx = i * groupSize;
//             const endIdx = Math.min(startIdx + groupSize, surahs.length);
            
//             // Format group label like "1-15", "16-30", etc.
//             const firstId = surahs[startIdx].id;
//             const lastId = surahs[endIdx-1].id;
//             const groupLabel = `${firstId}-${lastId}`;
            
//             // Create submenu for this group
//             let subMenu = new PopupMenu.PopupSubMenuMenuItem(groupLabel);
            
//             // Add surahs to this group's submenu
//             for (let j = startIdx; j < endIdx; j++) {
//                 const surah = surahs[j];
//                 let item = new PopupMenu.PopupMenuItem(`${surah.id}. ${surah.name}`);
                
//                 // Play surah when clicked
//                 item.connect('activate', () => {
//                     this._playSurah(surah);
//                 });
                
//                 subMenu.menu.addMenuItem(item);
//             }
            
//             this.menu.addMenuItem(subMenu);
//         }
//     }

//     _addJuzGroups() {
//         // Check if we have juz data
//         if (!juzData || juzData.length === 0) {
//             // Try loading directly one more time
//             juzData = initializeJuzData();
            
//             // If still no data, show a message
//             if (!juzData || juzData.length === 0) {
//                 this._log("No Juz data available, please check juz.json file");
//                 let noDataItem = new PopupMenu.PopupMenuItem(_('No Juz data available'));
//                 noDataItem.setSensitive(false);
//                 this.menu.addMenuItem(noDataItem);
//                 return;
//             }
//         }
    
//         // Group juz in sets of 5 (1-5, 6-10, etc)
//         const groupSize = 5;
//         const groupCount = Math.ceil(juzData.length / groupSize);
        
//         for (let i = 0; i < groupCount; i++) {
//             const startIdx = i * groupSize;
//             const endIdx = Math.min(startIdx + groupSize, juzData.length);
            
//             // Format group label like "Juz 1-5", "Juz 6-10", etc.
//             const firstId = juzData[startIdx].id;
//             const lastId = juzData[endIdx-1].id;
//             const groupLabel = `Cüz ${firstId}-${lastId}`;
            
//             // Create submenu for this group
//             let subMenu = new PopupMenu.PopupSubMenuMenuItem(groupLabel);
            
//             // Add juz to this group's submenu
//             for (let j = startIdx; j < endIdx; j++) {
//                 const juz = juzData[j];
//                 let item = new PopupMenu.PopupMenuItem(juz.name);
                
//                 // Play juz when clicked
//                 item.connect('activate', () => {
//                     this._playJuz(juz);
//                 });
                
//                 subMenu.menu.addMenuItem(item);
//             }
            
//             this.menu.addMenuItem(subMenu);
//         }
//     }
        
//     _addSettingsMenu() {
//         this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
//         // Reciter selection submenu
//         let reciterMenu = new PopupMenu.PopupSubMenuMenuItem(_('Reciter'));
        
//         // Add reciters to submenu
//         if (RECITERS && RECITERS.length > 0) {
//             RECITERS.forEach(reciter => {
//                 if (!reciter || !reciter.name) return; // Skip invalid reciters
                
//                 // Add badge to indicate juz-based reciters
//                 const isJuzReciter = isJuzBasedReciter(reciter);
//                 let displayName = reciter.name;
//                 if (isJuzReciter) {
//                     displayName = `${displayName} [Cüz]`;
//                 }
                
//                 let item = new PopupMenu.PopupMenuItem(displayName);
                
//                 // Mark selected reciter
//                 if (this._selectedReciter && this._selectedReciter.name === reciter.name) {
//                     item.setOrnament(PopupMenu.Ornament.DOT);
//                 }
                
//                 // Safer reciter change handler
//                 item.connect('activate', () => {
//                     try {
//                         // First stop any current playback
//                         this._stopPlayback();
                        
//                         // Change reciter
//                         this._selectedReciter = {...reciter}; // Create a copy to avoid reference issues
                        
//                         // Update juz mode based on reciter type
//                         const wasJuzMode = this._isJuzMode;
//                         this._isJuzMode = isJuzBasedReciter(reciter);
                        
//                         // Rebuild menu if mode changed
//                         if (wasJuzMode !== this._isJuzMode) {
//                             this._rebuildContentMenu();
//                         }
                        
//                         // Save to settings
//                         if (this._settings) {
//                             try {
//                                 this._settings.set_string('selected-reciter', reciter.name);
//                             } catch (settingsError) {
//                                 this._log(`Settings error: ${settingsError.message}`);
//                             }
//                         }
                        
//                         // Update UI without full rebuild
//                         this._updateReciterSelection();
                        
//                         // Update now playing label if needed
//                         if (this._currentItem) {
//                             this._updatePlayerUI();
//                         }
//                     } catch (e) {
//                         this._log(`Error changing reciter: ${e.message}`);
//                     }
//                 });
                
//                 reciterMenu.menu.addMenuItem(item);
//             });
//         } else {
//             // Add a placeholder item if no reciters are available
//             let placeholderItem = new PopupMenu.PopupMenuItem(_('No reciters available'));
//             placeholderItem.setSensitive(false);
//             reciterMenu.menu.addMenuItem(placeholderItem);
//         }
        
//         this.menu.addMenuItem(reciterMenu);
        
//         // Settings button
//         let settingsItem = new PopupMenu.PopupMenuItem(_('Settings'));
//         settingsItem.connect('activate', () => {
//             try {
//                 ExtensionUtils.openPrefs();
//             } catch (e) {
//                 this._log(`Error opening preferences: ${e.message}`);
//             }
//         });
//         this.menu.addMenuItem(settingsItem);
//     }

//     // Helper function to update reciter selection UI
//     _updateReciterSelection() {
//         // Update ornaments in the reciter menu without rebuilding everything
//         try {
//             // Find the reciter menu
//             const reciterMenuItem = this.menu._getMenuItems().find(item => 
//                 item instanceof PopupMenu.PopupSubMenuMenuItem && 
//                 item.label.text === _('Reciter')
//             );
            
//             if (reciterMenuItem) {
//                 // Update ornaments
//                 reciterMenuItem.menu._getMenuItems().forEach(item => {
//                     if (item instanceof PopupMenu.PopupMenuItem) {
//                         // Extract reciter name by removing the [Cüz] badge if present
//                         const displayName = item.label.text;
//                         const reciterName = displayName.replace(' [Cüz]', '');
                        
//                         const isSelected = this._selectedReciter && 
//                                         reciterName === this._selectedReciter.name;
//                         item.setOrnament(isSelected ? PopupMenu.Ornament.DOT : PopupMenu.Ornament.NONE);
//                     }
//                 });
//             }
//         } catch (e) {
//             this._log(`Error updating reciter selection: ${e.message}`);
//         }
//     }

//     _showNotification(title, body) {
//         // Skip notifications if disabled or if settings aren't available
//         if (!this._settings || !this._settings.get_boolean('show-notifications')) {
//             return;
//         }
        
//         try {
//             // Simple notification without using complex objects
//             Main.notify(title, body);
//         } catch (e) {
//             // Log the error but don't crash
//             log(`[Quran Player] Notification error: ${e.message}`);
//         }
//     }
    
//     _playSurah(surah) {
//         if (!surah) {
//             this._log("Invalid surah object");
//             return;
//         }
        
//         // We're playing a surah now
//         this._currentItem = { ...surah, type: 'surah' };
        
//         // Stop previous playback if any
//         if (this._player) {
//             try {
//                 this._player.set_state(Gst.State.NULL);
//                 this._player = null;
//             } catch (e) {
//                 this._log(`Error stopping previous playback: ${e.message}`);
//             }
//         }
        
//         // Ensure we have a valid reciter
//         if (!this._selectedReciter && RECITERS.length > 0) {
//             this._selectedReciter = RECITERS[0];
//         } else if (!this._selectedReciter) {
//             // Create a default reciter if none available
//             this._selectedReciter = {
//                 "name": "Mustafa Ismail",
//                 "baseUrl": "https://download.quranicaudio.com/quran/mostafa_ismaeel/",
//                 "audioFormat": "%id%.mp3",
//                 "type": "surah"
//             };
//         }
        
//         // Generate audio URL based on reciter configuration
//         let audioUrl;
        
//         // Get the 3-digit padded surah ID (e.g., 001, 036, 114)
//         const paddedId = surah.id.toString().padStart(3, '0');
        
//         // Use the audioId from the surah if available, otherwise use padded ID
//         const audioId = surah.audioId || paddedId;
        
//         try {
//             // Build URL using reciter's format
//             audioUrl = `${this._selectedReciter.baseUrl}${this._selectedReciter.audioFormat}`
//                 .replace(/%id%/g, paddedId)
//                 .replace(/%audioId%/g, audioId)
//                 .replace(/%name%/g, surah.name);
                
//             this._log(`Playing surah: ${surah.name}, URL: ${audioUrl}`);
//         } catch (urlError) {
//             this._log(`Error creating audio URL: ${urlError.message}`);
//             return;
//         }
        
//         this._playAudio(audioUrl, `Now playing: ${surah.name}`, `Reciter: ${this._selectedReciter ? this._selectedReciter.name : "Unknown"}`);
//     }
    
//     _playJuz(juz) {
//         if (!juz) {
//             this._log("Invalid juz object");
//             return;
//         }
        
//         // We're playing a juz now
//         this._currentItem = { ...juz, type: 'juz' };
        
//         // Stop previous playback if any
//         if (this._player) {
//             try {
//                 this._player.set_state(Gst.State.NULL);
//                 this._player = null;
//             } catch (e) {
//                 this._log(`Error stopping previous playback: ${e.message}`);
//             }
//         }
        
//         // Ensure we have a valid reciter
//         if (!this._selectedReciter && RECITERS.length > 0) {
//             this._selectedReciter = RECITERS.find(r => isJuzBasedReciter(r)) || RECITERS[0];
//         } else if (!this._selectedReciter) {
//             // Create a default juz reciter if none available
//             this._selectedReciter = {
//                 "name": "Hayri Küçükdeniz-Suat Yıldırım Meali-Cüz",
//                 "baseUrl": "https://archive.org/download/Kurani.Kerim.Meali.30.cuz.Prof.Dr.SuatYildirim/",
//                 "audioFormat": "%id%cuz.mp3",
//                 "type": "juz"
//             };
//         }
        
//         // Generate audio URL based on reciter configuration
//         let audioUrl;
        
//         // Use padded ID for juz (01, 02, ..., 30)
//         const paddedId = juz.id.toString().padStart(2, '0');
        
//         // Use the audioId from the juz if available, otherwise use padded ID
//         const audioId = juz.audioId || paddedId;
        
//         try {
//             // Build URL using reciter's format
//             audioUrl = `${this._selectedReciter.baseUrl}${this._selectedReciter.audioFormat}`
//                 .replace(/%id%/g, paddedId)
//                 .replace(/%audioId%/g, audioId)
//                 .replace(/%name%/g, juz.name);
                
//             this._log(`Playing juz: ${juz.name}, URL: ${audioUrl}`);
//         } catch (urlError) {
//             this._log(`Error creating audio URL: ${urlError.message}`);
//             return;
//         }
        
//         this._playAudio(audioUrl, `Now playing: ${juz.name}`, `Reciter: ${this._selectedReciter ? this._selectedReciter.name : "Unknown"}`);
//     }
    
//     _playAudio(audioUrl, notificationTitle, notificationBody) {
//         // Always try to use GStreamer directly to avoid opening web browser
//         try {
//             // Initialize GStreamer if needed
//             if (!Gst.init_check(null)) {
//                 Gst.init(null);
//             }
            
//             // Create new player
//             this._player = Gst.ElementFactory.make("playbin", "player");
            
//             if (!this._player) {
//                 throw new Error("Could not create GStreamer playbin element");
//             }
            
//             // Configure player
//             this._player.set_property("uri", audioUrl);
            
//             // Set up bus for handling messages (EOS, errors, etc.)
//             const bus = this._player.get_bus();
//             bus.add_signal_watch();
            
//             // Handle end of stream
//             bus.connect('message::eos', () => {
//                 this._onPlaybackEnded();
//             });
            
//             // Handle errors
//             bus.connect('message::error', (_, msg) => {
//                 let [error, debug] = msg.parse_error();
//                 this._log(`GStreamer playback error: ${error.message} (${debug})`);
//                 this._onPlaybackEnded();
//             });
            
//             // Start playback
//             const stateChange = this._player.set_state(Gst.State.PLAYING);
//             if (stateChange === Gst.StateChangeReturn.FAILURE) {
//                 throw new Error("Failed to start playback");
//             }
            
//             // Show notification (safely)
//             try {
//                 if (this._settings && this._settings.get_boolean('show-notifications')) {
//                     // Use a timeout to prevent blocking the UI
//                     GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
//                         try {
//                             this._showNotification(notificationTitle, notificationBody);
//                         } catch (e) {
//                             this._log(`Delayed notification error: ${e.message}`);
//                         }
//                         return GLib.SOURCE_REMOVE;
//                     });
//                 }
//             } catch (notifyError) {
//                 // Only log notification errors, don't let them break playback
//                 this._log(`Notification error: ${notifyError.message}`);
//             }
//         } catch (gstError) {
//             this._log(`GStreamer error: ${gstError.message}`);
            
//             // Fallback: Try to play using system commands, avoiding web browser if possible
//             let playbackSuccess = false;
            
//             try {
//                 // Try to download and play with mpv or similar
//                 GLib.spawn_command_line_async(`bash -c "curl -s '${audioUrl}' | mpv --no-terminal --no-video -"`);
//                 playbackSuccess = true;
//             } catch (e2) {
//                 this._log(`curl+mpv fallback failed: ${e2.message}`);
                
//                 // Try direct mpv
//                 try {
//                     GLib.spawn_command_line_async(`mpv --no-terminal --no-video '${audioUrl}'`);
//                     playbackSuccess = true;
//                 } catch (e3) {
//                     this._log(`mpv fallback failed: ${e3.message}`);
                    
//                     // Last resort: xdg-open (might open browser)
//                     try {
//                         GLib.spawn_command_line_async(`xdg-open "${audioUrl}"`);
//                         playbackSuccess = true;
//                     } catch (e4) {
//                         this._log(`xdg-open fallback failed: ${e4.message}`);
//                         logError(e4, "Quran Player: Could not play audio file");
                        
//                         // Try to show a notification about the error
//                         try {
//                             this._showNotification("Error", "Could not play audio file");
//                         } catch (notifyError) {
//                             // Ignore notification errors at this point
//                         }
//                         return;
//                     }
//                 }
//             }
            
//             // If we reached here with a fallback method, show notification
//             if (playbackSuccess) {
//                 try {
//                     if (this._settings && this._settings.get_boolean('show-notifications')) {
//                         this._showNotification(notificationTitle, 
//                                                `${notificationBody} (fallback mode)`);
//                     }
//                 } catch (e) {
//                     // Ignore notification errors in fallback mode
//                 }
//             }
//         }
        
//         this._isPlaying = true;
        
//         // Update UI
//         this._updatePlayerUI();
//     }

//     _log(message) {
//         if (this._settings && this._settings.get_boolean('enable-debug-log')) {
//             log(`[Quran Player] ${message}`);
//         }
//     }
    
//     _togglePlay() {
//         if (!this._player || !this._currentItem) {
//             if (this._currentItem) {
//                 if (this._currentItem.type === 'surah') {
//                     this._playSurah(this._currentItem);
//                 } else if (this._currentItem.type === 'juz') {
//                     this._playJuz(this._currentItem);
//                 }
//             }
//             return;
//         }
        
//         try {
//             if (this._isPlaying) {
//                 this._player.set_state(Gst.State.PAUSED);
//                 this._isPlaying = false;
//             } else {
//                 this._player.set_state(Gst.State.PLAYING);
//                 this._isPlaying = true;
//             }
            
//             this._updatePlayerUI();
//         } catch (e) {
//             this._log(`Error toggling playback: ${e.message}`);
//         }
//     }
    
//     _playPrevious() {
//         if (!this._currentItem) return;
        
//         if (this._currentItem.type === 'surah') {
//             const currentIndex = surahs.findIndex(s => s.id === this._currentItem.id);
//             if (currentIndex > 0) {
//                 const prevSurah = surahs[currentIndex - 1];
//                 this._playSurah(prevSurah);
//             }
//         } else if (this._currentItem.type === 'juz') {
//             const currentIndex = juzData.findIndex(j => j.id === this._currentItem.id);
//             if (currentIndex > 0) {
//                 const prevJuz = juzData[currentIndex - 1];
//                 this._playJuz(prevJuz);
//             }
//         }
//     }
    
//     _stopPlayback() {
//         if (this._player) {
//             try {
//                 this._player.set_state(Gst.State.NULL);
//                 this._player = null;
//                 this._isPlaying = false;
//                 this._updatePlayerUI();
//             } catch (e) {
//                 this._log(`Error stopping playback: ${e.message}`);
//             }
//         }
//     }
    
//     _playNext() {
//         if (!this._currentItem) return;
        
//         if (this._currentItem.type === 'surah') {
//             const currentIndex = surahs.findIndex(s => s.id === this._currentItem.id);
//             if (currentIndex < surahs.length - 1) {
//                 const nextSurah = surahs[currentIndex + 1];
//                 this._playSurah(nextSurah);
//             }
//         } else if (this._currentItem.type === 'juz') {
//             const currentIndex = juzData.findIndex(j => j.id === this._currentItem.id);
//             if (currentIndex < juzData.length - 1) {
//                 const nextJuz = juzData[currentIndex + 1];
//                 this._playJuz(nextJuz);
//             }
//         }
//     }
    
//     _updatePlayerUI() {
//         if (this._currentItem) {
//             // Update player box label
//             if (this._currentItem.type === 'surah') {
//                 this._nowPlayingLabel.text = `${this._currentItem.id}. ${this._currentItem.name}`;
//             } else if (this._currentItem.type === 'juz') {
//                 this._nowPlayingLabel.text = this._currentItem.name;
//             }
            
//             // Update top panel label to show playing item and reciter
//             const reciterName = this._selectedReciter ? this._selectedReciter.name : "";
//             this._panelLabel.text = ` ${this._currentItem.name} - ${reciterName}`;
            
//             // Update play/pause button icon
//             const playIcon = this._playButton.get_child();
//             if (this._isPlaying) {
//                 playIcon.icon_name = 'media-playback-pause-symbolic';
//             } else {
//                 playIcon.icon_name = 'media-playback-start-symbolic';
//             }
//         } else {
//             // Reset labels when nothing is playing
//             this._nowPlayingLabel.text = _('Quran Player');
//             this._panelLabel.text = '';
//             this._playButton.get_child().icon_name = 'media-playback-start-symbolic';
//         }
//     }
    
//     // Handle playback end
//     _onPlaybackEnded() {
//         if (!this._player) return;
        
//         try {
//             this._player.set_state(Gst.State.NULL);
//             this._player = null;
//             this._isPlaying = false;
            
//             // Auto-play next if enabled
//             if (this._settings.get_boolean('autoplay-next') && this._currentItem) {
//                 this._playNext();
//             } else {
//                 this._updatePlayerUI();
//             }
//         } catch (e) {
//             this._log(`Error handling playback end: ${e.message}`);
//             this._updatePlayerUI();
//         }
//     }
    
//     destroy() {
//         if (this._player) {
//             try {
//                 this._player.set_state(Gst.State.NULL);
//             } catch (e) {
//                 // Ignore errors during cleanup
//             }
//             this._player = null;
//         }
        
//         super.destroy();
//     }
// });

// function debugJuzLoading() {
//     try {
//         const extension = ExtensionUtils.getCurrentExtension();
        
//         // Log extension path
//         log('Quran Player: Extension path: ' + extension.path);
        
//         // Check if juz.json exists
//         const juzFilePath = GLib.build_filenamev([extension.path, 'juz.json']);
//         log('Quran Player: Checking for juz.json at: ' + juzFilePath);
        
//         const juzFile = Gio.File.new_for_path(juzFilePath);
//         const exists = juzFile.query_exists(null);
        
//         log('Quran Player: juz.json exists: ' + exists);
        
//         if (!exists) {
//             log('Quran Player: File not found. Creating juz.json with default data...');
            
//             // Create default juz data
//             const juzData = [
//                 {
//                     "name": "1. Cüz",
//                     "id": 1,
//                     "audioId": "01",
//                     "description": "Al-Fatiha 1 - Al-Baqarah 141",
//                     "startSurah": 1,
//                     "endSurah": 2,
//                     "endVerse": 141
//                   },
//                   {
//                     "name": "2. Cüz",
//                     "id": 2,
//                     "audioId": "02",
//                     "description": "Al-Baqarah 142 - Al-Baqarah 252",
//                     "startSurah": 2,
//                     "startVerse": 142,
//                     "endSurah": 2,
//                     "endVerse": 252
//                   },
//                   {
//                     "name": "3. Cüz",
//                     "id": 3,
//                     "audioId": "03",
//                     "description": "Al-Baqarah 253 - Al-Imran 92",
//                     "startSurah": 2,
//                     "startVerse": 253,
//                     "endSurah": 3,
//                     "endVerse": 92
//                   },
//                   {
//                     "name": "4. Cüz",
//                     "id": 4,
//                     "audioId": "04",
//                     "description": "Al-Imran 93 - An-Nisa 23",
//                     "startSurah": 3,
//                     "startVerse": 93,
//                     "endSurah": 4,
//                     "endVerse": 23
//                   },
//                   {
//                     "name": "5. Cüz",
//                     "id": 5,
//                     "audioId": "05",
//                     "description": "An-Nisa 24 - An-Nisa 147",
//                     "startSurah": 4,
//                     "startVerse": 24,
//                     "endSurah": 4,
//                     "endVerse": 147
//                   },
//                   {
//                     "name": "6. Cüz",
//                     "id": 6,
//                     "audioId": "06",
//                     "description": "An-Nisa 148 - Al-Ma'idah 81",
//                     "startSurah": 4,
//                     "startVerse": 148,
//                     "endSurah": 5,
//                     "endVerse": 81
//                   },
//                   {
//                     "name": "7. Cüz",
//                     "id": 7,
//                     "audioId": "07",
//                     "description": "Al-Ma'idah 82 - Al-An'am 110",
//                     "startSurah": 5,
//                     "startVerse": 82,
//                     "endSurah": 6,
//                     "endVerse": 110
//                   },
//                   {
//                     "name": "8. Cüz",
//                     "id": 8,
//                     "audioId": "08",
//                     "description": "Al-An'am 111 - Al-A'raf 87",
//                     "startSurah": 6,
//                     "startVerse": 111,
//                     "endSurah": 7,
//                     "endVerse": 87
//                   },
//                   {
//                     "name": "9. Cüz",
//                     "id": 9,
//                     "audioId": "09",
//                     "description": "Al-A'raf 88 - Al-Anfal 40",
//                     "startSurah": 7,
//                     "startVerse": 88,
//                     "endSurah": 8,
//                     "endVerse": 40
//                   },
//                   {
//                     "name": "10. Cüz",
//                     "id": 10,
//                     "audioId": "10",
//                     "description": "Al-Anfal 41 - At-Tawbah 92",
//                     "startSurah": 8,
//                     "startVerse": 41,
//                     "endSurah": 9,
//                     "endVerse": 92
//                   },
//                   {
//                     "name": "11. Cüz",
//                     "id": 11,
//                     "audioId": "11",
//                     "description": "At-Tawbah 93 - Hud 5",
//                     "startSurah": 9,
//                     "startVerse": 93,
//                     "endSurah": 11,
//                     "endVerse": 5
//                   },
//                   {
//                     "name": "12. Cüz",
//                     "id": 12,
//                     "audioId": "12",
//                     "description": "Hud 6 - Yusuf 52",
//                     "startSurah": 11,
//                     "startVerse": 6,
//                     "endSurah": 12,
//                     "endVerse": 52
//                   },
//                   {
//                     "name": "13. Cüz",
//                     "id": 13,
//                     "audioId": "13",
//                     "description": "Yusuf 53 - Ibrahim 52",
//                     "startSurah": 12,
//                     "startVerse": 53,
//                     "endSurah": 14,
//                     "endVerse": 52
//                   },
//                   {
//                     "name": "14. Cüz",
//                     "id": 14,
//                     "audioId": "14",
//                     "description": "Al-Hijr 1 - An-Nahl 128",
//                     "startSurah": 15,
//                     "startVerse": 1,
//                     "endSurah": 16,
//                     "endVerse": 128
//                   },
//                   {
//                     "name": "15. Cüz",
//                     "id": 15,
//                     "audioId": "15",
//                     "description": "Al-Isra 1 - Al-Kahf 74",
//                     "startSurah": 17,
//                     "startVerse": 1,
//                     "endSurah": 18,
//                     "endVerse": 74
//                   },
//                   {
//                     "name": "16. Cüz",
//                     "id": 16,
//                     "audioId": "16",
//                     "description": "Al-Kahf 75 - Ta-Ha 135",
//                     "startSurah": 18,
//                     "startVerse": 75,
//                     "endSurah": 20,
//                     "endVerse": 135
//                   },
//                   {
//                     "name": "17. Cüz",
//                     "id": 17,
//                     "audioId": "17",
//                     "description": "Al-Anbiya 1 - Al-Hajj 78",
//                     "startSurah": 21,
//                     "startVerse": 1,
//                     "endSurah": 22,
//                     "endVerse": 78
//                   },
//                   {
//                     "name": "18. Cüz",
//                     "id": 18,
//                     "audioId": "18",
//                     "description": "Al-Mu'minun 1 - Al-Furqan 20",
//                     "startSurah": 23,
//                     "startVerse": 1,
//                     "endSurah": 25,
//                     "endVerse": 20
//                   },
//                   {
//                     "name": "19. Cüz",
//                     "id": 19,
//                     "audioId": "19",
//                     "description": "Al-Furqan 21 - An-Naml 55",
//                     "startSurah": 25,
//                     "startVerse": 21,
//                     "endSurah": 27,
//                     "endVerse": 55
//                   },
//                   {
//                     "name": "20. Cüz",
//                     "id": 20,
//                     "audioId": "20",
//                     "description": "An-Naml 56 - Al-Ankabut 45",
//                     "startSurah": 27,
//                     "startVerse": 56,
//                     "endSurah": 29,
//                     "endVerse": 45
//                   },
//                   {
//                     "name": "21. Cüz",
//                     "id": 21,
//                     "audioId": "21",
//                     "description": "Al-Ankabut 46 - Al-Ahzab 30",
//                     "startSurah": 29,
//                     "startVerse": 46,
//                     "endSurah": 33,
//                     "endVerse": 30
//                   },
//                   {
//                     "name": "22. Cüz",
//                     "id": 22,
//                     "audioId": "22",
//                     "description": "Al-Ahzab 31 - Ya-Sin 27",
//                     "startSurah": 33,
//                     "startVerse": 31,
//                     "endSurah": 36,
//                     "endVerse": 27
//                   },
//                   {
//                     "name": "23. Cüz",
//                     "id": 23,
//                     "audioId": "23",
//                     "description": "Ya-Sin 28 - Az-Zumar 31",
//                     "startSurah": 36,
//                     "startVerse": 28,
//                     "endSurah": 39,
//                     "endVerse": 31
//                   },
//                   {
//                     "name": "24. Cüz",
//                     "id": 24,
//                     "audioId": "24",
//                     "description": "Az-Zumar 32 - Fussilat 46",
//                     "startSurah": 39,
//                     "startVerse": 32,
//                     "endSurah": 41,
//                     "endVerse": 46
//                   },
//                   {
//                     "name": "25. Cüz",
//                     "id": 25,
//                     "audioId": "25",
//                     "description": "Fussilat 47 - Al-Jathiyah 37",
//                     "startSurah": 41,
//                     "startVerse": 47,
//                     "endSurah": 45,
//                     "endVerse": 37
//                   },
//                   {
//                     "name": "26. Cüz",
//                     "id": 26,
//                     "audioId": "26",
//                     "description": "Al-Ahqaf 1 - Adh-Dhariyat 30",
//                     "startSurah": 46,
//                     "startVerse": 1,
//                     "endSurah": 51,
//                     "endVerse": 30
//                   },
//                   {
//                     "name": "27. Cüz",
//                     "id": 27,
//                     "audioId": "27",
//                     "description": "Adh-Dhariyat 31 - Al-Hadid 29",
//                     "startSurah": 51,
//                     "startVerse": 31,
//                     "endSurah": 57,
//                     "endVerse": 29
//                   },
//                   {
//                     "name": "28. Cüz",
//                     "id": 28,
//                     "audioId": "28",
//                     "description": "Al-Mujadila 1 - At-Tahrim 12",
//                     "startSurah": 58,
//                     "startVerse": 1,
//                     "endSurah": 66,
//                     "endVerse": 12
//                   },
//                   {
//                     "name": "29. Cüz",
//                     "id": 29,
//                     "audioId": "29",
//                     "description": "Al-Mulk 1 - Al-Mursalat 50",
//                     "startSurah": 67,
//                     "startVerse": 1,
//                     "endSurah": 77,
//                     "endVerse": 50
//                   },
//                   {
//                     "name": "30. Cüz",
//                     "id": 30,
//                     "audioId": "30",
//                     "description": "An-Naba 1 - An-Nas 6",
//                     "startSurah": 78,
//                     "startVerse": 1,
//                     "endSurah": 114,
//                     "endVerse": 6
//                   }
//             ];
            
//             // Convert to JSON
//             const juzContent = JSON.stringify(juzData, null, 2);
            
//             // Write to file
//             try {
//                 const bytes = new TextEncoder().encode(juzContent);
//                 const outputStream = juzFile.replace(null, false, Gio.FileCreateFlags.NONE, null);
//                 outputStream.write_all(bytes, null);
//                 outputStream.close(null);
//                 log('Quran Player: Successfully created juz.json with default data');
//             } catch (writeError) {
//                 log('Quran Player: Error writing juz.json: ' + writeError.message);
//             }
            
//             return juzData;
//         }
        
//         // Try to read the file
//         try {
//             const [success, contents] = juzFile.load_contents(null);
            
//             if (success && contents && contents.length > 0) {
//                 const jsonData = JSON.parse(new TextDecoder().decode(contents));
//                 log('Quran Player: Successfully loaded Juz data with ' + jsonData.length + ' entries');
//                 return jsonData;
//             } else {
//                 log('Quran Player: Failed to read juz.json contents');
//                 return [];
//             }
//         } catch (readError) {
//             log('Quran Player: Error reading juz.json: ' + readError.message);
//             return [];
//         }
//     } catch (e) {
//         log('Quran Player: Debug error: ' + e.message);
//         return [];
//     }
// }