// General
let lyrics = []
let lyricsLine = 0

let musicIsStarting = false, musicIsPausing = false
let time

let musicFileSourceInput = document.querySelector(".music .source .filesource")
let loadMusicButton = document.querySelector(".music .source .loadmusic")
let musicAudio = document.querySelector(".music audio")
let lyricsSource = document.querySelector(".music .lyricssourcecontainer .lyricssource")

let timeRecoderButton = document.querySelector(".origin .timerecorder button")

let resultLyricsContent = document.querySelector(".result .lyrics .content")
let resultLyricsCopyButton = document.querySelector(".result .copy button")
let resultLyricsDownloadButton = document.querySelector(".result .download button")


// Functions
const int = Math.floor
const getAudioCurrentTime = () => int(musicAudio.currentTime*1000)
const toTimeString = (millisecond) => {
    let minutes, seconds
    minutes = int(millisecond / 60000)
    seconds = int(millisecond % 60000) / 1000
    let result = ""
    result += (minutes < 10? "0" : "") + minutes + ":"
    result += (seconds < 10? "0" : "") + seconds
    for(let i = String((seconds < 10? "0" : "") + seconds).length; i < 6; i++) result += i > 2 ? "0" : "."
    return result
}
const resetResultLyricsContent = () => {
    resultLyricsContent.innerHTML = ""
    lyricsLine = 0
}
const scrollLyricsSource = () => lyricsSource.scroll(0,lyricsLine*17) // 15px of font + 2px for spaces
const scrollResultLyricsContent = () => window.scrollTo(0,resultLyricsContent.scrollHeight) // to bottom
const toMillisecond = (timeString) => {
    let indexOfSecond = timeString.indexOf(":") + 1
    let minutes = Number(timeString.substring(0,indexOfSecond-1))
    let seconds = Number(timeString.substring(indexOfSecond))
    let millisecond = (minutes * 60 + seconds) * 1000
    return millisecond
}
const downloadResultLyrics = () => {
    let fileContent = resultLyricsContent.innerText.replace(/\n\n/g,"\n")
    let indexOfMusicFilename = musicFileSourceInput.value.lastIndexOf("\\") + 1
    if (indexOfMusicFilename == 0)
        indexOfMusicFilename = musicFileSourceInput.value.lastIndexOf("/") + 1
    let fileName = musicFileSourceInput.value.substring(indexOfMusicFilename).replace(".mp3",".lrc")
    let file = new File(["\ufeff"+fileContent], fileName, {type: "text/plain:charset=UTF-8"})
    url = window.URL.createObjectURL(file)
    let a = document.createElement("a")
    a.style = "display: none"
    a.href = url
    a.download = file.name
    a.click()
    window.URL.revokeObjectURL(url)
}


// Loading
loadMusicButton.onclick = e => {
    musicAudio.src = musicFileSourceInput.value
    musicIsStarting = false
    resetResultLyricsContent()
    scrollLyricsSource()
}


// Getting lyrics source text
lyricsSource.onchange = e => {
    lyrics = lyricsSource.value.split("\n")
}


// Playing
musicAudio.onplay = e => {
    if(!musicIsStarting) {
        musicIsStarting = true
    }
    if(musicIsPausing) {
        musicIsPausing = false
    }
}


// Pausing
musicAudio.onpause = e => {
    musicIsPausing = true
}


// Recording
timeRecoderButton.onclick = e => {
    time = getAudioCurrentTime()
    if(!musicIsStarting || musicIsPausing) return // do not registering when not starting or pausing
    if(lyricsLine >= lyrics.length) lyricsLine = 0 // avoid segfault (undefined) on lyrics text source change
    resultLyricsContent.innerHTML += "<p>[" + toTimeString(time) + "] " + lyrics[lyricsLine++] + "</p>"
    scrollLyricsSource()
    scrollResultLyricsContent()
}


// Seeking
musicAudio.onseeking = e => {
    time = musicAudio.currentTime * 1000
    if (lyricsLine == 0) return
    let currentResultLyricsLine = document.querySelectorAll(".result .lyrics .content p")[lyricsLine-1]
    let lastRecordedLyricsTimeString = currentResultLyricsLine.innerText.substring(1,currentResultLyricsLine.innerText.indexOf("]"))
    while(time < toMillisecond(lastRecordedLyricsTimeString) && lyricsLine > 0) {
        currentResultLyricsLine.parentNode.removeChild(currentResultLyricsLine)
        lyricsLine--
        if (lyricsLine == 0) break
        currentResultLyricsLine = document.querySelectorAll(".result .lyrics .content p")[lyricsLine-1]
        lastRecordedLyricsTimeString = currentResultLyricsLine.innerText.substring(1,currentResultLyricsLine.innerText.indexOf("]"))
    }
    scrollLyricsSource()
}


// Copying result lyrics
resultLyricsCopyButton.onclick = e => {
    let lyricsTextResult = resultLyricsContent.innerText.replace(/\n\n/g,"\n")
    navigator.clipboard.writeText(lyricsTextResult) 
    resultLyricsCopyButton.innerText = "Copied"
    resultLyricsCopyButton.style = "background: gray;" 
    setTimeout(() => {
        resultLyricsCopyButton.innerText = "Copy"
        resultLyricsCopyButton.style = ""
    },3000)
}


// Donwloading result lyrics
resultLyricsDownloadButton.onclick = e => {
    resultLyricsDownloadButton.innerText = "Donwloading..."
    resultLyricsDownloadButton.style = "background: rgb(21, 47, 12);" 
    downloadResultLyrics()
    resultLyricsDownloadButton.innerText = "Donwloaded"
    setTimeout(() => {
        resultLyricsDownloadButton.innerText = "Download"
        resultLyricsDownloadButton.style = ""
    },3000)
}
