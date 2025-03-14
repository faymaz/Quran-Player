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

// Default reciters if custom JSON fails to load
const DEFAULT_RECITERS = [
    {
        "name": "Abdullah Basfar",
        "baseUrl": "https://podcasts.qurancentral.com/abdullah-basfar/abdullah-basfar-",
        "audioFormat": "%id%.mp3"
      },
      {
        "name": "Abdullah Matrood",
        "baseUrl": "https://podcasts.qurancentral.com/abdullah-matrood/abdullah-matrood-",
        "audioFormat": "%id%.mp3"
      },
      {
        "name": "Abdul Rahman Al-Sudais",
        "baseUrl": "https://podcasts.qurancentral.com/abdul-rahman-al-sudais/abdul-rahman-al-sudais-",
        "audioFormat": "%id%.mp3"
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
        "name": "Hayri Küçükdeniz-Suat Yıldırım Meali",
        "baseUrl": "https://archive.org/download/Kurani.Kerim.Meali.30.cuz.Prof.Dr.SuatYildirim/",
        "audioFormat": "%id%cuz.mp3"
      },
      {
        "name": "Maher Al-Muaiqly",
        "baseUrl": "https://podcasts.qurancentral.com/maher-al-muaiqly/maher-al-muaiqly-",
        "audioFormat": "%id%.mp3"
      },
      {
        "name": "Mehmet Emin Ay-Cüz",
        "baseUrl": "https://ia800307.us.archive.org/1/items/MehmetEminAYmp3/Mehmet%20Emin%20AY%20_%20Hatm-i%20%C5%9Eerif%2",
        "audioFormat": "%id%.C%C3%BCz.mp3"
      },
      {
        "name": "Mishary Al-Afasy",
        "baseUrl": "https://podcasts.qurancentral.com/mishary-al-afasy/mishary-al-afasy-",
        "audioFormat": "%id%.mp3"
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

// Load surahs list from JSON file
let surahs = [];
try {
    const surahsFile = Gio.File.new_for_path(GLib.build_filenamev([ExtensionUtils.getCurrentExtension().path, 'surahs.json']));
    const [success, contents] = surahsFile.load_contents(null);
    if (success) {
        surahs = JSON.parse(new TextDecoder().decode(contents));
    }
} catch (e) {
    logError(e, 'Quran Player: Failed to load surahs.json');
    // Include basic surahs as fallback (adding just a few for brevity)
    surahs = [
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

// Load custom reciters if available
let RECITERS = [];
try {
    const recitersFile = Gio.File.new_for_path(GLib.build_filenamev([ExtensionUtils.getCurrentExtension().path, 'custom-reciters.json']));
    const [success, contents] = recitersFile.load_contents(null);
    if (success) {
        RECITERS = JSON.parse(new TextDecoder().decode(contents));
    } else {
        RECITERS = DEFAULT_RECITERS;
    }
} catch (e) {
    logError(e, 'Quran Player: Failed to load custom-reciters.json');
    RECITERS = DEFAULT_RECITERS;
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
        
        // Create panel icon and label container
        this._panelBox = new St.BoxLayout({
            style_class: 'panel-status-menu-box'
        });
        
        let icon = new St.Icon({
            icon_name: 'audio-headphones-symbolic',
            style_class: 'system-status-icon',
        });
        
        // Add label for currently playing surah
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
        this._currentSurah = null;
        this._isPlaying = false;
        this._selectedReciter = RECITERS.length > 0 ? RECITERS[0] : null;
        
        // Load saved settings
        this._loadSettings();
        
        // Create player UI
        this._createPlayerUI();
        
        // Create surah menu items
        this._addSurahGroups();
        
        // Add settings menu
        this._addSettingsMenu();
        
        // Connect button event handlers
        this._connectSignals();
    }
    
    _loadSettings() {
        // Make sure RECITERS array is not empty
        if (RECITERS.length === 0) {
            // Add fallback reciter if array is empty
            RECITERS.push({
                "name": "Mustafa Ismail",
                "baseUrl": "https://download.quranicaudio.com/quran/mostafa_ismaeel/",
                "audioFormat": "%id%.mp3"
            });
            this._selectedReciter = RECITERS[0];
            return;
        }
        
        // Try to load reciter from settings
        const reciterId = this._settings.get_string('selected-reciter');
        if (reciterId) {
            // Find reciter by name (using name as ID)
            const foundReciter = RECITERS.find(r => r.name === reciterId);
            if (foundReciter) {
                this._selectedReciter = foundReciter;
            } else {
                // Default to first reciter if saved one not found
                this._selectedReciter = RECITERS[0];
            }
        } else {
            // Default to first reciter if none saved
            this._selectedReciter = RECITERS[0];
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
            this._playPreviousSurah();
        });
        
        this._nextButton.connect('clicked', () => {
            this._playNextSurah();
        });
    }        
    
    _addSurahGroups() {
        // Group surahs in sets of 15 like in Diyanet extension (shown in Image 3)
        const groupSize = 15;
        const groupCount = Math.ceil(surahs.length / groupSize);
        
        for (let i = 0; i < groupCount; i++) {
            const startIdx = i * groupSize;
            const endIdx = Math.min(startIdx + groupSize, surahs.length);
            
            // Format group label like "1-15", "16-30", etc.
            const firstId = surahs[startIdx].id;
            const lastId = surahs[endIdx-1].id;
            const groupLabel = `${firstId}-${lastId}`;
            
            // Create submenu for this group
            let subMenu = new PopupMenu.PopupSubMenuMenuItem(groupLabel);
            
            // Add surahs to this group's submenu
            for (let j = startIdx; j < endIdx; j++) {
                const surah = surahs[j];
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
        
    _addSettingsMenu() {
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
        // Reciter selection submenu
        let reciterMenu = new PopupMenu.PopupSubMenuMenuItem(_('Reciter'));
        
        // Add reciters to submenu
        if (RECITERS && RECITERS.length > 0) {
            RECITERS.forEach(reciter => {
                if (!reciter || !reciter.name) return; // Skip invalid reciters
                
                let item = new PopupMenu.PopupMenuItem(reciter.name);
                
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
                        if (this._currentSurah) {
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
    // Add this helper function if it doesn't exist yet
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
                        const isSelected = this._selectedReciter && 
                                        item.label.text === this._selectedReciter.name;
                        item.setOrnament(isSelected ? PopupMenu.Ornament.DOT : PopupMenu.Ornament.NONE);
                    }
                });
            }
        } catch (e) {
            this._log(`Error updating reciter selection: ${e.message}`);
        }
    }
    _updateReciterMenu() {
        // Clear menu and rebuild it
        this.menu.removeAll();
        
        // Add player controls back
        let playerItem = new PopupMenu.PopupBaseMenuItem({
            reactive: false,
            can_focus: false
        });
        playerItem.add_child(this._playerBox);
        this.menu.addMenuItem(playerItem);
        
        // Add separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
        // Re-add surah groups
        this._addSurahGroups();
        
        // Re-add settings menu
        this._addSettingsMenu();
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
        if (!this._selectedReciter && RECITERS.length > 0) {
            this._selectedReciter = RECITERS[0];
        } else if (!this._selectedReciter) {
            // Create a default reciter if none available
            this._selectedReciter = {
                "name": "Mustafa Ismail",
                "baseUrl": "https://download.quranicaudio.com/quran/mostafa_ismaeel/",
                "audioFormat": "%id%.mp3"
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
                
            this._log(`Playing: ${surah.name}, URL: ${audioUrl}`);
        } catch (urlError) {
            this._log(`Error creating audio URL: ${urlError.message}`);
            return;
        }
        
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
                    const safeReciterName = this._selectedReciter ? this._selectedReciter.name : "Unknown";
                    const safeTitle = `Now playing: ${surah.name}`;
                    const safeBody = `Reciter: ${safeReciterName}`;
                    
                    // Use a timeout to prevent blocking the UI
                    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
                        try {
                            this._showNotification(safeTitle, safeBody);
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
                        this._showNotification(`Now playing: ${surah.name}`, 
                                             `Reciter: ${this._selectedReciter ? this._selectedReciter.name : "Unknown"} (fallback mode)`);
                    }
                } catch (e) {
                    // Ignore notification errors in fallback mode
                }
            }
        }
        
        this._isPlaying = true;
        this._currentSurah = surah;
        
        // Update UI
        this._updatePlayerUI();
    }
    

    
    _log(message) {
        if (this._settings.get_boolean('enable-debug-log')) {
            log(`[Quran Player] ${message}`);
        }
    }
    
    _togglePlay() {
        if (!this._player || !this._currentSurah) {
            if (this._currentSurah) {
                this._playSurah(this._currentSurah);
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
    
    _playPreviousSurah() {
        if (!this._currentSurah) return;
        
        const currentIndex = surahs.findIndex(s => s.id === this._currentSurah.id);
        if (currentIndex > 0) {
            const prevSurah = surahs[currentIndex - 1];
            this._playSurah(prevSurah);
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
    
    _playNextSurah() {
        if (!this._currentSurah) return;
        
        const currentIndex = surahs.findIndex(s => s.id === this._currentSurah.id);
        if (currentIndex < surahs.length - 1) {
            const nextSurah = surahs[currentIndex + 1];
            this._playSurah(nextSurah);
        }
    }
    
    _updatePlayerUI() {
        if (this._currentSurah) {
            // Update player box label
            this._nowPlayingLabel.text = `${this._currentSurah.id}. ${this._currentSurah.name}`;
            
            // Update top panel label to show playing surah and reciter
            const reciterName = this._selectedReciter ? this._selectedReciter.name : "";
            this._panelLabel.text = ` ${this._currentSurah.name} - ${reciterName}`;
            
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
            
            // Auto-play next surah if enabled
            if (this._settings.get_boolean('autoplay-next') && this._currentSurah) {
                this._playNextSurah();
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
        // Load settings schema
        this._settings = this.getSettings();
        
        // Create and add indicator to panel
        this._indicator = new QuranPlayerIndicator(this);
        Main.panel.addToStatusArea('quran-player', this._indicator);
    }
    
    disable() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
        this._settings = null;
    }
    
    getSettings() {
        try {
            // Load schema
            let gschema = Gio.SettingsSchemaSource.new_from_directory(
                this.path + '/schemas',
                Gio.SettingsSchemaSource.get_default(),
                false
            );
            
            let schema = gschema.lookup('org.gnome.shell.extensions.quran-player', true);
            
            if (!schema) {
                throw new Error('Schema not found: org.gnome.shell.extensions.quran-player');
            }
            
            return new Gio.Settings({ settings_schema: schema });
        } catch (e) {
            logError(e, "Failed to get settings");
            return null;
        }
    }
}