const fs = require('fs');

const buildGradlePath = './platforms/android/build.gradle';
const kspPluginSnippet = `
plugins {
    id("com.google.devtools.ksp") version "1.9.0-1.0.13"
}
`;

fs.readFile(buildGradlePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading build.gradle:', err);
    return;
  }

  if (!data.includes('id("com.google.devtools.ksp")')) {
    let braceStack = [];
    let insertIndex = -1;
    let buildscriptStartIndex = data.indexOf('buildscript');

    if (buildscriptStartIndex !== -1) {
      for (let i = buildscriptStartIndex + 'buildscript'.length; i < data.length; i++) {
        const char = data[i];

        if (char === '{') {
          braceStack.push('{');
        } else if (char === '}') {
          braceStack.pop();
          if (braceStack.length === 0) {
            insertIndex = i + 1;
            break;
          }
        }
      }
    }

    if (insertIndex !== -1) {
      const updatedData = data.slice(0, insertIndex) + kspPluginSnippet + data.slice(insertIndex);

      fs.writeFile(buildGradlePath, updatedData, 'utf8', (err) => {
        if (err) {
          console.error('Error writing to build.gradle:', err);
        } else {
          console.log('KSP plugin added to build.gradle');
        }
      });
    } else {
      console.error('buildscript block not found in build.gradle');
    }
  } else {
    console.log('KSP plugin already present in build.gradle');
  }
});