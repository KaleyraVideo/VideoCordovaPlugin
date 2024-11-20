const fs = require('fs');

function prependFile(sourceFile, destinationFile) {
      // Read the contents of both files
      const sourceContent = fs.readFileSync(sourceFile);
      const destinationContent = fs.readFileSync(destinationFile);

      // Combine the contents, with source firstconst
      combinedContent = sourceContent + destinationContent;

      // Write the combined content back to the destination file
      fs.writeFileSync(destinationFile, combinedContent);

      console.log('Kaleyra settings.gradle prepended successfully in cdv-gradle-name.gradle!');
}

prependFile('./plugins/@kaleyra/video-cordova-plugin/settings.gradle', './platforms/android/cdv-gradle-name.gradle');