import xml.etree.ElementTree as ET
from xml.sax.saxutils import unescape
import sys
import json
import re

version = ""
id = ""

def replace(file, searchRegex, replaceExp):
  with open(file, "r+") as file:
      text = file.read()
      text = re.sub(searchRegex, replaceExp, text)
      file.seek(0, 0) # seek to beginning
      file.write(text)
      file.truncate() # get rid of any trailing characters

# read package.json variables to set on the plugin.xml
with open('package.json') as package_json:
    data = json.load(package_json)
    version = data['version']
    id = data['cordova']['id']

# read and set the properties to the xml
ET.register_namespace('',"http://apache.org/cordova/ns/plugins/1.0")
ET.register_namespace('android',"http://schemas.android.com/apk/res/android")
doc = ET.parse("plugin.xml")
root = doc.getroot()
root.set('id', id)
root.set('version', version)
out = unescape(ET.tostring(root, encoding='UTF-8', method='xml',xml_declaration=True).decode())
with open("plugin.xml", 'w') as f:
    f.write(out)

semver_regex = r"(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?"

# update android
replace("src/android/src/main/assets/kaleyra_video_wrapper_info.txt", semver_regex, version)

# update ios
replace("src/ios/PluginInfo/_KaleyraVideoHybridVersionInfo.swift", semver_regex, version)
