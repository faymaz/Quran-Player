UUID = quran-player@faymaz.github.com
EXTENSION_PATH = ~/.local/share/gnome-shell/extensions/$(UUID)
SCHEMA_PATH = $(EXTENSION_PATH)/schemas

.PHONY: all install uninstall compile-schemas zip clean update-po compile-po

all: install

install: compile-schemas compile-po check-files
	@echo "Installing Quran Player extension..."
	@mkdir -p $(EXTENSION_PATH)
	@cp -v extension.js prefs.js metadata.json stylesheet.css constants.js $(EXTENSION_PATH)
	@cp -v surahs.json $(EXTENSION_PATH)
	@cp -v juz.json $(EXTENSION_PATH)
	@cp -v custom-reciters.json $(EXTENSION_PATH)
	@mkdir -p $(SCHEMA_PATH)
	@cp -r schemas/* $(SCHEMA_PATH)
	@mkdir -p $(EXTENSION_PATH)/locale
	@cp -r locale/* $(EXTENSION_PATH)/locale/
	@echo "Installation complete. Please restart GNOME Shell."
	@echo "On X11: Alt+F2, then type 'r' and press Enter"
	@echo "On Wayland: Log out and log back in"
	@echo "Then enable the extension with: gnome-extensions enable $(UUID)"

check-files:
	@echo "Checking required files..."
	@test -f juz.json || { echo "Error: juz.json file is missing!"; exit 1; }
	@test -f surahs.json || { echo "Error: surahs.json file is missing!"; exit 1; }
	@test -f custom-reciters.json || { echo "Error: custom-reciters.json file is missing!"; exit 1; }
	@echo "All required files are present."

uninstall:
	@echo "Uninstalling Quran Player extension..."
	@rm -rf $(EXTENSION_PATH)
	@echo "Uninstallation complete."

compile-schemas:
	@echo "Compiling GSettings schemas..."
	@mkdir -p schemas
	@cp org.gnome.shell.extensions.quran-player.gschema.xml schemas/
	@glib-compile-schemas schemas/

zip: compile-schemas check-files
	@echo "Creating zip archive..."
	@mkdir -p build
	@zip -r build/$(UUID).zip extension.js prefs.js metadata.json stylesheet.css constants.js \
		surahs.json juz.json custom-reciters.json schemas/ locale/ po/ \
		LICENSE README.md
	@echo "Created build/$(UUID).zip"

compile-po:
    @echo "Compiling translation files..."
    @mkdir -p locale/tr/LC_MESSAGES
    @mkdir -p locale/de/LC_MESSAGES
    @mkdir -p locale/en/LC_MESSAGES
    @mkdir -p locale/ar/LC_MESSAGES
    @msgfmt -o locale/tr/LC_MESSAGES/quran-player.mo po/tr/tr.po
    @msgfmt -o locale/de/LC_MESSAGES/quran-player.mo po/de/de.po
    @msgfmt -o locale/en/LC_MESSAGES/quran-player.mo po/en/en.po
    @msgfmt -o locale/ar/LC_MESSAGES/quran-player.mo po/ar/ar.po
	@echo "Translation files compiled."

clean:
	@echo "Cleaning build files..."
	@rm -rf build schemas/gschemas.compiled
	@echo "Clean complete."

update-po:
	@echo "Updating translation templates..."
	@xgettext --files-from=po/POTFILES.in --directory=. --output=po/quran-player.pot --from-code=UTF-8
	@echo "Updated po/quran-player.pot"
