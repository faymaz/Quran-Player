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

// Import from constants.js
import {
    loadReciters,
    loadSurahs,
    loadJuz,
    isJuzBasedReciter
} from './constants.js';

// Initialize globals
let surahs = [];
let juzData = [];
let RECITERS = [];

try {
    // Load data
    surahs = loadSurahs();
    juzData = loadJuz();
    RECITERS = loadReciters();
} catch (e) {
    logError(e, 'Quran Player: Failed to load data');
    // Default fallbacks are handled in the loading functions
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
        this._selectedReciter = RECITERS.length > 0 ? RECITERS[0] : null;
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
        // Make sure RECITERS array is not empty
        if (RECITERS.length === 0) {
            // Add fallback reciter if array is empty
            RECITERS.push({
                "name": "Mustafa Ismail",
                "baseUrl": "https://download.quranicaudio.com/quran/mostafa_ismaeel/",
                "audioFormat": "%id%.mp3",
                "type": "surah"
            });
            this._selectedReciter = RECITERS[0];
            this._isJuzMode = false;
            return;
        }
        
        // Try to load reciter from settings
        const reciterId = this._settings.get_string('selected-reciter');
        if (reciterId) {
            // Find reciter by name (using name as ID)
            const foundReciter = RECITERS.find(r => r.name === reciterId);
            if (foundReciter) {
                this._selectedReciter = foundReciter;
                // Set juz mode based on reciter type
                this._isJuzMode = isJuzBasedReciter(foundReciter);
            } else {
                // Default to first reciter if saved one not found
                this._selectedReciter = RECITERS[0];
                this._isJuzMode = isJuzBasedReciter(this._selectedReciter);
            }
        } else {
            // Default to first reciter if none saved
            this._selectedReciter = RECITERS[0];
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

    _addJuzGroups() {
        // Check if we have juz data
        if (!juzData || juzData.length === 0) {
            // Show a message if no juz data
            let noDataItem = new PopupMenu.PopupMenuItem(_('No Juz data available'));
            noDataItem.setSensitive(false);
            this.menu.addMenuItem(noDataItem);
            return;
        }

        // Group juz in sets of 5 (1-5, 6-10, etc)
        const groupSize = 5;
        const groupCount = Math.ceil(juzData.length / groupSize);
        
        for (let i = 0; i < groupCount; i++) {
            const startIdx = i * groupSize;
            const endIdx = Math.min(startIdx + groupSize, juzData.length);
            
            // Format group label like "Juz 1-5", "Juz 6-10", etc.
            const firstId = juzData[startIdx].id;
            const lastId = juzData[endIdx-1].id;
            const groupLabel = `Cüz ${firstId}-${lastId}`;
            
            // Create submenu for this group
            let subMenu = new PopupMenu.PopupSubMenuMenuItem(groupLabel);
            
            // Add juz to this group's submenu
            for (let j = startIdx; j < endIdx; j++) {
                const juz = juzData[j];
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
        if (RECITERS && RECITERS.length > 0) {
            RECITERS.forEach(reciter => {
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
        if (!this._selectedReciter && RECITERS.length > 0) {
            this._selectedReciter = RECITERS[0];
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
        if (!this._selectedReciter && RECITERS.length > 0) {
            this._selectedReciter = RECITERS.find(r => isJuzBasedReciter(r)) || RECITERS[0];
        } else if (!this._selectedReciter) {
            // Create a default juz reciter if none available
            this._selectedReciter = {
                "name": "Hayri Küçükdeniz-Suat Yıldırım Meali-Cüz",
                "baseUrl": "https://archive.org/download/Kurani.Kerim.Meali.30.cuz.Prof.Dr.SuatYildirim/",
                "audioFormat": "%id%cuz.mp3",
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
            // Build URL using reciter's format
            audioUrl = `${this._selectedReciter.baseUrl}${this._selectedReciter.audioFormat}`
                .replace(/%id%/g, paddedId)
                .replace(/%audioId%/g, audioId)
                .replace(/%name%/g, juz.name);
                
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
            const currentIndex = surahs.findIndex(s => s.id === this._currentItem.id);
            if (currentIndex > 0) {
                const prevSurah = surahs[currentIndex - 1];
                this._playSurah(prevSurah);
            }
        } else if (this._currentItem.type === 'juz') {
            const currentIndex = juzData.findIndex(j => j.id === this._currentItem.id);
            if (currentIndex > 0) {
                const prevJuz = juzData[currentIndex - 1];
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
            const currentIndex = surahs.findIndex(s => s.id === this._currentItem.id);
            if (currentIndex < surahs.length - 1) {
                const nextSurah = surahs[currentIndex + 1];
                this._playSurah(nextSurah);
            }
        } else if (this._currentItem.type === 'juz') {
            const currentIndex = juzData.findIndex(j => j.id === this._currentItem.id);
            if (currentIndex < juzData.length - 1) {
                const nextJuz = juzData[currentIndex + 1];
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