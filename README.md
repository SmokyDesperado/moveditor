# moveditor

This project is generated with [yo angular generator](https://github.com/yeoman/generator-angular)
version 0.16.0.

## Requirements

* node
* npm
* grunt
* bower

## Installation (First set up)

Check if node and npm are installed.  
**Important:** Maybe it is needed to add node to the PATH on Windows.

**It is recommended to use a UNIX like terminal for the following commands.**  

Run 'npm install bower -g' to install bower.  
Run 'npm install grunt-cli -g' to install grunt command line interface.  
Check if bower and grunt are installed with 'bower --version' and 'grunt --version'. Maybe it is needed to restart the terminal.  

cd /path/to/the/repo/  
Run 'npm install' to install all node modules (grunt etc.).  
Run 'bower install' to install necessary bower modules (angular etc.)  
Run 'grunt serve' to start your browser on 'localhost:9000'.  

The app runs on a local server with live reloading when code is edited (except for HTML files)

**NOTES:** Each time new modules are installed you have to run 'npm install' and 'bower isntall'.

## Build & development

Run `grunt` for building and `grunt serve` for preview.
Run 'grunt build' to build and process some further optimation of the app. 

## Notes

### Shortcuts

| shortcut | functions | notes |
| --- | --- | --- |
| **CTRL** + **NUM -** / **-** | timeline zoom out |  |
| **CTRL** + **NUM +** / **+** | timeline zoom in |  |
| **CTRL** + **NUM 0** / **0** | timeline zoom reset |  |
| **backspace** / **delete** | timeline delete focused chunk |  |
| **C** | activate cutting mode |  |
| **M** | mute focused chunk |  |
| **CTRL** + **Z** | undo timeline action |  |
| **CTRL** + **Y** / **CTRL** + **SHIFT** + **Y** | redo timeline action |  |
| **CTRL** + **ARROW LEFT** | swap chunk with previous chunk|  |
| **CTRL** + **ARROW RIGHT** | swap chunk with next chunk|  |
| **ALT** + **ARROW LEFT** | move focus to previous chunk | unfocus if chunk is the first and focus last chunk if no chunk is focused |
| **ALT** + **ARROW RIGHT** | move focus to next chunk | unfocus if chunk is the last and focus first chunk, if no chunk is focused |
| **ALT** + **ARROW UP** | move focus from audio to video chunk | unfocus, if chunk type is video and focus audio chunk, if no chunk is focused |
| **ALT** + **ARROW DOWN** | move focus from video to audio chunk | unfocus, if chunk type is audio and focus video chunk, if no chunk is focused |
| **CTRL** + **S** | save working session|  |
| **CTRL** + **O** | load saved working session via file input dialog |  |
| **ENTER** / **NUM ENTER** / **SPACE** | play preview player | stops when is played |
| **NUM 0** / **0** | set preview player postion to 0s |  |
| **L** | activate looping playback | loops time range between loop marker |
| **<** | set preview player postion to loop marker start |  |
| **NUM -** / **-** | preview player fast backward playback by 1s |  |
| **SHIFT** + **NUM -** / **SHIFT** + **-** | preview player fast backward playback by 0.1s |  |
| **NUM +** / **+** | preview player fast forward playback by 1s |  |
| **SHIFT** + **NUM +** / **SHIFT** + **+** | preview player fast forward playback by 0.1s |  |
| **ARROW DOWN** | decrease playback volume |  |
| **ARROW UP** | increase playback volume |  |

### Using cloud media

The app validates the added matrial links and checks if the media type is supported. Normal public accessible links of the material should work.

**Suopported media types**

| images | video | audio |
| :---: | :---: | :---: |
| bmp | 3gp | mp3 |
| gif | amv | flac |
| jpg | flv | ogg |
| png | m4v | wav |
| webp | mp4 |  |
|  | mkv |  |
|  | mov |  |
|  | ogv |  |
|  | ogg |  |
|  | webm |  |

Links of cloud services may need manual edit. 
- **one drive** 
  - https://1drv.ms/v/s!AsLQUku5IU5olQAMkS7fVnCtyJx8 enter and stop further loading after first redirect 
  - then replace 'redirect' with 'download' in that URL e.g. https://onedrive.live.com/download?resid=684E21B94B52D0C2!2688&authkey=!AAyRLt9WcK3InHw&ithint=video%2cmp4
- **dropbox** 
  - replace 'www' with 'dl' e.g. https://dl.dropbox.com/s/au3bned42n09ndy/VID-20180524-WA0002.mp4?dl=0 
- **google drive** 
  - take file id of google drive public shared URL and create a URL in the format of e.g. https://drive.google.com/uc?export=download&id=1qXlYazitNrc7Up6XceuGPYZKVb6DXG00

### Stitching

The video stitching process will first send the segmentation request of the used materials and the send the stitching request. The stitching request of the backend is currently not working correctly and gives an error response.
It is not recommended to reload the app while sending the segmentation request, because the required JobID, to fetch the responses, is randomly generated on each app load.

The backend can be restarted with the button "**purge & restart**", if it has crashed. Pop-up windows has to be allowed in this process, because it will open three external links with one click.

### Audio

Audio is right now supported by the app, but not by the backend. Stitching and editing audio to the video files is possible, but will not be send to the backend for processing.