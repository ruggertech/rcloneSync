const fs            = require('fs');
const child_process = require('child_process');
const execSync      = child_process.execSync;


class FileUtil {
  static createMd5(directoryName, md5outputFile) {
    const rclone = `${process.env.RCLONE_HOME}/rclone`;
    if (!fs.existsSync(rclone)) {
      console.log("rclone could not be found at the following location: " + rclone);
      process.exit();
    }

    const command = `${rclone} md5sum ${directoryName.replace(/ /g, '\\ ')} >> ${md5outputFile}`;
    console.log(command);
    execSync(command);
  }

  static convertFileToMap(dirPrefix, fileName, nickname, outputFilename) {
    if (fs.existsSync(outputFilename)) {
      fs.unlinkSync(outputFilename);
    }

    const content      = fs.readFileSync(fileName, 'utf8');
    const fileArr      = content.split('\n');
    const listOfHashes = new Map();

    for (const idx in fileArr) {
      const line     = fileArr[idx];
      const md5      = line.substr(0, line.indexOf(' ')); // "72"
      const hashedFilename = line.substr(line.indexOf(' ') + 2); // "tocirah sneab"
      if (listOfHashes.has(md5)) {
        //console.log(`recommend to delete duplicate file in ${nickname}: {md5: ${md5}, name1: ${fileName}, name2: ${listOfHashes.get(md5)}}`);
        fs.appendFileSync(outputFilename, listOfHashes.get(md5) + '\n', 'utf8');
      } else {
        listOfHashes.set(md5, `${dirPrefix}\/${hashedFilename}`);
      }
    }

    return listOfHashes;
  }

}

const leftDir   = process.argv[2];
const leftNick  = process.argv[3];
const rightDir  = process.argv[4];
const rightNick = process.argv[5];

const leftMd5  = '/private/tmp/erezLocalPhotoBackupMd5.txt';
const rightMd5 = '/private/tmp/erezDrivePhotoBackupMd5.txt';
/*FileUtil.createMd5(leftDir, leftMd5);
 FileUtil.createMd5(rightDir, rightMd5);*/

const listDrive = FileUtil.convertFileToMap(leftDir, leftMd5, leftNick, '/private/tmp/driveDups.txt');
const listLocal = FileUtil.convertFileToMap(rightDir, rightMd5, rightNick, '/private/tmp/localDups.txt');

listLocal.forEach((value, md5) => {
  if (!listDrive.has(md5)) {
    console.log(`file '${value}' in local but not remote`);
    fs.appendFileSync("inLocalNotRemote.txt", value + '\n', encoding = 'utf8');
  }
});

listDrive.forEach((value, md5) => {
  if (!listLocal.has(md5)) {
    console.log(`file '${value}' in remote but not local`);
    fs.appendFileSync("inRemoteNotLocal.txt", value + '\n', encoding = 'utf8');
  }
});


console.log('done');

