project('quran-player',
  version: '1.0.0',
  meson_version: '>= 0.40.0',
)

gnome = import('gnome')
i18n = import('i18n')

# Çeviri dosyalarını derle
subdir('po')

# schema.xml dosyasını kopyala ve derle
install_data(
  'schemas/org.gnome.shell.extensions.quran-player.gschema.xml',
  install_dir: join_paths(get_option('datadir'), 'glib-2.0/schemas')
)

meson.add_install_script('meson_post_install.py')
